<template>
  <div class="section" :style="{ height: `${windowHeight}px` }" :class="{ 'use-assets': designAssetsEnabled }">
    <div class="register" :style="{ width: `${windowWidth}px`, height: `${windowHeight}px` }"></div>
    <div class="img_box" :style="{ width: `${windowWidth}px`, height: `${windowHeight}px` }"></div>

    <div class="top-nav-left">
      <router-link to="/" class="nav-btn nav-home">首页</router-link>
      <router-link to="/group-negotiation" class="nav-btn nav-back">上个页面</router-link>
    </div>
    <div class="top-nav-right">
      <router-link to="/combined-diagnosis" class="nav-btn nav-next">下个页面</router-link>
    </div>

    <div class="title-container" :style="bgImageStyle(assetNames.titleBg)">
      <h1 class="newTitle">决策选择认知偏差检测模型</h1>
    </div>

    <div class="core-layout-design">
      <div class="design-left-column">
        <div class="design-module video-module" :style="videoPanelBgStyle">
          <div class="panel-header clean-header">认知传播数据源</div>
          <div class="design-module-content video-content-wrapper">
            <div v-if="sourceSelectorMode === 'menu'" class="source-type-menu">
              <button class="source-type-btn" @click="switchSourceMode('image')">图像</button>
              <button class="source-type-btn" @click="switchSourceMode('video')">视频</button>
            </div>
            <template v-else-if="sourceSelectorMode === 'image' || sourceSelectorMode === 'video'">
              <button class="source-back-btn" @click="backToSourceMenu">返回</button>
              <div class="server-video-list overflow-auto" v-if="currentSourceList && currentSourceList.length > 0">
                <div
                  v-for="item in currentSourceList"
                  :key="item.path"
                  class="video-item"
                  :class="{ selected: selectedSourceImagePath === item.path }"
                  @click="selectSourceImage(item)"
                >
                  <span>{{ item.name }}</span>
                  <span class="selector-circle"></span>
                </div>
              </div>
              <div v-else class="video-placeholder-text">{{ sourceImageMessage }}</div>
            </template>
            <template v-else-if="sourceSelectorMode === 'preview'">
              <button class="source-back-btn" @click="backToSourceList">返回</button>
              <div class="source-preview-wrapper">
                <img
                  v-if="sourcePreviewType === 'image' && sourcePreviewUrl"
                  :src="sourcePreviewUrl"
                  class="source-preview-media"
                  alt="选中图片"
                />
                <video
                  v-else-if="sourcePreviewType === 'video' && sourcePreviewUrl"
                  :src="sourcePreviewUrl"
                  class="source-preview-media"
                  controls
                  autoplay
                  muted
                  playsinline
                ></video>
                <div v-else class="video-placeholder-text">{{ sourcePreviewMessage || '媒体加载失败' }}</div>
              </div>
            </template>
          </div>
        </div>

        <div class="design-module text-module-left fixed-left-text" :style="leftTextPanelBgStyle">
          <div class="panel-header clean-header">指令和认知传播信息</div>
          <div class="design-module-content text-scrollable">
            <template v-if="sourceRefineCommand || sourceRefineNegotiation">
              <div class="result-section small-section left-info-section">
                <div class="section-header">指令信息：</div>
                <div class="section-content">
                  <p class="result-text">{{ sourceRefineCommand || '暂无指令信息' }}</p>
                </div>
              </div>
              <div class="result-section consensus-section left-info-section">
                <div class="section-header">目标识别和群体协商传播信息：</div>
                <div class="section-content">
                  <p class="result-text">{{ sourceRefineNegotiation || '暂无目标识别和群体协商传播信息' }}</p>
                </div>
              </div>
            </template>
            <p v-else class="text-content"></p>
          </div>
        </div>

        <div class="button-container">
          <b-button @click="fetchBackendData" variant="primary" :disabled="!canStartDecision || isLoading" class="inference-btn"
            :style="buttonBgStyle">
            <span class="btn-text-pos">开始人机决策</span>
          </b-button>
        </div>
      </div>

      <div class="design-center-column">
        <div class="design-module assessment-module commander-assessment" :style="commanderPanelBgStyle">
          <div class="assessment-content">
            <div class="assessment-left-section">
              <img v-if="designAssetsEnabled" :src="fileUrl(assetNames.commanderIcon)" alt="指挥员决策"
                class="assessment-module-icon" />
              <div v-else class="icon-placeholder-commander"></div>
              <div class="assessment-title">指挥员决策</div>
            </div>
            <div class="assessment-middle-section">
              <div class="assessment-right-section">
                <div class="icon-placeholder-red" :style="expertIconStyle" v-if="expertDangerLevel !== 'N/A' && expertDangerLevel"></div>
              </div>
              <div class="design-module-content text-scrollable">
                <div v-if="isAssessing" class="loading-overlay">
                  <span>决策中</span>
                </div>
                <div v-else class="description-box assessment-content-box">
                  <ul class="info-list"
                    v-if="formattedPerformanceDataLocalList && formattedPerformanceDataLocalList.length > 0">
                    <li v-for="(item, idx) in formattedPerformanceDataLocalList" :key="'local-' + idx"
                      :class="{ 'first-item': idx === 0 }">
                      <span v-html="item"></span>
                    </li>
                  </ul>
                  <p class="text-content text-muted" v-else>暂无评估信息</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="design-module behavior-module" :style="behaviorPanelBgStyle">
          <div class="design-module-label clean-header" :style="labelImageStyle(assetNames.behaviorLabel, 200, 35)">
            辅助决策行为信息</div>
          <div class="behavior-content">
            <div class="flanking-image-column">
              <div class="image-item">
                <div v-if="isImageLoading" class="loading-overlay">
                  <span>分析中</span>
                </div>
                <img :src="behaviorImageSrc(0)" :key="behaviorImageRenderKey(0)" v-if="imageList[0] && !isImageLoading" alt="图像 1" class="image-display">
                <div class="image-placeholder" v-else-if="!isImageLoading">图像 1</div>
              </div>
              <div class="image-item">
                <div v-if="isImageLoading" class="loading-overlay">
                  <span>分析中</span>
                </div>
                <img :src="behaviorImageSrc(2)" :key="behaviorImageRenderKey(2)" v-if="imageList[2] && !isImageLoading" alt="图像 3" class="image-display">
                <div class="image-placeholder" v-else-if="!isImageLoading">图像 3</div>
              </div>
            </div>

            <div class="pyramid-legend-group">
              <div class="pyramid-placeholder" v-if="!designAssetsEnabled"></div>
              <img v-else :src="fileUrl(assetNames.pyramid)" alt="金字塔" style="width:120px;height:120px;opacity:.95;" />
              <div class="level-legend">
                <div class="legend-item level-1">一级战备</div>
                <div class="legend-item level-2">二级战备</div>
                <div class="legend-item level-3">三级战备</div>
                <div class="legend-item level-4">四级战备</div>
              </div>
            </div>

            <div class="flanking-image-column">
              <div class="image-item">
                <div v-if="isImageLoading" class="loading-overlay">
                  <span>分析中</span>
                </div>
                <img :src="behaviorImageSrc(1)" :key="behaviorImageRenderKey(1)" v-if="imageList[1] && !isImageLoading" alt="图像 2" class="image-display">
                <div class="image-placeholder" v-else-if="!isImageLoading">图像 2</div>
              </div>
              <div class="image-item">
                <div v-if="isImageLoading" class="loading-overlay">
                  <span>分析中</span>
                </div>
                <img :src="behaviorImageSrc(3)" :key="behaviorImageRenderKey(3)" v-if="imageList[3] && !isImageLoading" alt="图像 4" class="image-display">
                <div class="image-placeholder" v-else-if="!isImageLoading">图像 4</div>
              </div>
            </div>
          </div>
        </div>

        <div class="design-module assessment-module machine-assessment" :style="systemPanelBgStyle">
          <div class="assessment-content">
            <div class="assessment-left-section">
              <img v-if="designAssetsEnabled" :src="fileUrl(assetNames.machineIcon)" alt="机器决策"
                class="assessment-module-icon" />
              <div v-else class="icon-placeholder-machine"></div>
              <div class="assessment-title">机器决策</div>
            </div>
            <div class="assessment-middle-section">
              <div class="assessment-right-section">
                <div class="icon-placeholder-red" :style="modelIconStyle" v-if="modelDangerLevel !== 'N/A' && modelDangerLevel"></div>
              </div>
              <div class="design-module-content text-scrollable">
                <div v-if="isAssessing" class="loading-overlay">
                  <span>决策中</span>
                </div>
                <div v-else class="description-box assessment-content-box">
                  <ul class="info-list" v-if="formattedPerformanceDataList && formattedPerformanceDataList.length > 0">
                    <li v-for="(item, idx) in formattedPerformanceDataList" :key="'machine-' + idx"
                      :class="{ 'first-item': idx === 0 }">
                      <span v-html="item"></span>
                    </li>
                  </ul>
                  <p class="text-content text-muted" v-else>暂无评估信息</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="design-right-column">
        <div class="panel-right-bias-button">
          <button class="btn-bias-detect" @click="performDeviationDetection" :disabled="isBiasDetecting">
            <span class="btn-text-pos">决策认知偏差检测</span>
          </button>
        </div>
        <div class="panel-right-top">
          <div class="panel-content">
            <div class="panel-header header-results clean-header">决策选择认知偏差检测结果</div>
            <div class="results-scroll-container">
              <div v-if="isBiasResultLoading" class="panel-overlay">分析中</div>
              <template v-else>
                <div class="result-section small-section">
                  <div class="section-header">行为信息：</div>
                  <div class="section-content">
                    <p class="result-text">{{ behaviorInfo || '暂无行为信息' }}</p>
                  </div>
                </div>

                <div class="result-section consensus-section">
                  <div class="section-header">共识信息：</div>
                  <div class="section-content">
                    <p class="result-text">{{ samePoints || '暂无共识信息' }}</p>
                  </div>
                </div>

                <div class="result-section different-section">
                  <div class="section-header">分歧信息：</div>
                  <div class="section-content">
                    <p class="result-text different-points">{{ differentPoints || '暂无分歧信息' }}</p>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <div class="panel-right-accuracy">
          <template v-if="isBiasResultLoading || deviationDetectionAccuracy === '计算中...'">
            <div class="loading-spinner">计算中...</div>
          </template>
          <template v-else>
            <div class="accuracy-content">
              <span class="accuracy-label-group">
                <span class="accuracy-label">偏差识别准确率</span>
                <span class="formula-tooltip-trigger" aria-label="查看准确率计算公式">?</span>
                <span class="formula-tooltip">
                  <span class="formula-math" aria-label="A_comp 等于 alpha 乘 S_text 加 (1 减 alpha)S_rating 加 S_cor">
                    <span class="f-term">
                      A<sub class="f-sub">comp</sub>
                    </span>
                    <span class="f-op">=</span>
                    <span class="f-term f-greek">α</span>
                    <span class="f-mul-gap" aria-hidden="true"></span>
                    <span class="f-term f-product">
                      <span class="f-group">
                        S<sub class="f-sub">text</sub>
                      </span>
                    </span>
                    <span class="f-op">+</span>
                    <span class="f-paren">(1 − <span class="f-greek">α</span>)</span>
                    <span class="f-mul-gap" aria-hidden="true"></span>
                    <span class="f-term f-product">
                      <span class="f-group">
                        S<sub class="f-sub">rating</sub>
                      </span>
                    </span>
                    <span class="f-op">+</span>
                    <span class="f-term f-product">
                      <span class="f-group">S<sub class="f-sub">cor</sub></span>
                    </span>
                  </span>
                </span>
              </span>
              <span class="accuracy-value">
                <template
                  v-if="deviationDetectionAccuracy !== 'N/A' && deviationDetectionAccuracy !== '计算中...' && deviationDetectionAccuracy !== null && deviationDetectionAccuracy !== undefined && deviationDetectionAccuracy !== ''">
                  {{ deviationDetectionAccuracy }}%
                </template>
                <template v-else>
                  N/A
                </template>
              </span>
            </div>
          </template>
        </div>

        <div class="panel-right-button">
          <button @click="exportData" class="btn-export-result" :disabled="isBiasDetecting">
            <span class="btn-text-pos">结果导出</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { BButton, BSpinner } from 'bootstrap-vue';

