/**
 * Created by FuxiaoKe on 2018/2/23.
 */
let  nodemailer = require('nodemailer'),
     fs = require('fs'),
     axios = require('axios'),
     async = require('async'),
     myMd5 = require('./myMd5'),
     dateFormat= require('./dateFormat'),
     express = require('express'),
     path = require('path'),
     bodyParser = require('body-parser'),
     app = express(),
     query = require('./mysql'),
     cheerio = require('cheerio');

let bookSource = ['https://www.ymoxuan.com','https://www.xxbiquge.com'],
    bookSearchSource = ['http://www.ymoxuan.com/search.htm?keyword=','https://www.xxbiquge.com/search.php?keyword='],
    nowSource = 0,
    reqBoosArr=[],
    isDownloading=false,
    md5Key = myMd5({
      runDate:dateFormat(new Date(),'yyyymmdd','HHmmdd','')
    },dateFormat(new Date(),'yyyymmdd','HHmmdd',''),true),
    axiosHeader = {
        'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        ,'Accept-Encoding':'gzip, deflate, br'
        ,'Accept-Language':'zh-CN,zh;q=0.8'
        ,'Connection':'keep-alive'
        ,'Cookie':'UM_distinctid=161dced7be3277-0e752d4a2d84f1-4a541326-1fa400-161dced7be538; ' +
        'CNZZDATA1261710401=1968291298-1519824934-%7C1519824934; ras=121616; cids_AC5=121616; ' +
        'Hm_lvt_1a9198c3e677b37553bfcb256c8565ff=1519830007,1520094306,1520142028; Hm_lpvt_1a9198c3e677b37553bfcb256c8565ff=1520146713',
        'Host':'www.ymoxuan.com'
        ,'Upgrade-Insecure-Requests':1
        ,'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 UBrowser/6.2.3964.2 Safari/537.36'
        }

/*axios.get('http://www.ymoxuan.com')
    .then(res=>{
      console.log(res)
    })
    .catch(error=>{
      console.log(error)
    })
return*/
//搜索
let searchKeyWord = (name,mail) =>{
    let url =encodeURI(bookSearchSource[nowSource]+name)
    axios.get(url,{headers:axiosHeader})
        .then(res=>{
            let $ = cheerio.load(res.data,{decodeEntities: false}),
                aList = $('a'),
                re = new RegExp(name, "g"),
                hasHref=false;

            console.log(aList.length)
            for(let i=aList.length-1;i>=0;i--){
                console.log(aList[i].children[0].data)
                if(aList[i].children[0].data!==undefined && aList[i].children[0].data === name && aList[i].attribs.href.indexOf('search.htm')<0){
                    console.log(aList[i].attribs.href)
                    hasHref = true
                    let href  =aList[i].attribs.href
                    href.indexOf('https')<0&&(href = 'https:'+href )
                    console.log(href)
                    toNovelChaptersPage(href,name,mail)
                    break;
                }
            }

            if(!hasHref){
                for(let i=aList.length-1;i>=0;i--){
                    if(aList[i].hasOwnProperty('attribs')&&aList[i].attribs.title !== undefined && aList[i].attribs.title.match(re)!==null ){
                        console.log(aList[i].attribs.href)
                        hasHref = true
                        toNovelChapterListPage(aList[i].attribs.href,name,mail)
                        break;
                    }
                }
            }
            if(!hasHref && nowSource < bookSearchSource.length-1){
                nowSource++
                console.log('尝试从第'+nowSource+'个网站寻找')
                searchKeyWord(name,mail);
                return
            }

            if(!hasHref){
                console.log('找不到小说！')
                if(mail !== ''){
                    sendmail(`<h2>小说-${name},发生了一些错误,可能你需要再次下载,或者寻找其他途径下载,抱歉!</h2>`,`小说${name},下载出错了!`,mail,'',{})
                }
                isDownloading = false
                reqBoosArr.shift()
                return
            }

        })
        .catch(error=>{
            console.log(error)
            if(mail !== ''){
                sendmail(`<h2>小说-${name},发生了一些错误,可能你需要再次下载,或者寻找其他途径下载,抱歉!</h2>`,`小说${name},下载出错了!`,mail,'',{})
            }
            isDownloading = false
            reqBoosArr.shift()
            return
        })
}

