<template>
  <div align="left">
    <b-button class="button1" v-b-modal="'login-modal'">登录</b-button>
    <b-modal id="login-modal" title="登录账户" centered size="md" hide-footer>
      <b-row>
        <!-- d 不显示左侧图片 -->
        <!-- <b-col id="col-left"></b-col> -->
        <b-col>
          <!-- d 把小框先隐藏 -->
          <!-- <b-card class="card-login" align="left"> -->
            <b-form>
                <!--        <b-col id="col-left"></b-col>-->
                <b-form class="login-form" @submit.prevent>
                  <!-- <div class="loginfont">登录</div> -->
                  <!-- <p class="login-title">用户名</p> -->
                  <b-form-group label-for="id-account">
                    <b-form-input id="id-account" v-model="form.account" maxlength="50" name="mailOrName"
                                  :placeholder="$t('loginModal.ph-account')" type="text"></b-form-input>
                  </b-form-group>
                  <!-- <p class="login-title" style="padding-top: 0px">密码</p> -->
                  <b-form-group label-for="id-password">
                    <b-form-input id="id-password" v-model="form.password" name="password"
                                  :placeholder="$t('loginModal.ph-password')"
                                  type="password"></b-form-input>
                  </b-form-group>
                </b-form>

      <!--          <p style="color: #b2b2b2;font-size: 14px">{{$t('loginModal.noAccount')}}<a href="#" style="color: #ff9600;">{{$t('loginModal.registerNow')}}</a>-->
      <!--          </p>-->

                <div>
                  <b-button block id="login-btn" @click="login">立即登录</b-button>
                  <div :style="{'display':showTip? 'block':'none'}" class="tips-error">{{errorDesc}}</div>
                </div>
                <p>
                  <b-row>
                    <b-col v-show="false" class="login-title" style="font-size: 12px">
      <!--                <b-form-checkbox-->
      <!--                  id="checkbox-1"-->
      <!--                  v-model="status"-->
      <!--                  name="checkbox-1"-->
      <!--                  value="accepted"-->
      <!--                  unchecked-value="not_accepted"-->
      <!--                >-->
                      <b-form-checkbox
                        id="checkbox-1"
                        name="checkbox-1"
                        value="accepted"
                        unchecked-value="not_accepted"
                      >
                        <div style="padding-top: 2px">自动登录</div>
                      </b-form-checkbox>
                      </b-col>
                    <b-col class="login-title" align="right" style="font-size: 12px">
                      <div style="display: inline" v-show="false" >忘记密码</div>
      <!--                &nbsp;|&nbsp;-->
      <!--                <div style="display: inline" ><a href="#" style="color: #5D70A5;">注册账户</a></div>-->
      <!--                <div style="display: inline" ><register-modal class="modal-button"></register-modal></div>-->
                    </b-col>
                  </b-row>
                </p>
            </b-form>
          <!-- </b-card> -->
        </b-col>
      </b-row>
    </b-modal>
  </div>
</template>

<script>
import registerModal from './registerModal'
export default {
  name: 'loginModal',
  components: {
    registerModal
  },
  data () {
    return {
      form: {
        account: '',
        password: ''
      },
      showTip: false,
      errorDesc: ''
    }
  },
  methods: {
    resetModal (e) {
      // e.preventDefault()
      this.form.account = ''
      this.form.password = ''
      this.showTip = false
      this.errorDesc = ''
    },
    login () {
      this.$ajax.get('api/user/login', {
        params: {
          'password': this.form.password,
          'email': this.form.account
        }})
        .then((response) => {
          console.log(response)
          const code = response.data.code
          console.log(code)
          if (code === 1) {
            localStorage.token = response.data.data
            this.$router.push({path: '/projects'})
          } else {
            this.errorDesc = response.data.message
            this.showTip = true
          }
        })
        .catch((error) => {
          console.log(error)
        })
    }
  },
  mounted () {
    this.resetModal()
  }
}

</script>

<style lang="scss" scoped>

  .globalLoginBtn {
    display: block;
    height: 38px;
    line-height: 38px;
    padding: 0 18px;
    background-color: #009688;
    color: #fff;
    white-space: nowrap;
    text-align: center;
    font-size: 14px;
    border: none;
    border-radius: 2px;
    cursor: pointer;
    opacity: .9;
    filter: alpha(opacity=90);
  }
  .rbutton{
    //border: none transparent;
    border: 1px solid #2168BE;//4D81C6
    border-radius: 30px;
    background: transparent;
    color: #4D81C6;
    font-size: 30px;
    padding: 1px 50px;
  }
  //d 原始button按钮
  .button1 {
    font-size: calc(1vw + 0.5rem);//d 自适应
    -webkit-transition-duration: 0.4s;
    transition-duration: 0.4s;
    padding: 0.5px 35px;
    text-align: left;
    background: transparent;
    color:rgb(23,119,253);
    border: 1px solid rgb(255, 255, 255);
    border-radius:25px;
    //font-size: 30px;
  }
  //d 选中button按钮
  .button1:hover {
    background-color: #1677FD;
    color: white;
  }
  //d 左侧图片
  #col-left {
    width: 225px;
    height: 450px;
    background: url(../../assets/images/logo.png) 50% 50% no-repeat
  }

  .tips-error {
    padding: 2px 10px;
    margin-top: 10px;
    color: #FFFFFF;
    background-color: #f2dede
  }
  //d 左侧图片
  #col-left {
    width: 225px;
    height: 250px;
    background: url(../../assets/images/background1.png) 50% 50% no-repeat
  }
  #login-btn {
    height: 47px;
    padding: 0 18px;
    color: #fff;
    font-size: 18px;
    background: #1677FD;
    //background: #5D70A5 linear-gradient(#6A7FBC, #465FA5);
  }
  .card-login {
    width: 400px;
    height: fit-content;
    font-family: "Helvetica Neue";
    alignment: left;
    border-radius: 0.5rem;
    border-color: #5D70A5;
    background: rgba(256,256,256,0.8);
    z-index: 1;
  }
  .login-title {
    margin-left: 0px;
    color: #5D70A5;
    font-weight: normal;
    font-size: 14px;
    padding-bottom: 0px;
    margin-bottom: 0px;
    padding-top: 10px;
  }
  .loginfont {
    color: #5D70A5;
    font-weight: initial;
    font-size: 24px;
    font-family: "Helvetica Neue";
    letter-spacing: 0.1em;
    padding-bottom: 10px;
  }
  .input_text {
    border-radius: 0;
     background-color: #efefef;
     border-color:#000000;
     border-style:solid;
     border-top-width:0px;
     border-right-width:0px;
     border-bottom-width:1px;
     border-left-width:0px;
    background-color: transparent;
   }
</style>
