/* 
 * Created by FuxiaoKe on 2018 / 2 / 1
 */
let axios = require('axios'),
    nodemailer = require('nodemailer'),
    weathers = {},
  nowHour = 0
setInterval(() => {
  let D = new Date(),
    h = D.getHours(),
    s = D.getSeconds();
  if ((h === 0 || h === 6 || h === 12 || h === 18) && nowHour !== h) {
    weathers = {}
    axios.get('https://weixin.jirengu.com/weather/now?cityid=WS0E9D8WN298')
      .then(res => {
        console.log(res.data)
        if (res.data.status === 'OK') {
          nowHour = h
          weathers = res.data.weather[0].now
          sendmail(`么么哒！<br/>
            天气内容：<br/>
            天气：${weathers.text},<br/>
            温度：${weathers.temperature} 度,<br/>
            湿度：${weathers.humidity}%,<br/>
            风向：${weathers.wind_direction},<br/>
            风速：${weathers.wind_speed},<br/>
            风级：${weathers.wind_scale}级`, '亲爱的自己，天气预报来了！');
        } else {
          sendmail(`请求出了问题，赶紧处理吧！</br>
                ${res.data.msg}`, '你的天气预报程序请求数据出错啦！');
        }
      }).catch(error => {

        sendmail(`请求出了问题，赶紧处理吧！</br>
                ${error}`, '你的天气预报程序请求数据出错啦！');
      })
  }
}, 10000)

var smtpConfig = {
  host: 'smtp.qq.com',
  port: 465,
  auth: {
    user: '864927512@qq.com',
    pass: 'dnutlajhvyasbffj'
  }
};
var transporter = nodemailer.createTransport(smtpConfig);
var sendmail = function(html, sub, toSomebody = '864927512@qq.com', cc = '') {
  var option = {
    from: "864927512@qq.com",
    to: toSomebody,
    cc: cc,
    subject: sub,
    html: html
  }
  transporter.sendMail(option, function(error, response) {
    if (error) {
      console.log("fail: " + error);
    } else {
      console.log("success: " + response);
    }
  });
}