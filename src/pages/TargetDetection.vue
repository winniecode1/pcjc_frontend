<template>
  <div class="section">
    <div class="img_box"></div>

    <b-row class="header-bar align-item-s-center no-gutters">
      <b-col cols="3" class="text-left">
        <button class="header-btn btn-home" @click="navigateHome">首页</button>
        <button class="header-btn btn-back" @click="navigateHome">返回</button>
      </b-col>
      <b-col cols="6" class="text-center">
        <h1 class="header-title">多模态信息认知偏差检测模型</h1>
      </b-col>
      <b-col cols="3" class="text-right">
        <button class="header-btn btn-next" @click="navigateNextPage">下个页面</button>
      </b-col>
    </b-row>

    <b-row class="justify-content-center content-row no-gutters">

      <b-col cols="3" class="left-column px-2">
        <div class="panel-header header-select-data">选择数据</div>

        <div class="panel-left">
          <div class="panel-content">
            <div class="server-video-list overflow-auto">
              <!-- 视频列表 -->
              <div v-for="video in videoList" :key="video.id" class="video-item" @click="selectVideo(video)"
                :class="{ 'selected': selectedVideo && selectedVideo.id === video.id }">
                <span>{{ video.name }}</span>
                <span class="selector-circle"></span>
              </div>
            </div>

            <div class="action-buttons">
              <button @click="startDetection" :disabled="!selectedVideo || isLoading" class="btn-start-detect">
                <b-spinner small v-if="isLoading"></b-spinner>
                <span>{{ isLoading ? (progressMessage || '检测中...') : '开始检测' }}</span>
              </button>
            </div>
          </div>
        </div>
      </b-col>

      <b-col cols="5" class="middle-column mx-2 px-1">
        <div class="video-section">
          <div class="video-label label-original">原视频</div>
          <div class="video-frame">
            <video v-if="originalVideoURL" :src="originalVideoURL" controls class="video-display"
              @error="handleVideoError"></video>
            <div v-else class="placeholder-text">请选择视频</div>
          </div>
        </div>

        <div class="video-section">
          <div class="video-label label-processed">多模态检测结果 ({{ taskId || 'N/A' }})</div>
          <div class="video-frame">
            <video v-if="processedVideoURL" :src="processedVideoURL" controls class="video-display"
              :key="processedVideoURL" @error="handleVideoError"></video>
            <div v-else-if="isLoading" class="placeholder-text">等待处理结果...</div>
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
                <span class="text-red">id:{{ fullResult.key_frame_detection.frame_idx }} {{ getMainObject() }} {{
                  getMainConfidence().toFixed(2) }}</span>
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
                {{ (fullResult.accuracy_results.detection.overall * 100).toFixed(2) + '%' }}
              </template>
              <template v-else>
                N/A
              </template>
            </div>
          </div>
        </div>

        <div class="action-buttons-right">
          <!-- 【更改】添加了 @click 和 :disabled 绑定 -->
          <button class="btn-export-result" @click="exportResults" :disabled="!taskId || isLoading">
            <span>结果导出</span>
          </button>
        </div>

      </b-col>
    </b-row>
  </div>
</template>

<script>
import axios from 'axios';
import { BIcon, BIconPlayCircleFill, BIconPlayFill, BSpinner } from 'bootstrap-vue';

