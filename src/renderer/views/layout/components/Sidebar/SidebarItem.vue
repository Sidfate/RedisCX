<template>
  <div class="menu-wrapper">
    <router-link :to="{name: 'ConnectNewForm'}" >
      <el-menu-item index="0" key="0" class="new-connection" style="color: #FAFAD2">
        <i class="el-icon-circle-plus-outline"></i>
        <span slot="title">New Connection</span>
      </el-menu-item>
    </router-link>

    <template v-for="item in connectMap">
      <router-link :to="{name: 'DB', params: { name: item.connectionName }}" :key="item.connectionName" @contextmenu.native="onOpenMenu(item.connectionName)">
        <el-menu-item :index="item.connectionName" :key="item.connectionName">
          <i class="el-icon-tickets"></i>
          <span slot="title">{{ item.connectionName }}</span>
        </el-menu-item>
      </router-link>
    </template>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import {remote} from 'electron'

  export default {
    name: 'SidebarItem',
    computed: {
      ...mapGetters([
        'connectMap',
        'selectedName',
        'handler'
      ]),
      menu() {
        const {Menu, MenuItem} = remote

        const menu = new Menu()
        menu.append(new MenuItem({label: 'Open', click: this.openConnection}))
        menu.append(new MenuItem({label: 'Close', click: this.closeConnection, enabled: this.selectedName === this.targetName}))
        menu.append(new MenuItem({type: 'separator'}))
        menu.append(new MenuItem({label: 'Edit', click: this.editConnection}))
        menu.append(new MenuItem({label: 'Delete', click: this.deleteConnection}))
        return menu
      }
    },
    data() {
      return {
        targetName: null
      }
    },
    methods: {
      onOpenMenu(name) {
        this.targetName = name
        this.menu.popup(remote.getCurrentWindow())
      },
      openConnection() {
        this.$router.push({name: 'DB', params: { name: this.targetName }})
      },
      closeConnection() {
        this.closeHandler()
        this.$router.push({path: '/dashboard'})
      },
      editConnection() {
        if(this.selectedName === this.targetName) {
          this.$confirm('The connection is being used, Are you sure to close it first?', 'Warning', {
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel',
            type: 'warning'
          }).then(() => {
            this.closeHandler()
            this.$router.push({name: 'ConnectEditForm', params: {name: this.targetName}})
          }).catch(() => {
            return
          })
        }else {
          this.$router.push({name: 'ConnectEditForm', params: {name: this.targetName}})
        }
      },
      deleteConnection() {
        this.$confirm('Are you sure to delete this connection?', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          if(this.selectedName === this.targetName) {
            this.closeHandler()
          }
          this.$store.dispatch('DeleteConnect', this.targetName)
          this.$router.push({path: '/dashboard'})
        })
      },
      closeHandler() {
        this.handler.disconnect()
        this.$store.dispatch('CloseHandler')
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .new-connection {
    height: 50px;
    line-height: 50px;
    background: #E6A23C;
  }
</style>
