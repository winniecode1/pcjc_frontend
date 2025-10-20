<template>

  <div id="create-modal" class="modal" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
          <h4 class="modal-title">{{$t('createModal.creat-model')}}</h4>
        </div>
        <div class="modal-body">
          <label>{{$t('createModal.model-name')}}</label><br />
          <input type="text" name="diagram-name"><br />
          <label>{{$t('createModal.model-type')}}</label><br />
          <input type="radio" name="diagram-type" value="DN"><span>{{$t('createModal.domain-model')}}</span>
          <!--<input type="radio" name="diagram-type" value="VN"><span>{{$t('createModal.value-model')}}</span>-->
          <input type="radio" name="diagram-type" value="GN"><span>{{$t('createModal.goal-model')}}</span>
<!--          <input type="radio" name="diagram-type" value="SN"><span>服务网络模型</span>-->
          <input type="radio" name="diagram-type" value="go_bpmn"><span>{{$t('createModal.business-model')}}</span>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">{{$t('createModal.ok')}}</button>
          <button type="button" class="btn btn-primary" data-dismiss="modal" id="ok-to-create">{{$t('createModal.cancel')}}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'createModal'
}
</script>

<style lang="scss" scoped>

</style>
