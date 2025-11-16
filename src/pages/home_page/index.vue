<!-- MyComponent.vue -->
<template>
  <div class="home-page">
    <div class="home-page-head">
      <div class="home-page-head-box">
        <div class="home-page-head-text">人机混合多主体认知传播模型仿真验证系统</div>
      </div>
    </div>
    <div class="home-page-context">
      <a-button @click="multimodal" type="link" class="home-page-context-multimodal">
        <div class="home-page-context-multimodal-box">
          <div class="home-page-context-multimodal-icon"></div>
        </div>
        <div class="home-page-context-multimodal-text">多模态信息<br />认知偏差检测模型</div>
      </a-button>
      <a-button @click="priori_knowledge" type="link" class="home-page-context-priori-knowledge">
        <div class="home-page-context-priori-knowledge-box">
          <div class="home-page-context-priori-knowledge-icon"></div>
        </div>
        <div class="home-page-context-priori-knowledge-text">先验知识<br />认知偏差检测模型</div>
      </a-button>
      <a-button @click="negotiation" type="link" class="home-page-context-negotiation">
        <div class="home-page-context-negotiation-box">
          <div class="home-page-context-negotiation-icon"></div>
        </div>
        <div class="home-page-context-negotiation-text">群体协商<br />认知偏差检测模型</div>
      </a-button>
      <a-button @click="selection" type="link" class="home-page-context-selection">
        <div class="home-page-context-selection-box">
          <div class="home-page-context-selection-icon"></div>
        </div>
        <div class="home-page-context-selection-text">决策选择<br />认知偏差检测模型</div>
      </a-button>
      <a-button @click="diagnosis" type="link" class="home-page-context-diagnosis">
        <div class="home-page-context-diagnosis-box">
          <div class="home-page-context-diagnosis-icon"></div>
        </div>
        <div class="home-page-context-diagnosis-text">多层级传播不一致性<br />根因诊断模型</div>
      </a-button>
    </div>
    <div class="home-page-other"></div>
  </div>
</template>

<script>
import { Button } from 'ant-design-vue'

export default {
  name: 'HomePage', // 推荐：提供 name，便于调试和递归组件
  data() {
    return {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    }
  },
  mounted() {
    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    // 移除监听器（避免内存泄漏）
    window.removeEventListener('resize', this.handleResize)
  },

  methods: {
    diagnosis() {
      this.$router.push('/attributiondiagnosis')
      console.log('attributiondiagnosis, 按钮被点击了！')
    },
    selection() {
      this.$router.push('/decisionmaking')
      console.log('decisionmaking, 按钮被点击了！')
    },
    negotiation() {
      this.$router.push('/group-negotiation')
      console.log('group-negotiation, 按钮被点击了！')
    },
    priori_knowledge() {
      this.$router.push('/prior-knowledge')
      console.log('prior-knowledge, 按钮被点击了！')
    },
    multimodal() {
      this.$router.push('/target-detection')
      console.log('target-detection, 按钮被点击了！')
    },
    handleResize() {
      this.windowWidth = window.innerWidth
      this.windowHeight = window.innerHeight
      console.log('宽：', this.windowWidth)
      console.log('高：', this.windowHeight)
    },
  },
}
</script>

<style src="ant-design-vue/dist/antd.css"></style>
<style src="./index.css" scoped></style>
