<template>
  <div class="section">
    <div class="img_box"></div>

    <b-row class="header-bar align-item-s-center no-gutters">
      <b-col cols="3" class="text-left">
        <button class="header-btn btn-home" @click="navigateHome">首页</button>
        <button class="header-btn btn-back" @click="navigateHome">返回</button>
      </b-col>
      <b-col cols="6" class="text-center">
        </b-col>
      <b-col cols="3" class="text-right">
        <button class="header-btn btn-next" @click="navigateNextPage">下个页面</button>
      </b-col>
    </b-row>

    <b-row class="justify-content-center content-row no-gutters">

      <b-col cols="3" class="left-column px-2">
        <div class="panel-header header-select-data">选择数据</div>

        <div class="panel-left">
          <div class="panel-content">
            <div class="server-video-list overflow-auto">
              <div v-for="video in videoList" :key="video.id" class="video-item" @click="selectVideo(video)"
                :class="{ 'selected': selectedVideo && selectedVideo.id === video.id }">
                <span>{{ video.name }}</span>
                <span class="selector-circle"></span>
              </div>
            </div>

            <div class="action-buttons">
              <button @click="startDetection" :disabled="!selectedVideo || isLoading" class="btn-start-detect">
                <b-spinner small v-if="isLoading"></b-spinner>
                <span>{{ isLoading ? (progressMessage || '检测中...') : '开始检测' }}</span>
              </button>
            </div>
          </div>
        </div>
      </b-col>

      <b-col cols="5" class="middle-column mx-2 px-1">
        <div class="video-section">
          <div class="video-label label-original">原视频</div>
          <div class="video-frame">
            <video v-if="originalVideoURL" :src="originalVideoURL" controls class="video-display"
              @error="handleVideoError"></video>
            <div v-else class="placeholder-text">请选择视频</div>
          </div>
        </div>

        <div class="video-section">
          <div class="video-label label-processed">多模态检测结果 </div>
          <div class="video-frame">
            <video v-if="processedVideoURL" :src="processedVideoURL" controls class="video-display"
              :key="processedVideoURL" @error="handleVideoError"></video>
            <div v-else-if="isLoading" class="placeholder-text">等待处理结果...</div>
            <div v-else class="placeholder-text">检测结果将在这里显示</div>
          </div>
        </div>
      </b-col>

      <b-col cols="3" class="right-column px-2">

        <div class="panel-header header-results">偏差检测结果</div>

        <div class="panel-right-top">
          <div class="panel-content">
            <div class="description-box p-2 overflow-auto">
              <div v-if="fullResult.video_description" class="mb-1 text-left small-text"
                v-html="formatDescription(fullResult.video_description)">
              </div>
              <p v-if="fullResult.key_frame_detection" class="mb-1 text-left">
                <span class="text-red">id:{{ fullResult.key_frame_detection.frame_idx }} {{ getMainObject() }} {{
                  getMainConfidence().toFixed(2) }}</span>
              </p>
              <p v-else-if="!isLoading" class="text-left small-text">
                {{ resultMessage || '检测完成后显示结果' }}
              </p>
            </div>
          </div>
        </div>

        <div class="panel-header header-accuracy">偏差检测准确率</div>

        <div class="panel-right-bottom">
          <div class="panel-content">
            <div class="metric-box">
              <template v-if="fullResult.overall_accuracy !== undefined">
                {{ (fullResult.overall_accuracy * 100).toFixed(2) + '%' }}
              </template>
              <template v-else>
                N/A
              </template>
            </div>
          </div>
        </div>

        <div class="action-buttons-right">
          <button class="btn-export-result" @click="exportResults" :disabled="!taskId || isLoading">
            <span>结果导出</span>
          </button>
        </div>

      </b-col>
    </b-row>
  </div>
</template>

<script>
import axios from 'axios';
import { BIcon, BIconPlayCircleFill, BIconPlayFill, BSpinner } from 'bootstrap-vue';

