import { Display } from "../display";
import { CircleHitbox } from "../hitbox";
import { MapObject } from "../object";

export class Rock extends MapObject {
    size: number;

    constructor(x: number, y: number, size: number) {
        super(x, y, new CircleHitbox(size), false);

        this.size = size;
    }

    draw_lower_layer(display: Display): void {
        display.ctx.fillStyle = "#818181";
        display.ctx.strokeStyle = "#525252"; // "#616161";
        display.ctx.lineWidth = display.scale * Math.sqrt(this.size) / 12;

        display.ctx.beginPath();
        display.ctx.arc(...display.px(this.x, this.y), this.size / 2 * display.scale, 0, Math.PI * 2, false);
        display.ctx.fill();
        display.ctx.stroke();

        display.ctx.fillStyle = "#9c9c9c";

        display.ctx.beginPath();
        display.ctx.ellipse(...display.px(...display.shift_polar(this.x, this.y, Math.PI * 5 / 4, this.size / 4)), this.size / 6 * display.scale, this.size / 8 * display.scale, Math.PI * 3 / 4, 0, Math.PI * 2, false);
        display.ctx.fill();
    }
}