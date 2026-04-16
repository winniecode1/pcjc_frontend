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
        <button class="header-btn btn-next" @click="$router.push('/analysis-dashboard')">下个页面</button>
      </b-col>
    </b-row>

    <!-- 主要内容网格 -->
    <b-row class="content-row no-gutters">
      <!-- 左侧栏：数据分类与交互 -->
      <b-col cols="3" class="left-column px-2">
        <div class="panel-header header-select-data clean-header">选择认知传播数据源</div>

        <div class="sidebar-scroll-area">
          <div class="folder-group">
            <div class="video-item folder-header-item" @click="isLiveOpen = !isLiveOpen">
              <span class="folder-name-container">
                <span class="fold-arrow" :class="{ rotated: isLiveOpen }">▶</span>
                <span class="folder-label">认知传播一致数据</span>
              </span>
            </div>
            <div v-show="isLiveOpen" class="items-container">
              <div v-for="video in liveVideos" :key="video.id" class="video-item" @click="selectVideo(video)"
                :class="{ 'selected': selectedVideo && selectedVideo.id === video.id }">
                <span class="video-name">{{ video.name }}</span>
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
              <div v-for="video in demoVideos" :key="video.id" class="video-item" @click="selectVideo(video)"
                :class="{ 'selected': selectedVideo && selectedVideo.id === video.id }">
                <span class="video-name">{{ video.name }}</span>
                <span class="selector-circle"></span>
              </div>
            </div>
          </div>
        </div>

        <div class="preview-container">
          <div class="panel-header header-select-data clean-header">多模态结果展示</div>
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
            <span class="btn-text-pos">{{ isSelectingFile ? '数据加载中...' : (isLoading ? '诊断中...' : '开始认知诊断') }}</span>
          </button>
        </div>
      </b-col>

      <!-- 右侧区域：四框诊断 -->
      <b-col cols="9" class="right-column-custom">
        <div class="modules-grid">
          <!-- 模块 1 -->
          <div class="module-wrapper">
            <div class="module-header">1.多模态信息认知偏差诊断</div>
            <div class="module-body">
              <div class="result-section">
                <div class="section-title">诊断与定位结果</div>
                <div class="content-box scrollable" v-html="highlightBrackets(module1Result)"></div>
                <div v-if="isLoading && module1ShowDiagnosisOverlay" class="diagnosis-overlay">
                  <img src="~@/assets/images/step5/放大镜.png" class="diagnosis-icon" alt="诊断中">
                  <div class="diagnosis-text">正在诊断中，请等待</div>
                </div>
              </div>
              <div class="metric-group">
                <div class="metric-item">
                  模型内部偏差结果:
                  <span v-if="module1InternalBias !== null && module1InternalBias !== undefined">{{ formatPercent(module1InternalBias, 0) }}</span>
                  <span v-else-if="isLoading" class="loading-spinner"></span>
                  <span v-else>-</span>
                </div>
                <div class="metric-item">
                  认知传播偏差结果:
                  <span v-if="module1PropagationBias !== null && module1PropagationBias !== undefined">{{ formatPercent(module1PropagationBias, 0) }}</span>
                  <span v-else-if="isLoading" class="loading-spinner"></span>
                  <span v-else>-</span>
                </div>
                <div class="metric-item">
                  是否是偏差模块:
                  <span v-if="module1IsBiasModule !== null && module1IsBiasModule !== undefined">{{ formatYesNo(module1IsBiasModule) }}</span>
                  <span v-else-if="isLoading" class="loading-spinner"></span>
                  <span v-else>-</span>
                </div>
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
                <div v-if="isLoading && (module2InternalBias === null || module2InternalBias === undefined)" class="diagnosis-overlay">
                  <img src="~@/assets/images/step5/放大镜.png" class="diagnosis-icon" alt="诊断中">
                  <div class="diagnosis-text">正在诊断中，请等待</div>
                </div>
              </div>
              <div class="metric-group">
                <div class="metric-item">
                  模型内部偏差结果:
                  <span v-if="module2InternalBias !== null && module2InternalBias !== undefined">{{ formatPercent(module2InternalBias, 0) }}</span>
                  <span v-else-if="isLoading" class="loading-spinner"></span>
                  <span v-else>-</span>
                </div>
                <div class="metric-item">
                  认知传播偏差结果:
                  <span v-if="module2PropagationBias !== null && module2PropagationBias !== undefined">{{ formatPercent(module2PropagationBias, 0) }}</span>
                  <span v-else-if="isLoading" class="loading-spinner"></span>
                  <span v-else>-</span>
                </div>
                <div class="metric-item">
                  是否是偏差模块:
                  <span v-if="module2IsBiasModule !== null && module2IsBiasModule !== undefined">{{ formatYesNo(module2IsBiasModule) }}</span>
                  <span v-else-if="isLoading" class="loading-spinner"></span>
                  <span v-else>-</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 模块 3 -->
          <div class="module-wrapper">
            <div class="module-header">3.群体协商认知偏差诊断</div>
            <div class="module-body">
              <div class="result-section">
                <div class="section-title">诊断与定位结果</div>
                <div class="content-box scrollable" v-html="highlightBrackets(module3Result)"></div>
                <div v-if="isLoading && (module3InternalBias === null || module3InternalBias === undefined)" class="diagnosis-overlay">
                  <img src="~@/assets/images/step5/放大镜.png" class="diagnosis-icon" alt="诊断中">
                  <div class="diagnosis-text">正在诊断中，请等待</div>
                </div>
              </div>
              <div class="metric-group">
                <div class="metric-item">
                  模型内部偏差结果:
                  <span v-if="module3InternalBias !== null && module3InternalBias !== undefined">{{ formatPercent(module3InternalBias, 0) }}</span>
                  <span v-else-if="isLoading" class="loading-spinner"></span>
                  <span v-else>-</span>
                </div>
                <div class="metric-item">
                  认知传播偏差结果:
                  <span v-if="module3PropagationBias !== null && module3PropagationBias !== undefined">{{ formatPercent(module3PropagationBias, 0) }}</span>
                  <span v-else-if="isLoading" class="loading-spinner"></span>
                  <span v-else>-</span>
                </div>
                <div class="metric-item">
                  是否是偏差模块:
                  <span v-if="module3IsBiasModule !== null && module3IsBiasModule !== undefined">{{ formatYesNo(module3IsBiasModule) }}</span>
                  <span v-else-if="isLoading" class="loading-spinner"></span>
                  <span v-else>-</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 模块 4 -->
          <div class="module-wrapper">
            <div class="module-header">4.决策选择认知偏差诊断</div>
            <div class="module-body">
              <div class="result-section">
                <div class="section-title">诊断与定位结果</div>
                <div class="content-box scrollable" v-html="highlightBrackets(module4Result)"></div>
                <div v-if="isLoading && module4ShowDiagnosisOverlay" class="diagnosis-overlay">
                  <img src="~@/assets/images/step5/放大镜.png" class="diagnosis-icon" alt="诊断中">
                  <div class="diagnosis-text">正在诊断中，请等待</div>
                </div>
              </div>
              <div class="metric-group">
                <div class="metric-item">
                  模型内部偏差结果:
                  <span v-if="module4InternalBias !== null && module4InternalBias !== undefined">{{ formatPercent(module4InternalBias, 0) }}</span>
                  <span v-else-if="isLoading" class="loading-spinner"></span>
                  <span v-else>-</span>
                </div>
                <div class="metric-item">
                  是否是偏差模块:
                  <span v-if="module4IsBiasModule !== null && module4IsBiasModule !== undefined">{{ formatYesNo(module4IsBiasModule) }}</span>
                  <span v-else-if="isLoading" class="loading-spinner"></span>
                  <span v-else>-</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bottom-content">
          <div class="metric-card formula-card">
            <div class="metric-title">计算公式</div>
            <div ref="formulaRef" class="metric-value formula-text"></div>
          </div>
          <div class="metric-card recall-card centered-metric">
            <div class="metric-title">不一致根因召回率</div>
            <div class="metric-value"><span>{{ formatPercent(recall, 0) }}</span></div>
          </div>
          <button class="export-btn" @click="exportResult" :disabled="isLoading">结果导出</button>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  name: 'CombinedDiagnosis',
  data() {
    return {
      isLiveOpen: true,
      isDemoOpen: false,
      videoList: [
        { id: 1, name: "20240325监控_01.mp4", type: 'live', path: '/videos/监控_01.mp4' },
        { id: 2, name: "20240325实时_02.mp4", type: 'live', path: '/videos/实时_02.mp4' },
        { id: 3, name: "边界态势回放_演示.mp4", type: 'demo', path: '/videos/演示_01.mp4' },
        { id: 4, name: "演习片段_演示.mp4", type: 'demo', path: '/videos/演示_02.mp4' },
        { id: 5, name: "综合态势感知回放.mp4", type: 'demo', path: '/videos/演示_03.mp4' }
      ],
      selectedVideo: null,
      isLoading: false,
      taskId: 'comb_' + Date.now(),
      pollTimer: null,
      isSelectingFile: false,
      selectedFileContext: null,
      carouselSlide: 0,
      carouselItems: [],
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
      module2Result: '',
      module2InternalBias: null,
      module2PropagationBias: null,
      module2IsBiasModule: null,
      module3Result: '',
      module3InternalBias: null,
      module3PropagationBias: null,
      module3IsBiasModule: null,
      module4ShowDiagnosisOverlay: false,
      module4BiasTestResultPending: '',
      module4InternalBiasPending: null,
      module4IsBiasModulePending: null,
      module4DelayTimer: null,
      module4Result: '',
      module4InternalBias: null,
      module4IsBiasModule: null,
      accuracy: null,
      recall: null,
    };
  },
  computed: {
    liveVideos() { return this.videoList.filter(v => v.type === 'live'); },
    demoVideos() { return this.videoList.filter(v => v.type === 'demo'); }
  },
  mounted() {
    this.fetchVideoList();
    this.renderFormula();

    // 初始化默认全量数据展示
    this.selectedVideo = null;

    // 初始化四个诊断模块的默认文字与指标
    this.clearResults();

    // 初始化左下角轮播图的多模态混排数据
    this.carouselItems = [];
  },
  beforeDestroy() {
    if (this.pollTimer) clearInterval(this.pollTimer);
    if (this.module1DelayTimer && this.module1DelayTimer !== 'done') clearTimeout(this.module1DelayTimer);
    if (this.module4DelayTimer && this.module4DelayTimer !== 'done') clearTimeout(this.module4DelayTimer);
  },
  methods: {
    renderFormula() {
      // 动态加载 KaTeX 以确保公式渲染
      if (!window.katex) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js';
        script.onload = () => {
          this.doRender();
        };
        document.head.appendChild(script);
      } else {
        this.doRender();
      }
    },
    doRender() {
      if (window.katex && this.$refs.formulaRef) {
        window.katex.render("R = \\frac{\\sum_{i=1}^{n} (C_i \\cdot w_i)}{N_{total}}", this.$refs.formulaRef, {
          throwOnError: false,
          displayMode: false
        });
      }
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
        this.showMsg('warning', '文件数据加载失败，已使用基础预览。');
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

      const liveCandidate = this.liveVideos.find(v => v.id !== video.id && this.isVideo(v.name));
      const demoCandidate = this.demoVideos.find(v => v.id !== video.id && this.isVideo(v.name));

      const items = [selectedItem];
      if (liveCandidate) {
        items.push({ type: 'video', src: this.videoUrl(liveCandidate.path) });
      }
      if (demoCandidate) {
        items.push({ type: 'video', src: this.videoUrl(demoCandidate.path) });
      }

      mockImages.forEach((img) => {
        items.push({ type: 'image', src: img });
      });

      items.push(
        {
          type: 'text',
          title: '多模态样本准备完成',
          content: `已为 ${video.name} 装载视频片段与 MockData 的4张图片，可直接开始认知诊断。`
        }
      );

      return items;
    },
    applyFileSelectionResult(response, video) {
      const previewItem = {
        type: this.isVideo(video.name) ? 'video' : 'image',
        src: this.isVideo(video.name) ? this.videoUrl(video.path) : this.imageUrl(video.path)
      };
      const res = response || {};
      const carouselItems = Array.isArray(res.carouselItems) && res.carouselItems.length > 0
        ? res.carouselItems
        : [previewItem];

      this.selectedFileContext = res.stage1 || { path: video.path, source_name: video.name };
      this.carouselItems = carouselItems;
      this.carouselSlide = 0;
      this.showMsg('success', '文件已加载，可开始认知诊断。');
    },
    async startAnalysis() {
      if (!this.selectedVideo) { this.showMsg('warning', '请先选择数据源！'); return; }

      this.clearResults();
      this.isLoading = true;
      this.taskId = 'comb_' + Date.now();

      try {
        const payload = this.buildDiagnosisPayload();
        const responseData = await this.requestDiagnosisResult(payload);
        const shouldShowImmediately = responseData && (responseData.running === false || responseData.status === 'completed');
        this.parseData(responseData, shouldShowImmediately);

        if (responseData && (responseData.running || responseData.status === 'running')) {
          this.startPolling();
          return;
        }
        this.isLoading = false;
        this.showMsg('success', '诊断完成！');
      } catch (error) {
        console.error("诊断接口调用失败", error);
        this.isLoading = false;
        this.showMsg('danger', '诊断启动失败，请稍后重试。');
      }
    },
    buildDiagnosisPayload() {
      return {
        stage1: this.selectedFileContext || { path: this.selectedVideo.path },
        stage2: { category: 'A330-MRTT' },
        stage3: { agents: ['commander', 'analyst'] },
        stage4: { decision: 'attack' }
      };
    },
    async requestDiagnosisResult(payload) {
      // TODO: 前后端联调时替换为真实接口
      // const res = await this.$ajaxJ.post('/module5/api/bias-analysis', payload, { params: { id: this.taskId, async: true } });
      // return res.data;
      return this.mockDiagnosisResult(payload);
    },
    mockDiagnosisResult(payload) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const sourcePath = this.safeGet(payload, 'stage1.path', this.selectedVideo ? this.selectedVideo.path : '');
          resolve({
            running: false,
            status: 'completed',
            accuracy: 0.91,
            recall: 0.87,
            modules: {
              module1: {
                single_task_stage: {
                  prediction: {
                    caption: `数据源 ${sourcePath} 解析显示 {{注意力权重偏移}}，目标特征置信度出现波动。`
                  }
                },
                module_test_stage: {
                  prediction: {
                    cognitive_bias: 0.74
                  }
                },
                analysis_task: {
                  calculated_value: 0.12
                },
                is_bias_module: true
              },
              module2: {
                single_task_stage: {
                  prediction: {
                    kind: 'A330-MRTT',
                    color: '灰色涂装',
                    outline: '机身轮廓受烟雾干扰',
                    scene: '近海高压侦察',
                    model: '易与同类机型混淆'
                  }
                },
                module_test_stage: {
                  prediction: {
                    cognitive_bias: 0.65
                  }
                },
                analysis_task: {
                  calculated_value: 0.08
                },
                is_bias_module: true
              },
              module3: {
                single_task_stage: {
                  prediction: {
                    final_review: '群体协商一致性较高，暂未发现明显的协商冲突偏差。'
                  }
                },
                module_test_stage: {
                  prediction: {
                    cognitive_bias: 0.05
                  }
                },
                analysis_task: {
                  calculated_value: 0.02
                },
                is_bias_module: false
              },
              module4: {
                single_task_stage: {
                  prediction: {
                    summary: '决策链路总体稳定，但在目标威胁评估阶段存在 {{风险等级上调}} 倾向。'
                  }
                },
                module_test_stage: {
                  prediction: {
                    cognitive_bias: 0.15
                  }
                },
                is_bias_module: false
              }
            }
          });
        }, 900);
      });
    },
    startPolling() {
      if (this.pollTimer) clearInterval(this.pollTimer);
      this.pollStatus();
      this.pollTimer = setInterval(() => {
        this.pollStatus();
      }, 1000);
    },
    async pollStatus() {
      try {
        const data = await this.requestDiagnosisStatus();
        if (!data || !data.modules) return;
        const shouldShowImmediately = data && (data.running === false || data.status === 'completed');
        this.parseData(data, shouldShowImmediately);
        if (data.running === false || data.status === 'completed') {
          if (this.pollTimer) clearInterval(this.pollTimer);
          this.pollTimer = null;
          this.isLoading = false;
          this.showMsg('success', '诊断完成！');
        }
      } catch (e) {
        if (this.pollTimer) clearInterval(this.pollTimer);
        this.pollTimer = null;
        this.isLoading = false;
        console.warn("轮询失败", e);
      }
    },
    async requestDiagnosisStatus() {
      // TODO: 前后端联调时替换为真实轮询接口
      // const res = await this.$ajax.get('/module5/api/bias-analysis/status', { params: { id: this.taskId } });
      // return res.data;
      return this.mockDiagnosisResult(this.buildDiagnosisPayload());
    },
    parseData(data, fromCache = false) {
      const modules = data.modules || {};
      this.parseModule1(modules.module1, fromCache);
      this.parseModule2(modules.module2);
      this.parseModule3(modules.module3);
      this.parseModule4(modules.module4, fromCache);
      if (data.recall !== undefined && data.recall !== null) this.recall = data.recall;
      if (data.accuracy !== undefined && data.accuracy !== null) this.accuracy = data.accuracy;
    },
    parseModule1(module1, fromCache = false) {
      if (!module1) return;

      const singleTask = module1.single_task_stage;
      const biasTestResult = singleTask ? this.safeGet(singleTask, 'prediction.caption', '') : '';

      const moduleTestStage = module1.module_test_stage;
      const internalBias = moduleTestStage ? this.safeGet(moduleTestStage, 'prediction.cognitive_bias', null) : null;

      const analysisTask = module1.analysis_task;
      const propagationBias = analysisTask ? this.safeGet(analysisTask, 'calculated_value', null) : null;

      const isBiasModule = this.safeGet(module1, 'is_bias_module', null);

      if (fromCache) {
        this.module1Result = biasTestResult || '';
        this.module1InternalBias = internalBias;
        this.module1PropagationBias = propagationBias;
        this.module1IsBiasModule = isBiasModule;
        this.module1ShowDiagnosisOverlay = false;
        return;
      }

      if (biasTestResult || internalBias !== null || propagationBias !== null || isBiasModule !== null) {
        this.module1BiasTestResultPending = biasTestResult;
        this.module1InternalBiasPending = internalBias;
        this.module1PropagationBiasPending = propagationBias;
        this.module1IsBiasModulePending = isBiasModule;

        if (!this.module1DelayTimer) {
          this.module1ShowDiagnosisOverlay = true;
          this.module1DelayTimer = setTimeout(() => {
            this.module1Result = this.module1BiasTestResultPending || '';
            this.module1InternalBias = this.module1InternalBiasPending;
            this.module1PropagationBias = this.module1PropagationBiasPending;
            this.module1IsBiasModule = this.module1IsBiasModulePending;
            this.module1ShowDiagnosisOverlay = false;
            this.module1DelayTimer = 'done';
          }, 10000);
        } else if (this.module1DelayTimer === 'done') {
          this.module1Result = biasTestResult || '';
          this.module1InternalBias = internalBias;
          this.module1PropagationBias = propagationBias;
          this.module1IsBiasModule = isBiasModule;
        }
      }
    },
    parseModule2(module2) {
      if (!module2) return;

      const prediction = this.safeGet(module2, 'single_task_stage.prediction', null);
      if (prediction && typeof prediction === 'object') {
        const lines = [];
        if (prediction.kind) {
          lines.push(`目标类型：${prediction.kind}`);
        }
        Object.keys(prediction).forEach((key) => {
          if (key !== 'kind' && key !== 'cognitive_bias') {
            lines.push(`${key}：${prediction[key]}`);
          }
        });
        this.module2Result = lines.join('\n');
      } else {
        this.module2Result = '';
      }

      this.module2InternalBias = this.safeGet(module2, 'module_test_stage.prediction.cognitive_bias', null);
      this.module2PropagationBias = this.safeGet(module2, 'analysis_task.calculated_value', null);
      this.module2IsBiasModule = this.safeGet(module2, 'is_bias_module', null);
    },
    parseModule3(module3) {
      if (!module3) return;

      this.module3Result = this.safeGet(module3, 'single_task_stage.prediction.final_review', '');
      this.module3InternalBias = this.safeGet(module3, 'module_test_stage.prediction.cognitive_bias', null);
      this.module3PropagationBias = this.safeGet(module3, 'analysis_task.calculated_value', null);
      this.module3IsBiasModule = this.safeGet(module3, 'is_bias_module', null);
    },
    parseModule4(module4, fromCache = false) {
      if (!module4) return;

      const biasTestResult = this.safeGet(module4, 'single_task_stage.prediction.summary', '');
      const internalBias = this.safeGet(module4, 'module_test_stage.prediction.cognitive_bias', null);
      const isBiasModule = this.safeGet(module4, 'is_bias_module', null);

      if (fromCache) {
        this.module4Result = biasTestResult || '';
        this.module4InternalBias = internalBias;
        this.module4IsBiasModule = isBiasModule;
        this.module4ShowDiagnosisOverlay = false;
        return;
      }

      if (biasTestResult || internalBias !== null || isBiasModule !== null) {
        this.module4BiasTestResultPending = biasTestResult;
        this.module4InternalBiasPending = internalBias;
        this.module4IsBiasModulePending = isBiasModule;

        if (!this.module4DelayTimer) {
          this.module4ShowDiagnosisOverlay = true;
          this.module4DelayTimer = setTimeout(() => {
            this.module4Result = this.module4BiasTestResultPending || '';
            this.module4InternalBias = this.module4InternalBiasPending;
            this.module4IsBiasModule = this.module4IsBiasModulePending;
            this.module4ShowDiagnosisOverlay = false;
            this.module4DelayTimer = 'done';
          }, 10000);
        } else if (this.module4DelayTimer === 'done') {
          this.module4Result = biasTestResult || '';
          this.module4InternalBias = internalBias;
          this.module4IsBiasModule = isBiasModule;
        }
      }
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
    clearResults() {
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
      this.module4InternalBias = null; this.module4IsBiasModule = null;
      this.accuracy = null; this.recall = null;
    },
    showMsg(variant, msg) {
      // intentionally silent: top message box has been removed
      void variant;
      void msg;
    },
    highlightBrackets(text) {
      if (text === null || text === undefined) return '等待中...';
      return String(text)
        .replace(/\{\{([\s\S]*?)\}\}/g, '<span class="highlight-text">$1</span>')
        .replace(/\(\((.*?)\)\)/g, '<span class="highlight-text">$1</span>')
        .replace(/\n/g, '<br>');
    },
    formatPercent(v, d = 0) { return (v !== null && v !== undefined) ? (v * 100).toFixed(d) + '%' : '-'; },
    formatYesNo(v) { return v === null ? '-' : (v ? '是' : '否'); },
    exportResult() { alert("结果已导出至报告文件！"); },
    // 助手函数
    isVideo(name) { return name && (name.endsWith('.mp4') || name.endsWith('.avi')); },
    videoUrl(path) { return path ? `http://10.109.253.71:5236${path}` : ''; },
    imageUrl(path) {
      // 如果没有真实路径，返回占位资产
      return path ? `http://10.109.253.71:5236${path}` : require('@/assets/images/step1/-s-弹框-选择数据.png');
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
  border-radius: 8px; padding: 20px; display: flex; flex-direction: column; justify-content: center; text-align: left; margin: 0 auto;
}
.text-slide-title { font-size: 16px; font-weight: bold; color: #00e5ff; margin-bottom: 10px; font-family: 'DingTalk-JinBuTi', sans-serif !important; border-bottom: 1px solid rgba(0, 229, 255, 0.3); padding-bottom: 5px; }
.text-slide-desc { font-size: 13px; color: #c6f4ff; line-height: 1.8; white-space: pre-wrap; flex: 1; overflow-y: auto; }
.custom-carousel .carousel-indicators li { background-color: #4ED8FF; }
.custom-carousel .carousel-control-prev-icon, .custom-carousel .carousel-control-next-icon { filter: drop-shadow(0 0 4px #00e5ff); }

/* 开始按钮 */
.action-buttons { height: 10vh; display: flex; justify-content: center; align-items: center; flex-shrink: 0; }
.btn-start-detect {
  background: none; border: none; cursor: pointer; width: 220px; height: 80px;
  background-image: url('~@/assets/images/step1/-s-按钮-开始测试.png');
  background-size: 100% 100%; position: relative; transition: filter 0.3s;
}
.btn-start-detect:disabled { filter: grayscale(1); cursor: not-allowed; }
.btn-text-pos { position: absolute; top: 60%; left: 50%; transform: translate(-50%, -50%); font-family: 'DOUYUFont'; font-size: 15px; color: #FFFFFF; }

/* ================= 右侧栏 ================= */
.right-column-custom { height: 100%; padding-left: 20px; display: flex; flex-direction: column; }
.modules-grid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 20px; flex: 1; min-height: 0; }
.module-wrapper { display: flex; flex-direction: column; min-height: 0; }
.module-header {
  background-image: url('~@/assets/images/step5/二级标题.png'); background-size: 65% 100%; background-repeat: no-repeat;
  font-size: 15px; font-weight: bold; color: #4ED8FF; padding-left: 60px; height: 40px; line-height: 40px; font-family: 'DingTalk-JinBuTi', sans-serif !important;
}
.module-body {
  background-image: url('~@/assets/images/step5/每个模块背景.png'); background-size: 100% 100%; padding: 1.5vh 1.5vw;
  display: flex; flex-direction: column; flex: 1; min-height: 0; position: relative;
}
.result-section {
  flex: 1; display: flex; flex-direction: column; min-height: 0; position: relative; /* 为遮罩层定位 */
}
.section-title { color: #00e5ff; font-family: 'PingFang SC', sans-serif !important; font-weight: bold; margin-bottom: 5px; }
.content-box { flex: 1; line-height: 1.6; color: #FFFFFF; font-size: 14px !important; overflow-y: auto; padding: 0 5px; font-family: 'PingFang SC', 'Microsoft YaHei', 'Arial', sans-serif !important; white-space: pre-wrap; word-wrap: break-word; }
.content-box * { font-size: 14px !important; font-family: 'PingFang SC', 'Microsoft YaHei', 'Arial', sans-serif !important; }
.highlight-text { color: #FF4242 !important; font-weight: 700; }
.metric-group { margin-top: 1.2vh; padding-top: 1vh; border-top: 1px solid rgba(46, 216, 255, 0.2); display: flex; justify-content: space-between; align-items: center; }
.metric-item { font-size: 14px; color: #8bd3f9; }
.metric-item span { font-weight: bold; color: #c6f4ff; font-size: 16px; margin-left: 0.5em; font-family: 'DingTalk-JinBuTi', sans-serif !important; }
.loading-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(198, 244, 255, 0.3);
  border-top-color: #c6f4ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 遮罩层逻辑 */
.diagnosis-overlay {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(10, 30, 60, 0.6); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 5;
}
.diagnosis-icon {
  width: 56px;
  height: 56px;
  object-fit: contain;
  animation: pulse 1.5s ease-in-out infinite;
}
.loading-spinner-large {
  width: 40px; height: 40px; border: 4px solid rgba(0, 229, 255, 0.2); border-left-color: #00e5ff;
  border-radius: 50%; animation: spin 1s linear infinite;
}
.diagnosis-text { margin-top: 10px; color: #00e5ff; font-size: 12px; }

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
}

.bottom-content { height: 10vh; display: flex; align-items: center; justify-content: center; margin-top: 10px; position: relative; }
.metric-card {
  background-image: url('~@/assets/images/step5/底部多主体和不一致的背景.png'); background-size: 100% 100%; width: 16vw; height: 7vh;
  display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 0 10px;
}
.formula-text { font-size: 1.4rem !important; font-family: 'DingTalk-JinBuTi', 'Microsoft YaHei', sans-serif !important; color: #FFFFFF; letter-spacing: 1px; }
.metric-title { font-family: 'DOUYUFont'; font-size: 10px; padding-left: 40px; text-align: left; width: 100%; }
.metric-value { font-size: 1.8rem; font-weight: bold; font-family: 'DingTalk-JinBuTi', sans-serif !important; }
.export-btn {
  position: absolute; right: 1vw; background-image: url('~@/assets/images/step5/按钮-结果导出.png'); background-size: 100% 100%;
  width: 150px; height: 45px; background-color: transparent; border: none; cursor: pointer; color: #333; font-weight: bold; font-size: 1rem;
  padding-right: 20px; text-align: right; font-family: 'DingTalk-JinBuTi', sans-serif !important;
}
.export-btn:disabled { filter: grayscale(1); opacity: 0.5; cursor: not-allowed; }
</style>
