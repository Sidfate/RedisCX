<template>
  <el-container style="border: 1px solid #eee">
    <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
      <el-menu :default-openeds="['1']">
        <el-submenu index="1" v-for="item in connectPool">
          <template slot="title"><i class="el-icon-message"></i>{{ item.connectionName }}</template>

          <el-menu-item index="1-4-1">db10</el-menu-item>
        </el-submenu>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header style="text-align: right; font-size: 12px">
        <el-button type="primary" icon="el-icon-plus" @click="onOpenConnectDialog">连接</el-button>
      </el-header>

      <el-main>

      </el-main>
    </el-container>

    <el-dialog title="连接redis" :visible.sync="dialogConnectVisible">
      <el-form :model="connectForm">
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
      this.connectForm = this.defaultConnectConfig
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
          console.log(response)
        })
        this.connectPool.push(Object.assign({}, this.connectForm, { handler }))
        this.connectForm = this.defaultConnectConfig
        this.onCloseConnectDialog()
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
</style>