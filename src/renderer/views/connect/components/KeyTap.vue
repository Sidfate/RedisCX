<template>
  <div class="value-container" v-loading.body="loadingValue" element-loading-text="Loading...">
    <div class="value-header">
      <div>
        <el-tag type="success">{{ item.type.toUpperCase() }}</el-tag>
        {{ item.key | getKeyLabel() }}

        <el-button-group style="float: right">
          <el-button type="warning" icon="el-icon-refresh" size="small" @click="onRefreshKey(item.key)"></el-button>
          <el-button type="danger" icon="el-icon-delete" size="small" @click="onDeleteKey(item.key)"></el-button>
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
      <el-button type="primary" @click="onSetKey(item)">Save</el-button>
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
        loadingValue: false,
        item: {
          key: '',
          ttl: -1,
          value: '',
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
              value.push({key: hKey, value: await handler.hget(key, hKey)})
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
            value = await handler.smembers(key)
            break;
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
      async onSetKey(item) {
        const handler = this.handler
        await handler.set(item.key, item.value)
        this.$message.success('Update the key successfully!')
      },
      changeValue(value) {
        this.$set(this.item, 'value', value)
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
</style>