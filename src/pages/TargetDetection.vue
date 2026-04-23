<template>
  <div class="section">
    <div class="img_box"></div>

    <b-row class="header-bar align-item-s-center no-gutters">
      <b-col cols="3" class="text-left">
        <button class="header-btn btn-home" @click="navigateHome">首页</button>
        <button class="header-btn btn-back" @click="navigateHome">上个页面</button>
      </b-col>
      <b-col cols="6" class="text-center">
        <!-- <h1 class="newTitle">多模态信息认知偏差检测模型</h1> -->
      </b-col>
      <b-col cols="3" class="text-right">
        <button class="header-btn btn-next" @click="navigateNextPage">下个页面</button>
      </b-col>
    </b-row>

    <b-row class="justify-content-center content-row no-gutters">

      <b-col cols="3" class="left-column px-2">
  <div class="left-panels-container">
    <div class="panel-header header-select-data clean-header">作战指令</div>

    <div class="panel-orders">
      <div class="panel-content">
        <div class="orders-text-box overflow-auto">
          {{ ordersText || '暂无作战指令' }}
        </div>
      </div>
    </div>

    <div class="panel-header header-select-data clean-header">选择认知传播数据源</div>

    <div class="panel-left">
      <div class="panel-content">
        <div class="server-video-list overflow-auto">
          <div v-for="video in videoList" :key="video.id" class="video-item" @click="selectVideo(video)"
            :class="{ 'selected': selectedVideo && selectedVideo.id === video.id }">
            <span>{{ video.name }}</span>
            <span class="selector-circle"></span>
          </div>
        </div>
      </div>
    </div>

    <div class="action-buttons">
      <button @click="startDetection" :disabled="isLoading" class="btn-start-detect">
        <span class="btn-text-pos">开始目标检测</span>
      </button>
    </div>
  </div>
