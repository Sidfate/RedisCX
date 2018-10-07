<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="item in breadList" :key="item.key">
        <router-link :to="item.path">{{ item.title }}</router-link>
      </el-breadcrumb-item>
    </transition-group>
    <el-button v-if="breadList.length !== 0" type="text" size="mini" icon="el-icon-refresh" @click="onRefresh" class="refresh-btn"></el-button>
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
      const name = this.$route.name

      if(name === 'Keys') {
        if(this.breadList.length > 1) {
          return
        }
        this.breadList.push({
          key: 'keys',
          title: 'DB-'+this.$route.params['db'],
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
    },
    onRefresh() {
      console.log('refresh')
      let route = Object.assign({}, this.$route)
      route.query['date'] = new Date()
      this.$router.push({
        path: route.path,
        query: {
          t: +new Date()
        }
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .app-breadcrumb.el-breadcrumb {
    display: inline-block;
    font-size: 18px;
    line-height: 50px;
    margin-left: 10px;
    .no-redirect {
      color: #97a8be;
      cursor: text;
    }
    .refresh-btn {
      font-size: 14px;
      margin-left: 5px;
    }
  }
</style>
