/**
 * Created by FuxiaoKe on 2018/2/5.
 */
var xlsx = require('node-xlsx').default,
    fs = require('fs');

const workSheetsFromFile = xlsx.parse(`${__dirname}/excel/3月1_out.xlsx`);
const workSheetsFromFile1 = xlsx.parse(`${__dirname}/excel/3月2_out.xlsx`);

let targetArr = []

for(let name in workSheetsFromFile[1]['data']){
    targetArr.push({
        name:workSheetsFromFile[1]['data'][name][1],
        dinnerCountA:workSheetsFromFile[1]['data'][name][4],
        dinnerCountP:0,
        index:1
    })
}

for(let name in workSheetsFromFile1[1]['data']){
    targetArr.push({
        name:workSheetsFromFile1[1]['data'][name][1],
        dinnerCountA:0,
        dinnerCountP:workSheetsFromFile1[1]['data'][name][4],
        index:2
    })
}

for(let i=0,l=targetArr.length;i<l;i++){
    for(let j=0;j<l;j++){
        if(targetArr[i].name === targetArr[j].name){
            if(targetArr[i].index ===1 && targetArr[j].index === 2){
                targetArr[i].dinnerCountP === targetArr[j].dinnerCountP
            }else if(targetArr[i].index ===2 && targetArr[j].index === 1){
                targetArr[i].dinnerCountA === targetArr[j].dinnerCountA
            }
            break;
        }
    }
}


for(let i=0,l=targetArr.length;i<l;i++) {
    if(targetArr[i].name === '肖伟华'){
        console.log(targetArr[i])
    }
    for (let j = 0; j < l; j++) {
        if(targetArr[i].name === targetArr[j].name && targetArr[i].index !== targetArr[j].index){
            console.log(targetArr[i],targetArr[j])
            break
        }
    }
}

let data = [{
    name:'晚餐补贴情况',
    data:[['姓名','3月1out','3月2out']]
}]
let targetItem = {}
for(let i=targetArr.length-1;i>0;i--){
    targetItem = targetArr[i]
    data[0].data.push([targetItem.name,targetItem.dinnerCountA,targetItem.dinnerCountP])
}
var buffer = xlsx.build(data);
fs.writeFile('targetArray.xlsx',buffer,err=>{
    if(err) {
        console.log(err)
        return err
    }
    //fs.readFile('hospital.json')
    console.log('success')
})

fs.writeFile('targetArray.json',JSON.stringify(targetArr),err=>{
    if(err) {
        console.log(err)
        return err
    }
    //fs.readFile('hospital.json')
    console.log('success')
})

//const workSheetsFromFileTarget = xlsx.parse(`${__dirname}/excel/target.xlsx`);

/*let targetArray = []
for(let name in workSheetsFromFileTarget[0]['data']){
    targetArray.push({
        name:workSheetsFromFileTarget[0]['data'][name][1],
        count:0,
        time:[]
    })
}
let targetResults = []
for(let i=targetArray.length-1;i>=0;i--){
    for(let name in workSheetsFromFile[0]['data']){
      if(targetArray[i].name === workSheetsFromFile[0]['data'][name][2] && workSheetsFromFile[0]['data'][name][6] !== undefined){
          targetArray[i].time.push(workSheetsFromFile[0]['data'][name][6])
      }
    }
    for(let name in workSheetsFromFile1[0]['data']){
        if(targetArray[i].name === workSheetsFromFile1[0]['data'][name][2] && workSheetsFromFile1[0]['data'][name][6] !== undefined){
            targetArray[i].time.push(workSheetsFromFile1[0]['data'][name][6])
        }
    }
}


let otime = []
for(let i=targetArray.length-1;i>=0;i--){
  if(targetArray[i].time.length >0){
    for(let j=0,l=targetArray[i].time.length;j<l;j++){
        otime = targetArray[i].time[j].split(':');
        if(otime[0] === '00' || (otime[0]-0) > 18 || ((otime[0]-0) === 18 && (otime[1]-0) >=15) ){
            targetArray[i].count++
        }
    }
  }
}
console.log(targetArray)

let data = [{
  name:'肇庆晚餐补贴情况',
    data:[['姓名','晚餐补贴顿数','具体打卡时间']]
}]
let targetItem = {}
for(let i=targetArray.length-1;i>0;i--){
    targetItem = targetArray[i]
    data[0].data.push([targetItem.name,targetItem.count,targetItem.time])
}
var buffer = xlsx.build(data);

fs.writeFile('targetArray.json',JSON.stringify(targetArray),err=>{
    if(err) {
        console.log(err)
        return err
    }
    //fs.readFile('hospital.json')
    console.log('success')
})

fs.writeFile('targetArray.xlsx',buffer,err=>{
    if(err) {
        console.log(err)
        return err
    }
    //fs.readFile('hospital.json')
    console.log('success')
})*/

/*fs.writeFile('diff.json',JSON.stringify(diff),err=>{
  if(err) {
    console.log(err)
    return err
  }
  //fs.readFile('hospital.json')
  console.log('success')

})*/
