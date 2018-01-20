var _bounceSnd;
function Bubble(img,sounds,strokeColor,vel,w){
  this.img = img;
  this.snd = new CircularArray(sounds);
  this.pos = createVector(0,0);
  this.vel = vel;
  this.rot = 0;
  this.w = w;
  this.spinning = false;

  this.draw = function(){
    push();
    noFill();
    translate(this.pos.x, this.pos.y);
    rotate(this.rot);
    strokeWeight(7);
    stroke(strokeColor);
    //position refers to the CENTER of the bubble.
    let s = this.spinning ? this.w * 1.5 : this.w;
    image(this.img, -s/2, -s/2, s, s);
    ellipse(0, 0, s, s);
    pop();
  };
  
  let _activate = function(){
    let s = this.snd.getCurrent();
    s.setVolume(0.3);
    s.play();
    this.spinning = true;
    this.snd.next();
  };

  this.touchStarted = _activate.bind(this);
  this.mouseClicked = _activate.bind(this);

  let funFactor = 200000;
  this.impactFrom = function(impactPos){
    let impactOffset = p5.Vector.sub(impactPos, this.pos);
    let d = impactOffset.mag();
    let intensity = 1 / (d * d); //Source: https://www.nde-ed.org/EducationResources/CommunityCollege/Radiography/Physics/inversesquare.htm
    let deltaV = impactOffset.normalize().mult(intensity * funFactor);
    let inverse = createVector(-deltaV.x, -deltaV.y);
    this.vel = p5.Vector.add(this.vel, inverse);
  };

  this.mouseIsOver = function(){
    return dist(this.pos.x, this.pos.y, mouseX, mouseY) <= this.w/2;
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
    if(this.spinning){
      this.rot += 10;
      if(this.rot >= 360){
        this.rot = 0;
        this.spinning = false;
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