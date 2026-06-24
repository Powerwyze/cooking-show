const LEVELS = {
    1: {
        name: 'Grassland',
        theme: 'grassland',
        bgColor: '#2d5016',
        duration: 60,
        waves: [
            {
                timeStart: 0,
                timeEnd: 20,
                enemyStats: { health: 20, attackDamage: 5, defense: 1.5, speed: 1.2 },
                spawnInterval: 2000,
                lootTier: 'bronze'
            },
            {
                timeStart: 20,
                timeEnd: 60,
                enemyStats: { health: 30, attackDamage: 7, defense: 2, speed: 1.5 },
                spawnInterval: 1500,
                lootTier: 'bronze'
            }
        ]
    },
    2: {
        name: 'Forest',
        theme: 'forest',
        bgColor: '#1a3a1a',
        duration: 60,
        waves: [
            {
                timeStart: 0,
                timeEnd: 20,
                enemyStats: { health: 40, attackDamage: 10, defense: 3, speed: 1.5 },
                spawnInterval: 1500,
                lootTier: 'silver'
            },
            {
                timeStart: 20,
                timeEnd: 60,
                enemyStats: { health: 60, attackDamage: 13, defense: 4, speed: 1.8 },
                spawnInterval: 1000,
                lootTier: 'silver'
            }
        ]
    },
    3: {
        name: 'Castle',
        theme: 'castle',
        bgColor: '#2a2a3a',
        duration: 60,
        waves: [
            {
                timeStart: 0,
                timeEnd: 20,
                enemyStats: { health: 80, attackDamage: 15, defense: 5, speed: 1.8 },
                spawnInterval: 1000,
                lootTier: 'gold'
            },
            {
                timeStart: 20,
                timeEnd: 60,
                enemyStats: { health: 100, attackDamage: 18, defense: 6, speed: 2 },
                spawnInterval: 750,
                lootTier: 'gold'
            }
        ]
    }
};

const ITEMS = {
    bronze: {
        armor: { health: 25, defense: 2, color: '#8B4513' },
        weapon: { attackDamage: 5, color: '#CD7F32' }
    },
    silver: {
        armor: { health: 50, defense: 4, color: '#c0c0c0' },
        weapon: { attackDamage: 10, color: '#a9a9a9' }
    },
    gold: {
        armor: { health: 75, defense: 6, color: '#FFD700' },
        weapon: { attackDamage: 15, color: '#FFA500' }
    }
};

function getLevelConfig(round) {
    return LEVELS[round] || LEVELS[1];
}

function getItemStats(tier, type) {
    return ITEMS[tier] ? ITEMS[tier][type] : ITEMS.bronze[type];
}

function getCurrentWave(round, timeElapsed) {
    const level = getLevelConfig(round);
    for (let wave of level.waves) {
        if (timeElapsed >= wave.timeStart && timeElapsed < wave.timeEnd) {
            return wave;
        }
    }
    return level.waves[level.waves.length - 1];
}
