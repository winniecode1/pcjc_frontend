<template>
  <div class="section">
    <div class="img_box"></div>

    <!-- 顶部导航栏 -->
    <b-row class="header-bar align-item-s-center no-gutters">
      <b-col cols="3" class="text-left">
        <button class="header-btn btn-home" @click="navigateHome">首页</button>
        <button class="header-btn btn-back" @click="navigateBack">返回</button>
      </b-col>
      <b-col cols="6" class="text-center">
        <!-- <h1 class="header-title">群体协商认知偏差检测模型</h1> -->
      </b-col>
      <b-col cols="3" class="text-right">
        <button class="header-btn btn-next" @click="navigateNext">下个页面</button>
      </b-col>
    </b-row>

    <!-- 主要内容区域 -->
    <div class="row content-row">
      <!-- 左侧视频和按钮区域 -->
      <div class="design-left-column">
        <div class="design-module video-module">
          <div class="panel-header">先验知识传播结果</div>
          <div class="design-module-content video-content-wrapper">
            <video
              v-if="videoUrl"
              ref="resultVideo"
              :src="videoUrl"
              controls
              autoplay
              loop
              muted
              playsinline
              class="video-display"
              @error="handleVideoError"
            ></video>
            <div v-else class="placeholder-text">
              {{ videoMessage }}
            </div>
          </div>
        </div>

        <div class="design-module text-module-left fixed-left-text">
          <div class="panel-header">属性信息</div>
          <div class="design-module-content text-scrollable">
            <div class="description-box attribute-content">
              <ul class="info-list" v-if="attributeInfoList && attributeInfoList.length > 0">
                <li 
                  v-for="(item, idx) in attributeInfoList" 
                  :key="'attr-' + idx"
                  :class="{ 'first-item': item.includes('小类信息') }"
                >
                  {{ item }}
                </li>
              </ul>
              <p class="text-content text-muted" v-else>暂无属性信息</p>
            </div>
          </div>
        </div>

        <div class="button-container">
          <button @click="startNegotiation" class="btn-start-detect" :disabled="!isApiLoaded || isLoading">
            <span>{{ isLoading ? '协商中...' : '群体协商' }}</span>
          </button>
        </div>
      </div>

      <!-- 中间：智能体推理 -->
      <div class="col-md-5 middle-column">
        <div class="panel-left h-100">
          <div class="panel-content">
            <!-- 一轮推理 -->
            <div class="panel-header mb-3">一轮推理</div>
            
            <div class="reasoning-section">
              <!-- 智能体A推理结果 -->
              <div class="agent-box">
                <div class="agent-header">
                  <img class="agent-avatar" :src="require('@/assets/images/step3/agent.png')" alt="Agent" />
                  <div class="agent-label">智能体A</div>
                </div>
                <div class="agent-content">
                  <div v-if="isLoadingRound1" class="panel-overlay">加载中...</div>
                  <p v-if="typeof agentARound1Result === 'object' && agentARound1Result !== null" class="agent-result">
                    <span class="result-line">推理型号：{{ agentARound1Result.model_name || '***' }}</span>
                    <span class="result-line">推理依据：{{ agentARound1Result.reason || '***' }}</span>
                  </p>
                  <p v-else class="agent-result">{{ agentARound1Result || '推理型号：***\n推理依据：***' }}</p>
                </div>
              </div>

              <!-- 智能体B推理结果 -->
              <div class="agent-box">
                <div class="agent-header">
                  <img class="agent-avatar" :src="require('@/assets/images/step3/agent.png')" alt="Agent" />
                  <div class="agent-label">智能体B</div>
                </div>
                <div class="agent-content">
                  <div v-if="isLoadingRound1" class="panel-overlay">加载中...</div>
                  <p v-if="typeof agentBRound1Result === 'object' && agentBRound1Result !== null" class="agent-result">
                    <span class="result-line">推理型号：{{ agentBRound1Result.model_name || '***' }}</span>
                    <span class="result-line">推理依据：{{ agentBRound1Result.reason || '***' }}</span>
                  </p>
                  <p v-else class="agent-result">{{ agentBRound1Result || '推理型号：***\n推理依据：***' }}</p>
                </div>
              </div>

              <!-- 智能体C推理结果 -->
              <div class="agent-box">
                <div class="agent-header">
                  <img class="agent-avatar" :src="require('@/assets/images/step3/agent.png')" alt="Agent" />
                  <div class="agent-label">智能体C</div>
                </div>
                <div class="agent-content">
                  <div v-if="isLoadingRound1" class="panel-overlay">加载中...</div>
                  <p v-if="typeof agentCRound1Result === 'object' && agentCRound1Result !== null" class="agent-result">
                    <span class="result-line">推理型号：{{ agentCRound1Result.model_name || '***' }}</span>
                    <span class="result-line">推理依据：{{ agentCRound1Result.reason || '***' }}</span>
                  </p>
                  <p v-else class="agent-result">{{ agentCRound1Result || '推理型号：***\n推理依据：***' }}</p>
                </div>
              </div>
            </div>

            <!-- 二轮推理 -->
            <div class="panel-header my-3">二轮推理</div>
            
            <div class="reasoning-section">
              <!-- 智能体A-B协商 -->
              <div class="agent-box negotiation">
                <div class="agent-header">
                  <img class="agent-avatar" :src="require('@/assets/images/step3/agents.png')" alt="Agents" />
                  <!-- <div class="negotiation-sign">⇄</div>
                  <img class="agent-avatar" :src="require('@/assets/images/step3/agents.png')" alt="Agents" /> -->
                  <div class="agent-label">A&B</div>
                </div>
                <div class="agent-content">
                  <div v-if="isLoadingRound2" class="panel-overlay">加载中...</div>
                  <p v-if="typeof agentABNegotiation === 'object' && agentABNegotiation !== null" class="agent-result">
                    <span class="result-line">推理型号：{{ agentABNegotiation.model_name || '***' }}</span>
                    <span class="result-line">推理依据：{{ agentABNegotiation.reason || '***' }}</span>
                  </p>
                  <p v-else class="agent-result">{{ agentABNegotiation || '推理型号：***\n协商过程：***' }}</p>
                </div>
              </div>

              <!-- 智能体B-C协商 -->
              <div class="agent-box negotiation">
                <div class="agent-header">
                  <img class="agent-avatar" :src="require('@/assets/images/step3/agents.png')" alt="Agents" />
                  <!-- <div class="negotiation-sign">⇄</div>
                  <img class="agent-avatar" :src="require('@/assets/images/step3/agents.png')" alt="Agents" /> -->
                  <div class="agent-label">B&C</div>
                </div>
                <div class="agent-content">
                  <div v-if="isLoadingRound2" class="panel-overlay">加载中...</div>
                  <p v-if="typeof agentBCNegotiation === 'object' && agentBCNegotiation !== null" class="agent-result">
                    <span class="result-line">推理型号：{{ agentBCNegotiation.model_name || '***' }}</span>
                    <span class="result-line">推理依据：{{ agentBCNegotiation.reason || '***' }}</span>
                  </p>
                  <p v-else class="agent-result">{{ agentBCNegotiation || '推理型号：***\n协商过程：***' }}</p>
                </div>
              </div>

              <!-- 智能体C-A协商 -->
              <div class="agent-box negotiation">
                <div class="agent-header">
                  <img class="agent-avatar" :src="require('@/assets/images/step3/agents.png')" alt="Agents" />
                  <!-- <div class="negotiation-sign">⇄</div>
                  <img class="agent-avatar" :src="require('@/assets/images/step3/agents.png')" alt="Agents" /> -->
                  <div class="agent-label">C&A</div>
                </div>
                <div class="agent-content">
                  <div v-if="isLoadingRound2" class="panel-overlay">加载中...</div>
                  <p v-if="typeof agentCANegotiation === 'object' && agentCANegotiation !== null" class="agent-result">
                    <span class="result-line">推理型号：{{ agentCANegotiation.model_name || '***' }}</span>
                    <span class="result-line">推理依据：{{ agentCANegotiation.reason || '***' }}</span>
                  </p>
                  <p v-else class="agent-result">{{ agentCANegotiation || '推理型号：***\n协商过程：***' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：协商结果 -->
      <div class="col-md-3 right-column">
        <div class="panel-right-bias-button">
          <button
            class="btn-bias-detect"
            @click="handleBiasDetect"
            :disabled="isRightLoadingResults || isRightLoadingAccuracy || isLoadingRound1 || isLoadingRound2"
          >
            偏差检测
          </button>
        </div>
        <div class="panel-right-top">
          <div class="panel-content">
            <div class="panel-header header-results" style="margin-top: 0px;">群体协商认知偏差检测结果</div>
            <div v-if="isRightLoadingResults" class="panel-overlay">加载中...</div>
            <template v-else>
              <div class="result-section result-section-main">
                <div class="section-header">共识摘要：</div>
                <div class="section-content">
                  <p class="result-text" v-html="formattedConsensusSummary || '***'"></p>
                </div>
              </div>
              
              <div class="result-section">
                <div class="section-header">分歧点：</div>
                <div class="section-content">
                  <p class="result-text" v-html="formattedDisagreementPoints || '***'"></p>
                </div>
              </div>
            </template>
          </div>
        </div>

        <div class="panel-right-bottom" style="margin-top: -10px;">
          <div class="panel-content">
            <div v-if="isRightLoadingResults" class="panel-overlay">加载中...</div>
            <template v-else>
              <div class="final-result-section">
                <div class="final-result-title">协商后详细型号</div>
                <div class="final-model-display">
                  <p class="final-model-text">{{ finalResult || 'MiG-25Foxbat' }}</p>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- 偏差检测准确率面板 -->
        <div class="panel-right-accuracy">
          <template v-if="isRightLoadingAccuracy">
            <div class="loading-spinner">加载中...</div>
          </template>
          <template v-else>
            <div class="accuracy-content">
              <span class="accuracy-label">偏差检测准确率</span>
              <span class="accuracy-value">
                <template v-if="accuracyRate !== '—' && accuracyRate !== null && accuracyRate !== undefined && accuracyRate !== ''">
                  {{ formattedAccuracyRate }}%
                </template>
                <template v-else>
                  N/A
                </template>
              </span>
            </div>
          </template>
        </div>

        <!-- 结果导出按钮 -->
        <div class="panel-right-button">
          <button @click="exportResults" class="btn-export-result" :disabled="isLoading">
            结果导出
          </button>
        </div>
      </div>
    </div>

  </div>
</template><script>
import axios from 'axios';
// img_path地址（模块一传参）
// const IMG_PATH_URL = localStorage.getItem('imagePath') || '/home/wuzhixuan/Project/PCJC/module2/images_frame/B-2幽灵-2.png';
// const DEVICE_TYPE = localStorage.getItem('deviceType') || '飞机';
let IMG_PATH_URL = '/home/wuzhixuan/Project/PCJC/module2/images_frame/B-2幽灵-2.png';
let DEVICE_TYPE = '飞机';
const module1ResStr = localStorage.getItem('module1Res');
    if (module1ResStr) {
      const module1Res = JSON.parse(module1ResStr);
      // 获取并清理key_frame_path
      if (module1Res.key_frame_path) {
        IMG_PATH_URL = module1Res.key_frame_path.trim().replace(/^[`'"\s]+|[`'"\s]+$/g, '');
      }
      // 获取并清理deviceType
      if (module1Res.deviceType) {
        DEVICE_TYPE = module1Res.deviceType.trim().replace(/^[`'"\s]+|[`'"\s]+$/g, '');
      }
    }
console.log('IMG_PATH_URL:', IMG_PATH_URL, 'DEVICE_TYPE:', DEVICE_TYPE)
export default {
  name: 'GroupNegotiation',
  data() {
    return {
      fullWidth: window.innerWidth,
      fullHeight: window.innerHeight,
      originalImageURL: null,
      attributeInfo: "各种属性信息的文本显示",
      attributeInfoArray: ['Value 1', 'Value 2', 'Value 3', 'Value 4'],
      attributeInfoList: [],
      // 一轮推理结果
      agentARound1Result: "",
      agentBRound1Result: "",
      agentCRound1Result: "",
      // 二轮协商结果
      agentABNegotiation: "",
      agentBCNegotiation: "",
      agentCANegotiation: "",
      deviationProcess: "",
      finalResult: "群体协商之后的结果",
      isLoading: false,
      accuracyRate: '—',
      color: '',
      kind: '',
      shape: '',
      ground_truth: '',
      isApiLoaded: false, // 新增：接口加载状态，控制按钮禁用
      consensusSummary: "",
      disagreementPoints: "",
      differentModelAndReason: "",
      // 视频相关数据
      videoUrl: null,
      videoMessage: '正在从 LocalStorage 加载视频...',
      // 中间区域加载与显示控制
      isLoadingRound1: false,
      isLoadingRound2: false,
      isRound1Displayed: false,
      isRound2Displayed: false,
      // 右侧分步显示控制
      isRightLoadingResults: false,
      isRightLoadingAccuracy: false,
      pendingNegotiationResult: null // 新增：暂存群体协商结果
    };
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  computed: {
    // 格式化共识摘要，将需要标红的文字加上红色样式
    formattedConsensusSummary() {
      let summary = this.consensusSummary;
      
      // 如果分歧点不是'无'，则标红显示
      if (this.disagreementPoints && this.disagreementPoints !== '无') {
        summary = summary.replace(
          new RegExp(this.disagreementPoints, 'g'),
          `<span style="color: red; font-weight: bold;">${this.disagreementPoints}</span>`
        );
      }
      
      // 如果不同型号及原因不是'无'，则标红显示
      if (this.differentModelAndReason && this.differentModelAndReason !== '无') {
        summary = summary.replace(
          new RegExp(this.differentModelAndReason, 'g'),
          `<span style="color: red; font-weight: bold;">${this.differentModelAndReason}</span>`
        );
      }
      
      return summary;
    },
    // 格式化分歧点，高亮显示特定部分
    formattedDisagreementPoints() {
      let points = this.disagreementPoints;
      
      // 如果有需要高亮的部分，则用红色样式包裹
      if (this.disagreementPointsHighlight && this.disagreementPointsHighlight !== '无' && points) {
        points = points.replace(
          new RegExp(this.disagreementPointsHighlight, 'g'),
          `<span style="color: red; font-weight: bold;">${this.disagreementPointsHighlight}</span>`
        );
      }
      
      return points;
    },
    // 格式化准确率显示
    formattedAccuracyRate() {
      if (this.accuracyRate === '—' || this.accuracyRate === null || this.accuracyRate === undefined || this.accuracyRate === '') {
        return 'N/A';
      }
      // 如果是数字，转换为百分比
      const numValue = typeof this.accuracyRate === 'number' ? this.accuracyRate : parseFloat(this.accuracyRate);
      if (!isNaN(numValue)) {
        // 如果值在 0-1 之间，转换为百分比
        if (numValue <= 1 && numValue >= 0) {
          return (numValue * 100).toFixed(2);
        }
        // 如果已经是百分比形式，直接返回（保留两位小数）
        return numValue.toFixed(2);
      }
      // 如果不是数字，直接返回原值
      return String(this.accuracyRate);
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    // 页面加载时加载视频
    this.loadVideoFromStorage();
    // 若视频可播放，尝试自动播放
    this.$nextTick(() => {
      if (this.$refs.resultVideo && typeof this.$refs.resultVideo.play === 'function') {
        try { this.$refs.resultVideo.play(); } catch (e) {}
      }
    });
    
    // 从localStorage读取预测信息
    this.loadPredictInfoFromStorage();
    // 从localStorage读取模块三结果
    this.loadModule3ResultsFromStorage();
  },
  methods: {
    // 导航到首页
    navigateHome() {
      this.$router.push('/');
    },
    // 返回上一页
    navigateBack() {
      this.$router.push('/prior-knowledge');
    },
    // 导航到下一页
    navigateNext() {
      // 这里可以设置下一个页面的路由
      this.$router.push('/decisionmaking');
    },
    // 从localStorage加载预测信息
    loadPredictInfoFromStorage() {
      try {
        const storedPredictInfo = localStorage.getItem('predictInfoList');
        if (storedPredictInfo) {
          const predictInfoList = JSON.parse(storedPredictInfo);
          console.log('从localStorage读取到预测信息:', predictInfoList);
          
          // 从预测信息中提取所需的数据
          const predictData = {};
          predictInfoList.forEach(item => {
            if (item.label.includes('小类')) predictData.kind = item.value;
            if (item.label.includes('火力')) predictData.firepower = item.value;
            if (item.label.includes('颜色')) predictData.color = item.value;
            if (item.label.includes('形状')) predictData.shape = item.value;
            if (item.label.includes('尺寸')) predictData.size = item.value;
            if (item.label.includes('动力')) predictData.power = item.value;
            if (item.label.includes('场景')) predictData.scene = item.value;
          });

          // 设置属性信息，去除括号及其内容
          this.attributeInfoList = [
            `小类信息：${predictData.kind ? predictData.kind.replace(/\s*\([^)]*\)/g, '') : '未知'}`,
            `火力信息：${predictData.firepower ? predictData.firepower.replace(/\s*\([^)]*\)/g, '') : '未知'}`,
            `颜色信息：${predictData.color ? predictData.color.replace(/\s*\([^)]*\)/g, '') : '未知'}`,
            `形状信息：${predictData.shape ? predictData.shape.replace(/\s*\([^)]*\)/g, '') : '未知'}`,
            `尺寸信息：${predictData.size ? predictData.size.replace(/\s*\([^)]*\)/g, '') : '未知'}`,
            `动力信息：${predictData.power ? predictData.power.replace(/\s*\([^)]*\)/g, '') : '未知'}`,
            `场景信息：${predictData.scene ? predictData.scene.replace(/\s*\([^)]*\)/g, '') : '未知'}`,
          ];
          
          // 设置其他需要的变量
          // 去除括号及其内容
          this.color = predictData.color;
          this.kind = predictData.kind;
          this.shape = predictData.shape;

          // 安全读取 module2Res，避免在 localStorage 中缺失或结构不符合时抛出异常
          let module2Res = null;
          try {
            const module2ResStr = localStorage.getItem('module2Res');
            if (module2ResStr) {
              module2Res = JSON.parse(module2ResStr);
            }
          } catch (e) {
            console.warn('解析 module2Res 失败:', e);
            module2Res = null;
          }
          // 这里如果没有ground_truth，可以设置一个默认值或空值
          if (
            module2Res &&
            module2Res.result &&
            Array.isArray(module2Res.result) &&
            module2Res.result[0] &&
            Array.isArray(module2Res.result[0]) &&
            module2Res.result[0][0] &&
            module2Res.result[0][0].model
          ) {
            this.ground_truth = module2Res.result[0][0].model;
          } else {
            this.ground_truth = '';
          }
          
          // 保留原来的 attributeInfo 用于兼容
          this.attributeInfo = this.attributeInfoList.join('\n');
          this.isApiLoaded = true; // 数据加载完成，解锁按钮
        } else {
          console.warn('localStorage中没有找到预测信息');
          // 如果localStorage中没有数据，可以回退到原来的API请求
          this.fetchPredictInfoFromApi();
        }
      } catch (error) {
        console.error('读取localStorage数据失败:', error);
        // 出错时回退到API请求
        this.fetchPredictInfoFromApi();
      }
    },
    // 原有的API请求方法作为备用
    fetchPredictInfoFromApi() {
      axios.get('http://10.109.253.71:8001/module2/list', {
        params: {
          img_path: `${IMG_PATH_URL}`,
          device_type: `${DEVICE_TYPE}`
        }
      }).then(res => {
        const data = res.data;
        
        // 处理预测信息
        if (data.result && data.result.length > 0 && data.result[0].length > 0) {
          const predictData = data.result[0][0];
          this.attributeInfoList = [
            `小类信息：${predictData.kind || '未知'}`,
            `火力信息：${predictData.firepower || '未知'}`,
            `颜色信息：${predictData.color || '未知'}`,
            `形状信息：${predictData.shape || '未知'}`,
            `尺寸信息：${predictData.size || '未知'}`,
            `动力信息：${predictData.power || '未知'}`,
            `场景信息：${predictData.scene || '未知'}`,
          ];
          this.color = predictData.color;
          this.kind = predictData.kind;
          this.shape = predictData.shape;
          this.ground_truth = predictData.model;
        }
        // 保留原来的 attributeInfo 用于兼容
        this.attributeInfo = this.attributeInfoList.join('\n');
        this.isApiLoaded = true; // 接口成功返回，解锁按钮
      }).catch(err => {
        console.error(err.response && err.response.data || err);
      });
    },
    // 从 LocalStorage 加载视频
    loadVideoFromStorage() {
      try {
        // 先获取整个module1Res对象
        const module1ResStr = localStorage.getItem('module1Res');
        console.log("从 LocalStorage 读取 'module1Res':", module1ResStr ? '存在' : '不存在');
        
        if (module1ResStr) {
          const module1Res = JSON.parse(module1ResStr);
          // 从对象中获取originalVideoPath
          const videoPath = module1Res.originalVideoPath;
          console.log("从 module1Res 中获取 originalVideoPath:", videoPath);
          
          // 清理可能存在的空格和反引号
          const cleanedVideoPath = videoPath ? videoPath.trim().replace(/^[`'"\s]+|[`'"\s]+$/g, '') : null;
          
          if (cleanedVideoPath && cleanedVideoPath !== '无原视频路径') {
            this.videoUrl = cleanedVideoPath;
          } else {
            this.videoMessage = '未在 module1Res 中找到有效 "originalVideoPath"。';
            console.warn(this.videoMessage);
          }
        } else {
          this.videoMessage = '未在 LocalStorage 中找到 "module1Res"。';
          console.warn(this.videoMessage);
        }
      } catch (e) {
        console.error('加载视频失败:', e);
        this.videoMessage = '加载视频时出错: ' + e.message;
      }
    },

    // 处理视频加载错误
    handleVideoError(e) {
      console.error("视频加载失败:", e);
      this.videoMessage = "视频加载失败，请检查 LocalStorage 中的 URL 是否正确。";
      this.videoUrl = null;
    },
    handleResize() {
      this.fullWidth = window.innerWidth;
      this.fullHeight = window.innerHeight;
    },
    startNegotiation() {
      console.log("开始群体协商");
      this.startInfer();
    },
    exportResults() {
      // 结果导出功能
      console.log('导出结果');
      alert('结果导出功能已触发');
    },
    
    // 读取本地已存在的模块三结果并直接回显
    loadModule3ResultsFromStorage() {
      try {
        const stored = localStorage.getItem('module3Res');
        if (!stored) return;
        const data = JSON.parse(stored);
        if (!data) return;
        // 回显所有结果（直接显示两轮与右侧结果）
        this.finalResult = data.final_model_name;
        this.consensusSummary = (data.final_review && data.final_review.consensus_summary) || '';
        this.disagreementPoints = (data.final_review && data.final_review.deviation_analysis) || '';
        this.disagreementPointsHighlight = (data.final_review && data.final_review.deviation_analysis_report) || '';
        this.agentARound1Result = (data.negotiation_details && data.negotiation_details.initial_analyses && data.negotiation_details.initial_analyses.Agent_A) || '';
        this.agentBRound1Result = (data.negotiation_details && data.negotiation_details.initial_analyses && data.negotiation_details.initial_analyses.Agent_B) || '';
        this.agentCRound1Result = (data.negotiation_details && data.negotiation_details.initial_analyses && data.negotiation_details.initial_analyses.Agent_C) || '';
        this.agentABNegotiation = (data.negotiation_details && data.negotiation_details.negotiation_results && data.negotiation_details.negotiation_results.Agent_A) || '';
        this.agentBCNegotiation = (data.negotiation_details && data.negotiation_details.negotiation_results && data.negotiation_details.negotiation_results.Agent_B) || '';
        this.agentCANegotiation = (data.negotiation_details && data.negotiation_details.negotiation_results && data.negotiation_details.negotiation_results.Agent_C) || '';
        this.accuracyRate = (data.accuracy !== undefined && data.accuracy !== null) ? data.accuracy : '—';
        this.isRound1Displayed = true;
        this.isRound2Displayed = true;
        this.isLoadingRound1 = false;
        this.isLoadingRound2 = false;
        this.isRightLoadingResults = false;
        this.isRightLoadingAccuracy = false;
        console.log('已从 localStorage 回显 module3Res');
      } catch (e) {
        console.warn('读取 module3Res 失败：', e);
      }
    },

    async startInfer() {
      // 改为仅中间区域显示加载
      this.isLoading = false;
      this.isLoadingRound1 = true;
      this.isLoadingRound2 = true;
      this.isRound1Displayed = false;
      this.isRound2Displayed = false;
      const module1ResStr = localStorage.getItem('module1Res');
      // 安全解析 module1Res，避免 localStorage 缺失或格式错误导致抛出异常
      let imgPath = '';
      if (module1ResStr) {
        try {
          const module1Res = JSON.parse(module1ResStr);
          imgPath = (module1Res.key_frame_path || '').trim().replace(/^[`'"\s]+|[`'"\s]+$/g, '');
        } catch (e) {
          console.warn('解析 module1Res 失败:', e);
          imgPath = '';
        }
      }
      console.log("从 LocalStorage 读取 'imagePath':", imgPath);
      const resdata = {
        color: this.color,
        kind: this.kind,
        shape: this.shape,
        image_path: imgPath,
        ground_truth: this.ground_truth
      };
      console.log("发送的推理数据:", resdata);
      try {
        // 模拟API调用，实际使用时替换为真实API
        const response = await axios.post('/module3/refine', resdata, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const data = response.data;
        
        // 模拟数据 - 实际使用时从API响应获取
        console.log("推理请求成功，结果:", data);
          // 只暂存结果，不直接显示
          this.pendingNegotiationResult = data;

        // 立刻显示一轮推理
        this.agentARound1Result = (data.negotiation_details && data.negotiation_details.initial_analyses && data.negotiation_details.initial_analyses.Agent_A) || '';
        this.agentBRound1Result = (data.negotiation_details && data.negotiation_details.initial_analyses && data.negotiation_details.initial_analyses.Agent_B) || '';
        this.agentCRound1Result = (data.negotiation_details && data.negotiation_details.initial_analyses && data.negotiation_details.initial_analyses.Agent_C) || '';
        this.isLoadingRound1 = false;
        this.isRound1Displayed = true;

        // 3秒后显示二轮协商结果
        setTimeout(() => {
          this.agentABNegotiation = (data.negotiation_details && data.negotiation_details.negotiation_results && data.negotiation_details.negotiation_results.Agent_A) || '';
          this.agentBCNegotiation = (data.negotiation_details && data.negotiation_details.negotiation_results && data.negotiation_details.negotiation_results.Agent_B) || '';
          this.agentCANegotiation = (data.negotiation_details && data.negotiation_details.negotiation_results && data.negotiation_details.negotiation_results.Agent_C) || '';
          this.isLoadingRound2 = false;
          this.isRound2Displayed = true;
        }, 3000);

        localStorage.setItem('module3Res', JSON.stringify(response.data));
        console.log('模块3返回值已存入localStorage');
        // 【新增】方便调试：打印 localStorage
          console.log("--- localStorage 已更新 (模块三) ---");
          console.log("module3Res:", localStorage.getItem('module3Res'));
          console.log("---------------------------------");
      } catch (error) {
        console.error("推理请求失败:", error);
        this.finalResult = "推理失败: " + (error.response && error.response.data && error.response.data.error) || error.message;
      } finally {
        // 全局不显示遮罩，这里不再处理 isLoading
      }
    },

    // 右侧偏差检测按钮：不再请求后端，分步显示
    handleBiasDetect() {
      // 从 localStorage 解析
      let data = null;
      if (!data) {
        try {
          const stored = localStorage.getItem('module3Res');
          if (stored) {
            data = JSON.parse(stored);
          }
        } catch (e) {
          console.warn('解析 module3Res 失败:', e);
          data = null;
        }
      }

      if (!data) {
        alert('请先进行群体协商，以获取完整结果。');
        return;
      }

      // 赋值到显示变量
      this.finalResult = data.final_model_name;
      this.consensusSummary = (data.final_review && data.final_review.consensus_summary) || '';
      this.disagreementPoints = (data.final_review && data.final_review.deviation_analysis) || '';
      this.disagreementPointsHighlight = (data.final_review && data.final_review.deviation_analysis_report) || '';
      this.accuracyRate = (data.accuracy !== undefined && data.accuracy !== null) ? data.accuracy : '—';

      // 触发右侧加载流程
      this.isRightLoadingResults = true;
      this.isRightLoadingAccuracy = true;
      // 2秒后显示结果与型号
      setTimeout(() => {
        this.isRightLoadingResults = false;
      }, 2000);
      // 3分钟后显示准确率
      setTimeout(() => {
        this.isRightLoadingAccuracy = false;
      }, 3 * 60 * 1000);
    }
  }
};
</script>

<style lang="scss" scoped>
/* * =========================================
 * 新UI样式（暗黑科技风）
 * =========================================
 */

/* 1. 全局和背景 */
.section {
  width: 100%;
  min-height: 100vh;
  color: #fff;
  font-family: "Helvetica Neue", "Microsoft YaHei", sans-serif;
  z-index: 1;
  padding: 10px;
  margin: 0;
  background-color: transparent;
  display: flex;
  flex-direction: column;
  position: relative;
}

.img_box {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('~@/assets/images/step3/bg.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center top;
  opacity: 1;
  z-index: 0;
  pointer-events: none;
}

/* 2. 顶部标题栏 */
.header-bar {
  width: 100%;
  flex-shrink: 0;
  padding: 0 20px;
  height: 60px;
  position: relative;
  z-index: 10;
}

.header-title {
  font-size: calc(1.2vw + 0.8rem);
  color: #00e5ff;
  font-weight: bolder;
  letter-spacing: 0.1em;
  margin: 0;
  text-shadow: 0 0 5px #00e5ff;
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
  margin: 0 5px;
}

.btn-home {
  background-image: url('~@/assets/images/step4/首页按键.png');
}

.btn-back {
  background-image: url('~@/assets/images/step1/-s-按钮-蓝色-1.png');
}

.btn-next {
  background-image: url('~@/assets/images/step1/-s-按钮-蓝色-1.png');
}

/* 3. 核心内容区 */
.middle-column .panel-left .panel-content {
  background-image: none !important;
  margin: 0;
  padding: 0 !important;
}

.content-row {
  flex-grow: 1;
  width: 100%;
  max-width: 100%;
  margin: 0;
  margin-left: 50px;
  position: relative;
  z-index: 2;
}

/* 三列通用高度 */
.design-left-column,
.left-column,
.middle-column,
.right-column {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  /* 减去顶部栏高度 */
  padding: 0 !important;
}

.design-left-column {
  width: 25%;
  gap: 15px;
}

.middle-column {
  width: 45%;
  gap: 20px;
}

.right-column {
  width: 30%;
  gap: 5px;
  position: relative;
  z-index: 2;
}

.panel-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  width: 100%;
  background: none;
  padding: 0;
  margin: 0;
  position: relative;
}

/* 面板通用样式 */
[class^="panel-"]:not(.panel-right-top):not(.panel-right-bottom):not(.panel-header):not(.panel-right-button):not(.panel-right-accuracy), .design-module {
  width: 100%;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  padding: 20px 30px 30px 30px;
  display: flex;
  flex-direction: column;
  background-image: url('~@/assets/images/step1/-s-弹框-选择数据.png');
}


/* 特定面板的高度和边距 */
.panel-left {
  flex-grow: 1;
  height: 100%;
  background-image: url('~@/assets/images/step1/-s-弹框-选择数据.png');
}

.panel-right-top {
  height: 55%;
  flex-shrink: 0;
  width: 100%;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  margin-bottom: 20px;
}

.panel-right-top .panel-content {
  display: flex;
  flex-direction: column;
}

/* 右侧顶部面板内：共识摘要与分歧点按3:2比例分配可用高度 */
.panel-right-top .result-section {
  display: flex;
  flex-direction: column;
  /* 作为基线占位，具体比例在下面两个选择器中定义 */
  flex: 1 1 0;
  margin-bottom: 10px;
}

.panel-right-top .result-section-main {
  min-height: 220px;
  background-color: rgba(0,0,0,0.25);
  border-radius: 8px;
  padding-top: 20px;
  padding-bottom: 10px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0,229,255,0.08);
}


.panel-right-top .result-section:first-child {
  flex: 3 1 0;
}

.panel-right-top .result-section:last-child {
  flex: 2 1 0;
  margin-bottom: 0;
}

.panel-right-top .section-content {
  /* 让内容区域自适应填充并可滚动 */
  flex: 1 1 0;
  min-height: 0;
  max-height: none;
  overflow-y: auto;
}

.panel-right-bottom {
  flex-grow: 1;
  height: 100%;
  width: 100%;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  padding: 20px 30px 30px 30px;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  gap: 15px;
  margin-bottom: 20px;
}

.panel-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: transparent;
  position: relative;
}

/* 面板标题 */
.panel-header {
  padding-left: 50px !important;
  justify-content: flex-start !important;
}
.panel-header, .design-module-label {
  height: 35px;
  background-image: url('~@/assets/images/step1/-s-二级标题.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  flex-shrink: 0;

  color: #fff;
  font-size: 1rem;
  font-weight: bold;
  padding-left: 0;
  margin-bottom: 5px;

  display: flex;
  justify-content: flex-start;
  align-items: center;
}

/* 中间列的标题居中显示 */
.middle-column .panel-left .panel-header {
  justify-content: center !important;
  padding-left: 0 !important;
}

/* 右侧标题特殊样式 */
.header-results {
  margin-bottom: 5px !important;
  margin-top: -20px;
}

/* 设计模块特定样式 */
.design-module {
  position: relative;
  padding-top: 15px;
  border-radius: 5px;
}

.design-module-label {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  height: 35px;
  background-image: url('~@/assets/images/step1/-s-二级标题.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  margin-bottom: 0;
}

.design-module-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 视频模块样式 */
.video-module {
  flex-basis: 40%;
}

.video-content-wrapper {
  padding: 0;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.video-display {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 4px;
}

/* 文本模块样式 */
.text-module-left {
  flex-basis: 45%;
  display: flex;
  flex-direction: column;
}

.fixed-left-text {
  position: relative;
  width: 100%;
  height: 480px;
  align-self: flex-start;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.fixed-left-text .design-module-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.text-scrollable {
  padding: 0;
  flex-grow: 1;
  overflow: hidden;
  max-height: 100%;
  display: flex;
  flex-direction: column;
}

.text-scrollable::-webkit-scrollbar {
  width: 6px;
}

.text-scrollable::-webkit-scrollbar-track {
  background: rgba(10, 25, 50, 0.3);
  border-radius: 4px;
}

.text-scrollable::-webkit-scrollbar-thumb {
  background: #00e5ff;
  border-radius: 4px;
}

.text-scrollable::-webkit-scrollbar-thumb:hover {
  background: #00b8d4;
}

/* 按钮样式 */
.button-container {
  flex-basis: 10%;
  min-height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.btn-start-detect{
  background: none;
  border: none;
  cursor: pointer;
  width: 170px;
  height: 72px;
  background-image: url('~@/assets/images/step1/-s-按钮-开始测试.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;

  color: #fff;
  font-size: 1.1rem;
  font-weight: bold;
  display: inline-flex;
  justify-content: center;
  align-items: center;

  &:disabled {
    filter: grayscale(80%);
    cursor: not-allowed;
  }

  span {
    margin-left: 8px;
  }
}

.btn-start-detect:disabled {
  filter: grayscale(80%);
  cursor: not-allowed;
}

.btn-start-detect span {
  margin-left: 8px;
}

.header-accuracy {
  margin-top: 15px;
}

/* 文本框框架 - 已移至视频模块 */

.placeholder-text {
  color: #88a;
  font-size: 1rem;
  text-align: center;
  padding: 20px;
}

.text-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.6;
  margin: 0;
  padding: 0;
  font-size: 0.9rem;
}

.text-muted {
  color: #888888;
  font-style: italic;
}

/* 属性信息内容框样式 - 与先验知识界面预测信息一致 */
.attribute-content {
  flex: 1;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 15px 20px !important;
  background-color: transparent;
  border: none;
  box-shadow: none;
  border-radius: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.attribute-content::-webkit-scrollbar {
  width: 6px;
}

.attribute-content::-webkit-scrollbar-thumb {
  background: #00e5ff;
  border-radius: 3px;
}

.attribute-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

/* 信息列表样式 */
.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
}

.info-list li {
  position: relative;
  padding: 10px 0;
  margin: 0;
  line-height: 1.6;
  color: #ffffff;
  font-size: 0.95rem;
  padding-left: 0;
  padding-right: 0;
}

/* 移除左侧黄色条 */
.info-list li:before {
  display: none;
}

/* 所有列表项底部添加分隔线 */
.info-list li::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-image: url('~@/assets/images/step2/blueline.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
}

/* 第一项（小类信息）使用黄色线 */
.info-list li.first-item::after {
  background-image: url('~@/assets/images/step2/yellowline.png');
}

/* 5. 中间列 - 智能体推理区域 */
.reasoning-section {
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px 0;
}

.agent-box {
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid #00e5ff;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 15px;
}

.agent-box.negotiation {
  border-color: #ff6b6b;
}

.agent-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.agent-avatar {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background-color: #00e5ff;
  color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 1rem;
}

.negotiation-sign {
  color: #ff6b6b;
  font-size: 1.2rem;
}

.agent-label {
  color: #00e5ff;
  font-weight: bold;
  font-size: 0.9rem;
}

.agent-content {
  background-color: rgba(0, 0, 0, 0.4);
  padding: 10px;
  border-radius: 5px;
  min-height: 80px;
  position: relative;
}

.agent-result {
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0;
}

/* 有 result-line 的情况：使用 flex 布局控制间距 */
.agent-result:has(.result-line) {
  white-space: normal;
  display: flex;
  flex-direction: column;
}

/* 控制推理型号和推理依据之间的间距为10px */
.agent-result .result-line {
  display: block;
  margin-bottom: 10px;
  line-height: 1.5;
}

.agent-result .result-line:last-child {
  margin-bottom: 0;
}

/* 兼容旧格式（没有 result-line，使用 br 或 pre-line） */
.agent-result:not(:has(.result-line)) {
  white-space: pre-line;
  display: block;
}

/* 6. 右侧列 - 结果区域 */
/* 偏差检测准确率面板 */
.panel-right-accuracy {
  flex-shrink: 0;
  width: 100%;
  background-image: url('~@/assets/images/step1/-s-弹窗-偏差检测准确率.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  margin-bottom: 20px;
  padding: 20px 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  margin-top: -20px;
}

.result-section {
  margin-bottom: 20px;
}

.section-header {
  color: #00e5ff;
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.section-content {
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid #00e5ff;
  border-radius: 5px;
  padding: 15px;
  min-height: 120px;
  max-height: 125px;
  overflow-y: auto;
}

.result-text {
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0;
  white-space: pre-line;
}

.result-text :deep(span[style*="color: red"]) {
  color: #ff6b6b !important;
}

.final-result-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex-grow: 1;
  min-height: 0;
}

.final-result-title {
  color: #00e5ff;
  font-size: 0.9rem;
  text-align: center;
  margin: 0;
  line-height: 1.4;
}

.final-model-display {
  background-color: rgba(0, 0, 0, 0.5);
  border: 2px solid #00e5ff;
  border-radius: 8px;
  padding: 20px 15px;
  text-align: center;
  margin: 10px 0;
}

.final-model-text {
  color: #00e5ff;
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
  text-shadow: 0 0 5px #00e5ff;
}

.metric-box {
  font-size: 2.5rem;
  font-weight: bold;
  color: #00e5ff;
  text-align: center;
  text-shadow: 0 0 5px #00e5ff;
  margin: 20px 0;
}

.action-buttons-right {
  margin-top: auto;
  display: flex;
  justify-content: center;
}

/* 结果导出按钮区域 */
.panel-right-button {
  flex-shrink: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 0;
  min-height: 70px;
  background: none !important;
  background-image: none !important;
}

/* 新增：右侧偏差检测按钮区域与样式（与左下角按钮尺寸风格一致） */
.panel-right-bias-button {
  flex-shrink: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 0 12px 0;
  min-height: 70px;
  background: none !important;
}

.btn-bias-detect {
  background: none;
  border: none;
  cursor: pointer;
  width: auto;
  min-width: 150px;
  max-width: 250px;
  height: 100%;
  background-image: url('~@/assets/images/step3/greenbutton.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  color: #fff;
  font-size: 1.1rem;
  font-weight: bold;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-height: 50px;
  margin-bottom: -50px;
  margin-top: -60px;
}

.btn-bias-detect:disabled {
  filter: grayscale(80%);
  cursor: not-allowed;
}

/* 准确率显示 */
.accuracy-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 15px;
}

.accuracy-label {
  color: #fff;
  font-size: 1rem;
  font-weight: bold;
  white-space: nowrap;
}

.accuracy-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #00e5ff;
  text-shadow: 0 0 10px #00e5ff, 0 0 20px rgba(0, 229, 255, 0.5);
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.btn-export-result {
  background-image: url('~@/assets/images/step1/-s-按钮-结果导出.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
  border: none;
  cursor: pointer;
  width: 100%;
  max-width: 280px;
  height: 60px;
  color: #333;
  font-size: 1.1rem;
  font-weight: bold;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  position: relative;
  padding: 0;
  margin-top: -20px;
}

.btn-export-result:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

.btn-export-result:disabled {
  filter: grayscale(80%);
  cursor: not-allowed;
}

/* 7. 加载遮罩 */
.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-spinner {
  color: #00e5ff;
  font-size: 1.2rem;
  text-shadow: 0 0 5px #00e5ff;
}

/* 面板与框内局部遮罩 */
.panel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
}
/* 8. 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #00e5ff;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #00b8d4;
}

/* 9. 响应式调整 */
@media (max-width: 1200px) {
  .header-title {
    font-size: calc(1vw + 0.7rem);
  }
  
  .metric-box {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .header-bar {
    padding: 0 10px;
  }
  
  .header-btn {
    width: 100px;
    font-size: 0.8rem;
  }
  
  .left-column,
  .middle-column,
  .right-column {
    height: auto;
  }
}
</style>
