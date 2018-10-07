<template>
  <el-aside width="180px">
      <el-menu
        mode="vertical"
        :default-active="selectedName"
        :collapse="isCollapse"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        collapse-transition
        style="height: 100%;"
      >
        <sidebar-item></sidebar-item>
      </el-menu>
  </el-aside>
</template>

<script>
import { mapGetters } from 'vuex'
import SidebarItem from './SidebarItem'

export default {
  components: { SidebarItem },
  computed: {
    ...mapGetters([
      'sidebar',
      'selectedName'
    ]),
    isCollapse() {
      return !this.sidebar.opened
    }
  },
}
</script>
