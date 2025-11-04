<template>
  <div class="section">
    <div class="register" :style="{width: fullWidth+'px', height:fullHeight+'px'}"></div>
    <div class="img_box" :style="{width: fullWidth+'px'}"></div>
    <!-- 标题区域 -->
    <b-row class="justify-content-center pt-5">
      <b-col cols="10" class="text-center">
        <p class="newTitle text-center">决策选择</p>
      </b-col>
    </b-row>

    <!-- 核心内容区域 -->
    <b-row class="justify-content-center pt-4 mb-4">
      <!-- 信息推理区域（左） -->
      <b-col cols="3" class="text-center mx-3 d-flex flex-column">
        <div class="box-label">信息推理</div>
        <div class="info-box-top p-3 mb-3">
          <div class="box-label-sub">第三阶段给出的文字信息</div>
          <p class="text-left placeholder-text-small">{{ previousStageText }}</p>
        </div>
        
        <!-- 接口参数输入区（对接后端必填参数） -->
        <div class="param-input-box p-3 mb-3 border border-2 border-ccc bg-white">
          <div class="param-item mb-2">
            <input v-model="weaponModel" placeholder="输入武器型号（如B-2）" class="form-control">
          </div>
          <div class="param-item mb-2">
            <input v-model="txtFilePath" placeholder="输入本地TXT文件路径" class="form-control">
          </div>
          <div class="param-item mb-2">
            <input v-model="apiKey" placeholder="输入DashScope API Key" class="form-control">
          </div>
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

      <!-- 多帧行为图片输入（中） -->
      <b-col cols="8" class="text-center mx-3">
        <div class="box-label">多时序图像数据</div>
        <b-row class="multi-image-container">
          <b-col v-for="(url, index) in multiFrameImageURLs" :key="index" cols="3" class="p-2">
            <div class="image-placeholder">
              <img :src="url" alt="多帧行为图" class="image-display" v-if="url">
              <div v-else class="placeholder-text">图片 {{ index + 1 }}</div>
            </div>
          </b-col>
        </b-row>
        
        <!-- 图片文件夹路径输入（对接后端model_img_dir参数） -->
        <div class="img-path-input mt-3">
          <input v-model="modelImgDir" placeholder="输入武器图片文件夹绝对路径" class="form-control">
        </div>
      </b-col>
    </b-row>

    <!-- 底部指标区域 -->
    <b-row class="justify-content-center mt-4 pb-5">
      <!-- 数据筛选简化 -->
      <b-col cols="3" class="text-center metric-container mx-3">
        <div class="box-label">数据筛选简化</div>
        <div class="metric-box-small p-3">
          <div id="dataSimplificationChart" class="chart-container"></div>
        </div>
        <div class="legend-box mt-2">
          <span class="legend-item" style="border-left-color: #f7a35c;">上阶段的贡献/冗余: {{ legendData.previous }} Tokens</span>
          <span class="legend-item" style="border-left-color: #90ed7d;">本阶段的贡献/冗余: {{ legendData.current }} Tokens</span>
        </div>
      </b-col>

      <!-- 准确率/偏差 -->
      <b-col cols="3" class="text-center metric-container mx-3">
        <div class="box-label">准确率 / 偏差</div>
        <div class="metric-box-small p-3">
          <div id="accuracyChart" class="chart-container"></div>
          <div class="accuracy-info mt-2 text-center">
            <p>偏差检测准确率: {{ accuracyData.detectionAccuracy }}%</p>
            <p>综合准确度: {{ accuracyData.comprehensive }}%</p>
            <p>偏差值: {{ accuracyData.deviation }}</p>
          </div>
        </div>
      </b-col>

      <!-- 危险等级 -->
      <b-col cols="4" class="text-center metric-container mx-3 d-flex">
        <div class="level-main-box">
          <div class="box-label">危险等级</div>
          <div class="danger-level-box" :class="dangerLevelClass">
            {{ dangerLevelText }}
          </div>
          <div class="level-evaluation mt-3">
            <p>模型评估危险等级: {{ modelDangerLevel }}</p>
            <p>专家评估危险等级: {{ expertDangerLevel }}</p>
          </div>
        </div>
        <div class="level-sub-box ml-4">
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

      // 后端接口参数
      weaponModel: '', // 武器型号
      modelImgDir: '', // 图片文件夹路径
      txtFilePath: '', // TXT文件路径
      apiKey: '', // API密钥

      // 文本信息
      previousStageText: '发现目标-武器装备，位于指定区域，行为模式需进一步分析。第三阶段已获取基础性能数据，待决策阶段验证。',
      currentStageText: '', // 本阶段后端返回的总结信息

      // 多帧图片（后端返回或默认占位）
      multiFrameImageURLs: [
        '/api/decision_image/frame_01.png',
        '/api/decision_image/frame_02.png',
        '/api/decision_image/frame_03.png',
        '/api/decision_image/frame_04.png'
      ],

      // 数据筛选简化图例
      legendData: {
        previous: 0,
        current: 0
      },

      // 准确率/偏差数据（后端返回）
      accuracyData: {
        detectionAccuracy: 0, // 偏差检测准确率
        comprehensive: 0, // 综合准确度
        deviation: 0 // 偏差值
      },

      // 危险等级相关（严格匹配设计图：四级战备→一级战备，等级越高越危险）
      dangerLevel: 4, // 默认四级战备
      dangerLabels: [
        { level: 1, status: '一级战备', color: '#FF0000' }, // 最高级
        { level: 2, status: '二级战备', color: '#FF4500' },
        { level: 3, status: '三级战备', color: '#FFA07A' },
        { level: 4, status: '四级战备', color: '#90EE90' } // 最低级
      ],
      modelDangerLevel: '未知', // 模型评估危险等级
      expertDangerLevel: '未知', // 专家评估危险等级
      dangerLevelText: '四级战备'
    };
  },
  computed: {
    // 危险等级样式
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
    // 初始化图表
    this.initCharts();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    handleResize() {
      this.fullWidth = window.innerWidth;
      this.fullHeight = window.innerHeight;
      this.initCharts(); // 窗口 resize 时重新渲染图表
    },

    // 初始化图表
    initCharts() {
      this.initDataSimplificationChart();
      this.initAccuracyChart();
    },

    // 数据筛选简化图表
    initDataSimplificationChart() {
      const chartDom = document.getElementById('dataSimplificationChart');
      const myChart = echarts.init(chartDom);
      const option = {
        tooltip: { trigger: 'item' },
        legend: { top: 'bottom' },
        series: [
          {
            name: '数据贡献/冗余',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: { show: false, position: 'center' },
            emphasis: {
              label: { show: true, fontSize: 16, fontWeight: 'bold' }
            },
            labelLine: { show: false },
            data: [
              { value: this.legendData.previous, name: '上阶段贡献/冗余', itemStyle: { color: '#f7a35c' } },
              { value: this.legendData.current, name: '本阶段贡献/冗余', itemStyle: { color: '#90ed7d' } }
            ]
          }
        ]
      };
      myChart.setOption(option);
      window.addEventListener('resize', () => myChart.resize());
    },

    // 准确率/偏差图表
    initAccuracyChart() {
      const chartDom = document.getElementById('accuracyChart');
      const myChart = echarts.init(chartDom);
      const option = {
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', data: ['综合准确度', '偏差值'] },
        yAxis: { type: 'value', max: 1 },
        series: [
          {
            data: [this.accuracyData.comprehensive / 100, this.accuracyData.deviation],
            type: 'bar',
            itemStyle: {
              color: (params) => params.dataIndex === 0 ? '#90ed7d' : '#f7a35c'
            }
          }
        ]
      };
      myChart.setOption(option);
      window.addEventListener('resize', () => myChart.resize());
    },

    // 对接后端API：武器性能分析
    async startInference() {
      // 校验必填参数
      if (!this.weaponModel || !this.modelImgDir || !this.txtFilePath) {
        alert('请填写完整必填参数（武器型号、图片路径、TXT文件路径）');
        return;
      }

      this.isLoading = true;
      try {
        // 发送POST请求到后端接口
        const response = await axios.post('/analyze-weapon', {
          weapon_model: this.weaponModel,
          model_img_dir: this.modelImgDir,
          txt_file_path: this.txtFilePath,
          api_key: this.apiKey || process.env.VUE_APP_DASHSCOPE_API_KEY
        });

        const result = response.data;
        if (result.status === 'success') {
          const data = result.data;
          // 更新页面数据
          this.currentStageText = data.summary; // 本阶段总结文本
          this.modelDangerLevel = data.model_analysis_danger_level; // 模型评估危险等级
          this.expertDangerLevel = this.getExpertDangerLevel(data.model_analysis_danger_level); // 模拟专家评估（可替换为真实专家数据）
          
          // 更新准确率/偏差数据
          this.accuracyData.detectionAccuracy = 100; // 设计图要求偏差检测准确率100%
          this.accuracyData.comprehensive = data.comprehensive_accuracy * 100;
          this.accuracyData.deviation = data.deviation_value;

          // 更新危险等级（转换后端危险等级为战备等级）
          this.dangerLevel = this.convertDangerLevel(data.model_analysis_danger_level);
          this.dangerLevelText = this.dangerLabels.find(item => item.level === this.dangerLevel).status;

          // 更新数据筛选简化图例（模拟Token数据，可替换为后端真实返回）
          this.legendData.previous = Math.floor(Math.random() * 100 + 150);
          this.legendData.current = Math.floor(Math.random() * 80 + 100);

          // 重新渲染图表
          this.initCharts();
        } else {
          alert(`接口返回错误：${result.error.message}`);
        }
      } catch (error) {
        console.error('接口调用失败：', error);
        alert('接口调用失败，请检查参数或网络连接');
      } finally {
        this.isLoading = false;
      }
    },

    // 转换后端危险等级为前端战备等级（后端：危险等级1→最高，对应前端一级战备）
    convertDangerLevel(backendLevel) {
      const levelMap = {
        '危险等级1': 1,
        '危险等级2': 2,
        '危险等级3': 3,
        '危险等级4': 4
      };
      return levelMap[backendLevel] || 4;
    },

    // 模拟专家评估危险等级（与模型评估一致，可扩展为真实专家输入）
    getExpertDangerLevel(modelLevel) {
      const expertMap = {
        '危险等级1': '一级战备',
        '危险等级2': '二级战备',
        '危险等级3': '三级战备',
        '危险等级4': '四级战备'
      };
      return expertMap[modelLevel] || '四级战备';
    }
  }
};
</script>

