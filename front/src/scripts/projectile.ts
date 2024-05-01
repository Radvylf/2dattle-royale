export class Projectile {
    x: number;
    y: number;
    dx: number;
    dy: number;
    size: number;

    trail_time: number;

    damage: number;

    constructor(x: number, y: number, dx: number, dy: number, size: number, damage: number) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.size = size;

        this.trail_time = Date.now();

        this.damage = damage;
    }

    tick(tick_diff_ms: number) {
        this.x += this.dx * tick_diff_ms / 1000;
        this.y += this.dy * tick_diff_ms / 1000;
    }
}