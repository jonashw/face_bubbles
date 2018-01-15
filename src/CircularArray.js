function CircularArray(_items)
{
    let _index = 0;
    this.count = _items.length;
    this.getCurrent = function(){
      return _items[_index];
    }
    this.next = function(){
        _index += 1;
        if (_index >= _items.length)
        {
            _index -= _items.length;
        }
        return this.getCurrent();
    }
    this.prev = function(){
        _index -= 1;
        if (_index < 0)
        {
            _index = _items.Length - 1;
        }
        return this.getCurrent();
    }
}