import { P5CanvasInstance } from "@p5-wrapper/react";
import CircularArray from "./CircularArray";

export class Background {
    colors: CircularArray<any>;
    p5: P5CanvasInstance;
    constructor(p5: P5CanvasInstance,colors: any[]) {
        this.p5 = p5;
        this.colors = new CircularArray(colors);
    }

    update() {
        this.colors.next();
    }

    draw() {
        this.p5.background(this.colors.current);
    }
}
