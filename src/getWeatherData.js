
const nodemailer = require('nodemailer');
const phantom = require('phantom');//导入模块
//async解决回调问题,es7的内容
 let result = []
 let getNews = async function() {
  // await解决回调问题，创建一个phantom实例
  const instance = await phantom.create();
  //通过phantom实例创建一个page对象，page对象可以理解成一个对页面发起请求和处理结果这一集合的对象
  const page = await instance.createPage();
  const userAgent = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36`
  page.setting("userAgent", userAgent)
  //页面指向的是哪个一个url
  await page.on("onResourceRequested", function(requestData) {
    console.info('Requesting', requestData.url)
  });
  //得到打开该页面的状态码
  const status = await page.open('https://www.google.com.hk/search?q=bitcoin+weed&safe=strict&tbas=0&tbs=cdr:1,cd_min:1/1/2017,cd_max:1/3/2018&tbm=nws&ei=5qq7WqrvAcG-jwO1gZfQDw&start=0&sa=N&biw=1089&bih=949&dpr=1');
  console.log(status);
  result = []
  result = await page.evaluate(function(){
    var count = 1,title=$('.t'),titles=[],ititle=null,offsetTitle;
      var offset = $('.c-offset .c-row')
      for(var j=0,l=offset.length-1;j<=l;j++){
        offsetTitle = offset.eq(j).find('a')
        titles.push({
          title:offsetTitle[0].innerText,
          href:offsetTitle[0].getAttribute('href')
        })
      }
      for(var i=0,len=title.length-1;i<=len;i++){
        ititle = title.eq(i).find('a')
        titles.push({
          title:ititle[0].innerText,
          href:ititle[0].getAttribute('href'),
          hasOffset:title.eq(i).hasClass('c-offset')
        })
      }

      return titles
  })
  await page.on('consoleMessage',function(msg){
    console.log('-----------------',msg)
  })
  console.log(result.length)

  //退出该phantom实例
  await instance.exit();
}

getNews().then(()=>{
   //console.log(result)
  if(result.length >0){
     let xpNews = ''
     for(let i=0,len=result.length;i<len;i++){
       xpNews += `百度第${i+1}条消息：<a href="${result[i].href}">${result[i].title}</a><br/>`
     }
    console.log(xpNews)
    sendmail(xpNews,'小鹏汽车百度关键词第一页消息','864927512@qq.com','864927512@qq.com')
  }
})

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
//https://www.google.com.hk/search?q=bitcoin+weed&safe=strict&tbas=0&biw=1366&bih=672&source=lnt&tbs=cdr%3A1%2Ccd_min%3A1%2F1%2F2017%2Ccd_max%3A1%2F3%2F2018&tbm=nws
//https://www.google.com.hk/search?q=bitcoin+weed&safe=strict&tbas=0&tbs=cdr:1,cd_min:1/1/2017,cd_max:1/3/2018&tbm=nws&ei=5qq7WqrvAcG-jwO1gZfQDw&start=0&sa=N&biw=1089&bih=949&dpr=1