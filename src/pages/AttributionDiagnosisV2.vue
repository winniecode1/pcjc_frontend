<template>
  <div class="attribution-diagnosis-container">
    <!-- 顶部导航按钮 -->
    <b-row class="header-bar align-items-center no-gutters">
      <b-col cols="3" class="text-left">
        <button class="header-btn btn-home" @click="$router.push('/')">首页</button>
        <button class="header-btn btn-back" @click="$router.back()">返回</button>
      </b-col>
    </b-row>

    <!-- 加载/错误提示 -->
    <div v-if="showAlert" class="alert-container">
      <div :class="['custom-alert', `alert-${alertVariant}`]">
        <div class="alert-icon">
          <span v-if="alertVariant === 'success'">✓</span>
          <span v-else-if="alertVariant === 'danger'">✕</span>
          <span v-else-if="alertVariant === 'warning'">⚠</span>
          <span v-else>ℹ</span>
        </div>
        <div class="alert-content">{{ alertMessage }}</div>
        <button class="alert-close" @click="showAlert = false">✕</button>
      </div>
    </div>

    <!-- 主要内容网格 -->
    <div class="main-content">
      <!-- 模块1：多模态信息认知偏差检测模型 -->
      <div class="module-container" style="top: 17vh; left: 3.5vw; width: 45vw; height: 33vh;">
        <div class="module-header">多模态信息认知偏差根因诊断</div>
        <div class="module-body">
          <div class="result-section">
            <div class="section-title">根因诊断与定位结果</div>
            <div class="content-box scrollable" v-html="highlightBrackets(module1BiasTestResult)"></div>
          </div>
          <div class="metric-group">
              <div class="metric-item">认知传播偏差测试结果: 
                <span v-if="module1PropagationBias !== null && module1PropagationBias !== undefined">{{ formatPercent(module1PropagationBias, 0) }}</span>
                <span v-else class="loading-spinner"></span>
              </div>
              <div class="metric-item">是否是偏差模块: 
                <span v-if="module1IsBiasModule !== null && module1IsBiasModule !== undefined">{{ formatYesNo(module1IsBiasModule) }}</span>
                <span v-else class="loading-spinner"></span>
              </div>
          </div>
        </div>
      </div>

      <!-- 模块2：先验知识认知偏差检测模型 -->
      <div class="module-container" style="top: 17vh; right: 3.5vw; width: 45vw; height: 33vh;">
        <div class="module-header">先验知识认知偏差根因诊断</div>
        <div class="module-body">
           <div class="result-section">
              <div class="section-title">根因诊断与定位结果</div>
              <div class="content-box scrollable">
                  <div class="attributes-grid">
                    <div v-for="attr in module2DisplayAttributes" :key="attr.key" 
                         :class="['attribute-item', { 'category-highlight': attr.isCategory }]">
                      <span class="attr-key">{{ attr.key }}:</span>
                      <span class="attr-value" v-html="highlightBrackets(attr.value)"></span>
                    </div>
                  </div>
              </div>
            </div>
          <div class="metric-group">
              <div class="metric-item">模型内部偏差测试结果: 
                <span v-if="module2InternalBias !== null && module2InternalBias !== undefined">{{ formatPercent(module2InternalBias, 0) }}</span>
                <span v-else class="loading-spinner"></span>
              </div>
              <div class="metric-item">认知传播偏差测试结果: 
                <span v-if="module2PropagationBias !== null && module2PropagationBias !== undefined">{{ formatPercent(module2PropagationBias, 0) }}</span>
                <span v-else class="loading-spinner"></span>
              </div>
              <div class="metric-item">是否是偏差模块: 
                <span v-if="module2IsBiasModule !== null && module2IsBiasModule !== undefined">{{ formatYesNo(module2IsBiasModule) }}</span>
                <span v-else class="loading-spinner"></span>
              </div>
          </div>
        </div>
      </div>

      <!-- 模块3：群体协商认知偏差检测模型 -->
      <div class="module-container" style="top: 52vh; left: 3.5vw; width: 45vw; height: 33vh;">
        <div class="module-header">群体协商认知偏差根因诊断</div>
         <div class="module-body">
          <div class="result-section">
            <div class="section-title">根因诊断与定位结果</div>
            <div class="content-box scrollable" v-html="highlightBrackets(module3BiasTestResult)"></div>
          </div>
          <div class="metric-group">
              <div class="metric-item">模型内部偏差测试结果: 
                <span v-if="module3InternalBias !== null && module3InternalBias !== undefined">{{ formatPercent(module3InternalBias, 0) }}</span>
                <span v-else class="loading-spinner"></span>
              </div>
              <div class="metric-item">认知传播偏差测试结果: 
                <span v-if="module3PropagationBias !== null && module3PropagationBias !== undefined">{{ formatPercent(module3PropagationBias, 0) }}</span>
                <span v-else class="loading-spinner"></span>
              </div>
              <div class="metric-item">是否是偏差模块: 
                <span v-if="module3IsBiasModule !== null && module3IsBiasModule !== undefined">{{ formatYesNo(module3IsBiasModule) }}</span>
                <span v-else class="loading-spinner"></span>
              </div>
          </div>
        </div>
      </div>

      <!-- 模块4：决策选择认知偏差检测模型 -->
      <div class="module-container" style="top: 52vh; right: 3.5vw; width: 45vw; height: 33vh;">
        <div class="module-header">决策选择认知偏差检测根因诊断</div>
        <div class="module-body">
          <div class="result-section">
            <div class="section-title">根因诊断与定位结果</div>
            <div class="content-box scrollable" v-html="highlightBrackets(module4BiasTestResult)"></div>
          </div>
          <div class="metric-group">
            <div class="metric-item">模型内部偏差测试结果: 
              <span v-if="module4InternalBias !== null && module4InternalBias !== undefined">{{ formatPercent(module4InternalBias, 0) }}</span>
              <span v-else class="loading-spinner"></span>
            </div>
            <div class="metric-item">是否是偏差模块: 
              <span v-if="module4IsBiasModule !== null && module4IsBiasModule !== undefined">{{ formatYesNo(module4IsBiasModule) }}</span>
              <span v-else class="loading-spinner"></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部内容区域 -->
    <div class="bottom-content">
        <div class="diagnosis-card">根因诊断结果</div>
        <div class="metric-card accuracy-card">
            <div class="metric-title">多主体解析准确率</div>
            <div class="metric-value">
              <span v-if="accuracy !== null && accuracy !== undefined">{{ formatPercent(accuracy, 0) }}</span>
              <span v-else class="loading-spinner loading-spinner-large"></span>
            </div>
        </div>
        <div class="metric-card recall-card">
            <div class="metric-title">不一致根因召回率</div>
            <div class="metric-value">
              <span v-if="recall !== null && recall !== undefined">{{ formatPercent(recall, 0) }}</span>
              <span v-else class="loading-spinner loading-spinner-large"></span>
            </div>
        </div>
        <button class="export-btn" @click="exportResult">结果导出</button>
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
      
      // accuracy/recall 独立轮询控制
      accuracyRecallTimer: null,
      accuracyRecallFetched: false,
      
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
      // 英文键到中文的映射
      const keyMapping = {
        'color': '颜色信息',
        'firepower': '火力信息',
        'model': '型号信息',
        'power': '动力信息',
        'scene': '场景信息',
        'shape': '形状信息',
        'size': '尺寸信息'
      };
      
      const attributes = [];
      if (this.module2Category) {
        attributes.push({ 
          key: '目标类型', 
          value: this.module2Category,
          isCategory: true  // 标记为目标类型，用于特殊样式
        });
      }
      for (const key in this.module2Attributes) {
        if (Object.hasOwnProperty.call(this.module2Attributes, key)) {
          // 使用映射后的中文名称，如果没有映射则使用原英文名
          const displayKey = keyMapping[key] || key;
          attributes.push({ 
            key: displayKey, 
            value: this.module2Attributes[key],
            isCategory: false
          });
        }
      }
      return attributes;
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
    this.initBiasAnalysis();
    this.initAccuracyRecallPolling();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }
    if (this.accuracyRecallTimer) {
      clearInterval(this.accuracyRecallTimer);
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
      // 首先检查 localStorage 是否存在 module5Res
      const module5Result = this.loadModule5FromStorage();
      
      if (module5Result.success) {
        // 存在缓存数据，直接使用
        console.log('✅ 从 localStorage 加载 module5Res 成功，直接显示');
        this.parseStatusData(module5Result.data);
        this.showAlertMessage('success', '诊断结果已加载');
        return; // 不再执行后续的请求和轮询
      }
      
      console.log('📭 localStorage 中不存在 module5Res，开始正常请求流程');
      
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
     * 从 localStorage 加载 module5Res
     */
    loadModule5FromStorage() {
      const MODULE5_KEY = 'module5Res';
      
      try {
        const module5Str = localStorage.getItem(MODULE5_KEY);
        
        if (!module5Str) {
          console.log('📭 localStorage 中不存在 module5Res');
          return { success: false };
        }
        
        console.log('📦 发现 module5Res，开始解析');
        const module5Data = JSON.parse(module5Str);
        
        // 验证数据结构是否完整
        if (!module5Data.modules) {
          console.warn('⚠️ module5Res 数据结构不完整，缺少 modules 字段');
          return { success: false };
        }
        
        console.log('✅ module5Res 解析成功');
        return {
          success: true,
          data: module5Data
        };
        
      } catch (error) {
        console.error('❌ 解析 module5Res 失败:', error);
        return { success: false };
      }
    },
    
    /**
     * 将 module5 结果保存到 localStorage
     */
    saveModule5ToStorage(data) {
      const MODULE5_KEY = 'module5Res';
      
      try {
        // 保存完整的响应数据（不包括 accuracy 和 recall，这两个由独立轮询处理）
        const dataToSave = JSON.stringify(data);
        localStorage.setItem(MODULE5_KEY, dataToSave);
        
        console.log('💾 module5Res 已保存到 localStorage');
      } catch (error) {
        console.error('❌ 保存 module5Res 失败:', error);
      }
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
            
            // 诊断完成时，将结果保存到 localStorage
            this.saveModule5ToStorage(data);
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
      
      // 注意：accuracy 和 recall 不再从这个接口获取，改为独立的延迟轮询
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
     * 注意：null/undefined 的判断已在模板层面处理，此方法仅负责格式化有效值
     */
    formatPercent(value, precision = 2) {
      return `${(value * 100).toFixed(precision)}%`;
    },
    
    /**
     * 格式化是/否
     * 注意：null/undefined 的判断已在模板层面处理，此方法仅负责格式化有效值
     */
    formatYesNo(value) {
      return value ? '是' : '否';
    },
    
    /**
     * 高亮双括号内容（标红并移除括号）并处理换行符
     */
    highlightBrackets(text) {
      if (text === null || text === undefined) return '';
      const str = String(text);
      
      // 先处理双括号高亮
      let result = str.replace(/\{\{([\s\S]*?)\}\}/g, '<span class="highlight-text" style="color:#ff4d4d;font-weight:700;">$1</span>');
      
      // 将 \n 换行符转换为 <br> 标签
      result = result.replace(/\n/g, '<br>');
      
      return result;
    },
    
    /**
     * 显示提示信息
     */
    showAlertMessage(variant, message) {
      this.alertVariant = variant;
      this.alertMessage = message;
      this.showAlert = true;
    },
    
    /**
     * 初始化 accuracy/recall 延迟轮询
     */
    initAccuracyRecallPolling() {
      console.log('🕐 初始化 accuracy/recall 延迟轮询');
      
      // 检查或创建 timestamp
      const timestampData = this.checkOrCreateTimestamp();
      console.log('📅 Timestamp 数据:', timestampData);
      
      // 立即检查一次
      this.checkAndFetchAccuracyRecall(timestampData);
      
      // 启动定时器，每2秒检查一次
      this.accuracyRecallTimer = setInterval(() => {
        if (!this.accuracyRecallFetched) {
          const currentTimestampData = this.getTimestampFromStorage();
          if (currentTimestampData) {
            this.checkAndFetchAccuracyRecall(currentTimestampData);
          }
        } else {
          // 已经获取到数据，停止轮询
          this.stopAccuracyRecallPolling();
        }
      }, 2000);
    },
    
    /**
     * 检查或创建 timestamp
     */
    checkOrCreateTimestamp() {
      const TIMESTAMP_KEY = 'timestamp';
      const existingData = localStorage.getItem(TIMESTAMP_KEY);
      
      if (existingData) {
        try {
          const parsedData = JSON.parse(existingData);
          const currentTime = Date.now();
          
          // 检查是否过期（20分钟）
          if (currentTime > parsedData.expireTime) {
            console.log('⏰ Timestamp 已过期，重新创建');
            return this.createNewTimestamp();
          } else {
            console.log('✅ Timestamp 有效，继续使用');
            return parsedData;
          }
        } catch (e) {
          console.error('❌ 解析 timestamp 失败，重新创建', e);
          return this.createNewTimestamp();
        }
      } else {
        console.log('🆕 Timestamp 不存在，创建新的');
        return this.createNewTimestamp();
      }
    },
    
    /**
     * 创建新的 timestamp
     */
    createNewTimestamp() {
      const TIMESTAMP_KEY = 'timestamp';
      const currentTime = Date.now();
      const timestampData = {
        startTime: currentTime,
        expireTime: currentTime + 20 * 60 * 1000  // 20分钟后过期
      };
      
      localStorage.setItem(TIMESTAMP_KEY, JSON.stringify(timestampData));
      console.log('💾 新 timestamp 已保存:', timestampData);
      
      return timestampData;
    },
    
    /**
     * 从 storage 获取 timestamp
     */
    getTimestampFromStorage() {
      const TIMESTAMP_KEY = 'timestamp';
      const data = localStorage.getItem(TIMESTAMP_KEY);
      if (data) {
        try {
          return JSON.parse(data);
        } catch (e) {
          console.error('❌ 解析 timestamp 失败', e);
          return null;
        }
      }
      return null;
    },
    
    /**
     * 检查并在满足条件时获取 accuracy/recall
     */
    async checkAndFetchAccuracyRecall(timestampData) {
      const currentTime = Date.now();
      const targetTime = timestampData.startTime + 5 * 60 * 1000;  // startTime + 5分钟
      
      if (currentTime >= targetTime) {
        console.log('✅ 已达到5分钟，开始请求 accuracy/recall');
        await this.fetchAccuracyRecall();
      } else {
        const remainingSeconds = Math.ceil((targetTime - currentTime) / 1000);
        console.log(`⏳ 还需等待 ${remainingSeconds} 秒`);
      }
    },
    
    /**
     * 请求 accuracy/recall 接口
     */
    async fetchAccuracyRecall() {
      if (this.accuracyRecallFetched) {
        return;
      }
      
      try {
        console.log('🌐 请求 /module5/api/accuracy_recall 接口');
        const response = await axios.get('/module5/api/accuracy_recall');
        
        if (response.status === 200 && response.data.success) {
          this.accuracy = response.data.accuracy;
          this.recall = response.data.recall;
          this.accuracyRecallFetched = true;
          
          console.log('✅ 成功获取 accuracy/recall:', {
            accuracy: this.accuracy,
            recall: this.recall
          });
          
          // 停止轮询
          this.stopAccuracyRecallPolling();
        }
      } catch (error) {
        console.error('❌ 获取 accuracy/recall 失败:', error);
        // 注意：失败后继续轮询，不停止
      }
    },
    
    /**
     * 停止 accuracy/recall 轮询
     */
    stopAccuracyRecallPolling() {
      if (this.accuracyRecallTimer) {
        clearInterval(this.accuracyRecallTimer);
        this.accuracyRecallTimer = null;
        console.log('🛑 停止 accuracy/recall 轮询');
      }
    },
    
    /**
     * 导出结果
     */
    async exportResult() {
      try {
        const response = await axios.get('/module5/api/download', {
          responseType: 'blob' // 重要：告诉axios这是二进制数据
        });
        
        // 创建一个 Blob URL
        const url = window.URL.createObjectURL(new Blob([response.data]));
        
        // 创建一个隐藏的 <a> 标签来触发下载
        const link = document.createElement('a');
        link.href = url;
        
        // 从响应头中获取文件名，如果没有则使用默认名称
        const contentDisposition = response.headers['content-disposition'];
        let filename = 'result.zip'; // 默认文件名
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '');
            // 对文件名进行URL解码，处理中文等特殊字符
            try {
              filename = decodeURIComponent(filename);
              // 去掉文件名开头的 UTF-8 或 utf-8 前缀
              filename = filename.replace(/^UTF-8/i, '');
            } catch (e) {
              console.warn('文件名解码失败，使用原始文件名', e);
            }
          }
        }
        link.setAttribute('download', filename);
        
        document.body.appendChild(link);
        link.click();
        
        // 清理
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
      } catch (error) {
        console.error('导出失败:', error);
      }
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
.header-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  flex-shrink: 0;
  padding: 0 20px;
  height: 60px;
  z-index: 10;
}

