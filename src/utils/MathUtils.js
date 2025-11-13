export function checkCollision(obj1, obj2) {
    if (!obj1 || !obj2) return false;
    
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function normalizeAngle(angle) {
    while (angle < -Math.PI) angle += Math.PI * 2;
    while (angle > Math.PI) angle -= Math.PI * 2;
    return angle;
}

export function angleBetweenPoints(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

export function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

export function lerp(start, end, t) {
    return start + (end - start) * t;
}

export function random(min, max) {
    return Math.random() * (max - min) + min;
}

export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Calculates firing angle to intercept a moving target.
 * Solves quadratic equation for interception time.
 * Returns null if no valid solution exists.
 */
export function calculatePredictiveAngle(shooter, target, projectileSpeed) {
    const dx = target.x + target.width / 2 - shooter.x;
    const dy = target.y + target.height / 2 - shooter.y;
    const vx = target.velocity.x;
    const vy = target.velocity.y;

    const a = vx * vx + vy * vy - projectileSpeed * projectileSpeed;
    const b = 2 * (dx * vx + dy * vy);
    const c = dx * dx + dy * dy;

    const discriminant = b * b - 4 * a * c;

    if (discriminant < 0 || a === 0) {
        return null;
    }

    const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);

    let t = -1;
    if (t1 > 0.01 && t2 > 0.01) {
        t = Math.min(t1, t2);
    } else if (t1 > 0.01) {
        t = t1;
    } else if (t2 > 0.01) {
        t = t2;
    }

    if (t > 0) {
        const predictedX = target.x + target.width / 2 + vx * t;
        const predictedY = target.y + target.height / 2 + vy * t;
        return Math.atan2(predictedY - shooter.y, predictedX - shooter.x);
    }

    return null;
}
