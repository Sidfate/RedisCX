<template>
  <div class="menu-wrapper">
    <template v-for="(item, handlerIndex) in connectMap">
      <router-link :to="{name: 'DB', params: { name: item.connectionName }}" :key="item.connectionName">
        <el-menu-item :index="item.connectionName" :key="item.connectionName" class="submenu-title-noDropdown">
          <svg-icon icon-class="example"></svg-icon>
          <span slot="title">{{ item.connectionName }}</span>
        </el-menu-item>
      </router-link>
    </template>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'

  export default {
    name: 'SidebarItem',
    computed: {
      ...mapGetters([
        'connectMap',
      ]),
      router() {
        console.log(this.$router)
        return 123
      }
    }
  }
</script>
