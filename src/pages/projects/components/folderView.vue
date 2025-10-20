<template>
  <div class='item _2fd8twDco3d8QZvnSUuJke'>
    <b-modal :id="'foldermodal'+num" :title="folder.folderName" size="xl" ok-only no-stacking>
<!--      <template #modal-header="{ close }">-->
<!--        &lt;!&ndash; Emulate built in modal header close button action &ndash;&gt;-->
<!--          <div style="float: left;position: absolute;font-size: 25px;margin-left: 10px">{{folder.folderName}}-->
<!--          </div>-->
<!--          <b-button :variant="avatarColor" style="" @click="makeFolderTag">{{tagContent}}</b-button>-->
<!--      </template>-->
      <div class="list-body">
        <div class="list-header">
          <div class="header-actions" style="position: relative;">
            <!-- 文件夹内顶部导航栏 -->
            <!--<b-button id="sort" variant="outline-primary" @click="sortByTime"><i class="fas fa-sort-amount-up"></i>{{$t('diagramContainer.sort-by-time')}}
            </b-button>-->
            <!-- <b-button id="overview" variant="outline-primary" @click="routeTo"><i class="fas fa-chart-pie"></i>{{$t('folderView.open-overview-diagram')}}
          </b-button> -->
<!--            <b-dropdown :text="$t('folderView.fuse-model')" split split-variant="outline-primary" variant="primary"  class="m-2" >-->
<!--              <b-dropdown-item href="#" v-b-modal="'mix-goalmodal'" @click="clearOlderDatas">-->
<!--                <i class="fas fa-star"></i>{{$t('folderView.fuse-goal-model')}}-->
<!--              </b-dropdown-item>-->
<!--              <b-dropdown-item href="#" v-b-modal="'mix-bpmnmodal'" @click="clearOlderDatas2">-->
<!--                <i class="fas fa-map"></i>{{$t('folderView.fuse-bus-model')}}-->
<!--              </b-dropdown-item>-->
<!--            </b-dropdown>-->
            <b-button id="regular" variant="outline-primary" v-b-modal="'create-modall'+num"><i class="fas fa-plus-circle"></i>{{$t('diagramContainer.creat-modal')}}
          </b-button>
          <b-button variant="outline-primary" style="float: right;position: absolute;margin-left: 10px" @click="makeSave">保存</b-button>
            <!-- <b-button :variant="avatarColor" style="float: right;position: absolute;margin-left: 10px" @click="makeFolderTag">{{tagContent}}</b-button>-->
            
<!--            <b-button id="mixGoal" variant="sucess" v-b-modal="'mix-goalmodal'" @click="clearOlderDatas"><i class="fas fa-star"></i>融合目标模型-->
<!--            </b-button>-->
          </div>
        </div>
        <section class="list-content">
          <diagram-view v-for="(diagram,index) in diagrams" :key="index" :diagram="diagram"></diagram-view>
          <div class="itemempty"></div>
<!--          <div class=""  :id="viewid">-->
<!--            <svg></svg>-->
<!--          </div>-->
          <div class="itemempty"></div>
          <div class="itemempty"></div>
          <div class="itemempty"></div>
          <div class="itemempty"></div>
          <div class="itemempty"></div>
          <div class="itemempty"></div>
        </section>
<!--        <knowledge-view  :nodes="nodes" :edges="edges"></knowledge-view>-->
      </div>
    </b-modal>
    <b-modal :id="'create-modall'+num" :title="$t('createModal.creat-model')" @ok="createDiagram">
      <b-form>
        <b-form-group :label="$t('createModal.model-name')">
          <b-form-input v-model="inputName"></b-form-input>
        </b-form-group>
        <b-form-group :label="$t('createModal.model-type')">
          <b-form-radio v-model="selectedType" name="diagramType" value="DN">{{$t('createModal.domain-model')}}</b-form-radio>
          <!--<b-form-radio v-model="selectedType" name="diagramType" value="VN">{{$t('createModal.value-model')}}</b-form-radio>-->
          <b-form-radio v-model="selectedType" name="diagramType" value="GN">{{$t('createModal.goal-model')}}</b-form-radio>
          <!--          <b-form-radio v-model="selectedType" name="diagramType" value="SN">服务网络模型</b-form-radio>-->
          <b-form-radio v-model="selectedType" name="diagramType" value="go_bpmn">{{$t('createModal.business-model')}}</b-form-radio>
        </b-form-group>
      </b-form>
    </b-modal>
