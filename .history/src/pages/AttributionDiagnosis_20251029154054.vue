<template>
  <div class="section">
    <!-- 背景元素 -->
    <div class="register" :style="{width: fullWidth+'px', height:fullHeight+'px'}"></div>
    <div class="img_box" :style="{width: fullWidth+'px'}"></div>

    <!-- 1. 标题区域 -->
    <b-row class="justify-content-center pt-5">
      <b-col cols="10" class="text-center">
        <p class="newTitle text-center">归因诊断</p>
      </b-col>
    </b-row>

    <!-- 2. 结果汇总区域 (模块偏差测试结果) -->
    <b-row class="justify-content-center pt-4 mb-4">
      <b-col cols="10" class="text-center">
        <div class="box-label">模块偏差测试结果</div>
        <b-row class="module-container p-3">
          
          <!-- 模块 1 - 4 循环展示 -->
          <b-col v-for="(module, index) in modules" :key="index" cols="3" class="px-3">
            <div class="module-card p-3" @mouseover="showDetails(module)" @mouseleave="hideDetails">
              <p class="module-title">{{ module.name }}</p>
              <div class="module-content">
                <p><strong>偏差值:</strong> <span class="deviation-value" :class="getDeviationClass(module.deviation)">{{ module.deviation }}</span></p>
                <div class="text-info-box">
                  <p class="text-left"><strong>输入:</strong> {{ module.inputSummary }}</p>
                  <p class="text-left"><strong>输出:</strong> {{ module.outputSummary }}</p>
                </div>
              </div>
            </div>
          </b-col>
          
          <!-- Hover 详细信息浮窗 (用于模拟放大效果) -->
          <!-- 移除 is-flashing class -->
          <div v-if="activeModule" class="module-details-overlay p-4">
            <p class="module-title">{{ activeModule.name }} - 详细诊断</p>
            <p class="text-left mb-2"><strong>偏差值:</strong> <span class="deviation-value-large" :class="getDeviationClass(activeModule.deviation)">{{ activeModule.deviation }}</span></p>
            
            <div class="detail-section">
              <h6>真值显示 (Ground Truth)</h6>
              <p class="placeholder-text-small text-left">{{ activeModule.groundTruth }}</p>
              <!-- 预留接口：/api/attribution/truth -->
            </div>

            <div class="detail-section">
              <h6>输入详情 (Input Details)</h6>
              <p class="placeholder-text-small text-left">{{ activeModule.inputDetail }}</p>
              <!-- 预留接口：/api/attribution/input -->
            </div>
            
            <div class="detail-section">
              <h6>输出详情 (Output Details)</h6>
              <p class="placeholder-text-small text-left">{{ activeModule.outputDetail }}</p>
              <!-- 预留接口：/api/attribution/output -->
            </div>
            
          </div>
          
        </b-row>
      </b-col>
    </b-row>

    <!-- 3. 底部信息区域 (认知传播偏差测试 / 原因分析) -->
    <b-row class="justify-content-center mt-4 pb-5">
      
      <!-- 左侧：认知传播偏差测试结果 -->
      <b-col cols="5" class="text-center mx-3">
        <div class="box-label">认知传播偏差测试结果</div>
        <div class="info-box p-3">
          <p class="text-left placeholder-text-small">
            {{ cognitiveBiasText }}
          </p>
          <p class="mt-3 text-right">
            <strong>偏差值:</strong> 
            <span class="deviation-value" :class="getDeviationClass(cognitiveDeviation)">{{ cognitiveDeviation }}</span>
          </p>
        </div>
        <!-- 预留接口：/api/attribution/cognitive -->
      </b-col>

      <!-- 右侧：原因分析 -->
      <b-col cols="5" class="text-center mx-3">
        <div class="box-label">原因分析</div>
        <div class="info-box p-3">
          <p class="text-left placeholder-text-small">
            {{ causeAnalysisText }}
          </p>
          <div class="mt-3 text-right">
            <strong>偏差值:</strong> 
            <span class="deviation-value" :class="getDeviationClass(analysisDeviation)">{{ analysisDeviation }}</span>
          </div>
        </div>
        <!-- 预留接口：/api/attribution/analysis -->
      </b-col>
    </b-row>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AttributionDiagnosis',
  data() {
    const backendBaseURL = '/api/attribution'; // 预留归因诊断的后端接口
    
    return {
      // Background adaptive data
      fullWidth: window.innerWidth,
      fullHeight: window.innerHeight,
      
      activeModule: null, // 当前鼠标悬停的模块
      
      // ------------------------------------------------------------------
      // ⚠️ 模拟数据 (写死) - 模块偏差测试结果
      // ------------------------------------------------------------------
      modules: [
        {
          name: '模块 1 (目标检测)',
          deviation: 0.15,
          inputSummary: '视频帧图像数据',
          outputSummary: '目标边界框 [x, y, w, h]',
          groundTruth: '真值：目标的实际位置在 [120, 300, 450, 700]，与输出一致。',
          inputDetail: '输入是高清视频流，当前帧ID 150。',
          outputDetail: '模型输出了船只的边界框，置信度 98%。偏差主要来自目标遮挡瞬间的抖动。',
        },
        {
          name: '模块 2 (行为理解)',
          deviation: 0.22,
          inputSummary: '目标边界框 + 帧序列',
          outputSummary: '行为描述 (如：快速转向)',
          groundTruth: '真值：目标进行了快速转向动作，模型正确识别。',
          inputDetail: '输入是模块1的检测结果和过去10帧的图像。',
          outputDetail: '行为理解偏差主要集中在对“加速”的判断上，模型判断为中速，但实际为高速。',
        },
        {
          name: '模块 3 (意图预测)',
          deviation: 0.08,
          inputSummary: '行为描述 + 环境态势',
          outputSummary: '威胁意图等级 (如：中等)',
          groundTruth: '真值：威胁意图被评估为高等级。',
          inputDetail: '输入包含了天气、海况、目标历史行为等元数据。',
          outputDetail: '意图预测偏差极小，显示模型在本阶段表现良好，对环境信息利用充分。',
        },
        {
          name: '模块 4 (决策选择)',
          deviation: 0.35,
          inputSummary: '意图等级 + 危险级别',
          outputSummary: '建议行动 (如：执行拦截)',
          groundTruth: '真值：建议行动为“执行拦截”。',
          inputDetail: '输入为最终的危险等级 4 (高度戒备)。',
          outputDetail: '决策选择偏差较大，主要是因为模型在处理高偏差输入时，倾向于保守决策，但最终决策与真值一致。',
        },
      ],
      
      // ------------------------------------------------------------------
      // ⚠️ 模拟数据 (写死) - 底部区域
      // ------------------------------------------------------------------
      cognitiveDeviation: 0.18,
      cognitiveBiasText: '认知传播偏差测试结果显示，由于模块间信息传递损耗（特别是模块1到模块2），导致部分关键特征丢失。偏差主要集中在对目标的整体速度评估上，传播效率为82%。',
      
      analysisDeviation: 0.10,
      causeAnalysisText: '对四个模块的偏差进行归因分析，确定模块2（行为理解）是最大的偏差来源（22%），其次是模块4（决策选择）的保守性。建议重点优化模块2的特征提取和模块4的风险评估权重。',
    };
  },
  computed: {
    // Determine if the full layout height is needed
    minHeightStyle() {
      return { minHeight: this.fullHeight + 'px' };
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    // ⚠️ 实际应用中，这里应调用后端 API 获取初始数据:
    // this.fetchInitialData();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    handleResize() {
      this.fullWidth = window.innerWidth;
      this.fullHeight = window.innerHeight;
    },
    // 根据偏差值返回颜色等级
    getDeviationClass(deviation) {
      if (deviation >= 0.3) return 'high-deviation';
      if (deviation >= 0.15) return 'medium-deviation';
      return 'low-deviation';
    },
    // 鼠标悬停显示详情
    showDetails(module) {
      this.activeModule = module;
      // ⚠️ 实际应用中，这里可以调用后端接口获取 full detail:
      // this.fetchModuleDetails(module.name);
    },
    // 鼠标离开隐藏详情
    hideDetails() {
      this.activeModule = null;
    },
    
    // 预留的后端调用函数
    async fetchInitialData() {
      console.log("调用归因诊断模块的初始数据接口...");
      // ⚠️ 实际代码中，这里将调用后端的诊断数据接口
      /*
      try {
        const response = await axios.get(`${this.backendBaseURL}/all_diagnostics`);
        const data = response.data;
        this.modules = data.modules;
        this.cognitiveDeviation = data.cognitive.deviation;
        this.cognitiveBiasText = data.cognitive.text;
        this.analysisDeviation = data.analysis.deviation;
        this.causeAnalysisText = data.analysis.text;
      } catch (error) {
        console.error("归因诊断数据请求失败:", error);
      }
      */
    }
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
    white-space: pre-wrap;
  }
  
  /* ------------------- 归因诊断模块特有样式 ------------------- */
  
  /* 模块容器 */
  .module-container {
    min-height: 300px;
    border: 2px solid #ccc;
    background-color: #fff;
    margin-top: 10px;
    position: relative;
    display: flex; /* Ensure inner row works with flex */
  }

  /* 单个模块卡片 */
  .module-card {
    height: 260px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s, box-shadow 0.3s;
    cursor: pointer;
    position: relative;
    overflow: hidden;

    &:hover {
      transform: scale(1.02);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }

  .module-title {
    font-size: 1.2rem;
    font-weight: bold;
    color: #2168BE;
    border-bottom: 2px solid #eee;
    padding-bottom: 5px;
  }

  .module-content {
      text-align: center;
  }

  .text-info-box {
      background-color: #eee;
      padding: 5px;
      border-radius: 4px;
      margin-top: 10px;
      font-size: 0.85rem;
  }

  /* 底部信息框 */
  .info-box {
    min-height: 150px;
    border: 2px solid #ccc;
    background-color: #fff;
    position: relative;
    margin-top: 10px;
    text-align: left;
  }

  /* 偏差值显示 */
  .deviation-value {
    font-weight: bold;
    font-size: 1.1rem;
    padding: 2px 5px;
    border-radius: 4px;
    
    &-large {
      font-weight: bold;
      font-size: 1.5rem;
      padding: 2px 5px;
      border-radius: 4px;
    }
  }

  /* 偏差等级颜色 */
  .low-deviation {
    color: #28a745; // 绿色
    background-color: #e6ffe6;
  }
  .medium-deviation {
    color: #ffc107; // 黄色
    background-color: #fffbe6;
  }
  .high-deviation {
    color: #dc3545; // 红色
    background-color: #ffe6e6;
  }
  
  /* 悬停详情浮窗 (模拟放大效果) */
  .module-details-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.95);
    border: 4px solid #2168BE;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    z-index: 100;
    text-align: center;
    overflow-y: auto;
    
    .module-title {
        font-size: 1.5rem;
        color: #dc3545;
    }
    
    .detail-section {
        margin-top: 15px;
        border-top: 1px dashed #ddd;
        padding-top: 10px;
        
        h6 {
            color: #495057;
            font-weight: bold;
            text-align: left;
        }
    }
  }
  
  /* ------------------- 移除的闪烁动画代码 ------------------- */
  /*
  @keyframes flash-border {
    0% { border-color: #2168BE; }
    50% { border-color: #dc3545; }
    100% { border-color: #2168BE; }
  }
  .is-flashing {
      animation: flash-border 1.5s infinite alternate;
  }
  */
</style>
