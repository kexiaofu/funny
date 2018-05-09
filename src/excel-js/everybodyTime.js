/*
*
*Author: Fuxiaoke
*Create Time: 2018-04-11 09:55
*
*/

let xlsx = require('node-xlsx').default,
    fs = require('fs');

let getDepartmentList = ()=>{
    let  workSheetsFromFileTarget = xlsx.parse(`${__dirname}/excel/excel-everybody-time/name.xlsx`);
    let address = '',
        peopleList=[],
        excelData={}
    for(let addr in workSheetsFromFileTarget[0]['data']){
        excelData = workSheetsFromFileTarget[0]['data'][addr]
        console.log(excelData[11])
        address = excelData[11]
        if(address !== undefined && (address === '广州' || address==='肇庆')){
            peopleList.push({
                code:excelData[3] ,
                name:excelData[4],
                addr:address,
                departmentA:excelData[7],
                departmentB:excelData[8],
            })
        }
    }

    fs.writeFile(`${__dirname}/json/everybody-time.json`,JSON.stringify(peopleList),err=>{
        if(err) {
            console.log(err)
            return err
        }
        //fs.readFile('hospital.json')
        console.log('success')
    })
}

let departmentData = ()=>{
    fs.open(`${__dirname}/json/everybody-time.json`,'r+',(err,fd)=>{
        if(err){
            return console.log(err)
        }
        let buf = new Buffer(1024*1024);
        fs.read(fd, buf, 0, buf.length, 0, function(err, bytes){
            if (err){
                console.log(err);
            }
            console.log(bytes + "  字节被读取");

            // 仅输出读取的字节
            if(bytes > 0) {
                //console.log(buf.slice(0, bytes).toString());
                let oresource = JSON.parse(buf.slice(0, bytes).toString())
                console.log(oresource)
                let data = [],hadItem=false
                oresource.map(item=>{
                    if(data.length !== 0){
                        hadItem = false
                        for(let i=data.length-1;i>=0;i--){
                            if(data[i].name === item.departmentB){
                                data[i].list.push(item)
                                hadItem = true
                                break;
                            }
                        }
                        if(!hadItem){
                            data.push({
                                name:item.departmentB,
                                list:[item]
                            })
                        }
                    }else{
                        data.push({
                            name:item.departmentB,
                            list:[item]
                        })
                    }

                })
                console.log(data)
                fs.writeFile(`${__dirname}/json/departmentData.json`,JSON.stringify(data),err=>{
                    if(err) {
                        console.log(err)
                        return err
                    }
                    //fs.readFile('hospital.json')
                    console.log('success')
                })
            }
        })
    })
}

let calculateDepartmentTime = ()=> {
    fs.open(`${__dirname}/json/departmentData.json`,'r+',(err,fd)=>{
        if(err){
            return console.log(err)
        }
        let buf = new Buffer(1024*1024);
        fs.read(fd, buf, 0, buf.length, 0, function(err, bytes){
            if (err){
                console.log(err);
            }
            console.log(bytes + "  字节被读取");

            // 仅输出读取的字节
            if(bytes > 0) {
                //console.log(buf.slice(0, bytes).toString());
                let oresource = JSON.parse(buf.slice(0, bytes).toString())
                //console.log(oresource)
                let workSheetsFromFileTarget = xlsx.parse(`${__dirname}/excel/excel-everybody-time/3月份出勤分析(1).xlsx`);
                let time1 = workSheetsFromFileTarget[0]['data'],timeMin=0
                oresource.map(dep=>{
                    dep.timeList = dep.list.map(item=>{
                        timeMin = 0
                        for (let code in time1) {
                            if((+time1[code][0]) === (+item.code)){
                                timeMin = time1[code][4]
                                break;
                            }
                        }
                        console.log(item.name,timeMin)
                        return timeMin
                    })

                    /*dep.hoursList = dep.list.map(item=>{
                        timeMin = 0
                        for (let code in time1) {
                            if((+time1[code][0]) === (+item.code)){
                                timeMin = (time1[code][4]/60).toFixed(1)
                                break;
                            }
                        }
                        console.log(item.name,timeMin)
                        return timeMin
                    })*/

                })

                fs.writeFile(`${__dirname}/json/departmentPeopleTimeData.json`,JSON.stringify(oresource),err=>{
                    if(err) {
                        console.log(err)
                        return err
                    }
                    //fs.readFile('hospital.json')
                    console.log('success')
                })

            }
        })
    })
}

let calculateDepartmentAvgTime = ()=>{
    fs.open(`${__dirname}/json/departmentPeopleTimeData.json`,'r+',(err,fd)=>{
        if(err){
            return console.log(err)
        }
        let buf = new Buffer(1024*1024);
        fs.read(fd, buf, 0, buf.length, 0, function(err, bytes){
            if (err){
                console.log(err);
            }
            console.log(bytes + "  字节被读取");

            // 仅输出读取的字节
            if(bytes > 0) {
                //console.log(buf.slice(0, bytes).toString());
                let oresource = JSON.parse(buf.slice(0, bytes).toString())
                //console.log(oresource)

                let avgData = [],countTime=0,timeListValid=[],timeList = [],name=[]
                let data=[{
                    name:'部门每天出勤平均时长',
                    data:[['部门','部门人数','每天出勤平均时长分钟','部门出勤人列表']]
                }]
                oresource.map(dep=>{
                    countTime = 0
                    timeListValid = []
                    name = []
                    timeList = dep.timeList
                    for(let i=0,l=timeList.length;i<l;i++){
                        if(timeList[i] >0){
                            timeListValid.push({
                                name:dep.list[i].name,
                                time:timeList[i]
                            })
                        }
                    }
                    dep.timeListValid = timeListValid
                    console.log(dep.timeList)
                    dep.timeListValid.map(otime=>{
                        countTime+=otime.time
                        name.push(otime.name)
                    })
                    dep.avgTime = ~~(countTime/(dep.timeListValid.length))
                    data[0].data.push([dep.name,dep.timeListValid.length,dep.avgTime,name.toString()])
                })

                fs.writeFile(`${__dirname}/json/departmentPeopleTimeData.json`,JSON.stringify(oresource),err=>{
                    if(err) {
                        console.log(err)
                        return err
                    }
                    //fs.readFile('hospital.json')
                    console.log('success')
                })

                var buffer = xlsx.build(data);
                fs.writeFile(`${__dirname}/result/everybodyTime.xlsx`,buffer,err=>{
                    if(err) {
                        console.log(err)
                        return err
                    }
                    //fs.readFile('hospital.json')
                    console.log('success')
                })

            }
        })
    })
}
//getDepartmentList()
departmentData()
//calculateDepartmentTime()
//calculateDepartmentAvgTime()