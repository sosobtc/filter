sc-filter
======

基于AC_SC算法的中文过滤程序

## Installation

    $ npm install sc-filter

## Usage

直接调用API，同步返回结果

每次调用都需要初始化字典并插入模式

```js
var dict = require('sc-filter').dict();

dict.insert('模式1');
dict.insert('模式2');
dict.insert('模式3');

dict.build();

console.log(dict.match('模式匹配，模式2将被匹配'));

```

作为网络服务器运行

编辑文件server.js
```js
var server = require('sc-filter').createServer();
  
server.set('port', 8928);
server.set('addr', '127.0.0.1');

server.loadDict(function loaded(){
  server.listen(server.get('port'), server.get('addr'), function(){
    console.log('dict server is listening on ' + server.get('addr') + ':' + server.get('port'));
  });
});

```

开启服务

    $ node server.js

编辑应用文件app.js
```js
var cli = require('sc-filter').createClient();

cli.set('port', 8928);
cli.set('addr', '127.0.0.1');

cli.ready(function(){
  this.match('需要匹配模式的句子', function(m){
    console.log(m);
  });
});

cli.connect(cli.get('port'), cli.get('addr'));

```

运行app.js

    $ node app.js
