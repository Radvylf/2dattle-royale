import { Player } from "./player";
import { HoldingStyle } from "./item";
import { TickLoop } from "./tick";
import { Projectile } from "./projectile";
import { Controls } from "./controls";
import EventEmitter from "eventemitter3";
import { AbstractRifle } from "./items/abstract_rifle";

const PI = Math.PI;

export const CROUCHING_SCALE = 0.8;

export const PUNCH_TIME = 40;
export const PUNCH_PULLBACK_TIME = 280;
export const PUNCH_DIST = 0.35;

export const RECOIL_TIME = 20;
export const RECOIL_FORWARD_TIME = 140;
export const RECOIL_DIST = 0.1;

export const BULLET_TRAIL_DURATION = 0.25;

export class Dims extends EventEmitter {
    x!: number;
    y!: number;

    constructor() {
        super();

        this.resize();

        window.addEventListener("resize", () => {
            this.resize();

            this.emit("resize");
        });
    }

    resize() {
        this.x = window.innerWidth;
        this.y = window.innerHeight;
    }
}

export class Display {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    dims: Dims;
    scale!: number;

    player: Player;
    tick_loop: TickLoop;
    controls: Controls;
    
    constructor(canvas: HTMLCanvasElement, dims: Dims, player: Player, tick_loop: TickLoop, controls: Controls) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;

        this.dims = dims;

        dims.on("resize", this.resize.bind(this));

        this.resize();

