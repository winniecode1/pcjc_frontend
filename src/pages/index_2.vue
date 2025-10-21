<template style="margin-right: -1rem">
    <div class="section" >
      <!-- d 背景图片 -->
      <!-- <div class="register"></div>
      <div class="img_box"></div> -->
      <div class="register" :style="{width: fullWidth+'px', height:fullHeight+'px'}"></div>
      <div class="img_box" :style="{width: fullWidth+'px'}"></div>
      <!-- START SECTION -->

      <div id="app">
        <b-navbar class="navbar">
  <b-navbar-nav class="brand-item">
    <!-- 左侧内容 -->
  </b-navbar-nav>

  <!-- 右侧内容 -->
  <b-navbar-nav class="ml-auto">
    <b-nav-item class="navbar-item">
      <img
        :src="require('@/assets/images/zhuye.png')"
        alt="主页"
        width="30"
        height="30"
        style="cursor: pointer;"
        @click="navigateToProject"
      />
    </b-nav-item>
  </b-navbar-nav>
</b-navbar>
        <b-row class="justify-content-start">
          <!-- <b-col lg="2"></b-col> -->
          <b-col>
            <div class="title-container">
            <p class="newsmall left">课题</p>
            <div class="divider"></div>
            <p class="newTitle text-left"><span class="first-half">人机协同——偏差检测项目群</span></p>
          </div>
          </b-col>
        </b-row>
        <b-row class="justify-content-start pt-1 custom-gutter">
          <!-- <b-col lg="2"></b-col> -->
  
          <!-- <b-col lg="2" class="custom-col">
            <login-modal class="modal-login"></login-modal>
          </b-col>
          <b-col lg="2" class="custom-col">
            <register-modal class="modal-login"></register-modal>
          </b-col> -->
          <!-- <b-col lg="7"></b-col> -->
        </b-row>
        <b-row class="justify-content-start ">
          <b-col lg="12">
            <indexTool class="tool-shift"/>
          </b-col>
        </b-row>
      </div>
    </div>
  </template>
  
  <script>
  import registerModal from './components/registerModal'
  import loginModal from './components/loginModal'
  import navigateBar from './components/navigateBar'
  import indexTool from './components/indexTool'
  

  export default {
    name: 'index',
    components: {
      indexTool,
      navigateBar,
      loginModal,
      registerModal
    },
    methods: {
    navigateToBaidu() {
      window.location.href = 'https://www.baidu.com'; // 跳转到百度
    },
    navigateToProject() {
      window.location.href = 'http://120.55.15.198:6001/'; // 跳转到项目
    }
  }

  }
  </script>
  
  <style lang="scss" scoped>

.navbar {
  display: flex;
  justify-content: space-between; /* 左右内容分开 */
}

.ml-auto {
  margin-left: auto; /* 自动左外边距，推到右侧 */
}

.divider {
  width: 40%; /* 横杠的宽度 */
  height: 2px; /* 横杠的高度 */
  background-color: #2168BE; /* 横杠的颜色 */
  margin: 10px 0; /* 上下间距为 10px，左右无间距 */
  align-self: flex-start; /* 靠左对齐 */
}

