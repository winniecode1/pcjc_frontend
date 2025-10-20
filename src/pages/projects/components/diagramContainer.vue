<template>
  <b-container fluid>
    <b-row>
      <div class="list-body">
        <div class="list-header">
          <div class="header-actions">
<!--              <b-button id="sort" class="m-btn" @click="sortByTime" style="background-color:transparent;"><i class="fas fa-sort-amount-up"></i>&nbsp;{{$t('diagramContainer.sort-by-time')}}</b-button>-->
<!--            <b-button id="regular" class="m-btn" variant="sucess" v-b-modal="'create-modal'" style="background-color:transparent;"><b-icon icon="plus-circle" scale="0.8" aria-hidden="true"></b-icon>&nbsp;{{$t('diagramContainer.creat-modal')}}</b-button>-->
            <b-button variant="sucess" class="m-btn" v-b-modal="'newdir-modal'" style="background-color:transparent;"><b-icon icon="plus-circle" scale="0.8" aria-hidden="true"></b-icon>&nbsp;{{$t('diagramContainer.new-project')}}</b-button>
<!--             <b-button variant="sucess" class="m-btn" @click="pullProjects" style="background-color:transparent;"><b-icon icon="arrow-down-circle" scale="0.8" aria-hidden="true"></b-icon>&nbsp;{{$t('diagramContainer.update')}}</b-button>-->
            <b-modal id="create-modal" :title="$t('createModal.creat-model')" @ok="createDiagram">
              <b-form>
                <b-form-group :label="$t('createModal.model-name')">
                  <b-form-input v-model="inputName"></b-form-input>
                </b-form-group>
                <b-form-group :label="$t('createModal.model-type')">
                  <b-form-radio v-model="selectedType" name="diagramType" value="DN">{{$t('createModal.domain-model')}}</b-form-radio>
                  <!--<b-form-radio v-model="selectedType" name="diagramType" value="VN">{{$t('createModal.value-model')}}</b-form-radio>-->
                  <b-form-radio v-model="selectedType" name="diagramType" value="GN">{{$t('createModal.goal-model')}}</b-form-radio>
<!--                  <b-form-radio v-model="selectedType" name="diagramType" value="SN">服务网络模型</b-form-radio>-->
                  <b-form-radio v-model="selectedType" name="diagramType" value="go_bpmn">{{$t('createModal.business-model')}}</b-form-radio>
                </b-form-group>
              </b-form>
            </b-modal>
            <b-modal id="newdir-modal" :title="$t('diagramContainer.creat-folder')" @ok="newDir">
              <b-form>
                <b-form-group :label="$t('diagramContainer.folder-name')">
                  <b-form-input v-model="inputName"></b-form-input>
                </b-form-group>
              </b-form>
            </b-modal>
          </div>
        </div>
        <section class="list-content" >
          <folder-view v-for="(folder,index) in folders" :key="index" :num="index" :folder="folder"></folder-view>
          <diagram-view v-for="(diagram,index) in diagrams" :key="32768+index" :diagram="diagram"></diagram-view>
          <div class="itemempty"></div>
          <div class="itemempty"></div>
          <div class="itemempty"></div>
          <div class="itemempty"></div>
          <div class="itemempty"></div>
          <div class="itemempty"></div>
          <div class="itemempty"></div>
          <div class="spin-control" v-bind:class="{loading: isLoading}">
            <div class="spinner">
              <div class="bounce1"></div>
              <div class="bounce2"></div>
              <div class="bounce3"></div>
            </div>
          </div>
        </section>
      </div>
    </b-row>
  </b-container>
</template>

