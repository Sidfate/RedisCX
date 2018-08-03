<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="item in breadList" :key="item.key">
        <router-link :to="item.path">{{ item.title }}</router-link>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script>
export default {
  created() {
    this.getBreadcrumb()
  },
  data() {
    return {
      breadList: []
    }
  },
  watch: {
    $route() {
      this.getBreadcrumb()
    }
  },
  methods: {
    getBreadcrumb() {
      console.log(this.$route)
      const name = this.$route.name

      if(name === 'Keys') {
        this.breadList.push({
          key: 'keys',
          title: 'db'+this.$route.params['db'],
          path: this.$route.path
        })
        return
      }
      if(name === 'DB') {
        this.breadList = [{
          key: 'db',
          title: this.$route.params['name'],
          path: this.$route.path
        }]
        return
      }

      this.breadList = []
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .app-breadcrumb.el-breadcrumb {
    display: inline-block;
    font-size: 14px;
    line-height: 50px;
    margin-left: 10px;
    .no-redirect {
      color: #97a8be;
      cursor: text;
    }
  }
</style>
