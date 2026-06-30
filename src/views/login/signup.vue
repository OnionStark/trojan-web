<template>
    <div class="signup-container">
        <el-form class="signup-form" :model="form" :rules="signupRules" ref="form" label-position="left">
            <div class="title-container">
                <h3 class="title">{{ $t('signup.title') }}</h3>
            </div>
            <el-form-item prop="username">
                <span class="svg-container">
                    <svg-icon icon-class="user" />
                </span>
                <el-input name="username" v-model="form.username" :placeholder="$t('username')" />
            </el-form-item>
            <el-form-item prop="password1">
                <span class="svg-container">
                    <svg-icon icon-class="password" />
                </span>
                <el-input name="password1" :type="pwdType" v-model="form.password1" :placeholder="$t('inputPass')" show-password/>
            </el-form-item>
            <el-form-item prop="password2">
                <span class="svg-container">
                    <svg-icon icon-class="password"></svg-icon>
                </span>
                <el-input name="password2" :type="pwdType" v-model="form.password2" :placeholder="$t('inputPassAgain')" show-password/>
            </el-form-item>
            <el-form-item prop="code">
                <span class="svg-container">
                    <svg-icon icon-class="password" />
                </span>
                <el-input name="code" @keyup.enter="signup" v-model="form.code" :placeholder="$t('signup.inputCode')" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" style="width:100%;" :loading="loading" @click.prevent="signup">
                {{ $t('register') }}
                </el-button>
            </el-form-item>
            <div class="tips">
                <router-link to="/login">{{ $t('signup.backLogin') }}</router-link>
            </div>
        </el-form>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { signup, registerStatus } from '@/api/permission'
import { base64Encode } from '@/utils/common'
export default {
    data() {
        const validatePass = (rule, value, callback) => {
            if (value.length < 5) {
                callback(new Error(this.$t('passLessError')))
            } else {
                callback()
            }
        }
        const validateRequired = (rule, value, callback) => {
            if (!value) {
                callback(new Error(this.$t('inputNotNull')))
            } else {
                callback()
            }
        }
        return {
            form: {
                username: '',
                password1: '',
                password2: '',
                code: ''
            },
            signupRules: {
                username: [
                    { required: true, trigger: 'blur', validator: validateRequired }
                ],
                password1: [
                    { required: true, trigger: 'blur', validator: validatePass }
                ],
                password2: [
                    { required: true, trigger: 'blur', validator: validatePass }
                ],
                code: [
                    { required: true, trigger: 'blur', validator: validateRequired }
                ]
            },
            loading: false,
            pwdType: 'password'
        }
    },
    computed: {
        ...mapState(['docTitle'])
    },
    created() {
        document.title = this.docTitle
        registerStatus().then((res) => {
            if (!(res.Data && res.Data.enabled)) {
                this.$message.warning(this.$t('signup.closed'))
                this.$router.replace('/login').catch()
            }
        })
    },
    methods: {
        async signup() {
            if (this.form.username === 'admin') {
                this.$message.error(this.$t('user.limitAdmin'))
                return
            }
            if (this.form.password1 !== this.form.password2) {
                this.$message.error(this.$t('passDifferentError'))
                return
            }
            const formData = new FormData()
            formData.set('username', this.form.username)
            try {
                formData.set('password', base64Encode(this.form.password1))
            } catch (e) {
                this.$message.error(this.$t('user.passLimit'))
                return
            }
            formData.set('code', this.form.code)
            this.loading = true
            try {
                const result = await signup(formData)
                if (result.Msg === 'success') {
                    this.$message({
                        message: this.$t('signup.success'),
                        type: 'success'
                    })
                    this.$router.replace('/login').catch()
                } else {
                    this.$message.error(result.Msg)
                }
            } finally {
                this.loading = false
            }
        }
    }
}
</script>

<style lang="scss">
$bg:#283443;
$light_gray:#fff;
$cursor: #fff;

.signup-container {
  .el-input {
    height: 47px;
    width: 92%;
    position: static;

    .el-input__wrapper {
      padding:0;
      box-shadow:none;
    }

    .el-input__suffix {
        background: $bg;
    }

    input {
      background: $bg;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

.signup-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .signup-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 120px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .tips {
    margin-top: 10px;
    text-align: center;

    a {
      color: $light_gray;
      font-size: 14px;
    }
  }
}
</style>
