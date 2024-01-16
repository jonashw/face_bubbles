import { ImmutableObservable, MutableObservable } from "./Observable";
import ImmutableVector from "./ImmutableVector";

const stepCount = 3;
const validStep = (s:number) => -stepCount <= s && s <= stepCount;
const displayCoefficient = 1/49;

export class Gravity {
    public readonly value: ImmutableObservable<ImmutableVector>;
    public readonly displayValue: ImmutableObservable<ImmutableVector>;
    public readonly maximumMagnitude: number;
    public readonly stepCount: number = stepCount;
    public readonly xStep: MutableObservable<number>;
    public readonly yStep: MutableObservable<number>;

    constructor() {
        this.xStep = new MutableObservable<number>(0, validStep);
        this.yStep = new MutableObservable<number>(0, validStep);
        const positiveSteps = Array(stepCount).fill(null).map((_,i) => Math.pow(i + 1, 2));
        this.maximumMagnitude = positiveSteps[positiveSteps.length-1];
        //this.xs.addObserver(x => console.log({x}));
        //this.ys.addObserver(y => console.log({y}));
        const stepToValue = (s: number) =>
            s == 0 
            ? 0 
            : (s / Math.abs(s)) * Math.pow(Math.abs(s), 2);
        const value =
            ImmutableObservable.react2(
                this.xStep,
                this.yStep,
                (xs,ys) => new ImmutableVector(stepToValue(xs),stepToValue(ys)));
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
        this.xStep.update(_ => 0);
        this.yStep.update(_ => 0);
    }
}