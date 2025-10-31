<template>
  <b-row class="outter-container">
    <b-col class="custom-col">
    <div class="tool-card d-flex flex-column align-items-center">
      <!-- <div class="tool-text"> -->
      <router-link to="/target-detection" class="tool-text">
        <h3>项目一</h3>
        <p>目标检测</p>
      </router-link>
      <!-- <img :src="imageSrc" alt="Tool Image" class="tool-image" /> -->
       <img :src="require('@/assets/images/jianmo.png')" alt="Tool Image" class="tool-image"/>
      <div class="divider"></div> <!-- 横线 -->
      <button class="enter-tool" @click="navigateToTargetDetection">进入工具</button>
    </div>
  </b-col>
  <b-col class="custom-col">
    <div class="tool-card d-flex flex-column align-items-center">
      <div class="tool-text">
        <h3>项目二</h3>
        <p>先验知识</p>
      </div>
      <!-- <img :src="imageSrc" alt="Tool Image" class="tool-image" /> -->
       <img :src="require('@/assets/images/chongtu.png')" alt="Tool Image" class="tool-image"/>
      <div class="divider"></div> <!-- 横线 -->
      <button class="enter-tool" @click="navigateToTargetPage">进入工具</button>
    </div>
  </b-col>
  <b-col class="custom-col">
    <div class="tool-card d-flex flex-column align-items-center">
      <router-link to="/group-negotiation" class="tool-text">
        <h3>项目三</h3>
        <p>群体协商</p>
      </router-link>
      <!-- <img :src="imageSrc" alt="Tool Image" class="tool-image" /> -->
       <img :src="require('@/assets/images/biaozhu.png')" alt="Tool Image" class="tool-image"/>
      <div class="divider"></div> <!-- 横线 -->
      <button class="enter-tool" @click="navigateToGroupNegotiation">进入工具</button>
    </div>
  </b-col>
  <b-col class="custom-col">
    <div class="tool-card d-flex flex-column align-items-center">
      <router-link to="/decisionmaking" class="tool-text">
        <h3>项目四</h3>
        <p>强化学习</p>
      </router-link>
      <!-- <img :src="imageSrc" alt="Tool Image" class="tool-image" /> -->
       <img :src="require('@/assets/images/bianpai.png')" alt="Tool Image" class="tool-image"/>
      <div class="divider"></div> <!-- 横线 -->
      <button class="enter-tool" @click="gotoSheji">进入工具</button>
    </div>
  </b-col>
  <b-col class="custom-col">
    <div class="tool-card d-flex flex-column align-items-center">
      <router-link to="/decisionmaking" class="tool-text">
        <h3>项目五</h3>
        <p>偏差检测</p>
      </router-link>
      <!-- <img :src="imageSrc" alt="Tool Image" class="tool-image" /> -->
       <img :src="require('@/assets/images/fangzhen.png')" alt="Tool Image" class="tool-image"/>
      <div class="divider"></div> <!-- 横线 -->
      <button class="enter-tool" @click="gotoFangzhen">进入工具</button>
    </div>
  </b-col>
  </b-row>
  </template>
  
  <script>

  export default {
    props: {
      title: String,
      imgSrc: {
            type: String,
            required: true,
        },
    },
    methods: {
    navigateToTargetDetection() {
      const routeData = this.$router.resolve({ path: '/target-detection' });
      window.open(routeData.href, '_blank');
    },
    navigateToGroupNegotiation() {
      const routeData = this.$router.resolve({ path: '/group-negotiation' });
      window.open(routeData.href, '_blank');
    },
    navigateToTargetPage() {
      const routeData = this.$router.resolve({ path: '/index' });
      window.open(routeData.href, '_blank');
    },
    gotoFangzhen(){
      window.open('http://opik.dev.jianmucloud.com/default/home', '_blank')
    },
    gotoSheji(){
      window.open('http://10.109.252.86:3380', '_blank')
    },
    gotoBiaozhu(){
      window.open('http://10.109.253.71:8905/', '_blank')
    },
  },
  };
  </script>
  
  <style scoped>
  .tool-card {
  display: flex;
  flex-direction: column; /* 子元素垂直排列 */
  align-items: center; /* 子元素水平居中 */
  justify-content: space-between; /* 子元素之间均匀分布 */
  padding: 20px; /* 添加内边距，避免内容贴边 */
  border-radius: 8px; /* 可选：圆角效果 */
  background-color: white; /* 背景颜色 */
  margin-bottom: 20px;
  min-width: 180px; /* 设置最小宽度，避免过窄 */
  max-width: 300px; /* 设置最大宽度，避免过宽 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 添加阴影效果 */
}

.tool-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  margin-top: 10px;
  margin-bottom: 10px; /* 图片与文字之间的间距 */
}

.tool-text h3,
.tool-text p {
  font-family: 'PingFang SC', sans-serif; /* 设置字体为 PingFang SC */
  color: black; /* 设置字体颜色为黑色 */
  font-weight: bold; /* 设置字体加粗 */
  margin: 0; /* 移除默认的外边距 */
  text-align: center; /* 文本水平居中 */
}

.tool-text h3 {
  font-size: 16px; /* 设置标题字体大小 */
}

.tool-text p {
  font-size: 14px; /* 设置描述字体大小 */
  margin-top: 5px; /* 添加与标题之间的间距 */
}

.divider {
  width: 80%; /* 横线宽度占父容器的 80% */
  height: 1px; /* 横线高度 */
  background-color: #333333; /* 横线颜色 */
  margin: 10px 0;
}

.enter-tool {
  font-family: 'PingFang SC', sans-serif; /* 设置字体为 PingFang SC */
  font-weight: normal; /* 不加粗 */
  font-size: 12px; /* 字体大小 */
  padding: 8px 16px;
  background-color: transparent;
  color: black;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.enter-tool:hover {
  background-color: transparent;
}
  /* .tool-card {
    display: flex;
    align-items: center; 
    justify-content: center; 
    padding: 20px; 
    border-radius: 8px; 
    background-color: white;
    margin-bottom: 20px;
    width: 210px; 
    height: 300px; 
  }
  
  .tool-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  margin-bottom: 10px; 
}

  .tool-text h3,
.tool-text p {
  font-family: 'PingFang SC', sans-serif; 
  color: black; 
  font-weight: bold; 
  margin: 0; 
  text-align: center; 
}

.tool-text h3 {
  font-size: 16px;
}

.tool-text p {
  font-size: 16px; 
  margin-top: 5px; 
}
  
.divider {
  width: 80%; 
  height: 1px; 
  background-color: #333333; 
  margin: 10px 0; 
}

  .enter-tool {
    font-family: 'PingFang SC', sans-serif; 
    font-weight: normal; 
    font-size: 12px; 
    padding: 8px 16px;
    background-color: transparent;
    color: black;
    border: none;
    border-radius: 4px;
    cursor: pointer;

  }
  
  .enter-tool:hover {
    background-color: transparent;
  } */
  </style>