//跳转小说章节页面
let toNovelChaptersPage=(url,name,mail)=>{
  axios.get(url,{headers:axiosHeader})
      .then(res=>{
        let $ = cheerio.load(res.data),
            aList = $('a')
        for(let i=aList.length-1;i>=0;i--){
          if(typeof aList[i].children[0].data !== 'undefined' && aList[i].children[0].data.match('章节列表') !== null){
            console.log(aList[i].attribs.href)
              let href  =aList[i].attribs.href
              href.indexOf('https')<0&&(href = 'https:'+href )
              console.log(href)
            toNovelChapterListPage(href,name,mail)
            break;
          }
        }
        //console.log(aList[31])
      })
      .catch(error=>{
        console.log(error)
      })
}

//跳转小说章节列表页面
let toNovelChapterListPage = (url,name,mail) =>{
  axios.get(url,{headers:axiosHeader})
      .then(res=>{
        let $ = cheerio.load(res.data),
            aList = $('a'),
            chapterList = [],
            chapterIndex=0,
            href=''
        for(let i=0,len=aList.length;i<len;i++){
          //console.log(aList[i].children[0].data.split(' ')[0].indexOf('第')>-1,aList[i].attribs.href)
          if(typeof aList[i].children[0].data !== 'undefined' && aList[i].children[0].data.split(' ')[0].indexOf('第')>-1){
            console.log(aList[i].children[0].data,aList[i].attribs.href)
            href = aList[i].attribs.href
              href =nowSource !==0 ? (href.indexOf(bookSource[nowSource]) >-1?href:bookSource[nowSource]+href):href
              href.indexOf('https')<0&&(href = 'https:'+href )
            chapterList.push({
              index:chapterIndex++,
              title:aList[i].children[0].data,
              href:href
            })
            //break;
          }
        }
        console.log('共'+chapterList.length+'章')
        setTimeout(()=>{
          toChapter(chapterList,name,mail)
        },2000)
      })
      .catch(error=>{
        console.log(error)
      })
}

//跳转具体小说章节
let toChapter = (urlArr,name,mail)=>{
  async.mapLimit(urlArr, 8, function(url,callback) {
    setTimeout(()=>{
      axios.get(url.href,{headers:axiosHeader})
          .then(res=>{
            if(res.status === 200){
              let $ = cheerio.load(res.data),
                  content = $('#content')
              console.log(url.title,url.href)
                //setTimeout(()=>{
                    callback(null,'\r\n'+url.title+'\r\n'+content.text().replace(/(\s)/g,'\r\n'))
                //},500)

            }else{
                //setTimeout(()=>{
                    callback(null,'')
                //},500)
            }
          })
          .catch(error=>{
            console.log(error)
              callback(null,'')
          })
    },4000)
  }, (err, results) => {
      console.log(err,results.length)
    if (err) {
          console.log(err)
    }
    // results is now an array of the response bodies
    console.log(results.length)
    fs.writeFile('novels/'+name+'.txt',results,{flag:'a'},error=>{
      if(error){
        return console.log(error)
      }
      console.log('写入成功')
        isDownloading = false
        reqBoosArr.shift()
      let latestChapter = urlArr[urlArr.length-1].title
        /*query("insert novels(name,latestChapter,downloadTime) values('"+name+"','"+latestChapter+"',1)",(err,val,fields)=>{
          if(err){
            return console.log(err)
          }
          console.log(val)
          if(val.affectedRows >0){
            console.log('insert success')
          }

        })*/
        if(mail !== ''){
          sendmail(`<h2>小说-${name},请查收</h2>`,`你想要下载的小说${name},请查收`,mail,'',{
            filename:name+'.txt',
            path:'novels/'+name+'.txt'
          })
        }
    })
  })
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
        fs.unlink(files.path, function(err) {
            if (err) {
                return console.error(err);
            }
            console.log("文件删除成功！");
        });
    }
  });
}

