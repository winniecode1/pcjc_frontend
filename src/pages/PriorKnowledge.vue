<template>
  <div class="section">
    
    <!-- 标题 -->
    <b-row class="justify-content-center pt-5">
      <b-col cols="12" class="text-center">
        <p class="newTitle text-center">先验知识</p>
      </b-col>
    </b-row>

    <!-- 主要内容区域 新布局：左(图片+按钮) 中(D3图) 右(标签/预测信息) -->
    <div class="main-layout">
      <!-- 左侧 -->
      <div class="left-panel">
        <div class="image-box">
          <img v-if="originalImageURL" :src="originalImageURL" alt="图片" class="aircraft-image" />
          <div v-else class="placeholder-image"><span>图片</span></div>
        </div>
        <div class="negotiation-box large">
          <button class="negotiation-btn" @click="startNegotiation">
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
  accuracyRate: '—'
    };
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    this.renderGraph();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  watch: {
   
  },
  methods: {
    handleResize() {
      this.fullWidth = window.innerWidth;
      this.fullHeight = window.innerHeight;
    },
    startNegotiation() {
      console.log("开始群体协商");
      // 这里可以添加群体协商的逻辑
      this.startInfer();
    },
    renderGraph() {
      // 基于 D3 绘制一个简单的有向图占位
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

      const nodes = [
        { id: '飞机', fx: width * 0.25, fy: height * 0.5 },
        { id: '战斗机' },
        { id: '无人机' },
        { id: '运输机' }
      ];
      const links = [
        { source: '飞机', target: '战斗机' },
        { source: '飞机', target: '无人机' },
        { source: '飞机', target: '运输机' }
      ];

      // 预定义锚点（环形分布）用于拖拽结束时吸附
      const anchorMap = {
        '飞机': { x: width * 0.30, y: height * 0.50 },
        '战斗机': { x: width * 0.55, y: height * 0.30 },
        '无人机': { x: width * 0.55, y: height * 0.70 },
        '运输机': { x: width * 0.75, y: height * 0.50 }
      };

      const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(160))
        .force('charge', d3.forceManyBody().strength(-600)) // 增强排斥力
        .force('collide', d3.forceCollide().radius(55).strength(1)) // 防重叠
        .force('center', d3.forceCenter(width * 0.55, height / 2))
        .on('tick', ticked);

      // 箭头
      svg.append('defs').append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 16)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#333');

      const link = svg.append('g')
        .attr('stroke', '#333')
        .attr('stroke-width', 1.5)
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('marker-end', 'url(#arrow)');

      const node = svg.append('g')
        .selectAll('g')
        .data(nodes)
        .enter().append('g')
        .style('cursor','move')
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended));

      node.append('circle')
        .attr('r', 30)
        .attr('fill', '#fff')
        .attr('stroke', '#333');

      node.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', 5)
        .style('font-size', '14px')
        .text(d => d.id);

      function ticked() {
        // 缓动：如果节点有 snapTarget，逐步向目标移动（线性插值）
        nodes.forEach(n => {
          if (n.snapTarget) {
            const easeFactor = 0.15; // 缓动系数，可调
            n.x += (n.snapTarget.x - n.x) * easeFactor;
            n.y += (n.snapTarget.y - n.y) * easeFactor;
          }
        });
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);
        node.attr('transform', d => `translate(${d.x},${d.y})`);
      }
      // D3 v5 drag event doesn't pass event as first arg when using function keyword and relies on d3.event
      function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x; d.fy = d.y;
      }
      function dragged(d) {
        d.fx = d3.event.x; d.fy = d3.event.y;
      }
      function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        // 设置缓动目标，不直接硬性跳转
        const anchor = anchorMap[d.id];
        if (anchor) {
          d.snapTarget = { x: anchor.x, y: anchor.y };
          // 释放 fx/fy 让 force 继续计算，但位置会在 ticked 中缓动过去
          d.fx = null; d.fy = null;
        } else {
          d.snapTarget = null;
          d.fx = null; d.fy = null;
        }
      }
    },
    async startInfer() {
      this.isLoading = true;
      const formData = new FormData();
      try {
        const response = await axios.post('http://10.109.253.71:5234/inference', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        const data = response.data;
        this.finalResult = data;
      } catch (error) {
        console.error("推理请求失败:", error);
        this.finalResult = "推理失败: " + (error.response && error.response.data && error.response.data.error) || error.message;
      } finally {
        this.isLoading = false;
      }
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

/* 去除覆盖背景层，保留各子组件自身背景 */

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
.negotiation-btn { background:none; border:none; display:flex; align-items:center; gap:18px; cursor:pointer; font-size:22px; font-weight:bold; }
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
