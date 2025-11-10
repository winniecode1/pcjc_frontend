<template>
  <div class="container-fluid bg-dark text-white min-vh-100">
    <!-- 顶部导航栏 -->
    <b-row class="header-bar align-item-s-center no-gutters">
      <b-col cols="4" class="d-flex align-items-center">
        <button class="header-btn btn-home" @click="navigateHome">首页</button>
        <button class="header-btn btn-back" @click="navigateBack">返回</button>
      </b-col>
      <b-col cols="4" class="d-flex justify-content-center align-items-center">
        <h1 class="header-title">先验知识和偏差检测模型</h1>
      </b-col>
      <b-col cols="4" class="d-flex justify-content-end align-items-center">
        <button class="header-btn btn-next" @click="navigateNext">下一步</button>
      </b-col>
    </b-row>

    <!-- 加载遮罩 -->
    <div v-if="isLoading" class="loading-mask">
      <div class="loading-spinner">加载中...</div>
    </div>

    <!-- 主要内容区域 -->
    <div class="row content-row">
      <!-- 左侧视频和按钮区域 -->
      <div class="col-md-3 left-column">
        <div class="panel-left h-100">
          <div class="panel-header">
            <span>视频演示</span>
          </div>
          <div class="panel-content">
            <div class="video-frame mb-4">
              <video v-if="videoUrl" :src="videoUrl" controls class="video-display" @error="handleVideoError"></video>
              <div v-else class="placeholder-text">
                {{ videoMessage }}
              </div>
            </div>
            <div class="panel-header">
              <span>视频理解内容</span>
            </div>
            <div class="panel-content">
            <div class="description-box">
              <ul class="info-list">
                <p v-if="VIDEO_DESCRIPTION" class="video-description-text">{{ VIDEO_DESCRIPTION }}</p>
                <p v-else class="text-muted">暂无视频描述信息</p>
              </ul>
            </div>
          </div>
            <div class="action-buttons">
              <button @click="startNegotiation" class="btn-start-detect" :disabled="isLoading">
                <img src="~@/assets/images/step1/-s-按钮-开始测试.png" alt="开始" width="24" height="24">
                <span>开始检测</span>
              </button>
              <button @click="downloadJsonData" class="btn-export-result mt-3" :disabled="isLoading">
                导出结果
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间知识图谱区域 -->
      <div class="col-md-6 middle-column">
        <div class="panel-left h-100">
          <div class="panel-header">
            <span>知识图谱</span>
          </div>
          <div class="panel-content">
            <div class="graph-container" ref="graphContainer" style="height: calc(100% - 40px);">
              <div class="graph-title">知识图谱先验信息</div>
              <svg ref="graphSvg" style="width: 100%; height: calc(100% - 30px);"></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧标签和预测信息区域 -->
      <div class="col-md-3 right-column">
        <div class="panel-right-top">
          <div class="panel-header">
            <span>标签信息</span>
          </div>
          <div class="panel-content">
            <div class="description-box">
              <ul class="info-list">
                <li v-for="(item, idx) in tagInfoList" :key="'tag-' + idx">{{ item }}</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="panel-right-bottom">
          <div class="panel-header">
            <span>预测信息</span>
          </div>
          <div class="panel-content">
            <div class="description-box mb-4">
              <ul class="info-list">
                <li v-for="(item, idx) in predictInfoList" :key="'pre-' + idx">
                  <span v-if="typeof item === 'object'">
                    {{ item.label }}
                    <span :style="{ color: item.color || '#00e5ff' }">{{ item.value }}</span>
                  </span>
                  <span v-else>{{ item }}</span>
                </li>
              </ul>
            </div>
            <div class="panel-header header-accuracy">偏差检测准确率</div>
            <div class="metric-box">
              <template v-if="accuracyRate !== '—'">
                {{ accuracyRate }}
              </template>
              <template v-else>
                N/A
              </template>
            </div>
          </div>
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
          originalImageURL: null,
          tagInfoList: ["小类信息", "火力信息", "颜色信息", "形状信息", "尺寸信息", "动力信息"],
          predictInfoList: ["小类信息", "火力信息", "颜色信息", "形状信息", "尺寸信息", "动力信息"],
          propertyColors: {}, // 用于存储属性颜色
          isLoading: false,
          accuracyRate: '—',
          finalResult: null,
          nodes: [], // 用于存储后端返回的节点数据
          links: [],  // 用于存储后端返回的链接数据
          // 视频相关数据
          videoUrl: null,
          videoMessage: '正在从 LocalStorage 加载视频...',
          // 视频描述信息
          VIDEO_DESCRIPTION: ''
        };
      },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    this.renderGraph();
    // 页面加载时加载视频
    this.loadVideoFromStorage();
    // this.downloadJsonData();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    // 导航到首页
    navigateHome() {
      this.$router.push('/');
    },
    // 返回上一页
    navigateBack() {
      this.$router.back();
    },
    // 导航到下一页
    navigateNext() {
      this.$router.push('/group-negotiation');
    },
    // 从本地存储加载视频信息
    loadVideoFromStorage() {
      try {
        // 获取完整的module1Res对象
        const module1ResStr = localStorage.getItem('module1Res');
        if (module1ResStr) {
          const module1Res = JSON.parse(module1ResStr);
          
          // 提取视频路径并清理
          if (module1Res.originalVideoPath) {
            this.videoUrl = module1Res.originalVideoPath.replace(/^\"|\"$/g, '').trim();
            this.videoMessage = "视频已加载";
            console.log('成功加载视频:', this.videoUrl);
          }
          
          // 提取关键帧路径并清理
          if (module1Res.key_frame_path) {
            this.keyFramePath = module1Res.key_frame_path.replace(/^\"|\"$/g, '').trim();
            console.log('成功加载关键帧路径:', this.keyFramePath);
          }
          
          // 提取设备类型并清理
          if (module1Res.deviceType) {
            this.deviceType = module1Res.deviceType.replace(/^\"|\"$/g, '').trim();
            console.log('成功加载设备类型:', this.deviceType);
          }
          
          // 提取视频描述并清理
          if (module1Res.video_description) {
            this.videoDescription = module1Res.video_description.replace(/^\"|\"$/g, '').trim();
            console.log('成功加载视频描述:', this.videoDescription);
          }
        } else {
          console.warn('未找到视频信息');
          this.videoMessage = "未找到视频信息";
        }
      } catch (error) {
        console.error('加载视频信息时出错:', error);
        this.videoMessage = "视频加载失败";
      }
    },
    // 处理窗口大小变化
    handleResize() {
      this.fullWidth = window.innerWidth;
      this.fullHeight = window.innerHeight;
      // 重新渲染以适应新尺寸
      this.$nextTick(() => {
        this.renderGraph();
      });
    },
    startNegotiation() {
      console.log("开始先验知识");
      this.startInfer();
    },
    renderGraph() {
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

      // 使用从后端获取的nodes和links，如果没有则使用默认数据
      let renderNodes = this.nodes.length ? this.nodes : [
        { id: '飞机', x: width * 0.3, y: height * 0.5, color: '#87CEEB' },
        { id: '战斗机', x: width * 0.6, y: height * 0.3, color: '#FF6B6B' },
        { id: '无人机', x: width * 0.6, y: height * 0.7, color: '#95E1D3' },
        { id: '运输机', x: width * 0.8, y: height * 0.5, color: '#FFD93D' }
      ];
      
      // 确保中心节点在中间位置
      // 默认将id为'飞机'的节点放在中央，如果不存在则将第一个节点放在中央
      const centerNode = renderNodes.find(node => node.is_center === true) || renderNodes[0];
      if (centerNode) {
        centerNode.x = width / 2;
        centerNode.y = height / 2;
        // 为中心节点设置更强的固定力
        centerNode.fx = width / 2;
        centerNode.fy = height / 2;
      }

      const renderLinks = this.links.length ? this.links : [
        { source: '飞机', target: '战斗机' },
        { source: '飞机', target: '无人机' },
        { source: '飞机', target: '运输机' }
      ];
      
      const simulation = d3.forceSimulation(renderNodes)
        .force('link', d3.forceLink(renderLinks).id(d => d.id).distance(150))
        .force('charge', d3.forceManyBody().strength(-500))
        .force('x', d3.forceX(width / 2))
        .force('y', d3.forceY(height / 2))
        .force('collide', d3.forceCollide().radius(40));

      // 添加箭头标记
      const defs = svg.append('defs');
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

      const link = svg.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(renderLinks)
        .enter().append('line')
        .attr('stroke', d => {
          // 新增：打印链接color，确认是否读取到
          console.log("链接颜色：", d.color);
          return d.color || '#999'
        })  // 使用链接自身的颜色，如果没有则使用默认颜色
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrow)');

      const nodeGroup = svg.append('g')
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
        })  // 使用节点自身的颜色，如果没有则使用默认颜色
        .attr('stroke', '#333')
        .attr('stroke-width', 2);

      nodeGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', 5)
        .style('font-size', '14px')
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
          d.fx = Math.max(radius, Math.min(width - radius, d3.event.x));
          d.fy = Math.max(radius, Math.min(height - radius, d3.event.y));
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
          d.x = Math.max(radius, Math.min(width - radius, d.x));
          d.y = Math.max(radius, Math.min(height - radius, d.y));
        });

        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

        nodeGroup.attr('transform', d => `translate(${d.x},${d.y})`);
      });
    },
    startInfer() {
      this.isLoading = true;

      axios.get('http://10.109.253.71:8001/module2/list', {
        params: {
          img_path: `${IMG_PATH_URL}`,
          device_type: `${DEVICE_TYPE}`
        }
      }).then(res => {
        console.log('Backend response:', res.data);
        const data = res.data;
        
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
            `动力信息：${labelData.power || '未知'}`,
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
          ];
          // 将预测信息存入localStorage，供群体协商界面使用
          localStorage.setItem('predictInfoList', JSON.stringify(this.predictInfoList));
          localStorage.setItem('module2Res', JSON.stringify(res.data));
          console.log('预测信息、模块2返回值已存入localStorage');

          // 【新增】方便调试：打印 localStorage
          console.log("--- localStorage 已更新 (模块二) ---");
          console.log("predictInfoList:", localStorage.getItem('predictInfoList'));
          console.log("module2Res:", localStorage.getItem('module2Res'));
          console.log("---------------------------------");
        }
        
        // 处理准确率
        this.accuracyRate = data.accuracy !== undefined ? (data.accuracy * 100) + '%' : '—';
        
        // 重新渲染图谱
        this.$nextTick(() => {
          this.renderGraph();
        });
      }).catch(err => {
        console.log(err);
        this.accuracyRate = '—';
      }).finally(() => {
        this.isLoading = false;
      });
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

    // 处理视频加载错误
    handleVideoError(e) {
      console.error("视频加载失败:", e);
      this.videoMessage = "视频加载失败，请检查 LocalStorage 中的 URL 是否正确。";
      this.videoUrl = null;
    },
    // 新增：下载JSON数据的函数
    async downloadJsonData() {
      try {
        const response = await axios.get('http://10.109.253.71:8001/module2/export');
        const dataToExport = response.data.result_list;
        console.log('获取到的JSON数据:', dataToExport);

        // 转换为JSON字符串并创建下载链接
        const jsonStr = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'my_data.json';
        document.body.appendChild(link);
        link.click();

        // 清理资源
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('获取并下载JSON失败:', error);
      }
    }
  }
};
</script>

