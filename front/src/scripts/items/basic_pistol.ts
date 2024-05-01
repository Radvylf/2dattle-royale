import { Display } from "../display";
import { Item, HoldingStyle } from "../inventory";
import { Player } from "../player";

export class BasicPistol implements Item {
    holding_style = HoldingStyle.PISTOL;

    draw(display: Display, player: Player): void {
        display.ctx.fillStyle = "#111111";

        display.ctx.beginPath();
        display.ctx.moveTo(...display.px(...display.shift_polar(...display.shift_polar(player.x, player.y, player.facing_dir, 0.615), player.facing_dir - Math.PI / 2, 0.0875)));
        display.ctx.lineTo(...display.px(...display.shift_polar(...display.shift_polar(player.x, player.y, player.facing_dir, 0.615), player.facing_dir + Math.PI / 2, 0.0875)));
        display.ctx.lineTo(...display.px(...display.shift_polar(...display.shift_polar(...display.shift_polar(player.x, player.y, player.facing_dir, 0.615), player.facing_dir + Math.PI / 2, 0.0875), player.facing_dir, 0.625)));
        display.ctx.lineTo(...display.px(...display.shift_polar(...display.shift_polar(...display.shift_polar(player.x, player.y, player.facing_dir, 0.615), player.facing_dir - Math.PI / 2, 0.0875), player.facing_dir, 0.625)));
        display.ctx.closePath();
        display.ctx.fill();
    }
}