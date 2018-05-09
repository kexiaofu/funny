//分析缺席

let xlsx = require('node-xlsx').default,
    fs = require('fs');
let dataResource = '名单33'
fs.open(`${__dirname}/json/departmentData.json`,'r+',(err,fd)=>{
    if(err){
        return console.log(err)
    }
    let buf = new Buffer(1024*1024*10);
    fs.read(fd, buf, 0, buf.length, 0, function(err, bytes){
        if (err){
            console.log(err);
        }
        console.log(bytes + "  字节被读取");

        // 仅输出读取的字节
        if(bytes > 0) {
            //console.log(buf.slice(0, bytes).toString());
            let oresource = JSON.parse(buf.slice(0, bytes).toString())

            let workSheetsFromFileTarget = xlsx.parse(`${__dirname}/excel/excel-nowork/${dataResource}.xlsx`);
            let time1 = workSheetsFromFileTarget[0]['data'],obj={},depPeopleCount=0
            oresource.map(dep=>{
                dep.noworkList = dep.list.map(item=>{
                    obj={}
                    for (let code in time1) {
                        if((+time1[code][3]) === (+item.code)){
                            obj = {
                                code : time1[code][3],
                                name : time1[code][4],
                                dep : item.departmentB,
                                nowork :time1[code][14]
                            }
                            break;
                        }
                    }
                    return obj
                })
                if(dep.name === '人力资源部'){
                    console.log(dep.noworkList)
                }
            })
            let noworkCount=0
            let data=[{
                name:'部门每天出勤平均时长',
                data:[['部门','部门缺席数','部门人数','比例']]
            }]
            oresource.map(dep=>{
                noworkCount=0
                depPeopleCount=0
                dep.noworkList.map(item=>{
                    noworkCount+=JSON.stringify(item)!=='{}'?item.nowork:0
                    depPeopleCount+=JSON.stringify(item)!=='{}'?1:0
                })
                if(dep.name === 'BD与活动部'){
                    let oo=1
                    dep.noworkList.map(item=>{
                        console.log(item.name,item.hasOwnProperty('nowork'),JSON.stringify(item)==='{}',oo++)
                    })
                }
                console.log(dep.name,depPeopleCount)
                dep.noworkCount = noworkCount
                dep.depPeopleCount = depPeopleCount
                dep.noworkPrecent = +(noworkCount/depPeopleCount).toFixed(1)
                data[0].data.push([dep.name,noworkCount,depPeopleCount,dep.noworkPrecent])
            })
            fs.writeFile(`${__dirname}/json/departmentPeopleData${dataResource}.json`,JSON.stringify(oresource),err=>{
                if(err) {
                    console.log(err)
                    return err
                }
                //fs.readFile('hospital.json')
                console.log('success')
            })

            var buffer = xlsx.build(data);
            fs.writeFile(`${__dirname}/result/noworkData${dataResource}.xlsx`,buffer,err=>{
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
