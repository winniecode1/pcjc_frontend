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
          <button @click="startAnalysis" :disabled="isLoading || isSelectingFile" class="btn-start-detect">
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
          </div>

          <!-- 详细信息展示 -->
          <div class="details-card">
            <div class="small-panel-header">节点详细信息</div>
            <div class="details-body">
              <div v-if="!selectedNode" class="no-selection">请点击图中节点查看详情</div>
              <div v-else class="node-info">
                <div class="info-row">
                  <span class="info-label">名称：</span>
                  <span class="info-value highlight-blue">{{ selectedNode.text }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">类型：</span>
                  <span class="info-value">{{ selectedNode.category === 'Module' ? '功能模块' : '数据变量' }}</span>
                </div>
                <div class="info-row description-row">
                  <span class="info-label">描述：</span>
                  <div class="info-text">{{ selectedNode.desc || '暂无详细描述信息。' }}</div>
                </div>
                <div class="info-row" v-if="selectedNode.value">
                  <span class="info-label">当前数值：</span>
                  <span class="info-value highlight-red">{{ selectedNode.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部指标 -->
        <div class="analysis-bottom-section">
          <div class="metric-card-custom formula-card-custom">
            <div class="m-title">计算公式</div>
            <div ref="formulaRef" class="m-value formula-text-custom"></div>
          </div>
          <div class="metric-card-custom">
            <div class="m-title">增强前 多主体解析准确率</div>
            <div class="m-value">84<span>%</span></div>
          </div>
          <div class="metric-card-custom">
            <div class="m-title">增强后 多主体解析准确率</div>
            <div class="m-value">62<span>%</span></div>
          </div>
          <div class="metric-card-custom">
            <div class="m-title">根因诊断后 多主体解析准确率</div>
            <div class="m-value">91<span>%</span></div>
          </div>
          <button class="export-btn-custom">结果导出</button>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'AnalysisDashboard',
  data() {
    return {
      isLiveOpen: true,
      videoList: [
        { id: 1, name: "20240325监控_01.mp4", type: 'live', path: '/videos/监控_01.mp4' },
        { id: 2, name: "20240325实时_02.mp4", type: 'live', path: '/videos/实时_02.mp4' },
        { id: 3, name: "边界态势回放_演示.mp4", type: 'live', path: '/videos/演示_01.mp4' },
        { id: 4, name: "演习片段_演示.mp4", type: 'live', path: '/videos/演示_02.mp4' },
        { id: 5, name: "综合态势感知回放.mp4", type: 'live', path: '/videos/演示_03.mp4' }
      ],
      selectedVideo: null,
      isSelectingFile: false,
      selectedFileContext: null,
      carouselSlide: 0,
      carouselItems: [],
      isLoading: false,
      analysisHighlightRunId: 0,
      myChart: null,
      graphBaseData: [],
      graphBaseLinks: [],
      selectedNode: null
    };
  },
  mounted() {
    this.fetchVideoList();
    this.initChart();
    this.renderFormula();
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
        window.katex.render("R = \\frac{\\sum_{i=1}^{n} (C_i \\cdot w_i)}{N_{total}}", this.$refs.formulaRef, {
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
              { source: 'V6', target: 'M2' }, { source: 'M3', target: 'V7' },
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
          this.selectedNode = {
            text: params.data.value,
            category: params.data.symbol === 'roundRect' ? 'Module' : 'Variable',
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
        const response = await this.$ajax.get('http://10.109.253.71:5236/videos');
        if (response.data.videos) {
          const fetched = response.data.videos.map(v => ({ ...v, type: 'live' }));
          this.videoList = [...this.videoList, ...fetched];
        }
      } catch (error) { console.warn("获取数据失败", error); }
    },
    async selectVideo(video) {
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
      // TODO: 前后端联调时替换为真实接口
      // return this.$ajaxJ.post('/module5/api/file-selection', { path: video.path, name: video.name });
      return this.mockFileSelectionResponse(video);
    },
    mockFileSelectionResponse(video) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            stage1: {
              path: video.path,
              source_name: video.name
            },
            carouselItems: this.buildMockMultimodalItems(video)
          });
        }, 350);
      });
    },
    buildMockMultimodalItems(video) {
      const selectedItem = {
        type: this.isVideo(video.name) ? 'video' : 'image',
        src: this.isVideo(video.name) ? this.videoUrl(video.path) : this.imageUrl(video.path)
      };
      const mockImages = [
        require('@/assets/images/MockData/firc_junshi_1.jpg'),
        require('@/assets/images/MockData/firc_junshi_2.jpg'),
        require('@/assets/images/MockData/firc_junshi_3.jpg'),
        require('@/assets/images/MockData/firc_junshi_4.jpg')
      ];
      const liveCandidate = this.videoList.find(v => v.id !== video.id && this.isVideo(v.name));

      const items = [selectedItem];
      if (liveCandidate) {
        items.push({ type: 'video', src: this.videoUrl(liveCandidate.path) });
      }
      mockImages.forEach((img) => {
        items.push({ type: 'image', src: img });
      });
      items.push({
        type: 'text',
        title: '多模态预览已就绪',
        content: `已为 ${video.name} 装载视频片段与图片帧。`
      });
      return items;
    },
    applyFileSelectionResult(response, video) {
      const fallbackItem = {
        type: this.isVideo(video.name) ? 'video' : 'image',
        src: this.isVideo(video.name) ? this.videoUrl(video.path) : this.imageUrl(video.path)
      };
      const res = response || {};
      this.selectedFileContext = res.stage1 || { path: video.path, source_name: video.name };
      this.carouselItems = Array.isArray(res.carouselItems) && res.carouselItems.length > 0
        ? res.carouselItems
        : [fallbackItem];
      this.carouselSlide = 0;
    },
    async startAnalysis() {
      if (!this.selectedVideo) return;
      this.analysisHighlightRunId += 1;
      const runId = this.analysisHighlightRunId;
      this.isLoading = true;

      this.highlightPresetDetAllExceptVideoInstrDesc();
      await this.waitMs(5000);
      if (runId !== this.analysisHighlightRunId) return;

      this.highlightPresetDescAllExceptVideoInstrDet();
      await this.waitMs(5000);
      if (runId !== this.analysisHighlightRunId) return;

      this.highlightPresetCandToHazard();
      await this.waitMs(5000);
      if (runId !== this.analysisHighlightRunId) return;

      this.highlightPresetClassToHazard();
      await this.waitMs(5000);
      if (runId !== this.analysisHighlightRunId) return;

      this.resetGraphHighlight();
      this.isLoading = false;
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
        "多模态":"M1",
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
    isVideo(name) { return name && (name.endsWith('.mp4') || name.endsWith('.avi')); },
    videoUrl(path) { return path ? `http://10.109.253.71:5236${path}` : ''; },
    imageUrl(path) { return path ? `http://10.109.253.71:5236${path}` : require('@/assets/images/step1/-s-弹框-选择数据.png'); }
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
.items-container::-webkit-scrollbar { width: 6px; }
.items-container::-webkit-scrollbar-thumb { background: #00e5ff; border-radius: 3px; }

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
.analysis-top-section { flex: 1; display: flex; gap: 20px; margin-bottom: 20px; min-height: 0; }

.graph-card { flex: 2; display: flex; flex-direction: column; background-image: url('~@/assets/images/step1/-s-弹框-选择数据.png'); background-size: 100% 100%; padding: 10px; overflow: hidden; }
.diagram-div { flex: 1; min-height: 0; cursor: crosshair; }

.details-card { flex: 1; display: flex; flex-direction: column; background-image: url('~@/assets/images/step1/-s-弹框-选择数据.png'); background-size: 100% 100%; padding: 20px; }
.small-panel-header { font-family: 'DOUYUFont'; font-size: 14px; color: #c6f4ff; border-bottom: 1px solid rgba(78, 216, 255, 0.3); padding-bottom: 5px; margin-bottom: 15px; text-align: center; padding-top: 8px; }

.details-body { flex: 1; overflow-y: auto; color: #8bd3f9; }
.no-selection { height: 100%; display: flex; align-items: center; justify-content: center; opacity: 0.5; font-style: italic; }
.node-info { display: flex; flex-direction: column; gap: 15px; }
.info-row { display: flex; align-items: baseline; }
.info-label { font-weight: bold; min-width: 80px; color: #4ED8FF; }
.info-value { flex: 1; word-break: break-all; }
.highlight-blue { color: #00e5ff; font-weight: bold; font-size: 1.1rem; }
.highlight-red { color: #ff5e5e; font-weight: bold; }
.info-text { margin-top: 5px; line-height: 1.5; color: rgba(139, 211, 249, 0.8); background: rgba(0, 0, 0, 0.2); padding: 10px; border-radius: 4px; }

/* ================= 底部指标 ================= */
.analysis-bottom-section { height: 10vh; display: flex; justify-content: flex-start; gap: 1vw; align-items: center; margin-top: 10px; position: relative; padding-left: 10px; }
.metric-card-custom {
  background-image: url('~@/assets/images/step5/底部多主体和不一致的背景.png'); background-size: 100% 100%; width: 13vw; height: 7vh;
  display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 0 5px;
}
.m-title { font-family: 'DOUYUFont'; font-size: 10px; padding-left: 30px; text-align: left; width: 100%; color: #FFFFFF; }
.m-value { font-size: 1.8rem; font-weight: bold; font-family: 'DingTalk-JinBuTi', sans-serif !important; color: #c6f4ff; }
.m-value span { font-size: 1rem; margin-left: 2px; }

.formula-text-custom { font-size: 1.4rem !important; color: #FFFFFF !important; letter-spacing: 1px; }

.export-btn-custom {
  position: absolute; right: 1vw; background-image: url('~@/assets/images/step5/按钮-结果导出.png'); background-size: 100% 100%;
  width: 150px; height: 45px; background-color: transparent; border: none; cursor: pointer; color: #333; font-weight: bold; font-size: 1rem;
  padding-right: 20px; text-align: right; font-family: 'DingTalk-JinBuTi', sans-serif !important;
}
</style>
