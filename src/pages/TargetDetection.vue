<template>
  <div class="section">
    <div class="img_box"></div>

    <b-row class="header-bar align-item-s-center no-gutters">
      <b-col cols="3" class="text-left">
        <button class="header-btn btn-home">首页</button>
        <button class="header-btn btn-back">返回</button>
      </b-col>
      <b-col cols="6" class="text-center">
        <h1 class="header-title">多模态信息认知偏差检测模型</h1>
      </b-col>
      <b-col cols="3" class="text-right">
        <button class="header-btn btn-next">下个页面</button>
      </b-col>
    </b-row>

    <b-row class="justify-content-center content-row no-gutters">
      
      <b-col cols="3" class="left-column px-2">
        <div class="panel-header header-select-data">选择数据</div>
        
        <div class="panel-left">
          <div class="panel-content">
            <div class="server-video-list overflow-auto">
              <div 
                v-for="video in serverVideos" 
                :key="video.index"
                class="video-item"
                :class="{ 'selected': isSelected(video) }"
                @click="toggleSelectVideo(video)"
              >
                <span>{{ video.name }}</span>
                <span class="selector-circle"></span>
              </div>
            </div>
            
            <div class="action-buttons">
              <button 
                @click="startDetection" 
                :disabled="selectedFiles.length === 0 || isLoading"
                class="btn-start-detect"
              >
                <b-spinner small v-if="isLoading"></b-spinner>
                <span class->{{ isLoading ? (progressMessage || '检测中') : '开始测试' }}</span>
              </button>
            </div>
          </div>
        </div>
      </b-col>

      <b-col cols="5" class="middle-column mx-2 px-1">
        <div class="video-section">
          <div class="video-label label-original">原视频</div>
          <div class="video-frame">
            <video 
              v-if="selectedFiles.length > 0" 
              :src="selectedFiles[0].url" 
              controls 
              class="video-display"
              @error="handleVideoError"
            ></video>
            <div v-else class="placeholder-text">请选择视频</div>
          </div>
        </div>
        
        <div class="video-section">
          <div class="video-label label-processed">多模态检测结果 ({{ taskId || 'N/A' }})</div>
          <div class="video-frame">
            <video 
              v-if="processedVideoURL" 
              :src="processedVideoURL" 
              controls 
              class="video-display"
              :key="processedVideoURL"
              @error="handleVideoError"
            ></video>
            <div v-else-if="isLoading" class="placeholder-text">检测进行中...</div>
            <div v-else class="placeholder-text">检测结果将在这里显示</div>
          </div>
        </div>
      </b-col>

      <b-col cols="3" class="right-column px-2">
        
        <div class="panel-header header-results">偏差检测结果</div>
        
        <div class="panel-right-top">
          <div class="panel-content">
            <div class="description-box p-2 overflow-auto">
              <p v-if="fullResult.video_description" class="mb-1 text-left small-text">
                {{ fullResult.video_description }}
              </p>
              <p v-if="fullResult.key_frame_detection" class="mb-1 text-left">
                <span class="text-red">id:{{ fullResult.key_frame_detection.frame_idx }} {{ getMainObject() }} {{ getMainConfidence().toFixed(2) }}</span>
              </p>
              <p v-else-if="!isLoading" class="text-left small-text">
                {{ resultMessage || '检测完成后显示结果' }}
              </p>
            </div>
          </div>
        </div>
        
        <div class="panel-header header-accuracy">偏差检测准确率</div>

        <div class="panel-right-bottom">
          <div class="panel-content">
            <div class="metric-box">
              <template v-if="fullResult.accuracy_results && fullResult.accuracy_results.detection">
                 {{ (fullResult.accuracy_results.detection.accuracy * 100).toFixed(2) + '%' }}
              </template>
              <template v-else>
                 N/A
              </template>
            </div>
            </div>
        </div>

        <div class="action-buttons-right">
          <button class="btn-export-result">
            <span>结果导出</span>
          </button>
        </div>
        
      </b-col>
    </b-row>
  </div>
</template>

<script>
// ... 你的 SCRIPT 脚本 (来自你的文件，无需修改) ...
import axios from 'axios';
import { BIcon, BIconPlayCircleFill, BIconPlayFill, BSpinner } from 'bootstrap-vue';

