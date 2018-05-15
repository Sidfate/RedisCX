<template>
  <el-container style="border: 1px solid #eee;height: 100%">
    <el-aside width="200px" style="background-color: rgb(238, 241, 246)">

      <el-menu
              class="el-menu-vertical-demo">
        <el-submenu index="1" v-for="(item, handlerIndex) in connectPool" :key="item.connectionName" class="connect-item">
          <template slot="title" >
            <i class="el-icon-location"></i>
            <span>{{ item.connectionName }}</span>
          </template>

          <el-menu-item :index="'1-'+dbIndex" v-for="dbIndex in item.dbCount" :key="dbIndex" @click="onSelectDB(handlerIndex, dbIndex-1)" class="db-item">
            <i class="el-icon-menu"></i>
            <span slot="title">{{ "db"+(dbIndex-1) }}</span>
          </el-menu-item>
        </el-submenu>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header style="text-align: right; font-size: 12px">
        <el-button type="primary" icon="el-icon-plus" @click="onOpenConnectDialog">连接</el-button>
      </el-header>

      <el-main v-loading="loading">

      </el-main>
    </el-container>

    <el-dialog title="连接redis" :visible.sync="dialogConnectVisible" top="0">
      <el-form inline label-position="left" label-width="80px">
        <el-form-item label="连接名" >
          <el-input v-model="connectForm.connectionName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="主机地址" >
          <el-input v-model="connectForm.host" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="端口" >
          <el-input v-model="connectForm.port" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" >
          <el-input v-model="connectForm.password" auto-complete="off" type="password">
            <el-button slot="append" icon="el-icon-view"></el-button>
          </el-input>
        </el-form-item>
        <el-form-item label="密码" v-if="viewPassword">
          <el-input v-model="connectForm.password" auto-complete="off" suffix-icon="el-icon-view"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="onConnect">连接</el-button>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
  import Redis from 'ioredis'

  export default {
    name: "index",
    data() {
      return {
        loading: false,
        dialogConnectVisible: false,
        connectPool: [],
        connectForm: {
          connectionName: '',
          host: '',
          port: '',
          password: ''
        },
        defaultConnectConfig: {
          connectionName: 'test',
          host: 'localhost',
          port: '6379',
          password: ''
        },
        viewPassword: false
      }
    },
    created() {
      // this.connectForm = this.defaultConnectConfig
      this.connectForm = {
        connectionName: 'test',
        host: 'r-bp16391e6e9a1224.redis.rds.aliyuncs.com',
        port: '6379',
        password: 'ecarxdbIMhi9m'
      }
    },
    methods: {
      onOpenConnectDialog() {
        this.dialogConnectVisible = true
      },
      onCloseConnectDialog() {
        this.dialogConnectVisible = false
      },
      onConnect() {
        const handler = new Redis(this.connectForm)

        handler.config('get', 'databases').then(response => {
          const dbCount = parseInt(response[1])
          this.connectPool.push(Object.assign({}, this.connectForm, { handler, dbCount }))
          this.connectForm = this.defaultConnectConfig
          this.onCloseConnectDialog()
        })

      },
      onSelectDB(handlerIndex, dbIndex) {
        console.log(dbIndex)
        const handler = this.connectPool[handlerIndex].handler
        handler.select(dbIndex).then(response => {
          console.log(response)
        })
        this.loading = true
        handler.keys('*').then(response => {
          this.loading = false
          console.log(response)
        })
      }
    }
  }
</script>

<style scoped>

  .el-header {
    background-color: #B3C0D1;
    color: #333;
    line-height: 60px;
  }

  .el-aside {
    color: #333;
  }

  .text {
    font-size: 14px;
  }

  .item {
    padding: 18px 0;
    text-align: center;
    background: #fff;
  }
  .connect-item {
    height: 30px;
    line-height: 30px;
  }
  .db-item {
    height: 25px;
    line-height: 25px;
  }

</style>