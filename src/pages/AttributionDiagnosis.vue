<template>
  <div class="section" :style="{ minHeight: fullHeight + 'px' }">
    <!-- 背景层 -->
    <div class="register" :style="{width: fullWidth+'px', height:fullHeight+'px'}"></div>
    <div class="img_box" :style="{width: fullWidth+'px'}"></div>

    <!-- 标题 -->
    <b-row class="justify-content-center pt-5">
      <b-col cols="10" class="text-center">
        <p class="newTitle text-center">归因诊断</p>
      </b-col>
    </b-row>
    
    <!-- 加载/错误提示 -->
    <b-row v-if="showAlert" class="justify-content-center mt-3">
      <b-col cols="10">
        <b-alert :variant="alertVariant" show dismissible @dismissed="showAlert=false">
          {{ alertMessage }}
        </b-alert>
      </b-col>
    </b-row>

    <!-- 结果汇总区域 -->
    <b-row class="justify-content-center pt-4 mb-4">
      <b-col cols="10" style="position: relative;">
        <div class="box-label">结果汇总</div>
        
        <div class="results-summary-container p-3">
          
          <!-- 第一行：多模态目标检测 + 先验知识 -->
          <b-row>
            <!-- 多模态目标检测（模块一） -->
            <b-col cols="6" class="pr-2">
              <div class="module-box">
                <p class="module-title">多模态目标检测（模块一）</p>
                
                <!-- 输出和真值 -->
                <div class="sub-box">
                  <div class="deviation-header">偏差值: {{ formatPercent(module1SingleTaskBias) }}</div>
                  <div class="sub-box-content">
                    <div class="output-section">
                      <p class="output-label"><strong>输出:</strong></p>
                      <p class="text-output" :title="module1Output">{{ truncateText(module1Output, 150) }}</p>
                    </div>
                    <div class="truth-section mt-2">
                      <p class="output-label"><strong>真值:</strong></p>
                      <p class="text-output" :title="module1GroundTruth">{{ truncateText(module1GroundTruth, 150) }}</p>
                    </div>
                  </div>
                </div>
                
                <!-- 认知传播偏差测试结果 -->
                <div class="sub-box mt-2">
                  <div class="sub-box-title">认知传播偏差测试结果</div>
                  <div class="deviation-header">偏差值: {{ formatPercent(module1PropagationBias) }}</div>
                  <div class="sub-box-content d-flex flex-column">
                    <div class="stage-output mb-2">
                      <p class="stage-label"><strong>阶段二输出:</strong></p>
                      <pre class="code-block">{{ formatDict(module1Stage2Output) }}</pre>
                    </div>
                    <div class="stage-output mb-2">
                      <p class="stage-label"><strong>阶段三输出:</strong></p>
                      <p class="stage-result">{{ module1Stage3Output }}</p>
                    </div>
                    <div class="stage-output">
                      <p class="stage-label"><strong>阶段四输出:</strong></p>
                      <p class="stage-result">{{ module1Stage4Output }}</p>
                    </div>
                  </div>
                </div>
                
              </div>
            </b-col>
            
            <!-- 先验知识（模块二） -->
            <b-col cols="6" class="pl-2">
              <div class="module-box">
                <p class="module-title">先验知识（模块二）</p>
                
                <!-- 输出和真值 -->
                <div class="sub-box">
                  <div class="deviation-header">偏差值: {{ formatPercent(module2SingleTaskBias) }}</div>
                  <div class="sub-box-content d-flex justify-content-around">
                    <div class="dict-display">
                      <p class="output-label"><strong>输出</strong></p>
                      <pre class="code-block-small">{{ formatDict(module2Output) }}</pre>
                    </div>
                    <div class="dict-display">
                      <p class="output-label"><strong>真值</strong></p>
                      <pre class="code-block-small">{{ formatDict(module2GroundTruth) }}</pre>
                    </div>
                  </div>
                </div>
                
                <!-- 模块偏差测试结果 -->
                <div class="sub-box mt-2">
                  <div class="sub-box-title">模块偏差测试结果</div>
                  <div class="deviation-header">偏差值: {{ formatPercent(module2ModuleBias) }}</div>
                  <div class="sub-box-content d-flex justify-content-around">
                    <div class="dict-display">
                      <p class="output-label"><strong>输出</strong></p>
                      <pre class="code-block-small">{{ formatDict(module2ModuleOutput) }}</pre>
                    </div>
                    <div class="dict-display">
                      <p class="output-label"><strong>真值</strong></p>
                      <pre class="code-block-small">{{ formatDict(module2ModuleTruth) }}</pre>
                    </div>
                  </div>
                </div>
                
                <!-- 认知传播偏差测试结果 -->
                <div class="sub-box mt-2">
                  <div class="sub-box-title">认知传播偏差测试结果</div>
                  <div class="deviation-header">偏差值: {{ formatPercent(module2PropagationBias) }}</div>
                  <div class="sub-box-content d-flex justify-content-around">
                    <div class="stage-output">
                      <p class="stage-label"><strong>阶段三输出:</strong></p>
                      <p class="stage-result">{{ module2Stage3Output }}</p>
                    </div>
                    <div class="stage-output">
                      <p class="stage-label"><strong>阶段四输出:</strong></p>
                      <p class="stage-result">{{ module2Stage4Output }}</p>
                    </div>
                  </div>
                </div>

              </div>
            </b-col>
          </b-row>
          
          <!-- 第二行：多智能体协商 + 决策选择 -->
          <b-row class="mt-3">
            <!-- 多智能体协商（模块三） -->
            <b-col cols="6" class="pr-2">
              <div class="module-box">
                <p class="module-title">多智能体协商（模块三）</p>
                
                <!-- 输出和真值 -->
                <div class="sub-box">
                  <div class="deviation-header">偏差值: {{ formatPercent(module3SingleTaskBias) }}</div>
                  <div class="sub-box-content">
                    <div class="simple-output">
                      <p class="output-label"><strong>输出:</strong> {{ module3Output }}</p>
                    </div>
                    <div class="simple-output mt-2">
                      <p class="output-label"><strong>真值:</strong> {{ module3GroundTruth }}</p>
                    </div>
                  </div>
                </div>
                
                <!-- 模块偏差测试结果 -->
                <div class="sub-box mt-2">
                  <div class="sub-box-title">模块偏差测试结果</div>
                  <div class="deviation-header">偏差值: {{ formatPercent(module3ModuleBias) }}</div>
                  <div class="sub-box-content d-flex justify-content-between">
                    <div class="stage-output">
                      <p class="stage-label"><strong>输出:</strong></p>
                      <p class="stage-result">{{ module3ModuleOutput }}</p>
                    </div>
                    <div class="stage-output">
                      <p class="stage-label"><strong>真值:</strong></p>
                      <p class="stage-result">{{ module3ModuleTruth }}</p>
                    </div>
                  </div>
                </div>
                
                <!-- 认知传播偏差测试结果 -->
                <div class="sub-box mt-2">
                  <div class="sub-box-title">认知传播偏差测试结果</div>
                  <div class="deviation-header">偏差值: {{ formatPercent(module3PropagationBias) }}</div>
                  <div class="sub-box-content">
                    <div class="stage-output">
                      <p class="stage-label"><strong>阶段四输出:</strong></p>
                      <p class="stage-result">{{ module3Stage4Output }}</p>
                    </div>
                  </div>
                </div>
                
              </div>
            </b-col>
            
            <!-- 决策选择（模块四） -->
            <b-col cols="6" class="pl-2">
              <div class="module-box">
                <p class="module-title">决策选择（模块四）</p>
                
                <!-- 输出和真值 -->
                <div class="sub-box">
                  <div class="deviation-header">偏差值: {{ formatPercent(module4SingleTaskBias) }}</div>
                  <div class="sub-box-content">
                    <div class="simple-output">
                      <p class="output-label"><strong>输出:</strong> {{ module4Output }}</p>
                    </div>
                    <div class="simple-output mt-2">
                      <p class="output-label"><strong>真值:</strong> {{ module4GroundTruth }}</p>
                    </div>
                  </div>
                </div>
                
                <!-- 模块偏差测试结果 -->
                <div class="sub-box mt-2">
                  <div class="sub-box-title">模块偏差测试结果</div>
                  <div class="deviation-header">偏差值: {{ formatPercent(module4ModuleBias) }}</div>
                  <div class="sub-box-content d-flex justify-content-around">
                    <div class="stage-output">
                      <p class="stage-label"><strong>输出:</strong></p>
                      <p class="stage-result">{{ module4ModuleOutput }}</p>
                    </div>
                    <div class="stage-output">
                      <p class="stage-label"><strong>真值:</strong></p>
                      <p class="stage-result">{{ module4ModuleTruth }}</p>
                    </div>
                  </div>
                </div>
                
                <div class="sub-box mt-2 invisible-placeholder"></div>
              </div>
            </b-col>
          </b-row>
          
        </div>
      </b-col>
    </b-row>
    
    <!-- 诊断结果区域 -->
    <b-row class="justify-content-center mt-4 pb-5">
      <b-col cols="10" style="position: relative;">
        <div class="box-label">诊断结果</div>
        
        <div class="diagnosis-results-container p-3">
          <b-row>
            <b-col cols="4" class="text-center">
              <div class="diagnosis-card">
                <p class="diagnosis-label">准确率</p>
                <p class="diagnosis-value">86%</p>
              </div>
            </b-col>
            <b-col cols="4" class="text-center">
              <div class="diagnosis-card">
                <p class="diagnosis-label">偏差模块</p>
                <p class="diagnosis-value">{{ biasModuleName }}</p>
              </div>
            </b-col>
            <b-col cols="4" class="text-center">
              <div class="diagnosis-card">
                <p class="diagnosis-label">不一致性根因召回率</p>
                <p class="diagnosis-value">73%</p>
              </div>
            </b-col>
          </b-row>
        </div>
      </b-col>
    </b-row>
    
  </div>
