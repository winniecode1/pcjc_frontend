<!-- <template>
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

    <!-- 2. 模块偏差测试结果 (结果汇总) -->
    <b-row class="justify-content-center pt-4 mb-4">
      <b-col cols="10" class="text-center">
        <div class="box-label">模块偏差测试结果</div>
        <!-- 使用 grid 布局确保两行两列，每行两个 -->
        <div class="module-grid-container p-3">

          <!-- 模块 1 - 4 循环展示 -->
          <div 
            v-for="(module, index) in modules" 
            :key="index" 
            class="module-wrapper"
            @mouseover="showDetails(module)" 
            @mouseleave="hideDetails"
          >
            
            <div class="module-card p-3">
              <p class="module-title">{{ module.name }}</p>
              
              <div class="module-content">
                <div class="top-row">
                    <!-- 左上角：输入/输出 -->
                    <div class="summary-info">
                        <p class="text-left"><strong>输入:</strong> {{ module.inputSummary }}</p>
                        <p class="text-left"><strong>输出:</strong> {{ module.outputSummary }}</p>
                    </div>
                    <!-- 右上角：偏差值 -->
                    <div class="deviation-box">
                      <p>偏差值:</p>
                      <span class="deviation-value" :class="getDeviationClass(module.deviation)">{{ module.deviation.toFixed(2) }}</span>
                    </div>
                </div>

                <div class="bottom-row">
                    <!-- 右下角：真值显示 (固定在右下角) -->
                    <div class="ground-truth-box">
                        <p>真值显示:</p>
                        <p class="truth-text">{{ module.groundTruthSummary }}</p>
                    </div>
                </div>
              </div>
            </div>
          
            <!-- Hover 详细信息浮窗 (只有当 activeModule 匹配当前 module 时才显示) -->
            <div v-if="activeModule && activeModule.name === module.name" class="module-details-overlay p-4">
              <p class="module-detail-title">{{ activeModule.name }}</p>
              
              <div class="detail-section mt-4">
                <div class="detail-item">
                    <span class="detail-label">偏差值:</span>
                    <span class="deviation-value-large" :class="getDeviationClass(activeModule.deviation)">{{ activeModule.deviation.toFixed(2) }}</span>
                </div>
              </div>

              <div class="detail-section">
                <div class="detail-item">
                    <span class="detail-label">输入:</span>
                    <p class="placeholder-text-small text-left">{{ activeModule.inputDetail }}</p>
                </div>
              </div>
              
              <div class="detail-section">
                <div class="detail-item">
                    <span class="detail-label">输出:</span>
                    <p class="placeholder-text-small text-left">{{ activeModule.outputDetail }}</p>
                </div>
              </div>
              
              <div class="detail-section">
                <div class="detail-item">
                    <span class="detail-label">真值显示:</span>
                    <p class="placeholder-text-small text-left">{{ activeModule.groundTruthDetail }}</p>
                </div>
              </div>
              
            </div>
            
          </div>
          
        </div>
      </b-col>
    </b-row>

    <!-- 3. 底部信息区域 -->
    <b-row class="justify-content-center mt-4 pb-5">
      
      <!-- 左侧：认知传播偏差测试结果 (占据一半宽度) -->
      <b-col cols="5" class="text-center mx-3">
        <div class="box-label">认知传播偏差测试结果</div>
        <div class="info-box p-3">
          <p class="text-left info-title">模块间认知传播偏差总览</p>
          <p class="text-left placeholder-text-small">
            {{ cognitiveBiasText }}
          </p>
          <div class="mt-3 text-right">
            <strong class="mr-2">总偏差值:</strong> 
            <span class="deviation-value-bottom" :class="getDeviationClass(cognitiveDeviation)">{{ cognitiveDeviation.toFixed(2) }}</span>
          </div>
        </div>
        <!-- 预留接口：/api/attribution/cognitive -->
      </b-col>

      <!-- 右侧：原因分析 (占据一半宽度，内部 grid 两行两列) -->
      <b-col cols="5" class="text-center mx-3">
        <div class="box-label">原因分析</div>
        <div class="analysis-grid-container info-box p-3">
            
            <!-- 模块原因分析 1 - 4 循环展示 (两行两列) -->
            <div v-for="(analysis, index) in causeAnalysisModules" :key="index" class="analysis-card">
                <p class="analysis-title">{{ analysis.name }}</p>
                <div class="analysis-content">
                    <p class="analysis-text placeholder-text-small">{{ analysis.description }}</p>
                    <div class="analysis-deviation">
                        <strong class="mr-1">贡献度:</strong> 
                        <span :class="getDeviationClass(analysis.contribution)">{{ analysis.contribution.toFixed(2) }}</span>
                    </div>
                </div>
            </div>

        </div>
        <!-- 预留接口：/api/attribution/analysis -->
      </b-col>
    </b-row>
  </div>
