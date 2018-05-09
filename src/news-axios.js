let fs = require('fs'),
    axios = require('axios'),
    async = require('async'),
    cheerio = require('cheerio');

let getNews = (url)=>{
    axios.get(url)
        .then(res=>{
            console.log(res.data)

        })
        .catch(error=>{
            console.log('---error---')
            console.log(error)
        })
}
getNews('https://www.google.com.hk/search?q=bitcoin+weed&safe=strict&tbas=0&tbs=cdr:1,cd_min:1/1/2017,cd_max:1/3/2018&tbm=nws&ei=5qq7WqrvAcG-jwO1gZfQDw&start=0&sa=N&biw=1089&bih=949&dpr=1')