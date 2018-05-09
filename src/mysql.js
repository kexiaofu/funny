var mysql      = require('mysql');
var pool = mysql.createPool({
  host     : 'qdm165430365.my3w.com',
  user     : 'qdm165430365',
  password : '817822ke',
  database : 'qdm165430365_db',
  insecureAuth:true
});

var query=function(sql,callback){
    pool.getConnection(function(err,conn){
        if(err){
            callback(err,null,null);
        }else{
            conn.query(sql,function(qerr,vals,fields){
                //释放连接
                conn.release();
                //事件驱动回调
                callback(qerr,vals,fields);
            });
        }
    });
};

module.exports=query;