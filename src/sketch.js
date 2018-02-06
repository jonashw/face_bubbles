
/*jshint esversion: 6 */
var bubbles = [];
var unusedBubbles = [];
var backgrounds = [];
var bg;
var playing = false;
var touchColor;
var arrangements = [];
var currentArrangement;
function setup() {
  colorMode(HSL, 255, 255, 255, 100);
  touchColor = color(0,0,0,50);
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
  var mildVelocity = function(v){
    return v.normalize().mult(0.5);
  };
  ellipseMode(CENTER);
  unusedBubbles = [
    new Bubble(loadImage("../assets/mama1.png"),
      [
        //"mama-hello-1.wav",
        //"mama-hello-2.wav",
        "mama-by-papa.wav",
        "mama-hi-1.wav",
        //"mama-hi-2.wav",
        //"mama-i-love-you.wav",
        "mama-buh-bye.wav"
      ].map(fn => loadSound("../assets/sounds/" + fn)),
      color(238,255,148),
      mildVelocity(createVector(2,2))),
    new Bubble(loadImage("../assets/papa1.png"),
      [
        "papa-by-papa.wav",
        "papa-hi-1.wav",
        "papa-buh-bye-1.wav"
      ].map(fn => loadSound("../assets/sounds/" + fn)),
      color(102,55,148),
      mildVelocity(createVector(2,-2))),
    new Bubble(
      loadImage("../assets/sawyer1.png"),
      [
        loadSound("../assets/sounds/sawyer-by-papa.wav"),
        loadSound("../assets/sounds/voice-prompts-greetings-greetings-child-boy-hi-human-voice-speaking-2.mp3"),
        loadSound("../assets/sounds/other-human-girl-laughs-4-times-faster-and-higher-nightingale-music-productions-12449.mp3"),
        loadSound("../assets/sounds/voice-prompts-pain-pain-child-girl-ouch-human-voice.mp3")
      ],
      color(170,255,148),
      mildVelocity(createVector(4,0))),
    new Bubble(loadImage("../assets/fetus1.png"),
      [
        loadSound("../assets/sounds/baby-by-papa.wav"),
        loadSound("../assets/sounds/fetus-1.wav")
      ],
      color(43,255,148),
      mildVelocity(createVector(-1.5,2.5))),
    new Bubble(loadImage("../assets/maizy1.png"),
      [
        loadSound("../assets/sounds/maizy-by-papa.wav"),
        loadSound("../assets/sounds/domestic-animals-dog-bark-jackrussel-chihuahua-fienup-008.mp3"),
        //loadSound("../assets/sounds/speech-girl-says-huh-as-if-unsure-higher-nightingale-music-productions-12446.mp3")
      ],
      color(43,255,148),
      mildVelocity(createVector(3,1))),
    new Bubble(loadImage("../assets/cooper1.png"),
      [
        loadSound("../assets/sounds/cooper-by-papa.wav"),
        loadSound("../assets/sounds/dogs-dog-bark-springer-spaniel-1.mp3")
      ],
      color(43,255,148),
      mildVelocity(createVector(-1.5,2.5))),
    new Bubble(loadImage("../assets/pasta1.png"),
      [loadSound("../assets/sounds/pasta-1.wav")],
      color(43,255,148),
      mildVelocity(createVector(-1.5,2.5)),
      w),
    new Bubble(loadImage("../assets/water3.png"),
      [loadSound("../assets/sounds/water-1.wav")],
      color(43,255,148),
      mildVelocity(createVector(-1.5,2.5))),
    new Bubble(loadImage("../assets/salsa2.png"),
      [loadSound("../assets/sounds/salsa-1.wav")],
      color(43,255,148),
      mildVelocity(createVector(-1.5,2.5)),
      w),
    new Bubble(loadImage("../assets/gorilla1.png"),
      [loadSound("../assets/sounds/gorilla-by-papa.wav")],
      color(43,255,148),
      mildVelocity(createVector(-1.5,2.5))),
    new Bubble(loadImage("../assets/monkey1.png"),
      [
        loadSound("../assets/sounds/monkey-by-papa.wav"),
      ],
      color(43,255,148),
      mildVelocity(createVector(-1.5,2.5))),
    new Bubble(loadImage("../assets/elephant1.png"),
      [loadSound("../assets/sounds/elephant-by-papa.wav")],
      color(43,255,148),
      mildVelocity(createVector(-1.5,2.5)),
      w),
    new Bubble(loadImage("../assets/koala1.png"),
      [loadSound("../assets/sounds/koala-by-papa.wav")],
      color(43,255,148),
      mildVelocity(createVector(-1.5,2.5))),
    new Bubble(loadImage("../assets/turtle1.png"),
      [loadSound("../assets/sounds/turtle-by-papa.wav")],
      color(43,255,148),
      mildVelocity(createVector(-1.5,2.5))),
    new Bubble(loadImage("../assets/lion1.png"),
      [loadSound("../assets/sounds/lion-by-papa.wav")],
      color(43,255,148),
      mildVelocity(createVector(-1.5,2.5)))
    ];

  bubbles = [];
  for(var i=0; i<6; i++){
    bubbles.push(unusedBubbles.shift());
  }

  arrangements = [
    (count, size) => {
      let r = size/2;
      let xOffset = Math.floor((width  - size)/Math.max(count - 1, 1));
      let yOffset = Math.floor((height - size)/Math.max(count - 1, 1));
      return range(0,count).map(n => {
        let pos = createVector(
          n*xOffset + r,
          n*yOffset + r);
        //console.log(`width:${width}, height:${height}, r:${r}, pos.x:${pos.x}, pos.y:${pos.y}, bottom-right-corner.x:${pos.x + r}, bottom-right-corner.y:${pos.y + r}`);
        return pos;
      });
    },
    (count,size) => {
      let r = size/2;
      var dx = Math.floor((width  - size)/Math.max(count - 1, 1));
      var dy = Math.floor((height - size)/Math.max(count - 1, 1));
      var xs = range(0,count).map(n => n*dx + r);
      var ys = range(count-1,0).map(n => n*dy + r);
      return zipWith(xs, ys, createVector);
    },
    (count,size) => {
      return chevronArrangement(count,size,true);
    },
    (count,size) => {
      return chevronArrangement(count,size,false);
    },
    (count, size) => {
      let rowConfigurations = [
        [],
        [1],
        [2],
        [3],
        [2,2],
        [3,2],
        [3,3],
        [2,3,2],
        [3,2,3],
        [3,3,3],
        [3,4,3],
        [4,3,4],
        [4,4,4],
        [4,5,4],
        [5,4,5],
        [5,5,5]
      ];
      // Important: It is assumed that `count` will be between 0 and 15!
      let rowConfig = rowConfigurations[count];
      let yOffset = Math.floor(height/(rowConfig.length + 1));
      let positions = [];
      rowConfig.forEach((rowSize,rowIndex) => {
        let y = yOffset * (rowIndex + 1);
        let xOffset = Math.floor(width/(rowSize + 1));
        for(var xIndex=1; xIndex <= rowSize; xIndex++){
          let x = xOffset * xIndex;
          positions.push(createVector(x,y));
        }
      });
      return positions;
    }
  ];
  currentArrangement = arrangements[4];
  applyArrangement(currentArrangement);

  function chevronArrangement(count,size,positive){
    var dx = Math.floor((width  - size)/Math.max(count - 1, 1));
    let r = size / 2;
    var w = width - size;
    var h = height - size;
    var xs = range(0,count).map(n => n*dx + r);
    var half = Math.floor(count / 2);
    var rows = count % 2 == 0 ? half : half + 1;
    var dy = Math.floor((height - size)/Math.max(rows - 1, 1));
    var _ys1 = range(0,half).map(n => {
      var yy = n * dy + r;
      return positive ? yy : height - yy;
    });
    var _ys2 = _ys1.slice(0,-1).reverse();
    if(count % 2 == 0){
      _ys1.pop();
    }
    var ys = Array.prototype.concat.call([], _ys1, _ys2);
    return zipWith(xs, ys, createVector);
  }
}

