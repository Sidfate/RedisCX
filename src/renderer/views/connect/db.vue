<template>
  <div class="app-container" v-loading.body="loadingDbs" element-loading-text="connecting...">

    <div class="filter-container" style="margin-bottom: 5px;">
      <el-autocomplete
              class="inline-input"
              v-model="listQuery.number"
              :fetch-suggestions="querySearch"
              placeholder="search for db"
              @keyup.enter.native="onFilter"
              size="small"
              style="width: 200px;"
      >
        <el-button slot="append" icon="el-icon-search" @click="onFilter"></el-button>
      </el-autocomplete>
      <el-button-group style="float: right">
        <el-button class="filter-item" type="warning" size="small" icon="el-icon-refresh" @click="getDbs"></el-button>
      </el-button-group>
    </div>

    <el-table
            :data="dbList"
            style="width: 100%"
            size="mini"
            :default-sort="{prop: 'db'}"
            fit highlight-current-row
    >
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
      <el-table-column
              label="Operation"
              width="120">
        <template slot-scope="scope">
          <router-link :to="{name: 'Keys', params: { db: scope.row.db }}">
            <el-button
                    type="text"
                    size="small">
              Select
            </el-button>
          </router-link>
          <el-button
                  @click="onFlush(scope.row.db)"
                  type="text"
                  size="small" style="color: #F56C6C;">
            Flush
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import { getSearchHistory, addSearchHistory } from '@/utils/localStore'
  import Redis from 'ioredis'

  export default {
    name: "DB",
    computed: {
      ...mapGetters([
        'connectMap'
      ]),
      selectedName() {
        return this.$route.params['name']
      }
    },
    watch: {
      // 如果路由有变化，会再次执行该方法
      '$route': 'getDbs'
    },
    data() {
      return {
        searchHistory: [],
        dbList: [],
        listQuery: {
          number: null
        },
        loadingDbs: false,
        handler: null
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
        const name = this.$route.params['name']
        const thisConnect = this.connectMap[name]
        thisConnect['showFriendlyErrorStack'] = true
        // thisConnect['retry_strategy'] =  function (options) {
        //   console.log(options)
        //   if (options.error.code === 'ECONNREFUSED') {
        //     // End reconnecting on a specific error and flush all commands with a individual error
        //     console.log('连接被拒绝');
        //   }
        //   if (options.times_connected > 10) {
        //     console.log('重试连接超过十次');
        //   }
        //   // reconnect after
        //   return Math.max(options.attempt * 100, 3000);
        // }

        const handler = await Redis(thisConnect)
        this.handler = handler
        this.$store.dispatch('SetHandler', { handler, name })
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
      async onFlush(db) {
        this.$confirm('Are you sure to flush this db?', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(async () => {
          const handler = this.handler
          await handler.select(db)
          await handler.flushdb()
          this.$message.success('Flush db successfully!')
          this.$set(this.dbList, db, {db, size: 0})
        })
      },
      querySearch(queryString, cb) {
        const searchHistory = this.searchHistory
        let results = queryString ? searchHistory.filter((search) => {
          return (search.value.indexOf(queryString.toLowerCase()) === 0)
        }) : searchHistory;
        cb(results);
      },
    }
  }
</script>

<style scoped>

</style>