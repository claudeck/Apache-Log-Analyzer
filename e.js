var url =require('url');
var util = require('util');

console.log(util.inspect(url.parse('http://localhost:3000/search?a=1&b=2&a=2')));