.header-btn {
  background: none;
  border: none;
  cursor: pointer;
  width: 120px;
  height: 40px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: bold;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.btn-home {
  background-image: url('~@/assets/images/step1/-s-按钮-蓝色.png');
  margin-right: 10px;
}

.btn-back {
  background-image: url('~@/assets/images/step1/-s-按钮-蓝色-1.png');
}

/* ================= 提示信息 ================= */
.alert-container {
  position: absolute;
  top: 10vh;
  left: 50%;
  transform: translateX(-50%);
  width: 50%;
  z-index: 100;
}

.custom-alert {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-radius: 6px;
  background: linear-gradient(135deg, rgba(10, 30, 60, 0.95) 0%, rgba(20, 50, 90, 0.95) 100%);
  border: 2px solid #1a65a8;
  box-shadow: 0 0 20px rgba(26, 101, 168, 0.5), 
              0 0 40px rgba(26, 101, 168, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  animation: slideInDown 0.4s ease-out;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert-icon {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  margin-right: 12px;
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
  font-size: 14px;
  line-height: 1.4;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Arial', sans-serif;
}

.alert-close {
  width: 20px;
  height: 20px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #8bd3f9;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  margin-left: 12px;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.alert-close:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #c6f4ff;
  transform: scale(1.1);
}

/* Success - 成功（蓝绿色） */
.alert-success {
  border-color: #00d4aa;
  box-shadow: 0 0 20px rgba(0, 212, 170, 0.5), 
              0 0 40px rgba(0, 212, 170, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.alert-success .alert-icon {
  background: linear-gradient(135deg, #00d4aa 0%, #00a88a 100%);
  color: #fff;
  box-shadow: 0 0 15px rgba(0, 212, 170, 0.6);
}

.alert-success .alert-content {
  color: #00ffcc;
}

/* Info - 信息（科技蓝） */
.alert-info {
  border-color: #4ED8FF;
  box-shadow: 0 0 20px rgba(78, 216, 255, 0.5), 
              0 0 40px rgba(78, 216, 255, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.alert-info .alert-icon {
  background: linear-gradient(135deg, #4ED8FF 0%, #1a8fc9 100%);
  color: #fff;
  box-shadow: 0 0 15px rgba(78, 216, 255, 0.6);
}

.alert-info .alert-content {
  color: #8bd3f9;
}

/* Warning - 警告（黄色） */
.alert-warning {
  border-color: #ffb74d;
  box-shadow: 0 0 20px rgba(255, 183, 77, 0.5), 
              0 0 40px rgba(255, 183, 77, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.alert-warning .alert-icon {
  background: linear-gradient(135deg, #ffb74d 0%, #ff9800 100%);
  color: #fff;
  box-shadow: 0 0 15px rgba(255, 183, 77, 0.6);
}

.alert-warning .alert-content {
  color: #ffcc80;
}

/* Danger - 错误（红色） */
.alert-danger {
  border-color: #ff4d4d;
  box-shadow: 0 0 20px rgba(255, 77, 77, 0.5), 
              0 0 40px rgba(255, 77, 77, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.alert-danger .alert-icon {
  background: linear-gradient(135deg, #ff4d4d 0%, #d32f2f 100%);
  color: #fff;
  box-shadow: 0 0 15px rgba(255, 77, 77, 0.6);
}

.alert-danger .alert-content {
  color: #ff8a80;
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
  padding-left: 70px;
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
  padding-left: 5px;
}

.content-box {
  flex: 1;
  line-height: 1.6;
  padding: 0 5px;
  font-size: 14px !important;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Arial', sans-serif !important;
  white-space: pre-wrap; /* 保留空白符和换行符 */
  word-wrap: break-word; /* 长单词换行 */
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

.category-highlight {
  background: rgba(255, 223, 100, 0.25) !important;
  border-left: 2px solid #ffd700 !important;
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

/* ================= 加载转圈动画 ================= */
.loading-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(78, 216, 255, 0.2);
  border-top-color: #4ED8FF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  vertical-align: middle;
  margin-left: 0.3em;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 针对底部大字体的加载动画 */
.loading-spinner-large {
  width: 28px;
  height: 28px;
  border-width: 3px;
  border-color: rgba(78, 216, 255, 0.2);
  border-top-color: #4ED8FF;
  margin-left: 0;
}

</style>

