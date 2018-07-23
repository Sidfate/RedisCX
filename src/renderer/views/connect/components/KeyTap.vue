<template>
  <div class="value-container" v-loading.body="loadingValue" element-loading-text="Loading...">
    <div class="value-header">
      <div>
        <el-tag type="success">{{ item.type.toUpperCase() }}</el-tag>
        {{ item.key | getKeyLabel() }}

        <div class="ttl-container">
          <el-input v-model="item.ttl" size="small" @blur="onSetTtl">
            <template slot="prepend">TTL</template>
          </el-input>
        </div>
      </div>

      <el-button-group style="float: right;clear: both;margin: 10px 0;">
        <el-button type="primary" icon="el-icon-plus" size="small" @click="onRefreshKey(item.key)" v-if="item.type !== 'string'"></el-button>
        <el-button type="warning" icon="el-icon-refresh" size="small" @click="onRefreshKey(item.key)"></el-button>
        <el-button type="danger" icon="el-icon-delete" size="small" @click="onDeleteKey(item.key)"></el-button>
      </el-button-group>
    </div>
    <template v-if="item.type === 'string'">
      <json-editor @changed="changeValue" :value="item.value"></json-editor>
      <el-button type="primary" @click="onSetKey">Save</el-button>
    </template>
    <template v-else>
      <el-table :data="item.value" fit highlight-current-row style="margin: 20px 0;" >
        <el-table-column label="row" width="50">
          <template slot-scope="scope">
            {{ scope.$index+1 }}
          </template>
        </el-table-column>
        <template v-if="hasTableKey">
          <el-table-column label="key" width="100">
            <template slot-scope="scope">
              {{ scope.row.key }}
            </template>
          </el-table-column>
        </template>
        <el-table-column label="value">
          <template slot-scope="scope">
            <template v-if="scope.row.edit">
              <el-input class="edit-input" size="small" v-model="scope.row.value"></el-input>
              <el-button class="cancel-btn" size="mini" icon="el-icon-refresh" type="warning" @click="cancelEdit(scope.row)"></el-button>
            </template>
            <span v-else>{{ scope.row.value }}</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="Actions">
          <template slot-scope="scope">
            <el-button-group>
            <el-button v-if="scope.row.edit" type="success" @click="onSetKey(scope.row)" size="mini" icon="el-icon-circle-check-outline"></el-button>
            <el-button v-else type="primary" @click="onEnableEdit(scope.row)" size="mini" icon="el-icon-edit"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="onDeleteKeyValue(scope.row)"></el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </template>


  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { formatString } from "@/utils"
  import JsonEditor from '@/components/JsonEditor'
  import md5 from 'md5'

  export default {
    name: "KeyTap",
    computed: {
      ...mapGetters([
        'handler'
      ])
    },
    components: {
      JsonEditor
    },
    props: [
      'oneKey'
    ],
    filters: {
      getKeyLabel(key) {
        return formatString(key, 20)
      },
    },
    data() {
      return {
        hasTableKey: true,
        loadingValue: false,
        item: {
          key: '',
          ttl: -1,
          value: null,
          type: ''
        }
      }
    },
    async created() {
      await this.getValue(this.oneKey)
    },
    methods: {
      async getValue(key) {
        this.loadingValue = true
        const handler = this.handler

        const type = await handler.type(key)
        let value = null
        const ttl = await handler.ttl(key)
        switch (type) {
          case 'hash':
            value = []
            const hKeys = await handler.hkeys(key)
            for (let hKey of hKeys) {
              value.push({key: hKey, value: await handler.hget(key, hKey), edit: false})
            }
            break
          case 'string':
            let keyValue = await handler.get(key)
            try {
              value = JSON.parse(keyValue)
            }catch (e) {
              value = keyValue
            }
            break
          case 'set':
            value = []
            const setList = await handler.smembers(key)
            setList.map(v => {
              value.push({key: null, value: v, edit: false})
            })
            this.hasTableKey = false
            break
          case 'list':
            value = []
            const listLength = await handler.llen(key)
            const list = await handler.lrange(key, 0, listLength)
            list.map((v, i) => {
              value.push({key: i, value: v, edit: false})
            })
            break
          default:
            this.$message.warning('Can\'t open the key!')
            return
        }

        this.item = {key, value, type, ttl}
        console.log(this.item)
        this.loadingValue = false
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

          this.$emit('handleTabsEdit', key, 'remove')
          this.$message.success('Delete the key successfully!')
        })
      },
      // 刷新key的值
      async onRefreshKey(key) {
        await this.getValue(key)
      },
      async onSetKey(row) {
        this.loadingValue = true
        const handler = this.handler
        const item = this.item

        console.log(row)
        switch (item.type) {
          case 'hash':
            await handler.hset(item.key, row.key, row.value)
            break
          case 'string':
            await handler.set(item.key, item.value)
            break
          case 'set':
            await handler.srem(item.key, row.originValue)
            await handler.sadd(item.key, row.value)
            break
          case 'list':
            await handler.lset(item.key, row.key, row.value)
            break
          default:
            this.$message.warning('Can\'t save the key!')
            return
        }

        if(row) {
          row.edit = false
        }
        this.loadingValue = false
        this.$message.success('Update the key successfully!')
      },
      changeValue(value) {
        this.$set(this.item, 'value', value)
      },
      cancelEdit(row) {
        row.value = row.originValue
        row.edit = false
      },
      onEnableEdit(row) {
        row.originValue = row.value
        row.edit = true
      },
      async onSetTtl() {
        await this.handler.expire(this.item.key, this.item.ttl)
      },
      async onDeleteKeyValue(row) {
        const showKey = typeof val === 'undefined' ? row.$index : row.key
        this.$confirm('Are you sure to delete this item(key: '+showKey+')?', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(async () => {
          this.loadingValue = true
          const handler = this.handler
          const item = this.item

          switch (item.type) {
            case 'hash':
              await handler.hdel(item.key, row.key)
              break
            case 'set':
              await handler.srem(item.key, row.value)
              break
            case 'list':
              const delVal = md5(row.key)
              await handler.lset(item.key, row.key, delVal)
              await handler.lrem(item.key, 0, delVal)
              break
            default:
              this.$message.warning('Can\'t save the key!')
              return
          }

          this.$message.success('Deleted the key successfully!')
          await this.getValue(this.oneKey)
        })
      }
    }
  }
</script>

<style scoped>
 .ttl-container {
   width: 30%;
   max-width: 120px;
   margin-top: 5px;
   float: right;
 }
 .edit-input {
   padding-right: 55px;
 }
 .cancel-btn {
   position: absolute;
   right: 15px;
   top: 12px;
 }
</style>