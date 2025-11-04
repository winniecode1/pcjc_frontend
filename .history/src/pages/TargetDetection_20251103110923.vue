<template>
  </template>

<script>
import axios from 'axios';
import { BIcon, BIconPlayCircleFill, BIconPlayFill } from 'bootstrap-vue';

// 假设后端运行在这个地址
const API_BASE_URL = 'http://10.109.253.71:5236';
// 假设后端获取文件列表的接口
const LIST_API_URL = `${API_BASE_URL}/api/videos/list`;
// 假设视频静态资源的访问路径
const VIDEO_STATIC_PATH = `${API_BASE_URL}/static/videos/`;
// 假设文件上传的接口
const UPLOAD_API_URL = `${API_BASE_URL}/api/videos/upload`;

export default {
  name: 'TargetDetection',
  components: {
    'b-icon': BIcon,
    'b-icon-play-circle-fill': BIconPlayCircleFill,
    'b-icon-play-fill': BIconPlayFill,
  },
  data() {
    return {
      fullWidth: window.innerWidth,
      fullHeight: window.innerHeight,

      uploadedFile: null, // 用户通过 b-form-file 上传的文件对象
      originalVideoURL: null, // 上传文件在客户端的预览 URL

      // 当前选中用于检测的文件信息
      selectedFile: { 
        type: null, // 'upload' 或 'server'
        name: null,
        url: null, // 视频播放的实际 URL (如果是服务器文件，是 HTTP 路径)
        index: null, 
        fileObject: null, 
      },
      
      processedImageURL: "https://via.placeholder.com/300x200?text=Detection+Result", 
      taskId: null, 
      isLoading: false, 
      progressMessage: null, 
      resultMessage: null, 
      
      fullResult: { /* ... */ },
      
      // *** 核心修改：初始化为空数组，等待从后端获取 ***
      serverVideos: [],
    };
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    // 组件挂载后立即尝试获取服务器视频列表
    this.fetchServerVideos(); 
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  watch: {
    uploadedFile(newFile) {
      if (newFile) {
        // 1. 文件对象存在时，尝试先上传到服务器
        this.uploadFileToServer(newFile); 
      } else {
        // 如果文件被清除，也清除 URL 并检查选中状态
        this.originalVideoURL = null;
        if (this.selectedFile.type === 'upload') {
            this.clearSelection();
        }
      }
      this.taskId = null;
      this.fullResult = { video_description: null, accuracy_results: null, video_info: null };
      this.resultMessage = null;
      this.progressMessage = null;
    }
  },
  methods: {
    handleResize() {
      this.fullWidth = window.innerWidth;
      this.fullHeight = window.innerHeight;
    },
    handleVideoError(e) {
      console.error("视频加载错误:", e);
      this.resultMessage = "视频加载失败，请检查服务器日志和网络。";
    },
    
    // *** 新增：从后端接口获取视频文件名列表 ***
    async fetchServerVideos() {
      try {
        console.log(`正在从 ${LIST_API_URL} 获取服务器视频列表...`);
        this.isLoading = true;

        // 模拟后端返回的文件名列表 (实际应用中请替换为 axios 调用)
        // const response = await axios.get(LIST_API_URL);
        // const filenames = response.data.filenames || []; // 假设后端返回 { filenames: [...] }
        
        // 模拟您指定的 1.mp4 到 100.mp4 文件名
        const filenames = Array.from({ length: 100 }, (_, i) => `${i + 1}.mp4`);

        // 构造完整的视频对象数组，包含可播放的 URL
        this.serverVideos = filenames.map((name, index) => ({
            name: name,
            url: VIDEO_STATIC_PATH + name, // 拼接完整的静态资源访问路径
            index: index
        }));

        this.isLoading = false;
        console.log(`成功获取 ${this.serverVideos.length} 个服务器视频`);

      } catch (error) {
        this.isLoading = false;
        console.error("获取服务器视频列表失败:", error);
        this.resultMessage = "无法连接到服务器或获取视频列表。";
      }
    },

    // *** 新增：上传文件到服务器并更新列表 ***
    async uploadFileToServer(fileObject) {
      this.isLoading = true;
      this.progressMessage = "正在上传文件...";
      
      const formData = new FormData();
      formData.append('video', fileObject); // 'video' 必须与后端接收文件的字段名一致
      
      try {
        // 实际应用中请替换为 axios 调用
        /*
        const response = await axios.post(UPLOAD_API_URL, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          // 可选：添加上传进度监听
          onUploadProgress: progressEvent => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            this.progressMessage = `上传中... ${percentCompleted}%`;
          }
        });
        */
        
        // 模拟上传成功
        await new Promise(resolve => setTimeout(resolve, 2000));
        this.progressMessage = "上传成功，正在刷新列表...";
        
        // 上传成功后，**关键步骤**：
        // 1. 清除客户端预览 URL (因为接下来要从服务器加载)
        this.originalVideoURL = null; 
        // 2. 刷新服务器视频列表，获取包含新上传文件的完整列表
        await this.fetchServerVideos();
        
        // 3. 自动选中新上传的文件（查找 name 匹配的项）
        const newServerFile = this.serverVideos.find(v => v.name === fileObject.name);
        if (newServerFile) {
            this.selectVideo({ type: 'server', name: newServerFile.name, url: newServerFile.url, index: newServerFile.index });
        }
        
      } catch (error) {
        console.error("文件上传失败:", error);
        this.resultMessage = "文件上传失败，请检查后端服务。";
        // 上传失败后，清除上传框内的文件对象，用户可以重新尝试
        this.uploadedFile = null; 
      } finally {
        this.isLoading = false;
      }
    },
    
    // 处理列表点击事件，切换选中视频
    selectVideo(videoInfo) {
      // 如果点击的是上传文件，但它尚未在服务器列表里（通常不会发生，因为上传会刷新列表）
      // 或者如果它是列表中的服务器文件
      this.selectedFile.type = 'server'; // 只要文件在列表中，就视为服务器文件
      this.selectedFile.name = videoInfo.name;
      this.selectedFile.url = videoInfo.url;
      this.selectedFile.index = videoInfo.index; 
      this.selectedFile.fileObject = null; // 列表中显示的项都没有 fileObject
      
      // 切换视频时，重置检测结果
      this.taskId = null;
      this.fullResult = { video_description: null, accuracy_results: null, video_info: null };
      this.processedImageURL = "https://via.placeholder.com/300x200?text=Detection+Result";
      this.resultMessage = null;
      this.progressMessage = null;
    },
    
    clearSelection() {
        this.selectedFile = { type: null, name: null, url: null, index: null, fileObject: null };
        this.processedImageURL = "https://via.placeholder.com/300x200?text=Detection+Result";
    },
    
    // *** 修改：startDetection 现在只处理 serverVideos 中的文件 ***
    async startDetection() {
      if (!this.selectedFile.url || this.selectedFile.type !== 'server') {
        alert("请先从列表中选择一个已存储的视频文件！");
        return;
      }
      
      this.isLoading = true;
      this.progressMessage = `正在对 ${this.selectedFile.name} 启动检测...`;
      this.resultMessage = "检测进行中...";
      
      try {
        // 调用后端分析接口，传递文件名或 URL
        const analyzeUrl = `${API_BASE_URL}/api/analyze`;
        console.log(`调用分析接口: ${analyzeUrl}，分析文件: ${this.selectedFile.name}`);
        
        /*
        const response = await axios.post(analyzeUrl, {
            filename: this.selectedFile.name // 传递文件名
        });
        */
        
        // 模拟检测耗时
        await new Promise(resolve => setTimeout(resolve, 3000)); 

        this.progressMessage = "检测完成";
        this.resultMessage = "多模态偏差检测成功！";
      } catch (error) {
        console.error("检测请求失败:", error);
        this.resultMessage = "检测失败: " + error.message;
        this.progressMessage = "检测失败";
      } finally {
        this.isLoading = false;
      }
    }
    
    // *** 批量处理的简单实现示例（仅供参考） ***
    /*
    async startBatchDetection() {
        if (this.serverVideos.length === 0) {
            alert("服务器上没有可供检测的视频。");
            return;
        }
        this.isLoading = true;
        this.progressMessage = `正在启动批量检测，共 ${this.serverVideos.length} 个视频...`;

        try {
            for (let i = 0; i < this.serverVideos.length; i++) {
                const video = this.serverVideos[i];
                this.progressMessage = `正在处理 ${i + 1}/${this.serverVideos.length}: ${video.name}...`;
                
                // 模拟单次分析调用
                // await axios.post(`${API_BASE_URL}/api/analyze`, { filename: video.name });
                await new Promise(resolve => setTimeout(resolve, 1000)); 
            }
            this.resultMessage = "所有视频批量检测完成！";
            this.progressMessage = "批量检测完成";
        } catch (error) {
            this.resultMessage = "批量检测过程中发生错误: " + error.message;
        } finally {
            this.isLoading = false;
        }
    }
    */
  }
};
</script>

<style lang="scss" scoped>
  /* ... (样式部分保持不变) ... */
</style>




<!-- <template>
  <div class="section">
    <div class="register" :style="{width: fullWidth+'px', height:fullHeight+'px'}"></div>
    <div class="img_box" :style="{width: fullWidth+'px'}"></div>
    <b-row class="justify-content-center pt-5">
      <b-col cols="10" class="text-center">
        <p class="newTitle text-center">目标检测</p>
      </b-col>
    </b-row>

    <b-row class="justify-content-center pt-4 mb-4">
      <b-col cols="10" class="d-flex justify-content-start align-items-center">
        <div class="upload-area mx-3">
          <b-form-file
            v-model="file"
            :state="Boolean(file)"
            placeholder="选择视频..."
            drop-placeholder="拖拽视频到这里..."
            accept="video/*"  class="upload-input"
            browse-text="上传文件"
          ></b-form-file>
        </div>

        <b-button @click="startAnalysis" variant="primary" :disabled="!file || isLoading" class="start-btn mx-3">
          <b-spinner small v-if="isLoading"></b-spinner>
          {{ isLoading ? (progressMessage || '分析中...') : '开始分析' }} </b-button>
      </b-col>
    </b-row>

    <b-row class="justify-content-center my-4">
      <b-col cols="5" class="text-center video-container mx-3">
        <div class="box-label">原视频</div>
        <div class="video-placeholder">
          <video v-if="originalVideoURL" :src="originalVideoURL" controls class="image-display" :key="originalVideoURL"></video>
          <div v-else class="placeholder-text">请上传视频</div>
        </div>
      </b-col>
      <b-col cols="5" class="text-center video-container mx-3">
        <div class="box-label">处理后视频 ({{ taskId || 'N/A' }})</div>
        <div class="video-placeholder">
          <video v-if="processedVideoURL" :src="processedVideoURL" controls class="image-display" :key="processedVideoURL" @error="handleVideoError"></video>
          <div v-else-if="isLoading" class="placeholder-text">等待处理结果...</div>
          <div v-else class="placeholder-text">处理后视频将在这里显示</div>
        </div>
      </b-col>
    </b-row>

    <b-row class="justify-content-center my-4">
      <b-col cols="10" class="text-center description-container">
        <div class="box-label">视频描述 / 结果概览</div>
        <div class="description-box p-3">
          <p v-if="fullResult.video_info" class="mb-1 text-left">
            **视频信息**: {{ fullResult.video_info.filename }} ({{ fullResult.video_info.duration.toFixed(2) }}s, {{ fullResult.video_info.width }}x{{ fullResult.video_info.height }})
            <b-badge variant="info" class="mx-2">处理耗时: {{ fullResult.processing_time ? fullResult.processing_time.toFixed(2) + 's' : 'N/A' }}</b-badge>
          </p>
          <p v-if="fullResult.video_description" class="mb-1 text-left">
            **描述**: {{ fullResult.video_description }}
          </p>
          <p v-else-if="!isLoading" class="text-left">
            {{ resultMessage || '分析完成后会在这里显示主要结果信息。' }}
          </p>
        </div>
      </b-col>
    </b-row>

    <b-row class="justify-content-center mt-4 pb-5">
      <b-col cols="5" class="text-center metric-container mx-3">
        <div class="box-label">目标检测精确率</div>
        <div class="metric-box">
          <template v-if="fullResult.accuracy_results && fullResult.accuracy_results.detection">
             {{ (fullResult.accuracy_results.detection.precision * 100).toFixed(2) + '%' }}
          </template>
          <template v-else>
             N/A </template>
        </div>
      </b-col>
      <b-col cols="5" class="text-center metric-container mx-3">
        <div class="box-label">描述相似度</div>
        <div class="metric-box">
          <template v-if="fullResult.accuracy_results && fullResult.accuracy_results.description">
             {{ (fullResult.accuracy_results.description.similarity * 100).toFixed(2) + '%' }}
          </template>
          <template v-else>
             N/A </template>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
// 导入 axios 用于 HTTP 请求
import axios from 'axios';

// 后端 API 基础路径，根据您的实际部署情况可能需要修改
// 您的后端默认在 http://0.0.0.0:5236 启动
const API_BASE_URL = 'http://10.109.253.71:5236';

export default {
  name: 'TargetDetection',
  data() {
    return {
      fullWidth: window.innerWidth,
      fullHeight: window.innerHeight,

      file: null, // 上传的视频文件
      originalVideoURL: null, // 客户端预览原视频用
      processedVideoURL: null, // 处理后视频的 URL
      taskId: null, // 任务ID
      isLoading: false, // 加载状态
      progressMessage: null, // 进度信息
      resultMessage: null, // 结果信息
      fullResult: { // 存储完整的后端结果
        task_id: null,
        video_description: null,
        video_info: null,
        processing_time: null,
        accuracy_results: null,
        video_path: null,
      }
    };
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  watch: {
    // 监听文件变化，用于客户端预览
    file(newFile) {
      if (newFile) {
        this.originalVideoURL = URL.createObjectURL(newFile);
        // 清除旧结果
        this.processedVideoURL = null;
        this.taskId = null;
        this.fullResult = { video_description: null, accuracy_results: null, video_info: null };
        this.resultMessage = null;
        this.progressMessage = null;
      } else {
        this.originalVideoURL = null;
      }
    }
  },
  methods: {
    handleResize() {
      this.fullWidth = window.innerWidth;
      this.fullHeight = window.innerHeight;
    },
    handleVideoError(e) {
      console.error("视频加载错误:", e);
      this.resultMessage = "处理后视频加载失败，请检查服务器日志和网络。";
    },
    // 调用后端分析接口
    async startAnalysis() {
      if (!this.file) {
        alert("请先选择视频文件！");
        return;
      }

      this.isLoading = true;
      this.processedVideoURL = null;
      this.taskId = null;
      this.fullResult = { video_description: null, accuracy_results: null, video_info: null };
      this.resultMessage = "正在上传视频并启动分析...";
      this.progressMessage = "正在启动分析...";

      const formData = new FormData();
      formData.append('video', this.file); // 字段名改为 'video'

      try {
        // 步骤 1: 调用 /analyze_video 接口启动分析
        const analyzeResponse = await axios.post(`${API_BASE_URL}/analyze_video`, formData
        , {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
          // headers: { 'Accept': 'application/json' }
        }
        );

        const analyzeData = analyzeResponse.data;
        if (analyzeData.status !== 'success') {
           throw new Error(analyzeData.error || '分析启动失败');
        }

        this.taskId = analyzeData.task_id;
        this.progressMessage = `分析任务 [${this.taskId}] 已启动，正在进行深度处理...`;
        this.resultMessage = `任务ID: ${this.taskId}。处理时间预计 ${analyzeData.processing_time.toFixed(2)}s。`;

        // 步骤 2: 调用 /get_detection_results/<task_id> 接口获取完整结果
        const fullResultResponse = await axios.get(`${API_BASE_URL}/get_detection_results/${this.taskId}`);
        const fullData = fullResultResponse.data;

        // 步骤 3: 更新结果
        this.fullResult.task_id = fullData.task_id;
        this.fullResult.video_description = fullData.video_description;
        this.fullResult.video_info = fullData.video_info;
        this.fullResult.accuracy_results = fullData.accuracy_results;

        // 这里的 output_folder 和 processing_time 需要通过某种方式从后端获取或估算
        // 由于 fullData 中不包含 processing_time，我们使用 analyzeData 中的值
        this.fullResult.processing_time = analyzeData.processing_time;

        // 构造处理后视频的 URL
        // this.processedVideoURL = fullData.video_path; // 例如: /output/video_analysis_.../detected_video.mp4
        this.processedVideoURL = `${API_BASE_URL}${fullData.video_path}`;

        this.resultMessage = "视频分析成功！结果已更新。";
        this.progressMessage = "分析完成";
      } catch (error) {
        console.error("分析请求失败:", error);
        this.resultMessage = "分析失败: " + (error.response && error.response.data && error.response.data.error) || error.message;
        this.fullResult = { video_description: null, accuracy_results: null, video_info: null };
        this.progressMessage = "分析失败";
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
  /* 样式保持不变 */
  .section {
    background-color: #EAF4FE;
    color: black;
    font-size: 100%;
    width: 100%;
    min-height: 100vh;
    font-family: "Helvetica Neue";
    z-index: 2;
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
      background-image: url('../assets/images/newBackGound.png');
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center center;
      width: 100%;
      height: 100%;
      opacity: 0.8;
  }

  .video-container, .metric-container, .description-container {
    padding: 10px;
    position: relative;
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

  .video-placeholder {
    height: 400px;
    border: 2px solid #ccc;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    background-color: #fff;
    margin-top: 10px;
  }

  /* 适配 video 标签 */
  .video-placeholder video {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .placeholder-text {
    color: #999;
    font-size: 1.2rem;
  }

  .description-box {
    min-height: 150px; /* 增加高度以容纳描述 */
    border: 2px solid #ccc;
    background-color: #fff;
    margin-top: 10px;
    overflow-y: auto; /* 允许滚动 */
  }

  .metric-box {
    height: 150px;
    line-height: 150px;
    border: 2px solid #ccc;
    font-size: 2rem;
    font-weight: bold;
    color: #2168BE;
    background-color: #fff;
    margin-top: 10px;
  }

  .upload-area {
      width: 300px;
  }

  .start-btn {
      width: 150px;
  }

  .result-tag {
      background-color: #2168BE;
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      margin-right: 5px;
      font-size: 0.9em;
  }

</style> -->
