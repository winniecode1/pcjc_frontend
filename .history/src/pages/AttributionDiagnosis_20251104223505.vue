<template>
  <div class="section">
    <div class="register" :style="{width: fullWidth+'px', height:fullHeight+'px'}"></div>
    <div class="img_box" :style="{width: fullWidth+'px'}"></div>

    <b-row class="justify-content-center pt-5">
      <b-col cols="10" class="text-center">
        <p class="newTitle text-center">归因诊断</p>
      </b-col>
    </b-row>
    
    <b-row v-if="loading || isRunning" class="justify-content-center mt-3">
        <b-col cols="10" class="text-center">
            <b-alert show variant="info" class="p-2">
                <strong v-if="isRunning">Pipeline 正在运行中...</strong>
                <strong v-else-if="loading">正在加载诊断结果...</strong>
                <span v-if="progress && progress.progress_percentage > 0"> (进度: {{ progress.progress_percentage.toFixed(2) }}%)</span>
                <b-spinner v-if="isRunning || loading" small class="ml-2"></b-spinner>
            </b-alert>
        </b-col>
    </b-row>
    
    <b-row class="justify-content-center pt-4 mb-4">
      <b-col cols="10" class="text-center" style="position: relative;">
        <div class="box-label">模块偏差测试结果 (结果汇总 & 先验知识)</div>
        <div class="module-grid-container p-3">

          <div 
            v-for="(module, index) in processedModules" 
            :key="index" 
            class="module-wrapper"
            @mouseover="showDetails(module)" 
            @mouseleave="hideDetails"
          >
            
            <div class="module-card p-3">
              <p class="module-title">{{ module.name }}</p>
              
              <div class="module-content">
                <div class="top-row">
                    <div class="summary-info">
                        <p class="text-left"><strong>输出 (预测):</strong> {{ module.outputSummary || 'N/A' }}</p>
                        <p class="text-left"><strong>阶段偏差值:</strong></p>
                    </div>
                    <div class="deviation-box">
                      <p>偏差值:</p>
                      <span class="deviation-value" :class="getDeviationClass(module.deviation)">
                        {{ typeof module.deviation === 'number' ? module.deviation.toFixed(4) : 'N/A' }}
                      </span>
                    </div>
                </div>

                <div class="bottom-row">
                    <div class="ground-truth-box">
                        <p>真值 (GT):</p>
                        <p class="truth-text">{{ module.groundTruthSummary || 'N/A' }}</p>
                    </div>
                </div>
              </div>
            </div>
          
            <div v-if="activeModule && activeModule.name === module.name" class="module-details-overlay p-4">
              <p class="module-detail-title">{{ activeModule.name }} - 详细信息</p>
              
              <div class="detail-section mt-4">
                <div class="detail-item">
                    <span class="detail-label">计算偏差值:</span>
                    <span class="deviation-value-large" :class="getDeviationClass(activeModule.deviation)">
                        {{ typeof activeModule.deviation === 'number' ? activeModule.deviation.toFixed(4) : 'N/A' }}
                    </span>
                </div>
              </div>

              <div class="detail-section">
                <div class="detail-item">
                    <span class="detail-label">预测输出 (Prediction):</span>
                    <p class="placeholder-text-small text-left">{{ activeModule.outputDetail || '数据缺失' }}</p>
                </div>
              </div>
              
              <div class="detail-section">
                <div class="detail-item">
                    <span class="detail-label">真值 (Ground Truth):</span>
                    <p class="placeholder-text-small text-left">{{ activeModule.groundTruthDetail || '数据缺失' }}</p>
                </div>
              </div>
              
            </div>
            
          </div>
          
        </div>
      </b-col>
    </b-row>

    <b-row class="justify-content-center mt-4 pb-5">
      
      <b-col cols="5" class="text-center mx-3" style="position: relative;">
        <div class="box-label">认知传播偏差测试结果</div>
        <div class="info-box p-3">
          <p class="text-left info-title">模块间认知传播偏差总览</p>
          <p class="text-left placeholder-text-small">
            {{ llm_analysisSummaryText || '等待 LLM 分析结果...' }}
          </p>
          <div class="mt-3 text-right">
            <strong class="mr-2">总偏差值 (LLM 分析):</strong> 
            <span class="deviation-value-bottom" :class="getDeviationClass(maxErrorDeviation)">
                {{ typeof maxErrorDeviation === 'number' ? maxErrorDeviation.toFixed(4) : 'N/A' }}
            </span>
          </div>
        </div>
      </b-col>

      <b-col cols="5" class="text-center mx-3" style="position: relative;">
        <div class="box-label">诊断结果</div>
        <div class="info-box p-3 diagnosis-result-container">
            
            <div class="diagnosis-card">
                <p class="diagnosis-value">{{ (globalAccuracy * 100).toFixed(1) }}%</p>
                <p class="diagnosis-label">准确率</p>
            </div>
            
            <div class="diagnosis-card">
                <p class="diagnosis-value">{{ (recallRate * 100).toFixed(1) }}%</p>
                <p class="diagnosis-label">不一致性根因召回率</p>
            </div>

            <div class="diagnosis-card diagnosis-module">
                <p class="diagnosis-value">{{ maxErrorModule || 'N/A' }}</p>
                <p class="diagnosis-label">偏差模块 (模块名称)</p>
            </div>

        </div>
      </b-col>
    </b-row>
    
    <b-row class="justify-content-center mt-4 pb-5">
        <b-col cols="10" class="text-center" style="position: relative;">
            <div class="box-label">原因分析 (LLM 深度分析)</div>
            <div class="analysis-grid-container info-box p-3">
                
                <div v-for="(reason, index) in llm_reasons" :key="index" class="analysis-card">
                    <p class="analysis-title">{{ reason.name }}</p>
                    <div class="analysis-content">
                        <p class="analysis-text placeholder-text-small">{{ reason.description }}</p>
                        <div class="analysis-deviation">
                            <strong class="mr-1">LLM 深度分析:</strong> 
                            <span :class="reason.description === 'N/A' ? 'low-deviation' : 'high-deviation'">{{ reason.description === 'N/A' ? '待分析' : '已完成' }}</span>
                        </div>
                    </div>
                </div>

            </div>
        </b-col>
    </b-row>
  </div>
