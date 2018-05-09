/*
*
*Author: Fuxiaoke
*Create Time: 2018-04-02 13:01
*
*/
let nodemailer = require('nodemailer')
function getIPAdress(){
    var interfaces = require('os').networkInterfaces();
    for(var devName in interfaces){
        var iface = interfaces[devName];
        for(var i=0;i<iface.length;i++){
            var alias = iface[i];
            if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
                console.log(alias.address) ;
                sendmail(`你的树莓派的ip地址是：${alias.address}`,alias.address)
                return
            }
        }
    }
}

//邮件配置
let smtpConfig = {
    host: 'smtp.qq.com',
    port: 465,
    auth: {
        user: '864927512@qq.com',
        pass: 'dnutlajhvyasbffj'
    }
};
let transporter = nodemailer.createTransport(smtpConfig);
let sendmail = function(html, sub, toSomebody = '864927512@qq.com', cc = '',files) {
    let option = {
        from: "864927512@qq.com",
        to: toSomebody,
        cc: cc,
        subject: sub,
        html: html,
        attachments:files
    }
    transporter.sendMail(option, function(error, response) {
        if (error) {
            console.log("fail: " + error);
        } else {
            console.log("success: " + response);
        }
    });
}


getIPAdress()