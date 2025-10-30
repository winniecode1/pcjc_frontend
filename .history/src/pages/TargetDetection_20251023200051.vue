<template>
  <div class="section">
    <div class="register" :style="{width: fullWidth+'px', height:fullHeight+'px'}"></div>
    <div class="img_box" :style="{width: fullWidth+'px'}"></div>

    <b-row class="justify-content-center pt-5">
      <b-col cols="10" class="text-center">
        <p class="newTitle text-center">目标检测</p>
      </b-col>
    </b-row>

    <b-row class="justify-content-center pt-4 mb-4 control-area">
      <b-col cols="10" class="d-flex justify-content-start align-items-center">

        <div class="upload-area mx-3">
          <b-form-file
            v-model="file"
            :state="Boolean(file)"
            placeholder="选择视频..."
            drop-placeholder="拖拽视频到这里..."
            accept="video/*"
            class="upload-input"
            browse-text="上传视频"
          ></b-form-file>
        </div>

        <b-form-select v-model="targetFPS" :options="fpsOptions" class="fps-select mx-3"></b-form-select>

        <b-button @click="startInference" variant="primary" :disabled="!file || isLoading" class="start-btn mx-3">
          <b-spinner small v-if="isLoading"></b-spinner>
          {{ isLoading ? '运行中...' : '开始运行' }}
        </b-button>
      </b-col>
    </b-row>

    <b-row class="justify-content-center my-4">
      <b-col cols="5" class="text-center video-container mx-3">
        <div class="box-label">原视频</div>
        <div class="video-placeholder">
          <video v-if="originalVideoURL" :src="originalVideoURL" controls class="video-display" />
          <div v-else class="placeholder-text">请上传视频</div>
        </div>
      </b-col>
      <b-col cols="5" class="text-center video-container mx-3">
        <div class="box-label">处理后视频</div>
        <div class="video-placeholder">
          <video v-if="processedVideoURL" :src="processedVideoURL" controls class="video-display" />
          <div v-else class="placeholder-text">等待处理结果...</div>
        </div>
      </b-col>
    </b-row>

    <b-row class="justify-content-center my-4">
      <b-col cols="10" class="text-center description-container">
        <div class="box-label">视频描述</div>
        <div class="description-box p-3">
          <p class="mb-1 text-left">
            **Prompt**: {{ inferencePrompt }}
          </p>
          <hr/>
          <p class="text-left summary-text">
            {{ resultMessage || '推理完成后会在这里显示视频内容总结。' }}
          </p>
          <p v-if="!isLoading && inferenceResult.processed_frames" class="text-right text-muted small">
            （共处理 {{ inferenceResult.processed_frames }} 帧，耗时 {{ inferenceResult.processing_time.toFixed(2) }} 秒）
          </p>
        </div>
      </b-col>
    </b-row>

    <b-row class="justify-content-center mt-4 pb-5">
      <b-col cols="5" class="text-center metric-container mx-3">
        <div class="box-label">准确率</div>
        <div class="metric-box">
          {{ simulatedAccuracy ? (simulatedAccuracy * 100).toFixed(2) + '%' : 'N/A' }}
        </div>
      </b-col>
      <b-col cols="5" class="text-center metric-container mx-3">
        <div class="box-label">召回率</div>
        <div class="metric-box">
          N/A
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
// 导入 axios 用于 HTTP 请求
import axios from 'axios';

