<template>
  <div class="section" :style="{ minHeight: fullHeight + 'px' }">
    <div class="register" :style="{width: fullWidth+'px', height:fullHeight+'px'}"></div>
    <div class="img_box" :style="{width: fullWidth+'px'}"></div>

    <b-row class="justify-content-center pt-5">
      <b-col cols="10" class="text-center">
        [cite_start]<p class="newTitle text-center">归因诊断 [cite: 4]</p>
      </b-col>
    </b-row>
    
    <b-row class="justify-content-center pt-4 mb-4">
      <b-col cols="10" style="position: relative;">
        [cite_start]<div class="box-label">结果汇总 [cite: 5]</div>
        
        <div class="results-summary-container p-3">
          
          <b-row>
            <b-col cols="6" class="pr-2">
              <div class="module-box">
                [cite_start]<p class="module-title">多模态目标检测 [cite: 3]</p>
                
                <div class="sub-box">
                  <div class="sub-box-content">
                    [cite_start]<p><strong>输出:</strong> 参考多模态目标检测页面的结果内容和展示形式(多行文本) [cite: 9]</p>
                    [cite_start]<p><strong>真值:</strong> 参考多模态目标检测页面的结果内容和展示形式(多行文本) [cite: 10]</p>
                  </div>
                </div>
                
                <div class="sub-box mt-2">
                  [cite_start]<div class="sub-box-title">认知传播偏差测试结果 [cite: 12]</div>
                  [cite_start]<div class="deviation-header">偏差值: 数值 [cite: 13]</div>
                  <div class="sub-box-content d-flex justify-content-between">
                    <div>
                      [cite_start]<p><strong>阶段二输出:</strong> [cite: 14]</p>
                      <ul>
                        [cite_start]<li>属性名: 属性值 [cite: 17]</li>
                        [cite_start]<li>属性名: 属性值 [cite: 17]</li>
                        [cite_start]<li>属性名: 属性值 [cite: 17]</li>
                      </ul>
                    </div>
                    <div>
                      [cite_start]<p><strong>阶段三输出:</strong> [cite: 15]</p>
                      [cite_start]<p>协商后的结果 [cite: 18]</p>
                    </div>
                    <div>
                      [cite_start]<p><strong>阶段四输出:</strong> [cite: 16]</p>
                      [cite_start]<p>危险等级 [cite: 19]</p>
                    </div>
                  </div>
                </div>
                
              </div>
            </b-col>
            
            <b-col cols="6" class="pl-2">
              <div class="module-box">
                [cite_start]<p class="module-title">先验知识 [cite: 6]</p>
                
                <div class="sub-box">
                  [cite_start]<div class="deviation-header">偏差值: 数值 [cite: 7]</div>
                  <div class="sub-box-content d-flex justify-content-around">
                    <div class="image-placeholder">
                      [cite_start]<p><strong>阶段二输出</strong> [cite: 8]</p>
                      <ul>
                        [cite_start]<li>属性名: 属性值 [cite: 48]</li>
                        [cite_start]<li>属性名: 属性值 [cite: 48]</li>
                        [cite_start]<li>属性名: 属性值 [cite: 48]</li>
                      </ul>
                    </div>
                    <div class="image-placeholder">
                      [cite_start]<p><strong>阶段二真值</strong> [cite: 49]</p>
                      <ul>
                        [cite_start]<li>属性名: 属性值 [cite: 50]</li>
                        [cite_start]<li>属性名: 属性值 [cite: 50]</li>
                        [cite_start]<li>属性名: 属性值 [cite: 50]</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div class="sub-box mt-2">
                  [cite_start]<div class="sub-box-title">模块偏差测试结果 [cite: 11]</div>
                  [cite_start]<div class="deviation-header">偏差值: 数值 [cite: 68]</div>
                  <div class="sub-box-content d-flex justify-content-around">
                    <div>
                      [cite_start]<p><strong>阶段二输出</strong> [cite: 51]</p>
                      <ul>
                        [cite_start]<li>属性名: 属性值 [cite: 52]</li>
                        [cite_start]<li>属性名: 属性值 [cite: 52]</li>
                        [cite_start]<li>属性名: 属性值 [cite: 52]</li>
                      </ul>
                    </div>
                    <div>
                      [cite_start]<p><strong>阶段二真值</strong> [cite: 53]</p>
                      <ul>
                        [cite_start]<li>属性名: 属性值 [cite: 54]</li>
                        [cite_start]<li>属性名: 属性值 [cite: 54]</li>
                        [cite_start]<li>属性名: 属性值 [cite: 54]</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div class="sub-box mt-2">
                  [cite_start]<div class="sub-box-title">认知传播偏差测试结果 [cite: 39]</div>
                  [cite_start]<div class="deviation-header">偏差值: 数值 [cite: 67]</div>
                  <div class="sub-box-content d-flex justify-content-around">
                    <div>
                      [cite_start]<p><strong>阶段三输出:</strong> [cite: 55]</p>
                      [cite_start]<p>群体协商后的结果 [cite: 56]</p>
                    </div>
                    <div>
                      [cite_start]<p><strong>阶段四输出:</strong> [cite: 57]</p>
                      [cite_start]<p>危险等级 [cite: 57]</p>
                    </div>
                  </div>
                </div>

              </div>
            </b-col>
          </b-row>
          
          <b-row class="mt-3">
            <b-col cols="6" class="pr-2">
              <div class="module-box">
                [cite_start]<p class="module-title">多智能体协商 [cite: 20]</p>
                
                <div class="sub-box">
                  [cite_start]<div class="deviation-header">偏差值: 数值 [cite: 36]</div>
                  <div class="sub-box-content">
                    [cite_start]<p><strong>阶段三输入:</strong> [cite: 21]</p>
                    <ul>
                      [cite_start]<li>属性名: 属性值 [cite: 22]</li>
                      [cite_start]<li>属性名: 属性值 [cite: 22]</li>
                      [cite_start]<li>属性名: 属性值 [cite: 22]</li>
                    </ul>
                  </div>
                </div>
                
                <div class="sub-box mt-2">
                  [cite_start]<div class="sub-box-title">模块偏差测试结果 [cite: 23]</div>
                  [cite_start]<div class="deviation-header">偏差值: 数值 [cite: 27]</div>
                  <div class="sub-box-content d-flex justify-content-between">
                    <div>
                      [cite_start]<p><strong>阶段三输入:</strong> [cite: 24]</p>
                      <ul>
                        [cite_start]<li>属性名: 属性值 [cite: 25]</li>
                        [cite_start]<li>属性名: 属性值 [cite: 25]</li>
                        [cite_start]<li>属性名: 属性值 [cite: 25]</li>
                      </ul>
                    </div>
                    <div>
                      [cite_start]<p><strong>阶段三真值:</strong> [cite: 29]</p>
                      [cite_start]<p>协商后的结果 [cite: 30]</p>
                    </div>
                    <div>
                      [cite_start]<p><strong>阶段三输出:</strong> [cite: 31]</p>
                      [cite_start]<p>协商后的结果 [cite: 33]</p>
                    </div>
                  </div>
                </div>
                
                <div class="sub-box mt-2">
                  [cite_start]<div class="sub-box-title">认知传播偏差测试结果 [cite: 26]</div>
                  [cite_start]<div class="deviation-header">偏差值: 数值 [cite: 44]</div>
                  <div class="sub-box-content d-flex justify-content-between">
                    <div>
                      [cite_start]<p><strong>阶段三输出:</strong> [cite: 28]</p>
                      [cite_start]<p>协商后的结果 [cite: 32]</p>
                    </div>
                    <div>
                      [cite_start]<p><strong>阶段四输出:</strong> [cite: 42]</p>
                      [cite_start]<p>危险等级 [cite: 43]</p>
                    </div>
                  </div>
                </div>
                
              </div>
            </b-col>
            
            <b-col cols="6" class="pl-2">
              <div class="module-box">
                [cite_start]<p class="module-title">决策选择 [cite: 37]</p>
                
                <div class="sub-box mt-2">
                  [cite_start]<div class="sub-box-title">模块偏差测试结果 [cite: 38]</div>
                  [cite_start]<div class="deviation-header">偏差值: 数值 [cite: 69]</div>
                  <div class="sub-box-content d-flex justify-content-around">
                    <div>
                      [cite_start]<p><strong>阶段三输出:</strong> [cite: 58]</p>
                      [cite_start]<p>协商后的结果 [cite: 59]</p>
                    </div>
                    <div>
                      [cite_start]<p><strong>阶段四输出:</strong> [cite: 60]</p>
                      [cite_start]<p>危险等级 [cite: 60]</p>
                    </div>
                    <div>
                      [cite_start]<p><strong>阶段四真值:</strong> [cite: 61]</p>
                      [cite_start]<p>危险等级 [cite: 61]</p>
                    </div>
                  </div>
                </div>
                
                <div class="sub-box mt-2 invisible">
                  </div>
              </div>
            </b-col>
          </b-row>
          
        </div>
      </b-col>
    </b-row>
    
    <b-row class="justify-content-center mt-4 pb-5">
      <b-col cols="10" style="position: relative;">
        [cite_start]<div class="box-label">诊断结果 [cite: 45]</div>
        
        <div class="diagnosis-results-container p-3">
          <b-row>
            <b-col cols="4" class="text-center">
              <div class="diagnosis-card-pdf">
                [cite_start]<p class="diagnosis-label-pdf">准确率 [cite: 40]</p>
                [cite_start]<p class="diagnosis-value-pdf">86% [cite: 41]</p>
              </div>
            </b-col>
            <b-col cols="4" class="text-center">
              <div class="diagnosis-card-pdf">
                [cite_start]<p class="diagnosis-label-pdf">偏差模块 [cite: 46]</p>
                [cite_start]<p class="diagnosis-value-pdf">模块名称 [cite: 47]</p>
              </div>
            </b-col>
            <b-col cols="4" class="text-center">
              <div class="diagnosis-card-pdf">
                [cite_start]<p class="diagnosis-label-pdf">不一致性根因召回率 [cite: 65]</p>
                [cite_start]<p class="diagnosis-value-pdf">73% [cite: 66]</p>
              </div>
            </b-col>
          </b-row>
        </div>
      </b-col>
    </b-row>
    
  </div>
