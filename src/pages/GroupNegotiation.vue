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

    <!-- 加载遮罩 -->
    <div v-if="isLoading" class="loading-mask">
      <div class="loading-spinner">加载中...</div>
    </div>

    <!-- 主要内容区域 -->
    <b-row class="justify-content-center content-row no-gutters">
      <!-- 左侧：图片和属性信息 -->
      <b-col cols="3" class="left-column px-2">
        <div class="panel-header header-select-data">视频信息</div>

        <div class="panel-left">
          <div class="panel-content">
            <div class="video-frame mb-4">
              <video v-if="videoUrl" :src="videoUrl" controls class="video-display" @error="handleVideoError"></video>
              <div v-else class="placeholder-text">
                {{ videoMessage }}
              </div>
            </div>

            <div class="panel-header mt-4">属性信息</div>
            <div class="description-box p-2 mt-2">
              <p class="text-left small-text">{{ attributeInfo }}</p>
            </div>

            <div class="action-buttons mt-4">
              <button @click="startNegotiation" :disabled="!isApiLoaded || isLoading" class="btn-start-detect">
                <b-spinner small v-if="isLoading"></b-spinner>
                <span>{{ isLoading ? '协商中...' : '群体协商' }}</span>
              </button>
            </div>
          </div>
        </div>
      </b-col>

      <!-- 中间：智能体推理 -->
      <b-col cols="5" class="middle-column mx-2 px-1">
        <div class="panel-left h-100">
          <div class="panel-content">
            <!-- 一轮推理 -->
            <div class="panel-header mb-3">一轮推理</div>
            
            <div class="reasoning-section">
              <!-- 智能体A推理结果 -->
              <div class="agent-box">
                <div class="agent-header">
                  <div class="agent-avatar">A</div>
                  <div class="agent-label">智能体A</div>
                </div>
                <div class="agent-content">
                  <p v-if="typeof agentARound1Result === 'object' && agentARound1Result !== null" class="agent-result">
                    推理型号：{{ agentARound1Result.model_name || '***' }}
                    <br/>
                    推理依据：{{ agentARound1Result.reason || '***' }}
                  </p>
                  <p v-else class="agent-result">{{ agentARound1Result || '推理型号：***\n推理依据：***' }}</p>
                </div>
              </div>

              <!-- 智能体B推理结果 -->
              <div class="agent-box">
                <div class="agent-header">
                  <div class="agent-avatar">B</div>
                  <div class="agent-label">智能体B</div>
                </div>
                <div class="agent-content">
                  <p v-if="typeof agentBRound1Result === 'object' && agentBRound1Result !== null" class="agent-result">
                    推理型号：{{ agentBRound1Result.model_name || '***' }}
                    <br/>
                    推理依据：{{ agentBRound1Result.reason || '***' }}
                  </p>
                  <p v-else class="agent-result">{{ agentBRound1Result || '推理型号：***\n推理依据：***' }}</p>
                </div>
              </div>

              <!-- 智能体C推理结果 -->
              <div class="agent-box">
                <div class="agent-header">
                  <div class="agent-avatar">C</div>
                  <div class="agent-label">智能体C</div>
                </div>
                <div class="agent-content">
                  <p v-if="typeof agentCRound1Result === 'object' && agentCRound1Result !== null" class="agent-result">
                    推理型号：{{ agentCRound1Result.model_name || '***' }}
                    <br/>
                    推理依据：{{ agentCRound1Result.reason || '***' }}
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
                  <div class="agent-avatar">A</div>
                  <div class="negotiation-sign">⇄</div>
                  <div class="agent-avatar">B</div>
                  <div class="agent-label">A&B</div>
                </div>
                <div class="agent-content">
                  <p v-if="typeof agentABNegotiation === 'object' && agentABNegotiation !== null" class="agent-result">
                    推理型号：{{ agentABNegotiation.model_name || '***' }}
                    <br/>
                    推理依据：{{ agentABNegotiation.reason || '***' }}
                  </p>
                  <p v-else class="agent-result">{{ agentABNegotiation || '推理型号：***\n协商过程：***' }}</p>
                </div>
              </div>

              <!-- 智能体B-C协商 -->
              <div class="agent-box negotiation">
                <div class="agent-header">
                  <div class="agent-avatar">B</div>
                  <div class="negotiation-sign">⇄</div>
                  <div class="agent-avatar">C</div>
                  <div class="agent-label">B&C</div>
                </div>
                <div class="agent-content">
                  <p v-if="typeof agentBCNegotiation === 'object' && agentBCNegotiation !== null" class="agent-result">
                    推理型号：{{ agentBCNegotiation.model_name || '***' }}
                    <br/>
                    推理依据：{{ agentBCNegotiation.reason || '***' }}
                  </p>
                  <p v-else class="agent-result">{{ agentBCNegotiation || '推理型号：***\n协商过程：***' }}</p>
                </div>
              </div>

              <!-- 智能体C-A协商 -->
              <div class="agent-box negotiation">
                <div class="agent-header">
                  <div class="agent-avatar">C</div>
                  <div class="negotiation-sign">⇄</div>
                  <div class="agent-avatar">A</div>
                  <div class="agent-label">C&A</div>
                </div>
                <div class="agent-content">
                  <p v-if="typeof agentCANegotiation === 'object' && agentCANegotiation !== null" class="agent-result">
                    推理型号：{{ agentCANegotiation.model_name || '***' }}
                    <br/>
                    推理依据：{{ agentCANegotiation.reason || '***' }}
                  </p>
                  <p v-else class="agent-result">{{ agentCANegotiation || '推理型号：***\n协商过程：***' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </b-col>

      <!-- 右侧：协商结果 -->
      <b-col cols="3" class="right-column px-2">
        <div class="panel-header header-results">群体协商认知偏差检测结果</div>

        <div class="panel-right-top">
          <div class="panel-content">
            <div class="result-section">
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
          </div>
        </div>

        <div class="panel-right-bottom">
          <div class="panel-content">
            <div class="final-result-section">
              <div class="final-result-title">经过智能体群体协商之后，该装备的详细型号为：</div>
              <div class="final-model-display">
                <p class="final-model-text">{{ finalResult || 'MiG-25Foxbat' }}</p>
              </div>
              
              <div class="metric-box">
                <template v-if="accuracyRate !== '—'">
                  {{ accuracyRate }}
                </template>
                <template v-else>
                  N/A
                </template>
              </div>

              <div class="action-buttons-right">
                <button class="btn-export-result" @click="exportResults">
                  <span>结果导出</span>
                </button>
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
      color:'',
      kind:'',
      shape:'',
      ground_truth:'',
      isApiLoaded: false, // 新增：接口加载状态，控制按钮禁用
      consensusSummary: "",
      disagreementPoints: "",
      differentModelAndReason: "",
      // 视频相关数据
      videoUrl: null,
      videoMessage: '正在从 LocalStorage 加载视频...'
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
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    // 页面加载时加载视频
    this.loadVideoFromStorage();
    
    // 从localStorage读取预测信息
    this.loadPredictInfoFromStorage();
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
          });

          // 设置属性信息，去除括号及其内容
          this.attributeInfo = [
            `小类信息：${predictData.kind ? predictData.kind.replace(/\s*\([^)]*\)/g, '') : '未知'}`,
            `火力信息：${predictData.firepower ? predictData.firepower.replace(/\s*\([^)]*\)/g, '') : '未知'}`,
            `颜色信息：${predictData.color ? predictData.color.replace(/\s*\([^)]*\)/g, '') : '未知'}`,
            `形状信息：${predictData.shape ? predictData.shape.replace(/\s*\([^)]*\)/g, '') : '未知'}`,
            `尺寸信息：${predictData.size ? predictData.size.replace(/\s*\([^)]*\)/g, '') : '未知'}`,
            `动力信息：${predictData.power ? predictData.power.replace(/\s*\([^)]*\)/g, '') : '未知'}`,
          ];
          
          // 设置其他需要的变量
          // 去除括号及其内容
          this.color = predictData.color;
          this.kind = predictData.kind;
          this.shape = predictData.shape;

          const module2Res = JSON.parse(localStorage.getItem('module2Res'));
          // 这里如果没有ground_truth，可以设置一个默认值或空值
          this.ground_truth = module2Res.result[0][0].model || '';
          
          // 拼接属性信息文本
          this.attributeInfo = this.attributeInfo.join('\n');
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
          this.attributeInfo = [
            `小类信息：${predictData.kind || '未知'}`,
            `火力信息：${predictData.firepower || '未知'}`,
            `颜色信息：${predictData.color || '未知'}`,
            `形状信息：${predictData.shape || '未知'}`,
            `尺寸信息：${predictData.size || '未知'}`,
            `动力信息：${predictData.power || '未知'}`,
          ];
          this.color = predictData.color;
          this.kind = predictData.kind;
          this.shape = predictData.shape;
          this.ground_truth = predictData.model;
        }
        this.attributeInfo = this.attributeInfo.join('\n');
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
    
    async startInfer() {
      this.isLoading = true;
      const module1ResStr = localStorage.getItem('module1Res');
      const module1Res = JSON.parse(module1ResStr);
       const imgPath = module1Res.key_frame_path.trim().replace(/^[`'"\s]+|[`'"\s]+$/g, '');
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
        this.finalResult = data.final_model_name;
        this.consensusSummary = data.final_review.consensus_summary;
        this.disagreementPoints = data.final_review.deviation_analysis;
        this.disagreementPointsHighlight = data.final_review.deviation_analysis_report;
        // 设置一轮推理数据
        this.agentARound1Result = data.negotiation_details.initial_analyses.Agent_A;
        this.agentBRound1Result = data.negotiation_details.initial_analyses.Agent_B;
        this.agentCRound1Result = data.negotiation_details.initial_analyses.Agent_C;
        
        // 设置二轮协商数据
        this.agentABNegotiation = data.negotiation_details.negotiation_results.Agent_A;
        this.agentBCNegotiation = data.negotiation_details.negotiation_results.Agent_B;
        this.agentCANegotiation = data.negotiation_details.negotiation_results.Agent_C;
        
        this.accuracyRate = data.accuracy;

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
        this.isLoading = false;
      }
    },

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
  z-index: 2;
  padding: 10px;
  margin: 0;
  background-color: transparent;
  display: flex;
  flex-direction: column;
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
  background-position: center center;
  opacity: 1;
  z-index: -1;
}

