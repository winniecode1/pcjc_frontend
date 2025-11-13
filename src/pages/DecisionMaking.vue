<template>
  <div class="section" :style="{ height: `${windowHeight}px` }" :class="{ 'use-assets': designAssetsEnabled }">
    <div class="register" :style="{ width: `${windowWidth}px`, height: `${windowHeight}px` }"></div>
    <div class="img_box" :style="{ width: `${windowWidth}px`, height: `${windowHeight}px` }"></div>

    <div class="top-nav-left">
      <router-link to="/" class="nav-btn nav-home">首页</router-link>
      <router-link to="/group-negotiation" class="nav-btn nav-back">返回</router-link>
    </div>
    <div class="top-nav-right">
      <router-link to="/attributiondiagnosis" class="nav-btn nav-next">下一页</router-link>
    </div>

    <div class="title-container" :style="bgImageStyle(assetNames.titleBg)">
      <h1 class="newTitle">决策选择认知偏差检测模型</h1>
    </div>

    <div class="core-layout-design">
      <div class="design-left-column">
        <!-- 独立标题：视频演示（与下方视频框同宽） -->
        <div class="standalone-label" :style="fullWidthLabelStyle(assetNames.videoLabel, 30)">视频演示</div>
        <div class="design-module video-module" :style="videoPanelBgStyle">
          <div class="design-module-content video-content-wrapper">
            <video v-if="testVideoUrl" :src="testVideoUrl" controls class="test-video-player"
              @error="handleVideoError"></video>
            <div v-else class="video-placeholder-text">
              {{ testVideoMessage }}
            </div>
          </div>
        </div>

        <div class="design-module text-module-left fixed-left-text" :style="leftTextPanelBgStyle">
          <div class="design-module-content text-scrollable">
            <p class="text-content" v-html="formattedThirdStageText"></p>
          </div>
        </div>

        <div class="button-container">
          <b-button @click="fetchBackendData" variant="primary" :disabled="isLoading" class="inference-btn" :style="buttonBgStyle">
            <b-spinner small v-if="isLoading"></b-spinner>
            {{ isLoading ? '获取数据中...' : '信息推理' }}
          </b-button>
        </div>
      </div>

      <div class="design-center-column">
        <div class="design-module assessment-module commander-assessment" :style="commanderPanelBgStyle">
          <div class="assessment-content">
            <div class="assessment-left-section">
              <img v-if="designAssetsEnabled" :src="fileUrl(assetNames.commanderIcon)" alt="指挥员评估" class="assessment-module-icon" />
              <div v-else class="icon-placeholder-commander"></div>
              <div class="assessment-title">指挥员评估</div>
            </div>
            <div class="assessment-middle-section">
              <div class="assessment-right-section">
                <div class="icon-placeholder-red" :style="iconRedStyle"></div>
                <span class="assessment-level">{{ modelDangerLevel.replace('!', '') }} 级战备</span>
              </div>
              <div class="design-module-content text-scrollable">
                <p class="text-content" v-html="performanceData"></p>
              </div>
            </div>
          </div>
        </div>

        <div class="design-module behavior-module" :style="behaviorPanelBgStyle">
          <div class="design-module-label" :style="labelImageStyle(assetNames.behaviorLabel, 120, 28)">可视化行为</div>
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
              <div class="pyramid-placeholder" v-if="!designAssetsEnabled"></div>
              <img v-else :src="fileUrl(assetNames.pyramid)" alt="金字塔" style="width:120px;height:120px;opacity:.95;" />
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

        <div class="design-module assessment-module machine-assessment" :style="systemPanelBgStyle">
          <div class="assessment-content">
            <div class="assessment-left-section">
              <img v-if="designAssetsEnabled" :src="fileUrl(assetNames.machineIcon)" alt="机器评估" class="assessment-module-icon" />
              <div v-else class="icon-placeholder-machine"></div>
              <div class="assessment-title">机器评估</div>
            </div>
            <div class="assessment-middle-section">
              <div class="assessment-right-section">
                <div class="icon-placeholder-red" :style="iconRedStyle"></div>
                <span class="assessment-level">{{ expertDangerLevel.replace('!', '') }} 级战备</span>
              </div>
              <div class="design-module-content text-scrollable">
                <p class="text-content" v-html="performanceDataLocal"></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="design-right-column">
        <!-- 独立标题：决策选择认知偏差检测结果（与下方文本框同宽） -->
        <div class="standalone-label" :style="fullWidthLabelStyle(assetNames.resultLabel, 28)">决策选择认知偏差检测结果</div>
        <div class="design-module result-log-module" :style="rightPanelBgStyle">
          <div class="design-module-content text-scrollable">
            <p class="text-content" v-html="highlightedSummaryText"></p>
          </div>
        </div>

        <div class="right-bottom-controls">
          <div class="accuracy-box" :style="accuracyBgStyle">
            <div class="accuracy-label">偏差检测准确率</div>
            <div class="accuracy-value">{{ deviationDetectionAccuracy }}%</div>
          </div>
          <button class="export-btn" :style="exportBtnBgStyle" @click="exportData">结果导出</button>
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
      /* 设计稿资源配置（使用项目内 step4 素材） */
      designAssetsEnabled: true,
      assetNames: {
        /* 若某项为 null 将退回到默认描边样式 */
        panel: null,
        rightPanel: '决策选择认知偏差检测结果文本框.png',
        label: null,
        button: '开始测验.png',
        exportBtn: '结果导出按键.png',
        accuracy: '准确率框.png',
        titleBg: '标题栏.png',
        pyramid: '金字塔图.png',
        iconRed: null,
        /* 模块面板与标题框 */
        videoPanel: '原视频框.png',
        leftTextPanel: '左下文本框.png',
        commanderPanel: '指挥员评估文本框.png',
        systemPanel: '机器评估文本框.png',
        videoLabel: '视频演示标题框.png',
        behaviorLabel: '可视化行为标题框.png',
        resultLabel: '决策选择认知偏差检测结果标题框.png',
        /* 战备等级图标 */
        level1: '一级战备图片.png',
        level2: '二级战备图片.png',
        level3: '三级战备图片.png',
        level4: '四级战备图片.png',
        /* 评估模块图标 */
        machineIcon: '机器评估图标.png',
        commanderIcon: '指挥员评估图标.png'
      },
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
    },
    /* 仅对右侧“决策选择认知偏差检测结果”做随机标红 */
    highlightedSummaryText() {
      return this.highlightRandomWords(this.summaryText || '', 1, 3);
    },
    /* 左下文本框：当内容为 JSON 字符串时，仅提取三个字段并换行展示 */
    formattedThirdStageText() {
      const source = this.thirdStageText;
      if (!source) return '';
      try {
        let data = source;
        if (typeof source === 'string') {
          const trimmed = source.trim();
          if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            data = JSON.parse(trimmed);
          }
        }
        if (typeof data === 'object' && data !== null) {
          const takeKeys = [
            'consensus_summary',
            'deviation_analysis',
            'deviation_analysis_report'
          ];
          const parts = takeKeys
            .map(k => data[k])
            .filter(v => typeof v === 'string' && v.trim().length > 0);
          if (parts.length > 0) {
            return parts.map(s => this.escapeToHtml(s)).join('<br/><br/>');
          }
        }
        // 非 JSON 或未包含目标字段时，原样返回
        return typeof source === 'string' ? this.escapeToHtml(source) : String(source);
      } catch (e) {
        // 解析失败，返回原文本
        return typeof source === 'string' ? this.escapeToHtml(source) : String(source);
      }
    },
    panelBgStyle() {
      return this.bgImageStyle(this.assetNames.panel);
    },
    rightPanelBgStyle() {
      return this.bgImageStyle(this.assetNames.rightPanel || this.assetNames.panel);
    },
    videoPanelBgStyle() {
      return this.bgImageStyle(this.assetNames.videoPanel);
    },
    leftTextPanelBgStyle() {
      return this.bgImageStyle(this.assetNames.leftTextPanel);
    },
    commanderPanelBgStyle() {
      return this.bgImageStyle(this.assetNames.commanderPanel);
    },
    systemPanelBgStyle() {
      return this.bgImageStyle(this.assetNames.systemPanel);
    },
    behaviorPanelBgStyle() {
      return this.bgImageStyle(this.assetNames.panel);
    },
    labelBgStyle() {
      const base = this.bgImageStyle(this.assetNames.label);
      if (!this.designAssetsEnabled) return {};
      return Object.assign({}, base, { color: '#e6faff' });
    },
    buttonBgStyle() {
      return this.bgImageStyle(this.assetNames.button);
    },
    exportBtnBgStyle() {
      return this.bgImageStyle(this.assetNames.exportBtn || this.assetNames.button);
    },
    accuracyBgStyle() {
      return this.bgImageStyle(this.assetNames.accuracy);
    },
    iconRedStyle() {
      if (!this.designAssetsEnabled) return {};
      const levelImg = this.projectAssetUrl(this.getLevelImageName(this.currentLevel));
      if (!levelImg) return {};
      return {
        width: '70px',
        height: '60px',
        backgroundImage: `url('${levelImg}')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
        border: 'none'
      };
    }

  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    this.initializeDataFromStorage();
    this.loadVideoFromStorage();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    /* 简单转义，避免意外的 HTML 注入；保留换行 */
    escapeToHtml(text) {
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br/>');
    },
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
    /* 获取项目内 step4 素材的打包 URL */
    projectAssetUrl(name) {
      if (!this.designAssetsEnabled || !name) return '';
      try {
        return require(`@/assets/images/step4/${name}`);
      } catch (e) {
        console.warn('未找到素材：', name);
        return '';
      }
    },
    /* 向后兼容模板中对 fileUrl 的调用 */
    fileUrl(name) {
      return this.projectAssetUrl(name);
    },
    /* 指定标题框图片并设置尺寸 */
    labelImageStyle(name, width = 160, height = 28) {
      if (!this.designAssetsEnabled || !name) return {};
      const url = this.projectAssetUrl(name);
      return {
        width: `${width}px`,
        height: `${height}px`,
        backgroundImage: `url('${url}')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
        color: '#e6faff'
      };
    },
    /* 宽度自适应的独立标题条（与模块同宽） */
    fullWidthLabelStyle(name, height = 28) {
      if (!this.designAssetsEnabled || !name) return {};
      const url = this.projectAssetUrl(name);
      return {
        width: '100%',
        height: `${height}px`,
        backgroundImage: `url('${url}')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
        color: '#e6faff'
      };
    },
    bgImageStyle(name) {
      if (!this.designAssetsEnabled || !name) return {};
      return {
        backgroundImage: `url('${this.projectAssetUrl(name)}')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%'
      };
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
      this.performanceData = rawPerformanceData;
      console.log('性能数据 (中-顶) 设置为：', this.performanceData);

      const rawPerformanceDataLocal = backendData.performance_data_local || '暂无本地性能数据。';
      this.performanceDataLocal = rawPerformanceDataLocal;
      console.log('本地性能数据 (中-底) 设置为：', this.performanceDataLocal);

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
    getLevelImageName(level) {
      switch (level) {
        case 1: return this.assetNames.level1;
        case 2: return this.assetNames.level2;
        case 3: return this.assetNames.level3;
        default: return this.assetNames.level4;
      }
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
    },
    // 导出数据为JSON文件
    exportData() {
      try {
        // 准备要导出的数据
        const exportData = {
          "performance_data": this.performanceData,
          "performance_data_local": this.performanceDataLocal,
          "summary": this.summaryText
        };

        // 转换为JSON字符串
        const jsonStr = JSON.stringify(exportData, null, 2);

        // 创建Blob对象
        const blob = new Blob([jsonStr], { type: 'application/json' });

        // 创建下载链接
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `decision_making_data_${new Date().toISOString().slice(0, 10)}.json`;

        // 触发下载
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 释放URL对象
        URL.revokeObjectURL(link.href);

        console.log('数据导出成功');
      } catch (error) {
        console.error('导出数据失败:', error);
        alert('导出失败，请重试');
      }
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
  /* 使用项目内背景图 */
  background-image: url('~@/assets/images/step4/背景.png');
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
  color: #e0e0e0;
  font-family: "Helvetica Neue", sans-serif;
  overflow: hidden;
  position: relative;
  width: 100%;
}

/* 两侧装饰条 */
.section::before,
.section::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 24px;
  background-repeat: no-repeat;
  background-size: contain;
  z-index: 2;
  pointer-events: none;
}
.section::before {
  left: 0;
  background-image: url('~@/assets/images/step4/装饰-左.png');
}
.section::after {
  right: 0;
  background-image: url('~@/assets/images/step4/装饰-右.png');
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

  /* 标题栏底图（与 computed 的内联样式兼容，双保险） */
  &.use-assets,
  .use-assets & {
    &::before {
      content: "";
      position: absolute;
      inset: 0;
      margin: 0 auto;
      width: min(980px, 92%);
      background: url('~@/assets/images/step4/标题栏.png') no-repeat center/contain;
      z-index: -1;
      pointer-events: none;
    }
  }
}

