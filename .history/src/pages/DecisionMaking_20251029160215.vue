<template>
  <div class="section">
    <!-- 背景元素 -->
    <div class="register" :style="{width: fullWidth+'px', height:fullHeight+'px'}"></div>
    <div class="img_box" :style="{width: fullWidth+'px'}"></div>

    <!-- 1. 标题区域 -->
    <b-row class="justify-content-center pt-5">
      <b-col cols="10" class="text-center">
        <p class="newTitle text-center">决策选择</p>
      </b-col>
    </b-row>

    <!-- 2. 信息推理与多帧图片输入区域 -->
    <!-- 注意：使用 mx-3 保持与下方列的水平对齐 -->
    <b-row class="justify-content-center pt-4 mb-4">

      <!-- 左侧 (cols="3")：信息推理与文本框 -->
      <b-col cols="3" class="text-center mx-3 d-flex flex-column">
        <div class="box-label">信息推理</div>

        <!-- 上框：第三阶段文本信息 -->
        <div class="info-box-top p-3 mb-3">
          <div class="box-label-sub">第三阶段给出的文字信息</div>
          <!-- 确保文本有最小高度以填充空间 -->
          <p class="text-left placeholder-text-small">{{ previousStageText }}</p>
        </div>

        <!-- 推理按钮 -->
        <b-button @click="startInference" variant="primary" :disabled="isLoading" class="inference-btn">
          <b-spinner small v-if="isLoading"></b-spinner>
          {{ isLoading ? '推理中...' : '开始决策推理' }}
        </b-button>

        <!-- 下框：决策推理结果 -->
        <div class="info-box-bottom p-3 mt-3">
          <div class="box-label-sub">本阶段决策推理结果</div>
          <p class="text-left placeholder-text-small result-text">{{ decisionResult }}</p>
        </div>
        <!-- 预留接口：/api/decision/text_inference -->
      </b-col>

      <!-- 中间 (cols="4")：多帧行为图片输入 (一行四列 4 张图) -->
      <b-col cols="4" class="text-center mx-3">
        <div class="box-label">多帧行为图片输入</div>
        <div class="image-grid-container p-3">
            <!-- 循环展示 4 张图片 -->
            <div v-for="(img, index) in multiFrameImages" :key="index" class="image-wrapper">
                <div class="image-box">
                    <img :src="img.src" :alt="img.alt" class="frame-image" @error="handleImageError">
                </div>
                <div class="frame-label">{{ img.label }}</div>
            </div>
        </div>
        <!-- 预留接口：/api/decision/images -->
      </b-col>

      <!-- 右侧 (cols="3")：危险等级与决策建议 -->
      <b-col cols="3" class="text-center mx-3 d-flex flex-column">
        <div class="box-label">决策态势</div>

        <!-- 危险等级 -->
        <div class="level-main-box p-3">
          <div class="box-label-sub">危险等级评估</div>
          <div class="danger-level-box" :class="`level-${dangerLevel}`">
            {{ dangerLevel }}
          </div>
        </div>

        <!-- 决策建议 -->
        <div class="suggestion-box p-3 mt-3">
          <div class="box-label-sub">决策建议</div>
          <p class="suggestion-text">{{ decisionSuggestion }}</p>
        </div>
        <!-- 预留接口：/api/decision/final_result -->
      </b-col>

    </b-row>
  </div>
</template>

<script>
// import axios from 'axios'; // 预留用于后续后端通信

