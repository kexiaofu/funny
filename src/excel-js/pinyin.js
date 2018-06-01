/*
*
*Author: Fuxiaoke
*Create Time: 2018-04-08 10:58
*
*/

let pinyin = require('node-pinyin'),
    xlsx = require('node-xlsx').default,
    fs = require('fs');
let filePath = `${__dirname}/excel/excel-pinyin/6月1日拟入职人员名单.xlsx`;
let  workSheetsFromFile = xlsx.parse(filePath);
let namePY=[],
    namepy='',
    data = [{
        name:'拼音情况',
        data:[['姓名','拼音']]
    }],
    originData = workSheetsFromFile[0]['data'],
    str = '';
for(let name in originData){
    if(name !=='0' && originData[name][2] !== undefined){
        console.log(originData[name][2])
        str = originData[name][2];
        if(/^[\u3220-\uFA29]+$/.test(str)) {
            namePY = pinyin(str,{style:'normal'});
            namepy = namePY[0]+namePY[1][0].substring(0,1);
            ((namePY.length>2) && (namepy+=namePY[2][0].substring(0,1)));
            data[0].data.push([originData[name][2],namepy+'@xiaopeng.com'])
        } else {
            data[0].data.push([originData[name][2],originData[name][2]])
        }

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