let startCheckoutReqBook = ()=>{
    setInterval(()=>{
        if(reqBoosArr.length >0){
            //先查询reqBoosArr数组里有没有已经下载的书了,有可以即刻返回,没有就要等待下载
            console.log('------------正在下载'+reqBoosArr[0].name)
            if(!isDownloading){
                isDownloading = true
                searchKeyWord(reqBoosArr[0].name,reqBoosArr[0].mail)
            }
        }
    },10000)
}

startCheckoutReqBook()

//searchKeyWord('超级神掠夺')
app.use(express.static(path.join(__dirname,'/')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/',(req,res)=>{
    res.send('./web-novels/index.html')
})
app.post('/novels/search',(req,res)=>{
    console.log(req.body)
  let name = req.body.name,
      email = req.body.email
    /*query('select name,latestChapter from novels where name="'+name+'"',(error,val,fields)=>{
      if(error){
        console.log(error)
      }
      console.log(val)
      if(val.length === 0){
        reqBoosArr.push({
          name:name,
          mail:req.body.email
        })
        res.send({code:2020,desc:'正在下载,请稍后'})
      }else{
        res.send({
          code:2000,
          desc:'请下载',
          result:{
            url:encodeURI('/novels/download'),
            title:name,
            key:myMd5({
              date:new Date().getTime()
            },md5Key,false)
          }
        })
      }
    })*/
    if(name !== undefined && email !== undefined){
        let hasOne = false
        for(let i = reqBoosArr.length -1;i>=0;i--){
            if(reqBoosArr[i].name === name && reqBoosArr[i].mail === email){
                hasOne = true
                break;
            }
        }
        if(!hasOne){
            reqBoosArr.push({
                name:name,
                mail:email
            })
        }

        res.send({code:2020,desc:'正在下载,请稍后'})
    }else{
        res.send({code:5005,desc:'发生了错误,没获取到小说名字或邮箱'})
    }


})
/*app.post('/novels/download/',(req,res)=>{
  console.log(req.body.key)
  let key = myMd5(req.body.key,md5Key,false,true),
      dateIndex = key.indexOf('date'),
      name=req.body.name
  console.log(key)
  if(dateIndex>-1){
    date = Number(key.substring(dateIndex+4,17))
    console.log(date)
    let nowDate = new Date().getTime()
    if(nowDate-date > 60000){
      res.send({
        code:5004,
        desc:'请求超时，该链接已经失效了'
      })
    }else{
      console.log('进行下载')
      let filepath ='/novels/' + name+'.txt' ,filePath = path.join(__dirname, './novels/' + name+'.txt');
      let stats = fs.statSync(filePath);
      let isFile = stats.isFile();
      if(isFile){
        res.download(filePath)
        query("update novels set downloadTime =downloadTime+1 where name='"+name+"'",(err,val,fields)=>{
          if(err){
            return console.log(err)
          }
          console.log(val)
          if(val.affectedRows >0){
            console.log('下载数目+1')
          }
        })
        res.send({
          code:2000,
          desc:'可以下载啦',
          result:{
            path:filepath
          }
        })
      } else {
        res.end(404);
      }
    }

  }else{
    res.send({
      code:5003,
      desc:'请求出了一些问题，请再次请求'
    })
  }
})*/

//允许跨域访问
app.all('*', function(req, res, next) {
    console.log('允许跨域访问')
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With,content-type");
    res.header("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    if (req.method == 'OPTIONS') {
        console.log('跨域了')
        res.sendStatus(200); /*让options请求快速返回*/
    } else {
        next();
    }
});
app.listen(8088)


//myMd5(str,md5Key,false,true)



/*
* update `novels` set
 `id`=2,
 `name`='天王',
 `latestChapter`='第3000章 众生皆苦',
 `downloadTime`=1,
 `updateTime`='2018-03-02 14:52:54'
 where `id`=2
*
* */