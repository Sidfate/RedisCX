<template>
  <div class="app-container" v-loading.body="loadingKeys" element-loading-text="Scanning..." style="padding-top: 10px;">
    <el-tabs v-model="activeKey" @edit="handleTabsEdit" type="border-card">
      <el-tab-pane name="keys" :closable="false">
        <span slot="label"><i class="el-icon-location"></i> Keys</span>
        <div class="operation-container">
          <el-alert
                  :title="searchTitle"
                  type="success" style="margin-bottom: 10px">
          </el-alert>
          <el-button class="filter-item" size="mini" type="danger" icon="el-icon-delete" :disabled="!batchStatus" @click="onBatchDeleteKeys">Delete</el-button>
          <el-button type="primary" size="mini" icon="el-icon-plus" @click="keyFormVisible = true">Create a new key</el-button>

          <div class="search-container">
            <el-autocomplete
                    class="inline-input"
                    v-model="listQuery.key"
                    :fetch-suggestions="querySearch"
                    placeholder="search for key"
                    @keyup.enter.native="handleFilter"
                    size="mini"
            >
              <el-button slot="append" icon="el-icon-search" @click="handleFilter"></el-button>
            </el-autocomplete>
          </div>
        </div>
        <template v-if="isShowAllKeys">
          <el-table :data="keys"
                    fit highlight-current-row
                    style="margin: 15px 0;clear: both;"
                    size="small"
                    @row-contextmenu="onOpenMenu"
                    @row-dblclick="onShowValueByDblclick"
                    @selection-change="handleSelectionChange"
                    :header-cell-style="{background: '#f5f7fa'}"
          >
            <el-table-column
                    type="selection"
                    width="55">
            </el-table-column>
            <el-table-column label="key">
              <template slot-scope="scope">
                {{scope.row}}
              </template>
            </el-table-column>
            <!--<el-table-column label="Operation" width="100">-->
              <!--<template slot-scope="scope">-->
                <!--<el-button type="text" size="mini" style="color: #F56C6C;" @click="onDeleteKey(scope.row)">Delete</el-button>-->
              <!--</template>-->
            <!--</el-table-column>-->
          </el-table>

          <div class="pagination-container">
            <el-pagination background @current-change="handleCurrentChange" :current-page="listQuery.pageIndex" :page-size="listQuery.pageSize" layout="prev, pager, next" :total="total">
            </el-pagination>
          </div>
        </template>
      </el-tab-pane>
      <el-tab-pane v-for="(key, index) in selectedKeys" :label="key | getKeyLabel" :name="key" :key="key" closable>
        <key-tap :one-key="key" @handleTabsEdit="handleTabsEdit"></key-tap>
      </el-tab-pane>
    </el-tabs>

    <el-dialog title="New key" :visible.sync="keyFormVisible" :modal-append-to-body="false" width="50%" top="50px" @close="onClearForm">
      <el-form :model="keyForm" label-position="top" label-width="80px" size="small" :rules="keyFormRules" ref="keyForm">
        <el-form-item label="Key" prop="key">
          <el-input v-model="keyForm.key" auto-complete="off" placeholder="Please input the key."></el-input>
        </el-form-item>
        <el-form-item label="Type">
          <el-select v-model="keyForm.type" style="width: 100%">
            <el-option v-for="(type, index) in keyTypes" :label="type" :value="type"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Value" prop="value">
          <el-alert
                  title="Please enter a value in JSON format."
                  type="warning"
                  show-icon :closable="false" style="height: 30px;margin-bottom: 10px;" v-if="keyForm.type != 'string'">
          </el-alert>
          <el-input
                  type="textarea"
                  placeholder="Please input the value."
                  v-model="keyForm.value" clearable :rows="3">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="keyFormVisible = false" size="small">Cancel</el-button>
        <el-button type="primary" @click="onAddKey" size="small">Save</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import { KeyTap } from './components'
  import { formatString } from "@/utils"
  import {remote} from 'electron'
  import { getSearchHistory, addSearchHistory } from '@/utils/localStore'
  import _ from 'lodash'
  import Redis from 'ioredis'

  export default {
    name: "Keys",
    components: {
      KeyTap
    },
    computed: {
      ...mapGetters([
        'handler',
        'selectedName',
        'autoSearch',
        'autoSearchLimit'
      ]),
      menu() {
        const {Menu, MenuItem} = remote

        const menu = new Menu()
        menu.append(new MenuItem({label: 'Open', click: this.onShowValueByMenu}))
        menu.append(new MenuItem({type: 'separator'}))
        menu.append(new MenuItem({label: 'Delete', click: this.onDeleteKeyByMenu}))
        return menu
      }
    },
    watch: {
      multipleSelection(val) {
        this.batchStatus = (val.length > 0)
      }
    },
    filters: {
      getKeyLabel(key) {
        return formatString(key, 8)
      },
    },
    mounted() {
      this.searchHistory = getSearchHistory('keys')
    },
    data() {
      let checkJson = (rule, value, callback) => {
        if(this.keyForm.type !== 'string') {
          try {
            let json = JSON.parse(value)
            console.log(json)
            callback()
          }catch(e) {
            callback(new Error('Invalid JSON text!'))
          }
        }
        callback()
      }
      
      return {
        searchHistory: [],
        keys: [],
        allKeys: [],
        selectedKeys: [],
        selectedKey: null,
        listQuery: {
          key: '',
          count: 10000,
          pageSize: 1000,
          pageIndex: 1
        },
        multipleSelection: [],
        activeKey: 'keys',
        isShowAllKeys: false,
        loadingKeys: false,
        total: 0,
        dbSize: 0,
        keyFormVisible: false,
        keyForm: {
          key: '',
          value: '',
          type: 'string'
        },
        keyFormRules: {
          value: [
            { validator: checkJson, trigger: 'blur' }
          ],
          key: [
            { required: true, message: 'Please input the key!', trigger: 'blur' }
          ]
        },
        keyTypes: [
          'string',
          'hash',
          'set',
          'list'
        ],
        batchStatus: false,
        searchTitle: ''
      }
    },
    async created() {
      const db = this.$route.params['db']
      await this.handler.select(db)
      const dbSize = await this.handler.dbsize()
      if(this.autoSearch && dbSize < this.autoSearchLimit) {
        await this.getKeys()
      }
      this.dbSize = dbSize
    },
    methods: {
      async getKeys() {
        this.loadingKeys = true
        const handler = this.handler
        let key = this.listQuery.key ? '*' + this.listQuery.key + '*' : '*'
        const count = this.listQuery.count

        const dbSize = await this.handler.dbsize()
        const startTime = Math.round(new Date().getTime())
        let allKeys = await this.scan(handler, key, count)
        const endTime = Math.round(new Date().getTime())
        const searchTime = ((endTime-startTime)/1000).toFixed(2)
        let searchTitle = key === '*' ? 'Searched for all keys ' : 'Searched for ['+this.listQuery.key+']'
        searchTitle += ', total '+allKeys.length+', used time '+searchTime+'s.'
        this.searchTitle = searchTitle

        this.total = allKeys.length
        this.allKeys = allKeys
        this.dbSize = dbSize
        this.keysPage()

        this.isShowAllKeys = true
        this.loadingKeys = false
      },
      handleTabsEdit(targetName, action) {
        if (action === 'remove') {
          let tabs = this.selectedKeys
          let activeName = this.activeKey
          if (activeName === targetName) {
            tabs.forEach((tab, index) => {
              if (tab === targetName) {
                let nextTab = tabs[index + 1] || tabs[index - 1]
                if (nextTab) {
                  activeName = nextTab
                }else {
                  activeName = 'keys'
                }
              }
            })
          }

          this.activeKey = activeName
          this.selectedKeys = tabs.filter(tab => tab !== targetName)
        }
      },
      scan(handler, key, count) {
        return new Promise((resolve, reject) => {
          let allKeys = []

          let stream = handler.scanStream({
            match: key,
            count
          })

          stream.on('data', function (resultKeys) {
            console.log(resultKeys)
            allKeys = allKeys.concat(resultKeys)
          })
          stream.on('end', function () {
            resolve(allKeys)
          })
        })
      },
      keysPage() {
        const index = this.listQuery.pageIndex - 1
        const size = this.listQuery.pageSize
        this.keys = this.allKeys.slice(size*index, size*(index+1))
      },
      async handleFilter() {
        await this.getKeys()

        const key = this.listQuery.key
        if(key && key !== '') {
          let searchHistory = this.searchHistory

          if(searchHistory.length >= 5) {
            searchHistory = searchHistory.slice(0, 4)
          }
          searchHistory = searchHistory.filter(v => (v.value != key))
          searchHistory.unshift({value: key.toString()})
          addSearchHistory('keys', searchHistory)

          this.searchHistory = searchHistory
        }
      },
      // 获取key的值
      onShowValueByMenu() {
        if(_.isNull(this.selectedKey)) {
          return
        }

        this.showValue(this.selectedKey)
        this.selectedKey = null
      },
      showValue(key) {
        this.activeKey = key
        let index = this.selectedKeys.indexOf(key)
        if(index === -1) {
          this.selectedKeys.push(key)
        }else {
          this.$set(this.selectedKeys, index, key)
        }
      },
      onShowValueByDblclick(row) {
        this.showValue(row)
      },
      handleCurrentChange(val) {
        this.loadingKeys = true
        this.listQuery.pageIndex = val
        this.keysPage()
        this.loadingKeys = false
      },
      // 删除key
      async onDeleteKey(key) {
        this.$confirm('Are you sure to delete this key?', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(async () => {
          const handler = this.handler
          await handler.del(key)

          const index = this.keys.indexOf(key)
          this.total -= 1
          this.dbSize -= 1
          if (index > -1) {
            this.keys.splice(index, 1)
          }

          this.handleTabsEdit(key, 'remove')
          this.$message.success('Delete the key successfully!')
        })
      },
      async onAddKey() {
        console.log('add key')
        await this.$refs['keyForm'].validate(async (valid) => {
          if (valid) {
            const type = this.keyForm.type
            const handler = this.handler

            let value = null
            try {
              switch (type) {
                case 'string':
                  await handler.set(this.keyForm.key, this.keyForm.value)
                  break
                case 'hash':
                  value = JSON.parse(this.keyForm.value)
                  if(value instanceof Object && !Array.isArray(value)) {
                    let pipeline = this.handler.pipeline()

                    for(let k in value) {
                      pipeline.hset(this.keyForm.key, k, value[k])
                    }
                    await pipeline.exec()
                  }else {
                    throw new Error('Error with hset')
                  }
                  break
                case 'set':
                  value = JSON.parse(this.keyForm.value)
                  if(Array.isArray(value)) {
                    await handler.sadd(this.keyForm.key, ...value)
                  }else {
                    await handler.sadd(this.keyForm.key, value)
                  }
                  break
                case 'list':
                  value = JSON.parse(this.keyForm.value)
                  if(Array.isArray(value)) {
                    let pipeline = this.handler.pipeline()
                    await value.map(async (v, i) => {
                      pipeline.lpush(this.keyForm.key, v)
                    })
                    await pipeline.exec()
                  }else {
                    throw new Error('List key\'s value needs a array!')
                  }
                  break
                default:
                  throw new Error('Invalid type!')
                  return
              }
            }catch (e) {
              this.$message.warning(e.message)
              return
            }
            this.keys.unshift(this.keyForm.key)
            this.keyFormVisible = false
            this.onClearForm()
            this.$message.success('Created a new key successfully!')
          } else {
            console.log('error submit!!')
            return false;
          }
        })

      },
      onClearForm() {
        this.$refs['keyForm'].resetFields()
        this.keyForm.type = 'string'
      },
      querySearch(queryString, cb) {
        const searchHistory = this.searchHistory
        let results = queryString ? searchHistory.filter((search) => {
          return (search.value.indexOf(queryString.toLowerCase()) === 0)
        }) : searchHistory;
        cb(results);
      },
      handleSelectionChange(val) {
        this.multipleSelection = val
      },
      onOpenMenu(row) {
        this.selectedKey = row
        this.menu.popup(remote.getCurrentWindow())
      },
      async onDeleteKeyByMenu() {
        this.$confirm('Are you sure to delete this key?', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(async () => {
          if(await this.deleteKey([this.selectedKey])) {
            this.$message.success('Delete the key successfully!')
          }
        })
      },
      async onBatchDeleteKeys() {
        this.$confirm('Are you sure to delete these keys?', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(async () => {
          console.log(this.multipleSelection)
          if(await this.deleteKey(this.multipleSelection)) {
            this.$message.success('Delete keys successfully!')
            this.multipleSelection = []
          }
        })
      },
      async deleteKey(keys) {
        if(!_.isArray(keys) || _.isEmpty(keys)) {
          return false
        }

        let status = false
        const handler = this.handler
        let pipeline = handler.pipeline()
        keys.forEach((key) => {
          pipeline.del(key)
        })
        await pipeline.exec().then((results) => {
          let error = _.find(results, (o)=> (o[0] instanceof Redis.ReplyError))
          console.log(results)
          if(error) {
            this.$message.error(error[0].message)
          }else {
            keys.forEach((key) => {
              this.handleTabsEdit(key, 'remove')
            })
            this.keys = this.keys.filter((key) => {
              return keys.indexOf(key) === -1
            })
            status = true
          }
        })

        return status
      }
    }
  }
</script>

<style scoped>

</style>