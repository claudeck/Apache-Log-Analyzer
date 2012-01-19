使用Buffer替代Lazy空值单行读取。

rs = fs.createreadstream

var buf = new buffer();

rs.on('data'){
  buf = chuck
}