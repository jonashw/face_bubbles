import { ImmutableObservable } from "./Observable";
import ImmutableVector from "./ImmutableVector";
import TraversableArray from "./TraversableArray";

const stepCount = 3;
const displayCoefficient = 1/49;

export class Gravity {
    public readonly xs: TraversableArray<number>;
    public readonly ys: TraversableArray<number>;
    public readonly value: ImmutableObservable<ImmutableVector>;
    public readonly displayValue: ImmutableObservable<ImmutableVector>;
    public readonly maximumMagnitude: number;

    constructor() {
        const positiveSteps = Array(stepCount).fill(null).map((_,i) => Math.pow(i + 1, 2));
        this.maximumMagnitude = positiveSteps[positiveSteps.length-1];
        const negativeSteps = [...positiveSteps].reverse().map(s => -s);
        this.xs = new TraversableArray(negativeSteps, 0, positiveSteps, false)
        this.ys = new TraversableArray(negativeSteps, 0, positiveSteps, false);
        this.xs.addObserver(x => console.log({x}));
        this.ys.addObserver(y => console.log({y}));
        const value =
            ImmutableObservable.react2(
                this.xs,
                this.ys,
                (x,y) => new ImmutableVector(x,y));
        //value.addObserver(v => console.log({v}));
        const displayValue = 
            ImmutableObservable.react(
                value,
                v => v.mult(displayCoefficient))
        //console.log({value,displayValue});
        //displayValue.addObserver(dv => console.log({dv}));
        this.value = value;
        this.displayValue = displayValue;
    }

    public reset(){
        this.xs.reset();
        this.ys.reset();
    }
}