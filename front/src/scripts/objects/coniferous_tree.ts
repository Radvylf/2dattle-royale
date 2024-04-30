import { Display } from "../display";
import { CircleHitbox, SquareBounds } from "../hitbox";
import { MapObject } from "../object";

export class ConiferousTree extends MapObject {
    size: number;

    constructor(x: number, y: number, size: number) {
        super(x, y, new CircleHitbox(Math.sqrt(size)), true);

        this.size = size;
    }

    draw_upper_layer(display: Display): void {
        display.ctx.fillStyle = "rgba(20, 82, 41, 66.67%)";

        display.ctx.beginPath();
        display.ctx.arc(...display.px(this.x, this.y), this.size * (8 / 3) * display.scale, 0, Math.PI * 2, false);
        display.ctx.fill();

        display.ctx.fillStyle = "rgba(18, 71, 36, 66.67%)";

        display.ctx.beginPath();
        display.ctx.arc(...display.px(this.x, this.y), this.size * 2 * display.scale, 0, Math.PI * 2, false);
        display.ctx.fill();

        display.ctx.fillStyle = "#533520";
        display.ctx.strokeStyle = "#372315";
        display.ctx.lineWidth = display.scale * Math.sqrt(this.size) / 12;

        display.ctx.beginPath();
        display.ctx.arc(...display.px(this.x, this.y), Math.sqrt(this.size) / 2 * display.scale, 0, Math.PI * 2, false);
        display.ctx.fill();
        display.ctx.stroke();

        display.ctx.fillStyle = "rgba(15, 61, 31, 66.67%)";

        display.ctx.beginPath();
        display.ctx.arc(...display.px(this.x, this.y), this.size * (4 / 3) * display.scale, 0, Math.PI * 2, false);
        display.ctx.fill();
    }

    vis_square_bounds(): SquareBounds {
        return {
            min_x: this.x - this.size * (8 / 3),
            max_x: this.x + this.size * (8 / 3),
            min_y: this.y - this.size * (8 / 3),
            max_y: this.y + this.size * (8 / 3)
        };
    }
}