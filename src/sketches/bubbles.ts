import { P5CanvasInstance} from "@p5-wrapper/react";
import { Background } from "../Background";
import Bubble from "../Bubble";
import P5 from "p5";
import getArrangements from "../Arrangement";
import * as Sound from "../Sound";

const loadingText = "LOADING";

type StageDefinition = {
    showFirstNBubbles: number,
    bubbles: BubbleDefinition[];
    defaultVoice: string | undefined;
}
type BubbleDefinition = {
    img: string;
    sounds: (string | [string,string] | [string])[];
    color: [number,number,number];
    velocity: [number,number];
};

type XY = {x:number, y:number};

const getSketch = (configJsonFile: string) => (p5: P5CanvasInstance) => {
    var settingTheStage = true;
    var bubbles: Bubble[] = [];
    var unusedBubbles: Bubble[] = [];
    var bg: Background;
    var bubblesMoving = false;
    var touchColor: P5.Color;
    var lastBubbleTouched: Bubble | undefined = undefined;

    var arrangements = getArrangements(p5);

    function setTheStage(def: StageDefinition){
        var mildVelocity = function(v: P5.Vector){
            return v.normalize().mult(0.5);
        };
        Promise.all(def.bubbles.map(async bd => {
            return new Bubble(
                p5,
                p5.loadImage("/assets/" + bd.img),
                await Promise.all(bd.sounds.map(async fn => await Sound.loadSound(fn, def.defaultVoice))),
                p5.color(bd.color[0], bd.color[1], bd.color[2]),
                mildVelocity(p5.createVector(bd.velocity[0], bd.velocity[1])));
        })).then(bs => {
            settingTheStage = false;
            unusedBubbles = bs;
            bubbles = [];
            for(var i=0; i<def.showFirstNBubbles; i++){
                var b = unusedBubbles.shift();
                if(!!b){
                    bubbles.push(b);
                }
            }
            arrangements.getCurrent().apply(bubbles);
        });
        Sound.loadSound("basketball-bounce-wood-surface-thud-blastwavefx-29503.mp3")
            .then(Bubble.setup);
    }

    p5.setup = () => {
        p5.colorMode(p5.HSL, 255, 255, 255, 100);
        touchColor = p5.color(0,0,0,50);

        bg = new Background(p5, (() => {
            var _hues = [];
            for(var h=0;h<256;h++){
                _hues.push(p5.color(h,255,148));
            }
            return _hues;
        })());

        p5.angleMode(p5.DEGREES);
        p5.createCanvas(p5.windowWidth, p5.windowHeight);
        p5.ellipseMode(p5.CENTER);

        fetch(configJsonFile)
            .then(r => r.json())
            .then((def: StageDefinition) => setTheStage(def));
    }

    p5.draw = () => {
        bg.draw();
        if(settingTheStage){
            p5.textAlign(p5.CENTER, p5.CENTER);
            p5.textSize(50);
            p5.textFont("sans-serif");
            p5.text(loadingText,p5.width/2, p5.height/2);
            return;
        }
        update();
        bubbles.forEach(function(b){ b.draw(); });
        p5.touches.forEach(touch => {
            let t: XY = touch as XY;
            p5.noStroke();
            p5.fill(touchColor);
            p5.ellipse(t.x, t.y, 200, 200);
        });
    }

    function update(){
        bg.update();
        bubbles.forEach(function(b){ b.updateRotation(); });
        if(!bubblesMoving){
            return;
        }
        bubbles.forEach(function(b){ b.updatePosition(); });
    }

    p5.touchStarted = () => {
        var lastTouch = p5.touches.slice().pop() as XY;
        if(!!lastTouch) {
            handlePointAction(p5.createVector(lastTouch.x, lastTouch.y));
        }
        return false; // This is to prevent pinch-zooming on touch devices.
    }

    p5.mousePressed = () => {
        handlePointAction(p5.createVector(p5.mouseX,p5.mouseY));
        return false;
    }

    function handlePointAction(point: P5.Vector) {
        let touchedBubble = bubbles.filter(b => b.containsPoint(point.x, point.y)).reverse()[0];
        if (!!touchedBubble) {
            touchedBubble.touched(touchedBubble === lastBubbleTouched);
            var index = bubbles.indexOf(touchedBubble);
            bubbles.splice(index, 1);
            bubbles.push(touchedBubble);
            touchedBubble.onceDoneSpinning(() => {
                //Early-drawn bubbles may be covered up partially by later-drawn bubbles.
                //When a bubble is touched it should move down to "z-index" 0, so to speak, so other bubbles may be better exposed to touch
                var index = bubbles.indexOf(touchedBubble);
                bubbles.splice(index, 1);
                bubbles.unshift(touchedBubble);
            });
            lastBubbleTouched = touchedBubble;
        } else if (bubblesMoving) {
            bubbles.forEach(b => b.impactFrom(point))
        }
    }

    p5.keyPressed = () => {
        //console.log('key:', p5.key, 'keyCode:', p5.keyCode);
        if (p5.key == 'N' || p5.key == 'n') {
            bubbles.forEach(b => b.vel = b.vel.normalize());
        }
        if (p5.key == 'R' || p5.key == 'r') {
            bubbles.forEach(b => b.rot = 0);
        }
        if (p5.keyCode == 187 /* + */ && unusedBubbles.length > 0) {
            bubbles.push(unusedBubbles.shift()!);
            arrangements.getCurrent().apply(bubbles);
        }
        if (p5.keyCode == 189 /* - */ && bubbles.length > 0) {
            unusedBubbles.unshift(bubbles.pop()!);
            arrangements.getCurrent().apply(bubbles);
        }
        let boostFactor = 1.1;
        if (p5.keyCode == p5.ESCAPE) {
            bubblesMoving = !bubblesMoving;
        }
        if (p5.keyCode == p5.ENTER) {
            p5.fullscreen(!p5.fullscreen());
        }
        if (p5.keyCode == p5.LEFT_ARROW) {
            arrangements.prev().apply(bubbles);
        }
        if (p5.keyCode == p5.RIGHT_ARROW) {
            arrangements.next().apply(bubbles);
        }
        if (p5.keyCode == p5.DOWN_ARROW) {
            bubbles.forEach(function (b) { b.vel = b.vel.div(boostFactor); })
        }
        if (p5.keyCode == p5.UP_ARROW) {
            bubbles.forEach(function (b) { b.vel = b.vel.mult(boostFactor); })
        }
        if (p5.keyCode == p5.DOWN_ARROW) {
            bubbles.forEach(function (b) { b.vel = b.vel.div(boostFactor); })
        }
    }

    p5.windowResized = () => {
        p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    }
}

export default getSketch;