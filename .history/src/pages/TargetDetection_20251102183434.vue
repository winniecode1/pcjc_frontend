<template>
  <div class="section">
    <div class="register" :style="{width: fullWidth+'px', height:fullHeight+'px'}"></div>
    <div class="img_box" :style="{width: fullWidth+'px'}"></div>
    <b-row class="justify-content-center pt-4"> 
      <b-col cols="10" class="text-center">
        <p class="newTitle text-center">多模态信息认知偏差检测</p>
      </b-col>
    </b-row>

    <b-row class="justify-content-center pt-3 pb-5 main-content-row"> 

      <b-col cols="3" class="text-center p-2">
        <div class="data-selection-box">
          <div class="box-label" style="top: -10px;">选择数据</div>
          
          <b-form-file
            v-model="file"
            :state="Boolean(file)"
            placeholder="选择视频..."
            drop-placeholder="拖拽视频到这里..."
            accept="video/*"
            class="upload-input-integrated"
            browse-text="上传文件"
            id="file-upload-input"
          ></b-form-file>

          <div class="selected-list p-3">
            <h5 class="text-left mb-2">已选择的数据:</h5>
            <ul class="list-unstyled text-left video-list custom-scroll">
              <li v-if="file" class="selected-file-item">
                <b-icon icon="play-circle-fill" variant="primary"></b-icon>
                **{{ file.name }}**
              </li>
              
              <li v-for="index in 100" :key="index" :class="{'text-secondary': !file}">
                <b-icon icon="play-circle-fill" variant="dark"></b-icon>
                视频{{ index }}.MP4
              </li>
            </ul>
            <p class="text-secondary mt-2 small-text">(1到100个文件)</p>
          </div>

          <div class="start-button-area pt-3">
            <b-button @click="startDetection" variant="primary" :disabled="!file || isLoading" class="start-btn-large">
              <b-icon icon="play-fill" class="mr-2"></b-icon>
              <b-spinner small v-if="isLoading"></b-spinner>
              {{ isLoading ? (progressMessage || '检测中...') : '开始检测' }}
            </b-button>
          </div>
        </div>
      </b-col>

      <b-col cols="4" class="text-center p-2">
        <div class="video-result-container">
          <div class="box-label">原视频 <span class="small-text">(此处是视频)</span></div>
          <div class="video-placeholder-alt">
            <video v-if="originalVideoURL" :src="originalVideoURL" controls class="image-display" :key="'orig'+originalVideoURL"></video>
            <div v-else class="placeholder-text-alt">请选择或上传视频</div>
          </div>
        </div>
        <div class="video-result-container mt-3"> 
          <div class="box-label">多模态检测结果 <span class="small-text">(此处是视频)</span></div>
          <div class="video-placeholder-alt detection-result">
            <img v-if="processedImageURL" :src="processedImageURL" alt="多模态检测结果" class="image-display-frame" />
            <div v-else-if="isLoading" class="placeholder-text-alt">等待处理结果...</div>
            <div v-else class="placeholder-text-alt">处理后视频/图像将在这里显示</div>
          </div>
        </div>
      </b-col>

      <b-col cols="3" class="text-center p-2">
        <div class="deviation-text-container">
          <div class="box-label">偏差检测结果 <span class="small-text">(此处是文本)</span></div>
          <div class="deviation-text-box p-3 text-left custom-scroll">
            <p class="mb-2">
              这是一段时长 $4.92$ 秒、共 $123$ 帧的视频，记录了一架飞机在晴朗天空进行爬升和机动飞行的动态过程。
            </p>
            <p class="mb-2">
              视频的主体是一架涂装为浅灰色的飞机，飞机在画面中从左下方方向右上方持续爬升，同时机头不断抬高，<span class="red-text">最终几乎垂直于地面</span>，展现出强大的升力和机动性能。
            </p>
            <p class="mb-2">
              整个飞行过程中，<span class="red-text">飞机姿态稳定</span>，发动机口清晰可见。背景是广阔的蓝色天空，配初能看到远处的山脉轮廓，随着飞机爬升，山脉逐渐消失在视野中，天空占据了整个画面。
            </p>
            <p class="mt-4 text-secondary small-text">(约100字到300字。有些文本需要用红色显示。)</p>
          </div>
        </div>

        <div class="deviation-metric-container mt-3"> 
          <div class="box-label">偏差检测准确率 <span class="small-text">(此处是一个数值)</span></div>
          <div class="deviation-metric-box">
            95%
          </div>
        </div>
      </b-col>

    </b-row>
  </div>