<style>
/* 1. 全局样式 */
body {
  background-color: #0a1120;
  color: #e8f4ff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  margin: 0;
  padding: 0;
}

.bg-dark {
  background-color: #0a1120 !important;
}

.text-white {
  color: #e8f4ff !important;
}

/* 2. 顶部标题栏 */
.header-bar {
  width: 100%;
  flex-shrink: 0;
  padding: 0 20px;
  height: 60px;
  background-color: rgba(10, 17, 32, 0.95);
  border-bottom: 2px solid #00e5ff;
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
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
  font-size: 0.9rem;
  font-weight: bold;
  margin: 0 5px;
  background: linear-gradient(135deg, #0f1a2e, #1a2942);
  border: 1px solid #00e5ff;
  border-radius: 4px;
  box-shadow: 0 0 5px rgba(0, 229, 255, 0.3);
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #1a2942, #0f1a2e);
    box-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }
}

.btn {
  background: linear-gradient(135deg, #0f1a2e, #1a2942);
  border: 1px solid #00e5ff;
  border-radius: 4px;
  cursor: pointer;
  width: 100px;
  height: 36px;
  margin-left: 10px;
  color: #fff;
  font-size: 1rem;
  box-shadow: 0 0 5px rgba(0, 229, 255, 0.3);
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #1a2942, #0f1a2e);
    box-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }
  font-weight: bold;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.btn-home {
  background-image: url('~@/assets/images/step1/-s-按钮-蓝色.png');
}

.btn-back {
  background-image: url('~@/assets/images/step1/-s-按钮-蓝色-1.png');
}

.btn-next {
  background-image: url('~@/assets/images/step1/-s-按钮-绿色.png');
}

/* 3. 核心内容区 */
.content-row {
  flex-grow: 1;
  width: 100%;
  max-width: 100%;
  margin: 0;
}

/* 三列通用高度 */
.left-column, .middle-column, .right-column {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px); /* 减去顶部栏高度 */
  padding: 0 !important;
}

