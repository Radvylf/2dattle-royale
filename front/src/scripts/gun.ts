import { Display } from "./display";
import { HoldingStyle, Item } from "./inventory";
import { Player, FpPlayer, SPD } from "./player";
import { Projectile } from "./projectile";
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

    proj_dist: number;
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
        if (Date.now() < player.cooldown) {
            return;
        }

        player.use_anim_start = Date.now();
        player.cooldown = Date.now() + this.gun.cooldown;
        player.burst_count++;

        const cos = Math.cos(player.facing_dir);
        const sin = Math.sin(player.facing_dir);

        const proj_dist = this.gun.proj_dist + player.fist_offset(); // todo

        const norm = Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
        const dir = player.facing_dir + norm * Math.PI * this.gun.bullet_spread / 4;

        this.tick_loop.projectiles.push(new Projectile(player.x + cos * proj_dist, player.y + sin * proj_dist, /*player.dx * SPD +*/ Math.cos(dir) * this.gun.bullet_speed, /*player.dy * SPD +*/ Math.sin(dir) * this.gun.bullet_speed, this.gun.bullet_size, this.gun.damage));
    }
}