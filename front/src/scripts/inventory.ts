import { Display } from "./display";
import { Player } from "./player";

export enum HoldingStyle {
    PISTOL
}

export interface Item {
    holding_style: HoldingStyle;

    draw(display: Display, player: Player, fist_offset: number): void;

    use(player: Player): void;
}