// 后端API基础地址（与后端配置一致）
const API_BASE_URL = 'http://10.109.253.71:5236';
// 接口地址（对接后端实际接口）
const LIST_API_URL = `${API_BASE_URL}/api/videos/list`; // 获取服务器视频列表
const VIDEO_STATIC_PATH = `${API_BASE_URL}/static/videos/`; // 视频静态资源路径
const UPLOAD_API_URL = `${API_BASE_URL}/api/videos/upload`; // 视频上传接口
const ANALYZE_API_URL = `${API_BASE_URL}/analyze_video`; // 视频分析接口
const GET_RESULT_API_URL = `${API_BASE_URL}/get_detection_results`; // 获取检测结果接口

export default {
  name: 'TargetDetection',
  components: {
    'b-icon': BIcon,
    'b-icon-play-circle-fill': BIconPlayCircleFill,
    'b-icon-play-fill': BIconPlayFill,
    'b-spinner': BSpinner
  },
  data() {
    return {
      fullWidth: window.innerWidth,
      fullHeight: window.innerHeight,
      uploadedFile: null, // 上传的文件对象
      serverVideos: [], // 服务器视频列表
      selectedFiles: [], // 已选择的视频列表（支持多选）
      processedVideoURL: null, // 处理后视频URL
      taskId: null, // 检测任务ID
      isLoading: false, // 加载状态
      progressMessage: null, // 进度信息
      resultMessage: null, // 结果提示
      fullResult: { // 完整检测结果
        video_description: null,
        video_info: null,
        key_frame_detection: null,
        accuracy_results: null,
        processing_time: null
      }
    };
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    this.fetchServerVideos(); // 组件挂载时获取服务器视频列表
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  watch: {
    uploadedFile(newFile) {
      if (newFile) {
        this.uploadFileToServer(newFile); // 上传文件
      } else {
        this.resultMessage = null;
      }
      // 重置检测相关状态
      this.taskId = null;
      this.fullResult = {};
      this.processedVideoURL = null;
      this.progressMessage = null;
    }
  },
  methods: {
    // 窗口大小调整处理
    handleResize() {
      this.fullWidth = window.innerWidth;
      this.fullHeight = window.innerHeight;
    },
    // 视频加载错误处理
    handleVideoError(e) {
      console.error("视频加载错误:", e);
      this.resultMessage = "视频加载失败，请检查网络和服务器状态。";
    },
    // 判断视频是否已选中
    isSelected(video) {
      return this.selectedFiles.some(item => item.name === video.name);
    },
    // 切换视频选中状态
    toggleSelectVideo(video) {
      const isExist = this.isSelected(video);
      if (isExist) {
        this.selectedFiles = this.selectedFiles.filter(item => item.name !== video.name);
      } else {
        // 限制最多选择100个文件（符合要求）
        if (this.selectedFiles.length < 100) {
          this.selectedFiles.push(video);
        } else {
          this.resultMessage = "最多只能选择100个视频文件";
        }
      }
    },
    // 移除已选中的视频
    removeSelectedVideo(idx) {
      this.selectedFiles.splice(idx, 1);
    },
    // 获取检测结果中的主要目标
    getMainObject() {
      if (!this.fullResult.key_frame_detection || !this.fullResult.key_frame_detection.detections.length) {
        return 'N/A';
      }
      // 取置信度最高的目标
      const maxConfDet = this.fullResult.key_frame_detection.detections.reduce((prev, curr) => {
        return curr.confidence > prev.confidence ? curr : prev;
      }, this.fullResult.key_frame_detection.detections[0]);
      return maxConfDet.class;
    },
    // 获取主要目标的置信度
    getMainConfidence() {
      if (!this.fullResult.key_frame_detection || !this.fullResult.key_frame_detection.detections.length) {
        return 0;
      }
      const maxConfDet = this.fullResult.key_frame_detection.detections.reduce((prev, curr) => {
        return curr.confidence > prev.confidence ? curr : prev;
      }, this.fullResult.key_frame_detection.detections[0]);
      return maxConfDet.confidence;
    },
    // 从后端获取服务器视频列表（真实接口对接）
    async fetchServerVideos() {
      try {
        this.isLoading = true;
        this.progressMessage = "加载视频列表...";
        const response = await axios.get(LIST_API_URL);
        const filenames = response.data.filenames || [];
        // 构造视频列表（包含可访问URL）
        this.serverVideos = filenames.map((name, index) => ({
          name: name,
          url: VIDEO_STATIC_PATH + name,
          index: index
        }));
        this.progressMessage = null;
        this.resultMessage = `加载 ${this.serverVideos.length} 个视频`;
      } catch (error) {
        console.error("获取服务器视频列表失败:", error);
        this.resultMessage = "获取视频列表失败，请检查服务器连接";
      } finally {
        this.isLoading = false;
      }
    },
    // 上传视频到服务器（真实接口对接）
    async uploadFileToServer(fileObject) {
      this.isLoading = true;
      this.progressMessage = "上传中...";
      const formData = new FormData();
      formData.append('video', fileObject); // 字段名与后端一致

      try {
        const response = await axios.post(UPLOAD_API_URL, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            this.progressMessage = `上传中... ${percent}%`;
          }
        });

        if (response.data.status === 'success') {
          this.progressMessage = "上传成功，刷新列表...";
          await this.fetchServerVideos(); // 刷新列表
          // 自动选中新上传的视频
          const newVideo = this.serverVideos.find(v => v.name === fileObject.name);
          if (newVideo && !this.isSelected(newVideo)) {
            this.toggleSelectVideo(newVideo);
          }
        } else {
          throw new Error(response.data.error || '上传失败');
        }
      } catch (error) {
        console.error("文件上传失败:", error);
        this.resultMessage = "上传失败：" + error.message;
        this.uploadedFile = null; // 重置上传框
      } finally {
        this.isLoading = false;
      }
    },
    // 开始检测（对接后端分析接口）
    async startDetection() {
      if (this.selectedFiles.length === 0) {
        alert("请先选择至少一个视频文件！");
        return;
      }
      // 目前支持单个视频检测（可扩展批量）
      const targetVideo = this.selectedFiles[0];
      this.isLoading = true;
      this.progressMessage = `检测 ${targetVideo.name}...`;
      this.resultMessage = "检测进行中...";

      try {
        // 步骤1：调用分析接口（传递视频文件名）
        const analyzeResponse = await axios.post(ANALYZE_API_URL, {
          filename: targetVideo.name
        });

        if (analyzeResponse.data.status !== 'success') {
          throw new Error(analyzeResponse.data.error || '检测启动失败');
        }

        this.taskId = analyzeResponse.data.task_id;
        this.progressMessage = `任务ID: ${this.taskId} 处理中...`;

        // 步骤2：获取检测结果（轮询直到完成）
        const getResult = async () => {
          const resultResponse = await axios.get(`${GET_RESULT_API_URL}/${this.taskId}`);
          return resultResponse.data;
        };

        // 轮询获取结果（间隔1秒）
        const resultData = await this.poll(getResult, 1000, 30); // 超时30秒
        this.fullResult = {
          video_description: resultData.video_description,
          video_info: resultData.video_info,
          key_frame_detection: resultData.key_frame_detection,
          accuracy_results: resultData.accuracy_results,
          processing_time: resultData.processing_time
        };

        // 处理后视频URL（拼接基础地址）
        this.processedVideoURL = `${API_BASE_URL}${resultData.video_path}`;
        this.progressMessage = "检测完成";
        this.resultMessage = "多模态偏差检测成功！";
      } catch (error) {
        console.error("检测失败:", error);
        this.resultMessage = "检测失败：" + error.message;
      } finally {
        this.isLoading = false;
      }
    },
    // 轮询工具函数
    async poll(fn, interval, timeout) {
      const start = Date.now();
      while (Date.now() - start < timeout * 1000) {
        const result = await fn();
        if (result.video_description) { // 检测结果是否生成
          return result;
        }
        await new Promise(resolve => setTimeout(resolve, interval));
      }
      throw new Error("检测超时，请重试");
    }
  }
};
</script>


