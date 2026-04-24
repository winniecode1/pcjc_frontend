<template>
  <div class="attribution-diagnosis-container">
    <!-- 顶部导航按钮 -->
    <b-row class="header-bar align-items-center no-gutters">
      <b-col cols="4" class="text-left">
        <button class="header-btn btn-home" @click="$router.push('/')">首页</button>
        <button class="header-btn btn-back" @click="$router.push('/combined-diagnosis')">上个页面</button>
      </b-col>
      <b-col cols="4"></b-col>
      <b-col cols="4" class="text-right d-flex justify-content-end">
        <button class="header-btn btn-next" @click="$router.push('/')">下个页面</button>
      </b-col>
    </b-row>

    <!-- 主要内容网格 -->
    <b-row class="content-row no-gutters">
      <!-- 左侧栏：数据分类与交互 (与 CombinedDiagnosis 一致) -->
      <b-col cols="3" class="left-column px-2">
        <div class="panel-header header-select-data clean-header">选择认知传播数据源</div>

        <div class="sidebar-scroll-area">
          <div class="folder-group">
            <div class="video-item folder-header-item" @click="isLiveOpen = !isLiveOpen">
              <span class="folder-name-container">
                <span class="fold-arrow" :class="{ rotated: isLiveOpen }">▶</span>
                <span class="folder-label">指挥官作战指令传播数据</span>
              </span>
            </div>
            <div v-show="isLiveOpen" class="items-container">
              <div v-for="video in videoList" :key="video.id" class="video-item" @click="selectVideo(video)"
                :class="{ 'selected': selectedVideo && selectedVideo.id === video.id }">
                <span class="video-name">{{ video.name }}</span>
                <span class="selector-circle"></span>
              </div>
            </div>
          </div>
        </div>

        <div class="preview-container">
          <div class="panel-header header-select-data clean-header">数据内容预览</div>
          <div class="preview-frame" style="position: relative;">
            <div v-if="carouselItems.length === 0" class="preview-placeholder">请选择数据源查看预览</div>
            <b-carousel
              v-else
              id="analysis-preview-carousel"
              v-model="carouselSlide"
              :interval="4000"
              controls
              indicators
              background="transparent"
              class="w-100 h-100 custom-carousel"
            >
              <b-carousel-slide v-for="(item, index) in carouselItems" :key="index">
                <template #img>
                  <div class="carousel-slide-content">
                    <img v-if="item.type === 'image'" :src="item.src" class="slide-media slide-media-image">
                    <video v-else-if="item.type === 'video'" :src="item.src" autoplay muted loop class="slide-media slide-media-video"></video>
                    <div v-else-if="item.type === 'text'" class="text-slide-content">
                      <div class="text-slide-title">{{ item.title }}</div>
                      <div class="text-slide-desc">{{ item.content }}</div>
                    </div>
                  </div>
                </template>
              </b-carousel-slide>
            </b-carousel>
          </div>
        </div>

        <div class="action-buttons">
          <button @click="startAnalysis" :disabled="isSelectingFile" class="btn-start-detect">
            <span class="btn-text-pos">{{ isSelectingFile ? '数据加载中...' : (isLoading ? '分析中...' : '开始主体解析') }}</span>
          </button>
        </div>
      </b-col>

      <!-- 右侧区域：有向图与详细信息 -->
      <b-col cols="9" class="right-column-custom">
        <div class="analysis-top-section">
          <!-- 有向图区域 -->
          <div class="graph-card">
            <div class="small-panel-header">多主体认知传播有向图</div>
            <div id="myDiagramDiv" class="diagram-div"></div>
            <div v-if="isGraphParsing" class="graph-parsing-mask">
              <div class="graph-parsing-text">正在多主体解析...</div>
            </div>
          </div>

          <!-- 详细信息展示 -->
          <div class="details-card">
            <div class="small-panel-header">节点详细信息</div>
            <div class="details-body">
              <div v-if="!selectedNode" class="no-selection">请点击图中节点查看详情</div>
              <div v-else class="node-info">
                <div class="info-row" v-if="selectedNode.text">
                  <span class="info-label">名称：</span>
                  <span class="info-value highlight-blue">{{ selectedNode.text }}</span>
                </div>
                <div class="info-row" v-if="selectedNode.category">
                  <span class="info-label">类型：</span>
                  <span class="info-value">{{ selectedNode.category === 'Module' ? '功能模块' : '数据变量' }}</span>
                </div>
                <div class="info-row description-row" v-if="String(selectedNode.desc || '').trim()">
                  <span class="info-label">当前数值：</span>
                  <div class="info-text">{{ selectedNode.desc }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部指标 -->
        <div class="analysis-bottom-section">
          <div class="metric-card-custom formula-card-custom">
            <div class="m-title formula-title-custom">计算公式</div>
            <div ref="formulaRef" class="m-value formula-text-custom"></div>
          </div>
          <div class="metric-card-custom">
            <div class="m-title">增强前 多主体解析准确率</div>
            <div class="m-value">69.8<span>%</span></div>
          </div>
          <div class="metric-card-custom">
            <div class="m-title">增强后 多主体解析准确率</div>
            <div class="m-value">81.5<span>%</span></div>
          </div>
          <div class="metric-card-custom">
            <div class="m-title">根因诊断后 多主体解析准确率</div>
            <div class="m-value">
              {{ rootCauseAccuracy === null ? '--' : rootCauseAccuracy.toFixed(1) }}<span>%</span>
            </div>
          </div>
          <button class="export-btn-custom">结果导出</button>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import * as echarts from 'echarts';
const API_BASE_URL = process.env.VUE_APP_MODULE5_API_BASE_URL || 'http://127.0.0.1:5236';
const DATASET_API_BASE_URL = process.env.VUE_APP_STAGE1_API_BASE_URL ||
  process.env.VUE_APP_DATASET_API_BASE_URL ||
  'http://10.109.253.71:5237';
const ANALYSIS_ACCURACY_TIMER_KEY = 'pcjc_analysis_root_accuracy_timer_v1';
const ANALYSIS_ACCURACY_DELAY_MS = 5 * 60 * 1000;
const ANALYSIS_ACCURACY_DONE_VALUE = 89.3;

function firstNonEmptyValue(...values) {
  for (let i = 0; i < values.length; i += 1) {
    const value = values[i];
    if (value === null || value === undefined) continue;
    const txt = String(value).trim();
    if (txt) return txt;
  }
  return '';
}

function safeReadPath(obj, path, defaultValue = '') {
  if (!obj || !path) return defaultValue;
  const keys = String(path).split('.');
  let cur = obj;
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (cur && Object.prototype.hasOwnProperty.call(cur, key)) {
      cur = cur[key];
    } else {
      return defaultValue;
    }
  }
  return cur === undefined ? defaultValue : cur;
}

