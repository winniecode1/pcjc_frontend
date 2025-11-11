<template>
  <div class="section" :style="{ height: `${windowHeight}px` }">
    <div class="register" :style="{ width: `${windowWidth}px`, height: `${windowHeight}px` }"></div>
    <div class="img_box" :style="{ width: `${windowWidth}px`, height: `${windowHeight}px` }"></div>

    <div class="top-nav-left">
      <router-link to="/" class="nav-btn">首页</router-link>
      <router-link to="/group-negotiation" class="nav-btn">返回</router-link>
    </div>
    <div class="top-nav-right">
      <router-link to="/attributiondiagnosis" class="nav-btn">下一页</router-link>
    </div>

    <div class="title-container">
      <h1 class="newTitle">决策选择认知偏差检测模型</h1>
    </div>

    <div class="core-layout-design">
      <!-- 左列文本框 - 带滑动条 -->
      <div class="design-left-column">
        <div class="design-module video-module">
          <div class="design-module-label">视频演示</div>
          <div class="design-module-content video-content-wrapper">
            <video v-if="testVideoUrl" :src="testVideoUrl" controls class="test-video-player"
              @error="handleVideoError"></video>
            <div v-else class="video-placeholder-text">
              {{ testVideoMessage }}
            </div>
          </div>
        </div>

        <div class="design-module text-module-left">
          <div class="design-module-content text-scrollable">
            <p class="text-content" v-html="thirdStageText"></p>
          </div>
        </div>

        <div class="button-container">
          <b-button @click="fetchBackendData" variant="primary" :disabled="isLoading" class="inference-btn">
            <b-spinner small v-if="isLoading"></b-spinner>
            {{ isLoading ? '获取数据中...' : '结果推理' }}
          </b-button>
        </div>
      </div>

      <!-- 中列文本框 - 带滑动条 -->
      <div class="design-center-column">
        <div class="design-module assessment-module">
          <div class="design-module-label">我方评估</div>
          <div class="assessment-content">
            <div class="assessment-icon-box">
              <div class="icon-placeholder-red"></div>
              <span class="assessment-level">{{ modelDangerLevel.replace('!', '') }} 级战备</span>
            </div>
            <div class="design-module-content text-scrollable">
              <p class="text-content" v-html="performanceData"></p>
            </div>
          </div>
        </div>

        <div class="design-module behavior-module">
          <div class="design-module-label">匹配性行为</div>
          <div class="behavior-content">
            <div class="flanking-image-column">
              <div class="image-item">
                <img :src="imageList[0]" v-if="imageList[0]" alt="图像 1" class="image-display">
                <div class="image-placeholder" v-else>图像 1</div>
              </div>
              <div class="image-item">
                <img :src="imageList[2]" v-if="imageList[2]" alt="图像 3" class="image-display">
                <div class="image-placeholder" v-else>图像 3</div>
              </div>
            </div>

            <div class="pyramid-legend-group">
              <div class="pyramid-placeholder"></div>
              <div class="level-legend">
                <div class="legend-item" :class="{ 'active-level': currentLevel === 1 }">一级战备</div>
                <div class="legend-item" :class="{ 'active-level': currentLevel === 2 }">二级战备</div>
                <div class="legend-item" :class="{ 'active-level': currentLevel === 3 }">三级战备</div>
                <div class="legend-item" :class="{ 'active-level': currentLevel === 4 }">四级战备</div>
              </div>
            </div>

            <div class="flanking-image-column">
              <div class="image-item">
                <img :src="imageList[1]" v-if="imageList[1]" alt="图像 2" class="image-display">
                <div class="image-placeholder" v-else>图像 2</div>
              </div>
              <div class="image-item">
                <img :src="imageList[3]" v-if="imageList[3]" alt="图像 4" class="image-display">
                <div class="image-placeholder" v-else>图像 4</div>
              </div>
            </div>
          </div>
        </div>

        <div class="design-module assessment-module">
          <div class="design-module-label">系统评估</div>
          <div class="assessment-content">
            <div class="assessment-icon-box">
              <div class="icon-placeholder-red"></div>
              <span class="assessment-level">{{ expertDangerLevel.replace('!', '') }} 级战备</span>
            </div>
            <div class="design-module-content text-scrollable">
              <p class="text-content" v-html="performanceDataLocal"></p>
            </div>
          </div>
        </div>
      </div>

      <!-- 右列文本框 - 带滑动条 -->
      <div class="design-right-column">
        <div class="design-module result-log-module">
          <div class="design-module-label">决策选择认知偏差检测结果</div>
          <div class="design-module-content text-scrollable">
            <p class="text-content">
              {{ summaryText }}
            </p>
          </div>
        </div>

        <div class="right-bottom-controls">
          <div class="accuracy-box">
            <div class="accuracy-label">偏差检测准确率</div>
            <div class="accuracy-value">{{ deviationDetectionAccuracy }}%</div>
          </div>
          <button class="export-btn">结果导出</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { BButton, BSpinner } from 'bootstrap-vue';