<style lang="scss" scoped>
/* * =========================================
 * 新UI样式（暗黑科技风）
 * =========================================
 */

/* 1. 全局和背景 (不变) */
.section {
  width: 100%;
  min-height: 100vh;
  color: #fff; 
  font-family: "Helvetica Neue", "Microsoft YaHei", sans-serif;
  z-index: 2;
  padding: 10px;
  margin: 0;
  background-color: transparent; 
  display: flex;
  flex-direction: column;
}

.img_box {
  position: fixed; 
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('~@/assets/images/step1/-s-图层 0.png'); 
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  opacity: 1; 
  z-index: -1; 
}

/* 2. 顶部标题栏 (不变) */
.header-bar {
  width: 100%;
  flex-shrink: 0;
  padding: 0 20px;
  height: 60px; 
}

.header-title {
  font-size: calc(1.2vw + 0.8rem); 
  color: #00e5ff; 
  font-weight: bolder;
  letter-spacing: 0.1em;
  margin: 0;
  text-shadow: 0 0 5px #00e5ff;
}

.header-btn {
  background: none;
  border: none;
  cursor: pointer;
  width: 120px; 
  height: 40px; 
  color: #fff;
  font-size: 0.9rem;
  font-weight: bold;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  margin: 0 5px;
}
.btn-home {
  background-image: url('~@/assets/images/step1/-s-按钮-蓝色.png');
}
.btn-back {
  background-image: url('~@/assets/images/step1/-s-按钮-蓝色-1.png');
}
.btn-next {
  background-image: url('~@/assets/images/step1/-s-按钮-绿色.png');
}

