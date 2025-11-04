<template>
  <div class="section" :style="{height: `${windowHeight}px`}">
    <div class="register" :style="{width: `${windowWidth}px`, height: `${windowHeight}px`}"></div>
    <div class="img_box" :style="{width: `${windowWidth}px`, height: `${windowHeight}px`}"></div>

    <!-- 标题（严格匹配图片标题） -->
    <div class="title-container">
      <h1 class="newTitle">决策选择认知偏差检测 多时序图像数据</h1>
    </div>

    <!-- 核心布局：左列（3份）+ 右列（9份），满屏分布 -->
    <div class="core-layout">
      <!-- 左列：上-第三阶段文本 → 中-推理按钮 → 下-本阶段文本 -->
      <div class="left-column">
        <!-- 第三阶段给出的文字信息 -->
        <div class="left-module top-module">
          <div class="module-label">第三阶段给出的文字信息</div>
          <div class="module-content">
            <p class="text-content">{{ thirdStageText }}</p>
          </div>
        </div>

        <!-- 信息推理按键（仅触发接口，无其他功能） -->
        <div class="button-container">
          <b-button @click="fetchBackendData" variant="primary" :disabled="isLoading" class="inference-btn">
            <b-spinner small v-if="isLoading"></b-spinner>
            {{ isLoading ? '获取数据中...' : '信息推理' }}
          </b-button>
        </div>

        <!-- 本阶段产生的文本信息 -->
        <div class="left-module bottom-module">
          <div class="module-label">本阶段产生的文本信息</div>
          <div class="module-content">
            <p class="text-content">{{ currentStageText }}</p>
          </div>
        </div>
      </div>

      <!-- 右列：上-多时序图像 → 下-设备描述+四大指标 -->
      <div class="right-column">
        <!-- 右上角：多时序图像数据 -->
        <div class="right-module image-module">
          <div class="module-label">多时序图像数据</div>
          <div class="image-grid">
            <div class="image-item" v-for="(img, idx) in imageList" :key="idx">
              <img :src="img" alt="多时序图像" class="image-display" v-if="img">
              <div class="image-placeholder" v-else>图像 {{ idx + 1 }}</div>
            </div>
          </div>
        </div>

        <!-- 右下角：上-设备描述 → 下-四大指标 -->
        <div class="right-module bottom-right-module">
          <!-- 设备描述（严格匹配图片文本） -->
          <div class="device-desc">
            <div class="module-label">设备描述</div>
            <p class="desc-content">对此设备信息进行描述,为模型进行危险评级做铺垫</p>
          </div>

          <!-- 四大指标：从左到右 → 偏差检测准确率、模型评估危险等级、专家评估危险等级、等级制定 -->
          <div class="indicators-grid">
            <!-- 偏差检测准确率（仅数字，图片标注100%） -->
            <div class="indicator-item">
              <div class="indicator-label">偏差检测准确率</div>
              <div class="indicator-value">{{ deviationDetectionAccuracy }}%</div>
            </div>

            <!-- 模型评估危险等级（后端返回） -->
            <div class="indicator-item">
              <div class="indicator-label">模型评估危险等级</div>
              <div class="indicator-value">{{ modelDangerLevel }}</div>
            </div>

            <!-- 专家评估危险等级（后端返回，默认与模型一致） -->
            <div class="indicator-item">
              <div class="indicator-label">专家评估危险等级</div>
              <div class="indicator-value">{{ expertDangerLevel }}</div>
            </div>

            <!-- 等级制定（严格匹配图片：四级→一级战备，带数字） -->
            <div class="indicator-item level-selection-item">
              <div class="indicator-label">等级制定</div>
              <div class="level-list">
                <div class="level-item" :class="{'active-level': currentLevel === 4}">四级战备</div>
                <div class="level-item" :class="{'active-level': currentLevel === 3}">三级战备 <span class="level-num">3</span></div>
                <div class="level-item" :class="{'active-level': currentLevel === 2}">二级战备 <span class="level-num">2</span></div>
                <div class="level-item" :class="{'active-level': currentLevel === 1}">一级战备 <span class="level-num">1</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'DecisionMaking',
  data() {
    return {
      // 窗口尺寸（满屏用）
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      isLoading: false,

      // 后端接口参数（通过环境变量配置，无前端输入）
      apiConfig: {
        weaponModel: process.env.VUE_APP_WEAPON_MODEL || 'B-2',
        imgDir: process.env.VUE_APP_IMG_DIR || '/home/img/B-2',
        txtPath: process.env.VUE_APP_TXT_PATH || '/home/txt/plane.txt',
        apiKey: process.env.VUE_APP_DASHSCOPE_API_KEY
      },

      // 页面所有数据（初始为空，全从后端获取）
      thirdStageText: '', // 第三阶段文本（后端返回或前端缓存）
      currentStageText: '', // 本阶段总结（后端summary）
      imageList: [], // 多时序图像（后端返回图片URL列表）
      deviationDetectionAccuracy: 100, // 偏差检测准确率（图片固定100%）
      modelDangerLevel: '', // 模型危险等级（后端model_analysis_danger_level转换）
      expertDangerLevel: '', // 专家危险等级（后端local_txt_danger_level转换）
      currentLevel: 4 // 当前激活的战备等级（后端危险等级对应）
    };
  },
  mounted() {
    // 监听窗口 resize，保持满屏
    window.addEventListener('resize', this.handleResize);
    // 初始加载一次数据
    this.fetchBackendData();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    handleResize() {
      this.windowWidth = window.innerWidth;
      this.windowHeight = window.innerHeight;
    },

    // 从后端获取所有数据
    async fetchBackendData() {
      this.isLoading = true;
      try {
        const response = await axios.post('/analyze-weapon', {
          weapon_model: this.apiConfig.weaponModel,
          model_img_dir: this.apiConfig.imgDir,
          txt_file_path: this.apiConfig.txtPath,
          api_key: this.apiConfig.apiKey
        });

        const result = response.data;
        if (result.status === 'success') {
          this.parseBackendData(result.data);
        } else {
          console.error('后端返回错误：', result.error.message);
          this.currentStageText = `数据获取失败：${result.error.message}`;
        }
      } catch (error) {
        console.error('接口调用失败：', error);
        this.currentStageText = '接口调用失败，请检查网络或配置';
      } finally {
        this.isLoading = false;
      }
    },

    // 解析后端数据并更新页面
    parseBackendData(backendData) {
      // 1. 第三阶段文本（假设后端未返回，用固定场景文本，可替换为前端缓存数据）
      this.thirdStageText = `发现目标武器型号：${backendData.weapon_model}，位于指定区域，行为模式初步匹配已知威胁，待进一步分析验证`;

      // 2. 本阶段文本（后端summary）
      this.currentStageText = backendData.summary || '设备性能分析完成，危险等级已评估';

      // 3. 多时序图像（从后端imgDir读取，这里用模拟URL，实际可通过后端返回图片列表）
      this.imageList = [
        `${this.apiConfig.imgDir}/frame_1.png`,
        `${this.apiConfig.imgDir}/frame_2.png`,
        `${this.apiConfig.imgDir}/frame_3.png`,
        `${this.apiConfig.imgDir}/frame_4.png`
      ];

      // 4. 模型/专家危险等级（后端危险等级→战备等级转换）
      this.modelDangerLevel = this.convertToCombatLevel(backendData.model_analysis_danger_level);
      this.expertDangerLevel = this.convertToCombatLevel(backendData.local_txt_danger_level);

      // 5. 激活当前战备等级（对应后端危险等级）
      this.currentLevel = this.getLevelNum(backendData.model_analysis_danger_level);
    },

    // 后端危险等级（危险等级1-4）→ 战备等级（一级-四级战备）
    convertToCombatLevel(backendLevel) {
      const levelMap = {
        '危险等级1': '一级战备',
        '危险等级2': '二级战备',
        '危险等级3': '三级战备',
        '危险等级4': '四级战备'
      };
      return levelMap[backendLevel] || '四级战备';
    },

    // 后端危险等级→数字等级（1-4）
    getLevelNum(backendLevel) {
      const numMap = {
        '危险等级1': 1,
        '危险等级2': 2,
        '危险等级3': 3,
        '危险等级4': 4
      };
      return numMap[backendLevel] || 4;
    }
  }
};
</script>

