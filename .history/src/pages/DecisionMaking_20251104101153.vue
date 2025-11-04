<template>
  <div class="section">
    <div class="register" :style="{width: fullWidth+'px', height:fullHeight+'px'}"></div>
    <div class="img_box" :style="{width: fullWidth+'px'}"></div>

    <!-- 标题区域 -->
    <b-row class="justify-content-center pt-2">
      <b-col cols="12" class="text-center">
        <p class="newTitle">决策选择</p>
      </b-col>
    </b-row>

    <!-- 核心布局：左列 + 右列（上图像+下信息） -->
    <b-row class="justify-content-center pt-1 mb-1">
      <!-- 左列：上-第三阶段文本 → 中-推理按钮 → 下-本阶段文本 -->
      <b-col cols="3" class="mx-2 d-flex flex-column">
        <!-- 第三阶段文字信息 -->
        <div class="left-box top-box p-2 mb-1">
          <div class="box-label">第三阶段给出的文字信息</div>
          <p class="text-content">{{ previousStageText }}</p>
        </div>

        <!-- 信息推理按键 -->
        <b-button @click="startInference" variant="primary" :disabled="isLoading" class="inference-btn my-1">
          <b-spinner small v-if="isLoading"></b-spinner>
          {{ isLoading ? '推理中...' : '信息推理' }}
        </b-button>

        <!-- 本阶段文本信息 -->
        <div class="left-box bottom-box p-2 mt-1">
          <div class="box-label">本阶段产生的文本信息</div>
          <p class="text-content">{{ currentStageText }}</p>
        </div>
      </b-col>

      <!-- 右列：上-图像 → 下-设备描述+四个指标 -->
      <b-col cols="8" class="mx-2 d-flex flex-column">
        <!-- 右上角：多时序图像数据 -->
        <div class="right-top-box p-1 mb-1">
          <div class="box-label">多时序图像数据</div>
          <b-row class="image-container">
            <b-col v-for="(url, index) in multiFrameImageURLs" :key="index" cols="3" class="p-1">
              <div class="image-placeholder">
                <img :src="url" alt="多帧行为图" class="image-display" v-if="url">
                <div v-else class="placeholder-text">图片 {{ index + 1 }}</div>
              </div>
            </b-col>
          </b-row>
        </div>

        <!-- 右下角：上-设备描述 → 下-四个指标（准确率+模型等级+专家等级+等级制定） -->
        <div class="right-bottom-box p-1">
          <!-- 设备描述 -->
          <div class="device-desc-box mb-1">
            <div class="box-label">设备描述</div>
            <p class="desc-content">对此设备信息进行描述，为模型进行危险评级做铺垫</p>
          </div>

          <!-- 四个指标横向排列 -->
          <b-row class="indicators-container">
            <!-- 准确率（仅数字） -->
            <b-col cols="2" class="indicator-item text-center">
              <div class="indicator-label">准确率</div>
              <div class="indicator-value">{{ accuracyValue }}%</div>
            </b-col>

            <!-- 模型危险等级 -->
            <b-col cols="2" class="indicator-item text-center">
              <div class="indicator-label">模型危险等级</div>
              <div class="indicator-value">{{ modelDangerLevel }}</div>
            </b-col>

            <!-- 专家危险等级 -->
            <b-col cols="2" class="indicator-item text-center">
              <div class="indicator-label">专家危险等级</div>
              <div class="indicator-value">{{ expertDangerLevel }}</div>
            </b-col>

            <!-- 等级制定（战备等级选择） -->
            <b-col cols="4" class="indicator-item text-center">
              <div class="indicator-label">等级制定</div>
              <div class="level-selection">
                <div v-for="item in dangerLevels" :key="item.level" 
                     :class="{'active-level': item.level === selectedLevel}"
                     class="level-item" @click="selectLevel(item.level)">
                  {{ item.name }}
                </div>
              </div>
            </b-col>
          </b-row>
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
    return {
      // 自适应数据
      fullWidth: window.innerWidth,
      fullHeight: window.innerHeight,
      isLoading: false,

      // 左列文本信息
      previousStageText: '发现目标武器装备，位于指定区域，行为模式与已知威胁匹配',
      currentStageText: '设备信息已描述完成，危险评级准备就绪',

      // 右上角多帧图片
      multiFrameImageURLs: [
        '/api/decision_image/frame_01.png',
        '/api/decision_image/frame_02.png',
        '/api/decision_image/frame_03.png',
        '/api/decision_image/frame_04.png'
      ],

      // 右下角指标数据
      accuracyValue: 100, // 准确率（仅数字）
      modelDangerLevel: '四级战备',
      expertDangerLevel: '四级战备',

      // 等级制定（战备等级）
      dangerLevels: [
        { level: 1, name: '一级战备' },
        { level: 2, name: '二级战备' },
        { level: 3, name: '三级战备' },
        { level: 4, name: '四级战备' }
      ],
      selectedLevel: 4 // 当前选中等级
    };
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

    // 选择等级制定的战备等级
    selectLevel(level) {
      this.selectedLevel = level;
      // 同步更新危险等级显示
      const selected = this.dangerLevels.find(item => item.level === level);
      this.modelDangerLevel = selected.name;
      this.expertDangerLevel = selected.name;
    },

    // 信息推理接口调用
    async startInference() {
      this.isLoading = true;
      try {
        // 接口参数通过环境变量配置（无前端输入框）
        const response = await axios.post('/analyze-weapon', {
          weapon_model: process.env.VUE_APP_DEFAULT_WEAPON_MODEL || 'B-2',
          model_img_dir: process.env.VUE_APP_DEFAULT_IMG_DIR || '/home/img/B-2',
          txt_file_path: process.env.VUE_APP_DEFAULT_TXT_PATH || '/home/txt/plane.txt',
          api_key: process.env.VUE_APP_DASHSCOPE_API_KEY
        });

        const result = response.data;
        if (result.status === 'success') {
          const data = result.data;
          // 更新本阶段文本
          this.currentStageText = data.summary;
          // 更新准确率（保留1位小数）
          this.accuracyValue = Math.round(data.comprehensive_accuracy * 100 * 10) / 10;
          // 更新危险等级（后端危险等级转战备等级）
          const combatLevel = this.convertToCombatLevel(data.model_analysis_danger_level);
          this.modelDangerLevel = combatLevel;
          this.expertDangerLevel = combatLevel;
          // 同步选中等级
          this.selectedLevel = this.dangerLevels.find(item => item.name === combatLevel).level;
        }
      } catch (error) {
        console.error('接口调用失败：', error);
      } finally {
        this.isLoading = false;
      }
    },

    // 后端危险等级（危险等级1-4）转战备等级（一级-四级战备）
    convertToCombatLevel(backendLevel) {
      const levelMap = {
        '危险等级1': '一级战备',
        '危险等级2': '二级战备',
        '危险等级3': '三级战备',
        '危险等级4': '四级战备'
      };
      return levelMap[backendLevel] || '四级战备';
    }
  }
};
</script>

