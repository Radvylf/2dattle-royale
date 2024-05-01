import { Dims } from "./display";
import { Item } from "./inventory";
import { Collision } from "./hitbox";
import { TickLoop } from "./tick";
import { Controls } from "./controls";

export const SPD = 10;
export const DSPD = 10;

export class Player {
    x: number;
    y: number;
    dx: number;
    dy: number;
    facing_dir: number;

    holding_item: Item | null;
    active_hand: number;
    use_anim_start: number | null;

    constructor(x: number, y: number, facing_dir: number) {
        this.x = x;
        this.y = y;
        this.dx = 0;
        this.dy = 0;
        this.facing_dir = facing_dir;

        this.holding_item = null; // todo
        this.active_hand = 0; // todo
        this.use_anim_start = null;
    }
}

export class FpPlayer extends Player {
    id: number;

    dims: Dims;
    tick_loop: TickLoop;
    controls: Controls;

    constructor(dims: Dims, tick_loop: TickLoop, controls: Controls, id: number, x: number, y: number) {
        super(x, y, controls.mouse_offset ? Math.atan2(controls.mouse_offset[1] - dims.y, controls.mouse_offset[0] - dims.x) : 0);

        this.id = id;

        this.dims = dims;
        this.tick_loop = tick_loop;
        this.controls = controls;

        dims.on("resize", this.mouse_offset_update.bind(this));
        controls.on("mouse_offset_update", this.mouse_offset_update.bind(this));

        controls.on("bind_down", (bind) => {
            if (bind == "use") {
                this.use();
            }
        });

        window.setInterval(this.send_position_update.bind(this), 100);
    }

    mouse_offset_update() {
        this.facing_dir = this.controls.mouse_offset ? Math.atan2(this.controls.mouse_offset[1] - this.dims.y / 2, this.controls.mouse_offset[0] - this.dims.x / 2) : 0;
    }

    tick(tick_diff_ms: number) {
        let mov_x = 0;
        let mov_y = 0;

        if (this.controls.is_bind_down("up")) mov_y--;
        if (this.controls.is_bind_down("down")) mov_y++;
        if (this.controls.is_bind_down("left")) mov_x--;
        if (this.controls.is_bind_down("right")) mov_x++;

        if (mov_x != 0 && mov_y != 0) {
            mov_x /= Math.SQRT2;
            mov_y /= Math.SQRT2;
        }

        const dd_dir = Math.atan2(mov_y - this.dy, mov_x - this.dx);
        const dd_dist = Math.hypot(mov_x - this.dx, mov_y - this.dy);

        this.dx += Math.cos(dd_dir) * Math.min(dd_dist, tick_diff_ms / 1000 * DSPD);
        this.dy += Math.sin(dd_dir) * Math.min(dd_dist, tick_diff_ms / 1000 * DSPD);

        const tick_mov_x = this.dx * tick_diff_ms / 1000 * SPD;
        const tick_mov_y = this.dy * tick_diff_ms / 1000 * SPD;

        if (tick_mov_x != 0 || tick_mov_y != 0) {
            const collision_possible = this.tick_loop.objects.collision_possible(this.x, this.y, 1 / 2, tick_mov_x, tick_mov_y);

            const tick_mov_dir = Math.atan2(tick_mov_y, tick_mov_x);
            const tick_mov_dist = Math.hypot(tick_mov_x, tick_mov_y);
            let min_collision: Collision = {
                dist: tick_mov_dist,
                dfc_dir: 0,
                dfc_dist_multiplier: 0
            };
            let min_collision_object = null;

            for (const object of Array.from(collision_possible)) {
                const collision = object.player_collision(this, tick_mov_x, tick_mov_y);

                if (collision.dist < min_collision.dist) {
                    min_collision = collision;
                    min_collision_object = object;
                }
            }

            if (min_collision.dist == tick_mov_dist) {
                this.x += tick_mov_x;
                this.y += tick_mov_y;
            } else {
                const first_mov_player = new Player(this.x + Math.cos(tick_mov_dir) * min_collision.dist, this.y + Math.sin(tick_mov_dir) * min_collision.dist, 0);

                let dfc_dist = (tick_mov_dist - min_collision.dist) * min_collision.dfc_dist_multiplier;

                const collision_possible = this.tick_loop.objects.collision_possible(first_mov_player.x, first_mov_player.y, 1 / 2, Math.cos(min_collision.dfc_dir) * dfc_dist, Math.sin(min_collision.dfc_dir) * dfc_dist);

                for (const object of Array.from(collision_possible)) {
                    if (object == min_collision_object) continue;

                    const collision = object.player_collision(first_mov_player, Math.cos(min_collision.dfc_dir), Math.sin(min_collision.dfc_dir));

                    if (collision.dist < dfc_dist) {
                        dfc_dist = Math.max(collision.dist - 10 ** -10);
                    }
                }

                this.x += Math.cos(tick_mov_dir) * min_collision.dist + Math.cos(min_collision.dfc_dir) * dfc_dist;
                this.y += Math.sin(tick_mov_dir) * min_collision.dist + Math.sin(min_collision.dfc_dir) * dfc_dist;
            }
        }
    }

    use() {
        if (this.holding_item == null) {
            this.punch();
        } else {
            this.holding_item.use(this);
        }
    }

    punch() {
        this.active_hand = 1 - this.active_hand;
        this.use_anim_start = Date.now();

        // todo: damage
    }

    send_position_update() {
        const buffer = new ArrayBuffer(22);
        const dv = new DataView(buffer);

        dv.setUint8(0, 0x00);
        dv.setFloat32(2, this.x);
        dv.setFloat32(10, this.y);
        dv.setFloat32(18, this.facing_dir);

        this.tick_loop.ws.update("pos", buffer);
    }
}