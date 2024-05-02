import { Display } from "../display";
import { HoldingStyle, Item } from "../item";
import { Player, FpPlayer, SPD } from "../player";
import { Projectile } from "../projectile";
import { TickLoop } from "../tick";

export interface GunStats {
    damage: number;

    mag_size: number;
    rld_time: number;

    cooldown: number;
    burst: number;

    bullet_size: number;
    bullet_speed: number;
    bullet_spread: number;
}

export abstract class AbstractGun implements Item {
    tick_loop: TickLoop;

    abstract holding_style: HoldingStyle;
    abstract stats: GunStats;

    constructor(tick_loop: TickLoop) {
        this.tick_loop = tick_loop;
    }

    abstract draw(display: Display, x: number, y: number, pointing_dir: number, shoot_anim_start: number): void;

    use(player: FpPlayer): void {
        if (Date.now() < player.cooldown) {
            return;
        }

        player.use_anim_start = Date.now();
        player.cooldown = Date.now() + this.stats.cooldown;
        player.burst_count++;
    }
}