<template>
  <div>
    <el-menu class="navbar" mode="horizontal">
      <hamburger class="hamburger-container" :toggleClick="toggleSideBar" :isActive="sidebar.opened"></hamburger>
      <breadcrumb></breadcrumb>

      <div class="avatar-container">
        <div class="avatar-wrapper">
          <el-dropdown>
            <el-button type="text primary" icon="el-icon-setting" class="btn-setting">
              <!--<i class="el-icon-arrow-down el-icon&#45;&#45;right"></i>-->
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>
                <router-link :to="{name: 'ConnectNewForm'}">
                  <el-button type="text primary" icon="el-icon-plus">Connect</el-button>
                </router-link>
              </el-dropdown-item>
              <el-dropdown-item>
                <el-button type="text" style="color: #E6A23C;" icon="el-icon-refresh" @click="onRestore">Restore</el-button>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </el-menu>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'

export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  computed: {
    ...mapGetters([
      'sidebar'
    ])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('ToggleSideBar')
    },
    onRestore() {
      this.$confirm('Restore will delete all your connect and config, Are you sure to do it?', 'Warning', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(async () => {
        this.$store.dispatch('CleanAllSetting')
        this.$router.push({ path: '/dashboard' })
      })
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
  .screenfull {
    position: absolute;
    right: 90px;
    top: 16px;
    color: red;
  }
  .avatar-container {
    height: 50px;
    display: inline-block;
    position: absolute;
    right: 15px;
    .avatar-wrapper {
      cursor: pointer;
      position: relative;
      .btn-setting {
        font-size: 24px;
      }
    }
  }
}
</style>