</template>

<script>
import axios from 'axios'; 

// 模块名称映射，用于展示
const MODULE_NAMES = {
    'module1': '多模态目标检测',
    'module2': '多智能体协商',
    'module3': '认知传播偏差测试', 
    'module4': '决策选择',
};

export default {
  name: 'AttributionDiagnosis',
  data() {
    return {
      // 样式控制
      fullWidth: window.innerWidth,
      fullHeight: window.innerHeight,
      
      activeModule: null, 
      backendBaseURL: '/api/bias-analysis', // 后端 API 基址
      
      // API 状态 (必须在 data 中定义，以保持响应性)
      loading: true,
      isRunning: false,
      
      // 进度信息
      progress: {
        total_tasks: 0,
        completed_tasks: 0,
        progress_percentage: 0.0
      },
      
      // 模块数据 (原始 API 响应)
      rawModules: {},
      
      // LLM 分析数据 (原始 API 响应)
      rawLlmAnalysis: null,
      
      // 定时器
      statusInterval: null,
      
      // 诊断结果 (对应设计图底部)
      globalAccuracy: 0.0, 
      recallRate: 0.0, 
      maxErrorModule: 'N/A', 
    };
  },
  computed: {
    // ------------------------------------------------------------------
    // 模块偏差测试结果 (处理后的数据) - 必须在 computed 中定义
    // ------------------------------------------------------------------
    processedModules() {
        return Object.keys(this.rawModules).map(key => {
            const mod = this.rawModules[key];
            const name = MODULE_NAMES[key] || key;
            
            const stage = mod.single_task_stage || {};
            const prediction = stage.prediction || {};
            const groundTruth = stage.ground_truth || {};
            
            const analysis = mod.analysis_task || {};
            // 确保 deviation 是数字，否则设为 0
            const deviation = analysis.calculated_value === undefined || analysis.calculated_value === null 
                              ? 0 
                              : analysis.calculated_value;

            const outputSummary = this.summarizeData(prediction);
            const groundTruthSummary = this.summarizeData(groundTruth, true);
            const outputDetail = JSON.stringify(prediction, null, 2);
            const groundTruthDetail = JSON.stringify(groundTruth, null, 2);

            return {
                name,
                // 确保返回数值
                deviation: typeof deviation === 'number' ? deviation : 0, 
                outputSummary,
                groundTruthSummary,
                outputDetail,
                groundTruthDetail,
            };
        });
    },
    
    // ------------------------------------------------------------------
    // LLM 认知传播偏差测试结果 (总偏差值) - 必须在 computed 中定义
    // ------------------------------------------------------------------
    maxErrorDeviation() {
        // 确保返回一个数值，避免 undefined.toFixed() 错误
        const maxDev = this.rawLlmAnalysis?.max_error;
        return typeof maxDev === 'number' ? maxDev : 0.0;
    },
    
    // ------------------------------------------------------------------
    // LLM 认知传播偏差测试结果 (总览文本) - 必须在 computed 中定义
    // ------------------------------------------------------------------
    llm_analysisSummaryText() {
        if (!this.rawLlmAnalysis) return '等待 LLM 分析结果...';
        
        const maxDev = this.maxErrorDeviation; 
        
        let summary = `LLM 分析结果显示，最大偏差值 ${maxDev.toFixed(4)}。`;
        const reasons = [
            this.rawLlmAnalysis.reason1,
            this.rawLlmAnalysis.reason2,
            this.rawLlmAnalysis.reason3,
            this.rawLlmAnalysis.reason4,
        ].filter(r => r && r !== 'N/A');
        
        if (reasons.length > 0) {
            summary += ` 详细原因分布在 ${reasons.length} 个模块中，请查看下方的原因分析。`;
        } else {
            summary += ' 模块原因分析结果尚未返回。';
        }
        return summary;
    },
    
    // ------------------------------------------------------------------
    // LLM 原因分析 (四个模块)
    // ------------------------------------------------------------------
    llm_reasons() {
        if (!this.rawLlmAnalysis) {
             // 占位符
             return [1, 2, 3, 4].map(i => ({
                 name: MODULE_NAMES[`module${i}`] || `模块 ${i}`,
                 description: 'N/A',
             }));
        }
        
        return [
            { name: MODULE_NAMES.module1 || '模块 1', description: this.rawLlmAnalysis.reason1 || 'N/A' },
            { name: MODULE_NAMES.module2 || '模块 2', description: this.rawLlmAnalysis.reason2 || 'N/A' },
            { name: MODULE_NAMES.module3 || '模块 3', description: this.rawLlmAnalysis.reason3 || 'N/A' },
            { name: MODULE_NAMES.module4 || '模块 4', description: this.rawLlmAnalysis.reason4 || 'N/A' },
        ];
    },

    minHeightStyle() {
      return { minHeight: this.fullHeight + 'px' };
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    // 首次加载数据
    this.fetchStatus();
    // 启动定时器，每 5 秒查询一次状态
    this.statusInterval = setInterval(this.fetchStatus, 5000);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    // 清除定时器
    if (this.statusInterval) {
        clearInterval(this.statusInterval);
    }
  },
  methods: {
    handleResize() {
      this.fullWidth = window.innerWidth;
      this.fullHeight = window.innerHeight;
    },
    
    // 简化数据展示 (用于卡片总结)
    summarizeData(data, isGroundTruth = false) {
        if (!data || typeof data !== 'object') return 'N/A';
        
        // 提取前两个属性名和值进行总结
        const keys = Object.keys(data);
        if (keys.length === 0) return isGroundTruth ? '无真值' : '无输出';

        let summary = '';
        for (let i = 0; i < Math.min(keys.length, 2); i++) {
            const key = keys[i];
            let value = data[key];
            if (typeof value === 'number') {
                value = value.toFixed(2);
            } else if (typeof value === 'object' && value !== null) {
                value = '对象...';
            }
            summary += `${key}: ${value}` + (i === 0 && keys.length > 1 ? ', ' : '');
        }
        if (keys.length > 2) summary += '...';
        
        return summary || (isGroundTruth ? '无真值' : '无输出');
    },
    
    // 异步获取 Pipeline 状态和结果
    async fetchStatus() {
        try {
            const url = `${this.backendBaseURL}/status`;
            const response = await axios.get(url);
            const data = response.data;
            
            this.loading = false;
            this.isRunning = data.running;
            this.progress = data.progress || this.progress;
            
            // 更新模块数据
            this.rawModules = data.modules || {};
            
            // 更新 LLM 分析数据
            this.rawLlmAnalysis = data.llm_analysis || this.rawLlmAnalysis;

            // 根据后端数据更新诊断结果
            if (!this.isRunning && data.success) {
                this.fetchAnalysisMetrics();
            }
            
            // 如果 Pipeline 运行完成且成功，可以停止定时器
            if (!this.isRunning && data.success) {
                 clearInterval(this.statusInterval);
                 this.statusInterval = null;
            }

        } catch (error) {
            console.error("获取归因诊断状态失败:", error);
            this.loading = false;
            this.isRunning = false;
        }
    },
    
    // 获取全局指标 (准确率、召回率等)
    async fetchAnalysisMetrics() {
        try {
            // 假设 /api/analyze-with-llm 包含最终的准确率和召回率
            const response = await axios.get('/api/analyze-with-llm');
            const data = response.data.data;
            
            if (data) {
                this.globalAccuracy = data.precision || 0.0; 
                this.recallRate = data.recall || 0.0; 
                
                // 确定最大偏差模块
                let maxKey = null;
                let maxVal = -1;
                
                this.processedModules.forEach(mod => {
                    if (mod.deviation > maxVal) {
                        maxVal = mod.deviation;
                        maxKey = mod.name;
                    }
                });
                // 只有当最大偏差大于0时才显示模块名称
                this.maxErrorModule = maxVal > 0 ? maxKey : 'N/A';
            }
        } catch (error) {
            console.error("获取分析指标失败:", error);
        }
    },
    
    // 根据偏差值返回颜色等级
    getDeviationClass(deviation) {
      if (typeof deviation !== 'number' || isNaN(deviation)) return 'low-deviation'; 
      if (deviation >= 0.3) return 'high-deviation';
      if (deviation >= 0.15) return 'medium-deviation';
      return 'low-deviation';
    },
    
    // 鼠标悬停显示详情
    showDetails(module) {
      this.activeModule = module;
    },
    // 鼠标离开隐藏详情
    hideDetails() {
      this.activeModule = null;
    },
  }
};
</script>

<style lang="scss" scoped>
  /* ------------------- 基础样式 (沿用 DecisionMaking.vue) ------------------- */
  .section {
    background-color: #EAF4FE;
    color: black;
    font-size: 100%;
    width: 100%;
    min-height: 100vh;
    font-family: "Helvetica Neue";
    z-index: 2;
  }

  .newTitle {
    font-size: calc(2vw + 1rem);
    color: #2168BE;
    font-weight: bolder;
    letter-spacing: 0.1em;
  }

  .register {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
  }
  .img_box {
      position: absolute;
      // ⚠️ 实际应用中请替换为您的背景图片路径
      background-image: url('../assets/images/newBackGound.png'); 
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center center;
      width: 100%;
      height: 100%;
      opacity: 0.8;
  }

  .box-label {
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #EAF4FE;
    padding: 0 10px;
    color: red;
    font-size: 14px;
    font-weight: bold;
    z-index: 10;
  }
  
  .placeholder-text-small {
    color: #333;
    font-size: 0.9rem;
    min-height: 20px;
    white-space: pre-wrap; /* 保持 JSON 格式化后的换行 */
  }
  
  /* ------------------- 归因诊断模块特有样式 ------------------- */
  
  /* 结果汇总区域 (模块偏差测试结果) - GRID 布局 */
  .module-grid-container {
    min-height: 300px;
    border: 2px solid #ccc;
    background-color: #fff;
    margin-top: 10px;
    position: relative;
    
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* 两列 */
    grid-template-rows: repeat(2, 1fr);    /* 两行 */
    gap: 15px; /* 模块间距 */
  }

  /* 模块包裹层 - 必须是相对定位，以便浮窗能绝对定位在它内部 */
  .module-wrapper {
      position: relative;
      overflow: hidden; 
      padding: 10px; 
      height: 100%;
      min-height: 280px;
  }

  /* 单个模块卡片 */
  .module-card {
    height: 100%;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: box-shadow 0.3s;
    cursor: pointer;
    position: relative;
    
    display: flex;
    flex-direction: column;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }

  .module-title {
    font-size: 1.2rem;
    font-weight: bold;
    color: #2168BE;
    border-bottom: 2px solid #eee;
    padding-bottom: 5px;
    margin-bottom: 5px;
    text-align: center;
  }

  .module-content {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between; 
  }

  .top-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0 5px;
  }
  
  .deviation-box {
    text-align: right;
    padding-left: 10px;
    
    p {
        margin: 0;
        font-size: 0.9rem;
        color: #666;
    }
  }

  .summary-info {
      font-size: 0.85rem;
      flex-grow: 1;
      padding-right: 10px;
      
      p {
          margin: 1px 0;
          line-height: 1.2;
      }
  }

  .bottom-row {
    display: flex;
    justify-content: flex-end; 
    padding: 5px;
    border-top: 1px solid #eee;
  }

  .ground-truth-box {
      text-align: right;
      font-size: 0.9rem;
      
      p {
          margin: 0;
      }
      .truth-text {
          font-weight: bold;
          color: #28a745; 
      }
  }

  /* ------------------- 底部信息区域 ------------------- */
  .info-box {
    min-height: 180px; 
    border: 2px solid #ccc;
    background-color: #fff;
    position: relative;
    margin-top: 10px;
    text-align: left;
  }

  .info-title {
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
      border-bottom: 1px dashed #eee;
      padding-bottom: 5px;
  }

  /* 原因分析 (LLM 深度分析) - GRID 布局 */
  .analysis-grid-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 10px;
  }

  .analysis-card {
    border: 1px solid #e0e0e0;
    padding: 8px;
    border-radius: 4px;
    background-color: #fbfbfb;
  }

  .analysis-title {
    font-size: 1rem;
    font-weight: bold;
    color: #495057;
    margin-bottom: 5px;
    border-bottom: 1px dotted #ccc;
    padding-bottom: 3px;
  }

  .analysis-deviation {
    text-align: right;
    font-size: 0.9rem;
    margin-top: 5px;
    
    span {
        font-weight: bold;
    }
  }
  
  /* 诊断结果区域 - GRID 布局 - 严格匹配设计图底部的三项指标 */
  .diagnosis-result-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr); /* 三列 */
    gap: 10px;
    min-height: 180px;
    text-align: center;
    align-items: center; /* 垂直居中 */
    justify-content: center;
  }

  .diagnosis-card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 15px 5px;
    border: 2px solid #2168BE;
    border-radius: 8px;
    background-color: #f0f8ff;
    
    .diagnosis-value {
        font-size: 2.5rem;
        font-weight: bolder;
        color: #dc3545; /* 红色突出数字 */
        margin-bottom: 0;
    }
    .diagnosis-label {
        font-size: 1rem;
        font-weight: bold;
        color: #2168BE;
    }
  }

  .diagnosis-module .diagnosis-value {
      font-size: 1.5rem; /* 模块名称字号小一点 */
      color: #333;
      margin-top: 5px;
  }

  /* ------------------- 偏差值显示 ------------------- */
  .deviation-value {
    font-weight: bold;
    font-size: 1.2rem;
    padding: 2px 5px;
    border-radius: 4px;
    display: inline-block;
    
    &-large {
      font-weight: bolder;
      font-size: 1.8rem;
      padding: 2px 5px;
      border-radius: 4px;
      display: inline-block;
    }

    &-bottom {
        font-weight: bold;
        font-size: 1.2rem;
        padding: 2px 5px;
        border-radius: 4px;
        display: inline-block;
    }
  }

  /* 偏差等级颜色 */
  .low-deviation {
    color: #28a745; // 绿色 (低偏差)
    background-color: #e6ffe6;
  }
  .medium-deviation {
    color: #ffc107; // 黄色 (中偏差)
    background-color: #fffbe6;
  }
  .high-deviation {
    color: #dc3545; // 红色 (高偏差)
    background-color: #ffe6e6;
  }
  
  /* ------------------- 悬停详情浮窗 (Overlay) ------------------- */
  .module-details-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.98); 
    border: 4px solid #2168BE;
    border-radius: 12px;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4); 
    z-index: 1000; 
    text-align: left;
    overflow-y: auto;
    
    .module-detail-title {
        font-size: 1.6rem;
        font-weight: bold;
        color: #2168BE;
        text-align: center;
        border-bottom: 2px solid #ddd;
        padding-bottom: 10px;
        margin-bottom: 10px;
    }
    
    .detail-section {
        margin-top: 10px;
        padding: 5px 0;
    }
    
    .detail-item {
        display: flex;
        flex-direction: column;
        margin-bottom: 10px;
        
        .detail-label {
            font-weight: bold;
            color: #333;
            font-size: 1rem;
            margin-bottom: 3px;
            border-left: 4px solid #dc3545;
            padding-left: 8px;
        }
    }
  }
</style>