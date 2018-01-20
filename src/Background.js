function Background(colors){
  let _colors = new CircularArray(colors);

  this.update = function(){
    _colors.next();
  };

  this.draw = function(){
    background(_colors.getCurrent());
  };
}