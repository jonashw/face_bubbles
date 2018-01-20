
/*jshint esversion: 6 */
var bubbles = [];
var backgrounds = [];
var bg;
function setup() {
  colorMode(HSL, 255, 255, 255, 100);
  bg = new Background((() => {
    var _hues = [];
    for(var h=0;h<256;h++){
      _hues.push(color(h,255,148));
    }
    return _hues;
  })());
  angleMode(DEGREES);
  createCanvas(windowWidth, windowHeight);
  var w = 150;
  var p = 100;
  Bubble.setup();
  bubbles = [
    new Bubble(
      loadImage("../assets/sawyer1.png"),
      [
        loadSound("../assets/sounds/voice-prompts-greetings-greetings-child-boy-hi-human-voice-speaking-2.mp3"),
        loadSound("../assets/sounds/other-human-girl-laughs-4-times-faster-and-higher-nightingale-music-productions-12449.mp3"),
        loadSound("../assets/sounds/voice-prompts-pain-pain-child-girl-ouch-human-voice.mp3")
      ],
      color(170,255,148),
      createVector(width/2,height/2),
      createVector(4,0),
      w),
    new Bubble(loadImage("../assets/mama1.png"),
      [
        //"mama-hello-1.wav",
        //"mama-hello-2.wav",
        "mama-hi-1.wav",
        //"mama-hi-2.wav",
        //"mama-i-love-you.wav",
        "mama-buh-bye.wav"
      ].map(fn => loadSound("../assets/sounds/" + fn)),
      color(238,255,148),
      createVector(p,p),
      createVector(2,2),
      w),
    new Bubble(loadImage("../assets/papa1.png"),
      [
        "papa-hi-1.wav",
        "papa-buh-bye-1.wav"
      ].map(fn => loadSound("../assets/sounds/" + fn)),
      color(102,55,148),
      createVector(width-p,p),
      createVector(2,-2),
      w),
    new Bubble(loadImage("../assets/maizy1.png"),
      [
        loadSound("../assets/sounds/domestic-animals-dog-bark-jackrussel-chihuahua-fienup-008.mp3"),
        //loadSound("../assets/sounds/speech-girl-says-huh-as-if-unsure-higher-nightingale-music-productions-12446.mp3")
      ],
      color(43,255,148),
      createVector(p,height-p),
      createVector(3,1),
      w),
    new Bubble(loadImage("../assets/cooper1.png"),
      [loadSound("../assets/sounds/dogs-dog-bark-springer-spaniel-1.mp3")],
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
  let clickedBubbles = bubbles.filter(b => b.mouseIsOver());
  if(clickedBubbles.length > 0)
  {
    clickedBubbles.forEach(b => b.mouseClicked());
  } else {
    //canvas clicked.  let's do something that affects all bubbles.
    let v = createVector(mouseX,mouseY);
    bubbles.forEach(b => b.impactFrom(v))
    console.log('Canvas clicked');
  }
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