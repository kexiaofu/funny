
let xlsx = require('node-xlsx').default,
    fs = require('fs');
let dataResource = '1月份',
    monthDay = 31,
    holidayCount = 7
let calculateDepartment = ()=>{
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
                let workSheetsFromFileTarget = xlsx.parse(`${__dirname}/excel/excel-nowork-day/${dataResource}.xlsx`);
                let time1 = workSheetsFromFileTarget[0]['data'],noworkCount=-1
                oresource.map(dep=>{
                    console.log(dep.name)
                    dep.timeList = dep.list.map(item=>{
                        noworkCount=-1
                        for (let code in time1) {
                            if((+time1[code][0]) === (+item.code)){
                                noworkCount=time1[code][2]
                                break;
                            }
                        }
                        //console.log(item.name,noworkCount)
                        return noworkCount
                    })
                })

                return
                fs.writeFile(`${__dirname}/json/departmentPeopleData${dataResource}.json`,JSON.stringify(oresource),err=>{
                    if(err) {
                        console.log(err)
                        return err
                    }
                    //fs.readFile('hospital.json')
                    console.log('success')
                    calculateDepartmentAvgTime()
                })

            }
        })
    })
}

let calculateDepartmentAvgTime = ()=>{
    fs.open(`${__dirname}/json/departmentPeopleData${dataResource}.json`,'r+',(err,fd)=>{
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
                    name:'部门非正常出勤统计',
                    data:[['部门','编号','姓名','非正常出勤天数']]
                }]
                oresource.map(dep=>{
                    countTime = 0
                    timeListValid = []
                    name = []
                    timeList = dep.timeList
                    for(let i=0,l=timeList.length;i<l;i++){
                        if(timeList[i] >-1){
                            timeListValid.push({
                                dep:dep.name,
                                code:dep.list[i].code,
                                name:dep.list[i].name,
                                time:timeList[i]
                            })
                            data[0].data.push([dep.name,dep.list[i].code,dep.list[i].name,timeList[i]])
                        }
                    }
                    dep.timeListValid = timeListValid
                    console.log(dep.timeListValid)
                })

                fs.writeFile(`${__dirname}/json/departmentNoWorkDayCount${dataResource}.json`,JSON.stringify(oresource),err=>{
                    if(err) {
                        console.log(err)
                        return err
                    }
                    //fs.readFile('hospital.json')
                    console.log('success')
                })

                var buffer = xlsx.build(data);
                fs.writeFile(`${__dirname}/result/departmentNoWorkDayCount${dataResource}.xlsx`,buffer,err=>{
                    if(err) {
                        console.log(err)
                        return err
                    }
                    //fs.readFile('hospital.json')
                    console.log('success')
                    departmentNoWorkDayCountAvg()
                })

            }
        })
    })
}

let departmentNoWorkDayCountAvg = ()=>{
    fs.open(`${__dirname}/json/departmentNoWorkDayCount${dataResource}.json`,'r+',(err,fd)=>{
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

                let depPeopleArr=0,depPeopleCount=0,depPeople=0,shouldWorkDay=0,workDay=monthDay-holidayCount
                let data=[{
                    name:'部门非正常出勤统计',
                    data:[['部门','部门人数','月度应出勤天数','部门应出勤总天数','部门非正常出勤总天数','部门非正常出勤平均天数','部门非正常出勤比例']]
                }]
                oresource.map(dep=>{
                    depPeopleArr = dep.timeList.filter(item=>item>=0)
                    depPeople = depPeopleArr.length
                    shouldWorkDay = workDay*depPeople
                    if(depPeople>0){

                        depPeopleCount= calculateAvgDay(depPeopleArr)
                        dep.depPeopleCount = depPeopleCount
                        dep.depPeopleScale = +((depPeopleCount/shouldWorkDay).toFixed(4))*100
                        dep.avgDay = +((depPeopleCount/depPeople).toFixed(1))
                    }else{
                        depPeopleCount = 0
                        dep.avgDay = 0
                    }
                    data[0].data.push([dep.name,depPeople,workDay,shouldWorkDay,dep.depPeopleCount,dep.avgDay,dep.depPeopleScale])
                })

                fs.writeFile(`${__dirname}/json/departmentNoWorkDayCountAvg${dataResource}.json`,JSON.stringify(oresource),err=>{
                    if(err) {
                        console.log(err)
                        return err
                    }
                    //fs.readFile('hospital.json')
                    console.log('success')
                })

                var buffer = xlsx.build(data);
                fs.writeFile(`${__dirname}/result/departmentNoWorkDayCountAvg${dataResource}.xlsx`,buffer,err=>{
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

let calculateAvgDay = (arr)=>{
    let amount=0,
        len = arr.length

    if(len===0) return 0
    arr.map(item=>{
        amount+=item
    })
    return amount
}


calculateDepartment()
//calculateDepartmentAvgTime()
//departmentNoWorkDayCountAvg()