import { ImmutableObservable } from "./Observable";

export default class TraversableArray<T> extends ImmutableObservable<T> {
    private items: T[];
    public readonly count: number;
    private initialIndex: number;
    private index: number;
    public readonly canWrap: boolean;

    public static createCircular<T>(items: T[]){
        if(items.length === 0){
            throw new Error("cannot create circular array with 0 items");
        }
        return new TraversableArray([], items[0], items.slice(1), true);
    }

    constructor(prevItems: T[], currentItem: T, nextItems: T[], canWrap: boolean) {
        super(currentItem);
        var initialIndex = prevItems.length;
        this.initialIndex = initialIndex;
        this.index = initialIndex;
        var items = [...prevItems, currentItem, ...nextItems];
        this.items = items;
        this.count = items.length;
        this.canWrap = canWrap;
    }

    reset(){
        this.index = this.initialIndex;
        var c = this.items[this.index];
        this._current = c;
        this.notify(c);
        return c;
    }

    next() {
        if(this.index + 1 == this.items.length && !this.canWrap){
            return;
        }
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
        if(this.index - 1 == -1 && !this.canWrap){
            return;
        }
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