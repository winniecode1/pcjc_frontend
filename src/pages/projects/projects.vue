<template style="margin-right: -1rem">
  <div class="section">
    <!-- <div class="background-image"></div> -->
    <!-- <div class="register" :style="{width: fullWidth+'px', height:fullHeight+'px'}"></div>-->
    <div class="img_box" :style="{width: fullWidth+'px'}"></div>
    <navigate-bar></navigate-bar>
    <b-row class="pjtitle">
      <b-col lg="1" ></b-col>
     <b-col class="" lg="11">
        <p class="newTitle">数字服务网络需求建模与冲突消解工具系统</p>
      </b-col>
    </b-row>
    <b-row>
      <b-col lg="1"></b-col>
      <b-col>
        <diagram-container></diagram-container>
      </b-col>
      <b-col lg="1"></b-col>
    </b-row>

  </div>
</template>

<script>
import NavigateBar from './components/navigateBar'
import DiagramContainer from './components/diagramContainer'

export default {
  name: 'projects',
  components: {DiagramContainer, NavigateBar}
}
</script>

<style lang="scss" scoped>
  .section {
    background-color: #EAF4FE;
    color: black;
    font-size: 100%;
    width: 100%;
    height: fit-content;
    font-family: "Helvetica Neue";
    padding-right: 0px;
  }
  .background-image {
    //margin-top: 50px;
    //position: absolute;
    //width: 60%;
    //right: 0;
    //z-index: 0;
    //height: 632px;
    //background: url(../../assets/images/background.png);
    //background-size: contain;
    //opacity: .2;
    position: fixed;
    width: 100%;
    top: 0;
    right: 0;
    z-index: 0;
    height: 100%;
    background-size: auto;
    background: url(../../assets/images/newBackGound.png) no-repeat fixed center center;
    opacity: .8;
  }
  .pjtitle {
    padding-top: 80px;
  }
  .pjcontent {
    top: 0px;
    color: #696DE7;
    text-align: left;
    font-weight: bolder;
    font-size: 28px;
    font-family: "Helvetica Neue";
    letter-spacing: 0.1em;
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
  .newTitle {
    padding-top: 10px;
    color: #2168BE;
    text-align: left;
    font-weight: bolder;
    font-size: 40px;
    font-family: "Helvetica Neue";
    letter-spacing: 0.1em;
  }
  .pic {
    text-align: right;
    padding-top: 5px;
    /*margin-left: 50px;*/
  }
  .pjp {
    margin-bottom: 0rem;
    width: fit-content;
  }
  .element.style {
    padding-right: 0px;
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
  .img_box {
      position: absolute;
      background-image: url(../../assets/images/newBackGound.png);
      background-size: cover;
      background-repeat: no-repeat;
      //保证盒子始终在窗口中心
      background-position: center center;
      //避免窗口周围留白
      width: 100%;
      height: 100%;
    }
</style>