<!--    <b-button v-b-modal.mix-goalmodall>Open First Modal</b-button>-->

    <b-modal id="mix-goalmodal" size="lg" title="融合目标模型"    hide-footer   >
      <b-form  >
        <b-form-group label="当前领域目标模型">
<!--          <b-form-file v-model="goalfileA" multiple :file-name-formatter="formatNames" accept=".json"></b-form-file>-->
          <b-form-file v-model="goalfileA" accept=".json" ></b-form-file>
        </b-form-group>
        <b-form-group label="待融合领域目标模型">
          <b-form-file v-model="goalfileB"  accept=".json"></b-form-file>
        </b-form-group>
<!--              <b-button  variant="primary" @click="mixGoalDiagram">Submit</b-button>-->
      </b-form>
      <b-row>
        <b-col lg="6"><b-button  variant="primary"  block  @click="uploadFiles">导入</b-button></b-col>
      <b-col lg="6"><b-button variant="primary" v-b-modal.modal-multi-2 block v-bind:disabled="!showGoalResult">查看结果</b-button></b-col>
      </b-row>
    </b-modal>
    <b-modal id="mix-bpmnmodal" size="lg" title="融合流程模型"    hide-footer   >
      <b-form  >
        <b-form-group label="当前领域流程模型">
          <!--          <b-form-file v-model="goalfileA" multiple :file-name-formatter="formatNames" accept=".json"></b-form-file>-->
          <b-form-file v-model="bpmnfileA" accept=".xml" ></b-form-file>
        </b-form-group>
        <b-form-group label="待融合领域流程模型">
          <b-form-file v-model="bpmnfileB"  accept=".xml"></b-form-file>
        </b-form-group>
        <!--              <b-button  variant="primary" @click="mixGoalDiagram">Submit</b-button>-->
      </b-form>
      <b-row>
        <b-col lg="6"><b-button  variant="primary"  block  @click="uploadBPMNFiles">导入</b-button></b-col>
        <b-col lg="6"><b-button variant="primary" v-b-modal.modal-multi-2 block v-bind:disabled="!showBpmnResult">查看结果</b-button></b-col>
      </b-row>
    </b-modal>
    <b-modal id="modal-multi-2" title="融合目标模型" size="xl"  style="width: 1200px;" >
<!--      <p class="my-2">请依次查看：</p>-->
<!--      <b-row>-->
<!--        <b-col lg="9"><p class="my-2">步骤一：融合用户目标</p></b-col>-->
<!--        <b-col lg="3" >-->
<!--          <b-button variant="primary" block v-b-modal.modal-multi-3>查看</b-button>-->
<!--        </b-col>-->
<!--      </b-row>-->
<!--      <b-row>-->
<!--        <b-col lg="9"><p class="my-2">步骤二：融合被依赖方目标</p></b-col>-->
<!--        <b-col lg="3" >-->
<!--          <b-button variant="primary" block v-b-modal.modal-multi-4>查看</b-button>-->
<!--        </b-col>-->
<!--      </b-row>-->
<!--      <b-row>-->
<!--        <b-col lg="9"><p class="my-2">步骤三：检测不一致性</p></b-col>-->
<!--        <b-col lg="3" >-->
<!--          <b-button variant="primary" block v-b-modal.modal-multi-5>查看</b-button>-->
<!--        </b-col>-->
<!--      </b-row>-->
      <b-card no-body class="overflow-hidden">

            <b-card-body title="目标融合结果">
              <b-card-img :src="imageData1" alt="Image" top></b-card-img>
              <b-card-text >
                <h4>过程简介</h4>
                <div  v-html="processContent" style="white-space: pre-wrap;"></div>
              </b-card-text>
            </b-card-body>
        <b-row>
          <b-col lg="12">
            <b-dropdown text="      下载      "  variant="primary"  class="m-2" block style="width: 98%;">
              <b-dropdown-item href="#" @click="downs1">PNG图片</b-dropdown-item>
              <b-dropdown-item href="#" @click="downXml">XML文件</b-dropdown-item>
            </b-dropdown>
          </b-col>
        </b-row>
<!--        <b-row>-->
<!--          <b-col lg="6"><b-button href="#" variant="primary" block @click="downs1">下载图片</b-button></b-col>-->
<!--          <b-col lg="6"><b-button href="#" variant="primary" block @click="downXml">下载XML</b-button></b-col>-->
<!--        </b-row>-->
      </b-card>
    </b-modal>

