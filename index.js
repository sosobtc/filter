exports.dictServer = function(){
  return require('./lib');
};

exports.client = function(){
  return require('./lib/client');
};

exports.dict = require('./dict');