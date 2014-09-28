sc-filter
======

基于AC_SC算法的中文过滤程序

## Installation

    $ npm install sc-filter

## Usage

```js
var dict = require('sc-filter');

dict.insert('模式1');
dict.insert('模式2');
dict.insert('模式3');

dict.build();

console.log(dict.match('模式匹配，模式2将被匹配'));

```