</template>

<script>
import axios from 'axios';
import cascadeData from '@/assets/cascade_data.json';

export default {
  name: 'AttributionDiagnosis',
  data() {
    return {
      // 样式控制
      fullWidth: window.innerWidth,
      fullHeight: window.innerHeight,
      
      // 请求控制
      taskId: 'test_id_1', // 固定taskId
      isRunning: false,
      pollTimer: null,
      
      // 提示信息
      showAlert: false,
      alertVariant: 'info',
      alertMessage: '',
      
      // 原始轮询数据
      statusData: null,
      
      // 模块一数据（多模态目标检测）
      module1Output: '',
      module1GroundTruth: '',
      module1SingleTaskBias: null,
      module1Stage2Output: null,
      module1Stage3Output: '',
      module1Stage4Output: '',
      module1PropagationBias: null,
      
      // 模块二数据（先验知识）
      module2Output: null,
      module2GroundTruth: null,
      module2SingleTaskBias: null,
      module2ModuleOutput: null,
      module2ModuleTruth: null,
      module2ModuleBias: null,
      module2Stage3Output: '',
      module2Stage4Output: '',
      module2PropagationBias: null,
      
      // 模块三数据（多智能体协商）
      module3Output: '',
      module3GroundTruth: '',
      module3SingleTaskBias: null,
      module3ModuleOutput: '',
      module3ModuleTruth: '',
      module3ModuleBias: null,
      module3Stage4Output: '',
      module3PropagationBias: null,
      
      // 模块四数据（决策选择）
      module4Output: '',
      module4GroundTruth: '',
      module4SingleTaskBias: null,
      module4ModuleOutput: '',
      module4ModuleTruth: '',
      module4ModuleBias: null,
      
      // 诊断结果
      biasModuleName: '—',
    };
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
    
    // 页面加载时自动启动偏差分析
    this.initBiasAnalysis();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }
  },
  methods: {
    handleResize() {
      this.fullWidth = window.innerWidth;
      this.fullHeight = window.innerHeight;
    },
    
    /**
     * 初始化偏差分析流程
     */
    async initBiasAnalysis() {
      // 1. 验证前4个阶段数据是否完整
      if (!this.validateCascadeData()) {
        this.showAlertMessage('error', '前4个阶段的数据不完整，无法进行归因诊断');
        return;
      }
      
      // 2. 发送异步请求启动Pipeline
      await this.startBiasAnalysis();
    },
    
    /**
     * 验证级联数据完整性
     */
    validateCascadeData() {
      if (!cascadeData) return false;
      
      // 检查stage1到stage4是否都存在
      const requiredStages = ['stage1', 'stage2', 'stage3', 'stage4'];
      for (const stage of requiredStages) {
        if (!cascadeData[stage]) {
          console.error(`缺少${stage}数据`);
          return false;
        }
      }
      
      return true;
    },
    
    /**
     * 启动偏差分析Pipeline
     */
    async startBiasAnalysis() {
      try {
        const response = await axios.post('/module5/api/bias-analysis', cascadeData, {
          params: {
            id: this.taskId,
            async: true
          },
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const statusCode = response.status;
        const data = response.data;
        
        if (statusCode === 200) {
          // 200: Pipeline已启动
          console.log('Pipeline已启动:', data);
          this.showAlertMessage('success', 'Pipeline已启动，正在处理数据...');
          this.startPolling();
        } else if (statusCode === 409) {
          // 409: 正在运行中（不报错，继续轮询）
          console.log('Pipeline正在运行中');
          this.showAlertMessage('info', 'Pipeline正在运行中，正在获取数据...');
          this.startPolling();
        }
        
      } catch (error) {
        // 处理其他错误状态码
        const statusCode = error.response && error.response.status;
        const errorData = error.response && error.response.data;
        
        if (statusCode === 409) {
          // axios会把409当作error，这里特殊处理
          console.log('Pipeline正在运行中（409）');
          this.showAlertMessage('info', 'Pipeline正在运行中，正在获取数据...');
          this.startPolling();
        } else {
          // 其他错误：显示错误信息，不进行轮询
          const errorMsg = (errorData && errorData.error) || error.message || '未知错误';
          this.showAlertMessage('danger', `启动失败: ${errorMsg}`);
          console.error('启动偏差分析失败:', error);
        }
      }
    },
    
    /**
     * 开始轮询状态
     */
    startPolling() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
      }
      
      this.isRunning = true;
      
      // 立即执行一次
      this.pollStatus();
      
      // 每秒轮询一次
      this.pollTimer = setInterval(() => {
        this.pollStatus();
      }, 1000);
    },
    
    /**
     * 轮询状态接口
     */
    async pollStatus() {
      try {
        const response = await axios.get('/module5/api/bias-analysis/status', {
          params: {
            id: this.taskId
          }
        });
        
        const statusCode = response.status;
        const data = response.data;
        
        if (statusCode === 200) {
          // 成功获取数据
          this.statusData = data;
          this.parseStatusData(data);
          
          // 检查是否运行结束
          if (!data.running) {
            this.stopPolling();
            this.showAlertMessage('success', '数据处理完成');
          }
        }
        
      } catch (error) {
        // 轮询失败：停止轮询并显示错误
        const statusCode = error.response && error.response.status;
        const errorData = error.response && error.response.data;
        const errorMsg = (errorData && errorData.error) || error.message || '未知错误';
        
        this.stopPolling();
        this.showAlertMessage('danger', `获取状态失败 (${statusCode}): ${errorMsg}`);
        console.error('轮询状态失败:', error);
      }
    },
    
    /**
     * 停止轮询
     */
    stopPolling() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
      this.isRunning = false;
    },
    
    /**
     * 解析状态数据并更新页面
     */
    parseStatusData(data) {
      if (!data || !data.modules) return;
      
      const modules = data.modules;
      
      // 解析模块一（多模态目标检测）
      this.parseModule1(modules.module1);
      
      // 解析模块二（先验知识）
      this.parseModule2(modules.module2);
      
      // 解析模块三（多智能体协商）
      this.parseModule3(modules.module3);
      
      // 解析模块四（决策选择）
      this.parseModule4(modules.module4);
      
      // 解析LLM分析结果
      this.parseLLMAnalysis(data.llm_analysis);
    },
    
    /**
     * 解析模块一数据
     */
    parseModule1(module1) {
      if (!module1) return;
      
      // Single task stage
      const singleTask = module1.single_task_stage;
      if (singleTask) {
        this.module1Output = this.safeGet(singleTask, 'prediction.caption', '');
        this.module1GroundTruth = this.safeGet(singleTask, 'ground_truth.caption', '');
        this.module1SingleTaskBias = this.safeGet(singleTask, 'prediction.negotiation_basis', null);
      }
      
      // Analysis task
      const analysisTask = module1.analysis_task;
      if (analysisTask && analysisTask.stages) {
        // Stage2
        const stage2 = analysisTask.stages.stage2;
        if (stage2) {
          this.module1Stage2Output = this.safeGet(stage2, 'prediction', null);
        }
        
        // Stage3
        const stage3 = analysisTask.stages.stage3;
        if (stage3) {
          this.module1Stage3Output = this.safeGet(stage3, 'prediction.final_model_name', '');
        }
        
        // Stage4
        const stage4 = analysisTask.stages.stage4;
        if (stage4) {
          this.module1Stage4Output = this.safeGet(stage4, 'prediction.danger_level', '');
        }
        
        // Propagation bias
        this.module1PropagationBias = this.safeGet(analysisTask, 'calculated_value', null);
      }
    },
    
    /**
     * 解析模块二数据
     */
    parseModule2(module2) {
      if (!module2) return;
      
      // Single task stage
      const singleTask = module2.single_task_stage;
      if (singleTask) {
        this.module2Output = this.safeGet(singleTask, 'prediction', null);
        this.module2GroundTruth = this.safeGet(singleTask, 'ground_truth', null);
        this.module2SingleTaskBias = this.safeGet(singleTask, 'prediction.cognitive_bias', null);
      }
      
      // Module test stage (新的独立字段)
      const moduleTestStage = module2.module_test_stage;
      if (moduleTestStage) {
        this.module2ModuleOutput = this.safeGet(moduleTestStage, 'prediction', null);
        this.module2ModuleTruth = this.safeGet(moduleTestStage, 'ground_truth', null);
        this.module2ModuleBias = this.safeGet(moduleTestStage, 'prediction.cognitive_bias', null);
      }
      
      // Analysis task
      const analysisTask = module2.analysis_task;
      if (analysisTask && analysisTask.stages) {
        // Stage3
        const stage3 = analysisTask.stages.stage3;
        if (stage3) {
          this.module2Stage3Output = this.safeGet(stage3, 'prediction.final_model_name', '');
        }
        
        // Stage4
        const stage4 = analysisTask.stages.stage4;
        if (stage4) {
          this.module2Stage4Output = this.safeGet(stage4, 'prediction.danger_level', '');
        }
        
        // Propagation bias
        this.module2PropagationBias = this.safeGet(analysisTask, 'calculated_value', null);
      }
    },
    
    /**
     * 解析模块三数据
     */
    parseModule3(module3) {
      if (!module3) return;
      
      // Single task stage
      const singleTask = module3.single_task_stage;
      if (singleTask) {
        this.module3Output = this.safeGet(singleTask, 'prediction.final_model_name', '');
        this.module3GroundTruth = this.safeGet(singleTask, 'ground_truth.final_model_name', '');
        this.module3SingleTaskBias = this.safeGet(singleTask, 'prediction.cognitive_bias', null);
      }
      
      // Module test stage (新的独立字段)
      const moduleTestStage = module3.module_test_stage;
      if (moduleTestStage) {
        this.module3ModuleOutput = this.safeGet(moduleTestStage, 'prediction.final_model_name', '');
        this.module3ModuleTruth = this.safeGet(moduleTestStage, 'ground_truth.final_model_name', '');
        this.module3ModuleBias = this.safeGet(moduleTestStage, 'prediction.cognitive_bias', null);
      }
      
      // Analysis task
      const analysisTask = module3.analysis_task;
      if (analysisTask && analysisTask.stages) {
        // Stage4
        const stage4 = analysisTask.stages.stage4;
        if (stage4) {
          this.module3Stage4Output = this.safeGet(stage4, 'prediction.danger_level', '');
        }
        
        // Propagation bias
        this.module3PropagationBias = this.safeGet(analysisTask, 'calculated_value', null);
      }
    },
    
    /**
     * 解析模块四数据
     */
    parseModule4(module4) {
      if (!module4) return;
      
      // Single task stage
      const singleTask = module4.single_task_stage;
      if (singleTask) {
        this.module4Output = this.safeGet(singleTask, 'prediction.danger_level', '');
        this.module4GroundTruth = this.safeGet(singleTask, 'ground_truth.danger_level', '');
        this.module4SingleTaskBias = this.safeGet(singleTask, 'prediction.cognitive_bias', null);
      }
      
      // Module test stage (新的独立字段)
      const moduleTestStage = module4.module_test_stage;
      if (moduleTestStage) {
        this.module4ModuleOutput = this.safeGet(moduleTestStage, 'prediction.danger_level', '');
        this.module4ModuleTruth = this.safeGet(moduleTestStage, 'ground_truth.danger_level', '');
        this.module4ModuleBias = this.safeGet(moduleTestStage, 'prediction.cognitive_bias', null);
      }
    },
    
    /**
     * 解析LLM分析结果
     */
    parseLLMAnalysis(llmAnalysis) {
      if (!llmAnalysis || !llmAnalysis.max_error) {
        this.biasModuleName = '—';
        return;
      }
      
      const maxError = llmAnalysis.max_error;
      const moduleNames = {
        1: '多模态目标检测',
        2: '先验知识',
        3: '多智能体协商',
        4: '决策选择'
      };
      
      this.biasModuleName = moduleNames[maxError] || '—';
    },
    
    /**
     * 安全获取嵌套对象属性
     */
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
    
    /**
     * 格式化百分比
     */
    formatPercent(value) {
      if (value === null || value === undefined) return '—';
      return `${(value * 100).toFixed(2)}%`;
    },
    
    /**
     * 格式化字典对象
     */
    formatDict(obj) {
      if (!obj) return '';
      if (typeof obj === 'string') return obj;
      
      try {
        return JSON.stringify(obj, null, 2);
      } catch (e) {
        return String(obj);
      }
    },
    
    /**
     * 截断文本
     */
    truncateText(text, maxLength) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },
    
    /**
     * 显示提示信息
     */
    showAlertMessage(variant, message) {
      this.alertVariant = variant;
      this.alertMessage = message;
      this.showAlert = true;
    }
  }
};
</script>

