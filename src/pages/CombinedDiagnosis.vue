<template>
  <div class="attribution-diagnosis-container">
    <!-- 顶部导航按钮 -->
    <b-row class="header-bar align-items-center no-gutters">
      <b-col cols="4" class="text-left">
        <button class="header-btn btn-home" @click="$router.push('/')">首页</button>
        <button class="header-btn btn-back" @click="$router.push('/decisionmaking')">上个页面</button>
      </b-col>
      <b-col cols="4"></b-col>
      <b-col cols="4" class="text-right d-flex justify-content-end">
        <button class="header-btn btn-next" @click="goToAnalysisDashboard">下个页面</button>
      </b-col>
    </b-row>

    <!-- 加载/错误提示 -->
    <div v-if="showAlert" class="alert-container">
      <div :class="['custom-alert', `alert-${alertVariant}`]">
        <div class="alert-icon"><span>{{ alertVariant === 'success' ? '✓' : 'ℹ' }}</span></div>
        <div class="alert-content">{{ alertMessage }}</div>
        <button class="alert-close" @click="showAlert = false">✕</button>
      </div>
    </div>

    <!-- 主要内容网格 -->
    <b-row class="content-row no-gutters">
      <!-- 左侧栏：数据分类与交互 -->
      <b-col cols="3" class="left-column px-2">
        <div class="panel-header header-select-data clean-header">认知传播数据集</div>

        <div class="sidebar-scroll-area">
          <div class="folder-group">
            <div class="video-item folder-header-item" @click="isLiveOpen = !isLiveOpen">
              <span class="folder-name-container">
                <span class="fold-arrow" :class="{ rotated: isLiveOpen }">▶</span>
                <span class="folder-label">认知传播一致数据</span>
              </span>
            </div>
            <div v-show="isLiveOpen" class="items-container">
              <div v-for="image in liveImages" :key="image.id" class="video-item" @click="selectImage(image)"
                :class="{ 'selected': selectedImage && selectedImage.id === image.id }">
                <span class="video-name">{{ image.name }}</span>
                <span class="selector-circle"></span>
              </div>
            </div>
          </div>

          <div class="folder-group">
            <div class="video-item folder-header-item" @click="isDemoOpen = !isDemoOpen">
              <span class="folder-name-container">
                <span class="fold-arrow" :class="{ rotated: isDemoOpen }">▶</span>
                <span class="folder-label">认知传播不一致数据</span>
              </span>
            </div>
            <div v-show="isDemoOpen" class="items-container">
              <div v-for="image in demoImages" :key="image.id" class="video-item" @click="selectImage(image)"
                :class="{ 'selected': selectedImage && selectedImage.id === image.id }">
                <span class="video-name">{{ image.name }}</span>
                <span class="selector-circle"></span>
              </div>
            </div>
          </div>
        </div>

        <div class="preview-container">
          <div class="panel-header header-select-data clean-header">传播数据预览</div>
          <div class="preview-frame" style="position: relative;">
            <div v-if="carouselItems.length === 0" class="preview-placeholder">请选择数据源查看结果</div>
            <b-carousel
              v-else
              id="result-carousel"
              v-model="carouselSlide"
              :interval="4000"
              controls
              indicators
              background="transparent"
              class="w-100 h-100 custom-carousel"
            >
              <b-carousel-slide v-for="(item, index) in carouselItems" :key="`${item.type || 'x'}-${item.src || item.title || index}`">
                <template #img>
                   <div class="carousel-slide-content">
                    <div v-if="item.stage" class="stage-chip">{{ formatStageLabel(item.stage) }}</div>
                    <img v-if="item.type === 'image'" :src="item.src" class="slide-media slide-media-image">
                    <video v-else-if="item.type === 'video'" :src="item.src" autoplay muted loop class="slide-media slide-media-video"></video>
                       <div v-else-if="item.type === 'text'" class="text-slide-content">
                         <div class="text-slide-title">{{ formatCarouselTitle(item) }}</div>
                         <div class="text-slide-desc">{{ formatSlideContent(item) }}</div>
                       </div>
                   </div>
                </template>
              </b-carousel-slide>
            </b-carousel>
          </div>
        </div>

        <div class="action-buttons">
          <button @click="startAnalysis" :disabled="isLoading" class="btn-start-detect">
            <span class="btn-text-pos">{{ isLoading ? '诊断中...' : '开始根因诊断' }}</span>
          </button>
        </div>
      </b-col>

      <!-- 右侧区域：四框诊断 -->
      <b-col cols="9" class="right-column-custom">
        <!-- 信息展示区 -->
        <!-- <div class="info-panel">
          <div class="info-section">
            <div class="info-label">作战指令：</div>
            <div class="info-content instruction-text">{{ instruction || '请选择数据源查看作战指令' }}</div>
          </div>
          <div class="info-section">
            <div class="info-label">图片描述：</div>
            <div class="info-content">{{ yoloDescription || '点击"目标识别"按钮获取描述' }}</div>
          </div>
          <div class="info-section">
            <div class="info-label">检测到的目标：</div>
            <div class="info-content">
              <span v-if="detectedClasses.length > 0" v-for="cls in detectedClasses" :key="cls" class="detection-tag">{{ cls }}</span>
              <span v-else class="no-detection">无</span>
            </div>
          </div>
          <div v-if="overallAccuracy" class="accuracy-info">
            整体准确率：{{ (overallAccuracy * 100).toFixed(2) }}%
          </div>
        </div> -->

        <div class="modules-grid">
          <!-- 模块 1 -->
          <div class="module-wrapper">
            <div class="module-header">1.多模态信息认知偏差诊断</div>
            <div class="module-body">
              <div class="result-section">
                <div class="section-title">诊断与定位结果</div>
                <div class="content-box scrollable" v-html="highlightBrackets(module1Result)"></div>
                <div v-if="isLoading && !module1Result" class="diagnosis-overlay">
                  <div class="loading-spinner-large"></div>
                  <div class="diagnosis-text">正在诊断中...</div>
                </div>
              </div>
              <div class="metric-group" v-if="module1ErrorType || module1ErrorJudgement">
                <div class="metric-item">偏差类型: <span class="bias-yes-red">{{ module1ErrorType || '-' }}</span></div>
                <div class="metric-item">偏差判断: <span class="bias-yes-red">{{ module1ErrorJudgement || '-' }}</span></div>
              </div>
              <div class="metric-group">
                <div class="metric-item">模型内部偏差结果: <span>{{ formatPercent(module1InternalBias, 0) }}</span></div>
                <div class="metric-item">认知传播偏差结果: <span>{{ formatPercent(module1PropagationBias, 0) }}</span></div>
                <div class="metric-item">是否是偏差模块: <span :class="biasYesClass(module1IsBiasModule)">{{ formatYesNo(module1IsBiasModule) }}</span></div>
              </div>
            </div>
          </div>

          <!-- 模块 2 -->
          <div class="module-wrapper">
            <div class="module-header">2.先验知识认知偏差诊断</div>
            <div class="module-body">
              <div class="result-section">
                <div class="section-title">诊断与定位结果</div>
                <div class="content-box scrollable" v-html="highlightBrackets(module2Result)"></div>
                <div v-if="isLoading && !module2Result" class="diagnosis-overlay">
                  <div class="loading-spinner-large"></div>
                </div>
              </div>
              <div class="metric-group" v-if="module2ErrorType || module2ErrorJudgement">
                <div class="metric-item">偏差类型: <span class="bias-yes-red">{{ module2ErrorType || '-' }}</span></div>
                <div class="metric-item">偏差判断: <span class="bias-yes-red">{{ module2ErrorJudgement || '-' }}</span></div>
              </div>
              <div class="metric-group">
                <div class="metric-item">模型内部偏差结果: <span>{{ formatPercent(module2InternalBias, 0) }}</span></div>
                <div class="metric-item">认知传播偏差结果: <span>{{ formatPercent(module2PropagationBias, 0) }}</span></div>
                <div class="metric-item">是否是偏差模块: <span :class="biasYesClass(module2IsBiasModule)">{{ formatYesNo(module2IsBiasModule) }}</span></div>
              </div>
            </div>
          </div>

          <!-- 模块 4（调换到左下） -->
          <div class="module-wrapper">
            <div class="module-header">4.决策选择认知偏差诊断</div>
            <div class="module-body">
              <div class="result-section">
                <div class="section-title">诊断与定位结果</div>
                <div class="content-box scrollable" v-html="highlightBrackets(module4Result)"></div>
                <div v-if="isLoading && !module4Result" class="diagnosis-overlay">
                  <div class="loading-spinner-large"></div>
                </div>
              </div>
              <div class="metric-group" v-if="module4ErrorType || module4ErrorJudgement">
                <div class="metric-item">偏差类型: <span class="bias-yes-red">{{ module4ErrorType || '-' }}</span></div>
                <div class="metric-item">偏差判断: <span class="bias-yes-red">{{ module4ErrorJudgement || '-' }}</span></div>
              </div>
              <div class="metric-group">
                <div class="metric-item">模型内部偏差结果: <span>{{ formatPercent(module4InternalBias, 0) }}</span></div>
                <div class="metric-item">认知传播偏差结果: <span>{{ formatPercent(module4PropagationBias, 0) }}</span></div>
                <div class="metric-item">是否是偏差模块: <span :class="biasYesClass(module4IsBiasModule)">{{ formatYesNo(module4IsBiasModule) }}</span></div>
              </div>
            </div>
          </div>

          <!-- 模块 3（调换到右下） -->
          <div class="module-wrapper">
            <div class="module-header">3.群体协商认知偏差诊断</div>
            <div class="module-body">
              <div class="result-section">
                <div class="section-title">诊断与定位结果</div>
                <div class="content-box scrollable" v-html="highlightBrackets(module3Result)"></div>
                <div v-if="isLoading && !module3Result" class="diagnosis-overlay">
                  <div class="loading-spinner-large"></div>
                </div>
              </div>
              <div class="metric-group" v-if="module3ErrorType || module3ErrorJudgement">
                <div class="metric-item">偏差类型: <span class="bias-yes-red">{{ module3ErrorType || '-' }}</span></div>
                <div class="metric-item">偏差判断: <span class="bias-yes-red">{{ module3ErrorJudgement || '-' }}</span></div>
              </div>
              <div class="metric-group">
                <div class="metric-item">模型内部偏差结果: <span>{{ formatPercent(module3InternalBias, 0) }}</span></div>
                <div class="metric-item">认知传播偏差结果: <span>{{ formatPercent(module3PropagationBias, 0) }}</span></div>
                <div class="metric-item">是否是偏差模块: <span :class="biasYesClass(module3IsBiasModule)">{{ formatYesNo(module3IsBiasModule) }}</span></div>
              </div>
            </div>
          </div>

          <!-- 箭头 1→2 向右 -->
          <div class="grid-arrow grid-arrow-top">
            <span class="arrow-line"></span>
            <span class="arrow-head arrow-head-right"></span>
          </div>
          <!-- 箭头 2→3 向下 -->
          <div class="grid-arrow grid-arrow-right">
            <span class="arrow-line arrow-line-v"></span>
            <span class="arrow-head arrow-head-down"></span>
          </div>
          <!-- 箭头 3→4 向左 -->
          <div class="grid-arrow grid-arrow-bottom">
            <span class="arrow-line"></span>
            <span class="arrow-head arrow-head-left"></span>
          </div>
        </div>

        <div class="bottom-content">
          <div class="metric-pair">
            <div class="metric-half metric-half-center">
              <div class="metric-card recall-card centered-metric">
                <div class="metric-title">不一致根因召回率</div>
                <div class="metric-value">
                  <span v-if="recall !== null && recall !== undefined">{{ formatPercent(recall, 0) }}</span>
                  <span v-else-if="recallWaiting" class="metric-spinner"></span>
                  <span v-else>-</span>
                </div>
              </div>
            </div>
          </div>
          <button class="export-btn" @click="exportResult" :disabled="!exportEnabled">结果导出</button>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
