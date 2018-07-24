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
        <el-button type="primary" @click="onSaveConnect">Save</el-button>
        <el-button @click="onTestConnect">Test Connection</el-button>
        <el-button @click="onReset">Reset</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import Redis from 'ioredis'

  export default {
    props: [
      'editable'
    ],
    name: "ConnectForm",
    created() {
      if(this.editable) {
        this.editedName = this.$route.params['name']
        this.connectForm = Object.assign({}, this.connectMap[this.editedName])
      }else {
        this.resetForm()
      }
    },
    computed: {
      ...mapGetters([
        'connectMap'
      ])
    },
    data() {
      const checkName = (rule, value, callback) => {
        if(this.connectMap.hasOwnProperty(value)) {
          callback(new Error("Connection name must not be repeated."))
        }else {
          callback()
        }
      };

      return {
        editedName: null,
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
      onSaveConnect() {
        if(this.editable) {
          this.$store.dispatch('EditConnect', { name: this.editedName, connection: this.connectForm })
          this.$message.success('Updated the connection successfully!')
        } else {
          this.$store.dispatch('AddConnect', this.connectForm)
          this.$message.success('Created the connection successfully!')
        }
      },
      async onTestConnect() {
        this.connectForm['lazyConnect'] = true
        const handler = await Redis(this.connectForm)
        await handler.connect().then(() => {
          this.$message.success('Connection successfully!')
        }).catch((e) => {
          // test connection failed
          this.$message.error('Connection failed!')
        }).finally(() => {
          handler.disconnect()
        })
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