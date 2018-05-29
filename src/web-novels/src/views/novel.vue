<template>
  <div id="novel">
    <div class="novelContainer">
      <div class="novelItem">
        <input type="text" v-model="novelName" placeholder="请输入小说完整的名称">
        <div class="novelItemName">小说名称</div>
      </div>
      <div class="novelItem">
        <input type="text" v-model="email" placeholder="小说正在下载，下载好将发到您的邮箱">
        <div class="novelItemName">邮箱</div>
      </div>
      <div class="tips">
        输入邮箱，如果小说没有缓存，则不能立即下载，下载好了之后会邮件发给您，如果不输入邮箱，小说也会缓存，您可以稍后再搜索下载
      </div>
      <div class="novelFooter">
        <div class="btn search" v-show="!canDownload" @click="searchNovel">
          搜索
        </div>
        <div class="btn download" v-show="canDownload" @click="downloadNovel">
          下载
        </div>
      </div>
    </div>
    <div>{{item.type | types}}</div>
  </div>
</template>
<script>
  import api from '../api/api';
  export default {
    name:'novel',
    filters:{
      types(type){
        let itype = ''
        switch (type) {
          case 'xxx':
            itype = 'sss';
            break;
        }
        return itype;

      }
    },
    data(){
      return {
        novelName:'',
        email:'',
        canDownload:false,
        downloadInfo:{}
      }
    },
    methods:{
      downloadNovel(){
        if(this.downloadInfo.hasOwnProperty('url')){
          api.toDownload(this.downloadInfo.key,this.downloadInfo.title).then(res=>{
            console.log(res)
            if(res.code === 2000){
              let a = document.createElement('a'),
                  path = res.result.path,
                  opath = path.split('/'),
                  name = opath[opath.length-1]
              a.href = res.result.path
              a.download = name
              a.click()
            }else{
              alert(res.desc)
              if(res.code === 5004){
                this.canDownload = false
              }
            }
          })
        }
      },
      searchNovel(){
        if(this.novelName !=='' && this.email!== ''){
          api.searchNovel(this.novelName,this.email).then(res=>{
            console.log(res)
            if(res.code === 2000){
              alert(res.desc)
              this.canDownload = true
              this.downloadInfo = res.result
            }else if(res.code === 2020){
              if(this.email !==''){
                alert(res.desc+'小说下载好，会发送到您的邮箱的，请注意查收')
              }else{
                alert(res.desc+'请稍后再搜索')
              }
            }
          })
        }
      }
    }
  }
</script>
<style lang="less" scoped>
    #novel{
      .novelContainer{
        width:500px;
        height:300px;
        box-shadow: 0 0 20px #333;
        margin:100px auto;
        border-radius:5px;
        padding:30px;
        box-sizing: border-box;
        .novelFooter{
          display:flex;
          width:350px;
          margin:10px auto;
          .btn{
            width:80px;
            height:32px;
            line-height:32px;
            border:1px solid #06e;
            text-align: center;
            margin-right:10px;
            border-radius:32px;
            color:#06e;
            cursor: pointer;
          }
        }
        .tips{
          font-size: 14px;
          color:#999;
          width:350px;
          margin:0 auto;
        }
        .novelItem{
          position:relative;
          width:350px;
          height:32px;
          line-height:32px;
          display: flex;
          border:1px solid #06e;
          border-radius:5px;
          padding:0 0 0 10px;
          box-sizing:border-box;
          margin:15px auto;
          input{
            width:260px;
            height:30px;
            line-height:30px;
            box-sizing: border-box;
            outline: none;
            border:none;
            float:left;
          }
          .novelItemName{
            float:right;
            height:30px;
            line-height:30px;
            width:80px;
            text-align: center;
            background: #06e;
            color:#fff;
          }
          img{
            width:20px;
            position: absolute;
            right:10px;
            top:6px;
          }
        }
      }
    }
</style>
