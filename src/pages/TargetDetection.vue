<template>
  <div class="section">
    <div class="img_box"></div>

    <b-row class="header-bar align-item-s-center no-gutters">
      <b-col cols="3" class="text-left">
        <button class="header-btn btn-home" @click="navigateHome">首页</button>
        <button class="header-btn btn-back" @click="navigateHome">上个页面</button>
      </b-col>
      <b-col cols="6" class="text-center">
        <h1 class="newTitle">多模态信息认知偏差检测模型</h1>
      </b-col>
      <b-col cols="3" class="text-right">
        <button class="header-btn btn-next" @click="navigateNextPage">下个页面</button>
      </b-col>
    </b-row>

    <b-row class="justify-content-center content-row no-gutters">

      <b-col cols="3" class="left-column px-2">
        <div class="panel-header header-select-data clean-header">选择数据</div>

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
      </b-col>

      <b-col cols="5" class="middle-column mx-2 px-1">
        <div class="video-section">
          <div class="video-label label-original">无人机侦察数据</div>
          <div class="video-frame">
            <video v-if="originalVideoURL" ref="originalVideo" :src="originalVideoURL" controls class="video-display"
              playsinline muted loop @error="handleVideoError"></video>
            <div v-else class="placeholder-text">请选择视频</div>
          </div>
        </div>

        <div class="video-section">
          <div class="video-label label-processed">多模态检测结果 </div>
          <div class="video-frame" :class="{ 'loading-overlay': isLoading }">
            <video v-if="processedVideoURL && !isLoading" ref="processedVideo" :src="processedVideoURL" controls
              class="video-display" :key="processedVideoURL" playsinline muted loop @error="handleVideoError"></video>
            <div v-if="isLoading" class="placeholder-text loading-text">计算中……</div>
            <div v-else-if="!processedVideoURL" class="placeholder-text">检测结果将在这里显示</div>
          </div>
        </div>

        <div class="summary-box-middle" :class="{ 'loading-overlay': isLoading }">
          <div class="summary-content overflow-auto"
            :class="{ 'text-highlight': summaryHighlight, 'loading-text': isLoading }">
            {{ isLoading ? '计算中……' : (summaryTypingText || '检测结果将在这里显示') }}
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
              
              <div v-if="isBiasDetecting && !showBiasDetails" class="text-left small-text">
                计算中…
              </div>
              <div v-else-if="isLoading && !showBiasDetails" class="text-left small-text">
                {{ progressMessage || '计算中...' }}
              </div>
              <div v-else-if="!showBiasDetails && !isLoading" class="text-left small-text">
                {{ resultMessage || '检测完成后显示结果' }}
              </div>

              <div v-if="showBiasDetails">
                <div v-for="(entry, index) in biasDetailEntries" :key="entry.label"
                  class="typing-text text-left small-text" :class="{ 'text-highlight': entry.highlight && !isBiasTyping }">
                  {{ biasDisplayTexts[index] }}
                </div>
              </div>
              <div v-else-if="canStartBiasDetection && !isBiasDetecting" class="text-left small-text hint-text">
                点击"开始偏差检测"，开始分析多模态目标检测结果的偏差
              </div>

              <p v-if="fullResult.key_frame_detection && showBiasDetails" class="mb-1 text-left">
                <span class="text-red">id:{{ fullResult.key_frame_detection.frame_idx }} {{ getMainObject() }} {{
                  getMainConfidence().toFixed(2) }}</span>
              </p>
            </div>
          </div>
        </div>

        <div class="panel-right-bottom" :class="{ 'loading-overlay': isBiasDetecting }">
          <div class="panel-content">
            <div class="accuracy-content">
              <span class="accuracy-label">偏差检测准确率</span>
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
const BASE_DIR = "/home/wuzhixuan/Project/PCJC/1";
const VIDEO_DIR = "/home/wuzhixuan/Project/PCJC/datasets/Vedio"

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
      isExporting: false
    };
  },
  computed: {
    canStartBiasDetection() {
      return this.biasDetailEntries.length > 0 && !this.isLoading;
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
    async loadInitialData() {
      const module1ResStr = localStorage.getItem('module1Res');
      if (module1ResStr) {
        console.log("检测到 module1Res，正在从缓存加载数据...");
        try {
          const module1Res = JSON.parse(module1ResStr);
          this.populateUIFromStorage(module1Res);
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
    populateUIFromStorage(data) {
      console.log("正在填充UI:", data);
      this.originalVideoURL = data.originalVideoPath;
      this.processedVideoURL = data.video_path;
      this.taskId = data.task_id;
      this.fullResult = data;
      
      if (data.video_info && data.video_info.name) {
        this.selectedVideo = { name: data.video_info.name, id: data.video_info.id || -1 };
      } else if (data.originalVideoPath) {
        const videoName = getFilenameFromPath(data.originalVideoPath);
        if (videoName) {
          this.selectedVideo = { name: videoName, id: -1 };
        }
      }

      this.prepareDescriptionDisplay(data);
      this.summaryTypingText = this.summaryFullText;
      this.showBiasDetails = true;
      this.biasDisplayTexts = this.biasDetailEntries.map(e => e.text);
      this.showAccuracy = true;
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
    formatDescription(description) {
      if (!description) return '';
      const rawAspects = this.fullResult && this.fullResult.low_similarity_aspects;
      const aspects = this.parseLowSimilarityAspects(rawAspects);
      
      const validLabels = new Set(['场景', '目标', '行为']);
      const labelsToHighlight = new Set();
      (aspects || []).forEach(item => {
        if (typeof item !== 'string') return;
        const name = item.trim().replace(/^["'《【\s]+|["'》】\s]+$/g, '');
        if (name === '目标') {
          labelsToHighlight.add('目标');
        }
        if (validLabels.has(name)) {
          labelsToHighlight.add(name);
        }
      });
      const labelsArray = Array.from(labelsToHighlight);

      const lines = description.split(/\r?\n/).filter(line => line.trim() !== '');
      let html = '';

      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        const shouldHighlight = labelsArray.some(label => {
          return this.shouldHighlightLine(trimmedLine, label);
        });

        let lineContent = trimmedLine;
        if (shouldHighlight) {
          lineContent = `<span class="text-highlight" style="color: #ff4d4d; font-weight: bold;">${trimmedLine}</span>`;
        }
        html += `<div>${lineContent}</div>`;
      });
      return html;
    },
    shouldHighlightLine(text, label) {
      if (!text || !label) return false;
      const escapeRegExp = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`^\\s*${escapeRegExp(label)}\\s*[：:]`);
      return pattern.test(text);
    },
    parseLowSimilarityAspects(raw) {
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
      this.clearTypingIntervals();
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
      this.descriptionEntries = this.buildDescriptionEntries(fullData.video_description);
      const summaryEntry = this.descriptionEntries.find(entry => entry.label === '总结');
      if (summaryEntry) {
        // 将"总结："改为"目标检测中："
        this.summaryFullText = summaryEntry.text.replace(/^总结[：:]/, '目标检测中：');
      } else {
        this.summaryFullText = '未找到目标检测信息。';
      }
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
    handleStartBiasDetection() {
      if (!this.canStartBiasDetection) return;
      this.isBiasDetecting = true;
      this.clearBiasTimeouts();
      this.showBiasDetails = false;
      this.showAccuracy = false;
      this.resetBiasTyping();

      this.biasTypingTimeout = setTimeout(() => {
        this.showBiasDetails = true;
        this.isBiasTyping = true;
        this.startBiasTypingSequence(0);
        this.biasTypingTimeout = null;
      }, 3000);

      this.accuracyTimeout = setTimeout(() => {
        this.showAccuracy = true;
        this.isBiasDetecting = false;
        this.accuracyTimeout = null;
      }, 300000);
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
      this.clearBiasTimeouts();
      this.biasDisplayTexts = this.biasDetailEntries.map(() => '');
      this.isBiasTyping = false;
    },
    startBiasTypingSequence(index) {
      if (index >= this.biasDetailEntries.length) {
        this.isBiasTyping = false;
        this.biasTypingInterval = null;
        // 所有文本显示完成后，应用高亮样式
        this.$nextTick(() => {
          this.biasDetailEntries.forEach((entry, idx) => {
            if (entry.highlight) {
              // 高亮样式已经在模板中通过 :class 绑定，这里只需要确保文本已完全显示
              // 如果需要动态添加高亮，可以在这里处理
            }
          });
        });
        if (this.showAccuracy) {
          this.isBiasDetecting = false;
        }
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
        const response = await axios.get(`${API_BASE_URL}/videos`);
        this.videoList = response.data.videos;
        console.log("视频列表获取成功", this.videoList);
        if (this.selectedVideo && this.selectedVideo.name) {
          const matchedVideo = this.videoList.find(v => v.name === this.selectedVideo.name);
          if (matchedVideo) {
            this.selectedVideo = matchedVideo;
          }
        }
      } catch (error) {
        console.error("获取视频列表失败", error);
        this.videoList = [];
      }
    },
    selectVideo(video) {
      this.selectedVideo = video;
      localStorage.clear();
      console.log("选择新视频，LocalStorage 已清空。");
      this.resetResultState();
      try {
        const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
        this.originalVideoURL = `${baseUrl}/video/${encodeURIComponent(video.name)}`;
        console.log("原视频URL:", this.originalVideoURL);
        this.autoPlayOriginalVideo();
      } catch (error) {
        console.error("构造视频URL失败:", error);
        this.originalVideoURL = null;
      }
      console.log("已选择视频:", video.name);
    },
    async startDetection() {
      localStorage.clear();
      console.log("LocalStorage 已清空。");

      if (!this.selectedVideo) {
        alert("请先选择视频文件！");
        return;
      }

      this.isLoading = true;
      this.resetResultState({ preserveMessages: true });
      this.resultMessage = "正在启动分析...";
      this.progressMessage = "正在启动分析...";
      console.log("Selected video name:", this.selectedVideo.name);

      const baseUrl = VIDEO_DIR.endsWith('/') ? VIDEO_DIR.slice(0, -1) : VIDEO_DIR;
      const videoPath = `${baseUrl}/${this.selectedVideo.name}`;
      console.log("Constructed video path for /batch_predict:", videoPath);

      let videoNameWithoutExtension = this.selectedVideo.name;
      const extensionIndex = videoNameWithoutExtension.lastIndexOf('.');
      if (extensionIndex > 0) {
        videoNameWithoutExtension = videoNameWithoutExtension.substring(0, extensionIndex);
      }
      const videoNameEncoded = encodeURIComponent(videoNameWithoutExtension);

      try {
        const analyzeResponse = await axios.post(`${API_BASE_URL}/batch_predict`, {
          video_path: videoPath
        });

        const analyzeData = analyzeResponse.data;
        if (analyzeData.status !== 'success') {
          throw new Error(analyzeData.error || '分析启动失败');
        }

        this.taskId = analyzeData.task_id;
        this.progressMessage = `分析任务 [${this.taskId}] 已启动，正在进行深度处理...`;
        const processingTime = analyzeData.processing_time;
        const timeDisplay = processingTime ? `${processingTime.toFixed(2)}s` : 'N/A';

        this.resultMessage = `任务ID: ${this.taskId}。处理时间预计 ${timeDisplay}。`;

        const fullResultResponse = await axios.get(
          `${API_BASE_URL}/get_detection_results/${this.taskId}?video_name=${videoNameEncoded}`
        );
        const fullData = fullResultResponse.data;

        this.fullResult.task_id = fullData.task_id;
        this.fullResult.video_description = fullData.video_description;
        this.fullResult.video_info = fullData.video_info;
        this.fullResult.accuracy_results = fullData.current_accuracy;
        this.fullResult.overall_accuracy = fullData.current_accuracy;
        this.fullResult.low_similarity_aspects = fullData.low_similarity_aspects;
        this.fullResult.video_path = fullData.video_path;
        this.fullResult.deviceType = this.extractDeviceTypeFromDescription(fullData.video_description);
        this.fullResult.key_frame_path = fullData.key_frame_path;
        this.fullResult.key_frame_detection = fullData.key_frame_detection;

        this.prepareDescriptionDisplay(fullData);
        this.startSummaryTyping();

        const raw_key_frame_path = fullData.key_frame_path;
        const raw_video_path = fullData.video_path;

        const key_frame_filename = getFilenameFromPath(raw_key_frame_path);
        const video_filename = getFilenameFromPath(raw_video_path);

        console.log("Extracted video filename:", video_filename);
        console.log("Extracted keyframe filename:", key_frame_filename);

        if (video_filename && this.taskId) {
          this.processedVideoURL = `${API_BASE_URL}/output/${this.taskId}/${videoNameEncoded}/${encodeURIComponent(video_filename)}`;
          console.log("Processed video URL (Fixed):", this.processedVideoURL);
          this.syncAndPlayVideos();
        } else {
          this.processedVideoURL = null;
        }

        try {
          let fullImagePathURL = "无图像路径";
          if (key_frame_filename && key_frame_filename !== "无图像路径" && this.taskId) {
            fullImagePathURL = `${BASE_DIR}/output/${this.taskId}/${videoNameEncoded}/${encodeURIComponent(key_frame_filename)}`;
          }

          let fullProcessedVideoPathURL = "无视频路径";
          if (video_filename && video_filename !== "无视频路径" && this.taskId) {
            fullProcessedVideoPathURL = `${API_BASE_URL}/output/${this.taskId}/${videoNameEncoded}/${encodeURIComponent(video_filename)}`;
          }

          const originalVideoPath = this.originalVideoURL || "无原视频路径";

          const module1Res = {
            ...fullData,
            deviceType: this.fullResult.deviceType || this.extractDeviceTypeFromDescription(fullData.video_description) || "N/A",
            key_frame_path: fullImagePathURL,
            video_path: fullProcessedVideoPathURL,
            originalVideoPath: originalVideoPath
          };

          localStorage.setItem('module1Res', JSON.stringify(module1Res));

          console.groupCollapsed("%c✅ Module 1 结果已存储 (module1Res)", "color: #17a2b8; font-weight: bold;");
          console.log("%c原始 JSON 字符串:", "font-weight: bold; color: #ffc107;", localStorage.getItem('module1Res'));
          const tableData = Object.entries(module1Res).map(([key, value]) => ({
            Key: key,
            Value: (typeof value === 'object' && value !== null) ? JSON.stringify(value).substring(0, 50) + '...' : value
          }));
          console.log("%c对象内容 (表格展示):", "font-weight: bold; color: #28a745;");
          console.table(tableData);
          console.groupEnd();
        } catch (e) {
          console.error("保存 module1Res 到 localStorage 失败:", e);
        }

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
  background-position: center center;
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

/* --- 修复 1：标题通用样式重置 (去光圈 + 强制居中) --- */

/* 1. 基础重置 */
.panel-header {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  text-align: center !important;
  padding: 0 !important;
  margin: 0 auto 10px auto !important; /* 保持原有的下边距 */
  /* --- 新增/修改的代码开始 --- */
  box-sizing: border-box !important; /* 关键：防止 padding 改变盒子总高度 */
  
  /* 调整方案 A：如果文字觉得【偏下】，加底部内边距把它顶上去 */
  // padding-bottom: 8px !important;    /* 建议先尝试 5px-10px，数字越大文字越往上跑 */
  
  /* 调整方案 B：如果文字觉得【偏上】，改用 padding-top */
  padding-top: 5px !important;
  /* --- 新增/修改的代码结束 --- */
  
  /* 强制去除背景色、边框、阴影 */
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  
  /* 确保字体样式 */
  font-family: 'DOUYUFont', sans-serif !important;
  color: #FFFFFF !important;
  font-weight: 400 !important;
  font-size: 18px !important;
}

/* 2. 针对“选择数据”标题框的特定修复 */
.header-select-data {
  /* 强制覆盖为 none */
  border: none !important; 
  border-image: none !important;
  
  /* 尺寸与背景图 */
  width: 400px !important;
  height: 40px !important;
  background-image: url('~@/assets/images/step1/-s-二级标题.png') !important;
  background-repeat: no-repeat !important;
  background-size: 100% 100% !important;
}

/* 3. 针对“偏差检测结果”标题框的特定修复 */
.panel-header.header-results {
  /* 去除原有的 box-shadow */
  box-shadow: none !important;
  
  width: 400px !important;
  height: 50px !important; /* 保持你原有的高度设置 */
  background-image: url('~@/assets/images/step1/-s-二级标题.png') !important;
}

/* 辅助类：确保没有残留样式 */
.clean-header {
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* 选择数据面板 */
.panel-left {
  background-image: url('~@/assets/images/step1/-s-弹框-选择数据.png');
  position: absolute;
  width: 400px;
  height: 630px;
  top: 45px;
  left: 10px;
}

.server-video-list {
  flex-grow: 1;
  max-height: calc(100% - 10px);
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

/* --- 修复 2：按钮文字绝对定位系统 --- */

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
  position: relative !important; /* 关键 */
  display: block !important;     /* 取消 inline-flex */
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
  /* top/left 建议用 margin 控制，此处保留原有样式的大致位置感 */
  background-image: url('~@/assets/images/step1/-s-按钮-开始测试.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  display: inline-block; /* 或 block，配合 margin */
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
  width: 320px;
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
  /* --- 新增/修改的代码开始 --- */
  box-sizing: border-box;   /* 关键 */
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
  height: 70px;
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
  overflow: hidden;
  text-align: center;
  padding: 8px 15px;
  display: flex;
  align-items: center;
  justify-content: center;

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
  white-space: pre-wrap;
  margin-bottom: 6px;
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
  flex-direction: column;
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

.accuracy-label {
  color: #fff;
  font-family: 'DOUYUFont';
  font-weight: 400;
  font-size: 16px;
  font-style: normal;
  text-decoration: none;
  margin-bottom: 0;
}

.accuracy-value {
  font-size: 34px;
  font-weight: 700;
  color: #00e5ff;
  text-shadow: 0 0 10px #00e5ff, 0 0 20px rgba(0, 229, 255, 0.5);
  letter-spacing: 0.05em;
  white-space: nowrap;
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

/* --- 调试核心：按钮文字定位 --- */

.btn-text-pos {
  position: absolute;
  /* 默认绝对居中 */
  top: 60%;
  left: 60%;
  transform: translate(-50%, -50%);
  
  white-space: nowrap;
  font-family: 'DOUYUFont', sans-serif;
  // font-size: 23px; 
  color: #FFFFFF;
  pointer-events: none;
  z-index: 2;
}

/* Loading Spinner 位置 */
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
/* 全局样式 */
.text-highlight {
  color: #ff4d4d !important;
  font-weight: bold;
  background-color: rgba(255, 77, 77, 0.1);
  padding: 1px 3px;
  border-radius: 3px;
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