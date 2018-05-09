/*
* 2018-5-1
* 流转中状态计算，出差，病假，年假等
*
* */
let xlsx = require('node-xlsx').default,
    fs = require('fs');

const unfinishedForm = xlsx.parse(`${__dirname}/excel/excel-unfinishedForm/unfinishedForm.xls`);

let resourceData = unfinishedForm[0]['data'],
    tripData = [],
    illData = [],
    annualLeaveData = [],
    other = [],
    tempArr = [];

let holidays = [1,5,6,7,15,21,22,29,30],
    sDay = '2018-4-1',
    eDay = '2018-4-30',
    startDay = new Date(sDay).getTime(),
    endDay = new Date(eDay).getTime();

let id='',name='',startDate='',endDate='',hadThisOne = false;

let spreadArr = (s,e)=>{
    let arr = [],isHoliday=false;
    s = +s;
    e = +e;
    for(let i=s;i<=e;i++) {
        isHoliday = false;
        for(let h=holidays.length-1;h>=0;h--) {
            if(i === holidays[h]) {
                isHoliday = true;
                break;
            }
        }
        if(!isHoliday){
            arr.push(i)
        }
    }
    return arr;
};

let splitValue = (val)=>{
    return val.split(' ')[0].split('-')[2];
};

for(let row in resourceData) {
    if(row >0 ) {
        startDate = resourceData[row][5];
        endDate = resourceData[row][6];
        if( new Date(startDate).getTime() > endDay ) {
            continue;
        }
        if(new Date(startDate).getTime() < startDay) {
            startDate = sDay
        }
        if(new Date(endDate).getTime() > endDay) {
            endDate = eDay
        }
        id = resourceData[row][1];
        name = resourceData[row][2];
        hadThisOne = false;
        switch(resourceData[row][4]) {
            case '出差':
                for(let i=tripData.length-1;i>=0;i--) {
                    if(id === tripData[i].id){
                        hadThisOne = true;
                        tempArr = spreadArr(splitValue(startDate),splitValue(endDate));
                        tripData[i].date = Array.from(new Set([...tripData[i].date.concat(tempArr)]));
                        console.log(tripData[i].date)
                        tripData[i].count =  tripData[i].date.length;
                        tripData[i].sourceDate.push([startDate,endDate])
                        break;
                    }
                }
                if(!hadThisOne) {
                    tempArr = spreadArr(splitValue(startDate),splitValue(endDate));
                    tripData.push({
                        id:id,
                        name:name,
                        date:tempArr,
                        sourceDate:[[startDate,endDate]],
                        count:tempArr.length
                    })
                }
                break;
            case '带薪病假':
                for(let i=illData.length-1;i>=0;i--) {
                    if(id === illData[i].id){
                        hadThisOne = true;
                        tempArr = spreadArr(splitValue(startDate),splitValue(endDate));
                        illData[i].date = Array.from(new Set([...illData[i].date.concat(tempArr)]));
                        illData[i].count =  illData[i].date.length;
                        illData[i].sourceDate.push([startDate,endDate])
                        break;
                    }
                }
                if(!hadThisOne) {
                    tempArr = spreadArr(splitValue(startDate),splitValue(endDate))
                    illData.push({
                        id:id,
                        name:name,
                        date:tempArr,
                        sourceDate:[[startDate,endDate]],
                        count:tempArr.length
                    })
                }
                break;
            case '年假':
                for(let i=annualLeaveData.length-1;i>=0;i--) {
                    if(id === annualLeaveData[i].id){
                        hadThisOne = true;
                        tempArr = spreadArr(splitValue(startDate),splitValue(endDate));
                        annualLeaveData[i].date = Array.from(new Set([...annualLeaveData[i].date.concat(tempArr)]));
                        annualLeaveData[i].count =  annualLeaveData[i].date.length;
                        annualLeaveData[i].sourceDate.push([startDate,endDate])
                        break;
                    }
                }
                if(!hadThisOne) {
                    tempArr = spreadArr(splitValue(startDate),splitValue(endDate));
                    annualLeaveData.push({
                        id:id,
                        name:name,
                        date:tempArr,
                        sourceDate:[[startDate,endDate]],
                        count:tempArr.length
                    })
                }
                break;
            case '年假(销假)':
                for(let i=other.length-1;i>=0;i--) {
                    if(id === other[i].id){
                        hadThisOne = true;
                        tempArr = spreadArr(splitValue(startDate),splitValue(endDate));
                        other[i].date = Array.from(new Set([...other[i].date.concat(tempArr)]));
                        other[i].count =  other[i].date.length;
                        other[i].sourceDate.push([startDate,endDate])
                        break;
                    }
                }
                if(!hadThisOne) {
                    tempArr = spreadArr(splitValue(startDate),splitValue(endDate))
                    other.push({
                        id:id,
                        name:name,
                        date:tempArr,
                        sourceDate:[[startDate,endDate]],
                        count:tempArr.length
                    })
                }
                console.log();
                break;
            default:
                break;
        }
    }
}

fs.writeFile(`${__dirname}/json/tripData.json`,JSON.stringify(tripData),err=>{
    if(err) return err;
    console.log('success write tripData.json')
});

let unfinishedFormXls = [{
    name:'出差统计',
    data:[['编号','姓名','出差天数','工作日出差具体日期','原始出差跨度']]
},{
    name:'带薪病假统计',
    data:[['编号','姓名','带薪病假天数','工作日带薪病假具体日期','原始带薪病假跨度']]
},{
    name:'年假统计',
    data:[['编号','姓名','年假天数','工作日年假具体日期','原始年假跨度']]
},{
    name:'年假销假统计',
    data:[['编号','姓名','年假销假天数','工作日年假销假具体日期','原始年假销假跨度']]
}]

for(let i=0,l=tripData.length;i<l;i++) {
    unfinishedFormXls[0].data.push([tripData[i].id,tripData[i].name,tripData[i].count,tripData[i].date,tripData[i].sourceDate])
}

for(let i=0,l=illData.length;i<l;i++) {
    unfinishedFormXls[1].data.push([illData[i].id,illData[i].name,illData[i].count,illData[i].date,illData[i].sourceDate])
}

for(let i=0,l=annualLeaveData.length;i<l;i++) {
    unfinishedFormXls[2].data.push([annualLeaveData[i].id,annualLeaveData[i].name,annualLeaveData[i].count,annualLeaveData[i].date,annualLeaveData[i].sourceDate])
}

for(let i=0,l=other.length;i<l;i++) {
    unfinishedFormXls[3].data.push([other[i].id,other[i].name,other[i].count,other[i].date,other[i].sourceDate])
}


var buffer = xlsx.build(unfinishedFormXls);
fs.writeFile(`${__dirname}/result/unfinishedFormCount.xlsx`,buffer,err=>{
    if(err) {
        console.log(err)
        return err
    }
    //fs.readFile('hospital.json')
    console.log('success write unfinishedFormCount.xlsx')
});

