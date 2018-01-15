var _bounceSnd;
function Bubble(img,snd,strokeColor,pos,vel,w){
  this.img = img;
  this.snd = snd;
  this.pos = pos;
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

  this.mouseClicked = function(){
      this.snd.setVolume(0.3);
      this.snd.play();
      this.spinning = true;
  };

  this.mouseIsOver = function(){
    return dist(this.pos.x, this.pos.y, mouseX, mouseY) <= this.w/2;
  };

  this.update = function(){
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
    this.bounce();
  };

  function playBounceSound(){
      _bounceSnd.setVolume(0.05);
      _bounceSnd.play();
  }

  this.bounce = function(){
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