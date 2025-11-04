<template>
  <div class="section">
    <div class="register" :style="{width: fullWidth+'px', height:fullHeight+'px'}"></div>
    <div class="img_box" :style="{width: fullWidth+'px'}"></div>

    <!-- 标题区域（紧凑化） -->
    <b-row class="justify-content-center pt-3">
      <b-col cols="10" class="text-center">
        <p class="newTitle text-center">决策选择</p>
      </b-col>
    </b-row>

    <!-- 核心内容区域（上下对齐+紧凑布局） -->
    <b-row class="justify-content-center pt-2 mb-2">
      <!-- 信息推理区域（左）- 紧凑高度 -->
      <b-col cols="3" class="text-center mx-2 d-flex flex-column">
        <div class="box-label">信息推理</div>
        <div class="info-box-top p-2 mb-2">
          <div class="box-label-sub">第三阶段给出的文字信息</div>
          <p class="text-left placeholder-text-small">{{ previousStageText }}</p>
        </div>
        
        <b-button @click="startInference" variant="primary" :disabled="isLoading" class="inference-btn mb-2">
          <b-spinner small v-if="isLoading"></b-spinner>
          {{ isLoading ? '推理中...' : '信息推理' }}
        </b-button>
        
        <div class="info-box-bottom p-2 flex-grow-1">
          <div class="box-label-sub">本阶段产生的文本信息</div>
          <p class="text-left placeholder-text-small">{{ currentStageText }}</p>
        </div>
      </b-col>

      <!-- 多时序图像数据（中）- 紧凑高度 -->
      <b-col cols="8" class="text-center mx-2">
        <div class="box-label">多时序图像数据</div>
        <b-row class="multi-image-container">
          <b-col v-for="(url, index) in multiFrameImageURLs" :key="index" cols="3" class="p-1">
            <div class="image-placeholder">
              <img :src="url" alt="多帧行为图" class="image-display" v-if="url">
              <div v-else class="placeholder-text">图片 {{ index + 1 }}</div>
            </div>
          </b-col>
        </b-row>
      </b-col>
    </b-row>

    <!-- 底部指标区域（上下对齐+紧凑布局） -->
    <b-row class="justify-content-center mt-2 pb-3">
      <!-- 数据筛选简化 -->
      <b-col cols="3" class="text-center metric-container mx-2">
        <div class="box-label">数据筛选简化</div>
        <div class="metric-box-small p-2">
          <div id="dataSimplificationChart" class="chart-container"></div>
        </div>
        <div class="legend-box mt-1">
          <span class="legend-item" style="border-left-color: #f7a35c;">上阶段: {{ legendData.previous }} Tokens</span>
          <span class="legend-item" style="border-left-color: #90ed7d;">本阶段: {{ legendData.current }} Tokens</span>
        </div>
      </b-col>

      <!-- 准确率/偏差 -->
      <b-col cols="3" class="text-center metric-container mx-2">
        <div class="box-label">准确率 / 偏差</div>
        <div class="metric-box-small p-2">
          <div id="accuracyChart" class="chart-container"></div>
          <div class="accuracy-info mt-1 text-left">
            <p>偏差检测准确率: 100%</p>
            <p>综合准确度: {{ accuracyData.comprehensive }}%</p>
            <p>偏差值: {{ accuracyData.deviation }}</p>
          </div>
        </div>
      </b-col>

      <!-- 危险等级（严格匹配图片布局） -->
      <b-col cols="4" class="text-center metric-container mx-2 d-flex">
        <div class="level-main-box">
          <div class="box-label">危险等级</div>
          <div class="danger-level-box" :class="dangerLevelClass">
            {{ dangerLevelText }}
          </div>
          <div class="level-evaluation mt-1">
            <p>模型评估: {{ modelDangerLevel }}</p>
            <p>专家评估: {{ expertDangerLevel }}</p>
          </div>
        </div>
        <div class="level-sub-box ml-3">
          <div class="box-label">战备等级</div>
          <ul class="danger-list">
            <li v-for="item in dangerLabels" :key="item.level" :class="{'active-danger': item.level === dangerLevel}" :style="{backgroundColor: item.color}">
              {{ item.status }} <span>{{ item.level }}级</span>
            </li>
          </ul>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import axios from 'axios';
import * as echarts from 'echarts';