<style lang="scss" scoped>
/* 基础样式：满屏无滚动 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.section {
  background-color: #EAF4FE;
  color: #333;
  font-family: "Helvetica Neue", sans-serif;
  overflow: hidden;
  position: relative;
}
.register, .img_box {
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}
.img_box {
  background-image: url('../assets/images/newBackGound.png');
  opacity: 0.8;
}

/* 标题样式（严格匹配图片） */
.title-container {
  text-align: center;
  padding: 15px 0;
  border-bottom: 2px solid #ccc;
  margin-bottom: 10px;
}
.newTitle {
  font-size: calc(1vw + 0.9rem);
  color: #2168BE;
  font-weight: bolder;
  letter-spacing: 0.03em;
}

/* 核心布局：左3右9，满屏分布 */
.core-layout {
  display: flex;
  height: calc(100% - 80px); /* 减去标题高度 */
  padding: 0 15px;
  gap: 15px;
}
.left-column {
  width: 25%; /* 3/12 */
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.right-column {
  width: 75%; /* 9/12 */
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 模块通用样式 */
.module-label {
  font-size: 0.9rem;
  color: bl;
  font-weight: bold;
  margin-bottom: 8px;
  text-align: center;
  background-color: #EAF4FE;
  padding: 0 8px;
  display: inline-block;
  position: relative;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
}
.module-content {
  border: 2px solid #ccc;
  background-color: #fff;
  padding: 15px 10px;
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
}
.text-content {
  font-size: 0.85rem;
  line-height: 1.4;
  text-align: left;
  width: 100%;
}

/* 左列模块：上下等高，填充左列 */
.left-module {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 150px;
}
.top-module, .bottom-module {
  height: 45%; /* 上下模块各占左列45%，中间按钮占10% */
}

/* 按钮容器：居中，占左列10%高度 */
.button-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 10%;
}
.inference-btn {
  width: 80%;
  font-size: 0.95rem;
  padding: 6px 0;
  font-weight: bold;
}

/* 右列图像模块：占右列45%高度 */
.image-module {
  height: 45%;
  display: flex;
  flex-direction: column;
}
.image-grid {
  border: 2px solid #ccc;
  background-color: #fff;
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 10px;
}
.image-item {
  border: 1px dashed #ddd;
  background-color: #f9f9f9;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.image-display {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.image-placeholder {
  color: #999;
  font-size: 0.9rem;
}

/* 右列底部模块：占右列55%高度 */
.bottom-right-module {
  height: 55%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.device-desc {
  border: 2px solid #ccc;
  background-color: #fff;
  padding: 10px;
  text-align: center;
}
.desc-content {
  font-size: 0.85rem;
  color: #333;
  margin: 0;
}

/* 四大指标网格：严格横向排列 */
.indicators-grid {
  border: 2px solid #ccc;
  background-color: #fff;
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 2fr; /* 最后一列占2份，匹配图片布局 */
  gap: 10px;
  padding: 15px;
}
.indicator-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.indicator-label {
  font-size: 0.85rem;
  color: #2168BE;
  font-weight: bold;
  margin-bottom: 8px;
}
.indicator-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #FF4500;
}

/* 等级制定样式（严格匹配图片） */
.level-selection-item {
  padding: 0 10px;
}
.level-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}
.level-item {
  font-size: 0.9rem;
  padding: 5px 0;
  border: 2px solid #ccc;
  border-radius: 3px;
  background-color: #f9f9f9;
  color: #333;
  font-weight: 500;
}
.level-num {
  color: #FF0000;
  font-weight: bold;
  margin-left: 5px;
}
.active-level {
  background-color: #FF4500;
  color: white;
  border-color: #FF0000;
  font-weight: bold;
}

