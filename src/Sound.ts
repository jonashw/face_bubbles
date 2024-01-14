import {Howl, Howler} from "howler";

export interface ISound {
    onended(observer: () => void): void;
    isPlaying(): boolean;
    reverseBuffer(): void;
    play(): void;
    stop(): void;
    setVolume(v: number): void;
}

export function loadSound(audioFileUrl: string): ISound {
    return Howler.noAudio
        ? new NullSound(audioFileUrl)
        : new HowlSound(audioFileUrl);
}

class HowlSound implements ISound {
    private _howl: Howl;

    private _notify() {
        if(!!this._observer){
            this._observer();
        }
    };

    constructor(audioFileUrl: string) {
        this._howl = new Howl({
            src: [audioFileUrl]
        });
        this._howl.on("stop",() => this._notify());
        this._howl.on("end",() => this._notify());
    }

    private _observer: (() => void) | undefined;

    onended(observer: () => void){
        this._observer = observer;
    }
    isPlaying(): boolean {
        return this._howl.playing();
    }
    reverseBuffer(){
        this._howl.rate(- this._howl.rate());
    }

    play() {
        this._howl.play();
    }
    stop() {
        this._howl.stop();
    }
    setVolume(v: number) {
        this._howl.volume(v);
    }
}

class NullSound implements ISound {
    constructor(_: string) { }

    _timeout: number | undefined = undefined;
    private _observer: (() => void) | undefined;

    onended(observer: () => void){
        this._observer = observer;
    }
    isPlaying(): boolean {
        return this._timeout !== undefined;
    }

    reverseBuffer(){ }

    play() {
        this._timeout = setTimeout(() => {
            this._timeout = undefined;
            if(!!this._observer){ this._observer(); }
        }, 1000);
    }

    stop() {
        if (this._timeout !== undefined) {
            clearTimeout(this._timeout);
            if(!!this._observer){ this._observer(); }
        }
    }

    setVolume(_: number) {}
}