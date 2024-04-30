import { Display } from "./display";
import { Player } from "./player";
import { Hitbox } from "./hitbox";

export class MapObject {
    x: number;
    y: number;

    hitbox: Hitbox;

    has_upper_layer: boolean;

    constructor(x: number, y: number, hitbox: Hitbox, has_upper_layer: boolean) {
        this.x = x;
        this.y = y;

        this.hitbox = hitbox;

        this.has_upper_layer = has_upper_layer;
    }

    player_collision(player: Player, mov_x: number, mov_y: number) {
        return this.hitbox.player_collision(this.x, this.y, player, mov_x, mov_y);
    }

    vis_square_bounds() {
        return this.hitbox.square_bounds(this.x, this.y);
    }

    draw_lower_layer(display: Display) {}
    draw_upper_layer(display: Display) {}
}

const GRID_SIZE = 2;

export class MapObjectTracker {
    objects: Set<MapObject>;
    vis_grid: Map<string, Set<MapObject>>;
    collision_grid: Map<string, Set<MapObject>>;

    constructor() {
        this.objects = new Set();
        this.vis_grid = new Map();
        this.collision_grid = new Map();
    }

    within_grid_bounds(grid: Map<string, Set<MapObject>>, min_x: number, max_x: number, min_y: number, max_y: number) {
        let objects: Set<MapObject> = new Set();

        for (let gx = Math.floor(min_x / GRID_SIZE); gx <= Math.ceil(max_x / GRID_SIZE); gx++) {
            for (let gy = Math.floor(min_y / GRID_SIZE); gy <= Math.ceil(max_y / GRID_SIZE); gy++) {
                const key = gx + "," + gy;
                if (grid.has(key)) {
                    for (const object of Array.from(grid.get(key)!)) {
                        objects.add(object);
                    }
                }
            }
        }

        return objects;
    }

    visible_in_viewport(x: number, y: number, width: number, height: number) {
        return this.within_grid_bounds(
            this.vis_grid,
            x - width / 2, x + width / 2,
            y - height / 2, y + height / 2
        );
    }

    collision_possible(x: number, y: number, radius: number, mov_x: number, mov_y: number) {
        const min_x = Math.min(x - radius, x - radius + mov_x);
        const max_x = Math.max(x + radius, x + radius + mov_x);
        const min_y = Math.min(y - radius, y - radius + mov_y);
        const max_y = Math.max(y + radius, y + radius + mov_y);

        return this.within_grid_bounds(this.collision_grid, min_x, max_x, min_y, max_y);
    }

    insert_object(object: MapObject) {
        const vis_bounds = object.vis_square_bounds();
        const collision_bounds = object.hitbox.square_bounds(object.x, object.y);

        for (let gx = Math.floor(vis_bounds.min_x / GRID_SIZE); gx <= Math.ceil(vis_bounds.max_x / GRID_SIZE); gx++) {
            for (let gy = Math.floor(vis_bounds.min_y / GRID_SIZE); gy <= Math.ceil(vis_bounds.max_y / GRID_SIZE); gy++) {
                const key = gx + "," + gy;
                if (!this.vis_grid.has(key)) {
                    this.vis_grid.set(key, new Set());
                }
                this.vis_grid.get(key)!.add(object);
            }
        }

        for (let gx = Math.floor(collision_bounds.min_x / GRID_SIZE); gx <= Math.ceil(collision_bounds.max_x / GRID_SIZE); gx++) {
            for (let gy = Math.floor(collision_bounds.min_y / GRID_SIZE); gy <= Math.ceil(collision_bounds.max_y / GRID_SIZE); gy++) {
                const key = gx + "," + gy;
                if (!this.collision_grid.has(key)) {
                    this.collision_grid.set(key, new Set());
                }
                this.collision_grid.get(key)!.add(object);
            }
        }
    }
}