<style lang="scss" scoped>
/* ================= 现代专业商务风格 ================= */

/* 基础样式 */
.section {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  color: #2c3e50;
  font-size: 100%;
  width: 100%;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  z-index: 2;
  overflow-y: auto;
}

.newTitle {
  font-size: calc(2vw + 1rem);
  color: #1e3a8a;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 30px;
  position: relative;
  display: inline-block;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
    border-radius: 2px;
  }
}

.register {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.05;
}

.img_box {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.03;
  background-image: url('../assets/images/newBackGound.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
}

.box-label {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 6px 20px;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  z-index: 10;
  letter-spacing: 0.05em;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* =========== 结果汇总区域 =========== */
.results-summary-container {
  border: none;
  background-color: #ffffff;
  margin-top: 10px;
  position: relative;
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  padding: 20px;
}

.module-box {
  border: 2px solid #e5e7eb;
  padding: 16px;
  height: 100%;
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  border-radius: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
    transform: translateY(-2px);
  }
}

.module-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e40af;
  border-bottom: 3px solid #3b82f6;
  padding-bottom: 8px;
  margin-bottom: 12px;
  text-align: left;
  letter-spacing: 0.02em;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sub-box {
  border: 2px solid #e5e7eb;
  background-color: #fafbfc;
  position: relative;
  padding: 12px;
  padding-top: 18px;
  font-size: 0.9rem;
  margin-top: 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }
}

