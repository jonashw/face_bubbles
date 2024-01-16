import { ImmutableObservable } from "./Observable";

export default class CircularArray<T> extends ImmutableObservable<T> {
    private items: T[];
    public count: number;
    private index: number;

    constructor(items: T[]) {
        var index = 0;
        super(items[index]);
        this.index = index;
        this.items = items;
        this.count = items.length;
    }

    reset(){
        this.index = 0;
        var c = this.items[this.index];
        this._current = c;
        this.notify(c);
        return c;
    }

    next() {
        this.index += 1;
        if (this.index >= this.items.length) {
            this.index -= this.items.length;
        }
        var c = this.items[this.index];
        this._current = c;
        this.notify(c);
        return c;
    }

    prev() {
        this.index -= 1;
        if (this.index < 0) {
            this.index = this.items.length - 1;
        }
        var c = this.items[this.index];
        this._current = c;
        this.notify(c);
        return c;
    }
}