<template>
  <div>
    <el-menu class="navbar" mode="horizontal">
      <hamburger class="hamburger-container" :toggleClick="toggleSideBar" :isActive="sidebar.opened"></hamburger>
      <breadcrumb></breadcrumb>

      <div class="header-container">
        <router-link :to="{path: '/'}">
          <el-button type="text" class="header-btn" style="margin-right: 10px;"><i class="fa fa-home"></i></el-button>
        </router-link>

        <el-button type="text" class="header-btn" @click="settingVisible = true">
          <i class="fa fa-gear"></i>
        </el-button>
      </div>
    </el-menu>

    <el-dialog
            title="Setting"
            :visible.sync="settingVisible"
            :center="true"
            fullscreen
    >
      <setting-modal></setting-modal>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import SettingModal from './SettingModal'

export default {
  components: {
    Breadcrumb,
    Hamburger,
    SettingModal
  },
  computed: {
    ...mapGetters([
      'sidebar'
    ])
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
    toggleSideBar() {
      this.$store.dispatch('ToggleSideBar')
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.navbar {
  height: 50px;
  line-height: 50px;
  border-radius: 0px !important;
  .hamburger-container {
    line-height: 58px;
    height: 50px;
    float: left;
    padding: 0 10px;
  }
  .header-container {
    height: 50px;
    display: inline-block;
    position: absolute;
    right: 15px;
    .header-btn {
      font-size: 20px;
      color: #909399;
      &:hover {
        color: #409EFF;
      }
    }
  }
}
</style>

