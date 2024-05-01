import { Display } from "../display";
import { Item, HoldingStyle } from "../inventory";
import { Player } from "../player";

const SLIDE_RACK_TIME = 10;
const SLIDE_RACK_FORWARD_TIME = 120;
const SLIDE_RACK_DIST = 0.275;

export class BasicPistol implements Item {
    holding_style = HoldingStyle.PISTOL;

    draw(display: Display, player: Player, fist_offset: number): void {
        display.ctx.fillStyle = "#080808";

        display.ctx.beginPath();
        display.ctx.moveTo(...display.px(...display.shift_polar(...display.shift_polar(player.x, player.y, player.facing_dir, 0.615 + fist_offset), player.facing_dir - Math.PI / 2, 0.0575)));
        display.ctx.lineTo(...display.px(...display.shift_polar(...display.shift_polar(player.x, player.y, player.facing_dir, 0.615 + fist_offset), player.facing_dir + Math.PI / 2, 0.0575)));
        display.ctx.lineTo(...display.px(...display.shift_polar(...display.shift_polar(...display.shift_polar(player.x, player.y, player.facing_dir, 0.615 + fist_offset), player.facing_dir + Math.PI / 2, 0.0575), player.facing_dir, 0.625)));
        display.ctx.lineTo(...display.px(...display.shift_polar(...display.shift_polar(...display.shift_polar(player.x, player.y, player.facing_dir, 0.615 + fist_offset), player.facing_dir - Math.PI / 2, 0.0575), player.facing_dir, 0.625)));
        display.ctx.closePath();
        display.ctx.fill();

        const slide_offset = player.use_anim_start == null || Date.now() - player.use_anim_start >= SLIDE_RACK_TIME + SLIDE_RACK_FORWARD_TIME ? 0 : (
            Date.now() - player.use_anim_start < SLIDE_RACK_TIME ? (Date.now() - player.use_anim_start) / SLIDE_RACK_TIME : 1 - (Date.now() - player.use_anim_start - SLIDE_RACK_TIME) / SLIDE_RACK_FORWARD_TIME
        ) * SLIDE_RACK_DIST;

        display.ctx.fillStyle = "#222222";
        display.ctx.strokeStyle = "#000000";
        display.ctx.lineWidth = display.scale / 24;

        display.ctx.beginPath();
        display.ctx.moveTo(...display.px(...display.shift_polar(...display.shift_polar(player.x, player.y, player.facing_dir, 0.615 + fist_offset - slide_offset), player.facing_dir - Math.PI / 2, 0.075)));
        display.ctx.lineTo(...display.px(...display.shift_polar(...display.shift_polar(player.x, player.y, player.facing_dir, 0.615 + fist_offset - slide_offset), player.facing_dir + Math.PI / 2, 0.075)));
        display.ctx.lineTo(...display.px(...display.shift_polar(...display.shift_polar(...display.shift_polar(player.x, player.y, player.facing_dir, 0.615 + fist_offset - slide_offset), player.facing_dir + Math.PI / 2, 0.075), player.facing_dir, 0.625)));
        display.ctx.lineTo(...display.px(...display.shift_polar(...display.shift_polar(...display.shift_polar(player.x, player.y, player.facing_dir, 0.615 + fist_offset - slide_offset), player.facing_dir - Math.PI / 2, 0.075), player.facing_dir, 0.625)));
        display.ctx.closePath();
        display.ctx.fill();
        display.ctx.stroke();
    }

    use(player: Player): void {
        player.use_anim_start = Date.now();
    }
}