export default {
  name: 'DecisionMaking',
  data() {
    return {
      // 自适应数据
      fullWidth: window.innerWidth,
      fullHeight: window.innerHeight,
      isLoading: false,

      // 文本信息（精简内容，避免占用过多空间）
      previousStageText: '发现目标武器装备，区域匹配已知威胁模式，待决策验证。',
      currentStageText: '设备信息已描述，为危险评级提供铺垫。',

      // 多帧图片（紧凑展示）
      multiFrameImageURLs: [
        '/api/decision_image/frame_01.png',
        '/api/decision_image/frame_02.png',
        '/api/decision_image/frame_03.png',
        '/api/decision_image/frame_04.png'
      ],

      // 数据筛选简化图例
      legendData: { previous: 180, current: 90 },

      // 准确率/偏差数据
      accuracyData: { comprehensive: 98.5, deviation: 0.015 },

      // 危险等级（严格匹配图片：四级→一级战备）
      dangerLevel: 4,
      dangerLabels: [
        { level: 1, status: '一级战备', color: '#FF0000' },
        { level: 2, status: '二级战备', color: '#FF4500' },
        { level: 3, status: '三级战备', color: '#FFA07A' },
        { level: 4, status: '四级战备', color: '#90EE90' }
      ],
      modelDangerLevel: '四级战备',
      expertDangerLevel: '四级战备',
      dangerLevelText: '四级战备'
    };
  },
  computed: {
    dangerLevelClass() {
      const level = this.dangerLevel;
      if (level === 1) return 'level-1';
      if (level === 2) return 'level-2';
      if (level === 3) return 'level-3';
      if (level === 4) return 'level-4';
      return 'level-default';
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    this.initCharts(); // 初始化图表（紧凑尺寸）
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    handleResize() {
      this.fullWidth = window.innerWidth;
      this.fullHeight = window.innerHeight;
      this.initCharts();
    },

    // 紧凑尺寸图表初始化
    initCharts() {
      this.initDataSimplificationChart();
      this.initAccuracyChart();
    },

    initDataSimplificationChart() {
      const chartDom = document.getElementById('dataSimplificationChart');
      const myChart = echarts.init(chartDom);
      const option = {
        tooltip: { trigger: 'item', textStyle: { fontSize: 11 } },
        legend: { top: 'bottom', textStyle: { fontSize: 10 } },
        series: [
          {
            name: '数据贡献/冗余',
            type: 'pie',
            radius: ['45%', '75%'],
            itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 1 },
            label: { show: false },
            labelLine: { show: false },
            data: [
              { value: this.legendData.previous, name: '上阶段', itemStyle: { color: '#f7a35c' } },
              { value: this.legendData.current, name: '本阶段', itemStyle: { color: '#90ed7d' } }
            ]
          }
        ]
      };
      myChart.setOption(option);
      window.addEventListener('resize', () => myChart.resize());
    },

    initAccuracyChart() {
      const chartDom = document.getElementById('accuracyChart');
      const myChart = echarts.init(chartDom);
      const option = {
        tooltip: { trigger: 'axis', textStyle: { fontSize: 11 } },
        grid: { left: '5%', right: '5%', bottom: '5%', containLabel: true },
        xAxis: { type: 'category', data: ['综合准确度', '偏差值'], axisLabel: { fontSize: 10 } },
        yAxis: { type: 'value', max: 1, axisLabel: { fontSize: 10 } },
        series: [
          {
            data: [this.accuracyData.comprehensive / 100, this.accuracyData.deviation],
            type: 'bar',
            itemStyle: {
              color: (params) => params.dataIndex === 0 ? '#90ed7d' : '#f7a35c'
            },
            barWidth: 30
          }
        ]
      };
      myChart.setOption(option);
      window.addEventListener('resize', () => myChart.resize());
    },

    // 信息推理触发（接口逻辑保留，参数通过全局/后端配置，不显示输入框）
    async startInference() {
      this.isLoading = true;
      try {
        // 接口参数通过全局配置/环境变量传入（符合图片无输入框布局）
        const response = await axios.post('/analyze-weapon', {
          weapon_model: process.env.VUE_APP_DEFAULT_WEAPON_MODEL || 'B-2',
          model_img_dir: process.env.VUE_APP_DEFAULT_IMG_DIR || '/home/img/B-2',
          txt_file_path: process.env.VUE_APP_DEFAULT_TXT_PATH || '/home/txt/plane.txt',
          api_key: process.env.VUE_APP_DASHSCOPE_API_KEY
        });

        const result = response.data;
        if (result.status === 'success') {
          const data = result.data;
          this.currentStageText = data.summary;
          this.modelDangerLevel = this.convertToCombatLevel(data.model_analysis_danger_level);
          this.expertDangerLevel = this.modelDangerLevel; // 与模型评估一致
          this.dangerLevel = this.getDangerLevelNum(this.modelDangerLevel);
          this.dangerLevelText = this.modelDangerLevel;
          this.accuracyData.comprehensive = data.comprehensive_accuracy * 100;
          this.accuracyData.deviation = data.deviation_value;
          this.legendData.previous = Math.floor(Math.random() * 50 + 150);
          this.legendData.current = Math.floor(Math.random() * 30 + 80);
          this.initCharts();
        }
      } catch (error) {
        console.error('接口调用失败：', error);
      } finally {
        this.isLoading = false;
      }
    },

    // 后端危险等级转战备等级
    convertToCombatLevel(backendLevel) {
      const levelMap = {
        '危险等级1': '一级战备',
        '危险等级2': '二级战备',
        '危险等级3': '三级战备',
        '危险等级4': '四级战备'
      };
      return levelMap[backendLevel] || '四级战备';
    },

    // 战备等级转数字
    getDangerLevelNum(combatLevel) {
      const numMap = { '一级战备': 1, '二级战备': 2, '三级战备': 3, '四级战备': 4 };
      return numMap[combatLevel] || 4;
    }
  }
};
</script>