const API_BASE_URL = 'http://10.109.253.71:12358';
const IMAGE_API_BASE_URL = 'http://10.109.253.71:12358';

export default {
  name: 'DecisionMaking',
  components: {
    BButton,
    BSpinner
  },
  data() {
    return {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      isLoading: false,
      apiConfig: {
        weaponModel: process.env.VUE_APP_WEAPON_MODEL || 'B-2',
        imgDir: process.env.VUE_APP_IMG_DIR || '/home/img/B-2',
        txtPath: process.env.VUE_APP_TXT_PATH || '/home/txt/plane.txt',
        apiKey: process.env.VUE_APP_DASHSCOPE_API_KEY
      },
      thirdStageText: '正在加载第三阶段文字信息...',
      currentStageText: '',
      performanceData: '',
      performanceDataLocal: '正在加载本地性能数据...',
      summaryText: '正在加载总结文本...',
      imageList: [null, null, null, null],
      deviationDetectionAccuracy: 100,
      modelDangerLevel: 'N/A',
      expertDangerLevel: 'N/A',
      currentLevel: 4,
      testVideoUrl: null,
      testVideoMessage: '正在从 LocalStorage 加载视频...'
    };
  },
  computed: {
    highlightedCurrentStageText() {
      return this.highlightRandomWords(this.currentStageText, 1, 3);
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    this.initializeDataFromStorage();
    this.loadVideoFromStorage();
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
    initializeDataFromStorage() {
      try {
        const module3ResStr = localStorage.getItem('module3Res');
        if (module3ResStr) {
          const module3Res = JSON.parse(module3ResStr);
          console.log('✅ 成功从 LocalStorage 读取 module3Res:', module3Res);
          if (module3Res.final_review) {
            this.thirdStageText = module3Res.final_review;
            console.log('--- thirdStageText 更新为:', this.thirdStageText);
          } else {
            console.warn('--- module3Res 中缺少 final_review 字段。');
          }
        } else {
          console.warn('⚠️ LocalStorage 中未找到 module3Res，使用默认值。');
          this.thirdStageText = '未找到第三阶段信息，正在使用默认武器型号。';
        }

        const module1ResStr = localStorage.getItem('module1Res');
        if (module1ResStr) {
          const module1Res = JSON.parse(module1ResStr);
          const videoName = module1Res.video_name;
          if (videoName) {
            this.apiConfig.weaponModel = videoName;
            console.log('--- ✅ 成功从 module1Res 提取 weaponModel (video_name) ---');
            console.log('--- 提取的武器型号 (video_name) 更新为:', this.apiConfig.weaponModel);
          } else {
            console.warn('--- module1Res 中缺少 "video_name" 字段，weaponModel 使用默认值。');
          }
        } else {
          console.warn('⚠️ LocalStorage 中未找到 module1Res，weaponModel 使用默认值。');
        }
      } catch (e) {
        console.error('❌ 解析 LocalStorage 数据失败:', e);
        this.thirdStageText = '加载信息时发生错误，请检查 LocalStorage 数据格式。';
      }
    },
    highlightRandomWords(text, minCount, maxCount) {
      if (!text) return '';
      const words = text.split(/(\s+|[，。！？、：；])/);
      const validWordIndices = words
        .map((word, index) => ({ word, index }))
        .filter(item => item.word.trim() && !/^[，。！？、：；]$/.test(item.word))
        .map(item => item.index);

      if (validWordIndices.length === 0) {
        return text;
      }

      const countToHighlight = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
      const actualCount = Math.min(countToHighlight, validWordIndices.length);
      const shuffledIndices = validWordIndices.sort(() => 0.5 - Math.random());
      const indicesToHighlight = new Set(shuffledIndices.slice(0, actualCount));

      const highlightedWords = words.map((word, index) => {
        if (indicesToHighlight.has(index)) {
          return `<span style="color: red; font-weight: bold;">${word}</span>`;
        }
        return word;
      });

      return highlightedWords.join('');
    },
    formatAndLogModule4Res(module4Res) {
      console.groupCollapsed("%c✅ Module 4 结果已存储 (module4Res)", "color: #ffc107; font-weight: bold;");
      const module4ResString = JSON.stringify(module4Res, null, 2);
      console.log("%c原始 JSON 字符串:", "font-weight: bold; color: #17a2b8;", module4ResString);
      const tableData = Object.entries(module4Res).map(([key, value]) => ({
        Key: key,
        Value: (typeof value === 'object' && value !== null)
          ? `[${Array.isArray(value) ? 'Array' : 'Object'}] ${JSON.stringify(value).substring(0, 50)}...`
          : value
      }));
      console.log("%c对象内容 (表格展示):", "font-weight: bold; color: #28a745;");
      console.table(tableData);
      console.groupEnd();
    },
    async fetchBackendData() {
      this.isLoading = true;
      const model = this.apiConfig.weaponModel;
      console.log('开始获取数据，武器型号：', model);

      try {
        console.log('开始调用分析接口：', `${API_BASE_URL}/analyze-weapon`);
        const requestBody = { weapon_model: model };
        console.log('分析接口请求参数：', requestBody);

        const mainResponse = await axios.post(`${API_BASE_URL}/analyze-weapon`, requestBody);
        console.log('分析接口响应状态：', mainResponse.status, mainResponse.statusText);
        const mainData = mainResponse.data;

        if (mainData.status === 'success') {
          this.parseBackendData(mainData.data);

          console.log('开始调用准确率接口：', `${IMAGE_API_BASE_URL}/statistics/accuracy`);
          const accuracyResponse = await axios.get(`${IMAGE_API_BASE_URL}/statistics/accuracy`);
          console.log('准确率接口响应状态：', accuracyResponse.status, accuracyResponse.statusText);
          const accuracyData = accuracyResponse.data;

          console.log('开始调用图片列表接口：', `${IMAGE_API_BASE_URL}/weapon-all-images`);
          const imageResponse = await axios.get(`${IMAGE_API_BASE_URL}/weapon-all-images`, {
            params: { weapon_model: model }
          });
          const imageData = imageResponse.data;
          console.log('图片列表接口返回数据：', imageData);

          if (imageData.images && Array.isArray(imageData.images)) {
            this.imageList = imageData.images
              .map(img => img.url)
              .slice(0, 4);
            while (this.imageList.length < 4) {
              this.imageList.push(null);
            }
          } else {
            this.imageList = [null, null, null, null];
            console.warn('图片列表接口返回格式不正确');
          }
          console.log('更新图像列表 (从图片接口)：', this.imageList);

          const module4Res = {
            weapon_model: mainData.data.weapon_model,
            performancedata: mainData.data.performancedata,
            performance_data_local: mainData.data.performance_data_local,
            summary: mainData.data.summary,
            image_paths: mainData.data.image_paths,
            behavior_status: mainData.data.behavior_status,
            comprehensive_score: mainData.data.comprehensive_score,
            modelanalysisdangerlevel: mainData.data.model_analysis_danger_level,
            local_txt_danger_level: mainData.data.local_txt_danger_level,
            performance_cosine_similarity: mainData.data.performance_cosine_similarity,
            dangerlevelmatchrate: mainData.data.danger_level_match_rate,
            comprehensiveaccuracy: mainData.data.comprehensive_accuracy,
            deviation_value: mainData.data.deviation_value,
            coredimensionratingaccuracy: mainData.data.core_dimension_rating_accuracy,
            average_comprehensive_accuracy: accuracyData['average_comprehensive_accuracy']
          };
          localStorage.setItem('module4Res', JSON.stringify(module4Res));
          console.log('模块四后端返回值已按目标格式存入localStorage的module4Res');

          const module4ResStr = localStorage.getItem('module4Res');
          if (module4ResStr) {
            try {
              const module4Res = JSON.parse(module4ResStr);
              console.dir(module4Res, { depth: null });
            } catch (e) {
              console.error('解析module4Res失败：', e);
            }
          } else {
            console.warn('localStorage中未找到module4Res');
          }

          if (accuracyData && typeof accuracyData['average_comprehensive_accuracy'] !== 'undefined') {
            const accuracyValue = parseFloat(accuracyData['average_comprehensive_accuracy']);
            this.deviationDetectionAccuracy = isNaN(accuracyValue) ? 'N/A' : (accuracyValue * 100).toFixed(2);
            console.log('偏差检测准确率设置为：', this.deviationDetectionAccuracy);
          } else {
            console.error('准确率数据格式不正确或缺少字段');
            this.deviationDetectionAccuracy = 'N/A';
          }
        } else {
          console.error('后端返回错误：', (mainData.error && mainData.error.message) || '未知错误');
          this.currentStageText = `分析接口数据获取失败：${(mainData.error && mainData.error.message) || '未知错误'}`;
        }
      } catch (error) {
        console.error('接口调用失败：', error);
        this.currentStageText = '接口调用失败，请检查网络、CORS配置或后端服务';
        this.deviationDetectionAccuracy = 'N/A';
      } finally {
        this.isLoading = false;
        console.log('数据获取流程结束');
      }
    },
    parseBackendData(backendData) {
      console.log('开始解析主接口返回数据：', backendData);

      const currentThirdStageText = String(this.thirdStageText);
      if (!currentThirdStageText || currentThirdStageText.includes('正在加载') || currentThirdStageText.includes('未找到')) {
        this.thirdStageText = `发现目标武器型号：${backendData.weapon_model}，位于指定区域，行为模式初步匹配已知威胁，待进一步分析验证`;
        console.log('第三阶段文本被后端数据补充设置为：', this.thirdStageText);
      }

      const rawPerformanceData = backendData.performance_data || '暂无性能数据。';
      this.performanceData = this.highlightRandomWords(rawPerformanceData, 1, 3);
      console.log('性能数据 (中-顶) 设置为（已高亮）：', this.performanceData);

      const rawPerformanceDataLocal = backendData.performance_data_local || '暂无本地性能数据。';
      this.performanceDataLocal = this.highlightRandomWords(rawPerformanceDataLocal, 1, 3);
      console.log('本地性能数据 (中-底) 设置为（已高亮）：', this.performanceDataLocal);

      this.summaryText = backendData.summary || '暂无总结文本。';
      console.log('总结文本 (右) 设置为：', this.summaryText);
      this.currentStageText = backendData.summary;

      const modelLevelNum = this.getLevelNum(backendData.model_analysis_danger_level);
      const expertLevelNum = this.getLevelNum(backendData.local_txt_danger_level);
      console.log('模型危险等级：', backendData.model_analysis_danger_level, '转换后：', modelLevelNum);
      console.log('专家危险等级：', backendData.local_txt_danger_level, '转换后：', expertLevelNum);

      this.modelDangerLevel = `${modelLevelNum} !`;
      this.expertDangerLevel = `${expertLevelNum} !`;

      this.currentLevel = modelLevelNum;
      console.log('当前战备等级设置为：', this.currentLevel);
    },
    getLevelNum(backendLevel) {
      const numMap = {
        '危险等级1': 1,
        '危险等级2': 2,
        '危险等级3': 3,
        '危险等级4': 4
      };
      const result = numMap[backendLevel] || 4;
      console.log('等级转换：', backendLevel, '→', result);
      return result;
    },
    loadVideoFromStorage() {
      try {
        const module1ResStr = localStorage.getItem('module1Res');
        if (module1ResStr) {
          const module1Res = JSON.parse(module1ResStr);
          const videoPath = module1Res.originalVideoPath;
          console.log("【测试】从 module1Res 对象中读取 'originalVideoPath':", videoPath);

          if (videoPath && videoPath !== '无原视频路径') {
            this.testVideoUrl = videoPath;
          } else {
            this.testVideoMessage = '在 module1Res 中未找到或路径无效。';
            console.warn(this.testVideoMessage);
          }
        } else {
          this.testVideoMessage = '未在 LocalStorage 中找到 "module1Res" 对象。';
          console.warn(this.testVideoMessage);
        }
      } catch (e) {
        console.error('加载测试视频失败:', e);
        this.testVideoMessage = '加载视频时出错，请检查 module1Res 格式。';
      }
    },
    handleVideoError(e) {
      console.error("测试视频加载失败:", e);
      this.testVideoMessage = "视频加载失败，请检查 LocalStorage 中的 URL 是否正确。";
      this.testVideoUrl = null;
    }
  }
};
</script>

<style lang="scss" scoped>
/* 基础重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 根容器：深色科幻主题，占满屏幕 */
.section {
  background-color: #030a1c;
  color: #e0e0e0;
  font-family: "Helvetica Neue", sans-serif;
  overflow: hidden;
  position: relative;
  width: 100%;
}

/* 隐藏原有的浅色背景 */
.register,
.img_box {
  display: none;
}

/* CSS 模拟组件图片样式 */
@mixin sci-fi-border {
  border: 2px solid;
  border-image-slice: 1;
  border-image-source: linear-gradient(to bottom, #00e0ff, #005f7f, #00e0ff);
  background: rgba(10, 25, 50, 0.6);
  backdrop-filter: blur(5px);
}

@mixin sci-fi-label {
  background: linear-gradient(to right, #00e0ff, #005f7f);
  color: #030a1c;
  padding: 4px 15px;
  font-weight: bold;
  text-align: center;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 4px;
  font-size: 0.9rem;
  white-space: nowrap;
}

/* 顶部导航按钮 */
.top-nav-left,
.top-nav-right {
  position: absolute;
  top: 25px;
  z-index: 10;
}

.top-nav-left {
  left: 20px;
  display: flex;
  gap: 10px;
}

.top-nav-right {
  right: 20px;
}

.nav-btn {
  @include sci-fi-border;
  background: rgba(10, 25, 50, 0.9);
  color: #00e0ff;
  padding: 5px 15px;
  cursor: pointer;
  border-radius: 4px;
  font-weight: bold;
  border: 1px solid #005f7f;

  &:hover {
    background: rgba(20, 40, 70, 0.9);
    color: #fff;
  }
}

/* 标题 */
.title-container {
  text-align: center;
  padding: 15px 0;
  margin-bottom: 0;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 5;
}

.newTitle {
  font-size: calc(1.2vw + 1rem);
  color: #00e0ff;
  font-weight: bolder;
  letter-spacing: 0.1em;
  text-shadow: 0 0 10px #00e0ff, 0 0 15px #00e0ff;
}

/* 核心布局 */
.core-layout-design {
  display: flex;
  height: calc(100% - 80px);
  padding: 10px 20px 20px 20px;
  gap: 20px;
}

/* 三列定义 */
.design-left-column {
  width: 25%;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.design-center-column {
  width: 45%;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.design-right-column {
  width: 30%;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* 通用模块样式 */
.design-module {
  @include sci-fi-border;
  position: relative;
  padding-top: 15px;
  display: flex;
  flex-direction: column;
  border-radius: 5px;

  .design-module-label {
    @include sci-fi-label;
  }
}

/* 文本框滚动条样式 - 仅应用于文本内容区域 */
.text-scrollable {
  padding: 15px;
  flex-grow: 1;
  overflow-y: auto;
  max-height: 100%;
  
  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(10, 25, 50, 0.3);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #00e0ff;
    border-radius: 4px;
    &:hover {
      background: #00b8d4;
    }
  }
}

.text-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #e0e0e0;
  margin: 0;

  :deep(span) {
    color: #ff4500 !important;
    font-weight: bold;
  }
}

/* 左列 */
.video-module {
  flex-basis: 40%;

  .video-content-wrapper {
    padding: 10px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .test-video-player {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 4px;
  }

  .video-placeholder-text {
    color: #999;
    font-size: 0.9rem;
  }
}

.text-module-left {
  flex-basis: 45%;
  display: flex;
  flex-direction: column;
}

.button-container {
  flex-basis: 10%;
  min-height: 40px;
  display: flex;

  .inference-btn {
    width: 100%;
    height: 100%;
    font-size: 1.1rem;
    font-weight: bold;
    @include sci-fi-border;
    background: #00e0ff;
    color: #030a1c;
    border: none;
    border-radius: 4px;

    &:hover,
    &:active,
    &:focus {
      background: #fff;
      color: #030a1c;
      box-shadow: 0 0 15px #00e0ff;
    }

    &[disabled] {
      background: #555;
      color: #999;
      border-color: #777;
    }
  }
}

/* 中列 */
.assessment-module {
  flex: 1;
  min-height: 150px;

  .assessment-content {
    display: flex;
    padding: 15px;
    gap: 15px;
    flex-grow: 1;
  }

  .assessment-icon-box {
    flex-shrink: 0;
    text-align: center;
    padding-top: 10px;

    .icon-placeholder-red {
      width: 70px;
      height: 60px;
      background-color: #ff4500;
      border: 1px solid #ff7777;
      border-radius: 4px;
      margin: 0 auto 10px auto;
      opacity: 0.7;
    }

    .assessment-level {
      color: #ff4500;
      font-weight: bold;
      font-size: 1rem;
    }
  }
}

.behavior-module {
  flex: 1;
  min-height: 150px;

  .design-module-label {
    width: 120px;
  }

  .behavior-content {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px;
    gap: 15px;
  }

  .flanking-image-column {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex-basis: 30%;
    height: 100%;
  }

  .image-item {
    height: calc(50% - 5px);
    width: 100%;
    @include sci-fi-border;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 4px;
  }

  .image-display {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .image-placeholder {
    color: #999;
    font-size: 0.9rem;
  }

  .pyramid-legend-group {
    flex-basis: 35%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .pyramid-placeholder {
    width: 100px;
    height: 100px;
    background: linear-gradient(to top left, #005f7f 50%, transparent 50.5%) top left,
      linear-gradient(to top right, #005f7f 50%, transparent 50.5%) top right,
      linear-gradient(to bottom left, #00e0ff 50%, transparent 50.5%) bottom left,
      linear-gradient(to bottom right, #00e0ff 50%, transparent 50.5%) bottom right;
    background-size: 50% 50%;
    background-repeat: no-repeat;
    opacity: 0.8;
  }

  .level-legend {
    display: flex;
    gap: 15px;

    .legend-item {
      font-size: 0.8rem;
      color: #aaa;
      font-weight: bold;

      &.active-level {
        color: #00e0ff;
        text-shadow: 0 0 5px #00e0ff;
      }
    }
  }
}

/* 右列 */
.result-log-module {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.right-bottom-controls {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 15px;
}

.accuracy-box {
  flex-grow: 1;
  @include sci-fi-border;
  padding: 10px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 4px;

  .accuracy-label {
    font-size: 0.9rem;
    color: #aaa;
    margin-bottom: 5px;
  }

  .accuracy-value {
    font-size: 1.8rem;
    color: #00e0ff;
    font-weight: bold;
  }
}

.export-btn {
  flex-shrink: 0;
  width: 120px;
  font-size: 1.1rem;
  font-weight: bold;
  @include sci-fi-border;
  background: #00e0ff;
  color: #030a1c;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover,
  &:active,
  &:focus {
    background: #fff;
    color: #030a1c;
    box-shadow: 0 0 15px #00e0ff;
  }
}
</style>