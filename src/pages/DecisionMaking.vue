<template>
  <div class="section" :style="{height: `${windowHeight}px`}">
    <div class="register" :style="{width: `${windowWidth}px`, height: `${windowHeight}px`}"></div>
    <div class="img_box" :style="{width: `${windowWidth}px`, height: `${windowHeight}px`}"></div>

    <div class="title-container">
      <h1 class="newTitle">决策选择认知偏差检测</h1>
    </div>

    <div class="core-layout">
      <div class="left-column">
        <div class="left-module top-module">
          <div class="module-label">第三阶段给出的文字信息</div>
          <div class="module-content">
            <p class="text-content">{{ thirdStageText }}</p>
          </div>
        </div>

        <div class="button-container">
          <b-button @click="fetchBackendData" variant="primary" :disabled="isLoading" class="inference-btn">
            <b-spinner small v-if="isLoading"></b-spinner>
            {{ isLoading ? '获取数据中...' : '信息推理' }}
          </b-button>
        </div>

        <div class="left-module bottom-module">
          <div class="module-label">本阶段产生的文本信息</div>
          <div class="module-content">
            <p class="text-content" v-html="highlightedCurrentStageText"></p>
          </div>
        </div>
      </div>

      <div class="right-column">
        <div class="right-module image-module">
          <div class="module-label">多时序图像数据</div>
          <div class="image-grid">
            <div class="image-item" v-for="(img, idx) in imageList" :key="idx">
              <img :src="img" alt="多时序图像" class="image-display" v-if="img">
              <div class="image-placeholder" v-else>图像 {{ idx + 1 }}</div>
            </div>
          </div>
        </div>

        <div class="right-module bottom-right-module">
          <div class="device-desc">
            <div class="module-label">设备描述</div>
            <p class="desc-content">{{ currentStageText }}</p>
          </div>

          <div class="indicators-grid">
            <div class="indicator-item">
              <div class="indicator-label">偏差检测准确率</div>
              <div class="indicator-value">{{ deviationDetectionAccuracy }}%</div>
            </div>

            <div class="indicator-item">
              <div class="indicator-label">模型评估危险等级</div>
              <div class="indicator-value">{{ modelDangerLevel }}</div>
            </div>

            <div class="indicator-item">
              <div class="indicator-label">专家评估危险等级</div>
              <div class="indicator-value">{{ expertDangerLevel }}</div>
            </div>

            <div class="indicator-item level-selection-item">
              <div class="indicator-label">等级制定</div>
              <div class="level-list">
                <div class="level-item" :class="{'active-level': currentLevel === 4}">四级战备 <span class="level-num">4</span></div>
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
import { BButton, BSpinner } from 'bootstrap-vue';

// 后端 API 地址 (分析接口，端口 12358)
const API_BASE_URL = 'http://10.109.253.71:12358'; 
// 图片接口基础地址（端口 12358）
const IMAGE_API_BASE_URL = 'http://10.109.253.71:12358';