<script>
import DiagramView from './diagramView'
import FolderView from './folderView'
export default {
  name: 'diagramContainer',
  data () {
    return {
      folders: [],
      diagrams: [],
      flag: 1,
      isLoading: false,
      selectedType: '',
      inputName: ''
    }
  },
  watch: {
    diagrams: function () {
      this.$nextTick(function () {
      })
    }
  },
  components: {DiagramView, FolderView},
  mounted () {
    // TODO 页面缓冲'spin-control'的 'loading'类的动态添加；
    this.isLoading = true
    this.$ajax.get('api/diagram/info')
      .then((response) => {
        console.log(response)
        const code = response.data.code
        if (code === 1) {
          this.diagrams = response.data.data
          this.isLoading = false
        }
      })
      .catch((error) => {
        console.log(error)
        this.isLoading = false
      })
    this.$ajax.get('api/folder/withDiagrams')
      .then((response) => {
        console.log(response)
        const code = response.data.code
        if (code === 1) {
          this.folders = response.data.data
          this.isLoading = false
        }
      })
      .catch((error) => {
        console.log(error)
        this.isLoading = false
      })
  },
  methods: {
    sortByTime () {
      this.flag = -this.flag
      this.diagrams.sort((a, b) => {
        let ad = new Date(a.createTime.replace('T', ' '))
        let bd = new Date(b.createTime.replace('T', ' '))
        return ad > bd ? this.flag : -this.flag
      })
      console.log(this.diagrams)
    },
    createDiagram () {
      this.$ajax.post('api/diagram', {
        diagramName: this.inputName,
        jsonContent: '{"class":"GraphLinksModel","modelData":{"position":"-478 -365"},"nodeDataArray":[],"linkDataArray":[]}',
        // 空图片默认值
        imageContent: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAT4AAACyCAYAAADbPaMnAAAFOElEQVR4Xu3UQQ0AIBADQfDvkDdvLECCjZ1z0Omlc+1zhyNAgEBIYBq+UNuiEiDwBQyfRyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBAyfHyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBAyfHyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBAyfHyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBAyfHyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBAyfHyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBAyfHyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBAyfHyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBAyfHyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBAyfHyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBAyfHyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBB4yA423Bpz8IAAAAABJRU5ErkJggg==',
        diagramType: this.selectedType
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
    newDir () {
      this.$ajax.post('api/folder', {
        folderName: this.inputName
      })
        .then((response) => {
          console.log(response)
          const code = response.data.code
          if (code === 1) {
            this.folders.push(response.data.data)
          }
          this.inputName = ''
        })
        .catch((error) => {
          console.log(error)
        })
    },
    pullProjects () {
      this.$ajax.put('api/import', {
      })
        .then((response) => {
          console.log(response)
          const code = response.status
          if (code === 200) {
            this.$alert('拉取成功')
          } else {
            this.$alert('拉取失败，请重试')
          }
        })
        .catch((error) => {
          this.$alert('拉取失败，请重试')
          console.log(error)
        })
      // this.$ajax.put('api/import')
      //   .then((response) => {
      //     console.log(response)
      //     const code = response.status
      //     if (code === 200) {
      //       this.$alert('刷新成功')
      //     } else {
      //       this.$alert('刷新失败，请重试')
      //     }
      //   })
      //   .catch((error) => {
      //     this.$alert('刷新失败，请重试')
      //     console.log(error)
      //   })
    }
  }
}
</script>

<style lang="scss" scoped>

  .list-content{
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-wrap: wrap;
    flex-wrap: wrap;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
  }
  .itemempty {
    height: 0px;
    width: 250px;
  }
  .spinner {
    display: none;
    width: 150px;
    height: 40px;
    margin: 10px auto;
    text-align: center;
    position: absolute;
    left: 50%;
    top: 50%;
  }
 /* 缓冲动画.css(project.css)*/
  .spin-control.loading .spinner {
    display: block;
  }

  .spinner > div {
    width: 30px;
    height: 30px;
    background-color: #67CF22;

    border-radius: 100%;
    display: inline-block;
    -webkit-animation: bouncedelay 1.4s infinite ease-in-out;
    animation: bouncedelay 1.4s infinite ease-in-out;
    /* Prevent first frame from flickering when animation starts */
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;
  }

  .spinner .bounce1 {
    -webkit-animation-delay: -0.32s;
    animation-delay: -0.32s;
  }

  .spinner .bounce2 {
    -webkit-animation-delay: -0.16s;
    animation-delay: -0.16s;
  }

  @-webkit-keyframes bouncedelay {
    0%, 80%, 100% { -webkit-transform: scale(0.0) }
    40% { -webkit-transform: scale(1.0) }
  }

  @keyframes bouncedelay {
    0%, 80%, 100% {
      transform: scale(0.0);
      -webkit-transform: scale(0.0);
    } 40% {
        transform: scale(1.0);
        -webkit-transform: scale(1.0);
      }
  }
  /* list-head css*/
  .list-header{
    margin-top: 30px;
    margin-bottom: 40px;
    padding: 5px;
  }
  .header-actions {
    //display: -webkit-inline-box;
    display: -moz-inline-box;
    display: -webkit-inline-flex;
    display: -ms-inline-flexbox;
    //display: inline-box;
    display: inline-flex;
    -webkit-box-pack: justify;
    -moz-box-pack: justify;
    -o-box-pack: justify;
    -ms-flex-pack: justify;
    -webkit-justify-content: space-between;
    justify-content: space-between;
    -webkit-box-align: center;
    -moz-box-align: center;
    -o-box-align: center;
    -ms-flex-align: center;
    -webkit-align-items: center;
    align-items: center;
  }
  .header-actions > :not(:last-child) {
    margin-right: 1.5em;
  }
  .header-actions button.regular {
    padding: 0 .5em;
    min-width: 120px;
    height: 34px;
  }
  .header-actions button{
    background: #e7e7e7;
    transition: all 0.5s ease 0s;
  }
  .header-actions button:hover{
    transform: scale(1.1);
  }
  .m-btn {
    background-color: transparent;
    border-color: #4060b9;
    color: #4060b9;
  }
</style>