<!--    <b-modal id="modal-multi-3"  title="融合用户目标" ok-only size="xl" style="width: 1200px;">-->
<!--&lt;!&ndash;      <p class="my-1">步骤一:融合用户目标</p>&ndash;&gt;-->
<!--      <b-card >-->
<!--        <b-card-body title="步骤一:融合用户目标">-->
<!--          <b-card-text>1.寻找Da用户未满足新目标</b-card-text>-->
<!--          <b-card-text>2.寻找Db用户可满足的解决方案</b-card-text>-->
<!--          <b-card-text>3.融合用户目标</b-card-text>-->
<!--        </b-card-body>-->
<!--        <img :src="imageData1" >-->
<!--        <b-button href="#" variant="primary" block @click="downs1">下载</b-button>-->
<!--      </b-card>-->
<!--    </b-modal>-->
<!--    <b-modal id="modal-multi-4"  title="融合用户目标" ok-only size="xl" style="width: 1200px;">-->
<!--      <b-card >-->
<!--          <b-card-body title="步骤二:重定义目标依赖关系">-->
<!--            <b-card-text>1.检测用户的依赖角色</b-card-text>-->
<!--            <b-card-text>2.添加依赖角色</b-card-text>-->
<!--            <b-card-text>3.重新定义依赖关系</b-card-text>-->
<!--            <b-card-text>4.产生新目标</b-card-text>-->
<!--&lt;!&ndash;            <b-card-text>5.定义新资源依赖</b-card-text>&ndash;&gt;-->
<!--          </b-card-body>-->
<!--        <img :src="imageData2" >-->
<!--        <b-button href="#" variant="primary" block @click="downs2">下载</b-button>-->
<!--      </b-card>-->
<!--    </b-modal>-->
<!--    <b-modal id="modal-multi-5"  title="融合用户目标" ok-only size="xl" style="width: 1200px;">-->
<!--      <b-card >-->
<!--        <b-card-body title="步骤三:检测不一致性">-->
<!--          <b-card-text>1.软目标不一致性检测</b-card-text>-->
<!--        <b-card-text>2.可操作性目标不一致性检测</b-card-text>-->
<!--        <b-card-text>3.资源不一致性检测</b-card-text>-->
<!--        </b-card-body>-->
<!--        <img :src="imageData3" >-->
<!--        <b-button href="#" variant="primary" block @click="downs3">下载</b-button>-->
<!--      </b-card>-->
<!--    </b-modal>-->
<!--    <b-modal :id="'mix-goalmodall'" title="融合目标模型" >-->
<!--      <b-form v-if="chooseFile">-->
<!--        <b-form-group label="选择目标模型主文件Aa">-->
<!--          <b-form-file v-model="goalfileA" multiple :file-name-formatter="formatNames"></b-form-file>-->
<!--        </b-form-group>-->
<!--        <b-form-group label="选择目标模型辅文件Bb">-->
<!--          <b-form-file v-model="goalfileB" multiple :file-name-formatter="formatNames"></b-form-file>-->
<!--        </b-form-group>-->
<!--        <b-button  variant="primary" @click="mixGoalDiagram">Submit</b-button>-->
<!--      </b-form>-->
<!--    </b-modal>-->
    <!-- 文件夹概览显示 -->
    <div class='card'>
      <div class='card-info'>
        <h3 class="pjtitle">{{folder.folderName}}</h3>
        <div class='time'>共{{this.diagramNum}}个模型</div>
        <div class='time'>{{folder.createTime}}</div>

        <button class="button3" @click="makeFolderTag" :class="{ active: isActive }">{{ tagContent }}</button>
        <button class="button4" @click="makeFolderTag" :class="{ active1: isActive1 }">{{ tagContent }}</button>
      </div>
      <ul class='social'>
        <li><a href="" :data-tip="$t('folderView.delete')" @click.prevent="deleteconfirm">
          <i class='fas fa-trash-alt'></i></a></li>
        <li><a href="#" :data-tip="$t('folderView.open-folder')" v-b-modal="'foldermodal'+num">
          <i class='fas fa-sign-in-alt'></i></a></li>
      </ul>
    </div>
  </div>
</template>

<script>
import DiagramView from './diagramView'
import { XML } from '../../workspace/components/ObjTree.js'

