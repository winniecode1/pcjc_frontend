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
        <div class="design-module video-module" :style="videoPanelBgStyle">
          <div class="panel-header">无人机侦察数据</div>
          <div class="design-module-content video-content-wrapper">
            <video v-if="testVideoUrl" :src="testVideoUrl" controls class="test-video-player" @error="handleVideoError"
              autoplay loop muted></video>
            <div v-else class="video-placeholder-text">
              {{ testVideoMessage }}
            </div>
          </div>
        </div>

        <div class="design-module text-module-left fixed-left-text" :style="leftTextPanelBgStyle">
          <div class="panel-header">群体协商认知传播信息</div>
          <div class="design-module-content text-scrollable">
            <p class="text-content" v-html="formattedThirdStageText"></p>
          </div>
        </div>

        <div class="button-container">
          <b-button @click="fetchBackendData" variant="primary" :disabled="isLoading" class="inference-btn"
            :style="buttonBgStyle">
            <b-spinner small v-if="isLoading"></b-spinner>
            {{ isLoading ? '开始决策认知...' : '决策认知' }}
          </b-button>
        </div>
      </div>

      <div class="design-center-column">
        <div class="design-module assessment-module commander-assessment" :style="commanderPanelBgStyle">
          <div class="assessment-content">
            <div class="assessment-left-section">
              <img v-if="designAssetsEnabled" :src="fileUrl(assetNames.commanderIcon)" alt="指挥员评估"
                class="assessment-module-icon" />
              <div v-else class="icon-placeholder-commander"></div>
              <div class="assessment-title">指挥员评估</div>
            </div>
            <div class="assessment-middle-section">
              <div class="assessment-right-section">
                <div class="icon-placeholder-red" :style="expertIconStyle"></div>
              </div>
              <div class="design-module-content text-scrollable">
                <div v-if="isAssessing" class="loading-overlay">
                  <b-spinner small></b-spinner>
                  <span>加载中...</span>
                </div>
                <div class="description-box assessment-content-box">
                  <ul class="info-list"
                    v-if="formattedPerformanceDataLocalList && formattedPerformanceDataLocalList.length > 0">
                    <li v-for="(item, idx) in formattedPerformanceDataLocalList" :key="'local-' + idx"
                      :class="{ 'first-item': idx === 0 }">
                      {{ item }}
                    </li>
                  </ul>
                  <p class="text-content text-muted" v-else>暂无评估信息</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="design-module behavior-module" :style="behaviorPanelBgStyle">
          <div class="design-module-label" :style="labelImageStyle(assetNames.behaviorLabel, 200, 35)">辅助决策行为信息</div>
          <div class="behavior-content">
            <div class="flanking-image-column">
              <div class="image-item">
                <div v-if="isImageLoading" class="loading-overlay">
                  <b-spinner style="width: 2rem; height: 2rem;" label="Loading..."></b-spinner>
                  <span style="margin-top: 8px;">加载中...</span>
                </div>
                <img :src="imageList[0]" v-if="imageList[0] && !isImageLoading" alt="图像 1" class="image-display">
                <div class="image-placeholder" v-else-if="!isImageLoading">图像 1</div>
              </div>
              <div class="image-item">
                <div v-if="isImageLoading" class="loading-overlay">
                  <b-spinner style="width: 2rem; height: 2rem;" label="Loading..."></b-spinner>
                  <span style="margin-top: 8px;">加载中...</span>
                </div>
                <img :src="imageList[2]" v-if="imageList[2] && !isImageLoading" alt="图像 3" class="image-display">
                <div class="image-placeholder" v-else-if="!isImageLoading">图像 3</div>
              </div>
            </div>

            <div class="pyramid-legend-group">
              <div class="pyramid-placeholder" v-if="!designAssetsEnabled"></div>
              <img v-else :src="fileUrl(assetNames.pyramid)" alt="金字塔" style="width:120px;height:120px;opacity:.95;" />
              <div class="level-legend">
                <div class="legend-item level-1">一级战备</div>
                <div class="legend-item level-2">二级战备</div>
                <div class="legend-item level-3">三级战备</div>
                <div class="legend-item level-4">四级战备</div>
              </div>
            </div>

            <div class="flanking-image-column">
              <div class="image-item">
                <div v-if="isImageLoading" class="loading-overlay">
                  <b-spinner style="width: 2rem; height: 2rem;" label="Loading..."></b-spinner>
                  <span style="margin-top: 8px;">加载中...</span>
                </div>
                <img :src="imageList[1]" v-if="imageList[1] && !isImageLoading" alt="图像 2" class="image-display">
                <div class="image-placeholder" v-else-if="!isImageLoading">图像 2</div>
              </div>
              <div class="image-item">
                <div v-if="isImageLoading" class="loading-overlay">
                  <b-spinner style="width: 2rem; height: 2rem;" label="Loading..."></b-spinner>
                  <span style="margin-top: 8px;">加载中...</span>
                </div>
                <img :src="imageList[3]" v-if="imageList[3] && !isImageLoading" alt="图像 4" class="image-display">
                <div class="image-placeholder" v-else-if="!isImageLoading">图像 4</div>
              </div>
            </div>
          </div>
        </div>

        <div class="design-module assessment-module machine-assessment" :style="systemPanelBgStyle">
          <div class="assessment-content">
            <div class="assessment-left-section">
              <img v-if="designAssetsEnabled" :src="fileUrl(assetNames.machineIcon)" alt="机器评估"
                class="assessment-module-icon" />
              <div v-else class="icon-placeholder-machine"></div>
              <div class="assessment-title">机器评估</div>
            </div>
            <div class="assessment-middle-section">
              <div class="assessment-right-section">
                <div class="icon-placeholder-red" :style="modelIconStyle"></div>
              </div>
              <div class="design-module-content text-scrollable">
                <div v-if="isAssessing" class="loading-overlay">
                  <b-spinner small></b-spinner>
                  <span>加载中...</span>
                </div>
                <div class="description-box assessment-content-box">
                  <ul class="info-list" v-if="formattedPerformanceDataList && formattedPerformanceDataList.length > 0">
                    <li v-for="(item, idx) in formattedPerformanceDataList" :key="'machine-' + idx"
                      :class="{ 'first-item': idx === 0 }">
                      {{ item }}
                    </li>
                  </ul>
                  <p class="text-content text-muted" v-else>暂无评估信息</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="design-right-column">
        <div class="panel-right-bias-button">
          <button class="btn-bias-detect" @click="performDeviationDetection" :disabled="isBiasDetecting">
            <b-spinner small v-if="isBiasDetecting" style="margin-right:5px;"></b-spinner>
            {{ isBiasDetecting ? '开始偏差检测...' : '决策选择偏差检测' }}
          </button>
        </div>
        <div class="panel-right-top">
          <div class="panel-content">
            <div class="panel-header header-results">决策选择认知偏差检测结果</div>
            <div class="results-scroll-container">
              <div v-if="isBiasResultLoading" class="panel-overlay">加载中...</div>
              <template v-else>
                <div class="result-section small-section">
                  <div class="section-header">行为信息：</div>
                  <div class="section-content">
                    <p class="result-text">{{ behaviorInfo || '暂无行为信息' }}</p>
                  </div>
                </div>

                <div class="result-section consensus-section">
                  <div class="section-header">共识信息：</div>
                  <div class="section-content">
                    <p class="result-text">{{ samePoints || '暂无共识信息' }}</p>
                  </div>
                </div>

                <div class="result-section different-section">
                  <div class="section-header">分歧信息：</div>
                  <div class="section-content">
                    <p class="result-text different-points">{{ differentPoints || '暂无分歧信息' }}</p>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <div class="panel-right-accuracy">
          <template v-if="isBiasResultLoading">
            <div class="loading-spinner">加载中...</div>
          </template>
          <template v-else>
            <div class="accuracy-content">
              <span class="accuracy-label">偏差检测准确率</span>
              <span class="accuracy-value">
                <template
                  v-if="deviationDetectionAccuracy !== 'N/A' && deviationDetectionAccuracy !== '计算中...' && deviationDetectionAccuracy !== null && deviationDetectionAccuracy !== undefined && deviationDetectionAccuracy !== ''">
                  {{ deviationDetectionAccuracy }}%
                </template>
                <template v-else>
                  N/A
                </template>
              </span>
            </div>
          </template>
        </div>

        <div class="panel-right-button">
          <button @click="exportData" class="btn-export-result" :disabled="isBiasDetecting">
            结果导出
          </button>
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
      isImageLoading: false,
      isBiasDetecting: false,
      isAssessing: false,
      isBiasResultLoading: false,
      designAssetsEnabled: true,
      assetNames: {
        panel: null,
        rightPanel: '决策选择认知偏差检测结果文本框.png',
        label: null,
        button: '开始测验.png',
        exportBtn: '结果导出按键.png',
        accuracy: '原视频框.png',
        titleBg: '标题栏.png',
        pyramid: '金字塔图.png',
        iconRed: null,
        videoPanel: '原视频框.png',
        leftTextPanel: '左下文本框.png',
        commanderPanel: '指挥员评估文本框.png',
        systemPanel: '机器评估文本框.png',
        videoLabel: '视频演示标题框.png',
        behaviorLabel: '可视化行为标题框.png',
        resultLabel: '决策选择认知偏差检测结果标题框.png',
        level1: '一级战备图片.png',
        level2: '二级战备图片.png',
        level3: '三级战备图片.png',
        level4: '四级战备图片.png',
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
      behaviorInfo: '正在加载行为信息...',
      samePoints: '正在加载相同点信息...',
      differentPoints: '正在加载不同点信息...',
      imageList: [null, null, null, null],
      deviationDetectionAccuracy: 'N/A',
      modelDangerLevel: 'N/A',
      expertDangerLevel: 'N/A',
      currentLevel: 4,
      testVideoUrl: null,
      testVideoMessage: '正在从 LocalStorage 加载视频...',
      tempModule4Res: null,
    };
  },
  computed: {
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
            'deviation_analysis'
          ];
          const parts = takeKeys
            .map(k => data[k])
            .filter(v => typeof v === 'string' && v.trim().length > 0);
          if (parts.length > 0) {
            return parts.map(s => this.escapeToHtml(s)).join('<br/><br/>');
          }
        }
        return typeof source === 'string' ? this.escapeToHtml(source) : String(source);
      } catch (e) {
        return typeof source === 'string' ? this.escapeToHtml(source) : String(source);
      }
    },
    formattedPerformanceDataList() {
      return this.formatAssessmentTextToList(this.performanceData);
    },
    formattedPerformanceDataLocalList() {
      return this.formatAssessmentTextToList(this.performanceDataLocal);
    },
    videoPanelBgStyle() { return this.bgImageStyle(this.assetNames.videoPanel); },
    leftTextPanelBgStyle() { return this.bgImageStyle(this.assetNames.leftTextPanel); },
    commanderPanelBgStyle() { return this.bgImageStyle(this.assetNames.commanderPanel); },
    systemPanelBgStyle() { return this.bgImageStyle(this.assetNames.systemPanel); },
    behaviorPanelBgStyle() { return this.bgImageStyle(this.assetNames.panel); },
    rightPanelBgStyle() { return this.bgImageStyle(this.assetNames.rightPanel || this.assetNames.panel); },
    buttonBgStyle() { return this.bgImageStyle(this.assetNames.button); },
    exportBtnBgStyle() { return this.bgImageStyle(this.assetNames.exportBtn || this.assetNames.button); },
    accuracyBgStyle() { return this.bgImageStyle(this.assetNames.accuracy); },
    expertIconStyle() {
      if (!this.designAssetsEnabled) return {};
      const expertLevel = this.extractLevelFromString(this.expertDangerLevel);
      const levelImg = this.projectAssetUrl(this.getLevelImageName(expertLevel));
      if (!levelImg) return {};
      return {
        width: '98px',
        height: '84px',
        backgroundImage: `url('${levelImg}')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
        border: 'none',
        margin: 'auto'
      };
    },
    modelIconStyle() {
      if (!this.designAssetsEnabled) return {};
      const modelLevel = this.extractLevelFromString(this.modelDangerLevel);
      const levelImg = this.projectAssetUrl(this.getLevelImageName(modelLevel));
      if (!levelImg) return {};
      return {
        width: '98px',
        height: '84px',
        backgroundImage: `url('${levelImg}')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
        border: 'none',
        margin: 'auto'
      };
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    this.initializeDataFromStorage();
    this.loadVideoFromStorage();
    this.loadDataFromModule4Res();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    escapeToHtml(text) {
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br/>');
    },
    formatAssessmentTextToList(text) {
      if (!text) return [];
      const ratingMap = {
        '顶级': '(★★★★★)',
        '卓越': '(★★★★)',
        '优秀': '(★★★)',
        '良好': '(★★)',
        '一般': '(★)'
      };
      const textStr = String(text);
      const result = [];

      const items = textStr.split(/[;\n]/).filter(item => item.trim());

      items.forEach(item => {
        const trimmed = item.trim();
        if (!trimmed) return;

        const fullMatch = trimmed.match(/^([^：:]+)[：:](.+?)[。.]?[（(]([^：:)]+)(?:[：:]([^）)]+))?[）)]/);

        if (fullMatch) {
          const [, attrName, content, rating, extraContent] = fullMatch;
          const stars = ratingMap[rating] || rating;
          let formattedItem = `${attrName}：${content.trim()}。${stars}`;
          if (extraContent) {
            formattedItem += `：${extraContent}`;
          }
          result.push(formattedItem);
        } else {
          const simpleMatch = trimmed.match(/^(.+?)[。.]?[（(]([^：:)]+)(?:[：:]([^）)]+))?[）)]/);
          if (simpleMatch) {
            const [, content, rating, extraContent] = simpleMatch;
            const stars = ratingMap[rating] || rating;
            let formattedItem = `${content.trim()}。${stars}`;
            if (extraContent) {
              formattedItem += `：${extraContent}`;
            }
            result.push(formattedItem);
          } else {
            let formattedItem = trimmed;
            formattedItem = formattedItem.replace(/[（(]([^：:)]+)(?:[：:]([^）)]+))?[）)]/g, (match, rating, extraContent) => {
              const stars = ratingMap[rating] || rating;
              if (extraContent) {
                return `${stars}：${extraContent}`;
              }
              return stars;
            });
            result.push(formattedItem);
          }
        }
      });

      return result;
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
          if (module3Res.final_review) {
            this.thirdStageText = module3Res.final_review;
          }
        } else {
          this.thirdStageText = '未找到第三阶段信息，正在使用默认武器型号。';
        }

        const module1ResStr = localStorage.getItem('module1Res');
        if (module1ResStr) {
          const module1Res = JSON.parse(module1ResStr);
          const videoName = module1Res.video_name;
          if (videoName) {
            this.apiConfig.weaponModel = videoName;
          }
        }
      } catch (e) {
        this.thirdStageText = '加载信息时发生错误，请检查 LocalStorage 数据格式。';
      }
    },
    loadDataFromModule4Res() {
      try {
        const module4ResStr = localStorage.getItem('module4Res');
        if (module4ResStr) {
          const module4Data = JSON.parse(module4ResStr);

          this.performanceData = module4Data.performance_data || module4Data.performancedata || '暂无性能数据。';
          this.performanceDataLocal = module4Data.performance_data_local || '暂无本地性能数据。';

          const modelLevelNum = this.getLevelNum(module4Data.modelanalysisdangerlevel);
          const expertLevelNum = this.getLevelNum(module4Data.local_txt_danger_level);
          this.modelDangerLevel = `${modelLevelNum} !`;
          this.expertDangerLevel = `${expertLevelNum} !`;
          this.currentLevel = modelLevelNum;
          this.imageList = module4Data.imageList || [null, null, null, null];

          // 如果存在 summary 数据，自动填充偏差检测结果文本
          if (module4Data.summary) {
            const { behaviorInfo, samePoints, differentPoints } = this.parseSummaryText(module4Data.summary);
            this.behaviorInfo = behaviorInfo;
            this.samePoints = samePoints;
            this.differentPoints = differentPoints;
          } else {
            this.behaviorInfo = '请点击 "偏差检测"';
            this.samePoints = '请点击 "偏差检测"';
            this.differentPoints = '请点击 "偏差检测"';
          }

          // 如果存在准确率数据，自动填充偏差检测准确率
          if (module4Data.average_comprehensive_accuracy !== undefined && module4Data.average_comprehensive_accuracy !== null) {
            const accuracyValue = parseFloat(module4Data.average_comprehensive_accuracy);
            this.deviationDetectionAccuracy = isNaN(accuracyValue) ? 'N/A' : (accuracyValue * 100).toFixed(2);
          } else {
            this.deviationDetectionAccuracy = 'N/A';
          }
        } else {
          this.performanceData = '请点击 "决策认知"';
          this.performanceDataLocal = '请点击 "决策认知"';
          this.behaviorInfo = '请点击 "决策认知"';
          this.samePoints = '请点击 "决策认知"';
          this.differentPoints = '请点击 "决策认知"';
          this.imageList = [null, null, null, null];
          this.deviationDetectionAccuracy = 'N/A';
          this.modelDangerLevel = 'N/A';
          this.expertDangerLevel = 'N/A';
          this.currentLevel = 4;
        }
      } catch (e) {
        this.performanceData = '加载数据出错';
        this.performanceDataLocal = '加载数据出错';
      }
    },
    parseSummaryText(summaryText) {
      if (!summaryText) {
        return {
          behaviorInfo: '暂无行为信息',
          samePoints: '暂无相同点信息',
          differentPoints: '暂无不同点信息'
        };
      }

      try {
        let summary = summaryText;
        if (typeof summaryText === 'string' && summaryText.trim().startsWith('{')) {
          const parsed = JSON.parse(summaryText);
          summary = parsed.summary || summaryText;
        }

        const behaviorMatch = summary.match(/行为信息[：:]?\s*([^]*?)(?=相同点[：:]|$)/);
        const samePointsMatch = summary.match(/相同点[：:]?\s*([^]*?)(?=不同点[：:]|$)/);
        const differentPointsMatch = summary.match(/不同点[：:]?\s*([^]*?)$/);

        const behaviorInfo = behaviorMatch ? behaviorMatch[1].trim().replace(/^[\n\s]+|[\n\s]+$/g, '') : '暂无行为信息';
        const samePoints = samePointsMatch ? samePointsMatch[1].trim().replace(/^[\n\s]+|[\n\s]+$/g, '') : '暂无相同点信息';
        const differentPoints = differentPointsMatch ? differentPointsMatch[1].trim().replace(/^[\n\s]+|[\n\s]+$/g, '') : '暂无不同点信息';

        return { behaviorInfo, samePoints, differentPoints };
      } catch (error) {
        return {
          behaviorInfo: '解析行为信息失败',
          samePoints: '解析相同点失败',
          differentPoints: '解析不同点失败'
        };
      }
    },
    projectAssetUrl(name) {
      if (!this.designAssetsEnabled || !name) return '';
      try {
        return require(`@/assets/images/step4/${name}`);
      } catch (e) {
        console.warn('未找到素材：', name);
        return '';
      }
    },
    fileUrl(name) {
      return this.projectAssetUrl(name);
    },
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
    async fetchBackendData() {
      this.isLoading = true;
      this.isAssessing = true;
      this.isImageLoading = true;
      const model = this.apiConfig.weaponModel;

      try {
        const requestBody = { weapon_model: model };
        const mainResponse = await axios.post(`${API_BASE_URL}/analyze-weapon`, requestBody);
        const mainData = mainResponse.data;

        if (mainData.status === 'success') {
          const accuracyResponse = await axios.get(`${IMAGE_API_BASE_URL}/statistics/accuracy`);
          const accuracyData = accuracyResponse.data;

          const imageResponse = await axios.get(`${IMAGE_API_BASE_URL}/weapon-all-images`, {
            params: { weapon_model: model }
          });
          const imageData = imageResponse.data;

          if (imageData.images && Array.isArray(imageData.images)) {
            this.imageList = imageData.images
              .map(img => img.url)
              .slice(0, 4);
            while (this.imageList.length < 4) {
              this.imageList.push(null);
            }
          } else {
            this.imageList = [null, null, null, null];
          }

          const module4Res = {
            weapon_model: mainData.data.weapon_model,
            performance_data: mainData.data.performance_data,
            performancedata: mainData.data.performance_data,
            performance_data_local: mainData.data.performance_data_local,
            summary: mainData.data.summary,
            image_paths: mainData.data.image_paths,
            imageList: this.imageList,
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

          this.parseBackendData(mainData.data);
        } else {
          this.currentStageText = `分析接口数据获取失败：${(mainData.error && mainData.error.message) || '未知错误'}`;
        }
      } catch (error) {
        this.currentStageText = '接口调用失败，请检查网络、CORS配置或后端服务';
      } finally {
        this.isLoading = false;
        this.isAssessing = false;
        this.isImageLoading = false;
      }
    },
    parseBackendData(backendData) {
      const currentThirdStageText = String(this.thirdStageText);
      if (!currentThirdStageText || currentThirdStageText.includes('正在加载') || currentThirdStageText.includes('未找到')) {
        this.thirdStageText = `发现目标武器型号：${backendData.weapon_model}，位于指定区域，行为模式初步匹配已知威胁，待进一步分析验证`;
      }

      const rawPerformanceData = backendData.performance_data || '暂无性能数据。';
      this.performanceData = rawPerformanceData;

      const rawPerformanceDataLocal = backendData.performance_data_local || '暂无本地性能数据。';
      this.performanceDataLocal = rawPerformanceDataLocal;

      const modelLevelNum = this.getLevelNum(backendData.model_analysis_danger_level);
      const expertLevelNum = this.getLevelNum(backendData.local_txt_danger_level);

      this.modelDangerLevel = `${modelLevelNum} !`;
      this.expertDangerLevel = `${expertLevelNum} !`;
      this.currentLevel = modelLevelNum;
    },
    performDeviationDetection() {
      this.isBiasDetecting = true;
      this.isBiasResultLoading = true;
      this.deviationDetectionAccuracy = '计算中...';
      this.behaviorInfo = '';
      this.samePoints = '';
      this.differentPoints = '';

      try {
        const module4ResStr = localStorage.getItem('module4Res');
        if (module4ResStr) {
          const module4Res = JSON.parse(module4ResStr);

          setTimeout(() => {
            if (module4Res.summary) {
              const { behaviorInfo, samePoints, differentPoints } = this.parseSummaryText(module4Res.summary);
              this.behaviorInfo = behaviorInfo;
              this.samePoints = samePoints;
              this.differentPoints = differentPoints;
            } else {
              this.behaviorInfo = '暂无行为信息';
              this.samePoints = '暂无相同点信息';
              this.differentPoints = '暂无不同点信息';
            }
            this.isBiasDetecting = false;
            this.isBiasResultLoading = false;
          }, 5000);

          setTimeout(() => {
            const accuracyValue = parseFloat(module4Res.average_comprehensive_accuracy);
            this.deviationDetectionAccuracy = isNaN(accuracyValue) ? 'N/A' : (accuracyValue * 100).toFixed(2);
          }, 120000);
        } else {
          this.behaviorInfo = '请先点击 "决策认知" 获取数据，然后再点击 "偏差检测"。';
          this.samePoints = '请先点击 "决策认知" 获取数据';
          this.differentPoints = '请先点击 "决策认知" 获取数据';
          this.deviationDetectionAccuracy = 'N/A';
          this.isBiasDetecting = false;
          this.isBiasResultLoading = false;
        }
      } catch (e) {
        this.behaviorInfo = '加载偏差检测结果时出错，请检查LocalStorage数据。';
        this.deviationDetectionAccuracy = 'N/A';
        this.isBiasDetecting = false;
        this.isBiasResultLoading = false;
      }
    },
    getLevelNum(backendLevel) {
      const numMap = { '危险等级1': 1, '危险等级2': 2, '危险等级3': 3, '危险等级4': 4 };
      return numMap[backendLevel] || 4;
    },
    getLevelImageName(level) {
      switch (level) {
        case 1: return this.assetNames.level1;
        case 2: return this.assetNames.level2;
        case 3: return this.assetNames.level3;
        default: return this.assetNames.level4;
      }
    },
    extractLevelFromString(levelString) {
      if (!levelString) return 4;
      const match = levelString.toString().match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 4;
    },
    loadVideoFromStorage() {
      try {
        const module1ResStr = localStorage.getItem('module1Res');
        if (module1ResStr) {
          const module1Res = JSON.parse(module1ResStr);
          const videoPath = module1Res.originalVideoPath;
          if (videoPath && videoPath !== '无原视频路径') {
            this.testVideoUrl = videoPath;
          } else {
            this.testVideoMessage = '在 module1Res 中未找到或路径无效。';
          }
        } else {
          this.testVideoMessage = '未在 LocalStorage 中找到 "module1Res" 对象。';
        }
      } catch (e) {
        this.testVideoMessage = '加载视频时出错，请检查 module1Res 格式。';
      }
    },
    handleVideoError(e) {
      this.testVideoMessage = "视频加载失败，请检查 LocalStorage 中的 URL 是否正确。";
      this.testVideoUrl = null;
    },
    exportData() {
      try {
        const exportData = {
          "performance_data": this.performanceData,
          "performance_data_local": this.performanceDataLocal,
          "behavior_info": this.behaviorInfo,
          "same_points": this.samePoints,
          "different_points": this.differentPoints,
          "deviation_detection_accuracy": this.deviationDetectionAccuracy
        };

        const jsonStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `decision_making_data_${new Date().toISOString().slice(0, 10)}.json`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(link.href);
      } catch (error) {
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

.section {
  background-color: #030a1c;
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

.register,
.img_box {
  display: none;
}

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

.top-nav-left,
.top-nav-right {
  position: absolute;
  top: 10px;
  z-index: 10;
}

.top-nav-left {
  left: 20px;
  display: flex;
  gap: 10px;
}

.top-nav-right {
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
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
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(20, 40, 70, 0.9);
    color: #fff;
  }
}

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

.use-assets {
  .design-module {
    border: none;
    background: transparent;
    backdrop-filter: none;
    background-repeat: no-repeat;
    background-size: '100% 100%';
  }

  .design-module .design-module-content.text-scrollable {
    overflow-y: auto !important;
  }

  .design-module .design-module-label {
    background: transparent;
    border-radius: 0;
  }

  .nav-btn {
    border: none;
    background: transparent;
    color: #ffffff;
    text-shadow: 0 0 6px rgba(0, 0, 0, 0.8);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 120px;
    height: 40px;
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

.core-layout-design {
  display: flex;
  height: calc(100vh - 80px);
  padding: 10px 20px 20px 20px;
  gap: 20px;
}

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

/* --- 右侧列样式更新 --- */
.design-right-column {
  width: 30%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 5px;
  height: 100%;
  position: relative;
  z-index: 2;
}

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

.assessment-module .design-module-content.text-scrollable {
  overflow-y: auto !important;
  height: 100% !important;
}

.assessment-module .design-module-content,
.result-log-module .design-module-content,
.text-module-left .design-module-content {
  overflow-y: auto;
  max-height: 100%;

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
  }
}

.assessment-content-box {
  flex-grow: 1;
  background-color: transparent;
  border: none;
  box-shadow: none;
  color: #eee;
  font-size: 0.9rem;
  line-height: 1.6;
  padding: 15px !important;
  overflow-y: auto;
  border-radius: 0;
  width: 100%;
  height: 100%;
}

.assessment-content-box::-webkit-scrollbar {
  width: 6px;
}

.assessment-content-box::-webkit-scrollbar-thumb {
  background: #00e5ff;
  border-radius: 3px;
}

.assessment-content-box::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-list li {
  position: relative;
  padding: 10px 0;
  margin: 0;
  line-height: 1.6;
  color: #e8f4ff;
  font-size: 0.95rem;
  padding-left: 0;
  padding-right: 0;
}

.info-list li:before {
  display: none;
}

.info-list li::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-image: url('~@/assets/images/step2/blueline.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
}

.info-list li.first-item::after {
  background-image: url('~@/assets/images/step2/yellowline.png');
}

.text-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #e0e0e0;
  margin: 0;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  color: #00e0ff;
  font-size: 0.9rem;
}

.video-module {
  flex: 0 0 auto;
  width: 100%;
  height: 250px;
  background-image: url('~@/assets/images/step1/-s-框-小视频.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;

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

.standalone-label {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  color: #e6faff;
  font-weight: bold;
  font-size: 0.95rem;
  padding-left: 40px;
  margin-bottom: 6px;
  background: linear-gradient(to right, #00e0ff, #005f7f);
}

.use-assets .standalone-label {
  background: transparent;
}

.fixed-left-text {
  position: relative;
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 10px 25px 30px 25px;
}

.fixed-left-text .panel-header {
  margin-top: 0;
  margin-bottom: 10px;
  padding-left: 0;
}

.fixed-left-text .design-module-content {
  flex: 1 1 auto;
  min-height: 0;
  padding: 0;
}

.button-container {
  flex: 0 0 auto;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;

  .inference-btn {
    width: 250px;
    height: 100px;
    font-size: 1.1rem;
    font-weight: bold;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    @include sci-fi-border;
    background-image: url('~@/assets/images/step4/开始测验.png');
    color: #ffffff;
    border: none;
    border-radius: 4px;
  }
}

.assessment-module {
  flex: 0 0 auto;
  height: 200px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &.machine-assessment {
    order: 1;
    margin-bottom: 10px;
  }

  &.commander-assessment {
    order: 3;
    margin-top: 10px;
  }

  .assessment-content {
    display: flex;
    padding: 15px;
    gap: 15px;
    height: 100%;
  }

  .assessment-middle-section {
    flex: 1;
    display: flex;
    gap: 15px;
    min-width: 0;
  }

  .assessment-module .design-module-content {
    flex: 1;
    height: 100%;
    position: relative;
  }
}

.behavior-module {
  flex: 1 1 auto;
  min-height: 200px;
  order: 2;
  padding-top: 18px;

  .design-module-label {
    // width: 120px;
    justify-content: center !important; /* 强制文字水平居中 */
    padding-left: 5 !important;         /* 去除全局样式中设置的左侧缩进 */
    align-items: center;
  }

  .behavior-content {
    flex-grow: 1;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    padding: 0 15px 15px 15px;
    gap: 20px;
  }

  .flanking-image-column {
    display: flex;
    flex-direction: column;
    gap: 15px;
    flex-basis: 35%;
    height: 100%;
  }

  .image-item {
    flex: 1;
    @include sci-fi-border;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
  }

  .image-display {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .pyramid-legend-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    min-width: 120px;
    align-self: center;
  }

  .level-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    justify-content: center;
    width: 140px;

    .legend-item {
      font-size: 0.65rem;
      font-weight: bold;
      flex: 0 0 45%;
      text-align: center;
      margin-bottom: 2px;

      &.level-1 {
        color: #FF0000;
        text-shadow: 0 0 5px #FF0000;
      }

      &.level-2 {
        color: #FFC118;
        text-shadow: 0 0 5px #FFC118;
      }

      &.level-3 {
        color: #2BC3FF;
        text-shadow: 0 0 5px #2BC3FF;
      }

      &.level-4 {
        color: #7EFF00;
        text-shadow: 0 0 5px #7EFF00;
      }
    }
  }
}

/* 面板标题 */
.panel-header {
  padding-left: 0 !important;
  justify-content: center !important;
  display: flex;      /* 确保是 flex 布局 */
  align-items: center; /* 实现垂直居中 */
  width: 300px; /* 您可以根据需要修改这个数值，例如 320px 或 100% */
  margin: 5px auto 10px auto !important;/* 关键修改：25px(顶部间隔), auto(水平居中), 10px(底部间隔) */
}

.panel-header,
.design-module-label {
  height: 35px;
  background-image: url('~@/assets/images/step1/-s-二级标题.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  flex-shrink: 0;
  color: #fff;
  font-size: 1rem;
  font-weight: bold;
  padding-left: 0;
  margin-bottom: 5px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.panel-right-top {
  height: 63%;
  /* Increased from 55% */
  flex-shrink: 0;
  width: 100%;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  margin-bottom: 20px;
  background-image: url('~@/assets/images/step1/弹框-偏差检测结果.png');
}

.panel-right-top .panel-content {
  display: flex;
  flex-direction: column;
  padding: 10px 25px 30px 25px;
  /* Reduced top padding */
  height: 100%;
}

.results-scroll-container {
  flex: 1;
  overflow-y: auto;
  position: relative;
  min-height: 0;
  margin-top: 10px;
}

.results-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.results-scroll-container::-webkit-scrollbar-thumb {
  background: #00e5ff;
  border-radius: 3px;
}

.results-scroll-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

.panel-right-top .panel-header.header-results {
  margin-top: 0;
  margin-bottom: 10px;
  padding-left: 0;
}

.result-section {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.result-section:last-child {
  margin-bottom: 0;
}

.section-header {
  color: #00e5ff;
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.section-content {
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid #00e0ff;
  border-radius: 5px;
  padding: 15px;
  overflow-y: auto;
  position: relative;
}

/* Added custom scrollbar styles to match machine assessment */
.section-content::-webkit-scrollbar {
  width: 6px;
}

.section-content::-webkit-scrollbar-thumb {
  background: #00e5ff;
  border-radius: 3px;
}

.section-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

.small-section .section-content {
  min-height: 60px;
  max-height: 60px;
}

.consensus-section .section-content {
  min-height: 180px;
  /* Reduced from 220px */
  max-height: 180px;
  /* Reduced from 220px */
  overflow-y: auto;
}

.different-section .section-content {
  min-height: 60px;
  overflow-y: auto;
}

.result-text {
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0;
  white-space: pre-line;
  color: #e0e0e0;
}

.different-points {
  color: #ff6b6b !important;
  font-weight: bold;
}

.panel-right-accuracy {
  flex-shrink: 0;
  width: 100%;
  background-image: url('~@/assets/images/step4/准确率框.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  margin-bottom: 20px;
  padding: 20px 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  margin-top: -20px;
}

.accuracy-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 15px;
}

.accuracy-label {
  color: #fff;
  font-size: 1rem;
  font-weight: bold;
  white-space: nowrap;
}

.accuracy-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #00e5ff;
  text-shadow: 0 0 10px #00e5ff, 0 0 20px rgba(0, 229, 255, 0.5);
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.loading-spinner {
  color: #00e5ff;
  font-size: 1.2rem;
  text-shadow: 0 0 5px #00e5ff;
}

.panel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
}

.panel-right-button {
  flex-shrink: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 0;
  min-height: 70px;
  background: none !important;
  background-image: none !important;
}

.panel-right-bias-button {
  flex-shrink: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 0 12px 0;
  min-height: 70px;
  background: none !important;
}

.btn-bias-detect {
  background: none;
  border: none;
  cursor: pointer;
  width: 250px;
  height: 100px;
  background-image: url('~@/assets/images/step3/greenbutton.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  color: #fff;
  font-size: 1.1rem;
  font-weight: bold;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin-bottom: -50px;
  margin-top: -60px;
}

.btn-bias-detect:disabled {
  filter: grayscale(80%);
  cursor: not-allowed;
}

.btn-export-result {
  background-color: transparent !important;
  /* 关键：去掉按钮默认的白色/灰色背景 */
  box-shadow: none !important;
  /* 保险起见：去掉默认阴影 */
  background-image: url('~@/assets/images/step1/-s-按钮-结果导出.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
  border: none;
  cursor: pointer;
  width: 160px;
  height: 50px;
  color: #333;
  font-size: 1.1rem;
  font-weight: bold;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  position: relative;
  padding: 0;
  margin-top: -20px;
}

.btn-export-result:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

.btn-export-result:disabled {
  filter: grayscale(80%);
  cursor: not-allowed;
}

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
