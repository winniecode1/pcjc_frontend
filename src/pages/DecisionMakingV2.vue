<template>
  <div class="section">
    <div class="img_box"></div>

    <b-row class="header-bar align-item-s-center no-gutters">
      <b-col cols="3" class="text-left">
        <button class="header-btn btn-home" @click="navigateHome">首页</button>
        <button class="header-btn btn-back" @click="navigateHome">上个页面</button>
      </b-col>
      <b-col cols="6" class="text-center">
        <h1 class="newTitle">决策选择认知偏差检测模型</h1>
      </b-col>
      <b-col cols="3" class="text-right">
        <button class="header-btn btn-next" @click="navigateNextPage">下个页面</button>
      </b-col>
    </b-row>

    <b-row class="justify-content-center content-row no-gutters">

      <b-col cols="3" class="left-column px-1">
    <div class="left-panels-container">
    <div class="panel-header header-select-data clean-header">选择认知传播数据源</div>

    <div class="data-source-section">
      <div class="panel-left">
        <div class="panel-content">
          <div class="media-type-selector">
            <button 
              class="media-type-btn" 
              :class="{ 'active': selectedMediaType === 'image' }"
              @click="switchMediaType('image')">
              图片
            </button>
            <button 
              class="media-type-btn" 
              :class="{ 'active': selectedMediaType === 'video' }"
              @click="switchMediaType('video')">
              视频
            </button>
          </div>
          <div class="server-video-list overflow-auto">
            <div v-for="item in mediaList" :key="item.path" class="video-item" @click="selectMedia(item)"
              :class="{ 'selected': selectedVideo && selectedVideo.path === item.path }">
              <span>{{ item.name }}</span>
              <span class="selector-circle"></span>
            </div>
            <div v-if="mediaList.length === 0" class="empty-list-text">
              暂无{{ selectedMediaType === 'image' ? '图片' : '视频' }}数据
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="panel-header header-select-data clean-header">作战指令</div>

    <div class="panel-orders">
      <div class="panel-content orders-panel-content">
        <div class="orders-info-box overflow-auto">
          <template v-if="isOrdersLoading">
            <p class="orders-loading-hint">加载中...</p>
          </template>
          <template v-else>
            <div class="result-section small-section left-info-section orders-command-only">
              <div class="section-header">指令信息：</div>
              <div class="section-content">
                <p class="result-text">{{ ordersCommandForDisplay || '暂无指令信息' }}</p>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

  </div>