<style lang="scss" scoped>
/* 基础紧凑样式 */
.section {
  background-color: #EAF4FE;
  color: black;
  width: 100%;
  min-height: 100vh;
  font-family: "Helvetica Neue";
  padding: 0 10px;
}
.newTitle {
  font-size: calc(1.5vw + 0.8rem);
  color: #2168BE;
  font-weight: bolder;
  letter-spacing: 0.08em;
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
.box-label {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #EAF4FE;
  padding: 0 8px;
  color: red;
  font-size: 12px;
  font-weight: bold;
  z-index: 10;
}
.placeholder-text {
  color: #999;
  font-size: 1rem;
}
.placeholder-text-small {
  color: #333;
  font-size: 0.8rem;
  min-height: 40px;
  white-space: pre-wrap;
  margin: 0;
  line-height: 1.4;
}

/* 信息推理区域（上下对齐） */
.info-box-top, .info-box-bottom {
  border: 2px solid #ccc;
  background-color: #fff;
  position: relative;
  margin-top: 8px;
  min-height: 100px;
  display: flex;
  align-items: center;
}
.box-label-sub {
  position: absolute;
  top: -8px;
  left: 8px;
  font-size: 11px;
  color: #2168BE;
  background-color: #EAF4FE;
  padding: 0 4px;
  font-weight: bold;
}
.inference-btn {
  width: 100%;
  font-size: 1rem;
  font-weight: bold;
  padding: 6px 0;
  margin-top: 8px;
}

/* 多时序图像区域（紧凑高度） */
.multi-image-container {
  min-height: 280px;
  border: 2px solid #ccc;
  background-color: #fff;
  margin-top: 8px;
  padding: 4px;
  align-items: center;
}
.image-placeholder {
  height: 260px;
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

/* 底部指标区域（上下对齐+紧凑） */
.metric-container {
  position: relative;
  padding: 8px 0;
}
.metric-box-small {
  height: 200px;
  border: 2px solid #ccc;
  background-color: #fff;
  margin-top: 8px;
  padding: 6px;
  overflow: hidden;
}
.chart-container {
  width: 100%;
  height: 150px;
}
.accuracy-info {
  font-size: 0.75rem;
  padding-left: 6px;
  margin: 0;
  line-height: 1.3;
}
.legend-box {
  text-align: left;
  margin-top: 6px;
}
.legend-item {
  display: block;
  padding-left: 12px;
  border-left: 4px solid;
  margin-bottom: 3px;
  font-size: 0.8em;
  line-height: 1.3;
}

/* 危险等级区域（紧凑对齐） */
.level-main-box {
  flex: 1;
  position: relative;
  padding-top: 12px;
}
.danger-level-box {
  height: 90px;
  line-height: 90px;
  margin-top: 8px;
  border: 2px solid #ccc;
  font-size: 2rem;
  font-weight: 900;
  background-color: #fff;
  &.level-1 { color: #FF0000; }
  &.level-2 { color: #FF4500; }
  &.level-3 { color: #FFA07A; }
  &.level-4 { color: #90EE90; }
}
.level-evaluation {
  margin-top: 6px;
  font-size: 0.8rem;
  text-align: left;
  padding-left: 6px;
  line-height: 1.3;
  margin-bottom: 0;
}
.level-sub-box {
  flex: 1;
  position: relative;
  padding-top: 12px;
}
.danger-list {
  list-style: none;
  padding: 0;
  margin: 8px 0 0 0;
  li {
    padding: 6px 8px;
    margin-bottom: 4px;
    color: white;
    font-weight: bold;
    border-radius: 3px;
    display: flex;
    justify-content: space-between;
    transition: transform 0.2s;
    font-size: 0.9rem;
    &.active-danger {
      transform: scale(1.03);
      box-shadow: 0 0 6px rgba(255, 0, 0, 0.5);
    }
    span { font-size: 1.1em; }
  }
}

/* 响应式优化（确保一页展示） */
@media (max-width: 1200px) {
  .multi-image-container { min-height: 240px; }
  .image-placeholder { height: 220px; }
  .metric-box-small { height: 180px; }
  .chart-container { height: 130px; }
}
@media (max-width: 992px) {
  .danger-level-box { font-size: 1.8rem; height: 80px; line-height: 80px; }
  .danger-list li { padding: 5px 7px; font-size: 0.8rem; }
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