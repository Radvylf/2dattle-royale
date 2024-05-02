import { Display } from "./display";
import { Player, FpPlayer } from "./player";
import { TickLoop } from "./tick";

export enum HoldingStyle {
    PISTOL,
    RIFLE
}

export interface Item {
    tick_loop: TickLoop;

    holding_style: HoldingStyle;

    draw(display: Display, x: number, y: number, pointing_dir: number, shoot_anim_start: number): void;

    use(player: FpPlayer): void;
}