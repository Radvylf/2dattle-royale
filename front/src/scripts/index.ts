import { Dims, Display } from "./display";
import { FpPlayer } from "./player";
import { TickLoop } from "./tick";
import { Ws } from "./ws";
import { Controls } from "./controls";
import { Crate } from "./objects/crate";
import { Rock } from "./objects/rock";
import { DeciduousTree } from "./objects/deciduous_tree";
import { ConiferousTree } from "./objects/coniferous_tree";

const canvas = document.getElementById("display");

const WS_URI = "ws://localhost:8881/ws";

const ws = new Ws(WS_URI);

//ws.start();

const id = 0; // await ws.log_in();

const dims = new Dims();
const controls = new Controls();
const tick_loop = new TickLoop(ws);
const player = new FpPlayer(dims, tick_loop, controls, id, -2, -4);
const display = new Display(canvas! as HTMLCanvasElement, dims, player, tick_loop, controls);

tick_loop.attatch_player(player);

tick_loop.objects.insert_object(new Crate(-2, -4));
tick_loop.objects.insert_object(new Crate(-4.5, -3));
tick_loop.objects.insert_object(new Crate(4, 2));
tick_loop.objects.insert_object(new Crate(-8, 1));

tick_loop.objects.insert_object(new Rock(10, -10, 1.5));
tick_loop.objects.insert_object(new Rock(12, -11, 1));

tick_loop.objects.insert_object(new DeciduousTree(-12, -10, 1));
tick_loop.objects.insert_object(new DeciduousTree(-8, -6, 0.75));
tick_loop.objects.insert_object(new DeciduousTree(4, 10, 2));

tick_loop.objects.insert_object(new ConiferousTree(-8, 4, 1));
tick_loop.objects.insert_object(new ConiferousTree(-7, 7, 1.5));
tick_loop.objects.insert_object(new ConiferousTree(7, 2, 2));

console.log(tick_loop.objects.vis_grid);

let prior_tick_time: number | null = null;

function frame(tick_time: number | null) {
    const tick_diff_ms = tick_time == null ? 0 : tick_time - prior_tick_time!;
    prior_tick_time = tick_time;

    // if (tick_diff_ms > 16.85) console.log(tick_diff_ms);

    display.draw();
    player.tick(tick_diff_ms);

    window.requestAnimationFrame(frame);
}

frame(null);