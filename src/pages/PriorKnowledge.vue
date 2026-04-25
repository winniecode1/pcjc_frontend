<template>
  <div class="section">
    <div class="img_box"></div>

    <!-- 顶部导航栏 -->
    <b-row class="header-bar align-item-s-center no-gutters">
      <b-col cols="3" class="text-left">
        <button class="header-btn btn-home" @click="navigateHome">首页</button>
        <button class="header-btn btn-back" @click="navigateBack">上个页面</button>
      </b-col>
      <b-col cols="6" class="text-center">
        <!-- <h1 class="header-title">先验知识认知偏差检测模型</h1> -->
      </b-col>
      <b-col cols="3" class="text-right">
        <button class="header-btn btn-next" @click="navigateNext">下个页面</button>
      </b-col>
    </b-row>

    <!-- 主要内容区域 -->
    <div class="row content-row">
      <!-- 左侧视频和按钮区域 -->
      <div class="design-left-column">
        <!-- 作战指令面板 -->
        <div class="design-module orders-module">
          <div class="panel-header">作战指令</div>
          <div class="design-module-content">
            <div class="orders-text-box overflow-auto">
              {{ ordersText || '暂无作战指令' }}
            </div>
          </div>
        </div>

        <div class="design-module video-module">
          <div class="panel-header">无人机侦察数据</div>
          <div class="design-module-content video-content-wrapper">
            <!-- 数据选择列表状态 -->
            <div v-if="!isVideoSelected" class="video-select-list">
              <div class="video-list-header">请选择数据源</div>
              <div class="video-list-container">
                <div v-for="video in videoList" :key="video.id" class="video-select-item"
                  @click="selectVideo(video)">
                  <div class="video-info">
                    <span class="video-name">{{ video.name }}</span>
                    <span class="video-type">{{ video.type || '未知' }}</span>
                  </div>
                  <span class="selector-circle"></span>
                </div>
              </div>
            </div>
            <!-- 数据展示状态 -->
            <div v-else class="video-display-container">
              <!-- 图片展示 -->
              <img v-if="selectedVideo && isImageFile(selectedVideo.name || selectedVideo.image_path)"
                   :src="videoUrl" class="video-display" @error="handleImageError" />
              <!-- 视频展示 -->
              <video v-else-if="videoUrl" :src="videoUrl" controls autoplay loop muted class="video-display" @error="handleVideoError"></video>
              <div v-else class="placeholder-text">
                {{ videoMessage }}
              </div>
            </div>
            <button v-if="isVideoSelected" class="btn-back-list" @click="backToList">返回选择列表</button>
          </div>
        </div>

        <div class="design-module text-module-left fixed-left-text">
          <div class="panel-header">多模态认知传播信息</div>
          <div class="design-module-content">
            <!-- 原始图片展示（认知传播信息源） -->
            <div v-if="cognitiveImageUrl" class="cognitive-image-container">
              <div class="cognitive-image-label">认知传播信息源</div>
              <img :src="cognitiveImageUrl" class="cognitive-source-image" @error="handleImageError" />
            </div>
            <!-- 细粒度检测后的信息：固定图片区域（不滚动） -->
            <div v-if="multimodalDetectionInfo && multimodalDetectionInfo.image" class="multimodal-image-fixed">
              <img :src="multimodalDetectionInfo.image" class="multimodal-image" />
            </div>
            <!-- 可滚动的信息区域 -->
            <div class="text-scrollable">
              <!-- 细粒度检测后的信息（颜色、形状、轮廓） -->
              <div v-if="multimodalDetectionInfo">
                <div v-if="multimodalDetectionInfo.color" class="multimodal-info-item">
                  <span class="info-label">颜色：</span>
                  <span>{{ multimodalDetectionInfo.color }}</span>
                </div>
                <div v-if="multimodalDetectionInfo.shape" class="multimodal-info-item">
                  <span class="info-label">形状：</span>
                  <span>{{ multimodalDetectionInfo.shape }}</span>
                </div>
                <div v-if="multimodalDetectionInfo.outline" class="multimodal-info-item">
                  <span class="info-label">轮廓：</span>
                  <span>{{ multimodalDetectionInfo.outline }}</span>
                </div>
              </div>
              <!-- 初始信息（场景、目标、行为、总结） -->
              <div v-else-if="initialDescriptionInfo">
                <div v-if="initialDescriptionInfo.scene" class="multimodal-info-item">
                  <span class="info-label">场景：</span>
                  <span>{{ initialDescriptionInfo.scene }}</span>
                </div>
                <div v-if="initialDescriptionInfo.target" class="multimodal-info-item">
                  <span class="info-label">目标：</span>
                  <span>{{ initialDescriptionInfo.target }}</span>
                </div>
                <div v-if="initialDescriptionInfo.behavior" class="multimodal-info-item">
                  <span class="info-label">行为：</span>
                  <span>{{ initialDescriptionInfo.behavior }}</span>
                </div>
                <div v-if="initialDescriptionInfo.summary" class="multimodal-info-item">
                  <span class="info-label">总结：</span>
                  <span>{{ initialDescriptionInfo.summary }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="button-container">
          <button @click="startNegotiation" class="btn-start-detect" :disabled="isDetecting">
            <span>开始细粒度检测</span>
          </button>
          <button @click="queryPriorKnowledge" class="btn-start-detect" :disabled="isLoading || isQueryingPriorKnowledge">
            <span>查询先验知识</span>
          </button>
        </div>
      </div>

      <!-- 中间知识图谱区域 -->
      <div class="col-md-6 middle-column">
        <div class="panel-left h-100">
          <div class="panel-header" style="align-items: center;">
            <span >先验知识</span>
          </div>
          <div class="panel-content">
            <div class="graph-container" ref="graphContainer" style="height: calc(100% - 40px);">
              <!-- <div class="graph-title">领域先验知识</div> -->
              <svg ref="graphSvg" style="width: 100%; height: calc(100% - 30px);"></svg>
              <div v-if="isQueryingPriorKnowledge" class="panel-loading">计算中...</div>
              <div v-else-if="isLoading" class="panel-loading">加载中...</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧标签和预测信息区域 -->
      <div class="col-md-3 right-column">
        <div class="panel-right-bias">
          <button class="btn-bias-detect" @click="onBiasDetectClick" :disabled="isWaitingForAccuracy">
            先验知识偏差检测
          </button>
        </div>
        <!-- 标签信息面板 -->
        <!-- <div class="panel-right-tag">
          <div class="panel-header">
            <span>真值信息</span>
          </div>
          <div class="panel-content panel-content-right">
            <div class="description-box tag-content">
              <ul class="info-list">
                <li
                  v-for="(item, idx) in tagInfoList"
                  :key="'tag-' + idx"
                  :class="{ 'first-item': item.toString().includes('小类信息') }"
                >
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>
        </div> -->

        <!-- 预测信息面板 -->
        <div class="panel-right-predict">
          <div class="panel-header">
            <span>先验知识认知偏差检测结果</span>
          </div>
          <div class="panel-content panel-content-right">
            <div v-if="isQueryingPriorKnowledge" class="description-box predict-content">计算中...</div>
            <div v-else-if="isLoading" class="description-box predict-content">加载中...</div>
            <div v-else class="description-box predict-content">
              <ul class="info-list">
                <li
                  v-for="(item, idx) in predictInfoList"
                  :key="'pre-' + idx"
                  :class="{ 'first-item': (typeof item === 'object' ? item.label : item.toString()).includes('小类信息') }"
                >
                  <span v-if="typeof item === 'object'">
                    {{ item.label }}
                    <span :style="{ color: isColorized ? (item.color || '#00e5ff') : '#ffffff' }">{{ item.value }}</span>
                  </span>
                  <span v-else>{{ item }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 偏差检测准确率面板 -->
        <div class="panel-right-accuracy">
          <div class="accuracy-content">
            <span class="accuracy-label">偏差识别准确率</span>
            <span class="accuracy-value">
              <template v-if="accuracyRate !== '—'">
                {{ accuracyRate }}
              </template>
              <template v-else-if="isLoading || isWaitingForAccuracy">
                计算中...
              </template>
              <template v-else>
                N/A
              </template>
            </span>
          </div>
        </div>

        <!-- 结果导出按钮 -->
        <div class="panel-right-button">
          <button @click="downloadJsonData" class="btn-export-result" :disabled="isLoading">
            结果导出
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 导入 axios 用于 HTTP 请求
import axios from 'axios';
  // 从localStorage获取module1Res对象并解析所需属性
  let IMG_PATH_URL = '/home/wuzhixuan/Project/PCJC/module2/images_frame/B-2幽灵-2.png';
  let DEVICE_TYPE = '飞机';
  let VIDEO_PATH = '';
  try {
    const module1ResStr = localStorage.getItem('module1Res');
    if (module1ResStr) {
      const module1Res = JSON.parse(module1ResStr);
      // 获取并清理key_frame_path
      if (module1Res.key_frame_path) {
        IMG_PATH_URL = module1Res.key_frame_path.trim().replace(/^[`'"\s]+|[`'"\s]+$/g, '');
      }
      // 获取并清理deviceType
      if (module1Res.deviceType) {
        DEVICE_TYPE = module1Res.deviceType.trim().replace(/^[`'"\s]+|[`'"\s]+$/g, '');
      }
      // 获取并清理originalVideoPath
      if (module1Res.originalVideoPath) {
        VIDEO_PATH = module1Res.originalVideoPath.trim().replace(/^[`'"\s]+|[`'"\s]+$/g, '');
      }
    }
  } catch (e) {
    console.error('解析module1Res时出错:', e);
  }
   console.log('IMG_PATH_URL:', IMG_PATH_URL, 'DEVICE_TYPE:', DEVICE_TYPE)
export default {
    name: 'PriorKnowledge',
    data() {
        return {
          fullWidth: window.innerWidth,
          fullHeight: window.innerHeight,
          ordersText: '',
          originalImageURL: null,
          tagInfoList: ["小类信息", "火力信息", "颜色信息", "形状信息", "尺寸信息", "动力信息"],
          predictInfoList: ["小类信息", "火力信息", "颜色信息", "形状信息", "尺寸信息", "动力信息", "轮廓信息"],
          propertyColors: {}, // 用于存储属性颜色
          isLoading: false,
          accuracyRate: '—',
          cachedAccuracy: '—',
          accuracyTimer: null,
          isColorized: false,
          isWaitingForAccuracy: false, // 标志：是否在等待准确率显示（点击按钮后的延迟期间）
          finalResult: null,
          nodes: [], // 用于存储后端返回的节点数据
          links: [], // 用于存储后端返回的链接数据
          // 视频相关数据
          videoUrl: null,
          videoMessage: '正在从 LocalStorage 加载视频...',
          // 视频描述信息
          VIDEO_DESCRIPTION: '',
          // 存储从get_image_base64接口获取的图片信息
          imageBase64: '',
          // 查询先验知识状态
          isQueryingPriorKnowledge: false,
          // 细粒度检测状态（控制按钮禁用）
          isDetecting: false,
          // 存储细粒度检测的结果数据
          listResultData: null,
          // 细粒度检测的多模态信息（图片、颜色、形状、轮廓），显示在原有信息下面
          multimodalDetectionInfo: null,
          // 初始描述信息（场景、目标、行为、总结）
          initialDescriptionInfo: null,
          // 数据选择相关
          videoList: [],
          selectedVideo: null,
          isVideoSelected: false,
          // 认知传播信息源模块的原始图片URL
          cognitiveImageUrl: null
        };
      },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    // 获取作战指令
    this.fetchOrders();
    // 获取视频列表
    this.fetchVideoList();
    // 页面加载时加载视频
    this.loadVideoFromStorage();
    // 页面加载时加载初始描述信息（场景、目标、行为、总结）
    this.loadInitialDescriptionInfo();
    // 页面加载时调用get_image_base64接口获取图片信息（先加载，确保后续恢复多模态信息时图片可用）
    this.loadImageBase64();
    // 页面加载时尝试读取模块二缓存（如果存在会调用 renderGraph）
    // 使用 $nextTick 确保 imageBase64 已经加载完成（如果从缓存加载）
    this.$nextTick(() => {
      this.loadModule2FromStorage();
      // 检查准确率计时状态
      this.checkAccuracyTimer();
      // 如果没有缓存，使用默认节点渲染图谱
      if (!localStorage.getItem('module2Res')) {
        this.$nextTick(() => {
          this.renderGraph();
        });
      }
    });
    // this.downloadJsonData();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    // 注意：不在这里清除定时器，让计时在页面切换后继续
    // 只有在计时完成时才清除localStorage
  },
  methods: {
    // 判断是否是图片文件
    isImageFile(filename) {
      if (!filename) return false;
      return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(filename);
    },
    
    // 处理图片加载错误
    handleImageError(e) {
      console.error("图片加载失败:", e);
      this.videoMessage = "图片加载失败，请检查图片路径是否正确";
      this.videoUrl = null;
    },
    
    // 获取作战指令
    async fetchOrders(sampleId) {
      if (!sampleId) {
        this.ordersText = '';
        return;
      }
      try {
        const response = await axios.get('http://10.109.253.71:8001/module2/get_mission_order', {
          params: { img_path: sampleId }
        });
        this.ordersText = response.data.mission_order || '';
      } catch (error) {
        console.warn("获取作战指令失败", error);
        this.ordersText = '';
      }
    },
    // 获取图片列表（无人机侦察数据）
    async fetchVideoList() {
      try {
        const response = await axios.get('http://10.109.253.71:8001/image_list');
        console.log('接口原始返回数据:', response.data);
        
        let rawData = response.data;
        // 如果有 data 字段，从 data 中取
        if (rawData && rawData.data) {
          rawData = rawData.data;
        }
        
        // 从原始数据中提取 images 数组
        const imagesArray = (rawData && rawData.images) || (rawData && rawData.data) || [];
        
        if (Array.isArray(imagesArray)) {
          // 接口返回的是 images 数组
          this.videoList = imagesArray.map((item, index) => ({
            id: item.id || index + 1,
            name: item.name || `图片${index + 1}`,
            path: item.path || '',
            type: item.type || 'image'
          }));
          console.log('图片列表处理后:', this.videoList);
        }
      } catch (error) {
        console.warn("获取图片列表失败", error);
        this.videoList = [];
      }
    },
    // 选择数据
    selectVideo(video) {
      this.selectedVideo = video;
      this.isVideoSelected = true;

      // 使用 path 字段
      const imagePath = video.path || video.name || '';
      const fileName = video.name || '';
      const sampleId = video.id;

      // 判断是否是图片：类型为 image/图片，或者文件名后缀是图片格式
      const isImage = video.type === 'image' ||
                      video.type === '图片' ||
                      /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);

      if (isImage) {
        // 调用后端接口获取图片
        const imageBaseUrl = 'http://10.109.253.71:8001/module2/get_image';
        this.videoUrl = `${imageBaseUrl}?img_path=${encodeURIComponent(imagePath)}`;
        // 设置认知传播信息源的原始图片
        this.cognitiveImageUrl = this.videoUrl;
        this.videoMessage = '图片加载中...';
      } else {
        // 如果是视频类型，使用视频接口
        const baseUrl = 'http://10.109.253.71:5236';
        this.videoUrl = `${baseUrl}/video/${encodeURIComponent(video.name)}`;
        this.videoMessage = '视频加载中...';
      }

      // 获取作战指令
      this.fetchOrders(sampleId);

      console.log('选中数据:', JSON.parse(JSON.stringify(video)), 'isImage:', isImage, 'videoUrl:', this.videoUrl);

      // 保存选中的图片路径和类型到 localStorage
      localStorage.setItem('selectedImageData', JSON.stringify({
        path: imagePath,
        type: video.type,
        name: video.name
      }));
    },
    // 返回选择列表
    backToList() {
      this.isVideoSelected = false;
      this.videoUrl = null;
      this.cognitiveImageUrl = null;
      this.selectedVideo = null;
      this.videoMessage = '请选择数据源';
    },
    // 导航到首页
    navigateHome() {
      this.$router.push('/');
    },
    // 返回上一页
    navigateBack() {
      this.$router.push('/target-detection');
    },
    // 导航到下一页
    navigateNext() {
      this.$router.push('/group-negotiation');
    },
    // 从本地存储加载视频信息
    // loadVideoFromStorage() {
    //   try {
    //     // 获取完整的module1Res对象
    //     const module1ResStr = localStorage.getItem('module1Res');
    //     if (module1ResStr) {
    //       const module1Res = JSON.parse(module1ResStr);

    //       // 提取视频路径并清理
    //       if (module1Res.originalVideoPath) {
    //         this.videoUrl = module1Res.originalVideoPath.replace(/^\"|\"$/g, '').trim();
    //         this.videoMessage = "视频已加载";
    //         console.log('成功加载视频:', this.videoUrl);
    //       }

    //       // 提取关键帧路径并清理
    //       if (module1Res.key_frame_path) {
    //         this.keyFramePath = module1Res.key_frame_path.replace(/^\"|\"$/g, '').trim();
    //         console.log('成功加载关键帧路径:', this.keyFramePath);
    //       }

    //       // 提取设备类型并清理
    //       if (module1Res.deviceType) {
    //         this.deviceType = module1Res.deviceType.replace(/^\"|\"$/g, '').trim();
    //         console.log('成功加载设备类型:', this.deviceType);
    //       }

    //       // 提取视频描述并清理
    //       if (module1Res.video_description) {
    //         this.videoDescription = module1Res.video_description.replace(/^\"|\"$/g, '').trim();
    //         console.log('成功加载视频描述:', this.videoDescription);
    //       }
    //     } else {
    //       console.warn('未找到视频信息');
    //       this.videoMessage = "未找到视频信息";
    //     }
    //   } catch (error) {
    //     console.error('加载视频信息时出错:', error);
    //     this.videoMessage = "视频加载失败";
    //   }
    // },
    // 处理窗口大小变化
    handleResize() {
      this.fullWidth = window.innerWidth;
      this.fullHeight = window.innerHeight;
      // 重新渲染以适应新尺寸
      // this.$nextTick(() => {
      //   this.renderGraph();
      // });
    },
    startNegotiation() {
      console.log("开始先验知识");
      this.isColorized = false;
      this.startInfer();
    },
    async renderGraph() {
      const d3 = require('d3');
      const container = this.$refs.graphContainer;
      const svgEl = this.$refs.graphSvg;
      if (!container || !svgEl) return;

      // 1. 新增：验证数据中的color字段
      console.log("渲染节点数据（含color）：", this.nodes);
      console.log("渲染链接数据（含color）：", this.links);

      const width = container.clientWidth - 40;
      const height = container.clientHeight - 60;

      const svg = d3.select(svgEl)
        .attr('width', width)
        .attr('height', height);

      svg.selectAll('*').remove();

      const g = svg.append('g');

      // 1. 先定义 zoom 行为
      const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', zoomed);

      // 2. 应用 zoom 到 SVG（不是 g 元素！）
      svg.call(zoom);

      // 3. zoom 事件处理函数
      function zoomed() {
        // 在 D3 v5 中必须使用 d3.event.transform
        g.attr('transform', d3.event.transform);
      }

      try {
        // 如果 nodes 为空，直接使用默认节点，不从后端获取所有知识图谱数据
        // module2Res 中的数据应该已经在 loadModule2FromStorage 中加载了
        // 如果 nodes 仍然为空，说明缓存中没有 nodes，使用默认节点

        const response = await axios.get('http://10.109.253.71:8001/module2/knowledge/all')
        const data = response.data

        // 使用从后端获取的nodes和links，如果没有则使用默认数据
        let renderNodes = this.nodes.length ? JSON.parse(JSON.stringify(this.nodes)) : data.knowledge_list.nodes
        // let renderNodes = this.nodes.length ? JSON.parse(JSON.stringify(this.nodes)) : [
        //   { id: '飞机', color: '#87CEEB' },
        //   { id: '战斗机', color: '#FF6B6B' },
        //   { id: '无人机', color: '#95E1D3' },
        //   { id: '运输机', color: '#FFD93D' }
        // ];

        // 清理后端节点的x/y/fx/fy，避免拖拽报错
        renderNodes.forEach(node => {
          delete node.x;
          delete node.y;
          delete node.fx;
          delete node.fy;
        });

        const centerNode = renderNodes.find(node => node.is_center) || renderNodes[0];
          if (centerNode) {
            centerNode.x = width / 2;
            centerNode.y = height / 2;
            // 为中心节点设置更强的固定力
            centerNode.fx = width / 2;
            centerNode.fy = height / 2;
          }

        // if (this.nodes.length) {
        //   // 默认将id为'飞机'的节点放在中央，如果不存在则将第一个节点放在中央
        //   const centerNode = renderNodes.find(node => node.id === '飞机') || renderNodes[0];
        //   if (centerNode) {
        //     centerNode.x = width / 2;
        //     centerNode.y = height / 2;
        //     // 为中心节点设置更强的固定力
        //     centerNode.fx = width / 2;
        //     centerNode.fy = height / 2;
        //   }
        // } else {
        //   const centerNode = renderNodes.find(node => node.is_center) || renderNodes[0];
        //   if (centerNode) {
        //     centerNode.x = width / 2;
        //     centerNode.y = height / 2;
        //     // 为中心节点设置更强的固定力
        //     centerNode.fx = width / 2;
        //     centerNode.fy = height / 2;
        //   }
        // }

        const renderLinks = this.links.length ? this.links : data.knowledge_list.links

        // const renderLinks = this.links.length ? this.links : [
        //   { source: '飞机', target: '战斗机' },
        //   { source: '飞机', target: '无人机' },
        //   { source: '飞机', target: '运输机' }
        // ];

        const simulation = d3.forceSimulation(renderNodes)
          .force('link', d3.forceLink(renderLinks).id(d => d.id).distance(150))
          .force('charge', d3.forceManyBody().strength(-500))
          .force('x', d3.forceX(width / 2))
          .force('y', d3.forceY(height / 2))
          .force('collide', d3.forceCollide().radius(40));

        // 添加箭头标记
        const defs = g.append('defs');
        defs.append('marker')
          .attr('id', 'arrow')
          .attr('orient', 'auto')
          .attr('markerUnits', 'strokeWidth')
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', 36)
          .attr('refY', 0)
          .attr('markerWidth', 8)
          .attr('markerHeight', 8)
          .append('path')
          .attr('d', 'M3 5 L8 0 L3 -5')
          .attr('fill', '#999');

        const link = g.append('g')
          .attr('class', 'links')
          .selectAll('line')
          .data(renderLinks)
          .enter().append('line')
          .attr('stroke', d => {
            // 新增：打印链接color，确认是否读取到
            console.log("链接颜色：", d.color);
            return d.color || '#999';
          }) // 使用链接自身的颜色，如果没有则使用默认颜色
          .attr('stroke-width', 2)
          .attr('marker-end', 'url(#arrow)');

        const nodeGroup = g.append('g')
          .attr('class', 'nodes')
          .selectAll('g')
          .data(renderNodes)
          .enter().append('g')
          .style('cursor', 'move');

        nodeGroup.append('circle')
          .attr('r', 30)
          .attr('fill', d => {
            // 新增：打印节点color，确认是否读取到
            console.log("节点颜色：", d.color);
            return d.color || '#69b3a2';
          }) // 使用节点自身的颜色，如果没有则使用默认颜色
          .attr('stroke', '#333')
          .attr('stroke-width', 2);

        nodeGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', 5)
          .attr("fill", "#6c6c6c") // 浅灰色，提高深色背景下可读性
          .style('font-size', '16px')
          .style('pointer-events', 'none')
          .text(d => d.id);

        // 拖拽功能
        const dragBehavior = d3.drag()
          .on('start', function(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', function(d) {
            const radius = 30;
            d.fx = d3.event.x;
            d.fy = d3.event.y;
          })
          .on('end', function(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          });

        nodeGroup.call(dragBehavior);

        // 节点点击事件
        nodeGroup.on('click', (d) => {
          console.log('节点被点击:', d.id);
          this.$emit('node-click', d);
        });

        simulation.on('tick', () => {
          // 限制节点在边界内
          renderNodes.forEach(d => {
            const radius = 30;
            d.x = d.x;
            d.y = d.y;
          });

          link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

          nodeGroup.attr('transform', d => `translate(${d.x},${d.y})`);
        });
      } catch (error) {
        console.log(error);
      }
    },

    startInfer() {
      // 禁用按钮，直到检测完成并显示信息
      this.isDetecting = true;
      
      // 清空初始描述信息，准备显示细粒度检测结果
      // 不清空中间和右侧的数据，保持默认设置不变
      // 只清空细粒度检测的结果信息
      this.multimodalDetectionInfo = null;

      // 从 localStorage 获取选中的图片数据
      let imgPath = IMG_PATH_URL;
      let imgType = IMG_PATH_URL.split('.').pop();
      try {
        const selectedImageDataStr = localStorage.getItem('selectedImageData');
        if (selectedImageDataStr) {
          const selectedImageData = JSON.parse(selectedImageDataStr);
          if (selectedImageData.path) {
            imgPath = selectedImageData.path;
          }
          if (selectedImageData.type && selectedImageData.type !== 'image' && selectedImageData.type !== '图片') {
            imgType = selectedImageData.type;
          } else {
            imgType = imgPath.split('.').pop();
          }
        }
      } catch (e) {
        console.error('解析selectedImageData出错:', e);
      }

      axios.get('http://10.109.253.71:8001/module2/Inference', {
        params: {
          img_path: imgPath,
          img_type: imgType
        }
      }).then(res => {
        console.log('Backend response:', res.data);
        const data = res.data;
        
        // 保存list接口返回的数据，供查询先验知识按钮使用
        this.listResultData = data;

        // 在"多模态认知传播信息"框内展示图像信息和颜色、形状、轮廓
        // 使用之前存储的imageBase64
        const multimodalContent = {};
        if (this.imageBase64) {
          multimodalContent.image = `data:image/png;base64,${this.imageBase64}`;
        }
        
        // 获取颜色、形状、轮廓信息
        if (data.result && data.result.length > 0 && data.result[0].length > 0) {
          const predictData = data.result[0][0];
          if (predictData.color) {
            multimodalContent.color = predictData.color;
          }
          if (predictData.shape) {
            multimodalContent.shape = predictData.shape;
          }
          if (predictData.outline) {
            multimodalContent.outline = predictData.outline;
          }
        }
        
        // 更新细粒度检测的信息（不替换原有的VIDEO_DESCRIPTION）
        this.multimodalDetectionInfo = Object.keys(multimodalContent).length > 0 ? multimodalContent : null;
        
        // 如果细粒度检测成功，清空初始描述信息
        if (this.multimodalDetectionInfo) {
          this.initialDescriptionInfo = null;
        }
        
        // 保存多模态检测信息到 localStorage，以便页面刷新后恢复
        if (this.multimodalDetectionInfo) {
          localStorage.setItem('multimodalDetectionInfo', JSON.stringify(this.multimodalDetectionInfo));
        }
        // 保存 imageBase64 到 localStorage
        if (this.imageBase64) {
          localStorage.setItem('imageBase64', this.imageBase64);
        }

        // 中间和右侧不展示拿到的信息，保持为空状态
        
        // 检测完成，恢复按钮可用状态
        this.isDetecting = false;
      }).catch(err => {
        console.log(err);
        this.multimodalDetectionInfo = null;
        // 出错时也要重新渲染图谱
        this.$nextTick(() => {
          this.renderGraph();
        });
        // 出错时也要恢复按钮可用状态
        this.isDetecting = false;
      });
    },
    // 从本地缓存加载模块二结果
    loadModule2FromStorage() {
      try {
        const cacheStr = localStorage.getItem('module2Res');
        if (!cacheStr) {
          console.log('未找到 module2Res 缓存');
          // 即使没有 module2Res，也尝试加载多模态检测信息
          this.loadMultimodalDetectionInfo();
          return;
        }
        // 发现缓存 -> 启用颜色显示（页面初次加载如果存在 module2Res 则显示颜色）
        this.isColorized = true;
        console.log('检测到 module2Res 缓存，加载并显示数据');
        const data = JSON.parse(cacheStr);
        
        // 同时保存到 listResultData，供查询先验知识按钮使用
        this.listResultData = data;
        
        // 加载多模态检测信息（图片、颜色、形状、轮廓）
        this.loadMultimodalDetectionInfo();
        // 图谱
        if (data.knowledge_info && data.knowledge_info.length > 0) {
          this.nodes = data.knowledge_info[0].nodes || [];
          this.links = data.knowledge_info[0].links || [];
        }
        // 标签
        if (data.label_info && data.label_info.length > 0 && data.label_info[0].length > 0) {
          const labelData = data.label_info[0][0];
          this.tagInfoList = [
            `小类信息：${labelData.kind || '未知'}`,
            `火力信息：${labelData.firepower || '未知'}`,
            `颜色信息：${labelData.color || '未知'}`,
            `形状信息：${labelData.shape || '未知'}`,
            `尺寸信息：${labelData.size || '未知'}`,
            `动力信息：${labelData.power || '未知'}`
          ];
        }
        // 属性颜色
        if (data.property_color && data.property_color.length > 0 && data.property_color[0].length > 0) {
          this.propertyColors = data.property_color[0][0];
        }
        // 预测（默认白色显示）
        if (data.result && data.result.length > 0 && data.result[0].length > 0) {
          const predictData = data.result[0][0];
          this.predictInfoList = [
            { label: '小类信息：', value: predictData.kind || '未知', color: this.propertyColors.kind || '#000' },
            { label: '火力信息：', value: predictData.firepower || '未知', color: this.propertyColors.firepower || '#000' },
            { label: '颜色信息：', value: predictData.color || '未知', color: this.propertyColors.color || '#000' },
            { label: '形状信息：', value: predictData.shape || '未知', color: this.propertyColors.shape || '#000' },
            { label: '尺寸信息：', value: predictData.size || '未知', color: this.propertyColors.size || '#000' },
            { label: '动力信息：', value: predictData.power || '未知', color: this.propertyColors.power || '#000' },
            { label: '轮廓信息：', value: predictData.outline || '未知', color: this.propertyColors.outline || '#000' },
          ];
        }
        // 准确率：缓存准确率值，但显示取决于计时状态
        if (data.accuracy !== undefined) {
          // this.accuracyRate = (data.accuracy * 100) + '%';
          this.cachedAccuracy = String(data.accuracy * 100).padEnd(5, '0').slice(0, 5) + '%';
        } else {
          this.cachedAccuracy = '—';
        }
        // 注意：准确率的显示由 checkAccuracyTimer 方法控制，这里不直接设置
        // 渲染图谱
        this.$nextTick(() => {
          this.renderGraph();
        });
      } catch (e) {
        console.error('读取 module2Res 缓存失败:', e);
      }
    },
    // 偏差检测按钮：显示计算中，3min后显示准确率
    onBiasDetectClick() {
      this.isColorized = true;
      
      // 如果有缓存的数据，使用缓存的准确率
      if (this.listResultData && this.listResultData.accuracy !== undefined) {
        this.cachedAccuracy = (Math.round(this.listResultData.accuracy * 10000) / 100).toFixed(2) + '%';
      } else if (this.cachedAccuracy === '—' && this.listResultData && this.listResultData.accuracy !== undefined) {
        this.cachedAccuracy = (Math.round(this.listResultData.accuracy * 10000) / 100).toFixed(2) + '%';
      }
      
      // 记录开始时间到localStorage，实现跨页面计时
      const startTime = Date.now();
      localStorage.setItem('module2AccuracyTimerStart', startTime.toString());
      localStorage.setItem('module2CachedAccuracy', this.cachedAccuracy);
      
      // 显示计算中
      this.accuracyRate = '—';
      this.isWaitingForAccuracy = true;
      
      // 清除之前的定时器
      if (this.accuracyTimer) {
        clearTimeout(this.accuracyTimer);
      }
      
      // 计算剩余时间
      const remainingTime = 180000; // 3分钟 = 180000毫秒
      
      // 3分钟后显示准确率
      this.accuracyTimer = setTimeout(() => {
        this.accuracyRate = this.cachedAccuracy;
        this.isWaitingForAccuracy = false;
        this.accuracyTimer = null;
        // 清除localStorage中的计时信息
        localStorage.removeItem('module2AccuracyTimerStart');
        localStorage.removeItem('module2CachedAccuracy');
      }, remainingTime);
    },
    
    // 检查准确率计时状态（用于页面加载时恢复计时）
    checkAccuracyTimer() {
      try {
        const timerStartStr = localStorage.getItem('module2AccuracyTimerStart');
        const cachedAccuracyStr = localStorage.getItem('module2CachedAccuracy');
        
        if (!timerStartStr || !cachedAccuracyStr) {
          // 没有计时信息，检查是否有缓存的准确率
          // 优先使用this.cachedAccuracy（从loadModule2FromStorage加载的）
          // 如果没有，尝试从module2Res读取
          if (!this.cachedAccuracy || this.cachedAccuracy === '—') {
            try {
              const module2ResStr = localStorage.getItem('module2Res');
              if (module2ResStr) {
                const module2Res = JSON.parse(module2ResStr);
                if (module2Res.accuracy !== undefined) {
                  this.cachedAccuracy = String(module2Res.accuracy * 100).padEnd(5, '0').slice(0, 5) + '%';
                }
              }
            } catch (e) {
              console.warn('从module2Res读取准确率失败:', e);
            }
          }
          
          if (this.cachedAccuracy && this.cachedAccuracy !== '—') {
            // 如果有缓存的准确率且没有计时，直接显示
            this.accuracyRate = this.cachedAccuracy;
            this.isWaitingForAccuracy = false;
          } else {
            this.accuracyRate = '—';
            this.isWaitingForAccuracy = false;
          }
          return;
        }
        
        const timerStart = parseInt(timerStartStr, 10);
        const elapsed = Date.now() - timerStart;
        const remainingTime = 180000 - elapsed; // 3分钟 = 180000毫秒
        
        // 恢复缓存的准确率值
        this.cachedAccuracy = cachedAccuracyStr;
        
        if (remainingTime > 0) {
          // 计时未满3分钟，继续显示"计算中"并继续计时
          this.accuracyRate = '—';
          this.isWaitingForAccuracy = true;
          
          // 清除之前的定时器
          if (this.accuracyTimer) {
            clearTimeout(this.accuracyTimer);
          }
          
          // 继续计时
          this.accuracyTimer = setTimeout(() => {
            this.accuracyRate = this.cachedAccuracy;
            this.isWaitingForAccuracy = false;
            this.accuracyTimer = null;
            // 清除localStorage中的计时信息
            localStorage.removeItem('module2AccuracyTimerStart');
            localStorage.removeItem('module2CachedAccuracy');
          }, remainingTime);
        } else {
          // 计时已满3分钟，直接显示准确率
          this.accuracyRate = this.cachedAccuracy;
          this.isWaitingForAccuracy = false;
          // 清除localStorage中的计时信息
          localStorage.removeItem('module2AccuracyTimerStart');
          localStorage.removeItem('module2CachedAccuracy');
        }
      } catch (e) {
        console.error('检查准确率计时状态失败:', e);
        // 出错时，如果有缓存的准确率，直接显示
        if (this.cachedAccuracy && this.cachedAccuracy !== '—') {
          this.accuracyRate = this.cachedAccuracy;
          this.isWaitingForAccuracy = false;
        }
      }
    },
    
    // 查询先验知识按钮
    queryPriorKnowledge() {
      if (!this.listResultData) {
        console.warn('请先进行细粒度检测');
        return;
      }
      
      this.isQueryingPriorKnowledge = true;
      
      // 中间图谱和右侧预测信息显示"计算中..."
      // 2秒后显示结果
      setTimeout(() => {
        const data = this.listResultData;
        
        // 处理图谱数据
        if (data.knowledge_info && data.knowledge_info.length > 0) {
          this.nodes = data.knowledge_info[0].nodes || [];
          this.links = data.knowledge_info[0].links || [];
        }

        // 处理标签信息
        if (data.label_info && data.label_info.length > 0 && data.label_info[0].length > 0) {
          const labelData = data.label_info[0][0];
          this.tagInfoList = [
            `小类信息：${labelData.kind || '未知'}`,
            `火力信息：${labelData.firepower || '未知'}`,
            `颜色信息：${labelData.color || '未知'}`,
            `形状信息：${labelData.shape || '未知'}`,
            `尺寸信息：${labelData.size || '未知'}`,
            `动力信息：${labelData.power || '未知'}`
          ];
        }

        // 处理属性颜色
        if (data.property_color && data.property_color.length > 0 && data.property_color[0].length > 0) {
          this.propertyColors = data.property_color[0][0];
        }

        // 处理预测信息
        if (data.result && data.result.length > 0 && data.result[0].length > 0) {
          const predictData = data.result[0][0];
          this.predictInfoList = [
            { label: '小类信息：', value: predictData.kind || '未知', color: this.propertyColors.kind || '#000' },
            { label: '火力信息：', value: predictData.firepower || '未知', color: this.propertyColors.firepower || '#000' },
            { label: '颜色信息：', value: predictData.color || '未知', color: this.propertyColors.color || '#000' },
            { label: '形状信息：', value: predictData.shape || '未知', color: this.propertyColors.shape || '#000' },
            { label: '尺寸信息：', value: predictData.size || '未知', color: this.propertyColors.size || '#000' },
            { label: '动力信息：', value: predictData.power || '未知', color: this.propertyColors.power || '#000' },
            { label: '轮廓信息：', value: predictData.outline || '未知', color: this.propertyColors.outline || '#000' },
          ];
          // 将预测信息存入localStorage，供群体协商界面使用
          localStorage.setItem('predictInfoList', JSON.stringify(this.predictInfoList));
          localStorage.setItem('module2Res', JSON.stringify(data));
          console.log('预测信息、模块2返回值已存入localStorage');
        }
        
        // 缓存准确率（但不显示，等待点击偏差检测按钮）
        if (data.accuracy !== undefined) {
          this.cachedAccuracy = (Math.round(data.accuracy * 10000) / 100).toFixed(2) + '%';
        }

        // 重新渲染图谱
        this.$nextTick(() => {
          this.renderGraph();
        });
        
        this.isQueryingPriorKnowledge = false;
      }, 2000); // 2秒后显示结果
    },
    
    // 加载图片base64数据
    loadImageBase64() {
      // 先尝试从 localStorage 加载
      const cachedImageBase64 = localStorage.getItem('imageBase64');
      if (cachedImageBase64) {
        this.imageBase64 = cachedImageBase64;
        console.log('从缓存加载 imageBase64');
        return;
      }
      
      // 如果缓存中没有，则从接口获取
      axios.get('http://10.109.253.71:8001/module2/get_image_base64', {
        params: {
          img_path: `${IMG_PATH_URL}`
        }
      }).then(res => {
        console.log('Image base64 loaded:', res.data);
        // 存储图片信息，不在界面上显示
        // 接口返回格式: {"result": ["iVBORw..", "success"]}
        if (res.data && res.data.result && Array.isArray(res.data.result) && res.data.result.length > 0) {
          // 从result数组的第一个元素获取base64字符串
          const base64String = res.data.result[0];
          // 移除可能的data URI前缀
          this.imageBase64 = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
          // 保存到 localStorage
          localStorage.setItem('imageBase64', this.imageBase64);
        } else if (res.data && res.data.image_base64) {
          // 兼容其他可能的格式
          this.imageBase64 = res.data.image_base64;
          localStorage.setItem('imageBase64', this.imageBase64);
        } else if (res.data && typeof res.data === 'string') {
          // 如果返回的就是base64字符串
          this.imageBase64 = res.data.replace(/^data:image\/[a-z]+;base64,/, '');
          localStorage.setItem('imageBase64', this.imageBase64);
        }
      }).catch(err => {
        console.error('加载图片base64失败:', err);
      });
    },
    
    // 加载多模态检测信息（图片、颜色、形状、轮廓）
    loadMultimodalDetectionInfo() {
      try {
        const cachedInfo = localStorage.getItem('multimodalDetectionInfo');
        if (cachedInfo) {
          const info = JSON.parse(cachedInfo);
          // 如果图片信息存在，需要从 imageBase64 重新构建图片 URL
          if (info.image && this.imageBase64) {
            info.image = `data:image/png;base64,${this.imageBase64}`;
          }
          this.multimodalDetectionInfo = info;
          // 如果加载了细粒度检测信息，则清空初始描述信息
          if (this.multimodalDetectionInfo) {
            this.initialDescriptionInfo = null;
            console.log('从缓存加载多模态检测信息，已清空初始描述信息');
          }
          console.log('从缓存加载多模态检测信息:', this.multimodalDetectionInfo);
        } else {
          // 如果没有细粒度检测信息缓存，确保显示初始描述信息
          // 如果初始描述信息还没有加载，尝试加载
          if (!this.initialDescriptionInfo) {
            this.loadInitialDescriptionInfo();
          }
        }
      } catch (e) {
        console.error('加载多模态检测信息失败:', e);
      }
    },
    // 从 LocalStorage 加载视频
    loadVideoFromStorage() {
      try {
        // 先获取整个module1Res对象
        const module1ResStr = localStorage.getItem('module1Res');
        console.log("从 LocalStorage 读取 'module1Res':", module1ResStr ? '存在' : '不存在');

        if (module1ResStr) {
          const module1Res = JSON.parse(module1ResStr);
          // 从对象中获取originalVideoPath
          const videoPath = module1Res.originalVideoPath;
          console.log("从 module1Res 中获取 originalVideoPath:", videoPath);

          // 清理可能存在的空格和反引号
          const cleanedVideoPath = videoPath ? videoPath.trim().replace(/^[`'"\s]+|[`'"\s]+$/g, '') : null;

          if (cleanedVideoPath && cleanedVideoPath !== '无原视频路径') {
            this.videoUrl = cleanedVideoPath;
          } else {
            this.videoMessage = '未在 module1Res 中找到有效 "originalVideoPath"。';
            console.warn(this.videoMessage);
          }

          // 提取视频描述并清理
          if (module1Res.video_description) {
            this.VIDEO_DESCRIPTION = module1Res.video_description.replace(/^"|"$/g, '').trim();
            console.log('成功加载视频描述:', this.VIDEO_DESCRIPTION);
          }
        } else {
          this.videoMessage = '未在 LocalStorage 中找到 "module1Res"。';
          console.warn(this.videoMessage);
        }
      } catch (e) {
        console.error('加载视频失败:', e);
        this.videoMessage = '加载视频时出错: ' + e.message;
      }
    },
    
    // 加载初始描述信息（场景、目标、行为、总结）
    loadInitialDescriptionInfo() {
      try {
        // 先检查是否有细粒度检测信息的缓存
        const cachedMultimodalInfo = localStorage.getItem('multimodalDetectionInfo');
        if (cachedMultimodalInfo) {
          // 如果有缓存，说明已经进行过细粒度检测，不加载初始描述信息
          console.log('检测到细粒度检测信息缓存，跳过加载初始描述信息');
          return;
        }
        
        const module1ResStr = localStorage.getItem('module1Res');
        if (!module1ResStr) {
          console.warn('未找到 module1Res，无法加载初始描述信息');
          return;
        }
        
        const module1Res = JSON.parse(module1ResStr);
        if (!module1Res.video_description) {
          console.warn('module1Res 中没有 video_description');
          return;
        }
        
        // 解析video_description，提取场景、目标、行为、总结信息
        const description = module1Res.video_description.replace(/^"|"$/g, '').trim();
        const descriptionInfo = this.parseDescriptionInfo(description);
        
        // 只有在没有细粒度检测信息时才显示初始信息
        if (!this.multimodalDetectionInfo && descriptionInfo) {
          this.initialDescriptionInfo = descriptionInfo;
          console.log('成功加载初始描述信息:', this.initialDescriptionInfo);
        }
      } catch (e) {
        console.error('加载初始描述信息失败:', e);
      }
    },
    
    // 解析描述信息，提取场景、目标、行为、总结
    parseDescriptionInfo(description) {
      if (!description || typeof description !== 'string') {
        return null;
      }
      
      const lines = description.split(/\r?\n/).filter(line => line.trim() !== '');
      const info = {
        scene: null,
        target: null,
        behavior: null,
        summary: null
      };
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        // 匹配格式：标签：内容
        const match = trimmedLine.match(/^([^：:]+)[：:]\s*(.*)$/);
        if (match) {
          const label = match[1].trim();
          const value = match[2].trim();
          
          if (label === '场景') {
            info.scene = value;
          } else if (label === '目标') {
            info.target = value;
          } else if (label === '行为') {
            info.behavior = value;
          } else if (label === '总结') {
            info.summary = value;
          }
        }
      });
      
      // 如果至少有一个字段有值，则返回info对象
      if (info.scene || info.target || info.behavior || info.summary) {
        return info;
      }
      
      return null;
    },

    // 处理视频加载错误
    handleVideoError(e) {
      console.error("视频加载失败:", e);
      this.videoMessage = "视频加载失败，请检查 LocalStorage 中的 URL 是否正确。";
      this.videoUrl = null;
    },
    // 新增：下载JSON数据的函数
    async downloadJsonData() {
      try {
        const response = await axios.get('http://10.109.253.71:8001/module2/export', {
          responseType: 'blob', // 关键：告诉 axios 期望一个 Blob
          headers: {
            'Accept': 'application/zip' // 明确声明接受的MIME类型
          }
        });

        console.log("文件导出：", response)

        // 验证响应状态码
        if (response.status !== 200) {
          throw new Error(`服务器返回异常状态码: ${response.status}`);
        }

        // 解析文件名（优先从Content-Disposition获取）
        let fileName = 'results.zip';
        const contentDisposition = response.headers['content-disposition'];
        console.log("contentDisposition=", contentDisposition)
        if (contentDisposition && contentDisposition.includes('filename=')) {
          const matches = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (matches && matches[1]) {
            fileName = matches[1].replace(/['"]/g, '');
            // 处理URL编码的文件名
            fileName = decodeURIComponent(fileName);
          }
        }

        // 验证文件类型
        const contentType = response.headers['content-type'];
        if (!contentType || !contentType.includes('application/zip')) {
          throw new Error('服务器返回非ZIP文件格式');
        }

        // 从 response 中创建 Blob
        const blob = new Blob([response.data], { type: 'application/zip' });

        // 创建一个临时的 URL
        const downloadUrl = window.URL.createObjectURL(blob);

        // 创建一个 <a> 标签来触发下载
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', fileName);

        // 将 <a> 标签添加到 DOM 中 (在某些浏览器中是必需的)
        document.body.appendChild(link);

        // 触发点击
        link.click();

        // 清理
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      } catch (error) {
        console.error('获取并下载JSON失败:', error);
      }
    }
  }
};
</script>

<style>
/* 1. 全局样式 */
/* 1. 全局和背景 */
.section {
  width: 100%;
  min-height: 100vh;
  color: #fff;
  font-family: "Helvetica Neue", "Microsoft YaHei", sans-serif;
  z-index: 2;
  padding: 10px;
  margin: 0;
  background-color: transparent;
  display: flex;
  flex-direction: column;
}

body {
  background-color: #0a1120;
  color: #e8f4ff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  margin: 0;
  padding: 0;
}

.img_box {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('~@/assets/images/step2/bg.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center top;
  opacity: 1;
  z-index: -1;
}

.bg-dark {
  background-color: #0a1120 !important;
}

.text-white {
  color: #e8f4ff !important;
}

/* 2. 顶部标题栏 */
/* 2. 顶部标题栏 */
.header-bar {
  width: 100%;
  flex-shrink: 0;
  padding: 0 20px;
  height: 60px;
}

.header-title {
  font-size: calc(1.2vw + 0.8rem);
  color: #00e5ff;
  font-weight: bolder;
  letter-spacing: 0.1em;
  margin: 0;
  text-shadow: 0 0 5px #00e5ff;
}

.header-btn {
  background: none;
  border: none;
  cursor: pointer;
  width: 120px;
  height: 40px;
  color: #fff;
  font-size: 14px;
  font-weight: 400;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  margin: 0 5px;
  width: 110px;
  height: 40px;
  font-family: 'DOUYUFont';
  font-style: normal;
text-decoration: none;
/* text-align: left; */
}

.btn-home {
  background-image: url('~@/assets/images/step4/首页按键.png');
}

.btn-back {
  background-image: url('~@/assets/images/step1/-s-按钮-蓝色-1.png');
}

.btn-next {
  background-image: url('~@/assets/images/step1/-s-按钮-蓝色-1.png');
}

/* 3. 核心内容区 */
.content-row {
  flex-grow: 1;
  width: 100%;
  max-width: 100%;
  margin: 0;
}

/* 三列通用高度 */
.design-left-column, .middle-column, .right-column {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px); /* 减去顶部栏高度 */
  padding: 0 !important;
}

.design-left-column {
  width: 25%;
  gap: 15px;
}

.middle-column {
  width: 45%;
  gap: 20px;
}

.right-column {
  width: 30%;
  gap: 8px;
}

/* 面板通用样式 */
[class^="panel-"]:not(.panel-right-button):not(.panel-right-accuracy), .design-module {
  width: 100%;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  padding: 20px 30px 30px 30px;
  display: flex;
  flex-direction: column;
}

/* 特定面板的高度和边距 */
.panel-left, .design-module {
  flex-grow: 1;
  height: 100%;
  background-image: url('~@/assets/images/step1/-s-弹框-选择数据.png');
}

/* 右侧标签信息面板 */
.panel-right-tag {
  flex-shrink: 0;
  background-image: url('~@/assets/images/step1/弹框-偏差检测结果.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  margin-bottom: 15px;
  padding: 0;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  width: 100%;
}

/* 右侧预测信息面板 */
.panel-right-predict {
  flex-shrink: 0;
  background-image: url('~@/assets/images/step1/弹框-偏差检测结果.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  margin-bottom: 8px;
  padding: 0;
  display: flex;
  flex-direction: column;
  min-height: 530px;
  width: 100%;
  margin-top: 8px;
}

/* 偏差检测准确率面板 */
.panel-right-accuracy {
  flex-shrink: 0;
  width: 100%;
  background-image: url('~@/assets/images/step5/底部多主体和不一致的背景.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  margin-bottom: 0;
  padding: 20px 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  margin-top: 8px;
}

/* 结果导出按钮区域 */
.panel-right-button {
  flex-shrink: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px 0;
  min-height: 70px;
  background: none;
  margin-top: 8px;
}

/* 兼容旧样式 */
.panel-right-top {
  height: 55%;
  flex-shrink: 0;
  background-image: url('~@/assets/images/step1/弹框-偏差检测结果.png');
  margin-bottom: 15px;
}

.panel-right-bottom {
  flex-grow: 1;
  height: 100%;
  background-image: url('~@/assets/images/step1/-s-弹窗-偏差检测准确率.png');
}

.panel-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 标签信息和预测信息专用的 panel-content 样式 - 铺满父元素 */
.panel-right-tag .panel-content-right,
.panel-right-predict .panel-content-right {
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 0 !important;
  margin: 0;
  min-height: 0;
}

/* 面板标题 */
.panel-header {
  padding-left: 50px !important;
  
  
}
.panel-header, .design-module-label {
  width: 94px;
  height: 24px;
  background-image: url('~@/assets/images/step1/-s-二级标题.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  flex-shrink: 0;
  color: #fff;
  font-family: "DOUYUFont";
  font-weight: 400;
  font-size: 14px;
  font-style: normal;
  text-decoration: none;
  text-align: left;
  box-shadow: 3px 3px 2px 0px rgba(0, 255, 255, 0.2);
  padding: 0 20px;
  margin: 0;
  margin-bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 5px;
  box-sizing: border-box;
}

.panel-header span {
  transform: translateY(5px);
}

/* 设计模块内的标题需要特殊处理，因为没有 span 包裹 */
.design-module .panel-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  /* padding-top: 5px;
  padding-bottom: 3px; */
  box-sizing: border-box;
  line-height: 17px;
  height: 24px;
}

/* 设计模块特定样式 */
.design-module {
  position: relative;
  padding-top: 15px;
  border-radius: 5px;
}

.design-module-label {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  height: 35px;
  background-image: url('~@/assets/images/step1/-s-二级标题.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  margin-bottom: 0;
}

.design-module-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: "DingTalk-JinBuTi";
  font-weight: 400;
  font-size: 18px;
  font-style: normal;
  text-decoration: none;
  text-align: justify;
}

/* 视频模块样式 */
.orders-module {
  flex-basis: 20%;
}

.orders-module .design-module-content {
  padding: 15px;
  height: 100%;
}

.orders-text-box {
  width: 100%;
  height: 100%;
  min-height: 120px;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 229, 255, 0.3);
  border-radius: 4px;
  color: #eee;
  font-size: 0.95rem;
  line-height: 1.6;
  padding: 12px 15px;
  white-space: pre-wrap;
  word-break: break-all;
}

.orders-text-box::-webkit-scrollbar { width: 6px; }
.orders-text-box::-webkit-scrollbar-thumb { background: #00e5ff; border-radius: 3px; }
.orders-text-box::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.3); }

.video-module {
  flex-basis: unset;
  height: 250px;
  min-height: 250px;
  max-height: 400px;
}

.video-content-wrapper {
  padding: 15px;
  height: 100%;
  background-image: url('~@/assets/images/step1/-s-框-小视频.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.video-display {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 4px;
}

/* 图片展示样式 */
.video-display-container img.video-display {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* 视频选择列表样式 */
.video-select-list {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 5px;
}

.video-list-header {
  color: #00e5ff;
  font-size: 14px;
  margin-bottom: 8px;
  text-align: center;
}

.video-list-container {
  flex: 1;
  overflow-y: auto;
}

.video-select-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 5px;
  background-color: rgba(0, 100, 150, 0.2);
  border: 1px solid rgba(0, 229, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
  color: #fff;
  font-size: 14px;
  transition: all 0.3s;
}

.video-select-item:hover {
  background-color: rgba(0, 229, 255, 0.2);
  border-color: #00e5ff;
}

.video-select-item .video-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.video-select-item .video-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-select-item .video-type {
  font-size: 12px;
  color: #88aabb;
  margin-top: 2px;
}

.video-select-item .selector-circle {
  width: 14px;
  height: 14px;
  border: 2px solid #00e5ff;
  border-radius: 50%;
  background-color: transparent;
  flex-shrink: 0;
  margin-left: 10px;
}

.video-select-item:hover .selector-circle {
  background-color: rgba(0, 229, 255, 0.3);
}

/* 视频展示容器 */
.video-display-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.video-display-container .video-display {
  flex: 1;
}

.btn-back-list {
  position: static;
  margin-top: 10px;
  margin-left: 10px;
  background-image: url('~@/assets/images/step1/-s-按钮-蓝色-1.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-color: transparent;
  border: none;
  cursor: pointer;
  width: 100px;
  height: 30px;
  color: #fff;
  font-family: 'DOUYUFont', sans-serif;
  font-size: 11px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 文本框框架 */
.video-frame {
  width: 95%;
  height: 250px;
  background-image: url('~@/assets/images/step1/-s-框-小视频.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  padding: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.placeholder-text {
  color: #88a;
  font-size: 1rem;
  text-align: center;
  padding: 20px;
}

/* 文本模块样式 */
.text-module-left {
  flex-basis: 45%;
  display: flex;
  flex-direction: column;
}

.fixed-left-text {
  position: relative;
  width: 100%;
  height: 480px;
  align-self: flex-start;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.fixed-left-text .design-module-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.multimodal-image-fixed {
  flex-shrink: 0;
  padding: 15px;
  padding-bottom: 0;
  overflow: hidden;
}

/* 认知传播信息源图片样式 */
.cognitive-image-container {
  flex-shrink: 0;
  padding: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(198, 244, 255, 0.2);
  margin-bottom: 10px;
}

.cognitive-image-label {
  color: #c6f4ff;
  font-size: 12px;
  margin-bottom: 8px;
  font-family: 'DOUYUFont';
}

.cognitive-source-image {
  width: 100%;
  max-height: 180px;
  object-fit: contain;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.3);
}

.text-scrollable {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  white-space: normal;
  word-wrap: break-word;
}

.multimodal-image {
  max-width: 85%;
  height: auto;
  border-radius: 4px;
  display: block;
  margin: 0 auto;
}

.multimodal-info-item {
  margin-bottom: 10px;
  line-height: 1.6;
  color: #e8f4ff;
  font-family: "DingTalk-JinBuTi";
  font-weight: 400;
  font-size: 18px;
  font-style: normal;
  text-decoration: none;
  text-align: justify;
}

.multimodal-info-item .info-label {
  font-weight: 400;
  color: #e8f4ff;
}

.text-scrollable::-webkit-scrollbar {
  width: 6px;
}

.text-scrollable::-webkit-scrollbar-track {
  background: rgba(10, 25, 50, 0.3);
  border-radius: 4px;
}

.text-scrollable::-webkit-scrollbar-thumb {
  background: #00e5ff;
  border-radius: 4px;
}

.text-scrollable::-webkit-scrollbar-thumb:hover {
  background: #00b8d4;
}

/* 知识图谱容器样式 */
.graph-container {
  position: relative;
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 229, 255, 0.3);
  padding: 15px;
  flex-grow: 1;
}

.graph-title {
  color: #00e5ff;
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 15px;
  text-align: center;
}

/* 信息列表样式 */
.description-box {
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

/* 标签信息和预测信息的内容框样式 - 无边框，占满父元素 */
.tag-content,
.predict-content {
  flex: 1;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 15px 20px !important;
  background-color: transparent;
  border: none;
  box-shadow: none;
  border-radius: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  font-family: "DingTalk-JinBuTi";
  font-weight: 400 !important;
  font-size: 16px !important;
  font-style: normal;
  text-decoration: none;
  text-align: justify;
}

.description-box::-webkit-scrollbar {
  width: 6px;
}

.description-box::-webkit-scrollbar-thumb {
  background: #00e5ff;
  border-radius: 3px;
}

.description-box::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-family: "DingTalk-JinBuTi";
  font-weight: 400;
  font-size: 16px;
}

.info-list li {
  position: relative;
  padding: 10px 0;
  margin: 0;
  line-height: 1.6;
  color: #e8f4ff;
  font-family: "DingTalk-JinBuTi" !important;
  font-weight: 400 !important;
  font-size: 16px !important;
  padding-left: 0;
  padding-right: 0;
}

/* 移除左侧黄色条 */
.info-list li:before {
  display: none;
}

/* 所有列表项底部添加分隔线 */
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

/* 第一项（小类信息）使用黄色线 */
.info-list li.first-item::after {
  background-image: url('~@/assets/images/step2/yellowline.png');
}

/* 所有项都需要底部分隔线，包括最后一项 */

.text-red {
  color: #ff4d4d;
  font-weight: bold;
  font-size: 0.95rem;
}

/* 准确率显示 */
.accuracy-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 15px;
}

.accuracy-label {
  color: #fff;
  font-family: 'DOUYUFont';
  font-weight: 400;
  font-size: 16px;
  font-style: normal;
  text-decoration: none;
  margin-bottom: 12px;
}

.accuracy-value {
  font-size: 34px;
  font-weight: 700;
  color: #00e5ff;
  text-shadow: 0 0 10px #00e5ff, 0 0 20px rgba(0, 229, 255, 0.5);
  letter-spacing: 0.05em;
  white-space: nowrap;
}

/* 兼容旧样式 */
.accuracy-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  margin: 15px 0;
  border-bottom: 1px solid rgba(0, 229, 255, 0.2);
}

.metric-box {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3.5rem;
  font-weight: bold;
  color: #00e5ff;
  text-shadow: 0 0 10px #00e5ff;
}

/* 按钮样式 */
.button-container {
  flex-basis: 10%;
  min-height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  gap: 15px;
}

.btn-start-detect{
  background: none;
  border: none;
  cursor: pointer;
  width: 250px;
  height: 100px;
  background-image: url('~@/assets/images/step1/-s-按钮-开始测试.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;

  color: #fff;
  font-family: "DOUYUFont";
  font-weight: 400;
  font-size: 14px;
  font-style: normal;
  text-decoration: none;
  display: inline-flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 8px;
  line-height: 1;

  &:disabled {
    filter: grayscale(80%);
    cursor: not-allowed;
  }

  span {
    margin-left: 8px;
    transform: translateY(8px);
  }
}

.btn-start-detect:disabled {
  filter: grayscale(80%);
  cursor: not-allowed;
}

.btn-start-detect span {
  margin-left: 8px;
}

.btn-export-result {
  background-image: url('~@/assets/images/step5/按钮-结果导出.png');
  background-repeat: no-repeat;
  background-color: transparent;
  background-size: 100% 100%;
  background-position: center;
  border: none;
  cursor: pointer;
  width: 250px;
  height: 100px;
  font-family: DOUYUFont;
  color: #FFFFFF;
  font-weight: 400;
  font-size: 23px;
  font-style: normal;
  text-decoration: none;
  display: inline-flex;
  justify-content: flex-end;
  align-items: flex-end;
  padding-bottom: 28px;
  transition: all 0.3s ease;
  position: relative;
  padding-right: 20px;
}

.btn-export-result:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

/* 兼容旧样式 */
.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px 0 10px 0;
  margin-top: auto;
}

.btn-export-result:disabled {
  filter: grayscale(80%);
  cursor: not-allowed;
}

/* 加载遮罩样式 */
/*（全局遮罩已移除，不再使用）*/

.text-muted {
  color: #888888;
  font-style: italic;
}

.video-description-text {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.6;
  margin: 0;
  padding: 10px 0;
}

/* 响应式调整 */
@media (max-width: 1400px) {
  .video-frame {
    height: 200px;
  }

  .metric-box {
    font-size: 2.8rem;
  }

  [class^="panel-"] {
    padding: 20px;
  }

  .panel-header {
    height: 35px;
  }
}

@media (max-width: 1200px) {
  .design-left-column, .middle-column, .right-column {
    height: auto;
    margin-bottom: 20px;
  }

  .content-row {
    flex-direction: column;
    align-items: center;
  }

  .design-left-column, .right-column {
    width: 80% !important;
    max-width: 80% !important;
  }

  .middle-column {
    width: 90% !important;
    max-width: 90% !important;
  }

  .right-column {
    min-height: 600px;
  }

  .panel-left { min-height: 400px; }
  .panel-right-top { min-height: 250px; height: auto; }
  .panel-right-bottom { min-height: 150px; }
}

/* 新增：偏差检测按钮容器与样式，以及局部加载样式 */
.panel-right-bias {
  flex-shrink: 0;
  /* flex-basis: 10%; */
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 0 5px 0;
  background: none;
  min-height: 40px;
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
  background-color: transparent;
  color: #fff;
  font-family: 'DOUYUFont';
  font-weight: 400;
  font-size: 14px;
  font-style: normal;
  text-decoration: none;
  display: inline-flex;
  justify-content: flex-end;
  align-items: flex-end;
  padding-right: 20px;
  padding-bottom: 35px;
  line-height: 1;
  margin-bottom: -45px;
  margin-top: -25px;
}

.btn-bias-detect:disabled {
  filter: grayscale(80%);
  cursor: not-allowed;
}

/* 按钮样式与“加载先验知识”一致，不额外定义 hover 效果 */

.panel-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(10, 17, 32, 0.4);
  color: #00e5ff;
  font-weight: bold;
}
</style>
