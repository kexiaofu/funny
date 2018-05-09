const Gpio = require('/data/node-gpio/node_modules/rpio2/lib/index.js').Gpio;
var gpio = new Gpio(36);  //创建 P36 引脚
let fs = require('fs');
/*led.open(Gpio.OUTPUT, Gpio.LOW); //设置为 OUTPUT、默认低电平

for(var i = 0; i < 10; i++){
    led.toggle();  //切换 led 的电平状态
    console.log(i)
    led.sleep(1000);  //等待 500ms
}

led.close();*/

gpio.open(Gpio.OUTPUT, Gpio.HIGH);
//for(var i = 0; i < 1000; i++){
let i=0
//gpio.open(Gpio.OUTPUT)
while(true){
    //gpio.toggle();
    gpio.open(Gpio.OUTPUT, Gpio.LOW);

    //console.log(i++)
    //gpio.sleep(10);
}
    //gpio.toggle();
    //console.log(i)
    //gpio.sleep(1000);
//}


/*setInterval(()=>{
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
},5000)*/


gpio.close();