/* 2. 顶部标题栏 */
.header-bar {
  width: 100%;
  flex-shrink: 0;
  padding: 0 20px;
  height: 60px;
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
  background-image: url('~@/assets/images/step1/-s-按钮-蓝色.png');
}

.btn-back {
  background-image: url('~@/assets/images/step1/-s-按钮-蓝色-1.png');
}

.btn-next {
  background-image: url('~@/assets/images/step1/-s-按钮-绿色.png');
}

/* 3. 核心内容区 */
.content-row {
  flex-grow: 1;
  width: 100%;
  max-width: 100%;
  margin: 0;
}

/* 三列通用高度 */
.left-column,
.middle-column,
.right-column {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  /* 减去顶部栏高度和padding */
  padding: 0 !important;
}

/* 面板通用样式 */
[class^="panel-"] {
  width: 100%;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  padding: 20px 30px 30px 30px;
  display: flex;
  flex-direction: column;
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
  background-image: url('~@/assets/images/step1/弹框-偏差检测结果.png');
}

.panel-right-bottom {
  flex-grow: 1;
  height: 100%;
  background-image: url('~@/assets/images/step1/弹框-偏差检测结果.png');
}

.panel-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 面板标题 */
.panel-header {
  height: 35px;
  background-image: url('~@/assets/images/step1/-s-二级标题.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  flex-shrink: 0;

  color: #fff;
  font-size: 1rem;
  font-weight: bold;
  padding-left: 0;
  margin-bottom: 10px;

  display: flex;
  justify-content: center;
  align-items: center;
}

.header-accuracy {
  margin-top: 15px;
}

/* 4. 左侧列 - 视频框样式对齐 PriorKnowledge.vue */
.video-frame {
  width: 95%;
  height: 250px;
  background-image: url('~@/assets/images/step1/-s-框-小视频.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  padding: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.video-display {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.placeholder-text {
  color: #88a;
  font-size: 1rem;
  text-align: center;
  padding: 20px;
}

.description-box {
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid #00e5ff;
  border-radius: 5px;
  padding: 15px;
  margin: 10px 0;
  min-height: 120px;
  overflow-y: auto;
}

.small-text {
  font-size: 0.85rem;
  line-height: 1.5;
  white-space: pre-line;
}

.action-buttons {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}

.btn-start-detect {
  background-image: url('~@/assets/images/step1/-s-按钮-开始测试.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-color: transparent;
  border: none;
  color: #fff;
  font-weight: bold;
  font-size: 1rem;
  padding: 10px 40px;
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
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
  width: 35px;
  height: 35px;
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
}

.agent-result {
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0;
  white-space: pre-line;
}

/* 6. 右侧列 - 结果区域 */
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
  min-height: 100px;
  max-height: 120px;
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
  height: 100%;
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

.btn-export-result {
  background-image: url('~@/assets/images/step1/-s-按钮-结果导出.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-color: transparent;
  border: none;
  color: #fff;
  font-weight: bold;
  font-size: 0.9rem;
  padding: 8px 30px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
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
