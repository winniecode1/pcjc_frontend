<template>
  <b-row>
    <b-col lg="2" >
      <!--<p class="class-name">数字服务网络智简设计</p>-->
    </b-col>
    <b-col lg="10">
      <b-navbar class="navbar">
        <b-navbar-nav class="brand-item">
          <!--<b-nav-item  class="navbar-item" @click="goToFangzhen">-->
      <!--        <img src="../../../assets/images/loginOut.png" alt="登出" width="25" height="25" right>-->
      <!--<button class="button2" >&nbsp;仿真平台</button></b-nav-item>-->
          
          <b-nav-item  class="navbar-item" @click.prevent="changeLang">
            <button class="button3" >&nbsp;简｜EN</button>
      <!--        <img src="../../../assets/images/language.png" alt="语言\Language" width="25" height="25" right>-->
          </b-nav-item>
          <b-nav-item  class="navbar-item" @click.prevent="GoToIndex">
      <img src="../../assets/images/zhuye.png"  alt="主页" width="30" height="30" right>
              </b-nav-item>
        </b-navbar-nav>
      </b-navbar>
    </b-col>
  </b-row>
</template>

<script>

export default {
  name: 'navigateBar',
  methods: {
    changeLang () {
      let locale = this.$i18n.locale
      locale === 'zh' ? this.$i18n.locale = 'en' : this.$i18n.locale = 'zh'
    },
    goToFangzhen(){
      window.open('https://www.baidu.com', '_blank')
    },
    goToHomepage(){
      window.open("http://120.55.15.198:6001/")
    },
    GoToIndex(){
      //首页
      this.$router.push({path: '/'})
    }
  }
}
</script>

<style lang="scss" scoped>
.button3 {
    //font-size: calc(1vw + 0.5rem);//d 自适应
    -webkit-transition-duration: 0.4s;
    transition-duration: 0.4s;
    padding: 1px 20px;
    text-align: center;
    color: #4D81C6;
    background-color: transparent;
    border: none;
    //border: 1px solid rgb(255, 255, 255);
    //border-radius:25px;
    //font-size: 30px;
  }
  .navbar {
    //background-color: #5D70A5;
    background-color: transparent;
    justify-content: flex-end;
    right: 30px;
  }

  //d 固定强调button
  .button2 {
    //font-size: calc(1vw + 0.5rem);//d 自适应
    padding: 1px 20px;
    text-align: center;
    background-color: #4D81C6;
    color: white;
    border: 1px solid rgb(255,255,255);
    border-radius:25px;
    line-height: 1.5;
  }

  .brand-item {
    line-height: 30px;
    //font-weight: lighter;
    right: 0;
    //font-size: 18px;
    font-size: calc(0.7vw + 0.5rem);//d 自适应
    font-family: "Helvetica Neue";
    letter-spacing: -0.05em;
    color: #EAF4FE;
    padding: unset;
  }
  .class-name {
    font-size: calc(0.8vw + 0.5rem);//d 自适应
    //font-size: 23px;
    font-weight: normal;
    color: #4D81C6;
    padding-left: 20px;
    margin-top: 10px;
  }
  .navbar-item {
    //font-size: calc(0.3vw + 0.5rem);//d 自适应
    //padding-right: 20px;
    padding-left: 15px;
    margin-top: 20px;
  }
  .nav-link {
    display: block;
    padding: unset;
    color: #4D81C6;
  }
  .navbar-light .navbar-nav .nav-link {
    font-family: "Font Name", sans-serif;
    font-size: 23px;
    font-weight: normal;
    color: #4D81C6;
  }
  #language_btn{
    background: #5ecfba;
    border-radius: 0;
    text-transform: uppercase;
    font-weight: bold;
    border: none;
    font-size: 12px;
    padding: 0 30px;
    line-height: 50px;
  }
  #language_btn.focus, #language_btn:focus, #language_btn:hover {
    color: #333;
    text-decoration: none;
  }
</style>
