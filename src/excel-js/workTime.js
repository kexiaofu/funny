/*
*
* 用于计算一天上班打卡以及下班打卡的时间
*
* */

let xlsx = require('node-xlsx').default,
  fs = require('fs');
//const workSheetsFromFile1 = xlsx.parse(`${__dirname}/excel/excel-work-time/5.1.xlsx`);
//const workSheetsFromFile2 = xlsx.parse(`${__dirname}/excel/excel-work-time/5.2.xlsx`);
//const workSheetsFromFile3 = xlsx.parse(`${__dirname}/excel/excel-work-time/5.3.xlsx`);
//const zq = xlsx.parse(`${__dirname}/excel/excel-work-time/zq.xlsx`);

let month = 5,

  dirPath = `${__dirname}/excel/excel-work-time/${month}`,

  holidays = [1,5,6,13,19,20,27];

let monthFiles=[],
  zqData=[],
  zqId=[];
let peopleList = [];
let dataIdList = [];

let workHours = 510;

let addrP = [];
let zeroHours = false;

let workHoursRes={};

//统计个人打卡时间
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

//处理上下班时间
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

  let otime={},wt=null,result=[];

  for(let i=0,l=time.length;i<l;i++) {
    otime = time[i];
    wt = otime.time[0].split(':');

    if(wt[0] >=0 && wt[0] <=5 && i!== 0) {
      result[i-1].time[1] = otime.time[0];
      if(otime.time.length >1) {
        result.push({
          day:otime.day,
          time:[otime.time[1],otime.time[otime.time.length-1]]
        })
      }else {
        result.push({
          day:otime.day,
          time:[otime.time[0],otime.time[0]]
        })
      }

    } else {
      result.push({
        day:otime.day,
        time:[otime.time[0],otime.time[otime.time.length-1]]
      })
    }


  }

  return result;
};

//处理放假日期
let dutyWorkDate = (arr) =>{
  let res = [];
  for(let i=0,l=arr.length;i<l;i++) {
    if(!(holidays.indexOf(+(arr[i].day.split('-')[2])) > -1)) {
      res.push(arr[i])
    }
  }
  return res;
};

//计算工时
let calculateHour = (id,arr) =>{
  let w=null,h=null,differ=null,overWorkHoursCount=0,isZq = zqId.indexOf(+id)>-1?true:false,addr=isZq?'肇庆':'非肇庆';
  if(isZq){
    addrP.push(id)
  }
  let res = arr.map(item=>{

    let m = item.day.split('-')[1];

    if(+m === month) {
      w = item.time[0].split(':');
      h = item.time[1].split(':');
      if(!isZq) {

        zeroHours = (w[0]>=0 && w[0]<=5);

        if(w[0] < 9 && !zeroHours) {
          w[0] = 9;
          w[1] = 0;
        }
        h[0] >=0 && h[0]<=5 && (h[0] -= -24);
        differ = (h[0]-w[0]) * 60 + (h[1] - w[1]) - 90;

        item.workMin = differ;
        item.workHour = (differ / 60).toFixed(2);
        item.hadFood = (differ >= workHours && (+w[0] < 10  || (+w[0] === 10 && +w[1] === 0 )) ) ? 1:0;

        overWorkHoursCount += item.hadFood;
        //overWorkHoursCount += zeroHours?1:0;
      } else {
        w[0] = +w[0];
        zeroHours = (w[0]>=0 && w[0]<=5);

        if((w[0] < 8 || (+w[0]===8 && w[1]<30 )) && !zeroHours) {
          w[0] = 8;w[1] = 30;
        }
        h[0] >=0 && h[0]<=5 && (h[0] -= -24);
        differ = (h[0]-w[0]) * 60 + (h[1] - w[1]) - 45;
        item.workMin = differ;
        item.workHour = (differ / 60).toFixed(2);

        //肇庆540分钟算餐补
        item.hadFood = ((differ >= workHours+30) && (+w[0] < 8  || (+w[0] === 8 && +w[1] === 30 )) ) ? 1:0;

        overWorkHoursCount += item.hadFood;
        //overWorkHoursCount += zeroHours?1:0;
      }
    }

    return item;
  });

  return {res,overWorkHoursCount,addr}
};

fs.readdir(dirPath, (err,files)=>{
  console.log(files,files.indexOf('zq.xlsx'));
  let zqIndex = files.indexOf('zq.xlsx');
  files.map((item,index)=>{
    if(index!==zqIndex) {
      monthFiles.push(xlsx.parse(`${dirPath}/${item}`)[0]['data'])
    } else {
      zqData=xlsx.parse(`${dirPath}/${item}`)[0]['data'];
    }
  });

  zqId = zqData.map(item=>{
    return item[0];
  });

  zqId.shift();

  console.log(monthFiles.length,'monthFilesCount');

  monthFiles.map(item=>{
    recordData(item);
  });

  console.log(dataIdList.length + '人',peopleList.length + '人');

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
    data:[['工号','地区','姓名','日期','上班时间','下班时间','工时(分)','工时(时)','餐补']]
  },{
    name:'工作日工时超8.5',
    data:[['工号','地区','姓名','工时总数']]
  }];

  peopleList.map(item=>{
    item.workTime.map(time=>{
      data[0].data.push([item.id,item.name,time.day,time.time[0],time.time[1]])
    });
    item.workHours.map(time=>{
      data[1].data.push([item.id,item.addr,item.name,time.day,time.time[0],time.time[1],time.workMin,time.workHour,time.hadFood])
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
  });

  fs.writeFile(`${__dirname}/json/workTime-${month}.json`,JSON.stringify(peopleList),err=>{
    if(err) {
      console.log(err);
      return err
    }
    //fs.readFile('hospital.json')
    console.log('success');
  });

});

