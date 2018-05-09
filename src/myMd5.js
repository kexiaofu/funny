/**
 * Created by FuxiaoKe on 2018/3/1.
 */
let crypto =require('crypto');
let myMd5 = function(obj,md5Key,md5,decode=false) {
  let result = '', keyArr = [],str=''
  if (typeof obj === 'object'){
    for (let key in obj) {
      keyArr.push(key)
    }
    keyArr.sort()
    str = ''
    for (let i = 0, len = keyArr.length; i < len; i++) {
      str += keyArr[i] + obj[keyArr[i]]
    }
  }else{
    str = obj
  }
  console.log(obj,md5Key,md5,decode)
  if(md5){
    str += md5Key
    let ohash = crypto.createHash('sha1');
    ohash.update(str)
    result = ohash.digest('hex')
    console.log(result,'md5')
  }else{
    if(!decode){
      result = encrypt(str)
      console.log(result,'aes')
    }else{
      result = decrypt(str)
      console.log(result,'aes')
    }
  }
  return result
}

let aes_algorithm = 'aes-128-ecb',
  aes_secrect = myMd5('liangjiafu','aes-128-ecb',true)
console.log(aes_secrect)
let encrypt = (text)=> {
  let cipher = crypto.createCipher(aes_algorithm, aes_secrect)
  let crypted = cipher.update(text, 'binary', 'hex')
  crypted += cipher.final('hex');
  return crypted;
};

let decrypt = (text)=> {
  let decipher = crypto.createDecipher(aes_algorithm, aes_secrect)
  let dec = decipher.update(text, 'hex', 'binary')
  dec += decipher.final('binary');
  return dec;
};


module.exports=myMd5;