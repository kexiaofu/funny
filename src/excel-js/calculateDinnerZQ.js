/*
* 2018-5-1
* 计算肇庆餐补
*
* */

let xlsx = require('node-xlsx').default,
    fs = require('fs');

const zq = xlsx.parse(`${__dirname}/excel/excel-zq/zq.xlsx`);
const kq1 = xlsx.parse(`${__dirname}/excel/excel-kq/kq-4-1.xlsx`);
const kq2 = xlsx.parse(`${__dirname}/excel/excel-kq/kq-4-2.xlsx`);
const zq1 = xlsx.parse(`${__dirname}/excel/excel-kq/zq.xls`);

let zqData = zq[0]['data'],
    kq1Data = kq1[0]['data'],
    kq2Data = kq2[0]['data'],
    zq1Data = zq1[0]['data'];

let id='',
    name='',
    dinner=[],
    count=0,
    findData = false,
    time=[];

let zqDinner = [{
    name: '肇庆餐补情况',
    data: [['编号','姓名','餐补总数','餐补具体数据','下班时间']]
}]

let calculateDinner = (id,name,hadDinner,time)=>{
    let hadInclude = false;
    for(let i=dinner.length-1;i>=0;i--) {
        if(id === dinner[i].id){
            hadInclude = true;
            if(hadDinner){
                dinner[i].count += 1;
                dinner[i].dinners.push(time);
            }
            dinner[i].time.push(time);
        }
    }
    if(!hadInclude) {
        dinner.push({
            id:id,
            name:name,
            count:hadDinner?1:0,
            dinners:hadDinner?[time]:[],
            time:[time]
        })
    }
};

for(let row = 1,l=zqData.length;row<l;row++) {
    console.log(+zqData[row][3])
    id = +zqData[row][3];
    name = zqData[row][4];
    findData = false;
    for(let z in zq1Data) {
        if(id === zq1Data[z][1] && zq1Data[z][6] !== undefined) {
            console.log(zq1Data[z][6])
            time = zq1Data[z][6].split(':');
            if(+time[0]>18 || (+time[0] === 18 && +time[1]>=15) || (+time[0]<=6)) {
                calculateDinner(id,name,true,zq1Data[z][6]);
            }else{
                calculateDinner(id,name,false,zq1Data[z][6]);
            }
            findData = true;
        }
    }
    if(!findData) {
        for (let k in kq1Data) {
            if (id === kq1Data[k][1] && kq1Data[k][6] !== undefined) {
                console.log(kq1Data[k][6])
                time = kq1Data[k][6].split(':');
                if (+time[0] > 18 || (+time[0] === 18 && +time[1] >= 15) || (+time[0] <= 6)) {
                    calculateDinner(id, name, true, kq1Data[k][6]);
                } else {
                    calculateDinner(id, name, false, kq1Data[k][6]);
                }
                findData = true;
            }
        }
    }

    if(!findData) {
        for(let q in kq2Data) {
            if(id === kq2Data[q][1] && kq2Data[q][6] !== undefined) {
                time = kq2Data[q][6].split(':');
                if(+time[0]>18 || (+time[0] === 18 && +time[1]>=15) || +time[0]<=6) {
                    calculateDinner(id,name,true,kq2Data[q][6]);
                }else{
                    calculateDinner(id,name,false,kq2Data[q][6]);
                }
                findData = true;
            }
        }
    }

}

fs.writeFile(`${__dirname}/json/zQDinner.json`,JSON.stringify(dinner),err=>{
    if(err) return err;
    console.log('success write zQDinner.json')
});

let d = {};
for(let i=0,l=dinner.length;i<l;i++) {
    d = dinner[i]
    zqDinner[0].data.push([d.id,d.name,+d.count,d.dinners,d.time])
}

var buffer = xlsx.build(zqDinner);
fs.writeFile(`${__dirname}/result/zQDinnerCount.xlsx`,buffer,err=>{
    if(err) {
        console.log(err)
        return err
    }
    //fs.readFile('hospital.json')
    console.log('success write zQDinnerCount.xlsx')
});

