<template>
  <div style="padding-top: 0px" align="left">
<!--    <b-button class="rbutton"  style="border: none;background: transparent;color: #5D70A5; font-size: 12px;padding: 0px;" v-b-modal="'register-modal'">注册账户</b-button>-->
    <b-button class="button1" v-b-modal="'register-modal'">注册</b-button>
    <b-modal id="register-modal"  title="注册账户" centered size="md" hide-footer>
      <b-row>
        <!-- d 不显示左侧图片 -->
        <!-- <b-col id="col-left"></b-col> -->
        <b-col>
          <!-- d 把小框先隐藏 -->
          <!-- <b-card class="card-register" align="left"> -->
            <b-form class="text-center" @submit.prevent>
              <b-form-group label-for="id-account">
                <b-form-input id="id-account" v-model="form.account" maxlength="50" name="email"
                              :placeholder="$t('registerModal.ph-account')" type="text"></b-form-input>
              </b-form-group>
              <b-form-group label-for="id-password">
                <b-form-input id="id-password" v-model="form.password" name="password" :placeholder="$t('registerModal.ph-password')"
                              type="password"></b-form-input>
              </b-form-group>
              <b-form-group label-for="id-password-comfirm">
                <b-form-input id="id-password-comfirm" v-model="form.passwordConfirm" name="password" :placeholder="$t('registerModal.ph-password-comfirm')"
                              type="password"></b-form-input>
              </b-form-group>
            </b-form>

            <div>
              <b-button block id="register-btn" @click="register">{{$t('registerModal.register')}}</b-button>
              <div :style="{'display':showTip? 'block':'none'}" class="tips-error">{{errorDesc}}</div>
            </div>
          <!-- </b-card> -->
        </b-col>
      </b-row>
    </b-modal>
  </div>
</template>

<script>

export default {
  name: 'registerModal',
  data () {
    return {
      form: {
        account: '',
        password: '',
        passwordConfirm: ''
      },
      showTip: false,
      errorDesc: ''
    }
  },
  methods: {
    hideModal (e) {
      this.$bvModal.hide('register-modal')
    },
    resetModal (e) {
      e.preventDefault()
      this.form.account = ''
      this.form.password = ''
      this.form.passwordConfirm = ''
      this.showTip = false
      this.errorDesc = ''
    },
    register () {
      this.$ajax.post('api/user/register', {
        'password': this.form.password,
        'email': this.form.account
      })
        .then((response) => {
          console.log(response)
          const code = response.data.code
          if (code === 1) {
            this.errorDesc = response.data.message + '3秒后将关闭注册框'
            this.showTip = true
            setTimeout(() => { this.hideModal() }, 3000)
          } else {
            this.errorDesc = response.data.message
            this.showTip = true
          }
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }
}
</script>

<style lang="scss" scoped>

  .globalRegisterBtn {
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
    border: 1px solid #2168BE;
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
    color: rgb(23,119,253);
    border: 1px solid rgb(255, 255, 255);
    border-radius:25px;
    //font-size: 30px;
  }
  //d 选中button按钮
  .button1:hover {
    background-color: #1677FD;
    color: white;
  }
  .regfont {
    color: #5D70A5;
    font-weight: initial;
    font-size: 24px;
    font-family: "Helvetica Neue";
    letter-spacing: 0.1em;
    padding-bottom: 10px;
  }
  .card-register {
    width: 400px;
    height: fit-content;
    font-family: "Helvetica Neue";
    alignment: left;
    border-radius: 0.5rem;
    border-color: #5D70A5;
    background: rgba(256,256,256,0.8);
    z-index: 1;
  }
  //d 左侧图片
  #col-left {
    width: 225px;
    height: 250px;
    background: url(../../assets/images/background1.png) 50% 50% no-repeat
  }
  .tips-error{
    padding:2px 10px;margin-top:10px;color:#FFFFFF;background-color:#f2dede
  }
  #register-btn {
    height: 47px;
    padding: 0 18px;
    color: #fff;
    font-size: 18px;
    background: #1677FD;
    //background: #5D70A5 linear-gradient(#6A7FBC, #465FA5);
  }
</style>
