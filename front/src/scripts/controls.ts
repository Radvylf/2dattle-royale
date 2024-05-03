import EventEmitter from "eventemitter3";

interface Binding {
    id: string;
    keys: Set<string>;
    mouse_btns: Set<number>;
}

const bindings: Binding[] = [
    {
        id: "up",
        keys: new Set(["KeyW", "ArrowUp"]),
        mouse_btns: new Set([])
    },
    {
        id: "down",
        keys: new Set(["KeyS", "ArrowDown"]),
        mouse_btns: new Set([])
    },
    {
        id: "left",
        keys: new Set(["KeyA", "ArrowLeft"]),
        mouse_btns: new Set([])
    },
    {
        id: "right",
        keys: new Set(["KeyD", "ArrowRight"]),
        mouse_btns: new Set([])
    },
    {
        id: "use",
        keys: new Set(["Space"]),
        mouse_btns: new Set([0])
    },
    {
        id: "crouch",
        keys: new Set(["ShiftLeft", "ShiftRight"]),
        mouse_btns: new Set([])
    },
    {
        id: "inv_left",
        keys: new Set(["KeyQ"]),
        mouse_btns: new Set([])
    },
    {
        id: "inv_right",
        keys: new Set(["KeyE"]),
        mouse_btns: new Set([])
    },
    {
        id: "inv_left_skip_fist",
        keys: new Set([]),
        mouse_btns: new Set([])
    },
    {
        id: "inv_right_skip_fist",
        keys: new Set([]),
        mouse_btns: new Set([])
    },
    {
        id: "inv_fist",
        keys: new Set([]),
        mouse_btns: new Set([])
    }
];

export class Controls extends EventEmitter {
    keys_down: Set<string>;
    mouse_btns_down: Set<number>;

    mouse_offset?: [number, number];

    constructor() {
        super();

        this.keys_down = new Set();
        this.mouse_btns_down = new Set();

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
        });

        window.addEventListener("mousemove", (event) => {
            this.mouse_offset = [event.offsetX, event.offsetY];

            this.emit("mouse_offset_update");
        });

        window.addEventListener("blur", () => {
            this.keys_down.clear();

            this.mouse_offset = undefined;

            this.emit("mouse_offset_update");
        });
    }

    is_bind_down(id: string) {
        const binding = bindings.find(b => b.id == id);

        if (binding == null) return false;

        return binding == null ? false : Array.from(binding!.keys).some(k => this.keys_down.has(k)) || Array.from(binding!.mouse_btns).some(b => this.mouse_btns_down.has(b));
    }
}