export default {
  name: 'DecisionMaking',
  components: {
    BButton,
    BSpinner
  },
  data() {
    return {
      // 窗口尺寸
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      isLoading: false,

      // 后端接口参数
      apiConfig: {
        weaponModel: process.env.VUE_APP_WEAPON_MODEL || 'B-2',
        imgDir: process.env.VUE_APP_IMG_DIR || '/home/img/B-2',
        txtPath: process.env.VUE_APP_TXT_PATH || '/home/txt/plane.txt',
        apiKey: process.env.VUE_APP_DASHSCOPE_API_KEY
      },

      // 页面所有数据
      thirdStageText: '', 
      currentStageText: '', // 本阶段总结（后端summary）
      imageList: [], // 多时序图像（拼接后的图片URL列表）
      deviationDetectionAccuracy: 100, 
      modelDangerLevel: 'N/A', 
      expertDangerLevel: 'N/A', 
      currentLevel: 4 
    };
  },
  computed: {
    // 【修改点 2: 计算属性，自动生成高亮文本】
    highlightedCurrentStageText() {
      // 随机高亮 1 到 3 个词语
      return this.highlightRandomWords(this.currentStageText, 1, 3);
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
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

    /**
     * 【新增方法】
     * 随机选择文本中的词语并用红色（CSS class: 'highlight-red'）高亮。
     * @param {string} text 要处理的文本。
     * @param {number} minCount 最小高亮词数。
     * @param {number} maxCount 最大高亮词数。
     * @returns {string} 带有高亮 `<span>` 标签的 HTML 字符串。
     */
    highlightRandomWords(text, minCount, maxCount) {
      if (!text) return '';

      // 1. 使用空格或常见标点符号分割成词语数组 (简单的分词处理)
      const words = text.split(/(\s+|[，。！？、：；])/);

      // 2. 过滤掉纯空白或标点符号项，只保留“有效词”的索引
      const validWordIndices = words
        .map((word, index) => ({ word, index }))
        .filter(item => item.word.trim() && !/^[，。！？、：；]$/.test(item.word))
        .map(item => item.index);

      if (validWordIndices.length === 0) {
        return text;
      }

      // 3. 确定要高亮的词语数量 (minCount 到 maxCount 之间)
      const countToHighlight = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
      const actualCount = Math.min(countToHighlight, validWordIndices.length);

      // 4. 随机选取要高亮的词语的索引
      const shuffledIndices = validWordIndices.sort(() => 0.5 - Math.random());
      const indicesToHighlight = new Set(shuffledIndices.slice(0, actualCount));

      // 5. 重新组合文本，给选中的词语添加高亮标签
      const highlightedWords = words.map((word, index) => {
        if (indicesToHighlight.has(index)) {
          // 在原样式中没有定义 .highlight-red，这里直接内联样式保证效果
          return `<span style="color: red; font-weight: bold;">${word}</span>`;
        }
        return word;
      });

      return highlightedWords.join('');
    },

    // 从后端获取所有数据 (调用分析接口和图片接口)
// 从后端获取所有数据 (调用分析接口、图片接口和准确率接口)
    async fetchBackendData() {
      this.isLoading = true;
      const model = this.apiConfig.weaponModel;
      console.log('开始获取数据，武器型号：', model);

      try {
        // 1. 调用主分析接口 (POST 请求)
        console.log('开始调用分析接口：', `${API_BASE_URL}/analyze-weapon`);
        const requestBody = { weapon_model: model };
        console.log('分析接口请求参数：', requestBody);
        
        const mainResponse = await axios.post(`${API_BASE_URL}/analyze-weapon`, requestBody);
        console.log('分析接口响应状态：', mainResponse.status, mainResponse.statusText);

        const result = mainResponse.data;

        if (result.status === 'success') {
          // 2. 解析主接口数据
          this.parseBackendData(result.data);
          
          // --- 新增：调用准确率接口 (GET 请求) ---
          console.log('开始调用准确率接口：', `${IMAGE_API_BASE_URL}/statistics/accuracy`);
          const accuracyResponse = await axios.get(`${IMAGE_API_BASE_URL}/statistics/accuracy`);
          console.log('准确率接口响应状态：', accuracyResponse.status, accuracyResponse.statusText);
          
          if (accuracyResponse.data && typeof accuracyResponse.data['average_comprehensive_accuracy'] !== 'undefined') {
            // 将获取到的准确率值赋给 deviationDetectionAccuracy
            // 注意：API返回可能是字符串，需要确保是数字，并取整数或保留两位小数。
            const accuracyValue = parseFloat(accuracyResponse.data['average_comprehensive_accuracy']);
            this.deviationDetectionAccuracy = isNaN(accuracyValue) ? 'N/A' : (accuracyValue * 100).toFixed(2); // 假设返回的是 0.XX 的小数，转成百分比并保留两位小数
            console.log('偏差检测准确率设置为：', this.deviationDetectionAccuracy);
          } else {
            console.error('准确率数据格式不正确或缺少字段');
            this.deviationDetectionAccuracy = 'N/A';
          }
          // ----------------------------------------

          // 3. 调用图片列表接口 (GET 请求)
          console.log('开始调用图片列表接口：', `${IMAGE_API_BASE_URL}/weapon-all-images`);
          const imageResponse = await axios.get(`${IMAGE_API_BASE_URL}/weapon-all-images`, {
            params: { weapon_model: model }
          });
          console.log('图片接口响应状态：', imageResponse.status, imageResponse.statusText);

          // 处理图片URL列表
          if (imageResponse.data && imageResponse.data.images) {
            this.imageList = imageResponse.data.images.map(img => img.url);
            console.log('生成的图片URL列表：', this.imageList);
          } else {
            console.error('图片列表数据格式不正确，缺少images字段');
            this.imageList = [];
          }
        } else {
          console.error('后端返回错误：', (result.error && result.error.message) || '未知错误');
          this.currentStageText = `分析接口数据获取失败：${(result.error && result.error.message) || '未知错误'}`;
        }
      } catch (error) {
        // 处理网络层或 axios 错误
        console.error('接口调用失败：', error);
        if (error.response) {
          console.error('错误响应状态：', error.response.status);
          console.error('错误响应数据：', error.response.data);
        } else if (error.request) {
          console.error('无响应数据：', error.request);
        } else {
          console.error('请求配置错误：', error.message);
        }
        this.currentStageText = '接口调用失败，请检查网络、CORS配置或后端服务';
        this.deviationDetectionAccuracy = 'N/A'; // 失败时也更新准确率
      } finally {
        this.isLoading = false;
        console.log('数据获取流程结束');
      }
    },
    
    // 解析后端数据并更新页面
    parseBackendData(backendData) {
      console.log('开始解析主接口返回数据：', backendData);
      
      // 1. 第三阶段文本
      this.thirdStageText = `发现目标武器型号：${backendData.weapon_model}，位于指定区域，行为模式初步匹配已知威胁，待进一步分析验证`;
      console.log('第三阶段文本设置为：', this.thirdStageText);

      // 2. 本阶段文本（后端summary）
      // 增加示例文本以保证有内容可高亮
      this.currentStageText = backendData.summary || '设备性能分析完成，危险等级已评估。根据多时序图像数据和模型评估结果，综合判定目标具备高威胁等级。决策制定需充分考虑当前信息，避免认知偏差。';
      console.log('本阶段文本设置为：', this.currentStageText);
      
      // 4. 模型/专家危险等级
      const modelLevelNum = this.getLevelNum(backendData.model_analysis_danger_level);
      const expertLevelNum = this.getLevelNum(backendData.local_txt_danger_level);
      console.log('模型危险等级：', backendData.model_analysis_danger_level, '转换后：', modelLevelNum);
      console.log('专家危险等级：', backendData.local_txt_danger_level, '转换后：', expertLevelNum);

      this.modelDangerLevel = `${modelLevelNum} !`;
      this.expertDangerLevel = `${expertLevelNum} !`;

      // 5. 激活当前战备等级
      this.currentLevel = modelLevelNum;
      console.log('当前战备等级设置为：', this.currentLevel);
    },

    // 后端危险等级→数字等级（1-4）
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
    }
  }
};
</script>