        this.player = player;
        this.tick_loop = tick_loop;
        this.controls = controls;
    }

    resize() {
        this.scale = Math.sqrt(this.dims.x * this.dims.y) / 24;
    
        this.canvas.width = this.dims.x;
        this.canvas.height = this.dims.y;
    }

    px(x: number, y: number): [number, number] {
        return [this.dims.x / 2 + (x - this.player.x) * this.scale, this.dims.y / 2 + (y - this.player.y) * this.scale];
    }

    shift_polar(x: number, y: number, dir: number, dist: number): [number, number] {
        return [x + Math.cos(dir) * dist, y + Math.sin(dir) * dist]
    }

    draw_projectile(proj: Projectile) {
        if (proj.collision_time == null) {
            this.ctx.fillStyle = "#ffffff";

            const dir = Math.atan2(proj.dy, proj.dx);

            this.ctx.beginPath();
            this.ctx.moveTo(...this.px(...this.shift_polar(proj.x, proj.y, dir + Math.PI / 4, proj.size * Math.SQRT1_2)));
            this.ctx.lineTo(...this.px(...this.shift_polar(proj.x, proj.y, dir + Math.PI * 3 / 4, proj.size * Math.SQRT1_2)));
            this.ctx.lineTo(...this.px(...this.shift_polar(proj.x, proj.y, dir + Math.PI * 5 / 4, proj.size * Math.SQRT1_2)));
            this.ctx.lineTo(...this.px(...this.shift_polar(proj.x, proj.y, dir + Math.PI * 7 / 4, proj.size * Math.SQRT1_2)));
            this.ctx.closePath();
            this.ctx.fill();
        }

        const now = Date.now();

        const trail_mul = Math.min(BULLET_TRAIL_DURATION, (now - proj.shot_time) / 1000);

        const sim_x = proj.start_x + proj.dx * (now - proj.shot_time) / 1000;
        const sim_y = proj.start_y + proj.dy * (now - proj.shot_time) / 1000;

        const gradient = this.ctx.createLinearGradient(...this.px(sim_x, sim_y), ...this.px(sim_x - proj.dx * BULLET_TRAIL_DURATION, sim_y - proj.dy * BULLET_TRAIL_DURATION));

        gradient.addColorStop(0, "rgba(255, 255, 255, 0.5)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0.0)");

        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = proj.size * this.scale;

        this.ctx.beginPath();
        this.ctx.moveTo(...this.px(proj.x, proj.y));
        this.ctx.lineTo(...this.px(sim_x - proj.dx * trail_mul, sim_y - proj.dy * trail_mul));
        this.ctx.stroke();
    }

    draw_player(player: Player) {
        const SKIN_COLOR = "#dddddd";
        const SKIN_BORDER_COLOR = "#a8a8a8";
        const SUIT_COLOR = "#222222";
        const SUIT_BORDER_COLOR = "#000000";
        
        this.ctx.fillStyle = SUIT_COLOR;
        this.ctx.strokeStyle = SUIT_BORDER_COLOR;
        this.ctx.lineWidth = this.scale / 6;

        const player_scale = player.crouching ? CROUCHING_SCALE : 1;
        
        this.ctx.beginPath();
        this.ctx.arc(...this.px(player.x, player.y), this.scale / 2 * player_scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.fill();

        // const mouse_offset = this.controls.mouse_offset ?? [this.dims.x / 2, this.dims.y / 2];
        // const player_dir = Math.atan2(this.dims.y / 2 - mouse_offset[1], this.dims.x / 2 - mouse_offset[0]);
        
        /*const NAPKIN_COLOR = "#f42525";
        
        this.ctx.fillStyle = NAPKIN_COLOR;
        
        this.ctx.beginPath();
        this.ctx.arc(this.dims.x / 2, this.dims.y / 2, this.scale * 0.45, player_dir + Math.PI * 1.55, player_dir + Math.PI * 0.05, false);
        this.ctx.closePath();
        this.ctx.fill();*/

        const fist_offset = player.fist_offset();

        const holding_item = player.holding_item();

        if (holding_item == null) {
            this.ctx.fillStyle = SKIN_COLOR;
            this.ctx.strokeStyle = SKIN_BORDER_COLOR;
            this.ctx.lineWidth = this.scale / 9;
            
            this.ctx.beginPath();
            this.ctx.arc(...this.px(...this.shift_polar(...this.shift_polar(player.x, player.y, player.facing_dir - PI / 3, 0.5625 * player_scale), player.facing_dir, player.active_hand == 0 ? fist_offset : 0)), this.scale * 0.15 * player_scale, 0, Math.PI * 2, false);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(...this.px(...this.shift_polar(...this.shift_polar(player.x, player.y, player.facing_dir + PI / 3, 0.5625 * player_scale), player.facing_dir, player.active_hand == 1 ? fist_offset : 0)), this.scale * 0.15 * player_scale, 0, Math.PI * 2, false);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.fill();
            
            this.ctx.fillStyle = SUIT_COLOR;
            this.ctx.strokeStyle = SUIT_BORDER_COLOR;
            
            this.ctx.beginPath();
            this.ctx.arc(...this.px(...this.shift_polar(...this.shift_polar(...this.shift_polar(player.x, player.y, player.facing_dir + PI, 0.05 * player_scale), player.facing_dir - PI / 3, 0.5625 * player_scale), player.facing_dir, player.active_hand == 0 ? fist_offset : 0)), this.scale * 0.1875 * player_scale, player.facing_dir - PI / 2, player.facing_dir + PI / 2, true);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(...this.px(...this.shift_polar(...this.shift_polar(...this.shift_polar(player.x, player.y, player.facing_dir + PI, 0.05 * player_scale), player.facing_dir + PI / 3, 0.5625 * player_scale), player.facing_dir, player.active_hand == 1 ? fist_offset : 0)), this.scale * 0.1875 * player_scale, player.facing_dir - PI / 2, player.facing_dir + PI / 2, true);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.fill();
        } else if (holding_item.holding_style == HoldingStyle.PISTOL) {
            const HAND_DIST = PI / 16;

            this.ctx.fillStyle = SKIN_COLOR;
            this.ctx.strokeStyle = SKIN_BORDER_COLOR;
            this.ctx.lineWidth = this.scale / 9;
            
            this.ctx.beginPath();
            this.ctx.arc(...this.px(...this.shift_polar(...this.shift_polar(player.x, player.y, player.facing_dir - HAND_DIST / 2, 0.5625 * player_scale), player.facing_dir, fist_offset)), this.scale * 0.15 * player_scale, 0, Math.PI * 2, false);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(...this.px(...this.shift_polar(...this.shift_polar(player.x, player.y, player.facing_dir + HAND_DIST / 2, 0.5625 * player_scale), player.facing_dir, fist_offset)), this.scale * 0.15 * player_scale, 0, Math.PI * 2, false);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.fill();
            
            this.ctx.fillStyle = SUIT_COLOR;
            this.ctx.strokeStyle = SUIT_BORDER_COLOR;
            
            this.ctx.beginPath();
            this.ctx.arc(...this.px(...this.shift_polar(...this.shift_polar(...this.shift_polar(player.x, player.y, player.facing_dir + PI, 0.05 * player_scale), player.facing_dir - HAND_DIST / 2, 0.5625 * player_scale), player.facing_dir, fist_offset)), this.scale * 0.1875 * player_scale, player.facing_dir - PI / 2, player.facing_dir + PI / 2, true);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(...this.px(...this.shift_polar(...this.shift_polar(...this.shift_polar(player.x, player.y, player.facing_dir + PI, 0.05 * player_scale), player.facing_dir + HAND_DIST / 2, 0.5625 * player_scale), player.facing_dir, fist_offset)), this.scale * 0.1875 * player_scale, player.facing_dir - PI / 2, player.facing_dir + PI / 2, true);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.fill();

            holding_item.draw(this, ...this.shift_polar(player.x, player.y, player.facing_dir, 0.6125 * player_scale + fist_offset), player.facing_dir, player.use_anim_start ?? -Infinity); // todo: 0.04/0.05 isn't on the hand
        } else if (holding_item.holding_style == HoldingStyle.RIFLE) {
            holding_item.draw(this, ...this.shift_polar(player.x, player.y, player.facing_dir, 0.6125 * player_scale + fist_offset), player.facing_dir, player.use_anim_start ?? -Infinity);

            this.ctx.fillStyle = SKIN_COLOR;
            this.ctx.strokeStyle = SKIN_BORDER_COLOR;
            this.ctx.lineWidth = this.scale / 9;
            
            this.ctx.beginPath();
            this.ctx.arc(...this.px(...this.shift_polar(...this.shift_polar(player.x, player.y, player.facing_dir, 0.5625 * player_scale + fist_offset), player.facing_dir + PI / 2, 0)), this.scale * 0.15 * player_scale, 0, Math.PI * 2, false);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(...this.px(...this.shift_polar(...this.shift_polar(player.x, player.y, player.facing_dir, 0.5625 * player_scale + (holding_item as AbstractRifle).stats.front_hand_dist + fist_offset), player.facing_dir - PI / 2, 0.075)), this.scale * 0.125 * player_scale, 0, Math.PI * 2, false);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.fill();
            
            this.ctx.fillStyle = SUIT_COLOR;
            this.ctx.strokeStyle = SUIT_BORDER_COLOR;
            
            this.ctx.beginPath();
            this.ctx.arc(...this.px(...this.shift_polar(...this.shift_polar(...this.shift_polar(player.x, player.y, player.facing_dir + PI, 0.05 * player_scale), player.facing_dir, 0.5625 * player_scale + fist_offset), player.facing_dir + PI / 2, 0)), this.scale * 0.1875 * player_scale, player.facing_dir - PI / 2, player.facing_dir + PI / 2, true);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.fill();
        }
    }

    draw() {
        const GRASS_COLOR = "#3da329"; // "#45b82e";
    
        this.ctx.fillStyle = GRASS_COLOR;
        this.ctx.fillRect(0, 0, this.dims.x, this.dims.y);

        let upper_layer_objects = [];

        for (const object of Array.from(this.tick_loop.objects.visible_in_viewport(this.player.x, this.player.y, this.dims.x / this.scale, this.dims.y / this.scale))) {
            object.draw_lower_layer(this);

            if (object.has_upper_layer) {
                upper_layer_objects.push(object);
            }
        }

        for (const proj of this.tick_loop.projectiles) {
            this.draw_projectile(proj);
        }
        
        for (const [_, player] of Array.from(this.tick_loop.players)) {
            this.draw_player(player);
        }

        this.draw_player(this.player);

        for (const object of upper_layer_objects) {
            object.draw_upper_layer(this);
        }
    }
}