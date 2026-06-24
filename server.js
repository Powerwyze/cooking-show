const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const Database = require('better-sqlite3');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*' },
  transports: ['websocket', 'polling']
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/* ── AUTH (SQLite) ── */
const db = new Database(path.join(__dirname, 'game.db'));
db.exec(`CREATE TABLE IF NOT EXISTS users (
  username_lower TEXT PRIMARY KEY,
  display_name   TEXT NOT NULL,
  password_hash  TEXT NOT NULL,
  created_at     TEXT NOT NULL
)`);

function hashPw(password, username) {
  return crypto.createHash('sha256').update(password + ':' + username.toLowerCase()).digest('hex');
}

app.post('/api/register', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.json({ ok: false, error: 'Username and password required' });
  if (username.length < 3 || username.length > 20) return res.json({ ok: false, error: 'Username must be 3–20 characters' });
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return res.json({ ok: false, error: 'Letters, numbers, and underscores only' });
  if (password.length < 4) return res.json({ ok: false, error: 'Password must be at least 4 characters' });
  const exists = db.prepare('SELECT 1 FROM users WHERE username_lower = ?').get(username.toLowerCase());
  if (exists) return res.json({ ok: false, error: 'Username already taken' });
  db.prepare('INSERT INTO users VALUES (?, ?, ?, ?)').run(
    username.toLowerCase(), username, hashPw(password, username), new Date().toISOString()
  );
  res.json({ ok: true, username });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.json({ ok: false, error: 'Username and password required' });
  const user = db.prepare('SELECT * FROM users WHERE username_lower = ?').get(username.toLowerCase());
  if (!user || user.password_hash !== hashPw(password, username)) return res.json({ ok: false, error: 'Invalid username or password' });
  res.json({ ok: true, username: user.display_name });
});

const RECIPES = {
  carbonara: { name: 'Pasta Carbonara', ingredients: ['Eggs', 'Pasta', 'Bacon', 'Cheese'], difficulty: 2, failChance: 0.2 },
  stirfry: { name: 'Stir Fry', ingredients: ['Vegetables', 'Protein', 'Soy Sauce', 'Oil'], difficulty: 1, failChance: 0.1 },
  risotto: { name: 'Risotto', ingredients: ['Rice', 'Broth', 'Butter', 'Cheese'], difficulty: 3, failChance: 0.4 },
  salmon: { name: 'Salmon with Lemon', ingredients: ['Fish', 'Lemon', 'Butter', 'Herbs'], difficulty: 2, failChance: 0.15 },
  mousse: { name: 'Chocolate Mousse', ingredients: ['Chocolate', 'Eggs', 'Cream', 'Sugar'], difficulty: 3, failChance: 0.35 },
  tacos: { name: 'Beef Tacos', ingredients: ['Beef', 'Tortillas', 'Toppings', 'Spices'], difficulty: 1, failChance: 0.1 }
};

const JUDGE_PREFERENCES = [
  { name: 'Gordon', likes: ['Carbonara', 'Salmon', 'Mousse'], dislikes: ['Tacos'] },
  { name: 'Martha', likes: ['Risotto', 'Mousse', 'Carbonara'], dislikes: ['Stir Fry'] },
  { name: 'Bobby', likes: ['Stir Fry', 'Tacos', 'Carbonara'], dislikes: ['Mousse'] }
];

const ALL_INGREDIENTS = ['Eggs', 'Pasta', 'Bacon', 'Cheese', 'Vegetables', 'Protein', 'Soy Sauce', 'Oil', 'Rice', 'Broth', 'Butter', 'Fish', 'Lemon', 'Herbs', 'Chocolate', 'Cream', 'Sugar', 'Beef', 'Tortillas', 'Toppings', 'Spices'];

class GameRoom {
  constructor(roomId, maxPlayers = 4) {
    this.roomId = roomId;
    this.players = {};
    this.maxPlayers = maxPlayers;
    this.gameActive = false;
    this.currentRound = 0;
    this.maxRounds = 3;
    this.tray = [];
    this.judges = JUDGE_PREFERENCES;
    this.turnTimer = null;
    this.turnDuration = 30000; // 30 seconds per turn
    this.roundTimer = null;
  }

  addPlayer(playerId, name, isCPU = false) {
    this.players[playerId] = {
      id: playerId,
      name,
      score: 0,
      isCPU,
      inventory: [],
      cooking: null,
      submitted: false
    };
  }

  removePlayer(playerId) {
    delete this.players[playerId];
  }

  startGame() {
    this.gameActive = true;
    this.currentRound = 1;
    this.startRound();
  }

  startRound() {
    this.tray = this.generateTray();
    Object.values(this.players).forEach(p => {
      p.inventory = [];
      p.cooking = null;
      p.submitted = false;
    });

    const cpuDelay = () => setTimeout(() => {
      const cpuPlayers = Object.values(this.players).filter(p => p.isCPU);
      cpuPlayers.forEach(cpu => this.cpuTakeTurn(cpu.id));
    }, 2000);

    cpuDelay();
  }

  generateTray() {
    const count = 8;
    const tray = [];
    for (let i = 0; i < count; i++) {
      tray.push(ALL_INGREDIENTS[Math.floor(Math.random() * ALL_INGREDIENTS.length)]);
    }
    return tray;
  }

