function Background(colors){
  let _backgrounds = new CircularArray(colors);
  let _from = _backgrounds.getCurrent();
  let _to = _backgrounds.next();
  let _pct = 0;
  let _state = 'ready';

  this.update = function(){
    switch(_state){

      case 'transitioning':
        _pct += 0.01;
        if(_pct >= 1){
          _state = 'ready';
          _pct = 1;
        }
        break;
        
      case 'ready':
        _state = 'sleeping';
        setTimeout(function(){
          _pct = 0;
          _from = _backgrounds.getCurrent();
          _to = _backgrounds.next();
          _state = 'transitioning';
        }, 5000)
        break;

      case 'sleeping':
        break;
    }
  };

  this.draw = function(){
    background(lerpColor(_from, _to, _pct));
  };
}