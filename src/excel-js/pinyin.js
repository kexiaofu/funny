/*
*
*Author: Fuxiaoke
*Create Time: 2018-04-08 10:58
*
*/

let pinyin = require('node-pinyin'),
    xlsx = require('node-xlsx').default,
    fs = require('fs');
let filePath = `${__dirname}/excel/excel-pinyin/4月10日拟入职人员名单.xlsx`
let  workSheetsFromFile = xlsx.parse(filePath);
let namePY=[],
    namepy='',
    data = [{
        name:'拼音情况',
        data:[['姓名','拼音']]
    }]
for(let name in workSheetsFromFile[0]['data']){
    if(name !=='0' && workSheetsFromFile[0]['data'][name][2] !== undefined){
        namePY = pinyin(workSheetsFromFile[0]['data'][name][2],{style:'normal'})
        namepy = namePY[0]+namePY[1][0].substring(0,1);
        ((namePY.length>2) && (namepy+=namePY[2][0].substring(0,1)));
        data[0].data.push([workSheetsFromFile[0]['data'][name][2],namepy])
    }
}
var buffer = xlsx.build(data);

fs.writeFile(`${__dirname}/result/name.xlsx`,buffer,err=>{
    if(err) {
        console.log(err)
        return err
    }
    //fs.readFile('hospital.json')
    console.log('success')
})
