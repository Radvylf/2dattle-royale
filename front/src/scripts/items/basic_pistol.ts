import { Display } from "../display";
import { AbstractPistol } from "./abstract_pistol";

const SLIDE_RACK_TIME = 10;
const SLIDE_RACK_FORWARD_TIME = 120;
const SLIDE_RACK_DIST = 0.25;

export class BasicPistol extends AbstractPistol {
    stats = {
        damage: 0,

        mag_size: 8,
        rld_time: 0,

        cooldown: 50,
        burst: 1,

        bullet_size: 0.075,
        bullet_speed: 40,

        dir_stdd: 0.1,
        max_dist: 100,

        proj_dist: 0.04 + 0.625
    };

    draw(display: Display, x: number, y: number, pointing_dir: number, shoot_anim_start: number): void {
        display.ctx.fillStyle = "#080808";

        display.ctx.beginPath();
        display.ctx.moveTo(...display.px(...display.shift_polar(...display.shift_polar(x, y, pointing_dir, 0.04), pointing_dir - Math.PI / 2, 0.06)));
        display.ctx.lineTo(...display.px(...display.shift_polar(...display.shift_polar(x, y, pointing_dir, 0.04), pointing_dir + Math.PI / 2, 0.06)));
        display.ctx.lineTo(...display.px(...display.shift_polar(...display.shift_polar(...display.shift_polar(x, y, pointing_dir, 0.04), pointing_dir + Math.PI / 2, 0.06), pointing_dir, 0.625)));
        display.ctx.lineTo(...display.px(...display.shift_polar(...display.shift_polar(...display.shift_polar(x, y, pointing_dir, 0.04), pointing_dir - Math.PI / 2, 0.06), pointing_dir, 0.625)));
        display.ctx.closePath();
        display.ctx.fill();

        const slide_offset = shoot_anim_start == null || Date.now() - shoot_anim_start >= SLIDE_RACK_TIME + SLIDE_RACK_FORWARD_TIME ? 0 : (
            Date.now() - shoot_anim_start < SLIDE_RACK_TIME ? (Date.now() - shoot_anim_start) / SLIDE_RACK_TIME : 1 - (Date.now() - shoot_anim_start - SLIDE_RACK_TIME) / SLIDE_RACK_FORWARD_TIME
        ) * SLIDE_RACK_DIST;

        display.ctx.fillStyle = "#222222";
        display.ctx.strokeStyle = "#000000";
        display.ctx.lineWidth = display.scale / 24;

        display.ctx.beginPath();
        display.ctx.moveTo(...display.px(...display.shift_polar(...display.shift_polar(x, y, pointing_dir, 0.04 - slide_offset), pointing_dir - Math.PI / 2, 0.075)));
        display.ctx.lineTo(...display.px(...display.shift_polar(...display.shift_polar(x, y, pointing_dir, 0.04 - slide_offset), pointing_dir + Math.PI / 2, 0.075)));
        display.ctx.lineTo(...display.px(...display.shift_polar(...display.shift_polar(...display.shift_polar(x, y, pointing_dir, 0.04 - slide_offset), pointing_dir + Math.PI / 2, 0.075), pointing_dir, 0.625)));
        display.ctx.lineTo(...display.px(...display.shift_polar(...display.shift_polar(...display.shift_polar(x, y, pointing_dir, 0.04 - slide_offset), pointing_dir - Math.PI / 2, 0.075), pointing_dir, 0.625)));
        display.ctx.closePath();
        display.ctx.fill();
        display.ctx.stroke();
    }
}