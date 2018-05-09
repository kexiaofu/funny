let xlsx = require('node-xlsx').default,
    fs = require('fs');

const workSheetsFromFileTarget = xlsx.parse(`${__dirname}/excel/excel-nowork-day/3月(1)_out.xlsx`);
const workSheetsFromFileTargetB = xlsx.parse(`${__dirname}/excel/excel-nowork-day/3月(2)_out.xlsx`);


let workDay = workSheetsFromFileTarget[0]['data'],
    workDayIndex = [],
    targetArr = [],
    hadInclude=false,
    maxDay=31,
    holiday=6

let data = [{
    name:'非正常出勤分析',
    data:[['编号','姓名','非正常出勤天数']]
}]

let calculateDay = (workDay)=>{
    for(let index in workDay ){
        workDayIndex = workDay[index]
        //console.log(workDay[8])
        //break
        //console.log(workDayIndex[8],workDayIndex[9] , (workDayIndex[9] !== undefined && workDayIndex[9].indexOf('放假全天')>-1))
        if(workDayIndex[8] === undefined || index === '0') continue;
        hadInclude=false

        if(targetArr.length !==0){
            for(let i=targetArr.length-1;i>=0;i--){
                if(targetArr[i].code === workDayIndex[1]){
                    //console.log(workDayIndex)
                    targetArr[i].count--
                    hadInclude=true
                    break
                }
            }
            if(!hadInclude){
                //console.log(workDayIndex)
                targetArr.push({
                    code:workDayIndex[1],
                    name:workDayIndex[2],
                    count:maxDay-holiday-1,

                })
            }
        }else{
            //console.log(workDayIndex,index)

            targetArr.push({
                code:workDayIndex[1],
                name:workDayIndex[2],
                count:maxDay-holiday-1
            })
        }

        //break
    }
}

calculateDay(workDay)
console.log(targetArr.length)

calculateDay(workSheetsFromFileTargetB[0]['data'])
console.log(targetArr.length)




//console.log(targetArr)

//targetArr.shift()
targetArr.map(item=>{
    data[0].data.push([item.code,item.name,item.count])
    if(item.code === 1){
        console.log(item)
    }
})

fs.writeFile(`${__dirname}/result/noWorkDay3.json`,JSON.stringify(targetArr),err=>{
    if(err) {
        console.log(err)
        return err
    }
    //fs.readFile('hospital.json')
    console.log('success')
})

var buffer = xlsx.build(data);

fs.writeFile(`${__dirname}/result/3月份非正常出勤.xlsx`,buffer,err=>{
    if(err) {
        console.log(err)
        return err
    }
    //fs.readFile('hospital.json')
    console.log('success')
})


