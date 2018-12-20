<template>
  <div class="pane-group">
    <div class="pane-sm sidebar">...</div>
    <div class="pane">
      <sidebar-item></sidebar-item>
    </div>
  </div>
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
