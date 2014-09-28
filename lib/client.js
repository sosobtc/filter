var hasProp = {}.hasOwnProperty
  , slice = [].slice;
var net = require('net');

var client
  , connected = false;

var Callbacks = {}
  , register = function(name, fn){
      Callbacks[name] = function(){
        delete Callbacks[name];
        return fn.apply(null, arguments);
      };
    }
  , load = function(name){
      var fn = Callbacks[name];
      return 'function' == typeof fn 
        && fn.apply(null, slice.call(arguments, 1));
    };

(function conn(){
  client = net.connect(8928, '127.0.0.1');
  
  client.on('error', function(err){
    connected = false;
    setTimeout(conn, 50);
  });
  
  client.on('connect', function(){
    console.log('connected');
    connected = true;
  });
  
  client.on('data', function(data){
    var ret;
    data = data.toString('utf-8');
    var i = 0, len = data.length, sentence = [], c;
    while(i < len){
      c = data[i];
      if(c === '\0'){
        sentence = JSON.parse(sentence.join(''));
        for(var prop in sentence){
          if(!hasProp.call(sentence, prop))
            continue;
          load(prop, sentence[prop]);
        }
        sentence = [];
      }else{
        sentence.push(c);
      }
      i++;
    }
  });
})();

exports = module.exports = function check(text, callback){
  
  register(text, callback);
  
  if(connected && client){
    client.write(text + '\0');
  }else{
    load(text, []);
  }
};