<style lang="scss" scoped>
/* 基础样式（紧凑+一页展示） */
.section {
  background-color: #EAF4FE;
  color: #333;
  width: 100%;
  min-height: 100vh;
  font-family: "Helvetica Neue";
  padding: 0 8px;
  overflow: hidden;
}
.newTitle {
  font-size: calc(1.2vw + 0.7rem);
  color: #2168BE;
  font-weight: bolder;
  letter-spacing: 0.05em;
  margin: 0;
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
  background-position: center;
  width: 100%;
  height: 100%;
  opacity: 0.8;
  z-index: -1;
}

/* 通用标签样式 */
.box-label {
  font-size: 0.85rem;
  color: red;
  font-weight: bold;
  margin-bottom: 4px;
  text-align: center;
}

/* 左列布局（上-文本 → 中-按钮 → 下-文本） */
.left-box {
  border: 2px solid #ccc;
  background-color: #fff;
  padding: 6px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.top-box { min-height: 120px; }
.bottom-box { min-height: 120px; }
.text-content {
  font-size: 0.8rem;
  line-height: 1.3;
  margin: 0;
  text-align: left;
}
.inference-btn {
  width: 100%;
  font-size: 0.9rem;
  padding: 5px 0;
  font-weight: bold;
}

/* 右列布局（上-图像 → 下-设备描述+指标） */
.right-top-box {
  border: 2px solid #ccc;
  background-color: #fff;
  padding: 6px;
  margin-bottom: 8px;
}
.image-container {
  min-height: 200px;
  align-items: center;
  margin: 0;
}
.image-placeholder {
  height: 180px;
  border: 1px dashed #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9f9f9;
}
.image-display {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.placeholder-text {
  color: #999;
  font-size: 0.9rem;
}

/* 右下角设备描述 */
.device-desc-box {
  border: 2px solid #ccc;
  background-color: #fff;
  padding: 6px;
  margin-bottom: 8px;
}
.desc-content {
  font-size: 0.8rem;
  margin: 0;
  text-align: center;
}

/* 右下角四个指标横向布局 */
.indicators-container {
  border: 2px solid #ccc;
  background-color: #fff;
  padding: 8px 4px;
  margin: 0;
}
.indicator-item {
  padding: 4px;
}
.indicator-label {
  font-size: 0.8rem;
  color: #2168BE;
  font-weight: bold;
  margin-bottom: 3px;
}
.indicator-value {
  font-size: 1rem;
  font-weight: bold;
  color: #FF4500;
}

/* 等级制定样式 */
.level-selection {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 100%;
}
.level-item {
  font-size: 0.85rem;
  padding: 3px 6px;
  border: 2px solid #ccc;
  border-radius: 3px;
  cursor: pointer;
  background-color: #f9f9f9;
  transition: all 0.2s;
}
.active-level {
  background-color: #FF4500;
  color: white;
  border-color: #FF0000;
  transform: scale(1.05);
}

/* 响应式优化（确保各屏幕一页展示） */
@media (max-width: 1200px) {
  .image-container { min-height: 180px; }
  .image-placeholder { height: 160px; }
  .top-box, .bottom-box { min-height: 100px; }
}
@media (max-width: 992px) {
  .indicator-value { font-size: 0.9rem; }
  .level-item { font-size: 0.8rem; padding: 2px 5px; }
}
@media (max-width: 768px) {
  .image-container { min-height: 150px; }
  .image-placeholder { height: 130px; }
  .text-content { font-size: 0.75rem; }
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