<style lang="scss" scoped>
/* 样式（Style）部分与原文件完全相同 */
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
  overflow: hidden; /* 确保满屏无滚动 */
  position: relative;
  width: 100%;
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
  /* 确保背景图路径正确，相对于 public 目录或者使用 require */
  background-image: url('../assets/images/newBackGound.png'); 
  opacity: 0.8;
}

/* 标题样式（严格匹配图片） */
.title-container {
  text-align: center;
  padding: 15px 0;
  border-bottom: 2px solid #ccc;
  margin-bottom: 10px;
  /* 确保标题不会导致高度溢出 */
  height: 80px; 
  display: flex;
  align-items: center;
  justify-content: center;
}
.newTitle {
  font-size: calc(1vw + 0.9rem); /* 响应式字体 */
  color: #2168BE;
  font-weight: bolder;
  letter-spacing: 0.03em;
  margin: 0;
}

/* 核心布局：左3右9，满屏分布 */
.core-layout {
  display: flex;
  height: calc(100% - 80px); /* 减去标题高度 */
  padding: 0 15px 15px 15px; /* 增加底部内边距 */
  gap: 15px;
}
.left-column {
  width: 25%; /* 3/12 */
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%; /* 占满父-元素高度 */
}
.right-column {
  width: 75%; /* 9/12 */
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%; /* 占满父-元素高度 */
}