</b-col>

      <b-col cols="5" class="middle-column mx-2 px-1">
        <div class="video-section">
          <div class="video-label label-original">认知传播数据源</div>
          <div class="video-frame">
            <img v-if="originalVideoURL" :src="originalVideoURL" class="video-display" alt="原始图片" @error="handleImageError" />
            <div v-else class="placeholder-text">请选择图片</div>
          </div>
        </div>

        <div class="video-section">
          <div class="video-label label-processed">多模态目标检测结果</div>
          <div class="video-frame" :class="{ 'loading-overlay': isLoading }">
            <img v-if="processedVideoURL && !isLoading" :src="processedVideoURL" class="video-display" alt="检测结果" :key="processedVideoURL" @error="handleImageError" />
            <div v-if="isLoading" class="placeholder-text loading-text">检测中……</div>
            <div v-else-if="!processedVideoURL" class="placeholder-text">检测结果将在这里显示</div>
          </div>
        </div>

        <div class="summary-box-middle" :class="{ 'loading-overlay': isLoading }">
          <div class="summary-content overflow-auto"
            :class="{ 'text-highlight': summaryHighlight, 'loading-text': isLoading }">
            <div v-if="isLoading">检测中……</div>
            <div v-show="hasStartedDetection && !isLoading" class="typing-text">{{ summaryTypingText || '检测中...' }}</div>
            <div v-show="!hasStartedDetection && !isLoading" class="hint-text">请点击"开始目标检测"按钮</div>
          </div>
        </div>
      </b-col>

      <b-col cols="3" class="right-column px-2">

        <div class="bias-button-container">
          <button class="btn-start-bias" @click="handleStartBiasDetection"
            :disabled="!canStartBiasDetection || isBiasTyping || isLoading || isBiasDetecting">
            <span class="btn-text-pos">多模态信息偏差检测</span>
          </button>
        </div>

        <div class="panel-header header-results clean-header">偏差检测结果</div>

        <div class="panel-right-top" :class="{ 'loading-overlay': isBiasDetecting && !showBiasDetails }">
          <div class="panel-content">
            <div class="description-box p-2 overflow-auto"
              :class="{ 'loading-text': isBiasDetecting && !showBiasDetails }">

              <div v-if="isLoading">检测中……</div>
              <div v-else-if="isBiasDetecting && !showBiasDetails" class="text-left small-text">
                计算中…
              </div>
              <div v-else-if="!hasStartedBiasDetection" class="text-left small-text hint-text">
                请点击"多模态信息偏差检测"按钮
              </div>

              <div v-if="hasStartedBiasDetection && !isLoading && showBiasDetails">
                <div v-for="(entry, index) in biasDetailEntries" :key="entry.label"
                  class="typing-text text-left small-text" :class="{ 'text-highlight': entry.highlight && !isBiasTyping }">
                  {{ biasDisplayTexts[index] }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-right-bottom" :class="{ 'loading-overlay': isBiasDetecting }">
          <div class="panel-content">
            <div class="accuracy-content" v-b-tooltip.hover.top="'公式'">
              <span class="accuracy-label">偏差识别准确率</span>
              <span class="accuracy-value">
                <template v-if="isBiasDetecting">
                  计算中...
                </template>
                <template v-else-if="showAccuracy && fullResult.overall_accuracy !== undefined">
                  {{ (fullResult.overall_accuracy * 100).toFixed(2) + '%' }}
                </template>
                <template v-else>
                  N/A
                </template>
              </span>
            </div>
          </div>
        </div>

        <div class="action-buttons-right">
          <button class="btn-export-result" @click="exportResults" :disabled="!taskId || isLoading || isExporting">
            <b-spinner small v-if="isExporting" class="btn-spinner-pos"></b-spinner>
            <span class="btn-text-pos">{{ isExporting ? '导出中...' : '结果导出' }}</span>
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
const IMAGE_API_URL = 'http://10.109.253.71:5237';
const BASE_DIR = "/home/wuzhixuan/Project/PCJC/1";
const VIDEO_DIR = "/home/wuzhixuan/Project/PCJC/datasets/Vedio"
// 定义偏差检测等待时长 (ms) - 5分钟
const BIAS_DETECTION_DELAY = 300000; 

function getFilenameFromPath(fullPath) {
  if (!fullPath || typeof fullPath !== 'string') return null;
  const parts = fullPath.split(/[/\\]/);
  return parts.pop() || null;
}

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
      ordersText: '',
      videoList: [],
      selectedVideo: null,
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
      },
      descriptionEntries: [],
      biasDetailEntries: [],
      biasDisplayTexts: [],
      summaryTextOnly: '',
      summaryHighlight: false,
      biasTypingInterval: null,
      biasTypingTimeout: null,
      accuracyTimeout: null,
      summaryFullText: '',
      summaryTypingText: '',
      summaryTypingInterval: null,
      showBiasDetails: false,
      showAccuracy: false,
      isBiasTyping: false,
      labelsToHighlight: [],
      typingSpeed: 60,
      summaryTypingSpeed: 200,
      isBiasDetecting: false,
      isExporting: false,
      hasStartedDetection: false,
      hasStartedBiasDetection: false
    };
  },
  computed: {
    canStartBiasDetection() {
      // 需要先完成目标识别（fullResult 有检测结果）且不在加载中
      return this.fullResult && this.fullResult.key_frame_detection && !this.isLoading;
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    this.loadInitialData();
    this.$nextTick(() => {
      this.fixLayoutIssues();
    });
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    this.clearTypingIntervals();
  },
  methods: {
    async fetchOrders() {
      try {
        const response = await axios.get(`${API_BASE_URL}/orders`);
        this.ordersText = response.data.text || response.data.orders || response.data.content || '';
        console.log("作战指令获取成功", this.ordersText);
      } catch (error) {
        console.error("获取作战指令失败", error);
        this.ordersText = '';
      }
    },
    async loadInitialData() {
      const module1ResStr = localStorage.getItem('module1Res');
      if (module1ResStr) {
        console.log("检测到 module1Res，正在从缓存加载数据...");
        try {
          const module1Res = JSON.parse(module1ResStr);
          this.populateUIFromStorage(module1Res);
          // 检查偏差检测计时器状态 (需求3)
          this.checkBiasTimerState();
          await this.fetchVideoList();
        } catch (e) {
          console.error("解析 module1Res 失败:", e);
          localStorage.clear();
          await this.fetchVideoList();
        }
      } else {
        console.log("未检测到 module1Res，正常启动...");
        await this.fetchVideoList();
      }
      await this.fetchOrders();
    },
    // 需求3：检查计时器状态
    checkBiasTimerState() {
      // --- 新增代码：优先检查是否已经完成 ---
      if (localStorage.getItem('biasDetectionCompleted') === 'true') {
        console.log("检测到偏差检测已完成，直接恢复结果");
        this.showAccuracy = true;
        this.showBiasDetails = true;
        // 让文字直接显示，不需要打字机效果
        this.biasDisplayTexts = this.biasDetailEntries.map(e => e.text);
        return; 
      }
      // -------------------------------------
      const biasStartTimeStr = localStorage.getItem('biasStartTime');
      if (biasStartTimeStr && this.canStartBiasDetection) {
        const biasStartTime = parseInt(biasStartTimeStr, 10);
        const now = Date.now();
        const elapsed = now - biasStartTime;

        if (elapsed < BIAS_DETECTION_DELAY) {
          const remaining = BIAS_DETECTION_DELAY - elapsed;
          console.log(`恢复偏差检测计时，剩余时间: ${remaining}ms`);
          this.isBiasDetecting = true;
          this.showAccuracy = false; // 准确率未出
          
          // 如果之前的文字显示也应该恢复（这里假设如果刷新页面，文字直接显示）
          this.showBiasDetails = true;
          this.biasDisplayTexts = this.biasDetailEntries.map(e => e.text);
          
          // 启动剩余时间的定时器
          this.startAccuracyTimer(remaining);
        } else {
          // 时间已过，直接显示结果
          console.log('偏差检测计时已过期，直接显示结果');
          this.isBiasDetecting = false;
          this.showAccuracy = true;
          this.showBiasDetails = true;
          this.biasDisplayTexts = this.biasDetailEntries.map(e => e.text);
          localStorage.removeItem('biasStartTime');
        }
      }
    },
    fixLayoutIssues() {
      const style = document.createElement('style');
      style.textContent = `
      .right-column {
        display: flex !important;
        flex-direction: column !important;
        height: calc(100vh - 80px) !important;
      }
      .panel-right-bottom {
        flex-grow: 0 !important;
        height: 100px !important;
        min-height: 100px !important;
      }
      .action-buttons-right {
        margin-top: auto !important;
        padding-top: 15px !important;
      }
    `;
      document.head.appendChild(style);
    },
    async populateUIFromStorage(data) {
      console.log("正在填充UI:", data);
      // Ensure originalVideoURL is an absolute URL
      if (data.originalVideoPath) {
        if (data.originalVideoPath.startsWith('http://') || data.originalVideoPath.startsWith('https://')) {
          this.originalVideoURL = data.originalVideoPath;
        } else {
          this.originalVideoURL = `${IMAGE_API_URL}${data.originalVideoPath}`;
        }
      }
      // Ensure processedVideoURL is an absolute URL
      if (data.video_path) {
        if (data.video_path.startsWith('http://') || data.video_path.startsWith('https://')) {
          this.processedVideoURL = data.video_path;
        } else {
          this.processedVideoURL = `${IMAGE_API_URL}${data.video_path}`;
        }
      }
      this.taskId = data.task_id;
      this.fullResult = data;

      // 恢复选中视频信息
      if (data.video_info && data.video_info.name) {
        this.selectedVideo = { name: data.video_info.name, id: data.video_info.id || -1 };
      } else if (data.originalVideoPath) {
        const videoName = getFilenameFromPath(data.originalVideoPath);
        if (videoName) {
          this.selectedVideo = { name: videoName, id: -1 };
        }
      }

      // 尝试从缓存恢复作战指令，如果没有则重新获取
      if (data.instruction) {
        this.ordersText = data.instruction;
      } else if (this.selectedVideo && this.selectedVideo.id) {
        // 如果有选中的视频，尝试获取对应的作战指令
        try {
          const response = await axios.get(`${IMAGE_API_URL}/api/dataset/sample/${this.selectedVideo.id}`);
          const sampleData = response.data;
          if (sampleData.instruction) {
            this.ordersText = sampleData.instruction;
          }
        } catch (e) {
          console.warn("从缓存恢复时获取作战指令失败:", e);
        }
      }

      this.prepareDescriptionDisplay(data);
      this.summaryTypingText = '';
      // 从缓存恢复时也启用打字机效果
      this.startSummaryTyping();
      // 默认先不显示，通过 checkBiasTimerState 决定是否显示
      this.showBiasDetails = false;
      this.showAccuracy = false;
      this.resultMessage = "已从缓存加载数据。";
      this.progressMessage = "加载完成";
      this.isLoading = false;
      this.syncAndPlayVideos();
    },
    navigateHome() {
      window.location.href = '/';
    },
    navigateNextPage() {
      window.location.href = '/prior-knowledge';
    },
    handleResize() {
      this.fullWidth = window.innerWidth;
      this.fullHeight = window.innerHeight;
    },
    handleVideoError(e) {
      console.error("视频加载错误:", e);
      this.resultMessage = "处理后视频加载失败，请检查服务器日志和网络。";
    },
    handleImageError(e) {
      console.error("图片加载错误:", e);
      this.resultMessage = "图片加载失败，请检查服务器日志和网络。";
      this.originalVideoURL = null;
    },
    getMainObject() {
      if (!this.fullResult.key_frame_detection || !this.fullResult.key_frame_detection.detections || !this.fullResult.key_frame_detection.detections.length) {
        return 'N/A';
      }
      const maxConfDet = this.fullResult.key_frame_detection.detections.reduce((prev, curr) => {
        return curr.confidence > prev.confidence ? curr : prev;
      }, this.fullResult.key_frame_detection.detections[0]);
      // 支持 class 和 class_name 两种字段名
      return maxConfDet.class_name || maxConfDet.class || 'N/A';
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
    resetResultState(options = {}) {
      const { preserveMessages = false } = options;
      this.processedVideoURL = null;
      this.taskId = null;
      this.fullResult = {
        video_description: null,
        accuracy_results: null,
        video_info: null,
        key_frame_detection: null
      };
      if (!preserveMessages) {
        this.resultMessage = null;
        this.progressMessage = null;
      }
      this.descriptionEntries = [];
      this.biasDetailEntries = [];
      this.biasDisplayTexts = [];
      this.summaryTextOnly = '';
      this.summaryHighlight = false;
      this.showBiasDetails = false;
      this.showAccuracy = false;
      this.labelsToHighlight = [];
      this.isBiasTyping = false;
      this.summaryFullText = '';
      this.summaryTypingText = '';
      this.isBiasDetecting = false;
      this.hasStartedDetection = false;
      this.hasStartedBiasDetection = false;
      
      // 需求2：强制清理计时器相关
      this.clearTypingIntervals();
      localStorage.removeItem('biasStartTime'); // 清除计时缓存
      // --- 新增代码：清除完成标记 ---
      localStorage.removeItem('biasDetectionCompleted');
    },
    clearTypingIntervals() {
      if (this.summaryTypingInterval) {
        clearInterval(this.summaryTypingInterval);
        this.summaryTypingInterval = null;
      }
      if (this.biasTypingInterval) {
        clearInterval(this.biasTypingInterval);
        this.biasTypingInterval = null;
      }
      this.clearBiasTimeouts();
    },
    autoPlayOriginalVideo() {
      this.$nextTick(() => {
        const videoEl = this.$refs.originalVideo;
        if (!videoEl) return;
        try {
          videoEl.currentTime = 0;
          const playPromise = videoEl.play();
          if (playPromise && typeof playPromise.then === 'function') {
            playPromise.catch(err => console.warn("自动播放原视频失败:", err));
          }
        } catch (err) {
          console.warn("自动播放原视频异常:", err);
        }
      });
    },
    syncAndPlayVideos() {
      this.$nextTick(() => {
        const original = this.$refs.originalVideo;
        const processed = this.$refs.processedVideo;
        if (!original || !processed) return;
        try {
          original.currentTime = 0;
          processed.currentTime = 0;
          [original.play(), processed.play()].forEach(p => {
            if (p && typeof p.then === 'function') {
              p.catch(err => console.warn("同步播放失败:", err));
            }
          });
        } catch (err) {
          console.warn("同步播放异常:", err);
        }
      });
    },
    extractDeviceTypeFromDescription(description) {
      if (!description || typeof description !== 'string') {
        return "N/A";
      }
      const lines = description.split(/\r?\n/);
      for (const line of lines) {
        const match = line.match(/^目标[：:]\s*(.+)$/);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
      return "N/A";
    },
    prepareDescriptionDisplay(fullData) {
      this.clearTypingIntervals();
      this.updateLabelsToHighlight(fullData.low_similarity_aspects);
      this.descriptionEntries = this.buildDescriptionEntries(fullData.description || fullData.video_description || '');
      // 直接使用 video_description 作为显示内容，没有则显示空字符串
      this.summaryFullText = fullData.description || fullData.video_description || '';
      this.summaryTextOnly = '';
      this.summaryTypingText = '';
      this.biasDetailEntries = this.descriptionEntries.filter(entry => entry.label !== '总结');
      this.biasDisplayTexts = this.biasDetailEntries.map(() => '');
      this.showBiasDetails = false;
      this.showAccuracy = false;
    },
    startSummaryTyping() {
      if (!this.summaryFullText || this.summaryTypingInterval) {
        return;
      }
      this.summaryTypingText = '';
      let charIndex = 0;
      this.summaryTypingInterval = setInterval(() => {
        this.summaryTypingText = this.summaryFullText.slice(0, charIndex + 1);
        charIndex += 1;
        if (charIndex >= this.summaryFullText.length) {
          clearInterval(this.summaryTypingInterval);
          this.summaryTypingInterval = null;
        }
      }, this.summaryTypingSpeed);
    },
    updateLabelsToHighlight(rawAspects) {
      const aspects = this.parseLowSimilarityAspects(rawAspects);
      const validLabels = new Set(['场景', '目标', '行为', '总结']);
      const labels = new Set();
      (aspects || []).forEach(item => {
        if (typeof item !== 'string') return;
        const name = item.trim().replace(/^["'《【\s]+|["'》】\s]+$/g, '');
        if (name === '目标') {
          labels.add('目标');
        }
        if (validLabels.has(name)) {
          labels.add(name);
        }
      });
      this.labelsToHighlight = Array.from(labels);
    },
    parseLowSimilarityAspects(raw) {
       // ... existing implementation same as before ...
       try {
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        if (typeof raw === 'object') {
          for (const key of ['low_similarity_aspects', 'data', 'items', 'list']) {
            if (Array.isArray(raw[key])) return raw[key];
          }
          for (const k in raw) {
            if (Array.isArray(raw[k])) return raw[k];
          }
          return [];
        }
        if (typeof raw === 'string') {
          const s = raw.trim();
          if (!s) return [];
          if (s.startsWith('[') && s.endsWith(']')) {
            try { return JSON.parse(s); } catch (_) { }
          }
          if ((s.startsWith('{') && s.endsWith('}')) || (s.startsWith('[') && s.endsWith(']'))) {
            const normalized = s.replace(/'/g, '"');
            try {
              const obj = JSON.parse(normalized);
              return this.parseLowSimilarityAspects(obj);
            } catch (_) { /* ignore */ }
          }
          const match = s.match(/\[([^\]]+)\]/);
          if (match && match[0]) {
            const arrText = match[0].replace(/'/g, '"');
            try { return JSON.parse(arrText); } catch (_) {
              return match[1].split(',').map(t => t.replace(/["'\s]/g, '')).filter(Boolean);
            }
          }
        }
      } catch (e) {
        console.warn('解析 low_similarity_aspects 失败：', e);
      }
      return [];
    },
    buildDescriptionEntries(description) {
      if (!description) return [];
      const lines = description.split(/\r?\n/).filter(line => line.trim() !== '');
      return lines.map(line => {
        const trimmedLine = line.trim();
        const match = trimmedLine.match(/^([^：:]+)[：:]\s*(.*)$/);
        if (match) {
          let label = match[1].trim();
          if (label === '目标') {
            label = '目标';
          }
          const value = match[2].trim();
          return {
            label,
            text: `${label}：${value}`,
            highlight: this.labelsToHighlight.includes(label)
          };
        }
        return {
          label: '其他',
          text: trimmedLine,
          highlight: false
        };
      });
    },
    async handleStartBiasDetection() {
      if (!this.canStartBiasDetection) return;
      this.isBiasDetecting = true;
      this.hasStartedBiasDetection = true;
      this.clearBiasTimeouts();
      this.showBiasDetails = false;
      this.showAccuracy = false;
      this.resetBiasTyping();

      const sampleId = this.selectedVideo.id;
      if (!sampleId) {
        console.error("没有选中样本");
        this.isBiasDetecting = false;
        return;
      }

      try {
        // 调用偏差检测接口
        const response = await axios.get(`${IMAGE_API_URL}/api/dataset/sample/${sampleId}/bias`);
        const data = response.data;

        console.log("偏差检测结果:", data);

        // 保存偏差结果到 fullResult
        this.fullResult.bias_result = data.bias_result || {};
        this.fullResult.overall_accuracy = (data.overall_accuracy && data.overall_accuracy.accuracy) || 0;

        // 构建偏差详情条目
        this.biasDetailEntries = this.buildBiasDetailEntries(data);

        // 需求3：设置开始时间并存入 localStorage
        localStorage.setItem('biasStartTime', Date.now().toString());

        // 开始文字打字效果倒计时 (3秒后开始)
        this.biasTypingTimeout = setTimeout(() => {
          this.showBiasDetails = true;
          this.isBiasTyping = true;
          this.startBiasTypingSequence(0);
          this.biasTypingTimeout = null;
        }, 3000);

        // 准确率直接显示（如果后端已返回）
        if (data.overall_accuracy && data.overall_accuracy.accuracy !== undefined) {
          this.showAccuracy = true;
          this.isBiasDetecting = false;
          localStorage.setItem('biasDetectionCompleted', 'true');
        } else {
          // 开始准确率结果倒计时 (5分钟)
          this.startAccuracyTimer(BIAS_DETECTION_DELAY);
        }
      } catch (error) {
        console.error("偏差检测请求失败:", error);
        this.isBiasDetecting = false;
        this.showBiasDetails = false;
        this.resultMessage = "偏差检测失败: " + ((error.response && error.response.data && error.response.data.error) || error.message);
      }
    },
    buildBiasDetailEntries(data) {
      const entries = [];
      const biasResult = data.bias_result || {};

      if (biasResult.instruction_scene) {
        entries.push({
          label: '指令场景',
          text: `指令场景：${biasResult.instruction_scene}`,
          highlight: false
        });
      }
      if (biasResult.instruction_evidence) {
        entries.push({
          label: '指令证据',
          text: `指令证据：${biasResult.instruction_evidence}`,
          highlight: false
        });
      }
      if (biasResult.image_scene) {
        entries.push({
          label: '图片场景',
          text: `图片场景：${biasResult.image_scene}`,
          highlight: false
        });
      }
      if (biasResult.image_evidence) {
        entries.push({
          label: '图片证据',
          text: `图片证据：${biasResult.image_evidence}`,
          highlight: false
        });
      }
      if (biasResult.is_consistent !== undefined) {
        const status = biasResult.is_consistent ? '一致' : '不一致';
        const reason = biasResult.reason || '';
        entries.push({
          label: '偏差结果',
          text: `偏差结果：${status}`,
          highlight: true
        });
        if (reason) {
          entries.push({
            label: '判断原因',
            text: `判断原因：${reason}`,
            highlight: false
          });
        }
      }

      return entries;
    },
    // 封装准确率定时器
    startAccuracyTimer(delay) {
      if (this.accuracyTimeout) clearTimeout(this.accuracyTimeout);
      this.accuracyTimeout = setTimeout(() => {
        this.showAccuracy = true;
        this.isBiasDetecting = false;
        this.accuracyTimeout = null;
        // --- 新增代码：移除计时开始时间，但写入完成标记 ---
        localStorage.removeItem('biasStartTime'); 
        localStorage.setItem('biasDetectionCompleted', 'true'); // 标记已完成
      }, delay);
    },
    clearBiasTimeouts() {
      if (this.biasTypingTimeout) {
        clearTimeout(this.biasTypingTimeout);
        this.biasTypingTimeout = null;
      }
      if (this.accuracyTimeout) {
        clearTimeout(this.accuracyTimeout);
        this.accuracyTimeout = null;
      }
    },
    resetBiasTyping() {
      if (this.biasTypingInterval) {
        clearInterval(this.biasTypingInterval);
        this.biasTypingInterval = null;
      }
      this.biasDisplayTexts = this.biasDetailEntries.map(() => '');
      this.isBiasTyping = false;
    },
    startBiasTypingSequence(index) {
      if (index >= this.biasDetailEntries.length) {
        this.isBiasTyping = false;
        this.biasTypingInterval = null;
        return;
      }
      const entry = this.biasDetailEntries[index];
      let charIndex = 0;
      this.biasTypingInterval = setInterval(() => {
        this.$set(this.biasDisplayTexts, index, entry.text.slice(0, charIndex + 1));
        charIndex += 1;
        if (charIndex >= entry.text.length) {
          clearInterval(this.biasTypingInterval);
          this.biasTypingInterval = null;
          this.startBiasTypingSequence(index + 1);
        }
      }, this.typingSpeed);
    },
    async fetchVideoList() {
      try {
        // 图片接口在 5237 端口
        const response = await axios.get(`${IMAGE_API_URL}/api/dataset/images`);
        if (response.data.images) {
          this.videoList = response.data.images.map((img, index) => ({
            id: img.id,
            name: img.filename,
            path: img.image_path,
            imageUrl: img.image_url
          }));
          console.log("图片列表获取成功", this.videoList);
        }
        if (this.selectedVideo && this.selectedVideo.name) {
          const matchedVideo = this.videoList.find(v => v.name === this.selectedVideo.name);
          if (matchedVideo) {
            this.selectedVideo = matchedVideo;
          }
        }
      } catch (error) {
        console.error("获取图片列表失败", error);
        this.videoList = [];
      }
    },
    async selectVideo(video) {
      this.selectedVideo = video;
      localStorage.clear(); // 保持原有的清除逻辑
      // 需求2：确保切换视频时，右侧计时器完全重置
      this.resetResultState();
      console.log("选择新视频，状态已重置。");

      try {
        // 调用接口获取选中样本的图片和作战指令
        const response = await axios.get(`${IMAGE_API_URL}/api/dataset/sample/${video.id}`);
        const data = response.data;

        // 设置原图 URL
        if (data.image_url) {
          if (data.image_url.startsWith('http://') || data.image_url.startsWith('https://')) {
            this.originalVideoURL = data.image_url;
          } else {
            this.originalVideoURL = `${IMAGE_API_URL}${data.image_url}`;
          }
        }
        console.log("原图片URL:", this.originalVideoURL);

        // 设置作战指令
        if (data.instruction) {
          this.ordersText = data.instruction;
          console.log("作战指令:", this.ordersText);
        }

      } catch (error) {
        console.error("获取样本信息失败:", error);
        // 备用方案：使用原来的逻辑
        try {
          if (video.imageUrl) {
            if (video.imageUrl.startsWith('http://') || video.imageUrl.startsWith('https://')) {
              this.originalVideoURL = video.imageUrl;
            } else {
              this.originalVideoURL = `${IMAGE_API_URL}${video.imageUrl}`;
            }
          } else if (video.path) {
            if (video.path.startsWith('http://') || video.path.startsWith('https://')) {
              this.originalVideoURL = video.path;
            } else {
              this.originalVideoURL = `${IMAGE_API_URL}/image?path=${encodeURIComponent(video.path)}`;
            }
          } else {
            this.originalVideoURL = `${IMAGE_API_URL}/image?path=${encodeURIComponent(video.name)}`;
          }
        } catch (fallbackError) {
          console.error("构造图片URL失败:", fallbackError);
          this.originalVideoURL = null;
        }
      }
      console.log("已选择图片:", video.name);
    },
    async startDetection() {
      // 这里的逻辑与 selectVideo 类似，需要清理旧状态
      // 但不要清除 selectVideo 选中的 selectedVideo 对象
      const currentVideo = this.selectedVideo;
      localStorage.clear(); // 清理
      this.selectedVideo = currentVideo; // 恢复选中状态

      console.log("LocalStorage 已清空。");

      if (!this.selectedVideo) {
        alert("请先选择图片文件！");
        return;
      }

      this.isLoading = true;
      this.resetResultState({ preserveMessages: true });
      this.hasStartedDetection = true;
      this.resultMessage = "正在启动分析...";
      this.progressMessage = "正在启动分析...";
      console.log("Selected image name:", this.selectedVideo.name);
      console.log("Selected image id:", this.selectedVideo.id);

      try {
        // 调用新的目标识别接口
        const response = await axios.get(
          `${IMAGE_API_URL}/api/dataset/sample/${this.selectedVideo.id}/detection`
        );
        const fullData = response.data;

        console.log("检测结果:", fullData);

        // 提取 YOLO 检测结果
        const yoloResult = fullData.yolo_result || {};
        const detectionCount = yoloResult.detection_count || 0;
        const detectedClasses = yoloResult.detected_classes || [];
        const detections = yoloResult.detections || [];

        this.progressMessage = `检测到 ${detectionCount} 个目标`;

        // 设置任务 ID
        this.taskId = fullData.id || this.selectedVideo.id;

        // 更新 fullResult
        this.fullResult.task_id = this.taskId;
        this.fullResult.video_description = fullData.description || '';
        this.fullResult.video_info = {
          name: this.selectedVideo.name,
          id: this.selectedVideo.id
        };
        this.fullResult.key_frame_detection = {
          detection_count: detectionCount,
          detected_classes: detectedClasses,
          detections: detections
        };

        // 设置检测结果图片 - 使用 YOLO 画框图接口
        const sampleId = this.selectedVideo.id || fullData.id;
        if (sampleId) {
          this.processedVideoURL = `${IMAGE_API_URL}/api/result/yolo_image/${sampleId}`;
          console.log("Processed image URL:", this.processedVideoURL);
        } else {
          this.processedVideoURL = null;
        }

        // 准备描述显示
        this.prepareDescriptionDisplay(fullData);
        // 如果没有检测结果内容，根据检测到的目标生成描述
        if (!this.summaryFullText && detectedClasses.length > 0) {
          this.summaryFullText = `检测结果：共发现 ${detectionCount} 个目标\n目标类别：${detectedClasses.join('、')}`;
        } else if (!this.summaryFullText) {
          this.summaryFullText = '未检测到目标';
        }
        this.startSummaryTyping();

        // 保存到缓存
        try {
          const yoloImageUrl = `${IMAGE_API_URL}/api/result/yolo_image/${sampleId}`;
          const module1Res = {
            ...fullData,
            deviceType: this.fullResult.deviceType || this.extractDeviceTypeFromDescription(fullData.description) || "N/A",
            key_frame_path: yoloImageUrl,
            video_path: yoloImageUrl,
            originalVideoPath: this.originalVideoURL,
            instruction: this.ordersText,
            task_id: this.taskId,
            video_description: fullData.description || ''
          };

          localStorage.setItem('module1Res', JSON.stringify(module1Res));
        } catch (e) {
          console.error("保存 module1Res 到 localStorage 失败:", e);
        }

        this.resultMessage = "图片分析成功！结果已更新。";
        this.progressMessage = "分析完成";
      } catch (error) {
        console.error("分析请求失败:", error);
        this.resultMessage = "分析失败: " + (error.response && error.response.data && error.response.data.error) || error.message;
        this.progressMessage = "分析失败";
      } finally {
        this.isLoading = false;
      }
    },
    async exportResults() {
      if (!this.taskId) {
        alert("请先完成一次检测再导出结果。");
        return;
      }
      console.log(`正在请求导出任务: ${this.taskId}`);
      this.isExporting = true;
      try {
        const response = await axios.get(`${API_BASE_URL}/export_results/${this.taskId}`, {
          responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/zip' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${this.taskId}_results.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      } catch (error) {
        console.error("导出结果失败:", error);
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
      } finally {
        this.isExporting = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
/* 字体定义 */
@font-face {
  font-family: 'DOUYUFont';
  src: url('~@/assets/douyuFont-2.otf') format('opentype');
}

@font-face {
  font-family: 'DINAlternate-Bold';
  src: url('~@/assets/douyuFont-2.otf') format('opentype');
  font-weight: 700;
}

/* 1. 全局和背景 */
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
  background-position: center top;
  opacity: 1;
  z-index: -1;
}

/* 2. 顶部标题栏 */
.header-bar {
  width: 100%;
  flex-shrink: 0;
  padding: 0 20px;
  height: 60px;
}

.newTitle {
  width: 524px;
  height: 40px;
  font-family: 'DOUYUFont', sans-serif;
  color: #FFFFFF;
  font-weight: 400;
  font-size: 31px;
  font-style: normal;
  text-decoration: none;
  text-align: center;
  background: linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(191, 245, 255, 1) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: inline-block;
  line-height: 40px;
}

.header-btn {
  font-family: 'DOUYUFont', sans-serif;
  color: #FFFFFF;
  font-weight: 400;
  font-size: 14px;
  font-style: normal;
  background: none;
  border: none;
  cursor: pointer;
  width: 120px;
  height: 40px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  margin: 0 5px;
}

.btn-home {
  background-image: url('~@/assets/images/step4/首页按键.png');
}

.btn-back {
  background-image: url('~@/assets/images/step1/-s-按钮-蓝色-1.png');
}

.btn-next {
  background-image: url('~@/assets/images/step1/-s-按钮-蓝色-1.png');
}

/* 3. 核心内容区 */
.content-row {
  flex-grow: 1;
  width: 100%;
  max-width: 100%;
  margin: 0;
}

/* 三列通用高度 */
.left-column,
.middle-column,
.right-column {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  padding: 0 !important;
  justify-content: flex-start !important;
  gap: 10px;
}

/* 面板通用样式 */
[class^="panel-"] {
  width: 100%;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  padding: 20px 30px 30px 30px;
  display: flex;
  flex-direction: column;
}

/* 特定面板的高度和边距 */
.panel-left {
  flex-grow: 1;
  height: 100px;
}

.panel-right-top {
  flex: 1;
  min-height: 0;
  flex-shrink: 0;
  margin-bottom: 0;
  width: 400px;
  height: 570px;
}

.panel-right-bottom {
  flex-grow: 0;
  height: 100px !important;
  min-height: 100px;
}

.panel-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 标题样式 */
.panel-header {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  text-align: center !important;
  padding: 0 !important;
  margin: 0 auto 10px auto !important; 
  box-sizing: border-box !important; 
  padding-top: 5px !important;
  
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  
  font-family: 'DOUYUFont', sans-serif !important;
  color: #FFFFFF !important;
  font-weight: 400 !important;
  font-size: 18px !important;
}

.header-select-data {
  border: none !important; 
  border-image: none !important;
  width: 400px !important;
  height: 40px !important;
  background-image: url('~@/assets/images/step1/-s-二级标题.png') !important;
  background-repeat: no-repeat !important;
  background-size: 100% 100% !important;
}

.panel-header.header-results {
  box-shadow: none !important;
  width: 400px !important;
  height: 50px !important; 
  background-image: url('~@/assets/images/step1/-s-二级标题.png') !important;
}

.clean-header {
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* 左侧面板容器 */
.left-panels-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
}

/* 作战指令面板 */
.panel-orders {
  background-image: url('~@/assets/images/step1/-s-弹框-选择数据.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  width: 100%;
  min-height: 300px;
  padding: 15px;
}

.orders-text-box {
  width: 100%;
  height: 100%;
  min-height: 225px;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 229, 255, 0.3);
  border-radius: 4px;
  color: #eee;
  font-size: 0.95rem;
  line-height: 1.6;
  padding: 12px 15px;
  white-space: pre-wrap;
  word-break: break-all;

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

/* 选择数据面板 */
.panel-left {
  background-image: url('~@/assets/images/step1/-s-弹框-选择数据.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  width: 100%;
  min-height: 300px;
  padding: 15px;
}

.server-video-list {
  flex-grow: 1;
  min-height: 150px;
  overflow-y: auto;
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

/* 通用按钮容器设置 */
.btn-start-detect,
.btn-start-bias,
.btn-export-result {
  position: relative !important; 
  display: block !important;    
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  cursor: pointer;
  justify-content: initial;
  align-items: initial;
  color: #fff;
}

.btn-start-detect {
  width: 250px;
  height: 100px;
  font-size: 20px; 
  background-image: url('~@/assets/images/step1/-s-按钮-开始测试.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  display: inline-block; 
  margin: 0 auto;
}

.btn-start-detect:disabled {
  filter: grayscale(80%);
  cursor: not-allowed;
}

/* 5. 中间列 */
.middle-column {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 5px;
}

.video-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0;
  flex-shrink: 0;
}

.video-label {
  width: 400px;
  height: 40px;
  background-image: url('~@/assets/images/step1/-s-二级标题.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  color: #fff;
  font-family: 'DOUYUFont', sans-serif;
  font-size: 14px;
  font-weight: 400;
  font-style: normal;
  margin-bottom: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative;
  box-sizing: border-box; 
  padding-top: 5px !important;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('~@/assets/images/step1/-s-二级标题.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;
    z-index: -1;
  }

  background: linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(191, 245, 255, 1) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.label-processed {
  font-size: 14px;
}

.video-frame {
  width: 600px;
  height: 280px;
  background-image: url('~@/assets/images/step1/-s-框-小视频.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  padding: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.video-section:first-of-type .video-frame {
  width: 800px;
  height: 320px;
}

.video-section:nth-of-type(2) .video-frame {
  width: 800px;
  height: 300px;
}

.video-display {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.video-section:first-of-type .video-frame .video-display {
  width: 650px;
  height: 280px;
}

.video-section:nth-of-type(2) .video-frame .video-display {
  width: 660px;
  height: 260px;
}

.placeholder-text {
  color: #88a;
  font-size: 1rem;
}

.summary-box-middle {
  width: 600px;
  height: 200px;
  background-image: url('~@/assets/images/step1/-s-框-小视频.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 0;
  flex-shrink: 0;
}

.summary-content {
  width: 100%;
  height: 100%;
  font-size: 1.2rem;
  line-height: 1.4;
  color: #eee;
  white-space: pre-wrap;
  overflow: auto;
  text-align: left;
  padding: 8px 15px;

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

/* 6. 右侧列 */
.panel-right-top {
  background-image: url('~@/assets/images/step1/弹框-偏差检测结果.png');
}

.bias-button-container {
  min-height: 70px;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
  padding: 8px 0;
}

.description-box {
  flex-grow: 1;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 229, 255, 0.3);
  color: #eee;
  font-size: 0.9rem;
  line-height: 1.6;
  padding: 10px !important;
  overflow: auto;
  display: flex;
  flex-direction: column;

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

.description-text {
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  color: #eee;
}

.btn-start-bias {
  width: 250px;
  height: 100px;
  background-image: url('~@/assets/images/step1/偏差检测按键.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  font-family: 'DOUYUFont', sans-serif;
  font-size: 16px;
  display: block;
  margin: 0 auto;
}

.btn-start-bias:disabled {
  filter: grayscale(80%);
  cursor: not-allowed;
}

.typing-text {
  /* 1. 解决缩进问题 */
  white-space: pre-line;       /* 关键：保留换行符(\n)，但会自动合并代码里的缩进空格，从而消除首行缩进 */
  text-indent: 0 !important;   /* 强制设置为0，防止被其他样式覆盖 */
  padding-left: 0;             /* 确保左侧没有内边距 */
  
  /* 2. 增加行间距 */
  line-height: 2.0;            /* 行高：数字越大间距越大（推荐 1.8 到 2.2） */
  margin-bottom: 15px;         /* 段落之间的间距（每段文字之间的距离） */
  
  /* 其他保持不变 */
  display: block;              /* 确保独占一行 */
  text-align: left;            /* 左对齐 */
  word-break: break-all;       /* 防止长英文单词撑破布局 */
}

.hint-text {
  color: #9fc5ff;
  margin-bottom: 6px;
}

.small-text {
  font-size: 0.9rem;
  line-height: 1.6;
}

.text-red {
  color: #ff4d4d;
  font-weight: bold;
  font-size: 0.95rem;
}

.panel-right-bottom {
  background-image: url('~@/assets/images/step4/准确率框.png');
  width: 400px;
  height: 90px;
}

.panel-right-bottom .panel-content {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  padding: 0;
  width: 100%;
  height: 100%;
}

.accuracy-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 15px;
}

/* 公式 tooltip 样式 - 鼠标悬停时字体增大 */
::v-deep .accuracy-content .tooltip .tooltip-inner {
  font-size: 32px !important;
}

.accuracy-label {
  color: #fff;
  font-family: 'DOUYUFont';
  font-weight: 400;
  font-size: 16px;
  font-style: normal;
  text-decoration: none;
  margin-bottom: 0;
  white-space: nowrap;
  flex-shrink: 0;
  margin-left: -1em;
}

.accuracy-value {
  font-size: 34px;
  font-weight: 700;
  color: #00e5ff;
  text-shadow: 0 0 10px #00e5ff, 0 0 20px rgba(0, 229, 255, 0.5);
  letter-spacing: 0.05em;
  white-space: nowrap;
  margin-top: 5px;
  margin-left: 5px;
}

.action-buttons-right {
  flex-shrink: 0;
  text-align: right;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 5px !important;
  padding-top: 0 !important;
  padding-bottom: 10px;
}

.btn-export-result {
  width: 250px;
  height: 100px;
  background-image: url('~@/assets/images/step1/-s-按钮-结果导出.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  font-family: 'DOUYUFont', sans-serif;
  font-size: 23px;
  display: block;
  margin: 0 auto;
}

.btn-export-result:disabled {
  filter: grayscale(80%);
  cursor: not-allowed;
}

.btn-text-pos {
  position: absolute;
  top: 60%;
  left: 60%;
  transform: translate(-50%, -50%);
  white-space: nowrap;
  font-family: 'DOUYUFont', sans-serif;
  color: #FFFFFF;
  pointer-events: none;
  z-index: 2;
}

.btn-spinner-pos {
  position: absolute;
  left: 30px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
}

/* 7. 响应式调整 */
@media (max-width: 1400px) {
  .video-frame {
    height: 250px;
  }

  .summary-box-middle {
    min-height: 80px;
    max-height: 100px;
  }

  .metric-box {
    font-size: 1.8rem;
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
    flex-grow: 1;
    height: 30%;
    min-height: 120px;
  }
}
</style>

<style lang="scss">
/* 全局样式 - 需求1：去掉背景色，只保留红色字体 */
.text-highlight {
  color: #ff4d4d !important;
  font-weight: bold;
}

.loading-overlay {
  position: relative;
  filter: grayscale(80%) brightness(0.6);
  pointer-events: none;
  opacity: 0.7;
}

.loading-text {
  color: #aaa !important;
  font-style: italic;
}
</style>