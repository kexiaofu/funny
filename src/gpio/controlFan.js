const Gpio = require('/data/node-gpio/node_modules/rpio2/lib/index.js').Gpio;
var gpio = new Gpio(36);
let fs = require('fs');
var gpio36 = new Gpio(36);
gpio36.open(Gpio.OUTPUT, Gpio.LOW);
let Temp=0
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
                Temp = ~~(+buf.slice(0, bytes).toString()/1000)
                if(Temp >40){
                    gpio36.write(1)
                }else if(Temp <36){
                    gpio36.write(0)
                }
            }
        });
    })
},5000)
