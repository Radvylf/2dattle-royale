import { Player } from "./player";

const TINY_DIST = 2 ** -10;

export interface Collision {
    dist: number,
    dfc_dir: number,
    dfc_dist_multiplier: number
}

export function circle_circle_collision(x1: number, y1: number, r1: number, x2: number, y2: number, r2: number, dx: number, dy: number): Collision {
    const hypot = Math.hypot(dx, dy);

    dx /= hypot;
    dy /= hypot;

    const a = dx ** 2 + dy ** 2;
    const b = 2 * ((x1 - x2) * dx + (y1 - y2) * dy);
    const c = (x1 - x2) ** 2 + (y1 - y2) ** 2 - (r1 + r2) ** 2;

    const dm = b ** 2 - 4 * a * c;

    if (dm < 0) {
        return {
            dist: Infinity,
            dfc_dir: 0,
            dfc_dist_multiplier: 0
        };
    };

    const far_collision = (-b + Math.sqrt(dm)) / (2 * a);

    if (far_collision < TINY_DIST) {
        return {
            dist: Infinity,
            dfc_dir: 0,
            dfc_dist_multiplier: 0
        };
    }

    const close_collision = (-b - Math.sqrt(dm)) / (2 * a);

    const dfc_plus_pi_2 = Math.atan2(y1 + close_collision * dy * hypot - y2, x1 + close_collision * dx * hypot - x2) + Math.PI / 2;
    const dfc_dir = dx * Math.cos(dfc_plus_pi_2) + dy * Math.sin(dfc_plus_pi_2) < 0 ? dfc_plus_pi_2 + Math.PI : dfc_plus_pi_2;

    return {
        dist: close_collision,
        dfc_dir,
        dfc_dist_multiplier: dx * Math.cos(dfc_dir) + dy * Math.sin(dfc_dir)
    }; // todo
}

export function circle_line_collision(x1: number, y1: number, r1: number, x2: number, y2: number, theta: number, dx: number, dy: number): [number | null, Collision] {
    const hypot = Math.hypot(dx, dy);

    dx /= hypot;
    dy /= hypot;

    const sin = Math.sin(theta);
    const cos = Math.cos(theta);

    const dn = sin * dx - cos * dy;

    if (Math.abs(dn) < TINY_DIST) {
        return [null, {
            dist: Infinity,
            dfc_dir: 0,
            dfc_dist_multiplier: 0
        }];
    }

    const coll_0 = -(sin * (x1 - x2) - cos * (y1 - y2) - r1) / dn;
    const coll_1 = -(sin * (x1 - x2) - cos * (y1 - y2) + r1) / dn;

    const close_collision = coll_0 < coll_1 ? coll_0 : coll_1;
    const far_collision = coll_0 < coll_1 ? coll_1 : coll_0;

    const loc = (x1 + close_collision * dx * hypot - x2) * cos + (y1 + close_collision * dy * hypot - y2) * sin; // proj_b a where a is (x1 - x2, y1 - y2) and b is (cos, sin)

    if (far_collision < TINY_DIST || close_collision < -TINY_DIST) {
        return [loc, {
            dist: Infinity,
            dfc_dir: 0,
            dfc_dist_multiplier: 0
        }];
    }

    // if (close_collision < 0) console.error({x1, y1, r1, x2, y2, theta, dx, dy, dn, coll_0, coll_1, close_collision, hypot, cos, sin});

    return [loc, {
        dist: close_collision,
        dfc_dir: dx * cos + dy * sin < 0 ? theta + Math.PI : theta,
        dfc_dist_multiplier: Math.abs(dx * cos + dy * sin)
    }];
}

export function circle_polygon_collision(x1: number, y1: number, r1: number, points: [number, number][], dx: number, dy: number): Collision {
    let min = {
        dist: Infinity,
        dfc_dir: 0,
        dfc_dist_multiplier: 0
    };

    for (let i = 0; i < points.length; i++) {
        const circle_collision = circle_circle_collision(x1, y1, r1, points[i][0], points[i][1], 0, dx, dy);

        if (circle_collision.dist < min.dist) {
            min = circle_collision;
        }

        const line_collision = circle_line_collision(x1, y1, r1, points[i][0], points[i][1], Math.atan2(points[(i + 1) % points.length][1] - points[i][1], points[(i + 1) % points.length][0] - points[i][0]), dx, dy);

        if (line_collision[1].dist != Infinity && line_collision[0]! >= 0 && line_collision[0]! < Math.hypot(points[(i + 1) % points.length][0] - points[i][0], points[(i + 1) % points.length][1] - points[i][1])) {
            if (line_collision[1].dist < min.dist) {
                min = line_collision[1];
            }
        }
    }

    return min;
}

export interface SquareBounds {
    min_x: number,
    max_x: number,
    min_y: number,
    max_y: number
}

export interface Hitbox {
    player_collision(x: number, y: number, player: Player, mov_x: number, mov_y: number): Collision;
    square_bounds(x: number, y: number): SquareBounds;
}

export class SquareHitbox implements Hitbox {
    size: number;

    constructor(size: number) {
        this.size = size;
    }

    player_collision(x: number, y: number, player: Player, mov_x: number, mov_y: number): Collision {
        return circle_polygon_collision(player.x, player.y, 1 / 2, [
            [x - this.size / 2, y - this.size / 2],
            [x + this.size / 2, y - this.size / 2],
            [x + this.size / 2, y + this.size / 2],
            [x - this.size / 2, y + this.size / 2]
        ], mov_x, mov_y);
    }

    square_bounds(x: number, y: number): SquareBounds {
        return {
            min_x: x - this.size / 2,
            max_x: x + this.size / 2,
            min_y: y - this.size / 2,
            max_y: y + this.size / 2
        };
    }
}

export class CircleHitbox implements Hitbox {
    size: number;

    constructor(size: number) {
        this.size = size;
    }

    player_collision(x: number, y: number, player: Player, mov_x: number, mov_y: number): Collision {
        return circle_circle_collision(player.x, player.y, 1 / 2, x, y, this.size / 2, mov_x, mov_y);
    }

    square_bounds(x: number, y: number): SquareBounds {
        return {
            min_x: x - this.size / 2,
            max_x: x + this.size / 2,
            min_y: y - this.size / 2,
            max_y: y + this.size / 2
        };
    }
}