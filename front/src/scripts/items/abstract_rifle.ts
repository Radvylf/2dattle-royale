import { Display, CROUCHING_SCALE } from "../display";
import { HoldingStyle } from "../item";
import { FpPlayer } from "../player";
import { Projectile } from "../projectile";
import { GunStats, AbstractGun } from "./abstract_gun";

export interface RifleStats extends GunStats {
    front_hand_dist: number;
    proj_dist: number; // specified from center of hand
}

export abstract class AbstractRifle extends AbstractGun {
    holding_style = HoldingStyle.RIFLE;
    
    abstract stats: RifleStats;

    abstract draw(display: Display, x: number, y: number, pointing_dir: number, shoot_anim_start: number): void;

    use(player: FpPlayer): boolean {
        if (!super.use(player)) {
            return false;
        }

        const cos = Math.cos(player.facing_dir);
        const sin = Math.sin(player.facing_dir);

        const proj_dist = 0.6125 * (player.crouching ? CROUCHING_SCALE : 1) + player.fist_offset() + this.stats.proj_dist;

        const norm = Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
        const dir = player.facing_dir + norm * Math.PI * this.stats.dir_stdd / 4;

        this.tick_loop.projectiles.push(new Projectile(
            this.tick_loop,
            player.x + cos * proj_dist,
            player.y + sin * proj_dist,
            Math.cos(dir) * this.stats.bullet_speed,
            Math.sin(dir) * this.stats.bullet_speed,
            this.stats.bullet_size,
            this.stats.max_dist,
            this.stats.damage
        ));

        return true;
    }
}