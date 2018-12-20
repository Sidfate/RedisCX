<template>
  <div class="dashboard-container">
    1111
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import {shell} from 'electron'

  export default {
    name: 'test',
    computed: {
      ...mapGetters([]),
      avatar() {
        return '~@/assets/logo.png'
      }
    },
    methods: {
      onOpenPersonalSite() {
        shell.openExternal('https://sidfate.com/')
      },
      onOpenGithub() {
        shell.openExternal('https://github.com/Sidfate/redisCX')
      },
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .dashboard-container {
    background-color: #e3e3e3;
    min-height: 100%;
    flex: 1 1 auto;
    padding: 50px 60px 0px;
    .info-container {
      text-align: center;
      position: relative;
      height: 150px;
      .display_name {
        display: block;
        font-size: 48px;
        line-height: 48px;
        color: #212121;
      }
    }
    .logo-container {
      width: 150px;
      height: 150px;
      position: relative;
      cursor: default;
      margin: 0 auto;
      .logo {
        width: 100%;
        height: 100%;
        background-size: 100%;
        overflow: hidden;
        transform-origin: 95% 40%;
        transition: all 0.3s ease-in-out;
      }
    }
  }

  .github-corner:hover .octo-arm {
    animation: octocat-wave 560ms ease-in-out
  }

  @keyframes octocat-wave {
    0%,
    100% {
      transform: rotate(0)
    }
    20%,
    60% {
      transform: rotate(-25deg)
    }
    40%,
    80% {
      transform: rotate(10deg)
    }
  }

  @media (max-width:500px) {
    .github-corner:hover .octo-arm {
      animation: none
    }
    .github-corner .octo-arm {
      animation: octocat-wave 560ms ease-in-out
    }
  }
</style>