const API_BASE_URL = 'http://10.109.253.71:5235';

const FIELD_LABEL_MAP = {
  'ground_truth': '真实标签',
  'label': '预测标签',
  'model': '型号',
  'kind': '目标类型',
  'color': '颜色',
  'shape': '外形特征',
  'scene': '场景',
  'outline': '轮廓特征',
  'accuracy': '准确率',
  'status': '接口状态',
  'confidence': '置信度',
  'description': '描述',
  'type': '类型',
  'name': '名称',
  'category': '类别',
  'target': '目标',
  'result': '结果',
  'summary': '摘要',
  'internal_text': '内部文本',
  'model_output': '模型输出',
  'cognitive_bias': '认知偏差',
  'caption': '图片描述',
  'image_scene': '图像场景',
  'image_evidence': '图像描述'
};

const COMBINED_TIMER_KEY = 'pcjc_combined_timers_v2';
// 老板要求：不一致根因召回率前端写死为 82%，在四个诊断框展示后一并显示
const COMBINED_RECALL_DONE_VALUE = 0.82;
const STAGE_LABEL_MAP = {
  Stage1: '多模态信息认知阶段',
  Stage2: '先验知识认知阶段',
  Stage3: '群体协商认知阶段',
  Stage4: '决策选择认知阶段'
};
function randomBetween(min, max) { return min + Math.random() * (max - min); }

