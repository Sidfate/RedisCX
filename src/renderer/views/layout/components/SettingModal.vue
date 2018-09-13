<template>
  <div>
    <el-tabs tab-position="left" style="height: 60vh;">
      <el-tab-pane label="Auto Search">
        <el-form :model="settingForm"
                 label-position="left"
                 label-width="180px"
                 size="small"
                 :rules="settingFormRules"
                 ref="settingForm"
        >
          <el-form-item label="Auto Search">
            <el-switch v-model="settingForm.autoSearch"></el-switch>
          </el-form-item>
          <el-form-item label="Auto Search Limit" >
            <el-input v-model.number="settingForm.autoSearchLimit" :disabled="!settingForm.autoSearch" style="max-width: 150px"></el-input>
          </el-form-item>
          <el-form-item label-width="0">
            <el-button type="primary" @click="onSaveSetting">Save</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="Cache">
        <div class="check-cache">
          <el-checkbox :indeterminate="cache.isIndeterminate" v-model="cache.checkAll" @change="handleCheckAllChange">All</el-checkbox>
          <div style="margin: 15px 0;"></div>
          <el-checkbox-group v-model="cache.checked" @change="handleCheckedOptionsChange">
            <el-checkbox v-for="option in cache.options" :label="option" :key="option">{{option}}</el-checkbox>
          </el-checkbox-group>
        </div>
        <el-button type="danger" @click="onRestore">Clean Cache</el-button>
      </el-tab-pane>
      <el-tab-pane label="About">
        <div class="base-info">
          <div class="logo-container">
            <img src="~@/assets/logo.png" class="logo">
          </div>
          <div class="version-container">
            <div class="name">RedisCX</div>
            <div class="version">{{version}}</div>
          </div>
        </div>
        <el-button type="primary" @click="onCheckUpdate">Check for update</el-button>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { shell, remote } from 'electron'

  export default {
    name: "SettingModal",
    computed: {
      ...mapGetters([
        'autoSearch',
        'autoSearchLimit',
        'cacheOptions'
      ]),
      version() {
        return remote.getGlobal('version')
      }
    },
    mounted() {
      console.log(process.versions)
      this.settingForm.autoSearch = this.autoSearch
      this.settingForm.autoSearchLimit = this.autoSearchLimit
      this.cache.options = this.cacheOptions
    },
    data() {
      return {
        settingForm: {
          autoSearch: null,
          autoSearchLimit: null
        },
        settingFormRules: {},
        cache: {
          checkAll: false,
          checked: ['Search history'],
          options: ['Search history', 'Connections'],
          isIndeterminate: true
        }
      }
    },
    methods: {
      onRestore() {
        this.$confirm('Clean cache is irrevocable, Are you sure to continue?', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(async () => {
          // TODO: clean cache by checked options
          this.$store.dispatch('CleanCache', this.cache.checked)
        })
      },
      onSaveSetting() {
        const autoSearch = this.settingForm.autoSearch
        let autoSearchLimit = this.settingForm.autoSearchLimit
        if (autoSearch) {
          this.$store.dispatch('EnableAutoSearch')
          if (!Number.isInteger(autoSearchLimit)) {
            autoSearchLimit = this.autoSearchLimit
          }
          this.$store.dispatch('ChangeAutoSearchLimit', autoSearchLimit)
        } else {
          this.$store.dispatch('DisableAutoSearch')
        }

        this.$message.success('Setting saved!')
        this.settingFormVisible = false
      },
      handleCheckAllChange(val) {
        this.cache.checked = val ? this.cache.options : []
        this.cache.isIndeterminate = false
      },
      handleCheckedOptionsChange(value) {
        let checkedCount = value.length
        this.cache.checkAll = checkedCount === this.cache.options.length
        this.cache.isIndeterminate = checkedCount > 0 && checkedCount < this.cache.options.length
      },
      onCheckUpdate() {
        shell.openExternal('https://github.com/Sidfate/RedisCX/releases')
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .check-cache {
    margin-bottom: 20px;
  }
  .base-info {
    display: flex;
    height: 100px;
    margin-bottom: 20px;
    .logo-container {
      .logo{
        width: 100px;
      }
    }
    .version-container {
      display: flex;
      margin-left: 20px;
      font-size: 28px;
      height: 100%;
      line-height: 100px;
      .version {
        margin-left: 10px;
        color: #C0C4CC;
        font-size: 20px;
      }
    }
  }
</style>