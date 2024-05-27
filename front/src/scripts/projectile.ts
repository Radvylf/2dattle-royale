import { BULLET_TRAIL_DURATION } from "./display";
import { TickLoop } from "./tick";

export class Projectile {
    tick_loop: TickLoop;

    x: number;
    y: number;
    dx: number;
    dy: number;
    size: number;

    shot_time: number;
    collision_time: number | null;
    start_x: number;
    start_y: number;
    max_dist: number;

    damage: number;

    constructor(tick_loop: TickLoop, x: number, y: number, dx: number, dy: number, size: number, max_dist: number, damage: number) {
        this.tick_loop = tick_loop;
        
        // todo: check if bullet is inside object

        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.size = size;

        this.shot_time = Date.now();
        this.collision_time = null;
        this.start_x = x;
        this.start_y = y;
        this.max_dist = max_dist;

        this.damage = damage;
    }

    tick(tick_diff_ms: number) {
        if (this.collision_time == null) {
            const tick_dx = Math.min(this.dx * tick_diff_ms / 1000, this.max_dist); // this.max_dist is only to prevent loading thousands of collision grid cells if unfocused for a long time
            const tick_dy = Math.min(this.dy * tick_diff_ms / 1000, this.max_dist);

            const collision_possible = this.tick_loop.objects.collision_possible(this.x, this.y, 1 / 2, tick_dx, tick_dy);

            const tick_dist = Math.hypot(tick_dx, tick_dy);

            let min_collision_dist = tick_dist;
            let min_collision_object = null;

            for (const object of Array.from(collision_possible)) {
                const collision_dist = object.projectile_collision(this, tick_diff_ms / 1000);

                if (collision_dist < min_collision_dist) {
                    min_collision_dist = collision_dist;
                    min_collision_object = object;
                }
            }

            const now = Date.now();

            const total_dist = Math.hypot(this.dx, this.dy) * (now - this.shot_time) / 1000;

            if (total_dist + min_collision_dist >= this.max_dist) {
                min_collision_dist = this.max_dist - total_dist;
                min_collision_object = null;

                this.collision_time = now + (min_collision_dist / Math.hypot(this.dx, this.dy)) * 1000;
            }

            this.x += tick_dx * (min_collision_dist / tick_dist);
            this.y += tick_dy * (min_collision_dist / tick_dist);

            if (min_collision_object != null) {
                this.collision_time = Date.now();
            }

            return true;
        } else {
            return (Date.now() - this.collision_time < BULLET_TRAIL_DURATION * 1000);
        }
    }
}