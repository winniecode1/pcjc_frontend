<template>
  <div class="section">
    <div class="register" :style="{width: fullWidth+'px', height:fullHeight+'px'}"></div>
    <div class="img_box" :style="{width: fullWidth+'px'}"></div>
    <b-row class="justify-content-center pt-5">
      <b-col cols="10" class="text-center">
        <p class="newTitle text-center">领域建模</p>
      </b-col>
    </b-row>

    <b-row class="justify-content-center pt-4 mb-4">
      <b-col cols="10" class="d-flex justify-content-start align-items-center">
        <div class="upload-area mx-3">
          <b-form-file
            v-model="file"
            :state="Boolean(file)"
            placeholder="选择图片..."
            drop-placeholder="拖拽图片到这里..."
            accept="image/*"
            class="upload-input"
          ></b-form-file>
        </div>
        
        <b-button @click="startInference" variant="primary" :disabled="!file || isLoading" class="start-btn mx-3">
          <b-spinner small v-if="isLoading"></b-spinner>
          {{ isLoading ? '推理中...' : '开始推理' }}
        </b-button>
        
      </b-col>
    </b-row>

    <b-row class="justify-content-center my-4">
      <b-col cols="5" class="text-center video-container mx-3">
        <div class="box-label">原图片</div>
        <div class="video-placeholder">
          <img v-if="originalImageURL" :src="originalImageURL" alt="原图片" class="image-display" />
          <div v-else class="placeholder-text">请上传图片</div>
        </div>
      </b-col>
      <b-col cols="5" class="text-center video-container mx-3">
        <div class="box-label">处理后图片</div>
        <div class="video-placeholder">
          <img v-if="processedImageBase64" :src="'data:image/jpeg;base64,' + processedImageBase64" alt="处理后图片" class="image-display" />
          <div v-else class="placeholder-text">等待处理结果...</div>
        </div>
      </b-col>
    </b-row>

    <b-row class="justify-content-center my-4">
      <b-col cols="10" class="text-center description-container">
        <div class="box-label">图片描述 / JSON 结果概览</div>
        <div class="description-box p-3">
          <p class="mb-1 text-left">
            **Prompt**: {{ inferencePrompt }}
          </p>
          <p v-if="inferenceResult.result && inferenceResult.result.length" class="mb-1 text-left">
            **检测结果**: 共检测到 {{ inferenceResult.result.length }} 个目标。例如: 
            <span v-for="(item, index) in inferenceResult.result.slice(0, 3)" :key="index" class="result-tag">
              {{ item.label }}
            </span>
            ...
          </p>
          <p v-else-if="!isLoading" class="text-left">
            {{ resultMessage || '推理完成后会在这里显示主要结果信息。' }}
          </p>
        </div>
      </b-col>
    </b-row>

    <b-row class="justify-content-center mt-4 pb-5">
      <b-col cols="5" class="text-center metric-container mx-3">
        <div class="box-label">准确率</div>
        <div class="metric-box">
          {{ inferenceResult.accuracy ? (inferenceResult.accuracy * 100).toFixed(2) + '%' : 'N/A' }}
        </div>
      </b-col>
      <b-col cols="5" class="text-center metric-container mx-3">
        <div class="box-label">召回率</div>
        <div class="metric-box">
          N/A (后端未提供)
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
// 导入 axios 用于 HTTP 请求
import axios from 'axios';

export default {
  name: 'DomainModeling',
  data() {
    return {
      // 模拟 index.vue 中的背景自适应数据
      fullWidth: window.innerWidth,
      fullHeight: window.innerHeight,
      
      file: null, // 上传的图片文件
      originalImageURL: null, // 客户端预览原图用
      processedImageBase64: null, // 处理后图片的 Base64 编码
      inferencePrompt: "框出每一个飞机、船、车辆和人的位置，以json格式输出所有的坐标", // 默认 Prompt
      isLoading: false, // 加载状态
      resultMessage: null, // 结果信息
      inferenceResult: { // 存储后端返回的结果
        accuracy: null,
        result: [],
        original_size: { width: 0, height: 0 },
        resized_size: { width: 0, height: 0 },
      }
    };
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  watch: {
    // 监听文件变化，用于客户端预览
    file(newFile) {
      if (newFile) {
        this.originalImageURL = URL.createObjectURL(newFile);
        // 清除旧结果
        this.processedImageBase64 = null;
        this.inferenceResult = { accuracy: null, result: [] };
        this.resultMessage = null;
      } else {
        this.originalImageURL = null;
      }
    }
  },
  methods: {
    handleResize() {
      this.fullWidth = window.innerWidth;
      this.fullHeight = window.innerHeight;
    },
    // 调用后端推理接口
    async startInference() {
      if (!this.file) {
        alert("请先选择图片文件！");
        return;
      }

      this.isLoading = true;
      this.processedImageBase64 = null;
      this.resultMessage = "正在等待后端推理结果...";

      const formData = new FormData();
      formData.append('image', this.file);
      formData.append('prompt', this.inferencePrompt);

      try {
        // 后端接口地址：HOST + PORT + /inference，默认为 http://0.0.0.0:5234/inference
        // 实际部署时可能需要修改为正确的IP和端口
        const response = await axios.post('/inference', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        const data = response.data;
        this.inferenceResult.accuracy = data.accuracy;
        this.inferenceResult.result = data.result;
        this.inferenceResult.original_size = data.original_size;
        this.inferenceResult.resized_size = data.resized_size;
        this.processedImageBase64 = data.image_with_boxes_base64;
        this.resultMessage = "推理成功！结果已更新。";

      } catch (error) {
        console.error("推理请求失败:", error);
        this.resultMessage = "推理失败: " + (error.response?.data?.error || error.message);
        this.inferenceResult = { accuracy: null, result: [] };
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
  // 继承自 index.vue 的样式，确保布局一致性
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