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
        <!-- 图片区域 -->
        <div class="image-box">
          <img v-if="originalImageURL" :src="originalImageURL" alt="飞机图片" class="aircraft-image" />
          <div v-else class="placeholder-image">
            <span>图片</span>
          </div>
        </div>
        
        <!-- 属性信息框 -->
        <div class="attribute-box">
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
        <div class="reasoning-container">
          <div class="reasoning-title">智能体推理</div>
          
          <!-- 智能体A推理结果 -->
          <div class="reasoning-box">
            <div class="reasoning-content">
              <p class="reasoning-result">{{ agentAResult }}</p>
            </div>
          </div>

          <!-- 智能体B推理结果 -->
          <div class="reasoning-box">
            <div class="reasoning-content">
              <p class="reasoning-result">{{ agentBResult }}</p>
            </div>
          </div>

          <!-- 智能体C推理结果 -->
          <div class="reasoning-box">
            <div class="reasoning-content">
              <p class="reasoning-result">{{ agentCResult }}</p>
            </div>
          </div>
        </div>
      </b-col>

      <!-- 右侧：协商结果 -->
      <b-col cols="3" class="right-column">
        <!-- 过程偏差展示 -->
        <div class="deviation-box">
          <p class="deviation-title">群体协商的过程偏差的体现</p>
          <p class="review-section-title">共识摘要：</p>
          <p class="deviation-content">{{ consensusSummary }}</p>
          <p class="review-section-title">分歧点：</p>
          <p class="deviation-content" style="color: red;">{{ disagreementPoints }}</p>
          <p class="review-section-title">不同型号及原因：</p>
          <p class="deviation-content" style="color: blueviolet;">{{ differentModelAndReason }}</p>
          <p class="review-section-title">协商分析报告：</p>
          <p class="deviation-content">{{ deviationProcess }}</p>
        </div>

        <!-- 最终结果 -->
        <div class="final-result-box">
          <p class="final-result-title">群体协商之后的结果</p>
          <p class="final-result-content">{{ finalResult }}</p>
          <div class="accuracy-box">
            <span class="accuracy-label">偏差识别准确率：</span>
            <span class="accuracy-value">{{ accuracyRate }}</span>
          </div>
        </div>
      </b-col>
    </b-row>

  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'PriorKnowledge',
  data() {
    return {
      fullWidth: window.innerWidth,
      fullHeight: window.innerHeight,
      originalImageURL: null,
      attributeInfo: "各种属性信息的文本显示",
      agentAResult: "智能体A的推理结果\n文本框显示",
      agentBResult: "智能体B的推理结果\n文本框显示",
      agentCResult: "智能体C的推理结果\n文本框显示",
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
    };
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    axios.get('http://10.109.253.71:8001/module2/list', {
        params: {
          img_path: '/home/wuzhixuan/Project/PCJC/module2/images/img10.png',
          device_type: '%E9%A3%9E%E6%9C%BA'
        }
      }).then(res => {
        const data = res.data;
        
        // 处理预测信息
        if (data.result && data.result.length > 0 && data.result[0].length > 0) {
          const predictData = data.result[0][0];
          this.attributeInfo = [
            `小类信息：${predictData.model || '未知'}`,
            `火力信息：${predictData.firepower || '未知'}`,
            `颜色信息：${predictData.color || '未知'}`,
            `形状信息：${predictData.shape || '未知'}`,
            `尺寸信息：${predictData.size || '未知'}`,
            `动力信息：${predictData.power || '未知'}`,
          ];
          this.color=predictData.color;
          this.kind=predictData.kind;
          this.shape=predictData.shape; 
          this.ground_truth=predictData.model;
        }
        this.attributeInfo = this.attributeInfo.join('\n');
        this.isApiLoaded = true; // 接口成功返回，解锁按钮
      }).catch(err => {
        console.error(err.response && err.response.data || err);
      });
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
    }
  },
  methods: {
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
      const resdata = {
        color: this.color,
        kind: this.kind,
        shape: this.shape,
        image_path: '/data/82.png',
        ground_truth: this.ground_truth
      };
      console.log("发送的推理数据:", resdata);
      try {
        const response = await axios.post('/module3/refine', resdata, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const data = response.data;
        console.log("推理请求成功，结果:", response);
        this.finalResult = data.final_model_name;
        this.consensusSummary = data.final_review.consensus_summary;
        this.disagreementPoints = data.final_review.deviation_analysis.disagreement_points;
        this.differentModelAndReason = data.final_review.deviation_analysis.different_model_and_reason;
        this.deviationProcess = data.final_review.deviation_analysis_report;
        this.agentAResult = data.negotiation_details.initial_analyses.Agent_A;
        this.agentBResult = data.negotiation_details.initial_analyses.Agent_B;
        this.agentCResult = data.negotiation_details.initial_analyses.Agent_C;
        this.accuracyRate = data.accuracy;
      } catch (error) {
        console.error("推理请求失败:", error);
        this.finalResult = "推理失败: " + (error.response && error.response.data && error.response.data.error) || error.message;
      } finally {
        this.isLoading = false;
      }
    }
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
  margin-bottom: 40px;
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
  border: 3px solid #7BA3D1;
  background-color: white;
  padding: 10px;
  position: relative;
  height: 280px;
}

.aircraft-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 18px;
}

.attribute-box {
  border: 3px solid black;
  background-color: white;
  padding: 30px 20px;
  min-height: 180px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.attribute-text {
  white-space: pre-line;
  font-size: 16px;
  text-align: left;
  margin: 0;
  line-height: 1.8;
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
  height: 100%; // 让中间列占满父容器高度
}

.reasoning-container {
  border: 3px solid #E6B877;
  background-color: #FFF4E0;
  padding: 20px;
  border-radius: 10px;
  height: 100%;
  display: flex; // 启用弹性布局
  flex-direction: column; // 垂直排列
  gap: 20px; // 子元素间距
}

.reasoning-title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: black;
  margin-bottom: 0; // 移除默认边距
}

.reasoning-box {
  flex-grow: 1; // 自动分配剩余高度
  display: flex;
  flex-direction: column;
}

.reasoning-content {
  border: 2px solid black;
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  flex-grow: 1; // 填充父容器高度
  display: flex;
  align-items: center;
  justify-content: center;
}

.reasoning-result {
  font-size: 14px;
  text-align: center;
  margin: 0;
  white-space: pre-line;
  line-height: 1.4;
}

// 右侧列样式
.right-column {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.deviation-box {
  border: 3px solid #C9A8D4;
  background-color: #E8D9EF;
  padding: 25px 20px;
  border-radius: 5px;
  min-height: 320px;
}

.deviation-title {
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
  line-height: 1.6;
}

.deviation-content {
  font-size: 14px;
  text-align: left;
  margin: 0;
  white-space: pre-line;
  line-height: 1.8;
}

.final-result-box {
  border: 3px solid #C9A8D4;
  background-color: #E8D9EF;
  padding: 25px 20px;
  border-radius: 5px;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.final-result-title {
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 15px;
}

.final-result-content {
  font-size: 14px;
  text-align: left;
  margin-bottom: 20px;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.accuracy-box {
  background-color: white;
  border: 2px solid black;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.accuracy-label {
  color: #333;
}

.accuracy-value {
  color: #000;
}
</style>
