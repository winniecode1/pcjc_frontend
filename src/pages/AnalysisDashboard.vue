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
      <!-- 左侧栏：数据集与交互 -->
      <b-col cols="3" class="left-column px-2">
        <div class="panel-header header-select-data clean-header">指挥官作战指令数据集</div>

        <div class="sidebar-scroll-area">
          <div class="folder-group">
            <div class="video-item folder-header-item" @click="isDatasetOpen = !isDatasetOpen">
              <span class="folder-name-container">
                <span class="fold-arrow" :class="{ rotated: isDatasetOpen }">▶</span>
                <span class="folder-label">数据集</span>
              </span>
            </div>
            <div v-show="isDatasetOpen" class="items-container">
              <div v-for="video in datasetVideos" :key="video.id" class="video-item" @click="selectVideo(video)"
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
              ref="previewCarousel"
              id="analysis-preview-carousel"
              v-model="carouselSlide"
              :interval="carouselInterval"
              controls
              indicators
              no-hover-pause
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
                      <div class="text-slide-desc">{{ translateTextContent(item.content) }}</div>
                    </div>
                  </div>
                </template>
              </b-carousel-slide>
            </b-carousel>
          </div>
        </div>

        <div class="action-buttons">
          <button @click="startAnalysis" :disabled="isSelectingFile || isGraphParsing" class="btn-start-detect">
            <span class="btn-text-pos">{{ isSelectingFile ? '数据加载中...' : (isLoading ? '分析中...' : '开始主体解析') }}</span>
          </button>
        </div>
      </b-col>

      <!-- 右侧区域：有向图与详细信息 -->
      <b-col cols="9" class="right-column-custom">
        <div class="analysis-top-section">
          <!-- 有向图区域 -->
          <div class="graph-card">
            <div class="small-panel-header">多主体认知传播层级图</div>
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
          <div class="metric-card-custom">
            <div class="m-title">增强前 多主体解析准确率</div>
            <div class="m-value">
              <template v-if="preAccuracy !== null">{{ Math.round(preAccuracy) }}<span>%</span></template>
              <span v-else-if="metricsWaiting" class="metric-spinner"></span>
              <template v-else>--</template>
            </div>
          </div>
          <div class="metric-card-custom">
            <div class="m-title">增强后 多主体解析准确率</div>
            <div class="m-value">
              <template v-if="postAccuracy !== null">{{ Math.round(postAccuracy) }}<span>%</span></template>
              <span v-else-if="metricsWaiting" class="metric-spinner"></span>
              <template v-else>--</template>
            </div>
          </div>
          <div class="metric-card-custom">
            <div class="m-title">根因诊断后 多主体解析准确率</div>
            <div class="m-value">
              <template v-if="rootCauseAccuracy !== null">{{ Math.round(rootCauseAccuracy) }}<span>%</span></template>
              <span v-else-if="metricsWaiting" class="metric-spinner"></span>
              <template v-else>--</template>
            </div>
          </div>
          <button class="export-btn-custom" @click="exportResult" :disabled="!exportEnabled">结果导出</button>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import * as echarts from 'echarts';
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
  'firepower': '火力',
  'power': '动力',
  'size': '尺寸'
};
const ANALYSIS_ACCURACY_DONE_VALUE = 89;
const ANALYSIS_TIMER_KEY = 'pcjc_analysis_timers_v1';
const ANALYSIS_PRE_ACCURACY = 70;
const ANALYSIS_POST_ACCURACY = 82;
const CAROUSEL_DEFAULT_INTERVAL = 4000;
const CAROUSEL_PAUSE_MS = 10000;
const STAGE_LABEL_MAP = {
  Stage1: '多模态信息认知阶段',
  Stage2: '先验知识认知阶段',
  Stage3: '群体协商认知阶段',
  Stage4: '决策选择认知阶段'
};
// 点击节点时"节点详细信息"的展示配置：name 为显示名称，field 为 stageBoxes 中的取值路径
const NODE_DETAIL_CONFIG = {
  CommanderInput: { name: 'global_instruction', fields: ['Stage1.global_instruction_full_text'] },
  V2: { name: 'V_instr', fields: ['Stage1.instruction'] },
  V_img: { name: 'V_img', fields: ['Stage1.image_id'] },
  V4: { name: 'V_env', fields: ['Stage1.environment'] },
  V3: { name: 'V_det', fields: ['Stage1.target_details'], formatter: 'targetDetails' },
  M1: { name: '多模态认知偏差检测', fields: ['Stage1.content'] },
  M2: { name: '先验知识认知偏差检测', fields: ['Stage2.content'] },
  V6: { name: 'V_cand', fields: ['Stage2.stage2_result'], formatter: 'stage2Result' },
  V_instr2: { name: 'V_instr', fields: ['Stage2.instruction'] },
  M3: { name: '智能体协商认知偏差检测', fields: ['Stage3.content'] },
  AgentA: { name: '智能体A', fields: ['Stage3.content'] },
  AgentB: { name: '智能体B', fields: ['Stage3.content'] },
  AgentC: { name: '智能体C', fields: ['Stage3.content'] },
  V_instr3: { name: 'V_instr', fields: ['Stage3.instruction'] },
  V7: { name: 'V_neo', fields: ['Stage3.stage3_fields'] },
  M4: { name: '决策选择认知偏差检测', fields: ['Stage4.content', 'Stage4.stage4_fields'] },
  CommanderDecision: { name: 'V_intent', fields: ['Stage4.stage4_fields'] },
  V8: { name: 'V_intent', fields: ['Stage4.stage4_fields'] },
  V_instr4: { name: 'V_instr', fields: ['Stage4.instruction'] }
};
// 点击后不产生任何效果的节点
const NODE_CLICK_DISABLED = ['V_input', 'V5', 'V_decision_input'];
// 点击其一需要同时亮起的节点组
const NODE_HIGHLIGHT_GROUPS = {
  CommanderDecision: ['CommanderDecision', 'V8'],
  V8: ['CommanderDecision', 'V8']
};
const COMMANDER_ICON = 'path://M24 5a7 7 0 1 1 0 14 7 7 0 0 1 0-14M11 42c1.2-8.5 6.1-14 13-14s11.8 5.5 13 14H11zM7 20h34l-4 8H11l-4-8z';
const AGENT_ICON = 'path://M24 4l16 9v18l-16 9-16-9V13l16-9zM17 18h14v4H17v-4zM17 26h14v4H17v-4zM12 22h4v4h-4v-4zM32 22h4v4h-4v-4z';
const LAYER_HEADER_SHAPE = 'path://M0 0H150L170 60L150 120H0Z';
function randomBetween(min, max) { return min + Math.random() * (max - min); }

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
      videoList: [],
      selectedVideo: null,
      isDatasetOpen: true,
      isSelectingFile: false,
      selectedFileContext: null,
      selectedInstructionText: '',
      carouselSlide: 0,
      carouselItems: [],
      carouselInterval: CAROUSEL_DEFAULT_INTERVAL,
      carouselResumeTimer: null,
      suppressCarouselSync: false,
      isLoading: false,
      isGraphParsing: false,
      analysisHighlightRunId: 0,
      rootCauseAccuracy: null,
      graphBaseData: [],
      graphBaseLinks: [],
      graphInitialData: [],
      graphInitialLinks: [],
      selectedNode: null,
      stageBoxesData: {},
      revealContentTimer: null,
      metricsDisplayTimer: null,
      cachedAnalysisData: null,
      metricsVisible: false,
      exportEnabled: false,
      metricsWaiting: false,
      preAccuracy: ANALYSIS_PRE_ACCURACY,
      postAccuracy: ANALYSIS_POST_ACCURACY,
      carouselHovered: false
    };
  },
  computed: {
    datasetVideos() {
      const list = Array.isArray(this.videoList) ? this.videoList : [];
      return list.filter(Boolean);
    }
  },
  created() {
    // ECharts 实例不放进 data，避免被 Vue 响应式代理后破坏 zrender 的点击命中测试
    this.myChart = null;
  },
  async mounted() {
    this.clearTimerState();
    try {
      sessionStorage.removeItem('pcjc_analysis_nav');
      sessionStorage.removeItem('pcjc_selected_source_context');
    } catch (e) { /* ignore */ }
    this.initChart();
    await this.fetchVideoList();
    this.$nextTick(() => {
      this._bindCarouselHover();
    });
  },
  beforeDestroy() {
    if (this.revealContentTimer) clearTimeout(this.revealContentTimer);
    if (this.metricsDisplayTimer) clearTimeout(this.metricsDisplayTimer);
    if (this.carouselResumeTimer) clearTimeout(this.carouselResumeTimer);
    if (this.myChart) { this.myChart.dispose(); this.myChart = null; }
    this._unbindCarouselHover();
  },
  watch: {
    carouselSlide() {
      this.$nextTick(() => {
        this.syncCarouselStageHighlight();
      });
    },
    carouselItems() {
      this.$nextTick(() => {
        this.syncCarouselStageHighlight();
        if (!this._carouselEl) this._bindCarouselHover();
      });
    }
  },
  methods: {
    initChart() {
      const chartDom = document.getElementById('myDiagramDiv');
      if (!chartDom) return;
      // 防止热更新/重复进入时同一 DOM 上残留旧实例，导致点击事件绑定到失效画布
      const existing = echarts.getInstanceByDom(chartDom);
      if (existing) existing.dispose();
      this.myChart = echarts.init(chartDom);
      const moduleStyle = {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
          { offset: 0, color: '#173f7a' },
          { offset: 0.55, color: '#0e2b57' },
          { offset: 1, color: '#061832' }
        ]),
        borderColor: '#55e6ff',
        borderWidth: 2,
        shadowColor: '#32d9ff',
        shadowBlur: 18
      };
      const dataStyle = {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
          { offset: 0, color: '#ffec99' },
          { offset: 1, color: '#f6b950' }
        ]),
        borderColor: '#ffe7a0',
        borderWidth: 2,
        shadowColor: '#ffb84d',
        shadowBlur: 12
      };
      const iconStyle = {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
          { offset: 0, color: '#41f2ff' },
          { offset: 1, color: '#1b73ff' }
        ]),
        borderColor: '#a9fbff',
        borderWidth: 1.5,
        shadowColor: '#43e9ff',
        shadowBlur: 20
      };
      const shellStyle = {
        color: 'rgba(255, 255, 255, 0.08)',
        borderColor: '#9db6e4',
        borderWidth: 1,
        borderType: 'dashed',
        shadowColor: 'rgba(63, 118, 200, 0.2)',
        shadowBlur: 16
      };
      const layerStyle = {
        color: 'rgba(255, 255, 255, 0.06)',
        borderColor: '#9db6e4',
        borderWidth: 1,
        borderType: 'dashed',
        shadowColor: 'rgba(35, 79, 145, 0.16)',
        shadowBlur: 12
      };
      const layerHeaderStyle = {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#174d92' },
          { offset: 1, color: '#2867b6' }
        ]),
        borderColor: '#2e72bf',
        borderWidth: 1,
        shadowColor: 'rgba(16, 66, 140, 0.38)',
        shadowBlur: 10
      };
      const dataLabel = { color: '#4a1a1a', fontStyle: 'italic', fontSize: 11, formatter: '{c}' };
      const iconLabel = { color: '#063b78', fontSize: 12, fontWeight: 'bold', position: 'bottom', distance: 6 };

      const option = {
        tooltip: { show: false },
        series: [
          {
            type: 'graph',
            layout: 'none',
            symbolSize: 50,
            roam: false,
            label: {
              show: true,
              position: 'inside',
              color: '#fff',
              fontSize: 12,
              fontFamily: 'DingTalk-JinBuTi',
              formatter: '{c}'
            },
            edgeSymbol: ['none', 'arrow'],
            edgeSymbolSize: [5, 14],
            data: [
              { name: 'Layer1Band', value: '', x: 500, y: 90, symbol: 'roundRect', symbolSize: [920, 118], itemStyle: layerStyle, label: { show: false }, silent: true, metaType: 'decor' },
              { name: 'Layer2Band', value: '', x: 500, y: 250, symbol: 'roundRect', symbolSize: [920, 118], itemStyle: layerStyle, label: { show: false }, silent: true, metaType: 'decor' },
              { name: 'Layer3Band', value: '', x: 500, y: 410, symbol: 'roundRect', symbolSize: [920, 118], itemStyle: layerStyle, label: { show: false }, silent: true, metaType: 'decor' },
              { name: 'Layer4Band', value: '', x: 500, y: 570, symbol: 'roundRect', symbolSize: [920, 118], itemStyle: layerStyle, label: { show: false }, silent: true, metaType: 'decor' },
              { name: 'Layer1Head', value: '第一层\n多模态认知偏差检测', x: 55, y: 90, symbol: LAYER_HEADER_SHAPE, symbolSize: [150, 118], itemStyle: layerHeaderStyle, label: { color: '#fff', fontSize: 15, fontWeight: 'bold', lineHeight: 26 }, silent: true, metaType: 'decor' },
              { name: 'Layer2Head', value: '第二层\n先验知识认知偏差检测', x: 55, y: 250, symbol: LAYER_HEADER_SHAPE, symbolSize: [150, 118], itemStyle: layerHeaderStyle, label: { color: '#fff', fontSize: 15, fontWeight: 'bold', lineHeight: 26 }, silent: true, metaType: 'decor' },
              { name: 'Layer3Head', value: '第三层\n智能体协商认知偏差检测', x: 55, y: 410, symbol: LAYER_HEADER_SHAPE, symbolSize: [150, 118], itemStyle: layerHeaderStyle, label: { color: '#fff', fontSize: 15, fontWeight: 'bold', lineHeight: 26 }, silent: true, metaType: 'decor' },
              { name: 'Layer4Head', value: '第四层\n决策选择认知偏差检测', x: 55, y: 570, symbol: LAYER_HEADER_SHAPE, symbolSize: [150, 118], itemStyle: layerHeaderStyle, label: { color: '#fff', fontSize: 15, fontWeight: 'bold', lineHeight: 26 }, silent: true, metaType: 'decor' },
              { name: 'CommanderInput', value: '指挥员', x: 215, y: 62, symbol: COMMANDER_ICON, symbolSize: [42, 42], itemStyle: iconStyle, label: iconLabel, desc: "作战指令来源。" },
              { name: 'V2', value: 'V_instr', x: 355, y: 62, symbol: 'roundRect', symbolSize: [96, 36], itemStyle: dataStyle, label: dataLabel, desc: "指挥员下达的初始指令文本。" },
              { name: 'V_img', value: 'V_img', x: 355, y: 118, symbol: 'roundRect', symbolSize: [86, 36], itemStyle: dataStyle, label: dataLabel, desc: "输入图像数据。" },
              { name: 'M1', value: '多模态认知偏差检测', x: 535, y: 88, symbol: 'roundRect', symbolSize: [150, 58], itemStyle: moduleStyle, label: { fontSize: 12, fontWeight: 'bold', formatter: '多模态认知偏差检测' }, desc: "该模块负责处理图像、指令等多模态输入，识别初步的认知偏差迹象。", status: "检测中" },
              { name: 'V4', value: 'V_env', x: 710, y: 62, symbol: 'roundRect', symbolSize: [86, 36], itemStyle: dataStyle, label: dataLabel, desc: "战场环境描述。" },
              { name: 'V3', value: 'V_det', x: 710, y: 118, symbol: 'roundRect', symbolSize: [86, 36], itemStyle: dataStyle, label: dataLabel, desc: "目标检测识别结果。" },
              { name: 'V_input', value: 'V_input', x: 760, y: 222, symbol: 'roundRect', symbolSize: [96, 36], itemStyle: dataStyle, label: dataLabel, desc: "先验知识阶段输入信息。" },
              { name: 'V5', value: 'V_know', x: 760, y: 278, symbol: 'roundRect', symbolSize: [86, 36], itemStyle: dataStyle, label: dataLabel, desc: "外部先验知识库条目。" },
              { name: 'V_instr2', value: 'V_instr', x: 885, y: 250, symbol: 'roundRect', symbolSize: [96, 36], itemStyle: dataStyle, label: dataLabel, desc: "先验知识认知检测阶段指令。" },
              { name: 'M2', value: '先验知识认知偏差检测', x: 565, y: 250, symbol: 'roundRect', symbolSize: [176, 58], itemStyle: moduleStyle, label: { fontSize: 12, fontWeight: 'bold', formatter: '先验知识认知偏差检测' }, desc: "结合专家知识库，对初步检测结果进行先验逻辑验证。", status: "待启动" },
              { name: 'V6', value: 'V_cand', x: 365, y: 250, symbol: 'roundRect', symbolSize: [86, 36], itemStyle: { ...dataStyle, color: 'rgba(207, 234, 204, 0.9)', borderColor: '#83bd8b', shadowColor: '#a5dfac' }, label: dataLabel, desc: "候选偏差原因集合。" },
              { name: 'V_instr3', value: 'V_instr', x: 185, y: 410, symbol: 'roundRect', symbolSize: [90, 36], itemStyle: dataStyle, label: dataLabel, desc: "群体协商认知检测阶段指令。" },
              { name: 'V_agent_input', value: 'V_input', x: 305, y: 410, symbol: 'roundRect', symbolSize: [96, 36], itemStyle: dataStyle, label: dataLabel, desc: "智能体协商阶段输入信息。" },
              { name: 'M3', value: '智能体协商认知偏差检测', x: 535, y: 410, symbol: 'roundRect', symbolSize: [260, 82], itemStyle: shellStyle, label: { color: '#315f9e', fontSize: 12, fontWeight: 'bold', position: 'top', distance: -22, formatter: '' }, desc: "通过多个智能体的协商，进一步精细化偏差定位。", status: "待启动" },
              { name: 'AgentA', value: '智能体A', x: 455, y: 412, symbol: AGENT_ICON, symbolSize: [38, 38], itemStyle: iconStyle, label: iconLabel, desc: "智能体协商子节点 A。" },
              { name: 'AgentB', value: '智能体B', x: 535, y: 412, symbol: AGENT_ICON, symbolSize: [38, 38], itemStyle: iconStyle, label: iconLabel, desc: "智能体协商子节点 B。" },
              { name: 'AgentC', value: '智能体C', x: 615, y: 412, symbol: AGENT_ICON, symbolSize: [38, 38], itemStyle: iconStyle, label: iconLabel, desc: "智能体协商子节点 C。" },
              { name: 'V7', value: 'V_neo', x: 850, y: 410, symbol: 'roundRect', symbolSize: [100, 38], itemStyle: dataStyle, label: dataLabel, desc: "群体协商最终复核结果。" },
              { name: 'V_decision_input', value: 'V_input', x: 760, y: 570, symbol: 'roundRect', symbolSize: [96, 36], itemStyle: dataStyle, label: dataLabel, desc: "决策选择阶段输入信息。" },
              { name: 'V_instr4', value: 'V_instr', x: 885, y: 570, symbol: 'roundRect', symbolSize: [96, 36], itemStyle: dataStyle, label: dataLabel, desc: "决策选择认知偏差检测阶段指令。" },
              { name: 'M4', value: '决策选择认知偏差检测', x: 545, y: 570, symbol: 'roundRect', symbolSize: [176, 58], itemStyle: moduleStyle, label: { fontSize: 12, fontWeight: 'bold', formatter: '决策选择认知偏差检测' }, desc: "在决策层面上分析认知偏差对最终行动方案的影响。", status: "待启动" },
              { name: 'CommanderDecision', value: '指挥员', x: 350, y: 542, symbol: COMMANDER_ICON, symbolSize: [42, 42], itemStyle: iconStyle, label: iconLabel, desc: "接收决策选择认知偏差检测结果的指挥员节点。" },
              { name: 'V8', value: 'V_intent', x: 350, y: 598, symbol: 'roundRect', symbolSize: [100, 38], itemStyle: dataStyle, label: dataLabel, desc: "编队与战术意图分析结果。" }
            ],
            links: [
              { source: 'CommanderInput', target: 'V2' },
              { source: 'V2', target: 'M1' },
              { source: 'V_img', target: 'M1' },
              { source: 'M1', target: 'V4' },
              { source: 'M1', target: 'V3' },
              { source: 'V4', target: 'V_input', lineStyle: { type: 'dashed' } },
              { source: 'V3', target: 'V_input', lineStyle: { type: 'dashed' } },
              { source: 'V_input', target: 'M2' },
              { source: 'V5', target: 'M2' },
              { source: 'V_instr2', target: 'M2' },
              { source: 'M2', target: 'V6' },
              { source: 'V6', target: 'V_agent_input' },
              { source: 'V_instr3', target: 'V_agent_input' },
              { source: 'V_agent_input', target: 'M3' },
              { source: 'M3', target: 'AgentA' },
              { source: 'AgentA', target: 'AgentB' },
              { source: 'AgentB', target: 'AgentA' },
              { source: 'AgentB', target: 'AgentC' },
              { source: 'AgentC', target: 'AgentB' },
              { source: 'AgentC', target: 'V7' },
              { source: 'V7', target: 'V_decision_input' },
              { source: 'V_instr4', target: 'V_decision_input' },
              { source: 'V_decision_input', target: 'M4' },
              { source: 'M4', target: 'CommanderDecision' },
              { source: 'M4', target: 'V8' }
            ],
            lineStyle: { opacity: 1, width: 3, curveness: 0, color: '#0b4fa2' }
          }
        ]
      };
      this.myChart.setOption(option);
      this.cacheGraphBaseStyles();
      // 统一用像素坐标判定点中的节点，不依赖 echarts 内部命中检测（规避缩放/命中错位等问题）
      this.myChart.getZr().on('click', (event) => {
        const nodeName = this.findGraphNodeAtPixel(event.offsetX, event.offsetY);
        if (nodeName) this.handleGraphNodeClick(nodeName);
      });
      window.addEventListener('resize', () => { this.myChart && this.myChart.resize(); });
      // 栅格容器尺寸常在初始化后才稳定，补一次 resize，避免画布坐标与视觉错位导致点不中节点
      this.$nextTick(() => { this.myChart && this.myChart.resize(); });
    },
    findGraphNodeAtPixel(px, py) {
      if (!this.myChart) return '';
      const nodes = this.graphInitialData.length ? this.graphInitialData : this.graphBaseData;
      // 倒序遍历，保证后绘制（视觉上层）的节点优先命中
      for (let i = nodes.length - 1; i >= 0; i -= 1) {
        const node = nodes[i];
        if (!node || node.metaType === 'decor' || node.silent) continue;
        let center = null;
        try {
          center = this.myChart.convertToPixel({ seriesIndex: 0 }, [node.x, node.y]);
        } catch (e) { center = null; }
        if (!center) continue;
        const rawSize = node.symbolSize;
        const w = Array.isArray(rawSize) ? rawSize[0] : (rawSize || 50);
        const h = Array.isArray(rawSize) ? rawSize[1] : (rawSize || 50);
        if (Math.abs(px - center[0]) <= w / 2 + 3 && Math.abs(py - center[1]) <= h / 2 + 3) {
          return node.name;
        }
      }
      return '';
    },
    handleGraphNodeClick(nodeName) {
      if (!nodeName || NODE_CLICK_DISABLED.includes(nodeName)) return;
      const config = NODE_DETAIL_CONFIG[nodeName];
      if (!config) return;
      const groupNodes = NODE_HIGHLIGHT_GROUPS[nodeName] || [nodeName];
      this.highlightGraphByNodeSet(groupNodes);
      this.selectedNode = this.buildNodeDetail(nodeName);
      const idx = this.findCarouselIndexForNode(nodeName);
      // 有对应轮播项则跳转过去并暂停约10秒；没有对应项则仅暂停联动10秒，保持当前节点的高亮与详情
      this.pauseCarouselSync(idx);
    },
    buildNodeDetail(nodeName) {
      const config = NODE_DETAIL_CONFIG[nodeName];
      if (!config) return null;
      let desc = '';
      const fields = Array.isArray(config.fields) ? config.fields : [];
      for (let i = 0; i < fields.length; i += 1) {
        const value = safeReadPath(this.stageBoxesData, fields[i], '');
        const text = this.formatNodeDetailValue(value, config.formatter);
        if (text) { desc = text; break; }
      }
      if (!desc) {
        // 尚未解析（stageBoxes 为空）时，回退展示节点静态说明
        const node = this.graphBaseData.find(item => item.name === nodeName);
        desc = (node && node.desc) || '';
      }
      return {
        text: config.name,
        category: 'Module',
        desc,
        value: ''
      };
    },
    formatNodeDetailValue(value, formatter) {
      if (value === null || value === undefined) return '';
      if (formatter === 'targetDetails' && Array.isArray(value)) {
        const lines = value
          .filter(item => item && typeof item === 'object')
          .map((item, idx) => {
            const name = this.firstNonEmpty(item.name);
            const conf = this.firstNonEmpty(item.confidence);
            return `目标${idx + 1}：${name || '-'}${conf ? `（置信度 ${conf}）` : ''}`;
          });
        if (lines.length) return lines.join('\n');
      }
      if (formatter === 'stage2Result') {
        const obj = this.firstResultObject(value);
        if (obj && Object.keys(obj).length) {
          return Object.keys(obj)
            .map((key) => `${FIELD_LABEL_MAP[key] || key}：${this.toCompactText(obj[key])}`)
            .join('\n');
        }
      }
      // 内容为 Markdown 格式时去掉每行行首的 # 标记，只保留标题文字
      if (typeof value === 'string') return this.replaceAgentTerms(value.trim().replace(/^#+\s*/gm, ''));
      return this.toCompactText(value);
    },
    normalizeStageBoxes(raw) {
      const rawBoxes = (raw && (raw.stageBoxes || raw.stageDiagnosisCards)) || {};
      const map = {};
      const putBox = (box, fallbackNo) => {
        if (!box || typeof box !== 'object') return;
        const m = String(box.stage || '').match(/Stage\s*([1-4])/i);
        const no = m ? Number(m[1]) : fallbackNo;
        if (no >= 1 && no <= 4 && !map[`Stage${no}`]) map[`Stage${no}`] = box;
      };
      if (Array.isArray(rawBoxes)) {
        rawBoxes.forEach((box, idx) => putBox(box, idx + 1));
      } else if (rawBoxes && typeof rawBoxes === 'object') {
        Object.keys(rawBoxes).forEach((key) => {
          const m = String(key).match(/Stage\s*([1-4])/i);
          putBox(rawBoxes[key], m ? Number(m[1]) : 0);
        });
      }
      return map;
    },
    cacheGraphBaseStyles() {
      if (!this.myChart) return;
      const option = this.myChart.getOption();
      if (!option || !option.series || !option.series[0]) return;
      const series = option.series[0];
      const data = Array.isArray(series.data) ? series.data : [];
      const links = Array.isArray(series.links) ? series.links : [];

      this.graphBaseData = this.cloneGraphNodes(data);
      this.graphBaseLinks = this.cloneGraphLinks(links);
      if (!this.graphInitialData.length) {
        this.graphInitialData = this.cloneGraphNodes(this.graphBaseData);
      }
      if (!this.graphInitialLinks.length) {
        this.graphInitialLinks = this.cloneGraphLinks(this.graphBaseLinks);
      }
    },
    cloneGraphNodes(nodes = []) {
      return (Array.isArray(nodes) ? nodes : []).map((node) => ({
        ...node,
        itemStyle: { ...(node.itemStyle || {}) },
        label: { ...(node.label || {}) }
      }));
    },
    cloneGraphLinks(links = []) {
      return (Array.isArray(links) ? links : []).map((link) => ({
        ...link,
        lineStyle: { ...(link.lineStyle || {}) }
      }));
    },
    resetGraphToInitial() {
      if (!this.myChart) return;
      if (!this.graphInitialData.length || !this.graphInitialLinks.length) {
        this.cacheGraphBaseStyles();
      }
      if (!this.graphInitialData.length || !this.graphInitialLinks.length) return;
      this.graphBaseData = this.cloneGraphNodes(this.graphInitialData);
      this.graphBaseLinks = this.cloneGraphLinks(this.graphInitialLinks);
      this.myChart.setOption({
        series: [{ data: this.graphBaseData, links: this.graphBaseLinks }]
      });
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
    clearSelectionAnalysisState() {
      this.clearAllTimers();
      this.clearTimerState();
      this.cachedAnalysisData = null;
      this.stageBoxesData = {};
      this.selectedNode = null;
      this.isLoading = false;
      this.isGraphParsing = false;
      this.metricsVisible = false;
      this.metricsWaiting = false;
      this.exportEnabled = false;
      this.rootCauseAccuracy = null;
      this.preAccuracy = ANALYSIS_PRE_ACCURACY;
      this.postAccuracy = ANALYSIS_POST_ACCURACY;
      this.resetGraphToInitial();
    },
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
    async fetchVideoList() {
      try {
        const response = await this.$ajax.get(`${API_BASE_URL}/module5/api/instr/data-sources`);
        const sources = this.safeGet(response, 'data.data_sources', []);
        if (Array.isArray(sources)) {
          this.videoList = sources.map((src, idx) => ({
            id: idx + 1,
            source_id: src.source_id,
            name: src.source_id,
            path: src.path,
            type: this.resolveConsistencyFolderType(src),
            type_key: src.type_key || '',
            type_label: src.type_label || '',
            dataset_type: src.type
          }));
        }
      } catch (error) {
        console.warn("获取数据失败", error);
        this.videoList = [];
      }
    },
    async selectVideo(video, options = {}) {
      const { preserveCurrentResult = false } = options;
      const isNewData = !this.isSameSelectedData(video);
      if (!preserveCurrentResult && isNewData) {
        this.clearSelectionAnalysisState();
      }
      this.selectedVideo = video;
      await this.handleFileSelection(video);
    },
    async handleFileSelection(video) {
      this.isSelectingFile = true;
      if (this.carouselResumeTimer) {
        clearTimeout(this.carouselResumeTimer);
        this.carouselResumeTimer = null;
      }
      this.suppressCarouselSync = false;
      this.carouselInterval = CAROUSEL_DEFAULT_INTERVAL;
      this.carouselSlide = 0;
      this.carouselItems = [];
      this.selectedFileContext = null;
      this.selectedInstructionText = '';
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
        `${API_BASE_URL}/module5/api/instr/file-selection`,
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
    // 根据轮播项标题匹配对应的有向图节点（无匹配返回空字符串）
    resolveNodeForCarouselItem(item = {}) {
      if (!item || item.type !== 'text') return '';
      const title = this.replaceAgentTerms(String(item.title || '').trim());
      if (!title) return '';
      const stageIdx = Number.isFinite(item.stage_index)
        ? item.stage_index
        : this.parseStageIndex(item.stage);

      // 各阶段专属内容（标题关键词唯一，可直接判定）
      if (/智能体[_\s]?A/i.test(title)) return 'AgentA';
      if (/智能体[_\s]?B/i.test(title)) return 'AgentB';
      if (/智能体[_\s]?C/i.test(title)) return 'AgentC';
      if (/最终复核/.test(title)) return 'V7';
      if (/编队与战术意图/.test(title)) return 'V8';
      if (/目标属性/.test(title)) return 'V6';

      // “指令”类标题：优先按标题中的阶段名分层，其次按 stage_index 兜底
      if (/指令/.test(title)) {
        if (/多模态/.test(title)) return 'V2';
        if (/先验知识/.test(title)) return 'V_instr2';
        if (/群体协商/.test(title)) return 'V_instr3';
        if (/决策选择/.test(title)) return 'V_instr4';
        if (stageIdx === 1) return 'V2';
        if (stageIdx === 2) return 'V_instr2';
        if (stageIdx === 3) return 'V_instr3';
        if (stageIdx === 4) return 'V_instr4';
        return '';
      }
      if (/环境/.test(title)) return 'V4';
      if (/目标/.test(title)) return 'V3';
      return '';
    },
    // 根据图节点反查对应的轮播项下标（无匹配返回 -1）
    findCarouselIndexForNode(nodeName) {
      if (!Array.isArray(this.carouselItems) || !this.carouselItems.length) return -1;
      const groupNodes = NODE_HIGHLIGHT_GROUPS[nodeName] || [nodeName];
      if (nodeName === 'V_img') {
        return this.carouselItems.findIndex(item => item && item.type === 'image');
      }
      return this.carouselItems.findIndex((item) => {
        const matched = this.resolveNodeForCarouselItem(item);
        return matched && groupNodes.includes(matched);
      });
    },
    // 点击节点后：跳到对应轮播项（如有）并暂停联动约10秒，再恢复自动轮播联动
    pauseCarouselSync(targetSlideIndex = -1) {
      if (this.carouselResumeTimer) {
        clearTimeout(this.carouselResumeTimer);
        this.carouselResumeTimer = null;
      }
      this.suppressCarouselSync = true;
      this.carouselInterval = 0;
      if (targetSlideIndex >= 0 && targetSlideIndex !== this.carouselSlide) {
        this.carouselSlide = targetSlideIndex;
      }
      this.carouselResumeTimer = setTimeout(() => {
        this.carouselResumeTimer = null;
        this.suppressCarouselSync = false;
        this.carouselInterval = this.carouselHovered ? 0 : CAROUSEL_DEFAULT_INTERVAL;
        this.$nextTick(() => {
          this.syncCarouselStageHighlight();
        });
      }, CAROUSEL_PAUSE_MS);
    },
    syncCarouselStageHighlight() {
      if (this.suppressCarouselSync) return;
      if (!this.myChart || !Array.isArray(this.carouselItems) || this.carouselItems.length === 0) {
        return;
      }
      const currentItem = this.carouselItems[this.carouselSlide] || this.carouselItems[0];
      const targetNode = this.resolveNodeForCarouselItem(currentItem);
      if (!targetNode) {
        // 图片等无对应块块的轮播项：不亮任何块块
        this.resetGraphHighlight();
        return;
      }
      const groupNodes = NODE_HIGHLIGHT_GROUPS[targetNode] || [targetNode];
      this.highlightGraphByNodeSet(groupNodes);
      const detail = this.buildNodeDetail(targetNode);
      if (detail) this.selectedNode = detail;
    },
    // 后端 carouselItems 缺少“智能体A/B/C 初始分析、协商结论”6项，从 sample_data.Stage3 补全
    buildAgentCarouselItems(res) {
      const internalOutput = this.asDict(this.safeGet(res, 'sample_data.Stage3.internal_output', null));
      const initialAnalyses = this.asDict(internalOutput.initial_analyses);
      const negotiationResults = this.asDict(internalOutput.negotiation_results);
      const pickAgent = (dict, letter) => (
        this.asDict(dict[`智能体_${letter}`] || dict[`Agent_${letter}`] || dict[`智能体${letter}`])
      );
      const stageName = '群体协商认知检测阶段';
      const items = [];
      ['A', 'B', 'C'].forEach((letter) => {
        const analysis = pickAgent(initialAnalyses, letter);
        if (Object.keys(analysis).length) {
          const parts = [];
          if (analysis.model_name) parts.push(`【模型名称】\n${analysis.model_name}`);
          if (analysis.reason) parts.push(`【分析理由】\n${analysis.reason}`);
          if (parts.length) {
            items.push({
              type: 'text',
              stage: stageName,
              stage_index: 3,
              title: `${stageName} 智能体${letter} 初始分析`,
              content: parts.join('\n\n')
            });
          }
        }
      });
      ['A', 'B', 'C'].forEach((letter) => {
        const negotiation = pickAgent(negotiationResults, letter);
        if (Object.keys(negotiation).length) {
          const parts = [];
          if (Array.isArray(negotiation.priority_ordering) && negotiation.priority_ordering.length) {
            parts.push(`【优先级排序】\n${negotiation.priority_ordering.join(' > ')}`);
          }
          if (negotiation.priority_rationale) parts.push(`【排序依据】\n${negotiation.priority_rationale}`);
          if (negotiation.consensus) parts.push(`【共识】\n${negotiation.consensus}`);
          if (negotiation.deviation) parts.push(`【分歧/偏差】\n${negotiation.deviation}`);
          if (parts.length) {
            items.push({
              type: 'text',
              stage: stageName,
              stage_index: 3,
              title: `${stageName} 智能体${letter} 协商结论`,
              content: parts.join('\n\n')
            });
          }
        }
      });
      return items;
    },
    // 将智能体6项插入到“群体协商 最终复核”之前（无该项时插到最后一个群体协商项之后）
    mergeAgentItemsIntoCarousel(carouselItems, agentItems) {
      if (!agentItems.length) return carouselItems;
      const hasAgentItem = carouselItems.some(item => /智能体/.test(String((item || {}).title || '')));
      if (hasAgentItem) return carouselItems;
      const result = [...carouselItems];
      let insertAt = result.findIndex(item => /最终复核/.test(String((item || {}).title || '')));
      if (insertAt < 0) {
        let lastStage3 = -1;
        result.forEach((item, idx) => {
          if (/群体协商/.test(String((item || {}).title || item.stage || ''))) lastStage3 = idx;
        });
        insertAt = lastStage3 >= 0 ? lastStage3 + 1 : result.length;
      }
      result.splice(insertAt, 0, ...agentItems);
      return result;
    },
    buildGlobalInstructionCarouselItem(res = {}) {
      const globalInstruction = this.asDict(this.safeGet(res, 'sample_data.global_instruction', null));
      const instructionId = String(globalInstruction.instruction_id || '').trim();
      const fullText = String(globalInstruction.full_text || '').trim();
      if (!instructionId && !fullText) return null;
      const parts = [];
      if (instructionId) parts.push(`【指令编号】\n${instructionId}`);
      if (fullText) parts.push(`【完整指令】\n${fullText}`);
      return this.normalizeCarouselItems([{
        type: 'text',
        stage: 'Stage1',
        stage_index: 1,
        title: '全局命令',
        content: parts.join('\n\n')
      }])[0];
    },
    ensureGlobalInstructionFirst(carouselItems, globalInstructionItem) {
      if (!globalInstructionItem) return carouselItems;
      const filtered = carouselItems.filter((item) => {
        const title = String((item || {}).title || '').trim();
        const stage = String((item || {}).stage || '').trim();
        return !(/全局(指令|命令)/.test(title) || /全局(指令|命令)/.test(stage));
      });
      return [globalInstructionItem, ...filtered];
    },
    applyFileSelectionResult(response, video) {
      const res = response || {};
      let carouselItems = this.normalizeCarouselItems(res.carouselItems);
      if (carouselItems.length === 0) {
        carouselItems = this.buildItemsFromStagePreviews(res.stagePreviews);
      }
      carouselItems = this.mergeAgentItemsIntoCarousel(
        carouselItems,
        this.normalizeCarouselItems(this.buildAgentCarouselItems(res))
      );
      if (carouselItems.length === 0) {
        carouselItems = [{
          type: 'text',
          stage: 'Stage?',
          title: '无可展示内容',
          content: `source_id=${video.source_id || video.name} 未返回可渲染数据。`
        }];
      }
      const globalInstructionItem = this.buildGlobalInstructionCarouselItem(res);
      carouselItems = this.ensureGlobalInstructionFirst(carouselItems, globalInstructionItem);

      this.selectedFileContext = res.stage1 || { source_id: video.source_id || video.name, path: video.path };
      this.selectedInstructionText = String(res.instruction_text || '').trim();
      if (!this.selectedFileContext.type) {
        this.selectedFileContext = {
          ...this.selectedFileContext,
          type: this.normalizeContextType(video.type)
        };
      }

      // 本界面要求：轮播图第二张为对应样本图片（来自 image-set 接口）
      const sampleId = resolveSampleId(
        {
          source_id: this.firstNonEmpty(this.selectedFileContext.source_id, video.source_id, video.name),
          path: this.firstNonEmpty(this.selectedFileContext.path, video.path)
        },
        {},
        {},
        ''
      );
      if (sampleId) {
        let imageSrc = String(res.image_set_image_url || '').trim();
        if (!imageSrc) {
          imageSrc = `${API_BASE_URL}/module5/api/image-set/${encodeURIComponent(sampleId)}`;
        }
        const imageItem = this.normalizeCarouselItems([
          {
            type: 'image',
            src: imageSrc,
            title: '原始样本图片',
            stage: 'Stage1',
            stage_index: 1,
            file_name: `${sampleId}.jpg`
          }
        ])[0];
        const dedupItems = carouselItems.filter(item => !(item && (item.type === 'image' || item.src === imageSrc)));
        carouselItems = dedupItems.length
          ? [dedupItems[0], imageItem, ...dedupItems.slice(1)]
          : [imageItem];
        carouselItems = this.ensureGlobalInstructionFirst(carouselItems, globalInstructionItem);
      }

      this.carouselSlide = 0;
      this.carouselItems = carouselItems;
      this.persistSelectedSourceContext(this.selectedFileContext);
      this.$nextTick(() => {
        this.syncCarouselStageHighlight();
      });
    },
    clearTimerState() {
      try { localStorage.removeItem(ANALYSIS_TIMER_KEY); } catch (e) { /* ignore */ }
    },
    clearAllTimers() {
      if (this.revealContentTimer) { clearTimeout(this.revealContentTimer); this.revealContentTimer = null; }
      if (this.metricsDisplayTimer) { clearTimeout(this.metricsDisplayTimer); this.metricsDisplayTimer = null; }
      if (this.carouselResumeTimer) {
        clearTimeout(this.carouselResumeTimer);
        this.carouselResumeTimer = null;
        this.suppressCarouselSync = false;
        this.carouselInterval = CAROUSEL_DEFAULT_INTERVAL;
      }
    },
    revealGraphResults() {
      if (this.cachedAnalysisData) {
        this.applyDiagnosisToGraph(this.cachedAnalysisData);
      }
      this.isGraphParsing = false;
    },
    showMetricsDone() {
      if (this.metricsDisplayTimer) { clearTimeout(this.metricsDisplayTimer); this.metricsDisplayTimer = null; }
      this.preAccuracy = ANALYSIS_PRE_ACCURACY;
      this.postAccuracy = ANALYSIS_POST_ACCURACY;
      this.rootCauseAccuracy = ANALYSIS_ACCURACY_DONE_VALUE;
      this.metricsVisible = true;
      this.exportEnabled = true;
    },
    async startAnalysis() {
      if (!this.selectedVideo && !this.selectedFileContext) return;

      this.clearAllTimers();
      this.clearTimerState();
      this.rootCauseAccuracy = null;
      this.preAccuracy = ANALYSIS_PRE_ACCURACY;
      this.postAccuracy = ANALYSIS_POST_ACCURACY;
      this.metricsVisible = false;
      this.exportEnabled = false;
      this.metricsWaiting = true;
      this.cachedAnalysisData = null;
      this.selectedNode = null;

      const runId = (this.analysisHighlightRunId || 0) + 1;
      this.analysisHighlightRunId = runId;
      this.isLoading = true;
      this.isGraphParsing = true;

      try {
        const payload = this.buildDiagnosisPayload();
        // 点击后结果立刻返回，前端延迟约20多秒再展示
        const response = await this.requestStageDiagnosisResult(payload);
        if (runId !== this.analysisHighlightRunId) return;

        this.cachedAnalysisData = response || {};

        const contentDelayMs = Math.round(randomBetween(20000, 30000));
        const metricsDelayMs = contentDelayMs;

        this.revealContentTimer = setTimeout(() => {
          this.revealContentTimer = null;
          this.revealGraphResults();
        }, contentDelayMs);

        this.metricsDisplayTimer = setTimeout(() => {
          this.showMetricsDone();
        }, metricsDelayMs);
      } catch (error) {
        console.error("解析接口调用失败", error);
        this.clearAllTimers();
        this.clearTimerState();
        this.isGraphParsing = false;
      } finally {
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
        `${API_BASE_URL}/module5/api/instr/stage-diagnosis-result`,
        payload,
        { timeout: 30000 }
      );
      return res.data || {};
    },
    applyDiagnosisToGraph(raw) {
      if (!this.myChart) return;
      if (!this.graphBaseData.length) this.cacheGraphBaseStyles();

      // 解析 stageBoxes（兼容 stageDiagnosisCards），供节点点击详情与准确率展示使用
      this.stageBoxesData = this.normalizeStageBoxes(raw);

      const fmtPercent = (v) => {
        if (v === null || v === undefined || Number.isNaN(Number(v))) return '-';
        let n = Number(v);
        if (n > 1 && n <= 100) n = n / 100;
        return `${(n * 100).toFixed(1)}%`;
      };
      const getAccuracy = (stageKey) => {
        const value = this.safeGet(this.stageBoxesData, `${stageKey}.accuracy`, null);
        if (value === null || value === undefined || value === '') return null;
        const n = Number(value);
        return Number.isFinite(n) ? n : null;
      };
      const moduleLabelMap = {
        M1: '多模态\n认知偏差\n检测',
        M2: '先验知识\n认知偏差\n检测',
        M3: '智能体协商\n认知偏差\n检测',
        M4: '决策选择\n认知偏差\n检测'
      };
      const buildModuleLabelFormatter = (moduleName, accuracyText) => {
        const title = moduleLabelMap[moduleName] || moduleName;
        return `${title}\n解析准确率\n${accuracyText}`;
      };

      const nodePatch = {
        M1: { labelFormatter: buildModuleLabelFormatter('M1', fmtPercent(getAccuracy('Stage1'))) },
        M2: { labelFormatter: buildModuleLabelFormatter('M2', fmtPercent(getAccuracy('Stage2'))) },
        M4: { labelFormatter: buildModuleLabelFormatter('M4', fmtPercent(getAccuracy('Stage4'))) },
        M3: {
          labelFormatter: `智能体协商认知偏差检测  解析准确率 ${fmtPercent(getAccuracy('Stage3'))}`
        }
      };

      const mergedData = this.graphBaseData.map((node) => {
        const patch = nodePatch[node.name];
        if (!patch) return node;
        const merged = { ...node };
        merged.label = {
          ...(node.label || {}),
          formatter: patch.labelFormatter,
          fontSize: 11
        };
        return merged;
      });
      this.graphBaseData = mergedData;
      this.myChart.setOption({ series: [{ data: mergedData, links: this.graphBaseLinks }] });

      this.$nextTick(() => {
        this.syncCarouselStageHighlight();
      });
    },
    asDict(value) {
      return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    },
    replaceAgentTerms(value) {
      if (value === null || value === undefined) return '';
      return String(value).replace(/Agent/gi, '智能体');
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
      if (typeof value === 'string') return this.replaceAgentTerms(value.trim());
      if (typeof value === 'number' || typeof value === 'boolean') return String(value);
      try {
        return this.replaceAgentTerms(JSON.stringify(value, null, 2));
      } catch (e) {
        return this.replaceAgentTerms(String(value));
      }
    },
    firstResultObject(value) {
      if (value && typeof value === 'object' && !Array.isArray(value)) return value;
      if (!Array.isArray(value)) return {};
      const queue = [...value];
      while (queue.length) {
        const item = queue.shift();
        if (item && typeof item === 'object' && !Array.isArray(item)) return item;
        if (Array.isArray(item)) queue.push(...item);
      }
      return {};
    },
    getPreviousSourceContext() {
      const query = (this.$route && this.$route.query) ? this.$route.query : {};
      const qSourceId = String(query.source_id || '').trim();
      const qPath = String(query.path || '').trim();
      const qType = this.normalizeContextType(query.type);
      if (qSourceId || qPath) {
        return { source_id: qSourceId, path: qPath, type: qType };
      }
      try {
        const raw = sessionStorage.getItem('pcjc_selected_source_context');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        const source_id = String(parsed.source_id || '').trim();
        const path = String(parsed.path || '').trim();
        const type = this.normalizeContextType(parsed.type);
        if (!source_id && !path) return null;
        return { source_id, path, type };
      } catch (e) {
        return null;
      }
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
        '智能体a': 'AgentA',
        '智能体b': 'AgentB',
        '智能体c': 'AgentC',
        agenta: 'AgentA',
        agentb: 'AgentB',
        agentc: 'AgentC',
        '决策选择': 'M4',
        "多模态": 'M1',
        // 变量
        commander: 'CommanderInput',
        '指挥员': 'CommanderInput',
        '指挥员指令': 'CommanderInput',
        '指挥员决策': 'CommanderDecision',
        commanderinput: 'CommanderInput',
        commanderdecision: 'CommanderDecision',
        video: 'V_img',
        v_video: 'V_img',
        v_img: 'V_img',
        instr: 'V2',
        v_instr: 'V2',
        input: 'V_input',
        v_input: 'V_input',
        agent_input: 'V_agent_input',
        v_agent_input: 'V_agent_input',
        decision_input: 'V_decision_input',
        v_decision_input: 'V_decision_input',
        det: 'V3',
        v_det: 'V3',
        env: 'V4',
        v_env: 'V4',
        desc: 'V4',
        v_desc: 'V4',
        know: 'V5',
        v_know: 'V5',
        cand: 'V6',
        v_cand: 'V6',
        neo: 'V7',
        v_neo: 'V7',
        class: 'V7',
        v_class: 'V7',
        intent: 'V8',
        v_intent: 'V8',
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
        if (node.metaType === 'decor') {
          return {
            ...node,
            itemStyle: {
              ...(node.itemStyle || {}),
              opacity: 1
            }
          };
        }
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
            color: isActive ? '#ffe66d' : '#0b4fa2'
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
    exportResult() {
      const url = `${API_BASE_URL}/module5/api/dataset/instr/archive`;
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    translateTextContent(text) {
      if (!text || typeof text !== 'string') return text || '';
      const translated = text.replace(/^([a-zA-Z_]+)(\s*[:：])/gm, (match, key, sep) => {
        const translated = FIELD_LABEL_MAP[key];
        return translated ? translated + sep : match;
      });
      return this.replaceStageTerms(this.replaceAgentTerms(translated));
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
    },
    _bindCarouselHover() {
      const el = document.getElementById('analysis-preview-carousel');
      if (!el) return;
      this._carouselEl = el;
      this._onCarouselEnter = () => {
        this.carouselHovered = true;
        this.carouselInterval = 0;
        const c = this.$refs.previewCarousel;
        if (c && typeof c.pause === 'function') c.pause();
      };
      this._onCarouselLeave = () => {
        this.carouselHovered = false;
        if (!this.suppressCarouselSync) {
          this.carouselInterval = CAROUSEL_DEFAULT_INTERVAL;
          const c = this.$refs.previewCarousel;
          if (c && typeof c.start === 'function') c.start();
        }
      };
      el.addEventListener('mouseenter', this._onCarouselEnter);
      el.addEventListener('mouseleave', this._onCarouselLeave);
    },
    _unbindCarouselHover() {
      if (!this._carouselEl) return;
      if (this._onCarouselEnter) this._carouselEl.removeEventListener('mouseenter', this._onCarouselEnter);
      if (this._onCarouselLeave) this._carouselEl.removeEventListener('mouseleave', this._onCarouselLeave);
      this._carouselEl = null;
    }
  }
};
</script>

<style scoped>
/* 使用与 CombinedDiagnosis 一致的样式 */
.attribution-diagnosis-container {
  width: 100vw; height: 100vh; background-image: url('~@/assets/images/step5/bg-analysis.png');
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
.diagram-div { flex: 1; min-height: 0; cursor: default; }
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

.details-body { flex: 1; overflow: hidden; color: #8bd3f9; min-width: 0; min-height: 0; display: flex; flex-direction: column; }
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
.node-info { display: flex; flex-direction: column; gap: 15px; height: 100%; }
.info-row { display: flex; align-items: baseline; flex-shrink: 0; }
.description-row {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.description-row .info-label {
  display: block;
  margin-bottom: 6px;
  flex-shrink: 0;
}
.info-label { font-weight: bold; min-width: 80px; color: #4ED8FF; }
.info-value { flex: 1; word-break: break-all; }
.highlight-blue { color: #00e5ff; font-weight: bold; font-size: 1.1rem; }
.highlight-red { color: #ff5e5e; font-weight: bold; }
.info-text { margin-top: 0; width: 100%; line-height: 1.5; color: rgba(139, 211, 249, 0.8); background: rgba(0, 0, 0, 0.2); padding: 10px; border-radius: 4px; white-space: pre-wrap; overflow: auto; overflow-wrap: anywhere; word-break: break-word; flex: 1; min-height: 0; }
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

.formula-text-custom { font-size: 0.95rem !important; color: #FFFFFF !important; letter-spacing: 1px; }

.export-btn-custom {
  position: absolute; right: 1vw; background-image: url('~@/assets/images/step5/按钮-结果导出.png'); background-size: 100% 100%;
  width: 150px; height: 45px; background-color: transparent; border: none; cursor: pointer; color: #333; font-weight: bold; font-size: 1rem;
  padding-right: 20px; text-align: right; font-family: 'DingTalk-JinBuTi', sans-serif !important;
}
.export-btn-custom:disabled { filter: grayscale(1); opacity: 0.5; cursor: not-allowed; }

.metric-spinner {
  display: inline-block; width: 22px; height: 22px;
  border: 3px solid rgba(0, 229, 255, 0.2); border-left-color: #00e5ff;
  border-radius: 50%; animation: metric-spin 1s linear infinite; vertical-align: middle;
}
@keyframes metric-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
