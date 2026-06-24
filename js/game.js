const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const FPS = 60;
const FRAME_TIME = 1000 / FPS;

let gameState = {
    round: 1,
    state: 'playing',
    roundStartTime: 0,
    score: 0,
    levelConfig: getLevelConfig(1)
};

let player = new Player(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 80);
let enemies = [];
let items = [];
let keys = {};
let lastSpawnTime = 0;
let lastFrameTime = performance.now();

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function getCurrentWaveForTime(timeElapsed) {
    const level = gameState.levelConfig;
    for (let wave of level.waves) {
        if (timeElapsed >= wave.timeStart && timeElapsed < wave.timeEnd) {
            return wave;
        }
    }
    return level.waves[level.waves.length - 1];
}

function spawnEnemy() {
    const side = Math.random() < 0.5 ? 'left' : 'right';
    const x = side === 'left' ? -30 : CANVAS_WIDTH + 30;
    const y = randomRange(80, CANVAS_HEIGHT - 60);

    const wave = getCurrentWaveForTime(gameState.roundTime);
    const enemy = new Enemy(x, y, wave.enemyStats);
    enemy.setTier(wave.lootTier);
    enemies.push(enemy);
}

function spawnItems(x, y, tier) {
    const roll = Math.random() * 100;
    if (roll < 60) {
        items.push(new Item(x, y, 'armor', tier));
    } else {
        items.push(new Item(x, y, 'weapon', tier));
    }
}

function updateGameState(deltaTime) {
    gameState.roundTime = (performance.now() - gameState.roundStartTime) / 1000;
    gameState.timeRemaining = Math.max(0, gameState.levelConfig.duration - gameState.roundTime);

    if (gameState.timeRemaining <= 0) {
        if (gameState.round < 3) {
            nextRound();
        } else {
            gameState.state = 'gameEnd';
        }
    }

    if (gameState.state === 'playing') {
        const wave = getCurrentWaveForTime(gameState.roundTime);
        const timeSinceLastSpawn = performance.now() - lastSpawnTime;

        if (timeSinceLastSpawn > wave.spawnInterval && enemies.length < 20) {
            spawnEnemy();
            lastSpawnTime = performance.now();
        }
    }
}

function updateEntities(deltaTime) {
    player.update(keys, CANVAS_WIDTH, CANVAS_HEIGHT);

    for (let enemy of enemies) {
        enemy.update(player.x + player.width / 2, player.y + player.height / 2);
    }

    for (let item of items) {
        item.update(deltaTime);
    }

    handlePlayerEnemyCollisions(player, enemies);
    handlePlayerItemCollisions(player, items);

    enemies = cleanupDeadEntities(enemies);
    items = cleanupDeadEntities(items);

    if (!player.isAlive) {
        gameState.state = 'gameOver';
    }
}

function nextRound() {
    gameState.round += 1;
    gameState.levelConfig = getLevelConfig(gameState.round);
    gameState.roundStartTime = performance.now();
    enemies = [];
    items = [];
    lastSpawnTime = performance.now();
}

function renderGame() {
    ctx.fillStyle = gameState.levelConfig.bgColor;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    player.draw(ctx);

    for (let enemy of enemies) {
        enemy.draw(ctx);
    }

    for (let item of items) {
        item.draw(ctx);
    }

    renderUI();

    if (gameState.state === 'gameOver') {
        renderGameOver();
    } else if (gameState.state === 'gameEnd') {
        renderGameEnd();
    }
}

function renderUI() {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';

    ctx.textAlign = 'left';
    ctx.fillText(`Round: ${gameState.round}`, 10, 30);
    ctx.fillText(`Time: ${Math.ceil(gameState.timeRemaining)}s`, 10, 50);
    ctx.fillText(`Enemies: ${enemies.length}`, 10, 70);

    ctx.textAlign = 'right';
    ctx.fillText(`HP: ${Math.max(0, Math.ceil(player.health))}/${player.maxHealth}`, CANVAS_WIDTH - 10, 30);
    ctx.fillText(`DMG: ${Math.ceil(player.attackDamage)}`, CANVAS_WIDTH - 10, 50);
    ctx.fillText(`DEF: ${player.defense.toFixed(1)}`, CANVAS_WIDTH - 10, 70);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 90);
}

function renderGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText(`Reached Round: ${gameState.round}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    ctx.fillText(`Final Stats:`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
    ctx.fillText(`Damage: ${Math.ceil(player.attackDamage)} | Defense: ${player.defense.toFixed(1)}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 90);
    ctx.fillText('Press R to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 140);
}

function renderGameEnd() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#44ff44';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('YOU SURVIVED!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText(`Final Stats:`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    ctx.fillText(`HP: ${Math.ceil(player.health)}/${player.maxHealth}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
    ctx.fillText(`Damage: ${Math.ceil(player.attackDamage)} | Defense: ${player.defense.toFixed(1)}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 90);
    ctx.fillText('Press R to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 140);
}

function resetGame() {
    gameState = {
        round: 1,
        state: 'playing',
        roundStartTime: performance.now(),
        score: 0,
        levelConfig: getLevelConfig(1)
    };
    player = new Player(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 80);
    enemies = [];
    items = [];
    lastSpawnTime = performance.now();
    keys = {};
}

function gameLoop(currentTime) {
    const deltaTime = currentTime - lastFrameTime;
    lastFrameTime = currentTime;

    if (keys['r'] || keys['R']) {
        resetGame();
        keys = {};
    }

    if (gameState.state === 'playing') {
        updateGameState(deltaTime);
        updateEntities(deltaTime);
    }

    renderGame();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('DOMContentLoaded', () => {
    gameState.roundStartTime = performance.now();
    lastSpawnTime = performance.now();
    requestAnimationFrame(gameLoop);
});
