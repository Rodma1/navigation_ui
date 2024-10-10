<template>
    <div class="login-container">
        <el-form :model="loginForm" @submit.native.prevent="handleLogin">
            <el-form-item label="用户名">
                <el-input v-model="loginForm.principal" placeholder="请输入用户名"></el-input>
            </el-form-item>
            <el-form-item label="密码">
                <el-input v-model="loginForm.credential" type="password" placeholder="请输入密码"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="handleLogin">登录</el-button>
            </el-form-item>
            <el-button @click="toHome">首页</el-button>
        </el-form>
    </div>
</template>

<script>
import {sm2} from "sm-crypto";

export default {
    name: 'LoginView',
    data() {
        return {
            loginForm: {
                principal: '',
                credential: '',
            },
            publicKey: "04573d0c49f04590cd81a0607a2d9eef0e8cd882e1bc4d9f0bb2e5ab38599c5f603a20ec4b79b71dad55e9b754cf2ab363954220de757138afa51fa6d0e097fa23"

        };
    },
    methods: {
        handleLogin() {
            // 使用 SM2 公钥加密
            const cipherMode = 1  // 1 - C1C3C2，0 - C1C2C3，默认为1
            const form = {};
            form.principal = this.loginForm.principal
            form.credential = sm2.doEncrypt(this.loginForm.credential, this.publicKey, cipherMode) // sm2加密
            // 模拟登录逻辑，可以调用后端API
            this.axios.post('/api/user/doLogin', form)
                .then(response => {
                    const code = response.data.code;
                    if (code !== 200) {
                        this.$message.error("登录失败,用户名或密码错误");
                        return
                    }
                    const data = response.data.data
                    localStorage.setItem('Authorization',data)
                    this.$router.push('/home');  // 登录成功后跳转到首页
                })
                .catch(error => {
                    console.error("登录失败：", error);
                    this.$message.error("用户名或密码错误");
                });
        },
        toHome() {
            this.$router.push('/home')
        }
    }
};
</script>

<style scoped>
.login-container {
    width: 300px;
    margin: 100px auto;
    padding: 30px;
    border: 1px solid #dcdcdc;
    border-radius: 5px;
    background-color: #f9f9f9;
}
</style>
