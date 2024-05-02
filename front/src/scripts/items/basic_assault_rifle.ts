import { Display } from "../display";
import { AbstractRifle } from "./abstract_rifle";

const SLIDE_RACK_TIME = 10;
const SLIDE_RACK_FORWARD_TIME = 120;
const SLIDE_RACK_DIST = 0.25;

export class BasicAssaultRifle extends AbstractRifle {
    stats = {
        damage: 0,

        mag_size: 24,
        rld_time: 0,

        cooldown: 125,
        burst: Infinity,

        bullet_size: 0.075,
        bullet_speed: 60,
        bullet_spread: 0.0375,

        front_hand_dist: 0.04 + 1.175 / 2,
        proj_dist: 0.04 + 1.175 + 0.075 * Math.SQRT2
    };

    draw(display: Display, x: number, y: number, pointing_dir: number, shoot_anim_start: number): void {
        display.ctx.fillStyle = "#222222";
        display.ctx.strokeStyle = "#000000";
        display.ctx.lineWidth = display.scale / 24;

        display.ctx.beginPath();
        display.ctx.moveTo(...display.px(...display.shift_polar(...display.shift_polar(x, y, pointing_dir, 0.04), pointing_dir - Math.PI / 2, 0.075)));
        display.ctx.lineTo(...display.px(...display.shift_polar(...display.shift_polar(x, y, pointing_dir, 0.04), pointing_dir + Math.PI / 2, 0.075)));
        display.ctx.lineTo(...display.px(...display.shift_polar(...display.shift_polar(...display.shift_polar(x, y, pointing_dir, 0.04), pointing_dir + Math.PI / 2, 0.075), pointing_dir, 1.175)));
        display.ctx.lineTo(...display.px(...display.shift_polar(...display.shift_polar(x, y, pointing_dir, 0.04), pointing_dir, 1.175 + 0.075 * Math.SQRT2)));
        display.ctx.lineTo(...display.px(...display.shift_polar(...display.shift_polar(...display.shift_polar(x, y, pointing_dir, 0.04), pointing_dir - Math.PI / 2, 0.075), pointing_dir, 1.175)));
        display.ctx.closePath();
        display.ctx.fill();
        display.ctx.stroke();
    }
}