// API 基础地址
const API_BASE_URL = 'http://10.109.253.71:5236';
const FRONTEND_BASE_URL = 'http://10.109.253.71:8889';
const BASE_DIR = "/home/wuzhixuan/Project/PCJC/1";
const VIDEO_DIR = "/home/wuzhixuan/Project/PCJC/datasets/Vedio"

/**
 * 【关键修正工具函数】从完整的文件路径中提取文件名
 * 作用：从 /home/.../detected_video.mp4 中提取 detected_video.mp4
 * @param {string} fullPath - 完整路径，例如 /home/.../detected_video.mp4 或 C:\path\to\file.mp4
 * @returns {string|null} 文件名，例如 detected_video.mp4
 */
function getFilenameFromPath(fullPath) {
  if (!fullPath || typeof fullPath !== 'string') return null;
  // 使用 split 方法按路径分隔符（/ 或 \）分割，并取最后一个元素
  const parts = fullPath.split(/[/\\]/);
  // pop() 方法移除并返回数组的最后一个元素，即文件名
  return parts.pop() || null;
}

export default {
  name: 'TargetDetection',
  components: {
    'b-icon': BIcon,
    'b-icon-play-circle-fill': BIconPlayCircleFill,
    'b-icon-play-fill': BIconPlayFill,
    'b-spinner': BSpinner
  },
  data() {
    return {
      fullWidth: window.innerWidth,
      fullHeight: window.innerHeight,
      videoList: [], // 用于存储视频列表
      selectedVideo: null, // 用于存储选中的视频
      originalVideoURL: null,
      processedVideoURL: null,
      taskId: null,
      isLoading: false,
      progressMessage: null,
      resultMessage: null,
      fullResult: {
        video_description: null,
        accuracy_results: null,
        video_info: null,
        key_frame_detection: null
      }
    };
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    this.fetchVideoList(); // 获取视频列表
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    navigateHome() {
      // "首页" 和 "返回" 都跳转到根路径（使用相对路径确保在当前端口下正确导航）
      window.location.href = '/';
    },
    navigateNextPage() {
      // "下个页面" 跳转到指定页面（使用相对路径确保在当前端口下正确导航）
      window.location.href = '/prior-knowledge';
    },
    handleResize() {
      this.fullWidth = window.innerWidth;
      this.fullHeight = window.innerHeight;
    },
    handleVideoError(e) {
      console.error("视频加载错误:", e);
      this.resultMessage = "处理后视频加载失败，请检查服务器日志和网络。";
    },
    /**
     * 【标红修正】根据 low_similarity_aspects 列表高亮对应标签的行。
     * 目前有四行：场景、主要目标、动作、总结。仅高亮列表中出现的那些行。
     */
    formatDescription(description) {
      // DEBUG 0: 函数开始
      console.log("--- [DEBUG] formatDescription START (Fixed) ---");

      if (!description) {
        console.log("[DEBUG] 1. 传入的 description 为空，已停止。");
        console.log("--- [DEBUG] formatDescription END ---");
        return '';
      }

      // DEBUG 1: 检查原始数据
      const rawAspects = this.fullResult && this.fullResult.low_similarity_aspects;
      console.log("[DEBUG] 1. 传入的 description (原始文本):", JSON.stringify(description));
      console.log("[DEBUG] 2. 传入的 low_similarity_aspects (原始数据):", rawAspects);

      // 1) 解析需要高亮的标签集合
      const aspects = this.parseLowSimilarityAspects(rawAspects);

      // DEBUG 2: 检查解析后的标签
      console.log("[DEBUG] 3. 经过 parseLowSimilarityAspects 解析后的数组:", aspects);

      // 标准化到四个候选标签
      const validLabels = new Set(['场景', '主要目标', '动作', '总结']);
      const labelsToHighlight = new Set();
      (aspects || []).forEach(item => {
        if (typeof item !== 'string') return;
        // 清理和标准化标签名称
        const name = item.trim().replace(/^["'《【\s]+|["'》】\s]+$/g, '');
        if (name === '目标') {
          console.log("[DEBUG] 4. '目标' 映射为 '主要目标'");
          labelsToHighlight.add('主要目标');
        }
        if (validLabels.has(name)) {
          labelsToHighlight.add(name);
        }
      });
      const labelsArray = Array.from(labelsToHighlight);

      // DEBUG 3: 检查最终要高亮的标签
      console.log("[DEBUG] 5. 最终待高亮的标签数组 (labelsArray):", labelsArray);

      // 2) 仅按换行符分割文本
      // 使用 filter(line => line.trim() !== '') 排除空行
      const lines = description.split(/\r?\n/).filter(line => line.trim() !== '');

      // DEBUG 4: 检查分割后的行
      console.log(`[DEBUG] 6. 文本被分割为 ${lines.length} 行:`, lines);

      let html = '';

      // 3) 遍历每一行
      console.log("[DEBUG] 7. 开始逐行匹配...");
      lines.forEach((line, index) => {
        const trimmedLine = line.trim();

        // 确保 shouldHighlight 在这里被正确计算
        const shouldHighlight = labelsArray.some(label => {
          // 调用 shouldHighlightLine 进行精确匹配
          const isMatch = this.shouldHighlightLine(trimmedLine, label);

          if (isMatch) {
            // 报告匹配成功
            console.log(`[DEBUG]   -> 匹配成功! [行 ${index}] (标签: '${label}') (行内容: '${trimmedLine.substring(0, 20)}...')`);
          }
          return isMatch;
        });

        let lineContent = trimmedLine; // 默认内容

        if (shouldHighlight) {
          // 标红处理：用 <span> 标红文本，使用内联样式作为备选
          lineContent = `<span class="text-highlight" style="color: #ff4d4d; font-weight: bold;">${trimmedLine}</span>`;
          console.log(`[DEBUG]   -> 应用高亮样式! [行 ${index}]`);
        } else if (labelsArray.length > 0) {
          // 报告未匹配 (如果有标签要高亮的话)
          console.log(`[DEBUG]   -> 未匹配. [行 ${index}] (行内容: '${trimmedLine.substring(0, 20)}...')`);
        }

        // 使用div包裹每一行，确保样式正确应用
        html += `<div>${lineContent}</div>`;
      });

      // DEBUG 7: 检查最终输出的 HTML
      console.log("[DEBUG] 8. 最终生成的 HTML:", html);
      console.log("--- [DEBUG] formatDescription END ---");
      return html;
    },
    shouldHighlightLine(text, label) {
      if (!text || !label) return false;
      const escapeRegExp = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // 匹配：开头 + 0或多空格 + 标签 + 0或多空格 + (全角或半角冒号)
      const pattern = new RegExp(`^\\s*${escapeRegExp(label)}\\s*[：:]`);
      return pattern.test(text);
    },

    /**
     * 解析后端返回的 low_similarity_aspects，兼容多种格式：
     * - 数组：["动作","总结"]
     * - 字符串（JSON 或包含数组片段的字符串）：'{"data": ["动作","总结"]}' 或 '["动作","总结"]' 或 "{'["动作","总结"]...'}"
     */
    parseLowSimilarityAspects(raw) {
      try {
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        if (typeof raw === 'object') {
          for (const key of ['low_similarity_aspects', 'data', 'items', 'list']) {
            if (Array.isArray(raw[key])) return raw[key];
          }
          for (const k in raw) {
            if (Array.isArray(raw[k])) return raw[k];
          }
          return [];
        }
        if (typeof raw === 'string') {
          const s = raw.trim();
          if (!s) return [];
          if (s.startsWith('[') && s.endsWith(']')) {
            try { return JSON.parse(s); } catch (_) { }
          }
          if ((s.startsWith('{') && s.endsWith('}')) || (s.startsWith('[') && s.endsWith(']'))) {
            const normalized = s.replace(/'/g, '"');
            try {
              const obj = JSON.parse(normalized);
              return this.parseLowSimilarityAspects(obj);
            } catch (_) { /* ignore */ }
          }
          const match = s.match(/\[([^\]]+)\]/);
          if (match && match[0]) {
            const arrText = match[0].replace(/'/g, '"');
            try { return JSON.parse(arrText); } catch (_) {
              return match[1].split(',').map(t => t.replace(/["'\s]/g, '')).filter(Boolean);
            }
          }
        }
      } catch (e) {
        console.warn('解析 low_similarity_aspects 失败：', e);
      }
      return [];
    },
    getMainObject() {
      if (!this.fullResult.key_frame_detection || !this.fullResult.key_frame_detection.detections || !this.fullResult.key_frame_detection.detections.length) {
        return 'N/A';
      }
      const maxConfDet = this.fullResult.key_frame_detection.detections.reduce((prev, curr) => {
        return curr.confidence > prev.confidence ? curr : prev;
      }, this.fullResult.key_frame_detection.detections[0]);
      return maxConfDet.class;
    },
    getMainConfidence() {
      if (!this.fullResult.key_frame_detection || !this.fullResult.key_frame_detection.detections || !this.fullResult.key_frame_detection.detections.length) {
        return 0;
      }
      const maxConfDet = this.fullResult.key_frame_detection.detections.reduce((prev, curr) => {
        return curr.confidence > prev.confidence ? curr : prev;
      }, this.fullResult.key_frame_detection.detections[0]);
      return maxConfDet.confidence;
    },
    async fetchVideoList() {
      try {
        const response = await axios.get(`${API_BASE_URL}/videos`);
        this.videoList = response.data.videos;
        console.log("视频列表获取成功", this.videoList);
      } catch (error) {
        console.error("获取视频列表失败", error);
        this.videoList = [];
      }
    },
    selectVideo(video) {
      this.selectedVideo = video;

      // 正确构造原视频URL
      try {
        // 确保API_BASE_URL末尾没有斜杠
        const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
        // 构造正确的视频URL
        this.originalVideoURL = `${baseUrl}/video/${encodeURIComponent(video.name)}`;
        console.log("原视频URL:", this.originalVideoURL); // 用于调试
      } catch (error) {
        console.error("构造视频URL失败:", error);
        this.originalVideoURL = null;
      }

      // 2. 确保圆圈亮起（已通过v-bind:class实现）
      console.log("已选择视频:", video.name);
    },
    async startDetection() {
      if (!this.selectedVideo) {
        alert("请先选择视频文件！");
        return;
      }

      this.isLoading = true;
      this.processedVideoURL = null;
      this.taskId = null;
      this.fullResult = {
        video_description: null,
        accuracy_results: null,
        video_info: null,
        key_frame_detection: null
      };
      this.resultMessage = "正在启动分析...";
      this.progressMessage = "正在启动分析...";
      console.log("Selected video name:", this.selectedVideo.name);

      const baseUrl = VIDEO_DIR.endsWith('/') ? VIDEO_DIR.slice(0, -1) : VIDEO_DIR;
      const videoPath = `${baseUrl}/${this.selectedVideo.name}`;
      console.log("Constructed video path for /batch_predict:", videoPath);

      // 【关键修正点 A】：获取不带扩展名的视频名 (对应后端路由中的 <video_name>)
      let videoNameWithoutExtension = this.selectedVideo.name;
      // 使用正则表达式匹配并移除末尾的 .xxx 扩展名
      const extensionIndex = videoNameWithoutExtension.lastIndexOf('.');
      if (extensionIndex > 0) {
        videoNameWithoutExtension = videoNameWithoutExtension.substring(0, extensionIndex);
      }
      const videoNameEncoded = encodeURIComponent(videoNameWithoutExtension); // 对应后端路由中的 <video_name>

      try {
        // 1. 调用后端分析接口
        const analyzeResponse = await axios.post(`${API_BASE_URL}/batch_predict`, {
          // 将 video_name 替换为后端期望的 video_path
          video_path: videoPath
        });

        const analyzeData = analyzeResponse.data;
        if (analyzeData.status !== 'success') {
          throw new Error(analyzeData.error || '分析启动失败');
        }

        this.taskId = analyzeData.task_id;
        this.progressMessage = `分析任务 [${this.taskId}] 已启动，正在进行深度处理...`;
        const processingTime = analyzeData.processing_time;
        const timeDisplay = processingTime ? `${processingTime.toFixed(2)}s` : 'N/A';

        this.resultMessage = `任务ID: ${this.taskId}。处理时间预计 ${timeDisplay}。`;

        // 2. 获取检测结果
        const fullResultResponse = await axios.get(
          `${API_BASE_URL}/get_detection_results/${this.taskId}?video_name=${videoNameEncoded}`
        );
        const fullData = fullResultResponse.data;

        // 3. 更新界面结果 (确保所有字段都已从 fullData 复制过来)
        this.fullResult.task_id = fullData.task_id;
        this.fullResult.video_description = fullData.video_description;
        this.fullResult.video_info = fullData.video_info;
        this.fullResult.accuracy_results = fullData.overall_accuracy;
        this.fullResult.overall_accuracy = fullData.overall_accuracy;
        this.fullResult.low_similarity_aspects = fullData.low_similarity_aspects;
        this.fullResult.video_path = fullData.video_path;
        this.fullResult.deviceType = fullData.deviceType;
        this.fullResult.key_frame_path = fullData.key_frame_path;
        this.fullResult.key_frame_detection = fullData.key_frame_detection;

        // ---- 提取文件名和路径修正 (用于构造新接口 URL) ----
        // 原始路径字符串 (可能包含完整路径)
        const raw_key_frame_path = fullData.key_frame_path;
        const raw_video_path = fullData.video_path;

        // 【关键修正点 B】：从完整路径中提取纯文件名，用于构造新接口 URL (对应 <filename>)
        const key_frame_filename = getFilenameFromPath(raw_key_frame_path);
        const video_filename = getFilenameFromPath(raw_video_path);

        console.log("Extracted video filename:", video_filename);
        console.log("Extracted keyframe filename:", key_frame_filename);
        // ----------------------------------------------------

        // 4. 【关键修正点 C】: 构造处理后视频的 URL (用于播放器) - 对接新接口
        if (video_filename && this.taskId) {
          // 格式: /output/<task_id>/<video_name_without_ext>/<filename>
          this.processedVideoURL = `${API_BASE_URL}/output/${this.taskId}/${videoNameEncoded}/${encodeURIComponent(video_filename)}`;
          console.log("Processed video URL (Fixed):", this.processedVideoURL);
        } else {
          this.processedVideoURL = null;
        }

        // 5. 【关键修改】：整合所有后端结果并以 module1Res 的格式存储到 localStorage
        try {
          // 构造 module1Res 中使用的完整路径 (使用新接口 URL)
          let fullImagePathURL = "无图像路径";
          if (key_frame_filename && key_frame_filename !== "无图像路径" && this.taskId) {
            // 格式: /output/<task_id>/<video_name_without_ext>/<filename>
            fullImagePathURL = `${BASE_DIR}/output/${this.taskId}/${videoNameEncoded}/${encodeURIComponent(key_frame_filename)}`;
          }

          let fullProcessedVideoPathURL = "无视频路径";
          if (video_filename && video_filename !== "无视频路径" && this.taskId) {
            // 格式: /output/<task_id>/<video_name_without_ext>/<filename>
            fullProcessedVideoPathURL = `${API_BASE_URL}/output/${this.taskId}/${videoNameEncoded}/${encodeURIComponent(video_filename)}`;
          }

          const originalVideoPath = this.originalVideoURL || "无原视频路径";

          // --- 2. 构建 module1Res 最终对象 ---
          const module1Res = {
            ...fullData, // 复制所有后端返回的字段

            deviceType: fullData.deviceType || "N/A",

            // 使用处理后的完整 URL 覆盖原有的路径字段
            // key_frame_path: fullImagePathURL,
            video_path: fullProcessedVideoPathURL,

            originalVideoPath: originalVideoPath
          };

          // 3. 将对象转换为 JSON 字符串并存储
          localStorage.setItem('module1Res', JSON.stringify(module1Res));

          // 4. 方便调试：【格式化打印】存储的 module1Res 数据
          console.groupCollapsed("%c✅ Module 1 结果已存储 (module1Res)", "color: #17a2b8; font-weight: bold;");

          // 打印原始 JSON 字符串
          console.log("%c原始 JSON 字符串:", "font-weight: bold; color: #ffc107;", localStorage.getItem('module1Res'));

          // 打印对象所有键值对的表格
          const tableData = Object.entries(module1Res).map(([key, value]) => ({
            Key: key,
            Value: (typeof value === 'object' && value !== null) ? JSON.stringify(value).substring(0, 50) + '...' : value
          }));

          console.log("%c对象内容 (表格展示):", "font-weight: bold; color: #28a745;");
          console.table(tableData);

          console.groupEnd(); // 结束分组
        } catch (e) {
          console.error("保存 module1Res 到 localStorage 失败:", e);
        }

        this.resultMessage = "视频分析成功！结果已更新。";
        this.progressMessage = "分析完成";
      } catch (error) {
        console.error("分析请求失败:", error);
        this.resultMessage = "分析失败: " + (error.response && error.response.data && error.response.data.error) || error.message;
        this.progressMessage = "分析失败";
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * 导出结果
     */
    async exportResults() {
      if (!this.taskId) {
        alert("请先完成一次检测再导出结果。");
        return;
      }

      console.log(`正在请求导出任务: ${this.taskId}`);

      try {
        const response = await axios.get(`${API_BASE_URL}/export_results/${this.taskId}`, {
          responseType: 'blob', // 关键：告诉 axios 期望一个 Blob
        });

        // 从 response 中创建 Blob
        const blob = new Blob([response.data], { type: 'application/zip' });

        // 创建一个临时的 URL
        const downloadUrl = window.URL.createObjectURL(blob);

        // 创建一个 <a> 标签来触发下载
        const link = document.createElement('a');
        link.href = downloadUrl;

        // 设置下载的文件名 (后端已设置 Content-Disposition, 但这里是备用)
        link.download = `${this.taskId}_results.zip`;

        // 将 <a> 标签添加到 DOM 中 (在某些浏览器中是必需的)
        document.body.appendChild(link);

        // 触发点击
        link.click();

        // 清理
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      } catch (error) {
        console.error("导出结果失败:", error);
        // 尝试将 blob 错误转换为 JSON 文本
        if (error.response && error.response.data && error.response.data.type === 'application/json') {
          try {
            const errorJson = await error.response.data.text();
            const errorObj = JSON.parse(errorJson);
            alert(`导出失败: ${errorObj.error || '未知错误'}`);
          } catch (e) {
            alert("导出失败，且无法解析错误详情。");
          }
        } else {
          alert("导出结果失败，请查看控制台日志。");
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
/* 样式保持不变 */

/* * =========================================
 * 新UI样式（暗黑科技风）
 * =========================================
 */

/* 1. 全局和背景 (不变) */
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

.img_box {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('~@/assets/images/step1/-s-图层 0.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  opacity: 1;
  z-index: -1;
}

/* 2. 顶部标题栏 (不变) */
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
  font-size: 0.9rem;
  font-weight: bold;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  margin: 0 5px;
}

.btn-home {
  background-image: url('~@/assets/images/step4/首页按键.png');
}

.btn-back {
  background-image: url('~@/assets/images/step1/-s-按钮-蓝色-1.png');
}

.btn-next {
  background-image: url('~@/assets/images/step1/-s-按钮-绿色.png');
}

/* 3. 核心内容区 (不变) */
.content-row {
  flex-grow: 1;
  width: 100%;
  max-width: 100%;
  margin: 0;
}

/* 三列通用高度 (不变) */
.left-column,
.middle-column,
.right-column {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  /* 减去顶部栏高度和padding */
  padding: 0 !important;
}

/* 面板通用样式 (不变) */
[class^="panel-"] {
  width: 100%;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  padding: 20px 30px 30px 30px;
  display: flex;
  flex-direction: column;
}

/* 特定面板的高度和边距 (不变) */
.panel-left {
  flex-grow: 1;
  height: 100%;
}

.panel-right-top {
  height: 55%;
  flex-shrink: 0;
}

.panel-right-bottom {
  flex-grow: 1;
  height: 100%;
}

.panel-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 面板标题 (不变) */
.panel-header {
  height: 35px;
  background-image: url('~@/assets/images/step1/-s-二级标题.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;

  color: #fff;
  font-size: 1rem;
  font-weight: bold;
  padding-left: 0;
  margin-bottom: 10px;

  display: flex;
  justify-content: center;
  align-items: center;
}

.header-accuracy {
  margin-top: 15px;
}

/* 4. 左侧列 (不变) */
.panel-left {
  background-image: url('~@/assets/images/step1/-s-弹框-选择数据.png');
}

.server-video-list {
  flex-grow: 1;
  max-height: calc(100% - 80px);
  padding-right: 10px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #00e5ff;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
  }
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

/* 隐藏 b-form-file (如果不再使用) */
.upload-area {
  display: none;
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

/* 5. 中间列 (不变) */
.middle-column {
  justify-content: space-around;
}

.video-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.video-label {
  width: 200px;
  height: 35px;
  background-image: url('~@/assets/images/step1/-s-二级标题.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;

  color: #fff;
  font-size: 0.9rem;
  font-weight: bold;
  line-height: 35px;
  text-align: center;
  margin-bottom: 10px;
}

.label-processed {
  font-size: 0.8rem;
}

.video-frame {
  width: 95%;
  height: 320px;
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
}

/* 6. 右侧列 (重点修正 CSS 在这里) */

/* 右上方面板 (容器样式不变) */
.panel-right-top {
  background-image: url('~@/assets/images/step1/弹框-偏差检测结果.png');
}

.description-box {
  flex-grow: 1;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 229, 255, 0.3);
  color: #eee;
  font-size: 0.9rem;
  line-height: 1.6;
  padding: 10px !important;
  overflow: auto;
  display: flex; /* 确保内部元素（v-html渲染的div）可以正常布局 */
  flex-direction: column; /* 垂直排列 v-html 渲染的行 */

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #00e5ff;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
  }

  }
</style>

/* 全局样式，确保能应用到v-html生成的内容 */
<style lang="scss">
.text-highlight {
  color: #ff4d4d !important; /* 确保颜色覆盖 */
  font-weight: bold;
  background-color: rgba(255, 77, 77, 0.1);
  padding: 1px 3px;
  border-radius: 3px;
  display: inline-block;
}
</style>

<style lang="scss" scoped>

// 移除原代码中所有冗余或冲突的 .description-box>>>.text-highlight 规则

.small-text {
  font-size: 0.9rem;
  line-height: 1.6; // 确保行高生效
}

.text-red {
  color: #ff4d4d;
  font-weight: bold;
  font-size: 0.95rem;
}

/* 右下方面板 (不变) */
.panel-right-bottom {
  background-image: url('~@/assets/images/step1/-s-弹窗-偏差检测准确率.png');
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

/* 导出按钮的容器 (不变) */
.action-buttons-right {
  flex-shrink: 0;
  text-align: right;
  margin-top: auto;
  padding-top: 15px;
  padding-bottom: 10px;
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

  /* 导出按钮的 disabled 样式 */
  &:disabled {
    filter: grayscale(80%);
    cursor: not-allowed;
  }
}

/* 7. 响应式调整 (不变) */
@media (max-width: 1400px) {
  .video-frame {
    height: 250px;
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

  .left-column,
  .middle-column,
  .right-column {
    height: auto;
    margin-bottom: 20px;
  }

  .content-row {
    flex-direction: column;
    align-items: center;
  }

  .left-column,
  .right-column {
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

  .panel-left {
    min-height: 400px;
  }

  .panel-right-top {
    min-height: 250px;
    height: auto;
  }

  .panel-right-bottom {
    min-height: 150px;
  }
}
</style>