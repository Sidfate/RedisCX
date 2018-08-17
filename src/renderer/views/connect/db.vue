<template>
  <div class="app-container" v-loading.body="loadingDbs" element-loading-text="connecting...">
    <div class="operation-container">
      <el-button class="filter-item" size="mini" type="danger" icon="el-icon-delete" @click="onBatchFlush" :disabled="batchStatus">Flush</el-button>

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
            :default-sort="{prop: 'db'}"
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
      </el-table-column>
      <el-table-column
              prop="size"
              label="Size"
              sortable>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import { getSearchHistory, addSearchHistory } from '@/utils/localStore'
  import Redis from 'ioredis'
  import {remote} from 'electron'
  import _ from 'lodash'

  export default {
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
        menu.append(new MenuItem({type: 'separator'}))
        menu.append(new MenuItem({label: 'Flush', click: this.onFlush}))

        return menu
      }
    },
    watch: {
      // 如果路由有变化，会再次执行该方法
      '$route': 'getDbs',
      multipleSelection(val) {
          this.batchStatus = (val.length === 0)
      }
    },
    data() {
      return {
        searchHistory: [],
        dbList: [],
        listQuery: {
          number: null
        },
        loadingDbs: false,
        handler: null,
        multipleSelection: [],
        selectedDb: null,
        batchStatus: true
      }
    },
    async created() {
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
        let dbList = []
        let pipeline = this.handler.pipeline()

        for (let i = 0; i < dbCount; i++) {
          pipeline.select(i)
          pipeline.dbsize()
        }
        const pipeRes = await pipeline.exec()

        pipeRes.map((v, i) => {
          if (i % 2 === 1) {
            dbList.push({
              db: (i - 1) / 2,
              size: parseInt(v[1])
            })
          }
        })

        if (this.listQuery.number) {
          dbList = dbList.filter((v, i) => (i === parseInt(this.listQuery.number)))
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
        const number = parseInt(this.listQuery.number)
        if(!isNaN(number)) {
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
      async onFlush() {
        const db = this.selectedDb
        this.$confirm('Are you sure to flush this db?', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(async () => {
          await this.flushDb([db])
        })
        this.selectedDb = null
      },
      async flushDb(dbs) {
        if(!_.isArray(dbs) || _.isEmpty(dbs)) {
          return
        }

        const handler = this.handler
        let pipeline = handler.pipeline()
        dbs.forEach((db) => {
          pipeline.select(db)
          pipeline.flushdb()
          this.$set(this.dbList, db, {db, size: 0})
        })
        await pipeline.exec((err, results) => {
          let error = _.find(results, (o)=> (o[0] instanceof Redis.ReplyError))

          if(error) {
            this.$message.error(error[0].message)
          }else {
            this.$message.success('Flush db successfully!')
          }
        })
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
        this.$router.push({
          name: 'Keys', params: { db }
        })
      },
      async onBatchFlush() {
        if(_.isEmpty(this.multipleSelection)) {
          return
        }

        this.$confirm('Are you sure to flush these dbs?', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(async () => {
          await this.flushDb(this.multipleSelection.map((item) => item.db))
        })
      }
    }
  }
</script>

<style scoped>
</style>