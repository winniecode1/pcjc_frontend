<template>
  <div class="section">
    <!-- 标题 -->
    <b-row class="justify-content-center pt-5">
      <b-col cols="12" class="text-center">
        <p class="newTitle text-center">先验知识</p>
      </b-col>
    </b-row>

    <!-- 加载遮罩 -->
    <div v-if="isLoading" class="loading-mask">
      <div class="loading-spinner">加载中...</div>
    </div>

    <!-- 主要内容区域 新布局：左(图片+按钮) 中(D3图) 右(标签/预测信息) -->
    <div class="main-layout">
      <!-- 左侧 -->
      <div class="left-panel">
        <div class="image-box">
          <img v-if="originalImageURL" :src="originalImageURL" alt="图片" class="aircraft-image" />
          <div v-else class="placeholder-image"><span>图片</span></div>
        </div>
        <div class="negotiation-box large">
          <button class="negotiation-btn" @click="startNegotiation" :disabled="isLoading">
            <span class="play-icon">▶</span>
            <span class="negotiation-text">开始检测</span>
          </button>
        </div>
      </div>
      <!-- 中间图谱 -->
      <div class="graph-panel">
        <div class="graph-container" ref="graphContainer">
          <div class="graph-title">知识图谱先验信息</div>
          <svg ref="graphSvg"></svg>
        </div>
      </div>
      <!-- 右侧信息 -->
      <div class="right-panel">
        <div class="info-box tag-box">
          <div class="info-title">标签信息</div>
          <ul class="info-list">
            <li v-for="(item, idx) in tagInfoList" :key="'tag-' + idx">{{ item }}</li>
          </ul>
        </div>
        <div class="info-box predict-box">
          <div class="info-title">预测信息</div>
          <ul class="info-list">
            <li v-for="(item, idx) in predictInfoList" :key="'pre-' + idx">{{ item }}</li>
          </ul>
          <div class="accuracy-box small">
            <span class="accuracy-label">偏差识别准确率：</span>
            <span class="accuracy-value">{{ accuracyRate }}</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
// 导入 axios 用于 HTTP 请求
import axios from 'axios';

