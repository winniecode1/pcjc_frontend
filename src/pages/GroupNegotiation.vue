<template>
  <div class="section">
    <div class="register" :style="{width: fullWidth+'px', height:fullHeight+'px'}"></div>
    <div class="img_box" :style="{width: fullWidth+'px'}"></div>
    
    <!-- 标题 -->
    <b-row class="justify-content-center pt-5">
      <b-col cols="12" class="text-center">
        <p class="newTitle text-center">群体协商</p>
      </b-col>
    </b-row>

    <!-- 加载遮罩 -->
    <div v-if="isLoading" class="loading-mask">
      <div class="loading-spinner">加载中...</div>
    </div>

    <!-- 主要内容区域 -->
    <b-row class="justify-content-center main-content-row">
      <!-- 左侧：图片和属性信息 -->
      <b-col cols="3" class="left-column">
        <!-- 视频区域 -->
        <div class="image-box">
          <div class="video-content-wrapper">
            <video v-if="videoUrl" :src="videoUrl" controls class="video-player" @error="handleVideoError"></video>
            <div v-else class="video-placeholder-text">
              {{ videoMessage }}
            </div>
          </div>
        </div>
        
        <!-- 属性信息框 -->
        <div class="attribute-box">
          <p class="attribute-title">(上阶段传入的装备信息):</p>
          <!-- <ul class="attribute-list">
            <li v-for="(item, index) in attributeInfoArray" :key="index">• {{ item }}</li>
          </ul> -->
          <p class="attribute-text">{{ attributeInfo }}</p>
        </div>

        <!-- 群体协商按钮（添加disabled绑定） -->
        <div class="negotiation-box">
          <button 
            class="negotiation-btn" 
            @click="startNegotiation"
            :disabled="!isApiLoaded"
          >
            <span class="play-icon">▶</span>
            <span class="negotiation-text">群体协商</span>
          </button>
        </div>
      </b-col>

      <!-- 中间：智能体推理 -->
        <b-col cols="5" class="middle-column">
          <!-- 一轮推理 -->
          <div class="reasoning-container">
            <div class="reasoning-title">一轮推理</div>
            
            <!-- 智能体A推理结果 -->
            <div class="agent-reasoning-box horizontal">
              <div class="agent-header">
                <div class="agent-icon">🤖</div>
                <div class="agent-name">智能体A</div>
              </div>
              <div class="agent-content">
                <p class="reasoning-result" v-if="typeof agentARound1Result === 'object' && agentARound1Result !== null">
                  推理型号：{{ agentARound1Result.model_name || '***' }}
                  推理依据：{{ agentARound1Result.reason || '***' }}
                </p>
                <p class="reasoning-result" v-else>{{ agentARound1Result || '推理型号：***\n推理依据：***' }}</p>
              </div>
            </div>

            <!-- 智能体B推理结果 -->
            <div class="agent-reasoning-box horizontal">
              <div class="agent-header">
                <div class="agent-icon">🤖</div>
                <div class="agent-name">智能体B</div>
              </div>
              <div class="agent-content">
                <p class="reasoning-result" v-if="typeof agentBRound1Result === 'object' && agentBRound1Result !== null">
                  推理型号：{{ agentBRound1Result.model_name || '***' }}
                  推理依据：{{ agentBRound1Result.reason || '***' }}
                </p>
                <p class="reasoning-result" v-else>{{ agentBRound1Result || '推理型号：***\n推理依据：***' }}</p>
              </div>
            </div>

            <!-- 智能体C推理结果 -->
            <div class="agent-reasoning-box horizontal">
              <div class="agent-header">
                <div class="agent-icon">🤖</div>
                <div class="agent-name">智能体C</div>
              </div>
              <div class="agent-content">
                <p class="reasoning-result" v-if="typeof agentCRound1Result === 'object' && agentCRound1Result !== null">
                  推理型号：{{ agentCRound1Result.model_name || '***' }}
                  推理依据：{{ agentCRound1Result.reason || '***' }}
                </p>
                <p class="reasoning-result" v-else>{{ agentCRound1Result || '推理型号：***\n推理依据：***' }}</p>
              </div>
            </div>
          </div>

          <!-- 二轮推理 -->
          <div class="reasoning-container">
            <div class="reasoning-title">二轮推理</div>
            
            <!-- 智能体A-B协商 -->
            <div class="agent-reasoning-box horizontal negotiation">
              <div class="negotiation-header">
                <div class="agent-pair">
                  <div class="agent-icon-mini">🤖</div>
                  <div class="agent-name-mini">A</div>
                  <div class="negotiation-arrow">↔</div>
                  <div class="agent-icon-mini">🤖</div>
                  <div class="agent-name-mini">B</div>
                </div>
              </div>
              <div class="agent-content">
                <p class="reasoning-result" v-if="typeof agentABNegotiation === 'object' && agentABNegotiation !== null">
                  推理型号：{{ agentABNegotiation.model_name || '***' }}
                  推理依据：{{ agentABNegotiation.reason || '***' }}
                </p>
                <p class="reasoning-result" v-else>{{ agentABNegotiation || '推理型号：***\n协商过程：***' }}</p>
              </div>
            </div>

            <!-- 智能体B-C协商 -->
            <div class="agent-reasoning-box horizontal negotiation">
              <div class="negotiation-header">
                <div class="agent-pair">
                  <div class="agent-icon-mini">🤖</div>
                  <div class="agent-name-mini">B</div>
                  <div class="negotiation-arrow">↔</div>
                  <div class="agent-icon-mini">🤖</div>
                  <div class="agent-name-mini">C</div>
                </div>
              </div>
              <div class="agent-content">
                <p class="reasoning-result" v-if="typeof agentBCNegotiation === 'object' && agentBCNegotiation !== null">
                  推理型号：{{ agentBCNegotiation.model_name || '***' }}
                  推理依据：{{ agentBCNegotiation.reason || '***' }}
                </p>
                <p class="reasoning-result" v-else>{{ agentBCNegotiation || '推理型号：***\n协商过程：***' }}</p>
              </div>
            </div>

            <!-- 智能体C-A协商 -->
            <div class="agent-reasoning-box horizontal negotiation">
              <div class="negotiation-header">
                <div class="agent-pair">
                  <div class="agent-icon-mini">🤖</div>
                  <div class="agent-name-mini">C</div>
                  <div class="negotiation-arrow">↔</div>
                  <div class="agent-icon-mini">🤖</div>
                  <div class="agent-name-mini">A</div>
                </div>
              </div>
              <div class="agent-content">
                <p class="reasoning-result" v-if="typeof agentCANegotiation === 'object' && agentCANegotiation !== null">
                  推理型号：{{ agentCANegotiation.model_name || '***' }}
                  推理依据：{{ agentCANegotiation.reason || '***' }}
                </p>
                <p class="reasoning-result" v-else>{{ agentCANegotiation || '推理型号：***\n协商过程：***' }}</p>
              </div>
            </div>
          </div>
        </b-col>

      <!-- 右侧：协商结果 -->
        <b-col cols="3" class="right-column">
          <!-- 过程偏差展示 -->
          <div class="deviation-box">
            <p class="deviation-title">群体协商认知偏差检测结果</p>
            
            <div class="result-section">
              <p class="section-title">共识摘要：</p>
              <div class="section-content">
                <p>{{ consensusSummary || '***' }}</p>
              </div>
            </div>
            
            <div class="result-section">
              <p class="section-title">分歧点：</p>
              <div class="section-content">
                <p v-html="formattedDisagreementPoints || '***'"></p>
              </div>
            </div>
          </div>
          
          <!-- 最终型号结果 -->
          <div class="final-result-box">
            <p class="final-result-title">经过智能体群体协商之后，该装备的详细型号为：</p>
            <div class="final-model-box">
              <p class="final-model-text">{{ finalResult || 'MiG-25Foxbat' }}</p>
            </div>
            
            <!-- 底部显示和按钮 -->
            <div class="bottom-buttons">
              <div class="accuracy-box"> 
                <span class="accuracy-label">偏差识别准确率：</span> 
                <span class="accuracy-value">{{ accuracyRate }}</span> 
              </div>
              <button class="action-button">结果导出</button>
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
  name: 'PriorKnowledge',
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
          
          // 设置属性信息
          this.attributeInfo = [
            `小类信息：${predictData.kind || '未知'}`,
            `火力信息：${predictData.firepower || '未知'}`,
            `颜色信息：${predictData.color || '未知'}`,
            `形状信息：${predictData.shape || '未知'}`,
            `尺寸信息：${predictData.size || '未知'}`,
            `动力信息：${predictData.power || '未知'}`,
          ];
          
          // 设置其他需要的变量
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
.section {
  background-color: #EAF4FE;
  color: black;
  font-size: 100%;
  width: 100%;
  min-height: 100vh;
  font-family: "Helvetica Neue", Arial, sans-serif;
  z-index: 2;
  position: relative;
}

