<template>
  <el-tabs tab-position="left" style="height: 60vh;">
    <el-tab-pane label="Auto Search">
      <el-form :model="settingForm"
               label-position="left"
               label-width="50%"
               size="small"
               :rules="settingFormRules"
               ref="settingForm"
      >
        <el-form-item label="Auto Search">
          <el-switch v-model="settingForm.autoSearch"></el-switch>
        </el-form-item>
        <el-form-item label="Auto Search Limit" >
          <el-input v-model.number="settingForm.autoSearchLimit" :disabled="!settingForm.autoSearch"></el-input>
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
  </el-tabs>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    name: "SettingModal",
    computed: {
      ...mapGetters([
        'autoSearch',
        'autoSearchLimit',
        'cacheOptions'
      ])
    },
    mounted() {
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
      onSubmit() {
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
        this.cache.checked = val ? this.cache.options : [];
        this.cache.isIndeterminate = false;
      },
      handleCheckedOptionsChange(value) {
        let checkedCount = value.length;
        this.cache.checkAll = checkedCount === this.cache.options.length;
        this.cache.isIndeterminate = checkedCount > 0 && checkedCount < this.cache.options.length;
      }
    }
  }
</script>

<style scoped>
  .check-cache {
    margin-bottom: 20px;
  }
</style>