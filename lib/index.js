var extend = require('utils-merge')
  , proto = require('./server')
  , net = require('net')
  , fs = require('fs')
  , path = require('path')
  , readline = require('readline')
  , stream = require('stream')
  , Dict = require('../dict')
  , dict = new Dict('dirty');

/**
 * exports `createServer`
 */
exports = module.exports = createServer;

/**
 * 生成一个服务器，并返回引用
 * @returns {Function}
 */
function createServer(){
  
  var srv = function(socket){
    srv.handle(socket);
  };
  
  extend(srv, proto);
  
  extend(srv, {
    handle: handle,
    loadDict: loadDict
  });
  
  return srv;
}

/**
 * socket链接的处理函数
 * @param socket
 */
function handle(socket){
  socket.on('data', function(data){
    var ret;
    data = data.toString('utf-8');
    var i = 0, len = data.length, sentence = [], c;
    while(i < len){
      c = data[i];
      if(c === '\0'){
        sentence = sentence.join('');
        ret = {};
        ret[sentence] = dict.match(sentence);
        if(ret[sentence].length){
          console.log(ret);
        }
        socket.write(new Buffer(JSON.stringify(ret) + '\0', 'utf-8'), 'utf-8');
        sentence = [];
      }else{
        sentence.push(c);
      }
      i++;
    }
  });
  
  socket.on('error', function(err){
    return ;
  });
}

/**
 * 遍历目录获取以`.txt`为后缀名的文件路径
 * @param dir 需要遍历的目录
 * @param done 回调函数
 */
var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          /\.txt$/.test(file) && results.push(file);
          next();
        }
      });
    })();
  });
};

/**
 * 加载字典
 * 启动服务器前需要先加载字典
 * @param dir
 * @param callback
 */
function loadDict(dir, callback){
  
  if('function' === typeof dir){
    // 字典默认加载路径
    callback = dir;
    dir = path.join(__dirname, '../words');
  }
  
  walk(dir, function done(err, files){
    var len = files.length
      , i = 0;
    files.forEach(function(file){
      var instream = fs.createReadStream(file);
      var rl = readline.createInterface({
        input: instream,
        terminal: false
      });
      
      rl.on('line', function(line) {
        dict.insert(line);
      });
      
      rl.on('close', function() {
        if(++i === len){
          dict.build();
          callback(dict);
        }
      });
    });
  });
};
