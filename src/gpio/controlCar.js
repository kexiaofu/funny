let express = require('express'),
    path = require('path'),
    app = express();

const Gpio = require('/data/node-gpio/node_modules/rpio2/lib/index.js').Gpio;
//const GpioGroup = require('/data/node-gpio/node_modules/rpio2/lib/index.js').GpioGroup;
var gpio35 = new Gpio(35);  //创建 P35 引脚
var gpio36 = new Gpio(36);  //创建 P36 引脚
var gpio37 = new Gpio(37);  //创建 P37 引脚
var gpio38 = new Gpio(38);  //创建 P38 引脚
//var gpioGroup1 = new GpioGroup([35,38],true)

////gpioGroup1.open(GpioGroup.OUTPUT);
gpio35.open(Gpio.OUTPUT, Gpio.LOW);
gpio36.open(Gpio.OUTPUT, Gpio.LOW);
gpio37.open(Gpio.OUTPUT, Gpio.LOW);
gpio38.open(Gpio.OUTPUT, Gpio.LOW);

app.get('/go',(req,res)=>{
    console.log('go')
    gpio35.write(0)
    gpio36.write(1)
    gpio37.write(1)
    gpio38.write(0)
    //gpioGroup1.value = 0
    gpio
    res.send('ok-go')
})

app.get('/back',(req,res)=>{
    console.log('back')
    gpio35.write(1)
    gpio36.write(0)
    gpio37.write(0)
    gpio38.write(1)
    //gpioGroup1.value = 1

    res.send('ok-back')
})

app.get('/left',(req,res)=>{
    console.log('left')
    gpio35.write(0)
    gpio36.write(0)
    gpio37.write(1)
    gpio38.write(0)
    //gpioGroup1.value = 0
    res.send('ok-left')
})

app.get('/right',(req,res)=>{
    console.log('right')
    gpio35.write(0)
    gpio36.write(1)
    gpio37.write(0)
    gpio38.write(0)
    //gpioGroup1.value = 0
    res.send('ok-right')
})

app.get('/stop',(req,res)=>{
    console.log('stop')
    res.send('ok-stop')
    gpio35.write(0)
    gpio36.write(0)
    gpio37.write(0)
    gpio38.write(0)
    //gpioGroup1.value = 0



})
//gpio.open(Gpio.OUTPUT, Gpio.HIGH);
app.listen(8085)
console.log('had listen 8085')