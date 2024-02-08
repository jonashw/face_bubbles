import P5 from "p5";
import { P5CanvasInstance} from "@p5-wrapper/react";
import { Background } from "../Background";
import Bubble from "../Bubble";
import getArrangements, { gridArrangment } from "../Arrangement";
import * as Sound from "../Sound";
import { StageDefinition } from "../StageDefinition";
import { createArrowImage } from "../createArrowImage";
import { Gravity } from "../Gravity";
import { ImmutableObservable, MutableObservable } from "../Observable";
import ImmutableVector from "../ImmutableVector";

const getSketch = (configJsonFile: string) => (p5: P5CanvasInstance) => {
    const gravity = new Gravity();
    const canvasSize = new MutableObservable(new ImmutableVector(p5.width, p5.height));
    const gravityIndicatorSize = 50;

    let gravityArrowImage = 
        ImmutableObservable.react(
            gravity.value,
            g => createArrowImage(p5, gravityIndicatorSize, gravity.maximumMagnitude, g, 'red'));

    const gravityArrowPositions = 
        ImmutableObservable.react2(
            canvasSize, gravityArrowImage,
            (s,img) => gridArrangment(p5, s.x, s.y, img.width, img.height));

    var settingTheStage = true;
    var bubbles: Bubble[] = [];
    var unusedBubbles: Bubble[] = [];
    var bg: Background;
    var bubblesMoving = true;
    var touchColor: P5.Color;
    var lastBubbleTouched: Bubble | undefined = undefined;
    var debug = false;

    var arrangements = getArrangements(p5);

    function loadImage(url: string): Promise<P5.Image>{
        return new Promise(resolve => {
            p5.loadImage(url,img => resolve(img));
        });
    }

    function setTheStage(def: StageDefinition){
        Promise.all(def.bubbles.map(async (bd) => {
            return new Bubble(
                p5,
                bd.name,
                await loadImage("/assets/img/" + bd.img),
                await Promise.all(bd.sounds.map(fn => Sound.loadSound(fn, def.defaultVoice))),
                p5.color(bd.color[0], bd.color[1], bd.color[2]),
                p5.createVector(
                    (Math.random() > 0.5 ? -1 : 1) * Math.random(),
                    (Math.random() > 0.5 ? -1 : 1) * Math.random()).mult(1/10)
            );
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
            console.log({bubbles});
            arrangements.current.apply(bubbles);
        });
        Sound.loadSound("bounce.mp3").then(s => Bubble.setup(s));
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
        canvasSize.update(_ => new ImmutableVector(p5.windowWidth, p5.windowHeight));
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
            p5.text("LOADING",p5.width/2, p5.height/2);
            return;
        }
        p5.push();
        p5.blendMode(p5.DIFFERENCE);
        for(let pos of gravityArrowPositions.current){
            p5.image(gravityArrowImage.current, pos.x, pos.y);
        }
        
        p5.pop();
        update();
        bubbles.forEach(function(b){ b.draw(debug); });
        p5.touches.forEach(touch => {
            let t: any = touch as any;
            p5.noStroke();
            p5.fill(touchColor);
            p5.ellipse(t.x, t.y, 200, 200);
        });
    }

    if (window.DeviceOrientationEvent) {
        window.addEventListener("deviceorientation", (e: DeviceOrientationEvent) => {
            //console.log("deviceorientation",e.alpha?.toFixed(1), e.beta?.toFixed(1), e.gamma?.toFixed(1));
            //alpha: z-axis: [0,360): ie. rotate the phone while sitting face-up on table
            //beta: x-axis: [-180,180): ie. tilt the phone front to back (and upside down)
            //gamma: y-axis [-90,90): ie. tilt the phone left, right

            let zRotation: number = roundTowardsZero(e.alpha || 0);
            Bubble.commonRotation = zRotation;

            let xTiltStep = roundTowardsZero(
                p5.map(e.gamma || 0,
                    -20, 20,
                    -gravity.stepCount, gravity.stepCount, true));

            let yTiltStep = roundTowardsZero(
                p5.map(e.beta || 0,
                    -10, 10,
                    -gravity.stepCount, gravity.stepCount, true));
            
            if(xTiltStep != gravity.xStep.current){
                gravity.xStep.update(_ => xTiltStep);
            }
            if(yTiltStep != gravity.yStep.current){
                gravity.yStep.update(_ => yTiltStep);
            }
        }, true);
    }

    const roundTowardsZero = (n: number) =>
        n < 0 ? Math.ceil(n) : Math.floor(n);
    function update(){
        bg.update();
        for(let b of bubbles){
            b.updateRotation();
        }
        if(!bubblesMoving){
            return;
        }
        for(let b of bubbles){
            b.updatePosition(); 
            var againstLeft = Math.abs(b.pos.x - Bubble.outerDiameter/2) < 1;
            var againstRight = Math.abs(b.pos.x + Bubble.outerDiameter/2 - p5.width) < 1;
            var againstXEdge = (againstLeft || againstRight);
            var againstTop = Math.abs(b.pos.y - Bubble.outerDiameter/2) < 1;
            var againstBottom = Math.abs(b.pos.y + Bubble.outerDiameter/2 - p5.height) < 1;
            var againstYEdge = (againstTop || againstBottom);
            var notReallyMovingX = Math.abs(b.vel.x) < 0.1;
            var movingSomewhatX = !notReallyMovingX;
            var notReallyMovingY = Math.abs(b.vel.y) < 0.1;
            var movingSomewhatY = !notReallyMovingY;
            if(!againstXEdge && movingSomewhatX){
                //
            }
            b.vel.x += gravity.displayValue.current.x;
            if(!againstYEdge && movingSomewhatY){
                //
            }
            b.vel.y += gravity.displayValue.current.y;
        }
    }

    p5.touchStarted = () => {
        var lastTouch = p5.touches.slice().pop() as any;
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
            console.log({touchedBubble});
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
        if (p5.key.toLowerCase() == 'g') {
            gravity.reset();
        }
        if(p5.key == 'd'){
            debug = !debug;
        }
        if(p5.key == 'a'){
            arrangements.current.apply(bubbles);
        }
        if (p5.key == 'N' || p5.key == 'n') {
            bubbles.forEach(b => b.vel = b.vel.normalize());
        }
        if (p5.key == 'R' || p5.key == 'r') {
            bubbles.forEach(b => b.rot = 0);
        }
        if (p5.keyCode == 187 /* + */ && unusedBubbles.length > 0) {
            bubbles.push(unusedBubbles.shift()!);
            arrangements.current.apply(bubbles);
        }
        if (p5.keyCode == 189 /* - */ && bubbles.length > 0) {
            unusedBubbles.unshift(bubbles.pop()!);
            arrangements.current.apply(bubbles);
        }
        if (p5.keyCode == p5.ESCAPE) {
            bubblesMoving = !bubblesMoving;
        }
        if (p5.key === ' ') {
            bubblesMoving = !bubblesMoving;
        }
        if (p5.keyCode == p5.ENTER) {
            p5.fullscreen(!p5.fullscreen());
        }
        switch(p5.keyCode){
            case p5.   UP_ARROW: gravity.yStep.update(ys => ys-1); break;
            case p5. DOWN_ARROW: gravity.yStep.update(ys => ys+1); break;
            case p5. LEFT_ARROW: gravity.xStep.update(xs => xs-1); break;
            case p5.RIGHT_ARROW: gravity.xStep.update(xs => xs+1); break;
        }
        if(p5.key === '0'){
            gravity.reset();
        }
    }

    p5.windowResized = () => {
        p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
        canvasSize.update(_ => new ImmutableVector(p5.width, p5.height));
        if(!bubblesMoving){
            arrangements.current.apply(bubbles);
        }
    }

    p5.setShakeThreshold(30);

    let shakeHasCooledDown = true;
    const shakeCoolDownMS = 500;
    p5.deviceShaken = () => {
        if(!shakeHasCooledDown){
            return;
        }
        shakeHasCooledDown = false;
        //bubblesMoving = !bubblesMoving;
        bubbles.forEach(b => b.vel = b.vel.normalize());
        arrangements.current.apply(bubbles);
        setTimeout(() => shakeHasCooledDown = true, shakeCoolDownMS);
    };
}

export default getSketch;