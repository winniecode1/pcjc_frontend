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
    <div class="panel-header header-select-data clean-header">加载作战指令</div>

    <div class="data-source-section">
      <div class="panel-left">
        <div class="panel-content">
          <div class="server-video-list overflow-auto">
            <div v-for="item in mediaList" :key="item.id" class="video-item" @click="selectMedia(item)"
              :class="{ 'selected': selectedVideo && selectedVideo.id === item.id }">
              <span>{{ item.name.replace(/\.(jpg|jpeg|png|mp4|avi|mov)$/i, '') }}</span>
              <span class="selector-circle"></span>
            </div>
            <div v-if="mediaList.length === 0" class="empty-list-text">
              暂无数据
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="panel-header header-select-data clean-header">作战指令</div>

    <div class="panel-orders">
      <div class="panel-content">
        <div class="orders-text-box overflow-auto">
          {{ ordersText || '暂无作战指令' }}
        </div>
      </div>
    </div>

    <!-- 左下角目标识别按钮已移除，功能转移到中间下方标题处 -->

  </div>
</b-col>

      <b-col cols="5" class="middle-column mx-2 px-1">
        <div class="video-section">
          <div class="video-label label-original">{{ selectedMediaType === 'image' ? '认知传播图片' : '认知传播视频' }}</div>
          <div class="video-frame">
            <img v-if="originalVideoURL && selectedMediaType === 'image'" :src="originalVideoURL" class="video-display" alt="原始图片" @error="handleImageError" />
            <video v-else-if="originalVideoURL && selectedMediaType === 'video'" :src="originalVideoURL" class="video-display" autoplay loop muted controls @error="handleVideoError"></video>
            <!-- 加载进度条 - 显示在图片位置的中间 -->
            <div v-if="isImageLoading" class="loading-progress-overlay">
              <div class="loading-progress-bar">
                <div class="loading-progress-fill"></div>
              </div>
              <div class="loading-progress-text">图片加载中...</div>
            </div>
            <div v-else-if="!originalVideoURL" class="placeholder-text">请选择{{ selectedMediaType === 'image' ? '图片' : '视频' }}</div>
          </div>
        </div>

        <div class="video-section">
          <!-- 标题支持点击功能，点击后开始目标检测 -->
          <div class="video-label label-processed clickable-label"
            :class="{ 'label-clickable': canClickToDetect, 'label-detecting': isLoading }"
            @click="handleLabelClick">
            {{ detectionLabelText }}
          </div>
          <div class="video-frame" :class="{ 'loading-overlay': isLoading }">
            <img v-if="processedVideoURL && !isLoading && selectedMediaType === 'image'" :src="processedVideoURL" class="video-display" alt="检测结果" :key="'img-' + processedVideoURL" @error="handleImageError" />
            <video v-else-if="processedVideoURL && !isLoading && selectedMediaType === 'video'" :src="processedVideoURL" class="video-display" autoplay loop muted controls :key="'video-' + processedVideoURL" @error="handleVideoError"></video>
            <!-- 检测进度条 - 显示在图片位置的中间 -->
            <div v-if="isLoading" class="loading-progress-overlay">
              <div class="loading-progress-bar">
                <div class="loading-progress-fill"></div>
              </div>
              <div class="loading-progress-text">检测中...</div>
            </div>
            <div v-else-if="!processedVideoURL" class="placeholder-text">检测结果将在这里显示</div>
          </div>
        </div>

        <!-- ==========================================
             底部文本框已注释 - 如需恢复请取消注释
             用途：显示检测摘要文本
             ==========================================
        <div class="summary-box-middle" :class="{ 'loading-overlay': isLoading }">
          <div class="summary-content overflow-auto"
            :class="{ 'text-highlight': summaryHighlight, 'loading-text': isLoading }">
            <div v-if="isLoading">检测中……</div>
            <div v-show="hasStartedDetection && !isLoading" class="typing-text">{{ summaryTypingText || '检测中...' }}</div>
            <div v-show="!hasStartedDetection && !isLoading" class="hint-text">请点击"开始目标检测"按钮</div>
          </div>
        </div>
        -->
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
                <div v-for="(entry, index) in biasDetailEntries" :key="entry.label + '-' + index"
                  class="typing-text text-left small-text" 
                  :class="{ 
                    'text-highlight': (entry.label === '偏差结果' || entry.label === '判定正确性') && !entry.isConsistent && !isBiasTyping,
                    'text-green': (entry.label === '偏差结果' || entry.label === '判定正确性') && entry.isConsistent && !isBiasTyping
                  }">
                  {{ biasDisplayTexts[index] }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-right-bottom" :class="{ 'loading-overlay': isBiasDetecting }">
          <div class="panel-content">
            <div class="accuracy-content">
              <span class="accuracy-label" @click="showFormulaTooltip = !showFormulaTooltip">
                偏差识别准确率
                <span class="formula-hint-icon">?</span>
              </span>
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
              <!-- 公式图片提示 -->
              <div v-if="showFormulaTooltip" class="formula-tooltip" @click.stop>
                <span class="formula-close" @click="showFormulaTooltip = false">×</span>
                <img src="@/assets/images/formula.png" alt="准确度公式" class="formula-image" />
              </div>
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
const IMAGE_API_URL = 'http://10.109.253.71:5238';
const BASE_DIR = "/home/wuzhixixin/Project/PCJC/1";
const VIDEO_DIR = "/home/wuzhixixin/Project/PCJC/datasets/Vedio"
// 定义偏差检测等待时长 (ms) - 2分钟
const BIAS_DETECTION_DELAY = 2 * 60 * 1000; // 2分钟

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
      selectedMediaType: 'image',
      imageList: [],
      videoList: [],
      mediaList: [],
      selectedVideo: null,
      originalVideoURL: null,
      processedVideoURL: null,
      taskId: null,
      isLoading: false,
      isImageLoading: false,
      progressKey: 0,
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
      hasStartedBiasDetection: false,
      showFormulaTooltip: false,
      selectedVideoHasOrders: false  // 新增：标记是否已选择视频并加载了作战指令
    };
  },
  computed: {
    canStartBiasDetection() {
      // 需要先完成目标识别（fullResult 有检测结果）且不在加载中
      // 视频：需要 key_frame_detection 或 detection_result
      // 图片：需要 key_frame_detection
      return this.fullResult &&
             (this.fullResult.key_frame_detection || this.fullResult.detection_result) &&
             !this.isLoading;
    },
    // 检测标签文本，根据状态显示不同内容
    detectionLabelText() {
      if (this.isLoading) {
        return '目标类别识别进行中......';
      }
      if (this.hasStartedDetection && this.processedVideoURL) {
        return '目标信息类别识别结果';
      }
      if (this.selectedVideo && this.selectedVideoHasOrders) {
        return '开始目标信息类别识别';
      }
      return '多模态目标检测结果';
    },
    // 是否可以点击开始检测
    canClickToDetect() {
      return this.selectedVideo &&
             this.selectedVideoHasOrders &&
             !this.isLoading &&
             !this.hasStartedDetection;
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
    // 页面销毁前保存所有状态到 localStorage
    this.saveAllStateToCache();
  },
  methods: {
    // 保存所有状态到缓存
    saveAllStateToCache() {
      // 保存媒体类型
      localStorage.setItem('selectedMediaType', this.selectedMediaType);

      // 保存选中的文件
      if (this.selectedVideo) {
        localStorage.setItem('selectedVideo', JSON.stringify({
          id: this.selectedVideo.id,
          name: this.selectedVideo.name,
          mediaType: this.selectedMediaType
        }));
      }

      // 保存 URL
      if (this.originalVideoURL) {
        localStorage.setItem('originalVideoURL', this.originalVideoURL);
      }
      if (this.processedVideoURL) {
        localStorage.setItem('processedVideoURL', this.processedVideoURL);
      }

      // 保存作战指令
      if (this.ordersText) {
        localStorage.setItem('ordersText', this.ordersText);
      }

      // 保存目标检测结果（包含 overall_accuracy 等偏差检测结果）
      if (this.fullResult) {
        localStorage.setItem('fullResult', JSON.stringify(this.fullResult));
      }

      // 保存检测状态
      localStorage.setItem('hasStartedDetection', this.hasStartedDetection ? 'true' : 'false');
      localStorage.setItem('summaryTypingText', this.summaryTypingText || '');
      localStorage.setItem('summaryFullText', this.summaryFullText || '');

      // 保存偏差检测状态
      localStorage.setItem('hasStartedBiasDetection', this.hasStartedBiasDetection ? 'true' : 'false');
      if (this.biasDetailEntries && this.biasDetailEntries.length > 0) {
        localStorage.setItem('biasDetailEntries', JSON.stringify(this.biasDetailEntries));
      }
      if (this.biasDisplayTexts && this.biasDisplayTexts.length > 0) {
        localStorage.setItem('biasDisplayTexts', JSON.stringify(this.biasDisplayTexts));
      }
      localStorage.setItem('showBiasDetails', this.showBiasDetails ? 'true' : 'false');
      localStorage.setItem('showAccuracy', this.showAccuracy ? 'true' : 'false');
      localStorage.setItem('isBiasDetecting', this.isBiasDetecting ? 'true' : 'false');

      // 保存 module1Res
      const module1ResStr = localStorage.getItem('module1Res');
      if (module1ResStr) {
        // module1Res 已存在，保留
      }

      console.log('所有状态已保存到缓存');
    },
    // 从缓存恢复所有状态
    restoreAllStateFromCache() {
      // 恢复媒体类型
      const savedMediaType = localStorage.getItem('selectedMediaType');
      if (savedMediaType) {
        this.selectedMediaType = savedMediaType;
      }

      // 恢复作战指令
      const savedOrdersText = localStorage.getItem('ordersText');
      if (savedOrdersText) {
        this.ordersText = savedOrdersText;
      }

      // 恢复 URL
      const savedOriginalURL = localStorage.getItem('originalVideoURL');
      if (savedOriginalURL) {
        this.originalVideoURL = savedOriginalURL;
      }
      const savedProcessedURL = localStorage.getItem('processedVideoURL');
      if (savedProcessedURL) {
        this.processedVideoURL = savedProcessedURL;
      }

      // 恢复目标检测结果
      const savedFullResult = localStorage.getItem('fullResult');
      if (savedFullResult) {
        try {
          this.fullResult = JSON.parse(savedFullResult);
        } catch (e) {
          console.error('恢复 fullResult 失败:', e);
        }
      }

      // 恢复检测状态
      this.hasStartedDetection = localStorage.getItem('hasStartedDetection') === 'true';
      this.summaryTypingText = localStorage.getItem('summaryTypingText') || '';
      this.summaryFullText = localStorage.getItem('summaryFullText') || '';

      // 如果文字已完整显示，确保 summaryTypingText 等于 summaryFullText
      if (this.summaryFullText && !this.summaryTypingText) {
        this.summaryTypingText = this.summaryFullText;
      }

      // 恢复偏差检测状态
      this.hasStartedBiasDetection = localStorage.getItem('hasStartedBiasDetection') === 'true';
      const savedBiasDetailEntries = localStorage.getItem('biasDetailEntries');
      if (savedBiasDetailEntries) {
        try {
          this.biasDetailEntries = JSON.parse(savedBiasDetailEntries);
        } catch (e) {
          console.error('恢复 biasDetailEntries 失败:', e);
        }
      }
      const savedBiasDisplayTexts = localStorage.getItem('biasDisplayTexts');
      if (savedBiasDisplayTexts) {
        try {
          this.biasDisplayTexts = JSON.parse(savedBiasDisplayTexts);
        } catch (e) {
          console.error('恢复 biasDisplayTexts 失败:', e);
        }
      } else {
        // 如果没有保存的 displayTexts，使用完整的 biasDetailEntries 文字
        this.biasDisplayTexts = this.biasDetailEntries.map(e => e.text);
      }
      this.showBiasDetails = localStorage.getItem('showBiasDetails') === 'true';
      this.showAccuracy = localStorage.getItem('showAccuracy') === 'true';
      this.isBiasDetecting = localStorage.getItem('isBiasDetecting') === 'true';

      // 恢复 summaryTypingInterval 状态 - 如果文字已显示完毕，不需要重新打字
      if (this.summaryTypingText === this.summaryFullText) {
        // 文字已完整显示，不需要打字机效果
        console.log('目标检测结果已完整显示');
      }

      // 恢复偏差检测打字状态
      if (this.biasDisplayTexts.length > 0) {
        const allTextsComplete = this.biasDetailEntries.every((entry, index) => {
          return this.biasDisplayTexts[index] === entry.text;
        });
        if (allTextsComplete) {
          console.log('偏差检测结果已完整显示');
          this.isBiasTyping = false;
        }
      }

      console.log('所有状态已从缓存恢复');
    },
    // 获取综合准确率（图片和视频综合）
    async fetchOverallAccuracy() {
      try {
        const response = await axios.get(`${IMAGE_API_URL}/api/metrics/overall_accuracy`);
        return response.data;
      } catch (error) {
        console.error("获取综合准确率失败:", error);
        return null;
      }
    },
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
      // 优先从缓存恢复所有状态
      this.restoreAllStateFromCache();

      // 检查偏差检测计时器状态（用于恢复未完成的计时）
      this.checkBiasTimerState();

      // 合并加载图片和视频列表，图片在前100，视频在后
      await this.fetchImageList();
      await this.fetchVideoListFromAPI();

      // 恢复选中的视频状态
      const savedSelectedVideo = localStorage.getItem('selectedVideo');
      if (savedSelectedVideo) {
        try {
          const videoInfo = JSON.parse(savedSelectedVideo);
          // 检查是否在当前合并列表中
          const found = this.mediaList.find(item => item.id === videoInfo.id);
          if (found) {
            this.selectedVideo = found;
          }
        } catch (e) {
          console.error("恢复选中视频失败:", e);
        }
      }

      // 只有在没有已恢复的 summaryFullText 时，才从 module1Res 加载
      if (!this.summaryFullText) {
        const module1ResStr = localStorage.getItem('module1Res');
        if (module1ResStr) {
          try {
            const module1Res = JSON.parse(module1ResStr);
            this.populateUIFromStorage(module1Res);
          } catch (e) {
            console.error("解析 module1Res 失败:", e);
          }
        }
      }

      await this.fetchOrders();
    },
    // 需求3：检查计时器状态
    checkBiasTimerState() {
      // 优先检查是否已经完成
      if (localStorage.getItem('biasDetectionCompleted') === 'true') {
        console.log("检测到偏差检测已完成，直接恢复结果");
        this.hasStartedBiasDetection = true;
        this.showAccuracy = true;
        this.showBiasDetails = true;
        this.isBiasDetecting = false;
        // 从 localStorage 恢复偏差详情
        const savedEntries = localStorage.getItem('biasDetailEntries');
        if (savedEntries) {
          this.biasDetailEntries = JSON.parse(savedEntries);
        }
        // 让文字直接显示，不需要打字机效果
        this.biasDisplayTexts = this.biasDetailEntries.map(e => e.text);

        // 确保 fullResult 已恢复，并获取准确率
        if (this.fullResult) {
          console.log("检查 overall_accuracy，当前值:", this.fullResult.overall_accuracy);
          if (this.fullResult.overall_accuracy === undefined || this.fullResult.overall_accuracy === null) {
            console.log("开始获取准确率...");
            this.fetchOverallAccuracy().then(data => {
              console.log("获取到的准确率数据:", data);
              if (data) {
                // 处理不同的数据格式
                if (data.overall_accuracy && data.overall_accuracy.accuracy !== undefined) {
                  this.fullResult.overall_accuracy = data.overall_accuracy.accuracy;
                } else if (data.accuracy !== undefined) {
                  this.fullResult.overall_accuracy = data.accuracy;
                } else if (data.current_accuracy !== undefined) {
                  this.fullResult.overall_accuracy = data.current_accuracy;
                }
                console.log("设置后的 overall_accuracy:", this.fullResult.overall_accuracy);
                this.$forceUpdate();
              }
            }).catch(err => {
              console.error("获取准确率失败:", err);
            });
          }
        }
        return;
      }

      // 检查是否有正在进行的偏差检测
      const biasStartTimeStr = localStorage.getItem('biasStartTime');
      const biasStarted = localStorage.getItem('biasDetectionStarted') === 'true';

      if (biasStartTimeStr && biasStarted) {
        const biasStartTime = parseInt(biasStartTimeStr, 10);
        const now = Date.now();
        const elapsed = now - biasStartTime;

        // 从 localStorage 恢复偏差详情
        const savedEntries = localStorage.getItem('biasDetailEntries');
        if (savedEntries) {
          this.biasDetailEntries = JSON.parse(savedEntries);
        }

        if (elapsed < BIAS_DETECTION_DELAY) {
          const remaining = BIAS_DETECTION_DELAY - elapsed;
          console.log(`恢复偏差检测计时，剩余时间: ${remaining}ms`);
          this.isBiasDetecting = true;
          this.hasStartedBiasDetection = true;
          this.showAccuracy = false; // 准确率未出

          // 文本直接显示，不需要打字机效果
          this.showBiasDetails = true;
          this.biasDisplayTexts = this.biasDetailEntries.map(e => e.text);

          // 启动剩余时间的定时器
          this.startAccuracyTimer(remaining);
        } else {
          // 时间已过，直接显示结果
          console.log('偏差检测计时已过期，直接显示结果');
          this.hasStartedBiasDetection = true;
          this.isBiasDetecting = false;
          this.showAccuracy = true;
          this.showBiasDetails = true;
          this.biasDisplayTexts = this.biasDetailEntries.map(e => e.text);

          // 确保 fullResult 已恢复，并获取准确率
          if (this.fullResult) {
            console.log("计时器过期，检查 overall_accuracy，当前值:", this.fullResult.overall_accuracy);
            if (this.fullResult.overall_accuracy === undefined || this.fullResult.overall_accuracy === null) {
              console.log("开始获取准确率...");
              this.fetchOverallAccuracy().then(data => {
                console.log("获取到的准确率数据:", data);
                if (data) {
                  // 处理不同的数据格式
                  if (data.overall_accuracy && data.overall_accuracy.accuracy !== undefined) {
                    this.fullResult.overall_accuracy = data.overall_accuracy.accuracy;
                  } else if (data.accuracy !== undefined) {
                    this.fullResult.overall_accuracy = data.accuracy;
                  } else if (data.current_accuracy !== undefined) {
                    this.fullResult.overall_accuracy = data.current_accuracy;
                  }
                  console.log("设置后的 overall_accuracy:", this.fullResult.overall_accuracy);
                  this.$forceUpdate();
                }
              }).catch(err => {
                console.error("获取准确率失败:", err);
              });
            }
          }

          localStorage.removeItem('biasStartTime');
          localStorage.removeItem('biasDetectionStarted');
          localStorage.setItem('biasDetectionCompleted', 'true');
        }
      }
    },
    fixLayoutIssues() {
      const style = document.createElement('style');
      style.textContent = `
      .right-column {
        display: flex !important;
        flex-direction: column !important;
        height: calc(100vh - 60px) !important;
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
          const sampleEndpoint = data.selectedMediaType === 'video' ? 'video/sample' : 'dataset/sample';
          const response = await axios.get(`${IMAGE_API_URL}/api/${sampleEndpoint}/${this.selectedVideo.id}`);
          const sampleData = response.data;
          if (sampleData.instruction || sampleData.directive) {
            this.ordersText = sampleData.instruction || sampleData.directive;
          }
        } catch (e) {
          console.warn("从缓存恢复时获取作战指令失败:", e);
        }
      }

      // 恢复媒体类型
      if (data.selectedMediaType) {
        this.selectedMediaType = data.selectedMediaType;
        if (this.selectedMediaType === 'video') {
          await this.fetchVideoListFromAPI();
        } else {
          await this.fetchImageList();
        }
      }

      // 准备描述显示（不重置偏差检测数据，因为会从缓存恢复）
      this.prepareDescriptionDisplay(data, false);

      // 只有当 summaryTypingText 为空时才启动打字机效果
      // 如果已经有完整文字显示，保留当前状态
      if (!this.summaryTypingText && this.summaryFullText) {
        this.startSummaryTyping();
      }

      // 重新检查偏差检测计时器状态（因为 prepareDescriptionDisplay 会重置偏差检测数据）
      this.checkBiasTimerState();
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
    handleFormulaImageError(e) {
      console.warn("公式图片加载失败:", e);
    },
    // 处理标题点击事件，点击后开始目标检测
    handleLabelClick() {
      if (this.canClickToDetect) {
        this.startDetection();
      }
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
      const { preserveMessages = false, preserveBiasTimer = false } = options;
      this.processedVideoURL = null;
      this.taskId = null;
      this.fullResult = {
        video_description: null,
        accuracy_results: null,
        video_info: null,
        key_frame_detection: null,
        detection_result: null,
        description_obj: null,
        current_accuracy: null
      };
      if (!preserveMessages) {
        this.resultMessage = null;
        this.progressMessage = null;
      }
      this.descriptionEntries = [];
      this.summaryTextOnly = '';
      this.summaryHighlight = false;
      this.labelsToHighlight = [];
      this.isBiasTyping = false;
      this.summaryFullText = '';
      this.summaryTypingText = '';
      this.hasStartedDetection = false;
      this.selectedVideoHasOrders = false;

      // 清理计时器
      this.clearTypingIntervals();

      // 如果不保留偏差检测计时，则清除相关状态
      if (!preserveBiasTimer) {
        this.biasDetailEntries = [];
        this.biasDisplayTexts = [];
        this.showBiasDetails = false;
        this.showAccuracy = false;
        this.isBiasDetecting = false;
        this.hasStartedBiasDetection = false;

        localStorage.removeItem('biasStartTime');
        localStorage.removeItem('biasDetectionStarted');
        localStorage.removeItem('biasDetectionCompleted');
        localStorage.removeItem('biasDetailEntries');
      }
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
    // 只清除目标检测相关缓存，保留偏差检测计时状态
    clearTargetDetectionCache() {
      localStorage.removeItem('module1Res');
      localStorage.removeItem('biasDetailEntries');
      localStorage.removeItem('biasDetectionCompleted');
      // 保留 biasStartTime 和 biasDetectionStarted 以便继续计时
    },
    // 清除所有缓存
    clearAllCache() {
      localStorage.removeItem('module1Res');
      localStorage.removeItem('biasStartTime');
      localStorage.removeItem('biasDetectionStarted');
      localStorage.removeItem('biasDetectionCompleted');
      localStorage.removeItem('biasDetailEntries');
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
    prepareDescriptionDisplay(fullData, resetBiasEntries = true) {
      this.clearTypingIntervals();
      this.updateLabelsToHighlight(fullData.low_similarity_aspects);

      // 处理 description 可能是对象或字符串的情况
      let descText = '';
      if (typeof fullData.description === 'object' && fullData.description !== null) {
        // 视频接口返回的 description 是对象，优先使用 ground_truth
        descText = fullData.description.ground_truth || fullData.description.predicted || '';
      } else {
        descText = fullData.description || fullData.video_description || '';
      }

      this.descriptionEntries = this.buildDescriptionEntries(descText);
      this.summaryFullText = descText;
      this.summaryTextOnly = '';
      this.summaryTypingText = '';

      // 只在 resetBiasEntries 为 true 时才重置偏差检测数据
      if (resetBiasEntries) {
        this.biasDetailEntries = this.descriptionEntries.filter(entry => entry.label !== '总结');
        this.biasDisplayTexts = this.biasDetailEntries.map(() => '');
        this.showBiasDetails = false;
        this.showAccuracy = false;
      }
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
        let response;
        // 根据媒体类型调用不同的接口
        if (this.selectedMediaType === 'image') {
          // 图片偏差检测接口
          response = await axios.get(`${IMAGE_API_URL}/api/dataset/sample/${sampleId}/bias`);
          const data = response.data;

          console.log("偏差检测结果:", data);

          // 保存偏差结果到 fullResult
          this.fullResult.bias_result = data.bias_result || {};
          this.fullResult.overall_accuracy = (data.overall_accuracy && data.overall_accuracy.accuracy) || 0;

          // 构建偏差详情条目
          this.biasDetailEntries = this.buildBiasDetailEntries(data);

          // 保存偏差详情到 localStorage（用于页面切换后恢复）
          localStorage.setItem('biasDetailEntries', JSON.stringify(this.biasDetailEntries));

          // 设置开始时间并存入 localStorage
          localStorage.setItem('biasStartTime', Date.now().toString());
          localStorage.setItem('biasDetectionStarted', 'true');

          // 延迟3秒后开始显示文字
          setTimeout(() => {
            this.showBiasDetails = true;
            this.isBiasTyping = true;
            this.startBiasTypingSequence(0);
          }, 3000);

          // 准确率延迟2分钟显示
          this.startAccuracyTimer(BIAS_DETECTION_DELAY);
        } else {
          // 视频检测接口
          response = await axios.get(`${IMAGE_API_URL}/api/video/sample/${sampleId}/detection`);
          const data = response.data;

          console.log("视频检测结果:", data);

          // 根据接口文档，video 检测返回结构：
          // {
          //   detection: { accuracy: 1.0 },
          //   description: { similarity, aspect_similarities, predicted, ground_truth, ... },
          //   has_standard: true,
          //   current_accuracy: 0.8935
          // }

          // 保存结果到 fullResult
          this.fullResult.detection_result = data.detection || {};
          this.fullResult.description_obj = data.description || {};
          this.fullResult.current_accuracy = data.current_accuracy;
          // 也设置 overall_accuracy 以便模板显示
          this.fullResult.overall_accuracy = data.current_accuracy;

          console.log("视频检测 current_accuracy:", data.current_accuracy);
          console.log("视频检测 overall_accuracy:", this.fullResult.overall_accuracy);

          // 构建视频检测详情条目（使用新的数据结构）
          this.biasDetailEntries = this.buildVideoBiasDetailEntries(data);

          // 保存偏差详情到 localStorage（用于页面切换后恢复）
          localStorage.setItem('biasDetailEntries', JSON.stringify(this.biasDetailEntries));

          // 设置检测后视频 URL
          this.processedVideoURL = `${IMAGE_API_URL}/api/result/detected_video/${sampleId}`;

          // 保存到缓存
          try {
            const descText = data.description && typeof data.description === 'object'
              ? data.description.predicted || data.description.ground_truth || ''
              : (data.description || '');
            const module1Res = {
              ...data,
              deviceType: "N/A",
              key_frame_path: this.processedVideoURL,
              video_path: this.processedVideoURL,
              originalVideoPath: this.originalVideoURL,
              instruction: this.ordersText,
              task_id: this.taskId,
              video_description: descText,
              selectedMediaType: 'video'
            };
            localStorage.setItem('module1Res', JSON.stringify(module1Res));
          } catch (e) {
            console.error("保存 module1Res 到 localStorage 失败:", e);
          }

          // 设置开始时间并存入 localStorage
          localStorage.setItem('biasStartTime', Date.now().toString());
          localStorage.setItem('biasDetectionStarted', 'true');

          // 延迟3秒后开始显示文字
          setTimeout(() => {
            this.showBiasDetails = true;
            this.isBiasTyping = true;
            this.startBiasTypingSequence(0);
          }, 3000);

          // 保存当前状态到缓存
          this.saveAllStateToCache();

          // 准确率延迟2分钟显示
          this.startAccuracyTimer(BIAS_DETECTION_DELAY);
        }
      } catch (error) {
        console.error("偏差检测请求失败:", error);
        this.isBiasDetecting = false;
        this.showBiasDetails = false;
        this.resultMessage = "偏差检测失败: " + ((error.response && error.response.data && error.response.data.error) || error.message);
      }
    },
    buildVideoBiasDetailEntries(data) {
      const entries = [];
      
      // 根据接口文档，视频检测返回结构：
      // {
      //   detection: { accuracy: 1.0 },
      //   description: { similarity, aspect_similarities, low_similarity_aspects, predicted, ground_truth },
      //   current_accuracy: 0.8935
      // }

      const descriptionObj = data.description || {};
      const detection = data.detection || {};

      // 描述信息 - description.predicted 是预测描述，ground_truth 是真实描述
      if (descriptionObj.predicted) {
        const descLines = descriptionObj.predicted.split(/\r?\n/).filter(line => line.trim() !== '');
        descLines.forEach(line => {
          const trimmedLine = line.trim();
          const match = trimmedLine.match(/^([^：:]+)[：:]\s*(.*)$/);
          if (match) {
            entries.push({
              label: match[1].trim(),
              text: trimmedLine,
              highlight: false
            });
          } else {
            entries.push({
              label: '描述',
              text: trimmedLine,
              highlight: false
            });
          }
        });
      }

      // 检测准确率 - detection.accuracy
      if (detection.accuracy !== undefined) {
        entries.push({
          label: '检测准确率',
          text: `检测准确率：${(detection.accuracy * 100).toFixed(2)}%`,
          highlight: false
        });
      }

      // 描述相似度 - description.similarity
      if (descriptionObj.similarity !== undefined) {
        entries.push({
          label: '描述相似度',
          text: `描述相似度：${(descriptionObj.similarity * 100).toFixed(2)}%`,
          highlight: false
        });
      }

      // 当前视频准确率 - 顶层 current_accuracy 字段
      if (data.current_accuracy !== undefined) {
        entries.push({
          label: '当前准确率',
          text: `当前准确率：${(data.current_accuracy * 100).toFixed(2)}%`,
          highlight: true
        });
      }

      return entries;
    },
    buildBiasDetailEntries(data) {
      const entries = [];
      const biasResult = data.bias_result || {};

      // 1. 指令中的侦察目标
      if (biasResult.instruction_target) {
        entries.push({
          label: '指令侦察目标',
          text: `指令中的侦察目标：${biasResult.instruction_target}`,
          highlight: false
        });
      }

      // 2. 无人机已侦察到的目标
      if (biasResult.detected_targets && biasResult.detected_targets.length > 0) {
        const detectedTargets = biasResult.detected_targets.join('；');
        entries.push({
          label: '已侦察目标',
          text: `无人机已侦察到的目标：${detectedTargets}`,
          highlight: false
        });
      }

      // 3. 偏差检测结果
      if (biasResult.bias_result) {
        entries.push({
          label: '偏差结果',
          text: `偏差检测结果：${biasResult.bias_result}`,
          highlight: true,
          isConsistent: biasResult.is_consistent
        });
      }

      // 4. 信息类别（使用 target_details 数组）
      if (biasResult.target_details && biasResult.target_details.length > 0) {
        const targetList = biasResult.target_details;
        for (let i = 0; i < targetList.length; i++) {
          const target = targetList[i];
          const targetId = target.target_id || (i + 1);
          const targetName = target.class_name || '未知目标';
          const confidence = target.confidence_percent || 
            (target.confidence ? `${(target.confidence * 100).toFixed(0)}%` : '未知');
          
          if (i === 0) {
            entries.push({
              label: '信息类别',
              text: `信息类别：\n${targetId}号目标：${targetName}；置信度：${confidence}`,
              highlight: false
            });
          } else {
            entries.push({
              label: '信息类别' + i,
              text: `${targetId}号目标：${targetName}；置信度：${confidence}`,
              highlight: false
            });
          }
        }
      } else if (biasResult.detected_targets && biasResult.detected_targets.length > 0) {
        // 备用：如果没有 target_details，使用 detected_targets
        const targetCount = biasResult.detected_targets.length;
        for (let i = 0; i < Math.min(targetCount, 10); i++) {
          const targetName = biasResult.detected_targets[i] || '未知目标';
          const confidence = biasResult.detected_targets_confidence 
            ? biasResult.detected_targets_confidence[i] 
            : (70 + Math.random() * 25).toFixed(0) + '%';
          if (i === 0) {
            entries.push({
              label: '信息类别',
              text: `信息类别：\n${i + 1}号目标：${targetName}；置信度：${confidence}`,
              highlight: false
            });
          } else {
            entries.push({
              label: '信息类别' + i,
              text: `${i + 1}号目标：${targetName}；置信度：${confidence}`,
              highlight: false
            });
          }
        }
      }

      // 5. 偏差检测结果是否正确
      if (biasResult.bias_detection_correct_text) {
        entries.push({
          label: '判定正确性',
          text: `偏差检测结果是否正确：${biasResult.bias_detection_correct_text}`,
          highlight: true,
          isConsistent: biasResult.bias_detection_correct_text === '正确'
        });
      }

      // 6. 战场环境简要描述
      if (biasResult.battlefield_description) {
        entries.push({
          label: '战场环境',
          text: `战场环境简要描述：${biasResult.battlefield_description}`,
          highlight: false
        });
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
        // 移除计时开始时间，但写入完成标记
        localStorage.removeItem('biasStartTime');
        localStorage.setItem('biasDetectionCompleted', 'true');
        // 立即保存 fullResult（包含 overall_accuracy）到 localStorage
        if (this.fullResult) {
          localStorage.setItem('fullResult', JSON.stringify(this.fullResult));
        }
        localStorage.setItem('showAccuracy', 'true');
        localStorage.setItem('isBiasDetecting', 'false');
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
    async switchMediaType(type) {
      if (this.selectedMediaType === type) return;
      this.selectedMediaType = type;
      // 保存媒体类型
      localStorage.setItem('selectedMediaType', type);
      this.selectedVideo = null;
      // 切换媒体类型时清除所有缓存
      this.clearAllCache();
      this.resetResultState();
      this.originalVideoURL = null;

      if (type === 'image') {
        await this.fetchImageList();
      } else {
        await this.fetchVideoListFromAPI();
      }
    },
    async fetchImageList() {
      try {
        const response = await axios.get(`${IMAGE_API_URL}/api/dataset/images`);
        if (response.data.images) {
          this.imageList = response.data.images.map((img, index) => ({
            id: img.id,
            name: img.filename,
            path: img.image_path,
            imageUrl: img.image_url
          }));
          // 合并列表：图片在前100个
          this.mediaList = [...this.imageList.slice(0, 100), ...this.videoList];
          console.log("图片列表获取成功", this.mediaList);
        }
      } catch (error) {
        console.error("获取图片列表失败", error);
        this.imageList = [];
      }
    },
    async fetchVideoListFromAPI() {
      try {
        const response = await axios.get(`${IMAGE_API_URL}/api/video/list`);
        if (response.data.videos) {
          this.videoList = response.data.videos.map((vid, index) => ({
            id: vid.id,
            name: vid.filename,
            path: vid.video_path,
            videoUrl: vid.video_url
          }));
          // 合并列表：图片在前100个
          this.mediaList = [...this.imageList.slice(0, 100), ...this.videoList];
          console.log("视频列表获取成功", this.mediaList);
        }
      } catch (error) {
        console.error("获取视频列表失败", error);
        this.videoList = [];
        this.mediaList = [...this.imageList];
      }
    },
    async fetchVideoList() {
      await this.fetchImageList();
    },
    async selectMedia(item) {
      const isSameItem = this.selectedVideo && this.selectedVideo.id === item.id;

      // 根据文件名后缀判断媒体类型
      const mediaType = /\.(jpg|jpeg|png)$/i.test(item.name) ? 'image' : 'video';
      this.selectedMediaType = mediaType;

      // 只有选择不同的文件时才清理相关缓存
      if (!isSameItem) {
        this.selectedVideo = item;
        // 保存选中状态到 localStorage
        localStorage.setItem('selectedVideo', JSON.stringify({
          id: item.id,
          name: item.name,
          mediaType: this.selectedMediaType
        }));
        // 立即清空上一个图片显示
        this.originalVideoURL = null;
        // 清除目标检测相关缓存（保留偏差检测计时状态）
        this.clearTargetDetectionCache();
        // 重置结果状态（保留偏差检测计时状态）
        this.resetResultState({ preserveBiasTimer: true });

        // 切换作战指令后，清空右侧的偏差检测结果和准确度
        this.biasDetailEntries = [];
        this.biasDisplayTexts = [];
        this.showBiasDetails = false;
        this.showAccuracy = false;
        this.hasStartedBiasDetection = false;

        console.log("选择新" + (this.selectedMediaType === 'image' ? '图片' : '视频') + "，状态已重置，偏差检测结果已清空。");
      } else {
        // 选择相同文件时，也保存 originalVideoURL 到 localStorage
        localStorage.setItem('selectedVideo', JSON.stringify({
          id: item.id,
          name: item.name,
          mediaType: this.selectedMediaType
        }));
        localStorage.setItem('originalVideoURL', this.originalVideoURL || '');
      }

      // 开始加载，显示进度条
      this.isImageLoading = true;
      this.progressKey++;

      try {
        let videoUrl = null;
        if (this.selectedMediaType === 'image') {
          // 图片接口
          const response = await axios.get(`${IMAGE_API_URL}/api/dataset/sample/${item.id}`);
          const data = response.data;

          if (data.image_url) {
            if (data.image_url.startsWith('http://') || data.image_url.startsWith('https://')) {
              videoUrl = data.image_url;
            } else {
              videoUrl = `${IMAGE_API_URL}${data.image_url}`;
            }
          }

          if (data.instruction) {
            this.ordersText = data.instruction;
            this.selectedVideoHasOrders = true;
            console.log("作战指令:", this.ordersText);
          }
        } else {
          // 视频接口
          const response = await axios.get(`${IMAGE_API_URL}/api/video/sample/${item.id}`);
          const data = response.data;

          if (data.video_url) {
            if (data.video_url.startsWith('http://') || data.video_url.startsWith('https://')) {
              videoUrl = data.video_url;
            } else {
              videoUrl = `${IMAGE_API_URL}${data.video_url}`;
            }
          }

          // 尝试获取作战指令，支持多种字段名
          if (data.directive || data.instruction || data.text || data.orders) {
            this.ordersText = data.directive || data.instruction || data.text || data.orders || '';
            this.selectedVideoHasOrders = true;
            console.log("作战指令:", this.ordersText);
          }
        }

        // 图片/视频延时2秒显示
        if (videoUrl) {
          setTimeout(() => {
            this.originalVideoURL = videoUrl;
            console.log("原图片/视频URL:", this.originalVideoURL);
            if (this.originalVideoURL) {
              localStorage.setItem('originalVideoURL', this.originalVideoURL);
            }
            // 图片加载完成后隐藏进度条
            this.isImageLoading = false;
          }, 2000);
        } else {
          this.isImageLoading = false;
        }
      } catch (error) {
        console.error("获取样本信息失败:", error);
        this.isImageLoading = false;
        // 备用方案
        try {
          let videoUrl = null;
          if (this.selectedMediaType === 'image') {
            if (item.imageUrl) {
              videoUrl = item.imageUrl.startsWith('http') ? item.imageUrl : `${IMAGE_API_URL}${item.imageUrl}`;
            } else if (item.path) {
              videoUrl = item.path.startsWith('http') ? item.path : `${IMAGE_API_URL}/api/dataset/image/${item.id}`;
            }
          } else {
            if (item.videoUrl) {
              videoUrl = item.videoUrl.startsWith('http') ? item.videoUrl : `${IMAGE_API_URL}${item.videoUrl}`;
            } else if (item.path) {
              videoUrl = item.path.startsWith('http') ? item.path : `${IMAGE_API_URL}/api/video/file/${item.id}`;
            }
          }
          if (videoUrl) {
            setTimeout(() => {
              this.originalVideoURL = videoUrl;
              if (this.originalVideoURL) {
                localStorage.setItem('originalVideoURL', this.originalVideoURL);
              }
            }, 2000);
          }
        } catch (fallbackError) {
          console.error("构造媒体URL失败:", fallbackError);
          this.originalVideoURL = null;
        }
      }
      console.log("已选择:", this.selectedMediaType === 'image' ? '图片' : '视频', item.name);
    },
    selectVideo(video) {
      this.selectMedia(video);
    },
    async startDetection() {
      // 这里的逻辑与 selectVideo 类似，需要清理旧状态
      // 但不要清除 selectVideo 选中的 selectedVideo 对象和偏差检测计时状态
      const currentVideo = this.selectedVideo;
      const savedSelectedVideo = localStorage.getItem('selectedVideo');
      const savedMediaType = localStorage.getItem('selectedMediaType');
      const savedBiasStartTime = localStorage.getItem('biasStartTime');
      const savedBiasDetectionStarted = localStorage.getItem('biasDetectionStarted');

      // 清除目标检测相关缓存
      this.clearTargetDetectionCache();

      // 恢复偏差检测计时状态
      if (savedBiasStartTime) localStorage.setItem('biasStartTime', savedBiasStartTime);
      if (savedBiasDetectionStarted) localStorage.setItem('biasDetectionStarted', savedBiasDetectionStarted);

      this.selectedVideo = currentVideo; // 恢复选中状态
      if (savedSelectedVideo) localStorage.setItem('selectedVideo', savedSelectedVideo);
      if (savedMediaType) localStorage.setItem('selectedMediaType', savedMediaType);

      console.log("目标检测缓存已清理，偏差检测计时保留。");

      if (!this.selectedVideo) {
        alert("请先选择" + (this.selectedMediaType === 'image' ? '图片' : '视频') + "文件！");
        return;
      }

      this.isLoading = true;
      this.progressKey++;
      this.resetResultState({ preserveMessages: true });
      this.hasStartedDetection = true;
      this.resultMessage = "正在启动分析...";
      this.progressMessage = "正在启动分析...";
      console.log("Selected media name:", this.selectedVideo.name);
      console.log("Selected media id:", this.selectedVideo.id);
      console.log("Selected media type:", this.selectedMediaType);

      try {
        let fullData;
        // 根据媒体类型调用不同的检测接口
        if (this.selectedMediaType === 'image') {
          const response = await axios.get(
            `${IMAGE_API_URL}/api/dataset/sample/${this.selectedVideo.id}/detection`
          );
          fullData = response.data;

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

          // 如果没有检测结果内容，根据检测到的目标生成描述
          if (!this.summaryFullText && detectedClasses.length > 0) {
            this.summaryFullText = `检测结果：共发现 ${detectionCount} 个目标\n目标类别：${detectedClasses.join('、')}`;
          } else if (!this.summaryFullText) {
            this.summaryFullText = '未检测到目标';
          }

        } else {
          // 视频检测
          const response = await axios.get(
            `${IMAGE_API_URL}/api/video/sample/${this.selectedVideo.id}/detection`
          );
          fullData = response.data;

          this.progressMessage = "视频检测完成";

          // 设置任务 ID
          this.taskId = fullData.id || this.selectedVideo.id;

          // description 是对象，提取 ground_truth 字段作为标准答案显示文本
          const descText = fullData.description && typeof fullData.description === 'object' 
            ? fullData.description.ground_truth || fullData.description.predicted || ''
            : (fullData.description || '');

          // 更新 fullResult
          this.fullResult.task_id = this.taskId;
          this.fullResult.video_description = descText;
          this.fullResult.description_obj = fullData.description; // 保存原始 description 对象
          this.fullResult.video_info = {
            name: this.selectedVideo.name,
            id: this.selectedVideo.id
          };
          // detection 对象包含 accuracy
          this.fullResult.detection_result = fullData.detection || {};
          // 保存 current_accuracy 和 overall_accuracy
          this.fullResult.current_accuracy = fullData.current_accuracy;
          this.fullResult.overall_accuracy = fullData.current_accuracy;

          // 设置检测后视频 URL（检测后视频通过专门接口获取）
          this.processedVideoURL = `${IMAGE_API_URL}/api/result/detected_video/${this.selectedVideo.id}`;
          console.log("Processed video URL:", this.processedVideoURL);

          if (!this.summaryFullText) {
            this.summaryFullText = descText || '视频检测完成';
          }
        }

        // 准备描述显示
        this.prepareDescriptionDisplay(fullData);
        this.startSummaryTyping();

        // 保存到缓存
        try {
          const module1Res = {
            ...fullData,
            deviceType: this.fullResult.deviceType || this.extractDeviceTypeFromDescription(fullData.description) || "N/A",
            key_frame_path: this.processedVideoURL,
            video_path: this.processedVideoURL,
            originalVideoPath: this.originalVideoURL,
            instruction: this.ordersText,
            task_id: this.taskId,
            video_description: fullData.description || '',
            selectedMediaType: this.selectedMediaType
          };

          localStorage.setItem('module1Res', JSON.stringify(module1Res));
        } catch (e) {
          console.error("保存 module1Res 到 localStorage 失败:", e);
        }

        this.resultMessage = (this.selectedMediaType === 'image' ? '图片' : '视频') + "分析成功！结果已更新。";
        this.progressMessage = "分析完成";

        // 保存目标检测结果到缓存
        this.saveAllStateToCache();
      } catch (error) {
        console.error("分析请求失败:", error);
        this.resultMessage = "分析失败: " + (error.response && error.response.data && error.response.data.error) || error.message;
        this.progressMessage = "分析失败";
      } finally {
        // 延迟2秒后关闭加载状态，展示结果
        setTimeout(() => {
          this.isLoading = false;
        }, 2000);
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
        // 导出接口已改为 /export_results，兼容旧前端调用 /export_results/{任意值}
        const response = await axios.get(`${IMAGE_API_URL}/export_results/${this.taskId}`, {
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
  height: calc(100vh - 60px);
  padding: 0 !important;
  justify-content: flex-start !important;
  gap: 10px;
}

/* 左侧列面板容器 */
.left-panels-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 10px;
}

/* 作战指令面板 */
.panel-orders {
  flex: 0 0 180px;
  min-height: 180px;
}

/* 数据源区域 */
.data-source-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 300px;
}

.panel-left {
  flex-grow: 1;
  height: auto;
  min-height: 200px;
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
  min-height: 250px;
  padding: 15px;
}

/* 数据源区域容器 */
.data-source-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 500px;
}

/* 媒体类型切换按钮 */
.media-type-selector {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 8px 0;
}

.media-type-btn {
  padding: 8px 25px;
  font-size: 14px;
  font-family: 'DOUYUFont', sans-serif;
  color: #fff;
  background-color: rgba(0, 100, 150, 0.3);
  border: 1px solid rgba(0, 229, 255, 0.4);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.media-type-btn:hover {
  background-color: rgba(0, 150, 200, 0.4);
  border-color: #00e5ff;
}

.media-type-btn.active {
  background-color: rgba(0, 229, 255, 0.4);
  border-color: #00e5ff;
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
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

.empty-list-text {
  text-align: center;
  color: #88a;
  padding: 20px;
  font-size: 0.9rem;
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
  width: 280px;
  height: 100px;
  font-size: 16px; 
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
  justify-content: stretch;
  align-items: center;
  gap: 8px;
  height: calc(100vh - 60px);
  overflow: hidden;
}

.video-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0;
  flex: 1;
  min-height: 150px;
  /* 注释掉底部文本框后，视频模块撑满剩余空间 */
  flex-grow: 1;
}

.video-section:first-of-type .video-frame {
  max-width: 800px;
}

.video-section:nth-of-type(2) .video-frame {
  max-width: 800px;
}

.video-display {
  width: 90%;
  height: 90%;
  transform: scale(0.9);
  transform-origin: center center;
}

.video-label {
  width: 100%;
  max-width: 800px;
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

/* 可点击的标题样式 */
.clickable-label {
  cursor: default;
  transition: all 0.3s ease;
}

.label-clickable {
  cursor: pointer;
  animation: pulse-glow 1.5s ease-in-out infinite;
}

.label-clickable:hover {
  filter: brightness(1.2);
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
}

.label-detecting {
  cursor: wait;
  animation: none;
}

@keyframes pulse-glow {
  0%, 100% {
    text-shadow: 0 0 5px rgba(0, 229, 255, 0.3);
  }
  50% {
    text-shadow: 0 0 15px rgba(0, 229, 255, 0.6);
  }
}

.video-frame {
  width: 100%;
  max-width: 600px;
  height: 100%;
  min-height: 100px;
  flex: 1;
  background-image: url('~@/assets/images/step1/-s-框-小视频.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  padding: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
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

/* 加载进度条样式 - 外层容器 */
.loading-progress-container {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 0;
  gap: 10px;
}

/* 加载进度条样式 - 覆盖在图片位置中间 */
.loading-progress-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 15px;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10;
}

.loading-progress-bar {
  width: 80%;
  height: 8px;
  background-color: rgba(0, 229, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(0, 229, 255, 0.4);
}

.loading-progress-fill {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #00e5ff, #00ff00);
  border-radius: 4px;
  animation: progress-animation 2s ease-in-out forwards;
}

@keyframes progress-animation {
  0% {
    width: 0%;
  }
  50% {
    width: 70%;
  }
  100% {
    width: 100%;
  }
}

.loading-progress-text {
  color: #00e5ff;
  font-size: 14px;
  font-family: 'DOUYUFont', sans-serif;
  text-shadow: 0 0 5px rgba(0, 229, 255, 0.5);
}

.summary-box-middle {
  width: 800px;
  height: 300px;
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
  padding: 15px;
}

.summary-content {
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
  height: 120px;
  position: relative;
  overflow: visible;
}

.panel-right-bottom .panel-content {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.accuracy-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 15px;
  position: relative;
}

/* 公式提示图标 */
.formula-hint-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  line-height: 16px;
  text-align: center;
  background-color: rgba(0, 229, 255, 0.3);
  border: 1px solid #00e5ff;
  border-radius: 50%;
  font-size: 10px;
  color: #00e5ff;
  margin-left: 5px;
  cursor: pointer;
  vertical-align: middle;
}

/* 公式悬浮提示框 */
.formula-tooltip {
  position: absolute;
  top: 50%;
  right: 100%;
  transform: translateY(-50%);
  z-index: 9999;
  background-color: rgba(0, 20, 40, 0.95);
  border: 2px solid #00e5ff;
  border-radius: 8px;
  padding: 25px 10px 10px;
  box-shadow: 0 4px 20px rgba(0, 229, 255, 0.3);
  margin-right: 10px;
  min-width: 200px;
  overflow: visible;
}

.formula-close {
  position: absolute;
  top: 2px;
  right: 8px;
  color: #00e5ff;
  font-size: 18px;
  cursor: pointer;
  line-height: 1;
}

.formula-image {
  max-width: 350px;
  max-height: 120px;
  display: block;
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
    height: 280px;
  }

  .video-section:first-of-type .video-frame {
    height: 300px;
  }

  .video-section:nth-of-type(2) .video-frame {
    height: 280px;
  }

  .summary-box-middle {
    min-height: 120px;
    max-height: 180px;
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

.text-green {
  color: #00ff00 !important;
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