var net = require('net');

/**
 * 定义一个服务器单例对象
 */
var server = exports = module.exports = {
  settings: {}
};

/**
 * 设置服务器配置，将配置写入settings
 * 或者获取服务器配置
 * @param setting
 * @param val
 */
server.set = function(setting, val){
  if (1 == arguments.length) {
    return this.settings[setting];
  } else {
    this.settings[setting] = val;
    return this;
  }
};

/**
 * 获取服务器配置
 * @param setting
 */
server.get = function(setting){
  return this.set(setting);
};

/**
 * socket链接处理函数
 * @param socket
 */
server.handle = function(socket){
  
};

/**
 * 开启服务器监听
 * @param port 端口
 * @param address 地址
 * @param callback 回调函数
 */
server.listen = function(){
  var srv = net.createServer(this);
  return srv.listen.apply(srv, arguments);
};


