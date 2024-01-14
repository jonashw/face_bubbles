export default class CircularArray<T> {
    private items: T[];
    public count: number;
    private index: number = 0;
    public onChange: ((item: T) => void) | undefined = undefined;

    constructor(items: T[]) {
        this.items = items;
        this.count = items.length;
    }

    reset(){
        this.index = 0;
        var c = this.getCurrent();
        if(!!this.onChange){
            this.onChange(c);
        }
        return c;
    }

    getCurrent() {
        return this.items[this.index];
    }

    next() {
        this.index += 1;
        if (this.index >= this.items.length) {
            this.index -= this.items.length;
        }
        var c = this.getCurrent();
        if(!!this.onChange){
            this.onChange(c);
        }
        return c;
    }
    prev() {
        this.index -= 1;
        if (this.index < 0) {
            this.index = this.items.length - 1;
        }
        var c = this.getCurrent();
        if(!!this.onChange){
            this.onChange(c);
        }
        return c;
    }
}