<template>
  <div class="app-container" v-loading.body="loadingDbs" element-loading-text="connecting..." style="display: flex">
    <!--<div v-if="isShowTopDb && topDbs" class="top-container">-->
      <!--<el-card class="box-card">-->
        <!--<div slot="header" class="clearfix" >-->
          <!--<span>DB TOP</span>-->
          <!--<el-button style="float: right; padding: 3px 0; color:#606266;" type="text" icon="el-icon-error" @click="onCloseTopDb"></el-button>-->
        <!--</div>-->
        <!--<div v-for="o in topDbs" :key="o" class="text item" @click="selectDb(o)">-->
          <!--<el-button type="text">{{ 'DB-' + o }}</el-button>-->
        <!--</div>-->
      <!--</el-card>-->
    <!--</div>-->
    <div style="width: 100%;padding: 0 10px;">
      <div class="operation-container">
        <el-button class="filter-item" size="mini" type="danger" icon="el-icon-delete" @click="onBatchFlushDbs" :disabled="!batchStatus">Flush</el-button>

        <div class="search-container">
          <el-autocomplete
                  class="inline-input"
                  v-model="listQuery.number"
                  :fetch-suggestions="querySearch"
                  placeholder="search for db"
                  @keyup.enter.native="onFilter"
                  size="mini"
          >
            <el-button slot="append" icon="el-icon-search" @click="onFilter"></el-button>
          </el-autocomplete>
        </div>
      </div>

      <el-table
              :data="dbList"
              style="width: 100%"
              size="mini"
              fit highlight-current-row
              @selection-change="handleSelectionChange"
              @row-contextmenu="onOpenMenu"
              @row-dblclick="onSelectDbByDblClick"
              :header-cell-style="{background: '#f5f7fa'}"
      >
        <el-table-column
                type="selection"
                width="55">
        </el-table-column>
        <el-table-column
                prop="db"
                label="DB"
                sortable
                width="180">
          <template slot-scope="scope">
            <span>{{ scope.row.db }}</span>
            <i class="fa fa-map-pin" v-if="scope.row.isTop" style="color: #F56C6C"></i>
          </template>
        </el-table-column>
        <el-table-column
                prop="size"
                label="Size"
                sortable>
        </el-table-column>
        <el-table-column
                label="Tags"
                >
          <template slot-scope="scope">
            <el-tag
                    size="small"
                    :key="tag"
                    v-for="tag in scope.row.tags"
                    closable
                    type="info"
                    :disable-transitions="false"
                    @close="handleCloseTag(scope.row.db, tag)">
              {{tag}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
                prop="count"
                sortable
                label="Click Count"
        >
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import { getSearchHistory, addSearchHistory, getDbAssign, setDbAssign } from '@/utils/localStore'
  import Redis from 'ioredis'
  import {remote} from 'electron'
  import _ from 'lodash'
  import ElButton from "element-ui/packages/button/src/button";

  export default {
    components: {ElButton},
    name: "DB",
    computed: {
      ...mapGetters([
        'connectMap'
      ]),
      selectedName() {
        return this.$route.params['name']
      },
      menu() {
        const {Menu, MenuItem} = remote

        const menu = new Menu()
        menu.append(new MenuItem({label: 'Select', click: this.onSelectDbByMenu}))
        menu.append(new MenuItem({label: 'Set Top', click: this.onSetTop}))
        menu.append(new MenuItem({label: 'New Tag', click: this.onNewTag}))
        menu.append(new MenuItem({type: 'separator'}))
        menu.append(new MenuItem({label: 'Flush', click: this.onFlushDbByMenu}))

        return menu
      },
      // topDbs() {
      //   const topDbs = getMlDb(this.selectedName)
      //
      //   if(!topDbs) {
      //     this.isShowTopDb = false
      //     return null
      //   }
      //
      //   console.log(topDbs)
      //   // get the three topest db
      //   const keys = Object.keys(topDbs)
      //   keys.sort(function(a, b){
      //     return topDbs[b]-topDbs[a]
      //   })
      //
      //   console.log(keys)
      //   return keys.slice(0, 3)
      // }
    },
    watch: {
      // 如果路由有变化，会再次执行该方法
      '$route': 'getDbs',
      multipleSelection(val) {
          this.batchStatus = (val.length > 0)
      }
    },
    data() {
      return {
        searchHistory: [],
        dbList: [],
        listQuery: {
          number: null
        },
        isShowTopDb: true,
        loadingDbs: false,
        handler: null,
        multipleSelection: [],
        selectedDb: null,
        batchStatus: false,
        inputVisible: false,
        inputValue: '',
        dbAssign: null
      }
    },
    async created() {
      this.dbAssign = getDbAssign(this.selectedName)
      await this.connect()
      await this.getDbs()
    },
    mounted() {
      this.searchHistory = getSearchHistory('db')
    },
    methods: {
      async getDbs() {
        this.loadingDbs = true
        const dbRes = await this.handler.config('get', 'databases')
        const dbCount = parseInt(dbRes[1])
        // initial db assign config
        this.initConnectDbAssign(dbCount)
        let dbList = []
        let pipeline = this.handler.pipeline()

        for (let i = 0; i < dbCount; i++) {
          pipeline.select(i)
          pipeline.dbsize()
        }
        const pipeRes = await pipeline.exec()

        pipeRes.map((v, i) => {
          if (i % 2 === 1) {
            let db = (i - 1) / 2
            const data = {
              db,
              size: parseInt(v[1]),
              tags: this.dbAssign[db].tags,
              isTop: this.dbAssign[db].isTop,
              count: this.dbAssign[db].count
            }
            if(this.dbAssign[db].isTop) {
              dbList.unshift(data)
              console.log(dbList)
            }else {
              dbList.push(data)
            }
          }
        })

        if (this.listQuery.number) {
          dbList = dbList.filter((v, i) => (v.db === parseInt(this.listQuery.number) || v.tags.indexOf(this.listQuery.number) >= 0))
        }
        this.dbList = dbList
        this.loadingDbs = false
      },
      async connect() {
        this.loadingDbs = true
        const name = this.$route.params['name']
        const thisConnect = this.connectMap[name]
        thisConnect['lazyConnect'] = true
        const handler = await Redis(thisConnect)
        await handler.connect().then(() => {
          this.handler = handler
          this.$store.dispatch('SetHandler', { handler, name })
        }).catch((e) => {
          this.$message.error(e.message)
          handler.disconnect()
          this.$store.dispatch('CloseHandler')
          this.$router.push({path: '/'})
        })
      },
      async onFilter() {
        await this.getDbs()
        const number = this.listQuery.number
        if(!_.isEmpty(number)) {
          let searchHistory = this.searchHistory

          if(searchHistory.length >= 5) {
            searchHistory = searchHistory.slice(0, 5)
          }
          searchHistory = searchHistory.filter(v => (v.value != number))
          searchHistory.unshift({value: number.toString()})
          addSearchHistory('db', searchHistory)

          this.searchHistory = searchHistory
        }
      },
      async flushDb(dbs) {
        if(!_.isArray(dbs) || _.isEmpty(dbs)) {
          return false
        }

        let status = false
        const handler = this.handler
        let pipeline = handler.pipeline()
        console.log(dbs)
        dbs.forEach((db) => {
          pipeline.select(db)
          pipeline.flushdb()
        })
        await pipeline.exec().then((results) => {
          let error = _.find(results, (o)=> (o[0] instanceof Redis.ReplyError))

          if(error) {
            this.$message.error(error[0].message)
          }else {
            dbs.forEach((db)=> {
              this.$set(this.dbList, db, {db, size: 0})
            })
            status = true
          }
        })

        return status
      },
      querySearch(queryString, cb) {
        const searchHistory = this.searchHistory
        let results = queryString ? searchHistory.filter((search) => {
          return (search.value.indexOf(queryString.toLowerCase()) === 0)
        }) : searchHistory
        cb(results)
      },
      handleSelectionChange(val) {
        this.multipleSelection = val
      },
      onOpenMenu(row) {
        this.selectedDb = row.db
        this.menu.popup(remote.getCurrentWindow())
      },
      onSelectDbByMenu(row) {
        this.selectDb(this.selectedDb)
      },
      onSelectDbByDblClick(row) {
        this.selectDb(row.db)
      },
      selectDb(db) {
        // count click db
        this.dbAssign[db].count += 1
        setDbAssign(this.selectedName, this.dbAssign)

        this.$router.push({
          name: 'Keys', params: { db }
        })
      },
      async onFlushDbByMenu() {
        if(_.isNull(this.selectedDb)) {
          return
        }
        this.$confirm('Are you sure to flush this db?', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(async () => {
          if(await this.flushDb([this.selectedDb])) {
            this.$message.success('Flush the db successfully!')
          }
        }).finally(() => {
          this.selectedDb = null
        })
      },
      async onBatchFlushDbs() {
        if(_.isEmpty(this.multipleSelection)) {
          return
        }

        this.$confirm('Are you sure to flush these dbs?', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(async () => {
          if(await this.flushDb(this.multipleSelection.map((item) => item.db))) {
            this.$message.success('Flush dbs successfully!')
          }
        })
      },
      // onCloseTopDb() {
      //   this.isShowTopDb = false
      // },
      onNewTag() {
        this.$prompt('Tag', 'New Tag', {
          confirmButtonText: 'Save',
          cancelButtonText: 'Cancel',
          inputPattern: /[0-9a-zA-Z]+/,
          inputErrorMessage: 'Invalid tag'
        }).then(async ({ value }) => {
          this.dbAssign[this.selectedDb].tags.push(value)
          setDbAssign(this.selectedName, this.dbAssign)
          await this.getDbs()
        }).catch(() => {

        })
      },
      handleCloseTag(db, index, tag) {
        this.dbAssign[db].tags.splice(this.dbAssign[db].tags.indexOf(tag), 1)

        setDbAssign(this.selectedName, this.dbAssign)
        // this.dbList[db].tags = this.dbAssign[db].tags
      },
      onSetTop() {
        console.log(this.dbAssign[this.selectedDb].isTop)
        this.dbAssign[this.selectedDb].isTop = !this.dbAssign[this.selectedDb].isTop ? 1 : 0
        setDbAssign(this.selectedName, this.dbAssign)

        this.getDbs()
        // this.dbList[this.selectedDb].isTop = 1
      },
      initConnectDbAssign(dbCount) {
        if(_.isEmpty(this.dbAssign)) {
          this.dbAssign = []
          for (let i=0; i < dbCount; i++) {

            this.dbAssign.push({
              tags: [],
              count: 0,
              isTop: 0
            })
          }
        }
        setDbAssign(this.selectedName, this.dbAssign)
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .top-container {
    min-width: 120px;

    .clearfix {
      span {
        font-size: 16px
      }
      line-height: 22px;
    }

    .text.item {
      text-align: center;
      &:hover {
        background: #eee;
        cursor: pointer;
      }
    }
  }

  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }

</style>