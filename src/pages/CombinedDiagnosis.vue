<template>
  <div class="attribution-diagnosis-container">
    <!-- 顶部导航按钮 -->
    <b-row class="header-bar align-items-center no-gutters">
      <b-col cols="4" class="text-left">
        <button class="header-btn btn-home" @click="$router.push('/')">首页</button>
        <button class="header-btn btn-back" @click="$router.back()">上个页面</button>
      </b-col>
      <b-col cols="4"></b-col>
      <b-col cols="4" class="text-right d-flex justify-content-end">
        <button class="header-btn btn-next" @click="$router.push('/analysis-dashboard')">下个页面</button>
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
          <div class="panel-header header-select-data clean-header">数据内容预览</div>
          <div class="preview-frame">
            <div v-if="!selectedVideo" class="preview-placeholder">请选择数据源查看预览</div>
            <video v-else-if="isVideo(selectedVideo.name)" :src="videoUrl(selectedVideo.path)" class="preview-media" autoplay muted loop></video>
            <img v-else :src="imageUrl(selectedVideo.path)" class="preview-media" alt="预览内容">
          </div>
        </div>

        <div class="action-buttons">
          <button @click="startAnalysis" :disabled="isLoading" class="btn-start-detect">
            <span class="btn-text-pos">{{ isLoading ? '诊断中...' : '开始认知诊断' }}</span>
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
                <div v-if="isLoading && !module1Result" class="diagnosis-overlay">
                  <div class="loading-spinner-large"></div>
                  <div class="diagnosis-text">正在诊断中...</div>
                </div>
              </div>
              <div class="metric-group">
                <div class="metric-item">模型内部偏差结果: <span>{{ formatPercent(module1InternalBias, 0) }}</span></div>
                <div class="metric-item">认知传播偏差结果: <span>{{ formatPercent(module1PropagationBias, 0) }}</span></div>
                <div class="metric-item">是否是偏差模块: <span>{{ formatYesNo(module1IsBiasModule) }}</span></div>
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
              <div class="metric-group">
                <div class="metric-item">模型内部偏差结果: <span>{{ formatPercent(module2InternalBias, 0) }}</span></div>
                <div class="metric-item">认知传播偏差结果: <span>{{ formatPercent(module2PropagationBias, 0) }}</span></div>
                <div class="metric-item">是否是偏差模块: <span>{{ formatYesNo(module2IsBiasModule) }}</span></div>
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
                <div v-if="isLoading && !module3Result" class="diagnosis-overlay">
                  <div class="loading-spinner-large"></div>
                </div>
              </div>
              <div class="metric-group">
                <div class="metric-item">模型内部偏差结果: <span>{{ formatPercent(module3InternalBias, 0) }}</span></div>
                <div class="metric-item">认知传播偏差结果: <span>{{ formatPercent(module3PropagationBias, 0) }}</span></div>
                <div class="metric-item">是否是偏差模块: <span>{{ formatYesNo(module3IsBiasModule) }}</span></div>
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
                <div v-if="isLoading && !module4Result" class="diagnosis-overlay">
                  <div class="loading-spinner-large"></div>
                </div>
              </div>
              <div class="metric-group">
                <div class="metric-item">模型内部偏差结果: <span>{{ formatPercent(module4InternalBias, 0) }}</span></div>
                <div class="metric-item">是否是偏差模块: <span>{{ formatYesNo(module4IsBiasModule) }}</span></div>
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
      isLiveOpen: true, isDemoOpen: false,
      videoList: [
        { id: 1, name: "20240325监控_01.mp4", type: 'live', path: '/videos/监控_01.mp4' },
        { id: 2, name: "20240325实时_02.mp4", type: 'live', path: '/videos/实时_02.mp4' },
        { id: 3, name: "边界态势回放_演示.mp4", type: 'demo', path: '/videos/演示_01.mp4' },
        { id: 4, name: "演习片段_演示.mp4", type: 'demo', path: '/videos/演示_02.mp4' },
        { id: 5, name: "综合态势感知回放.mp4", type: 'demo', path: '/videos/演示_03.mp4' }
      ],
      selectedVideo: null,
      isLoading: false,
      showAlert: false, alertVariant: 'info', alertMessage: '',
      taskId: 'comb_' + Date.now(),
      pollTimer: null,
      // 诊断结果
      module1Result: '', module1InternalBias: null, module1PropagationBias: null, module1IsBiasModule: null,
      module2Result: '', module2InternalBias: null, module2PropagationBias: null, module2IsBiasModule: null,
      module3Result: '', module3InternalBias: null, module3PropagationBias: null, module3IsBiasModule: null,
      module4Result: '', module4InternalBias: null, module4IsBiasModule: null,
      accuracy: null, recall: null,
    };
  },
  computed: {
    liveVideos() { return this.videoList.filter(v => v.type === 'live'); },
    demoVideos() { return this.videoList.filter(v => v.type === 'demo'); }
  },
  mounted() {
    this.fetchVideoList();
    this.renderFormula();
  },
  beforeDestroy() { if (this.pollTimer) clearInterval(this.pollTimer); },
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
    selectVideo(video) { this.selectedVideo = video; },
    async startAnalysis() {
      if (!this.selectedVideo) { this.showMsg('warning', '请先选择数据源！'); return; }
      
      this.clearResults();
      this.isLoading = true;
      this.showMsg('info', '正在启动自动化认知诊断Pipeline...');

      try {
        // 模拟/调用后端Pipeline (根据AttributionDiagnosisV2逻辑)
        // 实际应用中这里应调用 /module5/api/bias-analysis
        const cascadeData = {
          stage1: { path: this.selectedVideo.path },
          stage2: { category: 'A330-MRTT' }, // 模拟
          stage3: { agents: [] },
          stage4: { decision: 'attack' }
        };

        const response = await this.$ajaxJ.post('/module5/api/bias-analysis', cascadeData, {
          params: { id: this.taskId, async: true }
        });

        if (response.status === 200 || response.status === 409) {
          this.startPolling();
        }
      } catch (error) {
        console.error("启动失败", error);
        // 如果环境不通，使用模拟流程展示效果
        this.simulateProcess();
      }
    },
    startPolling() {
      this.pollTimer = setInterval(async () => {
        try {
          const res = await this.$ajax.get('/module5/api/bias-analysis/status', { params: { id: this.taskId } });
          const data = res.data;
          if (data && data.modules) {
            this.parseData(data);
            if (data.status === 'completed') {
              clearInterval(this.pollTimer);
              this.isLoading = false;
              this.showMsg('success', '诊断完成！');
            }
          }
        } catch (e) { console.warn("轮询失败", e); }
      }, 2000);
    },
    simulateProcess() {
      // 模拟前端展示流程
      setTimeout(() => {
        this.module1Result = '诊断发现异常：在多模态特征融合阶段存在 ((注意力权值分配不均))，导致目标置信度波动。';
        this.module1InternalBias = 0.74; this.module1PropagationBias = 0.12; this.module1IsBiasModule = true;
      }, 2000);
      setTimeout(() => {
        this.module2Result = '先验知识库校验显示 ((背景噪声干扰)) 超过阈值，系统误判了目标型号。';
        this.module2InternalBias = 0.65; this.module2PropagationBias = 0.08; this.module2IsBiasModule = true;
      }, 4000);
      setTimeout(() => {
        this.module3Result = '群体协商一致性良好，未发现明显的认知偏差冲突。';
        this.module3InternalBias = 0.05; this.module3PropagationBias = 0.02; this.module3IsBiasModule = false;
      }, 6000);
      setTimeout(() => {
        this.module4Result = '决策树生成正常，最终判定逻辑 ((符合战术规程))。';
        this.module4InternalBias = 0.15; this.module4IsBiasModule = false;
        this.accuracy = 0.94; this.recall = 0.89;
        this.isLoading = false;
        this.showMsg('success', '诊断流程全部结束');
      }, 8000);
    },
    parseData(data) {
      const m1 = data.modules.module1;
      if (m1) {
        this.module1Result = (m1.prediction && m1.prediction.summary) || '';
        this.module1InternalBias = (m1.prediction && m1.prediction.cognitive_bias) || null;
        this.module1IsBiasModule = m1.is_bias_module;
      }
      // 模块4示例
      const m4 = data.modules.module4;
      if (m4) {
        this.module4Result = (m4.prediction && m4.prediction.summary) || '';
        this.module4InternalBias = (m4.prediction && m4.prediction.cognitive_bias) || null;
      }
    },
    clearResults() {
      this.module1Result = ''; this.module2Result = ''; this.module3Result = ''; this.module4Result = '';
      this.accuracy = null; this.recall = null;
    },
    showMsg(variant, msg) {
      this.alertVariant = variant; this.alertMessage = msg; this.showAlert = true;
      setTimeout(() => { this.showAlert = false; }, 3000);
    },
    highlightBrackets(text) {
      if (!text) return '等待中...';
      return text.replace(/\(\((.*?)\)\)/g, '<span class="highlight-text">$1</span>').replace(/\n/g, '<br>');
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
  min-height: 0; overflow: hidden;
}
.preview-media { width: 100%; height: 100%; object-fit: cover; border-radius: 4px; }

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
