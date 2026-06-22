const { useState, useEffect } = React;

const RECIPES = {
  carbonara: { name: 'Pasta Carbonara', ingredients: ['Eggs', 'Pasta', 'Bacon', 'Cheese'], difficulty: 2 },
  stirfry: { name: 'Stir Fry', ingredients: ['Vegetables', 'Protein', 'Soy Sauce', 'Oil'], difficulty: 1 },
  risotto: { name: 'Risotto', ingredients: ['Rice', 'Broth', 'Butter', 'Cheese'], difficulty: 3 },
  salmon: { name: 'Salmon with Lemon', ingredients: ['Fish', 'Lemon', 'Butter', 'Herbs'], difficulty: 2 },
  mousse: { name: 'Chocolate Mousse', ingredients: ['Chocolate', 'Eggs', 'Cream', 'Sugar'], difficulty: 3 },
  tacos: { name: 'Beef Tacos', ingredients: ['Beef', 'Tortillas', 'Toppings', 'Spices'], difficulty: 1 }
};

const ALL_INGREDIENTS = ['Eggs', 'Pasta', 'Bacon', 'Cheese', 'Vegetables', 'Protein', 'Soy Sauce', 'Oil', 'Rice', 'Broth', 'Butter', 'Fish', 'Lemon', 'Herbs', 'Chocolate', 'Cream', 'Sugar', 'Beef', 'Tortillas', 'Toppings', 'Spices'];

const GameApp = () => {
  const [screen, setScreen] = useState('menu');
  const [playerName, setPlayerName] = useState('');

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🍳 The Cooking Show</h1>
      <p>Competitive Cooking Game</p>
      {screen === 'menu' ? (
        <div style={{ marginTop: '30px' }}>
          <input
            type="text"
            placeholder="Your Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            style={{ padding: '10px', fontSize: '16px' }}
          />
          <button
            onClick={() => setScreen('game')}
            style={{ padding: '10px 20px', marginLeft: '10px', fontSize: '16px', cursor: 'pointer' }}
          >
            Start Game
          </button>
        </div>
      ) : (
        <div style={{ marginTop: '30px' }}>
          <h2>Game Screen - Welcome {playerName}!</h2>
          <p>Game UI coming soon...</p>
          <button
            onClick={() => setScreen('menu')}
            style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
};

setTimeout(() => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(React.createElement(GameApp));
}, 100);