function resolveSampleId(sourceInfo = {}, sampleData = {}, s1 = {}, explicitSampleId = '') {
  const fromExplicit = firstNonEmptyValue(explicitSampleId);
  if (fromExplicit) return fromExplicit;
  const fromSampleData = firstNonEmptyValue(sampleData.id);
  if (fromSampleData) return fromSampleData;
  const fromSourceId = firstNonEmptyValue(sourceInfo.source_id);
  if (fromSourceId) return fromSourceId;
  const fromStage = firstNonEmptyValue(safeReadPath(s1, 'model_output.id', ''));
  if (fromStage) return fromStage;
  const path = firstNonEmptyValue(sourceInfo.path);
  const m = path.match(/(firc_junshi_\d+)/i);
  return m ? m[1] : '';
}

export default {
  name: 'AnalysisDashboard',
  data() {
    return {
      isLiveOpen: true,
      videoList: [],
      selectedVideo: null,
      isSelectingFile: false,
      selectedFileContext: null,
      carouselSlide: 0,
      carouselItems: [],
      isLoading: false,
      isGraphParsing: false,
      analysisHighlightRunId: 0,
      rootCauseAccuracy: null,
      rootCauseAccuracyTimer: null,
      myChart: null,
      graphBaseData: [],
      graphBaseLinks: [],
      selectedNode: null
    };
  },
  async mounted() {
    await this.fetchVideoList();
    this.initChart();
    this.renderFormula();
    await this.restorePreviousSelection();
    this.restoreRootCauseAccuracyTimerFromStorage();
  },
  beforeDestroy() {
    if (this.rootCauseAccuracyTimer) {
      clearTimeout(this.rootCauseAccuracyTimer);
      this.rootCauseAccuracyTimer = null;
    }
  },
  methods: {
    renderFormula() {
      if (!window.katex) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
        document.head.appendChild(link);
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js';
        script.onload = () => { this.doRender(); };
        document.head.appendChild(script);
      } else {
        this.doRender();
      }
    },
    doRender() {
      if (window.katex && this.$refs.formulaRef) {
        window.katex.render("\\mathrm{Acc}=\\frac{\\sum_{i}\\sum_{j} w_j\\cdot\\operatorname{Sim}(\\hat{y}_{i,j},y_{i,j})}{N}", this.$refs.formulaRef, {
          throwOnError: false, displayMode: false
        });
      }
    },
    initChart() {
      const chartDom = document.getElementById('myDiagramDiv');
      this.myChart = echarts.init(chartDom);

      const option = {
        tooltip: { show: false },
        series: [
          {
            type: 'graph',
            layout: 'none',
            symbolSize: 50,
            roam: true,
            label: {
              show: true,
              position: 'inside',
              color: '#fff',
              fontSize: 12,
              fontFamily: 'DingTalk-JinBuTi',
              formatter: '{c}'
            },
            edgeSymbol: ['none', 'arrow'],
            edgeSymbolSize: [4, 10],
            data: [
              { name: 'M1', value: '多模态认知偏差检测', x: 200, y: 300, symbol: 'circle', symbolSize: 95, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#2a5298' }, { offset: 1, color: '#1e3c72' }]), borderColor: '#4ED8FF', borderWidth: 2, shadowColor: '#4ED8FF', shadowBlur: 10 }, label: { fontSize: 12, fontWeight: 'bold', formatter: '多模态\n认知偏差\n检测' }, desc: "该模块负责处理视频、指令等多模态输入，识别初步的认知偏差迹象。", status: "检测中" },
              { name: 'M2', value: '先验知识认知偏差检测', x: 800, y: 200, symbol: 'circle', symbolSize: 95, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#2a5298' }, { offset: 1, color: '#1e3c72' }]), borderColor: '#4ED8FF', borderWidth: 2, shadowColor: '#4ED8FF', shadowBlur: 10 }, label: { fontSize: 12, fontWeight: 'bold', formatter: '先验知识\n认知偏差\n检测' }, desc: "结合专家知识库，对初步检测结果进行先验逻辑验证。", status: "待启动" },
              { name: 'M3', value: '智能体协商认知偏差检测', x: 300, y: 550, symbol: 'circle', symbolSize: 95, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#2a5298' }, { offset: 1, color: '#1e3c72' }]), borderColor: '#4ED8FF', borderWidth: 2, shadowColor: '#4ED8FF', shadowBlur: 10 }, label: { fontSize: 12, fontWeight: 'bold', formatter: '智能体协商\n认知偏差\n检测' }, desc: "通过多个智能体的博弈与协商，进一步精细化偏差定位。", status: "待启动" },
              { name: 'M4', value: '决策选择认知偏差检测', x: 850, y: 550, symbol: 'circle', symbolSize: 95, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#2a5298' }, { offset: 1, color: '#1e3c72' }]), borderColor: '#4ED8FF', borderWidth: 2, shadowColor: '#4ED8FF', shadowBlur: 10 }, label: { fontSize: 12, fontWeight: 'bold', formatter: '决策选择\n认知偏差\n检测' }, desc: "在决策层面上分析认知偏差对最终行动方案的影响。", status: "待启动" },
              { name: 'V1', value: 'V_video', x: 150, y: 100, symbol: 'circle', symbolSize: 60, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#fa709a' }, { offset: 1, color: '#fee140' }]), borderColor: '#ffb07c', borderWidth: 2, shadowColor: '#ffb07c', shadowBlur: 10 }, label: { color: '#4a1a1a', fontStyle: 'italic', fontSize: 11, formatter: '{c}' }, desc: "输入视频流数据。" },
              { name: 'V2', value: 'V_instr', x: 300, y: 100, symbol: 'circle', symbolSize: 60, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#fa709a' }, { offset: 1, color: '#fee140' }]), borderColor: '#ffb07c', borderWidth: 2, shadowColor: '#ffb07c', shadowBlur: 10 }, label: { color: '#4a1a1a', fontStyle: 'italic', fontSize: 11, formatter: '{c}' }, desc: "指挥官下达的初始指令文本。" },
              { name: 'V3', value: 'V_det', x: 550, y: 200, symbol: 'circle', symbolSize: 60, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#fa709a' }, { offset: 1, color: '#fee140' }]), borderColor: '#ffb07c', borderWidth: 2, shadowColor: '#ffb07c', shadowBlur: 10 }, label: { color: '#4a1a1a', fontStyle: 'italic', fontSize: 11, formatter: '{c}' }, desc: "目标检测识别结果。" },
              { name: 'V4', value: 'V_desc', x: 500, y: 350, symbol: 'circle', symbolSize: 60, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#fa709a' }, { offset: 1, color: '#fee140' }]), borderColor: '#ffb07c', borderWidth: 2, shadowColor: '#ffb07c', shadowBlur: 10 }, label: { color: '#4a1a1a', fontStyle: 'italic', fontSize: 11, formatter: '{c}' }, desc: "场景语义描述特征向量。" },
              { name: 'V5', value: 'V_know', x: 1000, y: 350, symbol: 'circle', symbolSize: 60, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#fa709a' }, { offset: 1, color: '#fee140' }]), borderColor: '#ffb07c', borderWidth: 2, shadowColor: '#ffb07c', shadowBlur: 10 }, label: { color: '#4a1a1a', fontStyle: 'italic', fontSize: 11, formatter: '{c}' }, desc: "外部先验知识库条目。" },
              { name: 'V6', value: 'V_cand', x: 650, y: 500, symbol: 'circle', symbolSize: 60, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#fa709a' }, { offset: 1, color: '#fee140' }]), borderColor: '#ffb07c', borderWidth: 2, shadowColor: '#ffb07c', shadowBlur: 10 }, label: { color: '#4a1a1a', fontStyle: 'italic', fontSize: 11, formatter: '{c}' }, desc: "候选偏差原因集合。" },
              { name: 'V7', value: 'V_class', x: 550, y: 650, symbol: 'circle', symbolSize: 60, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#fa709a' }, { offset: 1, color: '#fee140' }]), borderColor: '#ffb07c', borderWidth: 2, shadowColor: '#ffb07c', shadowBlur: 10 }, label: { color: '#4a1a1a', fontStyle: 'italic', fontSize: 11, formatter: '{c}' }, desc: "偏差所属的分类等级。" },
              { name: 'V8', value: 'V_hazard', x: 800, y: 750, symbol: 'circle', symbolSize: 60, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#fa709a' }, { offset: 1, color: '#fee140' }]), borderColor: '#ffb07c', borderWidth: 2, shadowColor: '#ffb07c', shadowBlur: 10 }, label: { color: '#4a1a1a', fontStyle: 'italic', fontSize: 11, formatter: '{c}' }, desc: "最终评估的冲突危害等级。" }
            ],
            links: [
              { source: 'V1', target: 'M1' }, { source: 'V2', target: 'M1' },
              { source: 'M1', target: 'V3' }, { source: 'M1', target: 'V4' },
              { source: 'V3', target: 'M2' }, { source: 'V4', target: 'M2' },
              { source: 'V5', target: 'M2' }, { source: 'V6', target: 'M3' },
              { source: 'M2', target: 'V6' }, { source: 'M3', target: 'V7' },
              { source: 'V7', target: 'M4' }, { source: 'M4', target: 'V8' }
            ],
            lineStyle: { opacity: 0.9, width: 2, curveness: 0.3, color: '#4ED8FF' }
          }
        ]
      };
      this.myChart.setOption(option);
      this.cacheGraphBaseStyles();
      this.myChart.on('click', (params) => {
        if (params.dataType === 'node') {
          const nodeName = params.data.name;
          const isModule = typeof nodeName === 'string' && /^M\d+$/i.test(nodeName);
          this.selectedNode = {
            text: params.data.value,
            category: isModule ? 'Module' : 'Variable',
            desc: params.data.desc,
            value: params.data.status
          };
        }
      });
      window.addEventListener('resize', () => { this.myChart && this.myChart.resize(); });
    },
    cacheGraphBaseStyles() {
      if (!this.myChart) return;
      const option = this.myChart.getOption();
      if (!option || !option.series || !option.series[0]) return;
      const series = option.series[0];
      const data = Array.isArray(series.data) ? series.data : [];
      const links = Array.isArray(series.links) ? series.links : [];

      this.graphBaseData = data.map((node) => ({
        ...node,
        itemStyle: { ...(node.itemStyle || {}) },
        label: { ...(node.label || {}) }
      }));
      this.graphBaseLinks = links.map((link) => ({
        ...link,
        lineStyle: { ...(link.lineStyle || {}) }
      }));
    },
    async fetchVideoList() {
      try {
        const response = await this.$ajax.get(`${API_BASE_URL}/module5/api/data-sources`);
        const sources = this.safeGet(response, 'data.data_sources', []);
        if (Array.isArray(sources)) {
          this.videoList = sources.map((src, idx) => ({
            id: idx + 1,
            source_id: src.source_id,
            name: src.source_id,
            path: src.path,
            type: 'live'
          }));
        }
      } catch (error) {
        console.warn("获取数据失败", error);
        this.videoList = [];
      }
    },
    async selectVideo(video, options = {}) {
      const { resetAccuracyTimer = true } = options;
      if (resetAccuracyTimer) {
        this.resetRootCauseAccuracyTimerByDataSelection();
      }
      this.selectedVideo = video;
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
          { type: this.isVideo(video.name) ? 'video' : 'image', src: this.isVideo(video.name) ? this.videoUrl(video.path) : this.imageUrl(video.path) }
        ];
      } finally {
        this.isSelectingFile = false;
      }
    },
    async requestFileSelection(video) {
      const res = await this.$ajaxJ.post(
        `${API_BASE_URL}/module5/api/file-selection`,
        {
          source_id: video.source_id,
          path: video.path
        },
        { timeout: 12000 }
      );
      return res.data;
    },
    normalizeCarouselItems(items) {
      if (!Array.isArray(items)) return [];
      return items
        .filter(item => item && item.type)
        .map((item, idx) => {
          const stage = item.stage || 'Stage?';
          const stageIndex = Number.isFinite(item.stage_index) ? item.stage_index : this.parseStageIndex(stage);
          const mediaSrc = this.normalizeMediaSrc(item.src);
          return {
            ...item,
            stage,
            stage_index: stageIndex,
            src: mediaSrc || item.src || '',
            title: item.title || `预览项 ${idx + 1}`
          };
        });
    },
    normalizeMediaSrc(src) {
      const raw = String(src || '').trim();
      if (!raw) return '';
      if (/^https?:\/\//i.test(raw)) return raw;
      if (raw.startsWith('/')) return `${API_BASE_URL}${raw}`;
      return raw;
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
    readRootCauseAccuracyTimerState() {
      try {
        const raw = localStorage.getItem(ANALYSIS_ACCURACY_TIMER_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        return parsed;
      } catch (e) {
        return null;
      }
    },
    persistRootCauseAccuracyTimerState(state) {
      try {
        localStorage.setItem(ANALYSIS_ACCURACY_TIMER_KEY, JSON.stringify(state || {}));
      } catch (e) {
        // ignore
      }
    },
    clearRootCauseAccuracyTimerState() {
      try {
        localStorage.removeItem(ANALYSIS_ACCURACY_TIMER_KEY);
      } catch (e) {
        // ignore
      }
    },
    finishRootCauseAccuracyTimer() {
      if (this.rootCauseAccuracyTimer) {
        clearTimeout(this.rootCauseAccuracyTimer);
        this.rootCauseAccuracyTimer = null;
      }
      this.rootCauseAccuracy = ANALYSIS_ACCURACY_DONE_VALUE;
      this.persistRootCauseAccuracyTimerState({
        status: 'done',
        value: ANALYSIS_ACCURACY_DONE_VALUE,
        finishedAt: Date.now()
      });
    },
    scheduleRootCauseAccuracyTimer() {
      if (this.rootCauseAccuracyTimer) {
        clearTimeout(this.rootCauseAccuracyTimer);
        this.rootCauseAccuracyTimer = null;
      }
      this.rootCauseAccuracy = null;
      const startedAt = Date.now();
      const fireAt = startedAt + ANALYSIS_ACCURACY_DELAY_MS;
      this.persistRootCauseAccuracyTimerState({
        status: 'running',
        startedAt,
        fireAt,
        value: ANALYSIS_ACCURACY_DONE_VALUE
      });
      this.rootCauseAccuracyTimer = setTimeout(() => {
        this.finishRootCauseAccuracyTimer();
      }, ANALYSIS_ACCURACY_DELAY_MS);
    },
    restoreRootCauseAccuracyTimerFromStorage() {
      if (this.rootCauseAccuracyTimer) {
        clearTimeout(this.rootCauseAccuracyTimer);
        this.rootCauseAccuracyTimer = null;
      }
      const state = this.readRootCauseAccuracyTimerState();
      if (!state) return;
      if (state.status === 'done') {
        const doneValue = Number(state.value);
        this.rootCauseAccuracy = Number.isFinite(doneValue) ? doneValue : ANALYSIS_ACCURACY_DONE_VALUE;
        return;
      }
      if (state.status !== 'running') return;
      const fireAt = Number(state.fireAt);
      if (!Number.isFinite(fireAt) || fireAt <= 0) {
        this.clearRootCauseAccuracyTimerState();
        return;
      }
      const remaining = fireAt - Date.now();
      if (remaining <= 0) {
        this.finishRootCauseAccuracyTimer();
        return;
      }
      this.rootCauseAccuracy = null;
      this.rootCauseAccuracyTimer = setTimeout(() => {
        this.finishRootCauseAccuracyTimer();
      }, remaining);
    },
    resetRootCauseAccuracyTimerByDataSelection() {
      if (this.rootCauseAccuracyTimer) {
        clearTimeout(this.rootCauseAccuracyTimer);
        this.rootCauseAccuracyTimer = null;
      }
      this.rootCauseAccuracy = null;
      this.clearRootCauseAccuracyTimerState();
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
      this.carouselSlide = 0;
      this.carouselItems = carouselItems;
      this.persistSelectedSourceContext(this.selectedFileContext);
    },
    async startAnalysis() {
      if (!this.selectedVideo && !this.selectedFileContext) return;
      const runId = (this.analysisHighlightRunId || 0) + 1;
      this.analysisHighlightRunId = runId;
      if (this.rootCauseAccuracyTimer) {
        clearTimeout(this.rootCauseAccuracyTimer);
        this.rootCauseAccuracyTimer = null;
      }
      this.rootCauseAccuracy = null;
      this.clearRootCauseAccuracyTimerState();
      this.isLoading = true;
      this.isGraphParsing = true;
      try {
        const startTs = Date.now();
        const payload = this.buildDiagnosisPayload();
        const sampleId = resolveSampleId({ source_id: payload.source_id, path: payload.path });
        const [response, sampleData, detectionData] = await Promise.all([
          this.requestStageDiagnosisResult(payload),
          sampleId ? this.requestSampleDataById(sampleId) : Promise.resolve({}),
          sampleId ? this.requestSampleDetectionById(sampleId) : Promise.resolve({})
        ]);
        const randomWaitMs = 18000 + Math.floor(Math.random() * 5000);
        const elapsed = Date.now() - startTs;
        const remaining = Math.max(0, randomWaitMs - elapsed);
        if (remaining > 0) {
          await this.waitMs(remaining);
        }
        if (runId !== this.analysisHighlightRunId) return;
        this.applyDiagnosisToGraph(response || {}, {
          sampleId,
          sampleData,
          detectionData
        });
        this.scheduleRootCauseAccuracyTimer();
      } catch (error) {
        console.error("解析接口调用失败", error);
      } finally {
        if (runId === this.analysisHighlightRunId) {
          this.isGraphParsing = false;
        }
        this.isLoading = false;
      }
    },
    buildDiagnosisPayload() {
      const fallback = this.getPreviousSourceContext() || {};
      const stage1 = this.selectedFileContext || fallback;
      return {
        source_id: stage1.source_id || (this.selectedVideo ? this.selectedVideo.source_id : ''),
        path: stage1.path || (this.selectedVideo ? this.selectedVideo.path : '')
      };
    },
    async requestStageDiagnosisResult(payload) {
      const res = await this.$ajaxJ.post(
        `${API_BASE_URL}/module5/api/stage-diagnosis-result`,
        payload,
        { timeout: 15000 }
      );
      return res.data || {};
    },
    async requestSampleDataById(sampleId) {
      try {
        const res = await this.$ajax.get(
          `${DATASET_API_BASE_URL}/api/dataset/sample/${encodeURIComponent(sampleId)}`,
          { timeout: 10000 }
        );
        return this.safeGet(res, 'data', {});
      } catch (error) {
        console.warn('获取 sample 基础信息失败', error);
        return {};
      }
    },
    async requestSampleDetectionById(sampleId) {
      try {
        const res = await this.$ajax.get(
          `${DATASET_API_BASE_URL}/api/dataset/sample/${encodeURIComponent(sampleId)}/detection`,
          { timeout: 10000 }
        );
        return this.safeGet(res, 'data', {});
      } catch (error) {
        console.warn('获取 sample 检测信息失败', error);
        return {};
      }
    },
    applyDiagnosisToGraph(raw, external = {}) {
      if (!this.myChart) return;
      if (!this.graphBaseData.length) this.cacheGraphBaseStyles();

      const result = this.safeGet(raw, 'result', {});
      const stages = this.safeGet(result, 'stages', {});
      const getStage = (name) => (stages && typeof stages === 'object' ? (stages[name] || {}) : {});
      const s1 = getStage('Stage1');
      const s2 = getStage('Stage2');
      const s3 = getStage('Stage3');
      const s4 = getStage('Stage4');

      const fmtPercent = (v) => {
        if (v === null || v === undefined || Number.isNaN(Number(v))) return '-';
        return `${(Number(v) * 100).toFixed(1)}%`;
      };
      const short = (txt, max = 140) => {
        const t = String(txt || '').trim();
        if (!t) return '';
        return t.length > max ? `${t.slice(0, max)}...` : t;
      };

      const sourceInfo = this.selectedFileContext || this.selectedVideo || {};
      const sampleData = this.asDict(external.sampleData);
      const detectionData = this.asDict(external.detectionData);
      const sampleId = resolveSampleId(sourceInfo, sampleData, s1, external.sampleId);
      const videoAddress = sampleId;
      const instrText = this.extractInstructionText(s1, sampleData);
      const detectionText = this.extractDetectionText(s2, detectionData);
      const sceneText = this.extractSceneDescription(s1, s3, detectionData);
      const knowText = this.extractKnowledgeText(s2, s3);
      const candText = this.extractCandidateText(s2, s3);
      const classText = this.extractClassText(s3);
      const hazardText = this.extractHazardText(s4);
      const hazardLevel = this.extractHazardLevel(s4);

      const m1Propagation = this.formatPropagationIntermediate('Stage1', s1);
      const m2Propagation = this.formatPropagationIntermediate('Stage2', s2);
      const m3Propagation = this.formatPropagationIntermediate('Stage3', s3);
      const m4Propagation = this.formatPropagationIntermediate('Stage4', s4);
      const overall = this.safeGet(result, 'overall_similarity', null);
      const nodePatch = {
        M1: {
          desc: m1Propagation || this.safeGet(s1, 'final_text', ''),
          status: `内部偏差 ${fmtPercent(this.safeGet(s1, 'internal_bias_score', null))} | 传播偏差 ${fmtPercent(this.safeGet(s1, 'propagation_bias_score', null))}`
        },
        M2: {
          desc: m2Propagation || this.safeGet(s2, 'final_text', ''),
          status: `内部偏差 ${fmtPercent(this.safeGet(s2, 'internal_bias_score', null))} | 传播偏差 ${fmtPercent(this.safeGet(s2, 'propagation_bias_score', null))}`
        },
        M3: {
          desc: m3Propagation || this.safeGet(s3, 'final_text', ''),
          status: `内部偏差 ${fmtPercent(this.safeGet(s3, 'internal_bias_score', null))} | 传播偏差 ${fmtPercent(this.safeGet(s3, 'propagation_bias_score', null))}`
        },
        M4: {
          desc: m4Propagation || this.safeGet(s4, 'final_text', ''),
          status: `内部偏差 ${fmtPercent(this.safeGet(s4, 'internal_bias_score', null))} | 传播偏差 ${fmtPercent(this.safeGet(s4, 'propagation_bias_score', null))}`
        },
        V1: { desc: videoAddress || '-', status: short(videoAddress || '-', 36) },
        V2: { desc: instrText || '-', status: short(instrText || '-', 36) },
        V3: { desc: detectionText || '-', status: short(detectionText || '-', 36) },
        V4: { desc: sceneText || '-', status: short(sceneText || '-', 36) },
        V5: { desc: knowText || '-', status: short(knowText || '-', 36) },
        V6: { desc: candText || '-', status: short(candText || '-', 36) },
        V7: { desc: classText || '-', status: short(classText || '-', 36) },
        V8: {
          desc: hazardText || '-',
          status: hazardLevel || (overall !== null && overall !== undefined ? `相似度 ${(Number(overall) * 100).toFixed(1)}%` : '-')
        }
      };

      const mergedData = this.graphBaseData.map((node) => {
        const patch = nodePatch[node.name];
        if (!patch) return node;
        return { ...node, ...patch };
      });
      this.graphBaseData = mergedData;
      this.myChart.setOption({ series: [{ data: mergedData, links: this.graphBaseLinks }] });

      if (this.selectedNode && this.selectedNode.text) {
        const selected = mergedData.find((n) => n.value === this.selectedNode.text || n.name === this.selectedNode.text);
        if (selected) {
          const isModule = typeof selected.name === 'string' && /^M\d+$/i.test(selected.name);
          this.selectedNode = {
            text: selected.value,
            category: isModule ? 'Module' : 'Variable',
            desc: selected.desc,
            value: selected.status
          };
        }
      }
    },
    asDict(value) {
      return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    },
    firstNonEmpty(...values) {
      for (let i = 0; i < values.length; i += 1) {
        const value = values[i];
        if (value === null || value === undefined) continue;
        const txt = String(value).trim();
        if (txt) return txt;
      }
      return '';
    },
    toCompactText(value) {
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') return value.trim();
      if (typeof value === 'number' || typeof value === 'boolean') return String(value);
      try {
        return JSON.stringify(value, null, 2);
      } catch (e) {
        return String(value);
      }
    },
    formatKVText(obj, orderedKeys = []) {
      const map = this.asDict(obj);
      const used = new Set();
      const lines = [];
      orderedKeys.forEach((key) => {
        if (!(key in map)) return;
        const value = this.toCompactText(map[key]);
        if (!value) return;
        lines.push(`${key}: ${value}`);
        used.add(key);
      });
      Object.keys(map).forEach((key) => {
        if (used.has(key)) return;
        const value = this.toCompactText(map[key]);
        if (!value) return;
        lines.push(`${key}: ${value}`);
      });
      return lines.join('\n');
    },
    extractSampleId(sourceInfo = {}, sampleData = {}, s1 = {}, explicitSampleId = '') {
      return resolveSampleId(sourceInfo, sampleData, s1, explicitSampleId);
    },
    extractInstructionText(s1, sampleData = {}) {
      const instruction = this.firstNonEmpty(sampleData.instruction);
      if (instruction) return instruction;
      const out = this.asDict(this.safeGet(s1, 'model_output', {}));
      const bias = this.asDict(out.bias_result);
      const instructionScene = this.firstNonEmpty(out.instruction_scene, bias.instruction_scene);
      const instructionEvidence = this.firstNonEmpty(bias.instruction_evidence);
      const summary = this.firstNonEmpty(out.summary, bias.reason);
      const lines = [];
      if (instructionScene) lines.push(`作战指令场景: ${instructionScene}`);
      if (instructionEvidence) lines.push(`指令依据: ${instructionEvidence}`);
      if (summary) lines.push(`指令摘要: ${summary}`);
      return lines.join('\n');
    },
    extractDetectionText(s2, detectionData = {}) {
      const detectionObj = this.asDict(detectionData);
      const yolo = this.asDict(detectionObj.yolo_result);
      if (Object.keys(yolo).length > 0) {
        const detectedClasses = Array.isArray(yolo.detected_classes) ? yolo.detected_classes : [];
        const detections = Array.isArray(yolo.detections) ? yolo.detections : [];
        const lines = [];
        lines.push(`detection_count: ${this.firstNonEmpty(yolo.detection_count, detections.length) || '0'}`);
        if (detectedClasses.length) {
          lines.push(`detected_classes: ${detectedClasses.join(', ')}`);
        }
        detections.slice(0, 5).forEach((det, idx) => {
          const detObj = this.asDict(det);
          const cls = this.firstNonEmpty(detObj.class_name, detObj.class_id);
          const conf = this.firstNonEmpty(detObj.confidence);
          const bbox = this.toCompactText(detObj.bbox);
          lines.push(`det_${idx + 1}: class=${cls || '-'}, conf=${conf || '-'}, bbox=${bbox || '-'}`);
        });
        return lines.join('\n');
      }
      const out = this.asDict(this.safeGet(s2, 'model_output', {}));
      const req = this.asDict(out.request_params);
      const picked = {
        ground_truth: this.firstNonEmpty(out.ground_truth, req.ground_truth),
        model: this.firstNonEmpty(out.model, out.kind),
        color: this.firstNonEmpty(out.color),
        shape: this.firstNonEmpty(out.shape, out.outline),
        scene: this.firstNonEmpty(out.scene),
        img_type: this.firstNonEmpty(out.img_type, req.img_type),
        error: this.firstNonEmpty(out._error, out.error)
      };
      return this.formatKVText(picked, ['ground_truth', 'model', 'color', 'shape', 'scene', 'img_type', 'error']);
    },
    extractSceneDescription(s1, s3, detectionData = {}) {
      const detectionObj = this.asDict(detectionData);
      const desc = this.firstNonEmpty(detectionObj.description);
      const evidence = this.firstNonEmpty(detectionObj.image_evidence);
      if (desc || evidence) {
        const lines = [];
        if (desc) lines.push(`场景描述: ${desc}`);
        if (evidence) lines.push(`场景证据: ${evidence}`);
        return lines.join('\n');
      }
      const s1Out = this.asDict(this.safeGet(s1, 'model_output', {}));
      const s1Bias = this.asDict(s1Out.bias_result);
      const s3Out = this.asDict(this.safeGet(s3, 'model_output', {}));
      const lines = [];
      const scene = this.firstNonEmpty(s1Out.image_scene, s1Bias.image_scene);
      const stage1Evidence = this.firstNonEmpty(s1Bias.image_evidence);
      const battlefield = this.firstNonEmpty(s3Out.final_battlefield_analysis, s3Out.summary);
      if (scene) lines.push(`场景识别: ${scene}`);
      if (stage1Evidence) lines.push(`场景证据: ${stage1Evidence}`);
      if (battlefield) lines.push(`场景描述: ${battlefield}`);
      return lines.join('\n');
    },
    extractKnowledgeText(s2, s3) {
      const s2Out = this.asDict(this.safeGet(s2, 'model_output', {}));
      const s2Req = this.asDict(s2Out.request_params);
      const s3Out = this.asDict(this.safeGet(s3, 'model_output', {}));
      const s3Req = this.asDict(s3Out.request_params);
      const kv = {
        ground_truth: this.firstNonEmpty(s3Req.ground_truth, s2Out.ground_truth),
        kind: this.firstNonEmpty(s3Req.kind, s3Out.kind),
        color: this.firstNonEmpty(s3Req.color, s3Out.color),
        shape: this.firstNonEmpty(s3Req.shape, s3Out.shape),
        img_type: this.firstNonEmpty(s2Out.img_type, s2Req.img_type)
      };
      return this.formatKVText(kv, ['ground_truth', 'kind', 'color', 'shape', 'img_type']);
    },
    extractCandidateText(s2, s3) {
      const s2Out = this.asDict(this.safeGet(s2, 'model_output', {}));
      const s2Req = this.asDict(s2Out.request_params);
      const s3Out = this.asDict(this.safeGet(s3, 'model_output', {}));
      const s3Req = this.asDict(s3Out.request_params);
      const imagePath = this.firstNonEmpty(s2Out.image_path, s2Out.path, s2Req.img_path, s3Out.image_path, s3Req.image_path);
      const kind = this.firstNonEmpty(s3Out.kind, s3Req.kind, s2Out.kind, s2Out.ground_truth);
      return this.formatKVText({ image_path: imagePath, sub_class: kind }, ['image_path', 'sub_class']);
    },
    extractClassText(s3) {
      const out = this.asDict(this.safeGet(s3, 'model_output', {}));
      const review = this.asDict(out.final_review);
      const deviation = this.asDict(review.deviation_analysis);
      const sections = [];
      const consensus = this.firstNonEmpty(review.consensus_summary);
      const disagreement = this.firstNonEmpty(deviation.disagreement_points);
      const reason = this.firstNonEmpty(deviation.different_analysis_and_reason);
      const summary = this.firstNonEmpty(out.summary);
      if (consensus) sections.push(`【共识】\n${consensus}`);
      if (disagreement) sections.push(`【分歧】\n${disagreement}`);
      if (reason) sections.push(`【协商理由】\n${reason}`);
      if (summary) sections.push(`【结论】\n${summary}`);
      return sections.join('\n\n');
    },
    extractHazardLevel(s4) {
      const out = this.asDict(this.safeGet(s4, 'model_output', {}));
      const err = this.asDict(out.error);
      return this.firstNonEmpty(
        out.risk_level,
        out.danger_level,
        err.danger_level,
        out.decision,
        out.model_analysis_danger_level,
        out.local_txt_danger_level
      );
    },
    extractHazardText(s4) {
      const out = this.asDict(this.safeGet(s4, 'model_output', {}));
      const err = this.asDict(out.error);
      const lines = [];
      const hazard = this.extractHazardLevel(s4);
      const reason = this.firstNonEmpty(out.summary, out.reason, err.message);
      const model = this.firstNonEmpty(out.weapon_model, this.safeGet(s4, 'model_output.request_params.weapon_model', ''));
      if (model) lines.push(`武器型号: ${model}`);
      if (hazard) lines.push(`威胁等级: ${hazard}`);
      if (reason) lines.push(`判断理由: ${reason}`);
      return lines.join('\n');
    },
    formatPropagationIntermediate(stageName, stageData) {
      const propagation = this.asDict(this.safeGet(stageData, 'propagation_output', {}));
      const upstream = this.toCompactText(this.safeGet(propagation, 'counterfactual_upstream_output', ''));
      const downstream = this.toCompactText(this.safeGet(propagation, 'downstream_results', ''));
      const lines = [];
      lines.push(`[${stageName}] 认知传播偏差中间结果`);
      if (upstream) lines.push(`反事实上游输出:\n${upstream}`);
      if (downstream) lines.push(`后续模块输出:\n${downstream}`);
      return lines.join('\n\n');
    },
    getPreviousSourceContext() {
      const query = (this.$route && this.$route.query) ? this.$route.query : {};
      const qSourceId = String(query.source_id || '').trim();
      const qPath = String(query.path || '').trim();
      if (qSourceId || qPath) {
        return { source_id: qSourceId, path: qPath };
      }
      try {
        const raw = sessionStorage.getItem('pcjc_selected_source_context');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        const source_id = String(parsed.source_id || '').trim();
        const path = String(parsed.path || '').trim();
        if (!source_id && !path) return null;
        return { source_id, path };
      } catch (e) {
        return null;
      }
    },
    async restorePreviousSelection() {
      const previous = this.getPreviousSourceContext();
      if (!previous) return;
      let target = this.videoList.find((v) => (
        (previous.source_id && v.source_id === previous.source_id) ||
        (previous.path && v.path === previous.path)
      ));
      if (!target) {
        target = {
          id: this.videoList.length + 1,
          source_id: previous.source_id || `source_${Date.now()}`,
          name: previous.source_id || previous.path,
          path: previous.path,
          type: 'live'
        };
        this.videoList = [target, ...this.videoList];
      }
      await this.selectVideo(target, { resetAccuracyTimer: false });
    },
    persistSelectedSourceContext(ctx) {
      const source_id = String((ctx || {}).source_id || '').trim();
      const path = String((ctx || {}).path || '').trim();
      if (!source_id && !path) return;
      try {
        sessionStorage.setItem('pcjc_selected_source_context', JSON.stringify({ source_id, path }));
      } catch (e) {
        // ignore
      }
    },
    waitMs(ms) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    },
    // 固定高亮方式 1：亮 V_det，然后除了 Video、instr、desc，其他节点全亮
    highlightPresetDetAllExceptVideoInstrDesc() {
      const exclude = this.resolveNodeNames(['video', 'instr', 'desc', '多模态']);
      const nodes = this.getAllNodeNames().filter(name => !exclude.includes(name));
      this.highlightGraphByNodeSet(nodes);
    },
    // 固定高亮方式 2：亮 V_desc，然后除了 Video、instr、det，其他节点全亮
    highlightPresetDescAllExceptVideoInstrDet() {
      const exclude = this.resolveNodeNames(['video', 'instr', 'det', '多模态']);
      const nodes = this.getAllNodeNames().filter(name => !exclude.includes(name));
      this.highlightGraphByNodeSet(nodes);
    },
    // 固定高亮方式 3：亮 V_cand、智能体协商、class、决策选择、hazard
    highlightPresetCandToHazard() {
      const nodes = this.resolveNodeNames(['V_cand', '智能体协商', 'class', '决策选择', 'hazard']);
      this.highlightGraphByNodeSet(nodes);
    },
    // 固定高亮方式 4：亮 class、决策选择、hazard
    highlightPresetClassToHazard() {
      const nodes = this.resolveNodeNames(['class', '决策选择', 'harzand']);
      this.highlightGraphByNodeSet(nodes);
    },
    // 可选：统一入口，便于外部直接按模式名调用
    applyFixedHighlightMode(mode) {
      const handlerMap = {
        det_all_except_video_instr_desc: this.highlightPresetDetAllExceptVideoInstrDesc,
        desc_all_except_video_instr_det: this.highlightPresetDescAllExceptVideoInstrDet,
        cand_to_hazard: this.highlightPresetCandToHazard,
        class_to_hazard: this.highlightPresetClassToHazard
      };
      const handler = handlerMap[mode];
      if (handler) handler.call(this);
    },
    highlightGraphByNodeSet(nodeNames) {
      const nodes = this.resolveNodeNames(nodeNames);
      const edges = this.buildEdgesForNodes(nodes);
      this.highlightGraphByConfig({ nodes, edges });
    },
    buildEdgesForNodes(nodeNames) {
      if (!this.graphBaseLinks.length) {
        this.cacheGraphBaseStyles();
      }
      const nodeSet = new Set(nodeNames || []);
      return this.graphBaseLinks
        .filter(link => nodeSet.has(link.source) && nodeSet.has(link.target))
        .map(link => `${link.source}->${link.target}`);
    },
    getAllNodeNames() {
      if (!this.graphBaseData.length) {
        this.cacheGraphBaseStyles();
      }
      return this.graphBaseData.map(node => node.name);
    },
    resolveNodeNames(nodeAliases) {
      const aliasMap = {
        // 模块
        m1: 'M1',
        m2: 'M2',
        m3: 'M3',
        m4: 'M4',
        '智能体协商': 'M3',
        '决策选择': 'M4',
        "多模态": 'M1',
        // 变量
        video: 'V1',
        v_video: 'V1',
        instr: 'V2',
        v_instr: 'V2',
        det: 'V3',
        v_det: 'V3',
        desc: 'V4',
        v_desc: 'V4',
        know: 'V5',
        v_know: 'V5',
        cand: 'V6',
        v_cand: 'V6',
        class: 'V7',
        v_class: 'V7',
        hazard: 'V8',
        harzand: 'V8',
        v_hazard: 'V8'
      };
      const allNames = this.getAllNodeNames();
      const resolved = (nodeAliases || []).map((alias) => {
        if (!alias) return '';
        const key = String(alias).trim().toLowerCase();
        return aliasMap[key] || String(alias).trim();
      });
      return Array.from(new Set(resolved.filter(name => allNames.includes(name))));
    },
    // 通用高亮函数：传入要高亮的节点和边即可
    // edges 支持两种格式：['A->B'] 或 [{ source: 'A', target: 'B' }]
    highlightGraphByConfig(config = {}) {
      if (!this.myChart) return;
      if (!this.graphBaseData.length || !this.graphBaseLinks.length) {
        this.cacheGraphBaseStyles();
      }

      const nodes = Array.isArray(config.nodes) ? config.nodes : [];
      const edges = Array.isArray(config.edges) ? config.edges : [];
      const nodeSet = new Set(nodes);
      const edgeSet = new Set(edges.map((edge) => this.normalizeEdgeKey(edge)));

      const highlightedData = this.graphBaseData.map((node) => {
        const isActive = nodeSet.has(node.name);
        const defaultLabelColor = node.label && node.label.color ? node.label.color : '#fff';
        return {
          ...node,
          itemStyle: {
            ...(node.itemStyle || {}),
            opacity: isActive ? 1 : 0.35,
            borderWidth: isActive ? 4 : 2,
            borderColor: isActive ? '#ffe66d' : ((node.itemStyle && node.itemStyle.borderColor) || '#4ED8FF'),
            shadowColor: isActive ? '#ffe66d' : ((node.itemStyle && node.itemStyle.shadowColor) || '#4ED8FF'),
            shadowBlur: isActive ? 28 : ((node.itemStyle && node.itemStyle.shadowBlur) || 10)
          },
          label: {
            ...(node.label || {}),
            color: isActive ? '#fffde8' : defaultLabelColor
          }
        };
      });

      const highlightedLinks = this.graphBaseLinks.map((link) => {
        const key = this.normalizeEdgeKey(link);
        const isActive = edgeSet.has(key);
        return {
          ...link,
          lineStyle: {
            ...(link.lineStyle || {}),
            opacity: isActive ? 1 : 0.2,
            width: isActive ? 4 : 1.5,
            color: isActive ? '#ffe66d' : '#4ED8FF'
          }
        };
      });

      this.myChart.setOption({
        series: [{ data: highlightedData, links: highlightedLinks }]
      });
    },
    // 刷新函数：清除高亮，恢复初始样式
    resetGraphHighlight() {
      if (!this.myChart) return;
      if (!this.graphBaseData.length || !this.graphBaseLinks.length) {
        this.cacheGraphBaseStyles();
      }
      this.myChart.setOption({
        series: [{ data: this.graphBaseData, links: this.graphBaseLinks }]
      });
    },
    normalizeEdgeKey(edge) {
      if (typeof edge === 'string') {
        return edge;
      }
      if (edge && edge.source !== undefined && edge.target !== undefined) {
        return `${edge.source}->${edge.target}`;
      }
      return '';
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
    isVideo(name) { return name && (name.endsWith('.mp4') || name.endsWith('.avi')); },
    videoUrl(path) {
      if (!path) return '';
      if (/^https?:\/\//i.test(path)) return path;
      return `${API_BASE_URL}${path}`;
    },
    imageUrl(path) {
      if (!path) return require('@/assets/images/step1/-s-弹框-选择数据.png');
      if (/^https?:\/\//i.test(path)) return path;
      return `${API_BASE_URL}${path}`;
    }
  }
};
</script>

<style scoped>
/* 使用与 CombinedDiagnosis 一致的样式 */
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
.folder-header-item { flex-shrink: 0; color: #4ED8FF !important; font-weight: bold; cursor: pointer; height: 40px; padding: 0 15px; display: flex; align-items: center; }
.folder-name-container { display: flex; align-items: center; }
.fold-arrow { display: inline-block; width: 14px; height: 14px; margin-right: 8px; font-size: 12px; transition: transform 0.2s linear; color: #00e5ff; }
.fold-arrow.rotated { transform: rotate(90deg); }

.items-container { flex-grow: 1; overflow-y: auto; min-height: 0; max-height: 25vh; }
.items-container::-webkit-scrollbar { width: 8px; }
.items-container::-webkit-scrollbar-track {
  background: linear-gradient(180deg, rgba(8, 34, 58, 0.75), rgba(6, 22, 42, 0.65));
  border-radius: 8px;
}
.items-container::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(78, 216, 255, 0.9), rgba(33, 143, 215, 0.9));
  border-radius: 8px;
  border: 1px solid rgba(5, 30, 50, 0.55);
}
.items-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(124, 233, 255, 0.95), rgba(52, 168, 235, 0.95));
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
  min-height: 0; overflow: hidden; position: relative;
}
.preview-placeholder { color: #8bd3f9; font-size: 14px; opacity: 0.7; }
.carousel-slide-content { height: 26vh; display: flex; align-items: center; justify-content: center; width: 100%; padding: 4px; overflow: hidden; }
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
  border-radius: 8px; padding: 16px; display: flex; flex-direction: column; justify-content: center; text-align: left; margin: 0 auto;
}
.text-slide-title { font-size: 15px; font-weight: bold; color: #00e5ff; margin-bottom: 8px; border-bottom: 1px solid rgba(0, 229, 255, 0.3); padding-bottom: 5px; }
.text-slide-desc { font-size: 13px; color: #c6f4ff; line-height: 1.7; white-space: pre-wrap; flex: 1; overflow-y: auto; }
.text-slide-desc::-webkit-scrollbar { width: 8px; height: 3px; }
.text-slide-desc::-webkit-scrollbar-track {
  background: linear-gradient(180deg, rgba(9, 34, 56, 0.75), rgba(7, 24, 44, 0.65));
  border-radius: 8px;
}
.text-slide-desc::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(95, 221, 255, 0.88), rgba(40, 151, 225, 0.88));
  border-radius: 8px;
  border: 1px solid rgba(9, 28, 46, 0.5);
}
.text-slide-desc::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(140, 236, 255, 0.95), rgba(64, 178, 242, 0.95));
}
.custom-carousel .carousel-indicators li { background-color: #4ED8FF; }
.custom-carousel .carousel-control-prev-icon, .custom-carousel .carousel-control-next-icon { filter: drop-shadow(0 0 4px #00e5ff); }

/* 分析按钮 */
.action-buttons { height: 10vh; display: flex; justify-content: center; align-items: center; flex-shrink: 0; }
.btn-start-detect {
  background: none; border: none; cursor: pointer; width: 220px; height: 80px;
  background-image: url('~@/assets/images/step1/-s-按钮-开始测试.png');
  background-size: 100% 100%; position: relative; transition: filter 0.3s;
}
.btn-start-detect:disabled { filter: grayscale(1); cursor: not-allowed; }
.btn-text-pos { position: absolute; top: 60%; left: 50%; transform: translate(-50%, -50%); font-family: 'DOUYUFont'; font-size: 15px; color: #FFFFFF; }

/* ================= 右侧可视化区域 ================= */
.right-column-custom { height: 100%; padding-left: 20px; display: flex; flex-direction: column; }
.analysis-top-section { flex: 1; display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 20px; margin-bottom: 20px; min-height: 0; }

.graph-card { display: flex; flex-direction: column; background-image: url('~@/assets/images/step1/-s-弹框-选择数据.png'); background-size: 100% 100%; padding: 10px; overflow: hidden; min-width: 0; min-height: 0; position: relative; }
.diagram-div { flex: 1; min-height: 0; cursor: crosshair; }
.graph-parsing-mask {
  position: absolute;
  inset: 10px;
  background: rgba(7, 22, 40, 0.58);
  backdrop-filter: blur(1px);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(78, 216, 255, 0.3);
  border-radius: 6px;
  z-index: 5;
}
.graph-parsing-text {
  color: #d8f6ff;
  font-size: 20px;
  letter-spacing: 1px;
  text-shadow: 0 0 8px rgba(78, 216, 255, 0.65);
}

.details-card { display: flex; flex-direction: column; background-image: url('~@/assets/images/step1/-s-弹框-选择数据.png'); background-size: 100% 100%; padding: 20px; min-width: 0; min-height: 0; overflow: hidden; }
.small-panel-header { font-family: 'DOUYUFont'; font-size: 14px; color: #c6f4ff; border-bottom: 1px solid rgba(78, 216, 255, 0.3); padding-bottom: 5px; margin-bottom: 15px; text-align: center; padding-top: 8px; }

.details-body { flex: 1; overflow: auto; color: #8bd3f9; min-width: 0; }
.details-body::-webkit-scrollbar { width: 6px; height: 3px; }
.details-body::-webkit-scrollbar-track {
  background: rgba(6, 26, 44, 0.55);
  border-radius: 6px;
}
.details-body::-webkit-scrollbar-thumb {
  background: rgba(70, 195, 245, 0.82);
  border-radius: 6px;
}
.no-selection { height: 100%; display: flex; align-items: center; justify-content: center; opacity: 0.5; font-style: italic; }
.node-info { display: flex; flex-direction: column; gap: 15px; }
.info-row { display: flex; align-items: baseline; }
.info-label { font-weight: bold; min-width: 80px; color: #4ED8FF; }
.info-value { flex: 1; word-break: break-all; }
.highlight-blue { color: #00e5ff; font-weight: bold; font-size: 1.1rem; }
.highlight-red { color: #ff5e5e; font-weight: bold; }
.info-text { margin-top: 5px; line-height: 1.5; color: rgba(139, 211, 249, 0.8); background: rgba(0, 0, 0, 0.2); padding: 10px; border-radius: 4px; white-space: pre-wrap; overflow: auto; overflow-wrap: anywhere; word-break: break-word; }
.info-text::-webkit-scrollbar { width: 6px; height: 3px; }
.info-text::-webkit-scrollbar-track {
  background: rgba(6, 24, 40, 0.45);
  border-radius: 6px;
}
.info-text::-webkit-scrollbar-thumb {
  background: rgba(78, 216, 255, 0.78);
  border-radius: 6px;
}

/* ================= 底部指标 ================= */
.analysis-bottom-section { height: 10vh; display: flex; justify-content: flex-start; gap: 1vw; align-items: center; margin-top: 10px; position: relative; padding-left: 10px; }
.metric-card-custom {
  background-image: url('~@/assets/images/step5/底部多主体和不一致的背景.png'); background-size: 100% 100%; width: 13vw; height: 7vh;
  display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 0 5px;
}
.m-title { font-family: 'DOUYUFont'; font-size: 10px; padding-left: 30px; text-align: left; width: 100%; color: #FFFFFF; }
.formula-title-custom {
  padding-left: 18px;
  margin-top: -4px;
}
.m-value { font-size: 1.8rem; font-weight: bold; font-family: 'DingTalk-JinBuTi', sans-serif !important; color: #c6f4ff; }
.m-value span { font-size: 1rem; margin-left: 2px; }

.formula-text-custom { font-size: 1.1rem !important; color: #FFFFFF !important; letter-spacing: 1px; }

.export-btn-custom {
  position: absolute; right: 1vw; background-image: url('~@/assets/images/step5/按钮-结果导出.png'); background-size: 100% 100%;
  width: 150px; height: 45px; background-color: transparent; border: none; cursor: pointer; color: #333; font-weight: bold; font-size: 1rem;
  padding-right: 20px; text-align: right; font-family: 'DingTalk-JinBuTi', sans-serif !important;
}
</style>