export default {
  name: 'TargetDetection',
  data() {
    return {
      // 模拟 index.vue 中的背景自适应数据
      fullWidth: window.innerWidth,
      fullHeight: window.innerHeight,

      file: null, // 上传的视频文件
      originalVideoURL: null, // 客户端预览原视频用
      processedVideoURL: null, // 处理后视频的 URL（后端路径）

      inferencePrompt: "框出每一个飞机、船、车辆和人的位置，以json格式输出所有的坐标，每个目标包含label和bbox_2d（坐标[x1,y1,x2,y2]）", // 默认 Prompt
      isLoading: false, // 加载状态

      targetFPS: '1', // 默认 FPS
      fpsOptions: [
        { value: '0.5', text: '0.5 FPS' },
        { value: '1', text: '1 FPS (默认)' },
        { value: '2', text: '2 FPS' },
        { value: '5', text: '5 FPS' }
      ],

      // 后端未提供准确率字段，使用模拟值 0.85 (对应 predict_new.py 中的 Config.DEFAULT_ACCURACY)
      simulatedAccuracy: 0.85,

      resultMessage: null, // 视频描述/结果信息

      inferenceResult: { // 存储后端返回的结果
        processed_frames: 0,
        processing_time: 0,
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
        // 创建本地 URL 用于 <video> 预览
        this.originalVideoURL = URL.createObjectURL(newFile);
        // 清除旧结果
        this.processedVideoURL = null;
        this.resultMessage = null;
        this.inferenceResult = { processed_frames: 0, processing_time: 0 };
        // 重置模拟准确率
        this.simulatedAccuracy = 0.85;
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
    // 调用后端推理接口
    async startInference() {
      if (!this.file) {
        alert("请先选择视频文件！");
        return;
      }

      this.isLoading = true;
      this.processedVideoURL = null;
      this.resultMessage = "正在等待后端推理结果...";

      const formData = new FormData();
      // !!! 关键修改 1: 后端要求字段名为 'video' (predict_new.py: request.files["video"])
      formData.append('video', this.file);
      formData.append('prompt', this.inferencePrompt);
      // !!! 关键修改 2: 添加 fps 字段 (predict_new.py: request.form.get("fps"))
      formData.append('fps', this.targetFPS);

      try {
        // !!! 关键修改 3: 后端接口地址和路由 (predict_new.py: @app.route("/video_inference"))
        // 请根据实际部署情况修改 IP 和端口
        const backendBaseURL = 'http://10.109.253.71:5235';
        const response = await axios.post(`${backendBaseURL}/video_inference`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        const data = response.data;

        // !!! 关键修改 4: 更新视频描述 (summary) 和 处理后视频 URL (video_filename)
        this.resultMessage = data.summary; // 视频描述
        this.inferenceResult.processed_frames = data.processed_frames;
        this.inferenceResult.processing_time = data.processing_time;

        // 构造处理后视频的访问 URL (predict_new.py: @app.route("/output/<path:filename>"))
        this.processedVideoURL = `${backendBaseURL}/output/${data.video_filename}`;

        // 模拟准确率可以根据结果稍微调整（可选）
        // this.simulatedAccuracy = this.simulatedAccuracy * 0.95 + Math.random() * 0.1;

        console.log("推理成功:", data);
      } catch (error) {
        console.error("推理请求失败:", error);
        const errorMessage = (error.response && error.response.data && error.response.data.error) || error.message;
        this.resultMessage = "推理失败: " + errorMessage;

        this.processedVideoURL = null;
        this.inferenceResult = { processed_frames: 0, processing_time: 0 };
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
  /* ... 保持原有样式不变，只增加视频播放和FPS选择器的样式 ... */
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

  // 调整控制区对齐
  .control-area {
      .col-10 {
          justify-content: center !important; /* 使上传和运行按钮居中 */
      }
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

  // 视频播放器样式
  .video-display {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .placeholder-text {
    color: #999;
    font-size: 1.2rem;
  }

  .description-box {
    min-height: 200px; /* 增加高度以容纳视频描述 */
    border: 2px solid #ccc;
    background-color: #fff;
    margin-top: 10px;
  }

  .summary-text {
      white-space: pre-wrap; /* 保持换行和空格 */
      word-break: break-word;
      min-height: 100px;
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

  .fps-select {
      width: 150px;
  }

  .start-btn {
      width: 150px;
  }

  // 移除不再需要的 .result-tag 样式
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
            accept="image/*"
            class="upload-input"
            browse-text="上传文件"
          ></b-form-file>
        </div>

        <b-button @click="startInference" variant="primary" :disabled="!file || isLoading" class="start-btn mx-3">
          <b-spinner small v-if="isLoading"></b-spinner>
          {{ isLoading ? '推理中...' : '开始推理' }}
        </b-button>

      </b-col>
    </b-row>

    <b-row class="justify-content-center my-4">
      <b-col cols="5" class="text-center video-container mx-3">
        <div class="box-label">原视频</div>
        <div class="video-placeholder">
          <img v-if="originalImageURL" :src="originalImageURL" alt="原视频" class="image-display" />
          <div v-else class="placeholder-text">请上传视频</div>
        </div>
      </b-col>
      <b-col cols="5" class="text-center video-container mx-3">
        <div class="box-label">处理后视频</div>
        <div class="video-placeholder">
          <img v-if="processedImageBase64" :src="'data:image/jpeg;base64,' + processedImageBase64" alt="处理后视频" class="image-display" />
          <div v-else class="placeholder-text">等待处理结果...</div>
        </div>
      </b-col>
    </b-row>

    <b-row class="justify-content-center my-4">
      <b-col cols="10" class="text-center description-container">
        <div class="box-label">视频描述 / JSON 结果概览</div>
        <div class="description-box p-3">
          <p class="mb-1 text-left">
            **Prompt**: {{ inferencePrompt }}
          </p>
          <p v-if="inferenceResult.result && inferenceResult.result.length" class="mb-1 text-left">
            **检测结果**: 共检测到 {{ inferenceResult.result.length }} 个目标。例如:
            <span v-for="(item, index) in inferenceResult.result.slice(0, 3)" :key="index" class="result-tag">
              {{ item.label }}
            </span>
            ...
          </p>
          <p v-else-if="!isLoading" class="text-left">
            {{ resultMessage || '推理完成后会在这里显示主要结果信息。' }}
          </p>
        </div>
      </b-col>
    </b-row>

    <b-row class="justify-content-center mt-4 pb-5">
      <b-col cols="5" class="text-center metric-container mx-3">
        <div class="box-label">准确率</div>
        <div class="metric-box">
          {{ inferenceResult.accuracy ? (inferenceResult.accuracy * 100).toFixed(2) + '%' : 'N/A' }}
        </div>
      </b-col>
      <b-col cols="5" class="text-center metric-container mx-3">
        <div class="box-label">召回率</div>
        <div class="metric-box">
          N/A
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
// 导入 axios 用于 HTTP 请求
import axios from 'axios';

export default {
  name: 'TargetDetection',
  data() {
    return {
      // 模拟 index.vue 中的背景自适应数据
      fullWidth: window.innerWidth,
      fullHeight: window.innerHeight,

      file: null, // 上传的视频文件
      originalImageURL: null, // 客户端预览原图用
      processedImageBase64: null, // 处理后视频的 Base64 编码
      inferencePrompt: "框出每一个飞机、船、车辆和人的位置，以json格式输出所有的坐标", // 默认 Prompt
      isLoading: false, // 加载状态
      resultMessage: null, // 结果信息
      inferenceResult: { // 存储后端返回的结果
        accuracy: null,
        result: [],
        original_size: { width: 0, height: 0 },
        resized_size: { width: 0, height: 0 },
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
        this.originalImageURL = URL.createObjectURL(newFile);
        // 清除旧结果
        this.processedImageBase64 = null;
        this.inferenceResult = { accuracy: null, result: [] };
        this.resultMessage = null;
      } else {
        this.originalImageURL = null;
      }
    }
  },
  methods: {
    handleResize() {
      this.fullWidth = window.innerWidth;
      this.fullHeight = window.innerHeight;
    },
    // 调用后端推理接口
    async startInference() {
      if (!this.file) {
        alert("请先选择视频文件！");
        return;
      }

      this.isLoading = true;
      this.processedImageBase64 = null;
      this.resultMessage = "正在等待后端推理结果...";

      const formData = new FormData();
      formData.append('image', this.file);
      formData.append('prompt', this.inferencePrompt);

      try {
        // 后端接口地址：HOST + PORT + /inference，默认为 http://0.0.0.0:5234/inference
        // 实际部署时可能需要修改为正确的IP和端口
        // const response = await axios.post('/inference', formData, {
        const response = await axios.post('http://10.109.253.71:5234/inference', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        const data = response.data;
        this.inferenceResult.accuracy = data.accuracy;
        this.inferenceResult.result = data.result;
        this.inferenceResult.original_size = data.original_size;
        this.inferenceResult.resized_size = data.resized_size;
        this.processedImageBase64 = data.image_with_boxes_base64;
        this.resultMessage = "推理成功！结果已更新。";
      } catch (error) {
        console.error("推理请求失败:", error);
        this.resultMessage = "推理失败: " + (error.response && error.response.data && error.response.data.error) || error.message;
        // this.resultMessage = "推理失败: " + (error.response?.data?.error || error.message);
        this.inferenceResult = { accuracy: null, result: [] };
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
  .section {
    background-color: #EAF4FE;
    color: black;
    font-size: 100%;
    width: 100%;
    min-height: 100vh; /* 至少一个视口高度 */
    font-family: "Helvetica Neue";
    z-index: 2;
  }

  .newTitle {
    // 标题样式
    font-size: calc(2vw + 1rem);
    color: #2168BE;
    font-weight: bolder;
    letter-spacing: 0.1em;
  }

  // 背景自适应样式
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
      // 假设背景图路径与 index.vue 相同
      background-image: url('../assets/images/newBackGound.png');
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center center;
      width: 100%;
      height: 100%;
      opacity: 0.8; /* 调整透明度以适应背景 */
  }

  // 截图中的红色边框元素样式
  .video-container, .metric-container, .description-container {
    padding: 10px;
    position: relative;

    // 模拟截图中的红色边框
    // border: 2px solid red;
  }

  .box-label {
    // 模拟截图中的文字位置
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
    height: 400px; /* 预设高度 */
    border: 2px solid #ccc;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    background-color: #fff;
    margin-top: 10px;
  }

  .image-display {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .placeholder-text {
    color: #999;
    font-size: 1.2rem;
  }

  .description-box {
    min-height: 100px;
    border: 2px solid #ccc;
    background-color: #fff;
    margin-top: 10px;
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
      width: 300px; /* 调整上传组件的宽度 */
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