export default {
  name: 'DecisionMaking',
  data() {
    // const backendBaseURL = '/api/decision'; // 预留决策选择的后端接口
    
    return {
      // 样式控制
      fullWidth: window.innerWidth,
      fullHeight: window.innerHeight,
      isLoading: false,
      
      // ------------------------------------------------------------------
      // ⚠️ 模拟数据 (写死)
      // ------------------------------------------------------------------
      previousStageText: '意图预测模块给出：目标船只正在执行快速转向行为，判断其意图为“高威胁”，因为其航向正对敏感区域，且未响应警告。模型综合评估了当前风速、水流等环境因素。',
      
      // 4张图片数据
      multiFrameImages: [
        { src: 'https://placehold.co/400x300/F0F8FF/000?text=Frame+1', alt: 'Frame 1', label: 'T-3s 转向开始' },
        { src: 'https://placehold.co/400x300/F0F8FF/000?text=Frame+2', alt: 'Frame 2', label: 'T-2s 转向加速' },
        { src: 'https://placehold.co/400x300/F0F8FF/000?text=Frame+3', alt: 'Frame 3', label: 'T-1s 航向锁定' },
        { src: 'https://placehold.co/400x300/F0F8FF/000?text=Frame+4', alt: 'Frame 4', label: 'T-0s 危险确认' },
      ],

      dangerLevel: 4, // 1-5 级
      decisionResult: '综合判断：目标行为具有高威胁性，对关键区域构成直接风险。',
      decisionSuggestion: '立即执行预案B：发送最后警告，并准备拦截。',
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
    // 模拟推理过程
    startInference() {
      this.isLoading = true;
      // ⚠️ 实际应用中，这里应调用后端推理接口
      setTimeout(() => {
        this.isLoading = false;
        // 模拟推理结果更新
        this.dangerLevel = 5;
        this.decisionResult = '推理更新：目标已进入禁区边缘，威胁等级提升至最高。';
        this.decisionSuggestion = '执行预案C：立即拦截！';
      }, 2000);
    },
    handleImageError(event) {
        // 图片加载失败时显示占位符
        event.target.src = 'https://placehold.co/400x300/AFAFAF/FFF?text=Image+Load+Error';
        event.target.onerror = null; // 防止无限循环
    }
    
    // 预留的后端调用函数 (保持可修改性)
    /*
    async fetchInitialData() {
        try {
            const textResponse = await axios.get(`${this.backendBaseURL}/previous_stage_text`);
            this.previousStageText = textResponse.data.text;

            const imageResponse = await axios.get(`${this.backendBaseURL}/images`);
            // 假设后端返回一个包含 4 个图片的数组
            this.multiFrameImages = imageResponse.data.images.map((img, index) => ({
                src: img.url,
                alt: `Frame ${index + 1}`,
                label: img.timestamp
            }));

            const finalResponse = await axios.get(`${this.backendBaseURL}/final_result`);
            this.dangerLevel = finalResponse.data.level;
            this.decisionResult = finalResponse.data.result;
            this.decisionSuggestion = finalResponse.data.suggestion;

        } catch (error) {
            console.error("决策选择数据请求失败:", error);
        }
    }
    */
  }
};
</script>

<style lang="scss" scoped>
  /* ------------------- 基础样式 (沿用 DecisionMaking.vue) ------------------- */
  .section {
    background-color: #EAF4FE;
    color: black;
    font-size: 14px;
    min-height: 100vh;
  }
  .register, .img_box {
    position: fixed;
    top: 0;
    left: 0;
    z-index: -1;
  }
  .img_box {
    background-image: url('https://placehold.co/1920x1080/DDEFFF/333?text=Background');
    background-size: cover;
    opacity: 0.1;
  }
  .newTitle {
    color: #007bff;
    font-size: 2.5rem;
    font-weight: 700;
    border-bottom: 3px solid #007bff;
    display: inline-block;
    padding-bottom: 5px;
  }

  /* 核心模块样式 */
  .box-label {
    position: relative;
    top: 10px;
    background-color: #EAF4FE;
    padding: 0 10px;
    color: red;
    font-size: 1.1em;
    font-weight: bold;
    z-index: 10;
    margin-bottom: 10px;
  }
  .box-label-sub {
    font-weight: bold;
    color: #007bff;
    margin-bottom: 5px;
  }
  .placeholder-text-small {
    font-size: 0.9em;
    line-height: 1.5;
    min-height: 50px; /* 确保有最小高度 */
  }

  /* 左侧：信息推理框 */
  .info-box-top, .info-box-bottom {
    flex: 1; /* 确保盒子占据可用空间 */
    border: 2px solid #ccc;
    border-radius: 8px;
    background-color: #fff;
    position: relative;
    padding-top: 15px; /* 为子标签留出空间 */
    text-align: left;
    height: 100%;
    min-height: 120px; /* 最小高度 */
  }
  .result-text {
    font-weight: 500;
    color: #17a2b8;
  }

  .inference-btn {
    margin-top: 10px;
    margin-bottom: 10px;
    font-weight: bold;
    height: 40px;
  }
  
  /* ------------------- 中间：多帧图片输入 (1x4 布局) ------------------- */
  .image-grid-container {
    background-color: white;
    border: 2px solid #ccc;
    border-radius: 8px;
    /* 调整高度以适应单行 4 图的布局 */
    height: 250px; 
    padding: 10px;
    display: grid;
    grid-template-columns: repeat(4, 1fr); /* 一行四列 */
    grid-template-rows: 1fr; /* 仅有一行 */
    gap: 8px; /* 间距 */
    align-items: center; /* 垂直居中对齐 */
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }

  .image-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between; 
    height: 100%; 
    padding: 5px 0; 
  }

  .image-box {
    width: 95%; 
    /* 固定高度以确保所有图片区域一致 */
    height: 150px; 
    border: 1px solid #ddd; 
    border-radius: 4px;
    background-color: #f7f7f7;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    margin-bottom: 5px; 
    box-shadow: inset 0 0 5px rgba(0,0,0,0.05);
  }

  .frame-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .frame-label {
    font-size: 0.8em;
    color: #333;
    text-align: center;
    font-weight: 500;
    white-space: nowrap; /* 防止标签换行 */
  }
  /* ---------------------------------------------------------------------- */


  /* 右侧：危险等级与建议 */
  .level-main-box {
    flex: 1;
    position: relative;
    border: 2px solid #ccc;
    border-radius: 8px;
    background-color: #fff;
    padding: 15px;
    height: 100%;
    min-height: 150px;
  }
  .danger-level-box {
    height: 80px;
    line-height: 80px;
    margin-top: 10px;
    border: 2px solid #ccc;
    border-radius: 4px;
    font-size: 4rem; /* 调整字体大小以适应高度 */
    font-weight: 900;
    background-color: #fff;
    transition: all 0.3s ease;

    // Dynamic color change
    &.level-1 { color: #90EE90; border-color: #90EE90; }
    &.level-2 { color: #ADD8E6; border-color: #ADD8E6; }
    &.level-3 { color: #FFA07A; border-color: #FFA07A; }
    &.level-4 { color: #FF4500; border-color: #FF4500; }
    &.level-5 { color: #FF0000; border-color: #FF0000; animation: pulse 1s infinite alternate; }
  }

  @keyframes pulse {
    from { box-shadow: 0 0 5px #FF0000; }
    to { box-shadow: 0 0 20px #FF0000; }
  }

  .suggestion-box {
    flex: 1;
    position: relative;
    border: 2px solid #ccc;
    border-radius: 8px;
    background-color: #fff;
    padding: 15px;
    height: 100%;
    min-height: 120px;
  }
  .suggestion-text {
    font-size: 1em;
    font-weight: bold;
    color: #28a745;
  }

  /* 响应式调整 */
  @media (max-width: 1200px) {
    .newTitle {
      font-size: 2rem;
    }
    .danger-level-box {
      font-size: 3rem;
      height: 70px;
      line-height: 70px;
    }
    .image-grid-container {
      height: 200px;
    }
    .image-box {
        height: 120px;
    }
  }
</style>