</b-col>

      <b-col cols="5" class="middle-column mx-2 px-1">
        <div class="video-section video-section--original">
          <div class="video-label label-original">{{ selectedMediaType === 'image' ? '认知传播图片' : '认知传播视频' }}</div>
          <div class="video-frame">
            <img v-if="originalMediaDisplayReady && originalVideoURL && selectedMediaType === 'image'" :src="originalVideoURL" class="video-display" alt="原始图片" @error="handleImageError" />
            <video
              v-else-if="originalMediaDisplayReady && originalVideoURL && selectedMediaType === 'video'"
              :src="originalVideoURL"
              class="video-display"
              controls
              autoplay
              muted
              playsinline
              loop
              :key="'orig-' + originalVideoURL"
              @error="handleOriginalVideoError"
            ></video>
            <div v-if="isImageLoading" class="loading-progress-overlay">
              <div class="loading-progress-bar">
                <div class="loading-progress-fill"></div>
              </div>
              <div class="loading-progress-text">{{ selectedMediaType === 'image' ? '图片加载中...' : '视频加载中...' }}</div>
            </div>
            <div v-else-if="!originalVideoURL" class="placeholder-text">请选择{{ selectedMediaType === 'image' ? '图片' : '视频' }}</div>
          </div>
        </div>

        <div class="video-section video-section--processed">
          <div
            class="video-label label-processed clickable-label"
            :class="{ 'label-clickable': canClickToDetect, 'label-detecting': isLoading }"
            @click="handleLabelClick"
          >
            {{ detectionLabelText }}
          </div>
          <div class="video-frame">
            <img v-if="processedVideoURL && !isLoading && selectedMediaType === 'image'" :src="processedVideoURL" class="video-display" alt="检测结果" :key="'img-' + processedVideoURL" @load="handleProcessedTrackMediaReady" @error="handleImageError" />
            <video
              v-else-if="processedVideoURL && !isLoading && selectedMediaType === 'video' && !processedVideoCodecWarning"
              :src="processedVideoURL"
              class="video-display"
              controls
              autoplay
              muted
              playsinline
              loop
              :key="'video-' + processedVideoURL"
              @loadeddata="handleProcessedTrackMediaReady"
              @error="handleProcessedVideoError"
            ></video>
            <div v-else-if="processedVideoURL && !isLoading && selectedMediaType === 'video' && processedVideoCodecWarning" class="codec-unsupported-box">
              <p class="codec-unsupported-text">{{ processedVideoCodecWarning }}</p>
              <a class="codec-download-link" :href="processedVideoURL" :download="processedVideoDownloadName">下载轨迹视频 ({{ processedVideoDownloadName }})</a>
            </div>
            <div v-if="isLoading" class="loading-progress-overlay">
              <div class="loading-progress-bar">
                <div class="loading-progress-fill"></div>
              </div>
              <div class="loading-progress-text">分析中...</div>
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

      <b-col cols="3" class="right-column px-1">
        <div class="right-panels-container">

        <div class="bias-button-container">
          <button class="btn-start-bias" @click="handleStartBiasDetection"
            :disabled="!canStartBiasDetection || isBiasTyping || isLoading || isBiasDetecting">
            <span class="btn-text-pos">决策认知偏差检测</span>
          </button>
        </div>

        <div class="panel-right-top" :class="{ 'loading-overlay': isBiasDetecting && !showBiasDetails }">
          <div class="panel-content">
            <div class="panel-header header-results title-one-line dm-result-box-title">
              <span>战术意图分析</span>
            </div>
            <div v-if="isBiasDetecting && !showBiasDetails" class="panel-overlay">计算中...</div>
            <div class="result-section result-section-main">
              <div
                class="section-content unified-scroll bias-panel-scroll"
                :class="{ 'loading-text': isBiasDetecting && !showBiasDetails }"
              >
                <p v-if="!showBiasDetails" class="result-text hint-text">请点击决策认知偏差检测</p>

                <div v-else-if="showBiasDetails" class="bias-result-display">
                  <div v-if="behaviorAnalysisView" class="behavior-analysis-view">
                    <div
                      v-if="behaviorAnalysisView.tacticalIntentRanking && behaviorAnalysisView.tacticalIntentRanking.length"
                      class="ba-section ba-section--tactical"
                    >
                      <div class="ba-intent-list">
                        <button
                          v-for="(item, idx) in behaviorAnalysisView.tacticalIntentRanking"
                          :key="'intent-' + idx + '-' + item.intent"
                          type="button"
                          class="ba-intent-btn"
                          :class="getTacticalIntentBiasClass(behaviorAnalysisView.tacticalIntentRanking, selectedTacticalIntentIndex, idx)"
                          :disabled="selectedTacticalIntentIndex !== null && selectedTacticalIntentIndex !== idx"
                          @click="selectTacticalIntent(idx)"
                        >
                          <span class="ba-intent-name">{{ item.intent }}</span>
                          <span class="ba-intent-confidence">
                            <span class="ba-intent-confidence-bar-wrap">
                              <span
                                class="ba-intent-confidence-bar"
                                :style="{ width: formatIntentConfidenceWidth(item.confidence) }"
                              ></span>
                            </span>
                            <span class="ba-intent-confidence-text">{{ formatIntentConfidenceText(item.confidence) }}</span>
                          </span>
                        </button>
                      </div>
                    </div>
                    <div
                      v-if="behaviorAnalysisView.auxiliaryMessage"
                      class="ba-section ba-section--auxiliary"
                    >
                      <div class="ba-section-head">
                        <span class="ba-section-icon">◈</span>
                        <span class="ba-section-title">机器意图分析</span>
                      </div>
                      <p class="ba-section-body ba-auxiliary-body">{{ behaviorAnalysisView.auxiliaryMessage }}</p>
                    </div>
                    <div
                      v-if="selectedTacticalIntentIndex !== null"
                      class="ba-section ba-section--commander"
                    >
                      <div class="ba-section-head">
                        <span class="ba-section-icon">◈</span>
                        <span class="ba-section-title">指挥员意图分析</span>
                      </div>
                      <p v-if="isCommanderIntentLoading" class="ba-section-body ba-auxiliary-body">分析中…</p>
                      <p v-else-if="commanderIntentAnalysisError" class="ba-section-body ba-auxiliary-body ba-commander-error">
                        {{ commanderIntentAnalysisError }}
                      </p>
                      <p v-else class="ba-section-body ba-auxiliary-body">{{ commanderIntentAnalysis }}</p>
                    </div>
                  </div>
                  <template v-else>
                    <div
                      v-for="(entry, index) in biasDetailEntries"
                      :key="entry.label + '-' + index"
                      class="typing-text text-left small-text"
                      :class="{
                        'text-highlight': entry.label === '偏差结果' && !entry.isConsistent && !isBiasTyping,
                        'text-green': entry.label === '偏差结果' && entry.isConsistent && !isBiasTyping
                      }"
                    >
                      {{ biasDisplayTexts[index] }}
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-right-bottom dm-decision-panel">
          <div class="panel-content">
            <div class="panel-header header-results title-one-line dm-result-box-title">
              <span>决策选择</span>
            </div>
            <div class="result-section result-section-main">
              <div class="section-content unified-scroll bias-panel-scroll">
                <p v-if="selectedTacticalIntentIndex === null" class="result-text hint-text">选择合适的战术意图</p>
                <p v-else-if="!tacticalDecisionRankingDisplay.length" class="result-text hint-text">暂无决策选项</p>
                <div v-else class="ba-intent-list">
                  <button
                    v-for="(item, idx) in tacticalDecisionRankingDisplay"
                    :key="'decision-' + idx + '-' + item.decision"
                    type="button"
                    class="ba-intent-btn"
                    :class="getTacticalDecisionBiasClass(tacticalDecisionRankingDisplay, selectedTacticalDecisionIndex, idx)"
                    :disabled="selectedTacticalDecisionIndex !== null && selectedTacticalDecisionIndex !== idx"
                    @click="selectTacticalDecision(idx)"
                  >
                    <span class="ba-intent-name">{{ item.decision }}</span>
                    <span class="ba-intent-confidence">
                      <span class="ba-intent-confidence-bar-wrap">
                        <span
                          class="ba-intent-confidence-bar"
                          :style="{ width: formatIntentConfidenceWidth(item.confidence) }"
                        ></span>
                      </span>
                      <span class="ba-intent-confidence-text">{{ formatIntentConfidenceText(item.confidence) }}</span>
                    </span>
                  </button>
                  <p
                    v-if="decisionBiasResultDisplay"
                    class="result-text decision-bias-result"
                    :class="decisionBiasResultDisplay.isConsistent ? 'text-green' : 'text-highlight'"
                  >
                    {{ decisionBiasResultDisplay.text }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-right-accuracy">
          <div class="panel-content">
            <div class="accuracy-content">
              <span class="accuracy-label" @click="showFormulaTooltip = !showFormulaTooltip">
                偏差识别准确率
                <span class="formula-hint-icon">?</span>
              </span>
              <span class="accuracy-value">
                <template v-if="deviationDetectionAccuracy === '计算中...'">
                  计算中...
                </template>
                <template
                  v-else-if="deviationDetectionAccuracy !== 'N/A' && deviationDetectionAccuracy !== '计算中...' && deviationDetectionAccuracy !== null && deviationDetectionAccuracy !== undefined && deviationDetectionAccuracy !== ''"
                >
                  {{ deviationDetectionAccuracy }}%
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
          <button class="btn-export-result" @click="exportData" :disabled="!hasStartedBiasDetection || isBiasDetecting || isExporting">
            <b-spinner small v-if="isExporting" class="btn-spinner-pos"></b-spinner>
            <span class="btn-text-pos">{{ isExporting ? '导出中...' : '结果导出' }}</span>
          </button>
        </div>

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
/** 与 DecisionMaking.vue 一致：认知传播数据源 load-image / load-video、作战指令 */
const SOURCE_API_BASE_URL = 'http://10.109.253.71:12358';
const REFINE_COMMAND_API_URL = `${SOURCE_API_BASE_URL}/machine-refine-command`;
const TRACK_ARTIFACT_API_URL = `${SOURCE_API_BASE_URL}/load-track-artifact`;
const ANALYZE_VIDEO_BEHAVIOR_API_URL = `${SOURCE_API_BASE_URL}/analyze-video-behavior`;
const BEHAVIOR_REASON_API_URL = `${SOURCE_API_BASE_URL}/behavior-reason`;
const FRONTEND_BASE_URL = 'http://10.109.253.71:8889';
const IMAGE_API_URL = 'http://10.109.253.71:5237';
const BASE_DIR = "/home/wuzhixuan/Project/PCJC/1";
const VIDEO_DIR = "/home/wuzhixuan/Project/PCJC/datasets/Vedio"
// 偏差识别准确率延迟展示：选择决策后约 30 秒出结果
const BIAS_DETECTION_DELAY = 30 * 1000;
const STATISTICS_ACCURACY_API_URL = `${SOURCE_API_BASE_URL}/statistics/accuracy`;
const EXPORT_OUTPUT_API_URL = `${SOURCE_API_BASE_URL}/export/output`;
/** 作战指令：选中媒体后至少延迟展示时长（ms） */
const ORDERS_DISPLAY_DELAY_MS = 5000;
/** 作战指令展示完成后，再延迟展示认知传播图片/视频（ms，3–5 秒） */
const ORIGINAL_MEDIA_DISPLAY_DELAY_MS = 4000;
/** 轨迹识别结果：接口返回后延迟展示时长（ms） */
const TRACK_DISPLAY_DELAY_MS = 3000;
/** 认知传播视频列表与静态预览目录（Drane 素材多为 mp4v，浏览器可能无法内嵌播放） */
const DRANE_VIDEO_STATIC_BASE = '/static/Drane_Vedio_input';

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
      ordersCommand: '',
      ordersNegotiation: '',
      isOrdersLoading: false,
      /** 作战指令延迟展示结束后为 true */
      ordersDisplayReady: false,
      ordersRefineDisplayTimer: null,
      /** 作战指令展示后再延迟展示认知传播图片/视频，展示完成后为 true */
      originalMediaDisplayReady: false,
      originalMediaDisplayTimer: null,
      selectedMediaType: 'video',
      imageList: [],
      videoList: [],
      mediaList: [],
      selectedVideo: null,
      originalVideoURL: null,
      processedVideoURL: null,
      taskId: null,
      isLoading: false,
      isImageLoading: false,
      progressMessage: null,
      resultMessage: null,
      fullResult: {
        video_description: null,
        accuracy_results: null,
        video_info: null,
        key_frame_detection: null
      },
      descriptionEntries: [],
      /** analyze-video-behavior 结构化展示（战术意图排名 + 辅助说明） */
      behaviorAnalysisView: null,
      /** 战术行为区当前选中的意图按钮索引（单选，选中后不可再改） */
      selectedTacticalIntentIndex: null,
      /** 决策选择区当前选中的决策按钮索引（单选，选中后不可再改） */
      selectedTacticalDecisionIndex: null,
      /** /behavior-reason 返回的指挥员意图分析文本 */
      commanderIntentAnalysis: '',
      commanderIntentAnalysisError: '',
      isCommanderIntentLoading: false,
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
      /** 与 DecisionMaking.vue deviationDetectionAccuracy：点击偏差检测后才显示 */
      deviationDetectionAccuracy: 'N/A',
      isBiasTyping: false,
      labelsToHighlight: [],
      typingSpeed: 60,
      summaryTypingSpeed: 200,
      isBiasDetecting: false,
      isExporting: false,
      hasStartedDetection: false,
      /** 点击「目标与轨迹识别」且多模态检测结果区已展示完成后为 true */
      trackResultDisplayReady: false,
      hasStartedBiasDetection: false,
      trackDisplayTimer: null,
      showFormulaTooltip: false,
      /** 认知传播视频是否已回退为 static/Drane_Vedio_input 直链 */
      originalVideoUsedStatic: false,
      /** 轨迹 MP4 为 mp4v 等浏览器不支持的编码时展示说明（仍可下载、可做偏差检测） */
      processedVideoCodecWarning: null,
      processedVideoDownloadName: '',
      /** 与「目标与轨迹识别」一致的请求上下文，供偏差检测复用 */
      trackRecognitionContext: null
    };
  },
  computed: {
    canStartBiasDetection() {
      return (
        this.trackResultDisplayReady &&
        !!this.processedVideoURL &&
        !this.isLoading
      );
    },
    /** 作战指令与认知传播媒体均展示完成后才可点击 */
    canStartTrackRecognition() {
      if (!this.selectedVideo || this.isLoading) return false;
      return (
        !this.isOrdersLoading &&
        this.ordersDisplayReady &&
        this.originalMediaDisplayReady &&
        !!this.originalVideoURL
      );
    },
    detectionLabelText() {
      if (this.isLoading) {
        return '目标识别与轨迹分析中';
      }
      if (this.hasStartedDetection && this.processedVideoURL) {
        return '目标识别与轨迹分析结果';
      }
      return '开始目标识别与轨迹分析';
    },
    canClickToDetect() {
      return this.canStartTrackRecognition && !this.hasStartedDetection;
    },
    /** 兼容 module1Res 等仍使用合并 instruction 字段的场景 */
    ordersText() {
      const parts = [];
      if (this.ordersCommand) parts.push(this.ordersCommand);
      if (this.ordersNegotiation) parts.push(this.ordersNegotiation);
      return parts.join('\n\n');
    },
    /** 未选择媒体时不展示缓存指令，进入页默认「暂无指令信息」 */
    ordersCommandForDisplay() {
      if (!this.selectedVideo) return '';
      return this.ordersCommand;
    },
    tacticalDecisionRankingDisplay() {
      if (
        this.selectedTacticalIntentIndex === null ||
        !this.behaviorAnalysisView ||
        !Array.isArray(this.behaviorAnalysisView.tacticalIntentRanking)
      ) {
        return [];
      }
      const intentItem = this.behaviorAnalysisView.tacticalIntentRanking[this.selectedTacticalIntentIndex];
      if (intentItem && Array.isArray(intentItem.tacticalDecisionRanking) && intentItem.tacticalDecisionRanking.length) {
        return intentItem.tacticalDecisionRanking;
      }
      if (Array.isArray(this.behaviorAnalysisView.tacticalDecisionRanking)) {
        return this.behaviorAnalysisView.tacticalDecisionRanking;
      }
      return [];
    },
    decisionBiasResultDisplay() {
      if (this.selectedTacticalDecisionIndex === null) return null;
      const items = this.tacticalDecisionRankingDisplay;
      if (!items.length) return null;
      const bestIndex = this.findHighestConfidenceIndex(items);
      const isConsistent = bestIndex >= 0 && this.selectedTacticalDecisionIndex === bestIndex;
      return {
        text: isConsistent ? '偏差检测结果：无偏差' : '偏差检测结果：有偏差',
        isConsistent
      };
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
    this.clearOrdersRefineDisplayTimer();
    this.clearOriginalMediaDisplayTimer();
    this.clearTrackDisplayTimer();
    this.revokeOriginalMediaBlob();
    this.revokeProcessedMediaBlob();
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
      if (this.ordersCommand) {
        localStorage.setItem('ordersCommand', this.ordersCommand);
      }
      if (this.ordersNegotiation) {
        localStorage.setItem('ordersNegotiation', this.ordersNegotiation);
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
      localStorage.setItem('deviationDetectionAccuracy', this.deviationDetectionAccuracy || 'N/A');
      if (this.trackRecognitionContext) {
        localStorage.setItem('trackRecognitionContext', JSON.stringify(this.trackRecognitionContext));
      }

      // 保存 module1Res
      const module1ResStr = localStorage.getItem('module1Res');
      if (module1ResStr) {
        // module1Res 已存在，保留
      }

      console.log('所有状态已保存到缓存');
    },
    // 从缓存恢复所有状态
    restoreAllStateFromCache() {
      // 恢复作战指令（进入页后会由 resetEnterPageMediaSelection 清空，仅保留选中后拉取）
      const savedOrdersCommand = localStorage.getItem('ordersCommand');
      const savedOrdersNegotiation = localStorage.getItem('ordersNegotiation');
      if (savedOrdersCommand != null) {
        this.ordersCommand = savedOrdersCommand;
      }
      if (savedOrdersNegotiation != null) {
        this.ordersNegotiation = savedOrdersNegotiation;
      } else {
        const savedOrdersText = localStorage.getItem('ordersText');
        if (savedOrdersText && !savedOrdersCommand) {
          this.ordersCommand = savedOrdersText;
        }
      }

      // 不恢复 originalVideoURL / processedVideoURL，进入页由用户点击后再加载预览

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

      // 偏差检测结果进入页不恢复，由 resetEnterPageMediaSelection + resetBiasResultPanel 重置

      const savedTrackCtx = localStorage.getItem('trackRecognitionContext');
      if (savedTrackCtx) {
        try {
          this.trackRecognitionContext = JSON.parse(savedTrackCtx);
        } catch (e) {
          console.error('恢复 trackRecognitionContext 失败:', e);
        }
      }

      // 恢复 summaryTypingInterval 状态 - 如果文字已显示完毕，不需要重新打字
      if (this.summaryTypingText === this.summaryFullText) {
        // 文字已完整显示，不需要打字机效果
        console.log('目标检测结果已完整显示');
      }

      console.log('所有状态已从缓存恢复');
    },
    /** 与 DecisionMaking.vue：GET /statistics/accuracy */
    async fetchStatisticsAccuracy() {
      const logTag = '[DecisionMakingV2][statistics/accuracy]';
      try {
        console.log(`${logTag} GET`, STATISTICS_ACCURACY_API_URL);
        const response = await axios.get(STATISTICS_ACCURACY_API_URL);
        console.log(`${logTag} 响应`, response.data);
        return response.data;
      } catch (error) {
        console.error(`${logTag} 失败`, error);
        return null;
      }
    },
    applyDeviationDetectionAccuracyFromCache() {
      this.deviationDetectionAccuracy = '90';
      console.log('[DecisionMakingV2] 偏差识别准确率展示值 deviationDetectionAccuracy:', this.deviationDetectionAccuracy);
    },
    /** 清除作战指令延迟展示定时器 */
    clearOrdersRefineDisplayTimer() {
      if (this.ordersRefineDisplayTimer) {
        clearTimeout(this.ordersRefineDisplayTimer);
        this.ordersRefineDisplayTimer = null;
      }
      this.ordersDisplayReady = false;
    },
    clearOriginalMediaDisplayTimer() {
      if (this.originalMediaDisplayTimer) {
        clearTimeout(this.originalMediaDisplayTimer);
        this.originalMediaDisplayTimer = null;
      }
    },
    resetOriginalMediaDisplay() {
      this.clearOriginalMediaDisplayTimer();
      this.originalMediaDisplayReady = false;
      this.isImageLoading = false;
      this.revokeOriginalMediaBlob();
      this.originalVideoURL = null;
      this.originalVideoUsedStatic = false;
    },
    /** 作战指令展示完成后，延迟加载认知传播图片/视频 */
    scheduleOriginalMediaDisplay(item, selectedPath) {
      this.clearOriginalMediaDisplayTimer();
      this.originalMediaDisplayReady = false;
      this.isImageLoading = true;
      this.revokeOriginalMediaBlob();
      this.originalVideoURL = null;
      console.log(
        '[DecisionMakingV2] 作战指令已展示，',
        ORIGINAL_MEDIA_DISPLAY_DELAY_MS,
        'ms 后加载认知传播',
        this.selectedMediaType === 'image' ? '图片' : '视频'
      );
      this.originalMediaDisplayTimer = setTimeout(async () => {
        this.originalMediaDisplayTimer = null;
        if (selectedPath && (!this.selectedVideo || this.selectedVideo.path !== selectedPath)) {
          console.log('[DecisionMakingV2] 认知传播媒体延迟展示取消：选中项已变更');
          this.isImageLoading = false;
          return;
        }
        try {
          await this.loadMediaFromSourceApi(item);
        } finally {
          this.isImageLoading = false;
        }
        if (selectedPath && (!this.selectedVideo || this.selectedVideo.path !== selectedPath)) {
          return;
        }
        if (this.originalVideoURL) {
          this.originalMediaDisplayReady = true;
          console.log('[DecisionMakingV2] 认知传播媒体已展示，可点击「开始多模态目标检测」');
        }
      }, ORIGINAL_MEDIA_DISPLAY_DELAY_MS);
    },
    clearTrackDisplayTimer() {
      if (this.trackDisplayTimer) {
        clearTimeout(this.trackDisplayTimer);
        this.trackDisplayTimer = null;
      }
    },
    /** 原文件名加 _tracked 后缀，如 F-16(0).mp4 → F-16(0)_tracked.mp4 */
    buildTrackedArtifactFilename(originalName) {
      const name = String(originalName || '').trim();
      if (!name) return '';
      const dot = name.lastIndexOf('.');
      if (dot > 0) {
        return `${name.slice(0, dot)}_tracked${name.slice(dot)}`;
      }
      return `${name}_tracked`;
    },
    /** 轨迹结果直链（后端要求带扩展名，如 F-16(0)_tracked.mp4） */
    buildTrackArtifactUrl(trackedFilename) {
      const name = String(trackedFilename || '').trim();
      if (!name) return '';
      return `${TRACK_ARTIFACT_API_URL}?filename=${encodeURIComponent(name)}`;
    },
    /** 与 startDetection「目标与轨迹识别」相同的文件名与 query 参数 */
    buildTrackRecognitionContext(selectedItem) {
      const item = selectedItem || this.selectedVideo;
      if (!item || !item.name) return null;
      const sourceFilename = String(item.name).trim();
      const trackedFilename = this.buildTrackedArtifactFilename(sourceFilename);
      const trackedFilenameNoExt = this.stripFileExtension(trackedFilename);
      const requestParams = { filename: trackedFilename };
      return {
        sourceFilename,
        trackedFilename,
        trackedFilenameNoExt,
        requestParams,
        selectedPath: item.path,
        selectedMediaType: this.selectedMediaType,
        artifactType: this.selectedMediaType === 'video' ? 'video' : 'image',
        trackMode: 'single',
        label: 'Target'
      };
    },
    /** POST /analyze-video-behavior：传左侧选中视频名加 _tracked 后的文件名（如 MultiUAV-002_tracked.mp4） */
    buildAnalyzeVideoBehaviorBody(trackCtx) {
      const ctx = trackCtx || this.trackRecognitionContext || this.buildTrackRecognitionContext();
      const trackedFilename = ctx && ctx.trackedFilename;
      if (!trackedFilename) return null;
      return { filename: trackedFilename };
    },
    isBlobLikelyErrorResponse(blob, contentType) {
      const ct = String(contentType || (blob && blob.type) || '').toLowerCase();
      if (ct.includes('application/json') || ct.includes('text/html') || ct.includes('text/plain')) {
        return true;
      }
      if (blob && typeof blob.size === 'number' && blob.size < 512 && !ct.includes('video') && !ct.includes('image')) {
        return true;
      }
      return false;
    },
    /** 轨迹媒体 Blob：与左侧 load-video 一致包装 MIME */
    buildProcessedMediaBlob(payload, contentType, mediaType) {
      const ct = String(contentType || (payload && payload.type) || '').toLowerCase();
      const blobType = ct.includes('video') ? 'video/mp4'
        : (ct.includes('image') ? (ct.split(';')[0] || 'image/jpeg') : (mediaType === 'video' ? 'video/mp4' : 'image/jpeg'));
      return payload instanceof Blob ? payload : new Blob([payload], { type: blobType });
    },
    /** 扫描 MP4 容器内编码标识（moov 常在文件尾部，需读头+尾） */
    async inspectVideoBlobCodec(blob) {
      if (!blob || !blob.size) return 'unknown';
      const readSlice = async (start, length) => {
        const slice = blob.slice(start, Math.min(start + length, blob.size));
        const buf = new Uint8Array(await slice.arrayBuffer());
        let s = '';
        for (let i = 0; i < buf.length; i += 1) {
          s += String.fromCharCode(buf[i]);
        }
        return s;
      };
      const head = await readSlice(0, 4 * 1024 * 1024);
      const tailStart = Math.max(0, blob.size - 512 * 1024);
      const tail = blob.size > 512 * 1024 ? await readSlice(tailStart, 512 * 1024) : '';
      const s = head + tail;
      if (s.includes('avc1') || s.includes('avc3')) return 'h264';
      if (s.includes('mp4v')) return 'mp4v';
      if (s.includes('hvc1') || s.includes('hev1')) return 'hevc';
      return 'unknown';
    },
    buildDraneStaticVideoUrl(filename) {
      return `${DRANE_VIDEO_STATIC_BASE}/${encodeURIComponent(String(filename || '').trim())}`;
    },
    /** 拼装 load-video 请求信息，便于控制台观察传参 */
    buildLoadVideoRequestInfo(filenameWithExt) {
      const filename = String(filenameWithExt || '').trim();
      const params = { filename };
      const baseUrl = `${SOURCE_API_BASE_URL}/load-video`;
      const query = new URLSearchParams(params).toString();
      return {
        baseUrl,
        params,
        fullUrl: query ? `${baseUrl}?${query}` : baseUrl
      };
    },
    logLoadVideoRequest(phase, extra) {
      console.log(`[DecisionMakingV2][load-video] ${phase}`, extra || {});
    },
    applyOriginalVideoStaticFallback(filename, staticUrl, reason, loadVideoReq) {
      this.logLoadVideoRequest('回退静态', {
        reason: reason && (reason.message || String(reason)),
        loadVideo: loadVideoReq || this.buildLoadVideoRequestInfo(filename),
        staticUrl,
        filename
      });
      this.revokeOriginalMediaBlob();
      this.originalVideoURL = staticUrl;
      this.originalVideoUsedStatic = true;
      localStorage.setItem('originalVideoURL', staticUrl);
      this.resultMessage = null;
    },
    applyProcessedVideoCodecPolicy(mediaBlob, trackedFilename) {
      this.processedVideoCodecWarning = null;
      this.processedVideoDownloadName = trackedFilename || 'tracked.mp4';
      if (!mediaBlob || this.selectedMediaType !== 'video') return 'ok';
      return this.inspectVideoBlobCodec(mediaBlob).then((codec) => {
        if (codec === 'mp4v') {
          this.processedVideoCodecWarning =
            '轨迹视频为 OpenCV 常用的 mp4v (MPEG-4 Part 2) 编码，当前浏览器无法在页面内播放。请在后端导出时改用 H.264：ffmpeg -i in.mp4 -c:v libx264 -pix_fmt yuv420p -c:a aac out.mp4';
          this.resultMessage = `轨迹文件 ${trackedFilename} 已加载，但编码为 mp4v，仅支持下载预览。`;
          return 'mp4v';
        }
        if (codec === 'hevc') {
          this.processedVideoCodecWarning =
            '轨迹视频为 HEVC (H.265) 编码，部分浏览器无法播放。建议后端改为 H.264 (libx264) 导出。';
          this.resultMessage = `轨迹文件 ${trackedFilename} 已加载（HEVC），部分环境无法内嵌播放。`;
          return 'hevc';
        }
        return codec;
      });
    },
    revokeProcessedMediaBlob() {
      if (this.processedVideoURL && String(this.processedVideoURL).startsWith('blob:')) {
        try {
          URL.revokeObjectURL(this.processedVideoURL);
        } catch (e) {
          // ignore
        }
      }
    },
    /** 选中媒体后拉取作战指令（与 DecisionMaking.vue 一致） */
    async fetchMachineRefineCommand(nameNoExt, selectedPath, mediaItem = null) {
      const cleanName = String(nameNoExt || '').trim();
      if (!cleanName) return;
      const logTag = '[DecisionMakingV2][machine-refine-command]';
      const requestInfo = {
        url: REFINE_COMMAND_API_URL,
        params: { name: cleanName },
        selectedPath,
        selectedMediaType: this.selectedMediaType,
        selectedFileName: this.selectedVideo && this.selectedVideo.name
      };

      this.clearOrdersRefineDisplayTimer();
      this.isOrdersLoading = true;
      this.ordersDisplayReady = false;
      this.ordersCommand = '';
      const requestStartedAt = Date.now();

      let command = '';
      let negotiation = '';
      let fetchFailed = false;

      try {
        console.log(`${logTag} 发起请求`, requestInfo);
        const response = await axios.get(REFINE_COMMAND_API_URL, {
          params: { name: cleanName }
        });
        const raw = response && response.data;
        const payload = raw && typeof raw === 'object' && raw.data ? raw.data : raw;
        command = payload && payload.command !== undefined ? String(payload.command).trim() : '';
        negotiation = payload && payload.negotiation !== undefined ? String(payload.negotiation).trim() : '';

        console.log(`${logTag} 原始响应`, {
          status: response && response.status,
          headers: response && response.headers,
          data: raw
        });
        console.log(`${logTag} 解析结果`, {
          payload,
          command,
          negotiation,
          commandLength: command.length,
          negotiationLength: negotiation.length
        });
      } catch (error) {
        fetchFailed = true;
        const errRes = error && error.response;
        console.error(`${logTag} 请求失败`, {
          request: requestInfo,
          message: error && error.message,
          status: errRes && errRes.status,
          contentType: errRes && errRes.headers && (errRes.headers['content-type'] || errRes.headers['Content-Type']),
          responseData: errRes && errRes.data
        });
      }

      const elapsed = Date.now() - requestStartedAt;
      const delayMs = Math.max(0, ORDERS_DISPLAY_DELAY_MS - elapsed);

      this.ordersRefineDisplayTimer = setTimeout(() => {
        this.ordersRefineDisplayTimer = null;

        if (selectedPath && (!this.selectedVideo || this.selectedVideo.path !== selectedPath)) {
          console.log(`${logTag} 延迟展示取消：选中项已变更`, {
            requestSelectedPath: selectedPath,
            currentSelectedPath: this.selectedVideo && this.selectedVideo.path
          });
          this.isOrdersLoading = false;
          return;
        }

        this.isOrdersLoading = false;

        if (fetchFailed || !command) {
          if (!fetchFailed && !command && !negotiation) {
            console.warn(`${logTag} 返回数据缺少 command`, { command, negotiation });
          }
          this.ordersCommand = '';
          this.ordersNegotiation = negotiation;
        } else {
          this.ordersCommand = command;
          this.ordersNegotiation = negotiation;
        }

        localStorage.setItem('ordersCommand', this.ordersCommand);
        localStorage.setItem('ordersNegotiation', this.ordersNegotiation);
        this.ordersDisplayReady = true;
        console.log(`${logTag} 作战指令已更新`, {
          request: requestInfo,
          delayMs: ORDERS_DISPLAY_DELAY_MS,
          ordersCommand: this.ordersCommand,
          ordersNegotiation: this.ordersNegotiation,
          commandPreview: command.slice(0, 120),
          ordersDisplayReady: true
        });
        if (mediaItem && selectedPath) {
          this.scheduleOriginalMediaDisplay(mediaItem, selectedPath);
        }
      }, delayMs);

      console.log(`${logTag} 已获取数据，等待延迟展示`, {
        request: requestInfo,
        delayMs,
        elapsedSinceRequestStart: elapsed
      });
    },
    /** 进入页面：不自动选中任何图片/视频，须用户点击后才选择 */
    resetEnterPageMediaSelection() {
      this.clearOrdersRefineDisplayTimer();
      this.clearTrackDisplayTimer();
      this.resetOriginalMediaDisplay();
      this.selectedVideo = null;
      this.isOrdersLoading = false;
      this.ordersDisplayReady = false;
      this.ordersCommand = '';
      this.ordersNegotiation = '';
      this.revokeProcessedMediaBlob();
      this.processedVideoURL = null;
      this.processedVideoCodecWarning = null;
      this.hasStartedDetection = false;
      this.trackResultDisplayReady = false;
      this.resetBiasResultPanel();
    },
    async loadInitialData() {
      this.restoreAllStateFromCache();
      // 进入页不恢复上次选中的图片/视频及预览，须用户点击列表项；偏差结果一并重置
      this.resetEnterPageMediaSelection();
      // 进入页默认展示视频列表（用户仍可手动切换到图片）
      this.selectedMediaType = 'video';
      await this.fetchVideoListFromAPI();
    },
    // 需求3：检查计时器状态
    checkBiasTimerState() {
      // 优先检查是否已经完成
      if (localStorage.getItem('biasDetectionCompleted') === 'true') {
        console.log('检测到偏差检测已完成，直接恢复结果');
        this.hasStartedBiasDetection = true;
        this.showAccuracy = true;
        this.showBiasDetails = true;
        this.isBiasDetecting = false;
        const savedEntries = localStorage.getItem('biasDetailEntries');
        if (savedEntries) {
          this.biasDetailEntries = JSON.parse(savedEntries);
        }
        this.biasDisplayTexts = this.biasDetailEntries.map(e => e.text);
        this.applyDeviationDetectionAccuracyFromCache();
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
          this.showAccuracy = false;
          this.deviationDetectionAccuracy = '计算中...';
          this.showBiasDetails = true;
          this.biasDisplayTexts = this.biasDetailEntries.map(e => e.text);
          this.startAccuracyTimer(remaining);
        } else {
          console.log('偏差检测计时已过期，直接显示结果');
          this.hasStartedBiasDetection = true;
          this.showBiasDetails = true;
          this.biasDisplayTexts = this.biasDetailEntries.map(e => e.text);
          this.handleBiasAccuracyTimerComplete();
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
        overflow: hidden !important;
      }
      .right-panels-container {
        height: 100% !important;
        min-height: 0 !important;
        flex: 1 1 0 !important;
      }
      .panel-right-top {
        flex: 1 1 0 !important;
        min-height: 0 !important;
        height: auto !important;
        max-height: none !important;
        overflow: hidden !important;
      }
      .panel-right-top .panel-content {
        min-height: 0 !important;
        overflow: hidden !important;
      }
      .panel-right-top .description-box {
        min-height: 0 !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
      }
      .panel-right-bottom.dm-decision-panel {
        flex-grow: 0 !important;
        flex-shrink: 0 !important;
        height: 220px !important;
        min-height: 220px !important;
        max-height: 220px !important;
      }
      .panel-right-accuracy {
        flex-grow: 0 !important;
        flex-shrink: 0 !important;
        height: 100px !important;
        min-height: 100px !important;
      }
      .action-buttons-right {
        flex-shrink: 0 !important;
        margin-top: 0 !important;
        padding-top: 0 !important;
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

      // 尝试从缓存恢复作战指令
      if (data.instruction) {
        this.ordersCommand = data.instruction;
      } else if (this.selectedVideo && this.selectedVideo.name) {
        await this.fetchMachineRefineCommand(
          this.stripFileExtension(this.selectedVideo.name),
          this.selectedVideo.path
        );
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
      window.location.href = '/combined-diagnosis';
    },
    handleResize() {
      this.fullWidth = window.innerWidth;
      this.fullHeight = window.innerHeight;
    },
    getVideoElementErrorMessage(videoEl) {
      if (!videoEl || !videoEl.error) return '';
      const codes = {
        1: 'MEDIA_ERR_ABORTED',
        2: 'MEDIA_ERR_NETWORK',
        3: 'MEDIA_ERR_DECODE',
        4: 'MEDIA_ERR_SRC_NOT_SUPPORTED'
      };
      return codes[videoEl.error.code] || `code=${videoEl.error.code}`;
    },
    handleOriginalVideoError(e) {
      const videoEl = e && e.target;
      const errCode = this.getVideoElementErrorMessage(videoEl);
      const name = this.selectedVideo && this.selectedVideo.name;
      if (!name) return;
      if (this.originalVideoUsedStatic) {
        console.error('认知传播视频（静态）仍无法播放:', errCode, e);
        this.resultMessage = `认知传播视频无法播放（${errCode}）。`;
        return;
      }
      const loadVideoReq = this.buildLoadVideoRequestInfo(name);
      this.logLoadVideoRequest('video 元素播放失败，回退静态', {
        ...loadVideoReq,
        mediaError: errCode,
        previousSrc: videoEl && videoEl.src
      });
      this.applyOriginalVideoStaticFallback(name, this.buildDraneStaticVideoUrl(name), errCode, loadVideoReq);
    },
    handleProcessedVideoError(e) {
      const videoEl = e && e.target;
      const tracked = this.fullResult && this.fullResult.key_frame_detection && this.fullResult.key_frame_detection.tracked_artifact;
      console.error('多模态目标检测结果视频加载错误:', {
        mediaError: this.getVideoElementErrorMessage(videoEl),
        src: videoEl && videoEl.src,
        trackedArtifact: tracked,
        event: e
      });
      const errHint = this.getVideoElementErrorMessage(videoEl);
      this.resultMessage = tracked
        ? `检测结果视频无法播放（${tracked}，${errHint}）。请确认轨迹 MP4 文件存在且编码为 H.264/AAC。`
        : `检测结果视频无法播放（${errHint}），请重新点击「目标与轨迹识别」。`;
      this.hasStartedDetection = false;
      this.trackResultDisplayReady = false;
    },
    /** 多模态检测结果区媒体已可展示后，才允许「决策认知偏差检测」 */
    handleProcessedTrackMediaReady() {
      if (!this.processedVideoURL || this.isLoading) return;
      this.trackResultDisplayReady = true;
    },
    handleImageError(e) {
      console.error("图片加载错误:", e);
      this.resultMessage = "图片加载失败，请检查服务器日志和网络。";
      this.originalVideoURL = null;
    },
    handleFormulaImageError(e) {
      console.warn("公式图片加载失败:", e);
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
      this.clearTrackDisplayTimer();
      this.revokeProcessedMediaBlob();
      this.processedVideoURL = null;
      this.processedVideoCodecWarning = null;
      this.processedVideoDownloadName = '';
      this.trackRecognitionContext = null;
      this.deviationDetectionAccuracy = 'N/A';
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
      this.trackResultDisplayReady = false;

      // 清理计时器
      this.clearTypingIntervals();

      if (!preserveBiasTimer) {
        this.resetBiasResultPanel();
      }
    },
    /** 偏差检测结果区回到「请先进行目标与轨迹识别」 */
    resetBiasResultPanel() {
      this.clearBiasTimeouts();
      this.behaviorAnalysisView = null;
      this.selectedTacticalIntentIndex = null;
      this.selectedTacticalDecisionIndex = null;
      this.commanderIntentAnalysis = '';
      this.commanderIntentAnalysisError = '';
      this.isCommanderIntentLoading = false;
      this.biasDetailEntries = [];
      this.biasDisplayTexts = [];
      this.showBiasDetails = false;
      this.showAccuracy = false;
      this.isBiasDetecting = false;
      this.isBiasTyping = false;
      this.hasStartedBiasDetection = false;
      this.deviationDetectionAccuracy = 'N/A';
      localStorage.removeItem('biasStartTime');
      localStorage.removeItem('biasDetectionStarted');
      localStorage.removeItem('biasDetectionCompleted');
      localStorage.removeItem('biasDetailEntries');
      localStorage.removeItem('behaviorAnalysisView');
      localStorage.removeItem('showBiasDetails');
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
    /** 仅清除轨迹识别相关缓存，不影响右侧偏差检测结果 */
    clearTargetDetectionCache() {
      localStorage.removeItem('trackRecognitionContext');
      this.trackRecognitionContext = null;
    },
    // 清除所有缓存
    clearAllCache() {
      localStorage.removeItem('module1Res');
      localStorage.removeItem('biasStartTime');
      localStorage.removeItem('biasDetectionStarted');
      localStorage.removeItem('biasDetectionCompleted');
      localStorage.removeItem('biasDetailEntries');
      localStorage.removeItem('trackRecognitionContext');
      this.trackRecognitionContext = null;
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
    parseSummaryText(summaryText) {
      if (!summaryText) {
        return {
          behaviorInfo: '',
          samePoints: '',
          differentPoints: ''
        };
      }
      try {
        let summary = summaryText;
        if (typeof summaryText === 'string' && summaryText.trim().startsWith('{')) {
          const parsed = JSON.parse(summaryText);
          summary = parsed.summary || summaryText;
        }
        const behaviorMatch = summary.match(/行为信息[：:]?\s*([^]*?)(?=相同点[：:]|共识|分歧|$)/);
        const samePointsMatch = summary.match(/(?:相同点|共识信息)[：:]?\s*([^]*?)(?=不同点|分歧|$)/);
        const differentPointsMatch = summary.match(/(?:不同点|分歧信息)[：:]?\s*([^]*?)$/);
        return {
          behaviorInfo: behaviorMatch ? behaviorMatch[1].trim() : '',
          samePoints: samePointsMatch ? samePointsMatch[1].trim() : '',
          differentPoints: differentPointsMatch ? differentPointsMatch[1].trim() : ''
        };
      } catch (e) {
        return { behaviorInfo: String(summaryText), samePoints: '', differentPoints: '' };
      }
    },
    pickBehaviorField(data, keys) {
      if (!data || typeof data !== 'object') return '';
      for (let i = 0; i < keys.length; i += 1) {
        const v = data[keys[i]];
        if (v != null && String(v).trim() !== '') return String(v).trim();
      }
      return '';
    },
    normalizeIntentConfidence(confidence) {
      let v = confidence;
      if (v == null || v === '') return 0;
      if (typeof v === 'string') v = parseFloat(String(v).replace(/%$/, ''));
      if (isNaN(v)) return 0;
      if (v <= 1) v = v * 100;
      return Math.min(100, Math.max(0, v));
    },
    formatIntentConfidenceText(confidence) {
      return `${Math.round(this.normalizeIntentConfidence(confidence))}%`;
    },
    formatIntentConfidenceWidth(confidence) {
      return `${this.normalizeIntentConfidence(confidence)}%`;
    },
    findHighestConfidenceIndex(items) {
      if (!Array.isArray(items) || !items.length) return -1;
      let bestIdx = 0;
      let bestVal = -1;
      items.forEach((item, idx) => {
        const value = this.normalizeIntentConfidence(item && item.confidence);
        if (value > bestVal) {
          bestVal = value;
          bestIdx = idx;
        }
      });
      return bestIdx;
    },
    findTopConfidenceIndices(items, count = 2) {
      if (!Array.isArray(items) || !items.length) return [];
      return items
        .map((item, idx) => ({
          idx,
          confidence: this.normalizeIntentConfidence(item && item.confidence)
        }))
        .sort((a, b) => b.confidence - a.confidence || a.idx - b.idx)
        .slice(0, count)
        .map(entry => entry.idx);
    },
    /** 战术意图：未点击不高亮；点击后置信度前两名绿色，其余红色 */
    getTacticalIntentBiasClass(items, selectedIndex, idx) {
      if (selectedIndex === null) {
        return {};
      }
      if (selectedIndex !== idx) {
        return { 'ba-intent-btn--disabled': true };
      }
      const topIndices = this.findTopConfidenceIndices(items, 2);
      const isConsistent = topIndices.includes(selectedIndex);
      return {
        'ba-intent-btn--selected': true,
        'ba-intent-btn--bias-consistent': isConsistent,
        'ba-intent-btn--bias-deviation': !isConsistent
      };
    },
    /** 决策选择：未点击不高亮；点击后最高置信度绿色，其余红色 */
    getTacticalDecisionBiasClass(items, selectedIndex, idx) {
      if (selectedIndex === null) {
        return {};
      }
      if (selectedIndex !== idx) {
        return { 'ba-intent-btn--disabled': true };
      }
      const machineBestIndex = this.findHighestConfidenceIndex(items);
      const isConsistent = machineBestIndex >= 0 && selectedIndex === machineBestIndex;
      return {
        'ba-intent-btn--selected': true,
        'ba-intent-btn--bias-consistent': isConsistent,
        'ba-intent-btn--bias-deviation': !isConsistent
      };
    },
    resetCommanderIntentAnalysis() {
      this.commanderIntentAnalysis = '';
      this.commanderIntentAnalysisError = '';
      this.isCommanderIntentLoading = false;
    },
    parseBehaviorReasonResponse(payload) {
      if (payload == null) return '';
      if (typeof payload === 'string') return payload.trim();
      const envelope = payload && typeof payload === 'object' ? payload : {};
      const root =
        envelope.status === 'success' && envelope.data != null
          ? envelope.data
          : envelope.data != null
            ? envelope.data
            : envelope;
      if (typeof root === 'string') return root.trim();
      if (!root || typeof root !== 'object') return '';
      const text = this.pickBehaviorField(root, [
        'reason', 'behavior_reason', 'analysis', 'message', 'content', 'description', 'result'
      ]);
      if (text) return text;
      return JSON.stringify(root, null, 2);
    },
    async selectTacticalIntent(index) {
      if (this.selectedTacticalIntentIndex !== null) return;
      if (
        !this.behaviorAnalysisView ||
        !Array.isArray(this.behaviorAnalysisView.tacticalIntentRanking)
      ) {
        return;
      }
      if (index < 0 || index >= this.behaviorAnalysisView.tacticalIntentRanking.length) {
        return;
      }
      const item = this.behaviorAnalysisView.tacticalIntentRanking[index];
      const intentName = item && item.intent ? String(item.intent).trim() : '';
      if (!intentName) return;

      this.selectedTacticalIntentIndex = index;
      this.selectedTacticalDecisionIndex = null;
      this.resetDeviationAccuracyDisplay();
      this.resetCommanderIntentAnalysis();
      this.isCommanderIntentLoading = true;

      const logTag = '[DecisionMakingV2][behavior-reason]';

      try {
        console.log(`${logTag} GET`, { url: BEHAVIOR_REASON_API_URL, params: { name: intentName } });
        const response = await axios.get(BEHAVIOR_REASON_API_URL, {
          params: { name: intentName },
          timeout: 600000
        });
        const data = response.data;
        console.log(`${logTag} 响应`, data);

        if (response.status >= 400) {
          throw new Error((data && data.detail) || `HTTP ${response.status}`);
        }
        if (data && data.status && data.status !== 'success') {
          const errMsg = (data && data.message) || (data && data.detail) || `接口状态: ${data.status}`;
          throw new Error(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
        }

        this.commanderIntentAnalysis = this.parseBehaviorReasonResponse(data);
        if (!this.commanderIntentAnalysis) {
          this.commanderIntentAnalysisError = '未获取到指挥员意图分析内容';
        }
      } catch (error) {
        console.error(`${logTag} 请求失败`, error);
        this.commanderIntentAnalysisError = this.extractAnalyzeVideoBehaviorError(error);
      } finally {
        this.isCommanderIntentLoading = false;
      }
    },
    parseTacticalDecisionRanking(source) {
      if (!source || typeof source !== 'object') return [];
      const raw =
        source.tactical_decision_ranking != null
          ? source.tactical_decision_ranking
          : source.tacticalDecisionRanking != null
            ? source.tacticalDecisionRanking
            : source.tactical_dexicion_ranking;
      if (!Array.isArray(raw)) return [];
      return raw
        .slice(0, 5)
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const decisionRaw =
            item.decision != null
              ? item.decision
              : item.option != null
                ? item.option
                : item.name != null
                  ? item.name
                  : item.choice != null
                    ? item.choice
                    : item.intent;
          const decision = decisionRaw != null ? String(decisionRaw).trim() : '';
          if (!decision) return null;
          return {
            decision,
            confidence: this.normalizeIntentConfidence(item.confidence)
          };
        })
        .filter(Boolean);
    },
    parseTacticalIntentRanking(root) {
      if (!root || typeof root !== 'object') return [];
      const raw =
        root.tactical_intent_ranking != null
          ? root.tactical_intent_ranking
          : root.tacticalIntentRanking;
      if (!Array.isArray(raw)) return [];
      return raw
        .slice(0, 5)
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const intent = item.intent != null ? String(item.intent).trim() : '';
          if (!intent) return null;
          const tacticalDecisionRanking = this.parseTacticalDecisionRanking(item);
          return {
            intent,
            confidence: this.normalizeIntentConfidence(item.confidence),
            tacticalDecisionRanking
          };
        })
        .filter(Boolean);
    },
    selectTacticalDecision(index) {
      if (this.selectedTacticalDecisionIndex !== null) return;
      if (!this.tacticalDecisionRankingDisplay.length) return;
      if (index < 0 || index >= this.tacticalDecisionRankingDisplay.length) return;
      const item = this.tacticalDecisionRankingDisplay[index];
      const decisionName = item && item.decision ? String(item.decision).trim() : '';
      if (!decisionName) return;
      this.selectedTacticalDecisionIndex = index;
      this.startDeviationAccuracyCountdown();
    },
    resetDeviationAccuracyDisplay() {
      if (this.accuracyTimeout) {
        clearTimeout(this.accuracyTimeout);
        this.accuracyTimeout = null;
      }
      this.showAccuracy = false;
      this.deviationDetectionAccuracy = 'N/A';
      localStorage.removeItem('biasStartTime');
      localStorage.removeItem('biasDetectionCompleted');
    },
    startDeviationAccuracyCountdown() {
      this.clearBiasTimeouts();
      this.showAccuracy = false;
      this.deviationDetectionAccuracy = '计算中...';
      localStorage.setItem('biasStartTime', Date.now().toString());
      localStorage.setItem('biasDetectionStarted', 'true');
      localStorage.removeItem('biasDetectionCompleted');
      this.startAccuracyTimer(BIAS_DETECTION_DELAY);
    },
    formatBehaviorMetricValue(key, value) {
      if (value == null || value === '') return 'N/A';
      if (typeof value === 'number') {
        if (key.includes('accuracy') || key.includes('rate') || key.includes('similarity') || (value >= 0 && value <= 1)) {
          return (value * 100).toFixed(2) + '%';
        }
        return String(value);
      }
      return String(value);
    },
    /** 解析 analyze-video-behavior 新结构 { status, data: { tactical_intent_ranking, auxiliary_message, ... } } */
    parseBehaviorAnalysisResponse(payload) {
      const envelope = payload && typeof payload === 'object' ? payload : {};
      const root =
        envelope.status === 'success' && envelope.data != null
          ? envelope.data
          : envelope.data != null
            ? envelope.data
            : envelope;
      if (!root || typeof root !== 'object') return null;

      const tacticalIntentRanking = this.parseTacticalIntentRanking(root);
      const tacticalDecisionRanking = this.parseTacticalDecisionRanking(root);
      const auxiliaryMessage = this.pickBehaviorField(root, ['auxiliary_message', 'auxiliaryMessage']);
      if (!tacticalIntentRanking.length && !auxiliaryMessage && !tacticalDecisionRanking.length) return null;

      return {
        tacticalIntentRanking,
        tacticalDecisionRanking,
        auxiliaryMessage
      };
    },
    buildBehaviorAnalysisView(payload) {
      const root = payload && payload.data != null ? payload.data : payload;
      const data = root && typeof root === 'object' ? root : {};
      const sections = [];
      const metrics = [];
      const pushSection = (key, title, icon, content) => {
        const text = content != null ? String(content).trim() : '';
        if (!text) return;
        sections.push({ key, title, icon, content: text });
      };

      const summaryText = this.pickBehaviorField(data, ['summary', 'analysis_summary', 'behavior_summary']);
      if (summaryText) {
        const parsed = this.parseSummaryText(summaryText);
        pushSection('behavior', '行为信息', '◎', parsed.behaviorInfo || summaryText);
        pushSection('consensus', '共识信息', '≈', parsed.samePoints);
        pushSection('divergence', '分歧信息', '≠', parsed.differentPoints);
      }

      pushSection('behavior', '行为信息', '◎', this.pickBehaviorField(data, [
        'behavior_info', 'behavior_analysis', 'predicted_behavior', 'behavior_description',
        'primary_behavior', 'behavior'
      ]));
      pushSection('consensus', '共识信息', '≈', this.pickBehaviorField(data, [
        'consensus', 'same_points', 'consensus_info', 'agreement_points'
      ]));
      pushSection('divergence', '分歧信息', '≠', this.pickBehaviorField(data, [
        'divergence', 'different_points', 'disagreement_points', 'difference_points'
      ]));

      const desc = data.description;
      if (desc && typeof desc === 'object') {
        pushSection('predicted', '模型描述', '◇', desc.predicted);
        pushSection('ground_truth', '参考描述', '◇', desc.ground_truth);
        if (desc.similarity != null) {
          metrics.push({
            key: 'desc_similarity',
            label: '描述相似度',
            value: this.formatBehaviorMetricValue('similarity', desc.similarity)
          });
        }
      }

      const metricDefs = [
        ['comprehensive_accuracy', '综合准确率'],
        ['comprehensiveaccuracy', '综合准确率'],
        ['average_comprehensive_accuracy', '平均综合准确率'],
        ['danger_level_match_rate', '危险等级匹配率'],
        ['dangerlevelmatchrate', '危险等级匹配率'],
        ['performance_cosine_similarity', '性能余弦相似度'],
        ['coredimensionratingaccuracy', '核心维度准确率'],
        ['current_accuracy', '当前准确率'],
        ['deviation_value', '偏差值']
      ];
      metricDefs.forEach(([key, label]) => {
        if (data[key] != null && data[key] !== '') {
          metrics.push({ key, label, value: this.formatBehaviorMetricValue(key, data[key]) });
        }
      });

      if (data.model_analysis_danger_level != null) {
        metrics.push({
          key: 'model_danger',
          label: '模型危险等级',
          value: String(data.model_analysis_danger_level)
        });
      }
      if (data.local_txt_danger_level != null) {
        metrics.push({
          key: 'local_danger',
          label: '本地危险等级',
          value: String(data.local_txt_danger_level)
        });
      }

      const seen = new Set();
      const dedupedSections = sections.filter((s) => {
        if (seen.has(s.key)) return false;
        seen.add(s.key);
        return true;
      });
      return { sections: dedupedSections, metrics, raw: data };
    },
    pickAccuracyFromBehaviorData(payload) {
      const data = payload && payload.data != null ? payload.data : payload;
      if (!data || typeof data !== 'object') return null;
      const keys = [
        'comprehensive_accuracy', 'comprehensiveaccuracy', 'current_accuracy',
        'average_comprehensive_accuracy', 'coredimensionratingaccuracy'
      ];
      for (let i = 0; i < keys.length; i += 1) {
        const v = data[keys[i]];
        if (typeof v === 'number') return v;
      }
      if (data.overall_accuracy && typeof data.overall_accuracy.accuracy === 'number') {
        return data.overall_accuracy.accuracy;
      }
      return null;
    },
    extractAnalyzeVideoBehaviorError(error) {
      const res = error && error.response;
      const data = res && res.data;
      if (typeof data === 'string') return data;
      if (data && typeof data.detail === 'string') return data.detail;
      if (data && data.detail) return JSON.stringify(data.detail);
      if (data && data.error) return String(data.error);
      return (error && error.message) || '未知错误';
    },
    buildBiasDetailEntriesFromAnalyzeResponse(payload) {
      const structured = this.parseBehaviorAnalysisResponse(payload);
      if (structured) {
        this.behaviorAnalysisView = structured;
        this.selectedTacticalIntentIndex = null;
        this.selectedTacticalDecisionIndex = null;
        this.resetCommanderIntentAnalysis();
        return [];
      }
      this.behaviorAnalysisView = null;
      this.selectedTacticalIntentIndex = null;
      this.selectedTacticalDecisionIndex = null;
      this.resetCommanderIntentAnalysis();
      const view = this.buildBehaviorAnalysisView(payload);
      const entries = [];
      view.sections.forEach((section) => {
        entries.push({
          label: section.title,
          text: `${section.title}：${section.content}`,
          highlight: section.key === 'divergence' || section.key === 'different',
          isConsistent: section.key === 'consensus'
        });
      });
      view.metrics.forEach((metric) => {
        entries.push({
          label: metric.label,
          text: `${metric.label}：${metric.value}`,
          highlight: metric.key.includes('accuracy')
        });
      });
      if (!entries.length) {
        const raw = payload && payload.data != null ? payload.data : payload;
        entries.push({
          label: '分析结果',
          text: `分析结果：${typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2)}`,
          highlight: false
        });
      }
      return entries;
    },
    async handleStartBiasDetection() {
      if (!this.canStartBiasDetection) return;
      if (!this.selectedVideo || !this.selectedVideo.name) {
        alert('请先完成目标与轨迹识别');
        return;
      }

      const trackCtx = this.trackRecognitionContext || this.buildTrackRecognitionContext();
      const requestBody = this.buildAnalyzeVideoBehaviorBody(trackCtx);
      if (!trackCtx || !requestBody) {
        alert('无法构建轨迹识别参数，请重新选择媒体并执行目标与轨迹识别');
        return;
      }

      this.isBiasDetecting = true;
      this.hasStartedBiasDetection = true;
      this.clearBiasTimeouts();
      this.showBiasDetails = false;
      this.showAccuracy = false;
      this.resetDeviationAccuracyDisplay();
      this.resetBiasTyping();

      const logTag = '[DecisionMakingV2][analyze-video-behavior]';
      const requestStartedAt = Date.now();
      const loadTrackArtifactParams = trackCtx.requestParams;

      console.group(`${logTag} 点击「决策认知偏差检测」`);
      console.log('选中媒体 selectedVideo:', this.selectedVideo);
      console.log('轨迹识别 load-track-artifact 曾用 params:', loadTrackArtifactParams);
      console.log('analyze-video-behavior POST 传参 trackedFilename:', requestBody);
      console.log('传参 JSON:', JSON.stringify(requestBody, null, 2));
      console.log('接口 URL:', ANALYZE_VIDEO_BEHAVIOR_API_URL);
      console.log('trackedFilename:', trackCtx.trackedFilename);
      console.log('上下文来源:', this.trackRecognitionContext ? '目标与轨迹识别缓存' : '现场重建');
      console.groupEnd();

      try {
        console.log(`${logTag} axios.post 发起`, {
          url: ANALYZE_VIDEO_BEHAVIOR_API_URL,
          body: requestBody,
          timeout: 600000
        });

        const response = await axios.post(ANALYZE_VIDEO_BEHAVIOR_API_URL, requestBody, {
          timeout: 600000
        });
        const data = response.data;
        const elapsed = Date.now() - requestStartedAt;

        console.group(`${logTag} 接口返回`);
        console.log('HTTP status:', response.status);
        console.log('耗时 ms:', elapsed);
        console.log('响应头 content-type:', response.headers && (response.headers['content-type'] || response.headers['Content-Type']));
        console.log('原始响应 data:', data);
        console.log('原始响应 JSON:', JSON.stringify(data, null, 2));
        console.groupEnd();

        if (response.status >= 400) {
          throw new Error((data && data.detail) || `HTTP ${response.status}`);
        }
        if (data && data.status && data.status !== 'success') {
          const errMsg = (data && data.message) || (data && data.detail) || `接口状态: ${data.status}`;
          console.error(`${logTag} 业务错误`, errMsg);
          throw new Error(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
        }
        if (data && data.detail && typeof data.detail === 'string' && !data.data) {
          console.error(`${logTag} 业务错误 detail:`, data.detail);
          throw new Error(data.detail);
        }

        this.fullResult.video_behavior = data;
        this.behaviorAnalysisView = null;
        this.biasDetailEntries = this.buildBiasDetailEntriesFromAnalyzeResponse(data);

        console.group(`${logTag} 偏差检测结果整理`);
        console.log('biasDetailEntries:', this.biasDetailEntries);
        console.log('biasDetailEntries JSON:', JSON.stringify(this.biasDetailEntries, null, 2));
        console.log('fullResult.video_behavior 已写入');
        console.groupEnd();

        const accuracyData = await this.fetchStatisticsAccuracy();
        const averageComprehensiveAccuracy = accuracyData && accuracyData.average_comprehensive_accuracy;

        localStorage.setItem('biasDetailEntries', JSON.stringify(this.biasDetailEntries));
        if (this.behaviorAnalysisView) {
          localStorage.setItem('behaviorAnalysisView', JSON.stringify(this.behaviorAnalysisView));
        } else {
          localStorage.removeItem('behaviorAnalysisView');
        }

        try {
          localStorage.setItem('module1Res', JSON.stringify({
            ...data,
            video_behavior: data,
            track_request: trackCtx.requestParams,
            originalVideoPath: this.originalVideoURL,
            processedVideoPath: this.processedVideoURL,
            instruction: this.ordersText,
            task_id: this.taskId,
            selectedMediaType: this.selectedMediaType,
            source_filename: trackCtx.sourceFilename,
            tracked_filename: trackCtx.trackedFilename,
            average_comprehensive_accuracy: averageComprehensiveAccuracy
          }));
        } catch (e) {
          console.error(`${logTag} 保存 module1Res 失败`, e);
        }

        this.showBiasDetails = true;
        if (this.behaviorAnalysisView) {
          this.isBiasTyping = false;
          this.biasDisplayTexts = [];
        } else {
          this.isBiasTyping = true;
          this.startBiasTypingSequence(0);
        }
        this.resultMessage = '决策认知偏差检测完成';
        this.saveAllStateToCache();
      } catch (error) {
        const errRes = error && error.response;
        console.group(`${logTag} 请求失败`);
        console.error('error:', error);
        console.log('message:', error && error.message);
        console.log('HTTP status:', errRes && errRes.status);
        console.log('请求体 requestBody:', requestBody);
        console.log('trackRecognitionContext:', trackCtx);
        console.log('响应 data:', errRes && errRes.data);
        console.log('响应 JSON:', errRes && errRes.data ? JSON.stringify(errRes.data, null, 2) : null);
        console.groupEnd();
        this.isBiasDetecting = false;
        this.showBiasDetails = true;
        this.hasStartedBiasDetection = true;
        this.behaviorAnalysisView = null;
        this.selectedTacticalIntentIndex = null;
        this.selectedTacticalDecisionIndex = null;
        this.resetCommanderIntentAnalysis();
        localStorage.removeItem('behaviorAnalysisView');
        const errText = this.extractAnalyzeVideoBehaviorError(error);
        this.biasDetailEntries = [{
          label: '检测失败',
          text: `检测失败：${errText}`,
          highlight: true,
          isConsistent: false
        }];
        this.biasDisplayTexts = [this.biasDetailEntries[0].text];
        this.isBiasTyping = false;
        this.deviationDetectionAccuracy = 'N/A';
        localStorage.setItem('biasDetailEntries', JSON.stringify(this.biasDetailEntries));
        this.resultMessage = '决策认知偏差检测失败';
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
      if (biasResult.is_consistent !== undefined) {
        const isConsistent = biasResult.is_consistent;
        const status = isConsistent ? '一致' : '不一致';
        const reason = biasResult.reason || '';
        entries.push({
          label: '偏差结果',
          text: `偏差结果：${status}`,
          highlight: true,
          isConsistent: isConsistent
        });
        if (reason) {
          entries.push({
            label: '判断原因',
            text: `判断原因：${reason}`,
            highlight: false,
            isConsistent: isConsistent
          });
        }
      }
      if (biasResult.image_evidence) {
        entries.push({
          label: '图片证据',
          text: `图片证据：${biasResult.image_evidence}`,
          highlight: false
        });
      }

      return entries;
    },
    startAccuracyTimer(delay) {
      if (this.accuracyTimeout) clearTimeout(this.accuracyTimeout);
      this.accuracyTimeout = setTimeout(() => {
        this.handleBiasAccuracyTimerComplete();
      }, delay);
    },
    /** 与 DecisionMaking.vue handleTimerComplete */
    handleBiasAccuracyTimerComplete() {
      console.log('[DecisionMakingV2] 决策认知偏差检测 准确率计时结束');
      this.isBiasDetecting = false;
      this.accuracyTimeout = null;
      this.showAccuracy = true;
      localStorage.setItem('biasDetectionCompleted', 'true');
      localStorage.removeItem('biasStartTime');
      this.applyDeviationDetectionAccuracyFromCache();
      if (this.fullResult) {
        localStorage.setItem('fullResult', JSON.stringify(this.fullResult));
      }
      localStorage.setItem('showAccuracy', 'true');
      localStorage.setItem('isBiasDetecting', 'false');
      this.saveAllStateToCache();
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
    stripFileExtension(filename) {
      if (filename == null) return '';
      const s = String(filename).trim();
      if (!s) return '';
      return s.replace(/\.(mp4|webm|mov|avi|mkv|m4v|flv|wmv|jpg|jpeg|png|webp|gif|bmp)$/i, '');
    },
    parseStaticFileList(raw) {
      if (raw == null) return [];
      let v = raw;
      if (typeof v === 'string') {
        const t = v.trim();
        if (t.startsWith('<') || t.startsWith('<!')) {
          return [];
        }
        try {
          v = JSON.parse(t);
        } catch (e) {
          return [];
        }
      }
      if (Array.isArray(v)) return v.filter(Boolean).map(x => String(x).trim()).filter(Boolean);
      if (v && Array.isArray(v.files)) return v.files.filter(Boolean).map(x => String(x).trim()).filter(Boolean);
      if (v && Array.isArray(v.list)) return v.list.filter(Boolean).map(x => String(x).trim()).filter(Boolean);
      if (v && Array.isArray(v.data)) return v.data.filter(Boolean).map(x => String(x).trim()).filter(Boolean);
      return [];
    },
    /** 与 DecisionMaking.vue：static/Image_input + static/Drane_Vedio_input/files.json */
    async loadSourceMediaList() {
      let imageFiles = [];
      let videoFiles = [];
      try {
        const response = await axios.get('/static/Image_input/files.json');
        const imageNameList = this.parseStaticFileList(response && response.data);
        imageFiles = imageNameList.map((name) => {
          const path = `image:${name}`;
          return {
            id: path,
            name,
            path,
            type: 'image'
          };
        });
        imageFiles.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
      } catch (error) {
        console.error('[DecisionMakingV2] 加载 static/Image_input/files.json 失败:', error);
        imageFiles = [];
      }

      try {
        // 仅视频列表来自 Drane_Vedio_input；选中后作战指令、认知传播视频仍为
        // fetchMachineRefineCommand + loadMediaFromSourceApi（/load-video），与改列表前一致
        const response = await axios.get('/static/Drane_Vedio_input/files.json');
        const videoNameList = this.parseStaticFileList(response && response.data);
        videoFiles = videoNameList.map((name) => {
          const path = `video:${name}`;
          return {
            id: path,
            name,
            path,
            type: 'video'
          };
        });
        videoFiles.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
      } catch (error) {
        console.error('[DecisionMakingV2] 加载 static/Drane_Vedio_input/files.json 失败:', error);
        videoFiles = [];
      }

      this.imageList = imageFiles;
      this.videoList = videoFiles;
      console.log('[DecisionMakingV2] 数据源列表已加载', {
        images: imageFiles.length,
        videos: videoFiles.length
      });
    },
    revokeOriginalMediaBlob() {
      if (this.originalVideoURL && String(this.originalVideoURL).startsWith('blob:')) {
        try {
          URL.revokeObjectURL(this.originalVideoURL);
        } catch (e) {
          // ignore
        }
      }
    },
    /** 认知传播视频：先 /load-video，失败则 static/Drane_Vedio_input；图片走 /load-image（filename 均带后缀） */
    async loadOriginalVideoFromApi(filename) {
      const staticUrl = this.buildDraneStaticVideoUrl(filename);
      const filenameWithExt = String(filename || '').trim();
      const loadVideoReq = this.buildLoadVideoRequestInfo(filenameWithExt);
      this.revokeOriginalMediaBlob();
      this.originalVideoUsedStatic = false;
      this.logLoadVideoRequest('发起请求', {
        ...loadVideoReq,
        listItemName: filename,
        staticFallbackUrl: staticUrl
      });
      try {
        const response = await axios.get(loadVideoReq.baseUrl, {
          params: loadVideoReq.params,
          responseType: 'blob'
        });
        const ct = response && response.headers && (response.headers['content-type'] || response.headers['Content-Type']);
        const payload = response && response.data !== undefined ? response.data : null;
        const payloadSize = payload && typeof payload.size === 'number' ? payload.size : null;
        this.logLoadVideoRequest('响应', {
          ...loadVideoReq,
          httpStatus: response && response.status,
          contentType: ct,
          payloadSize,
          payloadType: payload && payload.constructor ? payload.constructor.name : typeof payload
        });
        if (payload == null || payload === '' || this.isBlobLikelyErrorResponse(payload, ct)) {
          this.applyOriginalVideoStaticFallback(filename, staticUrl, '无效 load-video 响应', loadVideoReq);
          return;
        }
        const mediaBlob = this.buildProcessedMediaBlob(payload, ct, 'video');
        this.originalVideoURL = URL.createObjectURL(mediaBlob);
        localStorage.setItem('originalVideoURL', this.originalVideoURL);
        this.logLoadVideoRequest('成功', {
          ...loadVideoReq,
          previewMode: 'blob',
          originalVideoURL: this.originalVideoURL
        });
      } catch (error) {
        const errRes = error && error.response;
        this.logLoadVideoRequest('请求失败', {
          ...loadVideoReq,
          message: error && error.message,
          httpStatus: errRes && errRes.status,
          responseData: errRes && errRes.data
        });
        this.applyOriginalVideoStaticFallback(filename, staticUrl, error, loadVideoReq);
      }
    },
    async loadMediaFromSourceApi(item) {
      if (!item || !item.name || !item.type) return;
      const filename = String(item.name).trim();
      if (!filename) return;
      if (item.type === 'video') {
        const loadVideoReq = this.buildLoadVideoRequestInfo(filename);
        this.logLoadVideoRequest('选中视频', {
          ...loadVideoReq,
          item: { name: item.name, path: item.path, type: item.type }
        });
        await this.loadOriginalVideoFromApi(filename);
        return;
      }
      const fullUrl = `${SOURCE_API_BASE_URL}/load-image`;
      const logTag = '[DecisionMakingV2][load-image]';
      try {
        console.log(`${logTag} 请求`, { fullUrl, params: { filename }, item });
        const response = await axios.get(fullUrl, {
          params: { filename },
          responseType: 'blob'
        });
        const ct = response && response.headers && (response.headers['content-type'] || response.headers['Content-Type']);
        const payload = response && response.data !== undefined ? response.data : null;
        if (payload == null || payload === '') {
          console.warn(`${logTag} 后端未返回有效媒体内容`);
          this.revokeOriginalMediaBlob();
          this.originalVideoURL = null;
          return;
        }
        this.revokeOriginalMediaBlob();
        const blobType = (payload && payload.type) || ct || 'image/jpeg';
        const mediaBlob = payload instanceof Blob ? payload : new Blob([payload], { type: blobType });
        this.originalVideoURL = URL.createObjectURL(mediaBlob);
        localStorage.setItem('originalVideoURL', this.originalVideoURL);
        console.log(`${logTag} 预览 URL 已设置`, this.originalVideoURL);
      } catch (error) {
        console.error(`${logTag} 失败`, error);
        this.revokeOriginalMediaBlob();
        this.originalVideoURL = null;
      }
    },
    async switchMediaType(type) {
      if (this.selectedMediaType === type) return;
      this.selectedMediaType = type;
      localStorage.setItem('selectedMediaType', type);
      this.selectedVideo = null;
      this.clearAllCache();
      this.resetResultState();
      this.resetOriginalMediaDisplay();
      this.clearOrdersRefineDisplayTimer();
      this.clearTrackDisplayTimer();
      this.isOrdersLoading = false;
      this.ordersDisplayReady = false;
      this.ordersCommand = '';
      this.ordersNegotiation = '';

      if (!this.imageList.length && !this.videoList.length) {
        await this.loadSourceMediaList();
      }
      this.mediaList = type === 'image' ? this.imageList : this.videoList;
    },
    async fetchImageList() {
      await this.loadSourceMediaList();
      this.mediaList = this.imageList;
    },
    async fetchVideoListFromAPI() {
      await this.loadSourceMediaList();
      this.mediaList = this.videoList;
    },
    async fetchVideoList() {
      await this.fetchImageList();
    },
    async selectMedia(item) {
      if (!item || !item.path) return;
      const isSameItem = this.selectedVideo && this.selectedVideo.path === item.path;

      // 只有选择不同的文件时才清理相关缓存
      if (!isSameItem) {
        this.selectedVideo = item;
        localStorage.setItem('selectedVideo', JSON.stringify({
          id: item.id,
          path: item.path,
          name: item.name,
          mediaType: this.selectedMediaType
        }));
        this.clearTargetDetectionCache();
        this.resetResultState();
        this.resetOriginalMediaDisplay();
        this.clearOrdersRefineDisplayTimer();
        console.log("选择新" + (this.selectedMediaType === 'image' ? '图片' : '视频') + "，已重置预览并重置偏差检测结果。");
      } else {
        // 选择相同文件时，也保存 originalVideoURL 到 localStorage
        localStorage.setItem('selectedVideo', JSON.stringify({
          id: item.id,
          path: item.path,
          name: item.name,
          mediaType: this.selectedMediaType
        }));
        localStorage.setItem('originalVideoURL', this.originalVideoURL || '');
      }

      const filenameNoExt = this.stripFileExtension(item.name);
      await this.fetchMachineRefineCommand(filenameNoExt, item.path, item);
      console.log('已选择:', this.selectedMediaType === 'image' ? '图片' : '视频', item.name);
    },
    selectVideo(video) {
      this.selectMedia(video);
    },
    handleLabelClick() {
      if (this.canClickToDetect) {
        this.startDetection();
      }
    },
    async startDetection() {
      if (!this.canStartTrackRecognition) return;
      if (!this.selectedVideo || !this.selectedVideo.name) {
        alert('请先选择' + (this.selectedMediaType === 'image' ? '图片' : '视频'));
        return;
      }

      const selectedPath = this.selectedVideo.path;
      const trackCtx = this.buildTrackRecognitionContext(this.selectedVideo);
      const sourceFilename = trackCtx.sourceFilename;
      const trackedFilename = trackCtx.trackedFilename;
      const trackedFilenameNoExt = trackCtx.trackedFilenameNoExt;
      const logTag = '[DecisionMakingV2][load-track-artifact]';
      const requestParams = trackCtx.requestParams;
      const requestUrlWithQuery = this.buildTrackArtifactUrl(trackedFilename);
      const requestInfo = {
        url: TRACK_ARTIFACT_API_URL,
        fullUrl: requestUrlWithQuery,
        params: requestParams,
        paramsFilenameNoExt: trackedFilenameNoExt,
        sourceFilename,
        trackedFilename,
        selectedPath,
        selectedMediaType: this.selectedMediaType,
        selectedItem: this.selectedVideo
      };
      this.trackRecognitionContext = trackCtx;
      localStorage.setItem('trackRecognitionContext', JSON.stringify(trackCtx));

      this.clearTrackDisplayTimer();
      this.revokeProcessedMediaBlob();
      this.processedVideoURL = null;
      this.isLoading = true;
      this.hasStartedDetection = false;
      this.trackResultDisplayReady = false;
      this.resetBiasResultPanel();
      this.resultMessage = '正在加载轨迹识别结果...';
      this.progressMessage = '正在加载轨迹识别结果...';

      console.group(`${logTag} 点击「目标与轨迹识别」`);
      console.log('列表选中文件名 sourceFilename:', sourceFilename);
      console.log('生成 tracked 文件名 trackedFilename:', trackedFilename);
      console.log('实际传递 params（query）:', requestParams);
      console.log('完整请求 URL:', requestUrlWithQuery);
      console.log('请求详情 requestInfo:', requestInfo);
      console.groupEnd();

      const requestStartedAt = Date.now();
      let mediaBlob = null;
      let blobType = this.selectedMediaType === 'video' ? 'video/mp4' : 'image/jpeg';
      let fetchFailed = false;
      let fetchErrorDetail = '';

      try {
        // 统一 axios 拉取（避免 <video src="跨域直链"> 触发 MEDIA_ERR_SRC_NOT_SUPPORTED）
        console.log(`${logTag} axios.get 调用`, {
          url: TRACK_ARTIFACT_API_URL,
          params: requestParams,
          responseType: 'blob'
        });
        const response = await axios.get(TRACK_ARTIFACT_API_URL, {
          params: requestParams,
          responseType: 'blob'
        });
        const ct = response && response.headers && (response.headers['content-type'] || response.headers['Content-Type']);
        const payload = response && response.data !== undefined ? response.data : null;

        console.log(`${logTag} 原始响应`, {
          status: response && response.status,
          contentType: ct,
          dataType: payload && payload.constructor ? payload.constructor.name : typeof payload,
          dataSize: payload && payload.size
        });

        if (payload == null || payload === '' || this.isBlobLikelyErrorResponse(payload, ct)) {
          fetchFailed = true;
          fetchErrorDetail = this.selectedMediaType === 'video'
            ? `请确认轨迹文件 ${trackedFilename} 已生成（接口需 filename 带扩展名）`
            : `轨迹图片不可用（${trackedFilename}）`;
          console.warn(`${logTag} 后端未返回有效轨迹媒体`, requestInfo);
        } else {
          mediaBlob = this.buildProcessedMediaBlob(payload, ct, this.selectedMediaType);
          blobType = mediaBlob.type || blobType;
        }
      } catch (error) {
        fetchFailed = true;
        fetchErrorDetail = error && error.message;
        const errRes = error && error.response;
        console.error(`${logTag} 请求失败`, {
          request: requestInfo,
          message: error && error.message,
          status: errRes && errRes.status,
          contentType: errRes && errRes.headers && (errRes.headers['content-type'] || errRes.headers['Content-Type']),
          responseData: errRes && errRes.data
        });
      }

      const elapsed = Date.now() - requestStartedAt;
      const delayMs = Math.max(0, TRACK_DISPLAY_DELAY_MS - elapsed);

      this.trackDisplayTimer = setTimeout(async () => {
        this.trackDisplayTimer = null;

        if (!this.selectedVideo || this.selectedVideo.path !== selectedPath) {
          console.log(`${logTag} 延迟展示取消：选中项已变更`, {
            requestSelectedPath: selectedPath,
            currentSelectedPath: this.selectedVideo && this.selectedVideo.path
          });
          this.isLoading = false;
          return;
        }

        this.isLoading = false;

        if (fetchFailed || !mediaBlob) {
          this.revokeProcessedMediaBlob();
          this.processedVideoURL = null;
          this.hasStartedDetection = false;
          this.trackResultDisplayReady = false;
          this.resultMessage = fetchErrorDetail
            ? `轨迹识别结果加载失败：${fetchErrorDetail}`
            : '轨迹识别结果加载失败';
          this.progressMessage = '加载失败';
          return;
        }

        this.revokeProcessedMediaBlob();
        this.processedVideoURL = URL.createObjectURL(mediaBlob);
        this.hasStartedDetection = true;
        this.trackResultDisplayReady = false;
        this.fullResult = this.fullResult || {};
        this.fullResult.key_frame_detection = { tracked_artifact: trackedFilename };
        const detectedCodec = await this.applyProcessedVideoCodecPolicy(mediaBlob, trackedFilename);
        if (this.selectedMediaType === 'image') {
          this.$nextTick(() => this.handleProcessedTrackMediaReady());
        } else if (this.processedVideoCodecWarning) {
          this.trackResultDisplayReady = true;
        }
        if (this.fullResult.key_frame_detection) {
          this.fullResult.key_frame_detection.video_codec = detectedCodec;
        }
        this.fullResult.video_info = {
          name: sourceFilename,
          id: this.selectedVideo.id,
          tracked_filename: trackedFilename
        };
        this.taskId = trackedFilename;

        localStorage.setItem('processedVideoURL', this.processedVideoURL);

        try {
          const module1Res = {
            video_path: this.processedVideoURL,
            key_frame_path: this.processedVideoURL,
            originalVideoPath: this.originalVideoURL,
            instruction: this.ordersText,
            task_id: this.taskId,
            selectedMediaType: this.selectedMediaType,
            tracked_filename: trackedFilename,
            source_filename: sourceFilename
          };
          localStorage.setItem('module1Res', JSON.stringify(module1Res));
        } catch (e) {
          console.error(`${logTag} 保存 module1Res 失败`, e);
        }

        if (!this.processedVideoCodecWarning) {
          this.resultMessage = '轨迹识别结果已更新';
        }
        this.progressMessage = '加载完成';
        this.saveAllStateToCache();

        console.log(`${logTag} 轨迹结果已展示`, {
          request: requestInfo,
          delayMs: TRACK_DISPLAY_DELAY_MS,
          processedVideoURL: this.processedVideoURL,
          mode: 'blob',
          blobType,
          blobSize: mediaBlob && mediaBlob.size
        });
      }, delayMs);

      console.log(`${logTag} 已收到响应，等待延迟展示`, {
        request: requestInfo,
        delayMs,
        elapsedSinceRequestStart: elapsed
      });
    },
    /** 与 DecisionMaking.vue exportData：GET /export/output */
    async exportData() {
      if (!this.hasStartedBiasDetection) {
        alert('请先点击「决策认知偏差检测」后再导出结果。');
        return;
      }
      const logTag = '[DecisionMakingV2][export/output]';
      this.isExporting = true;
      try {
        console.log(`${logTag} GET`, EXPORT_OUTPUT_API_URL);
        const response = await axios.get(EXPORT_OUTPUT_API_URL, {
          responseType: 'blob',
          timeout: 60000
        });
        const blob = new Blob([response.data], { type: 'application/zip' });
        const contentDisposition = response.headers && (response.headers['content-disposition'] || response.headers['Content-Disposition']);
        let filename = `output_files_${new Date().toISOString().slice(0, 19).replace(/:/g, '')}.zip`;
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '');
            if (filename.startsWith("UTF-8''")) {
              filename = decodeURIComponent(filename.replace(/^UTF-8''/, ''));
            }
          }
        }
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        console.log(`${logTag} 导出成功`, filename);
      } catch (error) {
        console.error(`${logTag} 导出失败`, error);
        alert('导出失败，请重试。错误信息：' + ((error && error.message) || '未知错误'));
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
  font-display: swap;
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
  padding: 10px 4px;
  margin: 0;
  background-color: #051525;
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
  /* 背景图顶部 baked 了旧标题，上移裁切后仅保留 h1.newTitle 展示新标题 */
  background-position: center -78px;
  opacity: 1;
  z-index: -1;
}

/* 2. 顶部标题栏 */
.header-bar {
  width: 100%;
  flex-shrink: 0;
  padding: 0 12px;
  height: 60px;
  position: relative;
  z-index: 1;
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

@media (min-width: 993px) {
  .content-row {
    flex-wrap: nowrap !important;
  }
}

/* 三列通用高度 */
.left-column,
.middle-column,
.right-column {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
  min-height: 0;
  padding: 0 !important;
  justify-content: flex-start !important;
  gap: 8px;
  overflow: hidden;
}

/* 左侧列面板容器 */
.left-panels-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  gap: 10px;
}

/* 右侧列面板容器：与左侧同高，内部 flex 分配 */
.right-panels-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  gap: 8px;
  width: 100%;
  align-items: stretch;
}

/* 作战指令面板 */
.panel-orders {
  flex: 0 0 180px;
  min-height: 180px;
}

/* 数据源区域：高度固定由 flex 分配，列表内部滚动 */
.data-source-section {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.data-source-section .panel-left {
  flex: 1 1 0;
  min-height: 0;
  height: auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.data-source-section .panel-content {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.data-source-section .media-type-selector {
  flex-shrink: 0;
}

.panel-left {
  flex-grow: 1;
  height: auto;
  min-height: 200px;
}

.panel-right-top {
  flex: 1 1 0;
  min-height: 0;
  max-height: none;
  height: auto;
  flex-shrink: 1;
  margin-bottom: 0;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.panel-right-top .panel-content {
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.right-panels-container .panel-header {
  flex-shrink: 0;
}

.right-panels-container .panel-right-bottom {
  flex-shrink: 0;
}

.panel-right-bottom.dm-decision-panel {
  flex: 0 0 220px;
  height: 220px;
  min-height: 220px;
  max-height: 220px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  background-image: url('~@/assets/images/step1/弹框-偏差检测结果.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  padding: 4px 8px 8px 8px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  margin-top: -4px;
}

.panel-right-accuracy {
  flex: 0 0 100px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  background-image: url('~@/assets/images/step4/准确率框.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  margin-bottom: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  max-height: 100px;
  box-sizing: border-box;
  position: relative;
  overflow: visible;
  flex-shrink: 0;
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

.panel-right-top .panel-header.header-results.dm-result-box-title,
.panel-right-bottom.dm-decision-panel .panel-header.header-results.dm-result-box-title {
  width: 340px !important;
  height: 28px !important;
  min-height: 28px !important;
  max-height: 28px !important;
  padding: 4px 12px 0 12px !important;
  margin-left: auto !important;
  margin-right: auto !important;
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

/* 数据源区域容器（高度由父级 flex 约束，不随列表项增多撑开） */
.data-source-section {
  gap: 8px;
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
  max-height: 225px;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 229, 255, 0.3);
  border-radius: 4px;
  color: #eee;
  font-size: 0.95rem;
  line-height: 1.6;
  padding: 12px 15px;
  white-space: pre-wrap;
  word-break: break-all;
  box-sizing: border-box;

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

/* 作战指令：与 DecisionMaking.vue 一致的分区展示，区域尺寸不变 */
.panel-orders .orders-panel-content {
  flex: 1 1 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.panel-orders .orders-info-box {
  width: 100%;
  height: 100%;
  min-height: 225px;
  max-height: 225px;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;

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

.panel-orders .orders-empty-hint,
.panel-orders .orders-loading-hint {
  margin: 0;
  padding: 12px 4px;
  color: rgba(238, 238, 238, 0.75);
  font-size: 0.9rem;
  text-align: center;
}

.panel-orders .orders-loading-hint {
  color: #00e5ff;
  line-height: 1.6;
  padding-top: 96px;
}

.panel-orders .result-section {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
}

.panel-orders .result-section:last-child {
  margin-bottom: 0;
}

.panel-orders .section-header {
  color: #00e5ff;
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.panel-orders .section-content {
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid #00e0ff;
  border-radius: 5px;
  padding: 10px 12px;
  overflow-y: auto;
  position: relative;
}

.panel-orders .section-content::-webkit-scrollbar {
  width: 6px;
}

.panel-orders .section-content::-webkit-scrollbar-thumb {
  background: #00e5ff;
  border-radius: 3px;
}

.panel-orders .section-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

.panel-orders .left-info-section.small-section .section-content {
  min-height: 70px;
  max-height: 70px;
}

.panel-orders .left-info-section.orders-command-only .section-content {
  min-height: 175px;
  max-height: 175px;
}

.panel-orders .left-info-section.consensus-section .section-content {
  min-height: 95px;
  max-height: 95px;
}

.panel-orders .result-text {
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0;
  color: #eee;
  white-space: pre-wrap;
  word-break: break-word;
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
  flex: 1 1 0;
  min-height: 0;
  max-height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  padding-right: 10px;
  box-sizing: border-box;

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

.data-source-section .server-video-list {
  /* 列表区域尺寸固定，仅内部出现滚动条 */
  flex: 1 1 0;
  min-height: 0;
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

.action-buttons-middle {
  flex: 0 0 auto;
  flex-shrink: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  min-height: 90px;
  margin-top: -10px;
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
  width: 330px;
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
  gap: 6px;
  height: calc(100vh - 60px);
  min-height: 0;
  overflow: hidden;
}

.video-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0;
  flex: 1 1 0;
  min-height: 120px;
}

.video-section--original .video-frame,
.video-section:first-of-type .video-frame {
  max-width: 800px;
}

.video-section--processed .video-frame,
.video-section:last-of-type .video-frame {
  max-width: 800px;
}

.video-display {
  width: 90%;
  height: 90%;
  transform: scale(0.9);
  transform-origin: center center;
}

.codec-unsupported-box {
  width: 90%;
  max-width: 720px;
  padding: 16px 20px;
  text-align: left;
  color: #e8f4ff;
  background: rgba(0, 40, 80, 0.55);
  border: 1px solid rgba(100, 180, 255, 0.35);
  border-radius: 6px;
  font-size: 0.88rem;
  line-height: 1.55;
}

.codec-unsupported-text {
  margin: 0 0 12px;
}

.codec-download-link {
  color: #7ec8ff;
  text-decoration: underline;
  word-break: break-all;
}

.codec-download-link:hover {
  color: #b8e4ff;
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

.video-display {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.placeholder-text {
  color: #88a;
  font-size: 1rem;
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
.panel-right-top,
.panel-right-bottom.dm-decision-panel {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.panel-right-top {
  background-image: url('~@/assets/images/step1/弹框-偏差检测结果.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  padding: 4px 8px 8px 8px;
  position: relative;
}

.panel-right-top .panel-content,
.panel-right-bottom.dm-decision-panel .panel-content {
  min-height: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.panel-right-top .result-section-main,
.panel-right-bottom.dm-decision-panel .result-section-main {
  background-color: rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  padding-top: 4px;
  padding-bottom: 6px;
  margin-bottom: 0;
  box-shadow: 0 2px 8px rgba(0, 229, 255, 0.08);
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.panel-right-top .section-content.unified-scroll,
.panel-right-bottom.dm-decision-panel .section-content.unified-scroll {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 10px;
}

.panel-right-top .section-content .result-text,
.panel-right-bottom.dm-decision-panel .section-content .result-text {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.65;
}

.title-one-line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
}

.panel-right-top .dm-result-box-title,
.panel-right-bottom.dm-decision-panel .dm-result-box-title {
  width: 340px !important;
  min-width: 340px !important;
  max-width: 340px !important;
  height: 28px !important;
  min-height: 28px !important;
  max-height: 28px !important;
  font-size: 14px !important;
  font-family: 'DOUYUFont', sans-serif !important;
  font-weight: 400 !important;
  color: #ffffff !important;
  justify-content: center !important;
  align-items: center !important;
  text-align: center !important;
  align-self: center !important;
  padding: 4px 12px 0 12px !important;
  margin: 0 auto 6px auto !important;
  box-sizing: border-box !important;
  overflow: visible !important;
  line-height: normal !important;
  background-image: url('~@/assets/images/step1/-s-二级标题.png') !important;
  background-repeat: no-repeat !important;
  background-size: 100% 100% !important;
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  flex-shrink: 0 !important;
}

.panel-right-top .dm-result-box-title.title-one-line,
.panel-right-bottom.dm-decision-panel .dm-result-box-title.title-one-line {
  overflow: visible !important;
}

.panel-right-top .dm-result-box-title span,
.panel-right-bottom.dm-decision-panel .dm-result-box-title span {
  display: block;
  width: 100%;
  line-height: 1.3;
  padding-top: 0;
  text-align: center;
  transform: none;
}

.final-result-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-grow: 1;
  min-height: 0;
  height: 100%;
}

.final-result-title {
  color: #4ED8FF;
  font-family: 'DOUYUFont', sans-serif;
  font-weight: 400;
  font-size: 16px;
  text-align: left;
  margin: 0;
  line-height: 1.4;
  flex-shrink: 0;
}

.final-model-display {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  gap: 8px;
  background-color: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(0, 229, 255, 0.35);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 229, 255, 0.08);
  padding: 10px 12px;
  text-align: left;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
}

.final-model-text {
  color: #fff;
  font-family: "DingTalk-JinBuTi", sans-serif;
  font-size: 14px;
  font-weight: 400;
  margin: 0;
  width: 100%;
  line-height: 1.6;
  word-break: break-word;
  white-space: pre-wrap;
}

.panel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  color: #00e5ff;
  font-size: 14px;
  z-index: 5;
}

.bias-panel-scroll {
  background: transparent;
  border: none;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: #00e5ff rgba(10, 25, 50, 0.35);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(10, 25, 50, 0.35);
    border-radius: 4px;
    border: 1px solid rgba(0, 229, 255, 0.12);
    margin: 2px 0;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #00e5ff 0%, #0097a7 100%);
    border-radius: 4px;
    border: 1px solid rgba(0, 229, 255, 0.35);
    box-shadow: 0 0 6px rgba(0, 229, 255, 0.35);
  }

  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #33eeff 0%, #00b8d4 100%);
    box-shadow: 0 0 8px rgba(0, 229, 255, 0.5);
  }
}

.bias-button-container {
  flex-shrink: 0;
  min-height: 70px;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0;
  padding: 8px 0;
  width: 100%;
}

.description-box {
  flex: 1 1 0;
  min-height: 0;
  max-height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 229, 255, 0.3);
  color: #eee;
  font-size: 0.9rem;
  line-height: 1.6;
  padding: 10px !important;
  overflow-x: hidden;
  overflow-y: auto;
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

.behavior-analysis-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.ba-section {
  background: linear-gradient(135deg, rgba(0, 48, 96, 0.55) 0%, rgba(0, 24, 48, 0.75) 100%);
  border: 1px solid rgba(0, 229, 255, 0.28);
  border-radius: 8px;
  padding: 10px 12px;
  box-shadow: 0 0 12px rgba(0, 120, 200, 0.12);
}

.ba-section--behavior,
.ba-section--tactical {
  border-left: 3px solid #00e5ff;
}

.ba-section--auxiliary {
  border-left: 3px solid #6eb8ff;
  background: linear-gradient(135deg, rgba(0, 36, 72, 0.5) 0%, rgba(0, 18, 40, 0.82) 100%);
}

.ba-section--commander {
  border-left: 3px solid #5dffb8;
  background: linear-gradient(135deg, rgba(0, 48, 56, 0.5) 0%, rgba(0, 24, 36, 0.82) 100%);
}

.ba-commander-error {
  color: #ffb4b4;
}

.ba-intent-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.panel-right-bottom.dm-decision-panel .decision-bias-result {
  margin-top: -8px;
  margin-bottom: 0;
  margin-left: 0;
  padding-top: 0;
  padding-left: 2px;
  line-height: 1.3;
  text-align: left;
  align-self: flex-start;
}

.ba-intent-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  padding: 8px 10px 8px 14px;
  border: 2px solid rgba(0, 229, 255, 0.22);
  border-radius: 6px;
  background: rgba(0, 40, 70, 0.35);
  color: #d4eaff;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
  text-align: left;
  font-family: inherit;
  outline: none;
}

.ba-intent-btn::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  background: linear-gradient(180deg, #5dffb8 0%, #00e5ff 100%);
  transition: width 0.2s ease, box-shadow 0.2s ease;
}

.ba-intent-btn:hover {
  border-color: rgba(0, 229, 255, 0.45);
  background: rgba(0, 55, 90, 0.45);
}

.ba-intent-btn--selected {
  transform: translateX(3px);
  opacity: 1;
  cursor: default;
}

.ba-intent-btn--machine-best {
  border-color: rgba(93, 255, 184, 0.55);
  background: linear-gradient(90deg, rgba(93, 255, 184, 0.12) 0%, rgba(0, 100, 160, 0.18) 100%);
  box-shadow:
    0 0 0 1px rgba(93, 255, 184, 0.28),
    0 0 14px rgba(93, 255, 184, 0.22);
}

.ba-intent-btn--machine-best::before {
  width: 4px;
  background: linear-gradient(180deg, #5dffb8 0%, #00e5ff 100%);
  box-shadow: 0 0 8px rgba(93, 255, 184, 0.55);
}

.ba-intent-btn--machine-best .ba-intent-name {
  color: #d8fff0;
  font-weight: 600;
}

.ba-intent-btn--bias-consistent {
  border-color: #5dffb8;
  background: linear-gradient(90deg, rgba(93, 255, 184, 0.28) 0%, rgba(0, 120, 90, 0.22) 100%);
  box-shadow:
    0 0 0 1px rgba(93, 255, 184, 0.55),
    0 0 24px rgba(93, 255, 184, 0.65),
    inset 0 0 28px rgba(93, 255, 184, 0.12);
}

.ba-intent-btn--bias-consistent::before {
  width: 5px;
  background: linear-gradient(180deg, #5dffb8 0%, #3dff9a 100%);
  box-shadow: 0 0 12px rgba(93, 255, 184, 0.9);
}

.ba-intent-btn--bias-deviation {
  border-color: #ff6b6b;
  background: linear-gradient(90deg, rgba(255, 107, 107, 0.28) 0%, rgba(120, 30, 30, 0.22) 100%);
  box-shadow:
    0 0 0 1px rgba(255, 107, 107, 0.55),
    0 0 24px rgba(255, 77, 77, 0.65),
    inset 0 0 28px rgba(255, 107, 107, 0.12);
}

.ba-intent-btn--bias-deviation::before {
  width: 5px;
  background: linear-gradient(180deg, #ff8a8a 0%, #ff4d4d 100%);
  box-shadow: 0 0 12px rgba(255, 77, 77, 0.9);
}

.ba-intent-btn--disabled,
.ba-intent-btn:disabled:not(.ba-intent-btn--selected) {
  cursor: not-allowed;
  opacity: 0.45;
  transform: none;
  box-shadow: none;
}

.ba-intent-btn--disabled:hover,
.ba-intent-btn:disabled:hover {
  border-color: rgba(0, 229, 255, 0.22);
  background: rgba(0, 40, 70, 0.35);
}

.ba-intent-btn--selected .ba-intent-name {
  color: #ffffff;
  font-weight: 700;
}

.ba-intent-btn--bias-consistent .ba-intent-name {
  text-shadow: 0 0 10px rgba(93, 255, 184, 0.75);
}

.ba-intent-btn--bias-deviation .ba-intent-name {
  text-shadow: 0 0 10px rgba(255, 107, 107, 0.75);
}

.ba-intent-name {
  flex: 0 0 auto;
  min-width: 4.5em;
  font-size: 0.88rem;
  color: #e8fdff;
  white-space: nowrap;
}

.ba-intent-confidence {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.ba-intent-confidence-bar-wrap {
  flex: 1 1 auto;
  height: 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(0, 229, 255, 0.2);
  overflow: hidden;
}

.ba-intent-confidence-bar {
  display: block;
  height: 100%;
  min-width: 0;
  border-radius: 3px;
  background: linear-gradient(90deg, rgba(0, 180, 255, 0.55) 0%, #00e5ff 100%);
  transition: width 0.3s ease;
}

.ba-intent-btn--selected .ba-intent-confidence-bar-wrap {
  border-color: rgba(0, 229, 255, 0.65);
  box-shadow: 0 0 8px rgba(0, 229, 255, 0.4);
}

.ba-intent-btn--bias-consistent .ba-intent-confidence-bar-wrap {
  border-color: rgba(93, 255, 184, 0.65);
  box-shadow: 0 0 8px rgba(93, 255, 184, 0.45);
}

.ba-intent-btn--bias-deviation .ba-intent-confidence-bar-wrap {
  border-color: rgba(255, 107, 107, 0.65);
  box-shadow: 0 0 8px rgba(255, 107, 107, 0.45);
}

.ba-intent-btn--selected .ba-intent-confidence-bar {
  background: linear-gradient(90deg, #00c8ff 0%, #5dffb8 100%);
  box-shadow: 0 0 8px rgba(93, 255, 184, 0.55);
}

.ba-intent-btn--bias-consistent .ba-intent-confidence-bar {
  background: linear-gradient(90deg, #3dff9a 0%, #5dffb8 100%);
  box-shadow: 0 0 8px rgba(93, 255, 184, 0.65);
}

.ba-intent-btn--bias-deviation .ba-intent-confidence-bar {
  background: linear-gradient(90deg, #ff6b6b 0%, #ff4d4d 100%);
  box-shadow: 0 0 8px rgba(255, 107, 107, 0.65);
}

.ba-intent-confidence-text {
  flex: 0 0 42px;
  font-size: 0.82rem;
  color: #b8e8ff;
  text-align: right;
}

.ba-intent-btn--selected .ba-intent-confidence-text {
  font-weight: 700;
}

.ba-intent-btn--bias-consistent .ba-intent-confidence-text {
  color: #5dffb8;
  text-shadow: 0 0 8px rgba(93, 255, 184, 0.55);
}

.ba-intent-btn--bias-deviation .ba-intent-confidence-text {
  color: #ff8a8a;
  text-shadow: 0 0 8px rgba(255, 107, 107, 0.55);
}

.ba-auxiliary-body {
  margin: 0;
  text-indent: 0;
  line-height: 1.85;
  color: #d4eaff;
}

.bias-result-display {
  width: 100%;
  min-height: 0;
}

.ba-section--consensus {
  border-left: 3px solid #5dffb8;
}

.ba-section--divergence {
  border-left: 3px solid #ffb84d;
}

.ba-section--predicted,
.ba-section--ground_truth {
  border-left: 3px solid #b8a0ff;
}

.ba-section-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.ba-section-icon {
  color: #00e5ff;
  font-size: 0.95rem;
  line-height: 1;
}

.ba-section-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #b8e8ff;
  letter-spacing: 0.05em;
}

.ba-section-body {
  font-size: 0.88rem;
  line-height: 1.75;
  color: #e8f4ff;
  white-space: pre-wrap;
  word-break: break-word;
  text-align: left;
}

.ba-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.ba-metric-chip {
  display: inline-flex;
  flex-direction: column;
  min-width: 120px;
  padding: 8px 12px;
  background: rgba(0, 80, 140, 0.45);
  border: 1px solid rgba(0, 229, 255, 0.35);
  border-radius: 6px;
}

.ba-metric-label {
  font-size: 0.75rem;
  color: #8ec8ff;
  margin-bottom: 4px;
}

.ba-metric-value {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
}

.behavior-analysis-error {
  padding: 12px 14px;
  background: rgba(80, 20, 20, 0.45);
  border: 1px solid rgba(255, 120, 100, 0.45);
  border-radius: 8px;
  text-align: left;
}

.ba-error-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #ffb4a8;
  margin-bottom: 8px;
}

.ba-error-text {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.65;
  color: #ffe8e4;
  white-space: pre-wrap;
  word-break: break-word;
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

.panel-right-bottom.dm-decision-panel .panel-content {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.panel-right-accuracy .panel-content {
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
  padding: 0 22px 0 28px;
  position: relative;
  box-sizing: border-box;
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
  margin-top: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0;
  width: 100%;
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

  .video-section--original .video-frame,
  .video-section:first-of-type .video-frame {
    height: 300px;
  }

  .video-section--processed .video-frame,
  .video-section:last-of-type .video-frame {
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

@media (max-width: 992px) {
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

  .panel-right-bottom.dm-decision-panel {
    flex-grow: 0;
    height: 220px;
    min-height: 180px;
  }

  .panel-right-accuracy {
    min-height: 100px;
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
