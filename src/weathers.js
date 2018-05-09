/**
 * Created by FuxiaoKe on 2018/2/23.
 */
let axios = require('axios'),
    nodemailer = require('nodemailer'),
    weathers = {}

    let getWeathers = (city='广州') =>{
      let url = encodeURI('https://www.sojson.com/open/api/weather/json.shtml?city='+city)
      axios.get(url)
          .then(res=>{
            console.log(res.data.data)
            //console.log(res.data)
          })
          .catch(error=>{
            console.log(error)
          })
    }

getWeathers()