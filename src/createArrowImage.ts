import { P5CanvasInstance } from "@p5-wrapper/react";
import ImmutableVector from "./ImmutableVector";
import p5 from "p5";

export function createArrowImage(
    p5: P5CanvasInstance,
    sideLength: number,
    maxMagnitude: number,
    vec: ImmutableVector,
    color: string
): p5.Image {
    const arrowVector = p5.createVector(vec.x, vec.y);
    if(arrowVector.mag() > maxMagnitude) {
        const correctionFactor = maxMagnitude / arrowVector.mag();
        arrowVector.mult(correctionFactor);
    }
    const s = Math.abs(sideLength);
    const g = p5.createGraphics(s, s);
    const center = p5.createVector(g.width / 2, g.height / 2);
    g.stroke(color);
    g.noFill();
    //g.strokeWeight(1);
    //g.rect(0,0,g.width,g.height);
    g.strokeWeight(4);
    g.angleMode(p5.DEGREES);
    if (arrowVector.x === 0 && arrowVector.y === 0) {
        g.noFill();
        g.circle(center.x, center.y, s / 4);
    } else {
        var lineLength = p5.map(arrowVector.mag(), 0,maxMagnitude, 0,s/2, true)
        var heading = arrowVector.heading();
        g.fill(color);
        g.translate(center);
        g.rotate(heading);
        let arrowSize = p5.map(arrowVector.mag(), -maxMagnitude,maxMagnitude, s/20, s/3, true);
        g.line(0, 0, -lineLength, 0);
        //g.translate(mag - arrowSize, 0);
        g.triangle(
            0, arrowSize / 2,
            0, -arrowSize / 2,
            arrowSize, 0);
        console.log({ mag: arrowVector.mag(), arrowSize, center, lineLength, heading });
    }
    var m = p5.createImage(g.width, g.height);
    m.copy(g, 0, 0, g.width, g.height,
        0, 0, m.width, m.height);
    return m;
}