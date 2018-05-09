/**
 * Created by FuxiaoKe on 2018/2/5.
 */
var xlsx = require('node-xlsx').default,
    fs = require('fs');

const workSheetsFromFile = xlsx.parse(`${__dirname}/excel/表单记录.xls`);
let days=[],
    holiday=[4,10,11,18,24,25],
    monthMaxDay=[31,28,31,30,31,30,31,31,30,31,30,31],
    nowMonth=3,
    dataArray=[]
for(let i=1,len=monthMaxDay[nowMonth-1];i<=len;i++){
    days.push(i)
}
for(let i=0,len=holiday.length;i<len;i++){
  days[holiday[i]-1] = 0
}
let D = new Date(),
    y=D.getFullYear(),
    m=nowMonth+1>9?(nowMonth+1):'0'+(nowMonth+1),
    oMaxtime=new Date(y+'/'+m+'/01').getTime(),
    nowm = nowMonth>9?nowMonth:'0'+nowMonth,
    oMintime=new Date(y+'/'+nowm+'/01').getTime()
console.log(days)
console.log(workSheetsFromFile[0]['data'][2][5],workSheetsFromFile[0]['data'][2][6])
console.log(y+'/'+m+'/01')
console.log(workSheetsFromFile[0]['data'][2][5].split('-')[2])
//return
let name = '',
    startDate='',
    endDate='',
    hadInclude=false

for(var id in workSheetsFromFile[0]['data']){
  //oid = workSheetsFromFile[0]['data'][id][0];
    //console.log(workSheetsFromFile[0]['data'][id][2])
    if(workSheetsFromFile[0]['data'][id][4] === '出差'){
        name = workSheetsFromFile[0]['data'][id][2]
        startDate = workSheetsFromFile[0]['data'][id][5]
        endDate =   workSheetsFromFile[0]['data'][id][6]
        hadInclude = false
        if(new Date(endDate).getTime()>=oMaxtime){
            endDate = y+'-'+m+'-'+monthMaxDay[nowMonth-1]
        }
        if(new Date(endDate).getTime()<=oMintime){
            endDate = y+'-'+nowm+'-'+1
        }
        startDate = startDate.split('-')[2]-1
        endDate = endDate.split('-')[2]-0

        for(let i=0,l=dataArray.length;i<l;i++){
            if(name === dataArray[i].name){
                hadInclude=true
                dataArray[i].days.push.apply(dataArray[i].days,days.slice(startDate,endDate))
                break;
            }
        }
        if(!hadInclude){
            dataArray.push({
                name:name,
                days:days.slice(startDate,endDate)
            })
            //console.log(startDate,endDate)
        }
        /*if(name === '王立炳'){
          console.log(dataArray,startDate,endDate,days.slice(startDate,endDate))
            console.log(workSheetsFromFile[0]['data'][id])

            break
        }*/
    }
}
let newArr = []
let odata = [{
    name:'表单记录',
    data:[['姓名','出差时长']]
}]
for(let i=0,len=dataArray.length;i<len;i++){
    newArr = []
  for(let j=0,l=dataArray[i].days.length;j<l;j++){
      console.log(dataArray[i].days[j])
    if(dataArray[i].days[j] !== 0){
        newArr.push(dataArray[i].days[j])
    }
  }
    newArr = Array.from(new Set(newArr))
    dataArray[i].days = newArr
    dataArray[i].daysLen = newArr.length
    odata[0].data.push([dataArray[i].name,newArr.length])
}
console.log(dataArray)
console.log(dataArray.length)


fs.writeFile('dataArray.json',JSON.stringify(dataArray),err=>{
  if(err) {
    console.log(err)
    return err
  }
  //fs.readFile('hospital.json')
  console.log('success')

})

var buffer = xlsx.build(odata);
fs.writeFile(`${__dirname}/excel/表单记录出差时长.xls`, buffer, function(err) {
    if (err) throw err;
    console.log('has finished');
});
