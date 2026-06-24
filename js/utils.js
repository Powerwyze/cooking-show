function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function drawHealthBar(ctx, x, y, width, height, currentHealth, maxHealth, color = '#ff3333') {
    const healthPercent = Math.max(0, currentHealth / maxHealth);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width * healthPercent, height);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
}

function drawRect(ctx, x, y, width, height, color, filled = true) {
    ctx.fillStyle = color;
    if (filled) {
        ctx.fillRect(x, y, width, height);
    } else {
        ctx.strokeStyle = color;
        ctx.strokeRect(x, y, width, height);
    }
}

function drawCircle(ctx, x, y, radius, color, filled = true) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    if (filled) {
        ctx.fill();
    } else {
        ctx.strokeStyle = color;
        ctx.stroke();
    }
}
