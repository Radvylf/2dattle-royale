import EventEmitter from "eventemitter3";

interface Binding {
    id: string;
    keys: Set<string>;
    mouse_btns: Set<number>;
    scroll_dirs: Set<number>;
}

const bindings: Binding[] = [
    {
        id: "up",
        keys: new Set(["KeyW", "ArrowUp"]),
        mouse_btns: new Set(),
        scroll_dirs: new Set()
    },
    {
        id: "down",
        keys: new Set(["KeyS", "ArrowDown"]),
        mouse_btns: new Set(),
        scroll_dirs: new Set()
    },
    {
        id: "left",
        keys: new Set(["KeyA", "ArrowLeft"]),
        mouse_btns: new Set(),
        scroll_dirs: new Set()
    },
    {
        id: "right",
        keys: new Set(["KeyD", "ArrowRight"]),
        mouse_btns: new Set(),
        scroll_dirs: new Set()
    },
    {
        id: "use",
        keys: new Set(["Space"]),
        mouse_btns: new Set([0]),
        scroll_dirs: new Set()
    },
    {
        id: "crouch",
        keys: new Set(["ShiftLeft", "ShiftRight"]),
        mouse_btns: new Set(),
        scroll_dirs: new Set()
    },
    {
        id: "inv_left",
        keys: new Set(["KeyQ"]),
        mouse_btns: new Set(),
        scroll_dirs: new Set([-1])
    },
    {
        id: "inv_right",
        keys: new Set(["KeyE"]),
        mouse_btns: new Set(),
        scroll_dirs: new Set([1])
    },
    {
        id: "inv_left_skip_fist",
        keys: new Set(),
        mouse_btns: new Set(),
        scroll_dirs: new Set()
    },
    {
        id: "inv_right_skip_fist",
        keys: new Set(),
        mouse_btns: new Set(),
        scroll_dirs: new Set()
    },
    {
        id: "inv_fist",
        keys: new Set(),
        mouse_btns: new Set(),
        scroll_dirs: new Set()
    }
];

const single_scroll_pixels = 8;
const partial_scroll_pixels = 20;

export class Controls extends EventEmitter {
    keys_down: Set<string>;
    mouse_btns_down: Set<number>;

    mouse_offset?: [number, number];

    partial_scroll_pixels: number;

    constructor() {
        super();

        this.keys_down = new Set();
        this.mouse_btns_down = new Set();

        this.partial_scroll_pixels = 0;

        window.addEventListener("keydown", (event) => {
            let binds_now_down = [];

            bindings: for (const binding of bindings) {
                if (binding.keys.has(event.code)) {
                    for (const key of Array.from(binding.keys)) {
                        if (this.keys_down.has(key)) {
                            continue bindings;
                        }
                    }
                    for (const mouse_btn of Array.from(binding.mouse_btns)) {
                        if (this.mouse_btns_down.has(mouse_btn)) {
                            continue bindings;
                        }
                    }

                    binds_now_down.push(binding.id);
                }
            }

            this.keys_down.add(event.code);

            for (const binding_id of binds_now_down) this.emit("bind_down", binding_id);
        });

        window.addEventListener("keyup", (event) => {
            this.keys_down.delete(event.code);

            bindings: for (const binding of bindings) {
                if (binding.keys.has(event.code)) {
                    for (const key of Array.from(binding.keys)) {
                        if (this.keys_down.has(key)) {
                            continue bindings;
                        }
                    }
                    for (const mouse_btn of Array.from(binding.mouse_btns)) {
                        if (this.mouse_btns_down.has(mouse_btn)) {
                            continue bindings;
                        }
                    }

                    this.emit("bind_up", binding.id);
                }
            }
        });

        window.addEventListener("mousedown", (event) => {
            let binds_now_down = [];

            bindings: for (const binding of bindings) {
                if (binding.mouse_btns.has(event.button)) {
                    for (const key of Array.from(binding.keys)) {
                        if (this.keys_down.has(key)) {
                            continue bindings;
                        }
                    }
                    for (const mouse_btn of Array.from(binding.mouse_btns)) {
                        if (this.mouse_btns_down.has(mouse_btn)) {
                            continue bindings;
                        }
                    }

                    binds_now_down.push(binding.id);
                }
            }

            this.mouse_btns_down.add(event.button);

            for (const binding_id of binds_now_down) this.emit("bind_down", binding_id);

            this.partial_scroll_pixels = 0;
        });

        window.addEventListener("mouseup", (event) => {
            this.mouse_btns_down.delete(event.button);

            bindings: for (const binding of bindings) {
                if (binding.mouse_btns.has(event.button)) {
                    for (const key of Array.from(binding.keys)) {
                        if (this.keys_down.has(key)) {
                            continue bindings;
                        }
                    }
                    for (const mouse_btn of Array.from(binding.mouse_btns)) {
                        if (this.mouse_btns_down.has(mouse_btn)) {
                            continue bindings;
                        }
                    }

                    this.emit("bind_up", binding.id);
                }
            }

            this.partial_scroll_pixels = 0;
        });

        window.addEventListener("mousemove", (event) => {
            this.mouse_offset = [event.offsetX, event.offsetY];

            this.partial_scroll_pixels = 0;

            this.emit("mouse_offset_update");
        });

        window.addEventListener("wheel", (event) => {
            console.log(event.deltaMode, event.deltaY);

            let dir = 0;

            if (event.deltaMode == event.DOM_DELTA_PIXEL) {
                if (Math.abs(event.deltaY) > single_scroll_pixels) {
                    dir = Math.sign(event.deltaY);
                } else if (Math.sign(event.deltaY) == Math.sign(this.partial_scroll_pixels) || this.partial_scroll_pixels == 0) {
                    this.partial_scroll_pixels += event.deltaY;

                    if (Math.abs(this.partial_scroll_pixels) > partial_scroll_pixels) {
                        dir = Math.sign(this.partial_scroll_pixels);
                    }
                } else {
                    this.partial_scroll_pixels = event.deltaY;
                }
            } else {
                dir = Math.sign(event.deltaY);
            }

            if (dir != 0) {
                let binds_now_down = [];

                bindings: for (const binding of bindings) {
                    if (binding.scroll_dirs.has(dir)) {
                        for (const key of Array.from(binding.keys)) {
                            if (this.keys_down.has(key)) {
                                continue bindings;
                            }
                        }
                        for (const mouse_btn of Array.from(binding.mouse_btns)) {
                            if (this.mouse_btns_down.has(mouse_btn)) {
                                continue bindings;
                            }
                        }

                        binds_now_down.push(binding.id);
                    }
                }

                for (const binding_id of binds_now_down) this.emit("bind_down", binding_id);

                this.partial_scroll_pixels = 0;
            }
        });

        window.addEventListener("blur", () => {
            this.keys_down.clear();

            // todo: clear mouse_btns, issue clear event

            this.mouse_offset = undefined;

            this.partial_scroll_pixels = 0;

            this.emit("mouse_offset_update");
        });
    }

    is_bind_down(id: string) {
        const binding = bindings.find(b => b.id == id);

        if (binding == null) return false;

        return binding == null ? false : Array.from(binding!.keys).some(k => this.keys_down.has(k)) || Array.from(binding!.mouse_btns).some(b => this.mouse_btns_down.has(b));
    }
}