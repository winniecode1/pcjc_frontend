<template>
  <div style="height: 100%;">
  <b-modal
  id="inconsistencyResultModal"
  ref="inconsistencyResultModal"
  title="冲突检测结果"
  size="lg"
  hide-footer
>
  <div style="max-height:60vh;overflow:auto;">
    <b-table
      :items="items"
      :fields="fields"
      bordered
      small
      head-variant="light"
      responsive
      sticky-header
    ></b-table>
  </div>
</b-modal>
    <b-navbar
      toggleable="lg"
      class="background"
      style="padding: 4px 16px;"
    ><!--toggleable设置为 'true' 可以使导航栏始终保持折叠状态，或者设置为一个特定的断点，当屏幕尺寸达到该断点时，导航栏将会展开：'sm'，'md'，'lg' 或 'xl'。-->
      <b-navbar-brand id="brand">
        <div class="brand-content">
          <img
            src="../../assets/WHU.png"
            alt="武汉大学"
            width="40"
            height="40"
            class="logo-image"
          />
          <span>&emsp;&emsp;&emsp;</span>
        </div>
      </b-navbar-brand>
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle><!--导航栏切换按钮。这个切换按钮通常用在响应式设计中，当屏幕大小缩小到一定程度时，导航栏的内容会被隐藏，只显示一个切换按钮。用户可以点击这个按钮来显示或隐藏导航栏的内容。-->
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <!-- 导航栏———文件 -->
          <b-nav-item-dropdown style="font-weight: bold; margin-right: 20px" :text="$t('CSDM.file')" no-caret>              <!--文件 :text="$t('CSDM.file')-->
            <b-dropdown-item class="rename">
              <font-awesome-icon icon="file-medical-alt" />
              <span>{{ $t("CSDM.rename") }}</span></b-dropdown-item
            >

            <b-dropdown-item v-b-modal="'moveFileModal'">
              <font-awesome-icon icon="folder" />
              <span>{{ $t("CSDM.move-to") }}</span></b-dropdown-item
            >

            <b-modal id="moveFileModal" size="sm" @ok="moveToFolder">
              <b-form-group :label="$t('CSDM.choose-import-file')">
                <b-form-select
                  v-model="folderId"
                  :options="folders"
                ></b-form-select>
              </b-form-group>
              <div slot="modal-ok">{{ $t("CSDM.ok") }}</div>
              <div slot="modal-cancel">{{ $t("CSDM.cancel") }}</div>
            </b-modal>

            <!--            <b-dropdown-item v-b-modal="'mixModal'">-->
            <!--              <font-awesome-icon icon="upload"/>-->
            <!--              <span>导入待融合模型</span></b-dropdown-item>-->
            <!--            <b-modal id="mixModal" size="sm" @ok="loadFile">-->
            <!--              <b-form-group :label="选择要融合的模型">-->
            <!--                <b-form-file v-model="imFile" accept=" .json"></b-form-file>-->
            <!--              </b-form-group>-->
            <!--              <div slot="modal-ok">{{$t('CSDM.import')}}</div>-->
            <!--              <div slot="modal-cancel">{{$t('CSDM.cancel')}}</div>-->
            <!--            </b-modal>-->
            <b-dropdown-divider></b-dropdown-divider>
            <!-- <b-dropdown-group id="dropdown-group-1" :header="$t('CSDM.import')">
              <b-dropdown-item v-b-modal="'importModal'">
                <font-awesome-icon icon="upload" /> -->
<!--                导入领域模型-->
                <!-- <span>{{ $t("CSDM.import-model") }}</span></b-dropdown-item
              >
              <b-dropdown-item v-b-modal="'importOntology'">
                <font-awesome-icon icon="upload" />
                <span>{{ $t("CSDM.import-ontology") }}</span></b-dropdown-item
              >
            </b-dropdown-group> -->
            <!-- <b-dropdown-divider></b-dropdown-divider> -->
            <b-dropdown-item @click="saveDiagram">
              <font-awesome-icon icon="save" />
              {{ $t("CSDM.save") }}
            </b-dropdown-item>
            <b-modal id="importModal" size="sm" @ok="loadFile">
              <b-form-group :label="$t('CSDM.choose-import-file')">
                <b-form-file
                  v-model="imFile"
                  accept=".xml, .json"
                ></b-form-file>
              </b-form-group>
              <div slot="modal-ok">{{ $t("CSDM.import") }}</div>
              <div slot="modal-cancel">{{ $t("CSDM.cancel") }}</div>
            </b-modal>
            <b-modal id="importOntology" size="sm" @ok="loadOntology">
              <b-form-group :label="$t('CSDM.choose-import-file')">
                <b-form-file v-model="imFile" accept=".json"></b-form-file>
              </b-form-group>
              <div slot="modal-ok" v-b-modal="'selectOntology'">确定</div>
              <div slot="modal-cancel">{{ $t("CSDM.cancel") }}</div>
            </b-modal>
            <b-modal id="selectOntology" @ok="importOntology">
              <div>
                <b-table
                  :items="yeilditems"
                  :fields="yeildfields"
                  select-mode="multi"
                  responsive="lg"
                  ref="selectableTable"
                  selectable
                  @row-selected="onRowSelected"
                >
                  <!-- Example scoped slot for select state illustrative purposes -->
                  <template #cell(selected)="{ rowSelected }">
                    <template v-if="rowSelected">
                      <span aria-hidden="true">&nbsp;&check;&nbsp;</span>
                      <span class="sr-only">已选择</span>
                    </template>
                    <template v-else>
                      <span aria-hidden="true"
                        >&nbsp;<b-form-checkbox />&nbsp;</span
                      >
                      <span class="sr-only">未选择</span>
                    </template>
                  </template>
                </b-table>
                <p>已选择目标: {{ selectedLength }}个</p>
              </div>
              <div slot="modal-ok">{{ $t("CSDM.import") }}</div>
              <div slot="modal-cancel">{{ $t("CSDM.cancel") }}</div>
            </b-modal>
            <b-dropdown-item v-b-modal="'outportModal'">
              <font-awesome-icon icon="download" />
              <span>{{ $t("CSDM.export") }}</span></b-dropdown-item
            >
            <b-modal id="outportModal" size="sm" @ok="outportFile">
              <b-form-group :label="$t('CSDM.choose-export-format')">
                <b-form-radio v-model="selectedFormat" name="orad" value="RDF"
                  >RDF file</b-form-radio
                >
                <b-form-radio v-model="selectedFormat" name="orad" value="XML"
                  >XML file</b-form-radio
                >
                <b-form-radio v-model="selectedFormat" name="orad" value="JSON"
                  >JSON file</b-form-radio
                >
                <b-form-radio v-model="selectedFormat" name="orad" value="PNG"
                  >PNG format iamge</b-form-radio
                >
                <b-form-radio v-model="selectedFormat" name="orad" value="SVG"
                  >SVG file</b-form-radio
                >
              </b-form-group>
              <div slot="modal-ok">{{ $t("CSDM.export") }}</div>
              <div slot="modal-cancel">{{ $t("CSDM.cancel") }}</div>
            </b-modal>
            <b-dropdown-divider></b-dropdown-divider>
<!--            <b-dropdown-group id="dropdown-group-1" header="融合演化">-->
<!--              <b-dropdown-item-->
<!--                v-if="curDiagramType === 'GN'"-->
<!--                @click="mixGoalFile"-->
<!--              >-->
<!--                <font-awesome-icon icon="star" />-->
<!--                <span>融合目标模型</span></b-dropdown-item-->
<!--              >-->
<!--              <b-dropdown-item-->
<!--                v-if="curDiagramType === 'GN'"-->
<!--                @click="yanGoalFile"-->
<!--              >-->
<!--                <font-awesome-icon icon="star" />-->
<!--                <span>演化目标模型</span></b-dropdown-item-->
<!--              >-->
<!--              <div>-->
<!--                <b-dropdown-item-->
<!--                v-if="curDiagramType === 'GN'"-->
<!--                @click="chooseViewBySidebar"-->
<!--              >-->
<!--                <font-awesome-icon icon="star" />-->
<!--                <span>视图切换</span></b-dropdown-item-->
<!--              >-->
<!--              </div>-->
<!--              <div>-->
<!--                <b-dropdown-item-->
<!--                  v-if="curDiagramType === 'GN'"-->
<!--                  @click="ifGptSidebarShow = true"-->
<!--                >-->
<!--                  <font-awesome-icon icon="star" />-->
<!--                  <span>Gpt</span></b-dropdown-item-->
<!--                >-->
<!--              </div>-->
<!--            </b-dropdown-group>-->
<!--            <b-dropdown-divider></b-dropdown-divider>-->
            <!--            <b-modal id="mixModal" size="sm" @ok="mixGoalFile">-->
            <!--              <b-form-group label="请选择要融合的目标模型辅文件">-->
            <!--                <b-form-file v-model="mixFile" accept=".json"></b-form-file>-->
            <!--              </b-form-group>-->
            <!--              <div slot="modal-ok">融合目标模型</div>-->
            <!--              <div slot="modal-cancel">取消</div>-->
            <!--            </b-modal>-->
            <b-dropdown-item @click="$router.back(-1)">
              <font-awesome-icon icon="window-close" />
              <span>{{ $t("CSDM.exit") }}</span></b-dropdown-item
            >
          </b-nav-item-dropdown>
          <!-- 导航栏———编辑 -->
          <b-nav-item-dropdown style="font-weight: bold; margin-right: 20px" :text="$t('CSDM.edit')" no-caret>               <!--编辑-->
            <!-- <b-dropdown-item @click="saveDiagram">
              <font-awesome-icon icon="save" />
              {{ $t("CSDM.save") }}
            </b-dropdown-item> -->
            <!-- <b-dropdown-divider></b-dropdown-divider> -->
            <b-dropdown-item @click="undo">
              <font-awesome-icon icon="undo-alt" />
              {{ $t("CSDM.undo") }}
            </b-dropdown-item>
            <b-dropdown-item @click="redo">
              <font-awesome-icon icon="redo-alt" />
              {{ $t("CSDM.redo") }}
            </b-dropdown-item>
            <b-dropdown-divider></b-dropdown-divider>
            <b-dropdown-item @click="cutSelection">
              <font-awesome-icon icon="cut" />
              {{ $t("CSDM.cut") }}
            </b-dropdown-item>
            <b-dropdown-item @click="copySelection">
              <font-awesome-icon icon="copy" />
              {{ $t("CSDM.copy") }}
            </b-dropdown-item>
            <b-dropdown-item @click="pasteSelection">
              <font-awesome-icon icon="paste" />
              {{ $t("CSDM.paste") }}
            </b-dropdown-item>
            <!--<b-dropdown-divider></b-dropdown-divider>
            <b-dropdown-item @click="groupSelection">
              <font-awesome-icon icon="object-group" />
              {{ $t("CSDM.group") }}
            </b-dropdown-item>
            <b-dropdown-item @click="ungroupSelection()">
              <font-awesome-icon icon="object-ungroup" />
              {{ $t("CSDM.ungroup") }}
            </b-dropdown-item>-->
            <!-- <b-dropdown-item v-if="curDiagramType === 'GN'" @click="evolutionValue()">
              <font-awesome-icon icon="object-ungroup"/>
              {{$t('CSDM.evolution')}}
            </b-dropdown-item> -->
            <!-- <b-dropdown-item
              v-if="curDiagramType === 'GN'"
              v-b-modal="'evolutionValue'"
            >
              <font-awesome-icon icon="upload" />
              <span>{{ $t("CSDM.evolution") }}</span>
            </b-dropdown-item> -->
            <!-- <b-modal id="evolutionValue" size="sm" @ok="evolution">
              <b-form-group :label="$t('CSDM.evolution-choose-before')">
                <b-form-radio-group
                  id="radio-group-1"
                  v-model="valueSelectedBefore"
                  :options="valueOptions"
                  name="radio-options"
                ></b-form-radio-group>
              </b-form-group>
              <b-form-group :label="$t('evolution-choose-after')">
                <b-form-radio-group
                  id="radio-group-2"
                  v-model="valueSelectedAfter"
                  :options="valueOptionsCopy"
                  name="radio-options-copy"
                ></b-form-radio-group>
              </b-form-group>
              <div slot="modal-ok">{{ $t("CSDM.evolution") }}</div>
              <div slot="modal-cancel">{{ $t("CSDM.cancel") }}</div>
            </b-modal> -->
          </b-nav-item-dropdown>
          <!-- 导航栏———网格 -->
          <b-nav-item-dropdown style="font-weight: bold; margin-right: 20px;" :text="$t('CSDM.grid')" no-caret>              <!--网格 font-weight: bold;-->
            <b-form-group class="group">
              <b-form-select
                v-model="selectGrid"
                :options="selectGrids"
                stacked
              ></b-form-select>
            </b-form-group>
          </b-nav-item-dropdown>
          <!-- 导航栏———帮助-->
          <b-nav-item-dropdown style="font-weight: bold; margin-right: 20px" :text="$t('CSDM.help')" no-caret>              <!--帮助-->
            <b-dropdown-item>{{
              $t("CSDM.shortcut-key-overview")
            }}</b-dropdown-item>
          </b-nav-item-dropdown>
          <!-- 导航栏———窗口化：切换视图、不一致性检测、chatgpt帮助-->
          <b-nav-item-dropdown style="font-weight: bold; margin-right: 20px" :text="$t('CSDM.moreMethods')" no-caret>               <!--编辑-->
            <b-dropdown-item @click="activatePanel('视图切换')" v-if="$route.query.diagramType==='GN'">
              <font-awesome-icon icon="user-plus" />
              {{ $t("CSDM.devidebyrole") }}
            </b-dropdown-item>
            <b-dropdown-item @click="activatePanel('子域划分')" v-if="$route.query.diagramType==='VN'">
              {{ $t("CSDM.divideSubDomain") }}
            </b-dropdown-item>
           <b-dropdown-divider v-if="$route.query.diagramType==='GN'"></b-dropdown-divider>
            <b-dropdown-item @click="activatePanel('不一致性检测')" v-if="$route.query.diagramType==='GN'">
              <font-awesome-icon icon="exclamation-triangle" />
              {{ $t("CSDM.Inconsistencydetection") }}
            </b-dropdown-item>
            <b-dropdown-divider v-if="$route.query.diagramType==='GN'"></b-dropdown-divider>
            <b-dropdown-item @click="activatePanel('基于大模型的目标抽取')" v-if="$route.query.diagramType==='GN'">
              <font-awesome-icon icon="comments" />
              {{ $t("CSDM.chatgpt") }}
            </b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
        <!--重命名-->
        <!-- 导航栏 -->
        <b-navbar-nav style="display: flex; justify-content: center;">
          <span
          style="background: #1677FD; color: white; font-size: 16px; display: inline-flex; align-items: center; height: 40px; border-radius: 20px; text-align: center; padding: 0rem 10rem;"
          class="navbar-brand rename"
            id="project-name"
            ref="projectName"
            v-b-tooltip.hover
            title="Click to rename this project"
            >{{ diagram.diagramName }}</span
          >
        </b-navbar-nav>
        <!--融合文件名称-->
        <b-navbar-nav v-show="isSubShow">
          <span class="navbar-brand rename" v-b-tooltip.hover
            >客体领域模型:</span
          >
          <span
            class="navbar-brand rename"
            id="mixproject-name"
            v-b-tooltip.hover
            >{{ mixdiagramName }}</span
          >
          <span class="navbar-brand rename" v-b-tooltip.hover
            >匹配相似度: {{ mixdiagramSimilarity }}</span
          >
        </b-navbar-nav>
        <!--// TODO 搜索框align-right-->
        <b-navbar-nav class="ml-auto" style="float: right">
          <b-nav-form>
            <b-form-input
              size="sm"
              class="mr-sm-2"
              :placeholder="$t('CSDM.search_content')"
              id="search-content"
              v-model="search_content"
              >{{ search_content }}</b-form-input
            >
            <b-form-select
              size="sm"
              id="search-type"
              v-model="search_type"
              :options="search_types"
            >
            </b-form-select>
            <b-button
              size="sm"
              class="my-2 my-sm-0"
              type="button"
              @click="search"
              style="background-color: #1677FD; color: white; font-size: 16px; padding: 0rem 0.6rem; border-radius: 6px;"
              >{{ $t("CSDM.search") }}</b-button
            >
          </b-nav-form>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
<!-- //第一行结束// -->
  <b-sidebar id="sidebar" right style="top: 100px !important;" :visible="showMoreMethodsSidebar" @hidden="showMoreMethodsSidebar = false" no-close-on-backdrop no-close-on-esc>
    <b-card v-for="panel in activePanels" :key="panel" style="margin-bottom: 10px;">
      <b-card-header header-tag="header" class="p-1" role="tab">
        <div class="d-flex justify-content-between align-items-center">
          <b-button block v-b-toggle="'collapse-' + panel" variant="primary">{{ panel }}</b-button>
          <b-button variant="danger" @click.stop="removePanel(panel)">X</b-button>
        </div>
      </b-card-header>
      <b-collapse :id="'collapse-' + panel" visible><!--去掉了accordion="my-accordion"就可以同时展开啦-->
        <b-card-body v-if="panel==='视图切换'">
<!--          以下是切换视图的前端界面-->
          <b-form-group
            id="ViewSidebar"
            label="请选择想要的视图角度"
          >
            <b-tabs content-class="mt-3" nav-class="custom-nav">
              <b-tab title="从角色" active-class="selected-tab">
                <b-card-text>请选择角色</b-card-text>
                <b-form-select
                  id="search-role"
                  v-model="roleName"
                  :options="roleArray"
                >
                </b-form-select>
                <b-form-checkbox
                  id="checkbox-role"
                  v-model="includeFlag"
                  name="checkbox-1"
                  value='1'
                  unchecked-value=''
                >
                  是否需要相关目标
                </b-form-checkbox>
                <!-- <b-button
                  variant="outline-primary"
                  @click="openModal(true)"
                >展示视图</b-button
                > -->
                <div class="container">
                  <button
                  class="disbutton"
                  variant="outline-primary"
                  @click="openModal(true)"
                  >展示视图</button>
              </div>
              </b-tab>
              <!--<b-tab title="从位置">-->
<!--                <b-card-text>请先为所有目标获取部署位置</b-card-text>-->
<!--                <div class="container">-->
<!--                  <b-button-->
<!--                  class="disbutton"-->
<!--                  variant="outline-primary"-->
<!--                  @click="getDeployedPosition"-->
<!--                  >获取位置</b-button>-->
<!--                </div>-->
                <!--<b-card-text>请选择位置</b-card-text>
                <b-form-select v-model="chooseView">
                  <option value="云">云</option>
                  <option value="边">边</option>
                  <option value="端">端</option>
                </b-form-select>
                <b-card-text>

                </b-card-text>-->
<!--                <b-form-checkbox-->
<!--                  id="checkbox-position"-->
<!--                  v-model="includeFlag"-->
<!--                  name="checkbox-1"-->
<!--                  value='1'-->
<!--                  unchecked-value=''-->
<!--                >-->
<!--                  是否需要相关目标-->
<!--                </b-form-checkbox>-->
                <!--<div class="container">
                  <button
                  class="disbutton"
                  variant="outline-primary"
                  @click="openModal(false)"
                  >展示视图</button>
                </div>-->
              </b-tab>
            </b-tabs>
          </b-form-group>
<!--          以上是切换视图的前端界面-->
        </b-card-body>
        <b-card-body v-if="panel==='不一致性检测'">
        <!--
          <b-modal id="tipstoxiugai" size="sm" ok-only>
                <h3>请修改相应冲突的片段</h3>
              </b-modal>-->
              <b-button
                block
                variant="light"
                @click="checkInconsistency"
                v-b-modal="'tipstoxiugai'"
                style="margin-bottom: 10px;"
                >冲突检测</b-button
              >
              <div v-show="ifShowLoading1">
                <div class="d-flex align-items-center">
                  <strong>Loading...</strong>
                  <b-spinner class="ml-auto"></b-spinner>
                </div>
              </div>
              <div v-show="toggle1">
                <b-button block variant="light" @click="toggle = !toggle"
                  >检测结果<span class="caret"></span
                ></b-button>
              </div>
              <div v-show="toggle">
                <b-table
                  responsive
                  :items="items"
                  :fields="fields"
                  bordered="true"
                  sticky-header="true"
                  head-variant="light"
                  primary-key="id"
                >
                </b-table>
              </div>
        </b-card-body>
        <b-card-body v-if="panel==='基于大模型的目标抽取'">
<!--          以下是获得GPT结果的窗口-->
          <b-form-group id="GptSidebar">
          <b-form-file 
                v-model="logFile"
                accept=".json"
                size="sm"
                browse-text="上传"
                placeholder="未上传文件"
              ></b-form-file>
            <b-input-group size="sm">
              <b-form-input
                v-model="filter"
                type="search"
                id="filterInput"
                placeholder="查询内容"
                class="w-75"
              ></b-form-input>
              <b-input-group-append class="w-25">
                <b-button :disabled="!filter" @click="getMsgFromGpt" style="background-color: #1677FD; color: #fff"
                >&nbsp;搜索
                </b-button>
              </b-input-group-append>
            </b-input-group>
            <div v-show="ifShowLoading">
              <div class="d-flex align-items-center">
                <strong>Loading...</strong>
                <b-spinner class="ml-auto"></b-spinner>
              </div>
            </div>
          </b-form-group>
          <b-form-group v-show="showGoalsName[0]">
            <strong>非功能性目标</strong>
            <b-table
              show-empty
              small
              stacked="md"
              :items="nonFunctionGoals"
              :fields="GptFields"
            >
              <template v-slot:cell(actions)="row">
                <b-button
                  size="sm"
                  variant="outline-info"
                  @click="addGoalName=row.item.name; selectGoalType='非功能性目标'"
                  v-b-modal="'chooseGoal'"
                  class="mr-1"
                >
                  添加
                </b-button>
              </template>
            </b-table>
          </b-form-group>
          <b-form-group v-show="showGoalsName[1]">
            <strong>可操作性目标</strong>
            <b-table
              show-empty
              small
              stacked="md"
              :items="operationalGoals"
              :fields="GptFields"
            >
              <template v-slot:cell(actions)="row">
                <b-button
                  size="sm"
                  variant="outline-info"
                  @click="addGoalName=row.item.name; selectGoalType='可操作性目标'"
                  v-b-modal="'chooseGoal'"
                  class="mr-1"
                >
                  添加
                </b-button>
              </template>
            </b-table>
          </b-form-group>
          <b-form-group v-show="showGoalsName[2]">
            <strong>功能性目标</strong>
            <b-table
              show-empty
              small
              stacked="md"
              :items="functionGoals"
              :fields="GptFields"
            >
              <template v-slot:cell(actions)="row">
                <b-button
                  size="sm"
                  variant="outline-info"
                  @click="addGoalName=row.item.name; selectGoalType='功能性目标'"
                  v-b-modal="'chooseGoal'"
                  class="mr-1"
                >
                  添加
                </b-button>
              </template>
            </b-table>
          </b-form-group>
          <b-modal id="chooseGoal" size="sm" @ok="addGptNode">
            <b-form-group
              :label=addGoalName
              label-cols-sm="3"
              label-align-sm="right"
              label-size="sm"
              label-for="filterInput"
              class="mb-0"
            >
              <b-form-select size="sm" v-model="selectGoalType">
                <option value="非功能性目标">非功能性目标</option>
                <option value="功能性目标">功能性目标</option>
                <option value="可操作性目标">可操作性目标</option>
              </b-form-select>
            </b-form-group>
          </b-modal>
        </b-card-body>
        <b-card-body v-if="panel==='子域划分'">
          <b-button
            block
            variant="light"
            @click="getSubdomain"
            style="margin-bottom: 10px;"
          >子域划分</b-button
          >
          <b-form-group v-show="showSubDomain">
            <strong>非功能性目标</strong>
            <b-table
              show-empty
              small
              stacked="md"
              :items="subDomainName"
              :fields="subDomainFields"
            >
              <template v-slot:cell(actions)="row">
                <b-button
                  size="sm"
                  variant="outline-info"
                  @click="changeDomain(row.index)"
                  v-b-modal="'chooseSubDomain'"
                  class="mr-1"
                >
                  添加
                </b-button>
              </template>
            </b-table>
          </b-form-group>
          <b-modal id="chooseSubDomain" size="lg" @ok="addDomain" @shown="initDiagram">
            <b-form-group
              :label=subDomainName[subDomainIndex].name
              label-cols-sm="3"
              label-align-sm="right"
              label-for="filterInput"
              class="mb-0"
            >
              <b-form-select size="sm" v-model="selectDomainType">
                <option value="CD">核心子域</option>
                <option value="GD">通用子域</option>
                <option value="SD">支持子域</option>
              </b-form-select>
            </b-form-group>
            <div
              id="myLittleDiagramDiv"
              style="height: 500px; background-color: white;"
            ></div>
          </b-modal>
        </b-card-body>
      </b-collapse>
<!--      以上是获得GPT结果的窗口-->
    </b-card>
    <div class="resize-handle"></div>
  </b-sidebar>
<!-- 以上是窗口化的侧边栏 -->
    <!--第二行-->
      <b-nav justified>
      <b-nav-item v-b-modal="'saveModal'"
        ><a v-b-tooltip.hover :title="$t('CSDM.exit')"
          ><font-awesome-icon icon="arrow-circle-left"/></a
      ></b-nav-item>
      <b-modal
        id="saveModal"
        @ok="saveDiagram(true)"
        @cancel="$router.back(-1)"
      >
        {{ $t("CSDM.choose-save-content") }}
        <div slot="modal-ok">{{ $t("CSDM.yes") }}</div>
        <div slot="modal-cancel">{{ $t("CSDM.no") }}</div>
      </b-modal>
      <b-nav-item style="min-width: 215px">
        <b-form-select v-model="selectedFont" id="search-type" style="background-color: #f6f7f8;" @change="changeFont">
          <option disabled value="">选择字体</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Helvetica">Helvetica</option>
          <option value="宋体">宋体</option>
          <option value="楷体">楷体</option>
          <option value="隶书">隶书</option>
          <option value="微软雅黑">微软雅黑</option>
          <option value="华文仿宋">华文仿宋</option>
          <option value="华文楷体">华文楷体</option>
          <option value="幼圆">幼圆</option>
        </b-form-select>
      </b-nav-item>
      <b-nav-item style="min-width: 150px">
        <b-form-select v-model="selectedSize" id="search-type" style="background-color: #f6f7f8;" @change="changeFont">
          <option disabled value="">选择字号</option>
          <option value="6pt">6pt</option>
          <option value="7pt">7pt</option>
          <option value="8pt">8pt</option>
          <option value="9pt">9pt</option>
          <option value="10pt">10pt</option>
          <option value="11pt">11pt</option>
          <option value="12pt">12pt</option>
          <option value="13pt">13pt</option>
          <option value="14pt">14pt</option>
          <option value="15pt">15pt</option>
        </b-form-select>
      </b-nav-item>
      <b-nav-item @click="showSideBar = !showSideBar; moveCanvasCenter();">
              <font-awesome-icon icon="bars"
              v-b-tooltip.hover
              :title="$t('CSDM.fold-sidebar')"
              />
      </b-nav-item>
      <b-nav-item @click="largerSize"
        ><font-awesome-icon
          icon="font"
          size="lg"
          v-b-tooltip.hover
          :title="$t('CSDM.enlarge-font-size')"
      /></b-nav-item>
      <b-nav-item @click="smallerSize"
        ><font-awesome-icon
          icon="font"
          v-b-tooltip.hover
          :title="$t('CSDM.narrow-font-size')"
      /></b-nav-item>
      <b-dropdown-divider></b-dropdown-divider>
      <b-nav-item @click="boldFont"
        ><font-awesome-icon
          icon="bold"
          v-b-tooltip.hover
          :title="$t('CSDM.text-bold')"
      /></b-nav-item>
      <b-nav-item @click="italicFont"
        ><font-awesome-icon
          icon="italic"
          v-b-tooltip.hover
          :title="$t('CSDM.text-italics')"
      /></b-nav-item>
      <b-nav-item @click="underlineFont"
        ><font-awesome-icon
          icon="underline"
          v-b-tooltip.hover
          :title="$t('CSDM.underline')"
      /></b-nav-item>
      <b-nav-item @click="strikethroughFont"
        ><font-awesome-icon
          icon="strikethrough"
          v-b-tooltip.hover
          :title="$t('CSDM.strikethrough')"
      /></b-nav-item>      <!-- 显示了一个 FontAwesome 的 "strikethrough" 图标，当鼠标悬停在图标上时，会显示一个由 $t('CSDM.strikethrough') 返回的字符串作为工具提示。 -->
      <b-dropdown-divider></b-dropdown-divider>
      <b-nav-item @click="$refs.fill.click()"
        ><font-awesome-icon
          icon="tint"
          v-b-tooltip.hover
          :title="$t('CSDM.fill')"
      /></b-nav-item>
      <b-dropdown-divider></b-dropdown-divider>
      <b-nav-item @click="showGrid"
        ><font-awesome-icon icon="th" v-b-tooltip.hover :title="$t('CSDM.grid')"
      /></b-nav-item>
      <b-dropdown-divider></b-dropdown-divider>
      <b-nav-item class="reportEditor"  @click="fetchAnalyContent"
        ><font-awesome-icon
          icon="file"
          v-b-tooltip.hover
          :title="$t('CSDM.report-editor')"
      /></b-nav-item>
      <b-dropdown-divider></b-dropdown-divider>
      <b-nav-item @click="diagramCheck"
        ><font-awesome-icon
          icon="bug"
          v-b-tooltip.hover
          :title="$t('CSDM.consistency-check')"
      /></b-nav-item>
    </b-nav>
<!-- 以上是顶部栏，以下是主题内容 -->
    <b-row
      style="position:absolute;top: 103px;bottom: 5px;left: 0px;right: 0px;"
    >
      <!-- 侧边栏（下左） -->
      <b-col v-show="showSideBar" :md="sideBarmd" style="height: 100%">
        <b-list-group class="sidebar-collapse" role="tablist">
          <!-- 第一个：目标模型元素 -->
          <b-card no-body>
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button block href="" v-b-toggle.my-collapse variant="light"
                >{{ modelType }}<span class="caret"></span
              ></b-button> 
            </b-card-header>
            <b-collapse
              id="my-collapse"
              visible
              accordion="my-accordion"
              role="tabpanel"
            >
              <b-card-body>
                <div id="myPaletteDiv1" style="height:350px;"></div>
              </b-card-body>
            </b-collapse>
          </b-card>
          <!-- 以上：一个单位:目标模型元素 -->
          <b-card no-body>
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button block href="" v-b-toggle.my-collapse2 variant="light"
                >{{ relationType }}<span class="caret"></span
              ></b-button>
            </b-card-header>
            <b-collapse
              id="my-collapse2"
              visible
              accordion="my-accordion"
              role="tabpanel"
            >
              <b-card-body>
                <div id="myPaletteDiv2" style="height:350px;">test</div>
              </b-card-body>
            </b-collapse>
          </b-card>
          <!-- 以上：一个单位:目标模型关系 -->
<!--          <b-card no-body>-->
<!--            <b-card-header header-tag="header" class="p-1" role="tab">-->
<!--              <b-button block href="" v-b-toggle.my-collapse3 variant="light"-->
<!--                >{{ $t("CSDM.basic-elements") }}<span class="caret"></span-->
<!--              ></b-button>-->
<!--            </b-card-header>-->
<!--            <b-collapse-->
<!--              id="my-collapse3"-->
<!--              visible-->
<!--              accordion="my-accordion"-->
<!--              role="tabpanel"-->
<!--            >-->
<!--              <b-card-body>-->
<!--                <div id="myPaletteDiv3" style="height:350px;"></div>-->
<!--              </b-card-body>-->
<!--            </b-collapse>-->
<!--          </b-card>-->
<!--          &lt;!&ndash; 一个单位:基本元素 &ndash;&gt;-->
<!--          <b-card no-body>-->
<!--            <b-card-header header-tag="header" class="p-1" role="tab">-->
<!--              <b-button block href="" v-b-toggle.my-collapse4 variant="light"-->
<!--                >{{ $t("CSDM.basic-rela") }}<span class="caret"></span-->
<!--              ></b-button>-->
<!--            </b-card-header>-->
<!--            <b-collapse-->
<!--              id="my-collapse4"-->
<!--              visible-->
<!--              accordion="my-accordion"-->
<!--              role="tabpanel"-->
<!--            >-->
<!--              <b-card-body>-->
<!--                <div id="myPaletteDiv4" style="height:350px;"></div>-->
<!--              </b-card-body>-->
<!--            </b-collapse>-->
<!--          </b-card>-->
<!--          &lt;!&ndash; 一个单位:基本关系 &ndash;&gt;-->
<!--          <b-card no-body>-->
<!--            <b-card-header header-tag="header" class="p-1" role="tab">-->
<!--              <b-button-->
<!--                block-->
<!--                href=""-->
<!--                v-b-toggle="'mySearchCollapse'"-->
<!--                @click="showChooseModel()"-->
<!--                variant="light"-->
<!--              >-->
<!--                {{ chooseText }}<span class="caret"></span>-->
<!--              </b-button>-->
<!--            </b-card-header>-->
<!--            <b-card-header-->
<!--              header-tag="header"-->
<!--              :class="'p-1 ' + activeclass"-->
<!--              role="tab"-->
<!--            >-->
<!--              <b-button-->
<!--                v-for="(item, index) in search_diagram_json"-->
<!--                :key="index"-->
<!--                :class="btnClick"-->
<!--                block-->
<!--                href=""-->
<!--                v-b-toggle="'mySearchCollapse' + index"-->
<!--                @click="createSearchDiagram(item, index)"-->
<!--                variant="light"-->
<!--              >-->
<!--                {{ btnText + "" + parseInt(index + 1)-->
<!--                }}<span class="caret"></span>-->
<!--              </b-button>-->
<!--            </b-card-header>-->
<!--          </b-card>-->
          <!-- 一个单位:选择模板片段 :创建一个可以动态变化的折叠列表，列表的项数、行为和样式都可以根据 Vue 实例的状态动态变化。-->
<!-- 以上是左边五个大块 -->
          <b-card
            no-body
            v-for="(item, index) in search_diagram_json"
            :key="index"
          >
            <!-- 下面这个区域的作用是存放模板片段的试图 -->
            <b-collapse
              class="boxModel"
              v-bind:id="'mySearchCollapse' + index"
              accordion="my-accordion"
              role="tabpanel"
            >
              <b-card-body>
                <div
                  v-bind:id="'mySearchDiagram' + index"
                  style="height:350px;"
                ></div>
              </b-card-body>
            </b-collapse>
          </b-card>
        </b-list-group>
      </b-col>
      <!-- 分隔栏 D2D2D2-->
      <div
        style="cursor: w-resize;width: 5px;background: #d2d2d2"
        @mousedown="handleEditorDivider"
      ></div>
