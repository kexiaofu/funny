/*
*
*Author: Fuxiaoke
*Create Time: 2018-04-03 13:42
*
* 用于从打卡记录来计算某地区的餐补情况
*/
let xlsx = require('node-xlsx').default,
    fs = require('fs');
const workSheetsFromFile = xlsx.parse(`${__dirname}/excel/excel-count-dinner/3月门禁数据_out.xls`);
const workSheetsFromFileTarget = xlsx.parse(`${__dirname}/excel/excel-count-dinner/target.xlsx`);
let targetArray = []
for(let name in workSheetsFromFileTarget[0]['data']){
    targetArray.push({
        name:workSheetsFromFileTarget[0]['data'][name][1],
        count:0,
        time:[]
    })
}
let targetResults = []
for(let i=targetArray.length-1;i>=0;i--){
    for(let name in workSheetsFromFile[0]['data']){
        if(targetArray[i].name === workSheetsFromFile[0]['data'][name][2] && workSheetsFromFile[0]['data'][name][6] !== undefined){
            targetArray[i].time.push(workSheetsFromFile[0]['data'][name][6])
        }
    }
}


let otime = []
for(let i=targetArray.length-1;i>=0;i--){
    if(targetArray[i].time.length >0){
        for(let j=0,l=targetArray[i].time.length;j<l;j++){
            otime = targetArray[i].time[j].split(':');
            if(otime[0] === '00' || (otime[0]-0) > 18 || ((otime[0]-0) === 18 && (otime[1]-0) >=15) ){
                targetArray[i].count++
            }
        }
    }
}
console.log(targetArray)

let data = [{
    name:'肇庆晚餐补贴情况',
    data:[['姓名','晚餐补贴顿数','具体打卡时间']]
}]
let targetItem = {}
for(let i=targetArray.length-1;i>0;i--){
    targetItem = targetArray[i]
    data[0].data.push([targetItem.name,targetItem.count,targetItem.time])
}
var buffer = xlsx.build(data);

fs.writeFile(`${__dirname}/result/countDinner.json`,JSON.stringify(targetArray),err=>{
    if(err) {
        console.log(err)
        return err
    }
    //fs.readFile('hospital.json')
    console.log('success')
})

fs.writeFile(`${__dirname}/result/countDinner.xlsx`,buffer,err=>{
    if(err) {
        console.log(err)
        return err
    }
    //fs.readFile('hospital.json')
    console.log('success')
})