</template>

<script>
// ⚠️ 实际应用中请使用 import axios from 'axios';
// 这里为了示例完整性，暂时不需要引入外部库

export default {
  name: 'AttributionDiagnosis',
  data() {
    const backendBaseURL = '/api/attribution'; // 归因诊断的后端接口基址
    
    return {
      // 样式控制
      fullWidth: window.innerWidth,
      fullHeight: window.innerHeight,
      
      activeModule: null, // 当前鼠标悬停的模块
      backendBaseURL: backendBaseURL, // 暴露后端接口基址供参考
      
      // ------------------------------------------------------------------
      // ⚠️ 模拟数据 (写死) - 模块偏差测试结果 (结果汇总)
      // ------------------------------------------------------------------
      modules: [
        {
          name: '模块 1 (目标检测)',
          deviation: 0.15,
          inputSummary: '视频帧图像数据',
          outputSummary: '目标边界框 [x, y, w, h]',
          groundTruthSummary: '船只位于中心区域', // 卡片右下角显示的简略真值
          inputDetail: '输入是高清视频流，当前帧ID 150，分辨率 1920x1080。',
          outputDetail: '模型输出了船只的边界框 [200, 350, 600, 900]，置信度 98%。',
          groundTruthDetail: '真值：目标的实际位置在 [205, 360, 590, 890]，重叠度 IoU 0.95。', // 浮窗显示的详细真值
          api_truth: `${backendBaseURL}/truth/module1`,
          api_input: `${backendBaseURL}/input/module1`,
          api_output: `${backendBaseURL}/output/module1`,
        },
        {
          name: '模块 2 (行为理解)',
          deviation: 0.22,
          inputSummary: '边界框 + 帧序列',
          outputSummary: '行为描述 (如：快速转向)',
          groundTruthSummary: '识别到快速转向动作',
          inputDetail: '输入是模块1的检测结果和过去10帧的图像特征序列。',
          outputDetail: '行为理解结果为“快速转向且加速”，置信度 85%。',
          groundTruthDetail: '真值：目标进行了快速转向动作，但速度保持不变，模型对“加速”的判断有误。',
          api_truth: `${backendBaseURL}/truth/module2`,
          api_input: `${backendBaseURL}/input/module2`,
          api_output: `${backendBaseURL}/output/module2`,
        },
        {
          name: '模块 3 (意图预测)',
          deviation: 0.08,
          inputSummary: '行为描述 + 环境态势',
          outputSummary: '威胁意图等级 (高)',
          groundTruthSummary: '威胁等级为高',
          inputDetail: '输入包含了天气（晴朗）、海况（平静）、目标历史行为（转向）等元数据。',
          outputDetail: '意图预测结果为“威胁意图：高等级，92%”。',
          groundTruthDetail: '真值：威胁意图被评估为高等级，模型完全一致。',
          api_truth: `${backendBaseURL}/truth/module3`,
          api_input: `${backendBaseURL}/input/module3`,
          api_output: `${backendBaseURL}/output/module3`,
        },
        {
          name: '模块 4 (决策选择)',
          deviation: 0.35,
          inputSummary: '意图等级 + 危险级别',
          outputSummary: '建议行动 (执行拦截)',
          groundTruthSummary: '建议执行拦截',
          inputDetail: '输入为最终的危险等级 4 (高度戒备) 和拦截预案列表。',
          outputDetail: '决策选择结果为“建议行动：执行拦截”。',
          groundTruthDetail: '真值：建议行动为“执行拦截”。偏差大是因为模型在中间环节对高偏差输入倾向于保守，但最终决策正确。',
          api_truth: `${backendBaseURL}/truth/module4`,
          api_input: `${backendBaseURL}/input/module4`,
          api_output: `${backendBaseURL}/output/module4`,
        },
      ],
      
      // ------------------------------------------------------------------
      // ⚠️ 模拟数据 (写死) - 底部区域
      // ------------------------------------------------------------------
      
      // 认知传播偏差测试结果
      cognitiveDeviation: 0.18,
      cognitiveBiasText: '认知传播偏差测试结果显示，由于模块间信息传递损耗（特别是模块1到模块2），导致部分关键特征丢失。偏差主要集中在对目标的整体速度评估上，传播效率为82%。这表明数据在模块边界处未能保持完整性和语义一致性。',
      api_cognitive: `${backendBaseURL}/cognitive_bias`,

      // 原因分析 (四个模块的原因)
      causeAnalysisModules: [
        {
          name: '模块 1 原因',
          contribution: 0.15,
          description: '目标检测阶段在目标边缘模糊或有轻微遮挡时，边界框产生微小抖动，这是主要偏差来源。'
        },
        {
          name: '模块 2 原因',
          contribution: 0.45, // 贡献度最高
          description: '行为理解模块对“加速”和“匀速”的区分阈值过于敏感，导致对速度判断偏差最大，是系统偏差的关键源头。'
        },
        {
          name: '模块 3 原因',
          contribution: 0.10,
          description: '意图预测模块偏差极低，显示其对行为输入具有较强的鲁棒性，环境态势信息处理准确。'
        },
        {
          name: '模块 4 原因',
          contribution: 0.30,
          description: '决策选择模块在接收到偏差较大的行为输入时，决策权重分配过于保守，虽然最终决策正确，但过程不确定性高。'
        },
      ],
      api_analysis: `${backendBaseURL}/cause_analysis`,
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
    
    // 预留的后端调用函数 (保持可修改性)
    async fetchInitialData() {
      console.log("调用归因诊断模块的初始数据接口...");
      // 示例: 调用总诊断数据接口
      /*
      try {
        const response = await axios.get(`${this.backendBaseURL}/all_diagnostics`);
        const data = response.data;
        this.modules = data.modules;
        this.cognitiveDeviation = data.cognitive.deviation;
        this.cognitiveBiasText = data.cognitive.text;
        this.causeAnalysisModules = data.analysis.modules; // 假设后端返回结构是四个模块的分析
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
    white-space: pre-wrap;
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
      overflow: hidden; /* 隐藏卡片内部可能溢出的内容 */
      padding: 10px; /* 增加内边距以美化 grid 间隙 */
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
    
    // 布局容器
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
      justify-content: space-between; /* 确保上下两行分离 */
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
    justify-content: flex-end; /* 真值靠右下角 */
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
          color: #28a745; /* 绿色表示真值 */
      }
  }

  /* ------------------- 原因分析区域 (两行两列) ------------------- */
  .info-box {
    min-height: 180px; /* 增加最小高度 */
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
    // 覆盖整个父容器 module-wrapper
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.98); // 调高不透明度，确保清晰
    border: 4px solid #2168BE;
    border-radius: 12px;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4); // 增加阴影，突出浮窗
    z-index: 1000; // 确保在最上层
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
</style> -->
