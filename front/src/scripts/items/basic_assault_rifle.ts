import { Display } from "../display";
import { AbstractRifle } from "./abstract_rifle";

const SLIDE_RACK_TIME = 10;
const SLIDE_RACK_FORWARD_TIME = 120;
const SLIDE_RACK_DIST = 0.25;

export class BasicAssaultRifle extends AbstractRifle {
    stats = {
        damage: 0,

        mag_size: 8,
        rld_time: 0,

        cooldown: 50,
        burst: 1,

        bullet_size: 0.075,
        bullet_speed: 40,
        bullet_spread: 0.1,

        proj_dist: 0.04 + 0.625
    };

    draw(display: Display, x: number, y: number, pointing_dir: number, shoot_anim_start: number): void {
        // todo
    }
}