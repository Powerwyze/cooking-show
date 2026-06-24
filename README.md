# 🍳 The Cooking Show - Competitive Cooking Game

A real-time multiplayer web-based cooking competition game where players collect ingredients and cook dishes to compete against other players and CPU opponents.

## Features

- **Real-Time Multiplayer**: Play against other players in the same room with Socket.IO
- **CPU AI Players**: Add computer-controlled opponents with intelligent turn logic
- **Recipe System**: 6 different recipes with varying difficulty levels
- **Ingredient Tray**: Shared ingredient pool that players compete to gather from
- **Judge Scoring**: Recipes are scored based on difficulty and judge preferences
- **Cooking Mechanics**: Pick ingredients, attempt recipes, submit dishes for scoring
- **Room System**: Create or join game rooms to play with others
- **Turn-Based Rounds**: 3 rounds of cooking competition
- **Score Tracking**: Real-time score updates across all players

## Game Recipes

1. **Pasta Carbonara** (Difficulty: ⭐⭐)
   - Ingredients: Eggs, Pasta, Bacon, Cheese

2. **Stir Fry** (Difficulty: ⭐)
   - Ingredients: Vegetables, Protein, Soy Sauce, Oil

3. **Risotto** (Difficulty: ⭐⭐⭐)
   - Ingredients: Rice, Broth, Butter, Cheese

4. **Salmon with Lemon** (Difficulty: ⭐⭐)
   - Ingredients: Fish, Lemon, Butter, Herbs

5. **Chocolate Mousse** (Difficulty: ⭐⭐⭐)
   - Ingredients: Chocolate, Eggs, Cream, Sugar

6. **Beef Tacos** (Difficulty: ⭐)
   - Ingredients: Beef, Tortillas, Toppings, Spices

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

```bash
npm install
```

### Running the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

### Accessing the Game

**Option 1: Single-Player Mode (Quick Test)**
```
http://localhost:3000/game.html
```
Simple single-player mode without multiplayer - great for testing game mechanics.

**Option 2: Multiplayer Mode**
```
http://localhost:3000/multiplayer.html
```
Full multiplayer mode with room creation, player management, and CPU opponents.

## How to Play

### Starting a Game

1. Enter your player name
2. Create a new room or join an existing one with a room ID
3. Add CPU players if desired (up to 4 total players)
4. Click "Start Game" to begin

### During Gameplay

1. **Pick Ingredients**: Click ingredient buttons on the tray to add them to your inventory
2. **Choose a Recipe**: Select a recipe from the cookbook that you have all ingredients for
3. **Cook**: Click "Cook" to start preparing that recipe
4. **Submit**: Click "Submit Dish" to complete your dish and earn points

### Scoring

- Each recipe has a base score based on difficulty
- Judges give bonus/penalty points based on their preferences
- Higher difficulty recipes score more points but are riskier
- Successfully cooking gives you points; failing gives you nothing

## Game Files

- `server.js` - Express/Socket.IO backend server
- `public/game.html` - Single-player game mode
- `public/multiplayer.html` - Full multiplayer mode with room system
- `public/test.html` - Simple test page to verify server is working

## Development

To run the server with auto-reload on file changes:

```bash
npm run dev
```

This uses nodemon to watch for file changes.

## Architecture

### Backend (Node.js/Express)
- Express server serves static files
- Socket.IO manages real-time multiplayer connections
- Game state management per room
- CPU player AI with random decision making

### Frontend (Vanilla JavaScript)
- Clean HTML/CSS interface
- Socket.IO client for real-time updates
- Real-time UI updates as game state changes

## Future Enhancements

- Judge preferences affecting scoring
- More recipes and ingredients
- Timed cooking rounds
- Player leveling system
- Leaderboards
- Sound effects and animations
- Mobile responsiveness improvements
- Cooking skill progression

## License

MIT
