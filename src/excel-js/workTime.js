/*
*
* 用于计算一天上班打卡以及下班打卡的时间
*
* */

let xlsx = require('node-xlsx').default,
  fs = require('fs');
const workSheetsFromFile1 = xlsx.parse(`${__dirname}/excel/excel-work-time/5.1.xlsx`);
const workSheetsFromFile2 = xlsx.parse(`${__dirname}/excel/excel-work-time/5.2.xlsx`);
const workSheetsFromFile3 = xlsx.parse(`${__dirname}/excel/excel-work-time/5.3.xlsx`);
const zq = xlsx.parse(`${__dirname}/excel/excel-work-time/zq5.xlsx`);

let data1 = workSheetsFromFile1[0]['data'],
    data2 = workSheetsFromFile2[0]['data'],
    data3 = workSheetsFromFile3[0]['data'],
    zqData = zq[0]['data'];

let zqId = zqData.map(item=>{
  return item[0];
});

zqId.shift();

let month = 5,

    holidays = [1,5,6,13,19,20,27];

let peopleList = [];
let dataIdList = [];

let recordData = (data) =>{

    data.shift();
    data.map(item=>{

    if(dataIdList.indexOf(+item[2]) > -1) {
      for(let i= peopleList.length-1;i>=0;i--) {
        if(peopleList[i].id === item[2]) {
          peopleList[i].times.push(item[3]);
        }
      }
    } else {
      peopleList.push({
        id:item[2],
        name:item[1],
        department:item[0],
        times:[item[3]]
      });
      dataIdList.push(+item[2])
    }

  });
};

let calculateTime = (arr) =>{
  let time = [],
    strArr = [],
    sameDay = false;
  arr.map(item=>{
    sameDay = false;
    strArr = item.split(' ');
    for(let i=time.length-1;i>=0;i--) {
      if(time[i].day === strArr[0]) {
        time[i].time.push(strArr[1]);
        sameDay = true;
      }
    }

    if(!sameDay) {
      time.push({
        day:strArr[0],
        time:[strArr[1]]
      })
    }
  })

  let result = time.map(item=>{
    return {
      day:item.day,
      time:[item.time[0],item.time[item.time.length-1]]
    }
  })

  return result;
};

recordData(data1);
recordData(data2);
recordData(data3);

console.log(dataIdList.length,peopleList.length);


let dutyWorkDate = (arr) =>{
    let res = [];
    for(let i=0,l=arr.length-1;i<l;i++) {
      if(!(holidays.indexOf(+(arr[i].day.split('-')[2])) > -1)) {
        res.push(arr[i])
      }
    }
    return res;
};

let workHours = 510;

let addrP = [];

let calculateHour = (id,arr) =>{
  let w=null,h=null,differ=null,overWorkHoursCount=0,isZq = zqId.indexOf(+id)>-1?true:false,addr=isZq?'肇庆':'非肇庆';
  if(isZq){
    addrP.push(id)
  }
  let res = arr.map(item=>{

    w = item.time[0].split(':');
    h = item.time[1].split(':');
    if(!isZq) {
      if(w[0] < 9) {
        w[0] = 9;
        w[1] = 0;
      }
      differ = (h[0]-w[0]) * 60 + (h[1] - w[1]) - 90;

      item.workMin = differ;
      item.workHour = (differ / 60).toFixed(2);

      overWorkHoursCount += (differ >= workHours)?1:0;
    } else {
      w[0] = +w[0];
      if(w[0] > 8 || (w[0]===8 && w[1]>30 )) {
        differ = (h[0]-w[0]) * 60 + (h[1] - w[1]) - 90;
        item.workMin = differ;
        item.workHour = (differ / 60).toFixed(2);

      } else {
        w[0] = 8;w[1] = 30;
        differ = (h[0]-w[0]) * 60 + (h[1] - w[1]) - 90;
        item.workMin = differ;
        item.workHour = (differ / 60).toFixed(2);
        if(+h[0]>18 || (+h[0] === 18 && h[1]>=15)) {
          overWorkHoursCount += 1;
        }
      }
    }

    return item;
  });

  return {res,overWorkHoursCount,addr}
};

let workHoursRes={};

peopleList.map(item=>{
  workHoursRes = {};
  item.workTime = calculateTime(item.times);
  item.dutyWorkTime = dutyWorkDate(item.workTime);
  workHoursRes = calculateHour(item.id,item.dutyWorkTime);
  item.addr = workHoursRes.addr;
  item.workHours = workHoursRes.res;
  item.overWorkHoursCount = workHoursRes.overWorkHoursCount;

});

let data = [{
  name:'全月上下班时间',
  data:[['工号','姓名','日期','上班时间','下班时间']]
},{
  name:'工作日上下班时间',
  data:[['工号','地区','姓名','日期','上班时间','下班时间','工时(分)','工时(时)']]
},{
  name:'工作日工时超8.5',
  data:[['工号','地区','姓名','工时总数']]
}];


peopleList.map(item=>{
  item.workTime.map(time=>{
    data[0].data.push([item.id,item.name,time.day,time.time[0],time.time[1]])
  });
  item.workHours.map(time=>{
    data[1].data.push([item.id,item.addr,item.name,time.day,time.time[0],time.time[1],time.workMin,time.workHour])
  });
  data[2].data.push([item.id,item.addr,item.name,item.overWorkHoursCount])

});

var buffer = xlsx.build(data);

fs.writeFile(`${__dirname}/result/workTime-${month}.xlsx`,buffer,err=>{
  if(err) {
    console.log(err);
    return err
  }
  //fs.readFile('hospital.json')
  console.log('success xlsx');
})



fs.writeFile(`${__dirname}/json/workTime-${month}.json`,JSON.stringify(peopleList),err=>{
  if(err) {
    console.log(err);
    return err
  }
  //fs.readFile('hospital.json')
  console.log('success');
})