/* 面板通用样式 */
[class^="panel-"] {
  width: 100%;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  padding: 20px 30px 30px 30px;
  display: flex;
  flex-direction: column;
}

/* 特定面板的高度和边距 */
.panel-left {
  flex-grow: 1;
  height: 100%;
  background-image: url('~@/assets/images/step1/-s-弹框-选择数据.png');
}

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

/* 面板标题 */
.panel-header {
  height: 35px;
  background-image: url('~@/assets/images/step1/-s-二级标题.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  flex-shrink: 0;

  color: #fff;
  font-size: 1rem;
  font-weight: bold;
  padding-left: 0;
  margin-bottom: 10px;

  display: flex;
  justify-content: center;
  align-items: center;
}

/* 视频框架 */
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

.video-display {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.placeholder-text {
  color: #88a;
  font-size: 1rem;
  text-align: center;
  padding: 20px;
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
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 229, 255, 0.3);
  color: #eee;
  font-size: 0.9rem;
  line-height: 1.6;
  padding: 15px !important;
  overflow-y: auto;
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
}

.info-list li {
  position: relative;
  padding-left: 20px;
  margin-bottom: 10px;
  line-height: 1.5;
  color: #e8f4ff;
}

.info-list li:before {
  content: "";
  width: 10px;
  height: 10px;
  background: #00e5ff;
  border-radius: 50%;
  position: absolute;
  left: 0;
  top: 8px;
  box-shadow: 0 0 8px #00e5ff;
}

.text-red {
  color: #ff4d4d;
  font-weight: bold;
  font-size: 0.95rem;
}

/* 准确率显示 */
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
.action-buttons {
  margin-top: auto;
  flex-shrink: 0;
  padding-top: 15px;
  text-align: center;
}

.btn-start-detect {
  background: none;
  border: none;
  cursor: pointer;
  width: 220px;
  height: 50px;
  background-image: url('~@/assets/images/step1/-s-按钮-开始测试.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;

  color: #fff;
  font-size: 1.1rem;
  font-weight: bold;
  display: inline-flex;
  justify-content: center;
  align-items: center;

  &:disabled {
    filter: grayscale(80%);
    cursor: not-allowed;
  }

  span {
    margin-left: 8px;
  }
}

.btn-export-result {
  background: none;
  border: none;
  cursor: pointer;
  width: 200px;
  height: 48px;
  background-image: url('~@/assets/images/step1/-s-按钮-结果导出.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;

  color: #333;
  font-size: 1.1rem;
  font-weight: bold;
  display: inline-flex;
  justify-content: center;
  align-items: center;

  &:disabled {
    filter: grayscale(80%);
    cursor: not-allowed;
  }
}

/* 加载遮罩样式 */
.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(10, 17, 32, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  font-size: 20px;
  font-weight: bold;
}

.loading-spinner {
  padding: 20px 40px;
  background-color: rgba(0, 0, 0, 0.7);
  border: 3px solid #00e5ff;
  border-radius: 8px;
  color: #00e5ff;
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.3);
}

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
  .left-column, .middle-column, .right-column {
    height: auto;
    margin-bottom: 20px;
  }
  
  .content-row {
    flex-direction: column;
    align-items: center;
  }
  
  .left-column, .right-column {
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
</style>