/* 响应式优化：确保所有屏幕满屏无滚动 */
@media (max-width: 1440px) {
  .newTitle { font-size: calc(0.9vw + 0.8rem); }
  .text-content, .desc-content, .indicator-label, .level-item { font-size: 0.8rem; }
  .indicator-value { font-size: 1rem; }
}
@media (max-width: 1200px) {
  .core-layout { padding: 0 10px; gap: 10px; }
  .image-grid { gap: 8px; padding: 8px; }
  .indicators-grid { padding: 10px; gap: 8px; }
}
@media (max-width: 992px) {
  .left-column { width: 30%; }
  .right-column { width: 70%; }
  .image-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>




<!-- <template>
  <div class="section">
    <div class="register" :style="{width: fullWidth+'px', height:fullHeight+'px'}"></div>
    <div class="img_box" :style="{width: fullWidth+'px'}"></div>

    <b-row class="justify-content-center pt-5">
      <b-col cols="10" class="text-center">
        <p class="newTitle text-center">决策选择</p>
      </b-col>
    </b-row>

    <b-row class="justify-content-center pt-4 mb-4">

      <b-col cols="3" class="text-center mx-3 d-flex flex-column">
        <div class="box-label">信息推理</div>

        <div class="info-box-top p-3 mb-3">
          <div class="box-label-sub">第三阶段给出的文字信息</div>
          <p class="text-left placeholder-text-small">{{ previousStageText }}</p>
        </div>

        <b-button @click="startInference" variant="primary" :disabled="isLoading" class="inference-btn mb-3">
          <b-spinner small v-if="isLoading"></b-spinner>
          {{ isLoading ? '推理中...' : '信息推理' }}
        </b-button>

        <div class="info-box-bottom p-3 flex-grow-1">
          <div class="box-label-sub">本阶段产生的文本信息</div>
          <p class="text-left placeholder-text-small">{{ currentStageText }}</p>
        </div>
      </b-col>

      <b-col cols="8" class="text-center mx-3">
        <div class="box-label">多帧行为图片输入</div>
        <b-row class="multi-image-container">
          <b-col v-for="(url, index) in multiFrameImageURLs" :key="index" cols="3" class="p-2">
            <div class="image-placeholder">
              <img :src="url" alt="多帧行为图" class="image-display" v-if="url">
              <div v-else class="placeholder-text">图片 {{ index + 1 }}</div>
            </div>
          </b-col>
        </b-row>
      </b-col>
    </b-row>

    <b-row class="justify-content-center mt-4 pb-5">
      <b-col cols="3" class="text-center metric-container mx-3">
        <div class="box-label">数据筛选简化</div>
        <div class="metric-box-small p-3">
          <img :src="chartDataSimplificationURL" alt="数据筛选简化图" class="image-display" v-if="chartDataSimplificationURL">
          <div v-else class="placeholder-text-small">数据筛选饼图</div>
        </div>
        <div class="legend-box mt-2">
          <span class="legend-item" style="border-left-color: #f7a35c;">上阶段的贡献/冗余: {{ legendData.previous }} Tokens</span>
          <span class="legend-item" style="border-left-color: #90ed7d;">本阶段的贡献/冗余: {{ legendData.current }} Tokens</span>
        </div>
      </b-col>

      <b-col cols="3" class="text-center metric-container mx-3">
        <div class="box-label">准确率 / 偏差</div>
        <div class="metric-box-small p-3">
          <img :src="chartAccuracyURL" alt="准确率/偏差图" class="image-display" v-if="chartAccuracyURL">
          <div v-else class="placeholder-text-small">准确率 / 偏差图</div>
        </div>
      </b-col>

      <b-col cols="4" class="text-center metric-container mx-3 d-flex">
        <div class="level-main-box">
          <div class="box-label">危险等级</div>
          <div class="danger-level-box" :class="dangerLevelClass">
            {{ dangerLevel }}!
          </div>
        </div>
        <div class="level-sub-box ml-4">
          <div class="box-label">危险级别</div>
          <ul class="danger-list">
            <li v-for="item in dangerLabels" :key="item.level" :class="{'active-danger': item.level === dangerLevel}" :style="{backgroundColor: item.color}">
              {{ item.status }} <span>{{ item.level }}</span>
            </li>
          </ul>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'DecisionMaking',
  data() {
    // ------------------------------------------------------------------
    // ⚠️ 模拟数据 (写死) - 实际应用中将通过后端 API 接口获取
    // ------------------------------------------------------------------
    const backendBaseURL = '/api'; // 沿用 /api 代理
    const dangerLevel = 4; // 模拟当前危险等级

    return {
      // Background adaptive data
      fullWidth: window.innerWidth,
      fullHeight: window.innerHeight,

      isLoading: false,

      // Text info simulation
      previousStageText: '发现目标-船只，位于区域[120, 300, 450, 700]并向右移动。其行为模式与已知威胁模式高度匹配。需要进一步的决策分析。',
      currentStageText: '根据多帧图像分析和信息推理，目标船只行为确认异常。建议采取高度戒备，并准备执行拦截程序。',

      // Multi-frame images simulation (Placeholder for backend API) - **新增一个图片 URL**
      multiFrameImageURLs: [
        `${backendBaseURL}/decision_image/frame_01.png`,
        `${backendBaseURL}/decision_image/frame_02.png`,
        `${backendBaseURL}/decision_image/frame_03.png`,
        `${backendBaseURL}/decision_image/frame_04.png`, // 新增第四张图片
      ],

      // Chart simulation (Placeholder for backend API)
      chartDataSimplificationURL: `${backendBaseURL}/data_simplification_chart`,
      chartAccuracyURL: `${backendBaseURL}/accuracy_pie`,

      // Data simplification legend simulation
      legendData: {
        previous: 200,
        current: 100,
      },

      // Danger level simulation
      dangerLevel: dangerLevel,
      dangerLabels: [
        { level: 1, status: '常态', color: '#90EE90' },
        { level: 2, status: '加强警戒', color: '#ADD8E6' },
        { level: 3, status: '提高戒备', color: '#FFA07A' },
        { level: 4, status: '高度戒备', color: '#FF4500' }, // Corresponds to Level 4 in the screenshot
        { level: 5, status: '作战状态', color: '#FF0000' }
      ]
    };
  },
  computed: {
    // Dynamically calculate CSS class based on danger level
    dangerLevelClass() {
      const level = this.dangerLevel;
      if (level === 1) return 'level-1';
      if (level === 2) return 'level-2';
      if (level === 3) return 'level-3';
      if (level === 4) return 'level-4';
      if (level === 5) return 'level-5';
      return 'level-default';
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    handleResize() {
      this.fullWidth = window.innerWidth;
      this.fullHeight = window.innerHeight;
    },
    // Placeholder function for backend inference call
    async startInference() {
      this.isLoading = true;
      console.log("Calling decision making module inference API...");

      // Demo delay simulation
      setTimeout(() => {
        this.isLoading = false;
        console.log("Decision inference Demo finished.");
        // Update simulated data here if needed
      }, 2000);
    }
  }
};
</script>

<style lang="scss" scoped>
  /* ------------------- Base Styles (inherited from TargetDetection.vue) ------------------- */
  .section {
    background-color: #EAF4FE;
    color: black;
    font-size: 100%;
    width: 100%;
    min-height: 100vh;
    font-family: "Helvetica Neue";
    z-index: 2;
  }

  .newTitle {
    font-size: calc(2vw + 1rem);
    color: #2168BE;
    font-weight: bolder;
    letter-spacing: 0.1em;
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
      background-image: url('../assets/images/newBackGound.png');
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center center;
      width: 100%;
      height: 100%;
      opacity: 0.8;
  }

  .box-label {
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #EAF4FE;
    padding: 0 10px;
    color: red;
    font-size: 14px;
    font-weight: bold;
    z-index: 10;
  }

  .placeholder-text {
    color: #999;
    font-size: 1.2rem;
  }

  .placeholder-text-small {
    color: #333;
    font-size: 0.9rem;
    min-height: 50px; /* Base min-height for text */
    white-space: pre-wrap;
  }

  /* ------------------- Decision Making Module Specific Styles ------------------- */

  /* 1. Information Boxes and Inference Button */

  /* Shared border and background styles */
  .info-box-top, .info-box-bottom {
      border: 2px solid #ccc;
      background-color: #fff;
      position: relative;
      margin-top: 10px; /* To give space for the floating box-label */
  }

  /* Key Fix: Adjust padding and flex properties for vertical alignment */
  .info-box-top {
      /* This box contains text (min-height: 50px) + button (height ~40px + margin) */
      min-height: 140px;
  }

  .info-box-bottom {
      /* This box needs to align vertically with the first box */
      min-height: 140px;
      /* flex-grow-1 ensures it takes up the remaining vertical space if needed */
  }

  .box-label-sub {
      position: absolute;
      top: -10px;
      left: 10px;
      font-size: 12px;
      color: #2168BE;
      background-color: #EAF4FE;
      padding: 0 5px;
      font-weight: bold;
  }
  .inference-btn {
    width: 100%;
    font-size: 1.1rem;
    font-weight: bold;
  }

  /* 2. Multi-frame Image Area */
  .multi-image-container {
      /* The height of the image container must align with the total height of the left column boxes + button + margins */
      min-height: 350px;
      border: 2px solid #ccc;
      background-color: #fff;
      margin-top: 10px;
      padding: 5px;
  }
  .image-placeholder {
    height: 320px;
    border: 1px dashed #ddd;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    background-color: #f9f9f9;
  }
  .image-display {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  /* 3. Bottom Metrics Area */
  .metric-container {
      position: relative;
      padding: 10px;
      /* Ensure mx-3 margin is applied consistently */
  }
  .metric-box-small {
    height: 250px;
    border: 2px solid #ccc;
    background-color: #fff;
    margin-top: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }

  /* Data Simplification Legend */
  .legend-box {
      text-align: left;
      margin-top: 10px;
  }
  .legend-item {
      display: block;
      padding-left: 15px;
      border-left: 5px solid;
      margin-bottom: 5px;
      font-size: 0.9em;
  }

  /* Danger Level */
  .level-main-box {
    flex: 1;
    position: relative;
    padding-top: 15px;
  }
  .danger-level-box {
    height: 120px;
    line-height: 120px;
    margin-top: 10px;
    border: 2px solid #ccc;
    font-size: 6rem;
    font-weight: 900;
    background-color: #fff;

    // Dynamic color change
    &.level-1 { color: #90EE90; }
    &.level-2 { color: #ADD8E6; }
    &.level-3 { color: #FFA07A; }
    &.level-4 { color: #FF4500; }
    &.level-5 { color: #FF0000; }
  }

  /* Danger Level List */
  .level-sub-box {
    flex: 1;
    position: relative;
    padding-top: 15px;
  }
  .danger-list {
    list-style: none;
    padding: 0;
    margin: 10px 0 0 0;

    li {
      padding: 8px 10px;
      margin-bottom: 5px;
      color: white;
      font-weight: bold;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      transition: transform 0.2s;

      &.active-danger {
          transform: scale(1.05);
          box-shadow: 0 0 8px rgba(255, 0, 0, 0.6);
      }

      span {
          font-size: 1.2em;
      }
    }
  }

</style> -->