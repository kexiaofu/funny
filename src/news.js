const fs = require('fs');//文件模块
const cheerio = require('cheerio');//解析爬来的数据，可以用jq方式操作数据
const axios = require('axios');//类似ajax请求的一个模块
const async = require('async');//异步操作模块
const phantom = require('phantom');//导入模块
//async解决回调问题,es7的内容
let searchUrl='https://www.google.com.hk/search?safe=strict&biw=1366&bih=662&tbs=cdr%3A1%2Ccd_min%3A1%2F1%2F2017%2Ccd_max%3A3%2F1%2F2018&tbm=nws&ei=7CbHWp2eLoiL0wL51omICw&q=blockchain+weed&oq=blockchain+weed&gs_l=psy-ab.3...11958.12670.0.13517.4.4.0.0.0.0.286.545.2-2.2.0....0...1c.1.64.psy-ab..2.1.286...0i19k1.0.MSJBgnd2WzA',
    result = [],
    urlArray=[],
    resultTitleArray=[],
    longTitleArray=[],
    bufLength=1024*1024*10,
    maxPageSize=30
//获取分页内的新闻具体方法
let getNews = async function(url) {
    console.log('---getNews---',url)
    // await解决回调问题，创建一个phantom实例
    let instance = await phantom.create();
    //通过phantom实例创建一个page对象，page对象可以理解成一个对页面发起请求和处理结果这一集合的对象
    let page = await instance.createPage();
    let userAgent = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36`
    page.setting("userAgent", userAgent)
    //页面指向的是哪个一个url
    await page.on("onResourceRequested", function(requestData) {
        //console.info('Requesting', requestData.url)
    });
    //得到打开该页面的状态码
    let status = await page.open(url);
    //console.log(status);
    let oresult = []
    oresult = await page.evaluate(function(){
        var title=document.querySelectorAll('.r'),dateEle=document.querySelectorAll('.fwzPFf'),titles=[]
        for(var i=0,len=title.length-1;i<=len;i++){
            ititle = title[i].querySelector('a')
            titles.push({
                title:ititle.innerText,
                date:dateEle[i].innerText,
                href:ititle.getAttribute('href')
            })
        }
        return titles
    })
    await page.on('consoleMessage',function(msg){
        console.log('-----------------',msg)
    })
    result.push.apply(result,oresult)
    console.log(result)

    //退出该phantom实例
    await instance.exit();
    return oresult
}
//获取分页的具体方法
let getNewsPageList = async (url)=>{
    console.log(url,'---------------------url------------------------');

    // await解决回调问题，创建一个phantom实例
    let instance = await phantom.create();
    //通过phantom实例创建一个page对象，page对象可以理解成一个对页面发起请求和处理结果这一集合的对象
    let page = await instance.createPage();
    let userAgent = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36`
    page.setting("userAgent", userAgent)
    //页面指向的是哪个一个url
    await page.on("onResourceRequested", function(requestData) {
        //console.info('Requesting', requestData.url)
    });
    //得到打开该页面的状态码
    let status = await page.open(url);
    let pageArray = []
    pageArray = await page.evaluate(function(){
        var pages=document.querySelectorAll('.fl'),pageList=[],pnnext = document.querySelector('#pnnext')
        for(var i=0,len=pages.length-1;i<=len;i++){
            if(pnnext === null){
                pageList.push({
                    index:pages[i].innerText,
                    url:'https://www.google.com.hk'+pages[i+1].getAttribute('href'),
                    hasNext:pnnext!==null?true:false
                })
                break;
            }
            if(pages[i].getAttribute('href') !== null){
                pageList.push({
                    index:pages[i].innerText,
                    url:'https://www.google.com.hk'+pages[i].getAttribute('href'),
                    hasNext:pnnext!==null?true:false
                })
            }
        }
        return pageList
    })
    await page.on('consoleMessage',function(msg){
        console.log('-----------------',msg)
    })
    //if()
    urlArray.push.apply(urlArray,pageArray)
    console.log(urlArray.length,'-------',urlArray[urlArray.length-1].hasNext)
    //退出该phantom实例
    await instance.exit();

}
//回调获取分页
let getPageList = (url)=>{
    fs.stat('newsJson.json',(err1,stat)=>{
        if(err1){
            fs.stat('newsPageListJson.json',(err,stat)=>{
                if(err){
                    console.log('没有这个文件！')
                    getNewsPageList(url)
                        .then(()=>{
                            console.log(urlArray.length,'------again-----')
                            if(urlArray[urlArray.length-1].hasNext){
                                getPageList(urlArray[urlArray.length-1].url)
                            }else{
                                console.log(urlArray)
                                let arr=[]
                                for(let i=0,len=urlArray.length;i<len;i++){
                                    arr[urlArray[i].index-0] = {
                                        index:urlArray[i].index-0,
                                        url:urlArray[i].url,
                                        hadSearch:false
                                    }
                                }
                                //console.log(arr)
                                urlArray = arr.slice(1)//第一项是多余项
                                console.log('分页数目是='+urlArray.length,'最大分页数='+maxPageSize)
                                if(urlArray.length > maxPageSize){
                                    urlArray = urlArray.slice(0,maxPageSize)
                                }
                                console.log('重置后的分页数目是='+urlArray.length)
                                fs.writeFile('newsPageListJson.json',JSON.stringify(urlArray),(err)=>{
                                    if(err){
                                        return console.log(err)
                                    }
                                    console.log('had get news page list')
                                    getNewsFromPage(urlArray)
                                })
                                //getNewsFromPage(urlArray)
                            }
                        })
                    return
                }
                console.log('had file')
                let buf = new Buffer(bufLength);
                fs.open('newsPageListJson.json','r+',(err,fd)=>{
                    if(err){
                        return console.log(err)
                    }
                    fs.read(fd, buf, 0, buf.length, 0, function(err, bytes){
                        if (err){
                            console.log(err);
                        }
                        console.log(bytes + "  字节被读取");

                        // 仅输出读取的字节
                        if(bytes > 0){
                            //console.log(buf.slice(0, bytes).toString());
                            urlArray = JSON.parse(buf.slice(0, bytes).toString())
                            console.log(urlArray)
                            getNewsFromPage(urlArray)
                        }
                    });
                })
            })
            return
        }
        console.log('已经有结果集了')
        getLongTitlePageList()
    })
}
//异步获取分页内新闻
let getNewsFromPage = (arr)=>{
    async.mapLimit(arr, 8, function(item,callback) {
        getNews(item.url).then((item)=>{
            console.log(item.length)
            callback(null,item)
        })
    },(err,results)=>{
        if(err){
            return console.log(err)
        }
        console.log(results.length)
        let res = []
        results.map(item=>{
            res.push.apply(res,item)
        })
        resultTitleArray = res
        fs.writeFile('newsJson.json',JSON.stringify(res),(err)=>{
            if(err){
                return console.log(err)
            }
            console.log('had get data')
            getLongTitlePageList()
        })
    })
    /*for(let i=0,len=arr.length;i<len;i++){
        console.log(i,arr[i].url)
        if(!arr[i].hadSearch){
            console.log('--------开始爬取页面'+(i+1)+'-------')
            getNews(arr[i].url).then(()=>{
                console.log('--------页面'+(i+1)+'爬取结束-------')
                console.log('----end----',arr[len-1].hadSearch)
                if(!arr[len-1].hadSearch){
                    getNewsFromPage(arr)
                }else{
                    fs.writeFile('newsJson.json',JSON.stringify(result),(err)=>{
                        if(err){
                            return console.log(err)
                        }
                        console.log('had get data')
                        getLongTitlePageList()
                    })
                }
            })
            arr[i].hadSearch = true
            arr.splice(i,1,arr[i])
            console.log(arr[i])
            break;
        }
    }*/

}
//获取个别新闻长标题的页面的集合
let getLongTitlePageList = ()=>{
    let buf = new Buffer(bufLength);
    fs.stat('newsLongTitleJson.json',(err1,stat)=>{
        if(err1){
            console.log('get long title now')
            let buf = new Buffer(bufLength);
            fs.open('newsJson.json','r+',(err,fd)=>{
                if(err){
                    return console.log(err)
                }
                fs.read(fd, buf, 0, buf.length, 0, function(err, bytes){
                    if (err){
                        console.log(err);
                    }
                    console.log(bytes + "  字节被读取");

                    // 仅输出读取的字节
                    if(bytes > 0){
                        //console.log(buf.slice(0, bytes).toString());
                        let oresource = JSON.parse(buf.slice(0, bytes).toString())
                        //console.log(oresource)
                        let longTitlePage = [],_index=0
                        oresource.map((item,index)=>{
                            console.log(item)
                            if(item.title.indexOf('...')>-1){
                                longTitlePage.push({
                                    originIndex:index,
                                    index:_index++,
                                    title:item.title,
                                    href:item.href,
                                    hadVisit:false
                                })
                            }
                        })
                        fs.writeFile('newsLongTitleJson.json',JSON.stringify(longTitlePage),(err)=>{
                            if(err){
                                return console.log(err)
                            }
                            console.log('had get long title data')
                            getLongTitlePageList()
                        })
                        console.log(longTitlePage)
                    }
                });
            })
            return
        }
        console.log('had get long title ')

        fs.open('newsLongTitleJson.json','r+',(err,fd)=>{
            fs.read(fd, buf, 0, buf.length, 0, function(err, bytes){
                if (err){
                    console.log(err);
                }
                console.log(bytes + "  字节被读取");

                // 仅输出读取的字节
                if(bytes > 0){
                    //console.log(buf.slice(0, bytes).toString());
                    longTitleArray = JSON.parse(buf.slice(0, bytes).toString())
                    console.log(longTitleArray)
                    getLongTitle(longTitleArray)

                }
            });
        })
    })
}
//异步操作获取集合内的新闻的长标题
let getLongTitle = (arr)=>{
    fs.stat('newsLongFullTitleJson.json',(err1,stat)=>{
        if(err1){
            async.mapLimit(arr, 8, function(item,callback) {
                visitLongTitlePageWithAxios(item).then(()=>{
                    callback(null,item)
                })
            },(err, results) => {
                if(err){
                    return console.log(err)
                }
                console.log(results)
                fs.writeFile('newsLongFullTitleJson.json',JSON.stringify(results),(err)=>{
                    if(err){
                        return console.log(err)
                    }
                    console.log('had get long full title data')
                    makeTheSave()
                })
            })
            return
        }
        let buf = new Buffer(bufLength);
        fs.open('newsLongFullTitleJson.json','r+',(err,fd)=>{
            if(err){
                return console.log(err)
            }
            fs.read(fd, buf, 0, buf.length, 0, function(err, bytes){
                if (err){
                    console.log(err);
                }
                console.log(bytes + "  字节被读取");

                // 仅输出读取的字节
                if(bytes > 0){
                    //console.log(buf.slice(0, bytes).toString());
                    longTitleArray = JSON.parse(buf.slice(0, bytes).toString())
                    //console.log(oresource)
                    makeTheSave()

                }
            });
        })
    })

}
//获取集合内的新闻的长标题具体方法
let visitLongTitlePageWithAxios = async (item)=>{
    await axios.get(item.href)
        .then(res=>{
            //console.log(res)
            let $ = cheerio.load(res.data)
            let title = $('h1').text().replace(/[\t\r\n]/g, "").replace(/(^\s*)|(\s*$)/g,'')
            console.log(title)
            longTitleArray[item.index].title =  title
            longTitleArray[item.index].hadVisit = true

        })
        .catch(err=>{
            console.log(err)
        })
}
//已经拿到完整的长标题的新闻，合并原来的，替换残缺的标题
let makeTheSave = ()=>{
    console.log(urlArray)
    if(resultTitleArray.length === 0){
        fs.open('newsJson.json','r+',(err,fd)=>{
            if(err){
                return console.log(err)
            }
            let buf = new Buffer(bufLength);
            fs.read(fd, buf, 0, buf.length, 0, function(err, bytes){
                if (err){
                    console.log(err);
                }
                console.log(bytes + "  字节被读取");

                // 仅输出读取的字节
                if(bytes > 0){
                    //console.log(buf.slice(0, bytes).toString());
                    resultTitleArray = JSON.parse(buf.slice(0, bytes).toString())
                    //console.log(oresource)
                    makeTheSave()

                }
            });
        })
        return
    }
    for(let i=0,l=longTitleArray.length;i<l;i++){
        resultTitleArray[longTitleArray[i].originIndex].title = longTitleArray[i].title
    }
    console.log(resultTitleArray)
    convertToText(resultTitleArray)
    fs.writeFile('newsFullJson.json',JSON.stringify(resultTitleArray),(err)=>{
        if(err){
            return console.log(err)
        }
        console.log('done !')

    })
}
//转换json文件为txt
let convertToText = (arr)=>{
    let  str = ''
    arr.map(item=>{
        console.log(item.date+'::'+item.title+'\n')
        str+= item.date+'::'+item.title+'\n'
    })
    fs.writeFile('news.txt',str,(err)=>{
        if(err){
            return console.log(err)
        }
        console.log('convertToText done !')

    })
}

getPageList(searchUrl)