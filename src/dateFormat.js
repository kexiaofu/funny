/**
 * Created by FuxiaoKe on 2018/3/1.
 */
let dateFormat = (date,dateformat,timeformat,dtsplit=' ')=>{
  let D = new Date(date),
      Y = D.getFullYear(),
      sY = Y % 100,
      M = D.getMonth()+1,
      d = D.getDate(),
      H = D.getHours(),
      mm = D.getMinutes(),
      dd = D.getSeconds(),
      odate = '',
      otime = '',
      dateSplit = /[^a-zA-Z0-9]/g.exec(dateformat),
      timeSplit = /[^a-zA-Z0-9]/g.exec(timeformat),
      dtSplit = /[^a-zA-Z0-9]/g.exec(dtsplit);
      dateSplit = dateSplit!==null?dateSplit[0]:'';
      timeSplit = timeSplit!==null?timeSplit[0]:'';
      dtSplit = dtSplit!==null?dtSplit[0]:'';
      if(dateformat.indexOf('y')>-1){
        let year = sY
        if(dateformat.match('yyyy')!==null){
          year = Y
        }
        if(dateformat.indexOf('y')===0){
          odate = year +dateSplit+(dateformat.match('mm')!==null?addZeroForSamll10(M):M)+dateSplit+(dateformat.match('dd')!==null?addZeroForSamll10(d):d)
        }else{
          odate = (dateformat.match('mm')!==null?addZeroForSamll10(M):M)+dateSplit+(dateformat.match('dd')!==null?addZeroForSamll10(d):d)+dateSplit+year
        }
      }else{
        return 'dateformat is error'
      }

      otime = (timeformat.match('HH')!==null?addZeroForSamll10(H):H) + timeSplit + (timeformat.match('mm')!==null?addZeroForSamll10(mm):mm)+timeSplit+(timeformat.match('dd')!==null?addZeroForSamll10(dd):dd)
      //console.log(odate+dtSplit+otime)
      return odate+dtSplit+otime
}

let addZeroForSamll10 = (val) =>{
  return val<10?'0'+val:val
}

module.exports = dateFormat;