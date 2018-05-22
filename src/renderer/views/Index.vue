<template>
  <el-container style="border: 1px solid #eee;height: 100%">
    <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
      <el-menu
              class="el-menu-vertical-demo">
        <el-submenu index="1" v-for="(item, handlerIndex) in connectPool" :key="item.connectionName" >
          <template slot="title" class="connect-item">
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

      <el-main>
        <div class="main-wrapper" v-if="selectedHandler">
          <div class="filter-container">
            <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="search for key" v-model="listQuery.key">
            </el-input>
            <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
          </div>

          <el-table :data="keys" v-loading.body="loading" element-loading-text="Loading" fit highlight-current-row stripe style="margin: 20px 0;" @expand-change="onShowValue">
            <el-table-column type="expand" >
              <template slot-scope="props">
                <el-form label-position="left" inline class="demo-table-expand">
                  <el-form-item label="key">
                    <span>{{ props.row }}</span>
                  </el-form-item>
                </el-form>
              </template>
            </el-table-column>
            <el-table-column label="key">
              <template slot-scope="scope">
                {{scope.row}}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template slot-scope="scope">
                <el-button type="text" size="mini" >查询</el-button>

                <el-button type="text" size="mini" >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
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
        selectedHandler: null,
        keys: [],
        viewPassword: false,
        listQuery: {
          key: '',
          cursor: '0',
          count: '100'
        },
        total: 0
      }
    },
    created() {
      // this.connectForm = this.defaultConnectConfig
      this.connectForm = {
        connectionName: 'development',
        host: 'r-bp1a0aeca50643a4.redis.rds.aliyuncs.com',
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

        console.log(handler.getBuiltinCommands())
        handler.config('get', 'databases').then(response => {
          const dbCount = parseInt(response[1])
          this.connectPool.push(Object.assign({}, this.connectForm, { handler, dbCount }))
          this.connectForm = this.defaultConnectConfig
          this.onCloseConnectDialog()
        })
      },
      onSelectDB(handlerIndex, dbIndex) {
        this.selectedHandler = this.connectPool[handlerIndex]
        const handler = this.selectedHandler.handler
        handler.select(dbIndex).then(response => {
          console.log(response)
          this.fetchData()
        })
      },
      handleFilter() {
        this.fetchData()
      },
      onShowValue(row, expandedRows) {
        console.log(row)
        console.log(expandedRows)
      },
      fetchData() {
        this.loading = true

        const handler = this.selectedHandler.handler
        // const get = new Redis.Command('scan', ['0'], 'utf8', function (err, result) {
        //   console.log(result);
        // });

        // let allKeys = []
        // let cursor = 0
        // const key = this.listQuery.key ? this.listQuery.key : '*'
        // const count = this.listQuery.count
        // do {
        //   let scanAllKeys = new Redis.Command('scan', [cursor, 'Match', key, 'COUNT', count], {replyEncoding: 'utf8'});
        //   scanAllKeys.promise.then(result => {
        //     console.log(result)
        //     cursor = result[0]
        //     allKeys.concat(result[1])
        //   });
        //   handler.sendCommand(scanAllKeys)
        // }while (cursor === 0)


        handler.keys('*').then(response => {
          this.loading = false
          this.total = response.length
          this.keys = response
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
  .db-item {
    height: 25px;
    line-height: 25px;
  }

</style>