<template>
  <div class="section" :style="{ minHeight: fullHeight + 'px' }">
    <!-- 背景层 -->
    <div class="register" :style="{width: fullWidth+'px', height:fullHeight+'px'}"></div>
    <div class="img_box" :style="{width: fullWidth+'px'}"></div>

    <!-- 标题 -->
    <b-row class="justify-content-center pt-5">
      <b-col cols="10" class="text-center">
        <p class="newTitle text-center">多层级传播不一致性根因诊断模型</p>
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

    <!-- 主要内容区域 -->
    <b-row class="justify-content-center pt-4 mb-4">
      <b-col cols="10">
        
        <!-- 第一行：模块1和模块2 -->
        <b-row class="mb-3">
          <!-- 模块1：多模态信息认知偏差检测模型 -->
          <b-col cols="6" class="pr-2">
            <div class="module-card">
              <div class="module-header">多模态信息认知偏差检测模型</div>
              
              <!-- 偏差测试结果 -->
              <div class="result-section-main">
                <div class="section-title-inline">偏差测试结果</div>
                <div class="content-box-large scrollable" v-html="highlightBrackets(module1BiasTestResult)"></div>
              </div>
              
              <!-- 第二行指标 -->
              <div class="metric-bar">
                <div class="metric-content">认知传播偏差测试结果：{{ formatPercent(module1PropagationBias) }}</div>
              </div>
              
              <!-- 第三行指标 -->
              <div class="metric-bar">
                <div class="metric-content">是否是偏差模块：{{ formatYesNo(module1IsBiasModule) }}</div>
              </div>
            </div>
          </b-col>
          
          <!-- 模块2：先验知识认知偏差检测模型 -->
          <b-col cols="6" class="pl-2">
            <div class="module-card">
              <div class="module-header">先验知识认知偏差检测模型</div>
              
              <!-- 偏差测试结果 -->
              <div class="result-section-main">
                <div class="section-title-inline">偏差测试结果</div>
                <div class="content-box-large scrollable">
                  <div class="category-header">
                    <span class="category-label">类别：</span>
                    <span class="category-value-inline">{{ module2Category }}</span>
                  </div>
                  <div class="attributes-two-column">
                    <div v-for="(value, key) in module2Attributes" :key="key" class="attr-line">
                      <span class="attr-bullet">•</span>
                      <span class="attr-key">{{ key }}：</span>
                      <span class="attr-val" v-html="highlightBrackets(value)"></span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 第二行指标 -->
              <div class="metric-bar">
                <div class="metric-content-split">
                  <span>模型内部偏差测试结果：{{ formatPercent(module2InternalBias) }}</span>
                  <span>认知传播偏差测试结果：{{ formatPercent(module2PropagationBias) }}</span>
                </div>
              </div>
              
              <!-- 第三行指标 -->
              <div class="metric-bar">
                <div class="metric-content">是否是偏差模块：{{ formatYesNo(module2IsBiasModule) }}</div>
              </div>
            </div>
          </b-col>
        </b-row>
        
        <!-- 第二行：模块3和模块4 -->
        <b-row class="mb-3">
          <!-- 模块3：群体协商认知偏差检测模型 -->
          <b-col cols="6" class="pr-2">
            <div class="module-card">
              <div class="module-header">群体协商认知偏差检测模型</div>
              
              <!-- 偏差测试结果 -->
              <div class="result-section-main">
                <div class="section-title-inline">偏差测试结果</div>
                <div class="content-box-large scrollable" v-html="highlightBrackets(module3BiasTestResult)"></div>
              </div>
              
              <!-- 第二行指标 -->
              <div class="metric-bar">
                <div class="metric-content-split">
                  <span>模型内部偏差测试结果：{{ formatPercent(module3InternalBias) }}</span>
                  <span>认知传播偏差测试结果：{{ formatPercent(module3PropagationBias) }}</span>
                </div>
              </div>
              
              <!-- 第三行指标 -->
              <div class="metric-bar">
                <div class="metric-content">是否是偏差模块：{{ formatYesNo(module3IsBiasModule) }}</div>
              </div>
            </div>
          </b-col>
          
          <!-- 模块4：决策选择认知偏差检测模型 -->
          <b-col cols="6" class="pl-2">
            <div class="module-card">
              <div class="module-header">决策选择认知偏差检测模型</div>
              
              <!-- 偏差测试结果 -->
              <div class="result-section-main">
                <div class="section-title-inline">偏差测试结果</div>
                <div class="content-box-large scrollable" v-html="highlightBrackets(module4BiasTestResult)"></div>
              </div>
              
              <!-- 第二行指标 -->
              <div class="metric-bar">
                <div class="metric-content">模型内部偏差测试结果：{{ formatPercent(module4InternalBias) }}</div>
              </div>
              
              <!-- 第三行指标 -->
              <div class="metric-bar">
                <div class="metric-content">是否是偏差模块：{{ formatYesNo(module4IsBiasModule) }}</div>
              </div>
            </div>
          </b-col>
        </b-row>
        
        <!-- 根因诊断结果 -->
        <b-row>
          <b-col cols="12">
            <div class="diagnosis-result-card">
              <div class="diagnosis-header">根因诊断结果</div>
              <div class="diagnosis-content">
                <div class="diagnosis-item-box">
                  <div class="diagnosis-label-top">多主体解析准确率</div>
                  <div class="diagnosis-value-large">{{ formatPercent(accuracy) }}</div>
                </div>
                <div class="diagnosis-item-box">
                  <div class="diagnosis-label-top">不一致性根因召回率</div>
                  <div class="diagnosis-value-large">{{ formatPercent(recall) }}</div>
                </div>
              </div>
            </div>
          </b-col>
        </b-row>
        
      </b-col>
    </b-row>
    
  </div>
