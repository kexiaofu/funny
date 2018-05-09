let xlsx = require('node-xlsx').default,
    fs = require('fs');

const workSheetsFromFileTarget = xlsx.parse(`${__dirname}/excel/excel-attendance/3月(1)_out.xlsx`);
const workSheetsFromFileTargetB = xlsx.parse(`${__dirname}/excel/excel-attendance/3月(2)_out.xlsx`);
let targetArray = [],
    hadIncludName=false,
    code='',
    isSameDate = false,
    dateString='',
    hours=[]

let calculateAll = (data)=>{
    for(let name in data){
        if(data[name][8] !== undefined){
            hadIncludName=false
            code = data[name][1]
            dateString = data[name][3]
            hours = data[name][9].split(':')
            for(let i=targetArray.length-1;i>=0;i--){
                if(targetArray[i].code === code){
                    /*isSameDate  = false
                    for(let k=targetArray[i].date.length;k>=0;k--){
                        if(targetArray[i].date[k] === dateString){
                            isSameDate = true
                            break;
                        }
                    }*/
                    //if(!isSameDate){
                        hadIncludName=true
                        targetArray[i].count++
                        targetArray[i].time.push((+hours[0])*60+(+hours[1]))
                    //}

                    break;
                }
            }
            if(!hadIncludName){
                targetArray.push({
                    //date:[],
                    code:code,
                    name:data[name][2],
                    count:1,
                    time:[(+hours[0])*60+(+hours[1])]
                })
            }
        }
    }
}

calculateAll(workSheetsFromFileTarget[0]['data'])

calculateAll(workSheetsFromFileTargetB[0]['data'])

let data = [{
    name:'出勤平均每天时长',
    data:[['编号','姓名','出勤天数','出勤总时长','出勤平均时长']]
}]

let otime=[],countTime = 0,item={}
for(let i=targetArray.length-1;i>=0;i--){
    countTime = 0
    item = targetArray[i]
    otime = targetArray[i].time
    for(let k=otime.length-1;k>=0;k--){
        countTime+=(+otime[k])
    }
    targetArray[i].allTime = countTime
    targetArray[i].ave = ~~(countTime/targetArray[i].count)
    data[0].data.push([item.code,item.name,item.count,item.allTime,item.ave])
}

var buffer = xlsx.build(data);

fs.writeFile(`${__dirname}/result/calculateTime3.json`,JSON.stringify(targetArray),err=>{
    if(err) {
        console.log(err)
        return err
    }
    //fs.readFile('hospital.json')
    console.log('success')
})

fs.writeFile(`${__dirname}/result/calculateTime3.xlsx`,buffer,err=>{
    if(err) {
        console.log(err)
        return err
    }
    //fs.readFile('hospital.json')
    console.log('success')
})

console.log(targetArray)