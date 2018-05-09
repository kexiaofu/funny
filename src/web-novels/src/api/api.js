/**
 * Created by FuxiaoKe on 2018/3/2.
 */

//import 'axios' from 'axios';
const axios = require('axios')
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';

const searchNovel = async (name,email)=>{
  console.log(window.location.hostname)
  let host = window.location.hostname !== 'localhost'?'http://ngrok.loveke.xyz:8088':''
  console.log(host)
  return await axios.post(host+'/novels/search',{name,email},{headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }})
    .then(res=>{
      console.log(res.data)
      return res.data
    }).catch(error=>{
      console.log(error)
      alert('小说正在下载,下载好的话,会发到您的邮箱,请注意查收!')
    })
}

const toDownload = async (key,name)=>{
  return await axios.post('/novels/download',{key,name})
    .then(res=>{
      return res.data
    }).catch(error=>{
      console.log(error)
    })
}

const api = {
  searchNovel,toDownload
}

export default api ;
