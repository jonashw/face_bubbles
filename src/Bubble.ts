import { P5CanvasInstance } from "@p5-wrapper/react";
import CircularArray from "./CircularArray";
import * as P5 from "p5";
import {ISound} from "./Sound";

const _ellipseDiameter = 150;
const _strokeWeight = 10;
const _outerDiameter = _ellipseDiameter + _strokeWeight;
var _bounceSnd: ISound | undefined;

export default class Bubble {
    static diameter() {
        return _outerDiameter;
    }
    img: any;
    sounds: CircularArray<ISound>;
    vel: any;
    pos: any;
    rot: number;
    spinPositive: boolean;
    p5: P5CanvasInstance;
    strokeColor: any;
    _doneSpinningListeners: any[] = [];

    constructor(p5: P5CanvasInstance, img: any, sounds: ISound[], strokeColor: any, vel: any) {
        this.p5 = p5;
        this.img = img;
        this.sounds = new CircularArray(sounds);
        sounds.forEach(s => s.onended(() => this.donePlayingSound()));
        this.pos = p5.createVector(0, 0);
        this.vel = vel;
        this.rot = 0;
        this.spinPositive = true;
        this.strokeColor = strokeColor;
    }

    static setup(bounceSound: ISound) {
        _bounceSnd = bounceSound;
    }

    onceDoneSpinning(callback: any) {
        this._doneSpinningListeners = [callback];
    }

    draw() {
        var d = _ellipseDiameter;
        var { p5 } = this;
        p5.push();
        p5.translate(this.pos.x, this.pos.y);
        p5.rotate(this.rot);
        this.sounds.getCurrent().isPlaying()
            ? _ellipseDiameter * 1.5
            : _ellipseDiameter;
        p5.strokeWeight(_strokeWeight);
        p5.stroke(this.strokeColor);
        p5.noFill();
        p5.ellipseMode(p5.CENTER);
        p5.ellipse(0, 0, d, d);
        p5.image(this.img, -d / 2, -d / 2, d, d);
        p5.pop();
    }

    private donePlayingSound() {
        //console.log('done playing sound');
        this._doneSpinningListeners.forEach(l => l());
        this._doneSpinningListeners = [];
        this.sounds.next();
    }

    touched() {
        var p5 = this.p5;
        let s = this.sounds.getCurrent();
        if (s.isPlaying()) {
            return;
        }
        if (p5.keyIsDown(p5.SHIFT)) {
            s.reverseBuffer();
            this.spinPositive = !this.spinPositive;
        }
        if (s.isPlaying()) {
            this.rot = 0;
            s.stop();
        }
        s.setVolume(0.7);
        s.play();
    }

    impactFrom(impactPos: any) {
        let funFactor = 5000;
        let impactOffset = P5.Vector.sub(impactPos, this.pos);
        let d = impactOffset.mag();
        let intensity = 1 / (d * d); //Source: https://www.nde-ed.org/EducationResources/CommunityCollege/Radiography/Physics/inversesquare.htm
        let deltaV = impactOffset.normalize().mult(intensity * funFactor);
        let inverse = this.p5.createVector(-deltaV.x, -deltaV.y);
        this.vel = P5.Vector.add(this.vel, inverse);
    };

    updatePosition() {
        var { p5 } = this;
        let c = p5.keyIsDown(32 /* SPACE */) ? 0.25 : 1;
        let ow = Bubble.diameter();
        this.pos.x += this.vel.x * c;
        let xOver = this.pos.x + ow / 2 - p5.width;
        if (xOver > 0) {
            this.vel.x = -this.vel.x;
            this.pos.x -= (xOver + 1);
            this.playBounceSound();
        } else {
            let xUnder = this.pos.x - ow / 2;
            if (xUnder < 0) {
                this.vel.x = -this.vel.x;
                this.pos.x -= (xUnder - 1);
                this.playBounceSound();
            }
        }

        this.pos.y += this.vel.y * c;
        let yOver = this.pos.y + ow / 2 - p5.height;
        if (yOver >= 0) {
            this.vel.y = -this.vel.y;
            this.pos.y -= (yOver + 1);
            this.playBounceSound()
        } else {
            let yUnder = this.pos.y - ow / 2;
            if (yUnder < 0) {
                this.vel.y = -this.vel.y;
                this.pos.y -= (yUnder - 1);
                this.playBounceSound()
            }
        }
    }

    updateRotation() {
        var { p5 } = this;
        if (p5.keyIsDown(p5.LEFT_ARROW)) {
            //this.rot -= 5;
        }
        if (p5.keyIsDown(p5.RIGHT_ARROW)) {
            //this.rot += 5;
        }
        if (this.sounds.getCurrent().isPlaying()) {
            if (this.spinPositive) {
                this.rot += 10;
            } else {
                this.rot -= 10;
            }
            if (this.rot >= 360) {
                this.rot = this.rot % 360;
            } else if (this.rot < 0) {
                this.rot += 360;
            }
            if (this.rot == 0) {
            }
        }
    }

    containsPoint(x: number, y: number) {
        return this.p5.dist(this.pos.x, this.pos.y, x, y) <= _ellipseDiameter / 2;
    };

    update() {
        this.updateRotation();
        this.updatePosition();
    }

    playBounceSound() {
        //console.log('bounce');
        if(!_bounceSnd){
            return;
        }
        _bounceSnd.setVolume(0.5);
        _bounceSnd.play();
    }
}