class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.health = 100;
        this.maxHealth = 100;
        this.attackDamage = 8;
        this.defense = 0;
        this.speed = 3;
        this.attackCooldown = 0;
        this.attackRange = 60;
        this.attackDelay = 600;
        this.velocity = { x: 0, y: 0 };
        this.isAlive = true;
    }

    update(keys, canvasWidth, canvasHeight) {
        this.velocity.x = 0;
        this.velocity.y = 0;

        if (keys['ArrowLeft'] || keys['a']) this.velocity.x = -this.speed;
        if (keys['ArrowRight'] || keys['d']) this.velocity.x = this.speed;
        if (keys['ArrowUp'] || keys['w']) this.velocity.y = -this.speed;
        if (keys['ArrowDown'] || keys['s']) this.velocity.y = this.speed;

        this.x += this.velocity.x;
        this.y += this.velocity.y;

        this.x = clamp(this.x, 0, canvasWidth - this.width);
        this.y = clamp(this.y, 0, canvasHeight - this.height);

        if (this.attackCooldown > 0) {
            this.attackCooldown -= 1000 / 60;
        }

        if (this.health <= 0) {
            this.isAlive = false;
        }
    }

    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - this.defense);
        this.health -= actualDamage;
    }

    equipArmor(stats) {
        this.maxHealth += stats.health;
        this.health = Math.min(this.health + stats.health, this.maxHealth);
        this.defense += stats.defense;
    }

    equipWeapon(stats) {
        this.attackDamage += stats.attackDamage;
    }

    canAttack() {
        return this.attackCooldown <= 0;
    }

    attack() {
        this.attackCooldown = this.attackDelay;
    }

    draw(ctx) {
        ctx.fillStyle = '#4444ff';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = '#ccccff';
        ctx.fillRect(this.x + 8, this.y + 8, 16, 16);

        drawHealthBar(ctx, this.x, this.y - 10, this.width, 6, this.health, this.maxHealth, '#33ff33');
    }
}

class Enemy {
    constructor(x, y, stats) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 24;
        this.health = stats.health;
        this.maxHealth = stats.health;
        this.attackDamage = stats.attackDamage;
        this.defense = stats.defense;
        this.speed = stats.speed;
        this.attackCooldown = 0;
        this.attackRange = 50;
        this.attackDelay = 1000;
        this.isAlive = true;
        this.color = '#ff4444';
        this.tier = 'bronze';
    }

    update(playerX, playerY) {
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 5) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }

        if (this.attackCooldown > 0) {
            this.attackCooldown -= 1000 / 60;
        }

        if (this.health <= 0) {
            this.isAlive = false;
        }
    }

    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - this.defense);
        this.health -= actualDamage;
    }

    canAttack() {
        return this.attackCooldown <= 0;
    }

    attack() {
        this.attackCooldown = this.attackDelay;
    }

    setTier(tier) {
        this.tier = tier;
        if (tier === 'bronze') this.color = '#8B4513';
        else if (tier === 'silver') this.color = '#a9a9a9';
        else if (tier === 'gold') this.color = '#FFD700';
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 6, this.y + 6, 12, 12);

        drawHealthBar(ctx, this.x, this.y - 10, this.width, 6, this.health, this.maxHealth, '#ff3333');
    }
}

class Item {
    constructor(x, y, type, tier) {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 16;
        this.type = type;
        this.tier = tier;
        this.stats = getItemStats(tier, type);
        this.timeLeft = 10000;
        this.isAlive = true;
        this.bobOffset = 0;
        this.bobSpeed = 0.1;
        this.glowIntensity = 0.5;
    }

    update(deltaTime) {
        this.timeLeft -= deltaTime;
        this.bobOffset += this.bobSpeed;
        this.glowIntensity = 0.5 + Math.sin(this.bobOffset) * 0.3;

        if (this.timeLeft <= 0) {
            this.isAlive = false;
        }
    }

    draw(ctx) {
        const offsetY = Math.sin(this.bobOffset) * 5;

        ctx.globalAlpha = this.timeLeft / 10000;

        if (this.type === 'armor') {
            ctx.fillStyle = this.stats.color;
            ctx.fillRect(this.x + 2, this.y + 2 + offsetY, 12, 12);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x + 2, this.y + 2 + offsetY, 12, 12);
        } else {
            ctx.fillStyle = this.stats.color;
            ctx.fillRect(this.x + 4, this.y + 2 + offsetY, 8, 12);
            ctx.fillRect(this.x + 2, this.y + 8 + offsetY, 12, 2);
        }

        ctx.globalAlpha = 1;
    }
}
