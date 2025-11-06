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
            <p class="text-content">{{ currentStageText }}</p>
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
// 确保已安装 'bootstrap-vue' 和 'bootstrap'，或根据需要替换 b-button 和 b-spinner
import { BButton, BSpinner } from 'bootstrap-vue';

// 后端 API 地址 (更新为新的端口 12357)
// const API_BASE_URL = 'http://10.109.253.71:12357';
const IMAGE_API_URL = 'http://10.109.253.71:12358';

export default {
  name: 'DecisionMaking',
  components: {
    BButton,
    BSpinner
  },
  data() {
    return {
      // 窗口尺寸（满屏用）
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      isLoading: false,

      // 后端接口参数（通过环境变量配置，无前端输入）
      // 注意：imgDir, txtPath, apiKey 仅用于前端（如图片路径），不再发送给后端
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
      modelDangerLevel: 'N/A', // 模型危险等级（例如 "1 !"）
      expertDangerLevel: 'N/A', // 专家危险等级（例如 "1 !"）
      currentLevel: 4 // 当前激活的战备等级（数字 1-4）
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
    // !!! 新增：获取图片 URL 列表的函数 !!!
  async fetchImageUrls(weaponModel) {
    try {
      const response = await axios.get(`${IMAGE_API_URL}/weapon-all-images`, {
        params: {
          weapon_model: weaponModel
        }
      });
      // 假设返回的 data.urls 包含 ['url1', 'url2', 'url3', 'url4']
      return response.data.urls || []; 
    } catch (error) {
      console.error('获取图片URL失败:', error);
      return []; // 失败时返回空数组
    }
  },
    // 从后端获取所有数据（现在包括图片 URL）
  async fetchBackendData() {
    this.isLoading = true;
    const model = this.apiConfig.weaponModel;
    let mainResult = null;

    try {
      // 1. 调用主分析接口 (POST 请求)
      const requestBody = { weapon_model: model };
      const mainResponse = await axios.post(`${API_BASE_URL}/analyze-weapon`, requestBody);

      if (mainResponse.data.status === 'success') {
        mainResult = mainResponse.data.data;

        // 2. 调用图片接口 (GET 请求)
        const imageUrls = await this.fetchImageUrls(model);
        mainResult.image_urls = imageUrls; // 将图片 URL 列表添加到主结果中

        // 3. 解析所有数据
        this.parseBackendData(mainResult);
      } else {
        console.error('后端返回错误：', mainResponse.data.error.message);
        this.currentStageText = `分析接口数据获取失败：${mainResponse.data.error.message}`;
      }
    } catch (error) {
      console.error('接口调用失败：', error);
      this.currentStageText = '接口调用失败，请检查网络、CORS配置或后端服务';
    } finally {
      this.isLoading = false;
    }
  },

    // 从后端获取所有数据
    // async fetchBackendData() {
    //   this.isLoading = true;

    //   /*
    //   // --- START: 模拟数据块（已移除） ---
    //   // setTimeout(() => { ... }, 2000);
    //   // --- END: 模拟数据块（已移除） ---
    //   */

    //   // --- START: 激活的真实网络请求 ---
    //   this.isLoading = true;
    //   try {
    //     // 根据后端 Policy_Decision.py，请求体只需要 weapon_model
    //     const requestBody = {
    //       weapon_model: this.apiConfig.weaponModel
    //     };

    //     // 发送 POST 请求到新的 12357 端口
    //     const response = await axios.post(`${API_BASE_URL}/analyze-weapon`, requestBody);

    //     const result = response.data;
    //     if (result.status === 'success') {
    //       // 调用解析函数
    //       this.parseBackendData(result.data);
    //     } else {
    //       // 处理后端返回的错误（例如 status: "error"）
    //       console.error('后端返回错误：', result.error.message);
    //       this.currentStageText = `数据获取失败：${result.error.message}`;
    //     }
    //   } catch (error) {
    //     // 处理网络层或 axios 错误
    //     console.error('接口调用失败：', error);
    //     this.currentStageText = '接口调用失败，请检查网络、CORS配置或后端服务';
    //   } finally {
    //     this.isLoading = false;
    //   }
    //   // --- END: 激活的真实网络请求 ---
    // },

    // 解析后端数据并更新页面
    parseBackendData(backendData) {
      // 1. 第三阶段文本（假设后端未返回，用固定场景文本，可替换为前端缓存数据）
      this.thirdStageText = `发现目标武器型号：${backendData.weapon_model}，位于指定区域，行为模式初步匹配已知威胁，待进一步分析验证`;

      // 2. 本阶段文本（后端summary）
      this.currentStageText = backendData.summary || '设备性能分析完成，危险等级已评估';

      // 3. 多时序图像（这里用模拟URL，实际应由后端返回完整可访问的URL列表）
      const backendHost = API_BASE_URL; 
      const model = backendData.weapon_model || this.apiConfig.weaponModel; // 使用后端返回的型号，如果为空则使用默认 B-2

      const imageNames = [
        'Snipaste_2025-11-02_18-31-11.png', // 第一张的实际文件名
        'Snipaste_2025-11-02_18-31-23.png', // 第二张的实际文件名
        'Snipaste_2025-11-02_18-31-46.png', // 第三张的实际文件名
        'Snipaste_2025-11-02_18-32-03.png'  // 第四张的实际文件名
      ];
      // 构建完整的绝对路径列表
      this.imageList = imageNames.map(name => 
        `${backendHost}/static_images/${model}/${name}`
      );
  // // 完整的绝对路径 = 后端地址 + 静态文件挂载点 + 图片相对路径
  //     this.imageList = [
  //       `${backendHost}/static_images/${model}/frame_1.png`,
  //       `${backendHost}/static_images/${model}/frame_2.png`,
  //       `${backendHost}/static_images/${model}/frame_3.png`,
  //       `${backendHost}/static_images/${model}/frame_4.png`
  //     ];

      // 4. 模型/专家危险等级（后端危险等级→数字）
      // *** 匹配 "1 !" 样式 ***
      const modelLevelNum = this.getLevelNum(backendData.model_analysis_danger_level);
      const expertLevelNum = this.getLevelNum(backendData.local_txt_danger_level);

      this.modelDangerLevel = `${modelLevelNum} !`;
      this.expertDangerLevel = `${expertLevelNum} !`;

      // 5. 激活当前战备等级（使用模型等级的数字）
      this.currentLevel = modelLevelNum;
    },

    // 后端危险等级（危险等级1-4）→ 战备等级（一级-四级战备）
    // (此函数在当前版本中未用于显示，但保留)
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
      return numMap[backendLevel] || 4; // 默认为4
    }
  }
};
</script>

<style lang="scss" scoped>
/* 样式（Style）部分与你提供的文件完全相同，此处省略以保持简洁 */
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