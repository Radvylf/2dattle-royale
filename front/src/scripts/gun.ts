import { Display } from "./display";
import { HoldingStyle, Item } from "./inventory";
import { Player, FpPlayer } from "./player";
import { TickLoop } from "./tick";

export interface Gun {
    holding_style: HoldingStyle;

    damage: number;

    mag_size: number;
    rld_time: number;

    cooldown: number;
    burst: number;

    bullet_size: number;
    bullet_speed: number;
    bullet_spread: number;
}

export class GunItem implements Item {
    tick_loop: TickLoop;

    gun: Gun;
    holding_style: HoldingStyle;

    constructor(tick_loop: TickLoop, gun: Gun) {
        this.tick_loop = tick_loop;

        this.gun = gun;
        this.holding_style = gun.holding_style;
    }

    draw(display: Display, player: Player, fist_offset: number): void {}

    use(player: FpPlayer): void {
        if (Date.now() < player.cooldown || player.burst_count >= this.gun.burst) {
            return;
        }

        player.use_anim_start = Date.now();
        player.cooldown = Date.now() + this.gun.cooldown;
        player.burst_count++;

        const cos = Math.cos(player.facing_dir);
        const sin = Math.sin(player.facing_dir);

        const proj_dist = 0.615 + player.fist_offset(); // todo

        // todo
    }
}