<!--               diagram (右侧四个选项)                       -->
      <b-col style="height: 100%">
        <div
          id="myDiagramDiv"
          style="height: 100%; background-color: white;"
        ></div><!--whitesmoke-->
        <div :style="{ marginLeft: splitLine }"></div>
        <!-- 原来的侧边栏开关
          <div
          style="position: absolute;border: 1px solid #D2D2D2;background-color: #f5f5f5;top:0px;z-index:100;margin-left: 0px;"
        >
          <button
            :title="$t('CSDM.fold-sidebar')"
            class="tool-bar-btn"
            @click="
              showSideBar = !showSideBar;
              moveCanvasCenter();
            "
          >
            <i class="fas fa-bars"></i>
          </button>
        </div> -->
        <!--
          右边导航栏四个按钮
        -->
        <div id="dock">
          <div class="dock-header"></div>
          <div class="dock-buttons">
            <div
              id="dock-btn-navigator"
              title="Navigator"
              class="tool-bar-btn"
              @click="setDock(1)"
            >
              <i class="fa fa-crosshairs"></i>
            </div>
            <div
              id="dock-btn-graphic"
              title="Graphic"
              class="tool-bar-btn"
              @click="setDock(2)"
            >
              <i class="fa fa-chart-bar"></i>
            </div>
            <div
              id="dock-btn-attribute"
              title="Data Attributes"
              class="tool-bar-btn"
              @click="setDock(3)"
            >
              <i class="fa fa-table"></i>
            </div>
            <div
              id="dock-btn-error"
              title="Error Log"
              class="tool-bar-btn"
              @click="setDock(4)"
            >
              <i class="fa fa-exclamation-triangle"></i>
            </div>
          </div>
        </div>
        <!--
           四个按钮对应的四个视图
           -->
        <!-- 第一个视图 -->
        <div
          class="dock-view"
          :class="[shownDock === 1 ? 'open' : '']"
          id="navigator-view"
        >
          <div class="view-title">
            <span>{{ $t("CSDM.navigation") }}</span>
          </div>
          <div class="view-body">
            <div id="diagramOverview"></div>
          </div>
        </div>
        <!-- 第二个视图 -->
        <div
          class="dock-view"
          :class="[shownDock === 2 ? 'open' : '']"
          id="graphic-view"
        >
          <div class="view-title">
            <span>{{ $t("CSDM.graph") }}</span>
          </div>
          <div class="view-body">
            <div class="stroke">
              <span>{{ $t("CSDM.stroke") }}</span>
              <input
                type="color"
                ref="strokeColor"
                @change="changeStrokeColor"
              />
              <select
                name="strokeStyle"
                v-model="strokeStyle"
                @change="changeStrokeStyle"
              >
                <option value="solid">———</option>
                <option value="dashed">--------</option>
                <option value="dotted">········</option>
              </select>
            </div>
            <div>
              <span>{{ $t("CSDM.fill") }}</span
              ><input type="color" ref="fill" @change="fillBackground" />
            </div>
            <div class="isCrossover">
              <span>{{ $t("CSDM.whether-crossover-service") }}</span>
              <select
                name="isCrossover"
                v-model="isCrossover"
                @change="changeCrossover"
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            </div>
          </div>
        </div>
        <!-- 第三个视图 -->
        <div
          class="dock-view"
          :class="[shownDock === 3 ? 'open' : '']"
          id="attribute-view"
        >
          <div class="view-title">
            <span>{{ $t("CSDM.data-attribute") }}</span>
          </div>
          <div class="view-body">
            <div id="attributeTable"></div>
            <div v-show="showIfOperationGoal">
              <b-button
                variant="outline-primary"
                v-b-modal="'addAttribute'"
                @click="getDefaultAttribute"
              >添加属性</b-button
              >
            </div>
          </div>
          <b-modal id="addAttribute" size="lg" @hidden="changeSelection">
            <b-form-group label="请选择想要添加的需求">
              <b-container class="bv-example-row">
                <b-row>
                  <b-col cols="6" md="auto">
                    <b-form-checkbox-group
                      id="checkbox-Attribute"
                      v-model="selectAttribute"
                      name="chooseAttributeBox"
                      @change="(checked)=>ifCheckedAttribute(checked)"
                      stacked
                    >
                      <b-form-checkbox value="ResponseTime" class="mt-1">响应时间:</b-form-checkbox>
                      <b-form-checkbox value="NetworkConnection" class="my-3">网络连接:</b-form-checkbox>
                      <b-form-checkbox value="ComputingResource" class="mb-3">计算资源:</b-form-checkbox>
                      <b-form-checkbox value="DataPrivacy" class="mb-3">数据隐私</b-form-checkbox>
                      <b-form-checkbox value="DeviceCompatibility" class="mb-3">设备兼容</b-form-checkbox>
                    </b-form-checkbox-group>
                  </b-col>
                  <b-col cols="6" md="auto">
                    <b-form-select
                      class="mb-2"
                      :disabled="!selectAttribute.includes('ResponseTime')"
                      size="sm"
                      @change="(value)=>changeChoosedAttribute(value,1)"
                      v-model="attributeData[0]"
                    >
                      <b-form-select-option value="慢(100~500ms)">慢(100~500ms)</b-form-select-option>
                      <b-form-select-option value="较慢(50~100ms)">较慢(50~100ms)</b-form-select-option>
                      <b-form-select-option value="较快(10~50ms)">较快(10~50ms)</b-form-select-option>
                    </b-form-select>
                    <b-form-select
                      class="mb-2"
                      :disabled="!selectAttribute.includes('NetworkConnection')"
                      size="sm"
                      @change="(value)=>changeChoosedAttribute(value,2)"
                      v-model="attributeData[1]"
                    >
                      <b-form-select-option value="无需网络连接">无需网络连接</b-form-select-option>
                      <b-form-select-option value="网络连接需求较少">网络连接需求较少</b-form-select-option>
                      <b-form-select-option value="网络连接需求大量">网络连接需求大量</b-form-select-option>
                    </b-form-select>
                    <b-form-select
                      class="mb-2"
                      :disabled="!selectAttribute.includes('ComputingResource')"
                      size="sm"
                      @change="(value)=>changeChoosedAttribute(value,3)"
                      v-model="attributeData[2]"
                    >
                      <b-form-select-option value="计算资源需求较少">计算资源需求较少</b-form-select-option>
                      <b-form-select-option value="计算资源需求适中">计算资源需求适中</b-form-select-option>
                      <b-form-select-option value="计算资源需求大量">计算资源需求大量</b-form-select-option>
                    </b-form-select>
                  </b-col>
                </b-row>
              </b-container>
            </b-form-group>
            <div slot="modal-ok" onclick="getDeployedPosition()">{{ $t("CSDM.ok") }}</div>
