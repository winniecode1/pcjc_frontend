<template>
  <div class="section">
    <div class="register" :style="{width: fullWidth+'px', height:fullHeight+'px'}"></div>
    <div class="img_box" :style="{width: fullWidth+'px'}"></div>
    <b-row class="justify-content-center pt-5">
      <b-col cols="10" class="text-center">
        <p class="newTitle text-center">群体协商</p>
      </b-col>
    </b-row>

    <b-row class="justify-content-center my-4" >
      <b-col cols="5" class="text-center video-container mx-3" style="border: 2px solid #ccc;">
        <!-- <div class="box-label">原视频</div> -->
        <div class="video-placeholder">
          <img v-if="originalImageURL" :src="originalImageURL" alt="图片" class="image-display" />
          <div v-else class="placeholder-text">图片</div>
        </div>
        <!-- <div class="box-label">视频描述 / JSON 结果概览</div> -->
        <div class="description-box p-3">
          <p class="mb-1 text-left">
            {{ stepTwoTextRes }}
          </p>
        </div>
      </b-col>
      <b-col cols="1" style="width: 120px;">
        <img src="../assets/images/step3/xhtl.png" alt="" style="width: 120px;margin-top: 200px;">
      </b-col>
      <b-col cols="5" class="text-center video-container mx-3">
        <div class="description-box p-3" style="margin-bottom: 20px;">
          <p class="mb-1 text-center" style="line-height: 100px;">
            {{ agentOneRes }}
          </p>
        </div>
        <div class="description-box p-3" style="margin-bottom: 20px;">
          <p class="mb-1 text-center" style="line-height: 100px;">
            {{ agentTwoRes }}
          </p>
        </div>
        <div class="description-box p-3" style="margin-bottom: 20px;">
          <p class="mb-1 text-center" style="line-height: 100px;">
            {{ agentThirdRes }}
          </p>
        </div>
        <b-button @click="startNeogotiation" variant="primary" class="start-btn mx-3" style="">
          <b-spinner small v-if="isLoading"></b-spinner>
          {{ isLoading ? '协商中...' : '开始群体协商' }}
        </b-button>
      </b-col>
    </b-row>

    <b-row class="justify-content-center my-4">
        <b-col cols="5" class="text-center description-container">
        <div class="description-box p-3" style="height: 200px;">
          <p class="mb-1 text-center" style="height: 200px;line-height: 160px;">
            {{ finalRes }}
          </p>
        </div>
      </b-col>
      <b-col cols="1" style="width: 120px;">
        <img src="../assets/images/step3/final.png" alt="" style="width: 120px;margin-top: 80px;">
      </b-col>
      <b-col cols="5" class="text-center description-container">
        <!-- <div class="box-label">视频描述 / JSON 结果概览</div> -->
        <div class="description-box p-3" style="height: 200px;margin-right: -20px;">
          <p class="mb-1 text-left" style="height: 200px;">
            {{ process }}
          </p>
          <div style="display: flex; gap: 460px;">
            <p style="width: 100px;;">准确率：{{ accuracy }}</p>
            <p style="width: 100px;;">偏差率：{{ piancha }}</p>
          </div>        
        </div>
      </b-col>
    </b-row>

  </div>
</template>

<script>
// 导入 axios 用于 HTTP 请求
import axios from 'axios';

export default {
  name: 'TargetDetection',
  data() {
    return {
      // 模拟 index.vue 中的背景自适应数据
      fullWidth: window.innerWidth,
      fullHeight: window.innerHeight,

      originalImageURL: null, // 第二阶段的图片
      processedImageBase64: null, // 处理后视频的 Base64 编码
      stepTwoTextRes: "第二阶段给出的文字信息",
      agentOneRes: "Agent1 给出的型号推理结果",
      agentTwoRes: "Agent2 给出的型号推理结果",
      agentThirdRes: "Agent3 给出的型号推理结果",
      process: "群体协商过程的详细描述信息",
      finalRes: "群体协商之后的型号展示",
      accuracy: "95%",
      piancha: "2%",
      isLoading: false, // 加载状态
      
    };
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  watch: {
   
  },
  methods: {
    handleResize() {
      this.fullWidth = window.innerWidth;
      this.fullHeight = window.innerHeight;
    },
    // 调用后端推理接口
    async startNeogotiation() {

      this.isLoading = true;
      this.process = "正在等待后端推理结果...";

      const formData = new FormData();
    //   formData.append('image', this.file);
    //   formData.append('prompt', this.inferencePrompt);

      try {
        // 后端接口地址：HOST + PORT + /inference，默认为 http://0.0.0.0:5234/inference
        // 实际部署时可能需要修改为正确的IP和端口
        const response = await axios.post('http://10.109.253.71:5234/inference', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        const data = response.data;
        this.process = data;
      } catch (error) {
        console.error("推理请求失败:", error);
        this.process = "推理失败: " + (error.response && error.response.data && error.response.data.error) || error.message;
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
  .section {
    background-color: #EAF4FE;
    color: black;
    font-size: 100%;
    width: 100%;
    min-height: 100vh; /* 至少一个视口高度 */
    font-family: "Helvetica Neue";
    z-index: 2;
  }

  .newTitle {
    // 标题样式
    font-size: calc(2vw + 1rem);
    color: #2168BE;
    font-weight: bolder;
    letter-spacing: 0.1em;
  }

  // 背景自适应样式
  .register {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
  }
  .img_box {
      position: absolute;
      // 假设背景图路径与 index.vue 相同
      background-image: url('../assets/images/newBackGound.png');
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center center;
      width: 100%;
      height: 100%;
      opacity: 0.8; /* 调整透明度以适应背景 */
  }

  // 截图中的红色边框元素样式
  .video-container, .metric-container, .description-container {
    padding: 10px;
    position: relative;

    // 模拟截图中的红色边框
    // border: 2px solid red;
  }

  .box-label {
    // 模拟截图中的文字位置
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #EAF4FE;
    padding: 0 10px;
    color: red;
    font-size: 14px;
    font-weight: bold;
    z-index: 10;
  }

  .video-placeholder {
    height: 400px; /* 预设高度 */
    border: 2px solid #ccc;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    background-color: #fff;
    margin-top: 10px;
  }

  .image-display {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .placeholder-text {
    color: #999;
    font-size: 1.2rem;
  }

  .description-box {
    min-height: 100px;
    border: 2px solid #ccc;
    background-color: #fff;
    margin-top: 10px;
  }

  .metric-box {
    height: 150px;
    line-height: 150px;
    border: 2px solid #ccc;
    font-size: 2rem;
    font-weight: bold;
    color: #2168BE;
    background-color: #fff;
    margin-top: 10px;
  }

  .upload-area {
      width: 300px; /* 调整上传组件的宽度 */
  }

  .start-btn {
      width: 150px;
  }

  .result-tag {
      background-color: #2168BE;
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      margin-right: 5px;
      font-size: 0.9em;
  }

</style>