  pickIngredient(playerId, ingredientIndex) {
    if (ingredientIndex < 0 || ingredientIndex >= this.tray.length) return false;
    const ingredient = this.tray[ingredientIndex];
    this.tray.splice(ingredientIndex, 1);
    this.players[playerId].inventory.push(ingredient);
    return true;
  }

  startCooking(playerId, recipeKey) {
    const player = this.players[playerId];
    const recipe = RECIPES[recipeKey];
    if (!recipe) return false;

    player.cooking = { recipeKey, recipe, progress: 0, failed: false };
    return true;
  }

  submitDish(playerId) {
    const player = this.players[playerId];
    if (!player.cooking) return { success: false, message: 'No dish being cooked' };

    const { recipe, recipeKey } = player.cooking;
    const hasAllIngredients = recipe.ingredients.every(ing => player.inventory.includes(ing));

    if (!hasAllIngredients) {
      return { success: false, message: 'Missing ingredients' };
    }

    const failed = Math.random() < recipe.failChance;
    if (failed) {
      player.cooking.failed = true;
      player.inventory = player.inventory.filter(ing => !recipe.ingredients.includes(ing));
      player.cooking = null;
      return { success: false, message: 'Cooking failed!', score: 0 };
    }

    const baseScore = (recipe.difficulty * 10);
    const judgeBonus = JUDGE_PREFERENCES.reduce((total, judge) => {
      const recipeName = recipe.name.split(' ')[0]; // Simple match
      return total + (judge.likes.some(l => l.toLowerCase().includes(recipeName.toLowerCase())) ? 10 : -5);
    }, 0);

    const score = Math.max(5, baseScore + judgeBonus);
    player.score += score;
    player.inventory = player.inventory.filter(ing => !recipe.ingredients.includes(ing));
    player.cooking = null;
    player.submitted = true;

    return { success: true, message: `Cooked ${recipe.name}!`, score };
  }

  cpuTakeTurn(playerId) {
    const player = this.players[playerId];
    if (!player) return;

    // CPU picks random ingredients
    for (let i = 0; i < 2 && this.tray.length > 0; i++) {
      const idx = Math.floor(Math.random() * this.tray.length);
      this.pickIngredient(playerId, idx);
    }

    // CPU tries to cook a random recipe
    const recipeKeys = Object.keys(RECIPES);
    const recipeKey = recipeKeys[Math.floor(Math.random() * recipeKeys.length)];
    this.startCooking(playerId, recipeKey);

    // CPU submits after a delay
    setTimeout(() => {
      this.submitDish(playerId);
    }, 1000);
  }

  endRound() {
    if (this.currentRound < this.maxRounds) {
      this.currentRound++;
      this.startRound();
    } else {
      this.endGame();
    }
  }

  endGame() {
    this.gameActive = false;
  }

  getState() {
    return {
      roomId: this.roomId,
      gameActive: this.gameActive,
      currentRound: this.currentRound,
      maxRounds: this.maxRounds,
      tray: this.tray,
      players: Object.values(this.players),
      judges: this.judges
    };
  }
}

const rooms = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('createRoom', (data) => {
    const roomId = 'room_' + Math.random().toString(36).substr(2, 9);
    rooms[roomId] = new GameRoom(roomId, data.maxPlayers || 4);
    rooms[roomId].addPlayer(socket.id, data.playerName || 'Player', false);
    socket.join(roomId);
    socket.emit('roomCreated', { roomId });
    io.to(roomId).emit('gameState', rooms[roomId].getState());
  });

  socket.on('joinRoom', (data) => {
    const room = rooms[data.roomId];
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    room.addPlayer(socket.id, data.playerName || 'Player', false);
    socket.join(data.roomId);
    io.to(data.roomId).emit('gameState', room.getState());
  });

  socket.on('addCPU', (data) => {
    const room = rooms[data.roomId];
    if (room) {
      const cpuName = 'CPU_' + Math.random().toString(36).substr(2, 5);
      room.addPlayer(cpuName, cpuName, true);
      io.to(data.roomId).emit('gameState', room.getState());
    }
  });

  socket.on('startGame', (data) => {
    const room = rooms[data.roomId];
    if (room) {
      room.startGame();
      io.to(data.roomId).emit('gameState', room.getState());
      io.to(data.roomId).emit('roundStarted', { round: room.currentRound });
    }
  });

  socket.on('pickIngredient', (data) => {
    const room = rooms[data.roomId];
    if (room) {
      room.pickIngredient(socket.id, data.ingredientIndex);
      io.to(data.roomId).emit('gameState', room.getState());
    }
  });

  socket.on('startCooking', (data) => {
    const room = rooms[data.roomId];
    if (room) {
      room.startCooking(socket.id, data.recipeKey);
      io.to(data.roomId).emit('gameState', room.getState());
    }
  });

  socket.on('submitDish', (data) => {
    const room = rooms[data.roomId];
    if (room) {
      const result = room.submitDish(socket.id);
      io.to(data.roomId).emit('gameState', room.getState());
      io.to(data.roomId).emit('dishSubmitted', {
        playerId: socket.id,
        ...result
      });
    }
  });

  socket.on('endRound', (data) => {
    const room = rooms[data.roomId];
    if (room) {
      room.endRound();
      io.to(data.roomId).emit('gameState', room.getState());
    }
  });

  socket.on('disconnect', () => {
    Object.values(rooms).forEach(room => {
      room.removePlayer(socket.id);
    });
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
