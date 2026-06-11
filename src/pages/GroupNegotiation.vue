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
        <!-- <h1 class="header-title">群体协商认知偏差检测模型</h1> -->
      </b-col>
      <b-col cols="3" class="text-right">
        <button class="header-btn btn-next" @click="navigateNext">下个页面</button>
      </b-col>
    </b-row>

    <!-- 主要内容区域 -->
    <div class="content-row">
      <!-- 左侧视频和按钮区域 -->
      <div class="design-left-column">
        <div class="design-module video-module">
          <div class="panel-header title-one-line">指令传播结果</div>
          <div class="design-module-content video-content-wrapper">
            <!-- compare 文件列表 -> 图片详情（左上角返回） -->
            <button
              v-if="compareView === 'detail' && orderInstructionText"
              class="compare-back-btn"
              @click="backToCompareList"
            >
              返回
            </button>

            <!-- 列表视图（无 instruction 时即使已选图/视频也继续展示） -->
            <div v-if="compareView === 'list' || !orderInstructionText" class="compare-list-wrapper">
              <!-- 采用 TargetDetection 中 server-video-list/video-item 的列表样式；分区小标题区分图片与视频 -->
              <div
                class="server-video-list overflow-auto"
                v-if="imageSourceItems.length > 0 || videoSourceItems.length > 0 || orderCategories.length > 0"
              >
                <div v-if="orderCategories.length > 0" class="source-list-section order-instruction-section">
                  <div
                    class="source-list-heading-toggle"
                    :class="{ 'is-collapsed': !instructionSetExpanded }"
                    role="button"
                    tabindex="0"
                    :aria-expanded="instructionSetExpanded ? 'true' : 'false'"
                    @click="toggleInstructionSet"
                    @keydown.enter.prevent="toggleInstructionSet"
                    @keydown.space.prevent="toggleInstructionSet"
                  >
                    <span class="source-list-heading-label">指令集合</span>
                    <span class="source-list-heading-chevron" aria-hidden="true">▼</span>
                  </div>
                  <div v-show="instructionSetExpanded" class="source-list-items order-category-list">
                    <div
                      v-for="(cat, catIdx) in orderCategories"
                      :key="'order-cat-' + catIdx"
                      class="order-category-block"
                    >
                      <div
                        class="source-list-heading-toggle order-category-toggle"
                        :class="{ 'is-collapsed': !isOrderCategoryExpanded(catIdx) }"
                        role="button"
                        tabindex="0"
                        :aria-expanded="isOrderCategoryExpanded(catIdx) ? 'true' : 'false'"
                        @click.stop="toggleOrderCategory(catIdx)"
                        @keydown.enter.prevent.stop="toggleOrderCategory(catIdx)"
                        @keydown.space.prevent.stop="toggleOrderCategory(catIdx)"
                      >
                        <span class="source-list-heading-label">{{ cat.category }}</span>
                        <span class="source-list-heading-chevron" aria-hidden="true">▼</span>
                      </div>
                      <div v-show="isOrderCategoryExpanded(catIdx)" class="source-list-items order-group-list">
                        <div
                          v-for="(grp, gIdx) in cat.groups"
                          :key="'order-grp-' + catIdx + '-' + gIdx"
                          class="order-group-item"
                          role="button"
                          tabindex="0"
                          :class="{ selected: selectedSourceKey === ('order:' + grp) }"
                          @click="openOrderGroupItem(catIdx, grp)"
                          @keydown.enter.prevent="openOrderGroupItem(catIdx, grp)"
                          @keydown.space.prevent="openOrderGroupItem(catIdx, grp)"
                        >
                          <span>{{ grp }}</span>
                          <span class="selector-circle"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="imageSourceItems.length > 0" class="source-list-section">
                  <div
                    class="source-list-heading-toggle"
                    :class="{ 'is-collapsed': !imageSourceListExpanded }"
                    role="button"
                    tabindex="0"
                    :aria-expanded="imageSourceListExpanded ? 'true' : 'false'"
                    @click="toggleImageSourceList"
                    @keydown.enter.prevent="toggleImageSourceList"
                    @keydown.space.prevent="toggleImageSourceList"
                  >
                    <span class="source-list-heading-label">图片分组</span>
                    <span class="source-list-heading-chevron" aria-hidden="true">▼</span>
                  </div>
                  <div v-show="imageSourceListExpanded" class="source-list-items">
                    <div
                      v-for="(item, idx) in imageSourceItems"
                      :key="item.key || idx"
                      class="video-item"
                      @click="openSourceItem(item)"
                      :class="{ selected: selectedSourceKey === item.key }"
                    >
                      <span>{{ item.name }}</span>
                      <span class="selector-circle"></span>
                    </div>
                  </div>
                </div>
                <div v-if="videoSourceItems.length > 0" class="source-list-section">
                  <div
                    class="source-list-heading-toggle"
                    :class="{ 'is-collapsed': !videoSourceListExpanded }"
                    role="button"
                    tabindex="0"
                    :aria-expanded="videoSourceListExpanded ? 'true' : 'false'"
                    @click="toggleVideoSourceList"
                    @keydown.enter.prevent="toggleVideoSourceList"
                    @keydown.space.prevent="toggleVideoSourceList"
                  >
                    <span class="source-list-heading-label">视频列表</span>
                    <span class="source-list-heading-chevron" aria-hidden="true">▼</span>
                  </div>
                  <div v-show="videoSourceListExpanded" class="source-list-items">
                    <div
                      v-for="(item, idx) in videoSourceItems"
                      :key="item.key || idx"
                      class="video-item"
                      @click="openSourceItem(item)"
                      :class="{ selected: selectedSourceKey === item.key }"
                    >
                      <span>{{ item.name }}</span>
                      <span class="selector-circle"></span>
                    </div>
                  </div>
                </div>
              </div>
              <p class="text-content text-muted" v-else>{{ sourceListMessage }}</p>
            </div>

            <!-- 详情视图：指令集合 instruction 文案 -->
            <div v-else-if="compareView === 'detail' && orderInstructionText" class="propagation-detail-wrapper">
              <p class="order-instruction-display">{{ orderInstructionText }}</p>
            </div>
          </div>
        </div>

        <div class="design-module text-module-left fixed-left-text">
          <div class="panel-header title-one-line">传播信息</div>
          <div class="design-module-content text-scrollable">
            <!-- 图片详情视图（图片分组三张图 / 视频详情） -->
            <div
              v-if="compareView === 'detail'"
              class="compare-detail-wrapper"
              :class="{
                'compare-detail-group': selectedDetailType === 'compare' && selectedGroupImageFiles.length > 0
              }"
            >
              <template
                v-if="selectedDetailType === 'compare' && selectedCompareFile && selectedGroupImageFiles.length > 0"
              >
                <div class="compare-detail-images-row">
                  <img
                    v-for="fn in selectedGroupImageFiles"
                    :key="fn"
                    :src="`/static/grouped_dataset/${selectedCompareFile}/${fn}`"
                    :alt="fn"
                    class="compare-image group-triple-img group-triple-img-clickable"
                    @click="openGroupImageLightbox(fn)"
                  />
                </div>
              </template>
              <video
                v-else-if="selectedDetailType === 'video' && selectedVideoUrl"
                :src="selectedVideoUrl"
                class="compare-image video-display"
                controls
                playsinline
                muted
                loop
                @error="handleVideoError"
              />
              <p v-else class="text-content text-muted">{{ sourceListMessage }}</p>
            </div>
            <p v-else class="text-content text-muted">暂无展示内容</p>
          </div>
        </div>

        <div class="button-container">
          <button @click="startNegotiation" class="btn-start-detect" :disabled="!canStartNegotiation || isLoading">
            <span>{{ isLoading ? '协商中...' : '开始群体协商' }}</span>
          </button>
        </div>
      </div>

      <!-- 中间：智能体推理 -->
      <div class="middle-column">
        <div class="panel-left h-100">
          <div class="panel-content">
            <!-- 一轮推理 -->
            <div class="panel-header mb-3 title-one-line">一轮群体协商</div>
            
            <div class="reasoning-section">
              <!-- 智能体A推理结果 -->
              <div class="agent-box">
                <div class="agent-header">
                  <img class="agent-avatar" :src="require('@/assets/images/step3/agent.svg')" alt="Agent" />
                  <div class="agent-label">智能体A</div>
                </div>
                <div class="agent-content">
                  <div v-if="isLoadingRound1" class="panel-overlay">协商中...</div>
                  <p v-if="typeof agentARound1Result === 'object' && agentARound1Result !== null" class="agent-result">
                    <span class="result-line">推理型号：{{ agentARound1Result.model_name || '***' }}</span>
                    <span class="result-line">推理结果：{{ agentARound1Result.reason || '***' }}</span>
                  </p>
                  <p v-else class="agent-result">{{ agentARound1Result || '推理型号：***\n推理结果：***' }}</p>
                </div>
              </div>

              <!-- 智能体B推理结果 -->
              <div class="agent-box">
                <div class="agent-header">
                  <img class="agent-avatar" :src="require('@/assets/images/step3/agent.svg')" alt="Agent" />
                  <div class="agent-label">智能体B</div>
                </div>
                <div class="agent-content">
                  <div v-if="isLoadingRound1" class="panel-overlay">协商中...</div>
                  <p v-if="typeof agentBRound1Result === 'object' && agentBRound1Result !== null" class="agent-result">
                    <span class="result-line">推理型号：{{ agentBRound1Result.model_name || '***' }}</span>
                    <span class="result-line">推理结果：{{ agentBRound1Result.reason || '***' }}</span>
                  </p>
                  <p v-else class="agent-result">{{ agentBRound1Result || '推理型号：***\n推理结果：***' }}</p>
                </div>
              </div>

              <!-- 智能体C推理结果 -->
              <div class="agent-box">
                <div class="agent-header">
                  <img class="agent-avatar" :src="require('@/assets/images/step3/agent.svg')" alt="Agent" />
                  <div class="agent-label">智能体C</div>
                </div>
                <div class="agent-content">
                  <div v-if="isLoadingRound1" class="panel-overlay">协商中...</div>
                  <p v-if="typeof agentCRound1Result === 'object' && agentCRound1Result !== null" class="agent-result">
                    <span class="result-line">推理型号：{{ agentCRound1Result.model_name || '***' }}</span>
                    <span class="result-line">推理结果：{{ agentCRound1Result.reason || '***' }}</span>
                  </p>
                  <p v-else class="agent-result">{{ agentCRound1Result || '推理型号：***\n推理结果：***' }}</p>
                </div>
              </div>
            </div>

            <!-- 二轮推理 -->
            <div class="panel-header my-3 title-one-line">二轮群体协商</div>
            
            <div class="reasoning-section">
              <!-- 智能体A-B协商 -->
              <div class="agent-box negotiation">
                <div class="agent-header">
                  <img class="agent-avatar" :src="require('@/assets/images/step3/AB.svg')" alt="Agents" />
                  <!-- <div class="negotiation-sign">⇄</div>
                  <img class="agent-avatar" :src="require('@/assets/images/step3/agents.png')" alt="Agents" /> -->
                  <div class="agent-label">智能体A</div>
                </div>
                <div class="agent-content">
                  <div v-if="isLoadingRound2" class="panel-overlay">等待一轮协商结果...</div>
                  <p v-if="typeof agentABNegotiation === 'object' && agentABNegotiation !== null" class="agent-result">
                    <template v-if="selectedDetailType === 'compare'">
                      <span class="result-line">优先级排序：{{ displayRound2PriorityOrdering(agentABNegotiation) }}</span>
                      <span class="result-line">优先级依据：{{ displayRound2NegotiationField(agentABNegotiation, 'priority_rationale') }}</span>
                      <span class="result-line">推理共识：{{ displayRound2NegotiationField(agentABNegotiation, 'consensus') }}</span>
                      <span class="result-line">推理分歧：{{ displayRound2NegotiationField(agentABNegotiation, 'deviation') }}</span>
                    </template>
                    <template v-else>
                      <template v-if="abBfTriple">
                        <span class="result-line">推理结果：</span>
                        <span class="result-line result-line-nested">场景描述：{{ displayBfField(abBfTriple.detailed_description) }}</span>
                        <span class="result-line result-line-nested">目标类别：{{ displayBfField(abBfTriple.target_class) }}</span>
                        <span class="result-line result-line-nested">目标数量：{{ displayBfField(abBfTriple.target_count) }}</span>
                      </template>
                      <template v-else>
                        <span class="result-line">推理结果：{{ agentABNegotiation.battlefield_analysis || agentABNegotiation.final_model_name || '***' }}</span>
                      </template>
                      <span class="result-line">推理共识：{{ agentABNegotiation.negotiation_basis || '***' }}</span>
                      <span class="result-line">推理分歧：{{ agentABNegotiation.deviation || '***' }}</span>
                    </template>
                  </p>
                  <p v-else class="agent-result">{{ agentABNegotiation || '推理结果：***\n推理共识：***\n推理分歧：***' }}</p>
                </div>
              </div>

              <!-- 智能体B-C协商 -->
              <div class="agent-box negotiation">
                <div class="agent-header">
                  <img class="agent-avatar" :src="require('@/assets/images/step3/BC.svg')" alt="Agents" />
                  <!-- <div class="negotiation-sign">⇄</div>
                  <img class="agent-avatar" :src="require('@/assets/images/step3/agents.png')" alt="Agents" /> -->
                  <div class="agent-label">智能体B</div>
                </div>
                <div class="agent-content">
                  <div v-if="isLoadingRound2" class="panel-overlay">等待一轮协商结果...</div>
                  <p v-if="typeof agentBCNegotiation === 'object' && agentBCNegotiation !== null" class="agent-result">
                    <template v-if="selectedDetailType === 'compare'">
                      <span class="result-line">优先级排序：{{ displayRound2PriorityOrdering(agentBCNegotiation) }}</span>
                      <span class="result-line">优先级依据：{{ displayRound2NegotiationField(agentBCNegotiation, 'priority_rationale') }}</span>
                      <span class="result-line">推理共识：{{ displayRound2NegotiationField(agentBCNegotiation, 'consensus') }}</span>
                      <span class="result-line">推理分歧：{{ displayRound2NegotiationField(agentBCNegotiation, 'deviation') }}</span>
                    </template>
                    <template v-else>
                      <template v-if="bcBfTriple">
                        <span class="result-line">推理结果：</span>
                        <span class="result-line result-line-nested">场景描述：{{ displayBfField(bcBfTriple.detailed_description) }}</span>
                        <span class="result-line result-line-nested">目标类别：{{ displayBfField(bcBfTriple.target_class) }}</span>
                        <span class="result-line result-line-nested">目标数量：{{ displayBfField(bcBfTriple.target_count) }}</span>
                      </template>
                      <template v-else>
                        <span class="result-line">推理结果：{{ agentBCNegotiation.battlefield_analysis || agentBCNegotiation.final_model_name || '***' }}</span>
                      </template>
                      <span class="result-line">推理共识：{{ agentBCNegotiation.negotiation_basis || '***' }}</span>
                      <span class="result-line">推理分歧：{{ agentBCNegotiation.deviation || '***' }}</span>
                    </template>
                  </p>
                  <p v-else class="agent-result">{{ agentBCNegotiation || '推理结果：***\n推理共识：***\n推理分歧：***' }}</p>
                </div>
              </div>

              <!-- 智能体C-A协商 -->
              <div class="agent-box negotiation">
                <div class="agent-header">
                  <img class="agent-avatar" :src="require('@/assets/images/step3/CA.svg')" alt="Agents" />
                  <!-- <div class="negotiation-sign">⇄</div>
                  <img class="agent-avatar" :src="require('@/assets/images/step3/agents.png')" alt="Agents" /> -->
                  <div class="agent-label">智能体C</div>
                </div>
                <div class="agent-content">
                  <div v-if="isLoadingRound2" class="panel-overlay">等待一轮协商结果...</div>
                  <p v-if="typeof agentCANegotiation === 'object' && agentCANegotiation !== null" class="agent-result">
                    <template v-if="selectedDetailType === 'compare'">
                      <span class="result-line">优先级排序：{{ displayRound2PriorityOrdering(agentCANegotiation) }}</span>
                      <span class="result-line">优先级依据：{{ displayRound2NegotiationField(agentCANegotiation, 'priority_rationale') }}</span>
                      <span class="result-line">推理共识：{{ displayRound2NegotiationField(agentCANegotiation, 'consensus') }}</span>
                      <span class="result-line">推理分歧：{{ displayRound2NegotiationField(agentCANegotiation, 'deviation') }}</span>
                    </template>
                    <template v-else>
                      <template v-if="caBfTriple">
                        <span class="result-line">推理结果：</span>
                        <span class="result-line result-line-nested">场景描述：{{ displayBfField(caBfTriple.detailed_description) }}</span>
                        <span class="result-line result-line-nested">目标类别：{{ displayBfField(caBfTriple.target_class) }}</span>
                        <span class="result-line result-line-nested">目标数量：{{ displayBfField(caBfTriple.target_count) }}</span>
                      </template>
                      <template v-else>
                        <span class="result-line">推理结果：{{ agentCANegotiation.battlefield_analysis || agentCANegotiation.final_model_name || '***' }}</span>
                      </template>
                      <span class="result-line">推理共识：{{ agentCANegotiation.negotiation_basis || '***' }}</span>
                      <span class="result-line">推理分歧：{{ agentCANegotiation.deviation || '***' }}</span>
                    </template>
                  </p>
                  <p v-else class="agent-result">{{ agentCANegotiation || '推理结果：***\n推理共识：***\n推理分歧：***' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：协商结果 -->
      <div class="right-column">
        <div class="panel-right-bias-button">
          <button
            class="btn-bias-detect"
            @click="handleBiasDetect"
            :disabled="!pendingNegotiationResult || isRightLoadingAccuracy || isLoadingRound1 || isLoadingRound2"
          >
            群体协商偏差检测
          </button>
        </div>
        <div class="panel-right-top">
          <div class="panel-content">
            <div class="panel-header header-results title-one-line">
              <span>群体协商认知偏差检测结果</span>
            </div>
            <div v-if="isRightLoadingResults" class="panel-overlay">计算中...</div>
            <template v-else>
              <div class="result-section result-section-main">
                <div class="section-content unified-scroll">
                  <template v-if="selectedDetailType === 'compare'">
                    <div class="section-sub">共识摘要：</div>
                    <p class="result-text" style="white-space: pre-wrap;">{{ deviationReportText || '***' }}</p>
                    <div class="unified-divider"></div>
                    <div class="section-sub">分歧点：</div>
                    <p class="result-text" style="white-space: pre-wrap;">{{ compareDeviationDisagreementPoints }}</p>
                    <div class="unified-divider"></div>
                    <div class="section-sub">分歧分析及原因：</div>
                    <p class="result-text" style="white-space: pre-wrap;">{{ compareDeviationDifferentReason }}</p>
                  </template>
                  <template v-else>
                    <div class="section-sub">共识摘要：</div>
                    <p class="result-text" v-html="formattedConsensusSummary || '***'"></p>
                    <div class="unified-divider"></div>
                    <div class="section-sub">分歧点：</div>
                    <template v-if="deviationAnalysisText || deviationReportText">
                      <div v-if="deviationAnalysisText">
                        <div class="section-sub">分歧分析</div>
                        <p class="result-text" style="white-space: pre-wrap;">{{ deviationAnalysisText }}</p>
                      </div>
                      <div v-if="deviationReportText" :style="deviationAnalysisText ? { marginTop: '10px' } : {}">
                        <div class="section-sub">偏差报告</div>
                        <p class="result-text" style="white-space: pre-wrap;">{{ deviationReportText }}</p>
                      </div>
                    </template>
                    <p v-else class="result-text">***</p>
                  </template>
                </div>
              </div>
            </template>
          </div>
        </div>

        <div class="panel-right-bottom" style="margin-top: -10px;">
          <div class="panel-content">
            <div v-if="isRightLoadingResults" class="panel-overlay">计算中...</div>
            <template v-else>
              <div class="final-result-section">
                <div class="final-result-title">协商结果</div>
                <div class="final-model-display">
                  <template v-if="selectedDetailType === 'compare'">
                    <p class="final-model-text">最终优先级排序：{{ formattedFinalPriorityOrdering || '***' }}</p>
                  </template>
                  <p
                    v-else
                    class="final-model-text"
                    style="white-space: pre-wrap;"
                  >{{ finalResult || '请完成「开始群体协商」并点击「群体协商偏差检测」后查看' }}</p>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- 偏差检测准确率面板 -->
        <div class="panel-right-accuracy">
          <template v-if="isRightLoadingAccuracy">
            <div class="loading-spinner">计算中...</div>
          </template>
          <template v-else>
            <div class="accuracy-content">
              <span class="accuracy-label">偏差识别准确率</span>
              <span class="accuracy-value">
                <template v-if="accuracyRate !== '—' && accuracyRate !== null && accuracyRate !== undefined && accuracyRate !== ''">
                  {{ formattedAccuracyRate }}%
                </template>
                <template v-else>
                  N/A
                </template>
              </span>
            </div>
          </template>
        </div>

        <!-- 结果导出按钮 -->
        <div class="panel-right-button">
          <button @click="exportResults" class="btn-export-result" :disabled="isLoading">
            结果导出
          </button>
        </div>
      </div>
    </div>

    <!-- 分组图片点击放大 -->
    <div
      v-if="groupImageLightboxUrl"
      class="group-image-lightbox"
      role="dialog"
      aria-modal="true"
      @click.self="closeGroupImageLightbox"
    >
      <button
        type="button"
        class="group-image-lightbox-close"
        aria-label="关闭"
        @click="closeGroupImageLightbox"
      >
        ×
      </button>
      <img
        :src="groupImageLightboxUrl"
        alt=""
        class="group-image-lightbox-img"
        @click.stop
      />
    </div>
  </div>
</template><script>
import axios from 'axios';
// 与 TargetDetection.vue 一致：多模态目标检测服务（视频列表 / 文件流）
const IMAGE_API_URL = 'http://10.109.253.71:5237';
const MODULE3_BASE = (process.env.VUE_APP_MODULE3_BASE || '').replace(/\/$/, '');
const MODULE3_REFINE_URL = MODULE3_BASE
  ? `${MODULE3_BASE}/refine`
  : '/module3/refine';
const MODULE3_EXPORT_URL = MODULE3_BASE
  ? `${MODULE3_BASE}/export`
  : '/module3/export';
/** 图片分组偏差检测：偏差识别准确率固定值及延迟展示时长 */
const MODULE3_IMAGE_FIXED_ACCURACY = 89.16;
const MODULE3_BIAS_ACCURACY_DELAY = 2 * 60 * 1000;
/** 图片分组一轮/二轮结果分步展示：随机 3–5 秒 */
function randomRoundDisplayDelayMs() {
  return 3000 + Math.floor(Math.random() * 2001);
}
/** 视频群体协商 POST：JSON 里绝对路径前缀换为 `..`，其余原样 */
const MODULE3_VIDEO_IMAGE_PATH_PREFIX = '/home/wuzhixuan/Project/PCJC';
function toModule3VideoImagePath(serverPath) {
  const s = serverPath == null ? '' : String(serverPath).trim();
  if (!s) return s;
  return s.startsWith(MODULE3_VIDEO_IMAGE_PATH_PREFIX)
    ? '..' + s.slice(MODULE3_VIDEO_IMAGE_PATH_PREFIX.length)
    : s;
}
// img_path地址（模块一传参）
// const IMG_PATH_URL = localStorage.getItem('imagePath') || '/home/wuzhixuan/Project/PCJC/module2/images_frame/B-2幽灵-2.png';
// const DEVICE_TYPE = localStorage.getItem('deviceType') || '飞机';
let IMG_PATH_URL = '/home/wuzhixuan/Project/PCJC/module2/images_frame/B-2幽灵-2.png';
let DEVICE_TYPE = '飞机';
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
    }
console.log('IMG_PATH_URL:', IMG_PATH_URL, 'DEVICE_TYPE:', DEVICE_TYPE)
export default {
  name: 'GroupNegotiation',
  data() {
    return {
      fullWidth: window.innerWidth,
      fullHeight: window.innerHeight,
      originalImageURL: null,
      attributeInfo: "各种属性信息的文本显示",
      attributeInfoArray: ['Value 1', 'Value 2', 'Value 3', 'Value 4'],
      attributeInfoList: [],
      // 一轮推理结果
      agentARound1Result: "",
      agentBRound1Result: "",
      agentCRound1Result: "",
      // 二轮协商结果
      agentABNegotiation: "",
      agentBCNegotiation: "",
      agentCANegotiation: "",
      deviationProcess: "",
      finalResult: '',
      /** 仅图片分组 + 偏差检测后：final_battlefield_analysis 解析为对象时用于「协商结果」三行展示；视频模式恒为 null */
      finalBattlefieldTriple: null,
      isLoading: false,
      accuracyRate: '—',
      color: '',
      kind: '',
      shape: '',
      ground_truth: '',
      isApiLoaded: false, // 新增：接口加载状态，控制按钮禁用
      consensusSummary: "",
      /** 图片模式：后端 final_priority_ordering */
      finalPriorityOrdering: null,
      /** final_review，分项展示，避免与对象类型 .replace 冲突 */
      deviationAnalysis: '',
      deviationReport: '',
      disagreementPoints: '',
      differentModelAndReason: '',
      disagreementPointsHighlight: '',
      /** 图片模式：final_review.priority_importance_analysis */
      finalPriorityAssessment: '',
      finalImportanceImpact: '',
      // compare 图片列表/详情相关数据
      compareFiles: [],
      /** groups_manifest.json 解析结果：{ folder, images }[] */
      groupDatasetGroups: [],
      /** 当前选中分组内按序号排序后的图片文件名（如 .jpg） */
      selectedGroupImageFiles: [],
      /** 分组详情内点击图片时的放大预览 URL */
      groupImageLightboxUrl: null,
      compareView: 'list', // 'list' | 'detail'
      selectedCompareFile: null,
      targetDetectionVideos: [],
      selectedVideoName: null,
      selectedVideoUrl: null,
      selectedDetailType: null, // 'compare' | 'video'
      selectedSourceKey: null,
      compareMessage: '暂无分组数据',
      /** 列表区：点击标题展开/收起，互不干扰（进入页面默认收起） */
      imageSourceListExpanded: false,
      videoSourceListExpanded: false,
      /** static/order.json 指令分类与分组 */
      orderCategories: [],
      instructionSetExpanded: false,
      expandedOrderCategoryIndices: {},
      /** 指令集合选中时，在「先验知识传播结果」详情区展示的 instruction 文案 */
      orderInstructionText: '',
      /** 视频：从 /static/video_results 对应 JSON 解析出、用于 module3 请求的字段 */
      videoModule3RequestPayload: null,
      /**
       * 图片模式一轮展示：{ a,b,c } 各为 { model_name: '-', reason: raw_response }；
       * 来自 grouped_dataset/{folder}/{folder}_view_A/B/C_composite.json；
       * 接口仍用 module3 返回填二轮；仅 round1 展示走静态 JSON。
       */
      imageModeRound1FromStatic: null,

      // 视频相关数据（此页面已不展示，但保留兼容）
      videoUrl: null,
      videoMessage: '',
      // 中间区域加载与显示控制
      isLoadingRound1: false,
      isLoadingRound2: false,
      isRound1Displayed: false,
      isRound2Displayed: false,
      // 右侧分步显示控制
      isRightLoadingResults: false,
      isRightLoadingAccuracy: false,
      pendingNegotiationResult: null, // 新增：暂存群体协商结果
      accuracyTimer: null, // 准确率计时器
      round1DisplayTimer: null,
      round2DisplayTimer: null
    };
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('keydown', this.handleGroupImageLightboxKeydown);
    // 注意：不在这里清除定时器，让计时在页面切换后继续
    // 只有在计时完成时才清除localStorage
  },
  computed: {
    imageSourceItems() {
      return (this.compareFiles || []).map((name, idx) => ({
        key: `compare:${name || idx}`,
        type: 'compare',
        name
      }));
    },
    videoSourceItems() {
      return (this.targetDetectionVideos || [])
        .map((video, idx) => {
          if (typeof video === 'string') {
            const name = video;
            return {
              key: `video:${name || idx}`,
              type: 'video',
              name
            };
          }
          const name = video && video.name;
          return {
            key: `video:${name || idx}`,
            type: 'video',
            name,
            id: video && video.id,
            videoUrl: video && video.videoUrl,
            path: video && video.path
          };
        })
        .filter(item => !!item.name);
    },
    /** 合并列表（与分区列表顺序一致，便于其它逻辑统一长度判断） */
    sourceItems() {
      return [...this.imageSourceItems, ...this.videoSourceItems];
    },
    sourceListMessage() {
      if (this.sourceItems.length > 0) return '';
      if (this.compareMessage && this.videoMessage) {
        return `${this.compareMessage}；${this.videoMessage}`;
      }
      return this.compareMessage || this.videoMessage || '暂无可展示数据';
    },
    // 格式化共识摘要，将需要标红的文字加上红色样式
    formattedConsensusSummary() {
      let summary = this.toDisplayString(this.consensusSummary);
      const dp = this.toDisplayString(this.deviationAnalysis);
      const dmr = this.toDisplayString(this.differentModelAndReason);

      if (dp && dp !== '无') {
        try {
          summary = summary.replace(
            new RegExp(dp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
            `<span style="color: red; font-weight: bold;">${dp}</span>`
          );
        } catch (e) {
          /* ignore bad regex */
        }
      }
      if (dmr && dmr !== '无') {
        try {
          summary = summary.replace(
            new RegExp(dmr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
            `<span style="color: red; font-weight: bold;">${dmr}</span>`
          );
        } catch (e) {
          /* ignore */
        }
      }
      return summary;
    },
    // 格式化准确率显示（兼容 0.927、92.7、"92.7%" 等）
    formattedAccuracyRate() {
      if (this.accuracyRate === '—' || this.accuracyRate === null || this.accuracyRate === undefined || this.accuracyRate === '') {
        return 'N/A';
      }
      const raw = typeof this.accuracyRate === 'number' ? this.accuracyRate : String(this.accuracyRate).trim();
      const numValue = parseFloat(String(raw).replace(/%$/, ''));
      if (!isNaN(numValue)) {
        if (numValue <= 1 && numValue >= 0) {
          return (numValue * 100).toFixed(2);
        }
        return numValue.toFixed(2);
      }
      return String(this.accuracyRate);
    },
    // 图片逻辑保持不变；视频需先成功展示先验知识信息后才允许开始群体协商
    canStartNegotiation() {
      if (this.selectedDetailType === 'compare' && !!this.selectedCompareFile) {
        return true;
      }
      if (this.selectedDetailType === 'video' && !!this.selectedVideoName) {
        return !!this.videoModule3RequestPayload;
      }
      return false;
    },
    deviationAnalysisText() {
      const v = this.deviationAnalysis;
      // 分歧分析区仅展示 deviation_analysis 里的两个关键字段
      if (v && typeof v === 'object') {
        const points = this.toDisplayString(v.disagreement_points);
        const reason = this.toDisplayString(
          v.different_analysis_and_reason != null
            ? v.different_analysis_and_reason
            : v.differentModelAndReason
        );
        const modelReason = this.toDisplayString(
          v.different_model_and_reason != null
            ? v.different_model_and_reason
            : this.differentModelAndReason
        );
        const lines = [];
        if (points) lines.push(`分歧点: ${points}`);
        if (reason) lines.push(`分歧分析及原因: ${reason}`);
        if (modelReason) lines.push(`分歧原因: ${modelReason}`);
        return lines.join('\n');
      }
      return this.toDisplayString(v);
    },
    deviationReportText() {
      return this.toDisplayString(this.deviationReport);
    },
    /** 图片模式偏差检测：final_priority_ordering → 名称(分数%)>… */
    formattedFinalPriorityOrdering() {
      const v = this.finalPriorityOrdering;
      if (v == null || v === '') return '';
      if (Array.isArray(v)) {
        return this.formatPriorityOrderingArray(v);
      }
      const s = this.toDisplayString(v).trim();
      return s !== '' ? s : '';
    },
    /** 图片模式偏差检测：final_review.deviation_analysis.disagreement_points */
    compareDeviationDisagreementPoints() {
      const v = this.deviationAnalysis;
      if (v && typeof v === 'object' && v.disagreement_points != null) {
        const s = this.toDisplayString(v.disagreement_points).trim();
        return s !== '' ? s : '***';
      }
      return '***';
    },
    /** 图片模式偏差检测：final_review.deviation_analysis.different_analysis_and_reason */
    compareDeviationDifferentReason() {
      const v = this.deviationAnalysis;
      if (v && typeof v === 'object' && v.different_analysis_and_reason != null) {
        const s = this.toDisplayString(v.different_analysis_and_reason).trim();
        return s !== '' ? s : '***';
      }
      return '***';
    },
    /** 图片分组模式：二轮 battlefield_analysis 可解析为对象时供模板展开为三行 */
    abBfTriple() {
      if (this.selectedDetailType !== 'compare') return null;
      return this.round2BattlefieldTriple(this.agentABNegotiation);
    },
    bcBfTriple() {
      if (this.selectedDetailType !== 'compare') return null;
      return this.round2BattlefieldTriple(this.agentBCNegotiation);
    },
    caBfTriple() {
      if (this.selectedDetailType !== 'compare') return null;
      return this.round2BattlefieldTriple(this.agentCANegotiation);
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    document.addEventListener('keydown', this.handleGroupImageLightboxKeydown);
    // 页面加载时加载 compare 文件列表（不再展示视频）
    this.loadCompareFiles();
    this.loadTargetDetectionVideos();
    this.loadOrderCategories();
    
    // 从localStorage读取预测信息
    this.loadPredictInfoFromStorage();
    // 模块三结果不在此页首屏从 localStorage 回显，须「选图 → 开始群体协商 → 接口成功」后再展示
    this.checkAccuracyTimer();
  },
  methods: {
    /**
     * 仅当未处于“compare 图片详情 / 视频详情”时，允许模块二预测信息覆盖左侧属性区。
     * 目的：避免先验 JSON 或视频 result 被后续异步回包覆盖。
     */
    canOverwriteAttributeInfo() {
      if (this.selectedDetailType === 'compare' && this.selectedCompareFile) return false;
      if (this.selectedDetailType === 'video' && this.selectedVideoName) return false;
      return true;
    },
    toDisplayString(val) {
      if (val == null) return '';
      if (typeof val === 'string') return val;
      if (typeof val === 'object') {
        try {
          return JSON.stringify(val);
        } catch (e) {
          return String(val);
        }
      }
      return String(val);
    },
    clearRoundDisplayTimers() {
      if (this.round1DisplayTimer) {
        clearTimeout(this.round1DisplayTimer);
        this.round1DisplayTimer = null;
      }
      if (this.round2DisplayTimer) {
        clearTimeout(this.round2DisplayTimer);
        this.round2DisplayTimer = null;
      }
    },
    /** 清空中间/右侧协商展示（不清理 localStorage；切换图片或发起新请求前调用） */
    clearNegotiationDisplay() {
      this.clearRoundDisplayTimers();
      this.agentARound1Result = '';
      this.agentBRound1Result = '';
      this.agentCRound1Result = '';
      this.agentABNegotiation = '';
      this.agentBCNegotiation = '';
      this.agentCANegotiation = '';
      this.consensusSummary = '';
      this.finalPriorityOrdering = null;
      this.deviationAnalysis = '';
      this.deviationReport = '';
      this.disagreementPoints = '';
      this.disagreementPointsHighlight = '';
      this.finalResult = '';
      this.pendingNegotiationResult = null;
      this.isRound1Displayed = false;
      this.isRound2Displayed = false;
      this.isRightLoadingResults = false;
      this.accuracyRate = '—';
      this.imageModeRound1FromStatic = null;
      this.finalBattlefieldTriple = null;
      this.finalPriorityAssessment = '';
      this.finalImportanceImpact = '';
    },
    /** 模块三返回的 accuracy_metrics.accuracy */
    getAccuracyFromModule3Data(data) {
      if (!data || typeof data !== 'object') return null;
      const m = data.accuracy_metrics;
      if (!m || typeof m !== 'object') return null;
      const a = m.accuracy;
      if (a === undefined || a === null || a === '') return null;
      return a;
    },
    getInitialAnalysesPayload(data) {
      if (!data || typeof data !== 'object') return null;
      return data.initial_analyses || (data.negotiation_details && data.negotiation_details.initial_analyses) || null;
    },
    getNegotiationResultsPayload(data) {
      if (!data || typeof data !== 'object') return null;
      return data.negotiation_results || (data.negotiation_details && data.negotiation_details.negotiation_results) || null;
    },
    /**
     * 兼容后端返回包装：
     * 1) 直接返回业务对象
     * 2) { data: {...业务对象...} }
     */
    normalizeModule3Payload(raw) {
      if (typeof raw === 'string') {
        try {
          raw = JSON.parse(raw);
        } catch (e) {
          return raw;
        }
      }
      if (!raw || typeof raw !== 'object') return raw;
      const hasDirectPayload =
        raw.initial_analyses ||
        raw.negotiation_results ||
        raw.negotiation_details ||
        raw.final_review ||
        raw.final_priority_ordering ||
        raw.final_battlefield_analysis;
      if (hasDirectPayload) return raw;
      if (raw.data && typeof raw.data === 'object') return this.normalizeModule3Payload(raw.data);
      if (raw.result && typeof raw.result === 'object') return this.normalizeModule3Payload(raw.result);
      if (raw.payload && typeof raw.payload === 'object') return this.normalizeModule3Payload(raw.payload);
      return raw;
    },
    pickFromAgentMap(map) {
      if (!map || typeof map !== 'object') {
        return { a: '', b: '', c: '' };
      }
      const pick = (keys) => {
        for (let i = 0; i < keys.length; i++) {
          const v = map[keys[i]];
          if (v !== undefined && v !== null && v !== '') return v;
        }
        return '';
      };
      const values = Object.values(map).filter(v => v !== undefined && v !== null && v !== '');
      const fallbackByIndex = (idx) => (values[idx] !== undefined ? values[idx] : '');
      return {
        a: pick(['Agent_A', 'agent_a', 'A', '智能体A', '智能体_A']) || fallbackByIndex(0),
        b: pick(['Agent_B', 'agent_b', 'B', '智能体B', '智能体_B']) || fallbackByIndex(1),
        c: pick(['Agent_C', 'agent_c', 'C', '智能体C', '智能体_C']) || fallbackByIndex(2)
      };
    },
    /** 展示 battlefield_analysis 内字段；空则为 *** */
    displayBfField(v) {
      if (v == null || v === '') return '***';
      const s = String(v).trim();
      return s !== '' ? s : '***';
    },
    /** priority_ordering / final_priority_ordering 数组 → 名称(分数%)>名称(分数%)… */
    formatPriorityOrderingArray(v) {
      if (!Array.isArray(v) || v.length === 0) return '';
      const parts = v.map(item => {
        if (item && typeof item === 'object') {
          const name = item.name != null ? String(item.name).trim() : '';
          const score = item.priority_score;
          if (name && score != null && score !== '') {
            const num = Number(score);
            const pct = Number.isFinite(num)
              ? (Number.isInteger(num) ? String(num) : String(num))
              : String(score).trim();
            return `${name}(${pct}%)`;
          }
          return name || '';
        }
        return item != null ? String(item).trim() : '';
      }).filter(Boolean);
      return parts.length ? parts.join('>') : '';
    },
    /** 图片模式二轮：展示 negotiation_results 对应智能体的 priority_ordering（字符串或数组） */
    displayRound2PriorityOrdering(negot) {
      if (!negot || typeof negot !== 'object') return '***';
      const po = negot.priority_ordering;
      if (po == null || po === '') return '***';
      if (typeof po === 'string') {
        const s = po.trim();
        return s !== '' ? s : '***';
      }
      const s = this.formatPriorityOrderingArray(po);
      return s || '***';
    },
    /** 图片模式二轮：展示 negotiation_results 中 priority_rationale / consensus / deviation */
    displayRound2NegotiationField(negot, field) {
      if (!negot || typeof negot !== 'object') return '***';
      const v = negot[field];
      if (v == null || v === '') return '***';
      if (Array.isArray(v)) {
        const items = v.map(x => String(x).trim()).filter(Boolean);
        return items.length ? items.join('、') : '***';
      }
      const s = this.toDisplayString(v).trim();
      return s !== '' ? s : '***';
    },
    /** 将 battlefield_analysis 规范为普通对象（支持 JSON 字符串） */
    parseBattlefieldAnalysisObject(ba) {
      if (ba == null || ba === '') return null;
      if (typeof ba === 'object' && !Array.isArray(ba)) return ba;
      if (typeof ba === 'string') {
        const t = ba.trim();
        if (!t) return null;
        if (t.startsWith('{')) {
          try {
            const p = JSON.parse(t);
            if (p && typeof p === 'object' && !Array.isArray(p)) return p;
          } catch (e) {
            return null;
          }
        }
        return null;
      }
      return null;
    },
    /** 图片分组且 battlefield_analysis 为结构化对象时返回该对象，否则 null（模板走原单行推理结果） */
    round2BattlefieldTriple(negot) {
      if (!negot || typeof negot !== 'object') return null;
      return this.parseBattlefieldAnalysisObject(negot.battlefield_analysis);
    },
    /**
     * 从 module3 根对象填充界面（与 localStorage module3Res 结构一致）
     * @param {object} data
     * @param {object} [opts]
     * @param {boolean} [opts.round1] 一轮智能体
     * @param {boolean} [opts.round2] 二轮智能体
     * @param {boolean} [opts.review] final_review + 分歧子段
     * @param {boolean} [opts.finalBlock] 协商结果（final_battlefield_analysis 优先）
     * @param {boolean} [opts.accuracy] 是否写入 accuracy_metrics.accuracy → 偏差识别准确率
     */
    applyModule3Fields(data, opts) {
      const o = Object.assign(
        { round1: true, round2: true, review: true, finalBlock: true, accuracy: true },
        opts || {}
      );
      if (!data || typeof data !== 'object') return;

      if (o.round1) {
        if (this.selectedDetailType === 'compare' && this.imageModeRound1FromStatic) {
          const s = this.imageModeRound1FromStatic;
          this.agentARound1Result = s.a || '';
          this.agentBRound1Result = s.b || '';
          this.agentCRound1Result = s.c || '';
        } else {
          const init = this.getInitialAnalysesPayload(data);
          const r1 = this.pickFromAgentMap(init);
          this.agentARound1Result = r1.a || '';
          this.agentBRound1Result = r1.b || '';
          this.agentCRound1Result = r1.c || '';
        }
      }
      if (o.round2) {
        const res = this.getNegotiationResultsPayload(data);
        const r2 = this.pickFromAgentMap(res);
        // 兼容后端字段拼写：negotation_basis -> negotiation_basis
        const normalizeNegotiation = (v) => {
          if (!v || typeof v !== 'object') return v;
          if (
            (v.negotiation_basis === undefined || v.negotiation_basis === null || v.negotiation_basis === '') &&
            v.negotation_basis !== undefined
          ) {
            return Object.assign({}, v, { negotiation_basis: v.negotation_basis });
          }
          return v;
        };
        this.agentABNegotiation = normalizeNegotiation(r2.a || '');
        this.agentBCNegotiation = normalizeNegotiation(r2.b || '');
        this.agentCANegotiation = normalizeNegotiation(r2.c || '');
      }
      if (o.review) {
        const fr = data.final_review;
        this.consensusSummary = fr && fr.consensus_summary != null ? fr.consensus_summary : '';
        this.finalPriorityOrdering =
          data.final_priority_ordering != null ? data.final_priority_ordering : null;
        this.deviationAnalysis = fr && fr.deviation_analysis != null ? fr.deviation_analysis : '';
        this.deviationReport =
          fr && fr.deviation_analysis_report != null
            ? fr.deviation_analysis_report
            : data.deviation_analysis_report != null
              ? data.deviation_analysis_report
              : '';
        this.differentModelAndReason =
          fr &&
          fr.deviation_analysis &&
          fr.deviation_analysis.different_model_and_reason != null
            ? fr.deviation_analysis.different_model_and_reason
            : '';
        this.disagreementPoints = this.toDisplayString(this.deviationAnalysis);
        this.disagreementPointsHighlight = '';
        this.finalPriorityAssessment = '';
        this.finalImportanceImpact = '';
        if (this.selectedDetailType === 'compare' && fr && fr.priority_importance_analysis) {
          const pia = fr.priority_importance_analysis;
          if (pia.priority_assessment != null && pia.priority_assessment !== '') {
            this.finalPriorityAssessment = this.toDisplayString(pia.priority_assessment);
          }
          if (pia.importance_impact != null && pia.importance_impact !== '') {
            this.finalImportanceImpact = this.toDisplayString(pia.importance_impact);
          }
        }
      }
      if (o.finalBlock) {
        this.finalBattlefieldTriple = null;
        if (data.final_battlefield_analysis != null && data.final_battlefield_analysis !== '') {
          if (this.selectedDetailType === 'compare') {
            const triple = this.parseBattlefieldAnalysisObject(data.final_battlefield_analysis);
            if (triple) {
              this.finalBattlefieldTriple = {
                detailed_description: triple.detailed_description,
                target_class: triple.target_class,
                target_count: triple.target_count
              };
              this.finalResult = '';
            } else {
              this.finalResult = this.toDisplayString(data.final_battlefield_analysis);
            }
          } else {
            this.finalResult = this.toDisplayString(data.final_battlefield_analysis);
          }
        } else if (data.final_model_name != null && data.final_model_name !== '') {
          this.finalResult = this.toDisplayString(data.final_model_name);
        }
      }
      if (o.accuracy) {
        const acc = this.getAccuracyFromModule3Data(data);
        if (acc !== null) {
          this.accuracyRate = acc;
        }
      }
    },
    // 导航到首页
    navigateHome() {
      this.$router.push('/');
    },
    // 返回上一页
    navigateBack() {
      this.$router.push('/prior-knowledge');
    },
    // 导航到下一页
    navigateNext() {
      // 这里可以设置下一个页面的路由
      this.$router.push('/decisionmaking');
    },
    // 从localStorage加载预测信息
    loadPredictInfoFromStorage() {
      try {
        const storedPredictInfo = localStorage.getItem('predictInfoList');
        if (storedPredictInfo) {
          const predictInfoList = JSON.parse(storedPredictInfo);
          console.log('从localStorage读取到预测信息:', predictInfoList);
          
          // 从预测信息中提取所需的数据
          const predictData = {};
          predictInfoList.forEach(item => {
            if (item.label.includes('小类')) predictData.kind = item.value;
            if (item.label.includes('火力')) predictData.firepower = item.value;
            if (item.label.includes('颜色')) predictData.color = item.value;
            if (item.label.includes('形状')) predictData.shape = item.value;
            if (item.label.includes('尺寸')) predictData.size = item.value;
            if (item.label.includes('动力')) predictData.power = item.value;
            if (item.label.includes('轮廓')) predictData.outline = item.value;
          });

          // 设置属性信息，去除括号及其内容
          if (this.canOverwriteAttributeInfo()) {
            this.attributeInfoList = [
              `小类信息：${predictData.kind ? predictData.kind.replace(/\s*\([^)]*\)/g, '') : '未知'}`,
              `火力信息：${predictData.firepower ? predictData.firepower.replace(/\s*\([^)]*\)/g, '') : '未知'}`,
              `颜色信息：${predictData.color ? predictData.color.replace(/\s*\([^)]*\)/g, '') : '未知'}`,
              `形状信息：${predictData.shape ? predictData.shape.replace(/\s*\([^)]*\)/g, '') : '未知'}`,
              `尺寸信息：${predictData.size ? predictData.size.replace(/\s*\([^)]*\)/g, '') : '未知'}`,
              `动力信息：${predictData.power ? predictData.power.replace(/\s*\([^)]*\)/g, '') : '未知'}`,
              `轮廓信息：${predictData.outline ? predictData.outline.replace(/\s*\([^)]*\)/g, '') : '未知'}`,
            ];
            // 保留原来的 attributeInfo 用于兼容
            this.attributeInfo = this.attributeInfoList.join('\n');
          }
          
          // 设置其他需要的变量
          // 去除括号及其内容
          this.color = predictData.color;
          this.kind = predictData.kind;
          this.shape = predictData.shape;

          // 安全读取 module2Res，避免在 localStorage 中缺失或结构不符合时抛出异常
          let module2Res = null;
          try {
            const module2ResStr = localStorage.getItem('module2Res');
            if (module2ResStr) {
              module2Res = JSON.parse(module2ResStr);
            }
          } catch (e) {
            console.warn('解析 module2Res 失败:', e);
            module2Res = null;
          }
          // 这里如果没有ground_truth，可以设置一个默认值或空值
          if (
            module2Res &&
            module2Res.result &&
            Array.isArray(module2Res.result) &&
            module2Res.result[0] &&
            Array.isArray(module2Res.result[0]) &&
            module2Res.result[0][0] &&
            module2Res.result[0][0].model
          ) {
            this.ground_truth = module2Res.result[0][0].model;
          } else {
            this.ground_truth = '';
          }
          
          this.isApiLoaded = true; // 数据加载完成，解锁按钮
        } else {
          console.warn('localStorage中没有找到预测信息');
          // 如果localStorage中没有数据，可以回退到原来的API请求
          this.fetchPredictInfoFromApi();
        }
      } catch (error) {
        console.error('读取localStorage数据失败:', error);
        // 出错时回退到API请求
        this.fetchPredictInfoFromApi();
      }
    },
    // 原有的API请求方法作为备用
    fetchPredictInfoFromApi() {
      axios.get('/module2/list', {
        params: {
          img_path: `${IMG_PATH_URL}`,
          device_type: `${DEVICE_TYPE}`
        }
      }).then(res => {
        const data = res.data;
        
        // 处理预测信息
        if (data.result && data.result.length > 0 && data.result[0].length > 0) {
          const predictData = data.result[0][0];
          if (this.canOverwriteAttributeInfo()) {
            this.attributeInfoList = [
              `小类信息：${predictData.kind || '未知'}`,
              `火力信息：${predictData.firepower || '未知'}`,
              `颜色信息：${predictData.color || '未知'}`,
              `形状信息：${predictData.shape || '未知'}`,
              `尺寸信息：${predictData.size || '未知'}`,
              `动力信息：${predictData.power || '未知'}`,
              `轮廓信息：${predictData.outline || '未知'}`,
            ];
            // 保留原来的 attributeInfo 用于兼容
            this.attributeInfo = this.attributeInfoList.join('\n');
          }
          this.color = predictData.color;
          this.kind = predictData.kind;
          this.shape = predictData.shape;
          this.ground_truth = predictData.model;
        }
        this.isApiLoaded = true; // 接口成功返回，解锁按钮
      }).catch(err => {
        console.error(err.response && err.response.data || err);
      });
    },

    /** 从文件名中提取末尾数字序号，用于分组内图片从左到右排序 */
    sortGroupedImageFilenames(filenames) {
      if (!Array.isArray(filenames)) return [];
      const scored = filenames.map(name => {
        const m = String(name).match(/_(\d+)\.[^.]+$/i);
        const n = m ? parseInt(m[1], 10) : NaN;
        return { name, n: Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER };
      });
      scored.sort((a, b) => a.n - b.n || String(a.name).localeCompare(String(b.name)));
      return scored.map(s => s.name);
    },
    // 加载 static/grouped_dataset 分组清单（groups_manifest.json）
    loadCompareFiles() {
      axios
        .get('/static/grouped_dataset/groups_manifest.json')
        .then(res => {
          const raw = res && res.data;
          let groups = raw && Array.isArray(raw.groups) ? raw.groups : [];
          groups = groups
            .filter(g => g && typeof g.folder === 'string' && Array.isArray(g.images))
            .slice()
            .sort((a, b) => {
              const na = parseInt(String(a.folder).replace(/\D/g, ''), 10) || 0;
              const nb = parseInt(String(b.folder).replace(/\D/g, ''), 10) || 0;
              return na - nb || String(a.folder).localeCompare(String(b.folder));
            });
          this.groupDatasetGroups = groups;
          this.compareFiles = groups.map(g => g.folder);
          if (this.compareFiles.length > 0) {
            this.compareMessage = '';
            console.log('[GroupNegotiation] grouped_dataset 列表已加载，分组数:', this.compareFiles.length);
          } else {
            this.compareMessage = '暂无分组数据（groups_manifest.json）';
            console.warn('[GroupNegotiation] groups_manifest.json 中 groups 为空或格式不对');
          }
        })
        .catch(err => {
          console.error('加载 groups_manifest.json 失败:', err);
          this.compareFiles = [];
          this.groupDatasetGroups = [];
          this.compareMessage = '加载分组清单失败';
        });
    },
    async loadTargetDetectionVideos() {
      this.videoMessage = '正在加载视频列表...';
      try {
        const response = await axios.get(`${IMAGE_API_URL}/api/video/list`);
        if (response.data && Array.isArray(response.data.videos)) {
          this.targetDetectionVideos = response.data.videos.map(vid => ({
            id: vid.id,
            name: vid.filename,
            path: vid.video_path,
            videoUrl: vid.video_url
          }));
          this.videoMessage = this.targetDetectionVideos.length > 0 ? '' : '暂无远程视频';
        } else {
          this.targetDetectionVideos = [];
          this.videoMessage = '暂无远程视频';
        }
      } catch (error) {
        console.error('获取视频列表失败:', error);
        this.targetDetectionVideos = [];
        this.videoMessage = '无法加载视频列表（检查网络或服务 ' + IMAGE_API_URL + '）';
      }
    },
    /** 与 TargetDetection.vue 选择视频时的 URL 规则一致（videoUrl / path / file/id） */
    buildTargetVideoPlaybackUrl(item) {
      if (!item || item.type !== 'video') return null;
      if (item.videoUrl) {
        if (item.videoUrl.startsWith('http://') || item.videoUrl.startsWith('https://')) {
          return item.videoUrl;
        }
        return `${IMAGE_API_URL}${item.videoUrl}`;
      }
      if (item.path) {
        if (item.path.startsWith('http://') || item.path.startsWith('https://')) {
          return item.path;
        }
        return `${IMAGE_API_URL}${item.path}`;
      }
      if (item.id != null && item.id !== '') {
        return `${IMAGE_API_URL}/api/video/file/${item.id}`;
      }
      return null;
    },
    toggleImageSourceList() {
      this.imageSourceListExpanded = !this.imageSourceListExpanded;
    },
    toggleVideoSourceList() {
      this.videoSourceListExpanded = !this.videoSourceListExpanded;
    },
    async loadOrderCategories() {
      const urls = ['/static/order.json', '/static/order'];
      for (const url of urls) {
        try {
          const res = await fetch(url, { cache: 'no-cache' });
          if (!res.ok) continue;
          const data = await res.json();
          const list = data && Array.isArray(data.categories) ? data.categories : [];
          this.orderCategories = list
            .filter(item => item && item.category)
            .map(item => ({
              category: String(item.category),
              groups: Array.isArray(item.groups)
                ? item.groups.map(g => String(g))
                : [],
              instruction: item.instruction != null ? String(item.instruction) : ''
            }));
          return;
        } catch (e) {
          console.warn('[GroupNegotiation] 加载指令集合失败:', url, e);
        }
      }
      this.orderCategories = [];
    },
    toggleInstructionSet() {
      this.instructionSetExpanded = !this.instructionSetExpanded;
    },
    isOrderCategoryExpanded(catIdx) {
      return !!this.expandedOrderCategoryIndices[catIdx];
    },
    toggleOrderCategory(catIdx) {
      const next = { ...this.expandedOrderCategoryIndices };
      if (next[catIdx]) {
        delete next[catIdx];
      } else {
        next[catIdx] = true;
      }
      this.expandedOrderCategoryIndices = next;
    },
    /** 指令集合末级：展示该分类 instruction + 对应 group 三张图（不占用图片/视频列表选中态） */
    async openOrderGroupItem(catIdx, groupName) {
      const cat = this.orderCategories[catIdx];
      if (!cat || !groupName) return;
      this.clearNegotiationDisplay();
      this.selectedSourceKey = `order:${groupName}`;
      this.orderInstructionText = cat.instruction || '';
      await this.openCompareImage(groupName);
    },
    handleGroupImageLightboxKeydown(e) {
      if (e.key === 'Escape' && this.groupImageLightboxUrl) {
        this.closeGroupImageLightbox();
      }
    },
    openGroupImageLightbox(fn) {
      if (!fn || !this.selectedCompareFile) return;
      this.groupImageLightboxUrl = `/static/grouped_dataset/${this.selectedCompareFile}/${fn}`;
    },
    closeGroupImageLightbox() {
      this.groupImageLightboxUrl = null;
    },
    openSourceItem(item) {
      if (!item || !item.type || !item.name) return;
      this.clearNegotiationDisplay();
      this.orderInstructionText = '';
      this.selectedSourceKey = item.key;
      this.compareView = 'detail';
      console.log('[GroupNegotiation] 点击列表项:', item);

      if (item.type === 'compare') {
        this.selectedDetailType = 'compare';
        this.selectedVideoName = null;
        this.selectedVideoUrl = null;
        this.videoModule3RequestPayload = null;
        this.openCompareImage(item.name);
        return;
      }

      this.closeGroupImageLightbox();
      this.orderInstructionText = '';
      this.selectedDetailType = 'video';
      this.selectedCompareFile = null;
      this.selectedGroupImageFiles = [];
      this.selectedVideoName = item.name;
      this.selectedVideoUrl = this.buildTargetVideoPlaybackUrl(item);
      this.loadVideoResultByName(item.name);
    },
    // 切换到分组详情（三张图 + 侧栏认知传播信息）
    async openCompareImage(folder) {
      this.closeGroupImageLightbox();
      console.log('[GroupNegotiation] 选中分组:', folder);
      const entry = (this.groupDatasetGroups || []).find(g => g.folder === folder);
      if (!entry) {
        this.selectedGroupImageFiles = [];
        this.attributeInfoList = ['未在 groups_manifest.json 中找到该分组'];
        this.attributeInfo = this.attributeInfoList.join('\n');
        return;
      }
      const sorted = this.sortGroupedImageFilenames(entry.images);
      this.selectedGroupImageFiles = sorted;
      this.selectedCompareFile = folder;
      this.compareView = 'detail';
      this.selectedDetailType = 'compare';
      this.selectedVideoName = null;
      this.selectedVideoUrl = null;
      this.videoModule3RequestPayload = null;
      await this.loadDescriptionForGroupFolder(folder, sorted);
    },
    /**
     * 从 /static/video_results/{basename}.json 读取 result，
     * 按与预测信息相同的多行「xx信息：」格式展示。
     */
    loadVideoResultByName(videoName) {
      this.videoModule3RequestPayload = null;
      if (!videoName || typeof videoName !== 'string') {
        this.attributeInfoList = ['未找到有效视频名称，无法加载 result'];
        this.attributeInfo = this.attributeInfoList.join('\n');
        return Promise.resolve();
      }
      const jsonName = videoName.replace(/\.[^/.]+$/, '') + '.json';
      const jsonUrl = `/static/video_results/${jsonName}`;

      const stripParens = s =>
        s != null && s !== '' ? String(s).replace(/\s*\([^)]*\)/g, '') : s;

      return axios
        .get(jsonUrl)
        .then(res => {
          const data = res && res.data ? res.data : {};
          let r = data.result;
          if (Array.isArray(r) && r.length > 0) r = r[0];
          else if (r && typeof r === 'object' && !Array.isArray(r)) {
            // 已是单对象
          } else {
            r = null;
          }
          if (!r || typeof r !== 'object') {
            this.attributeInfoList = ['该视频对应 JSON 无有效 result 字段'];
            this.attributeInfo = this.attributeInfoList.join('\n');
            this.videoModule3RequestPayload = null;
            return;
          }
          const str = v => (v == null || v === '' ? '' : String(v).trim());
          this.videoModule3RequestPayload = {
            color: str(r.color),
            kind: str(r.kind),
            shape: str(r.shape),
            image_path: str(data.image_path),
            ground_truth: str(r.model)
          };
          console.log(
            '[GroupNegotiation] 视频先验 JSON 已解析，供 module3 传参用:',
            this.videoModule3RequestPayload,
            '源文件:',
            jsonUrl
          );
          const label = (key, v) => {
            const t = v != null && String(v).trim() !== '' ? stripParens(String(v)) : '未知';
            return `${key}：${t}`;
          };
          const lines = [];
          if (r.model != null && String(r.model).trim() !== '') {
            lines.push(label('型号信息', r.model));
          }
          lines.push(
            label('小类信息', r.kind),
            label('火力信息', r.firepower),
            label('颜色信息', r.color),
            label('形状信息', r.shape),
            label('尺寸信息', r.size),
            label('动力信息', r.power),
            label('轮廓信息', r.outline)
          );
          if (r.country != null && String(r.country).trim() !== '') {
            lines.push(label('国家信息', r.country));
          }
          if (r.scene != null && String(r.scene).trim() !== '') {
            lines.push(label('场景信息', r.scene));
          }
          this.attributeInfoList = lines;
          this.attributeInfo = this.attributeInfoList.join('\n');
        })
        .catch(err => {
          console.error(`加载视频 result 失败: ${jsonUrl}`, err);
          this.videoModule3RequestPayload = null;
          this.attributeInfoList = [`未找到对应 JSON：${jsonName}（/static/video_results/）`];
          this.attributeInfo = this.attributeInfoList.join('\n');
        });
    },
    /**
     * 加载分组侧栏「先验知识认知传播信息」：对该分组每张图依次请求 *_analysis.json，
     * 全部不可用后再按同名顺序尝试 .txt 兜底。
     */
    loadDescriptionForGroupFolder(folder, sortedJpgs) {
      if (!folder || !sortedJpgs || sortedJpgs.length === 0) {
        this.attributeInfoList = ['该分组下没有可展示的图片文件'];
        this.attributeInfo = this.attributeInfoList.join('\n');
        return Promise.resolve();
      }
      const stems = sortedJpgs.map(fn => String(fn).replace(/\.[^/.]+$/, ''));
      console.log(
        '[GroupNegotiation] 加载分组认知传播信息（先全部 _analysis.json，再 .txt），stems 顺序:',
        stems,
        'folder:',
        folder
      );
      const parseAnalysisLines = data => {
        const ar = data && data.analysis_result;
        const lines = [];
        if (ar && typeof ar === 'object') {
          if (ar.detailed_description) lines.push(`场景描述：${ar.detailed_description}`);
          if (ar.raw_response != null && String(ar.raw_response).trim() !== '') {
            lines.push(`检测结果：${String(ar.raw_response).trim()}`);
          }
          if (ar.target_class != null && String(ar.target_class).trim() !== '') {
            lines.push(`目标类别：${ar.target_class}`);
          }
          if (ar.target_count != null && String(ar.target_count).trim() !== '') {
            lines.push(`目标数量：${ar.target_count}`);
          }
        }
        return lines;
      };

      const fetchAnalysisJson = url =>
        axios.get(url).then(res => {
          const status = res && res.status;
          const raw = res && res.data;
          if (typeof raw === 'string' && /^\s*</.test(raw)) {
            console.warn(
              '[GroupNegotiation] 分析 JSON 响应体为 HTML（常为 404 被 SPA 兜底），视为失败:',
              url,
              'HTTP',
              status
            );
            return null;
          }
          const data = raw && typeof raw === 'object' ? raw : {};
          const lines = parseAnalysisLines(data);
          if (lines.length > 0) {
            console.log(
              '[GroupNegotiation] 分析 JSON 请求成功且已解析展示字段:',
              url,
              'HTTP',
              status,
              '条数:',
              lines.length
            );
            return lines;
          }
          console.warn(
            '[GroupNegotiation] 分析 JSON HTTP 成功但无可展示内容（检查 analysis_result）:',
            url,
            'HTTP',
            status
          );
          return null;
        });

      const tryAnalysis = async stem => {
        const candidates = [
          `/static/grouped_dataset/${folder}/${stem}_analysis.json`,
          `/static/grouped_dataset/${folder}/${stem}.json`
        ];
        for (let i = 0; i < candidates.length; i++) {
          const url = candidates[i];
          try {
            const lines = await fetchAnalysisJson(url);
            if (lines && lines.length) return lines;
          } catch (err) {
            const st = err.response && err.response.status;
            console.warn(
              '[GroupNegotiation] 分析 JSON 请求失败:',
              url,
              st != null ? `HTTP ${st}` : String(err.message || err)
            );
          }
        }
        return null;
      };

      const tryTxt = stem =>
        axios
          .get(`/static/grouped_dataset/${folder}/${stem}.txt`, { responseType: 'text' })
          .then(res => {
            const t = res && res.data != null ? String(res.data).trim() : '';
            return t ? [t] : null;
          })
          .catch(() => null);

      const run = async () => {
        for (let s = 0; s < stems.length; s++) {
          const fromAnalysis = await tryAnalysis(stems[s]);
          if (fromAnalysis && fromAnalysis.length) {
            this.attributeInfoList = fromAnalysis;
            this.attributeInfo = fromAnalysis.join('\n');
            return;
          }
        }
        console.warn(
          '[GroupNegotiation] 该分组全部 *_analysis.json 均无可用结果，开始 .txt 兜底，stems:',
          stems
        );
        for (let s = 0; s < stems.length; s++) {
          const fromTxt = await tryTxt(stems[s]);
          if (fromTxt && fromTxt.length) {
            this.attributeInfoList = fromTxt;
            this.attributeInfo = fromTxt.join('\n');
            return;
          }
        }
        this.attributeInfoList = [`分组 ${folder} 下未找到可用的 _analysis.json 或 .txt`];
        this.attributeInfo = this.attributeInfoList.join('\n');
      };
      return run();
    },
    /**
     * 图片分组一轮展示：智能体 A/B/C 分别读取
     * `{folder}_view_A/B/C_composite.json` 的 analysis_result.raw_response；
     * 推理型号固定为「-」（与模板 model_name 字段对应）。
     */
    async loadCompareRound1StaticAgents(folder, sortedJpgs) {
      const specs = [
        { key: 'a', view: 'A' },
        { key: 'b', view: 'B' },
        { key: 'c', view: 'C' }
      ];
      const out = { a: null, b: null, c: null };
      if (!folder) {
        return null;
      }
      const fetchCompositeRawResponse = async view => {
        const url = `/static/grouped_dataset/${folder}/${folder}_view_${view}_composite.json`;
        try {
          const res = await axios.get(url);
          const raw = res && res.data;
          if (typeof raw === 'string' && /^\s*</.test(raw)) {
            console.warn('[GroupNegotiation] composite JSON 响应为 HTML，视为失败:', url);
            return { model_name: '-', reason: '***' };
          }
          const ar = raw && typeof raw === 'object' ? raw.analysis_result : null;
          const rr =
            ar && ar.raw_response != null && String(ar.raw_response).trim() !== ''
              ? String(ar.raw_response).trim()
              : '***';
          return { model_name: '-', reason: rr };
        } catch (e) {
          console.warn('[GroupNegotiation] 加载一轮 composite JSON 失败:', url, e);
          return { model_name: '-', reason: '***' };
        }
      };
      for (let i = 0; i < specs.length; i++) {
        const { key, view } = specs[i];
        out[key] = await fetchCompositeRawResponse(view);
      }
      console.log(
        '[GroupNegotiation] 图片模式一轮静态推理已组装（composite.json raw_response）:',
        folder,
        sortedJpgs,
        out
      );
      return out;
    },
    // 返回列表
    backToCompareList() {
      this.closeGroupImageLightbox();
      this.compareView = 'list';
      this.selectedCompareFile = null;
      this.selectedGroupImageFiles = [];
      this.orderInstructionText = '';
      this.selectedVideoName = null;
      this.selectedVideoUrl = null;
      this.selectedDetailType = null;
      this.selectedSourceKey = null;
      this.compareMessage = this.compareFiles && this.compareFiles.length > 0 ? '' : '暂无分组数据';
      this.videoModule3RequestPayload = null;
      // 返回列表时，清空下方描述区域，回到“暂无属性信息”
      this.attributeInfoList = [];
      this.attributeInfo = '';
    },
    // 分组三张图为静态路径，一般无需整页回退；保留占位（视频逻辑未使用此方法）
    handleCompareImageError(e) {
      console.error('图片加载失败:', e);
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
    handleResize() {
      this.fullWidth = window.innerWidth;
      this.fullHeight = window.innerHeight;
    },
    startNegotiation() {
      if (!this.canStartNegotiation) {
        console.warn('[GroupNegotiation] 未满足发起条件，禁止群体协商');
        alert('请先在上方列表中选择图片，或选择视频并成功显示先验知识认知传播信息。');
        return;
      }
      const selectedSourceName =
        this.selectedDetailType === 'compare' ? this.selectedCompareFile : this.selectedVideoName;
      console.log('[GroupNegotiation] 开始群体协商，模式:', this.selectedDetailType, '数据源:', selectedSourceName);
      if (this.selectedDetailType === 'video') {
        console.log('[GroupNegotiation] 视频模式将使用已加载的 videoModule3RequestPayload:', this.videoModule3RequestPayload);
      }
      this.startInfer();
    },
    exportResults() {
      // 结果导出功能
      console.log('导出结果');
      try {
        // 创建隐藏的下载链接
        const link = document.createElement('a');
        link.href = '/static/batch_result.zip';
        link.download = 'batch_result.zip';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        // 清理DOM
        document.body.removeChild(link);
        console.log('导出请求已发送');
      } catch (error) {
        console.error('导出失败:', error);
        alert('导出失败，请稍后重试');
      }
    },
    
    /**
     * 从 localStorage 恢复 module3Res（本页不自动调用；若需可手动触发）
     */
    loadModule3ResultsFromStorage() {
      try {
        const stored = localStorage.getItem('module3Res');
        if (!stored) return;
        const data = JSON.parse(stored);
        if (!data) return;
        this.applyModule3Fields(data, {
          round1: true,
          round2: true,
          review: true,
          finalBlock: true
        });
        this.isRound1Displayed = true;
        this.isRound2Displayed = true;
        this.isLoadingRound1 = false;
        this.isLoadingRound2 = false;
        this.isRightLoadingResults = false;
        console.log('已从 localStorage 回显 module3Res');
      } catch (e) {
        console.warn('读取 module3Res 失败：', e);
      }
    },

    async startInfer() {
      this.isLoading = false;
      this.clearNegotiationDisplay();
      this.isLoadingRound1 = true;
      this.isLoadingRound2 = true;
      this.isRound1Displayed = false;
      this.isRound2Displayed = false;
      this.isRightLoadingResults = false;
      const selectedImageName = this.selectedCompareFile || this.selectedVideoName || '';
      if (!selectedImageName) {
        console.warn('[GroupNegotiation] startInfer 中未检测到选中数据源，取消请求');
        this.isLoadingRound1 = false;
        this.isLoadingRound2 = false;
        return;
      }

      let resdata;
      if (this.selectedDetailType === 'video') {
        if (!this.videoModule3RequestPayload) {
          console.warn(
            '[GroupNegotiation] 视频模式但 videoModule3RequestPayload 为空，取消 module3 请求'
          );
          this.isLoadingRound1 = false;
          this.isLoadingRound2 = false;
          return;
        }
        const p = this.videoModule3RequestPayload;
        resdata = {
          color: p.color,
          kind: p.kind,
          shape: p.shape,
          image_path: toModule3VideoImagePath(p.image_path),
          ground_truth: p.ground_truth
        };
        console.log('[GroupNegotiation] 模块三请求地址（视频模式，与图片同一接口）:', MODULE3_REFINE_URL);
        console.log('[GroupNegotiation] 请求体（视频模式，image_path 已做前缀替换）:', resdata);
      } else {
        resdata = {
          color: '灰色',
          kind: '战斗机',
          shape: '三角翼',
          image_path: selectedImageName,
          ground_truth: 'F-22'
        };
        console.log('[GroupNegotiation] 模块三请求地址（图片模式，逻辑不变）:', MODULE3_REFINE_URL);
        console.log('[GroupNegotiation] 请求体（图片模式，与此前一致）:', resdata);
      }
      try {
        const response = await axios.post(MODULE3_REFINE_URL, resdata, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const data = this.normalizeModule3Payload(response.data);
        
        console.log('[GroupNegotiation] 推理请求成功，结果:', data);
        this.pendingNegotiationResult = data;

        if (this.selectedDetailType === 'compare') {
          this.imageModeRound1FromStatic = await this.loadCompareRound1StaticAgents(
            this.selectedCompareFile,
            this.selectedGroupImageFiles
          );
        } else {
          this.imageModeRound1FromStatic = null;
        }

        localStorage.setItem('module3Res', JSON.stringify(data));

        // 只展示一轮/二轮；右侧结果需用户点击“群体协商偏差检测”后再展示
        if (this.selectedDetailType === 'compare') {
          this.clearRoundDisplayTimers();
          const round1Delay = randomRoundDisplayDelayMs();
          const round2Delay = randomRoundDisplayDelayMs();
          this.round1DisplayTimer = setTimeout(() => {
            this.round1DisplayTimer = null;
            this.applyModule3Fields(data, {
              round1: true,
              round2: false,
              review: false,
              finalBlock: false,
              accuracy: false
            });
            this.isLoadingRound1 = false;
            this.isRound1Displayed = true;
            this.round2DisplayTimer = setTimeout(() => {
              this.round2DisplayTimer = null;
              this.applyModule3Fields(data, {
                round1: false,
                round2: true,
                review: false,
                finalBlock: false,
                accuracy: false
              });
              this.isLoadingRound2 = false;
              this.isRound2Displayed = true;
            }, round2Delay);
          }, round1Delay);
        } else {
          this.applyModule3Fields(data, {
            round1: true,
            round2: false,
            review: false,
            finalBlock: false,
            accuracy: false
          });
          this.isLoadingRound1 = false;
          this.isRound1Displayed = true;

          setTimeout(() => {
            this.applyModule3Fields(data, {
              round1: false,
              round2: true,
              review: false,
              finalBlock: false,
              accuracy: false
            });
            this.isLoadingRound2 = false;
            this.isRound2Displayed = true;
          }, 3000);
        }
        console.log('模块3返回值已存入localStorage');
        // 【新增】方便调试：打印 localStorage
          console.log("--- localStorage 已更新 (模块三) ---");
          console.log("module3Res:", localStorage.getItem('module3Res'));
          console.log("---------------------------------");
      } catch (error) {
        console.error("推理请求失败:", error);
        this.clearRoundDisplayTimers();
        this.isLoadingRound1 = false;
        this.isLoadingRound2 = false;
        const errMsg = (error.response && error.response.data && error.response.data.error) || error.message;
        this.finalBattlefieldTriple = null;
        this.finalResult = '推理失败: ' + errMsg;
      } finally {
        // 全局不显示遮罩，这里不再处理 isLoading
      }
    },

    // 右侧偏差检测按钮：不再请求后端，分步显示
    handleBiasDetect() {
      // 优先使用本次“开始群体协商”返回数据，其次回退 localStorage
      let data = this.pendingNegotiationResult;
      if (!data) {
        try {
          const stored = localStorage.getItem('module3Res');
          data = stored ? JSON.parse(stored) : null;
        } catch (e) {
          console.warn('解析 module3Res 失败:', e);
          data = null;
        }
      }

      if (!data) {
        alert('请先进行群体协商，以获取完整结果。');
        return;
      }

      const isImageMode = this.selectedDetailType === 'compare';
      this.applyModule3Fields(data, {
        round1: true,
        round2: true,
        review: true,
        finalBlock: true,
        accuracy: !isImageMode
      });
      // 与开始群体协商后一致：数据来自当次 module3Res，不依赖历史计时
      this.isRightLoadingResults = true;
      this.isRightLoadingAccuracy = true;
      if (this.accuracyTimer) {
        clearTimeout(this.accuracyTimer);
        this.accuracyTimer = null;
      }
      localStorage.removeItem('module3AccuracyTimerStart');
      localStorage.removeItem('module3CachedAccuracy');
      setTimeout(() => {
        this.isRightLoadingResults = false;
      }, 2000);
      if (isImageMode) {
        this.accuracyRate = '—';
        this.accuracyTimer = setTimeout(() => {
          this.accuracyRate = MODULE3_IMAGE_FIXED_ACCURACY;
          this.isRightLoadingAccuracy = false;
          this.accuracyTimer = null;
        }, MODULE3_BIAS_ACCURACY_DELAY);
      } else {
        setTimeout(() => {
          this.isRightLoadingAccuracy = false;
        }, 2000);
      }
    },
    
    // 进页不根据旧 module3Res 预填准确率；须「选图 → 开始群体协商」接口成功（或点偏差检测用当前 module3Res）后才有数
    checkAccuracyTimer() {
      try {
        this.accuracyRate = '—';
        this.isRightLoadingAccuracy = false;
        if (this.accuracyTimer) {
          clearTimeout(this.accuracyTimer);
          this.accuracyTimer = null;
        }
      } catch (e) {
        console.error('检查准确率状态失败:', e);
        this.accuracyRate = '—';
        this.isRightLoadingAccuracy = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
/* * =========================================
 * 新UI样式（暗黑科技风）
 * =========================================
 */

/* 1. 全局和背景 */
.section {
  width: 100%;
  min-height: 100vh;
  color: #fff;
  font-family: "DingTalk-JinBuTi";
  z-index: 1;
  padding: 10px;
  margin: 0;
  background-color: transparent;
  display: flex;
  flex-direction: column;
  position: relative;
}

.img_box {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('~@/assets/images/step3/bg.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center top;
  opacity: 1;
  z-index: 0;
  pointer-events: none;
}

/* 2. 顶部标题栏 */
.header-bar {
  width: 100%;
  flex-shrink: 0;
  padding: 0 20px;
  height: 60px;
  position: relative;
  z-index: 10;
}

.header-title {
  font-family: "DingTalk-JinBuTi";
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
  text-align: center;
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
.middle-column .panel-left .panel-content {
  background-image: none !important;
  margin: 0;
  padding: 0 !important;
}

.content-row {
  flex-grow: 1;
  width: 100%;
  max-width: 100%;
  margin: 0 !important;
  padding: 0 15px;
  box-sizing: border-box;
  position: relative;
  z-index: 2;
  display: flex;
  flex-wrap: nowrap;
}

/* 三列通用高度 */
.design-left-column,
.left-column,
.middle-column,
.right-column {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  /* 减去顶部栏高度 */
  padding: 0 !important;
}

.design-left-column {
  width: 25% !important;
  gap: 15px;
  box-sizing: border-box;
  flex-shrink: 0;
}

/* 左侧两栏：与中间/右侧一致的弹框底图 */
.design-left-column .design-module {
  background-image: url('~@/assets/images/step1/-s-弹框-选择数据.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  min-height: 0;
}

/* 左侧内容区内框（对齐右侧「共识摘要/分歧点」的暗色圆角框） */
.design-left-column .video-module .video-content-wrapper {
  margin: 0 10px 12px 10px;
  background-color: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(0, 229, 255, 0.35);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 229, 255, 0.08);
  box-sizing: border-box;
}

.design-left-column .text-module-left .text-scrollable {
  margin: 0 10px 12px 10px;
  background-color: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(0, 229, 255, 0.35);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 229, 255, 0.08);
  box-sizing: border-box;
  overflow: hidden;
}

.middle-column {
  width: 45% !important;
  gap: 20px;
  box-sizing: border-box;
  flex-shrink: 0;
}

.right-column {
  width: 30% !important;
  gap: 5px;
  position: relative;
  z-index: 2;
  box-sizing: border-box;
  flex-shrink: 0;
  min-height: 0;
}

.panel-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  width: 100%;
  background: none;
  padding: 0;
  margin: 0;
  position: relative;
}

/* 面板通用样式 */
[class^="panel-"]:not(.panel-right-top):not(.panel-right-bottom):not(.panel-header):not(.panel-right-button):not(.panel-right-accuracy), .design-module {
  width: 100%;
  background-repeat: no-repeat;
  background-size: 100% 100%;
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
  flex: 1 1 0;
  background-image: url('~@/assets/images/step1/弹框-偏差检测结果.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  margin-bottom: 8px;
  padding: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  width: 100%;
  margin-top: 8px;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.panel-right-top .panel-content {
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 4px 8px 8px 8px;
  margin: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* 右侧顶部面板内：共识摘要与分歧点高度一致 */
.panel-right-top .result-section {
  display: flex;
  flex-direction: column;
  /* 两个区域使用相同的flex值，确保高度一致 */
  flex: 1 1 0;
  margin-bottom: 10px;
  align-items: stretch;
  /* 确保两个区域高度完全一致 */
  min-height: 0;
}

.panel-right-top .result-section-main {
  background-color: rgba(0,0,0,0.25);
  border-radius: 8px;
  padding-top: 4px;
  padding-bottom: 6px;
  margin-bottom: 0;
  box-shadow: 0 2px 8px rgba(0,229,255,0.08);
}

.panel-right-top .result-section:last-child {
  margin-bottom: 0;
}

.panel-right-top .section-content {
  /* 让内容区域高度一致，自适应填充并可滚动 */
  flex: 1 1 0;
  min-height: 0;
  max-height: none;
  overflow-y: auto;
  overflow-x: hidden;
  /* 确保两个内容框高度完全一致 */
  display: flex;
  flex-direction: column;
  padding: 8px 10px;
  scrollbar-gutter: stable;
}

.panel-right-top .section-content .result-text {
  overflow: visible;
  max-height: none;
  display: block;
  width: 100%;
  white-space: pre-wrap !important;
  word-break: break-word;
  overflow-wrap: anywhere;
  line-height: 1.65;
}

.panel-right-top .section-content .section-sub {
  margin-bottom: 6px;
  color: #4ED8FF;
  font-size: 13px;
  font-weight: 600;
}

.panel-right-top .section-content.unified-scroll {
  padding-top: 2px;
}

.panel-right-top .section-content.unified-scroll .result-text {
  margin-bottom: 8px;
}

.panel-right-top .section-content.unified-scroll .result-text:last-child {
  margin-bottom: 0;
}

.panel-right-top .unified-divider {
  height: 1px;
  width: 100%;
  margin: 6px 0 8px 0;
  background: rgba(0, 229, 255, 0.35);
}

.panel-right-bottom {
  flex: 0 0 240px;
  height: 240px;
  min-height: 240px;
  max-height: 240px;
  width: 100%;
  /* 与上方「群体协商认知偏差检测结果」同系列弹框底图 */
  background-image: url('~@/assets/images/step1/弹框-偏差检测结果.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  padding: 12px 18px 18px 18px;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  gap: 8px;
  margin-bottom: 8px;
  box-sizing: border-box;
  overflow: hidden;
}

.panel-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: transparent;
  position: relative;
}

/* 面板标题 */
.panel-header {
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
  padding: 0 20px 0 15px;
  margin: 0;
  margin-bottom: 0;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  box-sizing: border-box;
}

/* 一行显示（防止中文标题换行） */
.title-one-line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
  /* 不要覆盖 panel-header 的 width，避免背景框被拉长 */
}

/* 右侧“群体协商认知偏差检测结果”更长：适当放大 + 缩小字号 */
.panel-header.header-results.title-one-line {
  width: 200px !important;
  font-size: 11px !important;
  height: 22px;
}

/* 左侧设计模块标题：与中间列「一轮/二轮群体协商」一致 */
.design-left-column .design-module .panel-header.title-one-line {
  width: 160px !important;
}

/* 中间“一轮/二轮群体协商”标题：单独加宽，避免截断 */
.middle-column .panel-left .panel-header.title-one-line {
  width: 160px !important;
}

.panel-header span {
  transform: translateY(0);
}

.header-results {
  font-size: 12px !important;
  margin-top: -2px !important;
  margin-bottom: 4px !important;
  padding-left: 12px !important;
  padding-right: 12px !important;
  justify-content: flex-start !important;
}

/* 中间列的标题左对齐显示 */
.middle-column .panel-left .panel-header {
  justify-content: flex-start !important;
  padding-left: 15px !important;
}

.design-module-label {
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

/* 设计模块特定样式 */
.design-module {
  position: relative;
  padding-top: 0;
  border-radius: 5px;
}

/* 设计模块内的标题需要特殊处理，因为没有 span 包裹 */
.design-module .panel-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
  line-height: 17px;
  height: 24px;
  margin-top: 10px;
  margin-bottom: 10px;
  padding-left: 15px !important;
  padding-right: 20px;
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
}

/* 视频模块样式：列表 + 指令文案，略小于下方媒体展示区 */
.video-module {
  flex: 0 1 36%;
  min-height: 0; /* 关键：允许在 flex 列布局里收缩，否则滚动容器无法生效 */
}

.video-module .design-module-content {
  min-height: 0;
}

.video-content-wrapper {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  /* 列表需要铺满高度并可滚动；图片详情由 compare-detail-wrapper 自己居中 */
  justify-content: stretch;
  align-items: stretch;
  overflow: hidden;
  min-height: 0; /* 允许内部滚动容器在 flex 场景下正确收缩 */
}

.video-display {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 4px;
}

/* compare 文件列表/图片详情样式 */
.compare-back-btn {
  position: absolute;
  /* 标题 margin-top(10) + 标题高度(24) + 标题 margin-bottom(10) */
  top: 44px;
  left: 30px;
  z-index: 10;
  background: none;
  border: none;
  color: #ffffff;
  font-family: "DOUYUFont";
  font-size: 12px;
  cursor: pointer;
  padding: 0;
}

.compare-list-wrapper {
  width: 100%;
  height: 100%;
  flex: 1;
  max-height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0; /* 关键：否则在 flex 布局下可能不触发滚动条 */
  padding: 10px 20px 20px 20px;
  box-sizing: border-box;
}

/* 先验知识传播结果：详情态 instruction 文案区（垂直居中） */
.propagation-detail-wrapper {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 44px 20px 20px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.propagation-detail-wrapper .order-instruction-display {
  margin: 0;
  width: 100%;
  max-width: 94%;
  padding: 16px 18px 14px;
  font-family: "DingTalk-JinBuTi", sans-serif;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.8;
  letter-spacing: 0.6px;
  color: #ffffff;
  text-align: center;
  word-break: break-word;
  border-radius: 6px;
  border: 1px solid rgba(0, 229, 255, 0.42);
  background: linear-gradient(
    160deg,
    rgba(0, 55, 90, 0.52) 0%,
    rgba(0, 28, 55, 0.68) 100%
  );
  box-shadow:
    0 0 14px rgba(0, 229, 255, 0.1),
    inset 0 1px 0 rgba(0, 229, 255, 0.18);
  position: relative;
}

.propagation-detail-wrapper .order-instruction-display::before {
  content: '任务指令';
  display: block;
  margin-bottom: 10px;
  font-family: "DOUYUFont", sans-serif;
  font-size: 11px;
  line-height: 1.2;
  letter-spacing: 3px;
  color: #00e5ff;
  text-shadow: 0 0 8px rgba(0, 229, 255, 0.35);
}

.propagation-detail-wrapper .order-instruction-display::after {
  content: '';
  display: block;
  width: 72%;
  height: 2px;
  margin: 12px auto 0;
  background-image: url('~@/assets/images/step2/blueline.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  opacity: 0.9;
}

.source-list-section + .source-list-section {
  margin-top: 12px;
}

.order-instruction-section .order-category-block {
  margin-bottom: 8px;
}

.order-instruction-section .order-category-block:last-child {
  margin-bottom: 0;
}

.compare-list-wrapper .order-category-toggle {
  margin-bottom: 6px;
  padding: 8px 10px;
  font-size: 12px;
}

.compare-list-wrapper .order-category-toggle .source-list-heading-label {
  font-size: 12px;
  white-space: normal;
  line-height: 1.35;
}

.order-group-list {
  padding-left: 8px;
}

.order-group-item {
  padding: 6px 10px;
  margin-bottom: 4px;
  background-color: rgba(0, 80, 120, 0.18);
  border: 1px solid rgba(0, 229, 255, 0.22);
  border-radius: 4px;
  font-size: 0.85rem;
  color: #c8f6ff;
  line-height: 1.3;
  word-break: break-all;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
}

.order-group-item:hover {
  background-color: rgba(0, 100, 150, 0.28);
  border-color: rgba(0, 229, 255, 0.4);
}

.order-group-item.selected {
  background-color: rgba(0, 229, 255, 0.35);
  border-color: #00e5ff;
}

.order-group-item.selected .selector-circle {
  background-color: #00e5ff;
}

.order-group-item:last-child {
  margin-bottom: 0;
}

.compare-detail-wrapper.compare-detail-with-instruction {
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  padding: 10px 14px 12px;
  box-sizing: border-box;
  overflow-y: auto;
}

.order-instruction-display {
  flex: 0 0 auto;
  margin: 0 0 10px 0;
  padding: 10px 12px;
  font-size: 13px;
  line-height: 1.55;
  color: #e8fdff;
  text-align: left;
  word-break: break-word;
  border-radius: 4px;
  border: 1px solid rgba(0, 229, 255, 0.35);
  background: rgba(0, 60, 90, 0.35);
}

.compare-detail-images-row {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.compare-detail-with-instruction.compare-detail-group .compare-detail-images-row {
  min-height: 120px;
}

.compare-detail-with-instruction .compare-detail-images-row .group-triple-img {
  flex: 1 1 0;
  min-height: 0;
  width: auto;
  max-width: 100%;
  height: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: center;
}

/* 列表分区标题：渐变条 + 钉铛体，与同列 video-item 区分层级 */
.compare-list-wrapper .source-list-heading-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  margin-bottom: 8px;
  padding: 10px 12px;
  box-sizing: border-box;
  cursor: pointer;
  user-select: none;
  outline: none;
  border-radius: 4px;
  border: 1px solid rgba(0, 229, 255, 0.42);
  background: linear-gradient(
    105deg,
    rgba(0, 229, 255, 0.14) 0%,
    rgba(0, 90, 130, 0.28) 42%,
    rgba(0, 35, 55, 0.45) 100%
  );
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 2px 8px rgba(0, 0, 0, 0.25);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.compare-list-wrapper .source-list-heading-toggle:hover {
  border-color: rgba(0, 229, 255, 0.58);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 2px 12px rgba(0, 229, 255, 0.12);
}

.compare-list-wrapper .source-list-heading-toggle:focus-visible {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 0 0 2px rgba(0, 229, 255, 0.35);
}

.compare-list-wrapper .source-list-heading-label {
  font-family: "DingTalk-JinBuTi", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #e8fdff;
  letter-spacing: 0.06em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.compare-list-wrapper .source-list-heading-chevron {
  flex-shrink: 0;
  font-size: 10px;
  line-height: 1;
  color: rgba(0, 229, 255, 0.92);
  transition: transform 0.2s ease;
}

.compare-list-wrapper .source-list-heading-toggle.is-collapsed .source-list-heading-chevron {
  transform: rotate(-90deg);
}

.source-list-items {
  padding-bottom: 2px;
}

.compare-detail-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.compare-detail-wrapper.compare-detail-group {
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 8px;
  padding: 8px 12px;
  box-sizing: border-box;
}

.compare-detail-wrapper.compare-detail-group.compare-detail-with-instruction {
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
}

.compare-detail-wrapper.compare-detail-group .compare-detail-images-row {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  gap: 8px;
  width: 100%;
  height: 100%;
  min-height: 0;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  overflow: hidden;
}

.compare-detail-wrapper .group-triple-img {
  flex: 1 1 0;
  min-height: 0;
  width: auto;
  max-width: 100%;
  height: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: center;
}

.compare-detail-wrapper .group-triple-img-clickable {
  cursor: zoom-in;
  transition: opacity 0.2s ease, box-shadow 0.2s ease;
}

.compare-detail-wrapper .group-triple-img-clickable:hover {
  opacity: 0.92;
  box-shadow: 0 0 0 1px rgba(0, 229, 255, 0.35);
}

.group-image-lightbox {
  position: fixed;
  inset: 0;
  z-index: 10050;
  background: rgba(0, 0, 0, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px 24px;
  box-sizing: border-box;
}

.group-image-lightbox-img {
  max-width: min(96vw, 1600px);
  max-height: 88vh;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 6px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.55);
}

.group-image-lightbox-close {
  position: fixed;
  top: 12px;
  right: 16px;
  z-index: 10051;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: rgba(0, 229, 255, 0.12);
  color: rgba(255, 255, 255, 0.95);
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s ease;
}

.group-image-lightbox-close:hover {
  background: rgba(0, 229, 255, 0.28);
}

.compare-image {
  width: 100%;
  height: 100%;
  object-fit: contain; /* 大图填充但不裁切 */
  border-radius: 4px;
}

/* 对齐 TargetDetection 中“选择认知传播数据源”列表的样式 */
.server-video-list {
  flex-grow: 1;
  max-height: calc(100% - 10px);
  padding-right: 10px;
}

.server-video-list::-webkit-scrollbar {
  width: 6px;
}

.server-video-list::-webkit-scrollbar-thumb {
  background: #00e5ff;
  border-radius: 3px;
}

.server-video-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

.video-item {
  padding: 8px 10px;
  margin-bottom: 5px;
  background-color: rgba(0, 100, 150, 0.2);
  border: 1px solid rgba(0, 229, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.video-item.selected {
  background-color: rgba(0, 229, 255, 0.4);
  border-color: #00e5ff;
}

.selector-circle {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #00e5ff;
  border-radius: 50%;
  background-color: transparent;
  flex-shrink: 0;
  margin-left: 10px;
}

.video-item.selected .selector-circle {
  background-color: #00e5ff;
}

/* 文本模块样式：图片/视频展示为主，占左侧剩余高度 */
.text-module-left {
  flex: 1 1 54%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.fixed-left-text {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;
  align-self: stretch;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.fixed-left-text .design-module-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.text-scrollable {
  padding: 0;
  flex-grow: 1;
  overflow: hidden;
  max-height: 100%;
  display: flex;
  flex-direction: column;
}

.text-module-left .text-scrollable .compare-detail-wrapper {
  flex: 1;
  min-height: 0;
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
  font-size: 18px;
  font-style: normal;
  text-decoration: none;
  display: inline-flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 20px;
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

.header-accuracy {
  margin-top: 15px;
}

/* 文本框框架 - 已移至视频模块 */

.placeholder-text {
  color: #88a;
  font-family: "DingTalk-JinBuTi";
  font-size: 1rem;
  text-align: center;
  padding: 20px;
}

.text-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.6;
  margin: 0;
  padding: 0;
  font-family: "DingTalk-JinBuTi";
  font-size: 0.9rem;
}

.text-muted {
  color: #888888;
  font-family: "DingTalk-JinBuTi";
  font-style: italic;
}

/* 属性信息内容框（外层 text-scrollable 已有圆角框，内层仅留白） */
.attribute-content {
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
}

.attribute-content::-webkit-scrollbar {
  width: 6px;
}

.attribute-content::-webkit-scrollbar-thumb {
  background: #00e5ff;
  border-radius: 3px;
}

.attribute-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

/* 信息列表样式 */
.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
}

.info-list li {
  position: relative;
  padding: 10px 0;
  margin: 0;
  line-height: 1.6;
  color: #ffffff;
  font-family: "DingTalk-JinBuTi";
  font-size: 0.95rem;
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

/* 5. 中间列 - 智能体推理区域 */
.reasoning-section {
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px 0;
}

.agent-box {
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid #00e5ff;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 15px;
}

.agent-box.negotiation {
  border-color: #ff6b6b;
}

.agent-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.agent-avatar {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background-color: #00e5ff;
  color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: "DingTalk-JinBuTi";
  font-weight: bold;
  font-size: 1rem;
}

.negotiation-sign {
  color: #ff6b6b;
  font-family: "DingTalk-JinBuTi";
  font-size: 1.2rem;
}

.agent-label {
  color: #00e5ff;
  font-family: "DingTalk-JinBuTi";
  font-weight: bold;
  font-size: 0.9rem;
}

.agent-content {
  background-color: rgba(0, 0, 0, 0.4);
  padding: 10px;
  border-radius: 5px;
  min-height: 80px;
  position: relative;
}

.agent-result {
  font-family: "DingTalk-JinBuTi";
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0;
}

/* 有 result-line 的情况：使用 flex 布局控制间距 */
.agent-result:has(.result-line) {
  white-space: normal;
  display: flex;
  flex-direction: column;
}

/* 控制推理型号和推理依据之间的间距为10px */
.agent-result .result-line {
  display: block;
  margin-bottom: 10px;
  line-height: 1.5;
}

/* 二轮「推理结果」下挂场景描述 / 目标类别 / 目标数量 */
.agent-result .result-line-nested {
  padding-left: 1em;
  margin-bottom: 6px;
}

.agent-result .result-line:last-child {
  margin-bottom: 0;
}

/* 兼容旧格式（没有 result-line，使用 br 或 pre-line） */
.agent-result:not(:has(.result-line)) {
  white-space: pre-line;
  display: block;
}

/* 6. 右侧列 - 结果区域 */
/* 偏差检测准确率面板 */
.panel-right-accuracy {
  flex: 0 0 100px;
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
  max-height: 100px;
  margin-top: 0;
  box-sizing: border-box;
}

.result-section {
  margin-bottom: 20px;
}

.section-header {
  color: #00e5ff;
  font-family: "DingTalk-JinBuTi";
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  /* 确保标题在result-section中垂直居中 */
  height: auto;
}

.section-content {
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid #00e5ff;
  border-radius: 5px;
  padding: 10px;
  min-height: 0;
  overflow-y: auto;
}

.result-text {
  font-family: "DingTalk-JinBuTi";
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0;
  white-space: pre-line;
}

.result-text :deep(span[style*="color: red"]) {
  color: #ff6b6b !important;
}

.final-result-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-grow: 1;
  min-height: 0;
}

.final-result-title {
  color: #4ED8FF;
  font-family: 'DOUYUFont';
  font-weight: 400;
  font-size: 16px;
  font-style: normal;
  text-decoration: none;
  text-align: left;
  margin: 0;
  margin-bottom: 0px;
  line-height: 1.4;
}

.final-model-display {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  gap: 8px;
  background-color: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(0, 229, 255, 0.35);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 229, 255, 0.08);
  padding: 10px 12px;
  text-align: left;
  margin: 0;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
}

.final-model-text {
  color: #fff;
  font-family: "DingTalk-JinBuTi";
  font-size: 14px;
  font-weight: 400;
  margin: 0;
  width: 100%;
  line-height: 1.6;
  word-break: break-word;
  white-space: pre-wrap;
  // text-shadow: 0 0 5px #00e5ff;
}

.metric-box {
  font-family: "DingTalk-JinBuTi";
  font-size: 2.5rem;
  font-weight: bold;
  color: #00e5ff;
  text-align: center;
  text-shadow: 0 0 5px #00e5ff;
  margin: 20px 0;
}

.action-buttons-right {
  margin-top: auto;
  display: flex;
  justify-content: center;
}

/* 结果导出按钮区域 */
.panel-right-button {
  flex-shrink: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  min-height: 70px;
  background: none;
  margin-top: auto;
}

/* 新增：右侧偏差检测按钮区域与样式（与左下角按钮尺寸风格一致） */
.panel-right-bias-button {
  flex-shrink: 0;
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

.btn-export-result:disabled {
  filter: grayscale(80%);
  cursor: not-allowed;
}

/* 7. 加载遮罩 */
.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-spinner {
  color: #00e5ff;
  font-family: "DingTalk-JinBuTi";
  font-size: 1.2rem;
  text-shadow: 0 0 5px #00e5ff;
}

/* 面板与框内局部遮罩 */
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
  font-family: "DingTalk-JinBuTi";
  z-index: 5;
}
/* 8. 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #00e5ff;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #00b8d4;
}

/* 9. 响应式调整 */
@media (max-width: 1200px) {
  .header-title {
    font-size: calc(1vw + 0.7rem);
  }
  
  .metric-box {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .header-bar {
    padding: 0 10px;
  }
  
  .header-btn {
    width: 100px;
    font-size: 0.8rem;
  }
  
  .left-column,
  .middle-column,
  .right-column {
    height: auto;
  }
}
</style>