const API_BASE_URL = 'http://10.109.253.71:12358';
const IMAGE_API_BASE_URL = 'http://10.109.253.71:12358';
const REFINE_COMMAND_API_URL = 'http://10.109.253.71:12358/machine-refine-command';
// 偏差检测准确率延迟时间：4分钟（毫秒）
const BIAS_DETECTION_DELAY = 4 * 60 * 1000; // 240000 毫秒

export default {
  name: 'DecisionMaking',
  components: {
    BButton,
    BSpinner
  },
  data() {
    return {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      isLoading: false,
      isImageLoading: false,
      isBiasDetecting: false,
      isAssessing: false,
      isBiasResultLoading: false,
      designAssetsEnabled: true,
      assetNames: {
        panel: null,
        rightPanel: '决策选择认知偏差检测结果文本框.png',
        label: null,
        button: '开始测验.png',
        exportBtn: '结果导出按键.png',
        accuracy: '原视频框.png',
        titleBg: '标题栏.png',
        pyramid: '金字塔图.png',
        iconRed: null,
        videoPanel: '原视频框.png',
        leftTextPanel: '左下文本框.png',
        commanderPanel: '指挥员评估文本框.png',
        systemPanel: '机器评估文本框.png',
        videoLabel: '视频演示标题框.png',
        behaviorLabel: '可视化行为标题框.png',
        resultLabel: '决策选择认知偏差检测结果标题框.png',
        level1: '一级战备图片.png',
        level2: '二级战备图片.png',
        level3: '三级战备图片.png',
        level4: '四级战备图片.png',
        machineIcon: '机器评估图标.png',
        commanderIcon: '指挥员评估图标.png'
      },
      apiConfig: {
        weaponModel: process.env.VUE_APP_WEAPON_MODEL || 'B-2',
        imgDir: process.env.VUE_APP_IMG_DIR || '/home/img/B-2',
        txtPath: process.env.VUE_APP_TXT_PATH || '/home/txt/plane.txt',
        apiKey: process.env.VUE_APP_DASHSCOPE_API_KEY
      },
      thirdStageText: '正在加载第三阶段文字信息...',
      currentStageText: '',
      performanceData: '',
      performanceDataLocal: '正在加载本地性能数据...',
      behaviorInfo: '正在加载行为信息...',
      samePoints: '正在加载相同点信息...',
      differentPoints: '正在加载不同点信息...',
      imageList: [null, null, null, null],
      deviationDetectionAccuracy: 'N/A',
      modelDangerLevel: 'N/A',
      expertDangerLevel: 'N/A',
      currentLevel: 4,
      testVideoUrl: null,
      testVideoMessage: '正在从 LocalStorage 加载视频...',
      sourceImageList: [],
      sourceVideoList: [],
      selectedSourceImagePath: null,
      selectedSourceItem: null,
      sourceSelectorMode: 'menu', // menu | image | video | preview
      sourceImageMessage: '请选择数据类型',
      sourcePreviewUrl: null,
      sourcePreviewType: '',
      sourcePreviewMessage: '',
      tempModule4Res: null,
      sourceRefineText: '',
      sourceRefineCommand: '',
      sourceRefineNegotiation: '',
      // 新增：用于存储定时器ID
      accuracyTimeout: null,
      gifReplayTimer: null,
      gifReplayNonce: [0, 0, 0, 0],
      // 越小越接近“播完立刻重播”，但过小会提前打断较长GIF
      gifReplayIntervalMs: 2000,
    };
  },
  computed: {
    canStartDecision() {
      return !!(this.selectedSourceItem && this.selectedSourceItem.name);
    },
    currentSourceList() {
      if (this.sourceSelectorMode === 'image') return this.sourceImageList;
      if (this.sourceSelectorMode === 'video') return this.sourceVideoList;
      return [];
    },
    formattedThirdStageText() {
      const source = this.thirdStageText;
      if (!source) return '';
      try {
        let data = source;
        if (typeof source === 'string') {
          const trimmed = source.trim();
          if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            data = JSON.parse(trimmed);
          }
        }
        if (typeof data === 'object' && data !== null) {
          const takeKeys = [
            'consensus_summary',
            'deviation_analysis'
          ];
          const parts = takeKeys
            .map(k => data[k])
            .filter(v => typeof v === 'string' && v.trim().length > 0);
          if (parts.length > 0) {
            return parts.map(s => this.escapeToHtml(s)).join('<br/><br/>');
          }
        }
        return typeof source === 'string' ? this.escapeToHtml(source) : String(source);
      } catch (e) {
        return typeof source === 'string' ? this.escapeToHtml(source) : String(source);
      }
    },
    formattedPerformanceDataList() {
      return this.formatAssessmentTextToList(this.performanceData);
    },
    formattedPerformanceDataLocalList() {
      return this.formatAssessmentTextToList(this.performanceDataLocal);
    },
    videoPanelBgStyle() { return this.bgImageStyle(this.assetNames.videoPanel); },
    leftTextPanelBgStyle() { return this.bgImageStyle(this.assetNames.leftTextPanel); },
    commanderPanelBgStyle() { return this.bgImageStyle(this.assetNames.commanderPanel); },
    systemPanelBgStyle() { return this.bgImageStyle(this.assetNames.systemPanel); },
    behaviorPanelBgStyle() { return this.bgImageStyle(this.assetNames.panel); },
    rightPanelBgStyle() { return this.bgImageStyle(this.assetNames.rightPanel || this.assetNames.panel); },
    buttonBgStyle() { return this.bgImageStyle(this.assetNames.button); },
    exportBtnBgStyle() { return this.bgImageStyle(this.assetNames.exportBtn || this.assetNames.button); },
    accuracyBgStyle() { return this.bgImageStyle(this.assetNames.accuracy); },
    expertIconStyle() {
      if (!this.designAssetsEnabled) return {};
      const expertLevel = this.extractLevelFromString(this.expertDangerLevel);
      const levelImg = this.projectAssetUrl(this.getLevelImageName(expertLevel));
      if (!levelImg) return {};
      return {
        width: '98px',
        height: '84px',
        backgroundImage: `url('${levelImg}')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
        border: 'none',
        margin: 'auto'
      };
    },
    modelIconStyle() {
      if (!this.designAssetsEnabled) return {};
      const modelLevel = this.extractLevelFromString(this.modelDangerLevel);
      const levelImg = this.projectAssetUrl(this.getLevelImageName(modelLevel));
      if (!levelImg) return {};
      return {
        width: '98px',
        height: '84px',
        backgroundImage: `url('${levelImg}')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
        border: 'none',
        margin: 'auto'
      };
    }
  },
  watch: {
    imageList: {
      handler(newList) {
        this.logBehaviorGifStatus(newList);
        this.syncGifReplayTimer();
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    this.initializeDataFromStorage();
    this.loadVideoFromStorage();
    this.loadSourceImageList();
    this.loadDataFromModule4Res();
    // 新增：检查倒计时状态
    this.checkBiasTimerState();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    // 新增：组件销毁时清除定时器（防止内存泄漏，但 localStorage 依然保留）
    if (this.accuracyTimeout) clearTimeout(this.accuracyTimeout);
    this.clearGifReplayTimer();
    this.clearSourcePreview();
  },
  methods: {
    isGifImage(url) {
      const s = String(url || '').trim();
      if (!s) return false;
      return /\.gif(?:[?#].*)?$/i.test(s);
    },
    logBehaviorGifStatus(list) {
      const source = Array.isArray(list) ? list : [];
      const checks = [0, 1, 2, 3].map((idx) => {
        const src = source[idx] || '';
        return {
          index: idx + 1,
          src,
          isGif: this.isGifImage(src)
        };
      });
      console.log('[DecisionMaking][behavior-images] 四张图GIF判断', {
        checks,
        hasGif: checks.some(item => item.isGif)
      });
    },
    behaviorImageRenderKey(index) {
      const src = this.imageList && this.imageList[index] ? String(this.imageList[index]) : '';
      if (!src) return `empty-${index}`;
      if (!this.isGifImage(src)) return src;
      return `${src}::${this.gifReplayNonce[index] || 0}`;
    },
    behaviorImageSrc(index) {
      const src = this.imageList && this.imageList[index] ? String(this.imageList[index]) : '';
      if (!src) return '';
      if (!this.isGifImage(src)) return src;
      const nonce = this.gifReplayNonce[index] || 0;
      const sep = src.includes('?') ? '&' : '?';
      return `${src}${sep}gifReplayNonce=${nonce}`;
    },
    clearGifReplayTimer() {
      if (this.gifReplayTimer) {
        clearInterval(this.gifReplayTimer);
        this.gifReplayTimer = null;
      }
    },
    syncGifReplayTimer() {
      const hasGif = Array.isArray(this.imageList) && this.imageList.some(src => this.isGifImage(src));
      if (!hasGif) {
        this.clearGifReplayTimer();
        return;
      }
      if (this.gifReplayTimer) return;
      this.gifReplayTimer = setInterval(() => {
        for (let i = 0; i < 4; i++) {
          if (this.isGifImage(this.imageList[i])) {
            this.$set(this.gifReplayNonce, i, (this.gifReplayNonce[i] || 0) + 1);
          }
        }
      }, this.gifReplayIntervalMs);
    },
    escapeToHtml(text) {
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br/>');
    },
    formatAssessmentTextToList(text) {
      if (!text) return [];
      const ratingMap = {
        '顶级': 5,
        '卓越': 4,
        '优秀': 3,
        '良好': 2,
        '一般': 1
      };
      // 根据星星数量返回带颜色的HTML
      const getStarsWithColor = (count) => {
        const stars = '★'.repeat(count);
        let colorClass = '';
        if (count === 1 || count === 2) {
          colorClass = 'star-green';
        } else if (count === 3) {
          colorClass = 'star-blue';
        } else if (count === 4) {
          colorClass = 'star-yellow';
        } else if (count === 5) {
          colorClass = 'star-red';
        }
        return `<span class="${colorClass}">(${stars})</span>`;
      };
      // 定义需要加粗的属性标题
      const attributeTitles = [
        '态势感知与目标锁定能力',
        '生存能力与防护',
        '机动性与飞行性能',
        '武器系统',
        '作战半径和航程'
      ];
      const textStr = String(text);
      const result = [];

      const items = textStr.split(/[;\n]/).filter(item => item.trim());

      items.forEach(item => {
        const trimmed = item.trim();
        if (!trimmed) return;

        const fullMatch = trimmed.match(/^([^：:]+)[：:](.+?)[。.]?[（(]([^：:)]+)(?:[：:]([^）)]+))?[）)]/);

        if (fullMatch) {
          const [, attrName, content, rating, extraContent] = fullMatch;
          // 检查rating中是否已经包含星星符号
          const starMatch = rating.match(/★+/);
          let starCount = 0;
          if (starMatch) {
            starCount = starMatch[0].length;
          } else {
            starCount = ratingMap[rating] || 0;
          }
          const stars = starCount > 0 ? getStarsWithColor(starCount) : `(${rating})`;
          // 检查属性标题是否需要加粗
          const boldAttrName = attributeTitles.includes(attrName) ? `<strong>${attrName}</strong>` : attrName;
          let formattedItem = `${boldAttrName}：${content.trim()}。${stars}`;
          if (extraContent) {
            formattedItem += `：${extraContent}`;
          }
          result.push(formattedItem);
        } else {
          const simpleMatch = trimmed.match(/^(.+?)[。.]?[（(]([^：:)]+)(?:[：:]([^）)]+))?[）)]/);
          if (simpleMatch) {
            const [, content, rating, extraContent] = simpleMatch;
            // 检查rating中是否已经包含星星符号
            const starMatch = rating.match(/★+/);
            let starCount = 0;
            if (starMatch) {
              starCount = starMatch[0].length;
            } else {
              starCount = ratingMap[rating] || 0;
            }
            const stars = starCount > 0 ? getStarsWithColor(starCount) : `(${rating})`;
            // 检查内容中是否包含属性标题
            let formattedContent = content.trim();
            attributeTitles.forEach(title => {
              if (formattedContent.includes(title)) {
                formattedContent = formattedContent.replace(title, `<strong>${title}</strong>`);
              }
            });
            let formattedItem = `${formattedContent}。${stars}`;
            if (extraContent) {
              formattedItem += `：${extraContent}`;
            }
            result.push(formattedItem);
          } else {
            let formattedItem = trimmed;
            // 检查是否包含属性标题
            attributeTitles.forEach(title => {
              if (formattedItem.includes(title)) {
                formattedItem = formattedItem.replace(title, `<strong>${title}</strong>`);
              }
            });
            formattedItem = formattedItem.replace(/[（(]([^：:)]+)(?:[：:]([^）)]+))?[）)]/g, (match, rating, extraContent) => {
              // 检查rating中是否已经包含星星符号
              const starMatch = rating.match(/★+/);
              let starCount = 0;
              if (starMatch) {
                // 如果已经有星星，计算星星数量
                starCount = starMatch[0].length;
              } else {
                // 否则从ratingMap中获取
                starCount = ratingMap[rating] || 0;
              }
              const stars = starCount > 0 ? getStarsWithColor(starCount) : `(${rating})`;
              if (extraContent) {
                return `${stars}：${extraContent}`;
              }
              return stars;
            });
            result.push(formattedItem);
          }
        }
      });

      return result;
    },
    handleResize() {
      this.windowWidth = window.innerWidth;
      this.windowHeight = window.innerHeight;
    },
    /**
     * 去掉常见视频/文件扩展名，供 weapon_model 等传参使用（无扩展名则原样返回）
     */
    stripFileExtension(filename) {
      if (filename == null) return '';
      const s = String(filename).trim();
      if (!s) return '';
      return s.replace(/\.(mp4|webm|mov|avi|mkv|m4v|flv|wmv|jpg|jpeg|png|webp|gif|bmp)$/i, '');
    },
    initializeDataFromStorage() {
      try {
        const module3ResStr = localStorage.getItem('module3Res');
        if (module3ResStr) {
          const module3Res = JSON.parse(module3ResStr);
          if (module3Res.final_review) {
            this.thirdStageText = module3Res.final_review;
          }
        } else {
          this.thirdStageText = '未找到第三阶段信息，正在使用默认武器型号。';
        }

        const module1ResStr = localStorage.getItem('module1Res');
        if (module1ResStr) {
          const module1Res = JSON.parse(module1ResStr);
          const videoName = module1Res.video_name;
          if (videoName) {
            this.apiConfig.weaponModel = this.stripFileExtension(videoName);
          }
        }
      } catch (e) {
        this.thirdStageText = '加载信息时发生错误，请检查 LocalStorage 数据格式。';
      }
    },
    loadDataFromModule4Res() {
      try {
        const module4ResStr = localStorage.getItem('module4Res');
        if (module4ResStr) {
          const module4Data = JSON.parse(module4ResStr);

          this.performanceData = module4Data.performance_data || module4Data.performancedata || '暂无性能数据。';
          this.performanceDataLocal = module4Data.performance_data_local || '暂无本地性能数据。';

          const modelLevelNum = this.getLevelNum(module4Data.modelanalysisdangerlevel);
          const expertLevelNum = this.getLevelNum(module4Data.local_txt_danger_level);
          this.modelDangerLevel = `${modelLevelNum} !`;
          this.expertDangerLevel = `${expertLevelNum} !`;
          this.currentLevel = modelLevelNum;
          this.imageList = module4Data.imageList || [null, null, null, null];

          // --- 修改开始：关于 summary 的显示逻辑 ---
          // 只有当计时完成时，才直接显示结果。
          // 如果正在计时，checkBiasTimerState 会处理。
          // 如果未开始，显示默认提示。
          const isCompleted = localStorage.getItem('decisionBiasCompleted') === 'true';

          if (isCompleted && module4Data.summary) {
            const { behaviorInfo, samePoints, differentPoints } = this.parseSummaryText(module4Data.summary);
            this.behaviorInfo = behaviorInfo;
            this.samePoints = samePoints;
            this.differentPoints = differentPoints;
          } else {
            // 默认文案（未开始 或 正在计时中交由 checkBiasTimerState 处理）
            this.behaviorInfo = '请点击 "决策认知偏差检测"';
            this.samePoints = '请点击 "决策认知偏差检测"';
            this.differentPoints = '请点击 "决策认知偏差检测"';
          }

          // --- 修改重点：准确率的加载逻辑 ---
          // 只有在 localStorage 标记为"已完成"时，才直接显示准确率
          // 如果正在计时，由 checkBiasTimerState 来处理，这里不设置
          // (isCompleted 变量已在上方定义)
          const isTiming = localStorage.getItem('decisionBiasStartTime'); // 检查是否正在计时

          if (isCompleted && module4Data.average_comprehensive_accuracy !== undefined && module4Data.average_comprehensive_accuracy !== null) {
            // 已完成：直接显示准确率
            const accuracyValue = parseFloat(module4Data.average_comprehensive_accuracy);
            this.deviationDetectionAccuracy = isNaN(accuracyValue) ? 'N/A' : (accuracyValue * 100).toFixed(2);
          } else if (isTiming) {
            // 正在计时：先设置为"计算中..."，checkBiasTimerState 会恢复计时器
            this.deviationDetectionAccuracy = '计算中...';
            this.isBiasDetecting = true; // 确保按钮保持禁用状态
          } else {
            // 未开始：显示 N/A
            this.deviationDetectionAccuracy = 'N/A';
            this.isBiasDetecting = false;
          }
          // --- 修改结束 ---
        } else {
          this.performanceData = '请点击 "开始人机决策"';
          this.performanceDataLocal = '请点击 "开始人机决策"';
          this.behaviorInfo = '请点击 "决策认知偏差检测"';
          this.samePoints = '请点击 "决策认知偏差检测"';
          this.differentPoints = '请点击 "决策认知偏差检测"';
          this.imageList = [null, null, null, null];
          this.deviationDetectionAccuracy = 'N/A';
          this.modelDangerLevel = 'N/A';
          this.expertDangerLevel = 'N/A';
          this.currentLevel = 4;
        }
      } catch (e) {
        this.performanceData = '加载数据出错';
        this.performanceDataLocal = '加载数据出错';
      }
    },
    parseSummaryText(summaryText) {
      if (!summaryText) {
        return {
          behaviorInfo: '暂无行为信息',
          samePoints: '暂无相同点信息',
          differentPoints: '暂无不同点信息'
        };
      }

      try {
        let summary = summaryText;
        if (typeof summaryText === 'string' && summaryText.trim().startsWith('{')) {
          const parsed = JSON.parse(summaryText);
          summary = parsed.summary || summaryText;
        }

        const behaviorMatch = summary.match(/行为信息[：:]?\s*([^]*?)(?=相同点[：:]|$)/);
        const samePointsMatch = summary.match(/相同点[：:]?\s*([^]*?)(?=不同点[：:]|$)/);
        const differentPointsMatch = summary.match(/不同点[：:]?\s*([^]*?)$/);

        const behaviorInfo = behaviorMatch ? behaviorMatch[1].trim().replace(/^[\n\s]+|[\n\s]+$/g, '') : '暂无行为信息';
        const samePoints = samePointsMatch ? samePointsMatch[1].trim().replace(/^[\n\s]+|[\n\s]+$/g, '') : '暂无相同点信息';
        const differentPoints = differentPointsMatch ? differentPointsMatch[1].trim().replace(/^[\n\s]+|[\n\s]+$/g, '') : '暂无不同点信息';

        return { behaviorInfo, samePoints, differentPoints };
      } catch (error) {
        return {
          behaviorInfo: '解析行为信息失败',
          samePoints: '解析相同点失败',
          differentPoints: '解析不同点失败'
        };
      }
    },
    projectAssetUrl(name) {
      if (!this.designAssetsEnabled || !name) return '';
      try {
        return require(`@/assets/images/step4/${name}`);
      } catch (e) {
        console.warn('未找到素材：', name);
        return '';
      }
    },
    fileUrl(name) {
      return this.projectAssetUrl(name);
    },
    labelImageStyle(name, width = 160, height = 28) {
      if (!this.designAssetsEnabled || !name) return {};
      const url = this.projectAssetUrl(name);
      return {
        width: `${width}px`,
        height: `${height}px`,
        backgroundImage: `url('${url}')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
        color: '#e6faff'
      };
    },
    fullWidthLabelStyle(name, height = 28) {
      if (!this.designAssetsEnabled || !name) return {};
      const url = this.projectAssetUrl(name);
      return {
        width: '100%',
        height: `${height}px`,
        backgroundImage: `url('${url}')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
        color: '#e6faff'
      };
    },
    bgImageStyle(name) {
      if (!this.designAssetsEnabled || !name) return {};
      return {
        backgroundImage: `url('${this.projectAssetUrl(name)}')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%'
      };
    },
    async fetchBackendData() {
      if (!this.selectedSourceItem || !this.selectedSourceItem.name) {
        console.warn('[DecisionMaking] 未选择图片/视频，禁止开始人机决策');
        alert('请先在左侧列表选择图片或视频后，再开始人机决策。');
        return;
      }
      this.isLoading = true;
      this.isAssessing = true;
      this.isImageLoading = true;
      // 重置决策选择认知偏差检测结果文本为默认提示
      this.behaviorInfo = '请点击 "决策认知偏差检测"';
      this.samePoints = '请点击 "决策认知偏差检测"';
      this.differentPoints = '请点击 "决策认知偏差检测"';
      this.isBiasResultLoading = false;
      const selectedName = this.selectedSourceItem && this.selectedSourceItem.name
        ? String(this.selectedSourceItem.name).trim()
        : '';
      const isVideoSelection = this.selectedSourceItem && this.selectedSourceItem.type === 'video';
      const selectedNameNoExt = this.stripFileExtension(selectedName);
      const model = selectedNameNoExt;

      try {
        const requestBody = { weapon_model: model };
        console.log('[DecisionMaking] 开始人机决策-选择项参数', {
          selectedNameWithExt: selectedName,
          selectedNameNoExt,
          selectedType: this.selectedSourceItem && this.selectedSourceItem.type
        });
        console.log('[DecisionMaking] 开始人机决策 请求体:', requestBody, {
          api: `${API_BASE_URL}/analyze-weapon`,
          selectedSource: this.selectedSourceItem,
          listDisplayName: selectedName,
          listNameNoExt: selectedNameNoExt,
          isVideoSelection,
          weaponModelFromConfig: this.apiConfig.weaponModel
        });
        const mainResponse = await axios.post(`${API_BASE_URL}/analyze-weapon`, requestBody);
        const mainData = mainResponse.data;
        console.log('[DecisionMaking] analyze-weapon 完整响应 mainResponse.data:', mainData);
        if (mainData && mainData.data) {
          console.log('[DecisionMaking] analyze-weapon 业务数据 mainData.data:', mainData.data);
        }

        if (mainData.status === 'success') {
          const accuracyResponse = await axios.get(`${IMAGE_API_BASE_URL}/statistics/accuracy`);
          const accuracyData = accuracyResponse.data;
          console.log('[DecisionMaking] statistics/accuracy 完整响应 accuracyResponse.data:', accuracyData, {
            url: `${IMAGE_API_BASE_URL}/statistics/accuracy`
          });

          const imageResponse = await axios.get(`${IMAGE_API_BASE_URL}/weapon-all-images`, {
            params: { weapon_model: model }
          });
          const imageData = imageResponse.data;
          console.log('[DecisionMaking] weapon-all-images 完整响应 imageResponse.data:', imageData, {
            url: `${IMAGE_API_BASE_URL}/weapon-all-images`,
            params: { weapon_model: model }
          });

          if (imageData.images && Array.isArray(imageData.images)) {
            this.imageList = imageData.images
              .map(img => img.url)
              .slice(0, 4);
            while (this.imageList.length < 4) {
              this.imageList.push(null);
            }
          } else {
            this.imageList = [null, null, null, null];
          }

          const module4Res = {
            weapon_model: mainData.data.weapon_model,
            performance_data: mainData.data.performance_data,
            performancedata: mainData.data.performance_data,
            performance_data_local: mainData.data.performance_data_local,
            summary: mainData.data.summary,
            image_paths: mainData.data.image_paths,
            imageList: this.imageList,
            behavior_status: mainData.data.behavior_status,
            comprehensive_score: mainData.data.comprehensive_score,
            modelanalysisdangerlevel: mainData.data.model_analysis_danger_level,
            local_txt_danger_level: mainData.data.local_txt_danger_level,
            performance_cosine_similarity: mainData.data.performance_cosine_similarity,
            dangerlevelmatchrate: mainData.data.danger_level_match_rate,
            comprehensiveaccuracy: mainData.data.comprehensive_accuracy,
            deviation_value: mainData.data.deviation_value,
            coredimensionratingaccuracy: mainData.data.core_dimension_rating_accuracy,
            average_comprehensive_accuracy: accuracyData['average_comprehensive_accuracy']
          };
          console.log('[DecisionMaking] 合并后写入 localStorage 的 module4Res:', module4Res);
          localStorage.setItem('module4Res', JSON.stringify(module4Res));
          // 在成功获取数据并保存到 localStorage 后，重置偏差检测相关状态：
          localStorage.removeItem('decisionBiasStartTime');
          localStorage.removeItem('decisionBiasCompleted');
          if (this.accuracyTimeout) {
            clearTimeout(this.accuracyTimeout);
            this.accuracyTimeout = null;
          }

          // 重置偏差检测相关UI状态
          this.deviationDetectionAccuracy = 'N/A';
          this.isBiasDetecting = false;
          this.isBiasResultLoading = false;

          // 更新文本内容（如果有 summary）
          // 修改：即使有 summary，也不直接显示，而是等待用户点击“决策认知偏差检测”
          this.behaviorInfo = '请点击 "决策认知偏差检测"';
          this.samePoints = '请点击 "决策认知偏差检测"';
          this.differentPoints = '请点击 "决策认知偏差检测"';

          this.parseBackendData(mainData.data);
        } else {
          this.currentStageText = `分析接口数据获取失败：${(mainData.error && mainData.error.message) || '未知错误'}`;
          console.warn('[DecisionMaking] analyze-weapon 非 success:', mainData);
        }
      } catch (error) {
        this.currentStageText = '接口调用失败，请检查网络、CORS配置或后端服务';
        console.error('[DecisionMaking] 开始人机决策 接口失败:', error, {
          message: error && error.message,
          response: error && error.response && error.response.data,
          status: error && error.response && error.response.status
        });
      } finally {
        this.isLoading = false;
        this.isAssessing = false;
        this.isImageLoading = false;
      }
    },
    parseBackendData(backendData) {
      console.log('[DecisionMaking] parseBackendData 入参 backendData:', backendData);
      const currentThirdStageText = String(this.thirdStageText);
      if (!currentThirdStageText || currentThirdStageText.includes('正在加载') || currentThirdStageText.includes('未找到')) {
        this.thirdStageText = `发现目标武器型号：${backendData.weapon_model}，位于指定区域，行为模式初步匹配已知威胁，待进一步分析验证`;
      }

      const rawPerformanceData = backendData.performance_data || '暂无性能数据。';
      this.performanceData = rawPerformanceData;

      const rawPerformanceDataLocal = backendData.performance_data_local || '暂无本地性能数据。';
      this.performanceDataLocal = rawPerformanceDataLocal;

      const modelLevelNum = this.getLevelNum(backendData.model_analysis_danger_level);
      const expertLevelNum = this.getLevelNum(backendData.local_txt_danger_level);

      this.modelDangerLevel = `${modelLevelNum} !`;
      this.expertDangerLevel = `${expertLevelNum} !`;
      this.currentLevel = modelLevelNum;
    },
    // 新增：检查计时器状态（核心逻辑）
    checkBiasTimerState() {
      // 1. 如果已经标记完成，直接结束，显示结果（由 loadDataFromModule4Res 处理了数据展示）
      if (localStorage.getItem('decisionBiasCompleted') === 'true') {
        this.isBiasDetecting = false;
        this.isBiasResultLoading = false;
        return;
      }

      const startTimeStr = localStorage.getItem('decisionBiasStartTime');
      if (startTimeStr) {
        const startTime = parseInt(startTimeStr, 10);
        const now = Date.now();
        const elapsed = now - startTime;

        if (elapsed < BIAS_DETECTION_DELAY) {
          // 2. 如果还在 4分钟内，恢复计时器
          const remaining = BIAS_DETECTION_DELAY - elapsed;
          console.log(`恢复决策偏差检测计时，剩余时间: ${Math.round(remaining / 1000)}秒`);

          // 恢复 UI 状态
          this.isBiasDetecting = true; // 禁用按钮
          this.deviationDetectionAccuracy = '计算中...';

          // 检查文本是否应该已经显示（3秒后）
          const textDelay = 3000; // 文本延迟3秒
          if (elapsed >= textDelay) {
            // 已经超过3秒，文本应该显示，不需要 loading overlay
            this.isBiasResultLoading = false;
            // 恢复文本内容
            const module4ResStr = localStorage.getItem('module4Res');
            if (module4ResStr) {
              try {
                const module4Res = JSON.parse(module4ResStr);
                if (module4Res.summary) {
                  const { behaviorInfo, samePoints, differentPoints } = this.parseSummaryText(module4Res.summary);
                  this.behaviorInfo = behaviorInfo;
                  this.samePoints = samePoints;
                  this.differentPoints = differentPoints;
                }
              } catch (e) {
                console.error('恢复文本内容失败:', e);
              }
            }
          } else {
            // 还在5秒内，显示 loading
            this.isBiasResultLoading = true;
            // 设置定时器在5秒后显示文本
            setTimeout(() => {
              const module4ResStr = localStorage.getItem('module4Res');
              if (module4ResStr) {
                try {
                  const module4Res = JSON.parse(module4ResStr);
                  if (module4Res.summary) {
                    const { behaviorInfo, samePoints, differentPoints } = this.parseSummaryText(module4Res.summary);
                    this.behaviorInfo = behaviorInfo;
                    this.samePoints = samePoints;
                    this.differentPoints = differentPoints;
                  }
                } catch (e) {
                  console.error('恢复文本内容失败:', e);
                }
              }
              this.isBiasResultLoading = false;
            }, textDelay - elapsed);
          }

          // 启动剩余时间的定时器（用于准确率）
          this.startAccuracyTimer(remaining);
        } else {
          // 3. 时间已过但没标记完成（例如关机了很久再打开）
          this.handleTimerComplete();
        }
      } else {
        // 没有开始时间，确保状态正确
        this.isBiasDetecting = false;
        this.isBiasResultLoading = false;
      }
    },

    // 新增：启动定时器
    startAccuracyTimer(delay) {
      if (this.accuracyTimeout) clearTimeout(this.accuracyTimeout);

      this.accuracyTimeout = setTimeout(() => {
        this.handleTimerComplete();
      }, delay);
    },

    // 新增：计时结束处理逻辑
    handleTimerComplete() {
      console.log('[DecisionMaking] 决策认知偏差检测 计时结束 handleTimerComplete');
      this.isBiasDetecting = false;
      this.isBiasResultLoading = false;
      this.accuracyTimeout = null;

      // 标记完成，移除开始时间
      localStorage.setItem('decisionBiasCompleted', 'true');
      localStorage.removeItem('decisionBiasStartTime');

      // 从 localStorage 读取数据并显示准确率
      const module4ResStr = localStorage.getItem('module4Res');
      if (module4ResStr) {
        try {
          const data = JSON.parse(module4ResStr);
          console.log('[DecisionMaking] 计时结束读取 module4Res 用于准确率:', data);
          const accuracyValue = parseFloat(data.average_comprehensive_accuracy);
          this.deviationDetectionAccuracy = isNaN(accuracyValue) ? 'N/A' : (accuracyValue * 100).toFixed(2);
          console.log('[DecisionMaking] 偏差识别准确率展示值 deviationDetectionAccuracy:', this.deviationDetectionAccuracy);
        } catch (e) {
          this.deviationDetectionAccuracy = 'N/A';
        }
      }
    },
    // 修改：点击"决策认知偏差检测"按钮
    performDeviationDetection() {
      console.log('[DecisionMaking] 点击「决策认知偏差检测」：本页不向新接口请求，使用 localStorage.module4Res 做展示与计时');
      this.isBiasDetecting = true;
      this.isBiasResultLoading = true;
      this.deviationDetectionAccuracy = '计算中...';

      // 清空旧的显示，显示"分析中"（由isBiasResultLoading控制的遮罩层显示）
      this.behaviorInfo = '';
      this.samePoints = '';
      this.differentPoints = '';

      // 设置开始时间
      localStorage.setItem('decisionBiasStartTime', Date.now().toString());
      localStorage.removeItem('decisionBiasCompleted'); // 清除旧的完成标记

      try {
        const module4ResStr = localStorage.getItem('module4Res');
        if (module4ResStr) {
          const module4Res = JSON.parse(module4ResStr);
          console.log('[DecisionMaking] 决策认知偏差检测 使用的 module4Res（来自「开始人机决策」缓存）:', module4Res);

          // 模拟文本生成延迟（比如3秒后显示文本，但准确率要等4分钟）
          setTimeout(() => {
            if (module4Res.summary) {
              const { behaviorInfo, samePoints, differentPoints } = this.parseSummaryText(module4Res.summary);
              console.log('[DecisionMaking] 决策认知偏差检测 解析 summary 后的展示字段:', {
                rawSummary: module4Res.summary,
                behaviorInfo,
                samePoints,
                differentPoints
              });
              this.behaviorInfo = behaviorInfo;
              this.samePoints = samePoints;
              this.differentPoints = differentPoints;
            } else {
              this.behaviorInfo = '暂无行为信息';
              this.samePoints = '暂无相同点信息';
              this.differentPoints = '暂无不同点信息';
            }
            // 文本加载完了，loading 消失，但准确率还在计算中
            this.isBiasResultLoading = false;
          }, 3000);

          // 启动4分钟准确率计时
          this.startAccuracyTimer(BIAS_DETECTION_DELAY);
        } else {
          console.warn('[DecisionMaking] 决策认知偏差检测：localStorage 中无 module4Res');
          // 如果没有数据
          alert('请先点击 "开始人机决策" 获取数据');
          this.isBiasDetecting = false;
          this.isBiasResultLoading = false;
          this.deviationDetectionAccuracy = 'N/A';
          localStorage.removeItem('decisionBiasStartTime');
        }
      } catch (e) {
        console.error(e);
        this.isBiasDetecting = false;
      }
    },
    getLevelNum(backendLevel) {
      const numMap = { '危险等级1': 1, '危险等级2': 2, '危险等级3': 3, '危险等级4': 4 };
      return numMap[backendLevel] || 4;
    },
    getLevelImageName(level) {
      switch (level) {
        case 1: return this.assetNames.level1;
        case 2: return this.assetNames.level2;
        case 3: return this.assetNames.level3;
        default: return this.assetNames.level4;
      }
    },
    extractLevelFromString(levelString) {
      if (!levelString) return 4;
      const match = levelString.toString().match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 4;
    },
    async loadSourceImageList() {
      // 图片与视频分开加载，避免任一失败影响另一方显示
      let imageFiles = [];
      let videoFiles = [];
      try {
        const imageCtx = require.context('../../static/Image_input', true, /\.(png|jpe?g|webp|gif)$/i);
        imageCtx.keys().forEach((key) => {
          const normalized = key.replace(/^\.\//, '');
          const fileName = normalized.split('/').filter(Boolean).pop() || normalized;
          imageFiles.push({
            name: fileName,
            path: `image:${normalized}`,
            type: 'image'
          });
        });
        imageFiles.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
      } catch (error) {
        console.error('加载 static/Image_input 列表失败:', error);
        imageFiles = [];
      }

      try {
        // 视频列表改为读取静态清单，避免 webpack 解析二进制视频文件
        const response = await axios.get('/static/Vedio_input/files.json');
        const rawVideoList = response && response.data;
        const videoNameList = this.parseStaticFileList(rawVideoList);
        videoFiles = videoNameList.map((name) => ({
          name,
          path: `video:${name}`,
          type: 'video'
        }));
        videoFiles.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
      } catch (error) {
        console.error('加载 static/Vedio_input/files.json 失败:', error);
        videoFiles = [];
      }

      this.sourceImageList = imageFiles;
      this.sourceVideoList = videoFiles;
      this.sourceImageMessage = '请选择数据类型';
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
    switchSourceMode(mode) {
      if (mode !== 'image' && mode !== 'video') return;
      this.clearSourcePreview();
      this.sourceSelectorMode = mode;
      this.selectedSourceImagePath = null;
      this.selectedSourceItem = null;
      this.sourceImageMessage = mode === 'image'
        ? (this.sourceImageList.length ? '' : 'static/Image_input 暂无可用图片')
        : (this.sourceVideoList.length ? '' : 'static/Vedio_input 暂无可用视频');
    },
    backToSourceMenu() {
      this.clearSourcePreview();
      this.sourceSelectorMode = 'menu';
      this.selectedSourceImagePath = null;
      this.selectedSourceItem = null;
      this.sourceRefineText = '';
      this.sourceRefineCommand = '';
      this.sourceRefineNegotiation = '';
      this.thirdStageText = '';
      this.sourceImageMessage = '请选择数据类型';
    },
    backToSourceList() {
      const type = this.sourcePreviewType === 'video' ? 'video' : 'image';
      this.clearSourcePreview();
      this.sourceSelectorMode = type;
      this.sourceRefineText = '';
      this.sourceRefineCommand = '';
      this.sourceRefineNegotiation = '';
      this.thirdStageText = '';
      this.sourceImageMessage = type === 'image'
        ? (this.sourceImageList.length ? '' : 'static/Image_input 暂无可用图片')
        : (this.sourceVideoList.length ? '' : 'static/Vedio_input 暂无可用视频');
    },
    clearSourcePreview() {
      if (this.sourcePreviewUrl) {
        try {
          URL.revokeObjectURL(this.sourcePreviewUrl);
        } catch (e) {
          // ignore revoke failure
        }
      }
      this.sourcePreviewUrl = null;
      this.sourcePreviewType = '';
      this.sourcePreviewMessage = '';
    },
    async loadSourceInfo(item) {
      if (!item || !item.name || !item.type) return;
      const filename = String(item.name).trim();
      if (!filename) return;
      const filenameNoExt = this.stripFileExtension(filename);
      this.sourceRefineText = '';
      this.sourceRefineCommand = '';
      this.sourceRefineNegotiation = '';
      console.log('[DecisionMaking][selectSource] 选中媒体', {
        rawItem: item,
        filename,
        filenameNoExt,
        mediaType: item.type
      });
      this.fetchMachineRefineCommand(filenameNoExt);

      const endpoint = item.type === 'video' ? '/load-video' : '/load-image';
      const fullUrl = `${API_BASE_URL}${endpoint}`;
      const logTag = '[DecisionMaking][loadSourceInfo]';
      try {
        this.sourcePreviewMessage = '媒体加载中...';
        console.log(`${logTag} 请求`, {
          endpoint,
          fullUrl,
          params: { filename: filenameNoExt },
          originalFilename: filename,
          itemType: item.type,
          itemPath: item.path
        });
        const response = await axios.get(fullUrl, {
          params: { filename: filenameNoExt },
          responseType: 'blob'
        });
        const ct = response && response.headers && (response.headers['content-type'] || response.headers['Content-Type']);
        const payload = response && response.data !== undefined ? response.data : null;
        const payloadType = payload && payload.constructor ? payload.constructor.name : typeof payload;
        const preview = payload && typeof payload.size === 'number'
          ? `Blob(size=${payload.size}, type=${payload.type || 'unknown'})`
          : String(payload);
        console.log(`${logTag} 响应`, {
          status: response && response.status,
          contentType: ct,
          dataType: payloadType,
          dataPreview: preview,
          rawHeadersSample: response && response.headers
            ? { 'content-type': ct }
            : null
        });
        if (payload == null || payload === '') {
          this.sourcePreviewMessage = '后端未返回有效媒体内容';
          return;
        }
        this.clearSourcePreview();
        const blobType = (payload && payload.type) || ct || (item.type === 'video' ? 'video/mp4' : 'image/jpeg');
        const mediaBlob = payload instanceof Blob ? payload : new Blob([payload], { type: blobType });
        this.sourcePreviewUrl = URL.createObjectURL(mediaBlob);
        const lowerType = String(blobType || '').toLowerCase();
        this.sourcePreviewType = lowerType.includes('video') ? 'video' : (lowerType.includes('image') ? 'image' : item.type);
        this.sourceSelectorMode = 'preview';
        this.sourcePreviewMessage = '';
        if (this.sourceRefineText) {
          this.thirdStageText = this.sourceRefineText;
        } else {
          this.thirdStageText = `已加载媒体文件：${filename}`;
        }
        console.log(`${logTag} 预览设置完成`, {
          sourcePreviewType: this.sourcePreviewType,
          sourceSelectorMode: this.sourceSelectorMode,
          thirdStageText: this.thirdStageText
        });
      } catch (error) {
        const errRes = error && error.response;
        console.error(`${logTag} 失败`, {
          endpoint,
          fullUrl,
          params: { filename: filenameNoExt },
          originalFilename: filename,
          message: error && error.message,
          status: errRes && errRes.status,
          contentType: errRes && errRes.headers && (errRes.headers['content-type'] || errRes.headers['Content-Type']),
          responseData: errRes && errRes.data
        });
        this.sourcePreviewMessage = `加载媒体失败：${filename}`;
        this.thirdStageText = `加载媒体失败：${filename}`;
      }
    },
    async fetchMachineRefineCommand(nameNoExt) {
      const cleanName = String(nameNoExt || '').trim();
      if (!cleanName) return;
      const logTag = '[DecisionMaking][machine-refine-command]';
      try {
        console.log(`${logTag} 发起请求`, {
          url: REFINE_COMMAND_API_URL,
          params: { name: cleanName }
        });
        const response = await axios.get(REFINE_COMMAND_API_URL, {
          params: { name: cleanName }
        });
        console.log(`${logTag} 原始响应`, {
          status: response && response.status,
          headers: response && response.headers,
          data: response && response.data
        });
        const raw = response && response.data;
        const payload = raw && typeof raw === 'object' && raw.data ? raw.data : raw;
        const command = payload && payload.command !== undefined ? String(payload.command).trim() : '';
        const negotiation = payload && payload.negotiation !== undefined ? String(payload.negotiation).trim() : '';
        console.log(`${logTag} 解析结果`, {
          payload,
          command,
          negotiation,
          commandLength: command.length,
          negotiationLength: negotiation.length
        });
        if (!command && !negotiation) {
          console.warn(`${logTag} 返回数据缺少 command/negotiation`, { raw });
          return;
        }
        this.sourceRefineText = `command：${command || '暂无'}\n\nnegotiation：${negotiation || '暂无'}`;
        this.sourceRefineCommand = command || '';
        this.sourceRefineNegotiation = negotiation || '';
        this.thirdStageText = this.sourceRefineText;
        console.log(`${logTag} 展示已更新`, {
          request: { name: cleanName },
          commandPreview: command.slice(0, 80),
          negotiationPreview: negotiation.slice(0, 80),
          thirdStageText: this.thirdStageText
        });
      } catch (error) {
        const status = error && error.response && error.response.status;
        const msg = error && error.message;
        console.error(`${logTag} 请求失败`, {
          request: { name: cleanName },
          status,
          message: msg,
          responseData: error && error.response && error.response.data
        });
      }
    },
    selectSourceImage(item) {
      if (!item || !item.path) return;
      this.selectedSourceImagePath = item.path;
      this.selectedSourceItem = item;
      this.loadSourceInfo(item);
    },
    loadVideoFromStorage() {
      try {
        const module1ResStr = localStorage.getItem('module1Res');
        if (module1ResStr) {
          const module1Res = JSON.parse(module1ResStr);
          const videoPath = module1Res.originalVideoPath;
          if (videoPath && videoPath !== '无原视频路径') {
            this.testVideoUrl = videoPath;
          } else {
            this.testVideoMessage = '在 module1Res 中未找到或路径无效。';
          }
        } else {
          this.testVideoMessage = '未在 LocalStorage 中找到 "module1Res" 对象。';
        }
      } catch (e) {
        this.testVideoMessage = '加载视频时出错，请检查 module1Res 格式。';
      }
    },
    handleVideoError(e) {
      this.testVideoMessage = "视频加载失败，请检查 LocalStorage 中的 URL 是否正确。";
      this.testVideoUrl = null;
    },
    async exportData() {
      try {
        // 调用后端接口下载zip文件
        const response = await axios.get(`${API_BASE_URL}/export/output`, {
          responseType: 'blob', // 重要：指定响应类型为blob
          timeout: 60000 // 设置超时时间为60秒
        });

        // 创建blob对象
        const blob = new Blob([response.data], { type: 'application/zip' });

        // 从响应头中获取文件名，如果没有则使用默认名称
        const contentDisposition = response.headers['content-disposition'];
        let filename = `output_files_${new Date().toISOString().slice(0, 19).replace(/:/g, '')}.zip`;
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '');
            // 处理可能的UTF-8编码文件名
            if (filename.startsWith('UTF-8\'\'')) {
              filename = decodeURIComponent(filename.replace(/^UTF-8''/, ''));
            }
          }
        }

        // 创建下载链接
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error('导出失败:', error);
        alert('导出失败，请重试。错误信息：' + (error.message || '未知错误'));
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
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

/* 基础重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.section {
  background-color: #030a1c;
  background-image: url('~@/assets/images/step4/背景.png');
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
  color: #e0e0e0;
  font-family: "Helvetica Neue", sans-serif;
  overflow: hidden;
  position: relative;
  width: 100%;
}

.section::before,
.section::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 24px;
  background-repeat: no-repeat;
  background-size: contain;
  z-index: 2;
  pointer-events: none;
}

.section::before {
  left: 0;
  background-image: url('~@/assets/images/step4/装饰-左.png');
}

.section::after {
  right: 0;
  background-image: url('~@/assets/images/step4/装饰-右.png');
}

.register,
.img_box {
  display: none;
}

@mixin sci-fi-border {
  border: 2px solid;
  border-image-slice: 1;
  border-image-source: linear-gradient(to bottom, #00e0ff, #005f7f, #00e0ff);
  background: rgba(10, 25, 50, 0.6);
  backdrop-filter: blur(5px);
}

@mixin sci-fi-label {
  background: linear-gradient(to right, #00e0ff, #005f7f);
  color: #030a1c;
  padding: 4px 15px;
  font-weight: bold;
  text-align: center;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 4px;
  font-size: 0.9rem;
  white-space: nowrap;
}

.top-nav-left,
.top-nav-right {
  position: absolute;
  top: 10px;
  z-index: 10;
}

.top-nav-left {
  left: 20px;
  display: flex;
  gap: 10px;
}

.top-nav-right {
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
}

.nav-btn {
  @include sci-fi-border;
  font-family: 'DOUYUFont';
  font-size: 14px;
  background: rgba(10, 25, 50, 0.9);
  color: #00e0ff;
  padding: 5px 15px;
  cursor: pointer;
  border-radius: 4px;
  font-weight: bold;
  border: 1px solid #005f7f;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(20, 40, 70, 0.9);
    color: #fff;
  }
}

.title-container {
  text-align: center;
  padding: 15px 0;
  margin-bottom: 0;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 5;

  &.use-assets,
  .use-assets & {
    &::before {
      content: "";
      position: absolute;
      inset: 0;
      margin: 0 auto;
      width: min(980px, 92%);
      background: url('~@/assets/images/step4/标题栏.png') no-repeat center/contain;
      z-index: -1;
      pointer-events: none;
    }
  }
}

.newTitle {
  width: 484px;
  height: 40px;
  font-family: DOUYUFont;
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

.use-assets {
  .design-module {
    border: none;
    background: transparent;
    backdrop-filter: none;
    background-repeat: no-repeat;
    background-size: '100% 100%';
  }

  .design-module .design-module-content.text-scrollable {
    overflow-y: auto !important;
  }

  .nav-btn {
    border: none;
    background: transparent;
    color: #ffffff;
    text-shadow: 0 0 6px rgba(0, 0, 0, 0.8);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 120px;
    height: 40px;
    padding: 0;
    font-weight: bold;
  }

  .nav-btn.nav-home {
    background: url('~@/assets/images/step4/首页按键.png') no-repeat center/contain;
  }

  .nav-btn.nav-back {
    background: url('~@/assets/images/step4/返回按键.png') no-repeat center/contain;
  }

  .top-nav-right .nav-btn.nav-next {
    width: 100px;
    background: url('~@/assets/images/step4/下一页按键.png') no-repeat center/contain;
  }

  .accuracy-box,
  .export-btn {
    border: none;
    background: transparent;
  }
}

.core-layout-design {
  display: flex;
  height: calc(100vh - 80px);
  padding: 10px 20px 20px 20px;
  gap: 20px;
}

.design-left-column {
  width: 25%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: 100%;
}

.design-center-column {
  width: 45%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.design-right-column {
  width: 30%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 5px;
  height: 100%;
  position: relative;
  z-index: 2;
}

.design-module {
  @include sci-fi-border;
  position: relative;
  padding-top: 15px;
  display: flex;
  flex-direction: column;
  border-radius: 5px;
}

.assessment-module .design-module-content.text-scrollable {
  overflow-y: auto !important;
  height: 100% !important;
}

.assessment-module .design-module-content,
.result-log-module .design-module-content,
.text-module-left .design-module-content {
  overflow-y: auto;
  max-height: 100%;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(10, 25, 50, 0.3);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #00e0ff;
    border-radius: 4px;
  }
}

.assessment-content-box {
  flex-grow: 1;
  background-color: transparent;
  border: none;
  box-shadow: none;
  color: #FFFFFF;
  font-family: DOUYUFont;
  font-weight: 400;
  font-size: 14px;
  font-style: normal;
  text-decoration: none;
  text-align: left;
  line-height: 1.6;
  padding: 15px !important;
  overflow-y: auto;
  border-radius: 0;
  width: 100%;
  height: 100%;
}

.assessment-content-box::-webkit-scrollbar {
  width: 6px;
}

.assessment-content-box::-webkit-scrollbar-thumb {
  background: #00e5ff;
  border-radius: 3px;
}

.assessment-content-box::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-list li {
  position: relative;
  padding: 10px 0;
  margin: 0;
  line-height: 1.6;
  color: #FFFFFF;
  font-family: DOUYUFont;
  font-weight: 400;
  font-size: 14px;
  font-style: normal;
  text-decoration: none;
  text-align: left;
  padding-left: 0;
  padding-right: 0;
}

.info-list li strong {
  font-weight: bold;
  color: #fff;
}

.info-list li:before {
  display: none;
}

.info-list li::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-image: url('~@/assets/images/step2/yellowline.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
}

.text-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #e0e0e0;
  margin: 0;
}

.assessment-module .text-content {
  font-family: DOUYUFont;
  color: #FFFFFF;
  font-weight: 400;
  font-size: 14px;
  font-style: normal;
  text-decoration: none;
  text-align: left;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  color: #00e0ff;
  font-size: 0.9rem;
}

.video-module {
  flex: 0 0 auto;
  width: 100%;
  height: 250px;
  background-image: url('~@/assets/images/step1/-s-框-小视频.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  position: relative;
  padding-top: 0 !important;

  .video-content-wrapper {
    padding: 0;
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: stretch;
    overflow: hidden;
  }

  .source-type-menu {
    width: 92%;
    max-width: 340px;
    margin: 14px auto 20px auto;
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }

  .source-type-btn {
    width: 110px;
    height: 42px;
    border-radius: 6px;
    border: 1px solid rgba(0, 229, 255, 0.6);
    background: rgba(0, 100, 150, 0.25);
    color: #fff;
    font-family: DOUYUFont;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .source-type-btn:hover {
    background: rgba(0, 229, 255, 0.35);
    border-color: #00e5ff;
  }

  .source-back-btn {
    align-self: flex-start;
    margin: 8px 0 0 20px;
    border: none;
    background: transparent;
    color: #fff;
    font-family: DOUYUFont;
    font-size: 13px;
    cursor: pointer;
    padding: 0;
  }

  .source-preview-wrapper {
    width: 92%;
    max-width: 340px;
    margin: 8px auto 20px auto;
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 1px solid rgba(0, 229, 255, 0.35);
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.25);
  }

  .source-preview-media {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 4px;
  }

  .server-video-list {
    width: 92%;
    max-width: 340px;
    margin: 8px auto 20px auto;
    flex-grow: 1;
    max-height: calc(100% - 42px);
    padding-right: 10px;
    min-height: 0;
    box-sizing: border-box;
  }

  .server-video-list::-webkit-scrollbar {
    width: 6px;
  }

  .server-video-list::-webkit-scrollbar-thumb {
    background: #00e5ff;
    border-radius: 3px;
  }

  .server-video-list::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
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
    color: #fff;
    user-select: none;
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

  .video-placeholder-text {
    color: #999;
    font-size: 0.9rem;
  }
}

.text-module-left {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  position: relative;
}

.standalone-label {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  color: #e6faff;
  font-weight: bold;
  font-size: 0.95rem;
  padding-left: 40px;
  margin-bottom: 6px;
  background: linear-gradient(to right, #00e0ff, #005f7f);
}

.use-assets .standalone-label {
  background: transparent;
}

.fixed-left-text {
  position: relative;
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0 !important;
}

.fixed-left-text .panel-header {
  margin-top: 0;
  margin-bottom: 10px;
  padding-left: 0;
}

.fixed-left-text .design-module-content {
  flex: 1 1 auto;
  min-height: 0;
  padding: 10px 25px 30px 25px !important;
}

.button-container {
  flex: 0 0 auto;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;

  .inference-btn {
    position: relative !important;
    width: 250px;
    height: 100px;
    font-family: DOUYUFont;
    color: #FFFFFF;
    font-weight: 400;
    font-size: 20px;
    font-style: normal;
    text-decoration: none;
    text-align: left;
    display: block;
    background-image: url('~@/assets/images/step4/开始测验.png');
    border: none;
    border-radius: 4px;
    background-color: transparent;
    box-shadow: none;
  }

  .inference-btn:disabled {
    filter: grayscale(80%);
    cursor: not-allowed;
  }
}

.assessment-module {
  flex: 0 0 auto;
  height: 200px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &.machine-assessment {
    order: 1;
    margin-bottom: 10px;
  }

  &.commander-assessment {
    order: 3;
    margin-top: 10px;
  }

  .assessment-content {
    display: flex;
    padding: 15px;
    gap: 15px;
    height: 100%;
  }

  .assessment-left-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
  }

  .assessment-middle-section {
    flex: 1;
    display: flex;
    gap: 15px;
    min-width: 0;
  }

  .assessment-module .design-module-content {
    flex: 1;
    height: 100%;
    position: relative;
  }
}

.behavior-module {
  flex: 1 1 auto;
  min-height: 200px;
  order: 2;
  padding-top: 18px;

  .design-module-label {
    width: 200px !important;
    height: 35px !important;
    margin: 0 auto 0 auto !important;
    /* 往上移动：从 5px 改为 0 */
    // background: transparent !important;
    justify-content: center !important;
    align-items: center !important;
    padding: 0 !important;
    font-size: 12px !important;
    /* --- 修改开始 --- */
    box-sizing: border-box !important;
    /* 关键 */
    line-height: normal !important;
    /* 取消固定的 line-height，允许 padding 发挥作用 */
    padding-top: 6px !important;
    /* 增加这个值让文字往下移 (试着调 4px - 8px) */
    /* --- 修改结束 --- */
  }

  .behavior-content {
    flex-grow: 1;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    padding: 0 15px 15px 15px;
    gap: 20px;
  }

  .flanking-image-column {
    display: flex;
    flex-direction: column;
    gap: 15px;
    flex-basis: 35%;
    height: 100%;
  }

  .image-item {
    flex: 1;
    @include sci-fi-border;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
  }

  .image-display {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .pyramid-legend-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    min-width: 120px;
    align-self: center;
  }

  .level-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    justify-content: center;
    width: 140px;

    .legend-item {
      font-size: 0.65rem;
      font-weight: bold;
      flex: 0 0 45%;
      text-align: center;
      margin-bottom: 2px;

      &.level-1 {
        color: #FF0000;
        text-shadow: 0 0 5px #FF0000;
      }

      &.level-2 {
        color: #FFC118;
        text-shadow: 0 0 5px #FFC118;
      }

      &.level-3 {
        color: #2BC3FF;
        text-shadow: 0 0 5px #2BC3FF;
      }

      &.level-4 {
        color: #7EFF00;
        text-shadow: 0 0 5px #7EFF00;
      }
    }
  }
}

/* =========================================
   核心修复：标题通用样式重置
   ========================================= */
.panel-header,
.design-module-label {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  text-align: center !important;
  padding: 0 !important;
  margin: 0 auto !important;
  /* 强制居中 */

  /* 字体统一 */
  font-family: DOUYUFont !important;
  color: #FFFFFF !important;
  font-weight: 400 !important;
  font-size: 14px !important;
  text-decoration: none !important;
}

/* 去除特定标题框的光圈和背景色 */
.clean-header {
  border: none !important;
  box-shadow: none !important;
  background-color: transparent !important;
  /* 确保只显示背景图 */
  outline: none !important;
}

/* 无人机侦察数据 & 群体协商认知传播信息 标题 */
.video-module .panel-header,
.text-module-left .panel-header {
  /* 确保盒模型正确，防止 padding 撑大高度 */
  box-sizing: border-box !important;

  /* 核心修改：增加顶部内边距，把文字往下推 */
  padding-top: 5px !important;
  /* 建议值：8px - 12px，数字越大文字越靠下 */
  padding-bottom: 0 !important;
  /* 确保底部没有内边距反向顶它 */
  width: 350px !important;
  height: 50px !important;
  margin-top: 5px !important;
  margin-bottom: 6px !important;
  background-image: url('~@/assets/images/step1/-s-二级标题.png') !important;
  background-repeat: no-repeat !important;
  background-size: 100% 100% !important;
}

/* 机器评估和指挥员评估标题 */
.assessment-title {
  font-family: DOUYUFont;
  color: #FFFFFF;
  font-weight: 400;
  font-size: 14px;
  font-style: normal;
  text-decoration: none;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 5px;
  width: auto;
  white-space: nowrap;
}

/* 决策选择认知偏差检测结果标题框 */
.panel-right-top .panel-header.header-results {

  /* 确保盒模型正确，防止 padding 撑大高度 */
  box-sizing: border-box !important;

  /* 核心修改：增加顶部内边距，把文字往下推 */
  padding-top: 5px !important;
  /* 建议值：8px - 12px，数字越大文字越靠下 */
  padding-bottom: 0 !important;
  /* 确保底部没有内边距反向顶它 */
  width: 350px !important;
  /* 保持一致宽度或根据原图调整 */
  height: 50px !important;
  margin-top: 5px !important;
  margin-bottom: 0 !important;
  background-image: url('~@/assets/images/step1/-s-二级标题.png') !important;
  background-repeat: no-repeat !important;
  background-size: 100% 100% !important;
}

.panel-right-top {
  height: 63%;
  flex-shrink: 0;
  width: 100%;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  margin-bottom: 20px;
  background-image: url('~@/assets/images/step1/弹框-偏差检测结果.png');
}

.panel-right-top .panel-content {
  display: flex;
  flex-direction: column;
  padding: 0 !important;
  height: 100%;
}

.results-scroll-container {
  flex: 1;
  overflow-y: auto;
  position: relative;
  min-height: 0;
  margin-top: 10px;
  padding: 0 25px 30px 25px;
}

.results-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.results-scroll-container::-webkit-scrollbar-thumb {
  background: #00e5ff;
  border-radius: 3px;
}

.results-scroll-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

.result-section {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.result-section:last-child {
  margin-bottom: 0;
}

.section-header {
  color: #00e5ff;
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.section-content {
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid #00e0ff;
  border-radius: 5px;
  padding: 15px;
  overflow-y: auto;
  position: relative;
}

.section-content::-webkit-scrollbar {
  width: 6px;
}

.section-content::-webkit-scrollbar-thumb {
  background: #00e5ff;
  border-radius: 3px;
}

.section-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

.small-section .section-content {
  min-height: 60px;
  max-height: 60px;
}

.consensus-section .section-content {
  min-height: 180px;
  max-height: 180px;
  overflow-y: auto;
}

/* 左侧“指令信息”单独拉长，不改变“群体协商认知传播信息”区域高度 */
.left-info-section.small-section .section-content {
  min-height: 120px;
  max-height: 120px;
  overflow-y: auto;
}

.left-info-section.consensus-section .section-content {
  min-height: 180px;
  max-height: 180px;
  overflow-y: auto;
}

.different-section .section-content {
  min-height: 60px;
  overflow-y: auto;
}

.result-text {
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0;
  white-space: pre-line;
  color: #e0e0e0;
}

.different-points {
  color: #ff6b6b !important;
  font-weight: bold;
}

.panel-right-accuracy {
  flex-shrink: 0;
  width: 100%;
  background-image: url('~@/assets/images/step4/准确率框.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  margin-bottom: 20px;
  padding: 20px 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  margin-top: -15px;
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
  font-size: 1rem;
  font-weight: bold;
  white-space: nowrap;
}

.accuracy-label-group {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.formula-tooltip-trigger {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid rgba(0, 229, 255, 0.8);
  color: #00e5ff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  cursor: help;
  user-select: none;
}

.formula-tooltip {
  position: absolute;
  left: 0;
  top: calc(100% + 8px);
  min-width: 430px;
  max-width: 520px;
  padding: 8px 10px;
  border: 1px solid rgba(0, 229, 255, 0.5);
  border-radius: 6px;
  background: rgba(4, 18, 32, 0.95);
  color: #d8f6ff;
  font-size: 12px;
  line-height: 1.5;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);
  white-space: normal;
  z-index: 20;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-2px);
  transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s ease;
  pointer-events: none;
}

.formula-math {
  display: block;
  font-weight: 600;
  font-size: 14px;
  line-height: 1.4;
  letter-spacing: 0.02em;
  font-variant: normal;
}

.f-term {
  display: inline;
}

.f-product {
  display: inline;
  margin: 0 0.1em;
}

.f-group {
  display: inline-block;
  vertical-align: middle;
  margin: 0 0.05em;
  font-style: normal;
  font-weight: 600;
}

.f-sub {
  font-size: 0.7em;
  line-height: 0;
  font-weight: 600;
}

.f-op {
  display: inline;
  margin: 0 0.2em;
  font-weight: 700;
}

.f-greek {
  font-style: normal;
  font-weight: 700;
  margin: 0 0.15em 0 0.05em;
}

.f-paren {
  display: inline;
  font-weight: 600;
  margin: 0 0.1em 0 0.05em;
  white-space: nowrap;
}

.f-mul-gap {
  display: inline-block;
  width: 0.2em;
}

.accuracy-label-group:hover .formula-tooltip,
.accuracy-label-group:focus-within .formula-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.accuracy-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #00e5ff;
  text-shadow: 0 0 10px #00e5ff, 0 0 20px rgba(0, 229, 255, 0.5);
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.loading-spinner {
  color: #00e5ff;
  font-size: 1.2rem;
  text-shadow: 0 0 5px #00e5ff;
}

.panel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
}

.panel-right-button {
  flex-shrink: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 0;
  min-height: 70px;
  background: none !important;
  background-image: none !important;
}

.panel-right-bias-button {
  flex-shrink: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 0 12px 0;
  min-height: 70px;
  background: none !important;
}

.btn-bias-detect {
  position: relative !important;
  background: none;
  border: none;
  cursor: pointer;
  width: 250px;
  height: 100px;
  background-image: url('~@/assets/images/step3/greenbutton.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  font-family: DOUYUFont;
  color: #FFFFFF;
  font-weight: 400;
  font-size: 14px;
  font-style: normal;
  text-decoration: none;
  display: block;
  margin: 0 auto;
  margin-bottom: -50px;
  margin-top: -60px;
}

.btn-bias-detect:disabled {
  filter: grayscale(80%);
  cursor: not-allowed;
}

.btn-export-result {
  position: relative !important;
  background-color: transparent !important;
  box-shadow: none !important;
  background-image: url('~@/assets/images/step1/-s-按钮-结果导出.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
  border: none;
  cursor: pointer;
  width: 250px;
  height: 100px;
  font-family: DOUYUFont;
  color: #FFFFFF;
  font-weight: 400;
  font-size: 23px;
  font-style: normal;
  text-decoration: none;
  display: block;
  margin: 0 auto;
  transition: all 0.3s ease;
  padding: 0;
  margin-top: -20px;
}

.btn-export-result:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

.btn-export-result:disabled {
  filter: grayscale(80%);
  cursor: not-allowed;
}

/* =========================================
   核心修复：按钮文字绝对定位调试
   ========================================= */
.btn-text-pos {
  position: absolute;
  /* 调整这里 top 和 left 的数值来移动文字 */
  top: 60%;
  left: 60%;
  transform: translate(-50%, -50%);
  /* 保持居中基准 */

  white-space: nowrap;
  pointer-events: none;
  z-index: 2;
}

/* Spinner 绝对定位 */
.btn-spinner-pos {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
}

/* 独立微调示例（您可以根据需要取消注释并修改数值） */
/* .inference-btn .btn-text-pos {
  top: 48%;
  left: 55%;
}
.btn-bias-detect .btn-text-pos {
  top: 50%;
  left: 50%;
}
*/

.core-layout-design::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: min(1120px, 96%);
  height: 40px;
  background: url('~@/assets/images/step4/底部.png') no-repeat center/contain;
  pointer-events: none;
  opacity: .95;
}
</style>

<style lang="scss">
/* 全局样式，用于处理 v-html 插入的内容 */
.star-green {
  color: #7EFF00 !important;
  text-shadow: 0 0 5px #7EFF00;
}

.star-blue {
  color: #2BC3FF !important;
  text-shadow: 0 0 5px #2BC3FF;
}

.star-yellow {
  color: #FFC118 !important;
  text-shadow: 0 0 5px #FFC118;
}

.star-red {
  color: #FF0000 !important;
  text-shadow: 0 0 5px #FF0000;
}
</style>
