import { Display } from "../display";
import { SquareHitbox } from "../hitbox";
import { MapObject } from "../object";

export class Crate extends MapObject {
    constructor(x: number, y: number) {
        super(x, y, new SquareHitbox(2.5), false);
    }

    draw_lower_layer(display: Display): void {
        const size = 2.5;

        display.ctx.fillStyle = "#604020";
        display.ctx.strokeStyle = "#392613"; // "#432d16";

        display.ctx.lineWidth = display.scale * Math.sqrt(size / 2) / 8;

        display.ctx.fillRect(...display.px(this.x - size / 2, this.y - size / 2), size * display.scale, size * display.scale);
        display.ctx.strokeRect(...display.px(this.x - size / 2, this.y - size / 2), size * display.scale, size * display.scale);

        display.ctx.lineWidth = display.scale * Math.sqrt(size / 2) / 16;

        for (let sx = -0.375; sx < 0.375; sx += 0.75 / 3) {
            if (sx == -0.375) continue;

            display.ctx.beginPath();
            display.ctx.moveTo(...display.px(this.x + size * sx, this.y - size * 0.375));
            display.ctx.lineTo(...display.px(this.x + size * sx, this.y + size * 0.375));
            display.ctx.stroke();
        }

        display.ctx.beginPath();
        display.ctx.moveTo(...display.px(this.x - size * 0.375, this.y + size * (0.375 - 0.75 / 4 / Math.SQRT2)));
        display.ctx.lineTo(...display.px(this.x + size * (0.375 - 0.75 / 4 / Math.SQRT2), this.y - size * 0.375));
        display.ctx.lineTo(...display.px(this.x + size * 0.375, this.y - size * 0.375));
        display.ctx.lineTo(...display.px(this.x + size * 0.375, this.y - size * (0.375 - 0.75 / 4 / Math.SQRT2)));
        display.ctx.lineTo(...display.px(this.x - size * (0.375 - 0.75 / 4 / Math.SQRT2), this.y + size * 0.375));
        display.ctx.lineTo(...display.px(this.x - size * 0.375, this.y + size * 0.375));
        display.ctx.closePath();
        display.ctx.fill();
        display.ctx.stroke();

        display.ctx.lineWidth = display.scale * Math.sqrt(size / 2) / 8 / Math.SQRT2;

        display.ctx.strokeRect(...display.px(this.x - size * 0.375, this.y - size * 0.375), size * 0.75 * display.scale, size * 0.75 * display.scale);
    }
}