.newTitle {
  font-size: calc(1.2vw + 1rem);
  color: #00e0ff;
  font-weight: bolder;
  letter-spacing: 0.1em;
  text-shadow: 0 0 10px #00e0ff, 0 0 15px #00e0ff;
}

/* 资源皮肤启用时的覆盖样式 */
.use-assets {
  .design-module {
    border: none;
    background: transparent;
    backdrop-filter: none;
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }

  .design-module .design-module-label {
    background: transparent;
    border-radius: 0;
  }

  .nav-btn {
    border: none;
    background: transparent;
    color: #ffffff; /* 白色文字置顶 */
    text-shadow: 0 0 6px rgba(0, 0, 0, 0.8);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 90px;
    height: 34px;
    padding: 0;
    font-weight: bold;
  }
  .nav-btn.nav-home {
    background: url('~@/assets/images/step4/首页按键.png') no-repeat center/contain;
  }
  .nav-btn.nav-back {
    background: url('~@/assets/images/step4/返回按键.png') no-repeat center/contain;
  }
  .top-nav-right .nav-btn.nav-next {
    width: 100px;
    background: url('~@/assets/images/step4/下一页按键.png') no-repeat center/contain;
  }

  .accuracy-box,
  .export-btn {
    border: none;
    background: transparent;
  }
}