export default {
  name: 'folderView',
  props: {
    folder: {
      type: Object,
      default: null
    },
    num: {
      type: Number
    }
  },
  data () {
    return {
      processContent: '步骤一：融合用户目标\n\t1.寻找Da用户未满足新目标\n\t2.寻找Db用户可满足的解决方案\n\t3.融合用户目标' +
        '\n步骤二：融合被依赖方目标\n\t1.检测用户的依赖角色\n\t2.添加依赖角色\n\t3.重新定义依赖关系\n\t4.产生新目标' +
        '\n步骤三：检测不一致性\n\t1.软目标不一致性检测\n\t2.可操作性目标不一致性检测\n\t3.资源不一致性检测',
      showGoalResult: false,
      showBpmnResult: false,
      imageData1: '',
      xmlContentGoal: '',
      imageData2: '',
      imageData3: '',
      chooseFile: true,
      goalfileA: null,
      goalfileB: null,
      jsonfileA: '',
      jsonfileB: '',
      bpmnfileA: null,
      bpmnfileB: null,
      xmlfileA: '',
      xmlfileB: '',
      diagrams: [],
      diagramNum: 0,
      diagram: '',
      diagramIDs: [],
      diagramTypes: [],
      diagramNames: [],
      jsonText: '',
      nodes: [],
      curNodes: [],
      edges: [],
      viewid: '',
      selectedType: '',
      inputName: '',
      avatarColor: 'secondary',
      folderTaged: false,
      tagContent: '未标记',
      isActive: false,
      isActive1: true,
    }
  },
  computed: {
    listenChangexmlA () {
      const {bpmnfileA} = this
      return {bpmnfileA}
    },
    listenChangexmlB () {
      const {bpmnfileB} = this
      return {bpmnfileB}
    },
    listenChangeA () {
      const {goalfileA} = this
      return {goalfileA}
    },
    listenChangeB () {
      const {goalfileB} = this
      return {goalfileB}
    },
    listenChangeInputGoal () {
      const {showGoalResult} = this
      return {showResult: showGoalResult}
    },
    listenChangeInputBPMN () {
      const {showBpmnResult} = this
      return {showResult: showBpmnResult}
    },
    listenChangeFolderTaged () {
      const {folderTaged} = this
      return {folderTaged}
    }
  },
  watch: {
    diagrams: function () {
      this.$nextTick(function () {
      })
    },
    listenChangexmlA: {
      handler: function (newval, oldval) {
        let reader = new FileReader()
        let myself = this
        let name = myself.bpmnfileA.name
        reader.onload = () => {
          if (name.indexOf('.xml') !== (-1)) {
            myself.xmlfileA = reader.result
          }
          // console.log('111', myself.jsonfileA)
        }
        reader.readAsText(myself.bpmnfileA)
      }},
    listenChangexmlB: {
      handler: function (newval, oldval) {
        let reader = new FileReader()
        let myself = this
        let name = myself.bpmnfileB.name
        reader.onload = () => {
          if (name.indexOf('.xml') !== (-1)) {
            myself.xmlfileB = reader.result
          }
          // console.log('111', myself.jsonfileB)
        }
        reader.readAsText(myself.bpmnfileB)
      }},
    listenChangeA: {
      handler: function (newval, oldval) {
        let reader = new FileReader()
        let myself = this
        let name = myself.goalfileA.name
        reader.onload = () => {
          if (name.indexOf('.json') !== (-1)) {
            myself.jsonfileA = reader.result
          }
          // console.log('111', myself.jsonfileA)
        }
        reader.readAsText(myself.goalfileA)
      }},
    listenChangeB: {
      handler: function (newval, oldval) {
        let reader = new FileReader()
        let myself = this
        let name = myself.goalfileB.name
        reader.onload = () => {
          if (name.indexOf('.json') !== (-1)) {
            myself.jsonfileB = reader.result
          }
          // console.log('111', myself.jsonfileB)
        }
        reader.readAsText(myself.goalfileB)
      }},
    listenChangeInputGoal: {
      handler: function (newval, oldval) {
      }},
    listenChangeInputBPMN: {
      handler: function (newval, oldval) {
      }},
    nodes: function (val) {
      this.curNodes = this.nodes()
    },
    // 给文件打标签
    listenChangeFolderTaged: {
      handler: function (newval, oldval) {
        if (this.folderTaged) {
          this.avatarColor = 'primary'
          this.tagContent = '已标记'
        } else {
          this.avatarColor = 'secondary'
          this.tagContent = '未标记'
        }
      }
    }
  },
  components: {
    DiagramView
    // KnowledgeView
  },
  mounted () {
    this.diagrams = this.folder.diagrams.concat();
    this.diagramNum = this.diagrams.length;
    this.folderTaged = this.folder.label > 0;
  },

  methods: {
    clickImg (e) {
      this.showImg = true
      // 获取当前图片地址
      this.imgSrc = e.currentTarget.src
    },
    viewImg () {
      this.showImg = false
    },
    clearOlderDatas () {
      this.goalfileA = null
      this.goalfileB = null
      this.showGoalResult = false
    },
    clearOlderDatas2 () {
      this.bpmnfileA = null
      this.bpmnfileB = null
      this.showBpmnResult = false
    },
    XML2Json (xmlText) {
      let xotree = new XML.ObjTree()
      let jsonObject = xotree.parseXML(xmlText).myData
      let nodeArr = []
      let linkArr = []
      let jsonText

      if (jsonObject.nodeDataArray) {
        if (!(jsonObject.nodeDataArray instanceof Array)) {
          nodeArr.push(jsonObject.nodeDataArray)
          jsonObject.nodeDataArray = nodeArr
        }
      }
      if (jsonObject.linkDataArray != null) {
        if (!(jsonObject.linkDataArray instanceof Array)) {
          linkArr.push(jsonObject.linkDataArray)
          jsonObject.linkDataArray = linkArr
        }
      }
      for (let node of jsonObject.nodeDataArray) {
        if (node.isUnderline === 'false') {
          node.isUnderline = false
        } else {
          node.isUnderline = true
        }
        if (node.isStrikethrough === 'false') {
          node.isStrikethrough = false
        } else {
          node.isStrikethrough = true
        }
        node.strokeWidth = parseInt(node.strokeWidth)
        node.width = parseInt(node.width)
        node.height = parseInt(node.height)
        if (node.strokeDashArray) {
          node.strokeDashArray.forEach(function (v, i, a) {
            a[i] = parseInt(v)
          })
        }
      }
      jsonText = JSON.stringify(jsonObject)
      return jsonText
    },
    uploadFiles () {
      if ((this.goalfileA !== null) && (this.goalfileB !== null)) {
        this.$ajax.put('api/folder', {
          'fileA': JSON.stringify(this.jsonfileA),
          'fileB': JSON.stringify(this.jsonfileB)
        })
          .then((response) => {
            console.log(response)
            const code = response.data.code
            if (code === 1) {
              this.imageData1 = 'data:image/png;base64,' + response.data.data[0]
              this.xmlContentGoal = JSON.parse(JSON.stringify(response.data.data[1]))
              // this.imageData2 = 'data:image/png;base64,' + response.data.data[1]
              // this.imageData3 = 'data:image/png;base64,' + response.data.data[1]
              console.log(this.imageData1)
              console.log(this.xmlContentGoal)
              this.showGoalResult = true
              alert('导入成功')
            }
          })
          .catch((error) => {
            this.showGoalResult = false
            alert('导入失败，请重试')
            console.log(error)
          })
      }
    },
    uploadBPMNFiles () {
      if ((this.bpmnfileA !== null) && (this.bpmnfileB !== null)) {
        this.$ajax.put('api/folder/result', {
          'fileXMLA': JSON.stringify(this.xmlfileA),
          'fileXMLB': JSON.stringify(this.xmlfileB)
        })
          .then((response) => {
            console.log(response)
            const code = response.data.code
            if (code === 1) {
              console.log('YES')
              this.showGoalResult = true
              alert('导入成功')
            }
          })
          .catch((error) => {
            this.showGoalResult = false
            alert('导入失败，请重试')
            console.log(error)
          })
      }
    },
    downs1 () {
      // 必须同源才能下载
      var alink = document.createElement('a')
      alink.href = this.imageData1
      alink.download = 'picture' // 图片名
      alink.click()
    },
    downXml () {
      let name = 'result' + '.xml'
      this.doSave(this.xmlContentGoal, 'text/xml', name)
    },
    doSave (value, type, name) {
      let blob
      if (typeof window.Blob === 'function') {
        blob = new Blob([value], {type: type})
      } else {
        let BlobBuilder = window.BlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder
        let bb = new BlobBuilder()
        bb.append(value)
        blob = bb.getBlob(type)
      }
      let URL = window.URL || window.webkitURL
      let bloburl = URL.createObjectURL(blob)
      let anchor = document.createElement('a')
      if ('download' in anchor) {
        anchor.style.visibility = 'hidden'
        anchor.href = bloburl
        anchor.download = name
        document.body.appendChild(anchor)
        let evt = document.createEvent('MouseEvents')
        evt.initEvent('click', true, true)
        anchor.dispatchEvent(evt)
        document.body.removeChild(anchor)
      } else if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, name)
      } else {
        location.href = bloburl
      }
    },
    createDiagram () {
      if (this.inputName===''||this.selectedType==='') {
        this.$alert('请输入模型名称与类型')
        return
      }
      this.$ajax.post('api/diagram', {
        diagramName: this.inputName,
        jsonContent: '{"class":"GraphLinksModel","modelData":{"position":"-478 -365"},"nodeDataArray":[],"linkDataArray":[]}',
        // 空图片默认值
        imageContent: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAT4AAACyCAYAAADbPaMnAAAFOElEQVR4Xu3UQQ0AIBADQfDvkDdvLECCjZ1z0Omlc+1zhyNAgEBIYBq+UNuiEiDwBQyfRyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBAyfHyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBAyfHyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBAyfHyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBAyfHyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBAyfHyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBAyfHyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBAyfHyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBAyfHyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBAyfHyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBAyfHyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBB4yA423Bpz8IAAAAABJRU5ErkJggg==',
        diagramType: this.selectedType,
        folderId: this.folder.folderId
      })
        .then((response) => {
          console.log(response)
          const code = response.data.code
          if (code === 1) {
            this.diagrams.push(response.data.data)
          }
          this.inputName = ''
        })
        .catch((error) => {
          console.log(error)
        })
    },
    sortByTime () {
      this.flag = -this.flag
      this.diagrams.sort((a, b) => {
        let ad = new Date(a.createTime.replace('T', ' '))
        let bd = new Date(b.createTime.replace('T', ' '))
        return ad > bd ? this.flag : -this.flag
      })
      console.log(this.diagrams)
    },
    routeTo () {
      // this.showDataGrapth()
      // console.log(2, this.nodes)
      console.log(0, this.diagrams[0])
      for (let i = 0; i < this.diagrams.length; i++) {
        this.diagramIDs.push(this.diagrams[i].diagramId)
        this.diagramTypes.push(this.diagrams[i].diagramType)
        this.diagramNames.push(this.diagrams[i].diagramName)
      }
      this.$router.push({
        path: '/overview',
        query: {
          // nodes: this.curNodes,
          diagramIDs: this.diagramIDs,
          diagramTypes: this.diagramTypes,
          diagramNames: this.diagramNames
        }
      })
    },
    getJsonContext (id) {
      this.$ajax.get('api/diagram', {
        params: {
          'diagramId': id
        }
      })
        .then((response) => {
          console.log(response)
          const code = response.data.code
          if (code === 1) {
            this.diagram = JSON.stringify(response.data.data.jsonContent)
            // this.jsonText = this.diagram.toString()
            // console.log('666', this.diagram)
            // this.jsonText = JSON.stringify(this.diagram)
          }
        })
        .catch((error) => {
          console.log(error)
        })
    },
    showDataGrapth () {
      // let numOfDiagrams = this.diagrams.length

      let curDiagram = this.diagrams[0]
      console.log(curDiagram)
      // let curJsonContext = null
      this.$ajax.get('api/diagram', {
        params: {
          'diagramId': curDiagram.diagramId
        }
      })
        .then((response) => {
          console.log(response)
          const code = response.data.code
          if (code === 1) {
            if (response.data.data.diagramType === 'BPMN') {
            } else {
              this.jsonText = response.data.data.jsonContent
              let jsonObj = JSON.parse(this.jsonText)
              let modelName = jsonObj.class
              console.log(modelName)
              this.nodes.push({name: '通信运营商', type: '角色'})
              this.getNodesAndLinks(jsonObj)
              console.log((this.nodes))
            }
          }
        })
        .catch((error) => {
          console.log(error)
        })

      console.log(this.nodes)
    },
    getNodesAndLinks (jsonObj) {
      let linkArray = jsonObj.linkDataArray
      let nodeArray = jsonObj.nodeDataArray
      let mapping = []
      // let nodes = []
      // let links = []
      for (let i = 0; i < nodeArray.length; i++) {
        mapping.push(nodeArray[i].key)
        let node = {}
        node.name = nodeArray[i].Name
        node.type = nodeArray[i].Type.substring(2, nodeArray[i].Type.length - 2)
        node.nodeType = nodeArray[i].nodeType
        this.nodes.push(node)
      }
      for (let j = 0; j < linkArray.length; j++) {
        let link = {}
        link.source = mapping.indexOf(linkArray[j].from)
        link.target = mapping.indexOf(linkArray[j].to)
        let linkType = linkArray[j].Linktype
        // console.log(linkType)
        linkType = linkType === undefined ? '普通连接' : linkType
        link.relation = linkType
        link.type = 'resolved'
        link.value = 1.3
        this.edges.push(link)
      }
      // this.nodes = nodes
      // this.edges = links
    },
    deleteconfirm (row) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', () => {
        this.deleteFolder()
      }, () => {
      })
    },
    deleteFolder () {
      this.$ajax.delete('api/folder', {
        params: {
          folderId: this.folder.folderId
        }
      })
        .then((response) => {
          console.log(response)
          const code = response.data.code
          if (code === 1) {
            let index = this.$parent.folders.indexOf(this.folder)
            if (index > -1) {
              this.$parent.folders.splice(index, 1)
            }
            this.$alert('删除成功')
          }
        })
        .catch((error) => {
          console.log(error)
          this.$alert('删除失败')
        })
    },
    makeFolderTag () {
      // 标记的显示与隐藏
      this.isActive = !this.isActive;
      this.isActive1 = !this.isActive1;

      if (!this.folderTaged) {
        this.$ajax.put('api/folder/label', {
          folderId: this.folder.folderId
        })
          .then((response) => {
            console.log(response)
            const code = response.status
            if (code === 200) {
              this.$alert('标记成功')
              this.avatarColor = 'primary'
              this.tagContent = '已标记'
              this.folderTaged = true
            } else {
              this.$alert('标记失败，请重试')
            }
          })
          .catch((error) => {
            this.$alert('标记失败，请重试')
            console.log(error)
          })
      } else {
        this.$ajax.put('api/folder/label/delete', {
          folderId: this.folder.folderId
        })
          .then((response) => {
            console.log(response)
            const code = response.status
            if (code === 200) {
              this.$alert('删除标记成功')
              this.avatarColor = 'secondary'
              this.tagContent = '未标记'
              this.folderTaged = false
            } else {
              this.$alert('删除标记失败，请重试')
            }
          })
          .catch((error) => {
            this.$alert('删除标记失败，请重试')
            console.log(error)
          })
      }
    },
    makeSave() {
  this.$ajax.get('api/folder/BPMNsTxt', {
    params: {
      folderId: this.folder.folderId
    },
    responseType: 'blob' // 确保响应数据以 Blob 形式返回
  })
    .then((response) => {
      console.log(response);

      // 从响应头中提取文件名
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'default.txt'; // 默认文件名

      if (contentDisposition && contentDisposition.includes('filename=')) {
        // 提取文件名部分
        fileName = contentDisposition.split('filename=')[1];
        // 去掉可能存在的引号
        fileName = fileName.replace(/"/g, '');
        // 解码 URL 编码的文件名
        fileName = decodeURIComponent(fileName);
      }

      // 获取响应数据
      const blob = new Blob([response.data], { type: 'text/plain' });

      // 创建一个临时的下载链接
      const url = window.URL.createObjectURL(blob);

      // 动态创建 <a> 标签
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName); // 设置文件名为解析到的文件名
      document.body.appendChild(link);

      // 触发点击事件以下载文件
      link.click();

      // 清理资源
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error('请求失败:', error);
      this.$alert('请求失败，请检查网络连接');
    });
},
    // makeSave(){
    //   this.$ajax.get('api/folder/BPMNsTxt', {
    //     params: {
    //       folderId: this.folder.folderId
    //     }
    //   })
    //     .then((response) => {
    //       console.log(response)
    //       const code = response.status
    //       if (code === 200) {
    //         this.$alert('保存成功')
    //         // 获取后端返回的数据
    //         const data = response.data;

    //         // 将数据转换为 Blob 对象
    //         const blob = new Blob([data], { type: 'text/plain' });

    //         // 创建一个临时的下载链接
    //         const url = window.URL.createObjectURL(blob);
    //                 // 动态创建 <a> 标签
    //         const link = document.createElement('a');
    //         link.href = url;
    //         link.setAttribute('download', 'bpmn.txt'); // 设置文件名
    //         document.body.appendChild(link);

    //         // 触发点击事件以下载文件
    //         link.click();

    //         // 清理资源
    //         document.body.removeChild(link);
    //         window.URL.revokeObjectURL(url);
    //       } else {
    //         this.$alert('保存失败，请重试')
    //       }
    //     })
    //     .catch((error) => {
    //       this.$alert('保存失败，请重试')
    //       console.log(error)
    //     })
    // }
  }
}
</script>

