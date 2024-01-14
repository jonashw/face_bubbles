export function range(from: number, to: number): number[] {
  return from < to
    ? _range(from,to)
    : _range(to,from).reverse();
  function _range(from: number, to: number){
    var numbers = [];
    for(var n=from; n<=to; n++){
      numbers.push(n);
    }
    return numbers;
  }
}

export function zip<A,B>(array1:A[], array2:B[]): [A,B][]{
  var pairs = [];
  for(var i=0; i<array1.length && i<array2.length; i++){
    pairs.push([array1[i], array2[i]] as [A,B])
  }
  return pairs;
}

export function zipWith<A,B,C>(array1: A[], array2: B[], fn: (a: A, b:B) => C): C[] {
  var pairs = [];
  for(var i=0; i<array1.length && i<array2.length; i++){
    pairs.push(fn(array1[i], array2[i]));
  }
  return pairs;
}