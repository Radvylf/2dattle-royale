import { Display } from "../display";
import { CircleHitbox, SquareBounds } from "../hitbox";
import { MapObject } from "../object";

export class DeciduousTree extends MapObject {
    size: number;

    constructor(x: number, y: number, size: number) {
        super(x, y, new CircleHitbox(Math.sqrt(size)), true);

        this.size = size;
    }

    draw_upper_layer(display: Display): void {
        const point_rand = (Math.sin(this.x * 8 + Math.cos(this.y * 8) * 8) * 16) % 1;

        display.ctx.fillStyle = "rgba(37, 119, 21, 80%)";

        display.ctx.beginPath();
        display.ctx.arc(...display.px(this.x, this.y), this.size * (7 / 3) * display.scale, 0, Math.PI * 2, false);
        display.ctx.fill();

        display.ctx.beginPath();
        display.ctx.arc(...display.px(...display.shift_polar(this.x, this.y, point_rand * Math.PI * 2, this.size * 2)), this.size * display.scale, 0, Math.PI * 2, false);
        display.ctx.fill();

        display.ctx.beginPath();
        display.ctx.arc(...display.px(...display.shift_polar(this.x, this.y, (point_rand * 256) % 1 * Math.PI * 2, this.size * 1.75)), this.size * (4 / 3) * display.scale, 0, Math.PI * 2, false);
        display.ctx.fill();

        display.ctx.beginPath();
        display.ctx.arc(...display.px(...display.shift_polar(this.x, this.y, ((point_rand * 256) % 1 * 256) % 1 * Math.PI * 2, this.size * 1.5)), this.size * (5 / 3) * display.scale, 0, Math.PI * 2, false);
        display.ctx.fill();

        display.ctx.fillStyle = "#63461d";
        display.ctx.strokeStyle = "#453114"; // "#4f3817";
        display.ctx.lineWidth = display.scale * Math.sqrt(this.size) / 9;

        display.ctx.beginPath();
        display.ctx.arc(...display.px(this.x, this.y), Math.sqrt(this.size) / 2 * display.scale, 0, Math.PI * 2, false);
        display.ctx.fill();
        display.ctx.stroke();
    }

    vis_square_bounds(): SquareBounds {
        return {
            min_x: this.x - this.size * (1.5 + (5 / 3)),
            max_x: this.x + this.size * (1.5 + (5 / 3)),
            min_y: this.y - this.size * (1.5 + (5 / 3)),
            max_y: this.y + this.size * (1.5 + (5 / 3))
        };
    }
}