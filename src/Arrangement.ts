import { P5CanvasInstance } from "@p5-wrapper/react";
import CircularArray from "./CircularArray";
import Bubble from "./Bubble";
import { range, zip, zipWith } from "./util";
import P5 from "p5";

type ArrangementFunction = (count: number, size: number) => {positions: P5.Vector[], bubbleDiameter?: number};
class Arrangement {
    name: string;
    fn: ArrangementFunction;
    constructor(name: string, fn: ArrangementFunction){
        this.name = name;
        this.fn = fn;
    }
    apply(bubbles: Bubble[]) {
        console.log('applying arrangement: ' + this.name);
        var arranged = this.fn(bubbles.length, Bubble.outerDiameter);
        let bubblePositionPairs = 
            zip(
                bubbles,
                arranged.positions);
        for( let [bubble, pos] of bubblePositionPairs){
            Bubble.setOuterDiameter(arranged.bubbleDiameter || 150);
            bubble.pos = pos;
        }
    }
}

export function gridArrangment(
    p5: P5CanvasInstance,
    gw: number, gh: number,
    uw: number, uh: number
): P5.Vector[] {
    const ucountx = Math.floor(gw / uw);
    const ucounty = Math.floor(gh / uh);
    const padx = (gw - (ucountx * uw))/2;
    const pady = (gh - (ucounty * uh))/2;
    const xs = Array(ucountx).fill(null);
    const ys = Array(ucounty).fill(null);
    return xs.flatMap((_,x) => 
        ys.map((_,y) => 
            p5.createVector(
                x * uw + padx,
                y * uh + pady)));
}

export default (p5: P5CanvasInstance) =>
    new CircularArray<Arrangement>([
        {
            name: "Adaptive",
            fn: (count: number, _:number) => {
                const flowConfigs = [
                    [],
                    [1],
                    [2],
                    [3],
                    [2,2],
                    [3,2],
                    [3,3],
                    [2,3,2],
                    [3,2,3],
                    [3,3,3],
                    [3,4,3],
                    [4,3,4],
                    [4,4,4],
                    [4,5,4],
                    [5,4,5],
                    [5,5,5]
                ];

                // Important: It is assumed that `count` will be between 0 and 15!
                const flowConfig = flowConfigs[count];

                const aspectRatio = p5.width/p5.height;

                const [
                    createVector,
                    primaryDimensionLength,
                    secondaryDimensionLength
                ] = 
                    // the layout pattern operates according to which fits best to the current screen size: 
                    aspectRatio < 1 
                    ? [ //tall/narrow screen -> columns 
                        (p:number,s:number) => p5.createVector(s,p),
                        p5.height,
                        p5.width
                    ] 
                    : [ //short/wide screen -> rows
                        (p:number,s:number) => p5.createVector(p,s),
                        p5.width,
                        p5.height
                    ];

                var maxBubblePrimaryDimensionLength  = Math.floor(primaryDimensionLength/Math.max(...flowConfig));
                var maxBubbleSecondaryDimensionLength = Math.floor(secondaryDimensionLength/flowConfig.length);
                var optimalBubbleDiameter = Math.floor(Math.min(maxBubblePrimaryDimensionLength, maxBubbleSecondaryDimensionLength));
                let secondaryDimensionOffset = Math.ceil(secondaryDimensionLength/(flowConfig.length));
                var bubbleRadius = optimalBubbleDiameter/2;

                console.log({
                    primaryDimensionLength,
                    secondaryDimensionLength,
                    maxBubblePrimaryDimensionLength,
                    maxBubbleSecondaryDimensionLength,
                    optimalBubbleDiameter
                });
                let positions = flowConfig.flatMap((flowUnitCount,flowUnitIndex) => {
                    let s = (secondaryDimensionOffset * flowUnitIndex) + bubbleRadius;
                    let primaryOffset = Math.ceil(primaryDimensionLength/flowUnitCount);
                    return Array(flowUnitCount).fill(null).map((_, primaryIndex) => {
                        let p = (primaryOffset * primaryIndex) + bubbleRadius;
                        return createVector(p,s);
                    });
                });
                return {positions, bubbleDiameter: optimalBubbleDiameter};
            }
        },
        {
            name: "Diagonal (TL -> BR)",
            fn: (count:number, size:number) => {
                let r = size/2;
                let xOffset = Math.floor((p5.width  - size)/Math.max(count - 1, 1));
                let yOffset = Math.floor((p5.height - size)/Math.max(count - 1, 1));
                var positions = range(0,count).map(n => {
                    let pos = p5.createVector(
                    n*xOffset + r,
                    n*yOffset + r);
                    //console.log(`width:${width}, height:${height}, r:${r}, pos.x:${pos.x}, pos.y:${pos.y}, bottom-right-corner.x:${pos.x + r}, bottom-right-corner.y:${pos.y + r}`);
                    return pos;
                });
                return {positions};
            },
        },
        {
            name: "Diagonal (BL -> TR)",
            fn: (count:number, size:number) => {
                let r = size/2;
                var dx = Math.floor((p5.width  - size)/Math.max(count - 1, 1));
                var dy = Math.floor((p5.height - size)/Math.max(count - 1, 1));
                var xs = range(0,count).map(n => n*dx + r);
                var ys = range(count-1,0).map(n => n*dy + r);
                var positions = zipWith(xs, ys, p5.createVector);
                return {positions};
            }
        },
        {
            name:"Chevron (positive)",
            fn: (count:number, size:number) => chevronArrangement(p5,count,size,true)
        },
        {
            name:"Chevron (negative)",
            fn: (count:number, size:number) => chevronArrangement(p5,count,size,false)
        }
    ].map(o => new Arrangement(o.name, o.fn)));

function chevronArrangement(p5: P5CanvasInstance, count:number,size:number,positive:boolean){
    var dx = Math.floor((p5.width  - size)/Math.max(count - 1, 1));
    let r = size / 2;
    var xs = range(0,count).map(n => n*dx + r);
    var half = Math.floor(count / 2);
    var rows = count % 2 == 0 ? half : half + 1;
    var dy = Math.floor((p5.height - size)/Math.max(rows - 1, 1));
    var _ys1 = range(0,half).map(n => {
        var yy = n * dy + r;
        return positive ? yy : p5.height - yy;
    });
    var _ys2 = _ys1.slice(0,-1).reverse();
    if(count % 2 == 0){
        _ys1.pop();
    }
    var ys = Array.prototype.concat.call([], _ys1, _ys2);
    var positions = zipWith(xs, ys, p5.createVector);
    return {positions};
}