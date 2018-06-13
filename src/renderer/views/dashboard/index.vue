<template>
  <div class="dashboard-container">
    <el-card class="box-card" style="width: 65%;margin: 0 auto">
      <div slot="header" class="clearfix">
        <span>RedisCX</span>
        <el-button type="text" @click="onOpenGithub" style="float: right;padding: 3px 0;">Github</el-button>
      </div>

      <div class="text item">
        Version <span style="color: #F56C6C;"> 0.2.0</span>
      </div>
      <div class="text item">
        Created by
        <el-button type="text" @click="onOpenPersonalSite">Sidfate</el-button>
      </div>
      <div class="text item">
        <el-tag>electron</el-tag>
        <el-tag>element-ui</el-tag>
        <el-tag type="success">vue</el-tag>
      </div>
    </el-card>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import {shell} from 'electron'

  export default {
    name: 'dashboard',
    computed: {
      ...mapGetters([])
    },
    methods: {
      onOpenPersonalSite() {
        shell.openExternal('https://sidfate.com/')
      },
      onOpenGithub() {
        shell.openExternal('https://github.com/Sidfate/redisCX')
      },
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .dashboard {
    &-container {
      margin: 30px;

      .item {
        padding: 10px 0;
        text-align: center;
      }
    }
    &-text {
      font-size: 30px;
      line-height: 46px;
    }
  }
</style>
