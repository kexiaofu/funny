/*
*
* 用于计算一天上班打卡以及下班打卡的时间
*
* */

let xlsx = require('node-xlsx').default,
  fs = require('fs');
const workSheetsFromFile1 = xlsx.parse(`${__dirname}/excel/excel-work-time/2018-5-1.xlsx`);
const workSheetsFromFile2 = xlsx.parse(`${__dirname}/excel/excel-work-time/2018-5-2.xlsx`);

let data1 = workSheetsFromFile1[0]['data'],
    data2 = workSheetsFromFile2[0]['data'];

let peopleList = [];

let recordData = (data) =>{
  let result = [],
      hadThisOne = false;
    data.shift();
    data.map(item=>{
    //console.log(item);
    hadThisOne = false;

    for(let i= result.length-1;i>=0;i--) {
      if(result[i].id === item[7]) {
        hadThisOne = true;
        result[i].times.push(item[3]);
      }
    }

    if(!hadThisOne) {
      result.push({
        id:item[7],
        name:item[1],
        department:item[0],
        times:[item[3]]
      });
    }
  });

  return result;
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

peopleList.push(...recordData(data1),...recordData(data2));

peopleList.map(item=>{
  item.workTime = calculateTime(item.times);
});

let data = [{
  name:'上下班时间',
  data:[['卡号','姓名','日期','上班时间','下班时间']]
}];


peopleList.map(item=>{
  item.workTime.map(time=>{
    data[0].data.push([item.id,item.name,time.day,time.time[0],time.time[1]])
  });
});

var buffer = xlsx.build(data);

fs.writeFile(`${__dirname}/result/workTime.xlsx`,buffer,err=>{
  if(err) {
    console.log(err);
    return err
  }
  //fs.readFile('hospital.json')
  console.log('success xlsx');
})



fs.writeFile(`${__dirname}/json/workTime.json`,JSON.stringify(peopleList),err=>{
  if(err) {
    console.log(err);
    return err
  }
  //fs.readFile('hospital.json')
  console.log('success');
})