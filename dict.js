/**
 * 生成一个节点
 * @param char
 * @returns {object} node
 */
function Node(char){
  return {
    c: char,
    n: null,
    f: 0,
    o: ''
  };
}

/**
 * 查找指定字符在列表中的位置
 * @param list
 * @param char
 * @returns int
 */
function indexOf(list, char){
  var i = 0
    , len = list.length;
  for(; i < len && list[i].c !== char; i++);
  return i < len ? i : -1;
}

/**
 * export 整个`Dict`对象
 */
exports = module.exports = Dict;

/**
 * Dict构造函数
 * @param name 字典名称
 * @param hash_len hash表的长度
 * @returns
 */
function Dict(name, hash_len){
  this.name = name || '';
  this.hash_len = hash_len || 256;
  this.init();
}

/**
 * 初始化Dict
 */
Dict.prototype.init = function(){
  this.dict = [];
  // 初始化hash表
  this.dict[0] = new Array(this.hash_len);
};

/**
 * 插入单个pattern字符串
 * @param pattern
 */
Dict.prototype.insert = function(pattern){
  if(!pattern || 'string' !== typeof pattern){
    return false;
  }
  var i = 0
    , len = pattern.length
    , hash_len = this.hash_len
    , char
    , node
    , pre_node = null
    , hash_index
    , idx
    , hash_table = this.dict[0]
    , hash_list
    , list;
  
  for(; i < len; i++){
    char = pattern[i].toLowerCase();
    node = Node(char);
    
    if(i == 0){
      // 首个字符
      // 计算hash值
      hash_index = char.charCodeAt(0) % hash_len;
      hash_list = hash_table[hash_index];
      
      if(!hash_list){
        // 需要初始化该链表
        hash_list = [];
        hash_table[hash_index] = hash_list;
      }
      
      if((idx = indexOf(hash_list, char)) === -1){
        // 还没有存在于hash表
        hash_list.push(node);
      }else{
        node = hash_list[idx];
      }
      
    }else{
      // 新增
      // 当前状态 index
      var index = pre_node.n || this.dict.length;
      list = this.dict[index];
      if(!list){
        // 初始化该链表
        list = [];
        this.dict[index] = list;
      }
      
      if((idx = indexOf(list, char)) === -1){
        // 没有存在
        list.push(node);
      }else{
        node = list[idx];
      }
      pre_node.n = index;
    }
    pre_node = node;
  }
  node.o = pattern;
  
  i = len = char = node = pre_node = hash_index = idx = hash_table = hash_list = list = null;
};

/**
 * 匹配模式
 * @param str
 * @returns {Array}
 */
Dict.prototype.match = function(str){
  var dict = this.dict
    , cur = 0
    , i = 0
    , char
    , node
    , pre_node
    , len = str.length
    , ret = [];
  
  
  for(; i < len; i++){
    char = str[i].toLowerCase();
    
    if(pre_node){
      node = this.__goto(pre_node.n, char) ||
              this.__goto(pre_node.f, char);
    }else{
      node = this.__goto(cur, char);
    }
    
    if(!node && cur !== 0){
      node = this.__goto(cur = 0, char);
    }
    
    if(node && node.o){
      ret.push([i - node.o.length + 1, node.o]);
      if(node.o.length != 1 && node.c !== pre_node.c){
        // 继续匹配
        i--;
      }
    }
    pre_node = node;
    cur = node && (node.n || node.f);
  }
  
  dict = cur = i = char = node = pre_node = len = null;
  
  return ret;
};

/**
 * 构建各个节点的failure函数
 */
Dict.prototype.build = function(){
  var self = this
    , dict = this.dict
    , cur = 0
    , i = 0
    , j
    , idx
    , char
    , hash_table = dict[0]
    , list
    , next_list
    , node
    , pre_node = null
    , len1 = hash_table.length
    , len2;
  
  for(; i < len1; i++){
    if(!(list = hash_table[i]))
      continue;
    for(pre_node = null, j = 0, len2 = list.length; j < len2; j++){
      node = list[j];
      
      if(node.n){
        _build_list(node, dict[node.n]);
      }
    }
  }
  
  self = dict = cur = i = j = idx = char = hash_table = list = next_list = node = pre_node = len1 = len2 = null;
  
  function _build_list(pre_node, list){
    if(!list || list.length < 1)
      return false;
    for(var node, i = 0, len = list.length; i < len; i++){
      node = list[i];
      node.f = self.__goto(pre_node && pre_node.f || 0, node.c).n || 0;
      
      if(node.n){
        _build_list(node, dict[node.n]);
      }
    }
  }
};

/**
 * 字典的goto函数，根据当前状态和输入字符
 * 判断下一个状态
 * 该函数会返回下一个状态具体的节点
 * @param cur
 * @param char
 * @returns {Node}
 */
Dict.prototype.__goto = function(cur, char){
  var dict = this.dict
    , hash_index
    , hash_len = this.hash_len
    , idx
    , node = Node(char)
    , hash_list
    , list;
  
  // 当前状态为0，即是hash点
  if(cur == 0){
    // 首个字符
    // 计算hash值
    hash_index = char.charCodeAt(0) % hash_len;
    hash_list = dict[0][hash_index];
    
    if(!hash_list || (idx = indexOf(hash_list, char)) === -1){
      // 还没有存在于hash表
      return false;
    }else{
      node = hash_list[idx];
    }
  }else{
    list = dict[cur];
    
    if(!list || (idx = indexOf(list, char)) === -1){
      // 没有存在
      return false;
    }else{
      node = list[idx];
    }
  }
  
  dict = hash_index = idx = hash_list = list = null;
  
  return node;
};
