let fs = require('fs');
setInterval(()=>{
    fs.open('/sys/class/thermal/thermal_zone0/temp','r',(err,fd)=>{
        if(err){
            return console.log(err)
        }
        let buf = new Buffer(1024);
        fs.read(fd, buf, 0, buf.length, 0, function(err, bytes){
            if (err){
                console.log(err);
            }
            console.log(bytes + "  字节被读取");

            // 仅输出读取的字节
            if(bytes > 0){
                console.log(buf.slice(0, bytes).toString())
            }
        });
    })
},5000)
