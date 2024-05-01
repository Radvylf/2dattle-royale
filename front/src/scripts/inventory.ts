import { Display } from "./display";
import { Player } from "./player";
import { TickLoop } from "./tick";

export enum HoldingStyle {
    PISTOL
}

export interface Item {
    tick_loop: TickLoop;
    
    holding_style: HoldingStyle;

    draw(display: Display, player: Player, fist_offset: number): void;

    use(player: Player): void;
}