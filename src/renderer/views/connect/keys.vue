<template>
  <div class="app-container" v-loading.body="loadingKeys" element-loading-text="Loading...">
    <div class="header-container">
      <el-breadcrumb separator-class="el-icon-arrow-right" style="margin-bottom: 10px;display: inline-block">
        <el-breadcrumb-item :to="{name: 'DB', params: { name: selectedName }}">{{ selectedName }}</el-breadcrumb-item>
        <el-breadcrumb-item>{{ 'db'+this.$route.params['db']+'('+dbSize+')' }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-tabs v-model="activeKey" closable @edit="handleTabsEdit">
      <el-tab-pane label="Keys" name="keys">
        <div class="filter-container">
          <el-input @keyup.enter.native="handleFilter" size="small" style="width: 200px;" class="filter-item" placeholder="search for key" v-model="listQuery.key">
            <el-button slot="append" icon="el-icon-search" @click="handleFilter" size="small"></el-button>
          </el-input>
          <el-button-group style="float: right">
            <el-button type="primary" size="small" icon="el-icon-plus" @click="keyFormVisible = true"></el-button>
            <el-button class="filter-item" size="small" type="warning" icon="el-icon-refresh" @click="handleFilter"></el-button>
          </el-button-group>
        </div>
        <template v-if="isShowAllKeys">
          <div class="search-info" >
            {{ '查询到key的数量'+allKeys.length+", 共计耗时："+searchTime+'s' }}
          </div>
          <el-table :data="keys" fit highlight-current-row style="margin: 15px 0;clear: both;" size="small">
            <el-table-column label="key">
              <template slot-scope="scope">
                <el-button type="text" @click="onShowValue(scope.row)">{{scope.row}}</el-button>
              </template>
            </el-table-column>
            <el-table-column label="Operation" width="100">
              <template slot-scope="scope">
                <el-button type="text" size="mini" style="color: #F56C6C;" @click="onDeleteKey(scope.row)">Delete</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-container">
            <el-pagination background @current-change="handleCurrentChange" :current-page="listQuery.pageIndex" :page-size="listQuery.pageSize" layout="total, prev, pager, next, jumper" :total="total">
            </el-pagination>
          </div>
        </template>
      </el-tab-pane>
      <el-tab-pane v-for="(key, index) in selectedKeys" :label="key | getKeyLabel()" :name="key" :key="key">
        <key-tap :one-key="key"></key-tap>
      </el-tab-pane>
    </el-tabs>

    <el-dialog title="New key" :visible.sync="keyFormVisible" :modal-append-to-body="false" width="50%" top="50px" @close="onClearForm">
      <el-form :model="keyForm" label-position="top" label-width="80px" size="small" :rules="keyFormRules" ref="keyForm">
        <el-form-item label="Key" prop="key">
          <el-input v-model="keyForm.key" auto-complete="off" placeholder="Please input the key."></el-input>
        </el-form-item>
        <el-form-item label="Type">
          <el-select v-model="keyForm.type">
            <el-option label="string" value="string"></el-option>
            <el-option label="hash" value="hash"></el-option>
            <el-option label="set" value="set"></el-option>
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
        <el-button @click="keyFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="onAddKey">Save</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import { KeyTap } from './components'
  import { formatString } from "@/utils"

  export default {
    name: "Keys",
    components: {
      KeyTap
    },
    computed: {
      ...mapGetters([
        'handler',
        'selectedName'
      ])
    },
    filters: {
      getKeyLabel(key) {
        return formatString(key, 8)
      },
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
        keys: [],
        allKeys: [],
        selectedKeys: [],
        listQuery: {
          key: '',
          count: 10000,
          pageSize: 1000,
          pageIndex: 1
        },
        activeKey: 'keys',
        isShowAllKeys: false,
        loadingKeys: false,
        total: 0,
        dbSize: 0,
        maxShowSize: 100000,
        searchTime: 0,
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
        }
      }
    },
    async created() {
      const db = this.$route.params['db']
      await this.handler.select(db)
      const dbSize = await this.handler.dbsize()
      if(dbSize < this.maxShowSize) {
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
        console.log("scan 所用时间"+ ((endTime-startTime)/1000).toFixed(2))
        this.searchTime = ((endTime-startTime)/1000).toFixed(2)

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
      },
      // 获取key的值
      async onShowValue(key) {
        this.activeKey = key
        let index = this.selectedKeys.indexOf(key)
        console.log(index)
        if(index === -1) {
          this.selectedKeys.push(key)
        }else {
          this.$set(this.selectedKeys, index, key)
        }
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
          console.log(123)
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
                    const pipeRes = await pipeline.exec()
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
                default:
                  this.$message.warning('Invalid type!')
                  return
              }
            }catch (e) {
              this.$message.warning(e.message)
              return
            }
            this.keyFormVisible = false;
            this.onClearForm()
            this.$message.success('Created a new key successfully!')
          } else {
            console.log('error submit!!');
            return false;
          }
        })

      },
      onClearForm() {
        this.$refs['keyForm'].resetFields()
        this.keyForm.type = 'string'
      }

    }
  }
</script>

<style scoped>
  .search-info {
    clear: both;
    font-size: 12px;
    color: #909399;
    margin-top: 10px;
    float: right;
  }
  .el-form-item--small.el-form-item {
    margin-bottom: 10px;
  }
</style>