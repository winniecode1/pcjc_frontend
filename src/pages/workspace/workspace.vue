<template>
  <div v-if="($route.query.createTime < '2019-12-18T21:00:00') || ($route.query.diagramType !== 'BPMN')">
  <div>
    <d-m v-if="$route.query.diagramType==='DN'"></d-m>
    <b-p-m-n v-else-if="$route.query.diagramType==='go_bpmn'"></b-p-m-n>
    <c-s-d-m v-else></c-s-d-m>
  </div>
  </div>
</template>
<script>
import CSDM from './CSDM'
import BPMN from './BPMN'
import DM from './DM.vue'

export default {
  name: 'workspace',
  components: {BPMN, CSDM, DM},
  created () {
    if ((this.$route.query.createTime > '2019-12-18T21:00:00') && (this.$route.query.diagramType === 'BPMN')) {
      window.location.href = '../static/modeler.html?modelId=' + this.$route.query.id
    }
  }
}
</script>

<style lang="scss" scoped></style>

// WEBPACK FOOTER //
// src/pages/workspace/workspace.vue
