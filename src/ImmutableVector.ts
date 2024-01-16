export default class ImmutableVector {
    public readonly x: number;
    public readonly y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    public mult(scalar: number){
        return new ImmutableVector(this.x * scalar, this.y * scalar);
    }
}