</template>

<script>
import axios from 'axios';
import cascadeDataMock from '@/assets/cascade_data.json';

export default {
  name: 'AttributionDiagnosisV2',
  data() {
    return {
      // 级联数据（从LocalStorage构建）
      cascadeData: null,
      // 样式控制
      fullWidth: window.innerWidth,
      fullHeight: window.innerHeight,
      
      // 请求控制
      taskId: 'test_id_1',
      isRunning: false,
      pollTimer: null,
      
      // 提示信息
      showAlert: false,
      alertVariant: 'info',
      alertMessage: '',
      
      // 原始轮询数据
      statusData: null,
      
      // 模块1数据
      module1BiasTestResult: '',
      module1PropagationBias: null,
      module1IsBiasModule: null,
      
      // 模块2数据
      module2Category: '',
      module2Attributes: {},
      module2InternalBias: null,
      module2PropagationBias: null,
      module2IsBiasModule: null,
      
      // 模块3数据
      module3BiasTestResult: '',
      module3InternalBias: null,
      module3PropagationBias: null,
      module3IsBiasModule: null,
      
      // 模块4数据
      module4BiasTestResult: '',
      module4InternalBias: null,
      module4IsBiasModule: null,
      
      // 根因诊断结果
      accuracy: null,
      recall: null,
    };
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
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
      // 从LocalStorage构建级联数据
      const buildResult = this.buildCascadeDataFromLocalStorage();
      
      if (!buildResult.success) {
        // 使用Mock数据作为降级方案
        console.warn('⚠️ LocalStorage数据不完整，使用Mock数据');
        console.warn('缺失原因：', buildResult.message);
        this.cascadeData = cascadeDataMock;
        this.showAlertMessage('warning', `${buildResult.message}，当前使用固定Mock数据进行调试`);
      } else {
        // 使用从LocalStorage构建的数据
        this.cascadeData = buildResult.data;
        this.showAlertMessage('success', '成功从LocalStorage加载前四个模块的结果');
      }
      
      console.log('✅ 最终使用的级联数据：', JSON.parse(JSON.stringify(this.cascadeData)));
      
      await this.startBiasAnalysis();
    },
    
    /**
     * 从LocalStorage构建级联数据
     */
    buildCascadeDataFromLocalStorage() {
      try {
        console.log('📦 开始从LocalStorage读取四个模块的结果...');
        
        // 从LocalStorage中读取四个模块的结果
        const module1Str = localStorage.getItem('module1Res');
        const module2Str = localStorage.getItem('module2Res');
        const module3Str = localStorage.getItem('module3Res');
        const module4Str = localStorage.getItem('module4Res');
        
        console.log('📄 module1Res 原始数据:', module1Str ? '已获取' : '❌ 未找到');
        console.log('📄 module2Res 原始数据:', module2Str ? '已获取' : '❌ 未找到');
        console.log('📄 module3Res 原始数据:', module3Str ? '已获取' : '❌ 未找到');
        console.log('📄 module4Res 原始数据:', module4Str ? '已获取' : '❌ 未找到');
        
        // 检查是否所有模块都已执行
        const missingModules = [];
        if (!module1Str) missingModules.push('模块一（多模态目标检测）');
        if (!module2Str) missingModules.push('模块二（先验知识）');
        if (!module3Str) missingModules.push('模块三（多智能体协商）');
        if (!module4Str) missingModules.push('模块四（决策选择）');
        
        if (missingModules.length > 0) {
          return {
            success: false,
            message: `请先执行前四个模块，缺失：${missingModules.join('、')}`
          };
        }
        
        // JSON反序列化
        let module1Data, module2Data, module3Data, module4Data;
        
        try {
          module1Data = JSON.parse(module1Str);
          console.log('✅ module1Res 解析成功:', module1Data);
        } catch (e) {
          console.error('❌ module1Res 解析失败:', e);
          return {
            success: false,
            message: '模块一数据格式错误，无法解析JSON'
          };
        }
        
        try {
          module2Data = JSON.parse(module2Str);
          console.log('✅ module2Res 解析成功:', module2Data);
        } catch (e) {
          console.error('❌ module2Res 解析失败:', e);
          return {
            success: false,
            message: '模块二数据格式错误，无法解析JSON'
          };
        }
        
        try {
          module3Data = JSON.parse(module3Str);
          console.log('✅ module3Res 解析成功:', module3Data);
        } catch (e) {
          console.error('❌ module3Res 解析失败:', e);
          return {
            success: false,
            message: '模块三数据格式错误，无法解析JSON'
          };
        }
        
        try {
          module4Data = JSON.parse(module4Str);
          console.log('✅ module4Res 解析成功:', module4Data);
        } catch (e) {
          console.error('❌ module4Res 解析失败:', e);
          return {
            success: false,
            message: '模块四数据格式错误，无法解析JSON'
          };
        }
        
        // 构建级联数据结构
        const cascadeData = {
          stage1: module1Data,
          stage2: module2Data,
          stage3: module3Data,
          stage4: module4Data
        };
        
        console.log('🎉 级联数据构建成功:', cascadeData);
        
        return {
          success: true,
          data: cascadeData
        };
        
      } catch (error) {
        console.error('❌ 构建级联数据失败：', error);
        return {
          success: false,
          message: `构建级联数据时发生错误：${error.message}`
        };
      }
    },
    
    /**
     * 启动偏差分析Pipeline
     */
    async startBiasAnalysis() {
      try {
        const response = await axios.post('/module5/api/bias-analysis', this.cascadeData, {
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
          console.log('Pipeline已启动:', data);
          this.showAlertMessage('success', '不一致性根因诊断已启动，正在诊断中...');
          this.startPolling();
        } else if (statusCode === 409) {
          console.log('Pipeline正在运行中');
          this.showAlertMessage('info', '不一致性根因诊断已启动，正在诊断中...');
          this.startPolling();
        }
        
      } catch (error) {
        const statusCode = error.response && error.response.status;
        const errorData = error.response && error.response.data;
        
        if (statusCode === 409) {
          console.log('Pipeline正在运行中（409）');
          this.showAlertMessage('info', '不一致性根因诊断已启动，正在诊断中...');
          this.startPolling();
        } else {
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
      this.pollStatus();
      
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
          this.statusData = data;
          this.parseStatusData(data);
          
          if (!data.running) {
            this.stopPolling();
            this.showAlertMessage('success', '诊断完成');
          }
        }
        
      } catch (error) {
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
      
      // 解析模块1
      this.parseModule1(modules.module1);
      
      // 解析模块2
      this.parseModule2(modules.module2);
      
      // 解析模块3
      this.parseModule3(modules.module3);
      
      // 解析模块4
      this.parseModule4(modules.module4);
      
      // 解析根因诊断结果
      this.accuracy = this.safeGet(data, 'accuracy', null);
      this.recall = this.safeGet(data, 'recall', null);
    },
    
    /**
     * 解析模块1数据
     */
    parseModule1(module1) {
      if (!module1) return;
      
      const singleTask = module1.single_task_stage;
      if (singleTask) {
        this.module1BiasTestResult = this.safeGet(singleTask, 'prediction.caption', '');
      }
      
      const analysisTask = module1.analysis_task;
      if (analysisTask) {
        this.module1PropagationBias = this.safeGet(analysisTask, 'calculated_value', null);
      }
      
      this.module1IsBiasModule = this.safeGet(module1, 'is_bias_module', null);
    },
    
    /**
     * 解析模块2数据
     */
    parseModule2(module2) {
      if (!module2) return;
      
      const singleTask = module2.single_task_stage;
      if (singleTask && singleTask.prediction) {
        const prediction = singleTask.prediction;
        
        // 类别
        this.module2Category = this.safeGet(prediction, 'kind', '');
        
        // 属性（排除kind和cognitive_bias）
        const attributes = {};
        for (const key in prediction) {
          if (key !== 'kind' && key !== 'cognitive_bias' && prediction.hasOwnProperty(key)) {
            attributes[key] = prediction[key];
          }
        }
        this.module2Attributes = attributes;
      }
      
      const moduleTestStage = module2.module_test_stage;
      if (moduleTestStage) {
        this.module2InternalBias = this.safeGet(moduleTestStage, 'prediction.cognitive_bias', null);
      }
      
      const analysisTask = module2.analysis_task;
      if (analysisTask) {
        this.module2PropagationBias = this.safeGet(analysisTask, 'calculated_value', null);
      }
      
      this.module2IsBiasModule = this.safeGet(module2, 'is_bias_module', null);
    },
    
    /**
     * 解析模块3数据
     */
    parseModule3(module3) {
      if (!module3) return;
      
      const singleTask = module3.single_task_stage;
      if (singleTask) {
        this.module3BiasTestResult = this.safeGet(singleTask, 'prediction.caption', '');
      }
      
      const moduleTestStage = module3.module_test_stage;
      if (moduleTestStage) {
        this.module3InternalBias = this.safeGet(moduleTestStage, 'prediction.cognitive_bias', null);
      }
      
      const analysisTask = module3.analysis_task;
      if (analysisTask) {
        this.module3PropagationBias = this.safeGet(analysisTask, 'calculated_value', null);
      }
      
      this.module3IsBiasModule = this.safeGet(module3, 'is_bias_module', null);
    },
    
    /**
     * 解析模块4数据
     */
    parseModule4(module4) {
      if (!module4) return;
      
      const singleTask = module4.single_task_stage;
      if (singleTask) {
        this.module4BiasTestResult = this.safeGet(singleTask, 'prediction.summary', '');
      }
      
      const moduleTestStage = module4.module_test_stage;
      if (moduleTestStage) {
        this.module4InternalBias = this.safeGet(moduleTestStage, 'prediction.cognitive_bias', null);
      }
      
      this.module4IsBiasModule = this.safeGet(module4, 'is_bias_module', null);
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
     * 格式化是/否
     */
    formatYesNo(value) {
      if (value === null || value === undefined) return '—';
      return value ? '是' : '否';
    },
    
    /**
     * 高亮双括号内容（标红并移除括号）
     */
    highlightBrackets(text) {
      if (!text) return '';
      
      // 将 {{xxx}} 替换为 <span class="highlight">xxx</span>
      return text.replace(/\{\{([^}]+)\}\}/g, '<span class="highlight-text">$1</span>');
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
  font-size: calc(1.8vw + 0.8rem);
  color: #1e3a8a;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 20px;
  position: relative;
  display: inline-block;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 80px;
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

/* =========== 模块卡片 =========== */
.module-card {
  background: #ffffff;
  border: 2px solid #2c3e50;
  border-radius: 8px;
  padding: 0;
  height: 100%;
  min-height: 480px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.module-header {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1f2937;
  border-bottom: 2px solid #2c3e50;
  padding: 12px 15px;
  margin: 0;
  background-color: #f8f9fa;
}

.result-section-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 15px;
  padding-bottom: 10px;
}

.section-title-inline {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  padding-bottom: 5px;
  border-bottom: 1px solid #e5e7eb;
}

.content-box-large {
  flex: 1;
  background-color: #ffffff;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  padding: 12px;
  color: #1f2937;
  font-size: 0.88rem;
  line-height: 1.7;
  
  &.scrollable {
    overflow-y: auto;
    max-height: 280px;
  }
}

/* 底部指标横条 */
.metric-bar {
  border-top: 1px solid #d1d5db;
  padding: 10px 15px;
  background-color: #ffffff;
  
  &:last-child {
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
  }
}

.metric-content {
  font-size: 0.9rem;
  color: #1f2937;
  font-weight: 500;
  text-align: center;
}

.metric-content-split {
  display: flex;
  justify-content: space-around;
  gap: 20px;
  
  span {
    font-size: 0.9rem;
    color: #1f2937;
    font-weight: 500;
  }
}

/* 模块2特殊样式 */
.category-header {
  font-size: 0.9rem;
  margin-bottom: 12px;
  text-align: center;
  padding: 6px 10px;
  background-color: #f9fafb;
  border-radius: 4px;
  
  .category-label {
    font-weight: 600;
    color: #4b5563;
  }
  
  .category-value-inline {
    font-weight: 700;
    color: #1e40af;
  }
}

.attributes-two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 15px;
  
  .attr-line {
    font-size: 0.84rem;
    display: flex;
    align-items: flex-start;
    line-height: 1.5;
    
    .attr-bullet {
      color: #6b7280;
      margin-right: 5px;
      flex-shrink: 0;
    }
    
    .attr-key {
      font-weight: 600;
      color: #374151;
      flex-shrink: 0;
    }
    
    .attr-val {
      color: #1f2937;
      word-break: break-word;
    }
  }
}

/* 高亮文本（双括号内容） */
::v-deep .highlight-text {
  color: #dc2626;
  font-weight: 700;
  background-color: #fee;
  padding: 0 2px;
}

/* =========== 根因诊断结果卡片 =========== */
.diagnosis-result-card {
  background: #ffffff;
  border: 2px solid #2c3e50;
  border-radius: 8px;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 10px;
}

.diagnosis-header {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1f2937;
  border-bottom: 2px solid #2c3e50;
  padding: 12px 15px;
  margin: 0;
  background-color: #f8f9fa;
}

.diagnosis-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 20px;
}

.diagnosis-item-box {
  background: #ffffff;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  padding: 18px;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  }
  
  .diagnosis-label-top {
    font-size: 0.95rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 12px;
  }
  
  .diagnosis-value-large {
    font-size: 2.2rem;
    font-weight: 800;
    color: #1e40af;
  }
}

/* Alert样式优化 */
::v-deep .alert {
  border-radius: 8px;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 滚动条样式 */
.scrollable::-webkit-scrollbar {
  width: 6px;
}

.scrollable::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.scrollable::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
  
  &:hover {
    background: #555;
  }
}

/* 响应式优化 */
@media (max-width: 1200px) {
  .module-card {
    min-height: 450px;
  }
  
  .percentage-value {
    font-size: 1.5rem;
  }
  
  .diagnosis-value {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .diagnosis-content {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .two-column {
    grid-template-columns: 1fr;
  }
}
</style>