<style lang="scss" scoped>
/* 基础样式 */
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
  min-height: 50px;
  white-space: pre-wrap;
}

/* 信息推理区域 */
.info-box-top, .info-box-bottom {
  border: 2px solid #ccc;
  background-color: #fff;
  position: relative;
  margin-top: 10px;
}
.info-box-top { min-height: 140px; }
.info-box-bottom { min-height: 140px; flex-grow: 1; }
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
.param-input-box {
  position: relative;
  .param-item {
    input { font-size: 0.9rem; }
  }
}

/* 多帧图片区域 */
.multi-image-container {
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
.img-path-input {
  input {
    font-size: 0.9rem;
    width: 80%;
    margin: 0 auto;
  }
}

/* 底部指标区域 */
.metric-container {
  position: relative;
  padding: 10px;
}
.metric-box-small {
  height: 250px;
  border: 2px solid #ccc;
  background-color: #fff;
  margin-top: 10px;
  padding: 10px;
  overflow: hidden;
}
.chart-container {
  width: 100%;
  height: 200px;
}
.accuracy-info {
  font-size: 0.85rem;
  text-align: left;
  padding-left: 10px;
}
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

/* 危险等级区域 */
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
  font-size: 2.5rem;
  font-weight: 900;
  background-color: #fff;
  &.level-1 { color: #FF0000; }
  &.level-2 { color: #FF4500; }
  &.level-3 { color: #FFA07A; }
  &.level-4 { color: #90EE90; }
}
.level-evaluation {
  margin-top: 10px;
  font-size: 0.9rem;
  text-align: left;
  padding-left: 10px;
}
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
    span { font-size: 1.2em; }
  }
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