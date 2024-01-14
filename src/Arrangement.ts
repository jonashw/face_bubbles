import { P5CanvasInstance } from "@p5-wrapper/react";
import CircularArray from "./CircularArray";
import Bubble from "./Bubble";
import { range, zip, zipWith } from "./util";

type ArrangementFunction = (count: number, size: number) => [[number,number]];
class Arrangement {
    name: string;
    fn: ArrangementFunction;
    constructor(name: string, fn: ArrangementFunction){
        this.name = name;
        this.fn = fn;
    }
    apply(bubbles: Bubble[]) {
        console.log('applying arrangement: ' + this.name);
        let bubblePositionPairs = 
            zip(
                bubbles,
                this.fn(bubbles.length, Bubble.diameter()));
        for( let [bubble, pos] of bubblePositionPairs){
            bubble.pos = pos;
        }
    }
}

export default (p5: P5CanvasInstance) =>
    new CircularArray<Arrangement>([
        {
            name: "Rows",
            fn: (count:number, _:number) => {
                let rowConfigurations = [
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
                let rowConfig = rowConfigurations[count];
                let yOffset = Math.floor(p5.height/(rowConfig.length + 1));
                let positions: any  = [];
                rowConfig.forEach((rowSize,rowIndex) => {
                    let y = yOffset * (rowIndex + 1);
                    let xOffset = Math.floor(p5.width/(rowSize + 1));
                    for(var xIndex=1; xIndex <= rowSize; xIndex++){
                    let x = xOffset * xIndex;
                    positions.push(p5.createVector(x,y));
                    }
                });
                return positions;
            }
        },
        {
            name: "Diagonal (TL -> BR)",
            fn: (count:number, size:number) => {
                let r = size/2;
                let xOffset = Math.floor((p5.width  - size)/Math.max(count - 1, 1));
                let yOffset = Math.floor((p5.height - size)/Math.max(count - 1, 1));
                return range(0,count).map(n => {
                    let pos = p5.createVector(
                    n*xOffset + r,
                    n*yOffset + r);
                    //console.log(`width:${width}, height:${height}, r:${r}, pos.x:${pos.x}, pos.y:${pos.y}, bottom-right-corner.x:${pos.x + r}, bottom-right-corner.y:${pos.y + r}`);
                    return pos;
                });
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
                return zipWith(xs, ys, p5.createVector);
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
    return zipWith(xs, ys, p5.createVector);
}