export type Observer<T> = (value: T) => void;

export interface IObservable<T> {
    addObserver(o: Observer<T>): void;
}

export class Observable<T> implements IObservable<T> {
    private observers: Observer<T>[] = [];
    addObserver(o: Observer<T>): void {
        this.observers.push(o);
    }
    protected notify(value: T): void {
        for(let o of this.observers){
            o(value);
        }
    }
}

export class ImmutableObservable<T> extends Observable<T> {
    protected _current: T;
    public get current(){ return this._current};

    constructor(initial: T) {
        super();
        this._current = initial;
    }

    public static react<A,B>(
        a: ImmutableObservable<A>,
        react: (value: A) => B
    ){
        var b = new MutableObservable(react(a._current));
        a.addObserver(value => {
            var next = react(value);
            b._current = next;
            b.notify(next);
        });
        return b as ImmutableObservable<B>;
    }

    public static react2<A,B,C>(
        a: ImmutableObservable<A>,
        b: ImmutableObservable<B>,
        react: (a: A, b: B) => C
    ): ImmutableObservable<C>{
        var c = new MutableObservable<C>(react(a._current, b._current));
        a.addObserver(a => {
            var next = react(a, b._current);
            c._current = next;
            c.notify(next);
        });
        b.addObserver(b => {
            var next = react(a._current, b);
            c._current = next;
            c.notify(next);
        });
        return c as ImmutableObservable<C>;
    }
}

export class MutableObservable<T> extends ImmutableObservable<T> {
    private valueAcceptable?: (v: T) => boolean;
    constructor(initial: T, valueAcceptable?: (v: T) => boolean)  {
        super(initial);
        this.valueAcceptable = valueAcceptable;
    }

    public update(getNextValue: (prev: T) => T){
        var nextValue = getNextValue(this._current);
        if(this.valueAcceptable !== undefined && !this.valueAcceptable(nextValue)){
            return;
        }
        this._current = nextValue;
        this.notify(nextValue);
    }
}