/* 3. 核心内容区 (不变) */
.content-row {
  flex-grow: 1; 
  width: 100%;
  max-width: 100%;
  margin: 0;
}

/* 三列通用高度 (不变) */
.left-column, .middle-column, .right-column {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px); /* 减去顶部栏高度和padding */
  padding: 0 !important;
}

/* 【修改】面板通用样式 */
[class^="panel-"] {
  width: 100%;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  /* 【修改】移除了 padding-top: 40px，因为标题拿出去了 */
  padding: 20px 30px 30px 30px; 
  display: flex;
  flex-direction: column;
  /* 【修改】移除了 height 属性，交由 flex-grow 或具体类控制 */
}

/* 【修改】特定面板的高度和边距 */
.panel-left {
  /* 【修改】自动填充剩余高度 */
  flex-grow: 1;
  height: 100%; 
}
.panel-right-top {
  /* 【修改】保持原有高度比例，但会收缩 */
  height: 55%; 
  flex-shrink: 0;
}
.panel-right-bottom {
  /* 【修改】自动填充剩余空间 */
  flex-grow: 1; 
  height: 100%; /* 允许 flex-grow 生效 */
}


.panel-content {
  flex-grow: 1; 
  display: flex;
  flex-direction: column;
  overflow: hidden; 
}

/* 【修改】面板标题 (-s-二级标题.png) */
.panel-header {
  height: 35px; 
  background-image: url('~@/assets/images/step1/-s-二级标题.png');
  background-repeat: no-repeat;
  background-size: 100% 100%; 
  flex-shrink: 0;
  
  color: #fff;
  font-size: 1rem;
  font-weight: bold;
  padding-left: 0; 
  /* 【修改】标题之间增加间距 */
  margin-bottom: 10px; 

  display: flex;
  justify-content: center; 
  align-items: center; 
}
/* 【修改】右侧两个标题之间增加额外间距 */
.header-accuracy {
  margin-top: 15px; 
}


/* 4. 左侧列 (不变) */
.panel-left {
  background-image: url('~@/assets/images/step1/-s-弹框-选择数据.png');
}

.server-video-list {
  flex-grow: 1; 
  max-height: calc(100% - 80px); 
  padding-right: 10px;
  
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #00e5ff; border-radius: 3px; }
  &::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.3); }
}

