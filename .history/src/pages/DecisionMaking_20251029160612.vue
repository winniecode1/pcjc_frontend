<template>
  <div class="section">
    <div class="register" :style="{width: fullWidth+'px', height:fullHeight+'px'}"></div>
    <div class="img_box" :style="{width: fullWidth+'px'}"></div>

    <b-row class="justify-content-center pt-5">
      <b-col cols="10" class="text-center">
        <p class="newTitle text-center">决策选择</p>
      </b-col>
    </b-row>

    <b-row class="justify-content-center pt-4 mb-4">
      <b-col cols="10" class="main-container">

        <b-row class="top-row">
          
          <b-col cols="3" class="section-box left-section d-flex flex-column">
            
            <div class="info-box-top p-3 mb-2">
              <div class="box-label-text">第三阶段给出的文字信息</div>
              <p class="text-left placeholder-text-small">{{ previousStageText }}</p>
            </div>

            <div class="inference-btn-wrapper mb-2">
                <b-button @click="startInference" variant="secondary" :disabled="isLoading" class="inference-btn-image">
                    {{ isLoading ? '推理中...' : '信息推理' }}
                </b-button>
            </div>

            <div class="info-box-bottom p-3">
              <div class="box-label-text">本阶段产生的文本信息</div>
              <p class="text-left placeholder-text-small result-text">{{ decisionResult }}</p>
            </div>
            
          </b-col>

          <b-col cols="5" class="section-box center-section d-flex flex-column">
            <div class="box-label-title">多帧行为图片输入</div>
            <div class="image-grid-container p-3">
                <div v-for="(img, index) in multiFrameImages" :key="index" class="image-wrapper">
                    <div class="image-box">
                        <img :src="img.src" :alt="img.alt" class="frame-image" @error="handleImageError">
                    </div>
                </div>
            </div>
          </b-col>

          <b-col cols="4" class="section-box right-section">
            </b-col>

        </b-row>
        
        <b-row class="bottom-row mt-3">

          <b-col cols="3" class="section-box bottom-left-section p-3">
            <div class="box-label-title">数据筛选简化</div>
            <div class="venn-diagram-container">
                <div class="venn-circle-1"></div>
                <div class="venn-circle-2"></div>
                <div class="venn-legend">
                    <div class="legend-item"><span class="legend-color legend-color-1"></span>已处理字符实体: 200 Tokens</div>
                    <div class="legend-item"><span class="legend-color legend-color-2"></span>未处理字符实体: 100 Tokens</div>
                </div>
            </div>
          </b-col>

          <b-col cols="5" class="d-flex p-0">
            <b-col cols="6" class="section-box bottom-center-left p-3">
                <div class="box-label-title-sub">准确率</div>
                <div class="pie-chart-placeholder accuracy-chart"></div>
            </b-col>
            <b-col cols="6" class="section-box bottom-center-right p-3">
                <div class="box-label-title-sub">偏差</div>
                <div class="pie-chart-placeholder bias-chart"></div>
            </b-col>
          </b-col>

          <b-col cols="4" class="section-box bottom-right-section d-flex p-0">
            <b-col cols="6" class="danger-level-number-col d-flex align-items-center justify-content-center">
                <div class="danger-level-number" :class="`level-${dangerLevel}`">
                    {{ dangerLevel }}!
                </div>
            </b-col>
            <b-col cols="6" class="danger-level-list-col p-2">
                <div class="box-label-title-sub">危险级别</div>
                <div class="danger-list">
                    <div class="danger-item level-item-1">常 态 <span>1</span></div>
                    <div class="danger-item level-item-2">加强警戒 <span>2</span></div>
                    <div class="danger-item level-item-3">提高戒备 <span>3</span></div>
                    <div class="danger-item level-item-4 current-level">高度戒备 <span>4</span></div>
                    <div class="danger-item level-item-5">战备状态 <span>5</span></div>
                </div>
            </b-col>

          </b-col>

        </b-row>

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
      // 注意：这里保留了原始的 4 张图片数据，但在样式中它们是并列展示的
      multiFrameImages: [
        { src: 'https://placehold.co/400x300/F0F8FF/000?text=Frame+1', alt: 'Frame 1' },
        { src: 'https://placehold.co/400x300/F0F8FF/000?text=Frame+2', alt: 'Frame 2' },
        { src: 'https://placehold.co/400x300/F0F8FF/000?text=Frame+3', alt: 'Frame 3' },
        { src: 'https://placehold.co/400x300/F0F8FF/000?text=Frame+4', alt: 'Frame 4' },
      ],

      dangerLevel: 4, // 1-5 级 (与图片保持一致)
      decisionResult: '综合判断：目标行为具有高威胁性，对关键区域构成直接风险。',
      decisionSuggestion: '立即执行预案B：发送最后警告，并准备拦截。', // 此项在布局中已移除
    };
  },
  computed: {
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
        // 模拟推理结果更新 (与图片中的 '4' 保持一致，所以不修改)
        // this.dangerLevel = 5; 
        // this.decisionResult = '推理更新：目标已进入禁区边缘，威胁等级提升至最高。';
      }, 2000);
    },
    handleImageError(event) {
        // 图片加载失败时显示占位符
        event.target.src = 'https://placehold.co/400x300/AFAFAF/FFF?text=Image+Load+Error';
        event.target.onerror = null; // 防止无限循环
    }
    
    // 预留的后端调用函数 (保持可修改性)
    /* ... (省略未修改的 fetchInitialData) ... */
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
  .main-container {
    height: 700px; /* 设定一个主体容器的高度，以容纳上下两排内容 */
  }

  /* 核心模块样式 */
  /* 用于信息框和图片框的标题 */
  .box-label-title { 
    font-size: 1.1em;
    font-weight: bold;
    color: #000;
    text-align: left;
    margin-bottom: 8px;
    padding: 0 5px;
  }
  /* 用于信息框内部的小标题 */
  .box-label-text {
    font-weight: bold;
    color: #000;
    margin-bottom: 5px;
  }
  .box-label-title-sub {
    font-weight: bold;
    color: #000;
    margin-bottom: 5px;
    text-align: center;
  }
  .placeholder-text-small {
    font-size: 0.9em;
    line-height: 1.5;
    min-height: 50px; /* 确保有最小高度 */
  }

  /* ------------------- 统一边框样式 (匹配图片) ------------------- */
  .section-box {
    border: 2px solid #000;
    border-radius: 4px;
    background-color: #fff;
    padding: 10px;
    box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
  }
  .top-row {
    height: 60%; /* 上部占主体 60% 高度 */
  }
  .bottom-row {
    height: 40%; /* 下部占主体 40% 高度 */
  }

  /* ------------------- 左侧布局 A ------------------- */
  .left-section {
    padding: 0 10px 10px 10px; /* 调整 padding */
    justify-content: space-between;
  }
  .info-box-top, .info-box-bottom {
    border: 2px solid #000;
    border-radius: 4px;
    background-color: #fff;
    position: relative;
    padding: 10px;
    text-align: left;
    height: 30%; /* 保证上下框平均占据空间 */
    min-height: 100px;
  }
  .inference-btn-wrapper {
    height: 15%; /* 按钮占据空间 */
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .inference-btn-image {
    background-color: #fff;
    color: #000;
    border: 2px solid #000;
    border-radius: 4px;
    font-weight: bold;
    width: 100%;
    height: 100%;
    transition: all 0.2s;
    &:hover {
        background-color: #eee;
    }
  }
  .result-text {
    font-weight: 500;
    color: #17a2b8;
  }
  
  /* ------------------- 中间布局 B ------------------- */
  .center-section {
    margin-left: 10px;
  }
  .image-grid-container {
    background-color: white;
    border: none; /* 容器内部不再需要边框 */
    padding: 0;
    display: grid;
    grid-template-columns: repeat(4, 1fr); /* 四列 */
    gap: 5px; /* 间距 */
    height: 100%;
  }

  .image-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center; 
    height: 100%; 
    padding: 0;
  }

  .image-box {
    width: 95%; 
    height: 100%;
    border: 1px solid #000; 
    border-radius: 4px;
    background-color: #f7f7f7;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    box-shadow: inset 0 0 5px rgba(0,0,0,0.05);
  }

  .frame-image {
    width: 100%;
    height: 100%;
    object-fit: cover; /* 填充整个框 */
  }

  /* ------------------- 右侧布局 C ------------------- */
  .right-section {
    margin-left: 10px;
    /* 图片中此区域为空白，故无需内容 */
  }

  /* ------------------- 左下布局 A' (数据筛选) ------------------- */
  .bottom-left-section {
    margin-top: -5px; /* 微调与上方间距 */
  }
  .venn-diagram-container {
    position: relative;
    width: 100%;
    height: 70%; /* 为下面的图例留出空间 */
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
  }
  .venn-circle-1 {
    position: absolute;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background-color: #FFDAB9; /* 淡橙色 */
    opacity: 0.7;
    left: 20%;
    border: 1px solid #FFA07A;
  }
  .venn-circle-2 {
    position: absolute;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background-color: #FFC0CB; /* 淡粉色 */
    opacity: 0.7;
    right: 20%;
    border: 1px solid #FF69B4;
  }
  .venn-legend {
    position: absolute;
    bottom: -5px;
    width: 100%;
    font-size: 0.8em;
  }
  .legend-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 5px;
    padding: 0 10px;
  }
  .legend-color {
    width: 10px;
    height: 10px;
    margin-right: 5px;
    border: 1px solid #000;
  }
  .legend-color-1 { background-color: #FFDAB9; }
  .legend-color-2 { background-color: #FFC0CB; }


  /* ------------------- 中下布局 B' (准确率/偏差) ------------------- */
  .bottom-center-left, .bottom-center-right {
    margin-top: -5px;
    margin-left: 10px;
    padding: 10px !important;
  }
  .bottom-center-right {
    margin-left: 5px;
  }
  .pie-chart-placeholder {
    height: 80%;
    border-radius: 50%;
    margin: 10px auto 0;
    border: 1px solid #ccc;
    position: relative;
  }
  .accuracy-chart {
    background: conic-gradient(#90EE90 75%, #ccc 0%); /* 模拟 75% 准确率 */
  }
  .bias-chart {
    background: conic-gradient(#ADD8E6 35%, #ccc 0%); /* 模拟 35% 偏差 */
  }


  /* ------------------- 右下布局 C' (危险等级/级别) ------------------- */
  .bottom-right-section {
    margin-top: -5px;
    margin-left: 10px;
    padding: 0 !important;
  }

  .danger-level-number-col {
    background-color: #f7f7f7;
    border-right: 2px solid #000;
  }

  .danger-level-number {
    font-family: 'Arial Black', Gadget, sans-serif;
    font-size: 8rem;
    font-weight: 900;
    transition: all 0.3s ease;
    
    &.level-4 { color: #FF4500; text-shadow: 2px 2px 5px rgba(255, 69, 0, 0.5); }
    &.level-5 { color: #FF0000; text-shadow: 2px 2px 5px rgba(255, 0, 0, 0.7); animation: pulse 1s infinite alternate; }
  }

  .danger-level-list-col {
    background-color: #fff;
    display: flex;
    flex-direction: column;
  }
  .danger-list {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
  .danger-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9em;
    padding: 2px 8px;
    margin: 2px 0;
    border-radius: 2px;
    border: 1px solid transparent;
    
    span {
        font-weight: bold;
        padding: 1px 5px;
        border-radius: 3px;
        color: #fff;
    }
  }

  /* 危险级别列表颜色 */
  .level-item-1 { span { background-color: #90EE90; } } /* 常态 */
  .level-item-2 { span { background-color: #ADD8E6; } } /* 加强警戒 */
  .level-item-3 { span { background-color: #FFA07A; } } /* 提高戒备 */
  .level-item-4 { span { background-color: #FF4500; } } /* 高度戒备 */
  .level-item-5 { span { background-color: #FF0000; } } /* 战备状态 */
  
  .current-level {
    font-weight: bold;
    border: 1px dashed #000; /* 突出当前等级 */
  }

  @keyframes pulse {
    from { transform: scale(1.0); }
    to { transform: scale(1.05); }
  }

  /* 响应式调整 (简单版本，仅调整字体和容器) */
  @media (max-width: 1200px) {
    .newTitle {
      font-size: 2rem;
    }
    .danger-level-number {
      font-size: 5rem;
    }
  }
</style>