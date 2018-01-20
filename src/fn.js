function range(from,to){
  return from < to
    ? _range(from,to)
    : _range(to,from).reverse();
  function _range(from,to){
    var numbers = [];
    for(var n=from; n<=to; n++){
      numbers.push(n);
    }
    return numbers;
  }
}

function zip(array1, array2){
  var pairs = [];
  for(var i=0; i<array1.length && i<array2.length; i++){
    pairs.push([array1[i], array2[i]])
  }
  return pairs;
}

function zipWith(array1, array2, fn){
  var pairs = [];
  for(var i=0; i<array1.length && i<array2.length; i++){
    pairs.push(fn(array1[i], array2[i]));
  }
  return pairs;
}