export default {
  name: 'PriorKnowledge',
  data() {
    return {
      fullWidth: window.innerWidth,
      fullHeight: window.innerHeight,
      originalImageURL: null,
      tagInfoList: ["小类信息", "火力信息", "颜色信息", "形状信息", "尺寸信息", "动力信息"],
      predictInfoList: ["小类信息", "火力信息", "颜色信息", "形状信息", "尺寸信息", "动力信息"],
      isLoading: false,
      accuracyRate: '—',
      finalResult: null,
      nodes: [], // 用于存储后端返回的节点数据
      links: []  // 用于存储后端返回的链接数据
    };
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    this.renderGraph();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
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
      
      const width = container.clientWidth - 40;
      const height = container.clientHeight - 60;
      
      const svg = d3.select(svgEl)
        .attr('width', width)
        .attr('height', height);
      
      svg.selectAll('*').remove();

      // 使用从后端获取的nodes和links，如果没有则使用默认数据
      const renderNodes = this.nodes.length ? this.nodes : [
        { id: '飞机', x: width * 0.3, y: height * 0.5, color: '#87CEEB' },
        { id: '战斗机', x: width * 0.6, y: height * 0.3, color: '#FF6B6B' },
        { id: '无人机', x: width * 0.6, y: height * 0.7, color: '#95E1D3' },
        { id: '运输机', x: width * 0.8, y: height * 0.5, color: '#FFD93D' }
      ];

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
        .attr('stroke', d => d.color || '#999')  // 使用链接自身的颜色，如果没有则使用默认颜色
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
        .attr('fill', d => d.color || '#fff')
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
      this.tagInfoList = [];
      this.predictInfoList = [];
      this.nodes = [];
      this.links = [];

      axios.get('/module2/list', {
        params: {
          img_path: '/home/wuzhixuan/Project/PCJC/module2/images/img10.png',
          device_type: '%E9%A3%9E%E6%9C%BA'
        }
      }).then(res => {
        console.log('Backend response:', res.data);
        const data = res.data;
        
        // 处理图谱数据
        if (data.knowledge_info && data.knowledge_info.length > 0) {
          // this.nodes = data.knowledge_info[0].nodes || [];
          // this.links = data.knowledge_info[0].links || [];
           // 创建节点数据
          const propertyNodes = [];
          const mainNodes = [];
          
          // 处理主要节点（飞机、型号等）
          const aircraft = data.knowledge_info[0][0];
          mainNodes.push(
            { id: aircraft.type, color: '#FFD93D', is_property: false },
            { id: aircraft.kind, color: '#FFD93D', is_property: false },
            { id: aircraft.model, color: '#FFD93D', is_property: false }
          );
          
          // 处理属性节点
          const properties = [
            { id: aircraft.color, type: 'color' },
            { id: aircraft.size, type: 'size' },
            { id: aircraft.firepower, type: 'firepower' },
            { id: aircraft.scene, type: 'scene' },
            { id: aircraft.shape, type: 'shape' },
            { id: aircraft.power, type: 'power' },
            { id: aircraft.country, type: 'country' }
          ];
          
          properties.forEach(prop => {
            if (prop.id) {
              propertyNodes.push({
                id: prop.id,
                color: '#FFD93D',
                is_property: true,
                content: prop.type
              });
            }
          });
          
          // 合并所有节点
          this.nodes = [...mainNodes, ...propertyNodes];
          
          // 创建连接
          this.links = [
            { source: aircraft.type, target: aircraft.kind, color: '#FFD93D' },
            { source: aircraft.kind, target: aircraft.model, color: '#FFD93D' },
            ...properties.filter(p => p.id).map(p => ({
              source: aircraft.model,
              target: p.id,
              color: '#FFD93D'
            }))
          ];
        }
        
        // 处理标签信息
        if (data.label_info && data.label_info.length > 0 && data.label_info[0].length > 0) {
          const labelData = data.label_info[0][0];
          this.tagInfoList = [
            // `类型：${labelData.type || '未知'}`,
            `小类信息：${labelData.model || '未知'}`,
            // `种类：${labelData.kind || '未知'}`,
            // `国家：${labelData.country || '未知'}`,
            `火力信息：${labelData.firepower || '未知'}`,
            `颜色信息：${labelData.color || '未知'}`,         
            `形状信息：${labelData.shape || '未知'}`,
            `尺寸信息：${labelData.size || '未知'}`,
            `动力信息：${labelData.power || '未知'}`,
            // `场景：${labelData.scene || '未知'}`
          ];
        }
        
        // 处理预测信息
        if (data.result && data.result.length > 0 && data.result[0].length > 0) {
          const predictData = data.result[0][0];
          this.predictInfoList = [
            `小类信息：${predictData.model || '未知'}`,
            // `种类：${predictData.kind || '未知'}`,
            // `国家：${predictData.country || '未知'}`,
            `火力信息：${predictData.firepower || '未知'}`,
            `颜色信息：${predictData.color || '未知'}`,
            `形状信息：${predictData.shape || '未知'}`,
            `尺寸信息：${predictData.size || '未知'}`,
            `动力信息：${predictData.power || '未知'}`,
            // `场景：${predictData.scene || '未知'}`
          ];
        }
        
        // 处理准确率
        this.accuracyRate = data.accuracy !== undefined ? (data.accuracy * 100) + '%' : '—';
        
        // 重新渲染图谱
        this.$nextTick(() => {
          this.renderGraph();
        });
      }).catch(err => {
        console.error(err.response && err.response.data || err);
        this.accuracyRate = '—';
      }).finally(() => {
        this.isLoading = false;
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.section {
  background-color: #D7E7D5;
  color: black;
  font-size: 100%;
  width: 100%;
  min-height: 100vh;
  font-family: "Helvetica Neue", Arial, sans-serif;
  z-index: 2;
  position: relative;
}

.newTitle {
  font-size: 2.5rem;
  color: black;
  letter-spacing: 0.1em;
  font-weight: bold;
  margin-bottom: 40px;
}

/* 加载遮罩样式 */
.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  font-size: 20px;
  font-weight: bold;
}

.loading-spinner {
  padding: 20px 40px;
  background-color: white;
  border: 3px solid #7BA3D1;
  border-radius: 8px;
}

/* 新布局 */
.main-layout {
  display: grid;
  grid-template-columns: 320px 1fr 340px;
  gap: 30px;
  padding: 20px 40px 40px;
  align-items: stretch;
}

/* 左侧 */
.left-panel { display: flex; flex-direction: column; gap: 30px; }
.image-box { border:3px solid #7BA3D1; background:#fff; padding:10px; height:360px; }
.aircraft-image, .placeholder-image { width:100%; height:100%; object-fit:contain; }
.placeholder-image { display:flex; align-items:center; justify-content:center; color:#666; font-size:18px; }
.negotiation-box { border:3px solid #7BA3D1; background:#D3E4F7; padding:25px 20px; display:flex; align-items:center; justify-content:center; }
.negotiation-box.large { height:120px; }
.negotiation-btn { 
  background:none; 
  border:none; 
  display:flex; 
  align-items:center; 
  gap:18px; 
  cursor:pointer; 
  font-size:22px; 
  font-weight:bold; 
}
.negotiation-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.play-icon { width:46px; height:46px; background:#2168BE; color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; }

/* 中间图谱 */
.graph-panel { position:relative; }
.graph-container { position:relative; border:3px solid #E6B877; background:#FFF4E0; border-radius:60px; padding:30px 20px 20px; height:100%; min-height:480px; }
.graph-title { position:absolute; top:20px; left:40px; font-weight:bold; font-size:20px; }
.graph-container svg { width:100%; height:100%; }

/* 右侧信息 */
.right-panel { display:flex; flex-direction:column; gap:30px; }
.info-box { border:3px solid #C9A8D4; background:#E8D9EF; padding:20px 25px; }
.info-title { font-weight:bold; font-size:18px; margin-bottom:15px; }
.info-list { list-style:none; padding:0; margin:0 0 20px; }
.info-list li { position:relative; padding-left:16px; line-height:28px; }
.info-list li:before { content:""; width:8px; height:8px; background:#000; border-radius:50%; position:absolute; left:0; top:10px; }
.accuracy-box { background:#fff; border:2px solid #000; padding:10px 12px; display:inline-flex; gap:6px; font-size:14px; font-weight:bold; }
.accuracy-box.small { margin-top:auto; }
.accuracy-label { color:#333; }
.accuracy-value { color:#000; }
</style>
