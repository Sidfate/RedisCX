<template>
  <div class="app-container">
    <el-form ref="connectForm" :model="connectForm" label-width="60px" style="margin: 20px;" :rules="rules">
      <el-form-item label="Name" prop="connectionName" >
        <el-input v-model="connectForm.connectionName" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="Host" prop="host">
        <el-input v-model="connectForm.host" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="Port" prop="port">
        <el-input v-model="connectForm.port" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="Auth" >
        <el-input v-model="connectForm.password" auto-complete="off" type="password"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onAddConnect">Save</el-button>
        <el-button @click="onReset">Reset</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    name: "ConnectForm",
    created() {
      this.resetForm()
    },
    computed: {
      ...mapGetters([
        'connectMap'
      ])
    },
    data() {
      const checkName = (rule, value, callback) => {
        console.log(this.connectMap)
        if(this.connectMap.hasOwnProperty(value)) {
          callback(new Error("Connection name must not be repeated."))
        }else {
          callback()
        }
      };

      return {
        connectForm: {
          connectionName: '',
          host: '',
          port: '',
          password: ''
        },
        defaultConnectConfig: {
          connectionName: '',
          host: 'localhost',
          port: '6379',
          password: ''
        },
        rules: {
          connectionName: [
            {required: true, message: 'Please input connection name.', trigger: 'blur'},
            {min: 1, max: 15, message: 'Connection name is less than 15 characters.', trigger: 'blur'},
            {validator: checkName, trigger: 'blur'}
          ],
          host: [
            {required: true, message: 'Please input host.', trigger: 'blur'}
          ],
          port: [
            {required: true, message: 'Please input port.', trigger: 'blur'}
          ]
        }
      }
    },
    methods: {
      // 添加连接
      onAddConnect() {
        this.$store.dispatch('AddConnect', this.connectForm)

        this.$message.success('Created the connection successfully!')
      },
      onReset() {
        this.$refs['connectForm'].resetFields()
        this.resetForm()
      },
      resetForm() {
        this.connectForm = Object.assign({}, this.defaultConnectConfig)
      }
    }
  }
</script>

<style scoped>
  .line{
    text-align: center;
  }
</style>