<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand">
        <img src="@/assets/logo.png" class="login-logo" />
        <h2 class="login-title">神唱导航</h2>
      </div>
      <el-form :model="loginForm" @submit.native.prevent="handleLogin" class="login-form">
        <el-form-item label="用户名">
          <el-input v-model="loginForm.principal" placeholder="请输入用户名" size="large"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="loginForm.credential"
            type="password"
            placeholder="请输入密码"
            size="large"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" size="large" class="login-btn">登录</el-button>
        </el-form-item>
        <el-button text @click="toHome" class="back-home">返回首页</el-button>
      </el-form>
    </div>
  </div>
</template>

<script>
import { sm2 } from 'sm-crypto'

export default {
  name: 'LoginView',
  data() {
    return {
      loginForm: {
        principal: '',
        credential: '',
      },
      publicKey:
        '04573d0c49f04590cd81a0607a2d9eef0e8cd882e1bc4d9f0bb2e5ab38599c5f603a20ec4b79b71dad55e9b754cf2ab363954220de757138afa51fa6d0e097fa23',
    }
  },
  methods: {
    handleLogin() {
      const cipherMode = 1
      const form = {}
      form.principal = this.loginForm.principal
      form.credential = sm2.doEncrypt(this.loginForm.credential, this.publicKey, cipherMode)
      this.axios
        .post('/user/doLogin', form)
        .then(response => {
          const code = response.data.code
          if (code !== 200) {
            this.$message.error('登录失败,用户名或密码错误')
            return
          }
          const data = response.data.data
          localStorage.setItem('Authorization', data)
          this.$router.push('/home')
        })
        .catch(error => {
          console.error('登录失败：', error)
          this.$message.error('用户名或密码错误')
        })
    },
    toHome() {
      this.$router.push('/home')
    },
  },
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-body);
  padding: var(--space-6);
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-10) var(--space-8);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border-light);
}

.login-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: var(--space-8);
}

.login-logo {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
  margin-bottom: var(--space-3);
}

.login-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  background: linear-gradient(135deg, var(--color-primary), #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.login-form {
  :deep(.el-form-item__label) {
    color: var(--color-text-secondary);
  }
}

.login-btn {
  width: 100%;
}

.back-home {
  width: 100%;
  margin-top: var(--space-2);
}
</style>
