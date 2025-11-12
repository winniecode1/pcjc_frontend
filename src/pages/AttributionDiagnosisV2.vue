<template>
  <div class="attribution-diagnosis-container">
    <!-- 顶部导航按钮 -->
    <div class="top-nav">
      <button class="nav-btn home-btn" @click="$router.push('/')">首页</button>
      <button class="nav-btn back-btn" @click="$router.back()">返回</button>
    </div>

    <!-- 加载/错误提示 -->
    <div v-if="showAlert" class="alert-container">
      <b-alert :variant="alertVariant" show dismissible @dismissed="showAlert=false">
        {{ alertMessage }}
      </b-alert>
    </div>

    <!-- 主要内容网格 -->
    <div class="main-content">
      <!-- 模块1：多模态信息认知偏差检测模型 -->
      <div class="module-container" style="top: 17vh; left: 3.5vw; width: 45vw; height: 33vh;">
        <div class="module-header">多模态信息认知偏差检测模型</div>
        <div class="module-body">
          <div class="result-section">
            <div class="section-title">偏差测试结果</div>
            <div class="content-box scrollable" v-html="highlightBrackets(module1BiasTestResult)"></div>
          </div>
          <div class="metric-group">
              <div class="metric-item">认知传播偏差测试结果: <span>{{ formatPercent(module1PropagationBias, 0) }}</span></div>
              <div class="metric-item">是否是偏差模块: <span>{{ formatYesNo(module1IsBiasModule) }}</span></div>
          </div>
        </div>
      </div>

      <!-- 模块2：先验知识认知偏差检测模型 -->
      <div class="module-container" style="top: 17vh; right: 3.5vw; width: 45vw; height: 33vh;">
        <div class="module-header">先验知识认知偏差检测模型</div>
        <div class="module-body">
           <div class="result-section">
              <div class="section-title">偏差测试结果</div>
              <div class="content-box scrollable">
                  <div class="attributes-grid">
                    <div v-for="attr in module2DisplayAttributes" :key="attr.key" class="attribute-item">
                      <span class="attr-key">{{ attr.key }}:</span>
                      <span class="attr-value" v-html="highlightBrackets(attr.value)"></span>
                    </div>
                  </div>
              </div>
            </div>
          <div class="metric-group">
              <div class="metric-item">模型内部偏差测试结果: <span>{{ formatPercent(module2InternalBias, 0) }}</span></div>
              <div class="metric-item">认知传播偏差测试结果: <span>{{ formatPercent(module2PropagationBias, 0) }}</span></div>
              <div class="metric-item">是否是偏差模块: <span>{{ formatYesNo(module2IsBiasModule) }}</span></div>
          </div>
        </div>
      </div>

      <!-- 模块3：群体协商认知偏差检测模型 -->
      <div class="module-container" style="top: 52vh; left: 3.5vw; width: 45vw; height: 33vh;">
        <div class="module-header">群体协商认知偏差检测模型</div>
         <div class="module-body">
          <div class="result-section">
            <div class="section-title">偏差测试结果</div>
            <div class="content-box scrollable" v-html="highlightBrackets(module3BiasTestResult)"></div>
          </div>
          <div class="metric-group">
              <div class="metric-item">模型内部偏差测试结果: <span>{{ formatPercent(module3InternalBias, 0) }}</span></div>
              <div class="metric-item">认知传播偏差测试结果: <span>{{ formatPercent(module3PropagationBias, 0) }}</span></div>
              <div class="metric-item">是否是偏差模块: <span>{{ formatYesNo(module3IsBiasModule) }}</span></div>
          </div>
        </div>
      </div>

      <!-- 模块4：决策选择认知偏差检测模型 -->
      <div class="module-container" style="top: 52vh; right: 3.5vw; width: 45vw; height: 33vh;">
        <div class="module-header">决策选择认知偏差检测模型</div>
        <div class="module-body">
          <div class="result-section">
            <div class="section-title">偏差测试结果</div>
            <div class="content-box scrollable" v-html="highlightBrackets(module4BiasTestResult)"></div>
          </div>
          <div class="metric-group">
            <div class="metric-item">模型内部偏差测试结果: <span>{{ formatPercent(module4InternalBias, 0) }}</span></div>
            <div class="metric-item">是否是偏差模块: <span>{{ formatYesNo(module4IsBiasModule) }}</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部内容区域 -->
    <div class="bottom-content">
        <div class="diagnosis-card">根因诊断结果</div>
        <div class="metric-card accuracy-card">
            <div class="metric-title">多主体解析准确率</div>
            <div class="metric-value">{{ formatPercent(accuracy, 0) }}</div>
        </div>
        <div class="metric-card recall-card">
            <div class="metric-title">不一致根因召回率</div>
            <div class="metric-value">{{ formatPercent(recall, 0) }}</div>
        </div>
        <button class="export-btn">结果导出</button>
    </div>
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
  computed: {
    /**
     * 将模块2的属性整合为用于UI展示的列表
     */
    module2DisplayAttributes() {
      const attributes = [];
      if (this.module2Category) {
        attributes.push({ key: '目标类型', value: this.module2Category });
      }
      for (const key in this.module2Attributes) {
        if (Object.hasOwnProperty.call(this.module2Attributes, key)) {
          attributes.push({ key, value: this.module2Attributes[key] });
        }
      }
      return attributes;
    }
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
      // The new layout is responsive with vw/vh, this is no longer needed.
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
          
          // 提取 key_frame_path 并处理：去掉最后一个/及其后面的内容
          const keyFramePath = module1Data.key_frame_path;
          if (!keyFramePath) {
            console.error('❌ module1Res 中缺少 key_frame_path 字段');
            return {
              success: false,
              message: '模块一数据中缺少 key_frame_path 字段'
            };
          }
          
          // 去掉最后一个/及其后面的内容，得到文件夹路径
          const lastSlashIndex = keyFramePath.lastIndexOf('/');
          const folderPath = lastSlashIndex > 0 ? keyFramePath.substring(0, lastSlashIndex) : keyFramePath;
          
          console.log('📁 提取的文件夹路径:', folderPath);
          
          // 重新构建 module1Data，只保留 path 字段
          module1Data = {
            path: folderPath
          };
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
        this.module3BiasTestResult = this.safeGet(singleTask, 'prediction.final_review', '');
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
    formatPercent(value, precision = 2) {
      if (value === null || value === undefined) return '—';
      return `${(value * 100).toFixed(precision)}%`;
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
      if (text === null || text === undefined) return '';
      const str = String(text);
      // 跨行、非贪婪匹配；使用内联样式确保在 scoped/深度选择器受限时也能生效
      return str.replace(/\{\{([\s\S]*?)\}\}/g, '<span class="highlight-text" style="color:#ff4d4d;font-weight:700;">$1</span>');
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

<style scoped>
@font-face {
  font-family: 'DingTalk-JinBuTi';
  src: local('DingTalk-JinBuTi'), local('DingTalkJinBuTi');
  font-weight: normal;
  font-style: normal;
}

.attribution-diagnosis-container {
  width: 100vw;
  height: 100vh;
  background-image: url('~@/assets/images/step5/背景.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
  color: white;
  overflow: hidden; /* 防止滚动 */
  position: relative;
}

.attribution-diagnosis-container,
.attribution-diagnosis-container * {
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Arial', sans-serif;
}

/* ================= 顶部导航 ================= */
.top-nav {
  position: absolute;
  top: 3.5vh;
  left: 2.5vw;
  display: flex;
  z-index: 10;
}

.nav-btn {
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  font-family: 'DingTalk-JinBuTi', 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
}

.home-btn {
  width: 90px;
  height: 40px;
  background-image: url('~@/assets/images/step5/首页按钮.png');
  background-size: 100% 100%;
  margin-right: 15px;
}

.back-btn {
  width: 90px;
  height: 40px;
  background-image: url('~@/assets/images/step5/返回按钮.png');
  background-size: 100% 100%;
}

/* ================= 提示信息 ================= */
.alert-container {
  position: absolute;
  top: 10vh;
  left: 50%;
  transform: translateX(-50%);
  width: 50%;
  z-index: 100;
  opacity: 0.9;
}

/* ================= 主要内容 ================= */
.main-content {
  position: relative;
  width: 100%;
  height: 100%;
}

.module-container {
  position: absolute;
  display: flex;
  flex-direction: column;
}

.module-body {
  background-image: url('~@/assets/images/step5/每个模块背景.png');
  background-size: 100% 100%;
  padding: 1.5vh 1.5vw;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.module-header {
  background-image: url('~@/assets/images/step5/二级标题.png');
  background-size: 65% 100%;
  background-repeat: no-repeat;
  background-position: left center;
  font-size: 1rem;
  font-weight: bold;
  color: #c6f4ff;
  padding-left: 80px;
  height: 40px;
  line-height: 40px;
  flex-shrink: 0;
  font-family: 'DingTalk-JinBuTi', 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
}

.module-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0.5vh 0.8vw;
  color: #4ED8FF;
}

.module-content,
.module-content * {
  font-size: 14px !important;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Arial', sans-serif !important;
}

.result-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #8bd3f9;
  margin-bottom: 0.8vh;
  padding-left: 20px;
}

.content-box {
  flex: 1;
  line-height: 1.6;
  padding: 0 5px;
  font-size: 14px !important;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Arial', sans-serif !important;
}

.content-box * {
  font-size: 14px !important;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Arial', sans-serif !important;
}

.scrollable {
  overflow-y: auto;
  max-height: 18vh; /* 限制内容高度以适应整体布局 */
}
.scrollable::-webkit-scrollbar { width: 4px; }
.scrollable::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 2px;}
.scrollable::-webkit-scrollbar-thumb { background: #1a65a8; border-radius: 2px;}

.attr-line {
  display: flex;
  justify-content: space-between;
  padding: 0.3vh 0;
  border-bottom: 1px solid rgba(26, 101, 168, 0.3);
  font-size: 14px !important;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Arial', sans-serif !important;
}
.attr-line:last-child {
  border-bottom: none;
}
.attr-line > span:first-child {
  color: #8bd3f9;
  margin-right: 1vw;
  font-size: 14px !important;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Arial', sans-serif !important;
}
.attr-line > span {
  font-size: 14px !important;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Arial', sans-serif !important;
}

/* Styles for Module 2 attributes grid */
.attributes-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2vh 2vw;
  align-content: flex-start;
  padding: 0.5vh 0;
}

.attribute-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.8vh 1vw;
  background: rgba(10, 30, 60, 0.3);
  border-left: 2px solid #1a65a8;
  border-radius: 2px;
  font-size: 14px !important;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Arial', sans-serif !important;
  line-height: 1.5;
}
.attribute-item * {
  font-size: 14px !important;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Arial', sans-serif !important;
}
.attr-key {
  color: #8bd3f9;
  font-size: 14px !important;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Arial', sans-serif !important;
  margin-right: 0.5vw;
  flex-shrink: 0;
  font-weight: 500;
}
.attr-value {
  color: #c6f4ff;
  font-size: 14px !important;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Arial', sans-serif !important;
  text-align: left;
  word-break: break-word;
}