<!--            getDeployedPosition-->
            <div slot="modal-cancel">{{ $t("CSDM.cancel") }}</div>
          </b-modal>
        </div>
        <!-- 第四个视图 -->
        <div
          class="dock-view"
          :class="[shownDock === 4 ? 'open' : '']"
          id="error-view"
        >
          <div class="view-title">
            <span>{{ $t("CSDM.error-log") }}</span>
          </div>
          <div class="view-body">
            <div id="errorTable">
              <table border="1">
                <thead>
                  <tr>
                    <th style="text-align: center">{{ $t("CSDM.error") }}</th>
                    <th style="text-align: center">
                      {{ $t("CSDM.amendment") }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(error, index) in errors" :key="index">
                    <td v-text="error[0]"></td>
                    <td v-text="error[1]"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </b-col>
<!--               diagram (以下：右侧侧边栏：文件——融合目标模型  打开)                       -->
      <div
        style="cursor: w-resize;width: 5px;background: #D2D2D2"
        @mousedown="handleEditorDivider2"
      ></div>
      <b-col v-show="isMixed" :md="rightSideBar" style="height: 100%">
        <button
          :title="$t('CSDM.fold-sidebar')"
          class="tool-bar-btn"
          @click="isMixed = !isMixed;"
        >
          <i class="fas fa-bars"></i>
        </button>
        <b-list-group class="sidebar-collapse" role="tablist">
          <b-card no-body>
            <b-card-header header-tag="header" class="p-1" role="tab">
              <!--              <b-button block  variant="light" @click="identifyRedBox">寻找用户新目标<span class="caret"></span></b-button>-->
              <b-button
                block
                v-b-toggle.my-collapse5
                variant="light"
                :disabled="isDis1"
                style="text-align: center"
                >获取目标模型<span class="caret"></span
              ></b-button>
              <!--              <b-button block  v-b-toggle.my-collapse5 variant="light" :disabled="isDis1">Matching Object Domain Goal Model<span class="caret"></span></b-button>-->
            </b-card-header>
            <b-collapse
              id="my-collapse5"
              visible
              accordion="my-accordion"
              role="tabpanel"
            >
              <b-card-body>
                <b-button
                  block
                  variant="light"
                  @click="identifyGoalBox"
                  :disabled="isDisable1"
                  v-b-modal="'chooseMixGoal'"
                  >重构主体领域目标模型</b-button
                >
                <b-button
                  block
                  variant="light"
                  @click="importSubModel"
                  :disabled="isDisable2"
                  >匹配客体领域目标模型</b-button
                >
                <b-modal id="chooseMixGoal" size="sm" @ok="chooseMixGoal">
                  <b-form-group label="请选择待融合用户目标">
                    <b-form-select
                      v-model="userGoalKey"
                      :options="mixUserGoals"
                    ></b-form-select>
                  </b-form-group>
                  <b-form-group label="请选择待融合依赖目标">
                    <b-form-select
                      v-model="depdGoalKey"
                      :options="mixDepdGoals"
                    ></b-form-select>
                  </b-form-group>
                  <div slot="modal-ok">{{ $t("CSDM.ok") }}</div>
                  <div slot="modal-cancel">{{ $t("CSDM.cancel") }}</div>
                </b-modal>
              </b-card-body>
            </b-collapse>
          </b-card>
          <b-card no-body>
            <b-card-header header-tag="header" class="p-1" role="tab">
              <!--              <b-button block @click="deleteSubModel" variant="light">融合用户目标模型<span class="caret"></span></b-button>-->
              <b-button
                block
                href=""
                v-b-toggle.my-collapse6
                variant="light"
                :disabled="isDis2"
                v-b-modal="'tips'"
                style="text-align: center"
                >融合用户目标</b-button
              >
              <!--              <b-button block href="" v-b-toggle.my-collapse6 variant="light" :disabled="isDis2" @click="secondStep">User Actor Goal Convergence<span class="caret"></span></b-button>-->
              <b-modal id="tips" size="sm" ok-only title="提示" @ok="secondStep"
                >请移动合适的片段进行融合</b-modal
              >
            </b-card-header>
            <!--            <b-collapse id="my-collapse6" visible accordion="my-accordion" role="tabpanel">-->
            <!--              <b-card-body>-->
            <!--                <b-button block  variant="light" @click="identifySubRedBox" :disabled="isDisable1">融合相似目标</b-button>-->
            <!--                <b-button block  variant="light" @click="generateTemplateFrag" v-b-modal="'tips'" :disabled="isDisable1">融合相似目标</b-button>-->
            <!--                <b-modal id="tips" size="sm" ok-only>请移动合适的片段进行融合</b-modal>-->
            <!--              </b-card-body>-->
            <!--            </b-collapse>-->
          </b-card>

          <b-card no-body>
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button
                block
                href=""
                v-b-toggle.my-collapse7
                variant="light"
                :disabled="isDis3"
                @click="thirdStep"
                style="text-align: center"
                >融合依赖者<span class="caret"></span
              ></b-button>
              <!--              <b-button block href="" v-b-toggle.my-collapse7 variant="light" :disabled="isDis3" @click="thirdStep">Dependee Actor Goal Convergence<span class="caret"></span></b-button>-->
            </b-card-header>
            <b-collapse
              id="my-collapse7"
              visible
              accordion="my-accordion"
              role="tabpanel"
            >
              <b-card-body>
                <b-button
                  block
                  variant="light"
                  @click="identifyDependent"
                  :disabled="isDisable1"
                  >添加依赖者</b-button
                >
                <b-button
                  block
                  variant="light"
                  @click="matchDependent"
                  :disabled="isDisable2"
                  >匹配依赖者</b-button
                >
                <b-button
                  block
                  variant="light"
                  v-b-modal="'tips2'"
                  :disabled="isDisable3"
                  >融合依赖者</b-button
                >
                <b-modal
                  id="tips2"
                  size="sm"
                  ok-only
                  title="提示"
                  @ok="mixedDependent"
                >
                  <p>1. 确定角色依赖关系:</p>
                  <p style="font-size: 15px">
                    &nbsp;&nbsp;&nbsp;&nbsp;用户依赖于{{ deps }}<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;{{ deps }}依赖于{{ depo }}
                  </p>
                  <p>2. 生成跨界服务目标</p>
                </b-modal>
              </b-card-body>
            </b-collapse>
          </b-card>
          <b-card no-body>
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button
                block
                v-b-toggle.my-collapse8
                variant="light"
                @click="fourthStep"
                :disabled="false"
                style="text-align: center"
                >不一致性检测<span class="caret"></span
              ></b-button>
              <!--              <b-button block v-b-toggle.my-collapse8 variant="light" v-b-modal="'tips3'" @click="checkInconsistency" :disabled="isDis4">Inconsistencies Detection and Conflicts Resolution<span class="caret"></span></b-button>-->
              <b-modal id="tips3" size="sm" ok-only>
                <h3>请修改相应冲突的片段</h3>
              </b-modal>
            </b-card-header>
            <b-collapse
              id="my-collapse8"
              visible
              accordion="my-accordion"
              role="tabpanel"
            >
              <b-card-body>
                <!--                <b-button block  variant="light" @click="preprocess" :disabled="isDisable1" v-b-modal="'tips3'">预处理</b-button>-->
                <!--                <div v-show="toggle2">-->
                <!--                  <b-button block  variant="light"  @click="toggle3=!toggle3" >处理意见<span class="caret"></span></b-button>-->
                <!--                </div>-->
                <!--                <br>-->
                <!--                <div v-show="toggle3">-->
                <!--                  <b-table responsive :items="processItems" :fields="processFields"  bordered=true sticky-header="true" head-variant="light" primary-key="id" >-->
                <!--                  </b-table>-->
                <!--                  <br>-->
                <!--                </div>-->
                <b-button
                  block
                  variant="light"
                  @click="checkInconsistency"
                  :disabled="isDisable2"
                  v-b-modal="'tips3'"
                  >冲突检测</b-button
                >
                <div v-show="toggle1">
                  <b-button block variant="light" @click="toggle = !toggle"
                    >检测结果<span class="caret"></span
                  ></b-button>
                </div>
                <br />
                <div v-show="toggle">
                  <b-table
                    responsive
                    :items="items"
                    :fields="fields"
                    :bordered="isDis4"
                    sticky-header="true"
                    head-variant="light"
                    primary-key="id"
                  >
                  </b-table>
                </div>
              </b-card-body>
            </b-collapse>
          </b-card>
          <b-card no-body>
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button
                block
                href=""
                variant="light"
                @click="deleteSubModel"
                :disabled="isDis5"
                style="text-align: center"
                >删除客体领域模型</b-button
              >
              <!--              <b-button block href=""  variant="light" @click="deleteSubModel" :disabled="isDis5" style="text-align: center">删除客体领域模型</b-button>-->
              <!--              <b-button block href=""  variant="light" @click="deleteSubModel" :disabled="isDis5">Delete Object Domain Goal Model</b-button>-->
            </b-card-header>
          </b-card>
        </b-list-group>
      </b-col>
      <b-col v-show="isYanMixed" :md="rightSideBar" style="height: 100%">
        <button
          :title="$t('CSDM.fold-sidebar')"
          class="tool-bar-btn"
          @click="isYanMixed = !isYanMixed;"
        >
          <i class="fas fa-bars"></i>
        </button>
        <b-list-group class="sidebar-collapse" role="tablist">
          <b-card no-body>
            <b-card-header header-tag="header" class="p-1" role="tab">
              <!--              <b-button block  variant="light" @click="identifyRedBox">寻找用户新目标<span class="caret"></span></b-button>-->
              <b-button
                block
                v-b-modal="'evolutionValue'"
                variant="light"
                :disabled="isYanDis1"
                style="text-align: center"
                >获取待演化价值目标</b-button
              >
              <!--              <b-button block  v-b-toggle.my-collapse5 variant="light" :disabled="isDis1">Matching Object Domain Goal Model<span class="caret"></span></b-button>-->
            </b-card-header>
            <b-modal
              id="evolutionValue"
              size="sm"
              title="获取待演化价值目标"
              @ok="evolution"
            >
              <b-form-group :label="$t('CSDM.evolution-choose-before')">
                <b-form-radio-group
                  id="radio-group-1"
                  v-model="valueSelectedBefore"
                  :options="valueOptions"
                  name="radio-options"
                ></b-form-radio-group>
              </b-form-group>
              <b-form-group :label="$t('CSDM.evolution-choose-after')">
                <b-form-radio-group
                  id="radio-group-2"
                  v-model="valueSelectedAfter"
                  :options="valueOptionsCopy"
                  name="radio-options-copy"
                ></b-form-radio-group>
              </b-form-group>
              <div slot="modal-ok">{{ $t("CSDM.evolution") }}</div>
              <div slot="modal-cancel">{{ $t("CSDM.cancel") }}</div>
            </b-modal>
            <!-- <b-collapse
              id="my-collapse5"
              visible
              accordion="my-accordion"
              role="tabpanel"
            >
              <b-card-body>
                <b-button
                  block
                  variant="light"
                  @click="identifyGoalBox"
                  :disabled="isDisable1"
                  v-b-modal="'chooseMixGoal'"
                  >重构主体领域目标模型</b-button
                >
                <b-button
                  block
                  variant="light"
                  @click="importSubModel"
                  :disabled="isDisable2"
                  >匹配客体领域目标模型</b-button
                >
                <b-modal id="chooseMixGoal" size="sm" @ok="chooseMixGoal">
                  <b-form-group label="请选择待融合用户目标">
                    <b-form-select
                      v-model="userGoalKey"
                      :options="mixUserGoals"
                    ></b-form-select>
                  </b-form-group>
                  <b-form-group label="请选择待融合依赖目标">
                    <b-form-select
                      v-model="depdGoalKey"
                      :options="mixDepdGoals"
                    ></b-form-select>
                  </b-form-group>
                  <div slot="modal-ok">{{ $t("CSDM.ok") }}</div>
                  <div slot="modal-cancel">{{ $t("CSDM.cancel") }}</div>
                </b-modal>
              </b-card-body>
            </b-collapse> -->
          </b-card>
          <b-card no-body>
            <b-card-header header-tag="header" class="p-1" role="tab">
              <!--              <b-button block @click="deleteSubModel" variant="light">融合用户目标模型<span class="caret"></span></b-button>-->
              <b-button
                block
                href=""
                variant="light"
                :disabled="isYanDis2"
                v-b-modal="'chooseEvolutionType'"
                style="text-align: center"
                >选择演化模式</b-button
              >
              <!--              <b-button block href="" v-b-toggle.my-collapse6 variant="light" :disabled="isDis2" @click="secondStep">User Actor Goal Convergence<span class="caret"></span></b-button>-->
              <b-modal
                id="chooseEvolutionType"
                size="sm"
                ok-only
                title="选择演化模式"
                @ok="chooseType"
              >
                <b-form-group :label="$t('CSDM.evolution-choose-type')">
                  <b-form-radio-group
                    id="radio-group-choosetype"
                    v-model="valueTypeSelected"
                    :options="valueTypeOptions"
                    name="radio-options"
                  ></b-form-radio-group>
                </b-form-group>
                <div slot="modal-ok">{{ $t("CSDM.ok") }}</div>
              </b-modal>
            </b-card-header>
            <!--            <b-collapse id="my-collapse6" visible accordion="my-accordion" role="tabpanel">-->
            <!--              <b-card-body>-->
            <!--                <b-button block  variant="light" @click="identifySubRedBox" :disabled="isDisable1">融合相似目标</b-button>-->
            <!--                <b-button block  variant="light" @click="generateTemplateFrag" v-b-modal="'tips'" :disabled="isDisable1">融合相似目标</b-button>-->
            <!--                <b-modal id="tips" size="sm" ok-only>请移动合适的片段进行融合</b-modal>-->
            <!--              </b-card-body>-->
            <!--            </b-collapse>-->
          </b-card>
          <b-card no-body v-if="singleType">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button
                block
                href=""
                variant="light"
                v-b-modal="'confirmCharacter'"
                style="text-align: center"
                >确定待演化角色</b-button
              >
              <b-modal
                id="confirmCharacter"
                size="sm"
                ok-only
                title="确定待演化角色"
                @ok="confirmEvolutionCharacter"
              >
                <b-form-group :label="$t('CSDM.evolution-choose-character')">
                  <b-form-radio-group
                    id="radio-group-choosetype"
                    v-model="characterSelected"
                    :options="characterOptions"
                    name="radio-options"
                  ></b-form-radio-group>
                </b-form-group>
                <div slot="modal-ok">{{ $t("CSDM.ok") }}</div>
              </b-modal>
              <!--              <b-button block href="" v-b-toggle.my-collapse7 variant="light" :disabled="isDis3" @click="thirdStep">Dependee Actor Goal Convergence<span class="caret"></span></b-button>-->
            </b-card-header>
          </b-card>
          <b-card no-body v-if="singleType">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button
                block
                href=""
                variant="light"
                style="text-align: center"
                :disabled="isYanSingleDis1"
                @click="confirmInitialTarget"
                >确定初始待演化点目标</b-button
              >
              <!--              <b-button block href="" v-b-toggle.my-collapse7 variant="light" :disabled="isDis3" @click="thirdStep">Dependee Actor Goal Convergence<span class="caret"></span></b-button>-->
            </b-card-header>
          </b-card>
          <b-card no-body v-if="singleType">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button
                block
                href=""
                variant="light"
                style="text-align: center"
                :disabled="isYanSingleDis2"
                @click="confirmTarget"
                v-b-modal="'confirmTarget'"
                >确定待演化目标</b-button
              >
              <b-modal
                id="confirmTarget"
                size="sm"
                ok-only
                title="确定待演化目标"
                @ok="searchConfirm"
              >
                <b-form-group :label="$t('CSDM.evolution-choose-target')">
                  <b-form-input
                    size="sm"
                    class="mr-sm-2"
                    :placeholder="$t('CSDM.search_content')"
                    id="search-content"
                    v-model="search_content"
                    style="margin-bottom:5px"
                    >{{ search_content }}</b-form-input
                  >
                  <b-form-select
                    id="search-type"
                    v-model="search_type"
                    :options="search_types"
                  >
                  </b-form-select>
                </b-form-group>
                <div slot="modal-ok">{{ $t("CSDM.ok") }}</div>
              </b-modal>
              <!--              <b-button block href="" v-b-toggle.my-collapse7 variant="light" :disabled="isDis3" @click="thirdStep">Dependee Actor Goal Convergence<span class="caret"></span></b-button>-->
            </b-card-header>
          </b-card>
          <b-card no-body v-if="singleType">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button
                block
                href=""
                variant="light"
                style="text-align: center"
                :disabled="isYanSingleDis3"
                @click="renewDepend"
                >更新依赖</b-button
              >
              <!--              <b-button block href="" v-b-toggle.my-collapse7 variant="light" :disabled="isDis3" @click="thirdStep">Dependee Actor Goal Convergence<span class="caret"></span></b-button>-->
            </b-card-header>
          </b-card>
          <b-card no-body v-if="singleType">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button
                block
                href=""
                variant="light"
                style="text-align: center"
                :disabled="isYanSingleDis4"
                @click="finishEvolution"
                >完成演化</b-button
              >
              <!--              <b-button block href="" v-b-toggle.my-collapse7 variant="light" :disabled="isDis3" @click="thirdStep">Dependee Actor Goal Convergence<span class="caret"></span></b-button>-->
            </b-card-header>
          </b-card>
          <b-card no-body v-if="multiType">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button
                block
                href=""
                variant="light"
                v-b-modal="'confirmCharacterMulti'"
                style="text-align: center"
                >确定待演化角色</b-button
              >
              <b-modal
                id="confirmCharacterMulti"
                size="sm"
                ok-only
                title="确定待演化角色"
                @ok="confirmEvolutionCharacter"
              >
                <b-form-group :label="$t('CSDM.evolution-choose-character')">
                  <b-form-radio-group
                    id="radio-group-choosetype"
                    v-model="characterSelected"
                    :options="characterOptions"
                    name="radio-options"
                  ></b-form-radio-group>
                </b-form-group>
                <div slot="modal-ok">{{ $t("CSDM.ok") }}</div>
              </b-modal>
              <!--              <b-button block href="" v-b-toggle.my-collapse7 variant="light" :disabled="isDis3" @click="thirdStep">Dependee Actor Goal Convergence<span class="caret"></span></b-button>-->
            </b-card-header>
          </b-card>
          <b-card no-body v-if="multiType">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button
                block
                href=""
                variant="light"
                style="text-align: center"
                :disabled="isYanMultiDis1"
                @click="confirmTarget"
                v-b-modal="'confirmTargetMulti'"
                >确定待演化目标</b-button
              >
              <b-modal
                id="confirmTargetMulti"
                size="sm"
                ok-only
                title="确定待演化目标"
                @ok="searchConfirm"
              >
                <b-form-group :label="$t('CSDM.evolution-choose-target')">
                  <b-form-input
                    size="sm"
                    class="mr-sm-2"
                    :placeholder="$t('CSDM.search_content')"
                    id="search-content"
                    v-model="search_content"
                    style="margin-bottom:5px"
                    >{{ search_content }}</b-form-input
                  >
                  <b-form-select
                    id="search-type"
                    v-model="search_type"
                    :options="search_types"
                  >
                  </b-form-select>
                </b-form-group>
                <div slot="modal-ok">{{ $t("CSDM.ok") }}</div>
              </b-modal>
              <!--              <b-button block href="" v-b-toggle.my-collapse7 variant="light" :disabled="isDis3" @click="thirdStep">Dependee Actor Goal Convergence<span class="caret"></span></b-button>-->
            </b-card-header>
          </b-card>
          <b-card no-body v-if="multiType">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button
                block
                href=""
                variant="light"
                style="text-align: center"
                :disabled="isYanMultiDis2"
                @click="renewDepend"
                >更新依赖</b-button
              >
              <!--              <b-button block href="" v-b-toggle.my-collapse7 variant="light" :disabled="isDis3" @click="thirdStep">Dependee Actor Goal Convergence<span class="caret"></span></b-button>-->
            </b-card-header>
          </b-card>
          <b-card no-body v-if="multiType">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button
                block
                href=""
                variant="light"
                style="text-align: center"
                :disabled="isYanMultiDis3"
                @click="finishEvolution"
                >完成演化</b-button
              >
              <!--              <b-button block href="" v-b-toggle.my-collapse7 variant="light" :disabled="isDis3" @click="thirdStep">Dependee Actor Goal Convergence<span class="caret"></span></b-button>-->
            </b-card-header>
          </b-card>
        </b-list-group>
      </b-col>
<!--      <b-col v-show="isViewSidebarShow" :md="rightSideBar" style="height: 100%">-->
<!--        <button-->
<!--          :title="$t('CSDM.fold-sidebar')"-->
<!--          class="tool-bar-btn"-->
<!--          @click="isViewSidebarShow = !isViewSidebarShow;"-->
<!--        >-->
<!--          <i class="fas fa-bars"></i>-->
<!--        </button>-->
<!--      </b-col>-->
      <b-col v-show="ifGptSidebarShow" :md="rightSideBar" style="height: 100%; overflow-y: auto;">
        <button
          :title="$t('CSDM.fold-sidebar')"
          class="tool-bar-btn"
          @click="ifGptSidebarShow = !ifGptSidebarShow;"
        >
          <i class="fas fa-bars"></i>
        </button>
      </b-col>
      <!--      <b-col>-->
      <!--        <div>-->
      <!--          <b-button-->
      <!--            :class="visible1 ? null : 'collapsed'"-->
      <!--            :aria-expanded="visible1 ? 'true' : 'false'"-->
      <!--            aria-controls="collapse-1"-->
      <!--            @click="visible1 = !visible1"-->
      <!--            variant="primary"-->
      <!--          >-->
      <!--            Toggle Collapse-->
      <!--          </b-button>-->
      <!--          <b-collapse id="collapse-1" v-model="visible1" class="mt-2">-->
      <!--            <b-card>I should start open!</b-card>-->
      <!--          </b-collapse>-->
      <!--        </div>-->
      <!--      </b-col>-->
    </b-row>
    <b-modal id="littleDiagram" size="lg" ref="myModal" @hidden="onModalClose">
      <a href="#">
        <font-awesome-icon
          icon="file"
          v-b-tooltip.hover
          :title="$t('CSDM.report-editor')" />
      </a>
      <div
        ref="LittleDiagramDiv"
        style="height: 600px; width: 700px; background-color: whitesmoke;"
      ></div>
    </b-modal>
<!-- 以下是第二行倒数第二个按钮的功能，生成需求规格说明书，并可以选择保存 -->
    <div id="editor"><!--整个编辑器容器-->
      <div class="row"><!--class="row"是一个Bootstrap的类，用于创建一个新的行。在这个行中可以添加Bootstrap的列元素-->
        <!-- 下边这个span中是标题元素col-md-10是Bootstrap的一个响应式类，意思是在中等设备（像平板电脑）及以上尺寸的设备上，这个元素将会占据10列。 -->
        <span id="editorHandle" class="col-md-10">{{
          $t("CSDM.specification-document")
        }}</span>
        <li>
          <a href="" class="col-md-1" @click.prevent="downContent"
            ><i class="fas fa-download fa-fw" :title="$t('CSDM.export')"></i
          ></a>
        </li>
        <span id="editorClose" class="col-md-1"
          ><a href="javascript:void(0)" id="closeBtn"
            ><i
              class="fas fa-window-close fa-fw"
              :title="$t('CSDM.close')"
            ></i></a
        ></span>
      </div>
      <kind-editor
        ref="kindeditor"
        id="editor-id"
        :content="analyContent"
        @current-content="getMsgFormEditor"
      ></kind-editor>
      <div v-show="ifShowLoading">
        <div class="d-flex align-items-center">
          <strong>Loading...</strong>
          <b-spinner class="ml-auto"></b-spinner>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import writer from "file-writer";
import { go } from "gojs/release/go-module";
import "gojs/extensions/Figures";
import { XML } from "./components/ObjTree.js";
import { Inspector } from "./components/DataInspector";
import KindEditor from "./components/kindEditor";
const objGo = go.GraphObject.make;

export default {
  name: 'CSDM',
  components: { KindEditor },
  data () {
    return {
      isGenerateRequirement: true,
      analyContent: '',
      showMoreMethodsSidebar: false,
      activePanels: [],
      currentZIndex: 10,//实现右侧四个按钮创建的视图点击或拖动动态显示在最上层
      // showAIHelpSidebar: false,
      // showInconsistencyDectionSidebar: false,
      // showRoleSidebar: false,//按角色展示视图的侧边栏的控制变量
      valueSelectedBefore: [],
      valueSelectedAfter: [],
      valueOptions: [
        // { text: "Orange", value: "orange" },
        // { text: "Apple", value: "apple" },
        // { text: "Pineapple", value: "pineapple" },
        // { text: "Grape", value: "grape" }
      ],
      valueOptionsCopy: [],
      valueTypeSelected: [],
      valueTypeOptions: [
        { text: '种群式', value: 'single' },
        { text: '群落式', value: 'multi' }
      ],
      subDomainNodeArray: [],
      subDomainLinkArray: [],
      viewNodeArray: [],
      viewLinkArray: [],
      nodeKeys: [],
      subDomainName: [{name: ''}],
      showSubDomain: false,
      subDomainFields: [
        {
          key: 'name',
          label: '名字',
          stickyColumn: true
        },
        {
          key: 'actions',
          label: '操作',
          stickyColumn: true
        }],
      subDomainIndex: 0,
      singleType: false,
      multiType: false,
      characterSelected: [],
      characterOptions: [],
      msgFormEditor: '',
      navbarFile: '文件',
      navbarSearchContent: '检索字段',
      navbarEdit: '编辑',
      visible1: true,
      curDiagramType: '',
      diagram: { diagramName: '' },
      backupsJson: null,
      includeFlag: '',
      ifChangedView: false,
      originalParent: null,
      originalIndex: -1,
      // 弹窗展示视图的div
      modalContentDiv: null,
      // 添加属性时选择的需要的属性或目标已有的属性
      selectAttribute: [],
      // 每个属性所选择的需求的数组
      attributeData: [],
      // 角色数组
      roleArray: [],
      roleName: '',
      showIfOperationGoal: false,
      currentNode: null,
      isBold: false,
      isItalic: false,
      selectedFont: '',
      selectedSize: '',
      chooseView: '',
      selectedFormat: '',
      myDiagram: null,
      imageData: null,
      myLittleDiagram: null,
      modelType: '',
      relationType: '',
      shownDock: '',
      strokeStyle: '',
      isCrossover: '',
      errors: [],
      imFile: null,
      mixFile: null,
      roleAnalysis: '',
      selectGrid: null,
      selectGrids: [
        { text: 'null', value: null },
        { text: 'small', value: 'small-size' },
        { text: 'normal', value: 'normal-size' },
        { text: 'big', value: 'big-size' },
        { text: 'bigger', value: 'bigger-size' }
      ],
      flag_showgrid: true,
      search_content: '',
      search_type: null,
      search_types: [],
      search_diagram: [],
      search_diagram_json: [], // 渲染模板碎片
      showSideBar: true,
      sideBarmd: '2',
      rightSideBar: '2',
      folderId: null,
      folders: [{ text: '根目录', value: null }],
      hideMapbox: false,
      activeclass: 'hidemapbox',
      chooseText: '请选择模板片段',
      chooseindex: -1,
      btnText: '模板片段',
      btnClick: 'nameBtn',
      projectRoles: [],
      filter: '',
      isMixed: false,
      isYanMixed: false,
      isSubShow: false,
      isViewSidebarShow: false,
      ifGptSidebarShow: false,
      ifShowLoading: false,
      addGoalName: '',
      selectGoalType: '',
      selectDomainType: 'GD',
      showGoalsName: [false, false, false],
      // 非功能性目标
      nonFunctionGoals: [ {
        name: ''
      }
      ],
      operationalGoals: [ {
        name: ''
      }
      ],
      functionGoals: [ {
        name: ''
      }
      ],
      GptFields: [
        {
          key: 'name',
          label: '名字',
          stickyColumn: true
        },
        {
          key: 'actions',
          label: '操作',
          stickyColumn: true
        }],
      mixdiagramName: '',
      mixdiagramSimilarity: '',
      splitLine: 0.0,
      splitLineLocX: 0.0,
      userGoalKey: null,
      mixUserGoals: [],
      subMatchKeys: [],
      depdGoalKey: null,
      mixDepdGoals: [],
      loadGraph: {},
      originGraph: {},
      loadNewNode: {},
      highLightKey: [],
      isDis1: false,
      isYanDis1: false,
      isDis2: true,
      isYanDis2: true,
      isDis3: true,
      // isYanDis3: true,
      isYanSingleDis1: true,
      isYanSingleDis2: true,
      isYanSingleDis3: true,
      isYanSingleDis4: true,
      isYanMultiDis1: true,
      isYanMultiDis2: true,
      isYanMultiDis3: true,
      isDis4: true,
      isDis5: true,
      isDisable1: false,
      isDisable2: true,
      isDisable3: true,
      toggle2: false,
      toggle3: false,
      toggle1: false,
      toggle: false,
      deps: '',
      depo: '',
      newGoals: [],
      yellowGoals: [],
      yelidGoals: [],
      ifShowLoading1:false,
      processItems: [
        { id: 'null', name_1: 'null', name_2: 'null', solution: 'null' }
      ],
      processFields: [
        { key: 'id', label: '目标对', stickyColumn: true },
        {
          key: 'name_1',
          label: '目标1',
          stickyColumn: true
        },
        {
          key: 'name_2',
          label: '目标2',
          stickyColumn: true
        },
        {
          key: 'solution',
          label: '修改建议',
          sortable: false,
          stickyColumn: true
        }
      ],
      fields: [
        { key: 'id', label: '冲突目标对', stickyColumn: true },
        {
          key: 'name_1',
          label: '目标1',
          stickyColumn: true
        },
        {
          key: 'name_2',
          label: '目标2',
          stickyColumn: true
        },
        {
          key: 'type',
          label: '冲突类型',
          sortable: false,
          stickyColumn: true
          // formatter: (value, key, item) => {
          //   switch (item.type) {
          //     case 1:
          //       return '软目标冲突'
          //     case 2:
          //       return '可操作性目标冲突'
          //     case 3:
          //       return '功能性目标冲突'
          //     case 4:
          //       return '非功能性目标冲突'
          //   }
          // }
        },
        {
          key: 'solution',
          label: '修改建议',
          sortable: false,
          stickyColumn: true
          // formatter: (value, key, item) => {
          //   switch (item.solution) {
          //     case 1:
          //       return '删除其中一个冲突目标'
          //     case 2:
          //       return '可操作性目标冲突'
          //     case 3:
          //       return '功能性目标冲突'
          //     case 4:
          //       return '非功能性目标冲突'
          //   }
          // }
        }
      ],
      // conflict: { type: '0', goal_1: '', goal_2: '', solution: '' },
      items: [
        {
          id: 'null',
          type: 'null',
          name_1: 'null',
          name_2: 'null',
          solution: 'null'
        }
        // { id: 2, type: 2, name_1: 'Pay by credit card', name_2: 'Pay by credit card', solution: 1 },
        // { id: 3, type: 4, name_1: 'Convenient payment', name_2: 'Convenient payment', solution: 1 }
      ],
      yeildfields: [
        { key: 'selected', label: '选择' },
        { key: 'Name', label: '名称' },
        { key: 'Type', label: '类型' },
        { key: 'Annotation', label: '注释' }
      ],
      yeilditems: [{}],
      selectedLength: 0,
      selectedNodesKnowledge: []
    };
  },
  computed: {
  //   analyContent: function () {
  //     return `<div>
  //   <div>
  //     <h3>1. 数字服务网络概述</h3>
  //     <p><i><b>说明：</b>概要说明待开发的数字服务网络是什么，开发背景和目的。</i></p>
  //   </div>
  //   <div>
  //     <h3>2. 数字服务网络的角色相关方分析</h3>
  //     <p><i><b>说明：</b>描述数字服务网络构成，厘清涉及的角色（包括个体与组织）。</i></p>
  //     <div>
  //       <h4>2.1 角色描述</h4>
  //       <p><i><b>说明：</b>利用图形或文本描述，包括哪些角色及其之间的拓扑关系。</i></p>
  //       <p><img src="${this.imageData}" style="text-align:center;width:300px;height:300px" alt="建模图" /></p>
  //     </div>
  //     <div>
  //       <h4>2.2 角色分析</h4>
  //       <p><i><b>说明：建议用下表的形式对数字服务网络中涉及的角色进行分析。</b></i></p>
  //       <table border="1" cellpadding="5" cellspacing="5" style="font-size:13px" id="roleAnalysis">
  //         <thead>
  //           <tr><th colspan="4">角色分析表</th></tr>
  //           <tr>
  //             <th>角色类别</th>
  //             <th>角色说明</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //         ${this.roleAnalysis}
  //         </tbody>
  //       </table>
  //     </div>
  //   </div>
  //   <div>
  //     <h3>3. 数字服务网络的功能需求</h3>
  //     <div>
  //       <h4>3.1 典型用户的需求描述</h4>
  //       <p><img src="${this.imageData}" style="text-align:center;width:300px;height:300px" alt="建模图" /></p>
  //       <p><i><b>说明：</b>针对使用数字服务网络的典型用户，描述其与服务交互的典型场景。</i></p>
  //       <table border="1" cellpadding="5" cellspacing="5" style="font-size:13px" id="needAnalysis">
  //           <tr><th colspan="4">典型用户的使用场景</th></tr>
  //           <tr>
  //             <th colspan="1">用户角色</th>
  //             <td colspan="3"></td>
  //           </tr>
  //           <tr>
  //             <th colspan="1">用户背景描述</th>
  //             <td colspan="3"></td>
  //           </tr>
  //           <tr>
  //             <th colspan="1">用户动机或目标</th>
  //             <td colspan="3"></td>
  //           </tr>
  //           <tr>
  //             <th colspan="1">用户偏好</th>
  //             <td colspan="3"></td>
  //           </tr>
  //           <tr>
  //             <th colspan="1">该类型用户的占比</th>
  //             <td colspan="3"></td>
  //           </tr>
  //           <tr>
  //             <th colspan="1">典型场景描述</th>
  //             <td colspan="3"></td>
  //           </tr>
  //       </table>
  //     </div>
  //     <div>
  //       <h4>3.2 数字服务网络的整体业务流程图</h4>
  //       <p><i><b>说明：</b>利用面向数字服务网络建模与分析工具提供数字服务网络的整体业务流程图</i></p>
  //     </div>
  //   </div>
  //   <div>
  //     <h3>4. 数字服务网络的非功能需求</h3>
  //     <div>
  //       <h4>4.1 服务质量需求</h4>
  //       <p><i>提示：可以定量或定性描述，尽可能提供一部分定量描述指标</i></p>
  //       <table border="1" cellpadding="5" cellspacing="5" style="font-size:13px">
  //         <thead>
  //           <tr>
  //             <th>主要的质量属性</th>
  //             <th>详细要求</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           <tr>
  //             <td>正确性</td>
  //             <td></td>
  //           </tr>
  //           <tr>
  //             <td>健壮性</td>
  //             <td></td>
  //           </tr>
  //           <tr>
  //             <td>可靠性</td>
  //             <td></td>
  //           </tr>
  //           <tr>
  //             <td>性能</td>
  //             <td></td>
  //           </tr>
  //           <tr>
  //             <td>易用性</td>
  //             <td></td>
  //           </tr>
  //           <tr>
  //             <td>清晰性</td>
  //             <td></td>
  //           </tr>
  //           <tr>
  //             <td>安全性</td>
  //             <td></td>
  //           </tr>
  //           <tr>
  //             <td>可扩展性</td>
  //             <td></td>
  //           </tr>
  //           <tr>
  //             <td>兼容性</td>
  //             <td></td>
  //           </tr>
  //           <tr>
  //             <td>可移植性</td>
  //             <td></td>
  //           </tr>
  //         </tbody>
  //       </table>
  //     </div>
  //   </div>
  // </div>`;
  //   },
    listenChangemixed () {
      const { isMixed } = this;
      return { isMixed };
    },
    listenChangeyanmixed () {
      const { isYanMixed } = this;
      return { isYanMixed };
    }
  },
  created () {
    if (this.$i18n.locale === 'en') {
      this.chooseText = 'Select The Template of Fragment';
    }
    var mySelf = this;
    const id = this.$route.query.id;
    this.curDiagramType = this.$route.query.diagramType;
    if (this.curDiagramType=='GN'){
      this.modelType='目标建模元素'
      this.relationType='目标模型关系'
    }else{
      this.modelType='价值建模元素'
      this.relationType='价值模型关系'
    }

    // this.modelType=this.curDiagramType
    this.$ajax
      .get('api/diagram', {
        params: {
          diagramId: id
        }
      })
      .then(response => {
        console.log(response);
        const code = response.data.code;
        if (code === 1) {
          this.diagram = response.data.data;
          this.folderId = this.diagram.folderId;
          mySelf.$ajax
            .get('api/folder/roles', {
              params: {
                folderId: mySelf.folderId
              }
            })
            .then(response => {
              console.log(response);
              const code = response.data.code;
              if (code === 1) {
                for (let role of response.data.data) {
                  mySelf.projectRoles.push(role.Name);
                }
              }
            })
            .catch(error => {
              console.log(error);
            });
          mySelf.$ajax
            .get('api/value/' + mySelf.folderId)
            .then(response => {
              console.log(response.data.data);
              for (let graph of response.data.data) {
                mySelf.valueOptions.push({ text: graph.name, value: graph.id });
                mySelf.valueOptionsCopy.push({
                  text: graph.name,
                  value: graph.id
                });
              }
            })
            .catch(error => {
              console.log(error);
            });
        }
      })
      .catch(error => {
        console.log(error);
      });
    this.$ajax
      .get('api/folder')
      .then(response => {
        console.log(response);
        const code = response.data.code;
        if (code === 1) {
          for (let folder of response.data.data) {
            this.folders.push({
              text: folder.folderName,
              value: folder.folderId
            });
          }
        }
      })
      .catch(error => {
        console.log(error);
      });
  },
  mounted() {
    //以下：设置多功能侧边栏可以拖动调整宽度
    const sidebar = document.getElementById('sidebar');
  const handle = sidebar.querySelector('.resize-handle');

  let isDragging = false;
  let startX;

  const handleMouseDown = e => {
    isDragging = true;
    startX = e.pageX;
  };

  const handleMouseUp = () => {
    isDragging = false;
  };

  const handleMouseMove = e => {
    if (!isDragging) return;
    const dx = e.pageX - startX;
    sidebar.style.width = `${sidebar.offsetWidth - dx}px`;
    startX = e.pageX;
  };

  handle.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('mouseup', handleMouseUp);
  document.addEventListener('mousemove', handleMouseMove);
    //以上：设置多功能侧边栏可以拖动调整宽度
    this.makeViewsDraggable();//右侧四个视图可拖动
    const s = document.createElement("script");
    s.type = "text/javascript";
    s.src = "/static/js/haha.js";
    document.body.appendChild(s);

    const mySelf = this;

    mySelf.myDiagram = objGo(go.Diagram, 'myDiagramDiv', {
      initialContentAlignment: go.Spot.Center,
      allowDrop: true,
      // "toolManager.mouseWheelBehavior":go.ToolManager.WheelZoom,//鼠标滚轮可改变图标规模
      'draggingTool.dragsLink': true,
      'draggingTool.isGridSnapEnabled': true,
      'linkingTool.isUnconnectedLinkValid': true,
      'relinkingTool.isUnconnectedLinkValid': true,
      'linkingTool.linkValidation': checkLink,
      'relinkingTool.linkValidation': checkLink,
      'linkingTool.portGravity': 20,
      'relinkingTool.portGravity': 20,
      'relinkingTool.fromHandleArchetype': objGo(go.Shape, 'Diamond', {
        segmentIndex: 0,
        cursor: 'pointer',
        desiredSize: new go.Size(8, 8),
        fill: 'tomato',
        stroke: 'darkred'
      }),
      'relinkingTool.toHandleArchetype': objGo(go.Shape, 'Diamond', {
        segmentIndex: -1,
        cursor: 'pointer',
        desiredSize: new go.Size(8, 8),
        fill: 'darkred',
        stroke: 'tomato'
      }),
      'linkReshapingTool.handleArchetype': objGo(go.Shape, 'Diamond', {
        desiredSize: new go.Size(7, 7),
        fill: 'lightblue',
        stroke: 'deepskyblue'
      }),
      'rotatingTool.snapAngleMultiple': 15,
      'rotatingTool.snapAngleEpsilon': 15,
      'commandHandler.archetypeGroupData': {
        text: 'Group',
        isGroup: true,
        color: 'gray'
      },
      'undoManager.isEnabled': true
    });
    function makePort (name, spot, output, input) {
      // the port is basically just a small transparent square
      return objGo(go.Shape, 'Circle', {
        fill: null, // not seen, by default; set to a translucent gray by showSmallPorts, defined below
        stroke: null,
        desiredSize: new go.Size(7, 7),
        alignment: spot, // align the port on the main Shape
        alignmentFocus: spot, // just inside the Shape
        portId: name, // declare this object to be a "port"
        fromSpot: spot,
        toSpot: spot, // declare where links may connect at this port
        fromLinkable: output,
        toLinkable: input, // declare whether the user may draw links to/from here
        cursor: 'pointer' // show a different cursor to indicate potential link point
      });
    }

    var nodeSelectionAdornmentTemplate = objGo(
      go.Adornment,
      'Auto',
      objGo(go.Shape, {
        fill: null,
        stroke: 'deepskyblue',
        strokeWidth: 1.5,
        strokeDashArray: [4, 2]
      }),
      objGo(go.Placeholder)
    );
    go.Shape.defineFigureGenerator('actorGeometry', function (shape, w, h) {
      let actorGeometry = go.Geometry.parse('F M337.73568 12.27264a191.6416 191.6416 0 0 1 45.40416 5.4784 223.58528 223.58528 0 0 1 42.48064 14.72512 192.06656 192.06656 0 0 1 35.34848 21.04832 127.47776 127.47776 0 0 1 23.99744 23.5776 185.8304 185.8304 0 0 1 30.16192 59.3152 436.13696 436.13696 0 0 1 6.58432 25.30816c-24.27392 9.79968-30.25408 14.91968-46.73024 26.68544-13.74208 12.65152-22.5024 20.71552-33.73056 38.30272-8.45312 10.5728-20.13184 36.8128-24.97024 55.552-2.176 8.2688-9.88672 39.81824-11.35616 58.05056-1.04448 8.97024-4.29056 31.36512-3.24096 63.9488-4.56192 6.0416-7.65952 11.38176-10.37824 17.67424-2.28352 6.71744-3.1744 12.17024-4.21888 20.20864-0.85504 9.856 0.4352 13.89568 3.56864 25.94304 4.06528 12.38016 3.48672 10.9824 9.40544 21.89312 8.57088 12.74368 15.58016 15.1808 21.40672 17.67424 2.53952 9.14432 7.7824 26.91584 7.7824 26.91584s4.864 12.03712 8.7552 21.46304c5.66784 12.12416 11.02848 16.4096 11.02848 16.4096s13.0048 11.77088 24.64256 23.15264c3.36896 4.04992 12.2368 13.99808 12.6464 30.71488 1.29536 13.184 0.9728 10.95168 0.9728 24.4224 0.0512 10.5472-1.00352 11.84768-4.21888 21.04832-3.2 6.78912-5.48864 12.38016-12.6464 20.20352-5.9648 6.73792-13.44 13.62944-25.29792 21.04832-10.42432 6.96832-25.46688 15.60576-48.9728 21.89312-18.3296 4.7104-31.80032 9.56416-53.50912 17.24928-25.25184 10.85952-27.21792 13.14816-41.56416 23.11168-26.21952 20.87424-27.03872 52.35712-26.86464 50.37568s-2.78016 19.01056-3.61984 27.03872c-16.0512-1.024-32.384-2.28864-49.3056-3.82976a2403.26144 2403.26144 0 0 1-64.5376-6.74816 1468.20096 1468.20096 0 0 1-58.37312-7.97696c-17.5104-2.7904-32.10752-5.61152-44.43136-8.43264a58.37312 58.37312 0 0 1-22.70208-8.43264 74.06592 74.06592 0 0 1-12.32384-41.22112 333.73184 333.73184 0 0 1 3.56864-89.216 70.912 70.912 0 0 1 23.3472-47.54432 152.14592 152.14592 0 0 1 45.07648-25.94304 585.8304 585.8304 0 0 1 53.50912-17.24928c17.408-4.59264 33.9456-11.9808 48.9728-21.89312a115.77344 115.77344 0 0 0 25.29792-21.04832 69.05856 69.05856 0 0 0 12.6464-20.20352c2.85184-6.65088 4.28544-13.81888 4.21888-21.04832a344.5248 344.5248 0 0 0-0.9728-24.4224 47.18592 47.18592 0 0 0-12.6464-30.71488 436.51072 436.51072 0 0 0-24.64256-23.15264 51.90656 51.90656 0 0 1-11.02848-16.4096c-2.9184-7.00416-5.8368-14.1568-8.7552-21.46304a843.40736 843.40736 0 0 1-7.7824-26.91584 35.28192 35.28192 0 0 1-11.02336-5.90336 66.01216 66.01216 0 0 1-10.37824-11.77088 70.43072 70.43072 0 0 1-9.40544-21.89312 59.01312 59.01312 0 0 1-3.56864-25.94304 81.92 81.92 0 0 1 4.21888-20.20864 55.90016 55.90016 0 0 1 10.37824-17.67424 421.74976 421.74976 0 0 1 3.24096-63.9488 392.68864 392.68864 0 0 1 11.35616-58.05056 181.0176 181.0176 0 0 1 24.97024-55.552 155.6736 155.6736 0 0 1 33.73056-38.30272 168.15616 168.15616 0 0 1 37.94432-23.15264 157.69088 157.69088 0 0 1 38.91712-11.35104 248.88832 248.88832 0 0 1 37.62176-2.94912v0.13312z m0 0 x' +
        'f M677.78048 170.28096a191.6416 191.6416 0 0 1 45.40416 5.4784 223.58528 223.58528 0 0 1 42.48064 14.72512 192.06656 192.06656 0 0 1 35.34848 21.04832 127.47776 127.47776 0 0 1 23.99744 23.5776 185.8304 185.8304 0 0 1 30.16192 59.3152 433.79712 433.79712 0 0 1 13.29664 61.84448c2.87232 22.58432 4.28032 45.33248 4.21376 68.10112a32.08704 32.08704 0 0 1 8.76032 10.92608c2.24256 4.83328 3.87072 9.91744 4.864 15.14496 1.39776 7.49056 1.61792 15.15008 0.65024 22.70208a92.76928 92.76928 0 0 1-6.8096 28.18048 58.5984 58.5984 0 0 1-11.6736 16.4096 38.12864 38.12864 0 0 1-14.91968 9.2416 839.552 839.552 0 0 1-7.7824 26.91584c-2.92352 7.296-5.84192 14.43328-9.08288 21.46304a58.43968 58.43968 0 0 1-11.67872 16.4096 820.1472 820.1472 0 0 0-24.64256 21.46816 52.22912 52.22912 0 0 0-12.6464 29.87008 113.00864 113.00864 0 0 0-1.62304 25.6512 77.91104 77.91104 0 0 0 6.8096 25.94816 81.54112 81.54112 0 0 0 18.16064 24.8064 114.50368 114.50368 0 0 0 34.70336 21.04832 362.74176 362.74176 0 0 0 43.13088 15.14496 467.15904 467.15904 0 0 1 45.40416 15.56992 161.49504 161.49504 0 0 1 39.23968 21.89312 70.97856 70.97856 0 0 1 24.32512 35.67104 188.61056 188.61056 0 0 1 5.8368 33.23904c1.29536 13.184 1.9456 26.51648 1.9456 39.98208a232.2432 232.2432 0 0 1-2.9184 37.87776 75.25376 75.25376 0 0 1-8.10496 26.91584 46.53568 46.53568 0 0 1-22.70208 11.776 439.97184 439.97184 0 0 1-45.7216 11.35104c-18.48832 3.6352-38.58944 6.87104-61.29664 9.728a1752.58624 1752.58624 0 0 1-67.45088 7.168 2052.4544 2052.4544 0 0 1-65.5104 4.63872c-20.75648 1.13152-38.91712 1.68448-54.15936 1.68448-15.24224 0-33.08032-0.55296-53.50912-1.68448-20.43392-1.13664-41.1904-2.6624-62.91456-4.63872a2403.26144 2403.26144 0 0 1-64.5376-6.74816 1468.20096 1468.20096 0 0 1-58.37312-7.97696c-17.5104-2.7904-32.10752-5.61152-44.43136-8.43264a58.37312 58.37312 0 0 1-22.70208-8.43264 74.06592 74.06592 0 0 1-12.32384-41.22112 333.73184 333.73184 0 0 1 3.56864-89.216 70.912 70.912 0 0 1 23.3472-47.54432 152.14592 152.14592 0 0 1 45.07648-25.94304 585.8304 585.8304 0 0 1 53.50912-17.24928c17.408-4.59264 33.9456-11.9808 48.9728-21.89312a115.77344 115.77344 0 0 0 25.29792-21.04832 69.05856 69.05856 0 0 0 12.6464-20.20352c2.85184-6.65088 4.28544-13.81888 4.21888-21.04832a344.5248 344.5248 0 0 0-0.9728-24.4224 47.18592 47.18592 0 0 0-12.6464-30.71488 436.51072 436.51072 0 0 0-24.64256-23.15264 51.90656 51.90656 0 0 1-11.02848-16.4096c-2.9184-7.00416-5.8368-14.1568-8.7552-21.46304a843.40736 843.40736 0 0 1-7.7824-26.91584 35.28192 35.28192 0 0 1-11.02336-5.90336 66.01216 66.01216 0 0 1-10.37824-11.77088 70.43072 70.43072 0 0 1-9.40544-21.89312 59.01312 59.01312 0 0 1-3.56864-25.94304 81.92 81.92 0 0 1 4.21888-20.20864 55.90016 55.90016 0 0 1 10.37824-17.67424 421.74976 421.74976 0 0 1 3.24096-63.9488 392.68864 392.68864 0 0 1 11.35616-58.05056 181.0176 181.0176 0 0 1 24.97024-55.552 155.6736 155.6736 0 0 1 33.73056-38.30272 168.15616 168.15616 0 0 1 37.94432-23.15264 157.69088 157.69088 0 0 1 38.91712-11.35104 248.88832 248.88832 0 0 1 37.62176-2.94912v0.14336z m0 0z');
       actorGeometry.scale(w / actorGeometry.bounds.width, h / actorGeometry.bounds.height);
      return actorGeometry;
    });
    go.Shape.defineFigureGenerator('LoopLimit', function (shape, w, h) {
      let LoopLimit = go.Geometry.parse("F M675.9 107.2H348.1c-42.9 0-82.5 22.9-104 60.1L80 452.1c-21.4 37.1-21.4 82.7 0 119.8l164.1 284.8c21.4 37.2 61.1 60.1 104 60.1h327.8c42.9 0 82.5-22.9 104-60.1L944 571.9c21.4-37.1 21.4-82.7 0-119.8L779.9 167.3c-21.4-37.1-61.1-60.1-104-60.1z");
      LoopLimit.scale(w / LoopLimit.bounds.width, h / LoopLimit.bounds.height);
      return LoopLimit;
    });
    // "
    var nodeResizeAdornmentTemplate = objGo(
      go.Adornment,
      'Spot',
      { locationSpot: go.Spot.Right },
      objGo(go.Placeholder),
      objGo(go.Shape, {
        alignment: go.Spot.TopLeft,
        cursor: 'nw-resize',
        desiredSize: new go.Size(6, 6),
        fill: 'lightblue',
        stroke: 'deepskyblue'
      }),
      objGo(go.Shape, {
        alignment: go.Spot.Top,
        cursor: 'n-resize',
        desiredSize: new go.Size(6, 6),
        fill: 'lightblue',
        stroke: 'deepskyblue'
      }),
      objGo(go.Shape, {
        alignment: go.Spot.TopRight,
        cursor: 'ne-resize',
        desiredSize: new go.Size(6, 6),
        fill: 'lightblue',
        stroke: 'deepskyblue'
      }),
      objGo(go.Shape, {
        alignment: go.Spot.Left,
        cursor: 'w-resize',
        desiredSize: new go.Size(6, 6),
        fill: 'lightblue',
        stroke: 'deepskyblue'
      }),
      objGo(go.Shape, {
        alignment: go.Spot.Right,
        cursor: 'e-resize',
        desiredSize: new go.Size(6, 6),
        fill: 'lightblue',
        stroke: 'deepskyblue'
      }),
      objGo(go.Shape, {
        alignment: go.Spot.BottomLeft,
        cursor: 'se-resize',
        desiredSize: new go.Size(6, 6),
        fill: 'lightblue',
        stroke: 'deepskyblue'
      }),
      objGo(go.Shape, {
        alignment: go.Spot.Bottom,
        cursor: 's-resize',
        desiredSize: new go.Size(6, 6),
        fill: 'lightblue',
        stroke: 'deepskyblue'
      }),
      objGo(go.Shape, {
        alignment: go.Spot.BottomRight,
        cursor: 'sw-resize',
        desiredSize: new go.Size(6, 6),
        fill: 'lightblue',
        stroke: 'deepskyblue'
      })
    );

    const nodeRotateAdornmentTemplate = objGo(
      go.Adornment,
      { locationSpot: go.Spot.Center, locationObjectName: 'CIRCLE' },
      objGo(go.Shape, 'Circle', {
        name: 'CIRCLE',
        cursor: 'pointer',
        desiredSize: new go.Size(7, 7),
        fill: 'lightblue',
        stroke: 'deepskyblue'
      }),
      objGo(go.Shape, {
        geometryString: 'M0 3.5 L-50 3.5',
        isGeometryPositioned: true,
        stroke: 'deepskyblue',
        strokeWidth: 1.5,
        strokeDashArray: [4, 2]
      })
    );
    // eslint-disable-next-line no-unused-vars
    // var chooseAttributeInspector = new Inspector(
    //   'chooseAttributeForGoal',
    //   mySelf.myDiagram,
    //   {}
    // );
    // eslint-disable-next-line no-unused-vars
    var myOwnPropertiesInspector = new Inspector(
      'attributeTable',
      mySelf.myDiagram,
      {
        includesOwnProperties: false,
        properties: {
          from: { readOnly: true, show: Inspector.showIfLink, name: '始' },
          to: { readOnly: true, show: Inspector.showIfLink, name: '终' },
          Linktype: {
            readOnly: true,
            show: Inspector.showIfLink,
            name: '连接类型'
          },
          Type: { readOnly: true, show: Inspector.showIfNode, name: '类型' },
          Name: { show: Inspector.showIfNode, name: '名称' },
          Annotation: { show: Inspector.showIfNode, name: '注释' },
          Degree: { show: Inspector.showIfNonFunGoal, name: '等级' },
          Operation: { show: Inspector.showIfFunGoal, name: '操作' },
          Object: { show: Inspector.showIfFunGoal, name: '对象' },
          DeployedPosition: {
            readOnly: true,
            show: Inspector.showIfRole,
            // type: 'select',
            // choices: function (node, propName) {
            //   return ['云', '边', '端'];
            // },
            name: '云边端'
          },
          ResponseTime: {
            show: Inspector.showIfPresent,
            type: 'select',
            choices: function (node, propName) {
              return ['慢(100~500ms)', '较慢(50~100ms)', '较快(10~50ms)'];
            },
            name: '响应时间'
          },
          NetworkConnection: {
            show: Inspector.showIfPresent,
            type: 'select',
            choices: function (node, propName) {
              return ['无需网络连接', '网络连接需求较少', '网络连接需求大量'];
            },
            name: '网络连接'
          },
          DataPrivacy: {
            show: Inspector.showIfPresent,
            type: 'checkbox',
            // choices: function (node, propName) {
            //   return [true, false];
            // },
            name: '数据隐私'
          },
          ComputingResource: {
            show: Inspector.showIfPresent,
            type: 'select',
            choices: function (node, propName) {
              return ['计算资源需求较少', '计算资源需求适中', '计算资源需求大量'];
            },
            name: '计算资源'
          },
          DeviceCompatibility: {
            show: Inspector.showIfPresent,
            type: 'checkbox',
            name: '设备兼容'
          },
          isNFR: {
            show: Inspector.showIfNonFunGoal,
            type: 'select',
            choices: function (node, propName) {
              return ['Yes', 'No'];
            },
            name: '属于非功能需求'
          },
          Signal: {
            show: Inspector.showIfNFR,
            name: '符号',
            type: 'select',
            choices: function (node, propName) {
              return ['No', '>', '<', '>=', '<='];
            }
          },
          Value: {
            show: Inspector.showIfNFR,
            name: '值',
            type: 'number',
            value: 0
          },
          Unit: {
            show: Inspector.showIfNFR,
            name: ' 单位',
            type: 'select',
            choices: function (node, propName) {
              return ['No', '%'];
            }
          },
          'Related Role': {
            name: '关联规则',
            show: function (node) {
              return node.Type !== undefined && node.Type.endsWith('性目标>>');
            },
            type: 'select',
            choices: function (node, propName) {
              return mySelf.projectRoles;
            }
          }
        },
        propertyModified: function (name, val) {
          if (name === 'from') name = '始';
        }
      }
    );

    // Define the appearance and behavior for Nodes:
    // First, define the shared context menu for all Nodes, Links, and Groups.

    // To simplify this code we define a function for creating a context menu button:
    function makeButton (text, action, visiblePredicate) {
      return objGo(
        'ContextMenuButton',
        objGo(go.TextBlock, text),
        { click: action },
        // don't bother with binding GraphObject.visible if there's no predicate
        visiblePredicate
          ? new go.Binding('visible', '', function (o, e) {
            return o.diagram ? visiblePredicate(o, e) : false;
          }).ofObject()
          : {}
      );
    }
    mySelf.myDiagram.addDiagramListener('ChangedSelection', function (e, obj) {
      mySelf.getNodes();
    });
    // a context menu is an Adornment with a bunch of buttons in them
    var myContextMenu = objGo(
      'ContextMenu',
      makeButton(
        'Cut',
        function (e, obj) {
          e.diagram.commandHandler.cutSelection();
        },
        function (o) {
          return o.diagram.commandHandler.canCutSelection();
        }
      ),
      makeButton(
        'Copy',
        function (e, obj) {
          e.diagram.commandHandler.copySelection();
        },
        function (o) {
          return o.diagram.commandHandler.canCopySelection();
        }
      ),
      makeButton(
        'Paste',
        function (e, obj) {
          e.diagram.commandHandler.pasteSelection(
            e.diagram.lastInput.documentPoint
          );
        },
        function (o) {
          return o.diagram.commandHandler.canPasteSelection();
        }
      ),
      makeButton(
        'Delete',
        function (e, obj) {
          e.diagram.commandHandler.deleteSelection();
        },
        function (o) {
          return o.diagram.commandHandler.canDeleteSelection();
        }
      ),
      makeButton(
        'Undo',
        function (e, obj) {
          e.diagram.commandHandler.undo();
        },
        function (o) {
          return o.diagram.commandHandler.canUndo();
        }
      ),
      makeButton(
        'Redo',
        function (e, obj) {
          e.diagram.commandHandler.redo();
        },
        function (o) {
          return o.diagram.commandHandler.canRedo();
        }
      ),
      makeButton(
        'Group',
        function (e, obj) {
          e.diagram.commandHandler.groupSelection();
        },
        function (o) {
          return o.diagram.commandHandler.canGroupSelection();
        }
      ),
      makeButton(
        'Ungroup',
        function (e, obj) {
          e.diagram.commandHandler.ungroupSelection();
        },
        function (o) {
          return o.diagram.commandHandler.canUngroupSelection();
        }
      ),
      // makeButton(
      //   'ViewByRole',
      //   function (e, obj) {
      //     mySelf.includeFlag = false;
      //     mySelf.myDiagram.selection.each(nodeOrLink => {
      //       if (nodeOrLink instanceof go.Group) { // 获取选中节点
      //         mySelf.getViewByRole(nodeOrLink.data.key);
      //       }
      //     })
      //   },
      //   function (o) {
      //     return o.diagram.commandHandler.canUngroupSelection();
      //   }
      // ),
      // makeButton(
      //   'ViewByRoleWithRelevant',
      //   function (e, obj) {
      //     mySelf.includeFlag = true;
      //     mySelf.myDiagram.selection.each(nodeOrLink => {
      //       if (nodeOrLink instanceof go.Group) { // 获取选中节点
      //         mySelf.getViewByRole(nodeOrLink.data.key);
      //       }
      //     })
      //   },
      //   function (o) {
      //     return o.diagram.commandHandler.canUngroupSelection();
      //   }
      // ),
      // makeButton(
      //   'backWhole',
      //   function (e, obj) {
      //     mySelf.includeFlag = false;
      //     mySelf.ifChangedView = false;
      //     mySelf.loadWholeView(mySelf.backupsJson)
      //   },
      //   function (o) {
      //     return mySelf.ifChangedView;
      //   }
      // ),
      makeButton(
        'SetNFR',
        function (e, obj) {
          let node = obj.part.adornedObject;
          node.data.isNFR = 'No';
        },
        function (obj) {
          let node = obj.part.adornedObject;
          if (
            node.data.Type === '<<非功能性目标>>' &&
            node.data.isNFR === 'Yes'
          ) {
            return true;
          } else {
            return false;
          }
        }
      ),
      makeButton(
        'UnsetNFR',
        function (e, obj) {
          let node = obj.part.adornedObject;
          node.data.isNFR = 'Yes';
        },
        function (obj) {
          let node = obj.part.adornedObject;
          if (
            node.data.Type === '<<非功能性目标>>' &&
            node.data.isNFR === 'No'
          ) {
            return true;
          } else {
            return false;
          }
        }
      )
    );

    /* 模型鹰眼（总览） */
    objGo(
      go.Overview,
      'diagramOverview', // the HTML DIV element for the Overview
      { observed: mySelf.myDiagram, contentAlignment: go.Spot.Center }
    ); // tell it which Diagram to show and pan
    /* 将自定义的myContextMenu赋值为模型的右键菜单 */
    mySelf.myDiagram.contextMenu = myContextMenu;
    var tooltiptemplateNode = objGo(
      'ToolTip',
      objGo(go.TextBlock, { margin: 4 }, new go.Binding('text', 'Type'))
    );
    mySelf.myDiagram.nodeTemplate = objGo(
      go.Node,
      'Auto', // 最底层Node
      { toolTip: tooltiptemplateNode },
      { contextMenu: myContextMenu },
      { locationSpot: go.Spot.Center },
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(
        go.Point.stringify
      ),
      {
        selectable: true,
        selectionObjectName: 'PANEL',
        selectionAdornmentTemplate: nodeSelectionAdornmentTemplate,
        selectionChanged: onSelectionChanged
      },
      {
        rotatable: true,
        rotateObjectName: 'MAINPANEL',
        rotateAdornmentTemplate: nodeRotateAdornmentTemplate
      },
      {
        resizable: true,
        resizeObjectName: 'PANEL',
        resizeAdornmentTemplate: nodeResizeAdornmentTemplate
      },
      new go.Binding('angle').makeTwoWay(),
      objGo(
        go.Panel,
        'Vertical', // Vertical属性值定义内部元素垂直排列，包含用以定义Spot的面板和Type文本框
        { name: 'MAINPANEL' },
        objGo(
          go.Panel,
          'Spot', // Spot属性值定义元素四边Spot
          objGo(
            go.Panel,
            'Auto', // Auto属性值定义自适应包含内部元素，包含shape和用户可编辑文本框
            { name: 'PANEL' },
            new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(
              go.Size.stringify
            ),
            objGo(
              go.Shape,
              'Rectangle', // shape
              { name: 'SHAPE' },
              {
                portId: '',
                fromLinkable: true,
                toLinkable: true,
                cursor: 'pointer'
              },
              // {desiredSize: new go.Size(30, 30)},
              // new go.Binding('desiredSize', 'size'),
              new go.Binding('figure'),
              // new go.Binding('geometry'),
              new go.Binding('fill'),
              new go.Binding('stroke'),
              new go.Binding('strokeWidth'),
              new go.Binding('strokeDashArray')
            ),
            objGo(
              go.TextBlock, // 用户可编辑文本框
              { name: 'TEXTBLOCK' },
              { margin: 1 },
              {
                minSize: new go.Size(30, 30),
                // maxSize: new go.Size(80, NaN),
                wrap: go.TextBlock.WrapFit,
                editable: false,
                isMultiline: true
              },
              new go.Binding('minSize'),
              new go.Binding('text', 'Name'),
              new go.Binding('isUnderline'),
              new go.Binding('isStrikethrough'),
              new go.Binding('font'),
              new go.Binding('textAlign')
            )
          ),
          makePort('T', go.Spot.Top, true, true),
          makePort('L', go.Spot.Left, true, true),
          makePort('R', go.Spot.Right, true, true),
          makePort('B', go.Spot.Bottom, true, true)
        ),
        objGo(
          go.TextBlock,
          { maxSize: new go.Size(160, NaN) },
          {
            font: 'bold 9pt Roboto,sans-serif',
            editable: false,
            wrap: go.TextBlock.WrapFit
          },
          new go.Binding('text', 'Type')
        )
      ),

      {
        // handle mouse enter/leave events to show/hide the ports
        mouseEnter: function (e, node) {
          showSmallPorts(node, true);
        },
        mouseLeave: function (e, node) {
          showSmallPorts(node, false);
        }
      }
    );

    function showSmallPorts (node, show) {
      node.ports.each(function (port) {
        if (port.portId !== '') {
          // don't change the default port, which is the big shape
          port.fill = show ? 'rgba(0,0,0,.3)' : null;
        }
      });
    }
    /* 获取当前选中的节点 */
    /* 网格定义 */
    var smallGrid = objGo(
      go.Panel,
      'Grid',
      objGo(go.Shape, 'LineH', { stroke: 'lightgray', strokeWidth: 0.5 }),
      objGo(go.Shape, 'LineH', {
        stroke: 'gray',
        strokeWidth: 0.5,
        interval: 3
      }),
      objGo(go.Shape, 'LineV', { stroke: 'lightgray', strokeWidth: 0.5 }),
      objGo(go.Shape, 'LineV', {
        stroke: 'gray',
        strokeWidth: 0.5,
        interval: 3
      })
    );
    var normalGrid = objGo(
      go.Panel,
      'Grid',
      objGo(go.Shape, 'LineH', { stroke: 'lightgray', strokeWidth: 0.5 }),
      objGo(go.Shape, 'LineH', {
        stroke: 'gray',
        strokeWidth: 0.5,
        interval: 8
      }),
      objGo(go.Shape, 'LineV', { stroke: 'lightgray', strokeWidth: 0.5 }),
      objGo(go.Shape, 'LineV', {
        stroke: 'gray',
        strokeWidth: 0.5,
        interval: 8
      })
    );
    var bigGrid = objGo(
      go.Panel,
      'Grid',
      objGo(go.Shape, 'LineH', { stroke: 'lightgray', strokeWidth: 0.5 }),
      objGo(go.Shape, 'LineH', {
        stroke: 'gray',
        strokeWidth: 0.5,
        interval: 14
      }),
      objGo(go.Shape, 'LineV', { stroke: 'lightgray', strokeWidth: 0.5 }),
      objGo(go.Shape, 'LineV', {
        stroke: 'gray',
        strokeWidth: 0.5,
        interval: 14
      })
    );
    var biggerGrid = objGo(
      go.Panel,
      'Grid',
      objGo(go.Shape, 'LineH', { stroke: 'lightgray', strokeWidth: 0.5 }),
      objGo(go.Shape, 'LineH', {
        stroke: 'gray',
        strokeWidth: 0.5,
        interval: 22
      }),
      objGo(go.Shape, 'LineV', { stroke: 'lightgray', strokeWidth: 0.5 }),
      objGo(go.Shape, 'LineV', {
        stroke: 'gray',
        strokeWidth: 0.5,
        interval: 22
      })
    );
    var myGrid = new Map();
    myGrid.set('small-size', smallGrid);
    myGrid.set('normal-size', normalGrid);
    myGrid.set('big-size', bigGrid);
    myGrid.set('bigger-size', biggerGrid);
    this.Grids = myGrid;
    /* 链接模板定义 */
    const linkSelectionAdornmentTemplate = objGo(
      go.Adornment,
      'Link',
      objGo(
        go.Shape,
        // isPanelMain declares that this Shape shares the Link.geometry
        { isPanelMain: true, fill: null, stroke: 'deepskyblue', strokeWidth: 0 }
      ) // use selection object's strokeWidth
    );

    mySelf.myDiagram.linkTemplate = objGo(
      go.Link, // the whole link panel
      {
        selectable: true,
        selectionAdornmentTemplate: linkSelectionAdornmentTemplate,
        relinkableFrom: true,
        relinkableTo: true,
        reshapable: true,
        curve: go.Link.JumpOver,
        corner: 5,
        toShortLength: 4,
        routing: go.Link.AvoidsNodes
      },
      new go.Binding('points').makeTwoWay(),
      objGo(
        go.Shape, // the link path shape
        {
          isPanelMain: true,
          strokeWidth: 2,
          fill: 'transparent',
          cursor: 'pointer'
        },

        new go.Binding('strokeWidth'),
        new go.Binding('strokeDashArray', 'strokeDashArray')
      ),
      objGo(
        go.Shape, // the from-arrowhead
        new go.Binding('fromArrow', 'fromArrow'),
        new go.Binding('fill', 'fromArrowFill'),
        { fromArrow: '', strokeWidth: 1 }
      ),
      objGo(
        go.Shape, // the to-arrowhead
        new go.Binding('toArrow', 'toArrow'),
        new go.Binding('fill', 'toArrowFill'),
        { toArrow: 'SidewaysV', strokeWidth: 1 }
      ),
      objGo(
        go.Panel,
        'Auto',
        { segmentIndex: 0 },
        {
          segmentOffset: new go.Point(NaN, NaN),
          segmentOrientation: go.Link.OrientUpright
        },
        objGo(
          go.Shape,
          'RoundedRectangle', // the link shape
          new go.Binding('visible', 'isSelected').ofObject(),
          { fill: '#eee', stroke: null }
        ),
        objGo(
          go.TextBlock,
          {
            font: 'bold 9pt Roboto,sans-serif',
            stroke: '#000000',
            margin: 2,
            editable: true
          },
          new go.Binding('text', 'text1')
        )
      ),
      objGo(
        go.Panel,
        'Auto',
        { segmentIndex: -1 },
        {
          segmentOffset: new go.Point(NaN, NaN),
          segmentOrientation: go.Link.OrientUpright
        },
        objGo(
          go.Shape,
          'RoundedRectangle', // the link shape
          new go.Binding('visible', 'isSelected').ofObject(),
          { fill: '#eee', stroke: null }
        ),
        objGo(
          go.TextBlock,
          {
            font: 'bold 9pt Roboto,sans-serif',
            stroke: '#000000',
            margin: 2,
            editable: true
          },
          new go.Binding('text', 'text2')
        )
      ),
      { contextMenu: myContextMenu }
    );
    // Groups consist of a title in the color given by the group node data
    // above a translucent gray rectangle surrounding the member parts
    /* mySelf.myDiagram.groupTemplate =
      objGo(go.Group, 'Vertical',
        objGo(go.Panel, 'Auto',
          objGo(go.Shape, 'RoundedRectangle', // surrounds the Placeholder
            {name: 'SHAPE'},
            {portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer'},
            new go.Binding('figure'),
            new go.Binding('fill'),
            new go.Binding('stroke'),
            new go.Binding('strokeWidth'),
            new go.Binding('strokeDashArray')),
          objGo(go.Placeholder, // represents the area of all member parts,
            { padding: 5
            }) // with some extra padding around them
        ),
        objGo(go.TextBlock, // 用户可编辑文本框
          {name: 'TEXTBLOCK'},
          {margin: 10},
          {minSize: new go.Size(30, 30),
            maxSize: new go.Size(160, NaN),
            wrap: go.TextBlock.WrapFit,
            editable: false,
            isMultiline: true},
          new go.Binding('minSize'),
          new go.Binding('text', 'Name'),
          new go.Binding('isUnderline'),
          new go.Binding('isStrikethrough'),
          new go.Binding('font'),
          new go.Binding('textAlign')
        )
      ) */
    mySelf.myDiagram.groupTemplate = objGo(
      go.Group,
      'Vertical',
      { contextMenu: myContextMenu },
      { selectionObjectName: 'PANEL', ungroupable: true },
      { selectionChanged: onSelectionChanged },
      objGo(
        go.TextBlock,
        { name: 'TEXTBLOCK' },
        {
          font: '10pt Times New Roman',
          isMultiline: false,
          editable: false,
          text: ''
        },
        new go.Binding('text', 'Name'),
        new go.Binding('font'),
        new go.Binding('isUnderline'),
        new go.Binding('isStrikethrough'),
        new go.Binding('textAlign')
      ),

      objGo(
        go.Panel,
        'Auto',
        { name: 'PANEL', cursor: 'pointer' },
        objGo(
          go.Shape,
          'RoundedRectangle', // surrounds the Placeholder
          { name: 'SHAPE' },
          {
            stroke: '#000000',
            strokeDashArray: null,
            strokeWidth: 2,
            portId: '',
            fromLinkable: true,
            toLinkable: true,
            cursor: 'pointer',
            fill: 'transparent'
          },
          new go.Binding('figure'),
          // objGo(go.Shape, 'Rectangle',
          // {name: 'SHAPE'},
          // { stroke: '#000000', strokeDashArray: null, strokeWidth: 2, portId: '', cursor: 'pointer', fromLinkable: true, toLinkable: true, fill: 'transparent' },
          new go.Binding('fill'),
          new go.Binding('stroke'),
          new go.Binding('strokeWidth'),
          new go.Binding('strokeDashArray')
        ),
        objGo(go.Placeholder, { margin: 10, background: 'transparent' })
      )
    );
    // this function is used to highlight a Group that the selection may be dropped into
    function highlightGroup (e, grp, show) {
      if (!grp) return;
      e.handled = true;
      if (show) {
        // cannot depend on the grp.diagram.selection in the case of external drag-and-drops;
        // instead depend on the DraggingTool.draggedParts or .copiedParts
        var tool = grp.diagram.toolManager.draggingTool;
        var map = tool.draggedParts || tool.copiedParts; // this is a Map
        // now we can check to see if the Group will accept membership of the dragged Parts
        if (grp.canAddMembers(map.toKeySet())) {
          grp.isHighlighted = true;
          return;
        }
      }
      grp.isHighlighted = false;
    }

    // Upon a drop onto a Group, we try to add the selection as members of the Group.
    // Upon a drop onto the background, or onto a top-level Node, make selection top-level.
    // If this is OK, we're done; otherwise we cancel the operation to rollback everything.
    function finishDrop (e, grp) {
      var ok =
        grp !== null
          ? grp.addMembers(grp.diagram.selection, true)
          : e.diagram.commandHandler.addTopLevelParts(
            e.diagram.selection,
            true
          );
      if (!ok) e.diagram.currentTool.doCancel();
    }
    mySelf.myDiagram.groupTemplateMap.add(
      'OfNodes',
      objGo(
        go.Group,
        'Auto',
        { toolTip: tooltiptemplateNode },
        { contextMenu: myContextMenu },
        {
          background: 'transparent',
          ungroupable: true,
          // highlight when dragging into the Group
          mouseDragEnter: function (e, grp, prev) {
            highlightGroup(e, grp, true);
          },
          mouseDragLeave: function (e, grp, next) {
            highlightGroup(e, grp, false);
          },
          computesBoundsAfterDrag: true,
          // when the selection is dropped into a Group, add the selected Parts into that Group;
          // if it fails, cancel the tool, rolling back any changes
          mouseDrop: finishDrop,
          handlesDragDropForMembers: true // don't need to define handlers on member Nodes and Links
          // Groups containing Nodes lay out their members vertically
          // layout:
          //   objGo(go.GridLayout,
          //     {
          //       wrappingColumn: 1,
          //       alignment: go.GridLayout.Position,
          //       cellSize: new go.Size(1, 1),
          //       spacing: new go.Size(4, 4)
          //     })
        },
        new go.Binding('background', 'isHighlighted', function (h) {
          return h ? 'rgba(255,0,0,0.2)' : 'transparent';
        }).ofObject(),
        objGo(
          go.Shape,
          'RoundedRectangle',
          { name: 'SHAPE' },
          {
            stroke: '#33D3E5',
            strokeDashArray: null,
            strokeWidth: 2,
            portId: '',
            fromLinkable: true,
            toLinkable: true,
            cursor: 'pointer',
            fill: 'transparent'
          },
          new go.Binding('figure'),
          // new go.Binding('fill'),
          new go.Binding('stroke'),
          new go.Binding('strokeWidth'),
          new go.Binding('strokeDashArray')
        ),
        // { fill: null, stroke: '#000000', strokeWidth: 2 }),
        objGo(
          go.Panel,
          'Vertical', // title above Placeholder
          objGo(
            go.Panel,
            'Horizontal', // button next to TextBlock
            { stretch: go.GraphObject.Horizontal, background: null },
            objGo('SubGraphExpanderButton', {
              alignment: go.Spot.Right,
              margin: 5
            }),
            objGo(go.Shape, 'actorGeometry', {
              fill: '#Feee7d',
              stroke: '#CDAA7D',
              width: 20,
              height: 20,
              alignment: go.Spot.Right,
              margin: 5
            }),
            objGo(
              go.TextBlock,
              { name: 'TEXTBLOCK' },
              {
                alignment: go.Spot.Left,
                editable: false,
                isMultiline: false,
                margin: 5,
                font: '10pt Times New Roman',
                text: ''
              },
              new go.Binding('text', 'Name'),
              new go.Binding('font'),
              new go.Binding('isUnderline'),
              new go.Binding('isStrikethrough'),
              new go.Binding('textAlign')
            )
          ), // end Horizontal Panel
          objGo(go.Placeholder, { margin: 10, background: 'transparent' })
          // objGo(go.TextBlock,
          //   {maxSize: new go.Size(160, NaN)},
          //   {font: 'bold 9pt Roboto,sans-serif', editable: false, wrap: go.TextBlock.WrapFit},
          //   new go.Binding('text', 'Type')
          // )
        ) // end Vertical Panel
      )
    ); // end Group and call to add to template Map
    mySelf.myDiagram.addModelChangedListener(function (evt) {
      if (evt.isTransactionFinished) {
        mySelf.save();
      }
    });

    // check link(两节点之间若能存在某种关系则对应连线有且仅有一)
    function checkLink (fn, fp, tn, tp, link) {
      let ie;
      if (!fn || !tn) {
        return true;
      }
      ie = fn.findLinksBetween(tn).all(function (l) {
        if (
          l.data.Linktype === link.data.Linktype &&
          l.data.to === tn.data.key &&
          l.data.from === fn.data.key &&
          l.data.__gohashid !== link.data.__gohashid
        ) {
          return false;
        }
        return true;
      });
      return ie;
    }

    var tooltiptemplate = objGo(
      'ToolTip',
      objGo(go.TextBlock, { margin: 4 }, new go.Binding('text', 'Linktype'))
    );
    // var tooltiptemplateNode =
    //   objGo('ToolTip',
    //     objGo(go.TextBlock,
    //       {margin: 4},
    //       new go.Binding('text', 'Type')
    //     )
    //   )
    // objGo(go.Palette, 'myPaletteDiv3', {
    //   maxSelectionCount: 1,
    //   nodeTemplateMap: this.myDiagram.nodeTemplateMap,
    //   model: new go.GraphLinksModel([
    //     // specify the contents of the Palette
    //     // { figure: "Rectangle", Name:"",minSize:new go.Size(20,20),fill:"#ffffff",stroke:"#000000",strokeWidth:2,font:"10pt Times New Roman",isUnderline:false,isStrikethrough:false,textAlign:"center",strokeDashArray:null },
    //     {
    //       figure: 'RoundedRectangle',
    //       Name: '',
    //       minSize: new go.Size(20, 20),
    //       fill: '#ffffff',
    //       stroke: '#000000',
    //       strokeWidth: 2,
    //       font: '10pt Times New Roman',
    //       isUnderline: false,
    //       isStrikethrough: false,
    //       textAlign: 'center',
    //       strokeDashArray: null
    //     },
    //     // { figure: "Square", Name:"",minSize:new go.Size(20,20),fill:"#ffffff",stroke:"#000000",strokeWidth:2,font:"10pt Times New Roman",isUnderline:false,isStrikethrough:false,textAlign:"center",strokeDashArray:null},
    //     {
    //       figure: 'Ellipse',
    //       Name: '',
    //       minSize: new go.Size(20, 20),
    //       fill: '#ffffff',
    //       stroke: '#000000',
    //       strokeWidth: 2,
    //       font: '10pt Times New Roman',
    //       isUnderline: false,
    //       isStrikethrough: false,
    //       textAlign: 'center',
    //       strokeDashArray: null
    //     },
    //     {
    //       figure: 'Circle',
    //       Name: '',
    //       minSize: new go.Size(20, 20),
    //       fill: '#ffffff',
    //       stroke: '#000000',
    //       strokeWidth: 2,
    //       font: '10pt Times New Roman',
    //       isUnderline: false,
    //       isStrikethrough: false,
    //       textAlign: 'center',
    //       strokeDashArray: null
    //     },
    //     {
    //       figure: 'Pentagon',
    //       Name: '',
    //       minSize: new go.Size(20, 20),
    //       fill: '#ffffff',
    //       stroke: '#000000',
    //       strokeWidth: 2,
    //       font: '10pt Times New Roman',
    //       isUnderline: false,
    //       isStrikethrough: false,
    //       textAlign: 'center',
    //       strokeDashArray: null
    //     },
    //     {
    //       figure: 'Hexagon',
    //       Name: '',
    //       minSize: new go.Size(20, 20),
    //       fill: '#ffffff',
    //       stroke: '#000000',
    //       strokeWidth: 2,
    //       font: '10pt Times New Roman',
    //       isUnderline: false,
    //       isStrikethrough: false,
    //       textAlign: 'center',
    //       strokeDashArray: null
    //     },
    //     {
    //       figure: 'Heptagon',
    //       Name: '',
    //       minSize: new go.Size(20, 20),
    //       fill: '#ffffff',
    //       stroke: '#000000',
    //       strokeWidth: 2,
    //       font: '10pt Times New Roman',
    //       isUnderline: false,
    //       isStrikethrough: false,
    //       textAlign: 'center',
    //       strokeDashArray: null
    //     },
    //     {
    //       figure: 'Nonagon',
    //       Name: '',
    //       minSize: new go.Size(20, 20),
    //       fill: '#ffffff',
    //       stroke: '#000000',
    //       strokeWidth: 2,
    //       font: '10pt Times New Roman',
    //       isUnderline: false,
    //       isStrikethrough: false,
    //       textAlign: 'center',
    //       strokeDashArray: null
    //     },
    //     {
    //       figure: 'Decagon',
    //       Name: '',
    //       minSize: new go.Size(20, 20),
    //       fill: '#ffffff',
    //       stroke: '#000000',
    //       strokeWidth: 2,
    //       font: '10pt Times New Roman',
    //       isUnderline: false,
    //       isStrikethrough: false,
    //       textAlign: 'center',
    //       strokeDashArray: null
    //     },
    //     {
    //       figure: 'Cylinder1',
    //       Name: '',
    //       minSize: new go.Size(20, 20),
    //       fill: '#ffffff',
    //       stroke: '#000000',
    //       strokeWidth: 2,
    //       font: '10pt Times New Roman',
    //       isUnderline: false,
    //       isStrikethrough: false,
    //       textAlign: 'center',
    //       strokeDashArray: null
    //     },
    //     {
    //       figure: 'Parallelogram1',
    //       Name: '',
    //       minSize: new go.Size(20, 20),
    //       fill: '#ffffff',
    //       stroke: '#000000',
    //       strokeWidth: 2,
    //       font: '10pt Times New Roman',
    //       isUnderline: false,
    //       isStrikethrough: false,
    //       textAlign: 'center',
    //       strokeDashArray: null
    //     },
    //     {
    //       figure: 'Trapezoid',
    //       Name: '',
    //       minSize: new go.Size(20, 20),
    //       fill: '#ffffff',
    //       stroke: '#000000',
    //       strokeWidth: 2,
    //       font: '10pt Times New Roman',
    //       isUnderline: false,
    //       isStrikethrough: false,
    //       textAlign: 'center',
    //       strokeDashArray: null
    //     },
    //     {
    //       figure: 'Cube2',
    //       Name: '',
    //       minSize: new go.Size(20, 20),
    //       fill: '#ffffff',
    //       stroke: '#000000',
    //       strokeWidth: 2,
    //       font: '10pt Times New Roman',
    //       isUnderline: false,
    //       isStrikethrough: false,
    //       textAlign: 'center',
    //       strokeDashArray: null
    //     },
    //     {
    //       figure: 'File',
    //       Name: '',
    //       minSize: new go.Size(20, 20),
    //       fill: '#ffffff',
    //       stroke: '#000000',
    //       strokeWidth: 2,
    //       font: '10pt Times New Roman',
    //       isUnderline: false,
    //       isStrikethrough: false,
    //       textAlign: 'center',
    //       strokeDashArray: null
    //     },
    //     {
    //       figure: 'Card',
    //       Name: '',
    //       minSize: new go.Size(20, 20),
    //       fill: '#ffffff',
    //       stroke: '#000000',
    //       strokeWidth: 2,
    //       font: '10pt Times New Roman',
    //       isUnderline: false,
    //       isStrikethrough: false,
    //       textAlign: 'center',
    //       strokeDashArray: null
    //     },
    //     {
    //       figure: 'LoopLimit',
    //       Name: '',
    //       minSize: new go.Size(20, 20),
    //       fill: '#ffffff',
    //       stroke: '#000000',
    //       strokeWidth: 2,
    //       font: '10pt Times New Roman',
    //       isUnderline: false,
    //       isStrikethrough: false,
    //       textAlign: 'center',
    //       strokeDashArray: null
    //     },
    //     {
    //       figure: 'Decision',
    //       Name: '',
    //       minSize: new go.Size(20, 20),
    //       fill: '#ffffff',
    //       stroke: '#000000',
    //       strokeWidth: 2,
    //       font: '10pt Times New Roman',
    //       isUnderline: false,
    //       isStrikethrough: false,
    //       textAlign: 'center',
    //       strokeDashArray: null
    //     },
    //     // { figure: "Triangle", Name:"",minSize:new go.Size(20,20),fill:"#ffffff",stroke:"#000000",strokeWidth:2,font:"10pt Times New Roman",isUnderline:false,isStrikethrough:false,textAlign:"center",strokeDashArray:null },
    //     // { figure: "RightTriangle", Name:"",minSize:new go.Size(20,20),fill:"#ffffff",stroke:"#000000",strokeWidth:2,font:"10pt Times New Roman",isUnderline:false,isStrikethrough:false,textAlign:"center",strokeDashArray:null },
    //     {
    //       figure: 'Junction',
    //       Name: '',
    //       minSize: new go.Size(20, 20),
    //       fill: '#ffffff',
    //       stroke: '#000000',
    //       strokeWidth: 2,
    //       font: '10pt Times New Roman',
    //       isUnderline: false,
    //       isStrikethrough: false,
    //       textAlign: 'center',
    //       strokeDashArray: null
    //     },
    //     {
    //       figure: 'Or',
    //       Name: '',
    //       minSize: new go.Size(20, 20),
    //       fill: '#ffffff',
    //       stroke: '#000000',
    //       strokeWidth: 2,
    //       font: '10pt Times New Roman',
    //       isUnderline: false,
    //       isStrikethrough: false,
    //       textAlign: 'center',
    //       strokeDashArray: null
    //     },
    //     {
    //       figure: 'BpmnActivityLoop',
    //       Name: '',
    //       minSize: new go.Size(20, 20),
    //       fill: '#ffffff',
    //       stroke: '#000000',
    //       strokeWidth: 2,
    //       font: '10pt Times New Roman',
    //       isUnderline: false,
    //       isStrikethrough: false,
    //       textAlign: 'center',
    //       strokeDashArray: null
    //     },
    //     {
    //       figure: 'SquareArrow',
    //       Name: '',
    //       fill: '#ffffff',
    //       stroke: '#000000',
    //       strokeWidth: 2,
    //       font: '10pt Times New Roman',
    //       isUnderline: false,
    //       isStrikethrough: false,
    //       textAlign: 'center',
    //       strokeDashArray: null
    //     },
    //     {
    //       figure: 'DoubleArrow',
    //       Name: '',
    //       fill: '#ffffff',
    //       stroke: '#000000',
    //       strokeWidth: 2,
    //       font: '10pt Times New Roman',
    //       isUnderline: false,
    //       isStrikethrough: false,
    //       textAlign: 'center',
    //       strokeDashArray: null
    //     },
    //     {
    //       figure: 'ThinCross',
    //       Name: '',
    //       fill: '#ffffff',
    //       stroke: '#000000',
    //       strokeWidth: 2,
    //       font: '10pt Times New Roman',
    //       isUnderline: false,
    //       isStrikethrough: false,
    //       textAlign: 'center',
    //       strokeDashArray: null
    //     },
    //     // { figure: "NandGate",Name:"",minSize:new go.Size(20,20),fill:"#ffffff",stroke:"#000000",strokeWidth:2,font:"10pt Times New Roman",isUnderline:false,isStrikethrough:false,textAlign:"center",strokeDashArray:null },
    //     // { figure: "Inverter", Name:"",minSize:new go.Size(20,20),fill:"#ffffff",stroke:"#000000",strokeWidth:2,font:"10pt Times New Roman",isUnderline:false,isStrikethrough:false,textAlign:"center",strokeDashArray:null },
    //     // { figure: "NorGate", Name:"",minSize:new go.Size(20,20),fill:"#ffffff",stroke:"#000000",strokeWidth:2,font:"10pt Times New Roman",isUnderline:false,isStrikethrough:false,textAlign:"center",strokeDashArray:null },
    //     // { figure: "OrGate", Name:"",minSize:new go.Size(20,20),fill:"#ffffff",stroke:"#000000",strokeWidth:2,font:"10pt Times New Roman",isUnderline:false,isStrikethrough:false,textAlign:"center",strokeDashArray:null },
    //     // { figure: "XnorGate", Name:"",minSize:new go.Size(20,20),fill:"#ffffff",stroke:"#000000",strokeWidth:2,font:"10pt Times New Roman",isUnderline:false,isStrikethrough:false,textAlign:"center",strokeDashArray:null },
    //     // { figure: "XorGate", Name:"",minSize:new go.Size(20,20),fill:"#ffffff",stroke:"#000000",strokeWidth:2,font:"10pt Times New Roman",isUnderline:false,isStrikethrough:false,textAlign:"center",strokeDashArray:null },
    //     // { figure: "Arrow", Name:"",minSize:new go.Size(20,20),fill:"#ffffff",stroke:"#000000",strokeWidth:2,font:"10pt Times New Roman",isUnderline:false,isStrikethrough:false,textAlign:"center",strokeDashArray:null },
    //     // { figure: "DoubleEndArrow", Name:"",minSize:new go.Size(20,20),fill:"#ffffff",stroke:"#000000",strokeWidth:2,font:"10pt Times New Roman",isUnderline:false,isStrikethrough:false,textAlign:"center",strokeDashArray:null },
    //     // { figure: "IBeamArrow", Name:"",minSize:new go.Size(20,20),fill:"#ffffff",stroke:"#000000",strokeWidth:2,font:"10pt Times New Roman",isUnderline:false,isStrikethrough:false,textAlign:"center",strokeDashArray:null },
    //     // { figure: "SplitEndArrow", Name:"",minSize:new go.Size(20,20),fill:"#ffffff",stroke:"#000000",strokeWidth:2,font:"10pt Times New Roman",isUnderline:false,isStrikethrough:false,textAlign:"center",strokeDashArray:null },
    //     {
    //       figure: 'Actor',
    //       Name: '',
    //       minSize: new go.Size(20, 20),
    //       fill: '#ffffff',
    //       stroke: '#000000',
    //       strokeWidth: 2,
    //       font: '10pt Times New Roman',
    //       isUnderline: false,
    //       isStrikethrough: false,
    //       textAlign: 'center',
    //       strokeDashArray: null
    //     }
    //   ])
    // });

    // objGo(go.Palette, 'myPaletteDiv4', {
    //   maxSelectionCount: 1,
    //   linkTemplate: objGo(
    //     go.Link,
    //     { toolTip: tooltiptemplate },
    //     {
    //       locationSpot: go.Spot.Center,
    //       selectionAdorned: false,
    //       curve: go.Link.JumpOver,
    //       corner: 5,
    //       toShortLength: 4,
    //       routing: go.Link.AvoidsNodes
    //     },
    //     new go.Binding('points'),
    //     objGo(
    //       go.Shape, // the link path shape
    //       { isPanelMain: true, strokeWidth: 2, cursor: 'pointer' },
    //       new go.Binding('strokeDashArray', 'strokeDashArray')
    //     ),
    //     objGo(
    //       go.Shape, // the to-arrowhead
    //       new go.Binding('fromArrow', 'fromArrow'),
    //       { fromArrow: '', strokeWidth: 1 },
    //       new go.Binding('fill', 'fromArrowFill')
    //     ),
    //     objGo(
    //       go.Shape, // the to-arrowhead
    //       new go.Binding('toArrow', 'toArrow'),
    //       { toArrow: '', strokeWidth: 1 },
    //       new go.Binding('fill', 'toArrowFill')
    //     )
    //   ),
    //   model: new go.GraphLinksModel( // specify the contents of the Palette
    //     [],
    //     [
    //       {
    //         points: new go.List(go.Point).addAll([
    //           new go.Point(0, 0),
    //           new go.Point(50, 50)
    //         ]),
    //         toArrow: 'SidewaysV',
    //         Linktype: '依赖'
    //       },
    //       {
    //         points: new go.List(go.Point).addAll([
    //           new go.Point(0, 0),
    //           new go.Point(50, 50)
    //         ]),
    //         toArrow: 'Triangle',
    //         Linktype: '关联目标'
    //       },
    //       {
    //         points: new go.List(go.Point).addAll([
    //           new go.Point(0, 0),
    //           new go.Point(50, 50)
    //         ]),
    //         toArrow: 'Triangle',
    //         toArrowFill: 'Transparent',
    //         Linktype: '关联功能目标'
    //       },
    //       {
    //         points: new go.List(go.Point).addAll([
    //           new go.Point(0, 0),
    //           new go.Point(50, 50)
    //         ]),
    //         toArrow: 'StretchedDiamond',
    //         toArrowFill: 'Transparent',
    //         Linktype: '聚合'
    //       },
    //       {
    //         points: new go.List(go.Point).addAll([
    //           new go.Point(0, 0),
    //           new go.Point(50, 50)
    //         ]),
    //         toArrow: 'StretchedDiamond',
    //         Linktype: '组合'
    //       },
    //       {
    //         points: new go.List(go.Point).addAll([
    //           new go.Point(0, 0),
    //           new go.Point(50, 50)
    //         ]),
    //         toArrow: 'Circle',
    //         toArrowFill: 'Transparent',
    //         fromArrow: 'Circle',
    //         Linktype: '多选一'
    //       },
    //       {
    //         points: new go.List(go.Point).addAll([
    //           new go.Point(0, 0),
    //           new go.Point(50, 50)
    //         ]),
    //         toArrow: 'Fork',
    //         Linktype: '互斥'
    //       },
    //       {
    //         points: new go.List(go.Point).addAll([
    //           new go.Point(0, 0),
    //           new go.Point(50, 50)
    //         ]),
    //         toArrow: 'Circle',
    //         toArrowFill: 'Transparent',
    //         Linktype: '可选'
    //       },
    //       {
    //         points: new go.List(go.Point).addAll([
    //           new go.Point(0, 0),
    //           new go.Point(50, 50)
    //         ]),
    //         toArrow: 'Circle',
    //         Linktype: '必选'
    //       },
    //       {
    //         points: new go.List(go.Point).addAll([
    //           new go.Point(0, 0),
    //           new go.Point(50, 50)
    //         ]),
    //         toArrow: '',
    //         Linktype: '多选多'
    //       },
    //       {
    //         points: new go.List(go.Point).addAll([
    //           new go.Point(0, 0),
    //           new go.Point(50, 50)
    //         ]),
    //         toArrow: 'DoubleFeathers',
    //         Linktype: '促进'
    //       }
    //       // //折线
    //       // {points: new go.List(go.Point).addAll([new go.Point(0, 0),new go.Point(10, 0), new go.Point(10, 20),new go.Point(50, 50)]),toArrow:"SidewaysV",Linktype:"依赖"},
    //       // {points: new go.List(go.Point).addAll([new go.Point(0, 0),new go.Point(10, 0), new go.Point(10, 20),new go.Point(50, 50)]),toArrow:"Triangle",Linktype:"关联目标"},
    //       // {points: new go.List(go.Point).addAll([new go.Point(0, 0),new go.Point(10, 0), new go.Point(10, 20),new go.Point(50, 50)]),toArrow:"Triangle",toArrowFill:"Transparent",Linktype:"关联功能目标"},
    //       // {points: new go.List(go.Point).addAll([new go.Point(0, 0),new go.Point(10, 0), new go.Point(10, 20),new go.Point(50, 50)]),toArrow:"StretchedDiamond",toArrowFill:"Transparent",Linktype:"聚合"},
    //       // {points: new go.List(go.Point).addAll([new go.Point(0, 0),new go.Point(10, 0), new go.Point(10, 20),new go.Point(50, 50)]),toArrow:"StretchedDiamond",Linktype:"组合"},
    //       // {points: new go.List(go.Point).addAll([new go.Point(0, 0),new go.Point(10, 0), new go.Point(10, 20),new go.Point(50, 50)]),toArrow:"Circle",toArrowFill:"Transparent",fromArrow:"Circle",Linktype:"多选一"},
    //       // {points: new go.List(go.Point).addAll([new go.Point(0, 0),new go.Point(10, 0), new go.Point(10, 20),new go.Point(50, 50)]),toArrow:"Fork",Linktype:"互斥"},
    //       // {points: new go.List(go.Point).addAll([new go.Point(0, 0),new go.Point(10, 0), new go.Point(10, 20),new go.Point(50, 50)]),toArrow:"Circle",toArrowFill:"Transparent",Linktype:"可选"},
    //       // {points: new go.List(go.Point).addAll([new go.Point(0, 0),new go.Point(10, 0), new go.Point(10, 20),new go.Point(50, 50)]),toArrow:"Circle",Linktype:"必选"},
    //       // {points: new go.List(go.Point).addAll([new go.Point(0, 0),new go.Point(10, 0), new go.Point(10, 20),new go.Point(50, 50)]),toArrow:"",Linktype:"多选多"},
    //       // {points: new go.List(go.Point).addAll([new go.Point(0, 0),new go.Point(10, 0), new go.Point(10, 20),new go.Point(50, 50)]),toArrow:"DoubleFeathers",Linktype:"促进"}
    //     ]
    //   )
    // });
    // mySelf.myLittleDiagram = objGo(go.Diagram, "myLittleDiagramDiv", {
    //   nodeTemplateMap: mySelf.myDiagram.nodeTemplateMap,
    //   linkTemplateMap: mySelf.myDiagram.linkTemplateMap,
    //   groupTemplateMap: mySelf.myDiagram.groupTemplateMap,
    //
    //   mouseDrop: function(e) {
    //     // when the selection is dropped in the diagram's background,
    //     // make sure the selected Parts no longer belong to any Group
    //     const ok = mySelf.myLittleDiagram.commandHandler.addTopLevelParts(
    //       mySelf.myDiagram.selection,
    //       true
    //     );
    //     if (!ok) mySelf.myDiagram.currentTool.doCancel();
    //   },
    // });

    function onSelectionChanged (item) {
      let shape = item.findObject('SHAPE');
      let textBlock = item.findObject('TEXTBLOCK');
      let pattern = /(\d+pt)\s(.*)$/;
      let results = textBlock.font.match(pattern);
      mySelf.isBold = textBlock.font.search('bold') !== -1;
      mySelf.selectedSize = results[1];
      mySelf.selectedFont = results[2];
      mySelf.isCrossover = (shape.strokeWidth === 5).toString();
      if (shape.strokeDashArray !== null) {
        if (shape.strokeDashArray[0] === 8) {
          mySelf.strokeStyle = 'dashed';
        } else if (shape.strokeDashArray[0] === 2) {
          mySelf.strokeStyle = 'dotted';
        }
      } else mySelf.strokeStyle = 'solid';
    };
  },
  watch: {
    listenChangemixed: {
      handler: function (newval, oldval) {
        // this.isMixed = true
      }
    },
    listenChangeyanmixed: {
      handler: function (newval, oldval) {
        // this.isMixed = true
      }
    },
    /* grid change */
    flag_showgrid: function (oldSelect, newSelect) {
      if (
        !this.flag_showgrid ||
        (typeof this.selectGrid !== 'undefined' &&
          this.selectGrid !== 0 &&
          !this.selectGrid)
      ) {
        this.myDiagram.grid = objGo(go.Panel, 'Grid');
      } else {
        this.myDiagram.grid = this.Grids.get(this.selectGrid);
      }
    },
    selectGrid: function (oldSelect, newSelect) {
      if (
        !this.flag_showgrid ||
        (typeof this.selectGrid !== 'undefined' &&
          this.selectGrid !== 0 &&
          !this.selectGrid)
      ) {
        this.myDiagram.grid = objGo(go.Panel, 'Grid');
      } else {
        this.myDiagram.grid = this.Grids.get(this.selectGrid);
      }
    },
    diagram: function (n, o) {
      this.load(n.jsonContent);
      this.moveCanvasCenter();
      this.isGenerateRequirement = true;
      let tooltiptemplate = objGo(
        'ToolTip',
        objGo(go.TextBlock, { margin: 4 }, new go.Binding('text', 'Linktype'))
      );
      switch (this.diagram.diagramType) {
        case 'VN': {
          if (this.$i18n.locale === 'zh') {
            go.GraphObject.make(
              go.Palette,
              'myPaletteDiv1', // must name or refer to the DIV HTML element
              {
                maxSelectionCount: 1,
                nodeTemplateMap: this.myDiagram.nodeTemplateMap, // share the templates used by myDiagram
                model: new go.GraphLinksModel([
                  // specify the contents of the Palette
                  // {Name: '', Type: '<<价值活动>>', Annotation: '', figure: 'Card', nodeType: 'serviceValue', fill: '#fad7a7', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                  // {Name: '', Type: '<<价值对象>>', Annotation: '', figure: 'RoundedRectangle', nodeType: 'serviceValue', fill: '#f4e4d0', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                  // {Name: '', Type: '<<资源>>', Annotation: '', figure: 'ExternalOrganization', nodeType: 'serviceValue', fill: '#Fec9c9', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                  // {Name: '', Type: '<<服务>>', Annotation: '', figure: 'InternalStorage', nodeType: 'serviceValue', fill: '#e2c0c1', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                  // {Name: '', Type: '<<目标>>', Annotation: '', figure: 'Ellipse', nodeType: 'serviceValue', fill: '#00a480', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                  // {Name: '', Type: '<<角色>>', Annotation: '', figure: 'Actor', minSize: new go.Size(20, 20), width: 50, height: 70, nodeType: 'serviceValue', fill: '#eac49e', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null}

                  {
                    Name: '',
                    Type: '<<价值活动>>',
                    Annotation: '',
                    figure: 'Card',
                    nodeType: 'serviceValue',
                    fill: '#F4B183',//#fad7a7
                    stroke: '#DAA520',
                    strokeWidth: 2,
                    font: '10pt Times New Roman',
                    isUnderline: false,
                    isStrikethrough: false,
                    textAlign: 'center',
                    strokeDashArray: null
                  },
                  {
                    Name: '',
                    Type: '<<价值对象>>',
                    Annotation: '',
                    figure: 'RoundedRectangle',
                    nodeType: 'serviceValue',
                    fill: '#FFD966',//#f4e4d0
                    stroke: '#CDAA7D',
                    strokeWidth: 2,
                    font: '10pt Times New Roman',
                    isUnderline: false,
                    isStrikethrough: false,
                    textAlign: 'center',
                    strokeDashArray: null
                  },
                  {
                    Name: '',
                    Type: '<<资源>>',
                    Annotation: '',
                    figure: 'ExternalOrganization',
                    nodeType: 'serviceValue',
                    fill: '#Fec9c9',
                    stroke: '#CDB7B5',
                    strokeWidth: 2,
                    font: '10pt Times New Roman',
                    isUnderline: false,
                    isStrikethrough: false,
                    textAlign: 'center',
                    strokeDashArray: null
                  },
                  {
                    Name: '',
                    Type: '<<服务>>',
                    Annotation: '',
                    figure: 'InternalStorage',
                    nodeType: 'serviceValue',
                    fill: '#C88EA7',//#e2c0c1
                    stroke: '#BC8F8F',
                    strokeWidth: 2,
                    font: '10pt Times New Roman',
                    isUnderline: false,
                    isStrikethrough: false,
                    textAlign: 'center',
                    strokeDashArray: null
                  },
                  {
                    Name: '',
                    Type: '<<目标>>',
                    Annotation: '',
                    figure: 'Ellipse',
                    nodeType: 'serviceValue',
                    fill: '#00a480',//#Feee7d
                    stroke: '#2E8B57',
                    strokeWidth: 2,
                    font: '10pt Times New Roman',
                    isUnderline: false,
                    isStrikethrough: false,
                    textAlign: 'center',
                    strokeDashArray: null
                  },
                  {
                    Name: '',
                    Type: '<<角色>>',
                    Annotation: '',
                    figure: 'actorGeometry',
                    // geometry: this.actorGeometry,
                    minSize: new go.Size(40, 40),
                    width: 50,
                    height: 70,
                    nodeType: 'serviceValue',
                    fill: '#Feee7d',
                    stroke: '#CDAA7D',
                    strokeWidth: 2,
                    font: '10pt Times New Roman',
                    isUnderline: false,
                    isStrikethrough: false,
                    textAlign: 'center',
                    strokeDashArray: null
                  }
                ])
              }
            );
          } else {
            go.GraphObject.make(
              go.Palette,
              'myPaletteDiv1', // must name or refer to the DIV HTML element
              {
                maxSelectionCount: 1,
                nodeTemplateMap: this.myDiagram.nodeTemplateMap, // share the templates used by myDiagram
                model: new go.GraphLinksModel([
                  // specify the contents of the Palette
                  // 英文版本
                  {
                    Name: '',
                    Type: '<<Value activity>>',
                    Annotation: '',
                    figure: 'Card',
                    nodeType: 'serviceValue',
                    fill: '#fad7a7',
                    stroke: '#DAA520',
                    strokeWidth: 2,
                    font: '10pt Times New Roman',
                    isUnderline: false,
                    isStrikethrough: false,
                    textAlign: 'center',
                    strokeDashArray: null
                  },
                  {
                    Name: '',
                    Type: '<<Value object>>',
                    Annotation: '',
                    figure: 'RoundedRectangle',
                    nodeType: 'serviceValue',
                    fill: '#f4e4d0',
                    stroke: '#CDAA7D',
                    strokeWidth: 2,
                    font: '10pt Times New Roman',
                    isUnderline: false,
                    isStrikethrough: false,
                    textAlign: 'center',
                    strokeDashArray: null
                  },
                  {
                    Name: '',
                    Type: '<<Resource>>',
                    Annotation: '',
                    figure: 'ExternalOrganization',
                    nodeType: 'serviceValue',
                    fill: '#Fec9c9',
                    stroke: '#CDB7B5',
                    strokeWidth: 2,
                    font: '10pt Times New Roman',
                    isUnderline: false,
                    isStrikethrough: false,
                    textAlign: 'center',
                    strokeDashArray: null
                  },
                  {
                    Name: '',
                    Type: '<<Service>>',
                    Annotation: '',
                    figure: 'InternalStorage',
                    nodeType: 'serviceValue',
                    fill: '#e2c0c1',
                    stroke: '#BC8F8F',
                    strokeWidth: 2,
                    font: '10pt Times New Roman',
                    isUnderline: false,
                    isStrikethrough: false,
                    textAlign: 'center',
                    strokeDashArray: null
                  },
                  {
                    Name: '',
                    Type: '<<Goal>>',
                    Annotation: '',
                    figure: 'Ellipse',
                    nodeType: 'serviceValue',
                    fill: '#00a480',
                    stroke: '#2E8B57',
                    strokeWidth: 2,
                    font: '10pt Times New Roman',
                    isUnderline: false,
                    isStrikethrough: false,
                    textAlign: 'center',
                    strokeDashArray: null
                  },
                  {
                    Name: '',
                    Type: '<<Role>>',
                    Annotation: '',
                    figure: 'actorGeometry',
                    // geometry: this.actorGeometry,
                    minSize: new go.Size(40, 40),
                    width: 50,
                    height: 70,
                    nodeType: 'serviceValue',
                    fill: '#Feee7d',
                    stroke: '#CDAA7D',
                    strokeWidth: 2,
                    font: '10pt Times New Roman',
                    isUnderline: false,
                    isStrikethrough: false,
                    textAlign: 'center',
                    strokeDashArray: null
                  }
                ])
              }
            );
          }
          objGo(go.Palette, 'myPaletteDiv2', {
            maxSelectionCount: 1,
            linkTemplate: objGo(
              go.Link,
              { toolTip: tooltiptemplate },
              {
                locationSpot: go.Spot.Center,
                selectionAdorned: false,
                curve: go.Link.JumpOver,
                corner: 5,
                toShortLength: 4,
                routing: go.Link.AvoidsNodes
              },
              new go.Binding('points'),
              objGo(
                go.Shape, // the link path shape
                { isPanelMain: true, strokeWidth: 2, cursor: 'pointer' },
                new go.Binding('strokeDashArray', 'strokeDashArray')
              ),
              objGo(
                go.Shape, // the to-arrowhead
                new go.Binding('fromArrow', 'fromArrow'),
                { fromArrow: '', strokeWidth: 1 },
                new go.Binding('fill', 'fromArrowFill')
              ),
              objGo(
                go.Shape, // the to-arrowhead
                new go.Binding('toArrow', 'toArrow'),
                { toArrow: '', strokeWidth: 1 },
                new go.Binding('fill', 'toArrowFill')
              )
            ),
            model: new go.GraphLinksModel( // specify the contents of the Palette
              [],
              [
                {
                  points: new go.List(go.Point).addAll([
                    new go.Point(0, 0),
                    new go.Point(50, 50)
                  ]),
                  toArrow: 'Circle',
                  toArrowFill: 'Transparent',
                  Linktype: 'OR'
                },
                {
                  points: new go.List(go.Point).addAll([
                    new go.Point(0, 0),
                    new go.Point(50, 50)
                  ]),
                  toArrow: 'Circle',
                  Linktype: 'AND'
                },
                {
                  points: new go.List(go.Point).addAll([
                    new go.Point(0, 0),
                    new go.Point(50, 50)
                  ]),
                  toArrow: 'DoubleFeathers',
                  Linktype: '促进'
                },
                {
                  points: new go.List(go.Point).addAll([
                    new go.Point(0, 0),
                    new go.Point(50, 50)
                  ]),
                  toArrow: 'OpenTriangleLine',
                  Linktype: '阻碍'
                },
                {
                  points: new go.List(go.Point).addAll([
                    new go.Point(0, 0),
                    new go.Point(50, 50)
                  ]),
                  toArrow: 'X',
                  Linktype: '互斥'
                },
                {
                  points: new go.List(go.Point).addAll([
                    new go.Point(0, 0),
                    new go.Point(50, 50)
                  ]),
                  toArrow: 'SidewaysV',
                  Linktype: '依赖'
                }
              ]
            )
          });
          if (this.$i18n.locale === 'en') {
            [this.modelType, this.relationType] = [
              'Elements of Vlue network',
              'Relationship of Value network'
            ];
            this.search_types = [
              { value: null, text: 'Choose The Type of Element' },
              { value: '<<Value activity>>', text: 'Value activity' },
              { value: '<<Value object>>', text: 'Value object' },
              { value: '<<Resource>>', text: 'Resource' },
              { value: '<<Service>>', text: 'Service' },
              { value: '<<Goal>>', text: 'Goal' },
              { value: '<<Role>>', text: 'Role' }
            ];
          } else {
            [this.modelType, this.relationType] = [
              '价值模型元素',
              '价值模型关系'
            ];
            this.search_types = [
              { value: null, text: '选择元素类型' },
              { value: '<<价值活动>>', text: '价值活动' },
              { value: '<<资源>>', text: '资源' },
              { value: '<<服务>>', text: '服务' },
              { value: '<<目标>>', text: '目标' },
              { value: '<<角色>>', text: '角色' }
            ];
          }

          break;
        }
        case 'GN': {
          if (this.$i18n.locale === 'en') {
            objGo(
              go.Palette,
              'myPaletteDiv1', // must name or refer to the DIV HTML element
              {
                maxSelectionCount: 1,
                nodeTemplateMap: this.myDiagram.nodeTemplateMap,
                groupTemplateMap: this.myDiagram.groupTemplateMap,
                model: new go.GraphLinksModel([
                  // specify the contents of the Palette
                  {
                    Name: '',
                    Type: '<<Actor>>',
                    Annotation: '',
                    minSize: new go.Size(40, 40),
                    figure: 'actorGeometry',
                    // geometry: this.actorGeometry,
                    width: 50,
                    height: 70,
                    nodeType: 'target',
                    fill: '#Feee7d',
                    stroke: '#CDAA7D',
                    strokeWidth: 2,
                    font: '10pt Times New Roman',
                    isUnderline: false,
                    isStrikethrough: false,
                    textAlign: 'center',
                    strokeDashArray: null
                  },
                  {
                    Name: '',
                    Type: '<<Actor Boundary>>',
                    minSize: new go.Size(20, 20),
                    fill: '#ffffff',
                    isGroup: true,
                    category: 'OfNodes',
                    stroke: 'gray',
                    strokeWidth: 2,
                    font: '10pt Times New Roman',
                    isUnderline: false,
                    isStrikethrough: false,
                    textAlign: 'center',
                    strokeDashArray: null
                  },
                  {
                    Name: '',
                    Type: '<<Goal>>',
                    Annotation: '',
                    figure: 'Ellipse',
                    nodeType: 'target',
                    fill: '#00a480',//b0cdb9
                    stroke: '#000000',
                    strokeWidth: 2,
                    font: '10pt Times New Roman',
                    isUnderline: false,
                    isStrikethrough: false,
                    textAlign: 'center',
                    strokeDashArray: null
                  },
                  {
                    Name: '',
                    Type: '<<Functional Goal>>',
                    Annotation: '',
                    figure: 'Pentagon',
                    nodeType: 'target',
                    fill: '#34d2af',
                    stroke: '#2E8B57',
                    strokeWidth: 2,
                    font: '10pt Times New Roman',
                    isUnderline: false,
                    isStrikethrough: false,
                    textAlign: 'center',
                    strokeDashArray: null
                  },
                  {
                    Name: '',
                    Type: '<<Nonfunctional Goal>>',
                    Annotation: '',
                    figure: 'LoopLimit',
                    nodeType: 'target',
                    fill: '#5ed2b8',
                    stroke: 'rgb(184,188,164)',
                    strokeWidth: 2,
                    font: '10pt Times New Roman',
                    isUnderline: false,
                    isStrikethrough: false,
                    textAlign: 'center',
                    strokeDashArray: null
                  },
                  {
                    Name: '',
                    Type: '<<Operational Goal>>',
                    Annotation: '',
                    figure: 'CreateRequest',
                    nodeType: 'target',
                    fill: '#c0d9a2',
                    stroke: '#8fd2c4',//#8FBC8F
                    strokeWidth: 2,
                    font: '10pt Times New Roman',
                    isUnderline: false,
                    isStrikethrough: false,
                    textAlign: 'center',
                    strokeDashArray: null
                  },
                  {
                    Name: '',
                    Type: '<<Resource>>',
                    Annotation: '',
                    figure: 'ExternalOrganization',
                    nodeType: 'serviceValue',
                    fill: '#Fec9c9',//#f4d9ce
                    stroke: '#CDB7B5',
                    strokeWidth: 2,
                    font: '10pt Times New Roman',
                    isUnderline: false,
                    isStrikethrough: false,
                    textAlign: 'center',
                    strokeDashArray: null
                  },
                  {
                    Name: '',
                    Type: '<<Constraint>>',
                    Annotation: '',
                    figure: 'File',
                    nodeType: 'target',
                    fill: 'whitesmoke',
                    stroke: 'gray',
                    strokeWidth: 2,
                    font: '10pt Times New Roman',
                    isUnderline: false,
                    isStrikethrough: false,
                    textAlign: 'center',
                    strokeDashArray: null
                  }
                ])
              }
            );
          } else {
            objGo(
              go.Palette,
              'myPaletteDiv1', // must name or refer to the DIV HTML element
              {
                maxSelectionCount: 1,
                nodeTemplateMap: this.myDiagram.nodeTemplateMap,
                groupTemplateMap: this.myDiagram.groupTemplateMap,
                model: new go.GraphLinksModel([
                  // specify the contents of the Palette
                  // 黑白调试中
                  // { Name: '', Type: '<<功能性目标>>', Annotation: '', figure: 'Pentagon', nodeType: 'target', fill: '#ffffff', stroke: 'gray', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
                  // { Name: '', Type: '<<非功能性目标>>', Annotation: '', figure: 'LoopLimit', nodeType: 'target', fill: '#ffffff', stroke: 'gray', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
                  // { Name: '', Type: '<<可操作性目标>>', Annotation: '', figure: 'CreateRequest', nodeType: 'target', fill: '#ffffff', stroke: 'gray', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
                  // {Name: '', Type: '<<资源>>', Annotation: '', figure: 'ExternalOrganization', nodeType: 'serviceValue', fill: '#ffffff', stroke: 'gray', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                  // { Name: '', Type: '<<约束>>', Annotation: '', figure: 'File', nodeType: 'target', fill: '#ffffff', stroke: 'gray', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
                  // { Name: '', Type: '<<角色>>', Annotation: '', minSize: new go.Size(20, 20), figure: 'Actor', width: 50, height: 70, nodeType: 'target', fill: '#ffffff', stroke: 'gray', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
                  // { Name: '', Type: '<<角色作用域>>', minSize: new go.Size(20, 20), fill: '#ffffff', isGroup: true, category: 'OfNodes', stroke: 'gray', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null }
                  // 彩色版本
                  {
                    Name: '',
                    Type: '<<角色>>',
                    Annotation: '',
                    minSize: new go.Size(40, 40),
                    figure: 'actorGeometry',
                    // geometry: this.actorGeometry,
                    width: 50,
                    height: 70,
                    nodeType: 'target',
                    fill: '#Feee7d',
                    stroke: '#CDAA7D',
                    strokeWidth: 2,
                    font: '10pt Times New Roman',
                    isUnderline: false,
                    isStrikethrough: false,
                    textAlign: 'center',
                    strokeDashArray: null
                  },
                  {
                    Name: '',
                    Type: '<<角色作用域>>',
                    minSize: new go.Size(20, 20),
                    fill: '#ffffff',
                    isGroup: true,
                    category: 'OfNodes',
                    stroke: 'gray',
                    strokeWidth: 2,
                    font: '10pt Times New Roman',
                    isUnderline: false,
                    isStrikethrough: false,
                    textAlign: 'center',
                    strokeDashArray: null
                  },

                  {
                    Name: '',
                    Type: '<<目标>>',
                    Annotation: '',
                    figure: 'Ellipse',
                    nodeType: 'target',
                    fill: '#00a480',//b0cdb9
                    stroke: '#000000',
                    strokeWidth: 2,
                    font: '10pt Times New Roman',
                    isUnderline: false,
                    isStrikethrough: false,
                    textAlign: 'center',
                    strokeDashArray: null
                  },
                  {
                    Name: '',
                    Type: '<<功能性目标>>',
                    Annotation: '',
                    figure: 'Pentagon',
                    nodeType: 'target',
                    fill: '#34d2af',
                    stroke: '#2E8B57',
                    strokeWidth: 2,
                    font: '10pt Times New Roman',
                    isUnderline: false,
                    isStrikethrough: false,
                    textAlign: 'center',
                    strokeDashArray: null
                  },
                  {
                    Name: '',
                    Type: '<<非功能性目标>>',
                    Annotation: '',
                    figure: 'LoopLimit',
                    minSize: new go.Size(40, 40),
                    nodeType: 'target',
                    fill: '#5ed2b8',
                    stroke: 'rgb(184,188,164)',
                    strokeWidth: 2,
                    font: '10pt Times New Roman',
                    isUnderline: false,
                    isStrikethrough: false,
                    textAlign: 'center',
                    strokeDashArray: null,
                    isNFR: 'Yes',
                    Sign: 'No',
                    Value: 0,
                    Unit: 'No'
                  },
                  {
                    Name: '',
                    Type: '<<可操作性目标>>',
                    Annotation: '',
                    figure: 'CreateRequest',
                    nodeType: 'target',
                    fill: '#8fd2c4',//#c0d9a2
                    stroke: '#8fd2c4',
                    strokeWidth: 2,
                    font: '10pt Times New Roman',
                    isUnderline: false,
                    isStrikethrough: false,
                    textAlign: 'center',
                    strokeDashArray: null
                  },
                  {
                    Name: '',
                    Type: '<<资源>>',
                    Annotation: '',
                    figure: 'ExternalOrganization',
                    nodeType: 'serviceValue',
                    fill: '#Fec9c9',
                    stroke: '#CDB7B5',
                    strokeWidth: 2,
                    font: '10pt Times New Roman',
                    isUnderline: false,
                    isStrikethrough: false,
                    textAlign: 'center',
                    strokeDashArray: null
                  },
                  {
                    Name: '',
                    Type: '<<约束>>',
                    Annotation: '',
                    figure: 'File',
                    nodeType: 'target',
                    fill: 'whitesmoke',
                    stroke: 'gray',
                    strokeWidth: 2,
                    font: '10pt Times New Roman',
                    isUnderline: false,
                    isStrikethrough: false,
                    textAlign: 'center',
                    strokeDashArray: null
                  }
                  // { Name: '', Type: '<<角色>>', Annotation: '', minSize: new go.Size(20, 20), figure: 'Actor', width: 50, height: 70, nodeType: 'target', fill: '#eac49e', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
                  // // { Name: '', Type: '<<目标>>', Annotation: '', figure: 'Ellipse', nodeType: 'target', fill: '#00a480', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
                  // { Name: '', Type: '<<约束>>', Annotation: '', figure: 'File', nodeType: 'target', fill: '#eac49e', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
                  // { Name: '', Type: '<<功能性目标>>', Annotation: '', figure: 'Pentagon', nodeType: 'target', fill: '#cbdab4', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
                  // { Name: '', Type: '<<非功能性目标>>', Annotation: '', figure: 'LoopLimit', nodeType: 'target', fill: '#e1efcc', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
                  // { Name: '', Type: '<<可操作性目标>>', Annotation: '', figure: 'CreateRequest', nodeType: 'target', fill: '#c0d9a2', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null }
                ])
              }
            );
          }
          objGo(go.Palette, 'myPaletteDiv2', {
            maxSelectionCount: 1,
            linkTemplate: objGo(
              go.Link,
              { toolTip: tooltiptemplate },
              {
                locationSpot: go.Spot.Center,
                selectionAdorned: false,
                curve: go.Link.JumpOver,
                corner: 5,
                toShortLength: 4,
                routing: go.Link.AvoidsNodes
              },
              new go.Binding('points'),
              objGo(
                go.Shape, // the link path shape
                { isPanelMain: true, strokeWidth: 2, cursor: 'pointer' },
                new go.Binding('strokeDashArray', 'strokeDashArray')
              ),
              objGo(
                go.Shape, // the to-arrowhead
                new go.Binding('fromArrow', 'fromArrow'),
                { fromArrow: '', strokeWidth: 1 },
                new go.Binding('fill', 'fromArrowFill')
              ),
              objGo(
                go.Shape, // the to-arrowhead
                new go.Binding('toArrow', 'toArrow'),
                { toArrow: '', strokeWidth: 1 },
                new go.Binding('fill', 'toArrowFill')
              )
            ),
            model: new go.GraphLinksModel( // specify the contents of the Palette
              [],
              [
                {
                  points: new go.List(go.Point).addAll([
                    new go.Point(0, 0),
                    new go.Point(50, 50)
                  ]),
                  toArrow: 'Circle',
                  toArrowFill: 'Transparent',
                  Linktype: 'OR'
                },
                {
                  points: new go.List(go.Point).addAll([
                    new go.Point(0, 0),
                    new go.Point(50, 50)
                  ]),
                  toArrow: 'Circle',
                  Linktype: 'AND'
                },
                {
                  points: new go.List(go.Point).addAll([
                    new go.Point(0, 0),
                    new go.Point(50, 50)
                  ]),
                  toArrow: 'DoubleFeathers',
                  Linktype: '促进'
                },
                {
                  points: new go.List(go.Point).addAll([
                    new go.Point(0, 0),
                    new go.Point(50, 50)
                  ]),
                  toArrow: 'OpenTriangleLine',
                  Linktype: '阻碍'
                },
                {
                  points: new go.List(go.Point).addAll([
                    new go.Point(0, 0),
                    new go.Point(50, 50)
                  ]),
                  toArrow: 'X',
                  Linktype: '互斥'
                },
                {
                  points: new go.List(go.Point).addAll([
                    new go.Point(0, 0),
                    new go.Point(50, 50)
                  ]),
                  toArrow: 'SidewaysV',
                  Linktype: '依赖'
                }
              ]
            )

          });
          if (this.$i18n.locale === 'en') {
            [this.modelType, this.relationType] = [
              'Elements of Goal Model',
              'Relationship of Goal Model'
            ];
            this.search_types = [
              { value: null, text: 'Choose The Type of Element' },
              { value: '<<Nonfunctional Goal>>', text: 'Nonfunctional Goal' },
              { value: '<<Functional Goal >>', text: 'Functional Goal ' },
              { value: '<<Operational Goal>>', text: 'Operational Goal' },
              { value: '<<Resource>>', text: 'Resource' },
              { value: '<<Constraint>>', text: 'Constraint' },
              { value: '<<Actor>>', text: 'Actor' }
              // {value: '<<Actor Scope>>', text: 'Actor Scope'}
            ];
          } else {
            [this.modelType, this.relationType] = [
              '目标模型元素',
              '目标模型关系'
            ];
            this.search_types = [
              { value: null, text: '选择元素类型' },
              { value: '<<非功能性目标>>', text: '非功能性目标' },
              { value: '<<功能性目标>>', text: '功能性目标' },
              { value: '<<可操作性目标>>', text: '可操作性目标' },
              { value: '<<资源>>', text: '资源' },
              { value: '<<约束>>', text: '约束' },
              { value: '<<角色>>', text: '角色' },
              { value: '<<目标>>', text: '目标' }
              // {value: '<<角色作用域>>', text: '角色作用域'}
            ];
          }
          break;
        }
      }
    }
  },
  methods: {
    activatePanel(panel) {
      if (!this.activePanels.includes(panel)) {
        this.activePanels.push(panel);
      }
      if (panel === "视图切换") {
        this.getDeployedPosition();
      }
      this.showMoreMethodsSidebar = true;
      this.roleArray = [];
      let jsonObj = JSON.parse(this.myDiagram.model.toJson());
      let nodeArray = jsonObj.nodeDataArray;
      for (let node of nodeArray) {
        if (node.Type === '<<角色>>' || node.Type === '<<角色作用域>>') {
          this.roleArray.push(node.Name.toString());
        }
        if (node.Type === '<<Actor>>' || node.Type === '<<Actor Boundary>>') {
          this.roleArray.push(node.Name.toString());
        }
      }
      // var myModel = go.GraphObject.make(go.Model);
    // 创建新的节点数据
//     var newNodeData = { Name: "Alpha",
// Type: '<<可操作性目标>>',
// Annotation: '',
// figure: 'CreateRequest',
// nodeType: 'target',
// fill: '#c0d9a2',
// stroke: '#8fd2c4',
// strokeWidth: 2,
// font: '10pt Times New Roman',
// isUnderline: false,
// isStrikethrough: false,
// textAlign: 'center',
// strokeDashArray: null};
//     // 添加新的节点数据到模型中
//     this.myDiagram.model.addNodeData(newNodeData);
    },
    removePanel(panel) {
      const index = this.activePanels.indexOf(panel);
      if (index > -1) {
        this.activePanels.splice(index, 1);
      }
      if (this.activePanels.length === 0) {
        this.showMoreMethodsSidebar = false;
      }
    },
    //以下是让右侧四个视图可以拖动
    makeViewsDraggable() {
      const views = document.querySelectorAll('.dock-view');
      views.forEach((view) => {
        this.dragElement(view);
      });
    },
    dragElement(view) {
      const header = view.querySelector('.view-title');
      let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

      header.onmousedown = dragMouseDown;

      function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
        // 将当前视图的 z-index 设置为 currentZIndex，并使 currentZIndex 加一
        this.currentZIndex += 1;
        view.style.zIndex = this.currentZIndex;
      }

      function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        view.style.top = (view.offsetTop - pos2) + "px";
        view.style.left = (view.offsetLeft - pos1) + "px";
      }

      function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
      }
    },
    //以上是让右侧四个视图可以拖动
    // toggleAIHelpSidebar() {
    //   this.showInconsistencyDectionSidebar = false;
    //   this.showRoleSidebar = false;
    //   this.showAIHelpSidebar = !this.showAIHelpSidebar;
    // },
    // toggleInconsistencyDetectionSidebar() {
    //   this.showAIHelpSidebar = false;
    //   this.showRoleSidebar = false;
    //   this.showInconsistencyDectionSidebar = !this.showInconsistencyDectionSidebar;
    // },
    // toggleRoleSidebar() {
    //   this.showAIHelpSidebar = false;
    //   this.showInconsistencyDectionSidebar = false;
    //   this.showRoleSidebar = !this.showRoleSidebar;
    // },//按角色展示视图的控制变量的方法
    // 获取编辑器内容
    getMsgFormEditor (data) {
      this.msgFormEditor = data;
    },
    downContent () {
      let html = `<!DOCTYPE html>
                <html>
                <body>
                    <div class="resume_preview_page" style="margin:0 auto;width:1200px">
                    ${this.msgFormEditor}
                    </div>
                </body>
                </html>`;
      writer(this.diagram.diagramName + `需求规格文档.html`, html, 'utf-8');
    },
    clickbtnbox (item, index) {
      this.createSearchDiagram(item, index);
    },
    showChooseModel () {
      if (this.search_diagram_json.length === 0) {
        // 阻止在没有选项的情况下误操作
        this.$alert('请先进行相关搜索。');
        return;
      }
      this.activeclass = 'hidemapbox active';
    },
    changeFont () {
      let font = `${this.isBold ? 'bold' : ''} ${
        this.isItalic ? 'italic' : ''
      } ${this.selectedSize} ${this.selectedFont}`;
      this.myDiagram.startTransaction('set all properties');
      this.myDiagram.selection.each(item => {
        this.myDiagram.model.setDataProperty(item.data, 'font', font);
      });
      this.myDiagram.commitTransaction('set all properties');
    },
    largerSize () {
      if (this.selectedSize !== '15pt') { this.selectedSize = parseInt(this.selectedSize) + 1 + 'pt'; }
      this.changeFont();
    },
    smallerSize () {
      if (this.selectedSize !== '6pt') { this.selectedSize = parseInt(this.selectedSize) - 1 + 'pt'; }
      this.changeFont();
    },
    boldFont () {
      this.isBold = !this.isBold;
      this.changeFont();
    },
    italicFont () {
      this.isItalic = !this.isItalic;
      this.changeFont();
    },
    underlineFont () {
      this.myDiagram.startTransaction('set all properties');
      this.myDiagram.selection.each(item => {
        this.myDiagram.model.setDataProperty(
          item.data,
          'isUnderline',
          !item.data['isUnderline']
        );
      });
      this.myDiagram.commitTransaction('set all properties');
    },
    strikethroughFont () {
      this.myDiagram.startTransaction('set all properties');
      this.myDiagram.selection.each(item => {
        this.myDiagram.model.setDataProperty(
          item.data,
          'isStrikethrough',
          !item.data['isStrikethrough']
        );
      });
      this.myDiagram.commitTransaction('set all properties');
    },
    fillBackground () {
      this.myDiagram.startTransaction('set all properties');
      this.myDiagram.selection.each(item => {
        this.myDiagram.model.setDataProperty(
          item.data,
          'fill',
          this.$refs.fill.value
        );
      });
      this.myDiagram.commitTransaction('set all properties');
    },
    showGrid () {
      this.flag_showgrid = !this.flag_showgrid;
    },
    changeStrokeColor () {
      this.myDiagram.startTransaction('set all properties');
      this.myDiagram.selection.each(item => {
        this.myDiagram.model.setDataProperty(
          item.data,
          'stroke',
          this.$refs.strokeColor.value
        );
      });
      this.myDiagram.commitTransaction('set all properties');
    },
    changeStrokeStyle () {
      this.myDiagram.startTransaction('set all properties');
      this.myDiagram.selection.each(item => {
        switch (this.strokeStyle) {
          case 'dashed':
            this.myDiagram.model.setDataProperty(item.data, 'strokeDashArray', [
              8,
              2
            ]);
            break;
          case 'dotted':
            this.myDiagram.model.setDataProperty(item.data, 'strokeDashArray', [
              2,
              2
            ]);
            break;
          default:
            this.myDiagram.model.setDataProperty(
              item.data,
              'strokeDashArray',
              null
            );
            break;
        }
      });
      this.myDiagram.commitTransaction('set all properties');
    },
    changeCrossover () {
      this.myDiagram.startTransaction('set all properties');
      this.myDiagram.selection.each(item => {
        this.myDiagram.model.setDataProperty(
          item.data,
          'strokeWidth',
          this.isCrossover ? 5 : 2
        );
      });
      this.myDiagram.commitTransaction('set all properties');
    },
    outportFile () {
      switch (this.selectedFormat) {
        case 'XML': {
          let getxml = this.diagram.diagramName + '.xml';
          let temp = JSON.parse(this.myDiagram.model.toJson());
          let xmlText = this.Json2XML(JSON.stringify(temp));
          this.doSave(xmlText, 'text/xml', getxml);
          break;
        }
        case 'JSON': {
          let temp = JSON.parse(this.myDiagram.model.toJson());
          var getjson = this.diagram.diagramName + '.json';
          this.doSave(JSON.stringify(temp), 'text/latex', getjson);
          break;
        }
        case 'PNG': {
          var getpng = this.diagram.diagramName + '.png';
          // eslint-disable-next-line one-var
          var pngWidth = this.myDiagram.documentBounds.width * 1.5;
          var pngHeight = this.myDiagram.documentBounds.height * 1.5;
          console.log(pngWidth, pngHeight);
          // eslint-disable-next-line one-var
          let bstr = atob(
              this.myDiagram
                .makeImageData({
                  scale: 1.5,
                  size: new go.Size(pngWidth, pngHeight),
                  maxSize: new go.Size(15000, 15000)
                })
                .split(',')[1]
            ),
            n = bstr.length,
            u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          this.doSave(u8arr, 'image/png', getpng);
          break;
        }
        case 'RDF': {
          var getrdf = this.diagram.diagramName + '.rdf';
          let rdf = this.Json2Rdf();
          if (rdf === false) {
            this.$alert('模型存在孤线，导出失败');
          } else {
            this.doSave(rdf, 'text/rdf', getrdf);
          }
          break;
        }
        case 'SVG': {
          var getsvg = this.diagram.diagramName + '.svg';
          // eslint-disable-next-line one-var
          let svgcontent = this.myDiagram.makeSvg();
          let textNodes = svgcontent.getElementsByTagName('text');
          for (let i = 0; i < textNodes.length; i++) {
            textNodes[i].setAttribute('style', '');
            textNodes[i].setAttribute('font-family', 'SimSun');
            if (textNodes[i].textContent.indexOf('<') === -1) {
            } else {
              textNodes[i].textContent = '';
            }
          }
          // eslint-disable-next-line one-var
          let bstr =
              '<?xml version="1.0" encoding="UTF-8"?>\n' +
              '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN"\n' +
              '"http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">\n' +
              new XMLSerializer().serializeToString(svgcontent),
            n = bstr.length,
            u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          this.doSave(bstr, 'image/svg+xml', getsvg);
          break;
        }
      }
    },
    Json2Rdf () {
      let jsonObj = JSON.parse(this.myDiagram.model.toJson());
      let modelName = jsonObj.class;
      let xmlDoc = document.implementation.createDocument(null, null);
      let root = xmlDoc.createElement('rdf:RDF');
      root.setAttribute(
        'xmlns:rdf',
        'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
      );
      root.setAttribute('xmlns:si', 'http://www.runoob.com/rdf/');
      xmlDoc.appendChild(root);
      let linkArray = jsonObj.linkDataArray;
      let nodeArray = jsonObj.nodeDataArray;
      let mapping = [];
      for (let i = 0; i < nodeArray.length; i++) {
        mapping.push(nodeArray[i].key);
        let node = xmlDoc.createElement('rdf:Description');
        node.setAttribute('rdf:about', modelName + '/' + nodeArray[i].Name);
        node.setAttribute(
          'Type',
          nodeArray[i].Type.substring(2, nodeArray[i].Type.length - 2)
        );
        node.setAttribute('NodeType', nodeArray[i].nodeType);
        root.appendChild(node);
      }
      for (let j = 0; j < linkArray.length; j++) {
        let linkType = linkArray[j].Linktype;
        console.log(linkType);
        linkType = linkType === undefined ? '普通连接' : linkType;
        let node = xmlDoc.createElement('si' + linkType);
        if (linkArray[j].to === undefined) {
          return false;
        } else {
          let text = root.children[mapping.indexOf(linkArray[j].to)].getAttribute('rdf:about');
          let textNode = xmlDoc.createTextNode(text);
          node.appendChild(textNode);
          root.children[mapping.indexOf(linkArray[j].from)].appendChild(node);
        }
      }
      return (
        '<?xml version="1.0" encoding="utf-8"?>\n\n' +
        new XMLSerializer().serializeToString(xmlDoc)
      );
    },
    undo () {
      this.myDiagram.commandHandler.undo();
    },
    redo () {
      this.myDiagram.commandHandler.redo();
    },
    cutSelection () {
      this.myDiagram.commandHandler.cutSelection();
    },
    copySelection () {
      this.myDiagram.commandHandler.copySelection();
    },
    pasteSelection () {
      this.myDiagram.commandHandler.pasteSelection(
        this.myDiagram.lastInput.documentPoint
      );
    },
    groupSelection () {
      this.myDiagram.commandHandler.groupSelection();
    },
    ungroupSelection () {
      this.myDiagram.commandHandler.ungroupSelection();
    },
    // evolutionValue () {
    //   console.log('evolutionValue')

    // },
    setDock (num) {
      if (this.shownDock === num) {
        this.shownDock = 0;
      } else this.shownDock = num;
    },
    saveDiagram (exit = false) {
      this.save();
      this.$ajax
        .put('api/diagram', {
          diagramName: this.$refs.projectName.innerHTML,
          jsonContent: JSON.stringify(
            JSON.parse(this.myDiagram.model.toJson())
          ),
          imageContent: this.imageData,
          diagramId: this.diagram.diagramId
        })
        .then(response => {
          console.log(response);
          const code = response.data.code;
          if (code === 1) {
            this.$alert('保存成功');
            // let data = response.data.data
            // for (let key of data.keys()) {
            //   let numericKey = parseInt(key);
            //   let node = this.myDiagram.findNodeForKey(numericKey)
            //   this.myDiagram.model.setDataProperty(node.data, 'DeployedPosition', data[key])
            // }
            if (exit === true) {
              this.$router.back(-1);
            }
          }
        })
        .catch(error => {
          this.$alert('保存失败，请重试');
          console.log(error);
        });
    },
    save () {
      // if (this.ifChangedView) {
      //   this.loadWholeView(this.backupsJson);
      //   this.ifChangedView = false;
      //   this.includeFlag = false;
      // }
      this.saveDiagramProperties(); // do this first, before writing to JSON
      this.imageData = this.myDiagram.makeImageData({
        size: new go.Size(318, 178),
        background: '#DAE4EE'
      });
      this.diagramAnalysis();
      this.myDiagram.isModified = false;
    },

    load (jsonText) {
      this.imageData = this.myDiagram.makeImageData({ background: '#DAE4EE' });
      this.myDiagram.model = go.Model.fromJson(jsonText);
      this.backupsJson = JSON.parse(this.myDiagram.model.toJson());
      this.loadDiagramProperties(); // do this after the Model.modelData has been brought into memory
    },
    // addModelNode (json, node) {
    //   let AjsonObj = JSON.parse(this.myDiagram.model.toJson())
    //   let anodeArray = AjsonObj.nodeDataArray.concat()
    //   this.imageData = this.myDiagram.makeImageData({background: '#DAE4EE'})
    //   this.myDiagram.model = go.Model.fromJson(jsonText)
    //   this.loadDiagramProperties() // do this after the Model.modelData has been brought into memory
    // },
    /* search operation */
    search () {
      this.search_diagram = [];
      this.search_diagram_json = [];
      let myself = this;
      this.$ajax
        .get('api/diagram/relevantpart', {
          params: {
            searchName: this.search_content,
            searchType: this.search_type
          }
        })
        .then(response => {
          console.log(response);
          const code = response.data.code;
          if (code === 1) {
            this.search_diagram_json = response.data.data;
            myself.$alert('检索成功');
          } else if (code === 0) {
            myself.$alert('检索结果为空');
          }
        })
        .catch(error => {
          this.$alert('检索结果为空');
          console.log(error);
        });
    },
    searchConfirm () {
      this.search();
      if (this.singleType) {
        this.isYanSingleDis3 = false;
      } else if (this.multiType) {
        this.isYanMultiDis2 = false;
      }
    },
    createSearchDiagram (diagramjson, index) {
      // 只要点击就执行
      this.activeclass = 'hidemapbox';
      console.log(index);
      console.log(this.chooseindex);
      if (index === this.chooseindex) {
        // 第二次点击执行
        console.log('x');
        this.chooseText = '请选择模板片段';

        return; // 阻止二次点击选择被关闭的影响
      }
      // 第一次点击的时候执行
      if (
        this.search_diagram[index] === null ||
        this.search_diagram[index] === undefined
      ) {
        this.search_diagram[index] = objGo(
          go.Palette,
          'mySearchDiagram' + index,
          {
            nodeTemplateMap: this.myDiagram.nodeTemplateMap,
            model: go.Model.fromJson(diagramjson)
          }
        );
      }
      this.search_diagram[index].commandHandler.selectAll();
      this.chooseindex = index + 1;
      this.chooseText = this.btnText + '' + this.chooseindex;
      this.chooseindex = index;
    },
    saveDiagramProperties () {
      this.myDiagram.model.modelData.position = go.Point.stringify(
        this.myDiagram.position
      );
    },
    loadDiagramProperties (e) {
      // set Diagram.initialPosition, not Diagram.position, to handle initialization side-effects
      let pos = this.myDiagram.model.modelData.position;
      if (pos) this.myDiagram.initialPosition = go.Point.parse(pos);
    },

    Json2XML (jsonText) {
      let xotree = new XML.ObjTree();
      let jsonTextWithParent = { myData: JSON.parse(jsonText) };
      let xmlText = xotree.writeXML(jsonTextWithParent);
      return xmlText;
    },

    XML2Json (xmlText) {
      let xotree = new XML.ObjTree();
      let jsonObject = xotree.parseXML(xmlText).myData;
      let nodeArr = [];
      let linkArr = [];
      let jsonText;

      if (jsonObject.nodeDataArray) {
        if (!(jsonObject.nodeDataArray instanceof Array)) {
          nodeArr.push(jsonObject.nodeDataArray);
          jsonObject.nodeDataArray = nodeArr;
        }
      }
      if (jsonObject.linkDataArray != null) {
        if (!(jsonObject.linkDataArray instanceof Array)) {
          linkArr.push(jsonObject.linkDataArray);
          jsonObject.linkDataArray = linkArr;
        }
      }
      for (let node of jsonObject.nodeDataArray) {
        if (node.isUnderline === 'false') {
          node.isUnderline = false;
        } else {
          node.isUnderline = true;
        }
        if (node.isStrikethrough === 'false') {
          node.isStrikethrough = false;
        } else {
          node.isStrikethrough = true;
        }
        node.strokeWidth = parseInt(node.strokeWidth);
        node.width = parseInt(node.width);
        node.height = parseInt(node.height);
        if (node.strokeDashArray) {
          node.strokeDashArray.forEach(function (v, i, a) {
            a[i] = parseInt(v);
          });
        }
      }
      jsonText = JSON.stringify(jsonObject);
      return jsonText;
    },
    mixGoalFile (files) {
      this.isMixed = true;
    },
    yanGoalFile (files) {
      this.isYanMixed = true;
    },
    chooseViewBySidebar (files) {
      this.isViewSidebarShow = true;
      this.roleArray = [];
      let jsonObj = JSON.parse(this.myDiagram.model.toJson());
      let nodeArray = jsonObj.nodeDataArray;
      for (let node of nodeArray) {
        if (node.Type === '<<角色>>' || node.Type === '<<角色作用域>>') {
          this.roleArray.push(node.Name.toString());
        }
        if (node.Type === '<<Actor>>' || node.Type === '<<Actor Boundary>>') {
          this.roleArray.push(node.Name.toString());
        }
      }
    },
    fetchAnalyContent() {
      if(!this.isGenerateRequirement) return;
      this.ifShowLoading = true;
      this.$ajax
        .post('api/generate/requirement', {
          fileName: this.diagram.diagramName,
          jsonData: this.diagram.jsonContent
        })
        .then(response => {
          this.ifShowLoading = false;
          const code = response.data.code;
          if (code === 1) {
            let data = response.data.data;
            let imageHTML = `<p><img src="${this.imageData}" style="text-align:center;width:300px;height:300px" alt="建模图" /></p>`;
            let closingH2Index = data.indexOf('</h2>');
            // 如果找到了 </h2> 标签
            if (closingH2Index !== -1) {
              // 在 </h2> 标签后插入图像 HTML
              let beforeH2 = data.slice(0, closingH2Index + 5);
              let afterH2 = data.slice(closingH2Index + 5);
              // 返回插入图像后的 HTML 字符串
              data = beforeH2 + imageHTML + afterH2;
            }
            this.msgFormEditor = data;
            this.analyContent = this.msgFormEditor; // 更新 analyContent
            this.isGenerateRequirement = false;
          }
        })
        .catch(error => {
          this.$alert('加载失败');
          this.ifShowLoading = false;
          console.log(error);
        });
    },
    getMsgFromGpt () {
      this.ifShowLoading = true;
      this.showGoalsName = [false, false, false];
      let param;
      if (this.logFile){
        param = {requirement: this.filter, file: this.logFile};
      }else{
        param = {requirement: this.filter};
      }
      console.log(param);
      // 发送请求到后端
      this.$ajax
        .post('api/generate/goals', param)
        .then(response => {
          this.ifShowLoading = false;
          const code = response.data.code;
          if (code === 1) {
            console.log(response.data.data)
            let data = JSON.parse(response.data.data);
            this.nonFunctionGoals = data.nonFunctionGoals.map(item => {
              return {name: item};
            });
            if (this.nonFunctionGoals.length !== 0) {
              // nonFunctionGoals 是空数组
              this.showGoalsName[0] = true
            }
            this.operationalGoals = data.operationalGoals.map(item => {
              return {name: item};
            });
            if (this.operationalGoals.length !== 0) {
              // nonFunctionGoals 是空数组
              this.showGoalsName[1] = true
            }
            this.functionGoals = data.functionGoals.map(item => {
              return {name: item};
            });
            if (this.functionGoals.length !== 0) {
              // nonFunctionGoals 是空数组
              this.showGoalsName[2] = true
            }
          }
        })
        .catch(error => {
          this.$alert('查询失败');
          this.ifShowLoading = false;
          console.log(error);
        });
      // 在接收到后端返回值之后隐藏加载容器
    },
    initDiagram() {
      this.myLittleDiagram = objGo(go.Diagram, "myLittleDiagramDiv", {
        nodeTemplateMap: this.myDiagram.nodeTemplateMap,
        linkTemplateMap: this.myDiagram.linkTemplateMap,
        groupTemplateMap: this.myDiagram.groupTemplateMap,
      });
      //console.log(this.myLittleDiagram)
      let jsonObj = JSON.parse(this.myDiagram.model.toJson());
      jsonObj.nodeDataArray = this.subDomainNodeArray[this.subDomainIndex];
      jsonObj.linkDataArray = this.subDomainLinkArray[this.subDomainIndex];
      console.log(jsonObj);
      console.log(this.myLittleDiagram);
      this.myLittleDiagram.model = go.Model.fromJson(JSON.stringify(jsonObj));
      let pos = this.myDiagram.model.modelData.position;
      if (pos) this.myLittleDiagram.initialPosition = go.Point.parse(pos);
    },
    addDomain() {
      let mySelf = this;
      console.log(this.subDomainName[this.subDomainIndex].name)
      let domainName = this.subDomainName[this.subDomainIndex].name
      this.$ajax.post('api/diagram/domain', {
        domainName: domainName,
        domainType: this.selectDomainType,
        jsonContent: JSON.stringify(
          JSON.parse(this.myLittleDiagram.model.toJson())
        )
      })
          .then(response => {
            console.log(response.data);
          })
          .catch(error => {
            console.log(error);
          });
    },
    changeDomain (index) {
      //this.initDiagram()
      this.subDomainIndex=index;
      // let jsonObj = JSON.parse(this.myDiagram.model.toJson());
      // jsonObj.nodeDataArray = this.subDomainNodeArray[this.subDomainIndex];
      // jsonObj.linkDataArray = this.subDomainLinkArray[this.subDomainIndex];
      // console.log(jsonObj);
      // console.log(this.myLittleDiagram);
      // this.myLittleDiagram.model = go.Model.fromJson(JSON.stringify(jsonObj));
      // let pos = this.myDiagram.model.modelData.position;
      // if (pos) this.myLittleDiagram.initialPosition = go.Point.parse(pos);
    },
    addGptNode () {
      console.log(this.addGoalName)
      let nodeData = null;
      switch (this.selectGoalType) {
        case '非功能性目标' :
          nodeData = {
            Name: this.addGoalName,
            Type: '<<非功能性目标>>',
            Annotation: '',
            figure: 'LoopLimit',
            nodeType: 'target',
            fill: '#5ed2b8',//rgb(224,228,204)
            stroke: 'rgb(184,188,164)',
            strokeWidth: 2,
            font: '10pt Times New Roman',
            isUnderline: false,
            isStrikethrough: false,
            textAlign: 'center',
            strokeDashArray: null,
            isNFR: 'Yes',
            Sign: 'No',
            Value: 0,
            Unit: 'No'
          }; break;
        case '功能性目标':
          nodeData = {
            Name: this.addGoalName,
            Type: '<<功能性目标>>',
            Annotation: '',
            figure: 'Pentagon',
            nodeType: 'target',
            fill: '#34d2af',//#8FBC8F
            stroke: '#2E8B57',
            strokeWidth: 2,
            font: '10pt Times New Roman',
            isUnderline: false,
            isStrikethrough: false,
            textAlign: 'center',
            strokeDashArray: null
          }; break;
        case '可操作性目标':
          nodeData = {
            Name: this.addGoalName,
            Type: '<<可操作性目标>>',
            Annotation: '',
            figure: 'CreateRequest',
            nodeType: 'target',
            fill: '#c0d9a2',
            stroke: '#8fd2c4',
            strokeWidth: 2,
            font: '10pt Times New Roman',
            isUnderline: false,
            isStrikethrough: false,
            textAlign: 'center',
            strokeDashArray: null
          }; break;
      }
      this.myDiagram.model.addNodeData(nodeData);
    },
    getNodeByName (name) {
      let jsonObj = JSON.parse(this.myDiagram.model.toJson());
      let nodeArray = jsonObj.nodeDataArray;
      for (let node of nodeArray) {
        if (node.Name === name) {
          return node.key;
        }
      }
    },
    getNodeByKey (key) {
      let jsonObj = JSON.parse(this.myDiagram.model.toJson());
      let nodeArray = jsonObj.nodeDataArray;
      for (let node of nodeArray) {
        if (node.key === key) {
          return node;
        }
      }
    },
    identifyGoalBox () {
      // 获取主模型
      let AjsonObj = JSON.parse(this.myDiagram.model.toJson());
      let anodeArray = AjsonObj.nodeDataArray.concat();
      let num = anodeArray.length;
      let userGoalArray = [];
      let depdGoalArray = [];
      let userRoleKeys = [];
      for (let i = 0; i < num; i++) {
        if (
          anodeArray[i].Type === '<<角色作用域>>' ||
          anodeArray[i].Type === '<<Actor Boundary>>'
        ) {
          if (
            anodeArray[i].Name.endsWith('user') ||
            anodeArray[i].Name.endsWith('User') ||
            anodeArray[i].Name.endsWith('用户') ||
            anodeArray[i].Name.endsWith('村民')
          ) {
            userRoleKeys.push(anodeArray[i].key + '');
          }
        }
      }
      for (let i = 0; i < num; i++) {
        if (
          anodeArray[i].Type === '<<功能性目标>>' ||
          anodeArray[i].Type === '<<Functional Goal>>'
        ) {
          if (userRoleKeys.includes(anodeArray[i].group + '')) {
            userGoalArray.push({
              text: anodeArray[i].Name,
              value: anodeArray[i].key
            });
          }
        }
      }
      this.mixUserGoals = userGoalArray.concat();
      for (let i = 0; i < num; i++) {
        if (
          anodeArray[i].Type === '<<功能性目标>>' ||
          anodeArray[i].Type === '<<Functional Goal>>'
        ) {
          if (!userRoleKeys.includes(anodeArray[i].group + '')) {
            depdGoalArray.push({
              text: anodeArray[i].Name,
              value: anodeArray[i].key
            });
          }
        }
      }
      this.mixDepdGoals = depdGoalArray.concat();
      this.isDisable1 = false;
      this.isDisable2 = true;
    },
    chooseMixGoal () {
      this.newGoals.push(this.userGoalKey + '');
      this.newGoals.push(this.depdGoalKey + '');
      this.identifyRedBox(this.newGoals);
      this.isDisable1 = true;
      this.isDisable2 = false;
    },
    importSubModel () {
      console.log('sub');
      if (this.diagram.diagramId === '1349348588718428161') {
        this.mixdiagramName = '多段物流';
        this.mixdiagramSimilarity = '73.5%';
        this.isSubShow = true;
        let jsoncontent =
          '{"class":"GraphLinksModel","modelData":{"position":"-832.6998087516922 -317.782322186654"},"nodeDataArray":[{"Name":"村民","Type":"<<角色作用域>>","minSize":{"class":"go.Size","width":20,"height":20},"fill":"#ffffff","isGroup":true,"category":"OfNodes","stroke":"gray","strokeWidth":2,"font":"bold  12pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-7,"Annotation":"undefined"},{"Name":"购物","Type":"<<功能性目标>>","Annotation":"","figure":"Pentagon","nodeType":"target","fill":"#34d2af","stroke":"#2E8B57","strokeWidth":2,"font":"10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-1,"loc":"-380 -225","group":-7,"Operation":"","Object":""},{"Name":"线上购物","Type":"<<功能性目标>>","Annotation":"","figure":"Pentagon","nodeType":"target","fill":"#34d2af","stroke":"#2E8B57","strokeWidth":2,"font":"10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-3,"loc":"-460 -135","group":-7,"Operation":"","Object":"","size":"90 49.05882352941176"},{"Name":"自己线上购物","Type":"<<功能性目标>>","Annotation":"","figure":"Pentagon","nodeType":"target","fill":"#34d2af","stroke":"#2E8B57","strokeWidth":2,"font":"10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-4,"loc":"-540 -35","group":-7,"Operation":"","Object":"","size":"100 70"},{"Name":"通过代购购买","Type":"<<可操作性目标>>","Annotation":"","figure":"CreateRequest","nodeType":"target","fill":"#c0d9a2","stroke":"#8fd2c4","strokeWidth":2,"font":"10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-6,"loc":"-330 45","group":-7,"size":"92 39"},{"Name":"线下购物","Type":"<<功能性目标>>","Annotation":"","figure":"Pentagon","nodeType":"target","fill":"#34d2af","stroke":"#2E8B57","strokeWidth":2,"font":"10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-8,"loc":"-310 -135","group":-7,"Operation":"","Object":"","size":"91 49.05882352941176"},{"Name":"便捷","Type":"<<非功能性目标>>","Annotation":"","figure":"LoopLimit","nodeType":"target","fill":"#5ed2b8","stroke":"rgb(184,188,164)","strokeWidth":2,"font":"10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"isNFR":"Yes","Sign":"No","Value":0,"Unit":"No","key":-2,"loc":"-260 -60","group":-7,"Degree":"undefined"},{"Name":"村小二","Type":"<<角色作用域>>","minSize":{"class":"go.Size","width":20,"height":20},"fill":"#ffffff","isGroup":true,"category":"OfNodes","stroke":"gray","strokeWidth":2,"font":"bold  12pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-9,"Annotation":"undefined"},{"Name":"线上购物代理","Type":"<<功能性目标>>","Annotation":"","figure":"Pentagon","nodeType":"target","fill":"#34d2af","stroke":"#2E8B57","strokeWidth":2,"font":"10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-10,"loc":"30 -226","group":-9,"Operation":"","Object":"","size":"105 68"},{"Name":"代理购买网货","Type":"<<可操作性目标>>","Annotation":"","figure":"CreateRequest","nodeType":"target","fill":"#c0d9a2","stroke":"#8fd2c4","strokeWidth":2,"font":"10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-11,"loc":"-30 -136","group":-9,"size":"81 34"},{"Name":"代理签收网货","Type":"<<可操作性目标>>","Annotation":"","figure":"CreateRequest","nodeType":"target","fill":"#c0d9a2","stroke":"#8fd2c4","strokeWidth":2,"font":"10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-12,"loc":"100 -136","group":-9,"size":"101 34"},{"Name":"利润","Type":"<<非功能性目标>>","Annotation":"","figure":"LoopLimit","nodeType":"target","fill":"#5ed2b8","stroke":"rgb(184,188,164)","strokeWidth":2,"font":"10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"isNFR":"Yes","Sign":"No","Value":0,"Unit":"No","key":-13,"loc":"30 -60","group":-9,"Degree":"undefined"},{"Name":"代购服务","Type":"<<资源>>","Annotation":"","figure":"ExternalOrganization","nodeType":"serviceValue","fill":"#Fec9c9","stroke":"#CDB7B5","strokeWidth":2,"font":"10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-14,"loc":"-180 170","size":"57 44"},{"Name":"通过代购线上购物","Type":"<<功能性目标>>","Annotation":"","figure":"Pentagon","nodeType":"target","fill":"#34d2af","stroke":"#2E8B57","strokeWidth":2,"font":"10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-15,"loc":"-400 -35","group":-7,"Operation":"","Object":"","size":"96 70"},{"Name":"支付商品","Type":"<<可操作性目标>>","Annotation":"","figure":"CreateRequest","nodeType":"target","fill":"#c0d9a2","stroke":"#8fd2c4","strokeWidth":2,"font":"10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-16,"loc":"-450 45","group":-7,"size":"51 34"},{"Name":"支付宝","Type":"<<角色>>","Annotation":"","minSize":{"class":"go.Size","width":20,"height":20},"figure":"Actor","width":50,"height":70,"nodeType":"target","fill":"#eac49e","stroke":"#CDAA7D","strokeWidth":2,"font":"bold  12pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-17,"loc":"-570 170"},{"Name":"支付平台","Type":"<<资源>>","Annotation":"","figure":"ExternalOrganization","nodeType":"serviceValue","fill":"#Fec9c9","stroke":"#CDB7B5","strokeWidth":2,"font":"10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-18,"loc":"-450 170","size":"60 34"},{"Name":"二级物流服务提供商","Type":"<<角色作用域>>","minSize":{"class":"go.Size","width":20,"height":20},"fill":"#ffffff","isGroup":true,"category":"OfNodes","stroke":"gray","strokeWidth":2,"font":"bold  12pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-20,"Annotation":""},{"Name":"二级物流分配","Type":"<<可操作性目标>>","Annotation":"","figure":"CreateRequest","nodeType":"target","fill":"#c0d9a2","stroke":"#8fd2c4","strokeWidth":2,"font":"10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-21,"loc":"258 87","group":-20,"size":"117 34"},{"Name":"二级物流分配服务","Type":"<<资源>>","Annotation":"","figure":"ExternalOrganization","nodeType":"serviceValue","fill":"#Fec9c9","stroke":"#CDB7B5","strokeWidth":2,"font":"10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-22,"loc":"258 -136","size":"131 45"},{"Name":"包裹分拣服务","Type":"<<资源>>","Annotation":"","figure":"ExternalOrganization","nodeType":"serviceValue","fill":"#Fec9c9","stroke":"#CDB7B5","strokeWidth":2,"font":"10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-23,"loc":"258.12835693359375 170","size":"115 34"},{"Name":"县级服务中心","Type":"<<角色作用域>>","minSize":{"class":"go.Size","width":20,"height":20},"fill":"#ffffff","isGroup":true,"category":"OfNodes","stroke":"gray","strokeWidth":2,"font":"bold  12pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-24,"Annotation":""},{"Name":"包裹分拣","Type":"<<可操作性目标>>","Annotation":"","figure":"CreateRequest","nodeType":"target","fill":"#c0d9a2","stroke":"#8fd2c4","strokeWidth":2,"font":"10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-25,"loc":"258.1668167114258 307","group":-24,"size":"76 34"},{"Name":"一级物流分配服务","Type":"<<资源>>","Annotation":"","figure":"ExternalOrganization","nodeType":"serviceValue","fill":"#Fec9c9","stroke":"#CDB7B5","strokeWidth":2,"font":"10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-26,"loc":"258.5 387","size":"129 40"},{"Name":"一级物流服务提供商","Type":"<<角色作用域>>","minSize":{"class":"go.Size","width":20,"height":20},"fill":"#ffffff","isGroup":true,"category":"OfNodes","stroke":"gray","strokeWidth":2,"font":"bold  12pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-27,"Annotation":"undefined"},{"Name":"一级物流分配","Type":"<<可操作性目标>>","Annotation":"","figure":"CreateRequest","nodeType":"target","fill":"#c0d9a2","stroke":"#8fd2c4","strokeWidth":2,"font":"10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-28,"loc":"-57.75712585449219 387","group":-27,"size":"104 34"},{"Name":"物流分配服务","Type":"<<资源>>","Annotation":"","figure":"ExternalOrganization","nodeType":"serviceValue","fill":"#Fec9c9","stroke":"#CDB7B5","strokeWidth":2,"font":"10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-31,"loc":"-310 390","size":"107 34"},{"Name":"商家","Type":"<<角色作用域>>","minSize":{"class":"go.Size","width":20,"height":20},"fill":"#ffffff","isGroup":true,"category":"OfNodes","stroke":"gray","strokeWidth":2,"font":"bold  12pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-32,"Annotation":""},{"Name":"打包发货","Type":"<<可操作性目标>>","Annotation":"","figure":"CreateRequest","nodeType":"target","fill":"#c0d9a2","stroke":"#8fd2c4","strokeWidth":2,"font":"10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-30,"loc":"-82 267","group":-32},{"Name":"价格便宜","Type":"<<非功能性目标>>","Annotation":"","figure":"LoopLimit","nodeType":"target","fill":"#5ed2b8","stroke":"rgb(184,188,164)","strokeWidth":2,"font":"10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"isNFR":"Yes","Sign":"No","Value":0,"Unit":"No","key":-33,"loc":"-260 100","group":-7,"Degree":"undefined"},{"Name":"第三方公司","Type":"<<角色作用域>>","minSize":{"class":"go.Size","width":20,"height":20},"fill":"#ffffff","isGroup":true,"category":"OfNodes","stroke":"gray","strokeWidth":2,"font":"bold  12pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-34,"Annotation":""},{"Name":"村淘电子商务运营基础建设","Type":"<<功能性目标>>","Annotation":"","figure":"Pentagon","nodeType":"target","fill":"#34d2af","stroke":"#2E8B57","strokeWidth":2,"font":"10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-35,"loc":"-513.5104649861653 315.47058823529414","group":-34,"Operation":"","Object":"","size":"192 70"},{"Name":"物流分配","Type":"<<可操作性目标>>","Annotation":"","figure":"CreateRequest","nodeType":"target","fill":"#c0d9a2","stroke":"#8fd2c4","strokeWidth":2,"font":"10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-36,"loc":"-513.5 390","group":-34,"size":"95 40"}],"linkDataArray":[{"points":[-380,-204.96430601470712,-380,-194.96430601470712,-380,-196,-380,-196,-380,-188,-310,-188,-310,-169.52941176470588,-310,-159.52941176470588],"toArrow":"Circle","toArrowFill":"Transparent","Linktype":"OR","from":-1,"to":-8},{"points":[-380,-204.96430601470712,-380,-194.96430601470712,-380,-182.24685888970652,-460,-182.24685888970652,-460,-169.52941176470588,-460,-159.52941176470588],"toArrow":"Circle","toArrowFill":"Transparent","Linktype":"OR","from":-1,"to":-3},{"points":[-460,-110.47058823529412,-460,-100.47058823529412,-460,-90.23529411764706,-400,-90.23529411764706,-400,-80,-400,-70],"toArrow":"Circle","toArrowFill":"Transparent","Linktype":"OR","from":-3,"to":-15},{"points":[-460,-110.47058823529412,-460,-100.47058823529412,-460,-90.23529411764706,-540,-90.23529411764706,-540,-80,-540,-70],"toArrow":"Circle","toArrowFill":"Transparent","Linktype":"OR","from":-3,"to":-4},{"points":[-330,25.5,-330,15.5,-330,-6.083333333333332,-260,-6.083333333333332,-260,-27.666666666666664,-260,-37.666666666666664],"toArrow":"DoubleFeathers","Linktype":"促进","from":-6,"to":-2},{"points":[-30,-119,-30,-109,-30,-100.66666666666666,30,-100.66666666666666,30,-92.33333333333333,30,-82.33333333333333],"toArrow":"DoubleFeathers","Linktype":"促进","from":-11,"to":-13},{"points":[100,-119,100,-109,100,-100.66666666666666,30,-100.66666666666666,30,-92.33333333333333,30,-82.33333333333333],"toArrow":"DoubleFeathers","Linktype":"促进","from":-12,"to":-13},{"points":[30,-192,30,-182,30,-172.5,100,-172.5,100,-163,100,-153],"toArrow":"Circle","Linktype":"AND","from":-10,"to":-12},{"points":[30,-192,30,-182,30,-172.5,-30,-172.5,-30,-163,-30,-153],"toArrow":"Circle","Linktype":"AND","from":-10,"to":-11},{"from":-6,"to":-14,"points":[-330,64.5,-330,74.5,-330,76,-330,76,-330,170,-218.5,170,-208.5,170]},{"from":-14,"to":-10,"points":[-151.5,161.9791015625,-141.5,161.9791015625,-140,161.9791015625,-140,-234.02089843750002,-32.5,-234.02089843750002,-22.5,-234.02089843750002]},{"points":[-400,0,-400,10,-400,12.75,-330,12.75,-330,15.5,-330,25.5],"toArrow":"Circle","Linktype":"AND","from":-15,"to":-6},{"points":[-400,0,-400,10,-400,14,-450,14,-450,18,-450,28],"toArrow":"Circle","Linktype":"AND","from":-15,"to":-16},{"from":-16,"to":-18,"points":[-450,62,-450,72,-450,107.5,-450,107.5,-450,143,-450,153]},{"from":-18,"to":-17,"points":[-480,170,-490,170,-503.6666666666667,170,-503.6666666666667,170,-517.3333333333334,170,-527.3333333333334,170]},{"from":-12,"to":-22,"points":[150.5,-136,160.5,-136,160.5,-136,160.5,-136,182.5,-136,192.5,-136]},{"from":-22,"to":-21,"points":[258,-113.5,258,-103.5,258,-103.5,258,-103.5,258,60,258,70]},{"from":-21,"to":-23,"points":[258,104,258,114,258.12835693359375,114,258.12835693359375,114,258.12835693359375,143,258.12835693359375,153]},{"from":-23,"to":-25,"points":[258.12835693359375,187,258.12835693359375,197,258.1668167114258,197,258.1668167114258,197,258.1668167114258,280,258.1668167114258,290]},{"from":-25,"to":-26,"points":[258.1668167114258,324,258.1668167114258,334,258.5,334,258.5,334,258.5,357,258.5,367]},{"from":-26,"to":-28,"points":[194,387,184,387,184,387,184,387,4.2428741455078125,387,-5.7571258544921875,387]},{"from":-28,"to":-31,"points":[-109.75712585449219,387,-119.75712585449219,387,-183.1285629272461,387,-183.1285629272461,390,-246.5,390,-256.5,390]},{"from":-30,"to":-31,"points":[-110.65997314453125,267,-120.65997314453125,267,-124,267,-124,267,-310,267,-310,363,-310,373]},{"points":[-284,45,-274,45,-260,45,-260,56.333333333333336,-260,67.66666666666667,-260,77.66666666666667],"toArrow":"OpenTriangleLine","Linktype":"阻碍","from":-6,"to":-33},{"points":[-513.5104649861653,343.97716604404235,-513.5104649861653,353.97716604404235,-513.5104649861653,356.9885830220212,-513.5,356.9885830220212,-513.5,360,-513.5,370],"toArrow":"Circle","Linktype":"AND","from":-35,"to":-36},{"from":-31,"to":-36,"points":[-363.5,390,-373.5,390,-373.5,390,-373.5,390,-456,390,-466,390]}]}';
        let keys = ['-15_sub', '-16_sub', '-6_sub', '-2_sub', '-33_sub'];
        this.showSubModel(jsoncontent, keys);
        let keys1 = [];
        keys1.push(keys[0]);
        this.identifyRedBox(keys1);
        this.subMatchKeys = keys1.concat();
        keys.shift();
        this.yellowGoals = keys.concat();
        this.identifyRedBox(keys, 'yellow');
      } else {
        this.$ajax
          .put('api/mix/submodel', {
            userGoal: this.newGoals[0],
            jsonContent: JSON.stringify(
              JSON.parse(this.myDiagram.model.toJson())
            )
          })
          .then(response => {
            const code = response.data.code;
            if (code === 1) {
              // 展示辅文件名字
              this.mixdiagramName = response.data.data[0];
              this.mixdiagramSimilarity = response.data.data[1];
              this.isSubShow = true;
              let keys = [];
              let leg = response.data.data.length;
              for (let i = 3; i < leg; i++) {
                keys.push(response.data.data[i]);
              }
              this.showSubModel(response.data.data[2], keys);
              let keys1 = [];
              keys1.push(keys[0]);
              this.subMatchKeys = keys1.concat();
              this.identifyRedBox(keys1);
              keys.shift();
              this.yellowGoals = keys.concat();
              this.identifyRedBox(keys, 'yellow');
            }
          })
          .catch(error => {
            this.$alert('识别失败，请重试');
            console.log(error);
          });
      }
    },
    showSubModel (subModel) {
      // let subModel = '{"class":"GraphLinksModel","modelData":{"position":"-963.0999552408853 -354"},"nodeDataArray":[{"Name":"Payment service","Type":"<<资源>>","Annotation":"","figure":"ExternalOrganization","nodeType":"serviceValue","fill":"#Fec9c9","stroke":"#CDB7B5","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-4,"loc":"-400 -90","size":"85 31"},{"Name":"Ant insurance","Type":"<<角色作用域>>","minSize":{"class":"go.Size","width":20,"height":20},"fill":"#ffffff","isGroup":true,"category":"OfNodes","stroke":"gray","strokeWidth":2,"font":"bold  12pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-15,"Annotation":""},{"Name":"Guarantee mechanism provided for users to reduce the loss","Type":"<<功能性目标>>","Annotation":"","figure":"Pentagon","nodeType":"target","fill":"#34d2af","stroke":"#2E8B57","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-16,"loc":"-403 32","group":-15,"Operation":"undefined","Object":"undefined","size":"224 84"},{"Name":"Provide insurance purchase","Type":"<<可操作性目标>>","Annotation":"","figure":"CreateRequest","nodeType":"target","fill":"#c0d9a2","stroke":"#8fd2c4","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-17,"loc":"-503 212","group":-15,"size":"114 44"},{"Name":"Commissioned the insurance company","Type":"<<可操作性目标>>","Annotation":"","figure":"CreateRequest","nodeType":"target","fill":"#c0d9a2","stroke":"#8fd2c4","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-18,"loc":"-322.5 212","group":-15,"size":"116 45"},{"Name":"Insurance company","Type":"<<角色>>","Annotation":"","minSize":{"class":"go.Size","width":20,"height":20},"figure":"Actor","width":50,"height":70,"nodeType":"target","fill":"#eac49e","stroke":"#CDAA7D","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-19,"loc":"-606 280","size":"113 74"},{"Name":"Insurance data","Type":"<<资源>>","Annotation":"","figure":"ExternalOrganization","nodeType":"serviceValue","fill":"#Fec9c9","stroke":"#CDB7B5","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-21,"loc":"-492 -89","size":"78 32"},{"Name":"Alipay","Type":"<<角色>>","Annotation":"","minSize":{"class":"go.Size","width":20,"height":20},"figure":"Actor","width":50,"height":70,"nodeType":"target","fill":"#eac49e","stroke":"#CDAA7D","strokeWidth":2,"font":"bold  12pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-22,"loc":"-290 -90","size":"83 47"},{"Name":"Insurance service","Type":"<<资源>>","Annotation":"","figure":"ExternalOrganization","nodeType":"serviceValue","fill":"#Fec9c9","stroke":"#CDB7B5","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-23,"loc":"-322.5 280","size":"107 32"},{"Name":"User","Type":"<<角色作用域>>","minSize":{"class":"go.Size","width":20,"height":20},"fill":"#ffffff","isGroup":true,"category":"OfNodes","stroke":"gray","strokeWidth":2,"font":"bold  12pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-7,"Annotation":""},{"Name":"Reduce loss","Type":"<<功能性目标>>","Annotation":"","figure":"Pentagon","nodeType":"target","fill":"#34d2af","stroke":"#2E8B57","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-1,"loc":"-412 -453","group":-7,"Operation":"undefined","Object":"undefined","size":"114 35"},{"Name":"Organize insurance bought online","Type":"<<可操作性目标>>","Annotation":"","figure":"CreateRequest","nodeType":"target","fill":"#c0d9a2","stroke":"#8fd2c4","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-3,"loc":"-492 -310","group":-7,"size":"120 46"},{"Name":"Organize insurance bought offline","Type":"<<可操作性目标>>","Annotation":"","figure":"CreateRequest","nodeType":"target","fill":"#c0d9a2","stroke":"#8fd2c4","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-8,"loc":"-332 -310","group":-7,"size":"120 46"},{"Name":"Choose insurance online","Type":"<<可操作性目标>>","Annotation":"","figure":"CreateRequest","nodeType":"target","fill":"#c0d9a2","stroke":"#8fd2c4","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-9,"loc":"-612 -230","group":-7,"size":"97 44"},{"Name":"Buy insurance online","Type":"<<可操作性目标>>","Annotation":"","figure":"CreateRequest","nodeType":"target","fill":"#c0d9a2","stroke":"#8fd2c4","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-10,"loc":"-492 -230","group":-7,"size":"89 43"},{"Name":"Pay by Alipay","Type":"<<可操作性目标>>","Annotation":"","figure":"CreateRequest","nodeType":"target","fill":"#c0d9a2","stroke":"#8fd2c4","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-11,"loc":"-442 -160","group":-7,"size":"62 34"},{"Name":"Insurance bought to reduce loss","Type":"<<功能性目标>>","Annotation":"","figure":"Pentagon","nodeType":"target","fill":"#34d2af","stroke":"#2E8B57","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-24,"loc":"-412 -383","group":-7,"Operation":"undefined","Object":"undefined","size":"109 73"},{"Name":"Convenient payment","Type":"<<非功能性目标>>","Annotation":"","figure":"LoopLimit","nodeType":"target","fill":"rgb(224,228,204)","stroke":"rgb(184,188,164)","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-2,"loc":"-592 -160","group":-7,"Degree":"","NFR Type":"","size":"76 43"},{"Name":"Pay for insurance online","Type":"<<可操作性目标>>","Annotation":"","figure":"CreateRequest","nodeType":"target","fill":"#c0d9a2","stroke":"#8fd2c4","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-20,"loc":"-362 -230","group":-7,"size":"96 41"},{"Name":"Pay by credit card","Type":"<<可操作性目标>>","Annotation":"","figure":"CreateRequest","nodeType":"target","fill":"#c0d9a2","stroke":"#8fd2c4","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-25,"loc":"-362 -160","group":-7,"size":"65 33"},{"Name":"Pay by other means","Type":"<<可操作性目标>>","Annotation":"","figure":"CreateRequest","nodeType":"target","fill":"#c0d9a2","stroke":"#8fd2c4","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-26,"loc":"-282 -160","group":-7,"size":"73 32"},{"Name":"Insurance service provided to reduce loss","Type":"<<功能性目标>>","Annotation":"","figure":"Pentagon","nodeType":"target","fill":"#34d2af","stroke":"#2E8B57","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-27,"loc":"-403 132","group":-15,"Operation":"","Object":"","size":"165 75"}],"linkDataArray":[{"from":-4,"to":-22,"points":[-357.5,-90,-347.5,-90,-344.5,-90,-344.5,-90,-341.5,-90,-331.5,-90]},{"from":-21,"to":-17,"points":[-531,-89,-541,-89,-540,-89,-540,-89,-616.65625,-89,-616.65625,212,-570,212,-560,212]},{"from":-18,"to":-17,"points":[-380.5,212,-390.5,212,-413.25,212,-413.25,212,-436,212,-446,212]},{"from":-23,"to":-19,"points":[-376,280,-386,280,-462.75,280,-462.75,280,-539.5,280,-549.5,280]},{"points":[-412,-438.65121959281333,-412,-428.65121959281333,-412,-428.65121959281333,-412,-429.5,-412,-429.5,-412,-419.5],"toArrow":"Circle","Linktype":"AND","from":-1,"to":-24},{"points":[-357.5,-383,-347.5,-383,-332,-383,-332,-363,-332,-343,-332,-333],"toArrow":"Circle","toArrowFill":"Transparent","Linktype":"OR","from":-24,"to":-8},{"points":[-458.50981824683413,-383,-468.50981824683413,-383,-492,-383,-492,-363,-492,-343,-492,-333],"toArrow":"Circle","toArrowFill":"Transparent","Linktype":"OR","from":-24,"to":-3},{"points":[-492,-287,-492,-277,-492,-269.25,-492,-269.25,-492,-261.5,-492,-251.5],"toArrow":"Circle","Linktype":"AND","from":-3,"to":-10},{"points":[-432,-310,-422,-310,-420,-310,-420,-276,-362,-276,-362,-260.5,-362,-250.5],"toArrow":"Circle","Linktype":"AND","from":-3,"to":-20},{"points":[-552,-310,-562,-310,-562,-274,-612,-274,-612,-262,-612,-252],"toArrow":"Circle","Linktype":"AND","from":-3,"to":-9},{"points":[-536.5,-230,-546.5,-230,-550,-230,-550,-230,-553.5,-230,-563.5,-230],"toArrow":"SidewaysV","Linktype":"依赖","from":-10,"to":-9},{"points":[-410,-230,-420,-230,-428.75,-230,-428.75,-230,-437.5,-230,-447.5,-230],"toArrow":"SidewaysV","Linktype":"依赖","from":-20,"to":-10},{"points":[-362,-209.5,-362,-199.5,-362,-192.75,-282,-192.75,-282,-186,-282,-176],"toArrow":"Circle","toArrowFill":"Transparent","Linktype":"OR","from":-20,"to":-26},{"points":[-362,-209.5,-362,-199.5,-362,-193,-362,-193,-362,-186.5,-362,-176.5],"toArrow":"Circle","toArrowFill":"Transparent","Linktype":"OR","from":-20,"to":-25},{"points":[-362,-209.5,-362,-199.5,-362,-193.25,-442,-193.25,-442,-187,-442,-177],"toArrow":"Circle","toArrowFill":"Transparent","Linktype":"OR","from":-20,"to":-11},{"points":[-473,-160,-483,-160,-513.5,-160,-513.5,-160,-544,-160,-554,-160],"toArrow":"DoubleFeathers","Linktype":"促进","from":-11,"to":-2},{"points":[-442,-143,-442,-133,-442,-132,-400,-132,-400,-115.5,-400,-105.5],"toArrow":"SidewaysV","Linktype":"依赖","from":-11,"to":-4},{"points":[-492,-208.5,-492,-198.5,-492,-198.5,-492,-198.5,-492,-115,-492,-105],"toArrow":"SidewaysV","Linktype":"依赖","from":-10,"to":-21},{"points":[-403,74,-403,84,-403,84.25,-403,84.25,-403,84.5,-403,94.5],"toArrow":"Circle","Linktype":"AND","from":-16,"to":-27},{"points":[-332.6719591193088,132,-322.6719591193088,132,-322.6719591193088,179.5,-322.6719591193088,179.5,-322.5,179.5,-322.5,189.5],"toArrow":"Circle","Linktype":"AND","from":-27,"to":-18},{"points":[-485.5,132,-495.5,132,-503,132,-503,156,-503,180,-503,190],"toArrow":"Circle","Linktype":"AND","from":-27,"to":-17},{"points":[-322.5,234.5,-322.5,244.5,-322.5,244.5,-322.5,244.5,-322.5,254,-322.5,264],"toArrow":"SidewaysV","Linktype":"依赖","from":-18,"to":-23}]}'
      let BjsonObj = JSON.parse(subModel);
      // 计算主模型的最右点位置
      let AjsonObj = JSON.parse(this.myDiagram.model.toJson());
      let alinkArray = AjsonObj.linkDataArray;
      let anodeArray = AjsonObj.nodeDataArray;
      let rightPointest = 0.0;
      let leftPointest = 0.0;
      let upPoint = 0.0;
      let downPoint = 0.0;
      for (let p = 0; p < anodeArray.length; p++) {
        if (anodeArray[p].loc !== undefined) {
          let location = anodeArray[p].loc.split(' ');
          let x = parseFloat(location[0]);
          if (x < leftPointest) {
            leftPointest = x + 0.0;
          }
          if (x > rightPointest) {
            rightPointest = x + 0.0;
          }
          let y = parseFloat(location[1]);
          if (y < upPoint) {
            upPoint = y + 0.0;
          }
          if (y > downPoint) {
            downPoint = y + 0.0;
          }
        }
      }
      let linkArray = BjsonObj.linkDataArray;
      let nodeArray = BjsonObj.nodeDataArray;
      let BleftPointest = 0.0;
      for (let p = 0; p < nodeArray.length; p++) {
        if (nodeArray[p].loc !== undefined) {
          let location = nodeArray[p].loc.split(' ');
          let x = parseFloat(location[0]);
          if (x < BleftPointest) {
            BleftPointest = x + 0.0;
          }
          let y = parseFloat(location[1]);
          if (y < upPoint) {
            upPoint = y + 0.0;
          }
          if (y > downPoint) {
            downPoint = y + 0.0;
          }
        }
      }
      let moveLength = 0.0;
      let splitLineX = 0.0;
      if (BleftPointest >= rightPointest) {
        moveLength = 300.0;
        splitLineX =
          (BleftPointest - rightPointest + 300.0) / 2.0 + rightPointest;
      } else {
        moveLength = rightPointest - BleftPointest + 300.0;
        splitLineX = BleftPointest + moveLength - 180.0;
      }
      this.splitLineLocX = splitLineX;
      for (let i = 0; i < nodeArray.length; i++) {
        nodeArray[i].key = nodeArray[i].key + '_sub';
        if (nodeArray[i].group !== undefined) {
          nodeArray[i].group = nodeArray[i].group + '_sub';
        }
        if (nodeArray[i].loc !== undefined) {
          let location = nodeArray[i].loc.split(' ');
          let x = parseFloat(location[0]) + moveLength;
          let y = parseFloat(location[1]);
          // console.log(x)
          // console.log(y)
          nodeArray[i].loc = x.toString() + ' ' + y.toString();
          // nodeArray[i].loc
        }
      }
      for (let j = 0; j < linkArray.length; j++) {
        linkArray[j].to = linkArray[j].to + '_sub';
        linkArray[j].from = linkArray[j].from + '_sub';
        let pointSet = linkArray[j].points;
        for (let p = 0; p < pointSet.length; p++) {
          pointSet[p] = pointSet[p] + moveLength;
          p++;
        }
        linkArray[j].points = pointSet;
      }

      for (let i = 0; i < anodeArray.length; i++) {
        nodeArray.push(anodeArray[i]);
      }
      for (let j = 0; j < alinkArray.length; j++) {
        linkArray.push(alinkArray[j]);
      }
      // // 添加分割虚线
      // let link = {};
      // let linePointsSet = [];
      // linePointsSet.push(splitLineX);
      // linePointsSet.push(upPoint - 1250.0);
      // linePointsSet.push(splitLineX);
      // linePointsSet.push(downPoint + 1250.0);
      // link.points = linePointsSet;
      // link.strokeDashArray = [1, 3];
      // link.toArrow = '';
      // link.Linktype = '虚线';
      // linkArray.push(link);
      // 将模型展示在画板中
      this.imageData = this.myDiagram.makeImageData({ background: '#DAE4EE' });
      this.myDiagram.model = go.Model.fromJson(JSON.stringify(BjsonObj));
      this.loadDiagramProperties();
      this.isDisable1 = true;
      this.isDisable2 = true;
      this.isDis1 = true;
      this.isDis2 = false;
    },
    secondStep () {
      this.generateTemplateFrag();
      // this.isDisable1 = false
    },
    identifySubRedBox () {
      // 获取主模型
      let AjsonObj = JSON.parse(this.myDiagram.model.toJson());
      let anodeArray = AjsonObj.nodeDataArray.concat();
      let nodeArray = [];
      let target = '_sub';
      for (let i = 0; i < anodeArray.length; i++) {
        let key = anodeArray[i].key + '';
        let start = key.length - target.length;
        let arr = key.substr(start, target.length);
        if (arr === target) {
          continue;
        }
        nodeArray.push(anodeArray[i]);
      }
      AjsonObj.nodeDataArray = nodeArray.concat();
      AjsonObj.linkDataArray = null;
      this.$ajax
        .put('api/mix/submodel', {
          domainName: this.domainName,
          jsonContent: JSON.stringify(AjsonObj)
        })
        .then(response => {
          console.log(response);
          const code = response.data.code;
          if (code === 1) {
            let keys = response.data.data;
            let keys1 = [];
            keys1.push(keys[0]);
            this.identifyRedBox(keys1);
            keys.shift();
            this.identifyRedBox(keys, 'yellow');
            this.isDisable1 = true;
            this.isDisable2 = false;
          }
        })
        .catch(error => {
          this.$alert('识别失败，请重试');
          console.log(error);
        });
      // let keys1 = []
      // keys1.push('-1_sub')
      // this.identifyRedBox(keys1)
      // let keys2 = []
      // keys2.push('-24_sub')
      // keys2.push('-3_sub')
      // keys2.push('-8_sub')
      // keys2.push('-9_sub')
      // keys2.push('-10_sub')
      // keys2.push('-2_sub')
      // keys2.push('-11_sub')
      // keys2.push('-20_sub')
      // keys2.push('-25_sub')
      // keys2.push('-26_sub')
      // this.identifyRedBox(keys2, 'yellow')
      // this.isDisable1 = true
      // this.isDisable2 = false
    },
    identifyRedBox (keys, color = 'red') {
      // console.log(keys)
      let jsonObj = JSON.parse(this.myDiagram.model.toJson());
      let nodeArray = jsonObj.nodeDataArray;
      // let linkArray = jsonObj.linkDataArray
      for (let i = 0; i < nodeArray.length; i++) {
        for (let j = 0; j < keys.length; j++) {
          if (keys[j] === nodeArray[i].key + '') {
            if (nodeArray[i].isGroup !== true) {
              console.log('find');
              nodeArray[i].stroke = color;
              nodeArray[i].strokeWidth = 3;
              nodeArray[i].strokeDashArray = [4, 2];
            }
          }
        }
        /* if (keys.includes(nodeArray[i].key + '')) {
          if (nodeArray[i].isGroup !== true) {
            console.log('find')
            nodeArray[i].stroke = color
            nodeArray[i].strokeWidth = 3
            nodeArray[i].strokeDashArray = [4, 2]
          }
        } */
      }
      this.imageData = this.myDiagram.makeImageData({ background: '#DAE4EE' });
      this.myDiagram.model = go.Model.fromJson(JSON.stringify(jsonObj));
      this.loadDiagramProperties();
    },
    generateTemplateFrag () {
      let keys = this.yellowGoals;
      this.copyNodesLinksToKey(this.userGoalKey, keys, true, -150, this.subMatchKeys[0]);
      // keys.push('-24_sub')
      // keys.push('-3_sub')
      // keys.push('-8_sub')
      // keys.push('-9_sub')
      // keys.push('-10_sub')
      // keys.push('-2_sub')
      // keys.push('-11_sub')
      // keys.push('-20_sub')
      // keys.push('-25_sub')
      // keys.push('-26_sub')
      // this.copyNodesLinks(keys)
      this.isDisable1 = true;
      this.isDisable2 = true;
      this.isDis2 = true;
      this.isDis3 = false;
    },
    thirdStep () {
      this.deleteModelColor();
      let depGoals = this.newGoals.concat();
      depGoals.shift();
      this.identifyRedBox(depGoals);
      this.isDisable1 = false;
      let keys = this.yellowGoals;
      let groupKey = this.myDiagram.findNodeForKey(keys[0]).data.group;
      let jsonObj = JSON.parse(this.myDiagram.model.toJson());
      let nodeArray = jsonObj.nodeDataArray;
      let linkArray = jsonObj.linkDataArray;
      // let dependenceArray = []
      // let target = '_sub'
      let groupNodes = [];
      for (let i = 0; i < nodeArray.length; i++) {
        if (nodeArray[i].group === groupKey) {
          groupNodes.push(nodeArray[i].key);
        }
      }
      let firstNodes = [];
      for (let i = 0; i < linkArray.length; i++) {
        if (
          groupNodes.includes(linkArray[i].to + '') &&
          groupNodes.includes(linkArray[i].from + '')
        ) {
          continue;
        } else {
          if (keys.includes(linkArray[i].to + '')) {
            firstNodes.push(linkArray[i].from);
          }
          if (keys.includes(linkArray[i].from + '')) {
            firstNodes.push(linkArray[i].to);
          }
        }
      }
      this.relevantNodes(firstNodes);
      let relevantDeps = [];
      for (let i = 0; i < firstNodes.length; i++) {
        if (!groupNodes.includes(firstNodes[i])) {
          relevantDeps.push(firstNodes[i]);
        }
      }
      let groupsKey = [];
      for (let i = 0; i < relevantDeps.length; i++) {
        let key = this.myDiagram.findNodeForKey(relevantDeps[i]).data.group;
        if (key !== undefined && !groupsKey.includes(key)) {
          groupsKey.push(key);
        }
      }
      for (let i = 0; i < groupsKey.length; i++) {
        relevantDeps.push(groupsKey[i]);
      }
      // for (let i = 0; i < nodeArray.length; i++) {
      //   let key = nodeArray[i].key + ''
      //   let start = key.length - target.length
      //   let arr = key.substr(start, target.length)
      //   if (arr === target) {
      //     if (keys.includes(nodeArray[i].key + '')) {
      //       continue
      //     } else {
      //       if (nodeArray[i].key !== groupKey) {
      //         if (nodeArray[i].group !== groupKey) {
      //           dependenceArray.push(nodeArray[i].key)
      //         }
      //       }
      //     }
      //   }
      // }
      this.yellowGoals = relevantDeps.concat();
      this.identifyRedBox(relevantDeps, 'yellow');
    },
    relevantNodes (nodes) {
      let jsonObj = JSON.parse(this.myDiagram.model.toJson());
      let linkArray = jsonObj.linkDataArray;
      for (let n = 0; n < nodes.length; n++) {
        for (let i = 0; i < linkArray.length; i++) {
          if (linkArray[i].from === nodes[n]) {
            if (!nodes.includes(linkArray[i].to)) {
              nodes.push(linkArray[i].to);
            }
          }
          if (linkArray[i].to === nodes[n]) {
            if (!nodes.includes(linkArray[i].from)) {
              nodes.push(linkArray[i].from);
            }
          }
        }
      }
    },
    identifyDependent () {
      // this.copyNodesLinks(this.yellowGoals)
      this.copyNodesLinksToKey(this.newGoals[1], this.yellowGoals, false, 400);
      this.isDisable1 = true;
      this.isDisable2 = false;
    },
    matchDependent () {
      this.deleteModelColor('sub');
      let jsonObj = JSON.parse(this.myDiagram.model.toJson());
      let nodeArray = jsonObj.nodeDataArray;
      let depkeys = this.yellowGoals;
      let dependenceArray = [];
      for (let i = 0; i < nodeArray.length; i++) {
        if (depkeys.includes(nodeArray[i].key + '')) {
          dependenceArray.push(nodeArray[i]);
        }
      }
      jsonObj.nodeDataArray = dependenceArray.concat();
      jsonObj.linkDataArray = [];
      this.$ajax
        .put('api/mix/dependence', {
          jsonContent: JSON.stringify(
            JSON.parse(this.myDiagram.model.toJson())
          ),
          dependentGoal: this.newGoals[1],
          dependenceJson: JSON.stringify(jsonObj)
        })
        .then(response => {
          console.log(response);
          const code = response.data.code;
          if (code === 1) {
            let depkey = response.data.data;
            depkey = depkey + '_cy';
            let depkeys = [];
            depkeys.push(depkey);
            console.log('dep', depkey);
            this.identifyRedBox(depkeys);
            let roleKey = this.myDiagram.findNodeForKey(depkey).data.group;
            this.depo = this.myDiagram.findNodeForKey(roleKey).data.Name;
            roleKey = this.myDiagram.findNodeForKey(this.newGoals[1]).data
              .group;
            this.deps = this.myDiagram.findNodeForKey(roleKey).data.Name;
            this.isDisable1 = true;
            this.isDisable2 = true;
            this.isDisable3 = false;
          }
        })
        .catch(error => {
          this.$alert('识别失败，请重试');
          console.log(error);
        });
    },
    mixedDependent () {
      this.isDisable3 = true;
      this.isDis3 = true;
      this.isDis4 = false;
    },
    findGroupName (nodeKey, name) {
      let jsonObj = JSON.parse(this.myDiagram.model.toJson());
      let nodeArray = jsonObj.nodeDataArray;
      let groupKey = '';
      for (let i = 0; i < nodeArray.length; i++) {
        if (nodeArray[i].key === nodeKey) {
          groupKey = nodeArray[i].group;
          console.log('g', groupKey);
          break;
        }
      }
      for (let i = 0; i < nodeArray.length; i++) {
        if (nodeArray[i].key === groupKey) {
          console.log(nodeArray[i].Name);
          name = nodeArray[i].Name;
        }
      }
    },
    deleteColor (keys) {
      let jsonObj = JSON.parse(this.myDiagram.model.toJson());
      let nodeArray = jsonObj.nodeDataArray;
      for (let i = 0; i < nodeArray.length; i++) {
        if (keys.includes(nodeArray[i].key + '')) {
          if (
            nodeArray[i].stroke === 'red' ||
            nodeArray[i].stroke === 'yellow'
          ) {
            nodeArray[i].strokeWidth = 2;
            nodeArray[i].strokeDashArray = null;
            switch (nodeArray[i].Type) {
              case '<<功能性目标>>':
                nodeArray[i].stroke = '#2E8B57';
                break;
              case '<<非功能性目标>>':
                nodeArray[i].stroke = 'rgb(184,188,164)';
                break;
              case '<<可操作性目标>>':
                nodeArray[i].stroke = '#8fd2c4';
                break;
              case '<<资源>>':
                nodeArray[i].stroke = '#CDB7B5';
                break;
              case '<<角色>>':
                nodeArray[i].stroke = '#CDAA7D';
                break;
              case '<<角色作用域>>':
                nodeArray[i].stroke = 'gray';
                break;
              case '<<约束>>':
                nodeArray[i].stroke = 'gray';
                break;
            }
          }
        }
      }
      this.imageData = this.myDiagram.makeImageData({ background: '#DAE4EE' });
      this.myDiagram.model = go.Model.fromJson(JSON.stringify(jsonObj));
      this.loadDiagramProperties();
    },
    changeChoosedAttribute (value, selected) { // 改变属性的value后更改node的属性值
      let data = this.currentNode.data;
      switch (selected) {
        case 1:
          this.myDiagram.model.setDataProperty(data, 'ResponseTime', value)
          break;
        case 2:
          this.myDiagram.model.setDataProperty(data, 'NetworkConnection', value)
          break;
        case 3:
          this.myDiagram.model.setDataProperty(data, 'ComputingResource', value)
          break;
      }
    },
    ifCheckedAttribute (checked) { // 更改了弹窗中的属性会相应更改目标node的属性值
      let data = this.currentNode.data
      let aray1 = ['ResponseTime', 'NetworkConnection', 'ComputingResource'];
      let aray2 = ['DataPrivacy', 'DeviceCompatibility'];
      for (let attribute of aray1) {
        if (checked.includes(attribute)) {
          if (data[attribute] === undefined) {
            this.myDiagram.model.setDataProperty(data, attribute, '')
          }
        } else {
          this.myDiagram.model.setDataProperty(data, attribute, undefined)
        }
      }
      for (let attribute of aray2) {
        if (checked.includes(attribute)) {
          this.myDiagram.model.setDataProperty(data, attribute, true)
        } else {
          this.myDiagram.model.setDataProperty(data, attribute, undefined)
        }
      }
    },
    // for update the attributeData
    changeSelection () {
      const node = this.myDiagram.selection.first();
      this.myDiagram.clearSelection();
      this.myDiagram.select(node);
    },
    getDefaultAttribute () { // 判断当前node的属性值，为弹窗的选择添加默认值
      this.selectAttribute = [];
      this.attributeData = [];
      let array1 = ['ResponseTime', 'NetworkConnection', 'ComputingResource', 'DataPrivacy', 'DeviceCompatibility'];
      for (let attribute of array1) {
        if (this.currentNode.data[attribute] !== undefined) {
          this.selectAttribute.push(attribute);
          this.attributeData.push(this.currentNode.data[attribute])
        } else {
          this.attributeData.push(0)
        }
      }
    },
    getNodes () { // 将当前node保存在currentNode中
      let nodeOrLinkList = this.myDiagram.selection;
      let node = null;
      nodeOrLinkList.each(function (nodeOrLink) {
        node = nodeOrLink
      })
      if (node) {
        this.showIfOperationGoal = node.data.Type === '<<可操作性目标>>';
        this.currentNode = node;
      } else {
        this.showIfOperationGoal = false;
      }
    },
    getViewByRole () {
      let key = this.getNodeByName(this.roleName)
      // console.log(key)
      // console.log(this.ifChangedView)
      if (!this.ifChangedView) {
        this.backupsJson = JSON.parse(this.myDiagram.model.toJson());
        this.ifChangedView = true;
      }
      let jsonObj = JSON.parse(JSON.stringify(this.backupsJson));
      let nodeArray = jsonObj.nodeDataArray;
      let viewNodeArray = [];
      let nodeKeys = [];
      let viewLinkArray = [];
      let linkArray = jsonObj.linkDataArray;
      for (let i = 0; i < nodeArray.length; i++) {
        if (nodeArray[i].group === undefined && key.toString() === nodeArray[i].key.toString()) {
          viewNodeArray.push(JSON.parse(JSON.stringify(nodeArray[i])));
          nodeKeys.push(nodeArray[i].key);
        }
        if (nodeArray[i].group !== undefined) {
          if (nodeArray[i].isGroup === undefined && key.toString() === nodeArray[i].group.toString()) {
            viewNodeArray.push(JSON.parse(JSON.stringify(nodeArray[i])));// 找出组内的所有node
            nodeKeys.push(nodeArray[i].key);
          }
        }
      }
      if (!this.includeFlag) {
        for (let i = 0; i < linkArray.length; i++) { // 找出只在goup内的link
          if (nodeKeys.includes(linkArray[i].from) && nodeKeys.includes(linkArray[i].to)) {
            viewLinkArray.push(JSON.parse(JSON.stringify(linkArray[i])));
          }
        }
      } else {
        for (let i = 0; i < linkArray.length; i++) { // 找出所有相关的LINK
          if (nodeKeys.includes(linkArray[i].from) || nodeKeys.includes(linkArray[i].to)) {
            viewLinkArray.push(JSON.parse(JSON.stringify(linkArray[i])));
          }
        }
        for (let i = 0; i < nodeArray.length; i++) {
          if (nodeKeys.includes(nodeArray[i].key)) continue;// 已经在node数组中的不用在判断
          for (let j = 0; j < viewLinkArray.length; j++) {
            if (viewLinkArray[j].from === nodeArray[i].key || viewLinkArray[j].to === nodeArray[i].key) {
              viewNodeArray.push(JSON.parse(JSON.stringify(nodeArray[i]))); // 有相关性的
              break;
            }
          }
        }
      }
      jsonObj.nodeDataArray = viewNodeArray;
      jsonObj.linkDataArray = viewLinkArray;
      this.loadWholeView(jsonObj);
    },
    getViewByPosition () {
      console.log(this.chooseView)
      if (!this.ifChangedView) {
        this.backupsJson = JSON.parse(this.myDiagram.model.toJson());
        this.ifChangedView = true;
      }
      let jsonObj = JSON.parse(JSON.stringify(this.backupsJson));
      let nodeArray = jsonObj.nodeDataArray;
      let viewNodeArray = [];
      let nodeKeys = [];
      let viewLinkArray = [];
      let linkArray = jsonObj.linkDataArray;
      for (let i = 0; i < nodeArray.length; i++) {
        if (nodeArray[i].Type === '<<资源>>' || nodeArray[i].Type === '<<Resource>>') {
          console.log(nodeArray[i])
          if (nodeArray[i].DeployedPosition === undefined) {
            this.$alert('未给全部资源定义部署位置');
            this.ifChangedView = false;
            return true;
          }
          if (nodeArray[i].DeployedPosition === this.chooseView) { // 先将目标全部加进去.charAt(0)
            viewNodeArray.push(JSON.parse(JSON.stringify(nodeArray[i])));
            nodeKeys.push(nodeArray[i].key);
            // if (nodeArray[i].group !== undefined) {
            //   nodeKeys.push(nodeArray[i].group);
            // }
          }
        }
      }
      if (nodeKeys.length === 0) {
        this.$alert('没有资源');
        this.ifChangedView = false;
        return true;
      }
      // for (let i = 0; i < nodeArray.length; i++) { // 将角色内部的node加进去
      //   if (nodeArray[i].isGroup && nodeKeys.includes(nodeArray[i].key)) {
      //     viewNodeArray.push(JSON.parse(JSON.stringify(nodeArray[i])));
      //   }
      //   if (nodeArray[i].group !== undefined && nodeKeys.includes(nodeArray[i].group)) {
      //     viewNodeArray.push(JSON.parse(JSON.stringify(nodeArray[i])));// 找出组内的所有node
      //     nodeKeys.push(nodeArray[i].key);
      //   }
      // }
      // if (!this.includeFlag) {
      //   for (let i = 0; i < linkArray.length; i++) { // 找出只在group内的link
      //     if (nodeKeys.includes(linkArray[i].from) && nodeKeys.includes(linkArray[i].to)) {
      //       viewLinkArray.push(JSON.parse(JSON.stringify(linkArray[i])));
      //     }
      //   }
      // } else {
      //   for (let i = 0; i < linkArray.length; i++) { // 找出所有相关的LINK
      //     if (nodeKeys.includes(linkArray[i].from) || nodeKeys.includes(linkArray[i].to)) {
      //       viewLinkArray.push(JSON.parse(JSON.stringify(linkArray[i])));
      //     }
      //   }
      //   for (let i = 0; i < nodeArray.length; i++) {
      //     if (nodeKeys.includes(nodeArray[i].key)) continue;// 已经在node数组中的不用在判断
      //     for (let j = 0; j < viewLinkArray.length; j++) {
      //       if (viewLinkArray[j].from === nodeArray[i].key || viewLinkArray[j].to === nodeArray[i].key) {
      //         viewNodeArray.push(JSON.parse(JSON.stringify(nodeArray[i]))); // 有相关性的
      //         break;
      //       }
      //     }
      //   }
      // }
      for (let i = 0; i < linkArray.length; i++) { // 找出所有相关的LINK
        if (nodeKeys.includes(linkArray[i].from)) {
          viewLinkArray.push(JSON.parse(JSON.stringify(linkArray[i])));
          let node = this.getNodeByKey(linkArray[i].to);
          viewNodeArray.push(JSON.parse(JSON.stringify(node)));
        }
        if (nodeKeys.includes(linkArray[i].to)) {
          viewLinkArray.push(JSON.parse(JSON.stringify(linkArray[i])));
          let node = this.getNodeByKey(linkArray[i].from);
          viewNodeArray.push(JSON.parse(JSON.stringify(node)));
        }
      }
      jsonObj.nodeDataArray = viewNodeArray;
      jsonObj.linkDataArray = viewLinkArray;
      this.loadWholeView(jsonObj)
    },
    getSubdomain() {
      let jsonObj = JSON.parse(JSON.stringify(this.backupsJson));
      this.showSubDomain=true;
      let nodeArray = jsonObj.nodeDataArray;
      this.viewNodeArray = [];
      this.nodeKeys = [];
      this.viewLinkArray = [];
      let linkArray = jsonObj.linkDataArray;
      let str= '从';
      this.subDomainName=[];
      for (let i = 0; i < nodeArray.length; i++) {
        if (nodeArray[i].Type === '<<角色>>' || nodeArray[i].Type === '<<Actor>>') {
          //console.log(nodeArray[i]);
          if (this.recursionNode(nodeArray[i],nodeArray,linkArray)) {
            //console.log(this.viewNodeArray);
            this.subDomainNodeArray.push(this.viewNodeArray);
            this.subDomainLinkArray.push(this.viewLinkArray);
            this.subDomainName.push({name: str.concat(nodeArray[i].Name,"流出")});
            //console.log(this.subDomainName);
          }
          this.viewNodeArray=[];
          this.viewLinkArray=[];
          this.nodeKeys= [];
        }
      }
      //console.log(this.subDomainNodeArray);
    },
    recursionNode(node,nodeArray,linkArray) {
      this.nodeKeys.push(node.key);
      for (let i = 0; i < linkArray.length; i++) {
        if (linkArray[i].from===node.key && !this.nodeKeys.includes(linkArray[i].to)) {
          let newNode = this.getNodeByKey(linkArray[i].to);
          if (newNode.Type==='<<角色>>' || newNode.Type === '<<Actor>>') {
            this.viewLinkArray.push(JSON.parse(JSON.stringify(linkArray[i])));
            return true
          }
          if (this.recursionNode(newNode,nodeArray,linkArray)) {
            this.viewLinkArray.push(JSON.parse(JSON.stringify(linkArray[i])));
            this.viewNodeArray.push(JSON.parse(JSON.stringify(newNode)));
            return true
          }
        }
      }
      return false;
    },
    getDeployedPosition: function () {
      // this.save();
      // this.$ajax
      //   .put('api/diagram', {
      //     diagramName: this.$refs.projectName.innerHTML,
      //     jsonContent: JSON.stringify(
      //       JSON.parse(this.myDiagram.model.toJson())
      //     ),
      //     imageContent: this.imageData,
      //     diagramId: this.diagram.diagramId
      //   })
      //   .then(response => {
      //     console.log(response);
      //     const code = response.data.code;
      //     if (code === 1) {
      //       //this.$alert('获取成功');
      //       let data = response.data.data;
      //       for (let key of Object.keys(data)) {
      //         let numericKey = parseInt(key);
      //         let node = this.myDiagram.findNodeForKey(numericKey);
      //         this.myDiagram.model.setDataProperty(node.data, 'DeployedPosition', data[key]);
      //       }
      //     }
      //   })
      //   .catch(error => {
      //     //this.$alert('获取DeployedPosition失败');
      //     console.log(error);
      //   });
      let jsonObj = JSON.parse(this.myDiagram.model.toJson());
      let nodeArray = jsonObj.nodeDataArray;
      for (let i = 0; i < nodeArray.length; i++) {
        if (nodeArray[i].Type === '<<资源>>' || nodeArray[i].Type === '<<Resource>>') {
          // if (nodeArray[i].DeployedPosition === undefined) {
          //   this.$alert('未给全部资源定义部署位置');
          //   this.ifChangedView = false;
          //   return true;
          // }
          this.getDeploy(nodeArray[i]);
          //console.log(nodeArray[i]);
        }
      }
    },
    getDeploy (node) {
      let jsonObj = JSON.parse(this.myDiagram.model.toJson());
      let nodeArray = jsonObj.nodeDataArray;
      let linkArray = jsonObj.linkDataArray;
      let key = node.key;
      for (let i = 0; i < linkArray.length; i++) { // 找出只在group内的link
        let node1 = null;
        if (linkArray[i].from ===key) {
          node1 = this.getNodeByKey(linkArray[i].to);
        }
        if (linkArray[i].to ===key) {
          node1 = this.getNodeByKey(linkArray[i].from);
        }
      }
      let node1 = this.myDiagram.findNodeForKey(node.key);
      this.myDiagram.model.setDataProperty(node1.data, 'DeployedPosition', '云');
      //console.log(node.DeployedPosition);
    },
    openModal (i) {
      if ((!this.roleName && i) || (!this.chooseView && !i)) {
        this.$alert('请进行选择');
        return;
      }
      if (i) {
        this.getViewByRole();
      } else {
        if (this.getViewByPosition()) return;
      }
      let originalDiv = document.getElementById('myDiagramDiv');
      // 获取原始的 <div> 元素和其父元素
      this.originalParent = originalDiv.parentNode;
      this.originalIndex = Array.from(this.originalParent.children).indexOf(originalDiv);

      // 将模态框附加到目标 div 中
      const modal1 = this.$refs.myModal;
      console.log(modal1)
      modal1.show();
      this.$nextTick(() => {
        // 将 GoJS 图形所在的 div 移动到模态框的内容 div 中
        this.$refs.LittleDiagramDiv.appendChild(originalDiv);
        this.modalContentDiv = this.$refs.LittleDiagramDiv;
      });
    },
    onModalClose () {
      const modalContentDiv = this.modalContentDiv;
      console.log(modalContentDiv)
      // 获取原始的 <div> 元素
      const originalDiv = modalContentDiv.firstChild;

      // 将原始的 <div> 元素移回原始位置
      if (this.originalParent && this.originalIndex >= 0) {
        this.originalParent.insertBefore(originalDiv, this.originalParent.children[this.originalIndex]);
      }
      this.loadWholeView(this.backupsJson)
      // 重置 data 属性
      this.ifChangedView = false;
      this.originalParent = null;
      this.originalIndex = -1;
      this.modalContentDiv = null;
      this.roleName = '';
      this.chooseView = '';
      this.includeFlag = '';
    },
    // initLittleDiagram () {
    //   this.myLittleDiagram = objGo(go.Diagram, "myLittleDiagramDiv", {
    //     nodeTemplateMap: this.myDiagram.nodeTemplateMap,
    //     linkTemplateMap: this.myDiagram.linkTemplateMap,
    //     groupTemplateMap: this.myDiagram.groupTemplateMap,
    //   });
    // },
    loadWholeView (jsonObj) {
      this.imageData = this.myDiagram.makeImageData({ background: '#DAE4EE' });
      this.myDiagram.model = go.Model.fromJson(JSON.stringify(jsonObj));
      this.loadDiagramProperties();
    },
    copyNodesLinksToKey (key, nodesKeys, linkable = true, movelength = 0, subkey = '') {
      let jsonObj = JSON.parse(this.myDiagram.model.toJson());
      let nodeArray = jsonObj.nodeDataArray;
      let copyNodeArray = [];
      let linkArray = jsonObj.linkDataArray;
      let copyLinkArray = [];
      let keyNode = null;
      let keyNodeX = null;
      let keyNodeY = null;
      // eslint-disable-next-line no-unused-vars
      let linkKeyNode = null;
      let linkKeyNodeX = null;
      let linkKeyNodeY = null;
      for (let i = 0; i < nodeArray.length; i++) {
        if (key.toString() === nodeArray[i].key.toString()) {
          keyNode = JSON.parse(JSON.stringify(nodeArray[i]));
          let location = nodeArray[i].loc.split(' ');
          keyNodeX = parseFloat(location[0]);
          keyNodeY = parseFloat(location[1]);
        }
      }
      for (let i = 0; i < nodeArray.length; i++) {
        if (nodesKeys[0].toString() === nodeArray[i].key.toString()) {
          linkKeyNode = JSON.parse(JSON.stringify(nodeArray[i]));
          let location = nodeArray[i].loc.split(' ');
          linkKeyNodeX = parseFloat(location[0]);
          linkKeyNodeY = parseFloat(location[1]);
        }
      }
      for (let i = 0; i < linkArray.length; i++) {
        if (
          nodesKeys.includes(linkArray[i].from) &&
          nodesKeys.includes(linkArray[i].to)
        ) {
          copyLinkArray.push(JSON.parse(JSON.stringify(linkArray[i])));
        }
      }
      for (let i = 0; i < nodeArray.length; i++) {
        if (nodesKeys.includes(nodeArray[i].key)) {
          copyNodeArray.push(JSON.parse(JSON.stringify(nodeArray[i])));
        }
      }
      // 计算最右点和最左点
      let copyleft = 0.0;
      for (let i = 0; i < nodeArray.length; i++) {
        if (nodeArray[i].loc !== undefined) {
          let location = nodeArray[i].loc.split(' ');
          if (i === 0) {
            copyleft = parseFloat(location[0]);
          }
          let x = parseFloat(location[0]);
          if (x < copyleft) {
            copyleft = x + 0.0;
          }
        }
      }
      console.log('copy', copyNodeArray);
      let moveX = keyNodeX - linkKeyNodeX + (copyleft - keyNodeX) - 200 - movelength;
      let moveY = keyNodeY - linkKeyNodeY - 200;
      for (let i = 0; i < copyNodeArray.length; i++) {
        copyNodeArray[i].key = copyNodeArray[i].key + '_cy';
        if (copyNodeArray[i].group !== undefined && linkable === false) {
          if (nodesKeys.includes(copyNodeArray[i].group)) {
            copyNodeArray[i].group = copyNodeArray[i].group + '_cy';
          } else {
            copyNodeArray[i].group = '';
          }
        }
        if (keyNode.group !== undefined && linkable === true) {
          copyNodeArray[i].group = keyNode.group;
        }
        if (copyNodeArray[i].loc !== undefined) {
          let location = copyNodeArray[i].loc.split(' ');
          let x = parseFloat(location[0]) + moveX;
          let y = parseFloat(location[1]) + moveY + 100;
          copyNodeArray[i].loc = x.toString() + ' ' + y.toString();
          // nodeArray[i].loc
        }
        if (
          copyNodeArray[i].stroke === 'red' ||
          copyNodeArray[i].stroke === 'yellow'
        ) {
          copyNodeArray[i].strokeWidth = 2;
          copyNodeArray[i].strokeDashArray = null;
          switch (copyNodeArray[i].Type) {
            case '<<功能性目标>>':
              copyNodeArray[i].stroke = '#2E8B57';
              break;
            case '<<非功能性目标>>':
              copyNodeArray[i].stroke = 'rgb(184,188,164)';
              break;
            case '<<可操作性目标>>':
              copyNodeArray[i].stroke = '#8fd2c4';
              break;
            case '<<资源>>':
              copyNodeArray[i].stroke = '#CDB7B5';
              break;
            case '<<角色>>':
              copyNodeArray[i].stroke = '#CDAA7D';
              break;
            case '<<角色作用域>>':
              copyNodeArray[i].stroke = 'gray';
              break;
            case '<<约束>>':
              copyNodeArray[i].stroke = 'gray';
              break;
          }
        }
        nodeArray.push(copyNodeArray[i]);
        console.log('push');
      }
      for (let j = 0; j < copyLinkArray.length; j++) {
        copyLinkArray[j].to = copyLinkArray[j].to + '_cy';
        copyLinkArray[j].from = copyLinkArray[j].from + '_cy';
        let pointSet = copyLinkArray[j].points;
        for (let p = 0; p < pointSet.length; p++) {
          pointSet[p] = pointSet[p] + moveX;
          p++;
          pointSet[p] = pointSet[p] + moveY + 100;
        }
        copyLinkArray[j].points = pointSet;
        linkArray.push(copyLinkArray[j]);
      }
      // 添加连接线
      if (linkable === true) {
        // let link = {};
        // let linePointsSet = [];
        // linePointsSet.push(keyNodeX);
        // let height1 = keyNode.size.split(" ");
        // let height2 = linkKeyNode.size.split(" ");
        // linePointsSet.push(keyNodeY + parseFloat(height1[1]) / 2.0);
        // linePointsSet.push(linkKeyNodeX + moveX);
        // linePointsSet.push(
        //   linkKeyNodeY + moveY + 100 - parseFloat(height2[1]) / 2.0
        // );
        // link.points = linePointsSet
        for (let i = 0; i < linkArray.length; i++) {
          if (
            (subkey.toString() === linkArray[i].from + '') && (nodesKeys.includes(linkArray[i].to))
          ) {
            let link = {};
            link.Linktype = 'AND';
            link.toArrow = 'Circle';
            link.from = keyNode.key;
            link.to = linkArray[i].to.toString() + '_cy';
            linkArray.push(link);
          }
        }
        // link.Linktype = "AND";
        // link.toArrow = "Circle";
        // link.from = keyNode.key;
        // link.to = linkKeyNode.key.toString() + "_cy";
        // linkArray.push(link);
      }
      this.imageData = this.myDiagram.makeImageData({ background: '#DAE4EE' });
      this.myDiagram.model = go.Model.fromJson(JSON.stringify(jsonObj));
      this.loadDiagramProperties();
    },
    copyNodesLinks (keys) {
      let jsonObj = JSON.parse(this.myDiagram.model.toJson());
      let nodeArray = jsonObj.nodeDataArray;
      let copyNodeArray = [];
      let linkArray = jsonObj.linkDataArray;
      let copyLinkArray = [];
      for (let i = 0; i < nodeArray.length; i++) {
        if (keys.includes(nodeArray[i].key)) {
          copyNodeArray.push(JSON.parse(JSON.stringify(nodeArray[i])));
        }
      }
      for (let i = 0; i < linkArray.length; i++) {
        if (
          keys.includes(linkArray[i].from) &&
          keys.includes(linkArray[i].to)
        ) {
          copyLinkArray.push(JSON.parse(JSON.stringify(linkArray[i])));
        }
      }
      let leftPointest = 1500.0;
      let upPointest = 1500.0;
      for (let p = 0; p < nodeArray.length; p++) {
        if (nodeArray[p].loc !== undefined) {
          let location = nodeArray[p].loc.split(' ');
          let x = parseFloat(location[0]);
          if (x < leftPointest) {
            leftPointest = x + 0.0;
          }
          let y = parseFloat(location[1]);
          if (y < upPointest) {
            upPointest = y + 0.0;
          }
        }
      }
      // let copyHeigh = 0.0
      let copyleft = 0.0;
      let copyRight = 0.0;
      let copyUp = 1500.0;
      let copyDown = -1500.0;
      for (let i = 0; i < copyNodeArray.length; i++) {
        if (copyNodeArray[i].loc !== undefined) {
          let location = copyNodeArray[i].loc.split(' ');
          let x = parseFloat(location[0]);
          if (x < copyleft) {
            copyleft = x + 0.0;
          }
          if (x > copyRight) {
            copyRight = x + 0.0;
          }
          let y = parseFloat(location[1]);
          if (y < copyUp) {
            copyUp = y + 0.0;
          }
          if (y > copyDown) {
            copyDown = y + 0.0;
          }
        }
      }
      let moveXLength = copyRight - this.splitLineLocX + 150.0;
      let moveYLength = copyDown - upPointest + 150.0;
      for (let i = 0; i < copyNodeArray.length; i++) {
        copyNodeArray[i].key = copyNodeArray[i].key + '_cy';
        if (copyNodeArray[i].group !== undefined) {
          if (keys.includes(copyNodeArray[i].group)) {
            copyNodeArray[i].group = copyNodeArray[i].group + '_cy';
          } else {
            copyNodeArray[i].group = '';
          }
        }
        if (copyNodeArray[i].loc !== undefined) {
          let location = copyNodeArray[i].loc.split(' ');
          let x = parseFloat(location[0]) - moveXLength;
          let y = parseFloat(location[1]) - moveYLength;
          copyNodeArray[i].loc = x.toString() + ' ' + y.toString();
          // nodeArray[i].loc
        }
        if (
          copyNodeArray[i].stroke === 'red' ||
          copyNodeArray[i].stroke === 'yellow'
        ) {
          copyNodeArray[i].strokeWidth = 2;
          copyNodeArray[i].strokeDashArray = null;
          switch (copyNodeArray[i].Type) {
            case '<<功能性目标>>':
              copyNodeArray[i].stroke = '#2E8B57';
              break;
            case '<<非功能性目标>>':
              copyNodeArray[i].stroke = 'rgb(184,188,164)';
              break;
            case '<<可操作性目标>>':
              copyNodeArray[i].stroke = '#8fd2c4';
              break;
            case '<<资源>>':
              copyNodeArray[i].stroke = '#CDB7B5';
              break;
            case '<<角色>>':
              copyNodeArray[i].stroke = '#CDAA7D';
              break;
            case '<<角色作用域>>':
              copyNodeArray[i].stroke = 'gray';
              break;
            case '<<约束>>':
              copyNodeArray[i].stroke = 'gray';
              break;
          }
        }
        nodeArray.push(copyNodeArray[i]);
      }
      for (let j = 0; j < copyLinkArray.length; j++) {
        copyLinkArray[j].to = copyLinkArray[j].to + '_cy';
        copyLinkArray[j].from = copyLinkArray[j].from + '_cy';
        let pointSet = copyLinkArray[j].points;
        for (let p = 0; p < pointSet.length; p++) {
          pointSet[p] = pointSet[p] - moveXLength;
          p++;
          pointSet[p] = pointSet[p] - moveYLength;
        }
        copyLinkArray[j].points = pointSet;
        linkArray.push(copyLinkArray[j]);
      }
      this.imageData = this.myDiagram.makeImageData({ background: '#DAE4EE' });
      this.myDiagram.model = go.Model.fromJson(JSON.stringify(jsonObj));
      this.loadDiagramProperties();
    },
    fourthStep () {
      this.isDisable1 = true;
      this.isDisable2 = false;
      this.isDis3 = true;
      this.isDis4 = false;
      this.toggle1 = false;
      // this.toggle = false
      this.deleteModelColor();
    },
    getMainModel () {
      // 获取主模型
      let AjsonObj = JSON.parse(this.myDiagram.model.toJson());
      let alinkArray = AjsonObj.linkDataArray.concat();
      let anodeArray = AjsonObj.nodeDataArray.concat();
      let linkArray = [];
      let nodeArray = [];
      let target = '_sub';
      for (let i = 0; i < anodeArray.length; i++) {
        let key = anodeArray[i].key + '';
        let start = key.length - target.length;
        let arr = key.substr(start, target.length);
        if (arr === target) {
          continue;
        }
        nodeArray.push(anodeArray[i]);
      }
      for (let i = 0; i < alinkArray.length; i++) {
        let from = alinkArray[i].from + '';
        let start = from.length - target.length;
        let arr = from.substr(start, target.length);
        if (arr === target) {
          continue;
        }
        if (alinkArray[i].Linktype === '虚线') {
          continue;
        }
        linkArray.push(alinkArray[i]);
      }
      AjsonObj.nodeDataArray = nodeArray.concat();
      AjsonObj.linkDataArray = linkArray.concat();
      return AjsonObj;
    },
    preprocess () {
      // this.deleteModelColor()
      // 获取主模型
      let AjsonObj = JSON.parse(this.myDiagram.model.toJson());
      let alinkArray = AjsonObj.linkDataArray.concat();
      let anodeArray = AjsonObj.nodeDataArray.concat();
      let linkArray = [];
      let nodeArray = [];
      let target = '_sub';
      for (let i = 0; i < anodeArray.length; i++) {
        let key = anodeArray[i].key + '';
        let start = key.length - target.length;
        let arr = key.substr(start, target.length);
        if (arr === target) {
          continue;
        }
        nodeArray.push(anodeArray[i]);
      }
      for (let i = 0; i < alinkArray.length; i++) {
        let from = alinkArray[i].from + '';
        let start = from.length - target.length;
        let arr = from.substr(start, target.length);
        if (arr === target) {
          continue;
        }
        if (alinkArray[i].Linktype === '虚线') {
          continue;
        }
        linkArray.push(alinkArray[i]);
      }
      AjsonObj.nodeDataArray = nodeArray.concat();
      AjsonObj.linkDataArray = linkArray.concat();
      this.$ajax
        .put('api/mix/preprocess', {
          mainJsonContent: JSON.stringify(AjsonObj)
        })
        .then(response => {
          console.log(response);
          const code = response.data.code;
          if (code === 1) {
            if (response.data.data.length === 0) {
            } else {
              let jsonContent = JSON.parse(response.data.data);
              console.log('array', jsonContent);
              let isomerousArray = jsonContent.isomerousArray;
              if (isomerousArray.length === 0) {
              } else {
                this.processItems = jsonContent.isomerousArray;
                let keys = [];
                for (let i = 0; i < isomerousArray.length; i++) {
                  keys.push(isomerousArray[i].goal_1);
                  keys.push(isomerousArray[i].goal_2);
                }
                this.identifyRedBox(keys);
              }
            }
            this.toggle2 = true;
            this.isDisable1 = true;
            this.isDisable2 = false;
          }
        })
        .catch(error => {
          this.$alert('识别失败，请重试');
          console.log(error);
        });
      // this.isDisable1 = true
      // this.isDisable2 = false
    },
    checkInconsistency () {
      this.deleteModelColor();
      this.ifShowLoading1 = true; 
      if (this.diagram.diagramId === '1349348588718428161') {
        this.items = [
          {
            id: '1',
            type: '非功能性目标冲突',
            goal_1: '-2_sub_cy',
            goal_2: '-33_sub_cy',
            name_1: '便捷',
            name_2: '价格便宜',
            solution: '可倾向于权重较大的目标便捷'
          },
          {
            id: '2',
            type: '可操作性目标冲突',
            goal_1: '-8',
            goal_2: '-16_sub_cy',
            name_1: '支付商品',
            name_2: '支付商品',
            solution: '可选择其中一个进行删除'
          }
        ];
        let conflictArray = [
          {
            id: '1',
            type: '非功能性目标冲突',
            goal_1: '-2_sub_cy',
            goal_2: '-33_sub_cy',
            name_1: '便捷',
            name_2: '价格便宜',
            solution: '可倾向于权重较大的目标便捷'
          },
          {
            id: '2',
            type: '可操作性目标冲突',
            goal_1: '-8',
            goal_2: '-16_sub_cy',
            name_1: '支付商品',
            name_2: '支付商品',
            solution: '可选择其中一个进行删除'
          }
        ];
        let keys = [];
        for (let i = 0; i < conflictArray.length; i++) {
          keys.push(conflictArray[i].goal_1);
          keys.push(conflictArray[i].goal_2);
        }
        this.identifyRedBox(keys);
        this.toggle1 = true;
        this.isDisable1 = true;
        this.isDisable2 = true;
        this.isDis4 = true;
        this.isDis5 = false;
      } else {
        // 获取主模型
        let AjsonObj = JSON.parse(this.myDiagram.model.toJson());
        let alinkArray = AjsonObj.linkDataArray.concat();
        let anodeArray = AjsonObj.nodeDataArray.concat();
        let linkArray = [];
        let nodeArray = [];
        let target = '_sub';
        for (let i = 0; i < anodeArray.length; i++) {
          let key = anodeArray[i].key + '';
          let start = key.length - target.length;
          let arr = key.substr(start, target.length);
          if (arr === target) {
            continue;
          }
          nodeArray.push(anodeArray[i]);
        }
        for (let i = 0; i < alinkArray.length; i++) {
          let from = alinkArray[i].from + '';
          let start = from.length - target.length;
          let arr = from.substr(start, target.length);
          if (arr === target) {
            continue;
          }
          if (alinkArray[i].Linktype === '虚线') {
            continue;
          }
          linkArray.push(alinkArray[i]);
        }
        AjsonObj.nodeDataArray = nodeArray.concat();
        AjsonObj.linkDataArray = linkArray.concat();
        this.$ajax
          .put('api/mix/inconsistency', {
            jsonContent: JSON.stringify(AjsonObj)
          })
          .then(response => {
            console.log(response);
            const code = response.data.code;
            if (code === 1) {
              let jsonContent = JSON.parse(response.data.data);
              let conflictArray = jsonContent.conflictArray;
              if (conflictArray.length === 0) {
              } else {
                this.items = jsonContent.conflictArray;
                let keys = [];

                for (let i = 0; i < conflictArray.length; i++) {
                  keys.push(conflictArray[i].goal_1);
                  keys.push(conflictArray[i].goal_2);
                }
                this.identifyRedBox(keys);
              }
              this.toggle1 = true;
              this.isDisable1 = true;
              this.isDisable2 = true;
              this.isDis4 = true;
              this.isDis5 = false;
              this.ifShowLoading1 = false; 
              this.$nextTick(() => {
                this.$refs.inconsistencyResultModal.show();
              });
            }
          })
          .catch(error => {
            this.$alert('识别失败，请重试');
            console.log(error);
            this.ifShowLoading1 = false; 
          });
      }

      // let keys = []
      // keys.push('-38')
      // keys.push('-51')
      // keys.push('-16_sub')
      // keys.push('-27_sub')
      // keys.push('-17_sub')
      // keys.push('-18_sub')
      // keys.push('-19_sub')
      // keys.push('-23_sub')
      // this.deleteColor(keys)
      // let wrongKeys = []
      // wrongKeys.push('-41')
      // wrongKeys.push('-11_sub_cy')
      // wrongKeys.push('-42')
      // wrongKeys.push('-25_sub_cy')
      // // wrongKeys.push('-19_sub_cy')
      // // wrongKeys.push('-23_sub_cy')
      // this.identifyRedBox(wrongKeys)
      // wrongKeys = []
      // wrongKeys.push('-39')
      // wrongKeys.push('-2_sub_cy')
      // this.identifyRedBox(wrongKeys, 'yellow')
      // this.isDis4 = true
      // this.isDis5 = false
    },
    deleteModelColor (part) {
      let AjsonObj = JSON.parse(this.myDiagram.model.toJson());
      let anodeArray = AjsonObj.nodeDataArray.concat();
      let target = '_sub';
      // 去除红框
      for (let i = 0; i < anodeArray.length; i++) {
        if (
          anodeArray[i].stroke === 'red' ||
          anodeArray[i].stroke === 'yellow'
        ) {
          if (part === 'sub') {
            let key = anodeArray[i].key + '';
            let start = key.length - target.length;
            let arr = key.substr(start, target.length);
            if (arr !== target) {
              continue;
            }
          }
          anodeArray[i].strokeWidth = 2;
          anodeArray[i].strokeDashArray = null;
          switch (anodeArray[i].Type) {
            case '<<功能性目标>>':
              anodeArray[i].stroke = '#2E8B57';
              break;
            case '<<非功能性目标>>':
              anodeArray[i].stroke = 'rgb(184,188,164)';
              break;
            case '<<可操作性目标>>':
              anodeArray[i].stroke = '#8fd2c4';
              break;
            case '<<资源>>':
              anodeArray[i].stroke = '#CDB7B5';
              break;
            case '<<角色>>':
              anodeArray[i].stroke = '#CDAA7D';
              break;
            case '<<角色作用域>>':
              anodeArray[i].stroke = 'gray';
              break;
            case '<<约束>>':
              anodeArray[i].stroke = 'gray';
              break;
          }
        }
      }
      AjsonObj.nodeDataArray = anodeArray.concat();
      // 将模型展示在画板中
      this.imageData = this.myDiagram.makeImageData({ background: '#DAE4EE' });
      this.myDiagram.model = go.Model.fromJson(JSON.stringify(AjsonObj));
      this.loadDiagramProperties();
    },
    deleteSubModel () {
      let wrongKeys = [];
      wrongKeys.push('-38');
      wrongKeys.push('-1_sub_cy');
      wrongKeys.push('-51');
      wrongKeys.push('-16_sub_cy');
      this.deleteColor(wrongKeys);
      let AjsonObj = JSON.parse(this.myDiagram.model.toJson());
      let alinkArray = AjsonObj.linkDataArray.concat();
      let anodeArray = AjsonObj.nodeDataArray.concat();
      let linkArray = [];
      let nodeArray = [];
      let target = '_sub';
      for (let i = 0; i < anodeArray.length; i++) {
        let key = anodeArray[i].key + '';
        let start = key.length - target.length;
        let arr = key.substr(start, target.length);
        if (arr === target) {
          continue;
        }
        // if (key.indexOf('_sub') !== -1) {
        //
        // }
        nodeArray.push(anodeArray[i]);
      }
      for (let i = 0; i < alinkArray.length; i++) {
        let from = alinkArray[i].from + '';
        let start = from.length - target.length;
        let arr = from.substr(start, target.length);
        if (arr === target) {
          continue;
        }
        // if (from.indexOf('_sub') !== -1) {
        //   continue
        // }
        if (alinkArray[i].Linktype === '虚线') {
          continue;
        }
        linkArray.push(alinkArray[i]);
      }
      // 去除红框
      for (let i = 0; i < nodeArray.length; i++) {
        if (nodeArray[i].stroke === 'red') {
          nodeArray[i].strokeWidth = 2;
          nodeArray[i].strokeDashArray = null;
          switch (nodeArray[i].Type) {
            case '<<功能性目标>>':
              nodeArray[i].stroke = '#2E8B57';
              break;
            case '<<非功能性目标>>':
              nodeArray[i].stroke = 'rgb(184,188,164)';
              break;
            case '<<可操作性目标>>':
              nodeArray[i].stroke = '#8fd2c4';
              break;
            case '<<资源>>':
              nodeArray[i].stroke = '#CDB7B5';
              break;
            case '<<角色>>':
              nodeArray[i].stroke = '#CDAA7D';
              break;
            case '<<角色作用域>>':
              nodeArray[i].stroke = 'gray';
              break;
            case '<<约束>>':
              nodeArray[i].stroke = 'gray';
              break;
          }
        }
      }
      AjsonObj.nodeDataArray = nodeArray.concat();
      AjsonObj.linkDataArray = linkArray.concat();
      this.isMixed = false;
      this.isSubShow = false;
      // 将模型展示在画板中
      this.imageData = this.myDiagram.makeImageData({ background: '#DAE4EE' });
      this.myDiagram.model = go.Model.fromJson(JSON.stringify(AjsonObj));
      this.loadDiagramProperties()
      this.isDisable1 = true;
      this.isDis1 = false;
      this.isDis5 = true;
      this.splitLine = 0.0;
      this.splitLineLocX = 0.0;
      this.toggle2 = false;
      this.toggle3 = false;
      this.toggle1 = false;
      this.toggle = false;
      this.deps = '';
      this.depo = '';
      this.newGoals = [];
      this.yellowGoals = [];
      this.processItems = [
        { id: 'null', name_1: 'null', name_2: 'null', solution: 'null' }
      ];
      this.items = [
        {
          id: 'null',
          type: 'null',
          name_1: 'null',
          name_2: 'null',
          solution: 'null'
        }
      ];
    },
    loadFile (files) {
      if (this.imFile) {
        let name = this.imFile.name;
        let reader = new FileReader();
        reader.onload = () => {
          if (name.indexOf('.xml') !== -1) {
            this.load(this.XML2Json(reader.result));
          } else if (name.indexOf('.json') !== -1) {
            this.load(reader.result);
          }
        };
        reader.readAsText(this.imFile);
      }
    },
    evolution () {
      // console.log(JSON.parse(this.myDiagram.model.toJson()).nodeDataArray)
      this.originGraph = JSON.parse(this.myDiagram.model.toJson());
      // eslint-disable-next-line camelcase
      const gn_id = this.$route.query.id;
      const id1 = this.valueSelectedBefore;
      const id2 = this.valueSelectedAfter;
      const mySelf = this;
      this.$ajax
        .get('api/value/compare', {
          params: {
            gn_id: gn_id,
            id1: id1,
            id2: id2
          }
        })
        .then(response => {
          let newNodes = response.data.data.newNodes;
          let newGraph = response.data.data.newGraph;
          // console.log("new", newNodes);
          for (var node of newGraph.nodeDataArray) {
            for (var newNode of newNodes) {
              // console.log('node',node.key);
              // console.log('newnode',newNode.key)
              if (node.key === newNode.key) {
                node.stroke = 'red';
                node.loc = '-200 -200';
              }
            }
          }
          mySelf.load(newGraph);
          mySelf.loadGraph = newGraph;
          mySelf.loadNewNode = newNodes;
          mySelf.isYanDis2 = false;
        })
        .catch(error => {
          console.log(error);
        });
    },
    chooseType () {
      // console.log(this.valueTypeSelected);
      if (this.valueTypeSelected === 'single') {
        this.singleType = true;
      } else {
        this.multiType = true;
        // this.singleType = true;//群落式暂且一样
      }
      for (var node of this.loadGraph.nodeDataArray) {
        if (node.Type === '<<角色作用域>>') {
          this.characterOptions.push({ text: node.Name, value: node.key });
        }
      }
      this.characterOptions.push({ text: '待演化新角色', value: 'new' });
    },
    confirmEvolutionCharacter () {
      // console.log(this.characterSelected)
      if (this.characterSelected === 'new') {
        this.$alert('请更改角色域属性');
        this.loadGraph.nodeDataArray.push({
          minSize: { width: 20, height: 20, class: 'go.Size' },
          width: 0,
          height: 0,
          fill: '#ffffff',
          stroke: 'red',
          strokeWidth: 2,
          font: '10pt Times New Roman',
          isUnderline: false,
          isStrikethrough: false,
          textAlign: 'center',
          key: this.randomString(8),
          loc: '-200 1200',
          category: 'OfNodes',
          isGroup: 'true',
          Name: '待演化新角色',
          Type: '<<角色作用域>>',
          Annotation: ''
        });
      } else {
        for (var node of this.loadGraph.nodeDataArray) {
          if (node.key === this.characterSelected) {
            node.stroke = 'red';
          }
        }
      }
      this.load(this.loadGraph);
      if (this.singleType) {
        this.isYanSingleDis1 = false;
      } else if (this.multiType) {
        this.isYanMultiDis1 = false;
      }
    },
    confirmInitialTarget () {
      // console.log(this.originGraph.nodeDataArray);
      // console.log('newNode',this.loadNewNode)
      let mySelf = this;
      // let nodeTrans=JSON.stringify(this.originGraph.nodeDataArray)
      let nodeTrans = this.originGraph.nodeDataArray
      for (var node of this.loadNewNode) {
        // this.$ajax
        //   .post("api/evolution/location", {
        //     evolutionDiagram: {
        //       'nodeDataArray':mySelf.originGraph.nodeDataArray,
        //       'sentence':node.Name
        //     },
        //   }).then(response => {
        //     console.log(response)
        //   }).catch(error => {
        //   console.log(error);
        // });
        this.$ajaxJ({
          method: 'post',
          url: 'api/evolution/location',
          // headers:{ContentType: "application/json;charset=UTF-8",},
          contentType: 'application/json;charset=UTF-8',
          data: {
            nodeDataArray: nodeTrans,
            sentence: node.Name
          },
          dataType: 'json'
        })
          .then(response => {
            // console.log(response.data.data);
            for (var key of response.data.data) {
              mySelf.highLightKey.push(key);
            }
            // eslint-disable-next-line no-redeclare
            for (var key of mySelf.highLightKey) {
              for (var node of mySelf.loadGraph.nodeDataArray) {
                if (node.key === key) {
                  node.stroke = 'red';
                }
              }
            }
            mySelf.load(mySelf.loadGraph);
            mySelf.isYanSingleDis2 = false;
          })
          .catch(error => {
            console.log(error);
          });
      }
      // 遍历key数组 在loadGraph里面找并高亮
      // console.log(this.highLightKey)
    },
    renewDepend () {
      console.log(this.loadGraph);
      let resNodeKey = [];
      let highLightKeyArr = [];
      for (var node of this.loadGraph.nodeDataArray) {
        if (node.Type === '<<资源>>') {
          // console.log(node)
          resNodeKey.push(node.key);
          highLightKeyArr.push(node.key);
        }
      }
      for (var key of resNodeKey) {
        for (var link of this.loadGraph.linkDataArray) {
          if (link.from === key) {
            highLightKeyArr.push(link.to);
          } else if (link.to === key) {
            highLightKeyArr.push(link.from);
          }
        }
      }
      console.log(highLightKeyArr);
      for (var highLightNode of highLightKeyArr) {
        // eslint-disable-next-line no-redeclare
        for (var node of this.loadGraph.nodeDataArray) {
          if (node.key === highLightNode) {
            node.stroke = 'yellow';
          }
        }
      }
      this.load(this.loadGraph);
      if (this.singleType) {
        this.isYanSingleDis4 = false;
      } else if (this.multiType) {
        this.isYanMultiDis3 = false;
      }
    },
    finishEvolution () {
      for (var node of this.loadGraph.nodeDataArray) {
        // if (node.strok == "red" || node.stroke == "yellow") {
        //   node.stroke = "";
        // }
        if (node.Type === '<<角色作用域>>') {
          node.stroke = 'black';
        } else {
          node.stroke = null;
        }
      }
      this.load(this.loadGraph);
    },
    randomString (e) {
      e = e || 32;
      var t = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
      var a = t.length;
      var n = '';
      for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
      return n;
    },

    loadOntology (files) {
      if (this.imFile) {
        let name = this.imFile.name;
        let reader = new FileReader();
        reader.onload = () => {
          if (name.indexOf('.json') !== -1) {
            console.log('123');
            let jsonObj = JSON.parse(reader.result).nodeDataArray;
            this.yeilditems = jsonObj;
            // for (let i = 0; i < jsonObj.length; i++) {
            //   this.yelidGoals.push(jsonObj[i].Name)
            // }
          }
        };
        reader.readAsText(this.imFile);
      }
    },
    onRowSelected (items) {
      this.selectedLength = items.length;
      this.selectedNodesKnowledge = items;
    },
    importOntology (files) {
      if (this.selectedNodesKnowledge.length >= 1) {
        let jsonObj = JSON.parse(this.myDiagram.model.toJson());
        let x = -300;
        let y = -300;
        for (let i = 0; i < this.selectedNodesKnowledge.length; i++) {
          y = y + 80;
          this.selectedNodesKnowledge[i].loc =
            x.toString() + ' ' + y.toString();
          jsonObj.nodeDataArray.push(this.selectedNodesKnowledge[i]);
        }
        this.load(jsonObj);
      }
    },
    doSave (value, type, name) {
      let blob;
      if (typeof window.Blob === 'function') {
        blob = new Blob([value], { type: type });
      } else {
        let BlobBuilder =
          window.BlobBuilder ||
          window.MozBlobBuilder ||
          window.WebKitBlobBuilder ||
          window.MSBlobBuilder;
        let bb = new BlobBuilder();
        bb.append(value);
        blob = bb.getBlob(type);
      }
      let URL = window.URL || window.webkitURL;
      let bloburl = URL.createObjectURL(blob);
      let anchor = document.createElement('a');
      if ('download' in anchor) {
        anchor.style.visibility = 'hidden';
        anchor.href = bloburl;
        anchor.download = name;
        document.body.appendChild(anchor);
        let evt = document.createEvent('MouseEvents');
        evt.initEvent('click', true, true);
        anchor.dispatchEvent(evt);
        document.body.removeChild(anchor);
      } else if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, name);
      } else {
        location.href = bloburl;
      }
    },

    diagramAnalysis () {
      // TODO:显示
      this.roleAnalysis = '';
      let connectedNodes;
      for (let v of this.myDiagram.model.nodeDataArray) {
        // eslint-disable-next-line one-var
        let role,
          goal = [],
          constraint = [];
        if (v.Type === '<<角色>>') {
          role = v.Name;
          v = this.myDiagram.findNodeForKey(v.key);
          connectedNodes = v.findNodesConnected().iterator;
          while (connectedNodes.next()) {
            if (connectedNodes.value.data.Type === '<<目标>>') {
              goal.push(connectedNodes.value.data.Name);
            }
          }
          for (let node of this.myDiagram.model.nodeDataArray) {
            if (node.Type === '<<约束>>') {
              constraint.push(node.Name);
            }
          }
          goal = goal.filter(function (value) {
            return value;
          });
          constraint = constraint.filter(function (value) {
            return value;
          });
          let tip = `<tr><td>${role}</td><td></td><td>${goal.join(
            ','
          )}</td><td>${constraint.join(',')}</td></tr>`;
          this.roleAnalysis = this.roleAnalysis + tip;
        }
      }
    },
    diagramCheck () {
      this.errors = [];
      this.myDiagram.startTransaction('set all properties');
      // eslint-disable-next-line one-var
      let toNode,
        fromNode,
        link,
        linkType,
        errorStr,
        adjustStr,
        errorFromNodes = [],
        errorToNodes = [];
      let it = this.myDiagram.links;
      let pattern = /^<<.+目标>>$/;
      let type = this.diagram.diagramType;
      for (let n of this.myDiagram.model.nodeDataArray) {
        this.myDiagram.model.setDataProperty(n, 'stroke', '#000000');
      }
      if (type === 'GN') {
        while (it.next()) {
          let bug = false;
          link = it.value;
          fromNode = link.fromNode.data;
          toNode = link.toNode.data;
          linkType = link.data.Linktype;
          if (toNode.Type === '<<目标>>' && pattern.test(fromNode.Type)) {
            if (linkType !== 'AND' && linkType !== 'OR') {
              errorStr = `${fromNode.Type}与${toNode.Type}之间存在不合法的${linkType}关系`;
              adjustStr = `${fromNode.Type}与${toNode.Type}之间合法的关系为AND、OR`;
              bug = true;
            }
          } else if (
            fromNode.Type === '<<目标>>' &&
            toNode.Type === '<<目标>>'
          ) {
            if (linkType === 'AND' || linkType === 'OR') {
              errorStr = `${fromNode.Type}与${toNode.Type}之间存在不合法的${linkType}关系`;
              adjustStr = `${fromNode.Type}与${toNode.Type}之间合法的关系为互斥、促进、阻碍、依赖`;
              bug = true;
            }
          } else if (
            fromNode.Type === '<<目标>>' &&
            pattern.test(toNode.Type)
          ) {
            errorStr = `${fromNode.Type}与${toNode.Type}之间存在不合法的${linkType}关系`;
            adjustStr = `${fromNode.Type}与${toNode.Type}之间合法的关系为AND、OR`;
            bug = true;
          }
          if (bug) {
            errorFromNodes.push(fromNode);
            errorToNodes.push(toNode);
            this.errors.push([errorStr, adjustStr]);
          }
        }
      } else if (type === 'SN') {
        while (it.next()) {
          link = it.value;
          fromNode = link.fromNode.data;
          toNode = link.toNode.data;
          linkType = link.data.Linktype;
          if (toNode.Type === '<<开始>>') {
            errorStr = `${toNode.Type}不可为关系指入端`;
            adjustStr = `${toNode.Type}应作为关系指出端`;
            errorFromNodes.push(fromNode);
            errorToNodes.push(toNode);
            this.errors.push([errorStr, adjustStr]);
          }
          if (fromNode.Type === '<<结束>>') {
            errorStr = `${fromNode.Type}不可为关系指出端`;
            adjustStr = `${fromNode.Type}应作为关系指入端`;
            errorFromNodes.push(fromNode);
            errorToNodes.push(toNode);
            this.errors.push([errorStr, adjustStr]);
          }
        }
        // eslint-disable-next-line one-var
        let s = [],
          e = [],
          choice = [],
          choiceEnd = [],
          split = [],
          join = [];
        for (let n of this.myDiagram.model.nodeDataArray) {
          if (n.Type === '<<开始>>') {
            s.push(n);
          } else if (n.Type === '<<结束>>') {
            e.push(n);
          } else if (n.Type === '<<选择>>') {
            choice.push(n);
          } else if (n.Type === '<<选择结束>>') {
            choiceEnd.push(n);
          } else if (n.Type === '<<拆分>>') {
            split.push(n);
          } else if (n.Type === '<<合并>>') {
            join.push(n);
          }
        }
        if (s.length > 1) {
          errorStr = `开始节点数大于1`;
          adjustStr = `开始节点数应为0或1`;
          errorFromNodes.push(...s);
          this.errors.push([errorStr, adjustStr]);
        }
        if (e.length > 1) {
          errorStr = `结束节点数大于1`;
          adjustStr = `结束节点数应为0或1`;
          errorToNodes.push(...e);
          this.errors.push([errorStr, adjustStr]);
        }
        if (s.length <= 1 && e.length <= 1 && s.length !== e.length) {
          errorStr = `开始节点与结束节点不匹配`;
          adjustStr = `开始节点应与结束节点匹配`;
          errorFromNodes.push(...s);
          errorToNodes.push(...e);
          this.errors.push([errorStr, adjustStr]);
        }
        if (choice.length !== choiceEnd.length) {
          errorStr = `选择节点与选择结束节点不匹配`;
          adjustStr = `选择节点应与选择结束节点匹配`;
          errorFromNodes.push(...s);
          errorToNodes.push(...e);
          this.errors.push([errorStr, adjustStr]);
        }
        if (split.length !== join.length) {
          errorStr = `拆分节点与合并节点不匹配`;
          adjustStr = `拆分节点应与合并节点匹配`;
          errorFromNodes.push(...s);
          errorToNodes.push(...e);
          this.errors.push([errorStr, adjustStr]);
        }
      }
      for (let n of errorFromNodes) {
        this.myDiagram.model.setDataProperty(n, 'stroke', '#ff0000');
      }
      for (let n of errorToNodes) {
        this.myDiagram.model.setDataProperty(n, 'stroke', '#ff0000');
      }
      this.myDiagram.commitTransaction('set all properties');
    },
    handleEditorDivider (e) {
      this.moveCanvasCenter();
      let mySelf = this;
      document.onmousemove = function (e) {
        const globalX = document.body.scrollWidth;
        let mouseX = e.clientX;
        let md = Math.round(mouseX / (globalX / 12));
        if (md < 1) md = 1;
        if (md > 11) md = 11;
        mySelf.sideBarmd = md;
        return false;
      };
      document.onmouseup = function () {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    },
    handleEditorDivider2 (e) {
      this.moveCanvasCenter();
      let mySelf = this;
      document.onmousemove = function (e) {
        const globalX = document.body.scrollWidth;
        let mouseX = e.clientX;
        let md = Math.round(mouseX / (globalX / 12));
        if (md < 2) md = 2;
        if (md > 10) md = 10;
        mySelf.rightSideBar = 12 - md;
        return false;
      };
      document.onmouseup = function () {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    },
    moveToFolder () {
      this.$ajax
        .put('api/diagram', {
          diagramId: this.diagram.diagramId,
          folderId: this.folderId
        })
        .then(response => {
          console.log(response);
          const code = response.data.code;
          if (code === 1) {
            this.$alert('保存成功');
          }
        })
        .catch(error => {
          this.$alert('保存失败，请重试');
          console.log(error);
        });
    },

    moveCanvasCenter () {
      // TODO:对准图的中心
      /*
        let l = Number.MAX_VALUE
        let r = Number.MIN_VALUE
        let h = Number.MIN_VALUE
        let b = Number.MAX_VALUE
        if (this.myDiagram === null) return
        for (let n of this.myDiagram.model.nodeDataArray) {
          let nn = n.loc.split(' ')
          let x = parseInt(nn[0])
          let y = parseInt(nn[1])
          if (x < l)l = x
          if (x > r)r = x
          if (y < b)b = y
          if (y > h)h = y
        }
        let p = new go.Point((r + l) / 2, (h + b) / 2)
        this.myDiagram.position.set(p) */
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/css/bootstrap.css";
@import "../../assets/css/work.css";
@import "../../assets/css/dropdown.css";
@import "../../assets/css/DataInspector.css";
.white-background {
  background-color: white; /* 将导航栏的背景色设置为白色 */
}
.brand-content {
    display: flex; /* 使用 Flexbox 布局 */
    align-items: center; /* 在垂直方向上居中对齐 */
}
.custom-nav{
  color:black;
}
.selected-tab {
  background-color: blue !important; // 选中状态的背景颜色
}
.container {
  display: flex;
  justify-content: center;
}
.disbutton {
    padding: 1px 20px;
    //align-items: center; /* 垂直居中 */
    background-color: #1677FD;
    color: white;
    border: 1px solid #1677FD;
    border-radius:5px;
    line-height: 1.5;
  }
.resize-handle {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 10px;
  cursor: col-resize; /* Change the mouse cursor when over the handle */
}
b-nav b-nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px; /* 你可以根据需要设置高度 */
}
/*去掉nav-margin*/
.navbar-br > .input {
  color: red;
}
.v-b-tooltip__popper.active {
  background-color: green !important;
  color: red;
  border: 1px solid #000000 !important;
}
.navbar {
  margin: 0 auto;
}
option {
  color: black !important;
}
#search-type {
  color: gray;
  margin-right: 9px;
}
#brand {
  line-height: 8px;
  font-weight: bold;
  padding: 0;
  //margin-right: 0; /* 移除导航栏品牌的右外边距 */
  font-size: 24px;
  letter-spacing: -0.05em;
  color: #2c3e50;
}
#mixname {
  line-height: 80px;
  padding: 0 15px;
  font-size: 24px;
  letter-spacing: -0.05em;
  color: #2c3e50;
}
.sidebar-collapse {
  height: 100%;
  overflow-y: auto;
}
.verticalBar {
  width: 2px;
  height: 29px;
  background: red;
  display: inline-block;
  margin-top: 31px;
  vertical-align: top;
  margin-right: 29px;
  margin-left: 30px;
}
.top-bar {
  min-height: 40px;
  margin: 0px;
  padding: 0px;
}
.dock-view{
  width: 320px;
}
.sidebar-collapse > .nav {
  height: 100%;
  max-height: 800px;
  margin-left: -15px;
  padding-left: 15px;
  background-color: #eee;
  border-right: 1px solid #d2d2d2;
  padding-top: 10px;
  overflow-y: scroll;
  overflow-x: hidden;
}
ul.collapse {
  border-top: 1px solid #d2d2d2;
  border-bottom: 1px solid #d2d2d2;
}
.sidebar-collapse > .nav > li {
  border-bottom: 1px solid #d2d2d2;
}
div > ul > li:nth-child(2) > a {
  padding-bottom: 3px;
  padding-top: 3px;
}
div > ul > li:nth-child(3) > a {
  padding-bottom: 3px;
  padding-top: 3px;
}
#myPaletteDiv {
  width: 100%;
  height: 100%;
  display: inline-block;
}
::-webkit-scrollbar {
  width: 5px; /* 纵向滚动条*/
  height: 5px; /* 横向滚动条 */
  background-color: #fff;
}

/*定义滚动条轨道 内阴影*/
::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0);
  background-color: #fff;
}

/*定义滑块 内阴影*/
::-webkit-scrollbar-thumb {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0);
  background-color: #d5d5d5;
}

.hidemapbox {
  display: none;
  position: absolute;
  top: 36px;
  z-index: 999;
  width: 100%;
  background: #cccccc;
}
.hidemapbox.active {
  display: block;
}

</style>

// WEBPACK FOOTER // // src/pages/workspace/CSDM.vue