/* 核心布局 */
.core-layout-design {
  display: flex;
  height: calc(100vh - 80px);
  padding: 10px 20px 20px 20px;
  gap: 20px;
}

/* 三列定义 */
.design-left-column {
  width: 25%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: 100%;
}

.design-center-column {
  width: 45%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.design-right-column {
  width: 30%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: 100%;
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

.assessment-module .design-module-content,
.result-log-module .design-module-content,
.text-module-left .design-module-content {
  overflow-y: auto;
  max-height: 100%;
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
  flex: 0 0 auto;
  width: 95%; // 添加宽度设置
  height: 250px;
  background-image: url('~@/assets/images/step1/-s-框-小视频.png'); // 添加背景图片
  background-repeat: no-repeat; // 确保背景不重复
  background-size: 100% 100%; // 确保背景填满整个容器

  .video-content-wrapper {
    padding: 15px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .test-video-player {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 4px;
  }

  .video-placeholder-text {
    color: #999;
    font-size: 0.9rem;
  }
}

.text-module-left {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
}

/* 独立标题条（与模块等宽，置于模块上方） */
.standalone-label {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  text-align: left;
  color: #e6faff;
  font-weight: bold;
  font-size: 0.95rem;
  line-height: 1;
  padding-left: 40px;
  padding-right: 10px;
  margin-bottom: 6px;
  border-radius: 4px;
  background: linear-gradient(to right, #00e0ff, #005f7f);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.use-assets {
  .standalone-label {
    background: transparent;
    line-height: 1;
  }
}

/* 左下文本框尺寸与相对定位（保持在按钮上方的文档流位置） */
.fixed-left-text {
  position: relative;
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  align-self: stretch;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.fixed-left-text .design-module-content {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.button-container {
  flex: 0 0 auto;
  height: 60px;
  display: flex;
  justify-content: center; /* 居中对齐 */
  align-items: center;

  .inference-btn {
    width: auto; /* 改为自动宽度 */
    min-width: 150px; /* 设置最小宽度 */
    max-width: 250px; /* 设置最大宽度 */
    height: 100%;
    font-size: 1.1rem;
    font-weight: bold;
    @include sci-fi-border;
    /* 使用"开始测验.png"作为按钮底图 */
    background: url('~@/assets/images/step4/开始测验.png') no-repeat center/contain, #00e0ff;
    color: #ffffff; /* 改为白色 */
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
  flex: 0 1 auto; /* 不自动增长，根据内容调整 */
  min-height: 150px;
  max-height: 200px; /* 限制最大高度，让框更紧凑 */
  overflow: hidden; /* 确保内容不超出 */
  display: flex;
  flex-direction: column;

  &.machine-assessment {
    order: 1; /* 机器评估在上 */
    margin-bottom: 10px; /* 上边往下缩一点 */
  }

  &.commander-assessment {
    order: 3; /* 指挥员评估在下 */
    margin-top: 10px; /* 下边往上缩一点 */
  }

  .assessment-content {
    display: flex;
    padding: 15px;
    gap: 15px;
    flex-grow: 1;
    min-height: 0;
    overflow: hidden; /* 防止内容超出 */
  }

  .assessment-left-section {
    flex-shrink: 0;
    text-align: center;
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    min-width: 100px;

    .assessment-module-icon {
      width: 50px;
      height: 50px;
      object-fit: contain;
    }

    .icon-placeholder-commander,
    .icon-placeholder-machine {
      width: 50px;
      height: 50px;
      background-color: rgba(0, 224, 255, 0.3);
      border: 1px solid #00e0ff;
      border-radius: 4px;
    }

    .assessment-title {
      color: #e6faff;
      font-weight: bold;
      font-size: 0.95rem;
      white-space: nowrap;
      text-shadow: 0 0 5px rgba(0, 224, 255, 0.5);
    }
  }

  .assessment-middle-section {
    flex: 1;
    display: flex;
    gap: 15px;
    min-width: 0;
    overflow: hidden; /* 防止内容超出 */
  }

  .assessment-right-section {
    flex-shrink: 0;
    text-align: center;
    padding: 10px 5px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    min-width: 80px;

    .icon-placeholder-red {
      width: 60px;
      height: 60px;
      background-color: #ff4500;
      border: 1px solid #ff7777;
      border-radius: 4px;
      opacity: 0.7;
    }

    .assessment-level {
      color: #ff4500;
      font-weight: bold;
      font-size: 1rem;
    }
  }

  .assessment-module .design-module-content {
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
  }
}

.behavior-module {
  flex: 1 1 auto; /* 占据中间空间 */
  min-height: 200px;
  order: 2; /* 确保在中间位置 */
  padding-top: 18px; /* 为绝对定位的标题留出空间，避免与金字塔重叠 */

  .design-module-label {
    width: 120px;
  }

  .behavior-content {
    flex-grow: 1;
    display: flex;
    align-items: flex-start; /* 顶部对齐，让图片上缘更贴近机器评估底部 */
    justify-content: space-between; /* 左右分布，靠齐两侧 */
    padding: 0 15px 15px 15px; /* 顶部 0，保持与标签紧邻 */
    gap: 20px; /* 间距避免重叠 */
    min-height: 0;
  }

  .flanking-image-column {
    display: flex;
    flex-direction: column;
    gap: 15px; /* 增加图片之间的间距 */
    flex-basis: 35%;
    height: 100%;
    width: auto; /* 宽度自动 */
    min-width: 220px;
  }

  .image-item {
    height: auto;
    width: 100%; /* 列内尽可能宽 */
    aspect-ratio: 16 / 9; /* 按样例比例拉伸容器 */
    max-height: 170px; /* 适度向上向下延申，同时避免与下方重叠 */
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
    object-fit: cover; /* 填满16:9容器，保持比例 */
  }

  .image-placeholder {
    color: #999;
    font-size: 0.9rem;
  }

  .pyramid-legend-group {
    flex-basis: auto; /* 自动调整 */
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    min-width: 120px; /* 减小最小宽度 */
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
    flex-wrap: wrap; /* 允许换行 */
    gap: 8px; /* 减小间距 */
    justify-content: center;
    max-width: 120px; /* 限制最大宽度，强制换行 */

    .legend-item {
      font-size: 0.65rem; /* 减小字体 */
      color: #aaa;
      font-weight: bold;
      white-space: nowrap; /* 防止文字换行 */

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
  overflow: hidden; /* 确保内容不超出 */
  min-height: 0;
}

.result-log-module .design-module-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
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
  /* 蓝色胶囊条背景 */
  background: url('~@/assets/images/step4/准确率框.png') no-repeat center/cover;

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
  /* 黄色导出按钮底图 */
  background: url('~@/assets/images/step4/结果导出按键.png') no-repeat center/contain, #00e0ff;
  color: #ffffff; /* 改为白色 */
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

/* 底部装饰条 */
.core-layout-design::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: min(1120px, 96%);
  height: 40px;
  background: url('~@/assets/images/step4/底部.png') no-repeat center/contain;
  pointer-events: none;
  opacity: .95;
}
</style>