</template>

<script>
import axios from 'axios';
import { BIcon, BIconPlayCircleFill, BIconPlayFill } from 'bootstrap-vue';

const API_BASE_URL = 'http://10.109.253.71:5236';

export default {
  name: 'TargetDetection',
  components: {
    'b-icon': BIcon,
    'b-icon-play-circle-fill': BIconPlayCircleFill,
    'b-icon-play-fill': BIconPlayFill,
  },
  data() {
    return {
      fullWidth: window.innerWidth,
      fullHeight: window.innerHeight,

      file: null, 
      originalVideoURL: null, 
      processedImageURL: "https://via.placeholder.com/300x200?text=Detection+Result", 
      taskId: null, 
      isLoading: false, 
      progressMessage: null, 
      resultMessage: null, 
      
      fullResult: { 
        task_id: null,
        video_description: null,
        video_info: null,
        processing_time: null,
        accuracy_results: null,
        video_path: null,
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
    file(newFile) {
      if (newFile) {
        this.originalVideoURL = URL.createObjectURL(newFile);
        this.taskId = null;
        this.fullResult = { video_description: null, accuracy_results: null, video_info: null };
        this.resultMessage = null;
        this.progressMessage = null;
      } else {
        this.originalVideoURL = null;
      }
    }
  },
  methods: {
    handleResize() {
      this.fullWidth = window.innerWidth;
      this.fullHeight = window.innerHeight;
    },
    handleVideoError(e) {
      console.error("视频加载错误:", e);
      this.resultMessage = "视频加载失败，请检查服务器日志和网络。";
    },
    async startDetection() {
      if (!this.file) {
        alert("请先选择视频文件！");
        return;
      }
      
      this.isLoading = true;
      this.progressMessage = "正在启动多模态偏差检测...";
      this.resultMessage = "检测进行中...";

      try {
        await new Promise(resolve => setTimeout(resolve, 3000)); 

        this.progressMessage = "检测完成";
        this.resultMessage = "多模态偏差检测成功！";
      } catch (error) {
        console.error("检测请求失败:", error);
        this.resultMessage = "检测失败: " + error.message;
        this.progressMessage = "检测失败";
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
  /* 基础样式 */
  .section {
    background-color: #EAF4FE;
    color: black;
    font-size: 100%;
    width: 100%;
    font-family: "Helvetica Neue";
    z-index: 2;
  }
  
  .main-content-row {
      max-height: calc(100vh - 100px); 
      overflow-y: hidden; 
  }

  .newTitle {
    font-size: calc(2vw + 1rem);
    color: #2168BE;
    font-weight: bolder;
    letter-spacing: 0.1em;
  }

  /* 背景样式 */
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
      background-image: url('../assets/images/newBackGound.png');
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center center;
      width: 100%;
      height: 100%;
      opacity: 0.8;
  }
  
  /* 核心容器样式 */
  .box-label {
    position: absolute;
    top: 5px; 
    left: 50%;
    transform: translateX(-50%);
    background-color: #EAF4FE;
    padding: 0 10px;
    /* 标头颜色为黑色 */
    color: black; 
    font-size: 16px; 
    font-weight: bold;
    z-index: 10;
  }
  
  .small-text {
      font-size: 12px;
      font-weight: normal;
      color: #777;
      margin-left: 5px;
  }
  
  .red-text {
      color: red; 
      font-weight: bold;
  }
  
  /* 左侧：选择数据和开始检测 */
  .
<!-- <template>
  <div class="section">
    <div class="register" :style="{width: fullWidth+'px', height:fullHeight+'px'}"></div>
    <div class="img_box" :style="{width: fullWidth+'px'}"></div>
    <b-row class="justify-content-center pt-5">
      <b-col cols="10" class="text-center">
        <p class="newTitle text-center">目标检测</p>
      </b-col>
    </b-row>

    <b-row class="justify-content-center pt-4 mb-4">
      <b-col cols="10" class="d-flex justify-content-start align-items-center">
        <div class="upload-area mx-3">
          <b-form-file
            v-model="file"
            :state="Boolean(file)"
            placeholder="选择视频..."
            drop-placeholder="拖拽视频到这里..."
            accept="video/*"  class="upload-input"
            browse-text="上传文件"
          ></b-form-file>
        </div>

        <b-button @click="startAnalysis" variant="primary" :disabled="!file || isLoading" class="start-btn mx-3">
          <b-spinner small v-if="isLoading"></b-spinner>
          {{ isLoading ? (progressMessage || '分析中...') : '开始分析' }} </b-button>
      </b-col>
    </b-row>

    <b-row class="justify-content-center my-4">
      <b-col cols="5" class="text-center video-container mx-3">
        <div class="box-label">原视频</div>
        <div class="video-placeholder">
          <video v-if="originalVideoURL" :src="originalVideoURL" controls class="image-display" :key="originalVideoURL"></video>
          <div v-else class="placeholder-text">请上传视频</div>
        </div>
      </b-col>
      <b-col cols="5" class="text-center video-container mx-3">
        <div class="box-label">处理后视频 ({{ taskId || 'N/A' }})</div>
        <div class="video-placeholder">
          <video v-if="processedVideoURL" :src="processedVideoURL" controls class="image-display" :key="processedVideoURL" @error="handleVideoError"></video>
          <div v-else-if="isLoading" class="placeholder-text">等待处理结果...</div>
          <div v-else class="placeholder-text">处理后视频将在这里显示</div>
        </div>
      </b-col>
    </b-row>

    <b-row class="justify-content-center my-4">
      <b-col cols="10" class="text-center description-container">
        <div class="box-label">视频描述 / 结果概览</div>
        <div class="description-box p-3">
          <p v-if="fullResult.video_info" class="mb-1 text-left">
            **视频信息**: {{ fullResult.video_info.filename }} ({{ fullResult.video_info.duration.toFixed(2) }}s, {{ fullResult.video_info.width }}x{{ fullResult.video_info.height }})
            <b-badge variant="info" class="mx-2">处理耗时: {{ fullResult.processing_time ? fullResult.processing_time.toFixed(2) + 's' : 'N/A' }}</b-badge>
          </p>
          <p v-if="fullResult.video_description" class="mb-1 text-left">
            **描述**: {{ fullResult.video_description }}
          </p>
          <p v-else-if="!isLoading" class="text-left">
            {{ resultMessage || '分析完成后会在这里显示主要结果信息。' }}
          </p>
        </div>
      </b-col>
    </b-row>

    <b-row class="justify-content-center mt-4 pb-5">
      <b-col cols="5" class="text-center metric-container mx-3">
        <div class="box-label">目标检测精确率</div>
        <div class="metric-box">
          <template v-if="fullResult.accuracy_results && fullResult.accuracy_results.detection">
             {{ (fullResult.accuracy_results.detection.precision * 100).toFixed(2) + '%' }}
          </template>
          <template v-else>
             N/A </template>
        </div>
      </b-col>
      <b-col cols="5" class="text-center metric-container mx-3">
        <div class="box-label">描述相似度</div>
        <div class="metric-box">
          <template v-if="fullResult.accuracy_results && fullResult.accuracy_results.description">
             {{ (fullResult.accuracy_results.description.similarity * 100).toFixed(2) + '%' }}
          </template>
          <template v-else>
             N/A </template>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
// 导入 axios 用于 HTTP 请求
import axios from 'axios';

// 后端 API 基础路径，根据您的实际部署情况可能需要修改
// 您的后端默认在 http://0.0.0.0:5236 启动
const API_BASE_URL = 'http://10.109.253.71:5236';

export default {
  name: 'TargetDetection',
  data() {
    return {
      fullWidth: window.innerWidth,
      fullHeight: window.innerHeight,

      file: null, // 上传的视频文件
      originalVideoURL: null, // 客户端预览原视频用
      processedVideoURL: null, // 处理后视频的 URL
      taskId: null, // 任务ID
      isLoading: false, // 加载状态
      progressMessage: null, // 进度信息
      resultMessage: null, // 结果信息
      fullResult: { // 存储完整的后端结果
        task_id: null,
        video_description: null,
        video_info: null,
        processing_time: null,
        accuracy_results: null,
        video_path: null,
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
        this.originalVideoURL = URL.createObjectURL(newFile);
        // 清除旧结果
        this.processedVideoURL = null;
        this.taskId = null;
        this.fullResult = { video_description: null, accuracy_results: null, video_info: null };
        this.resultMessage = null;
        this.progressMessage = null;
      } else {
        this.originalVideoURL = null;
      }
    }
  },
  methods: {
    handleResize() {
      this.fullWidth = window.innerWidth;
      this.fullHeight = window.innerHeight;
    },
    handleVideoError(e) {
      console.error("视频加载错误:", e);
      this.resultMessage = "处理后视频加载失败，请检查服务器日志和网络。";
    },
    // 调用后端分析接口
    async startAnalysis() {
      if (!this.file) {
        alert("请先选择视频文件！");
        return;
      }

      this.isLoading = true;
      this.processedVideoURL = null;
      this.taskId = null;
      this.fullResult = { video_description: null, accuracy_results: null, video_info: null };
      this.resultMessage = "正在上传视频并启动分析...";
      this.progressMessage = "正在启动分析...";

      const formData = new FormData();
      formData.append('video', this.file); // 字段名改为 'video'

      try {
        // 步骤 1: 调用 /analyze_video 接口启动分析
        const analyzeResponse = await axios.post(`${API_BASE_URL}/analyze_video`, formData
        , {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
          // headers: { 'Accept': 'application/json' }
        }
        );

        const analyzeData = analyzeResponse.data;
        if (analyzeData.status !== 'success') {
           throw new Error(analyzeData.error || '分析启动失败');
        }

        this.taskId = analyzeData.task_id;
        this.progressMessage = `分析任务 [${this.taskId}] 已启动，正在进行深度处理...`;
        this.resultMessage = `任务ID: ${this.taskId}。处理时间预计 ${analyzeData.processing_time.toFixed(2)}s。`;

        // 步骤 2: 调用 /get_detection_results/<task_id> 接口获取完整结果
        const fullResultResponse = await axios.get(`${API_BASE_URL}/get_detection_results/${this.taskId}`);
        const fullData = fullResultResponse.data;

        // 步骤 3: 更新结果
        this.fullResult.task_id = fullData.task_id;
        this.fullResult.video_description = fullData.video_description;
        this.fullResult.video_info = fullData.video_info;
        this.fullResult.accuracy_results = fullData.accuracy_results;

        // 这里的 output_folder 和 processing_time 需要通过某种方式从后端获取或估算
        // 由于 fullData 中不包含 processing_time，我们使用 analyzeData 中的值
        this.fullResult.processing_time = analyzeData.processing_time;

        // 构造处理后视频的 URL
        // this.processedVideoURL = fullData.video_path; // 例如: /output/video_analysis_.../detected_video.mp4
        this.processedVideoURL = `${API_BASE_URL}${fullData.video_path}`;

        this.resultMessage = "视频分析成功！结果已更新。";
        this.progressMessage = "分析完成";
      } catch (error) {
        console.error("分析请求失败:", error);
        this.resultMessage = "分析失败: " + (error.response && error.response.data && error.response.data.error) || error.message;
        this.fullResult = { video_description: null, accuracy_results: null, video_info: null };
        this.progressMessage = "分析失败";
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
  /* 样式保持不变 */
  .section {
    background-color: #EAF4FE;
    color: black;
    font-size: 100%;
    width: 100%;
    min-height: 100vh;
    font-family: "Helvetica Neue";
    z-index: 2;
  }

  .newTitle {
    font-size: calc(2vw + 1rem);
    color: #2168BE;
    font-weight: bolder;
    letter-spacing: 0.1em;
  }

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
      background-image: url('../assets/images/newBackGound.png');
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center center;
      width: 100%;
      height: 100%;
      opacity: 0.8;
  }

  .video-container, .metric-container, .description-container {
    padding: 10px;
    position: relative;
  }

  .box-label {
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
    height: 400px;
    border: 2px solid #ccc;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    background-color: #fff;
    margin-top: 10px;
  }

  /* 适配 video 标签 */
  .video-placeholder video {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .placeholder-text {
    color: #999;
    font-size: 1.2rem;
  }

  .description-box {
    min-height: 150px; /* 增加高度以容纳描述 */
    border: 2px solid #ccc;
    background-color: #fff;
    margin-top: 10px;
    overflow-y: auto; /* 允许滚动 */
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
      width: 300px;
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

</style> -->
