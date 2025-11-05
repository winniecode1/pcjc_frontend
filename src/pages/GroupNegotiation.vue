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

    <!-- 主要内容区域 -->
    <b-row class="justify-content-center main-content-row">
      <!-- 左侧：图片和属性信息 -->
      <b-col cols="3" class="left-column">
        <!-- 图片区域 -->
        <div class="image-box">
          <!-- <div class="image-label">飞机</div> -->
          <img v-if="originalImageURL" :src="originalImageURL" alt="飞机图片" class="aircraft-image" />
          <div v-else class="placeholder-image">
            <span>图片</span>
          </div>
        </div>
        
        <!-- 属性信息框 -->
        <div class="attribute-box">
          <p class="attribute-text">{{ attributeInfo }}</p>
        </div>

        <!-- 群体协商按钮 -->
        <div class="negotiation-box">
          <button class="negotiation-btn" @click="startNegotiation">
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
              <!-- <p class="reasoning-label">智能体A的推理结果</p> -->
              <p class="reasoning-result">{{ agentAResult }}</p>
            </div>
          </div>

          <!-- 智能体B推理结果 -->
          <div class="reasoning-box">
            <div class="reasoning-content">
              <!-- <p class="reasoning-label">智能体B的推理结果</p> -->
              <p class="reasoning-result">{{ agentBResult }}</p>
            </div>
          </div>

          <!-- 智能体C推理结果 -->
          <div class="reasoning-box">
            <div class="reasoning-content">
              <!-- <p class="reasoning-label">智能体C的推理结果</p> -->
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
// 导入 axios 用于 HTTP 请求
import axios from 'axios';
import { color } from 'd3';

export default {
  name: 'PriorKnowledge',
  data() {
    return {
      fullWidth: window.innerWidth,
      fullHeight: window.innerHeight,
      originalImageURL: null, // 飞机图片
      attributeInfo: "各种属性信息的文本显示",
      agentAResult: "智能体A的推理结果\n文本框显示",
      agentBResult: "智能体B的推理结果\n文本框显示",
      agentCResult: "智能体C的推理结果\n文本框显示",
      deviationProcess: "群体协商的过程偏差的体现\n文本框显示",
      finalResult: "群体协商之后的结果",
      isLoading: false,
      accuracyRate: '—',
      color:'',
      kind:'',
      shape:'',
      ground_truth:'',
    };
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    axios.get('/module2/list', {
        params: {
          img_path: '/home/wuzhixuan/Project/PCJC/module2/images/img10.png',
          device_type: '%E9%A3%9E%E6%9C%BA'
        }
      }).then(res => {
        // console.log('Backend response:', res.data);
        const data = res.data;
     
        // 处理标签信息
        // if (data.label_info && data.label_info.length > 0 && data.label_info[0].length > 0) {
        //   const labelData = data.label_info[0][0];
        //   this.tagInfoList = [
        //     // `类型：${labelData.type || '未知'}`,
        //     `小类信息：${labelData.model || '未知'}`,
        //     // `种类：${labelData.kind || '未知'}`,
        //     // `国家：${labelData.country || '未知'}`,
        //     `火力信息：${labelData.firepower || '未知'}`,
        //     `颜色信息：${labelData.color || '未知'}`,         
        //     `形状信息：${labelData.shape || '未知'}`,
        //     `尺寸信息：${labelData.size || '未知'}`,
        //     `动力信息：${labelData.power || '未知'}`,
        //     // `场景：${labelData.scene || '未知'}`
        //   ];
        // }
        
        // 处理预测信息
        if (data.result && data.result.length > 0 && data.result[0].length > 0) {
          const predictData = data.result[0][0];
          this.attributeInfo = [
            `小类信息：${predictData.model || '未知'}`,
            // `种类：${predictData.kind || '未知'}`,
            // `国家：${predictData.country || '未知'}`,
            `火力信息：${predictData.firepower || '未知'}`,
            `颜色信息：${predictData.color || '未知'}`,
            `形状信息：${predictData.shape || '未知'}`,
            `尺寸信息：${predictData.size || '未知'}`,
            `动力信息：${predictData.power || '未知'}`,
            // `场景：${predictData.scene || '未知'}`
          ];
          this.color=predictData.color;
          this.kind=predictData.kind;
          this.shape=predictData.shape; 
          this.ground_truth=predictData.model;
        }
        // 数组转字符串（用 \n 分隔，实现换行）
        this.attributeInfo = this.attributeInfo.join('\n');
        
      }).catch(err => {
        console.error(err.response && err.response.data || err);
      });
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  watch: {
   
  },
  methods: {
    handleResize() {
      this.fullWidth = window.innerWidth;
      this.fullHeight = window.innerHeight;
    },
    startNegotiation() {
      console.log("开始群体协商");
      // 这里可以添加群体协商的逻辑
      this.startInfer();
    },
    async startInfer() {
      this.isLoading = true;
      const formData = new FormData();
      formData.append('color', this.color);
      formData.append('kind', this.kind);
      formData.append('shape', this.shape);
      formData.append('img_path', 'data/82.png');
      formData.append('ground_truth', this.ground_truth);
      try {
        const response = await axios.post('/module3/refine', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        const data = response;
        console.log("推理请求成功，结果:", response);
        this.finalResult = data;
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
  background-color: #D7E7D5;
  color: black;
  font-size: 100%;
  width: 100%;
  min-height: 100vh;
  font-family: "Helvetica Neue", Arial, sans-serif;
  z-index: 2;
  position: relative;
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
  background-color: rgb(215,231,213);
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

.image-label {
  position: absolute;
  top: -15px;
  left: 20px;
  background-color: #D7E7D5;
  padding: 2px 15px;
  font-size: 16px;
  font-weight: bold;
  z-index: 10;
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
/* 核心样式：识别 \n 并换行，同时自动处理多余空格 */
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
}

.reasoning-container {
  border: 3px solid #E6B877;
  background-color: #FFF4E0;
  padding: 20px;
  border-radius: 10px;
  height: 100%;
}

.reasoning-title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 25px;
  color: black;
}

.reasoning-box {
  margin-bottom: 40px;
  min-height: 140px;
  &:last-child {
    margin-bottom: 0;
  }
}

.reasoning-content {
  border: 2px solid black;
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center; /* 垂直居中内容 */
}

.reasoning-label {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
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
  text-align: center;
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
  text-align: center;
  margin-bottom: 20px;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.accuracy-btn {
  background-color: white;
  border: 2px solid black;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background-color: #f0f0f0;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
}
/* 静态准确率显示框 */
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