// API 基础地址
const API_BASE_URL = 'http://10.109.253.71:5236';
const FRONTEND_BASE_URL = 'http://10.109.253.71:8889';
const BASE_DIR = "/home/wuzhixuan/Project/PCJC/1";
const VIDEO_DIR = "/home/wuzhixuan/Project/PCJC/datasets/Vedio"
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
      videoList: [], // 用于存储视频列表
      selectedVideo: null, // 用于存储选中的视频
      originalVideoURL: null,
      processedVideoURL: null,
      taskId: null,
      isLoading: false,
      progressMessage: null,
      resultMessage: null,
      fullResult: {
        video_description: null,
        accuracy_results: null,
        video_info: null,
        key_frame_detection: null
      }
    };
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    this.fetchVideoList(); // 获取视频列表
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    navigateHome() {
      // "首页" 和 "返回" 都跳转到根路径
      window.location.href = `${FRONTEND_BASE_URL}/`;
    },
    navigateNextPage() {
      // "下个页面" 跳转到指定页面
      window.location.href = `${FRONTEND_BASE_URL}/prior-knowledge`;
    },
    handleResize() {
      this.fullWidth = window.innerWidth;
      this.fullHeight = window.innerHeight;
    },
    handleVideoError(e) {
      console.error("视频加载错误:", e);
      this.resultMessage = "处理后视频加载失败，请检查服务器日志和网络。";
    },
    getMainObject() {
      if (!this.fullResult.key_frame_detection || !this.fullResult.key_frame_detection.detections || !this.fullResult.key_frame_detection.detections.length) {
        return 'N/A';
      }
      const maxConfDet = this.fullResult.key_frame_detection.detections.reduce((prev, curr) => {
        return curr.confidence > prev.confidence ? curr : prev;
      }, this.fullResult.key_frame_detection.detections[0]);
      return maxConfDet.class;
    },
    getMainConfidence() {
      if (!this.fullResult.key_frame_detection || !this.fullResult.key_frame_detection.detections || !this.fullResult.key_frame_detection.detections.length) {
        return 0;
      }
      const maxConfDet = this.fullResult.key_frame_detection.detections.reduce((prev, curr) => {
        return curr.confidence > prev.confidence ? curr : prev;
      }, this.fullResult.key_frame_detection.detections[0]);
      return maxConfDet.confidence;
    },
    async fetchVideoList() {
      try {
        const response = await axios.get(`${API_BASE_URL}/videos`);
        this.videoList = response.data.videos;
        console.log("视频列表获取成功", this.videoList);
      } catch (error) {
        console.error("获取视频列表失败", error);
        this.videoList = [];
      }
    },
    selectVideo(video) {
      this.selectedVideo = video;

      // 正确构造原视频URL
      try {
        // 确保API_BASE_URL末尾没有斜杠
        const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
        // 构造正确的视频URL
        this.originalVideoURL = `${baseUrl}/video/${encodeURIComponent(video.name)}`;
        console.log("原视频URL:", this.originalVideoURL); // 用于调试
      } catch (error) {
        console.error("构造视频URL失败:", error);
        this.originalVideoURL = null;
      }

      // 2. 确保圆圈亮起（已通过v-bind:class实现）
      console.log("已选择视频:", video.name);
    },
    async startDetection() {
      if (!this.selectedVideo) {
        alert("请先选择视频文件！");
        return;
      }

      this.isLoading = true;
      this.processedVideoURL = null;
      this.taskId = null;
      this.fullResult = {
        video_description: null,
        accuracy_results: null,
        video_info: null,
        key_frame_detection: null
      };
      this.resultMessage = "正在启动分析...";
      this.progressMessage = "正在启动分析...";
      console.log("Selected video name:", this.selectedVideo.name);

      const baseUrl = VIDEO_DIR.endsWith('/') ? VIDEO_DIR.slice(0, -1) : VIDEO_DIR;
      const videoPath = `${baseUrl}/${this.selectedVideo.name}`;
      console.log("Constructed video path for /batch_predict:", videoPath);

      try {
        // 1. 调用后端分析接口
        const analyzeResponse = await axios.post(`${API_BASE_URL}/batch_predict`, {
          // 将 video_name 替换为后端期望的 video_path
          video_path: videoPath
        });

        const analyzeData = analyzeResponse.data;
        if (analyzeData.status !== 'success') {
          throw new Error(analyzeData.error || '分析启动失败');
        }

        this.taskId = analyzeData.task_id;
        this.progressMessage = `分析任务 [${this.taskId}] 已启动，正在进行深度处理...`;
        // 【修改点】：增加安全检查
        const processingTime = analyzeData.processing_time;
        const timeDisplay = processingTime ? `${processingTime.toFixed(2)}s` : 'N/A'; // 增加安全检查和默认值

        // 使用新的 timeDisplay 变量
        this.resultMessage = `任务ID: ${this.taskId}。处理时间预计 ${timeDisplay}。`;
        // 2. 获取检测结果
        // 【新增修改点】：去除文件名中的扩展名
        let videoNameWithoutExtension = this.selectedVideo.name;
        // 使用正则表达式匹配并移除末尾的 .xxx 扩展名
        const extensionIndex = videoNameWithoutExtension.lastIndexOf('.');
        if (extensionIndex > 0) {
          videoNameWithoutExtension = videoNameWithoutExtension.substring(0, extensionIndex);
        }

        // 确保编码处理，使用不带扩展名的文件名
        const videoNameEncoded = encodeURIComponent(videoNameWithoutExtension);
        const fullResultResponse = await axios.get(
          `${API_BASE_URL}/get_detection_results/${this.taskId}?video_name=${videoNameEncoded}`
        );
        const fullData = fullResultResponse.data;

        // 3. 更新界面结果 (确保所有字段都已从 fullData 复制过来)
        this.fullResult.task_id = fullData.task_id;
        this.fullResult.video_description = fullData.video_description;
        this.fullResult.video_info = fullData.video_info;
        this.fullResult.accuracy_results = fullData.overall_accuracy;
        this.fullResult.overall_accuracy = fullData.overall_accuracy;      // 新增字段
        this.fullResult.low_similarity_aspects = fullData.low_similarity_aspects; // 新增字段
        this.fullResult.video_path = fullData.video_path;                  // 新增字段
        this.fullResult.deviceType = fullData.deviceType;
        this.fullResult.key_frame_path = fullData.key_frame_path;          // 新增字段
        this.fullResult.key_frame_detection = fullData.key_frame_detection;

        const key_frame_path_url = fullData.key_frame_path;
        const video_path_url = fullData.video_path; // 获取后端返回的 video_path

        // 构造处理后视频的 URL (这个保留，用于播放器)
        this.processedVideoURL = `${API_BASE_URL}${video_path_url}`;


        // 4. 【关键修改】：整合所有后端结果并以 module1Res 的格式存储到 localStorage
        try {
          // --- 1. 路径处理（将相对路径转换为完整的 URL） ---
          const baseUrl = BASE_DIR.replace(/\/$/, '');

          // 关键帧路径处理
          let fullImagePath = "无图像路径";
          if (key_frame_path_url && key_frame_path_url !== "无图像路径") {
            const relativePath = key_frame_path_url.startsWith('/') ? key_frame_path_url : '/' + key_frame_path_url;
            fullImagePath = baseUrl + relativePath;
          }

          // 处理后视频路径处理
          let fullProcessedVideoPath = "无视频路径";
          if (video_path_url && video_path_url !== "无视频路径") {
            const relativePath = video_path_url.startsWith('/') ? video_path_url : '/' + video_path_url;
            fullProcessedVideoPath = baseUrl + relativePath;
          }
          const originalVideoPath = this.originalVideoURL || "无原视频路径";
          // --- 2. 构建 module1Res 最终对象 ---
          // 直接使用 fullData 的所有字段，并用完整的 URL 覆盖路径字段
          const module1Res = {
            ...fullData, // 复制所有后端返回的字段

            // 覆盖字段为完整的 URL 或确保有默认值
            deviceType: fullData.deviceType || "N/A",

            // 使用处理后的完整 URL 覆盖原有的相对路径
            key_frame_path: fullImagePath,
            video_path: fullProcessedVideoPath,

            originalVideoPath: originalVideoPath
          };

          // 3. 将对象转换为 JSON 字符串并存储
          localStorage.setItem('module1Res', JSON.stringify(module1Res));


          // 4. 方便调试：【格式化打印】存储的 module1Res 数据
          console.groupCollapsed("%c✅ Module 1 结果已存储 (module1Res)", "color: #17a2b8; font-weight: bold;");

          // 打印原始 JSON 字符串
          console.log("%c原始 JSON 字符串:", "font-weight: bold; color: #ffc107;", localStorage.getItem('module1Res'));

          // 打印对象所有键值对的表格
          const tableData = Object.entries(module1Res).map(([key, value]) => ({
            Key: key,
            Value: (typeof value === 'object' && value !== null) ? JSON.stringify(value).substring(0, 50) + '...' : value
          }));

          console.log("%c对象内容 (表格展示):", "font-weight: bold; color: #28a745;");
          console.table(tableData);

          // 特别打印 video_description (长文本)
          console.log("%c视频描述 (videoDescription):", "font-weight: bold; color: #00e5ff;", module1Res.videoDescription);

          console.groupEnd(); // 结束分组

        } catch (e) {
          console.error("保存 module1Res 到 localStorage 失败:", e);
        }

        // 【删除】旧的 localStorage 存储方式，替换为新的
        // localStorage.setItem(`video_analysis_${this.taskId}`, JSON.stringify(fullData));
        // console.log("保存模块一结果到 localStorage");

        this.resultMessage = "视频分析成功！结果已更新。";
        this.progressMessage = "分析完成";
      } catch (error) {
        console.error("分析请求失败:", error);
        this.resultMessage = "分析失败: " + (error.response && error.response.data && error.response.data.error) || error.message;
        this.progressMessage = "分析失败";
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * 【新增】: 导出结果
     */
    async exportResults() {
      if (!this.taskId) {
        alert("请先完成一次检测再导出结果。");
        return;
      }

      console.log(`正在请求导出任务: ${this.taskId}`);

      try {
        const response = await axios.get(`${API_BASE_URL}/export_results/${this.taskId}`, {
          responseType: 'blob', // 关键：告诉 axios 期望一个 Blob
        });

        // 从 response 中创建 Blob
        const blob = new Blob([response.data], { type: 'application/zip' });

        // 创建一个临时的 URL
        const downloadUrl = window.URL.createObjectURL(blob);

        // 创建一个 <a> 标签来触发下载
        const link = document.createElement('a');
        link.href = downloadUrl;

        // 设置下载的文件名 (后端已设置 Content-Disposition, 但这里是备用)
        link.download = `${this.taskId}_results.zip`;

        // 将 <a> 标签添加到 DOM 中 (在某些浏览器中是必需的)
        document.body.appendChild(link);

        // 触发点击
        link.click();

        // 清理
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      } catch (error) {
        console.error("导出结果失败:", error);
        // 尝试将 blob 错误转换为 JSON 文本
        if (error.response && error.response.data && error.response.data.type === 'application/json') {
          try {
            const errorJson = await error.response.data.text();
            const errorObj = JSON.parse(errorJson);
            alert(`导出失败: ${errorObj.error || '未知错误'}`);
          } catch (e) {
            alert("导出失败，且无法解析错误详情。");
          }
        } else {
          alert("导出结果失败，请查看控制台日志。");
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
/* 样式保持不变 */

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
.left-column,
.middle-column,
.right-column {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  /* 减去顶部栏高度和padding */
  padding: 0 !important;
}

/* 面板通用样式 (不变) */
[class^="panel-"] {
  width: 100%;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  padding: 20px 30px 30px 30px;
  display: flex;
  flex-direction: column;
}

/* 特定面板的高度和边距 (不变) */
.panel-left {
  flex-grow: 1;
  height: 100%;
}

.panel-right-top {
  height: 55%;
  flex-shrink: 0;
}

.panel-right-bottom {
  flex-grow: 1;
  height: 100%;
}

.panel-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 面板标题 (不变) */
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
  margin-bottom: 10px;

  display: flex;
  justify-content: center;
  align-items: center;
}

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

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #00e5ff;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
  }
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

/* 隐藏 b-form-file (如果不再使用) */
.upload-area {
  display: none;
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

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #00e5ff;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
  }
}

.small-text {
  font-size: 0.9rem;
}

.text-red {
  color: #ff4d4d;
  font-weight: bold;
  font-size: 0.95rem;
}

/* 右下方面板 (不变) */
.panel-right-bottom {
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

/* 导出按钮的容器 (不变) */
.action-buttons-right {
  flex-shrink: 0;
  text-align: right;
  margin-top: auto;
  padding-top: 15px;
  padding-bottom: 10px;
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

  /* 【新增】导出按钮的 disabled 样式 */
  &:disabled {
    filter: grayscale(80%);
    cursor: not-allowed;
  }
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
    padding: 20px;
  }

  .panel-header {
    height: 35px;
  }
}

@media (max-width: 1200px) {

  .left-column,
  .middle-column,
  .right-column {
    height: auto;
    margin-bottom: 20px;
  }

  .content-row {
    flex-direction: column;
    align-items: center;
  }

  .left-column,
  .right-column {
    width: 80% !important;
    max-width: 80% !important;
  }

  .middle-column {
    width: 90% !important;
    max-width: 90% !important;
  }

  .right-column {
    min-height: 600px;
  }

  .panel-left {
    min-height: 400px;
  }

  .panel-right-top {
    min-height: 250px;
    height: auto;
  }

  .panel-right-bottom {
    min-height: 150px;
  }
}
</style>