/* 模块通用样式 */
.module-label {
  font-size: 0.9rem;
  color: black;
  font-weight: bold;
  margin-bottom: 8px;
  text-align: center;
  background-color: #EAF4FE; /* 与 section 背景色一致 */
  padding: 0 8px;
  display: inline-block;
  
  /* 关键：浮动在边框上 */
  position: relative;
  top: 10px; 
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
}
.module-content {
  border: 2px solid #ccc;
  background-color: #fff;
  padding: 20px 10px 10px 10px; /* 增加顶部内边距给 label 留出空间 */
  flex-grow: 1; /* 占据剩余空间 */
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
  top: -10px; /* 向上移动以覆盖 label 的下半部分 */
}
.text-content {
  font-size: 0.85rem;
  line-height: 1.4;
  text-align: left;
  width: 100%;
  margin: 0;
}

/* 左列模块：上下等高，填充左列 */
.left-module {
  display: flex;
  flex-direction: column;
  flex: 1; /* 平分剩余空间 */
  min-height: 150px; /* 最小高度 */
}
.top-module, .bottom-module {
  height: 45%; /* 上下模块各占左列45%，中间按钮占10% */
  flex: none; /* 固定高度 */
}

/* 按钮容器：居中，占左列10%高度 */
.button-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 10%; /* 固定高度 */
  flex-shrink: 0;
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
  flex-shrink: 0;
}
.image-grid {
  border: 2px solid #ccc;
  background-color: #fff;
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 10px;
  position: relative;
  top: -10px;
}
.image-item {
  border: 1px dashed #ddd;
  background-color: #f9f9f9;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  overflow: hidden; /* 确保图片不溢出 */
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
  position: relative;
  top: -10px;
  flex-shrink: 0;
}
.desc-content {
  font-size: 0.85rem;
  color: #333;
  margin: 0;
  padding-top: 5px; /* 为 label 留出空间 */
}

/* 四大指标网格：严格横向排列 */
.indicators-grid {
  border: 2px solid #ccc;
  background-color: #fff;
  flex-grow: 1; /* 占据剩余所有空间 */
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 2fr; /* 最后一列占2份，匹配图片布局 */
  gap: 10px;
  padding: 15px;
  position: relative;
  top: -10px;
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
  font-size: 1.5rem; /* 放大 "100%" 和 "1 !" */
  font-weight: bold;
  color: #FF4500; /* 统一为红色 */
}

/* 等级制定样式（严格匹配图片） */
.level-selection-item {
  padding: 0 10px;
  justify-content: flex-start; /* 从顶部开始对齐 */
}
.level-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  margin-top: 10px; /* 与 label 保持距离 */
}
.level-item {
  font-size: 0.9rem;
  padding: 5px 0;
  border: 2px solid #ccc;
  border-radius: 3px;
  background-color: #f9f9f9;
  color: #333;
  font-weight: 500;
  display: flex; /* 用于对齐内部数字 */
  justify-content: center;
  align-items: center;
  position: relative; /* 用于数字定位 */
}
.level-num {
  color: #FF0000;
  font-weight: bold;
  margin-left: 15px;
  /* 匹配图片中的右侧对齐 */
  position: absolute;
  right: 15px;
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
  .indicator-value { font-size: 1.3rem; }
}
@media (max-width: 1200px) {
  .core-layout { padding: 0 10px 10px 10px; gap: 10px; }
  .image-grid { gap: 8px; padding: 8px; }
  .indicators-grid { padding: 10px; gap: 8px; }
}
@media (max-width: 992px) {
  /* 在较小屏幕上，可能需要调整列宽或布局 */
  .left-column { width: 30%; }
  .right-column { width: 70%; }
  .image-grid { grid-template-columns: repeat(2, 1fr); } /* 图像 2x2 布局 */
  .indicators-grid { grid-template-columns: 1fr 1fr; } /* 指标 2x2 布局 */
  .level-selection-item { grid-column: 1 / -1; } /* 等级制定占满一行 */
}
</style>