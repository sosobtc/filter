var hasProp = {}.hasOwnProperty
  , slice = [].slice;
var net = require('net')
  , extend = require('utils-merge');

var Callbacks = {}
  , once = function(name, fn){
      Callbacks[name] = function(){
        delete Callbacks[name];
        return fn.apply(null, arguments);
      };
    }
  , fire = function(name){
      var fn = Callbacks[name];
      return 'function' == typeof fn 
        && fn.apply(null, slice.call(arguments, 1));
    };

/**
 * client对象原型
 */
var Proto = {
  settings: {
    reconn: 50
  },
  readyList: [],
  isready: false,
  isconnected: false,
  
  set: function(setting, val){
    if (1 == arguments.length) {
      return this.settings[setting];
    } else {
      this.settings[setting] = val;
      return this;
    }
  },
  
  get: function(setting){
    return this.set(setting);
  },
  
  ready: function(fn){
    var readyList = this.readyList;
    if(readyList.indexOf(fn) === -1){
      readyList.push(fn);
    }
  },
  
  connect: function(){
    var self = this
      , reconn = self.settings.reconn
      , _cli = net.connect.apply(this, arguments);
    
    self.cli = _cli;
    
    _cli.on('error', function(err){
      self.isconnected = false;
      _cli.destroy();
      'function' === typeof self.onerror &&
          self.onerror.call(self, err);
      if('number' === typeof reconn){
        setTimeout(function(){
          self.connect(reconn);
        }, reconn);
      }
    }).on('connect', function(){
      self.isconnected = true;
      'function' === typeof self.onconnect &&
          self.onconnect.call(self);
    }).once('connect', function(){
      if(self.isready === true)
        return false;
      self.isready = true;
      
      self.readyList.forEach(function(fn){
        'function' === typeof fn &&
          fn.call(self);
      });

    }).on('data', function(data){
      'function' === typeof self.ondata &&
          self.ondata.call(self, data);
    });
    
    return self;
  },
  
  close: function(){
    return this.cli.destroy();
  }
};
    
exports = module.exports = createClient;

function createClient (){
  var cli = {};
  
  extend(cli, Proto);
  
  extend(cli, {
    ondata: ondata,
    onerror: onerror,
    onconnect: onconnect,
    match: match
  });
  
  return cli;
}

function onerror(err){
//  console.log(err);
}

function onconnect(){
//  console.log('connected');
}

function ondata(data){
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
        fire(prop, sentence[prop]);
      }
      sentence = [];
    }else{
      sentence.push(c);
    }
    i++;
  }
}

function match(text, callback){
  var cli = this.cli;
  
  once(text, callback);
  
  if(this.isconnected && cli){
    cli.write(text + '\0');
  }else{
    fire(text, []);
  }
};

