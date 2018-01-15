
/*jshint esversion: 6 */
var bubbles = [];
var backgrounds = [];
var bg;
function setup() {
  colorMode(HSL, 255, 255, 255, 100);
  bg = new Background([
      color(0,0,50),
      color(102,55,148),
      color(170,255,148),
      color(238,255,148),
      color(43,255,148)
  ]);
  angleMode(DEGREES);
  createCanvas(windowWidth, windowHeight);
  var w = 150;
  var p = 100;
  Bubble.setup();
  bubbles = [
    new Bubble(
      loadImage("../assets/sawyer1.png"),
      loadSound("../assets/sounds/voice-prompts-greetings-greetings-child-boy-hi-human-voice-speaking-2.mp3"),
      color(170,255,148),
      createVector(width/2,height/2),
      createVector(4,0),
      w),
    new Bubble(loadImage("../assets/mama1.png"),
      loadSound("../assets/sounds/voice-prompts-female-voice-human-voice-clip-female-young-woman-hello-short.mp3"),
      color(238,255,148),
      createVector(p,p),
      createVector(2,2),
      w),
    new Bubble(loadImage("../assets/papa1.png"),
      loadSound("../assets/sounds/voice-prompts-greetings-greetings-male-hi-happy-human-voice-speaking.mp3"),
      color(102,55,148),
      createVector(width-p,p),
      createVector(2,-2),
      w),
    new Bubble(loadImage("../assets/maizy1.png"),
      loadSound("../assets/sounds/domestic-animals-dog-bark-jackrussel-chihuahua-fienup-008.mp3"),
      color(43,255,148),
      createVector(p,height-p),
      createVector(3,1),
      w),
    new Bubble(loadImage("../assets/cooper1.png"),
      loadSound("../assets/sounds/dogs-dog-bark-springer-spaniel-1.mp3"),
      color(43,255,148),
      createVector(width-p,height-p),
      createVector(-1.5,2.5),
      w)
    ];
}

function draw() {
  update();
  bg.draw();
  bubbles.forEach(function(b){ b.draw(); });
}

function update(){
  bg.update();
  bubbles.forEach(function(b){ b.update(); });
}

function mouseClicked(){
  bubbles.forEach(b => {
    if(b.mouseIsOver()){
      b.mouseClicked();
    }
  });
}

function keyPressed(){
  let boostFactor = 1.25;
  if(keyCode == ENTER){
    fullscreen(!fullscreen());
  }
  if(keyCode == UP_ARROW){
    bubbles.forEach(function(b){ b.vel = b.vel.mult(boostFactor); })
  }
  if(keyCode == DOWN_ARROW){
    bubbles.forEach(function(b){ b.vel = b.vel.div(boostFactor); })
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}