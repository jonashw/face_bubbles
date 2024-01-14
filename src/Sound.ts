import {Howl, Howler} from "howler";

export interface ISound {
    onended(observer: () => void): void;
    isPlaying(): boolean;
    reverseBuffer(): void;
    play(): void;
    stop(): void;
    setVolume(v: number): void;
}

function urlWithFullHost(url: string){
    var l = window.location;
    return `${l.protocol}//${l.host}${url}`;
}

export async function loadSound(u: string | [string,string]): Promise<ISound> {
    var relativeOrAbsoluteUrl = 
        u instanceof Array
        ? `https://us-west1-jonashw-dev-personal-website.cloudfunctions.net/jonashw-dev-speech-synthesis-proxy?voice=${u[1]}&msg=${u[0]}`
        : u;
    var url = relativeOrAbsoluteUrl.indexOf("http") === 0 ? relativeOrAbsoluteUrl : urlWithFullHost("/assets/sounds/" + relativeOrAbsoluteUrl);
    const r = await fetch(url,{redirect:'follow'});
    var blob = window.URL.createObjectURL(await r.blob());
    var actualUrl = r.redirected
        ? r.url
        : relativeOrAbsoluteUrl;
    var format = actualUrl.split('.').pop()!;
    console.log(`loaded ${format} sound at ${actualUrl}` + (relativeOrAbsoluteUrl !== r.url ? ` (redirected from ${relativeOrAbsoluteUrl})` : ""), blob);
    return Howler.noAudio
        ? new NullSound()
        : new HowlSound(blob,format);
}

class HowlSound implements ISound {
    private _howl: Howl;

    constructor(audioFileUrl: string, format: string) {
        this._howl = new Howl({
            src: [audioFileUrl],
            format: [format],
            html5: true,
            preload: true
        });
        this._howl.on("stop",() => this._notify());
        this._howl.on("end",() => this._notify());
    }

    private _notify() {
        if(!!this._observer){
            this._observer();
        }
    };

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
    constructor() { }

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