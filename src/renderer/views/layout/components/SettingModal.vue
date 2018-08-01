<template>
  <el-dialog
          title="Setting"
          :visible.sync="settingVisible"
          :center="true"
          fullscreen
  >
    <el-tabs tab-position="left" height="100%">
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
        <el-button>Clean Cache</el-button>
      </el-tab-pane>
    </el-tabs>


    <!--<div slot="footer" class="dialog-footer">-->
      <!--<el-button @click="settingFormVisible = false" size="small">Cancel</el-button>-->
      <!--<el-button type="primary" @click="onSubmit" size="small">Save</el-button>-->
    <!--</div>-->
  </el-dialog>
</template>

<script>
  import { mapGetters } from 'vuex'
  export default {
    name: "SettingModal",
    props: [
      'visible'
    ],
    computed: {
      ...mapGetters([
        'autoSearch',
        'autoSearchLimit'
      ])
    },
    watch: {
      visible() {
        this.settingVisible = this.visible
      },
      settingVisible() {
        if(!this.settingVisible) {
          this.$emit('closeModal')
        }
      }
    },
    mounted() {
      this.settingForm.autoSearch = this.autoSearch
      this.settingForm.autoSearchLimit = this.autoSearchLimit
      this.settingVisible = this.visible
    },
    data() {
      return {
        settingVisible: false,
        settingForm: {
          autoSearch: null,
          autoSearchLimit: null
        },
        settingFormRules: {

        }
      }
    },
    methods: {
      onRestore() {
        this.$confirm('Restore will delete all your connect and config, Are you sure to do it?', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(async () => {
          this.$store.dispatch('CleanAllSetting')
          this.$router.push({path: '/dashboard'})
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
      }
    }
  }
</script>

<style scoped>

</style>