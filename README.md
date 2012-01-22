Apache日志分析系统是本人用来练习Node.JS的小程序。UI使用了bootstrap，用户上传apache日志文件(使用socket.io做上传进度显示)后，通过kue放入任务调度队列。任务执行时对日志进行分析，将500错误的日志解析成记录保存到solr中进行全文检索。

使用了
# node.js
# redis
# solr
# expressjs
# jade
# socket.io
# kue
# ...