function applyArrangement(arrangement){
  zip(
    bubbles,
    arrangement(
      bubbles.length,
      Bubble.diameter()))
  .forEach(pair => {
    pair[0].pos = pair[1];
  });
}

function draw() {
  update();
  bg.draw();
  bubbles.forEach(function(b){ b.draw(); });
  touches.forEach(t => {
    noStroke();
    fill(touchColor);
    ellipse(t.x, t.y, 200, 200);
  });
}

function update(){
  bg.update();
  bubbles.forEach(function(b){ b.updateRotation(); });
  if(!playing){
    return;
  }
  bubbles.forEach(function(b){ b.updatePosition(); });
}

function touchStarted(){
  var lastTouch = touches.slice().pop();
  handlePointAction(createVector(lastTouch.x, lastTouch.y));
  return false; // This is to prevent pinch-zooming on touch devices.
}

function mousePressed(){
  handlePointAction(createVector(mouseX,mouseY));
  return false;
}

function handlePointAction(point){
  let touchedBubble = bubbles.filter(b => b.containsPoint(point.x,point.y)).reverse()[0];
  if(!!touchedBubble)
  {
    touchedBubble.touched();
    var index = bubbles.indexOf(touchedBubble);
    bubbles.splice(index,1);
    bubbles.push(touchedBubble);
    touchedBubble.onceDoneSpinning(() => {
      //Early-drawn bubbles may be covered up partially by later-drawn bubbles.
      //When a bubble is touched it should move down to "z-index" 0, so to speak, so other bubbles may be better exposed to touch
      var index = bubbles.indexOf(touchedBubble);
      bubbles.splice(index,1);
      bubbles.unshift(touchedBubble);
    });
  } else if(playing) {
    bubbles.forEach(b => b.impactFrom(point))
  }
}

function keyPressed(){
  let arrangementIndex = parseInt(key);
  if(!isNaN(arrangementIndex)){
    if(arrangementIndex < arrangements.length){
      currentArrangement = arrangements[arrangementIndex];
      applyArrangement(currentArrangement);
    }
  }
  console.log('key:',key, 'keyCode:', keyCode);
  if(key == 'N'){
    bubbles.forEach(b => b.vel = b.vel.normalize());
  }
  if(key == 'R'){
    bubbles.forEach(b => b.rot = 0);
  }
  if(keyCode == 187 /* + */ && unusedBubbles.length > 0){
    bubbles.push(unusedBubbles.shift());
    applyArrangement(currentArrangement);
  }
  if(keyCode == 189 /* - */ && bubbles.length > 0){
    unusedBubbles.unshift(bubbles.pop());
    applyArrangement(currentArrangement);
  }
  let boostFactor = 1.25;
  if(keyCode == ESCAPE){
    playing = !playing;
  }
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