<template>
  <div class="section">
    <div class="register" :style="{width: fullWidth+'px', height:fullHeight+'px'}"></div>
    <div class="img_box" :style="{width: fullWidth+'px'}"></div>
    
    <!-- 标题区域 -->
    <b-row class="justify-content-center pt-5">
      <b-col cols="10" class="text-center">
        <p class="newTitle text-center">多模态信息认知偏差检测</p>
      </b-col>
    </b-row>

    <!-- 选择数据区域 -->
    <b-row class="justify-content-center pt-4">
      <b-col cols="10" class="d-flex flex-column">
        <div class="d-flex align-items-center mb-3">
          <span class="select-label">选择数据 (1到100个文件)：</span>
          <div class="server-video-list d-flex flex-wrap ml-3">
            <div 
              v-for="video in serverVideos" 
              :key="video.index"
              class="video-item"
              :class="{ 'selected': isSelected(video) }"
              @click="toggleSelectVideo(video)"
            >
              {{ video.name }}
            </div>
          </div>
        </div>
        <div class="d-flex align-items-center mb-4">
          <span class="selected-label">已选择的数据：</span>
          <div class="selected-video-list d-flex flex-wrap ml-3">
            <div class="selected-item" v-for="(video, idx) in selectedFiles" :key="idx">
              {{ video.name }}
              <span class="close-icon" @click.stop="removeSelectedVideo(idx)">×</span>
            </div>
          </div>
        </div>
      </b-col>
    </b-row>

    <!-- 上传与检测按钮区域 -->
    <b-row class="justify-content-center mb-4">
      <b-col cols="10" class="d-flex justify-start align-items-center">
        <div class="upload-area mx-3">
          <b-form-file
            v-model="uploadedFile"
            :state="Boolean(uploadedFile)"
            placeholder="选择视频..."
            drop-placeholder="拖拽视频到这里..."
            accept="video/*"
            class="upload-input"
            browse-text="上传文件"
          ></b-form-file>
        </div>
        <b-button 
          @click="startDetection" 
          variant="primary" 
          :disabled="selectedFiles.length === 0 || isLoading"
          class="start-btn mx-3"
        >
          <b-spinner small v-if="isLoading"></b-spinner>
          {{ isLoading ? (progressMessage || '检测中...') : '开始检测' }}
        </b-button>
      </b-col>
    </b-row>

    <!-- 视频与结果展示区域 -->
    <b-row class="justify-content-center my-4">
      <!-- 原视频 -->
      <b-col cols="5" class="text-center video-container mx-3">
        <div class="box-label">原视频</div>
        <div class="video-placeholder">
          <video 
            v-if="selectedFiles.length > 0" 
            :src="selectedFiles[0].url" 
            controls 
            class="image-display"
            @error="handleVideoError"
          ></video>
          <div v-else class="placeholder-text">请选择视频</div>
        </div>
      </b-col>

      <!-- 多模态检测结果视频 -->
      <b-col cols="5" class="text-center video-container mx-3">
        <div class="box-label">多模态检测结果 ({{ taskId || 'N/A' }})</div>
        <div class="video-placeholder">
          <video 
            v-if="processedVideoURL" 
            :src="processedVideoURL" 
            controls 
            class="image-display"
            :key="processedVideoURL"
            @error="handleVideoError"
          ></video>
          <div v-else-if="isLoading" class="placeholder-text">检测进行中...</div>
          <div v-else class="placeholder-text">检测结果将在这里显示</div>
        </div>
      </b-col>
    </b-row>

    <!-- 偏差检测结果文本 -->
    <b-row class="justify-content-center my-4">
      <b-col cols="10" class="text-center description-container">
        <div class="box-label">偏差检测结果</div>
        <div class="description-box p-3">
          <p v-if="fullResult.video_description" class="mb-1 text-left">
            {{ fullResult.video_description }}
          </p>
          <p v-if="fullResult.key_frame_detection" class="mb-1 text-left">
            <span class="text-red">id:{{ fullResult.key_frame_detection.frame_idx }} {{ getMainObject() }} {{ getMainConfidence().toFixed(2) }}</span>
          </p>
          <p v-else-if="!isLoading" class="text-left">
            {{ resultMessage || '检测完成后会在这里显示结果信息。' }}
          </p>
        </div>
      </b-col>
    </b-row>

    <!-- 偏差检测准确率 -->
    <b-row class="justify-content-center mt-4 pb-5">
      <b-col cols="10" class="text-center metric-container">
        <div class="box-label">偏差检测准确率</div>
        <div class="metric-box">
          <template v-if="fullResult.accuracy_results && fullResult.accuracy_results.detection">
             {{ (fullResult.accuracy_results.detection.accuracy * 100).toFixed(2) + '%' }}
          </template>
          <template v-else>
             N/A
          </template>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
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
        // 限制最多选择100个文件（符合图片要求）
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
        this.progressMessage = "正在加载视频列表...";
        const response = await axios.get(LIST_API_URL);
        const filenames = response.data.filenames || [];
        // 构造视频列表（包含可访问URL）
        this.serverVideos = filenames.map((name, index) => ({
          name: name,
          url: VIDEO_STATIC_PATH + name,
          index: index
        }));
        this.progressMessage = null;
        this.resultMessage = `成功加载 ${this.serverVideos.length} 个视频文件`;
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
      this.progressMessage = "正在上传文件...";
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
          this.progressMessage = "上传成功，刷新视频列表...";
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
        this.resultMessage = "文件上传失败：" + error.message;
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
      this.progressMessage = `正在对 ${targetVideo.name} 进行检测...`;
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
        this.progressMessage = `任务ID: ${this.taskId}，处理中...`;

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
.section {
  background-color: #EAF4FE;
  color: black;
  font-size: 100%;
  width: 100%;
  min-height: 100vh;
  font-family: "Helvetica Neue";
  z-index: 2;
  padding-bottom: 50px;
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
  z-index: -1;
}

