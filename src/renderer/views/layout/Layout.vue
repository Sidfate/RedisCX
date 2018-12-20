<template>
  <!--<el-container style="height: 100%;">-->
    <!--<sidebar class="sidebar-container"></sidebar>-->
    <!--<el-container class="is-vertical">-->
      <!--<navbar></navbar>-->
      <!--<app-main></app-main>-->
    <!--</el-container>-->
  <!--</el-container>-->
  <div class="window">
    <div class="window-content">
      <sidebar class="sidebar-container"></sidebar>
      <app-main></app-main>
    </div>
  </div>
</template>

<script>
import { Navbar, Sidebar, AppMain } from './components'

export default {
  name: 'layout',
  components: {
    Navbar,
    Sidebar,
    AppMain
  },
  computed: {
    sidebar() {
      return this.$store.state.app.sidebar
    }
  },
  methods: {
    handleClickOutside() {
      this.$store.dispatch('CloseSideBar', { withoutAnimation: false })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>

</style>