export default {
  name: 'CombinedDiagnosis',
  data() {
    return {
      isLiveOpen: true,
      isDemoOpen: false,
      imageList: [],
      videoList: [],
      selectedImage: null,
      selectedVideo: null,
      isLoading: false,
      showAlert: false,
      alertVariant: 'info',
      alertMessage: '',
      instruction: '',
      yoloDescription: '',
      detectedClasses: [],
      overallAccuracy: null,
      taskId: 'comb_' + Date.now(),
      pollTimer: null,
      isSelectingFile: false,
      selectedFileContext: null,
      carouselSlide: 0,
      carouselItems: [],
      stagePreviews: {},
      previewSummary: null,
      // 诊断结果
      module1ShowDiagnosisOverlay: false,
      module1BiasTestResultPending: '',
      module1InternalBiasPending: null,
      module1PropagationBiasPending: null,
      module1IsBiasModulePending: null,
      module1DelayTimer: null,
      module1Result: '',
      module1InternalBias: null,
      module1PropagationBias: null,
      module1IsBiasModule: null,
      module1ErrorType: '',
      module1ErrorJudgement: '',
      module2Result: '',
      module2InternalBias: null,
      module2PropagationBias: null,
      module2IsBiasModule: null,
      module2ErrorType: '',
      module2ErrorJudgement: '',
      module3Result: '',
      module3InternalBias: null,
      module3PropagationBias: null,
      module3IsBiasModule: null,
      module3ErrorType: '',
      module3ErrorJudgement: '',
      module4ShowDiagnosisOverlay: false,
      module4BiasTestResultPending: '',
      module4InternalBiasPending: null,
      module4IsBiasModulePending: null,
      module4DelayTimer: null,
      module4Result: '',
      module4InternalBias: null,
      module4PropagationBias: null,
      module4IsBiasModule: null,
      module4ErrorType: '',
      module4ErrorJudgement: '',
      accuracy: null,
      recall: null,
      diagnosisConsistencyType: null,
      analysisStartedAt: null,
      revealContentTimer: null,
      recallDisplayTimer: null,
      cachedDiagnosisData: null,
      exportEnabled: false,
      recallWaiting: false
    };
  },
  computed: {
    // 后端基础地址
    baseUrl() { return 'http://localhost:5237'; },
    liveImages() {
      const list = Array.isArray(this.imageList) ? this.imageList : [];
      return list.filter(v => v && v.type === 'live');
    },
    demoImages() {
      const list = Array.isArray(this.imageList) ? this.imageList : [];
      return list.filter(v => v && v.type === 'demo');
    }
  },
  mounted() {
    // 进入页面一律回到初始状态：清掉历史诊断倒计时与上次选择，等待用户重新选择数据
    this.clearTimerStateFromStorage();
    try {
      sessionStorage.removeItem('pcjc_combined_nav');
      sessionStorage.removeItem('pcjc_selected_source_context');
    } catch (e) { /* ignore */ }
    this.fetchImageList();
    this.clearResults({ resetPersistentMetric: true });
    this.carouselItems = [];
  },
  beforeDestroy() {
    if (this.pollTimer) clearInterval(this.pollTimer);
    if (this.module1DelayTimer && this.module1DelayTimer !== 'done') clearTimeout(this.module1DelayTimer);
    if (this.module4DelayTimer && this.module4DelayTimer !== 'done') clearTimeout(this.module4DelayTimer);
    if (this.revealContentTimer) clearTimeout(this.revealContentTimer);
    if (this.recallDisplayTimer) clearTimeout(this.recallDisplayTimer);
  },
  methods: {
    resolveConsistencyFolderType(source = {}) {
      const typeKey = String(source.type_key || '').trim().toLowerCase();
      if (typeKey === 'consistent') return 'live';
      if (typeKey === 'inconsistent') return 'demo';
      const numericType = Number(source.type);
      if (Number.isFinite(numericType)) {
        if (numericType === 0) return 'live';
        if (numericType === 1) return 'demo';
      }
      return 'live';
    },
    normalizeContextType(rawType) {
      const t = String(rawType || '').trim().toLowerCase();
      if (t === 'live' || t === 'consistent') return 'live';
      if (t === 'demo' || t === 'inconsistent') return 'demo';
      const n = Number(rawType);
      if (Number.isFinite(n)) {
        if (n === 0) return 'live';
        if (n === 1) return 'demo';
      }
      return 'live';
    },
    async fetchImageList() {
      try {
        const response = await this.$ajax.get(`${API_BASE_URL}/module5/api/data-sources`);
        const sources = this.safeGet(response, 'data.data_sources', []);
        if (Array.isArray(sources)) {
          const mapped = sources.map((src, idx) => ({
            id: idx + 1,
            source_id: src.source_id,
            name: src.source_id,
            path: src.path,
            type: this.resolveConsistencyFolderType(src),
            type_label: src.type_label || '',
            type_key: src.type_key || '',
            dataset_type: src.type
          }));
          this.videoList = mapped;
          this.imageList = mapped;
        }
      } catch (error) {
        console.warn("获取数据源失败", error);
        this.videoList = [];
        this.imageList = [];
      }
    },
    async selectImage(image, options = {}) {
      await this.selectVideo(image, options);
    },
    isSameSelectedData(video) {
      const nextSourceId = String((video || {}).source_id || '').trim();
      const nextPath = String((video || {}).path || '').trim();
      const curSourceId = String((this.selectedFileContext || {}).source_id || (this.selectedVideo || {}).source_id || '').trim();
      const curPath = String((this.selectedFileContext || {}).path || (this.selectedVideo || {}).path || '').trim();
      const sameBySourceId = !!(nextSourceId && curSourceId && nextSourceId === curSourceId);
      const sameByPath = !!(nextPath && curPath && nextPath === curPath);
      return sameBySourceId || sameByPath;
    },
    clearSelectionDiagnosisState() {
      this.clearResults({ resetPersistentMetric: true });
      this.isLoading = false;
      this.stagePreviews = {};
      this.previewSummary = null;
      this.cachedDiagnosisData = null;
    },
    async selectVideo(video, options = {}) {
      const { preserveCurrentResult = false } = options;
      const isNewData = !this.isSameSelectedData(video);
      if (!preserveCurrentResult && isNewData) {
        this.clearSelectionDiagnosisState();
      }
      this.selectedVideo = video;
      this.selectedImage = video;
      await this.handleFileSelection(video);
    },
    async handleFileSelection(video) {
      this.isSelectingFile = true;
      this.carouselSlide = 0;
      this.carouselItems = [];
      this.selectedFileContext = null;

      try {
        const response = await this.requestFileSelection(video);
        this.applyFileSelectionResult(response, video);
      } catch (error) {
        console.error("文件选择接口调用失败", error);
        this.carouselItems = [
          {
            type: 'text',
            stage: 'Stage?',
            title: '文件数据加载失败',
            content: `source_id=${video.source_id || video.name}，请检查后端服务与数据目录。`
          }
        ];
        this.showMsg('warning', '文件数据加载失败，已使用基础预览。');
      } finally {
        this.isSelectingFile = false;
      }
    },
    async requestFileSelection(video) {
      const res = await this.$ajaxJ.post(`${API_BASE_URL}/module5/api/file-selection`, {
        source_id: video.source_id,
        path: video.path
      });
      return res.data;
    },
    applyFileSelectionResult(response, video) {
      const res = response || {};
      let carouselItems = this.normalizeCarouselItems(res.carouselItems);
      if (carouselItems.length === 0) {
        carouselItems = this.buildItemsFromStagePreviews(res.stagePreviews);
      }

      if (carouselItems.length === 0) {
        carouselItems = [{
          type: 'text',
          stage: 'Stage?',
          title: '无可展示内容',
          content: `source_id=${video.source_id || video.name} 未返回可渲染数据。`
        }];
      }

      this.selectedFileContext = res.stage1 || { source_id: video.source_id || video.name, path: video.path };
      if (!this.selectedFileContext.type) {
        this.selectedFileContext = {
          ...this.selectedFileContext,
          type: this.normalizeContextType(video.type)
        };
      }
      const hasVideoItem = carouselItems.some(item => item && item.type === 'video');
      if (!hasVideoItem) {
        const sampleId = this.resolveSampleIdFromContext(this.selectedFileContext, video);
        let imageSrc = String(res.image_set_image_url || '').trim();
        if (!imageSrc && sampleId) {
          imageSrc = `${API_BASE_URL}/module5/api/image-set/${encodeURIComponent(sampleId)}`;
        }
        if (imageSrc) {
          const firstImageItem = this.normalizeCarouselItems([
            {
              type: 'image',
              src: imageSrc,
              title: '原始样本图片',
              stage: 'Stage1',
              stage_index: 1,
              file_name: sampleId ? `${sampleId}.jpg` : ''
            }
          ])[0];
          const dedupItems = carouselItems.filter(item => !(item && item.src === imageSrc));
          carouselItems = [firstImageItem, ...dedupItems];
        }
      }
      this.stagePreviews = res.stagePreviews || {};
      this.previewSummary = res.previewSummary || null;
      this.carouselItems = carouselItems;
      this.carouselSlide = 0;
      this.persistSelectedSourceContext(this.selectedFileContext);
      this.showMsg('success', '文件已加载，可开始认知诊断。');
    },
    resolveSampleIdFromContext(stage1 = {}, video = {}) {
      const sid = String(stage1.source_id || video.source_id || video.name || '').trim();
      if (/^firc_junshi_\d+$/i.test(sid)) return sid;
      const path = String(stage1.path || video.path || '').trim();
      const match = path.match(/(firc_junshi_\d+)/i);
      if (match) return match[1];
      return sid;
    },
    persistSelectedSourceContext(ctx) {
      const source_id = String((ctx || {}).source_id || '').trim();
      const path = String((ctx || {}).path || '').trim();
      const type = this.normalizeContextType((ctx || {}).type);
      if (!source_id && !path) return;
      try {
        sessionStorage.setItem('pcjc_selected_source_context', JSON.stringify({ source_id, path, type }));
      } catch (e) {
        // ignore
      }
    },
    goToAnalysisDashboard() {
      const stage1 = this.selectedFileContext || {};
      const source_id = String(stage1.source_id || (this.selectedVideo ? this.selectedVideo.source_id : '') || '').trim();
      const path = String(stage1.path || (this.selectedVideo ? this.selectedVideo.path : '') || '').trim();
      const type = this.normalizeContextType(stage1.type || (this.selectedVideo ? this.selectedVideo.type : ''));
      this.persistSelectedSourceContext({ source_id, path, type });
      this.$router.push({
        path: '/analysis-dashboard',
        query: {
          source_id,
          path,
          type
        }
      });
    },
    normalizeCarouselItems(items) {
      if (!Array.isArray(items)) return [];
      return items
        .filter(item => item && item.type)
        .map((item, idx) => {
          const stage = item.stage || 'Stage?';
          const stageIndex = Number.isFinite(item.stage_index) ? item.stage_index : this.parseStageIndex(stage);
          return {
            ...item,
            stage,
            stage_index: stageIndex,
            title: item.title || `预览项 ${idx + 1}`
          };
        });
    },
    buildItemsFromStagePreviews(stagePreviews) {
      if (!stagePreviews || typeof stagePreviews !== 'object') return [];
      const stageOrder = ['Stage1', 'Stage2', 'Stage3', 'Stage4'];
      const flatten = [];
      stageOrder.forEach((stageName) => {
        const stageData = stagePreviews[stageName];
        if (!stageData || !Array.isArray(stageData.items)) return;
        stageData.items.forEach((item) => {
          flatten.push({
            ...item,
            stage: item.stage || stageName,
            stage_index: Number.isFinite(item.stage_index)
              ? item.stage_index
              : this.parseStageIndex(stageName)
          });
        });
      });
      return this.normalizeCarouselItems(flatten);
    },
    parseStageIndex(stageName) {
      if (!stageName) return null;
      const match = String(stageName).match(/Stage(\d+)/i);
      return match ? Number(match[1]) : null;
    },
    formatStageLabel(stageName) {
      const raw = String(stageName || '').trim();
      const match = raw.match(/^Stage([1-4])$/i);
      if (!match) return raw;
      return STAGE_LABEL_MAP[`Stage${match[1]}`] || raw;
    },
    replaceStageTerms(text) {
      if (!text || typeof text !== 'string') return text || '';
      return text.replace(/\bStage([1-4])\b/gi, (match, stageNo) => (
        STAGE_LABEL_MAP[`Stage${stageNo}`] || match
      ));
    },
    formatCarouselTitle(item) {
      const stageLabel = this.formatStageLabel(item && item.stage);
      const title = this.replaceStageTerms(this.replaceAgentTerms((item || {}).title));
      if (!stageLabel) return title;
      const cleanedTitle = String(title || '').replace(new RegExp(`^${stageLabel}\\s*[·•\\-—:]?\\s*`), '');
      return cleanedTitle ? `${stageLabel} ${cleanedTitle}` : stageLabel;
    },
    clearAnalysisTimers() {
      if (this.revealContentTimer) {
        clearTimeout(this.revealContentTimer);
        this.revealContentTimer = null;
      }
      if (this.recallDisplayTimer) {
        clearTimeout(this.recallDisplayTimer);
        this.recallDisplayTimer = null;
      }
    },
    clearTimerStateFromStorage() {
      try {
        localStorage.removeItem(COMBINED_TIMER_KEY);
      } catch (e) {
        // ignore
      }
    },
    finishRecallTimer() {
      if (this.recallDisplayTimer) {
        clearTimeout(this.recallDisplayTimer);
        this.recallDisplayTimer = null;
      }
      this.recall = COMBINED_RECALL_DONE_VALUE;
      this.exportEnabled = true;
    },
    async startAnalysis() {
      if (!this.selectedImage) { this.showMsg('warning', '请先选择数据源！'); return; }

      this.clearResults({ resetPersistentMetric: true });
      this.clearTimerStateFromStorage();
      this.isLoading = true;
      this.exportEnabled = false;
      this.recallWaiting = true;
      this.taskId = 'comb_' + Date.now();
      this.analysisStartedAt = Date.now();

      try {
        const payload = this.buildDiagnosisPayload();
        const responseData = await this.requestDiagnosisResult(payload);

        this.cachedDiagnosisData = responseData;

        const contentDelayMs = Math.round(randomBetween(20000, 30000));
        // 四个诊断框展示完成后，立即显示写死的召回率
        const recallDelayMs = contentDelayMs;

        this.revealContentTimer = setTimeout(() => {
          this.revealContentTimer = null;
          this.parseData(this.cachedDiagnosisData, true);
          this.isLoading = false;
          this.showMsg('success', '诊断完成！');
        }, contentDelayMs);

        this.recallDisplayTimer = setTimeout(() => {
          this.finishRecallTimer();
        }, recallDelayMs);
      } catch (error) {
        console.error("诊断接口调用失败", error);
        this.clearAnalysisTimers();
        this.clearTimerStateFromStorage();
        this.isLoading = false;
        this.showMsg('danger', '诊断启动失败，请稍后重试。');
      }
    },
    buildDiagnosisPayload() {
      const stage1 = this.selectedFileContext || {};
      return {
        source_id: stage1.source_id || (this.selectedVideo ? this.selectedVideo.source_id : ''),
        path: stage1.path || (this.selectedVideo ? this.selectedVideo.path : '')
      };
    },
    async requestDiagnosisResult(payload) {
      const res = await this.$ajaxJ.post(`${API_BASE_URL}/module5/api/stage-diagnosis-result`, payload);
      return this.normalizeStageDiagnosisResponse(res.data || {});
    },
    normalizeStageDiagnosisResponse(raw) {
      const result = this.safeGet(raw, 'result', {});
      const consistencyType = String(
        this.safeGet(result, 'consistency_type', '') || this.safeGet(raw, 'stage1.type_key', '')
      ).trim().toLowerCase();
      const toNumberOrNull = (value) => {
        if (value === null || value === undefined) return null;
        const n = Number(value);
        return Number.isFinite(n) ? n : null;
      };
      const overallSimilarity = toNumberOrNull(this.safeGet(result, 'overall_similarity', null));

      return {
        running: false,
        status: 'completed',
        accuracy: overallSimilarity,
        consistency_type: consistencyType || null,
        cards: this.extractStageDiagnosisCards(raw)
      };
    },
    // 将 stageDiagnosisCards（数组或对象）规整为 { Stage1..Stage4 } 映射
    extractStageDiagnosisCards(raw) {
      const rawCards = (raw && (raw.stageDiagnosisCards || raw.stageBoxes)) || [];
      const map = {};
      const putCard = (card, fallbackIndex) => {
        if (!card || typeof card !== 'object') return;
        const stageMatch = String(card.stage || '').match(/Stage\s*([1-4])/i);
        const stageNo = stageMatch ? Number(stageMatch[1]) : fallbackIndex;
        if (stageNo >= 1 && stageNo <= 4 && !map[`Stage${stageNo}`]) {
          map[`Stage${stageNo}`] = card;
        }
      };
      if (Array.isArray(rawCards)) {
        rawCards.forEach((card, idx) => putCard(card, idx + 1));
      } else if (rawCards && typeof rawCards === 'object') {
        Object.keys(rawCards).forEach((key) => {
          const keyMatch = String(key).match(/Stage\s*([1-4])/i);
          putCard(rawCards[key], keyMatch ? Number(keyMatch[1]) : 0);
        });
      }
      return map;
    },
    parseData(data) {
      this.diagnosisConsistencyType = this.safeGet(data, 'consistency_type', null);
      const cards = (data && data.cards) || {};
      this.applyCardToModule(1, cards.Stage1);
      this.applyCardToModule(2, cards.Stage2);
      this.applyCardToModule(3, cards.Stage3);
      this.applyCardToModule(4, cards.Stage4);
      if (data.accuracy !== undefined && data.accuracy !== null) this.accuracy = data.accuracy;
    },
    applyCardToModule(moduleNo, card) {
      const safeCard = (card && typeof card === 'object') ? card : {};
      const toNumberOrNull = (value) => {
        if (value === null || value === undefined) return null;
        const n = Number(value);
        return Number.isFinite(n) ? n : null;
      };
      // is_bias_module 缺失时按"否"处理
      const isBiasModule = safeCard.is_bias_module === true;
      // 内容为 Markdown 格式，去掉每行行首的 # 标记，只保留标题文字
      const content = String(safeCard.content || '').replace(/^#+\s*/gm, '');

      this[`module${moduleNo}Result`] = this.pickTopBracketFieldsForBias(content, isBiasModule);
      this[`module${moduleNo}InternalBias`] = toNumberOrNull(safeCard.intern_bias);
      this[`module${moduleNo}PropagationBias`] = toNumberOrNull(safeCard.propogation_bias);
      this[`module${moduleNo}IsBiasModule`] = isBiasModule;
      this[`module${moduleNo}ErrorType`] = String(safeCard.error_type || '').trim();
      this[`module${moduleNo}ErrorJudgement`] = String(safeCard.error_judgement || '').trim();
      if (moduleNo === 1) this.module1ShowDiagnosisOverlay = false;
      if (moduleNo === 4) this.module4ShowDiagnosisOverlay = false;
    },
    replaceAgentTerms(value) {
      if (value === null || value === undefined) return '';
      return String(value).replace(/Agent/gi, '智能体');
    },
    translateTextContent(text) {
      if (!text || typeof text !== 'string') return text || '';
      const translated = text.replace(/^([a-zA-Z_]+)(\s*[:：])/gm, (match, key, sep) => {
        const translated = FIELD_LABEL_MAP[key];
        return translated ? translated + sep : match;
      });
      return this.replaceAgentTerms(translated);
    },
    formatSlideContent(item) {
      const content = item.content || '';
      if (/^Stage1$/i.test(String(item.stage || '').trim())) {
        let textContent = '';
        if (typeof content === 'string') {
          textContent = content;
        } else if (content && typeof content === 'object') {
          const scene = content.image_scene || content.scene || '';
          const desc = content.image_evidence || content.description || '';
          const lines = [];
          if (scene) lines.push(`图像场景: ${scene}`);
          if (desc) lines.push(`图像描述: ${desc}`);
          textContent = lines.join('\n');
        } else {
          textContent = String(content || '');
        }

        const normalized = this.translateTextContent(textContent);
        const lines = String(normalized).split(/\r?\n/);
        const sceneLine = lines.find(l => /^(图像场景|image_scene)\s*[:：]/i.test(l.trim()));
        const imageDescLineRaw = lines.find(l => /^(图像描述|图像证据|image_evidence|description)\s*[:：]/i.test(l.trim()));
        const imageDescLine = imageDescLineRaw
          ? imageDescLineRaw.replace(/^(图像证据|image_evidence|description)\s*[:：]/i, '图像描述: ')
          : '';
        if (sceneLine && imageDescLine) {
          return `${sceneLine.trim()}\n${imageDescLine.trim()}`;
        }
        if (sceneLine) return sceneLine.trim();
        if (imageDescLine) return imageDescLine.trim();
      }
      return this.translateTextContent(content);
    },
    pickTopBracketFieldsForBias(text, isBiasModule) {
      const raw = String(text || '');
      if (!raw) return '';
      if (String(this.diagnosisConsistencyType || '').toLowerCase() !== 'inconsistent' || isBiasModule !== true) {
        return raw;
      }
      const lines = raw.split(/\r?\n/);
      if (!lines.length) return raw;
      const bracketScore = (line) => {
        const current = String(line || '');
        let score = 0;
        const cnMatches = current.matchAll(/《([^》]+)》/g);
        for (const m of cnMatches) {
          score += String(m[1] || '').length;
        }
        // 兼容旧标记格式，避免历史数据遗漏。
        const oldMatches = current.matchAll(/\(\((.*?)\)\)/g);
        for (const m of oldMatches) {
          score += String(m[1] || '').length;
        }
        return score;
      };
      const scored = lines
        .map((line, idx) => ({ idx, line, score: bracketScore(line) }))
        .filter(item => item.score > 0);
      if (!scored.length) return raw;
      scored.sort((a, b) => b.score - a.score || a.idx - b.idx);
      const topIndex = new Set(scored.slice(0, 2).map(item => item.idx));
      const picked = lines.filter((_, idx) => topIndex.has(idx));
      return picked.join('\n') || raw;
    },
    escapeHtml(text) {
      return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },
    safeGet(obj, path, defaultValue = '') {
      if (!obj) return defaultValue;
      const keys = path.split('.');
      let result = obj;
      for (const key of keys) {
        if (result === null || result === undefined || typeof result !== 'object') {
          return defaultValue;
        }
        result = result[key];
      }
      return result !== null && result !== undefined ? result : defaultValue;
    },
    clearResults(options = {}) {
      const { resetPersistentMetric = false } = options;
      this.clearAnalysisTimers();
      if (this.pollTimer) clearInterval(this.pollTimer);
      this.pollTimer = null;
      if (this.module1DelayTimer && this.module1DelayTimer !== 'done') clearTimeout(this.module1DelayTimer);
      if (this.module4DelayTimer && this.module4DelayTimer !== 'done') clearTimeout(this.module4DelayTimer);

      this.module1DelayTimer = null;
      this.module4DelayTimer = null;
      this.module1ShowDiagnosisOverlay = true;
      this.module4ShowDiagnosisOverlay = true;
      this.module1BiasTestResultPending = '';
      this.module1InternalBiasPending = null;
      this.module1PropagationBiasPending = null;
      this.module1IsBiasModulePending = null;
      this.module4BiasTestResultPending = '';
      this.module4InternalBiasPending = null;
      this.module4IsBiasModulePending = null;

      this.module1Result = ''; this.module2Result = ''; this.module3Result = ''; this.module4Result = '';
      this.module1InternalBias = null; this.module1PropagationBias = null; this.module1IsBiasModule = null;
      this.module2InternalBias = null; this.module2PropagationBias = null; this.module2IsBiasModule = null;
      this.module3InternalBias = null; this.module3PropagationBias = null; this.module3IsBiasModule = null;
      this.module4InternalBias = null; this.module4PropagationBias = null; this.module4IsBiasModule = null;
      this.module1ErrorType = ''; this.module1ErrorJudgement = '';
      this.module2ErrorType = ''; this.module2ErrorJudgement = '';
      this.module3ErrorType = ''; this.module3ErrorJudgement = '';
      this.module4ErrorType = ''; this.module4ErrorJudgement = '';
      this.diagnosisConsistencyType = null;
      this.accuracy = null; this.recall = null;
      this.analysisStartedAt = null;
      this.cachedDiagnosisData = null;
      this.exportEnabled = false;
      this.recallWaiting = false;
      if (resetPersistentMetric) {
        this.clearTimerStateFromStorage();
      }
    },
    showMsg(variant, msg) {
      this.alertVariant = variant; this.alertMessage = msg; this.showAlert = true;
      setTimeout(() => { this.showAlert = false; }, 3000);
    },
    highlightBrackets(text) {
      if (!text) return '等待中...';
      const normalized = this.replaceAgentTerms(text);
      const safe = this.escapeHtml(normalized);
      return safe
        .replace(/《([^》]+)》/g, '<span class="highlight-text" style="color:#FF4242;font-weight:700;">$1</span>')
        .replace(/\(\((.*?)\)\)/g, '<span class="highlight-text" style="color:#FF4242;font-weight:700;">$1</span>')
        .replace(/\n/g, '<br>');
    },
    formatPercent(v, d = 0) { return (v !== null && v !== undefined) ? (v * 100).toFixed(d) + '%' : '-'; },
    formatYesNo(v) { return v === null ? '-' : (v ? '是' : '否'); },
    biasYesClass(v) {
      return (this.diagnosisConsistencyType === 'inconsistent' && v === true) ? 'bias-yes-red' : '';
    },
    exportResult() {
      const url = `${API_BASE_URL}/module5/api/dataset/archive`;
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.showMsg('success', '正在下载结果文件...');
    },
    originalImageUrl() {
      if (!this.selectedImage) return '';
      return this.baseUrl + this.selectedImage.imageUrl;
    },
    // 助手函数
    isVideo(name) { return name && (name.endsWith('.mp4') || name.endsWith('.avi')); },
    videoUrl(path) { return path ? `${API_BASE_URL}${path}` : ''; },
    imageUrl(path) {
      return path ? `${this.baseUrl}${path}` : require('@/assets/images/step1/-s-弹框-选择数据.png');
    }
  }
};
</script>

<style scoped>
.attribution-diagnosis-container {
  width: 100vw; height: 100vh; background-image: url('~@/assets/images/step5/背景.png');
  background-size: 100% 100%; color: white; overflow: hidden; position: relative;
}

.header-bar { position: absolute; top: 0; left: 0; width: 100%; padding: 0 20px; height: 60px; z-index: 10; }
.header-btn {
  background: none; border: none; cursor: pointer; width: 120px; height: 40px; color: #fff;
  font-family: 'DOUYUFont'; font-size: 14px; background-repeat: no-repeat; background-size: 100% 100%; margin: 0 5px;
}
.btn-home { background-image: url('~@/assets/images/step4/首页按键.png'); }
.btn-back { background-image: url('~@/assets/images/step1/-s-按钮-蓝色-1.png'); }
.btn-next { background-image: url('~@/assets/images/step1/-s-按钮-蓝色-1.png'); }

/* 提示信息 */
.alert-container { position: absolute; top: 80px; left: 50%; transform: translateX(-50%); z-index: 100; width: 40%; }
.custom-alert {
  display: flex; align-items: center; padding: 12px 20px; border-radius: 4px;
  background: rgba(10, 30, 60, 0.9); border: 2px solid #1a65a8; backdrop-filter: blur(5px);
}
.alert-success { border-color: #00e5ff; color: #00e5ff; }
.alert-warning { border-color: #ffb74d; color: #ffb74d; }
.alert-info { border-color: #8bd3f9; color: #8bd3f9; }
.alert-icon { margin-right: 15px; font-weight: bold; }
.alert-content { flex: 1; font-size: 14px; }
.alert-close { background: none; border: none; color: #fff; cursor: pointer; font-size: 16px; }

.content-row { height: calc(100vh - 100px); margin-top: 80px; padding: 0 20px 20px 20px; }

/* ================= 左侧栏 ================= */
.left-column { display: flex; flex-direction: column; height: 100%; }
.panel-header {
  height: 48px; background-image: url('~@/assets/images/step1/-s-二级标题.png');
  background-size: 100% 100%; color: #c6f4ff; font-family: 'DOUYUFont'; font-size: 15px;
  display: flex; justify-content: center; align-items: center; margin-bottom: 5px;
}

.sidebar-scroll-area {
  height: 35vh !important; padding: 10px;
  background-image: url('~@/assets/images/step1/-s-弹框-选择数据.png');
  background-size: 100% 100%; margin-bottom: 10px;
  display: flex !important; flex-direction: column !important; overflow: hidden !important;
}

.folder-group { display: flex; flex-direction: column; overflow: hidden; margin-bottom: 2px; }
.folder-header-item { flex-shrink: 0; color: #4ED8FF !important; font-weight: bold; }
.folder-name-container { display: flex; align-items: center; }
.fold-arrow { display: inline-block; width: 14px; height: 14px; margin-right: 8px; font-size: 12px; transition: transform 0.2s linear; color: #00e5ff; }
.fold-arrow.rotated { transform: rotate(90deg); }

.items-container {
  flex-grow: 1;
  overflow-y: auto;
  min-height: 0;
  max-height: 25vh;
  scrollbar-width: thin;
  scrollbar-color: rgba(58, 173, 218, 0.75) rgba(7, 28, 51, 0.45);
}
.items-container::-webkit-scrollbar { width: 6px; }
.items-container::-webkit-scrollbar-track {
  background: rgba(7, 28, 51, 0.45);
  border-radius: 6px;
}
.items-container::-webkit-scrollbar-thumb {
  background: rgba(58, 173, 218, 0.75);
  border-radius: 6px;
  border: 1px solid rgba(7, 28, 51, 0.35);
}

.video-item {
  height: 40px; padding: 0 15px; display: flex; justify-content: space-between; align-items: center;
  cursor: pointer; font-size: 1.1rem; color: #fff; position: relative; border-bottom: 1px solid rgba(0, 229, 255, 0.1);
}
.video-item:hover { background-color: rgba(0, 229, 255, 0.1) !important; }
.video-item.selected { background-color: rgba(0, 229, 255, 0.2) !important; }

.selector-circle { width: 14px; height: 14px; border-radius: 50%; border: 1.5px solid #00e5ff; position: relative; }
.video-item.selected .selector-circle::after { content: ""; position: absolute; top: 2px; left: 2px; width: 7px; height: 7px; border-radius: 50%; background: #00e5ff; }

/* 预览框 */
.preview-container { flex: 1; display: flex; flex-direction: column; margin-bottom: 20px; min-height: 0; }
.preview-frame {
  flex: 1; background-image: url('~@/assets/images/step1/-s-框-小视频.png');
  background-size: 100% 100%; padding: 12px; display: flex; align-items: center; justify-content: center;
  min-height: 0; overflow: hidden;
}
.preview-placeholder { color: #8bd3f9; font-size: 14px; opacity: 0.7; }
.carousel-slide-content { height: 26vh; display: flex; align-items: center; justify-content: center; width: 100%; padding: 4px; overflow: hidden; position: relative; }
.stage-chip {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 3;
  background: rgba(0, 229, 255, 0.16);
  border: 1px solid rgba(0, 229, 255, 0.6);
  color: #9ff4ff;
  font-size: 12px;
  line-height: 1;
  padding: 6px 8px;
  border-radius: 4px;
  font-weight: 700;
}
.slide-media {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 6px;
  background: rgba(4, 18, 36, 0.55);
}
.slide-media-image {
  object-fit: contain;
  object-position: center;
  padding: 4px;
}
.slide-media-video {
  object-fit: cover;
  object-position: center;
}
.text-slide-content {
  width: 90%; height: 90%; background: rgba(0, 229, 255, 0.05); border: 1px solid rgba(0, 229, 255, 0.3);
  border-radius: 8px; padding: 20px; display: flex; flex-direction: column; justify-content: center; text-align: left; margin: 0 auto;
}
.text-slide-title { font-size: 16px; font-weight: bold; color: #00e5ff; margin-bottom: 10px; font-family: 'DingTalk-JinBuTi', sans-serif !important; border-bottom: 1px solid rgba(0, 229, 255, 0.3); padding-bottom: 5px; }
.text-slide-desc {
  font-size: 13px;
  color: #c6f4ff;
  line-height: 1.8;
  white-space: pre-wrap;
  flex: 1;
  overflow-y: auto;
  overflow-wrap: anywhere;
  scrollbar-width: thin;
  scrollbar-color: rgba(58, 173, 218, 0.75) rgba(6, 24, 44, 0.55);
}
.text-slide-desc::-webkit-scrollbar { width: 6px; }
.text-slide-desc::-webkit-scrollbar-track {
  background: rgba(6, 24, 44, 0.55);
  border-radius: 6px;
}
.text-slide-desc::-webkit-scrollbar-thumb {
  background: rgba(58, 173, 218, 0.75);
  border-radius: 6px;
  border: 1px solid rgba(6, 24, 44, 0.35);
}
.custom-carousel .carousel-indicators li { background-color: #4ED8FF; }
.custom-carousel .carousel-control-prev-icon, .custom-carousel .carousel-control-next-icon { filter: drop-shadow(0 0 4px #00e5ff); }

/* 开始按钮 */
.action-buttons { height: 10vh; display: flex; justify-content: center; align-items: center; flex-shrink: 0; gap: 20px; }
.btn-start-detect {
  background: none; border: none; cursor: pointer; width: 180px; height: 60px;
  background-image: url('~@/assets/images/step1/-s-按钮-开始测试.png');
  background-size: 100% 100%; position: relative; transition: filter 0.3s;
}
.btn-start-detect:disabled { filter: grayscale(1); cursor: not-allowed; }
.btn-text-pos { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-family: 'DOUYUFont'; font-size: 14px; color: #FFFFFF; white-space: nowrap; }

/* ================= 右侧栏 ================= */
.right-column-custom { height: 100%; padding-left: 20px; display: flex; flex-direction: column; }
.modules-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
  gap: 20px;
  flex: 1;
  min-height: 0;
  position: relative;
}
.grid-arrow {
  position: absolute;
  z-index: 2;
  pointer-events: none;
  display: flex;
  align-items: center;
}
.grid-arrow-top {
  top: calc(25% - 2px);
  left: calc(50% - 30px);
  width: 60px;
  flex-direction: row;
}
.grid-arrow-right {
  top: calc(50% - 30px);
  right: calc(25% - 2px);
  height: 60px;
  flex-direction: column;
}
.grid-arrow-bottom {
  bottom: calc(25% - 2px);
  left: calc(50% - 30px);
  width: 60px;
  flex-direction: row-reverse;
}
.arrow-line {
  flex: 1;
  height: 3px;
  background: linear-gradient(90deg, rgba(78,216,255,0.3), rgba(78,216,255,0.9));
  border-radius: 2px;
  box-shadow: 0 0 6px rgba(78,216,255,0.6);
}
.arrow-line-v {
  width: 3px;
  height: auto;
  background: linear-gradient(180deg, rgba(78,216,255,0.3), rgba(78,216,255,0.9));
}
.arrow-head-right {
  width: 0; height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 12px solid rgba(78,216,255,0.9);
  filter: drop-shadow(0 0 4px rgba(78,216,255,0.6));
}
.arrow-head-down {
  width: 0; height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 12px solid rgba(78,216,255,0.9);
  filter: drop-shadow(0 0 4px rgba(78,216,255,0.6));
}
.arrow-head-left {
  width: 0; height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 12px solid rgba(78,216,255,0.9);
  filter: drop-shadow(0 0 4px rgba(78,216,255,0.6));
}
.module-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
}
.module-header {
  background-image: url('~@/assets/images/step5/二级标题.png'); background-size: 65% 100%; background-repeat: no-repeat;
  font-size: 15px; font-weight: bold; color: #4ED8FF; padding-left: 60px; height: 40px; line-height: 40px; font-family: 'DingTalk-JinBuTi', sans-serif !important;
}
.module-body {
  background-image: url('~@/assets/images/step5/每个模块背景.png'); background-size: 100% 100%; padding: 1.5vh 1.5vw;
  display: flex; flex-direction: column; flex: 1; min-height: 0; min-width: 0; position: relative;
}
.result-section {
  flex: 1; display: flex; flex-direction: column; min-height: 0; min-width: 0; position: relative; /* 为遮罩层定位 */
}
.section-title { color: #00e5ff; font-family: 'PingFang SC', sans-serif !important; font-weight: bold; margin-bottom: 5px; }
.content-box {
  flex: 1;
  line-height: 1.6;
  color: #FFFFFF;
  font-size: 14px !important;
  overflow-y: auto;
  padding: 0 5px;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Arial', sans-serif !important;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: anywhere;
  min-width: 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(58, 173, 218, 0.75) rgba(8, 30, 54, 0.5);
}
.content-box::-webkit-scrollbar { width: 6px; }
.content-box::-webkit-scrollbar-track {
  background: rgba(8, 30, 54, 0.5);
  border-radius: 6px;
}
.content-box::-webkit-scrollbar-thumb {
  background: rgba(58, 173, 218, 0.75);
  border-radius: 6px;
  border: 1px solid rgba(8, 30, 54, 0.35);
}
.content-box * { font-size: 14px !important; font-family: 'PingFang SC', 'Microsoft YaHei', 'Arial', sans-serif !important; }
.highlight-text { color: #FF4242 !important; font-weight: 700; }
.metric-group {
  margin-top: 1.2vh;
  padding-top: 1vh;
  border-top: 1px solid rgba(46, 216, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.metric-item { font-size: 14px; color: #8bd3f9; }
.metric-item span { font-weight: bold; color: #c6f4ff; font-size: 16px; margin-left: 0.5em; font-family: 'DingTalk-JinBuTi', sans-serif !important; }
.metric-item span.bias-yes-red { color: #ff4d4f !important; }

/* 遮罩层逻辑 */
.diagnosis-overlay {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(10, 30, 60, 0.6); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 5;
}
.loading-spinner-large {
  width: 40px; height: 40px; border: 4px solid rgba(0, 229, 255, 0.2); border-left-color: #00e5ff;
  border-radius: 50%; animation: spin 1s linear infinite;
}
.diagnosis-text { margin-top: 10px; color: #00e5ff; font-size: 12px; }

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.bottom-content {
  height: 10vh;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: 10px;
  position: relative;
}
.metric-pair {
  width: calc(100% - 180px);
  height: 100%;
  display: flex;
  align-items: center;
}
.metric-half {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
}
.metric-half-center {
  justify-content: center;
}
.metric-card {
  background-image: url('~@/assets/images/step5/底部多主体和不一致的背景.png'); background-size: 100% 100%; width: 16vw; height: 7vh;
  display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 0;
}
.metric-title { font-family: 'DOUYUFont'; font-size: 10px; padding-left: 40px; text-align: left; width: 100%; }
.metric-value { font-size: 1.8rem; font-weight: bold; font-family: 'DingTalk-JinBuTi', sans-serif !important; }
.export-btn {
  position: absolute; right: 1vw; background-image: url('~@/assets/images/step5/按钮-结果导出.png'); background-size: 100% 100%;
  width: 150px; height: 45px; background-color: transparent; border: none; cursor: pointer; color: #333; font-weight: bold; font-size: 1rem;
  padding-right: 20px; text-align: right; font-family: 'DingTalk-JinBuTi', sans-serif !important;
}
.export-btn:disabled { filter: grayscale(1); opacity: 0.5; cursor: not-allowed; }

.metric-spinner {
  display: inline-block; width: 22px; height: 22px;
  border: 3px solid rgba(0, 229, 255, 0.2); border-left-color: #00e5ff;
  border-radius: 50%; animation: spin 1s linear infinite; vertical-align: middle;
}
</style>
