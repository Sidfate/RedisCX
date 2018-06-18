<template>
  <div class="value-container" v-loading.body="loadingValue" element-loading-text="Loading...">
    <div class="value-header">
      <div>
        <el-tag type="success">{{ item.type.toUpperCase() }}</el-tag>
        {{ item.key | getKeyLabel() }}

        <el-button-group style="float: right">
          <!--<el-button type="primary" icon="el-icon-plus" size="small" @click="onRefreshKey(item.key)" v-if="item.type !== 'string'"></el-button>-->
          <el-button type="warning" icon="el-icon-refresh" size="small" @click="onRefreshKey(item.key)"></el-button>
          <!--<el-button type="danger" icon="el-icon-delete" size="small" @click="onDeleteKey(item.key)"></el-button>-->
        </el-button-group>
      </div>
      <div class="ttl-container">
        <el-input v-model="item.ttl" size="small">
          <template slot="prepend">TTL</template>
        </el-input>
      </div>
    </div>
    <template v-if="item.type === 'string'">
      <json-editor @changed="changeValue" :value="item.value"></json-editor>
      <el-button type="primary" @click="onSetKey">Save</el-button>
    </template>
    <template v-else>
      <el-table :data="item.value" fit highlight-current-row style="margin: 20px 0;" >
        <el-table-column label="row" width="100">
          <template slot-scope="scope">
            {{ scope.$index+1 }}
          </template>
        </el-table-column>
        <template v-if="hasTableKey">
          <el-table-column label="key" width="100" >
            <template slot-scope="scope">
              {{ scope.row.key }}
            </template>
          </el-table-column>
        </template>
        <el-table-column label="value">
          <template slot-scope="scope">
            <template v-if="scope.row.edit">
              <el-input class="edit-input" size="small" v-model="scope.row.value"></el-input>
              <el-button class='cancel-btn' size="small" icon="el-icon-refresh" type="warning" @click="cancelEdit(scope.row)">Cancel</el-button>
            </template>
            <span v-else>{{ scope.row.value }}</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="Actions" width="120">
          <template slot-scope="scope">
            <el-button v-if="scope.row.edit" type="success" @click="onSetKey(scope.row)" size="small" icon="el-icon-circle-check-outline">Ok</el-button>
            <el-button v-else type="primary" @click="onEnableEdit(scope.row)" size="small" icon="el-icon-edit"></el-button>
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
        const handler = this.handler
        await handler.del(key)

        const index = this.keys.indexOf(key)
        this.total -= 1
        // this.$set(this.selectedHandler, 'dbSize', this.selectedHandler.dbSize-1)
        if (index > -1) {
          this.keys.splice(index, 1)
        }

        this.handleTabsEdit(key, 'remove')
        this.$message.success('Delete the key successfully!')
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
      confirmEdit(row) {

      },
      onEnableEdit(row) {
        row.originValue = row.value
        row.edit = true
      }
    }
  }
</script>

<style scoped>
 .ttl-container {
   width: 30%;
   max-width: 120px;
   margin-top: 5px;
 }
 .edit-input {
   padding-right: 100px;
 }
 .cancel-btn {
   position: absolute;
   right: 15px;
   top: 10px;
 }
</style>