/* 加载遮罩样式 */
.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  font-size: 20px;
  font-weight: bold;
}

.loading-spinner {
  padding: 20px 40px;
  background-color: white;
  border: 3px solid #7BA3D1;
  border-radius: 8px;
}

.newTitle {
  font-size: 2.5rem;
  color: black;
  letter-spacing: 0.1em;
  font-weight: bold;
  // margin-bottom: 40px;
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
  background-color: #EAF4FE;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  width: 100%;
  height: 100%;
  opacity: 0.8;
}

.main-content-row {
  padding: 20px 60px;
  margin-top: 20px;
}

// 左侧列样式
.left-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.image-box {
  padding: 10px;
  border: 3px solid #7BA3D1;
  background-color: #fff;
  height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.video-content-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.video-placeholder-text {
  color: #666;
  font-size: 16px;
  text-align: center;
  padding: 20px;
}

.attribute-box {
  border: 3px solid black;
  background-color: white;
  padding: 15px 10px;
  min-height: 200px;
  max-height: 300px;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
}

.attribute-title {
  font-size: 16px;
  font-weight: bold;
  color: black;
  margin-bottom: 15px;
  text-align: center;
}

.attribute-text {
  white-space: pre-line;
  font-size: 16px;
  text-align: left;
  margin: 0;
  line-height: 1.8;
  overflow-y: auto;
  max-height: 200px;
  flex: 1;
}

.attribute-list {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.attribute-list li {
  font-size: 16px;
  line-height: 1.8;
  color: #FF0000;
}

.negotiation-box {
  border: 3px solid #7BA3D1;
  background-color: #D3E4F7;
  padding: 20px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}

.negotiation-btn {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
  
  // 禁用状态样式
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  &:disabled .play-icon {
    background-color: #999;
  }
}

.play-icon {
  width: 50px;
  height: 50px;
  background-color: #5A87C7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.negotiation-text {
  font-size: 24px;
  font-weight: bold;
  color: black;
}

// 中间列样式
.middle-column {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
}

.reasoning-container {
  border: 3px solid #E6B877;
  background-color: #FFF4E0;
  padding: 12px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reasoning-title {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: black;
  margin: 0;
}

.agent-reasoning-box {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.agent-reasoning-box.horizontal {
  flex-direction: row;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 5px;
}

.agent-reasoning-box.horizontal .agent-header {
  flex-shrink: 0;
  width: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0;
}

.agent-reasoning-box.horizontal .agent-content {
  flex: 1;
  min-height: 80px;
  padding: 8px;
}

.agent-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-bottom: 0;
}

.agent-icon {
  font-size: 20px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.agent-name {
  font-weight: bold;
  font-size: 14px;
  text-align: center;
}

.agent-content {
  border: 2px solid black;
  background-color: white;
  padding: 12px;
  border-radius: 8px;
  min-height: 120px;
  max-height: 150px;
  overflow-y: auto;
}

.negotiation-header {
  flex-shrink: 0;
  width: 90px;
  display: flex;
  justify-content: center;
  margin-bottom: 0;
}

.agent-pair {
  display: flex;
  align-items: center;
  gap: 4px;
}

.agent-icon-mini {
  font-size: 18px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.agent-name-mini {
  font-weight: bold;
  font-size: 12px;
}

.negotiation-arrow {
  font-size: 14px;
  color: #666;
}

.reasoning-result {
  font-size: 13px;
  text-align: left;
  margin: 0;
  white-space: pre-line;
  line-height: 1.3;
  overflow-y: auto;
}

// 右侧列样式
.right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.deviation-box {
  border: 3px solid #C9A8D4;
  background-color: #E8D9EF;
  padding: 25px 20px;
  border-radius: 10px;
  min-height: 380px;

  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.final-result-box {
  border: 3px solid #C9A8D4;
  background-color: #E8D9EF;
  padding: 25px 20px;
  border-radius: 10px;
  min-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.final-result-title {
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  margin: 0;
  color: black;
}

.deviation-title {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin: 0;
  color: black;
}

.result-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
  color: black;
}

.section-content {
  background-color: white;
  border: 2px solid black;
  padding: 15px;
  border-radius: 8px;
  min-height: 100px;
  max-height: 120px;
  overflow-y: auto;
}

.section-content p {
  font-size: 14px;
  text-align: left;
  margin: 0;
  line-height: 1.6;
  white-space: pre-line;
}

.highlight-red p {
  color: red;
}

.final-model-box {
  background-color: white;
  border: 2px solid black;
  padding: 20px 15px;
  border-radius: 8px;
  text-align: center;
  margin: 10px 0;
}

.final-model-text {
  font-size: 18px;
  font-weight: bold;
  color: black;
  margin: 0;
}

.bottom-buttons {
  display: flex;
  gap: 15px;
  justify-content: space-around;
  align-items: center;
  margin-top: 20px;
}

.accuracy-box {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

.accuracy-label {
  font-weight: bold;
  color: black;
}

.accuracy-value {
  font-size: 18px;
  font-weight: bold;
  color: #1a73e8;
}

.action-button {
  background-color: white;
  border: 2px solid black;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f0f0f0;
  }
}
</style>