/* 选择数据区域样式 */
.select-label, .selected-label {
  font-weight: bold;
  color: #2168BE;
  font-size: 1rem;
  white-space: nowrap;
}

.server-video-list {
  max-width: calc(100% - 150px);
  overflow-x: auto;
  padding-bottom: 5px;
}

.video-item {
  padding: 6px 12px;
  margin: 0 8px 8px 0;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.video-item.selected {
  background-color: #2168BE;
  color: #fff;
  border-color: #2168BE;
}

.selected-video-list {
  max-width: calc(100% - 150px);
  overflow-x: auto;
  padding-bottom: 5px;
}

.selected-item {
  padding: 6px 12px;
  margin: 0 8px 8px 0;
  background-color: #e1f0ff;
  border: 1px solid #2168BE;
  border-radius: 20px;
  position: relative;
  padding-right: 25px;
}

.close-icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #2168BE;
  cursor: pointer;
  font-weight: bold;
}

/* 上传区域样式 */
.upload-area {
  width: 300px;
}

.start-btn {
  width: 150px;
}

/* 视频容器样式 */
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

.video-placeholder video {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.placeholder-text {
  color: #999;
  font-size: 1.2rem;
}

/* 描述区域样式 */
.description-box {
  min-height: 200px;
  border: 2px solid #ccc;
  background-color: #fff;
  margin-top: 10px;
  overflow-y: auto;
  text-align: left;
  line-height: 1.8;
}

.text-red {
  color: red;
  font-weight: bold;
}

/* 准确率区域样式 */
.metric-box {
  height: 150px;
  line-height: 150px;
  border: 2px solid #ccc;
  font-size: 3rem;
  font-weight: bold;
  color: #2168BE;
  background-color: #fff;
  margin-top: 10px;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .b-col cols="5" {
    flex: 0 0 100%;
    max-width: 100%;
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .server-video-list, .selected-video-list {
    max-width: calc(100% - 120px);
  }
  .upload-area {
    width: 200px;
  }
  .video-placeholder {
    height: 300px;
  }
  .metric-box {
    font-size: 2rem;
    height: 120px;
    line-height: 120px;
  }
}
</style>




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