.sub-box-title {
  position: absolute;
  top: -12px;
  left: 12px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 4px 12px;
  font-weight: 600;
  font-size: 0.85rem;
  color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.deviation-header {
  position: absolute;
  top: -12px;
  right: 12px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  padding: 4px 12px;
  font-weight: 600;
  color: #ffffff;
  font-size: 0.85rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.sub-box-content {
  padding: 8px;
  color: #374151;
  
  p {
    margin-bottom: 6px;
  }
}

/* 输出显示样式 */
.output-section, .truth-section, .simple-output {
  margin-bottom: 10px;
}

.output-label {
  color: #4b5563;
  font-size: 0.9rem;
  margin-bottom: 5px;
  font-weight: 600;
}

.text-output {
  color: #1f2937;
  font-size: 0.85rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  padding: 10px;
  background-color: #f3f4f6;
  border-left: 4px solid #3b82f6;
  border-radius: 4px;
}

.dict-display {
  width: 48%;
  border: 2px solid #e5e7eb;
  padding: 10px;
  background-color: #f9fafb;
  border-radius: 6px;
}

.code-block, .code-block-small {
  background-color: #1f2937;
  color: #10b981;
  padding: 12px;
  font-size: 0.8rem;
  line-height: 1.5;
  border: none;
  border-radius: 6px;
  overflow-x: auto;
  max-height: 180px;
  overflow-y: auto;
  margin: 0;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
}

.code-block-small {
  max-height: 120px;
  font-size: 0.75rem;
  padding: 8px;
}

.stage-output {
  margin-bottom: 10px;
}

.stage-label {
  color: #6366f1;
  font-size: 0.85rem;
  margin-bottom: 4px;
  font-weight: 600;
}

.stage-result {
  color: #1f2937;
  font-size: 0.85rem;
  padding: 8px;
  background-color: #f3f4f6;
  border-left: 3px solid #6366f1;
  margin: 0;
  border-radius: 4px;
}

.invisible-placeholder {
  visibility: hidden;
  min-height: 50px;
}

/* =========== 诊断结果区域 =========== */
.diagnosis-results-container {
  border: none;
  background-color: #ffffff;
  margin-top: 10px;
  position: relative;
  text-align: center;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  padding: 20px;
}

.diagnosis-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 30px 15px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
  }
  
  .diagnosis-label {
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 15px;
    letter-spacing: 0.05em;
  }
  
  .diagnosis-value {
    font-size: 2.8rem;
    font-weight: 800;
    color: #ffffff;
    margin-bottom: 0;
    text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    letter-spacing: -0.02em;
  }
}

/* Alert样式优化 */
::v-deep .alert {
  border-radius: 8px;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 响应式优化 */
@media (max-width: 1200px) {
  .code-block, .code-block-small {
    font-size: 0.7rem;
  }
  
  .diagnosis-value {
    font-size: 2.2rem;
  }
  
  .module-title {
    font-size: 1rem;
  }
}

@media (max-width: 768px) {
  .dict-display {
    width: 100%;
    margin-bottom: 10px;
  }
  
  .diagnosis-value {
    font-size: 1.8rem;
  }
}
</style>
