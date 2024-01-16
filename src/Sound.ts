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

export async function loadSound(u: string | [string,string] | [string], defaultVoice?: string): Promise<ISound> {
    var relativeOrAbsoluteUrl = 
        u instanceof Array
        ? u.length == 2 
            ? `https://us-west1-jonashw-dev-personal-website.cloudfunctions.net/jonashw-dev-speech-synthesis-proxy?voice=${u[1]}&msg=${u[0]}`
            : `https://us-west1-jonashw-dev-personal-website.cloudfunctions.net/jonashw-dev-speech-synthesis-proxy?voice=${defaultVoice || "Justin"}&msg=${u[0]}`
        : u;
    var url = relativeOrAbsoluteUrl.indexOf("http") === 0 ? relativeOrAbsoluteUrl : urlWithFullHost("/assets/sound/" + relativeOrAbsoluteUrl);
    const r = await fetch(url,{redirect:'follow'});
    var blob = await r.blob();
    var reverseBlob = await reverseAudio(blob);
    //var arrayBuffer = await blob.arrayBuffer();
    var actualUrl = r.redirected
        ? r.url
        : relativeOrAbsoluteUrl;
    var format = actualUrl.split('.').pop()!;
    console.log(`loaded ${format} sound at ${actualUrl}` + (relativeOrAbsoluteUrl !== r.url ? ` (redirected from ${relativeOrAbsoluteUrl})` : ""), blob);
    return Howler.noAudio
        ? new NullSound()
        : new HowlSound(blob,reverseBlob,format);
}

class HowlSound implements ISound {
    private _howl: Howl;
    private _howlBackwards: Howl;

    constructor(blob: Blob, reverse: Blob, format: string) {
        this._howl = new Howl({
            src: [window.URL.createObjectURL(blob)],
            format: [format],
            html5: true,
            preload: true
        });
        this._howl.on("stop",() => this._notify());
        this._howl.on("end",() => this._notify());

        this._howlBackwards = new Howl({
            src: [window.URL.createObjectURL(reverse)],
            format: [format],
            html5: true,
            preload: true
        });
        this._howlBackwards.on("stop",() => this._notify());
        this._howlBackwards.on("end",() => this._notify());
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
        var b = this._howl;
        this._howl = this._howlBackwards;
        this._howlBackwards = b;
    }

    play() {
        //console.log('playing',this._howl);
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


async function reverseAudio(file: Blob): Promise<Blob> {
    /*references:
    **  https://stackoverflow.com/a/29240615
    **  https://russellgood.com/how-to-convert-audiobuffer-to-audio-file/
    **  https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer
    **  https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData
    */
    var audioData = await file.arrayBuffer();
    var ctx = new window.AudioContext();
    let buffer = await ctx.decodeAudioData(audioData);
    var offlineCtx = new window.OfflineAudioContext({
        numberOfChannels: 2,
        length: 44100 * buffer.duration,
        sampleRate: 44100,
    });
    var src = offlineCtx.createBufferSource();      // enable using loaded data as source
    var channel, tmp, i, t = 0, len, len2;

    while(t < buffer.numberOfChannels) {      
        channel = buffer.getChannelData(t++);  
        len = channel.length - 1;               // end of buffer
        len2 = len >>> 1;                       // center of buffer (integer)
        for(i = 0; i < len2; i++) {             // loop to center
            tmp = channel[len - i];             // from end -> tmp
            channel[len - i] = channel[i];      // end = from beginning
            channel[i] = tmp;                   // tmp -> beginning
        }
    }

    src.buffer = buffer;
    src.connect(offlineCtx.destination);
    let reversedBuffer = await offlineCtx.startRendering()
    return bufferToWave(reversedBuffer,offlineCtx.length);
}

function bufferToWave(abuffer: AudioBuffer, len: number): Blob {
  var numOfChan = abuffer.numberOfChannels,
      length = len * numOfChan * 2 + 44,
      buffer = new ArrayBuffer(length),
      view = new DataView(buffer),
      channels = [], i, sample,
      offset = 0,
      pos = 0;

  // write WAVE header
  setUint32(0x46464952);                         // "RIFF"
  setUint32(length - 8);                         // file length - 8
  setUint32(0x45564157);                         // "WAVE"

  setUint32(0x20746d66);                         // "fmt " chunk
  setUint32(16);                                 // length = 16
  setUint16(1);                                  // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2);                      // block-align
  setUint16(16);                                 // 16-bit (hardcoded in this demo)

  setUint32(0x61746164);                         // "data" - chunk
  setUint32(length - pos - 4);                   // chunk length

  // write interleaved data
  for(i = 0; i < abuffer.numberOfChannels; i++)
    channels.push(abuffer.getChannelData(i));

  while(pos < length) {
    for(i = 0; i < numOfChan; i++) {             // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
      view.setInt16(pos, sample, true);          // write 16-bit sample
      pos += 2;
    }
    offset++                                     // next source sample
  }

  return new Blob([buffer], {type: "audio/wav"});

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}