.title-container {
  display: flex;
  flex-direction: column; /* 垂直排列 */
  align-items: flex-start; /* 左对齐 */
  gap: 5px; /* 控制子元素之间的间距 */
  margin-top: 60px;
}
    .first-half {
      color: #2168BE; /* 前半段文字的颜色 */
    }
  
    .second-half {
      color: #4675AB; /* 后半段文字的颜色 */
    }
    .custom-gutter {
        //margin-left: -100px; /* 负边距拉近列之间的距离 */
        margin-right: 500px;
      }
      .custom-col {
        padding-left: 0px; /* 调整列的左内边距 */
        padding-right: 0px; /* 调整列的右内边距 */
      }
  
    .section {
      background-color: #EAF4FE;
      color: black;
      font-size: 100%;
      width: 100%;
      height: 100%;
      /*height: fit-content;*/
      font-family: "Helvetica Neue";
      z-index: 2;
      /*padding-bottom: 200px;*/
    }
  
    .product-name {
      font-size: 36px;
      text-transform: uppercase;
      letter-spacing: 10px;
      font-weight: bold;
      display: inline-block;
      padding: 30px 60px;
      border: 1px solid;
      margin-top: 20px;
      margin-bottom: 10px;
      line-height: 1.1;
    }
  
    .lead {
      margin: 30px auto 40px;
      font-size: 24px;
      max-width: 70%;
      font-weight: 300;
      line-height: 1.4;
    }
  
    .background-image {
      ////padding-top: 80px;
      position: absolute;
      width: 100%;
      top: 0;
      right: 0;
      z-index: 0;
      height: 100%;
      ////background: url(../assets/images/background.png) no-repeat center center;
      background: url(../assets/images/newBackGound.png) no-repeat center center;
      background-size: auto;
      opacity: .8;
    }
  
    .modal-login {
    }
  //   body {
  //     transform: scale(1.25);
  //     transform-origin: top left;
  // }
    .body {
      font-family: 'Poppins', sans-serif;
      color: #2c3e50;
      overflow-x: hidden;
      padding: 0;
      margin: 0;
      height: fit-content;
    }
    .pjtitle {
      padding-top: 80px;
    }
    .pjcontent {
      color: #696DE7;
      text-align: left;
      font-weight: bolder;
      font-size: 35px;
      font-family: "Helvetica Neue";
      letter-spacing: 0.1em;
    }
    .newTitle {
      font-size: calc(2vw + 0.5rem);//d 自适应
      // padding-top: 20px;//160
      color: #2168BE;
      text-align: left;
      font-weight: bolder;
      //font-size: 55px;//60
      font-family: "Helvetica Neue";
      letter-spacing: 0.1em;
      padding-bottom: 80px;
      margin: 0; /* 移除默认外边距 */
    }
    .pjsmall {
      color: #696DE7;
      text-align: left;
      font-weight: bold;
      font-size: 20px;
      font-family: "Helvetica Neue";
      letter-spacing: 0.1em;
      padding-top: 10px;

    }
    .newsmall {
      font-size: calc(1vw + 0.5rem);//d 自适应
      color: #2C73CA;
      text-align: left;
      font-weight: bold;
      //font-size: 25px;//30
      font-family: "Helvetica Neue";
      letter-spacing: 0.1em;
      margin: 0; /* 移除默认外边距 */
      margin-top: 20px; /* 向下移动 */
    }
    .pjdescp {
      color: #556aa7;
      text-align: justify;
      font-weight: normal;
      font-size: 16px;
      font-family: "Helvetica Neue";
      letter-spacing: -0em;
      padding-right: 20px;
    }
    .pic {
      alignment: right;
      text-align: right;
      padding-top: 5px;
      padding-right: 0px;
      /*margin-left: 50px;*/
    }
    .pjp {
      margin-bottom: 0rem;
      width: fit-content;
    }
    .outer-container {
      margin-left: 0; /* 设置左外边距为零 */
      //margin-right: 0; /* 设置右外边距为零 */
    }
    .container {
      font-size: calc(1vw + 0.5rem);//d 自适应
      //justify-content: flex-start;
      padding-top: 30px;
      //padding-left: 0px;
      display: flex;
      align-items: flex-start; /* 左对齐 */
      //font-size: 35px;
      color: #245FC0;
      font-weight: bold;
    }
    .container img {
      width: 25px; /* 图像的宽度 */
      height: 25px; /* 图像的高度 */
      margin-right: 5px; /* 图像和文字之间的间距 */
    }
    .container span {
      margin-right: 20px; /*15 设置文字左侧的间距 */
    }
    //d 背景大小自适应
    .register {
    //固定外层盒子，不受其他盒子影响
    //放在最底层
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: -1;
    }
    .custom-col {
        flex: 0 0 20%; /* 每列占 20% 的宽度 */
        max-width: 20%; /* 确保列宽不超过 20% */
        padding-left: 5px; /* 调整左右内边距 */
        padding-right: 5px;
        }

    .tool-shift {
      margin-right: 100px; 
    }
    .img_box {
        position: absolute;
        background-image: url(../assets/images/background2.png);
        background-size: cover;
        background-repeat: no-repeat;
        //保证盒子始终在窗口中心
        background-position: center center;
        //避免窗口周围留白
        width: 100%;
        height: 100%;
      }
    //d 文字自适应页面
    #app {
    position: relative; /* 设置相对定位 */
    padding-left: 100px; /* 添加内边距 */
    }
  </style>
  <style lang="scss">
  .custom-align {
      margin-left: 0; /* 非 scoped 样式，覆盖全局样式 */
  }
  </style>
  // WEBPACK FOOTER //
  // src/pages/index.vue
  