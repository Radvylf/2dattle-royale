import { Dims } from "./display";
import * as display from "./display";
import { HoldingStyle, Item } from "./item";
import { Collision } from "./hitbox";
import { TickLoop } from "./tick";
import { Controls } from "./controls";
import { AbstractGun } from "./items/abstract_gun";

export const SPD = 10;
export const DSPD = 10;

export const FIST_COOLDOWN = 100;

export abstract class Player {
    x: number;
    y: number;
    dx: number;
    dy: number;
    facing_dir: number;

    hp: number;

    crouching: boolean;

    active_hand: number;
    use_anim_start: number | null;

    constructor(x: number, y: number, facing_dir: number) {
        this.x = x;
        this.y = y;
        this.dx = 0;
        this.dy = 0;
        this.facing_dir = facing_dir;

        this.hp = 100; // todo

        this.crouching = false;

        this.active_hand = 0; // todo
        this.use_anim_start = null;
    }

    abstract holding_item(): Item | null;

    fist_offset() {
        const holding_item = this.holding_item();

        if (holding_item == null) {
            return this.use_anim_start == null || Date.now() - this.use_anim_start >= display.PUNCH_TIME + display.PUNCH_PULLBACK_TIME ? 0 : (
                Date.now() - this.use_anim_start < display.PUNCH_TIME ? (Date.now() - this.use_anim_start) / display.PUNCH_TIME : 1 - (Date.now() - this.use_anim_start - display.PUNCH_TIME) / display.PUNCH_PULLBACK_TIME
            ) * display.PUNCH_DIST;
        } else if (holding_item.holding_style == HoldingStyle.PISTOL) {
            return this.use_anim_start == null || Date.now() - this.use_anim_start >= display.RECOIL_TIME + display.RECOIL_FORWARD_TIME ? 0 : (
                Date.now() - this.use_anim_start < display.RECOIL_TIME ? (Date.now() - this.use_anim_start) / display.RECOIL_TIME : 1 - (Date.now() - this.use_anim_start - display.RECOIL_TIME) / display.RECOIL_FORWARD_TIME
            ) * -display.RECOIL_DIST;
        } else if (holding_item.holding_style == HoldingStyle.RIFLE) {
            return this.use_anim_start == null || Date.now() - this.use_anim_start >= display.RECOIL_TIME + display.RECOIL_FORWARD_TIME ? 0 : (
                Date.now() - this.use_anim_start < display.RECOIL_TIME ? (Date.now() - this.use_anim_start) / display.RECOIL_TIME : 1 - (Date.now() - this.use_anim_start - display.RECOIL_TIME) / display.RECOIL_FORWARD_TIME
            ) * -display.RECOIL_DIST * 1.5;
        } else {
            return 0;
        }
    }
}

class MockPlayer extends Player {
    holding_item(): Item | null {
        return null;
    }
}

export class FpPlayer extends Player {
    id: number;

    inventory: Item[];
    holding_item_index: number | null;

    cooldown: number;
    burst_count: number;

    dims: Dims;
    tick_loop: TickLoop;
    controls: Controls;

    constructor(dims: Dims, tick_loop: TickLoop, controls: Controls, id: number, x: number, y: number) {
        super(x, y, controls.mouse_offset ? Math.atan2(controls.mouse_offset[1] - dims.y, controls.mouse_offset[0] - dims.x) : 0);

        this.id = id;

        this.inventory = [];
        this.holding_item_index = null;

        this.cooldown = 0;
        this.burst_count = 0;

        this.dims = dims;
        this.tick_loop = tick_loop;
        this.controls = controls;

        dims.on("resize", this.mouse_offset_update.bind(this));
        controls.on("mouse_offset_update", this.mouse_offset_update.bind(this));

        controls.on("bind_down", (bind) => {
            let swapped_item = false;

            switch (bind) {
                case "use":
                    this.use();

                    break;
                case "inv_left":
                    if (this.holding_item_index == null) {
                        swapped_item = (this.inventory.length != 0);

                        this.holding_item_index = this.inventory.length == 0 ? null : this.inventory.length - 1;
                    } else if (this.holding_item_index == 0) {
                        swapped_item = true;

                        this.holding_item_index = null;
                    } else {
                        swapped_item = true;

                        this.holding_item_index--;
                    }

                    break;
                case "inv_right":
                    if (this.holding_item_index == null) {
                        swapped_item = (this.inventory.length != 0);

                        this.holding_item_index = this.inventory.length == 0 ? null : 0;
                    } else if (this.holding_item_index == this.inventory.length - 1) {
                        swapped_item = true;

                        this.holding_item_index = null;
                    } else {
                        swapped_item = true;

                        this.holding_item_index++;
                    }

                    break;
                case "inv_left_skip_fist":
                    if (this.holding_item_index == null) {
                        swapped_item = (this.inventory.length != 0);

                        this.holding_item_index = this.inventory.length == 0 ? null : this.inventory.length - 1;
                    } else if (this.holding_item_index == 0) {
                        swapped_item = (this.inventory.length != 1);

                        this.holding_item_index = this.inventory.length - 1;
                    } else {
                        swapped_item = true;

                        this.holding_item_index--;
                    }

                    break;
                case "inv_right_skip_fist":
                    if (this.holding_item_index == null) {
                        swapped_item = (this.inventory.length != 0);

                        this.holding_item_index = this.inventory.length == 0 ? null : 0;
                    } else if (this.holding_item_index == this.inventory.length - 1) {
                        swapped_item = (this.inventory.length != 1);

                        this.holding_item_index = 0;
                    } else {
                        swapped_item = true;

                        this.holding_item_index++;
                    }

                    break;
                case "inv_fist":
                    swapped_item = (this.holding_item_index != null);

                    this.holding_item_index = null;

                    break;
            }

            if (swapped_item) {
                this.use_anim_start = null;

                this.cooldown = Date.now() + (this.holding_item_index == null ? FIST_COOLDOWN : this.inventory[this.holding_item_index].swap_cooldown());
            }
        });

        controls.on("bind_up", (bind) => {
            if (bind == "use") {
                this.burst_count = 0;
            }
        });

        controls.on("clear", () => {
            this.burst_count = 0;
        });

        window.setInterval(this.send_position_update.bind(this), 100);
    }

    holding_item(): Item | null {
        return this.holding_item_index == null ? this.holding_item_index : this.inventory[this.holding_item_index];
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

        const tick_mov_x = this.dx * tick_diff_ms / 1000 * SPD * (this.crouching ? 1 / 2 : 1);
        const tick_mov_y = this.dy * tick_diff_ms / 1000 * SPD * (this.crouching ? 1 / 2 : 1);

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
                const first_mov_player = new MockPlayer(this.x + Math.cos(tick_mov_dir) * min_collision.dist, this.y + Math.sin(tick_mov_dir) * min_collision.dist, 0);

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

        this.crouching = this.controls.is_bind_down("crouch");

        const holding_item = this.holding_item();

        if (this.controls.is_bind_down("use") && holding_item != null && holding_item instanceof AbstractGun && Date.now() >= this.cooldown && this.burst_count < holding_item.stats.burst) holding_item.use(this);
    }

    use() {
        const holding_item = this.holding_item();

        if (holding_item == null) {
            this.punch();
        } else {
            holding_item.use(this);
        }
    }

    punch() {
        if (Date.now() < this.cooldown) {
            return;
        }

        this.active_hand = 1 - this.active_hand;
        this.use_anim_start = Date.now();

        this.cooldown = Date.now() + FIST_COOLDOWN;
        this.burst_count++;

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