<style scoped>
  /* 标记的显示与隐藏 */
  .active {
    display: none;
  }
  .active1 {
    display: none;
  }
  /* 未标记button */
  .button3 {
    font-size: calc(0.5vw + 0.5rem);
    padding: 1px 20px;
    text-align: center;
    background-color: white;
    color: white;
    border: 1px solid  white;
    border-radius:25px;
    line-height: 1.5;
  }
  /* 已标记button */
  .button4 {
    font-size: calc(0.5vw + 0.5rem);
    padding: 1px 20px;
    text-align: center;
    background-color: #1677FD;
    color: white;
    border: 1px solid  #1677FD;
    border-radius:25px;
    line-height: 1.5;
  }
  ._2fd8twDco3d8QZvnSUuJke {
    margin-bottom: 40px;
    margin-right: 20px;
    width: 250px;
    height: 260px;
    background: #fff;
    border: 1px solid rgba(39, 54, 78, .1);
    text-align: center;
    position: relative;
    transition: all 0.5s ease 0s;
    box-shadow: 0px 1px 2px 0px hsla(213, 6%, 61%, 0.15);
    pointer-events: auto;
  }

  ._2fd8twDco3d8QZvnSUuJke .card {
    position: absolute;
    display: block;
    margin: 0 0 10px 0;
    width: 100%;
    height: 100%;
  }

  ._2fd8twDco3d8QZvnSUuJke .card .card-info {
    margin: 15px;
    transition: all 0.5s ease 0s;
  }

  .card .card-info .time {
    color: #7d8695;
    font-size: 14px;
    line-height: 20px;
  }

  ._2fd8twDco3d8QZvnSUuJke .card .social {
    height: 60px;
    background-color: #fff;
    width: 100%;
    padding: 0;
    margin: 0;
    list-style: none;
    opacity: 0;
    z-index: 1;
    position: absolute;
    left: 50%;
    transition: all 0.5s ease 0s;
  }

  .card .social {
    transform: translateX(-50%);
    bottom: -8%;
  }

  .item:hover .social {
    opacity: 1;
    bottom: 10px;

  }

  .card .social li {
    display: inline-block;
  }

  .card .social li a {
    color: #909090;
    font-size: 16px;
    line-height: 45px;
    text-align: center;
    height: 45px;
    width: 45px;
    margin: 0 7px;
    border: 1px solid #909090;
    border-radius: 50px;
    display: block;
    position: relative;
    transition: all 0.3s ease-in-out;
  }

  .card .social li a:hover {
    color: #fff;
    background-color: #2e86de;
    width: 80px;
  }

  .card .social li a:before,
  .card .social li a:after {
    content: attr(data-tip);
    color: #fff;
    background-color: #2e86de;
    font-size: 12px;
    letter-spacing: 1px;
    line-height: 20px;
    padding: 1px 5px;
    border-radius: 5px;
    white-space: nowrap;
    opacity: 0;
    transform: translateX(-50%);
    position: absolute;
    left: 50%;
    top: -30px;
  }

  .card .social li a:after {
    content: '';
    height: 15px;
    width: 15px;
    border-radius: 0;
    transform: translateX(-50%) rotate(45deg);
    top: -20px;
    z-index: -1;
  }

  .card .social li a:hover:before,
  .card .social li a:hover:after {
    opacity: 1;
  }

  .item:hover .card-image img {
    transform: scale(1.3);
  }

  .card-info h3 {
    font-size: 20px;
    font-weight: 600;
    text-transform: capitalize;
    margin: 0 0 10px;
    transition: all 0.3s ease 0s;
  }
  .card-info{
  position: absolute;
  top: 20%;
  left: 17%;
  /* transform: translateX(-60%); */
}
  ._2fd8twDco3d8QZvnSUuJke .card .time {
    color: #7d8695;
    font-size: 13px;
    line-height: 20px;
  }
  .list-header {
    margin-bottom: 10px;
  }
  .list-content {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-wrap: wrap;
    flex-wrap: wrap;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
  }
  .img-show-mask {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 50%;
    top: 500%;
  }
  .itemempty {
    height: 0px;
    width: 250px;
  }
  .pjtitle {
    color: #4060b9;
    font-weight: normal;
    font-size: 18px;
    font-family: "Helvetica Neue";
    letter-spacing: -0.05em;
  }

</style>