.video-item {
  padding: 8px 10px;
  margin-bottom: 5px;
  background-color: rgba(0, 100, 150, 0.2); 
  border: 1px solid rgba(0, 229, 255, 0.3); 
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.video-item.selected {
  background-color: rgba(0, 229, 255, 0.4);
  border-color: #00e5ff;
}

.selector-circle {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #00e5ff;
  border-radius: 50%;
  background-color: transparent;
  flex-shrink: 0;
  margin-left: 10px;
}
.video-item.selected .selector-circle {
  background-color: #00e5ff;
}

.action-buttons {
  margin-top: auto; 
  flex-shrink: 0;
  padding-top: 15px;
  text-align: center;
}

.btn-start-detect {
  background: none;
  border: none;
  cursor: pointer;
  width: 220px; 
  height: 50px; 
  background-image: url('~@/assets/images/step1/-s-按钮-开始测试.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  
  color: #fff;
  font-size: 1.1rem;
  font-weight: bold;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  
  &:disabled {
    filter: grayscale(80%);
    cursor: not-allowed;
  }

  span {
    margin-left: 8px; 
  }
}

/* 5. 中间列 (不变) */
.middle-column {
  justify-content: space-around; 
}

.video-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center; 
}

.video-label {
  width: 200px; 
  height: 35px; 
  background-image: url('~@/assets/images/step1/-s-二级标题.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  
  color: #fff;
  font-size: 0.9rem;
  font-weight: bold;
  line-height: 35px;
  text-align: center;
  margin-bottom: 10px;
}
.label-processed {
  font-size: 0.8rem; 
}

.video-frame {
  width: 95%;
  height: 320px; 
  background-image: url('~@/assets/images/step1/-s-框-小视频.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  padding: 15px; 
  display: flex;
  justify-content: center;
  align-items: center;
}

.video-display {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.placeholder-text {
  color: #88a;
  font-size: 1rem;
}


/* 6. 右侧列 (不变) */
.right-column {
  /* 结构在 template 中已修改 */
}

/* 右上方面板 (不变) */
.panel-right-top {
  background-image: url('~@/assets/images/step1/弹框-偏差检测结果.png'); 
}

.description-box {
  flex-grow: 1; 
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 229, 255, 0.3);
  color: #eee;
  font-size: 0.9rem;
  line-height: 1.6;
  padding: 10px !important;
  
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #00e5ff; border-radius: 3px; }
  &::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.3); }
}
.small-text { font-size: 0.9rem; }
.text-red { 
  color: #ff4d4d; 
  font-weight: bold;
  font-size: 0.95rem;
}


/* 【修改】右下方面板 */
.panel-right-bottom {
  /* 【修改】更换背景图 */
  background-image: url('~@/assets/images/step1/-s-弹窗-偏差检测准确率.png');
}

.metric-box {
  flex-grow: 1; 
  display: flex;
  justify-content: center;
  align-items: center;
  
  font-size: 3.5rem; 
  font-weight: bold;
  color: #00e5ff; 
  text-shadow: 0 0 10px #00e5ff;
}

/* 【修改】导出按钮的容器 */
.action-buttons-right {
  flex-shrink: 0; /* 不压缩 */
  text-align: right; /* 按钮靠右 */
  /* 【修改】自动推到底部 */
  margin-top: auto; 
  padding-top: 15px; /* 与上方元素的间距 */
  padding-bottom: 10px; /* 距离列底部的间距 */
}

.btn-export-result {
  background: none;
  border: none;
  cursor: pointer;
  width: 200px; 
  height: 48px; 
  background-image: url('~@/assets/images/step1/-s-按钮-结果导出.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;

  color: #333; 
  font-size: 1.1rem;
  font-weight: bold;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}


/* 7. 响应式调整 (不变) */
@media (max-width: 1400px) {
  .video-frame {
    height: 250px;
  }
  .metric-box {
    font-size: 2.8rem;
  }
  [class^="panel-"] {
    /* 【修改】调整内边距 */
    padding: 20px; 
  }
  .panel-header {
    height: 35px;
  }
}

@media (max-width: 1200px) {
  .left-column, .middle-column, .right-column {
    height: auto; 
    margin-bottom: 20px;
  }
  .content-row {
    flex-direction: column;
    align-items: center;
  }
  .left-column, .right-column {
    width: 80% !important;
    max-width: 80% !important;
  }
  .middle-column {
    width: 90% !important;
    max-width: 90% !important;
  }
  /* 【修改】为右侧列设置最小高度以容纳新布局 */
  .right-column {
    min-height: 600px; 
  }
  .panel-left { min-height: 400px; }
  .panel-right-top { min-height: 250px; height: auto; } /* 响应式时改回 auto */
  .panel-right-bottom { min-height: 150px; } 
}
</style>