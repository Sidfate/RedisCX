<template>
  <el-container style="border: 1px solid #eee;height: 100%">
    <el-aside width="180px" style="background-color: rgb(238, 241, 246)">
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

      <el-main v-loading.body="loadingKeys" element-loading-text="连接中...">
        <div class="main-wrapper" v-if="selectedHandler">
          <el-breadcrumb separator-class="el-icon-arrow-right" style="margin-bottom: 15px;">
            <el-breadcrumb-item>{{ selectedHandler.connect.connectionName }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ 'db'+selectedHandler.dbIndex+'('+selectedHandler.dbSize+')' }}</el-breadcrumb-item>
          </el-breadcrumb>

          <el-tabs v-model="activeKey" closable @edit="handleTabsEdit">
            <el-tab-pane label="所有键" name="keys">
              <div class="filter-container">
                <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="search for key" v-model="listQuery.key">
                  <el-button slot="append" icon="el-icon-search" @click="handleFilter"></el-button>
                </el-input>
                <el-button class="filter-item" type="warning" icon="el-icon-refresh" @click="handleFilter" style="float: right"></el-button>
              </div>

              <template v-if="isShowAllKeys">
              <el-table :data="keys" fit highlight-current-row style="margin: 20px 0;">
                <el-table-column label="key">
                  <template slot-scope="scope">
                    <el-button type="text" @click="onShowValue(scope.row)">{{scope.row}}</el-button>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100">
                  <template slot-scope="scope">
                    <el-button type="text" size="mini" style="color: #F56C6C;" @click="onDeleteKey(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>

              <div class="pagination-container">
                <el-pagination background @current-change="handleCurrentChange" :current-page="listQuery.pageIndex" :page-size="listQuery.pageSize" layout="total, prev, pager, next, jumper" :total="total">
                </el-pagination>
              </div>
              </template>
            </el-tab-pane>
            <el-tab-pane v-for="(item, index) in selectedKeys" :label="item.key | getKeyLabel" :name="item.key" :key="item.key"
                         v-loading.body="loadingValue" element-loading-text="Loading"
            >
              <div >
                <div class="value-header">
                  <div>
                    <el-tag type="success">{{ item.type.toUpperCase() }}</el-tag> {{ item.key }}
                    <span style="float: right">{{ "TTL: " + item.ttl }}</span>
                  </div>
                  <el-button-group style="float: right">
                    <el-button type="primary" icon="el-icon-edit"></el-button>
                    <el-button type="warning" icon="el-icon-refresh" @click="onRefreshKey(item.key)"></el-button>
                    <el-button type="danger" icon="el-icon-delete" @click="onDeleteKey(item.key)"></el-button>
                  </el-button-group>
                </div>
                <template v-if="item.type === 'string'">
                  <el-input
                          type="textarea"
                          :autosize="{ minRows: 2, maxRows: 4}"
                          placeholder="请输入内容"
                          v-model="item.value" style="margin-top: 20px;">
                  </el-input>
                </template>
                <template v-else-if="item.type === 'hash'">
                  <el-table :data="item.value" fit highlight-current-row style="margin: 20px 0;" >
                    <el-table-column label="row" width="100">
                      <template slot-scope="scope">
                        {{ scope.$index+1 }}
                      </template>
                    </el-table-column>
                    <el-table-column label="key" width="300">
                      <template slot-scope="scope">
                        {{ scope.row.key }}
                      </template>
                    </el-table-column>
                    <el-table-column label="value">
                      <template slot-scope="scope">
                        {{ scope.row.value }}
                      </template>
                    </el-table-column>
                  </el-table>
                </template>
                <template v-else-if="item.type === 'set'">
                  <el-table :data="item.value" fit highlight-current-row style="margin: 20px 0;" >
                    <el-table-column label="row" width="100">
                      <template slot-scope="scope">
                        {{ scope.$index+1 }}
                      </template>
                    </el-table-column>
                    <el-table-column label="value">
                      <template slot-scope="scope">
                        {{ scope.row }}
                      </template>
                    </el-table-column>
                  </el-table>
                </template>
                <!--<codemirror v-model="item.value"></codemirror>-->
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div v-else class="dashboard">
          <el-card class="box-card" style="width: 65%;margin: 0 auto">
            <div slot="header" class="clearfix">
              <span>RedisCX</span>
              <el-button type="text" @click="onOpenGithub" style="float: right;padding: 3px 0;">Github</el-button>
            </div>

            <div class="text item">
              Version <span style="color: #F56C6C;">亿咖通专用版 Beta 0.1.0</span>
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
        loadingKeys: false,
        loadingValue: false,
        dialogConnectVisible: false,
        connectList: [],
        activeHandler: {},
        connectForm: {
          connectionName: '',
          host: '',
          port: '',
          password: ''
        },
        isShowAllKeys: false,
        defaultConnectConfig: {
          connectionName: '',
          host: 'localhost',
          port: '6379',
          password: ''
        },
        selectedHandler: null,
        keys: [],
        allKeys: [],
        listQuery: {
          key: '',
          cursor: '0',
          count: '10000',
          pageSize: 1000,
          pageIndex: 1
        },
        total: 0,
        activeKey: 'keys',
        selectedKeys: []
      }
    },
    filters: {
      getKeyLabel(key) {
        let label = key
        if(key.length > 10) {
          label = key.substring(0, 10)+'...'
        }

        return label
      },
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
        const dbSize = await handler.dbsize()
        this.selectedHandler = Object.assign({}, { handlerIndex, dbIndex, handler, connect, dbSize })
        await this.fetchData()

        this.selectedKeys = []
        this.activeKey = 'keys'
      },
      // 获取key的值
      async onShowValue(key) {
        this.loadingValue = true
        const handler = this.selectedHandler.handler

        const type = await handler.type(key)
        console.log(type)
        let value = null
        const ttl = await handler.ttl(key)
        switch (type) {
          case 'hash':
            value = []
            const hKeys = await handler.hkeys(key)
            for (let hKey of hKeys) {
              value.push({key: hKey, value: await handler.hget(key, hKey)})
            }
            break
          case 'string':
            value = await handler.get(key)
            break
          case 'set':
            value = await handler.smembers(key)
            break;
          default:
            this.$message.warning('无法打开指定的key值')
            return
        }

        this.activeKey = key
        if(!this.selectedKeys.some(  (v,i)  =>  (v.key === key) )) {
          this.selectedKeys.push({key, value, type, ttl})
        }
        this.loadingValue = false
      },
      // 删除key
      async onDeleteKey(key) {
        const handler = this.selectedHandler.handler
        await handler.del(key)

        const index = this.keys.indexOf(key)
        if (index > -1) {
          this.keys.splice(index, 1)
        }

        this.handleTabsEdit(key, 'remove')
        this.$message.success('删除成功')
      },
      // 刷新key的值
      async onRefreshKey(key) {
        await this.onShowValue(key)
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
        if(!this.listQuery.key) {
          return
        }
        this.isShowAllKeys = true
        this.loadingKeys = true
        const handler = this.selectedHandler.handler
        let allKeys = []
        let cursor = 0
        let total = 0
        let key = this.listQuery.key ? '*' + this.listQuery.key + '*' : '*'
        const count = this.listQuery.count

        do {
          let scanAllKeys = new Redis.Command('scan', [cursor, 'Match', key, 'COUNT', count], {replyEncoding: 'utf8'})
          scanAllKeys.promise.then(result => {
            cursor = parseInt(result[0])
            console.log(cursor)
            total += result[1].length
            allKeys.push(result[1])
          })
          await handler.sendCommand(scanAllKeys)
        }while (cursor !== 0)

        this.loadingKeys = false
        // this.total = this.selectedHandler.dbSize
        this.total = total
        this.keys = allKeys[0]
        this.allKeys = allKeys
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
      },
      handleCurrentChange(val) {
        this.loadingKeys = true
        this.listQuery.pageIndex = val
        this.keys = this.allKeys[val-1]
        this.loadingKeys = false
      },
      handleTabsEdit(targetName, action) {
        if (action === 'remove') {
          let tabs = this.selectedKeys
          let activeName = this.activeKey
          if (activeName === targetName) {
            tabs.forEach((tab, index) => {
              if (tab.key === targetName) {
                let nextTab = tabs[index + 1] || tabs[index - 1]
                if (nextTab) {
                  activeName = nextTab.key
                }else {
                  activeName = 'keys'
                }
              }
            })
          }

          this.activeKey = activeName
          this.selectedKeys = tabs.filter(tab => tab.key !== targetName)
        }
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
  .value-header {
    margin-bottom: 20px;
  }

</style>