<template>
  <div class="tap-container" v-loading.body="loadingValue" element-loading-text="Loading...">
    <div class="info-container">
      <div class="info-title">Base info</div>
      <div class="info-main">
        <div class="text item">
          <h2 class="info-item-title" >KEY</h2>
          <el-tooltip class="item" effect="dark" :content="item.key" placement="top-start">
            <div class="info-item-content">{{ item.key | getKeyLabel }}</div>
          </el-tooltip>
        </div>
        <div class="text item">
          <h2 class="info-item-title">TYPE</h2>
          <div class="info-item-content">
            <el-tag size="small" type="info">{{ item.type.toUpperCase() }}</el-tag>
          </div>
        </div>
        <div class="text item">
          <h2 class="info-item-title">TTL</h2>
          <div class="info-item-content">
            <span>{{ item.ttl }}</span>
            <el-button type="text" icon="el-icon-edit" @click="onUpdateTtl"></el-button>
          </div>
        </div>
        <div class="text item">
          <div class="info-item-content">
            <el-button icon="el-icon-refresh" type="warning" @click="onRefreshKey" size="mini" style="width: 100%">Refresh</el-button>
          </div>
        </div>
      </div>
    </div>
    <div class="value-container" v-loading.body="loadingElement" element-loading-text="Scanning...">
      <template v-if="!item.type || item.type === 'string'">
        <json-editor @changed="changeValue" :value="item.value" ></json-editor>
        <el-button type="primary" @click="onSetKey" style="width: 56px" size="small">Save</el-button>
      </template>
      <template v-else>
        <div class="operation-container">
          <el-button class="filter-item" size="mini" type="danger" icon="el-icon-delete" :disabled="!batchStatus" @click="onBatchDeleteElements">Delete</el-button>
          <el-button type="primary" size="mini" icon="el-icon-plus" @click="elementFormVisible = true">Create new element</el-button>

          <div class="search-container">
            <el-input
                    placeholder="Search"
                    v-model="listQuery.key"
                    size="mini"
            >
              <el-button slot="append" icon="el-icon-search" @click="getElement"></el-button>
            </el-input>
          </div>
        </div>
        <el-table
                :data="item.value"
                fit highlight-current-row
                size="small"
                @selection-change="handleSelectionChange"
                :header-cell-style="{background: '#f5f7fa'}"
                @row-contextmenu="onOpenMenu"
        >
          <el-table-column
                  type="selection"
                  width="55">
          </el-table-column>
          <el-table-column label="row" width="50">
            <template slot-scope="scope">
              {{ scope.$index+1 }}
            </template>
          </el-table-column>
          <template v-if="hasElementKey">
            <el-table-column label="key" width="100">
              <template slot-scope="scope">
                {{ scope.row.key }}
              </template>
            </el-table-column>
          </template>
          <template v-if="hasElementScore">
            <el-table-column label="score" width="100">
              <template slot-scope="scope">
                {{ scope.row.score }}
              </template>
            </el-table-column>
          </template>
          <el-table-column label="value">
            <template slot-scope="scope">
              <span>{{ scope.row.value }}</span>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </div>

    <el-dialog title="Save Element" :visible.sync="elementFormVisible" :modal-append-to-body="false" width="50%" top="50px" @closed="onClosedForm">
      <el-form :model="elementForm" label-position="top" label-width="80px" size="small" ref="elementForm">
        <el-form-item label="Key" prop="key" v-if="hasElementKey">
          <el-input v-model="elementForm.key" auto-complete="off" placeholder="Please input the key." :disabled="disabledKey"></el-input>
        </el-form-item>
        <el-form-item label="Value" prop="value">
          <el-input
                  type="textarea"
                  placeholder="Please input the value."
                  v-model="elementForm.value" clearable :rows="3">
          </el-input>
        </el-form-item>
        <el-form-item label="Score" prop="score" v-if="hasElementScore">
          <el-input v-model="elementForm.score" auto-complete="off" placeholder="Please input the score."></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="elementFormVisible = false" size="small">Cancel</el-button>
        <el-button type="primary" size="small" :loading="true" v-if="elementFormLoading">Save</el-button>
        <el-button type="primary" size="small" @click="onSaveElement" v-else>Save</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { formatString } from "@/utils"
  import JsonEditor from '@/components/JsonEditor'
  import {remote} from 'electron'
  import Factory from '@/api'

  const rawForm = {
    key: '',
    value: '',
    score: 0
  }

  export default {
    name: "KeyTap",
    computed: {
      ...mapGetters([
        'handler'
      ]),
      menu() {
        const {Menu, MenuItem} = remote

        const menu = new Menu()
        menu.append(new MenuItem({label: 'Edit', click: this.onShowValueByMenu}))
        menu.append(new MenuItem({label: 'Delete', click: this.onDeleteElementByMenu}))
        return menu
      }
    },
    components: {
      JsonEditor
    },
    props: [
      'oneKey'
    ],
    watch: {
      multipleSelection(val) {
        this.batchStatus = (val.length > 0)
      }
    },
    filters: {
      getKeyLabel(key) {
        return formatString(key, 20)
      },
    },
    data() {
      return {
        elementFormVisible: false,
        hasElementKey: false,
        hasElementScore: false,
        loadingValue: false,
        loadingElement: false,
        elementFormLoading: false,
        disabledKey: false,
        item: {
          key: '',
          ttl: -1,
          value: null,
          type: ''
        },
        selectedElement: null,
        multipleSelection: [],
        batchStatus: false,
        listQuery: {
          key: ''
        },
        element: null,
        elementForm: Object.assign({}, rawForm)
      }
    },
    async created() {
      await this.getValue()
    },
    methods: {
      async getValue() {
        this.loadingValue = true
        let key = this.oneKey
        const element = await (new Factory(this.handler, key)).build()
        this.element = element

        const type = await element.getType(key)
        const ttl = await element.getTtl(key)
        this.hasElementKey = element.hasElementKey
        this.hasElementScore = element.hasElementScore

        this.item = {key, type, ttl}
        await this.getElement()
        // this.$set(this.item, 'key', key)
        // this.$set(this.item, 'type', type)
        // this.$set(this.item, 'ttl', ttl)
        this.loadingValue = false
      },
      async getElement() {
        if(!this.loadingValue) {
          this.loadingElement = true
        }

        const value = await this.element.scan(this.listQuery.key)
        this.$set(this.item, 'value', value)
        this.loadingElement = false
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
      async onRefreshKey() {
        await this.getValue()
      },
      async onSetKey() {
        this.loadingValue = true
        const handler = this.handler
        const item = this.item

        await handler.set(item.key, item.value.replace(/\"/g, ''))
        // await handler.set(item.key, ""+item.value)
        this.loadingValue = false
        this.$message.success('Update the key successfully!')
      },
      changeValue(value) {
        console.log(value)
        this.$set(this.item, 'value', value)
      },
      async deleteElement(list) {
        console.log(list)
        let status = false
        await this.element.batchDelete(list).then((res) => {
          status = true
        }).catch((e) => {
          this.$message.error(e)
        })

        return status
      },
      onOpenMenu(row) {
        this.selectedElement = row
        this.menu.popup(remote.getCurrentWindow())
      },
      handleSelectionChange(val) {
        this.multipleSelection = val
      },
      onDeleteElementByMenu() {
        this.$confirm('Are you sure to delete the element?', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(async () => {
          if(await this.deleteElement([this.selectedElement])) {
            this.$message.success('Deleted the element successfully!')
            await this.getElement()
          }
        })
      },
      onBatchDeleteElements() {
        this.$confirm('Are you sure to delete these elements?', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(async () => {
          if(await this.deleteElement(this.multipleSelection)) {
            this.$message.success('Deleted these elements successfully!')
            await this.getElement()
          }
        })
      },
      async onSaveElement() {
        this.elementFormLoading = true
        await this.element.save(this.elementForm)

        this.elementFormVisible = false
        this.$message.success('Save the element successfully!')
        await this.getElement()
      },
      onShowValueByMenu() {
        this.disabledKey = true
        this.elementForm = Object.assign({}, this.selectedElement)
        if(!this.hasElementKey) {
          this.elementForm.rawValue = this.selectedElement.value
        }
        this.elementFormVisible = true
      },
      onClosedForm() {
        this.disabledKey = false
        this.elementFormLoading = false
        this.elementForm = Object.assign({}, rawForm)
      },
      onUpdateTtl() {
        this.$prompt('TTL', 'Update ttl', {
          confirmButtonText: 'Save',
          cancelButtonText: 'Cancel',
          inputPattern: /[0-9]+/,
          inputErrorMessage: 'Invalid ttl'
        }).then(async ({ value }) => {
          await this.handler.expire(this.item.key, parseInt(value))
          await this.getValue()
        }).catch(() => {

        })
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .tap-container {
    display: flex;
    .text.item {
      margin: 5px 0;
    }
  }
  .info-container {
    padding: 0 10px 0 0;
    flex: 1 1 auto;
    min-width: 150px;
    .info-title {
      font-weight: 700;
      font-size: 16px;
      border-bottom: 1px solid #eee;
    }
    .info-item-title {
      font-weight: 700;
      padding: 5px 0 5px 5px;
      font-size: 14px;
      color: #909399;
      background: #f5f7fa;
    }
    .info-item-content {
      font-size: 14px;
      line-height: 21px;
      color: #606266;
      text-align: justify;
    }
    &::after {
      content: "";
      position: relative;
      right: 0;
      left: auto;
      bottom: 0;
      width: 2px;
      height: 100%;
      background-color: #e4e7ed;
      z-index: 1;
    }
  }
  .value-container {
    /*width: 100%;*/
    min-width: 500px;
    flex: 2 1 auto;
    padding-left: 10px;
    display: flex;
    flex-direction: column;
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