var _bounceSnd;
function Bubble(img,sounds,strokeColor,vel,w){
  this.img = img;
  this.snd = new CircularArray(sounds);
  this.pos = createVector(0,0);
  this.vel = vel;
  this.rot = 0;
  this.w = w;
  this.spinPositive = true;

  var _doneSpinningListeners = [];
  this.onceDoneSpinning = function(callback){
    _doneSpinningListeners = [callback];
  }
  sounds.forEach(s => s.onended(donePlayingSound.bind(this)));

  this.draw = function(){
    push();
    noFill();
    translate(this.pos.x, this.pos.y);
    rotate(this.rot);
    strokeWeight(7);
    stroke(strokeColor);
    //position refers to the CENTER of the bubble.
    let s = this.snd.getCurrent().isPlaying() ? this.w * 1.5 : this.w;
    image(this.img, -s/2, -s/2, s, s);
    ellipse(0, 0, s, s);
    pop();
  };
  
  let _activate = function(){
    let s = this.snd.getCurrent();
    if(keyIsDown(SHIFT)){
      s.reverseBuffer();
      this.spinPositive = !this.spinPositive;
    } 
    if(s.isPlaying()){
      this.rot = 0;
      s.stop();
    }
    s.setVolume(0.3);
    s.play();
  };

  function donePlayingSound(){
    console.log('done playing sound');
    _doneSpinningListeners.forEach(l => l());
    _doneSpinningListeners.splice(0);
  }

  this.touchStarted = _activate.bind(this);
  this.touched = _activate.bind(this);


  this.impactFrom = function(impactPos){
    let funFactor = 20000;
    let impactOffset = p5.Vector.sub(impactPos, this.pos);
    let d = impactOffset.mag();
    let intensity = 1 / (d * d); //Source: https://www.nde-ed.org/EducationResources/CommunityCollege/Radiography/Physics/inversesquare.htm
    let deltaV = impactOffset.normalize().mult(intensity * funFactor);
    let inverse = createVector(-deltaV.x, -deltaV.y);
    this.vel = p5.Vector.add(this.vel, inverse);
  };

  this.containsPoint = function(x,y){
    return dist(this.pos.x, this.pos.y, x, y) <= this.w/2;
  };

  this.update = function(){
    this.updateRotation();
    this.updatePosition();
  };

  this.updateRotation = function(){
    if(keyIsDown(LEFT_ARROW)){
      this.rot -= 5;
    }
    if(keyIsDown(RIGHT_ARROW)){
      this.rot += 5;
    }
    if(this.snd.getCurrent().isPlaying()){
      if(this.spinPositive){
        this.rot += 10;
      } else {
        this.rot -= 10;
      }
      if(this.rot >= 360){
        this.rot = this.rot % 360;
      } else if (this.rot < 0) {
        this.rot += 360;
      }
      if(this.rot == 0){
      }
    }
  };

  function playBounceSound(){
      _bounceSnd.setVolume(0.05);
      _bounceSnd.play();
  }

  this.updatePosition = function(){
    let c = keyIsDown(32 /* SPACE */) ? 0.25 : 1;

    this.pos.x += this.vel.x * c;
    let xOver = this.pos.x + this.w/2 - width;
    if(xOver > 0){
      this.vel.x = -this.vel.x;
      this.pos.x -= (xOver + 1);
      playBounceSound()
    } else {
      let xUnder = this.pos.x - this.w/2;
      if(xUnder < 0){
        this.vel.x = -this.vel.x;
        this.pos.x -= (xUnder - 1);
        playBounceSound()
      }
    }

    this.pos.y += this.vel.y * c;
    let yOver = this.pos.y + this.w/2 - height;
    if(yOver >= 0){
      this.vel.y = -this.vel.y;
      this.pos.y -= (yOver + 1);
      playBounceSound()
    } else {
      let yUnder = this.pos.y - this.w/2;
      if(yUnder < 0){
        this.vel.y = -this.vel.y;
        this.pos.y -= (yUnder - 1);
        playBounceSound()
      }
    }
  };
}

Bubble.setup = function(){
  _bounceSnd = loadSound("../assets/sounds/impactcrash-basketball-bounce-wood-surface-thud-blastwavefx-29503.mp3");
}

function BubbleState(){}