.metric-group {
  padding-top: 1vh;
  margin-top: 1vh;
  border-top: 1px solid #1a65a8;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.metric-item {
    font-size: 14px;
    color: #8bd3f9;
    padding: 2px 5px;
    font-family: 'PingFang SC', 'Microsoft YaHei', 'Arial', sans-serif !important;
}
.metric-item span {
    font-weight: bold;
    color: #c6f4ff;
    font-size: 14px;
    margin-left: 0.5em;
    font-family: 'PingFang SC', 'Microsoft YaHei', 'Arial', sans-serif !important;
}

/* ================= 底部内容 ================= */
.bottom-content {
  position: absolute;
  bottom: 1vh;
  width: 100%;
  height: 15vh;
}

.diagnosis-card {
    position: absolute;
    bottom: 6.3vh;
    left: 12vw;
    background-image: url('~@/assets/images/step5/二级标题.png');
    background-size: 100% 100%;
    width: 200px;
    height: 40px;
    line-height: 40px;
    padding-left: 45px;
    font-weight: bold;
    font-size: 1rem;
    color: #c6f4ff;
    font-family: 'DingTalk-JinBuTi', 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
}

.metric-card {
  position: absolute;
  bottom: 5vh;
  background-image: url('~@/assets/images/step5/底部多主体和不一致的背景.png');
  background-size: 100% 100%;
  width: 16vw;
  height: 8vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: 'DingTalk-JinBuTi', 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
}

.accuracy-card {
  left: 32vw;
}

.recall-card {
  left: 55vw;
}

.metric-title {
  font-size: 0.85rem;
  color: #8bd3f9;
  margin-bottom: 0.3vh;
  padding-left: 48px;
  text-align: left;
  width: 100%;
  font-family: 'DingTalk-JinBuTi', 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
}

.metric-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #ffffff;
  font-family: 'DingTalk-JinBuTi', 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
}

.export-btn {
  position: absolute;
  bottom: 4.8vh;
  right: 5vw;
  background-image: url('~@/assets/images/step5/按钮-结果导出.png');
  background-color: transparent;
  background-size: 100% 100%;
  width: 160px;
  height: 50px;
  border: none;
  cursor: pointer;
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
  padding: 0;
  padding-right: 25px;
  text-align: right;
  font-family: 'DingTalk-JinBuTi', 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
}


/* 高亮文本（双括号内容） */
::v-deep .highlight-text {
  color: #FF4242 !important;
  font-weight: 700;
}

</style>

