<template>
  <div class="navigateBarVue">
    <b-row>
      <b-col lg="2" >
        <!--<p class="class-name">课题一</p>-->
      </b-col>
      <b-col lg="10">
        <b-navbar toggleable="lg">
          <b-navbar-nav class="brand-item" right>
            <!--<b-nav-item  class="navbar-item" @click="goToFangzhen">-->
      <!--        <img src="../../../assets/images/loginOut.png" alt="登出" width="25" height="25" right>-->
      <!--<button class="button2" >&nbsp;仿真平台</button></b-nav-item>-->
            <b-nav-item  class="navbar-item" @click.prevent="changeLang">
      <!--        <img src="../../../assets/images/language.png" alt="语言\Language" width="25" height="25" right>-->
              <button class="button3">&nbsp;简｜EN</button></b-nav-item>
            <b-nav-item class="navbar-item"  @click.prevent="GoToIndex">
              <button class="button1" >&nbsp;登出</button>
              </b-nav-item>
              <b-nav-item  class="navbar-item" @click.prevent="goToHomepage">
      <img src="../../../assets/images/zhuye.png" alt="主页" width="30" height="30" right>
              </b-nav-item>
          </b-navbar-nav>
      <!--    <b-navbar-brand >-->
      <!--      <img src="../../../assets/WHU.png"  alt="武汉大学" width="50" height="50">-->
      <!--      {{$t('navigateBar.brand')}}-->
      <!--    </b-navbar-brand>-->

      <!--    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>-->

      <!--    <b-collapse id="nav-collapse" is-nav>-->
      <!--      <b-navbar-nav class="ml-auto">-->
      <!--        <b-nav-item-dropdown :text="$t('navigateBar.language')" right>-->
      <!--          <b-dropdown-item href="" @click.prevent="changeLangCN">{{$t('navigateBar.chinese')}}</b-dropdown-item>-->
      <!--          <b-dropdown-item href="" @click.prevent="changeLangUS">{{$t('navigateBar.english')}}</b-dropdown-item>-->
      <!--        </b-nav-item-dropdown>-->
      <!--        <b-nav-item-dropdown :text="$t('navigateBar.user')" right>-->
      <!--          <b-dropdown-item href="/">{{$t('navigateBar.log-out')}}</b-dropdown-item>-->
      <!--        </b-nav-item-dropdown>-->
      <!--      </b-navbar-nav>-->
      <!--    </b-collapse>-->
        </b-navbar>
      </b-col>
    </b-row>
  </div>
</template>

<script>
// TODO: 语言切换 user栏根据用户信息调整显示，还有登出的实现

export default {
  name: 'navigateBar',
  methods: {
    // changeLangCN () {
    //   this.$i18n.locale = 'zh'
    // },
    // changeLangUS () {
    //   this.$i18n.locale = 'en'
    // }
    changeLang () {
      let locale = this.$i18n.locale
      locale === 'zh' ? this.$i18n.locale = 'en' : this.$i18n.locale = 'zh'
    },
    goToFangzhen(){
      window.open('https://www.baidu.com', '_blank')
    },
    goToHomepage(){
      this.$router.push({path: '/'})
    },    
    GoToIndex(){
      //首页
      this.$router.push({path: '/index'})
    }
  }
}
</script>

<style lang="scss" scoped>
//d 原始button按钮
.button1 {
    //font-size: calc(1vw + 0.5rem);//d 自适应
    -webkit-transition-duration: 0.4s;
    transition-duration: 0.4s;
    padding: 1px 20px;
    text-align: center;
    background: transparent;
    color: #4D81C6;
    border: 1px solid rgb(255, 255, 255);
    border-radius:25px;
    //font-size: 30px;
  }
  //d 选中button按钮
  .button1:hover {
    background-color: #4D81C6;
    color: white;
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
    //line-height: 1.5;
  }
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
    background-color: transparent;
    justify-content: flex-end;
    right: 30px;
  }
  .class-name {
    font-size: 23px;
    font-weight: normal;
    color: #4D81C6;
    padding-left: 20px;
    margin-top: 10px;
  }
  .brand-item {
    line-height: 30px;
    font-weight: lighter;
    height: 30px;
    right: 0px;
    font-size: 18px;
    font-family: "Helvetica Neue";
    letter-spacing: -0.05em;
    color: #EAF4FE;
    padding: unset;
  }
  .navbar-item {
    padding-left: 15px;
    margin-top: 20px;
  }
  .nav-link {
    display: block;
    padding: unset;
    color: #EAF4FE;
  }
  .navbar-light .navbar-nav .nav-link {
    font-family: "Font Name", sans-serif;
    font-size: 23px;
    font-weight: normal;
    color: #4D81C6;
  }
  //.navigateBarVue {
  //  position: fixed;
  //  top: 0;
  //  left: 0;
  //  width: 100%;
  //  background-color: #c4dcf4;
  //  justify-content: flex-end;
  //  z-index: 9999; /* 可选，设置导航栏的层级 */
  //}
</style>
