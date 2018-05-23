<template>
  <el-container style="border: 1px solid #eee;height: 100%">
    <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
      <el-menu class="el-menu-vertical-demo" @open="onConnect">
        <el-submenu :index="handlerIndex.toLocaleString()" v-for="(item, handlerIndex) in connectList" :key="item.connectionName" >
          <template slot="title" class="connect-item">
            <i v-if="activeHandler.hasOwnProperty(handlerIndex.toLocaleString())" class="el-icon-circle-close" @click="onDisconnect(handlerIndex)"></i>
            <i v-else class="el-icon-location-outline"></i>
            <span>{{ item.connectionName }}</span>
          </template>

          <template v-if="activeHandler.hasOwnProperty(handlerIndex.toLocaleString())">
          <el-menu-item :index="''+handlerIndex+'-'+dbIndex" v-for="dbIndex in activeHandler[handlerIndex].dbCount" :key="dbIndex" @click="onSelectDB(handlerIndex, dbIndex-1)" class="db-item">
            <i class="el-icon-menu"></i>
            <span slot="title">{{ 'db'+(dbIndex-1) }}</span>
          </el-menu-item>
          </template>
        </el-submenu>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header style="text-align: right; font-size: 12px">
        <el-button type="primary" icon="el-icon-plus" @click="onOpenConnectDialog">连接</el-button>
      </el-header>

      <el-main>
        <div class="main-wrapper" v-if="selectedHandler">
          <div class="filter-container">
            <el-breadcrumb separator-class="el-icon-arrow-right" style="margin-bottom: 15px;">
              <el-breadcrumb-item>{{ selectedHandler.connect.connectionName }}</el-breadcrumb-item>
              <el-breadcrumb-item>{{ 'db'+selectedHandler.dbIndex+'('+keys.length+')' }}</el-breadcrumb-item>
            </el-breadcrumb>
            <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="search for key" v-model="listQuery.key">
            </el-input>
            <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
            <el-button class="filter-item" type="warning" icon="el-icon-refresh" @click="handleFilter">刷新</el-button>

          </div>

          <el-table :data="keys" v-loading.body="loading" element-loading-text="Loading" fit highlight-current-row style="margin: 20px 0;">
            <el-table-column label="key">
              <template slot-scope="scope">
                {{scope.row}}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template slot-scope="scope">
                <el-button type="text" size="mini" >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-else class="dashboard">
          <el-card class="box-card" style="width: 65%;margin: 0 auto">
            <div slot="header" class="clearfix">
              <span>RedisCX</span>
              <el-button type="text" @click="onOpenGithub" style="float: right;padding: 3px 0;">Github</el-button>
            </div>

            <div class="text item">
              Version <span style="color: #F56C6C;">Beta1.0</span>
            </div>
            <div class="text item">
              Created by <el-button type="text" @click="onOpenPersonalSite">Sidfate</el-button>
            </div>
            <div class="text item">
              <el-tag>electron</el-tag>
              <el-tag>element-ui</el-tag>
              <el-tag type="success">vue</el-tag>
            </div>
          </el-card>
        </div>
      </el-main>
    </el-container>

    <el-dialog title="连接redis" :visible.sync="dialogConnectVisible" top="0">
      <el-form inline label-position="left" label-width="80px" >
        <el-form-item label="Name" >
          <el-input v-model="connectForm.connectionName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="Host" >
          <el-input v-model="connectForm.host" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="Port" >
          <el-input v-model="connectForm.port" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="Auth" >
          <el-input v-model="connectForm.password" auto-complete="off" type="password"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="onAddConnect">连接</el-button>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
  import Redis from 'ioredis'
  import { shell } from 'electron'

  export default {
    name: "index",
    data() {
      return {
        loading: false,
        dialogConnectVisible: false,
        connectList: [],
        activeHandler: {},
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
        selectedHandler: null,
        keys: [],
        listQuery: {
          key: '',
          cursor: '0',
          count: '10000'
        },
        total: 0
      }
    },
    watch: {
      activeHandler() {
        console.log(this.activeHandler, this.selectedHandler)
        if(this.selectedHandler && !this.activeHandler.hasOwnProperty(this.selectedHandler.handlerIndex)) {
          this.selectedHandler = null
        }
      }
    },
    created() {
      // this.connectForm = this.defaultConnectConfig
      const localConnect = {
        connectionName: 'test',
        host: 'localhost',
        port: '6379',
        password: ''
      }

      this.connectList.push(localConnect)
      this.connectForm = this.defaultConnectConfig
    },
    methods: {
      // 添加连接
      onAddConnect() {
        const connectName = this.connectForm.connectionName

        for (const connect of this.connectList) {
          console.log(connect.connectionName, connectName)
          if(connect.connectionName === connectName) {
            this.$message.warning('连接名不能重复')
            return
          }
        }
        this.connectList.push(Object.assign({}, this.connectForm))
        this.onCloseConnectDialog()
      },
      // 连接redis
      async onConnect(index) {
        console.log(index)
        const thisConnect = this.connectList[index]
        if(this.activeHandler.hasOwnProperty(index)) {
          return
        }
        console.log(thisConnect)
        const handler = new Redis(thisConnect)

        await handler.config('get', 'databases').then(response => {
          const dbCount = parseInt(response[1])
          this.$set(this.activeHandler, index, { handler, dbCount })
          this.onCloseConnectDialog()
          this.connectForm = this.defaultConnectConfig
        })
      },
      // 选择db，获取所有keys
      async onSelectDB(handlerIndex, dbIndex) {
        const handler = this.activeHandler[handlerIndex].handler
        const connect = this.connectList[handlerIndex]
        await handler.select(dbIndex)
        this.selectedHandler = Object.assign({}, {handlerIndex, dbIndex, handler, connect})
        await this.fetchData()
      },
      // 获取key的值
      async onShowValue(key, expandedRows) {
        const handler = this.selectedHandler.handler

        const type = await handler.type(key)
        let func = null
        switch (type) {
          case 'hash':
            func = 'hget'
            break
          case 'string':
            func = 'get'
            break
          default:
            this.$message.warning('无法打开指定的key值')
            return
        }

        const value = await handler[func](key)
      },
      // 断开连接
      async onDisconnect(index) {
        let activeHandler = Object.assign({}, this.activeHandler)
        await activeHandler[index].handler.disconnect()
        delete activeHandler[index]
        this.activeHandler = Object.assign({}, activeHandler)
      },
      handleFilter() {
        this.fetchData()
      },
      async fetchData() {
        this.loading = true
        const handler = this.selectedHandler.handler
        let allKeys = []
        let cursor = 0
        let key = this.listQuery.key ? '*' + this.listQuery.key + '*' : '*'
        const count = this.listQuery.count

        do {
          let scanAllKeys = new Redis.Command('scan', [cursor, 'Match', key, 'COUNT', count], {replyEncoding: 'utf8'})
          scanAllKeys.promise.then(result => {
            console.log(result)
            cursor = parseInt(result[0])
            allKeys = allKeys.concat(result[1])
          })
          await handler.sendCommand(scanAllKeys)
        }while (cursor !== 0)

        this.loading = false
        this.total = allKeys.length
        this.keys = allKeys
      },
      onOpenConnectDialog() {
        this.dialogConnectVisible = true
      },
      onCloseConnectDialog() {
        this.dialogConnectVisible = false
      },
      onOpenPersonalSite() {
        shell.openExternal('https://sidfate.com/')
      },
      onOpenGithub() {
        shell.openExternal('https://github.com/Sidfate/redisCX')
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
  .db-item {
    height: 25px;
    line-height: 25px;
  }

  .dashboard .item {
    padding: 10px 0;
  }

</style>