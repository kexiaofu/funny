/*
*
*Author: Fuxiaoke
*Create Time: 2018-04-08 10:58
*柯燕群 Ke Yan Qun
*/

let pinyin = require('node-pinyin'),
  xlsx = require('node-xlsx').default,
  fs = require('fs');
let filePath = `${__dirname}/excel/excel-pinyin/name2pinyin.xlsx`
let  workSheetsFromFile = xlsx.parse(filePath);
let namePY='',
  namepy='',
  data = [{
    name:'拼音情况',
    data:[['姓名','拼音']]
  }],
    data1 = workSheetsFromFile[0]['data'];

let UpcaseArr = (arr) =>{
  let str = '';
  arr.map(item=>{
    str += item[0].substr(0,1).toUpperCase() + item[0].substr(1) + ' ';
  });

  return str;
};

for(let i=3,l=data1.length;i<l;i++) {
  if(data1[i][1] !== undefined){
    namePY = UpcaseArr(pinyin(data1[i][1],{style:'normal'}));
    data[0].data.push([data1[i][1],namePY])
  }
}


var buffer = xlsx.build(data);

fs.writeFile(`${__dirname}/result/name2pinyin.xlsx`,buffer,err=>{
  if(err) {
    console.log(err)
    return err
  }
  //fs.readFile('hospital.json')
  console.log('success')
})