</template>

<script>
// 仅保留原文件中用于调整背景大小的脚本
export default {
  name: 'AttributionDiagnosis',
  data() {
    return {
      // 样式控制
      fullWidth: window.innerWidth,
      fullHeight: window.innerHeight,
    };
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    this.handleResize(); // 初始设置
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    handleResize() {
      this.fullWidth = window.innerWidth;
      this.fullHeight = window.innerHeight;
    },
  }
};
</script>

<style lang="scss" scoped>
  /* ------------------- 基础样式 (沿用 DecisionMaking.vue) ------------------- */
  .section {
    background-color: #EAF4FE;
    color: black;
    font-size: 100%;
    width: 100%;
    min-height: 100vh;
    font-family: "Helvetica Neue";
    z-index: 2;
    overflow-y: auto; /* 允许滚动 */
  }

  .newTitle {
    font-size: calc(2vw + 1rem);
    color: #2168BE;
    font-weight: bolder;
    letter-spacing: 0.1em;
  }

  .register {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
  }
  .img_box {
      position: absolute;
      // ⚠️ 实际应用中请替换为您的背景图片路径
      background-image: url('../assets/images/newBackGound.png'); 
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center center;
      width: 100%;
      height: 100%;
      opacity: 0.8;
  }

  .box-label {
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #EAF4FE;
    padding: 0 10px;
    color: red;
    font-size: 14px;
    font-weight: bold;
    z-index: 10;
  }
  
  /* 占位符文字（如果需要） */
  .placeholder-text-small {
    color: #333;
    font-size: 0.9rem;
    min-height: 20px;
  }
  
  /* ------------------- PDF 布局专属样式 ------------------- */
  
  /* 结果汇总的白色大框 */
  .results-summary-container {
    border: 2px solid #ccc;
    background-color: #fff;
    margin-top: 10px;
    position: relative;
    width: 100%;
  }

  /* 四个主模块的容器 */
  .module-box {
    border: 1px solid #999;
    padding: 10px;
    height: 100%;
    background-color: #fdfdfd;
  }
  
  .module-title {
    font-size: 1.1rem;
    font-weight: bold;
    color: #000;
    border-bottom: 1px solid #ccc;
    padding-bottom: 5px;
    text-align: left;
  }
  
  /* 模块内的子框 (如 "模块偏差测试结果") */
  .sub-box {
    border: 1px solid #aaa;
    background-color: #fff;
    position: relative;
    padding: 8px;
    padding-top: 15px; /* 为 sub-box-title 留出空间 */
    font-size: 0.85rem;
  }

  .sub-box-title {
    position: absolute;
    top: -10px;
    left: 10px;
    background-color: #fff;
    padding: 0 5px;
    font-weight: bold;
    font-size: 0.9rem;
  }
  
  /* "偏差值: 数值" 标题头 */
  .deviation-header {
    position: absolute;
    top: -10px;
    right: 10px;
    background-color: #fff;
    padding: 0 5px;
    font-weight: bold;
    color: #dc3545; /* 红色 */
    font-size: 0.9rem;
  }
  
  .sub-box-content {
    padding: 5px;
    
    p {
      margin-bottom: 4px;
    }
    ul {
      padding-left: 20px;
      margin-bottom: 0;
    }
    li {
      font-size: 0.8rem;
    }
  }

  /* 用于 "先验知识" 的图片占位符 */
  .image-placeholder {
    border: 1px dashed #ccc;
    padding: 10px;
    background-color: #f9f9f9;
    width: 45%;
    
    p {
      font-weight: bold;
      text-align: center;
      border-bottom: 1px solid #eee;
    }
  }

  /* ------------------- 底部诊断结果 ------------------- */
  
  /* 诊断结果的白色大框 */
  .diagnosis-results-container {
    border: 2px solid #ccc;
    background-color: #fff;
    margin-top: 10px;
    position: relative;
    text-align: center;
  }
  
  /* 诊断结果的卡片 (PDF 样式) */
  .diagnosis-card-pdf {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px 10px;
    border: 1px solid #aaa;
    background-color: #f7f7f7;
    height: 100%;
    
    .diagnosis-label-pdf {
        font-size: 1rem;
        font-weight: bold;
        color: #333;
        margin-bottom: 10px;
    }
    .diagnosis-value-pdf {
        font-size: 2rem;
        font-weight: bolder;
        color: #000;
        margin-bottom: 0;
    }
  }

</style>