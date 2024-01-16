import { P5CanvasInstance } from "@p5-wrapper/react";
import CircularArray from "./CircularArray";
import * as P5 from "p5";
import {ISound} from "./Sound";
import { circularMask } from "./circularMask";

export default class Bubble {
    name: string;
    img: P5.Image;
    sounds: CircularArray<ISound>;
    vel: P5.Vector;
    pos: P5.Vector;
    rot: number;
    spinPositive: boolean;
    p5: P5CanvasInstance;
    strokeColor: any;
    _doneSpinningListeners: any[] = [];
    wasLastBubbleTouched = false;

    constructor(p5: P5CanvasInstance, name:string, img: P5.Image, sounds: ISound[], strokeColor: any, vel: any) {
        this.name = name;
        this.p5 = p5;
        this.img = circularMask(p5, img);
        this.sounds = new CircularArray(sounds);
        sounds.forEach(s => s.onended(() => this.donePlayingSound()));
        this.pos = p5.createVector(0, 0);
        this.vel = vel;
        this.rot = 0;
        this.spinPositive = true;
        this.strokeColor = strokeColor;
    }

    onceDoneSpinning(callback: any) {
        this._doneSpinningListeners = [callback];
    }

    draw() {
        var d = this.sounds.current.isPlaying()
                    ? Bubble.diameter * 1.125
                    : Bubble.diameter;
        var { p5 } = this;
        p5.push();
        p5.translate(this.pos.x, this.pos.y);
        p5.rotate(this.rot);
        p5.strokeWeight(Bubble.strokeWeight);
        p5.stroke(this.strokeColor);
        p5.noFill();
        p5.ellipseMode(p5.CENTER);
        //p5.push();
        //p5.blendMode(p5.DIFFERENCE);
        p5.ellipse(0, 0, d, d);
        //p5.pop();
        p5.image(this.img, -d / 2, -d / 2, d, d);
        p5.pop();
    }

    private donePlayingSound() {
        //console.log('done playing sound');
        this._doneSpinningListeners.forEach(l => l());
        this._doneSpinningListeners = [];
        this.sounds.next();
    }

    touched(wasLastBubbleTouched: boolean) {
        var p5 = this.p5;
        this.wasLastBubbleTouched = wasLastBubbleTouched;
        if(!wasLastBubbleTouched){
            this.sounds.reset();
        }
        let s = this.sounds.current;
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
        //s.setVolume(0.7);
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

    //handleCollision(v: P5.Vector){ }

    updatePosition() {
        var { p5 } = this;
        let c = p5.keyIsDown(32 /* SPACE */) ? 0.25 : 1;
        let ow = Bubble.outerDiameter;
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
        if (!this.sounds.current.isPlaying()) {
            return;
        }
        this.rot += (this.wasLastBubbleTouched ? -1 : 1) * 5;
        if (this.rot >= 360) {
            this.rot = this.rot % 360;
        } else if (this.rot < 0) {
            this.rot += 360;
        }
        if (this.rot == 0) {
        }
    }

    containsPoint(x: number, y: number) {
        return this.p5.dist(this.pos.x, this.pos.y, x, y) <= Bubble.outerDiameter / 2;
    };

    update() {
        this.updateRotation();
        this.updatePosition();
    }

    playBounceSound() {
        //console.log('bounce');
        if(!Bubble._bounceSnd){
            //console.log('bounce sound not found');
            return;
        }
        var volume = this.p5.map(this.vel.mag(), 0, 30, .1, 1, true);
        Bubble._bounceSnd.setVolume(volume);
        Bubble._bounceSnd.play();
    }
    
    private static diameter = 150;
    private static strokeWeight = 10;
    public static get outerDiameter() { return Bubble.diameter + (1*Bubble.strokeWeight); }

    private static _bounceSnd: ISound | undefined;
    static setOuterDiameter(d: number) {
        this.diameter = d - (1*this.strokeWeight);
    }
    static setDiameter(d: number) {
        this.diameter = d;
    }
    static setup(bounceSound: ISound) {
        //console.log({bounceSound});
        Bubble._bounceSnd = bounceSound;
    }
}