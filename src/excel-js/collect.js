/*
*
*Author: Fuxiaoke
*Create Time: 2018-04-03 13:35
*
* 汇总某地区的每个人一张表统计一个月的出勤，出差，请假，餐补情况
*/
let xlsx = require('node-xlsx').default,
    fs = require('fs');

let filesSrc = `${__dirname}/excel/excel-collect/`,
    files = fs.readdirSync(filesSrc),
    ofile = '',
    filesPath = []
files.map(item=>{
    console.log(item)
    ofile = fs.readdirSync(filesSrc+item)
    ofile.map(oitem=>{
        filesPath.push(filesSrc+item+'/'+oitem)
    })
})
console.log(filesPath)

let workSheetsFromFile = null,
    holidays=[4,10,11,18,24,25],
    resultArr = []


let getXlsData = async(path)=>{
    workSheetsFromFile = xlsx.parse(path)
    let odata = null,
        outCount=0,
        sillCount={
            count:0,
            reason:[]
        },
        dinnerCount=0,
        workCount=0
    for(let row in workSheetsFromFile[0]['data']){
        odata = workSheetsFromFile[0]['data'][row]
        //console.log(row,holidays.indexOf(row-0))
        if(holidays.indexOf(row-0)===-1){
            if(odata[7] !== undefined){
                if(odata[7].indexOf('出差')>-1){
                    outCount++
                }
                if(odata[7].indexOf('病假')>-1){
                    sillCount.count++
                    sillCount.reason.push(row+'号'+odata[7])
                }
            }
            if((odata[6]-0) === 18){
                dinnerCount++
            }
            //console.log(odata[8],odata[8].indexOf('出勤')>-1)
            if(odata[8].indexOf('出勤')>-1){
                //console.log(odata[8])
                workCount++
            }
        }
    }
    resultArr.push({
        name:workSheetsFromFile[0]['data'][1][2],
        workCount:workCount-1,
        sillCount:sillCount.count,
        sillReason:sillCount.reason.toString(),
        outCount:outCount,
        dinnerCount:dinnerCount

    })
    await console.log(workSheetsFromFile[0]['data'][1][2],workCount-1,sillCount.count,sillCount.reason.toString(),outCount,dinnerCount)
}
console.log(filesPath.length)
filesPath.map((item,index)=>{
    console.log('-------'+index+'------')
    getXlsData(item)
})

let data = [{
    name:'汇合数据统计',
    data:[['姓名','正常出勤天数','请假天数','请假类型','出差天数','餐补']]
}]

fs.writeFile(`${__dirname}/result/collect.json`,JSON.stringify(resultArr),err=>{
    if(err) {
        console.log(err)
        return err
    }
    //fs.readFile('hospital.json')
    console.log('success')
})

resultArr.map(item=>{
    data[0].data.push([item.name,item.workCount,item.sillCount,item.sillReason,item.outCount,item.dinnerCount])
})

var buffer = xlsx.build(data);

fs.writeFile(`${__dirname}/result/collect.xlsx`,buffer,err=>{
    if(err) {
        console.log(err)
        return err
    }
    //fs.readFile('hospital.json')
    console.log('success')
})