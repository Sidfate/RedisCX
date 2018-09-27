<template>
  <div>
    <el-tabs tab-position="left" style="height: 60vh;">
      <el-tab-pane label="Auto Search" style="padding-left: 20px">
        <h1>Auto Search</h1>
        <span v-html="autoSearchDesc"></span>
        <el-form :model="settingForm"
                 label-position="left"
                 label-width="180px"
                 size="small"
                 :rules="settingFormRules"
                 ref="settingForm"
        >
          <el-form-item label="Enabled Auto Search">
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
      <el-tab-pane label="Cache" style="padding-left: 20px">
        <h1>Cache</h1>
        <span v-html="cacheDesc"></span>
        <div class="check-cache">
          <el-checkbox :indeterminate="cache.isIndeterminate" v-model="cache.checkAll" @change="handleCheckAllChange">All</el-checkbox>
          <div style="margin: 15px 0;"></div>
          <el-checkbox-group v-model="cache.checked" @change="handleCheckedOptionsChange">
            <el-checkbox v-for="option in cache.options" :label="option" :key="option">{{option}}</el-checkbox>
          </el-checkbox-group>
        </div>
        <el-button type="danger" @click="onRestore">Clean Cache</el-button>
      </el-tab-pane>
      <el-tab-pane label="About" style="padding-left: 20px">
        <h1>About</h1>
        <div class="base-info">
          <div class="logo-container">
            <img src="~@/assets/logo.png" class="logo">
          </div>
          <div class="version-container">
            <div class="name">RedisCX</div>
            <div class="version">{{version}}</div>
          </div>
        </div>
        <div class="community-container">
          <ul>
            <li><el-button type="text" @click="onOpenExternal('https://github.com/Sidfate/RedisCX')">Github</el-button></li>
            <li><el-button type="text" @click="onOpenExternal('https://gitter.im/RedisCX/Lobby#')">Gitter</el-button></li>
          </ul>
        </div>
        <el-button type="primary" @click="onOpenExternal('https://github.com/Sidfate/RedisCX/releases')">Check for update</el-button>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { shell, remote } from 'electron'
  import MarkdownIt from 'markdown-it'
  import ElButton from "element-ui/packages/button/src/button";

  export default {
    components: {ElButton},
    name: "SettingModal",
    computed: {
      ...mapGetters([
        'autoSearch',
        'autoSearchLimit',
        'cacheOptions'
      ]),
      version() {
        return remote.getGlobal('version')
      },
      autoSearchDesc() {
        return new MarkdownIt().render("Auto Search is a function let you control how to show the keys when you step into a db." +
          "When you open a db with large keys(such as million), it const too long to show all the keys, but may be you just want search one key." +
          "So, you can open [Auto search], set the number and when one db\'s keys are lager then the number is wont show all keys.\n\n")
      },
      cacheDesc() {
        return new MarkdownIt().render("Here are some cache in RedisCX:\n" +
          "- create a new connection\n" +
          "- search keyword in db and keys\n" +
          "- other setting options\n" +
          "you can reset these cache\n\n")
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
      onOpenExternal(url) {
        shell.openExternal(url)
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
  .community-container {
  }
</style>