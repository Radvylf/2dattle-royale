import { Player } from "./player";
import { HoldingStyle } from "./inventory";
import { TickLoop } from "./tick";
import { Controls } from "./controls";
import EventEmitter from "eventemitter3";

const PI = Math.PI;

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

    draw_player(player: Player) {
        const SKIN_COLOR = "#dddddd";
        const SKIN_BORDER_COLOR = "#a8a8a8";
        const SUIT_COLOR = "#222222";
        const SUIT_BORDER_COLOR = "#000000";
        
        this.ctx.fillStyle = SUIT_COLOR;
        this.ctx.strokeStyle = SUIT_BORDER_COLOR;
        this.ctx.lineWidth = this.scale / 6;
        
        this.ctx.beginPath();
        this.ctx.arc(...this.px(player.x, player.y), this.scale / 2, 0, Math.PI * 2, false);
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

        const PUNCH_TIME = 40;
        const PUNCH_PULLBACK_TIME = 280;
        const PUNCH_DIST = 0.35;

        if (player.holding_item == null) {
            const fist_offset = player.use_anim_start == null || Date.now() - player.use_anim_start >= PUNCH_TIME + PUNCH_PULLBACK_TIME ? 0 : Date.now() - player.use_anim_start < PUNCH_TIME ? (Date.now() - player.use_anim_start) / PUNCH_TIME : 1 - (Date.now() - player.use_anim_start - PUNCH_TIME) / PUNCH_PULLBACK_TIME;

            this.ctx.fillStyle = SKIN_COLOR;
            this.ctx.strokeStyle = SKIN_BORDER_COLOR;
            this.ctx.lineWidth = this.scale / 9;
            
            this.ctx.beginPath();
            this.ctx.arc(...this.px(...this.shift_polar(...this.shift_polar(player.x, player.y, player.facing_dir - PI / 3, 0.5625), player.facing_dir, player.active_hand == 0 ? fist_offset * PUNCH_DIST : 0)), this.scale * 0.15, 0, Math.PI * 2, false);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(...this.px(...this.shift_polar(...this.shift_polar(player.x, player.y, player.facing_dir + PI / 3, 0.5625), player.facing_dir, player.active_hand == 1 ? fist_offset * PUNCH_DIST : 0)), this.scale * 0.15, 0, Math.PI * 2, false);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.fill();
            
            this.ctx.fillStyle = SUIT_COLOR;
            this.ctx.strokeStyle = SUIT_BORDER_COLOR;
            
            this.ctx.beginPath();
            this.ctx.arc(...this.px(...this.shift_polar(...this.shift_polar(...this.shift_polar(player.x, player.y, player.facing_dir + PI, 0.05), player.facing_dir - PI / 3, 0.5625), player.facing_dir, player.active_hand == 0 ? fist_offset * PUNCH_DIST : 0)), this.scale * 0.1875, player.facing_dir - PI / 2, player.facing_dir + PI / 2, true);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(...this.px(...this.shift_polar(...this.shift_polar(...this.shift_polar(player.x, player.y, player.facing_dir + PI, 0.05), player.facing_dir + PI / 3, 0.5625), player.facing_dir, player.active_hand == 1 ? fist_offset * PUNCH_DIST : 0)), this.scale * 0.1875, player.facing_dir - PI / 2, player.facing_dir + PI / 2, true);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.fill();
        } else if (player.holding_item.holding_style == HoldingStyle.PISTOL) {
            this.ctx.fillStyle = SKIN_COLOR;
            this.ctx.strokeStyle = SKIN_BORDER_COLOR;
            this.ctx.lineWidth = this.scale / 9;
            
            this.ctx.beginPath();
            this.ctx.arc(...this.px(...this.shift_polar(player.x, player.y, player.facing_dir - PI / 12, 0.5625)), this.scale * 0.15, 0, Math.PI * 2, false);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(...this.px(...this.shift_polar(player.x, player.y, player.facing_dir + PI / 12, 0.5625)), this.scale * 0.15, 0, Math.PI * 2, false);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.fill();
            
            this.ctx.fillStyle = SUIT_COLOR;
            this.ctx.strokeStyle = SUIT_BORDER_COLOR;
            
            this.ctx.beginPath();
            this.ctx.arc(...this.px(...this.shift_polar(...this.shift_polar(player.x, player.y, player.facing_dir + PI, 0.05), player.facing_dir - PI / 14, 0.5625)), this.scale * 0.1875, player.facing_dir - PI / 2, player.facing_dir + PI / 2, true);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(...this.px(...this.shift_polar(...this.shift_polar(player.x, player.y, player.facing_dir + PI, 0.05), player.facing_dir + PI / 14, 0.5625)), this.scale * 0.1875, player.facing_dir - PI / 2, player.facing_dir + PI / 2, true);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.fill();

            player.holding_item.draw(this, player);
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
        
        for (const [_, player] of Array.from(this.tick_loop.players)) {
            this.draw_player(player);
        }

        this.draw_player(this.player);

        for (const object of upper_layer_objects) {
            object.draw_upper_layer(this);
        }
    }
}