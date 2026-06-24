function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function checkDistance(x1, y1, x2, y2, range) {
    return distance(x1, y1, x2, y2) <= range;
}

function handlePlayerEnemyCollisions(player, enemies) {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const dist = distance(player.x + player.width / 2, player.y + player.height / 2,
                              enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);

        if (dist < player.attackRange) {
            if (player.canAttack()) {
                enemy.takeDamage(player.attackDamage);
                player.attack();
            }
        }

        if (dist < enemy.attackRange) {
            if (enemy.canAttack()) {
                player.takeDamage(enemy.attackDamage);
                enemy.attack();
            }
        }
    }
}

function handlePlayerItemCollisions(player, items) {
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        if (checkCollision(player, item)) {
            if (item.type === 'armor') {
                player.equipArmor(item.stats);
            } else if (item.type === 'weapon') {
                player.equipWeapon(item.stats);
            }
            items.splice(i, 1);
        }
    }
}

function cleanupDeadEntities(entities) {
    return entities.filter(entity => entity.isAlive);
}
