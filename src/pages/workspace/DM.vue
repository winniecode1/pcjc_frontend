<template>
  <div style="height: 100%;">
    <b-modal
            id="tipstoxiugai"
            ref="inconsistencyModal"
            size="xl"
            ok-only
          >
            <h4 v-html="inconsistencyRes"></h4>
          </b-modal>
    <b-navbar
      toggleable="lg"
      variant="primary "
      style="padding: 4px 16px; background-color: white !important"
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
            </b-dropdown-group>
            <b-dropdown-divider></b-dropdown-divider> -->
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
                <p>已选择目标: {{ selectedLength }}个</p >
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
            <b-dropdown-item @click="$router.back(-1)">
              <font-awesome-icon icon="window-close" />
              <span>{{ $t("CSDM.exit") }}</span></b-dropdown-item
            >
          </b-nav-item-dropdown>
          <!-- 导航栏———编辑 -->
          <b-nav-item-dropdown style="font-weight: bold; margin-right: 20px" :text="$t('CSDM.edit')" no-caret>               <!--编辑-->
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
            <!-- <b-dropdown-item @click="bindingVN()">
              <font-awesome-icon icon="object-ungroup" />
              绑定目标模型
            </b-dropdown-item> -->
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
                    <!-- 导航栏———窗口化-->
          <b-nav-item-dropdown style="font-weight: bold; margin-right: 20px" :text="$t('CSDM.moreMethods')" no-caret>               <!--编辑-->
            <!-- <b-dropdown-item v-b-modal="'importDomain'">
              <font-awesome-icon icon="user-plus" />
              {{ $t("CSDM.importDomain") }}
            </b-dropdown-item> -->
            <b-dropdown-item @click="activatePanel('网络拓扑')">
              <font-awesome-icon icon="user-plus" />
              {{ $t("CSDM.importTopology") }}
            </b-dropdown-item>
            <b-dropdown-divider></b-dropdown-divider>
            <b-dropdown-item v-b-modal="'previewNetwork'">
              <font-awesome-icon icon="user-plus" />
              {{ $t("CSDM.previewNetwork") }}
            </b-dropdown-item>
            <b-dropdown-divider></b-dropdown-divider>
            <b-dropdown-item @click="activatePanel('不一致性检测')">
              <font-awesome-icon icon="exclamation-triangle" />
              {{ $t("CSDM.Inconsistencydetection") }}
            </b-dropdown-item>

          </b-nav-item-dropdown>

                  <!-- 绑定目标模态框 -->
      <div>
        <b-modal ref="bindingVNShow" title="绑定目标">
            <p>Hello, this is a modal!</p>
            <b-form-select size='sm'></b-form-select>
        </b-modal>
      </div>
          <b-modal id="importDomain" size="lg" @ok="importDomain" @shown="initDiagram">
            <b-form-group :label="$t('CSDM.choose-import-domain-type')">
              <div class="col-md-10">
                <b-form-select size="sm" v-model="selectDomainType">
                  <option value="CD">核心子域</option>
                  <option value="GD">通用子域</option>
                  <option value="SD">支持子域</option>
                </b-form-select>
              </div>
              <div class="col-md-2">
                <b-button
                  size="sm"
                  variant="outline-info"
                  @click="getDomain"
                  class="mr-1"
                >
                  查询子域
                </b-button>
              </div>
            </b-form-group>
            <b-form-group>
              <div class="row">
                <div
                  class="col-md-9"
                  id="myLittleDiagramDiv"
                  style="height: 500px; background-color: white;"
                ></div>
                <div class="col-md-3">
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
                        class="mr-1"
                      >
                        预览
                      </b-button>
                    </template>
                  </b-table>
                </div>
              </div>
            </b-form-group>
            <div slot="modal-ok">{{ $t("CSDM.import") }}</div>
            <div slot="modal-cancel">{{ $t("CSDM.cancel") }}</div>
          </b-modal>
        </b-navbar-nav>
        <!--重命名-->
        <b-navbar-nav style="display: flex; justify-content: center;">
          <span
          style="background: #1677FD; color: white; font-size: 16px; display: flex; align-items: center; justify-content: center; height: 40px; border-radius: 20px; text-align: center; padding: 0rem 10rem;"
            class="navbar-brand rename"
            id="project-name"
            ref="projectName"
            v-b-tooltip.hover
            title="Click to rename this project"
          >{{ diagram.diagramName }}</span
          >
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
        <!-- //网络预览图// -->
        <b-modal id="previewNetwork" size="lg" @shown="previewNetwork" title="数字服务网络预览" ok-title="确定" cancel-title="关闭" centered>
        <div ref="myChart" style="width: 750px; height: 750px; background-color: transparent; border: None; position: relative; border-radius: 50%; "></div>
        <div style="display: flex; align-items: center;">
        <div style="margin-right: 10px;">
          <label for="selectedNodeDomain">选择节点域：</label>
          <select id="selectedNodeDomain" v-model="selectedNodeDomain">
            <option disabled selected value="nodedomain">请选择</option>
            <option value="nodedomain">节点域</option>
            <option value="functiondomain">功能域</option>
          </select>
        </div>
        <div style="margin-right: 10px;">
          <label for="nodeName">节点名称：</label>
          <input type="text" id="nodeName" v-model="nodeName">
        </div>
        <button @click="() => addDomain(selectedNodeDomain, nodeName)" style="margin-right: 10px; background-color: blue; color: white; border: none; padding: 8px 16px; cursor: pointer;">导入</button>
      </div>
        
        <button @click="goBack" style="position: absolute; top: 50px; left: 10px; background: none; border: none; cursor: pointer;">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M15 6l-6 6 6 6" stroke="blue" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

    </b-modal>

    <!-- //第一行结束// -->
    <b-sidebar id="sidebar" title="更多功能" right style="top: 100px !important;" :visible="showMoreMethodsSidebar" @hidden="showMoreMethodsSidebar = false" no-close-on-backdrop no-close-on-esc>
      <b-card v-for="panel in activePanels" :key="panel" style="margin-bottom: 10px;">
        <b-card-header header-tag="header" class="p-1" role="tab">
          <div class="d-flex justify-content-between align-items-center">
            <b-button block v-b-toggle="'collapse-' + panel" variant="primary">{{ panel }}</b-button>
            <b-button size="sm" variant="danger" @click.stop="removePanel(panel)">X</b-button>
          </div>
        </b-card-header>
        <b-collapse :id="'collapse-' + panel" visible>
          <b-card-body v-if="panel==='不一致性检测'">
              <b-button
                block
                variant="light"
                @click="checkInconsistency"
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
          <b-card-body v-if="panel==='网络拓扑'">
            <div style="display: flex; align-items: center; background-color: white; padding: 5px;">
              <h3 style="font-size: 16px; margin-right: 10px;">网络拓扑</h3>
          </div>
          <b-nav-item style="min-width: 150px">
          <b-form-select v-model="selectedDomainType" id="search-type" style="background-color: #f6f7f8;">
            <option disabled value="">选择域类型</option>
            <option value="nodedomain">节点域</option>
            <option value="functiondomain">功能域</option>
          </b-form-select>
        </b-nav-item>
          <!-- 星型拓扑 -->
          <div style="display: flex; align-items: baseline; background-color: white; padding: 5px;">
              <h3 style="font-size: 14px;">星型拓扑</h3>
              <label style="font-size: 12px; margin-left: 19px;">输入：</label>
              <input type="number" v-model.number="starTopologyInput" min="1" max="10" style="width: 80px;">
          <b-button size="sm" variant="outline-info" @click="previewTopology('star', starTopologyInput, selectedDomainType)" class="mr-1">预览</b-button>
          </div>
          <!-- 环形拓扑 -->
          <div style="display: flex; align-items: baseline; background-color: white; padding: 5px;">
              <h3 style="font-size: 14px;">环形拓扑</h3>
              <label style="font-size: 12px; margin-left: 19px;">输入：</label>
              <input type="number" v-model.number="ringTopologyInput" min="1" max="10" style="width: 80px;">
          <b-button size="sm" variant="outline-info" @click="previewTopology('ring', ringTopologyInput, selectedDomainType)" class="mr-1">预览</b-button>
          </div>
          <!-- 树型拓扑 -->
          <div style="display: flex; align-items: baseline; background-color: white; padding: 5px;">
              <h3 style="font-size: 14px;">树型拓扑</h3>
              <label style="font-size: 12px; margin-left: 19px;">输入：</label>
              <input type="number" v-model.number="treeTopologyInput" min="1" max="10" style="width: 80px;">
          <b-button size="sm" variant="outline-info" @click="previewTopology('tree', treeTopologyInput, selectedDomainType)" class="mr-1">预览</b-button>
          </div>
          <!-- 蜂窝型拓扑 -->
          <div style="display: flex; align-items: baseline; background-color: white; padding: 5px;">
              <h3 style="font-size: 14px;">蜂窝型拓扑</h3>
              <label style="font-size: 12px; margin-left: 5px;">输入：</label>
              <input type="number" v-model.number="meshTopologyInput" min="1" max="10" style="width: 80px;">
          <b-button size="sm" variant="outline-info" @click="previewTopology('mesh', meshTopologyInput, selectedDomainType)" class="mr-1">预览</b-button>
          </div>
          <div
              class="col-md-9"
              id="myTopoDiagramDiv"
              style="height: 300px; background-color: white; border: 1px solid black; position: relative;"
          ></div>
          <b-button size="sm" variant="outline-info" @click="importTopology" class="mr-1" style="position: relative;">导入</b-button>
          </b-card-body>
        </b-collapse>
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
              >领域建模元素<span class="caret"></span
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
          <!-- <b-card no-body>
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
                <div id="myPaletteDiv2" style="height:350px;"></div>
              </b-card-body>
            </b-collapse>
          </b-card> -->
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
          </div>
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
  </div>
  

</template>
<script>
import * as echarts from 'echarts';
import { go } from "gojs/release/go-module";
import "gojs/extensions/Figures";
import { XML } from "./components/ObjTree.js";
import { Inspector } from "./components/DataInspector";
import KindEditor from "./components/kindEditor";
const objGo = go.GraphObject.make;

export default {
  name: 'DM',
  components: { KindEditor },
  data () {
    return {
      option: [],
      nextKey: null,
      nowIndex: null,
      mainNodename: null,
      myOverview: null,
      previousChartOption: null,
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
      domains: [],
      valueOptionsCopy: [],
      valueTypeSelected: [],
      valueTypeOptions: [
        { text: '种群式', value: 'single' },
        { text: '群落式', value: 'multi' }
      ],
      jsonData: [],
      container: null,
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
      selectedDomainType: '',
      chooseView: '',
      selectedFormat: '',
      myDiagram: null,
      imageData: null,
      myLittleDiagram: null,
      myTopoDiagram: null,
      starTopologyInput: 3,
      ringTopologyInput: 3,
      treeTopologyInput: 3,
      meshTopologyInput: 3,
      busTopologyInput: 3,
      importtopology:0,
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
      selectDomainType: 'GD',
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
      showTopoSideBar: false,
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
      subDomainName: [],
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
          sortable: true,
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
      selectedNodesKnowledge: [],
      // vnData:[],
      // vnName:[],//价值
      gnData:[],
      gnName:[],//目标
      bpmnData:[],
      bpmnName:[],//流程
      folderGN:[],//文件夹下目标
      folderGN2Go:[],//文件夹下可操作性目标和功能性目标
      inconsistencyRes:'',
      ifShowLoading1:false,
      hasResult:false,
      showModal: false, // 控制模态框显示
    };
  },
  computed: {
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
                //找到当前文件夹下，目标建模数据
            this.$ajax.get('api/folder/goals', {
              params: {
              folderId: this.folderId
              }})
              .then(response=>{
                console.log(response)
                this.folderGN=response.data.data
                console.log('当前文件夹下，目标建模数据'+this.folderGN)
                for (let i = 0; i < this.folderGN.length; i++) {
                  if(this.folderGN[i].Type==='<<功能性目标>>'||this.folderGN[i].Type==='<<可操作性目标>>')
                    this.folderGN2Go.push(this.folderGN[i])
                    console.log(this.folderGN[i].Type);
                    console.log(this.folderGN[i].DiagramID);
                    console.log(this.folderGN[i].key);
                  }
                })
              .catch(error => {
              console.log('folderGN错误'+error);
             })

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
    //以下：获取改用户id下价值建模数据
    this.$ajax
      .get('api/value/model')
      .then(response=>{
        this.vnData=response.data.data
        console.log('获取价值建模数据：')
        console.log(this.vnData)
        this.vnName=this.vnData.map(function(item) {
          return item.diagram_name;
        })
        console.log(this.vnName)
      })
    //以下：获取该用户id下流程建模数据
    this.$ajax
      .get('api/mixBpmn/model')
      .then(response=>{
        this.bpmnData=response.data.data
        console.log('获取流程建模数据：'+response.data)
        console.log(this.bpmnData)
        this.bpmnName=this.bpmnData.map(function(item) {
          return item.diagram_name;
        })
        console.log('bpmnname:'+this.bpmnName)
      })
          //以下：获取该用户id目标值建模数据
    this.$ajax
      .get('api/mix/model')
      .then(response=>{
        this.gnData=response.data.data
        console.log('获取建模数据：'+response.data)
        console.log(this.gnData)
        this.gnName=this.gnData.map(function(item) {
          return item.diagram_name;
        })
        console.log(this.gnName)
      })

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
    go.Shape.defineFigureGenerator('setUp', function (shape, w, h) {
      let actorGeometry = go.Geometry.parse('F M-48.606208 883.816448M1041.337344 883.816448M45.560832 852.672512M403.534848 510.895104c0-36.704256 12.394496-67.21024 37.6576-92.474368 25.264128-25.264128 55.771136-37.658624 92.475392-37.658624 36.703232 0 67.211264 12.394496 92.475392 37.658624 25.265152 25.264128 37.6576 55.770112 37.6576 92.474368 0 36.70528-12.393472 67.689472-37.6576 92.952576-25.264128 25.263104-55.77216 37.656576-92.475392 37.656576-36.704256 0-67.331072-12.274688-92.475392-37.656576C415.809536 578.226176 403.534848 547.1232 403.534848 510.895104zM219.547648 595.743744c7.626752 27.169792 19.067904 53.865472 32.89088 78.651392l-85.801984 105.347072 97.241088 97.241088 105.335808-85.801984c24.787968 13.824 51.958784 25.264128 79.128576 33.368064l14.30016 134.421504 140.142592 0 14.30016-134.421504c27.170816-8.103936 52.912128-19.544064 79.127552-33.368064l104.869888 85.801984 98.195456-97.241088-86.278144-105.347072c13.346816-24.78592 25.263104-51.480576 33.364992-78.651392l134.424576-14.777344L980.789248 440.823808l-134.424576-14.30016c-8.101888-27.170816-20.018176-52.434944-33.364992-78.651392l86.278144-105.346048-98.195456-98.195456-104.869888 86.278144c-26.692608-13.34784-51.956736-25.264128-79.127552-33.36704L602.785792 62.818304 462.6432 62.818304l-14.30016 134.423552c-28.12416 8.102912-54.340608 20.020224-79.128576 33.36704l-105.335808-86.278144-97.241088 98.195456 85.801984 105.346048c-13.34784 26.217472-24.787968 51.480576-32.89088 78.651392L84.647936 440.823808l0 140.142592L219.547648 595.743744zM1021.78304 852.672512z');
      actorGeometry.scale(w / actorGeometry.bounds.width, h / actorGeometry.bounds.height);
      return actorGeometry;
    });
    go.Shape.defineFigureGenerator('myBulb', function (shape, w, h) {
      let actorGeometry = go.Geometry.parse('F M632 888H392c-4.4 0-8 3.6-8 8v32c0 17.7 14.3 32 32 32h192c17.7 0 32-14.3 32-32v-32c0-4.4-3.6-8-8-8zM512 64c-181.1 0-328 146.9-328 328 0 121.4 66 227.4 164 284.1V792c0 17.7 14.3 32 32 32h264c17.7 0 32-14.3 32-32V676.1c98-56.7 164-162.7 164-284.1 0-181.1-146.9-328-328-328z m127.9 549.8L604 634.6V752H420V634.6l-35.9-20.8C305.4 568.3 256 484.5 256 392c0-141.4 114.6-256 256-256s256 114.6 256 256c0 92.5-49.4 176.3-128.1 221.8z');
      actorGeometry.scale(w / actorGeometry.bounds.width, h / actorGeometry.bounds.height);
      return actorGeometry;
    });
    go.Shape.defineFigureGenerator('myStar', function (shape, w, h) {
      let actorGeometry = go.Geometry.parse('F M511.4 904.46c-217.59-0.52-388.99-173.84-392.58-385.44-3.84-226.53 180.29-399.63 390.99-399.87 220.09-0.25 395.3 179.25 394.09 393.82-1.22 216.54-175.55 391.22-392.5 391.49zM359.06 690.22c0.37 10.1 5.13 17.4 12.87 22.54 8.97 5.96 18.48 5.85 27.81 0.22 34.24-20.65 68.59-41.13 102.65-62.07 5.51-3.38 9.57-3.64 15.06-0.36 34.31 20.54 68.88 40.63 103.14 61.24 10.77 6.48 20.92 7.29 31.04-0.36 9.97-7.54 12.71-17.59 9.84-29.7-7.92-33.45-14.28-67.33-23.87-100.28-4.96-17.04-1.7-27.12 11.76-38.13 28.4-23.24 55.67-47.91 82.6-72.87 4.78-4.43 7.97-13.09 7.9-19.76-0.17-15.07-8.91-22.86-25.45-24.38-37.86-3.49-75.73-7.1-113.67-9.3-11.24-0.65-16.11-5.26-19.98-14.68-14.7-35.77-29.84-71.35-45.01-106.92-1.48-3.47-3.73-7.07-6.6-9.41-15.07-12.31-36-6.78-43.6 11.4-14.54 34.77-29.1 69.54-43.25 104.46-3.98 9.83-9.15 15.9-20.92 14.97-7.76-0.61-15.69 0.79-23.53 1.48-30.36 2.66-60.73 5.29-91.07 8.16-10.93 1.04-19.59 5.97-22.7 17.24-2.97 10.78-1.98 20.67 7.77 28.35 5.39 4.24 9.98 9.48 15.12 14.07 25.66 22.92 51.55 45.61 76.88 68.9 2.81 2.59 4.27 8.77 3.5 12.74-2.85 14.76-7.05 29.25-10.44 43.92-6.09 26.16-11.93 52.36-17.85 78.53z z');
      actorGeometry.scale(w / actorGeometry.bounds.width, h / actorGeometry.bounds.height);
      return actorGeometry;
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
          Type:{readOnly:true,show:Inspector.showIfNode},
          // '类型': {  show: Inspector.showIfDomain, type:'select',choices:['领域','通用子域','支持子域','核心子域'] },
          deployPosition:{show:Inspector.showIfNode,type:'select',choices:['云','边','端'],name:'部署位置'},
            // boundBPMN:{show:Inspector.showIfGoToBPMN,type:'select',name:'绑定流程',choices:(node,propName)=>{
            // return this.bpmnName;}},
          boundGNId:{show:false,name:'绑定目标模型图id'},
          boundGoalNodeKey:{show:false,name:'绑定的目标key'},
          boundGoalNodeName:{show:Inspector.showIfFuncDomain,type:'select',name:'功能域目标绑定',choices:(node,propName)=>{
              var list=[]
              this.folderGN2Go.forEach(item => {
                  list.push(item.Name)
                });
            return list;}},
          Name: { show: Inspector.showIfNode, name: '名称' },
          Annotation: { show: Inspector.showIfNode, name: '注释' },
          Degree: { show: Inspector.showIfNonFunGoal, name: '等级' },
          Operation: { show: Inspector.showIfFunGoal, name: '操作' },
          Object: { show: Inspector.showIfFunGoal, name: '对象' },
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
        propertyModified: function (name, newValue,inspector) {
          if(name==='boundGoalNodeName'){
            var selectedItem=mySelf.folderGN2Go.find(item => item.Name === newValue);
            if(selectedItem){
              inspector._diagram.startTransaction("update bound properties")
              console.log('boundGoalNodeKey'+selectedItem.key)
              inspector._diagram.model.setDataProperty(inspector.inspectedObject.data, 'boundGoalNodeKey', selectedItem.key || '');
              inspector._diagram.model.setDataProperty(inspector.inspectedObject.data, 'boundGNId', selectedItem.DiagramID || '');
              inspector._diagram.commitTransaction("update bound properties");
              inspector.updateAllHTML();

            }
          }
          // if (name === 'from') name = '始';
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
      console.log('adddiagramListener')
    });
    // myself.myDiagram.addChangedListener(function(evt){
    //   console.log('addchangedListener')
    // });
    // a context menu is an Adornment with a bunch of buttons in them
    var myContextMenu = objGo(
      'ContextMenu',
      // makeButton(
      //   '跳转价值',
      // function(e,obj) {
      //   console.log("tiaozhuan")
      //   console.log(obj.part.adornedObject.data.Type)
      //   var node=obj.part.adornedObject
      //   var name
      //   var id
      //   if (node.data.Type=='<<功能域>>'){
      //         console.log(node.data.绑定价值)
      //         name=node.data.绑定价值
      //         mySelf.vnData.forEach(function(item){
      //           if(item.diagram_name==name)
      //             id=item.diagram_id
      //         })
      //         mySelf.$router.push({
      //           path: '/workspace',
      //           query: {
      //           id: id,
      //           diagramType: 'VN'
      //     // createTime: this.diagram.createTime
      //   }
      // })
      //       }
      // }),
      //bug here 无法放下
      // makeButton(
      //   '跳转流程',
      // function(e,obj) {
      //   console.log(obj.part.adornedObject.data.Type)
      //   var node=obj.part.adornedObject
      //   var name
      //   var id
      //   if (node.data.Type=='<<价值活动>>'||node.data.Type=='<<节点域>>'){
      //         console.log('bpmnName'+node.data.绑定流程)
      //         name=node.data.绑定流程
      //         mySelf.bpmnData.forEach(function(item){
      //           if(item.diagram_name==name)
                  
      //             id=item.diagram_id
      //             console.log('itemname:'+item.diagram_name+' id:'+id)
      //         })
      //         mySelf.$router.push({
      //           path: '/workspace',
      //           query: {
      //           id: id,
      //           diagramType: 'go_bpmn'
      //     // createTime: this.diagram.createTime
      //   }
      // })
      //       }
      // }),
      makeButton(
        '跳转目标',
      function(e,obj) {
        console.log(obj.part.adornedObject.data.Type)
        var node=obj.part.adornedObject
        var name
        var id
      //   if (node.data.Type=='<<节点域>>'){
      //         console.log(node.data.绑定目标)
      //         name=node.data.绑定目标
      //         mySelf.gnData.forEach(function(item){
      //           if(item.diagram_name==name)
      //             id=item.diagram_id
      //         })
      //         mySelf.$router.push({
      //           path: '/workspace',
      //           query: {
      //           id: id,
      //           diagramType: 'GN'
      //     // createTime: this.diagram.createTime
      //   } 
      // })
      //       }else 
      if(node.data.Type=='<<功能域>>'){
              name=node.data.boundGoalNodeName
              mySelf.folderGN2Go.forEach(function(item){
                if(item.Name==name){
                  id=item.DiagramID
                }
              })
              mySelf.$router.push({
                path: '/workspace',
                query: {
                id: id,
                diagramType: 'GN'}})
            }
      }),
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
      //跳转
      { doubleClick: function(e, node) { // 双击事件处理程序
            // 获取当前节点的 key
            var key = node.data.key;
            console.log('doubleclick')
            console.log(node.data.Type)
            var name
            var id
            if (node.data.Type=='<<功能域>>'){
              console.log(node.data.绑定目标)
              name=node.data.绑定目标
              mySelf.vnData.forEach(function(item){
                if(item.diagram_name==name)
                  id=item.diagram_id
              })
              mySelf.$router.push({
                path: '/workspace',
                query: {
                id: id,
                diagramType: 'VN'
          // createTime: this.diagram.createTime
        }
      })
            }
            console.log(id)

            // 根据当前节点跳转到另外的页面
            // window.location.href = 'other_page.html?key=' + key;
          }
        },
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
      'genericSubdomains',
      objGo(
        go.Group,
        'Auto',
        { toolTip: tooltiptemplateNode },
        { contextMenu: myContextMenu },
        {
          background: '#9DF4E9',
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
            objGo(go.Shape, 'setUp', {
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
          objGo(go.Placeholder, { margin: 10, background: 'transparent' }),
          objGo(go.TextBlock,
            {maxSize: new go.Size(160, NaN)},
            {font: 'bold 9pt Roboto,sans-serif', editable: false, wrap: go.TextBlock.WrapFit},
            new go.Binding('text', 'Type')
          )
        ) // end Vertical Panel
      )
    );// end Group and call to add to template Map
    mySelf.myDiagram.groupTemplateMap.add(
      'supportedSubdomains',
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
            objGo(go.Shape, 'myBulb', {
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
          objGo(go.Placeholder, { margin: 10, background: 'transparent' }),
          objGo(go.TextBlock,
            {maxSize: new go.Size(160, NaN)},
            {font: 'bold 9pt Roboto,sans-serif', editable: false, wrap: go.TextBlock.WrapFit},
            new go.Binding('text', 'Type')
          )
        ) // end Vertical Panel
      )
    );
    mySelf.myDiagram.groupTemplateMap.add(
      'coreSubdomains',
      objGo(
        go.Group,
        'Auto',
        { toolTip: tooltiptemplateNode },
        { contextMenu: myContextMenu },
        {
          background: '#9DF4E9',
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
            objGo(go.Shape, 'myStar', {
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
          objGo(go.Placeholder, { margin: 10, background: 'transparent' }),
          objGo(go.TextBlock,
            {maxSize: new go.Size(160, NaN)},
            {font: 'bold 9pt Roboto,sans-serif', editable: false, wrap: go.TextBlock.WrapFit},
            new go.Binding('text', 'Type')
          )
        ) // end Vertical Panel
      )
    );
    mySelf.myDiagram.groupTemplateMap.add(
      'nodeDomains',
      objGo(
        go.Group,
        'Auto',
        { toolTip: tooltiptemplateNode },
        { contextMenu: myContextMenu },
        {
          background: '#9DF4E9',
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
          objGo(go.Placeholder, { margin: 10, background: 'transparent' }),
          objGo(go.TextBlock,
            {maxSize: new go.Size(160, NaN)},
            {font: 'bold 9pt Roboto,sans-serif', editable: false, wrap: go.TextBlock.WrapFit},
            new go.Binding('text', 'Type')
          )
        ) // end Vertical Panel
      )
    );// end Group and call to add to template Map

    mySelf.myDiagram.addModelChangedListener(function (evt) {  

      if (evt.isTransactionFinished) {
        var target=evt.model.nodeDataArray[0]
        console.log('1')
        
        // handleVn(evt.model.toJson())
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
    }
    // myself.myDiagram.addModelChangedListener(function(evt){
    //   console.log('addchangedListener')
    // });
  },
  watch: {
    listenChangemixed: {
      handler: function (newval, oldval) {
        // this.isMixed = true
      }
    },
    handleVn(evt) {
      var test=evt
      console.log('2')
      console.log(evt)

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
      var vn_name=this.vnName
      let tooltiptemplate = objGo(
        'ToolTip',
        objGo(go.TextBlock, { margin: 4 }, new go.Binding('text', 'Linktype'))
      );
      if (this.$i18n.locale === 'zh') {
        go.GraphObject.make(
          go.Palette,
          'myPaletteDiv1', // must name or refer to the DIV HTML element
          {
            maxSelectionCount: 1,
            nodeTemplateMap: this.myDiagram.nodeTemplateMap, // share the templates used by myDiagram
            groupTemplateMap: this.myDiagram.groupTemplateMap,
            model: new go.GraphLinksModel([
              // specify the contents of the Palette
              // {Name: '', Type: '<<价值活动>>', Annotation: '', figure: 'Card', nodeType: 'serviceValue', fill: '#fad7a7', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
              // {Name: '', Type: '<<价值对象>>', Annotation: '', figure: 'RoundedRectangle', nodeType: 'serviceValue', fill: '#f4e4d0', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
              // {Name: '', Type: '<<资源>>', Annotation: '', figure: 'ExternalOrganization', nodeType: 'serviceValue', fill: '#Fec9c9', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
              // {Name: '', Type: '<<服务>>', Annotation: '', figure: 'InternalStorage', nodeType: 'serviceValue', fill: '#e2c0c1', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
              // {Name: '', Type: '<<目标>>', Annotation: '', figure: 'Ellipse', nodeType: 'serviceValue', fill: '#00a480', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
              // {Name: '', Type: '<<角色>>', Annotation: '', figure: 'Actor', minSize: new go.Size(20, 20), width: 50, height: 70, nodeType: 'serviceValue', fill: '#eac49e', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null}

              // {
              //   Name: 'test',
              //   Type: '<<流程>>',
              //   '绑定的流程':'',
              //   Annotation: '',
              //   figure: 'Card',
              //   nodeType: 'serviceValue',
              //   fill: '#fad7a7',
              //   stroke: '#DAA520',
              //   strokeWidth: 2,
              //   font: '10pt Times New Roman',
              //   isUnderline: false,
              //   isStrikethrough: false,
              //   textAlign: 'center',
              //   strokeDashArray: null
              // },
              {
                Name: '',
                Type: '<<功能域>>',
                //部署位置
                deployPosition:'',
                //类别
                genre:'',
                //绑定目标boundGNId（绑定的目标模型图id）
                boundGNId:'',
                // '绑定价值':'',
                //绑定流程
                boundBPMN:'',
                //（绑定的目标key）
                boundGoalNodeKey:'',
                //功能域目标绑定,绑定的目标名称
                boundGoalNodeName:'',
                minSize: new go.Size(20, 20),
                fill: '#ffffff',
                isGroup: true,
                category: 'genericSubdomains',
                stroke: 'gray',
                strokeWidth: 2,
                font: '10pt Times New Roman',
                isUnderline: false,
                isStrikethrough: false,
                textAlign: 'center',
                strokeDashArray: null,
              },
              {
                Name: '',
                Type: '<<节点域>>',
                minSize: new go.Size(20, 20),
                fill: '#ffffff',
                isGroup: true,
                category: 'nodeDomains',
                stroke: 'gray',
                strokeWidth: 2,
                font: '10pt Times New Roman',
                isUnderline: false,
                isStrikethrough: false,
                textAlign: 'center',
                strokeDashArray: null,
              },
              // {
              //   Name: '',
              //   Type: '<<节点域>>',
              //   minSize: new go.Size(20, 20),
              //   fill: '#ffffff',
              //   isGroup: true,
              //   category: 'supportedSubdomains',
              //   stroke: 'gray',
              //   strokeWidth: 2,
              //   font: '10pt Times New Roman',
              //   isUnderline: false,
              //   isStrikethrough: false,
              //   textAlign: 'center',
              //   strokeDashArray: null
              // },
              // {
              //   Name: '',
              //   Type: '<<核心子域>>',
              //   minSize: new go.Size(20, 20),
              //   fill: '#ffffff',
              //   isGroup: true,
              //   category: 'coreSubdomains',
              //   stroke: 'gray',
              //   strokeWidth: 2,
              //   font: '10pt Times New Roman',
              //   isUnderline: false,
              //   isStrikethrough: false,
              //   textAlign: 'center',
              //   strokeDashArray: null
              // },
              {
                Name: '',
                Type: '<<价值活动>>',
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
                Type: '<<价值对象>>',
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
              /*{
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
                Type: '<<目标>>',
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
              },*/
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
            groupTemplateMap: this.myDiagram.groupTemplateMap,
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
                Type: '<<Generic subdomains>>',
                minSize: new go.Size(20, 20),
                fill: '#ffffff',
                isGroup: true,
                category: 'genericSubdomains',
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
                Type: '<<Supported Subdomains>>',
                minSize: new go.Size(20, 20),
                fill: '#ffffff',
                isGroup: true,
                category: 'supportedSubdomains',
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
                Type: '<<Core Subdomains>>',
                minSize: new go.Size(20, 20),
                fill: '#ffffff',
                isGroup: true,
                category: 'coreSubdomains',
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
          { value: '<<Generic subdomains>>', text: 'Generic subdomains' },
          { value: '<<Supported Subdomains>>', text: 'Supported Subdomains' },
          { value: '<<Core Subdomains>>', text: 'Core Subdomains' },
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
          { value: '<<流程>>', text: '流程' },
          { value: '<<通用子域>>', text: '通用子域' },
          { value: '<<支持子域>>', text: '支持子域' },
          { value: '<<核心子域>>', text: '核心子域' },
          { value: '<<资源>>', text: '资源' },
          { value: '<<服务>>', text: '服务' },
          { value: '<<目标>>', text: '目标' },
          { value: '<<角色>>', text: '角色' }
        ];
      }
    }
  },
  methods: {
    async activatePanel(panel) {
      if (!this.activePanels.includes(panel)) {
        this.activePanels.push(panel);
      }
      if (panel === "网络拓扑"){
        await this.initTopoDiagram();
        this.showMoreMethodsSidebar = true;
      }
      if(panel === "不一致性检测"){
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
      }
      // this.showMoreMethodsSidebar = true;

    },
    toggleSideBar() {
      this.showTopoSideBar = !this.showTopoSideBar;
    },
    //跳转到
    routeTo () {
      console.log('route')
      // this.$router.push({
      //   path: '/workspace',
      //   query: {
      //     id: this.vnData[0].diagramId,
      //     diagramType: 'VN'
      //     // createTime: this.diagram.createTime
      //   }
      // })
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
    bindingVN(){
      // this.myDiagram.commandHandler.bindingVN()
      // this.$refs['bindingVNShow'].show()
      // myDiagram.model = go.Model.fromJson(this.vnData[0])
      this.routeTo()
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
    importDomain() {
      let nodeData = null;
      switch (this.domains[this.subDomainIndex].domainType) {
        case "GD":
          nodeData={
            Name: this.domains[this.subDomainIndex].domainName,
            Type: '<<功能域>>',
            deployPosition:'',
            genre:'通用子域',
            //绑定目标boundGNId（绑定的目标模型图id）
            boundGNId:'',
            //（绑定的目标key）
            boundGoalNodeKey:'',
            //功能域目标绑定,绑定的目标名称
            boundGoalNodeName:'',
            // '绑定价值':'',
            boundBPMN:'',
            minSize: new go.Size(20, 20),
            fill: '#ffffff',
            isGroup: true,
            category: 'genericSubdomains',
            stroke: 'gray',
            strokeWidth: 2,
            font: '10pt Times New Roman',
            isUnderline: false,
            isStrikethrough: false,
            textAlign: 'center',
            strokeDashArray: null
          }; break;
        case "SD":
          nodeData={
            Name: this.domains[this.subDomainIndex].domainName,
            Type: '<<功能域>>',
            deployPosition:'',
            genre:'支持子域',
            //绑定目标boundGNId（绑定的目标模型图id）
            boundGNId:'',
            //（绑定的目标key）
            boundGoalNodeKey:'',
            //功能域目标绑定,绑定的目标名称
            boundGoalNodeName:'',
            // '绑定价值':'',
            boundBPMN:'',
            minSize: new go.Size(20, 20),
            fill: '#ffffff',
            isGroup: true,
            category: 'supportedSubdomains',
            stroke: 'gray',
            strokeWidth: 2,
            font: '10pt Times New Roman',
            isUnderline: false,
            isStrikethrough: false,
            textAlign: 'center',
            strokeDashArray: null
          }; break;
        case "CD":
          nodeData={
            Name: this.domains[this.subDomainIndex].domainName,
            Type: '<<功能域>>',
            deployPosition:'',
            //绑定目标boundGNId（绑定的目标模型图id）
            boundGNId:'',
            //（绑定的目标key）
            boundGoalNodeKey:'',
            //功能域目标绑定,绑定的目标名称
            genre:'核心子域',
            boundGoalNodeName:'',
            // '绑定价值':'',
            boundBPMN:'',
            minSize: new go.Size(20, 20),
            fill: '#ffffff',
            isGroup: true,
            category: 'coreSubdomains',
            stroke: 'gray',
            strokeWidth: 2,
            font: '10pt Times New Roman',
            isUnderline: false,
            isStrikethrough: false,
            textAlign: 'center',
            strokeDashArray: null
          }; break;
      }
      this.myDiagram.model.addNodeData(nodeData);
      let key = this.getNodeByName(this.domains[this.subDomainIndex].domainName);
      this.showSubModel(this.domains[this.subDomainIndex].jsonContent,key);
    },
    initDiagram() { //初始化预览图
      this.myLittleDiagram = objGo(go.Diagram, "myLittleDiagramDiv", {
        nodeTemplateMap: this.myDiagram.nodeTemplateMap,
        linkTemplateMap: this.myDiagram.linkTemplateMap,
        groupTemplateMap: this.myDiagram.groupTemplateMap,
      });
      //console.log(this.myLittleDiagram)
      let jsonObj = JSON.parse(this.myDiagram.model.toJson());
      jsonObj.nodeDataArray = [];
      jsonObj.linkDataArray = [];
      //console.log(jsonObj);
      //console.log(this.myLittleDiagram);
      this.myLittleDiagram.model = go.Model.fromJson(JSON.stringify(jsonObj));
      let pos = this.myDiagram.model.modelData.position;
      if (pos) this.myLittleDiagram.initialPosition = go.Point.parse(pos);

    },
    async initTopoDiagram() {
      await this.$nextTick(); // 等待 DOM 更新
      this.myTopoDiagram = objGo(go.Diagram, "myTopoDiagramDiv", {
        nodeTemplateMap: this.myDiagram.nodeTemplateMap,
        linkTemplateMap: this.myDiagram.linkTemplateMap,
        groupTemplateMap: this.myDiagram.groupTemplateMap,
      });
    },
    addDomain(selectedNodeDomain, nodeName) {
      var NodeData = [];
      var noeKey = null;
      const index = this.nowIndex;
      
      if (index !== 0) {
        noeKey = this.currentKey[index - 1];
      }
      
      if (selectedNodeDomain != 'nodedomain') {
        NodeData = {
          Name: nodeName,
          Type: '<<功能域>>',
          '部署位置': '',
          '类型': '',
          '绑定目标': '',
          // '绑定价值':'',
          '绑定流程': '',
          minSize: new go.Size(10, 10),
          fill: '#ffffff',
          isGroup: true,
          category: 'genericSubdomains',
          stroke: 'gray',
          strokeWidth: 2,
          font: '10pt Times New Roman',
          isUnderline: false,
          isStrikethrough: false,
          textAlign: 'center',
          strokeDashArray: null
        };
        
        if (noeKey !== null) {
          NodeData.group = noeKey;
        }
      } else {
        NodeData = {
          Name: nodeName,
          Type: '<<节点域>>',
          minSize: new go.Size(20, 20),
          fill: '#ffffff',
          isGroup: true,
          category: 'nodeDomains',
          stroke: 'gray',
          strokeWidth: 2,
          font: '10pt Times New Roman',
          isUnderline: false,
          isStrikethrough: false,
          textAlign: 'center',
          strokeDashArray: null,
          loc: '200 200'
        };
        
        if (noeKey !== null) {
          NodeData.group = noeKey;
        }
      }
      
      this.importtopology += 1;
      let AjsonObj = JSON.parse(this.myDiagram.model.toJson()); // 主模型
      AjsonObj.nodeDataArray.push(NodeData);
      this.myDiagram.model = go.Model.fromJson(JSON.stringify(AjsonObj));
      
      let colorGradient = null;
      let newOption = this.option[index];
      
      if (selectedNodeDomain != 'nodedomain') {
        colorGradient = new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
          { offset: 0, color: 'rgb(250, 250, 210)' },
          { offset: 1, color: 'rgb(238, 232, 170)' }
        ]);
      } else if (selectedNodeDomain === 'nodedomain') {
        colorGradient = new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
          { offset: 0, color: 'rgb(173, 216, 230)' },
          { offset: 1, color: 'rgb(135, 206, 235)' }
        ]);
      }
      if (index === 0){
        this.showNetwork();
      } else{
        const flag = 0;
        this.nextChart(noeKey, this.option[index].title.text, flag);
      }
    },

    previewTopology(Type, Number, DomainType) {
      // 创建一个新的图表模型
      this.myTopoDiagram.model = new go.GraphLinksModel();
      // 定义 star 类型的拓扑图生成函数
      function createStar() {
        var nodesAndLinks = [];
        var centerNodeData = [];
        // 创建中心节点
        if (DomainType != 'nodedomain') {
          centerNodeData = {
          key: 'centerNode',
          Name: '',
          Type: '<<功能域>>',
          deployPosition:'',
          //绑定目标boundGNId（绑定的目标模型图id）
          boundGNId:'',
            //（绑定的目标key）
            boundGoalNodeKey:'',
            //功能域目标绑定,绑定的目标名称
          genre:'',
          boundGoalNodeName:'',
            // '绑定价值':'',
          boundBPMN:'',
          minSize: new go.Size(10, 10),
          fill: '#ffffff',
          isGroup: true,
          category: 'genericSubdomains',
          stroke: 'gray',
          strokeWidth: 2,
          font: '10pt Times New Roman',
          isUnderline: false,
          isStrikethrough: false,
          textAlign: 'center',
          strokeDashArray: null,
          loc: '200 200', // 固定中心节点的位置
        };
      } else{
        centerNodeData = {
          key: 'centerNode',
          Name: '',
          Type: '<<节点域>>',
          minSize: new go.Size(20, 20),
          fill: '#ffffff',
          isGroup: true,
          category: 'nodeDomains',
          stroke: 'gray',
          strokeWidth: 2,
          font: '10pt Times New Roman',
          isUnderline: false,
          isStrikethrough: false,
          textAlign: 'center',
          strokeDashArray: null,
          loc: '200 200',
        };
      }
        nodesAndLinks.push({ nodeData: centerNodeData, linkData: null });
        // 创建周围节点和连接
        for (var i = 1; i <= Number; i++) {
          var nodeName = 'surroundingNode' + i;
          var angle = (360 / Number) * i;
          var locX = 200 + 80 * Math.cos((angle * Math.PI) / 180); // 固定节点的位置
          var locY = 200 + 80 * Math.sin((angle * Math.PI) / 180);
          var nodeData = [];
          if (DomainType != 'nodedomain') {
            nodeData = {
            key: nodeName,
            Name: '',
            Type: '<<功能域>>',
            deployPosition:'',
            //绑定目标boundGNId（绑定的目标模型图id）
            boundGNId:'',
            //（绑定的目标key）
            boundGoalNodeKey:'',
            //功能域目标绑定,绑定的目标名称
            genre:'',
            boundGoalNodeName:'',
            // '绑定价值':'',
            boundBPMN:'',
            // minSize: new go.Size(20, 20),
            minSize: new go.Size(5, 5),
            fill: '#ffffff',
            isGroup: true,
            category: 'genericSubdomains',
            stroke: 'gray',
            strokeWidth: 2,
            font: '10pt Times New Roman',
            isUnderline: false,
            isStrikethrough: false,
            textAlign: 'center',
            strokeDashArray: null,
            loc: locX + ' ' + locY,
          };
        } else{
        nodeData = {
          key: nodeName,
          Name: '',
          Type: '<<节点域>>',
          minSize: new go.Size(20, 20),
          fill: '#ffffff',
          isGroup: true,
          category: 'nodeDomains',
          stroke: 'gray',
          strokeWidth: 2,
          font: '10pt Times New Roman',
          isUnderline: false,
          isStrikethrough: false,
          textAlign: 'center',
          strokeDashArray: null,
          loc: locX + ' ' + locY,
          
        };
      }
          var linkData = {
            from: 'centerNode',
            to: nodeName,
            text: 'Link ' + i,
          };
          nodesAndLinks.push({ nodeData: nodeData, linkData: linkData });
        }
        return nodesAndLinks;
      }
      //定义ring 类型的拓扑图生成函数
      function createRing() {
        var nodesAndLinks = [];
        // 创建节点
        var nodes = [];
        for (var i = 0; i < Number; i++) {
          var nodeName = 'Node' + (i + 1);
          var angle = (360 / Number) * i;
          var locX = 200 + 100 * Math.cos((angle * Math.PI) / 180); // 固定节点的位置
          var locY = 200 + 100 * Math.sin((angle * Math.PI) / 180);
          var nodeData = [];
          if (DomainType != 'nodedomain') {
            nodeData = {
            key: nodeName,
            Name: '',
            Type: '<<功能域>>',
            deployPosition:'',
            genre:'',
            //绑定目标boundGNId（绑定的目标模型图id）
            boundGNId:'',
            //（绑定的目标key）
            boundGoalNodeKey:'',
            //功能域目标绑定,绑定的目标名称
            boundGoalNodeName:'',
            // '绑定价值':'',
            boundBPMN:'',
            minSize: new go.Size(20, 20),
            fill: '#ffffff',
            isGroup: true,
            // category: 'supportedSubdomains',
            category: 'genericSubdomains',
            stroke: 'gray',
            strokeWidth: 2,
            font: '10pt Times New Roman',
            isUnderline: false,
            isStrikethrough: false,
            textAlign: 'center',
            strokeDashArray: null,
            loc: locX + ' ' + locY,
          };
        } else{
        nodeData = {
          key: nodeName,
          Name: '',
          Type: '<<节点域>>',
          minSize: new go.Size(20, 20),
          fill: '#ffffff',
          isGroup: true,
          category: 'nodeDomains',
          stroke: 'gray',
          strokeWidth: 2,
          font: '10pt Times New Roman',
          isUnderline: false,
          isStrikethrough: false,
          textAlign: 'center',
          strokeDashArray: null,
          loc: locX + ' ' + locY,
        };
      }

          nodes.push(nodeData);
          nodesAndLinks.push({ nodeData: nodeData, linkData: null });
        }
        // 创建节点之间的连接
        for (var i = 0; i < Number; i++) {
          var fromNode = nodes[i];
          var toNode = nodes[(i + 1) % Number]; // 确保最后一个节点连接到第一个节点
          var linkData = {
            from: fromNode.key,
            to: toNode.key,
            text: 'Link ' + (i + 1),
          };
          nodesAndLinks.push({ nodeData: null, linkData: linkData });
        }
        return nodesAndLinks;
      }
      function createTree() {
      var nodesAndLinks = [];
      // 创建父节点
      var parentNode = [];
      if (DomainType != 'nodedomain') {
        parentNode = {
        key: 'parentNode',
        Name: '',
        Type: '<<功能域>>',
        deployPosition:'',
            genre:'',
                        //绑定目标boundGNId（绑定的目标模型图id）
            boundGNId:'',
            //（绑定的目标key）
            boundGoalNodeKey:'',
            //功能域目标绑定,绑定的目标名称
            boundGoalNodeName:'',
            // '绑定价值':'',
            boundBPMN:'',
            fill: '#ffffff',
            isGroup: true,
            category: 'genericSubdomains',
            stroke: 'gray',
            strokeWidth: 2,
            font: '10pt Times New Roman',
            isUnderline: false,
            isStrikethrough: false,
            textAlign: 'center',
            strokeDashArray: null,
        loc: '200 50',
      };
    } else{
        parentNode = {
          key: 'parentNode',
          Name: '',
          Type: '<<节点域>>',
          minSize: new go.Size(20, 20),
          fill: '#ffffff',
          isGroup: true,
          category: 'nodeDomains',
          stroke: 'gray',
          strokeWidth: 2,
          font: '10pt Times New Roman',
          isUnderline: false,
          isStrikethrough: false,
          textAlign: 'center',
          strokeDashArray: null,
          loc: '200 50',
        };
      }

      nodesAndLinks.push({ nodeData: parentNode, linkData: null });
      // 创建子节点
      for (var i = 0; i < Number; i++) {
        var nodeName = 'Child' + (i + 1);
        var nodeData = [];
        if (DomainType != 'nodedomain') {
          nodeData = {
          key: nodeName,
          Name: '',
          Type: '<<功能域>>',
          deployPosition:'',
          genre:'',
                      //绑定目标boundGNId（绑定的目标模型图id）
                      boundGNId:'',
            //（绑定的目标key）
            boundGoalNodeKey:'',
            //功能域目标绑定,绑定的目标名称
          boundGoalNodeName:'',
            // '绑定价值':'',
            boundBPMN:'',
            minSize: new go.Size(20, 20),
            fill: '#ffffff',
            isGroup: true,
            // category: 'coreSubdomains',
            category: 'genericSubdomains',
            stroke: 'gray',
            strokeWidth: 2,
            font: '10pt Times New Roman',
            isUnderline: false,
            isStrikethrough: false,
            textAlign: 'center',
            strokeDashArray: null,
          loc: (200 + (i - (Number - 1) / 2) * 100) + ' ' + 150,
        };
      } else{
        nodeData = {
          key: nodeName,
          Name: '',
          Type: '<<节点域>>',
          minSize: new go.Size(20, 20),
          fill: '#ffffff',
          isGroup: true,
          category: 'nodeDomains',
          stroke: 'gray',
          strokeWidth: 2,
          font: '10pt Times New Roman',
          isUnderline: false,
          isStrikethrough: false,
          textAlign: 'center',
          strokeDashArray: null,
          loc: (200 + (i - (Number - 1) / 2) * 100) + ' ' + 150,
        };
      }

        var linkData = {
          from: 'parentNode',
          to: nodeName,
          text: 'Link ' + (i + 1),
        };
        nodesAndLinks.push({ nodeData: nodeData, linkData: linkData });
      }
      return nodesAndLinks;
    }
    function createHoneycomb() {
      var nodes = [];
      var centerNodeData = [];
      if (DomainType != 'nodedomain') {
          centerNodeData = {
          key: 'centerNode',
          Name: '',
          Type: '<<功能域>>',
          deployPosition:'',
          genre:'',
                      //绑定目标boundGNId（绑定的目标模型图id）
                      boundGNId:'',
            //（绑定的目标key）
            boundGoalNodeKey:'',
            //功能域目标绑定,绑定的目标名称
          boundGoalNodeName:'',
            // '绑定价值':'',
            boundBPMN:'',
          minSize: new go.Size(10, 10),
          fill: '#ffffff',
          isGroup: true,
          category: 'genericSubdomains',
          stroke: 'gray',
          strokeWidth: 2,
          font: '10pt Times New Roman',
          isUnderline: false,
          isStrikethrough: false,
          textAlign: 'center',
          strokeDashArray: null,
          loc: '200 200', // 固定中心节点的位置
      };
    } else{
        centerNodeData = {
          key: 'centerNode',
          Name: '',
          Type: '<<节点域>>',
          minSize: new go.Size(20, 20),
          fill: '#ffffff',
          isGroup: true,
          category: 'nodeDomains',
          stroke: 'gray',
          strokeWidth: 2,
          font: '10pt Times New Roman',
          isUnderline: false,
          isStrikethrough: false,
          textAlign: 'center',
          strokeDashArray: null,
          loc: '200 200',
        };
      }

      nodes.push({ nodeData: centerNodeData, linkData: null });
      for (var i = 1; i <= Number; i++) {
          var nodeName = 'interNode' + i;
          var angle = (360 / Number) * i;
          var locX = 200 + 80 * Math.cos((angle * Math.PI) / 180); // 计算节点的位置
          var locY = 200 + 80 * Math.sin((angle * Math.PI) / 180);
          var nodeData = [];
          if (DomainType != 'nodedomain') {
            nodeData = {
              key: nodeName,
              Name: '',
              Type: '<<功能域>>',
              deployPosition:'',
              genre:'',
                      //绑定目标boundGNId（绑定的目标模型图id）
              boundGNId:'',
            //（绑定的目标key）
              boundGoalNodeKey:'',
            //功能域目标绑定,绑定的目标名称
              boundGoalNodeName:'',
            // '绑定价值':'',
              boundBPMN:'',
              group: centerNodeData.key,
              minSize: new go.Size(5, 5),
              fill: '#ffffff',
              isGroup: true,
              category: 'genericSubdomains',
              stroke: 'gray',
              strokeWidth: 2,
              font: '10pt Times New Roman',
              isUnderline: false,
              isStrikethrough: false,
              textAlign: 'center',
              strokeDashArray: null,
              loc: locX + " " + locY // 设置节点的位置
          };
        } else{
        nodeData = {
          key: nodeName,
          Name: '',
          Type: '<<节点域>>',
          group: centerNodeData.key,
          minSize: new go.Size(20, 20),
          fill: '#ffffff',
          isGroup: true,
          category: 'nodeDomains',
          stroke: 'gray',
          strokeWidth: 2,
          font: '10pt Times New Roman',
          isUnderline: false,
          isStrikethrough: false,
          textAlign: 'center',
          strokeDashArray: null,
          loc: locX + " " + locY // 设置节点的位置
        };
      }

          nodes.push({ nodeData: nodeData, linkData: null });
        }
        return nodes;
      }
      // 根据传入的类型和数量选择相应的函数来生成拓扑图
      var nodesAndLinks;
      if (Type == 'star') {
        nodesAndLinks = createStar();
      } else if (Type == 'ring') {
        nodesAndLinks = createRing();
      }else if (Type == 'tree'){
        nodesAndLinks = createTree();
      }else if (Type == 'mesh'){
        nodesAndLinks = createHoneycomb();
      }
      // 将节点数据和连接数据添加到模型中
      nodesAndLinks.forEach(function (item) {
        if (item.nodeData) {
          this.myTopoDiagram.model.addNodeData(item.nodeData);
        }
        if (item.linkData) {
          this.myTopoDiagram.model.addLinkData(item.linkData);
        }
      }, this);
    },
    importTopology() {
      this.importtopology += 1;
      let BjsonObj = JSON.parse(this.myTopoDiagram.model.toJson());//拓扑模型
      let AjsonObj = JSON.parse(this.myDiagram.model.toJson());//主模型
      let alinkArray = AjsonObj.linkDataArray;//主模型的连接线集合
      let anodeArray = AjsonObj.nodeDataArray;//主模型的节点集合
      let rightPointest = 0.0;
      let leftPointest = 0.0;
      let upPoint = 0.0;
      let downPoint = 0.0;
      for (let p = 0; p < anodeArray.length; p++) {
        if (anodeArray[p].loc !== undefined) {
          let location = anodeArray[p].loc.split(' ');
          let x = parseFloat(location[0]);
          if (x < leftPointest) {
            leftPointest = x + 0.0;//确定主模型最左端
          }
          if (x > rightPointest) {
            rightPointest = x + 0.0;//确定主模型最右端
          }
          let y = parseFloat(location[1]);
          if (y < upPoint) {
            upPoint = y + 0.0;//确定主模型最上端
          }
          if (y > downPoint) {
            downPoint = y + 0.0;//确定主模型最下端
          }
        }
      }
      let linkArray = BjsonObj.linkDataArray;
      let nodeArray = BjsonObj.nodeDataArray;
      // let BleftPointest = 0.0;
      // for (let p = 0; p < nodeArray.length; p++) {
      //   if (nodeArray[p].loc !== undefined) {
      //     let location = nodeArray[p].loc.split(' ');
      //     let x = parseFloat(location[0]);
      //     if (x < BleftPointest) {
      //       BleftPointest = x + 0.0;//拓扑模型最左端
      //     }
      //     let y = parseFloat(location[1]);
      //     if (y < upPoint) {
      //       upPoint = y + 0.0;//拓扑模型最上端
      //     }
      //     if (y > downPoint) {
      //       downPoint = y + 0.0;//拓扑模型最下端
      //     }
      //   }
      // }
      for (let i = 0; i < nodeArray.length; i++) {
        nodeArray[i].key = nodeArray[i].key + this.importtopology.toString();
        if (nodeArray[i].group !== undefined) {
          nodeArray[i].group = nodeArray[i].group + this.importtopology.toString();
        }
        if (nodeArray[i].loc !== undefined) {
          let location = nodeArray[i].loc.split(' ');
          let x = parseFloat(location[0]) + rightPointest;
          let y = parseFloat(location[1]);
          nodeArray[i].loc = x.toString() + ' ' + y.toString();
        }
        //将导入的所有节点放到领域内
        AjsonObj.nodeDataArray.push(nodeArray[i]);
      }
      for (let j = 0; j < linkArray.length; j++) {
        linkArray[j].to = linkArray[j].to + this.importtopology.toString();
        linkArray[j].from = linkArray[j].from + this.importtopology.toString();
        let pointSet = linkArray[j].points;
        for (let p = 0; p < pointSet.length; p++) {
          pointSet[p] = pointSet[p] + rightPointest;
          p++;
        }
        linkArray[j].points = pointSet;
        AjsonObj.linkDataArray.push(linkArray[j]);
      }
      this.myDiagram.model = go.Model.fromJson(JSON.stringify(AjsonObj));
    },
    previewNetwork() {
      this.$ajax.get('api/diagram/domain/model')
        .then((response) => {
          console.log(response); // 打印响应数据，方便调试
          const code = response.data.code; // 获取响应数据中的状态码
          if (code) {
            this.jsonData = response.data.data; // 获取目标拓扑图的JSON内容
            // console.log('已获取');
            // console.log(this.jsonData)
            this.showNetwork(); // 调用展示拓扑图的方法
            this.isLoading = false; // 将isLoading标记为false，表示数据加载完成
          }
        })
        .catch((error) => {
          console.log(error); // 打印错误信息，方便调试
          this.isLoading = false; // 将isLoading标记为false，表示数据加载完成（即使出现错误）
        });
    },
    showNetwork() {
      console.log('已获取');
      console.log(this.jsonData);
      this.$nextTick(() => {
        const chart = echarts.init(this.$refs.myChart);
        // 定义力导向图的配置项
        const newOption = {
          title: {
            text: this.diagram.diagramName,
            top: '30px', // 设置标题显示在顶部
            left: 'center', // 设置标题水平居中
            textStyle: { // 设置标题样式
              fontSize: 16,
              fontWeight: 'bold',
              color: '#333',
              textAlign: 'center' // 设置标题文字居中对齐
            }
          },
          tooltip: {
            show: true,
            formatter: (params) => {
              return `<div id="previewChart" style="width: 300px; height: 300px;"></div>`;
            }

          },
          // tooltip: {},
          series: [
            {
              type: 'graph',
              layout: 'force', // 布局改为 circular
              roam: true,
              force: {
                repulsion: 150, // 节点间的斥力
                edgeLength: 100 // 边的长度
              },
              data: [],
              links: [],
              lineStyle: {
                opacity: 100 // 边的透明度，设置为 0 表示隐藏边
              },
              label: {
                show: true, // 显示节点名称
                position: 'inside', // 节点名称显示在节点内部
                formatter: '{b}', // 文本格式为节点名称
                color: '#000', // 文本颜色
                fontSize: 12, // 文本字体大小
                fontWeight: 'bold' // 文本字体粗细
              }
            }
          ]
        };
        // 遍历 JSON 数据，添加节点和边
        this.jsonData.forEach(item => {
          if (item.diagram_id && item.json_content.nodeDataArray) {
            if (item.diagram_id && item.json_content.nodeDataArray && item.diagram_name == this.diagram.diagramName) {
            let key = null;
            let bubbleName = "test";
            let eBubbleName = [];
            let eKey = [];
            item.json_content.nodeDataArray.forEach((node, index) => {
              let colorGradient = null;
              if (node.Type === '<<功能域>>' || node.Type === '<<节点域>>') {
                if (node.Type === '<<功能域>>') {
                  colorGradient = new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
                        { offset: 0, color: 'rgb(250, 250, 210)' },
                        { offset: 1, color: 'rgb(238, 232, 170)' }
                  ]);
                } else if (node.Type === '<<节点域>>') {
                  colorGradient = new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
                        { offset: 0, color: 'rgb(173, 216, 230)' },
                        { offset: 1, color: 'rgb(135, 206, 235)' }
                  ]);
                }
                if (!node.group) {
                  bubbleName = `${node.Name}_${index + 1}`;
                  if (node.Type === '<<节点域>>') {
                    eBubbleName.push(bubbleName);
                    eKey.push(node.key);
                  }
                  key = node.key;
                  newOption.series[0].data.push({
                    name: bubbleName,
                    symbolSize: 80,
                    itemStyle: {
                      shadowBlur: 10,
                      shadowColor: 'rgba(25, 100, 150, 0.6)',
                      shadowOffsetY: 5,
                      color: colorGradient
                    },
                    key: node.key,
                    myName: node.Name,
                    label: {
                      show: true,
                      formatter: function(params) {
                        return params.data.myName; // 使用myName属性的值
                      },
                      position: 'inside',
                      textStyle: {
                        color: '#000',
                        fontSize: 14
                      }
                    }
                  });
                } else if (node.group && node.group === key) {
                  const smallBubbleName = `${node.Name}_${index + 1}`;
                  if (node.Type === '<<节点域>>') {
                    eBubbleName.push(smallBubbleName);
                    eKey.push(node.key);
                  }
                  const distance = Math.min(Math.random() * 10, 10);
                  const angle = Math.random() * 2 * Math.PI;
                  const x = distance * Math.cos(angle);
                  const y = distance * Math.sin(angle);
                  newOption.series[0].data.push({
                    name: smallBubbleName,
                    symbolSize: 30,
                    x: x,
                    y: y,
                    itemStyle: {
                      shadowBlur: 10,
                      shadowColor: 'rgba(25, 100, 150, 0.6)',
                      shadowOffsetY: 5,
                      color: colorGradient
                    },
                    label: {
                      show: false // 默认情况下不显示标签
                    },
                    emphasis: {
                      label: {
                        show: true, // 悬停时显示标签
                        formatter: (params) => {
                          return params.data.myName; // 显示 myName
                        },
                        fontSize: 12,
                        fontWeight: 'bold'
                      }
                    },
                    clickable: true, // 添加 clickable 属性
                    key: node.key,
                    myName: node.Name,
                  });
                  newOption.series[0].links.push({
                    source: bubbleName,
                    target: smallBubbleName,
                      lineStyle: {
                          width: 1, // 设置边的宽度为 2
                          opacity: 50, // 设置边的透明度为 0.8
                          type: 'dashed' 
                      }
                  });
                }
              }
            });
            item.json_content.linkDataArray.forEach((link, index) => {
              const fromIndex = eKey.indexOf(link.from);
              const toIndex = eKey.indexOf(link.to);
              if(fromIndex !== -1 && toIndex !== -1)
              { 
                newOption.series[0].links.push({
                    source: eBubbleName[fromIndex],
                    target: eBubbleName[toIndex],
                    lineStyle: {
                          width: 3, // 设置边的宽度为 2
                          color: 'rgb(0, 0, 255)',
                          opacity: 100, // 设置边的透明度为 0.8
                          type: 'solid' 

                      }

                    });
              }
            });
          }
          }});

        this.option.push(newOption); // 将新的配置项对象添加到数组中

        const index = this.option.length - 1; // 获取新添加的配置项在数组中的索引
        this.nowIndex = index;
        chart.setOption(this.option[index]); // 设置图表配置
        chart.on('mousemove', (params) => {
          if (params.data && params.data.key) {
            this.showPreview(params.data.key, params.data.myName);
          }
        });
        //点击小气泡之后显示更详细子图
        chart.on('click', (params) => {
        if (params.data && params.data.key) {
            // 如果点击的是小气泡并且有对应的 key 属性
            const key = params.data.key;
            this.nextChart(key, params.data.myName); // 调用 nextchart 方法并传入 key 参数
          }
        });
      });
    },
    //返回上一层的气泡图
    goBack() {
      const oldChart = this.$refs.myChart;
      if (oldChart && oldChart.dispose) {
        oldChart.dispose();
      }
      const chart = echarts.init(this.$refs.myChart);
      let index = this.nowIndex;
      this.option.splice(index, 1);
      if(index > 0)
      {
        index = index - 1;
        this.nowIndex = index;
      }
      chart.setOption(this.option[index]);
    }, 
    nextChart(mainKey, name) {
          this.$nextTick(() => {
            const chart = echarts.init(this.$refs.myChart);
            const newOption = {
              title: {
                text: name,
                top: '30px', // 设置标题显示在顶部
                left: 'center', // 设置标题水平居中
                textStyle: { // 设置标题样式
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#333',
                  textAlign: 'center' // 设置标题文字居中对齐
                }
              },
              tooltip: {},
              series: [
                {
                  type: 'graph',
                  layout: 'force',
                  roam: true,
                  force: {
                    repulsion: 150,
                    edgeLength: 100
                  },
                  data: [],
                  links: [],
                  lineStyle: {
                    opacity: 0

                  },
                  label: {
                    show: true,
                    position: 'inside',
                    formatter: '{b}',
                    color: '#000',
                    fontSize: 12,
                    fontWeight: 'bold'
                  },
                }
              ]
            };

            this.jsonData.forEach(item => {
              if (item.diagram_id && item.json_content.nodeDataArray && item.diagram_name == this.diagram.diagramName) {
                let fatherKey = null;
                let bubbleName = "test";
                let eBubbleName = [];
                let eKey = [];
                item.json_content.nodeDataArray.forEach((node, index) => {
                  let colorGradient = null;
                  if (node.Type === '<<功能域>>' || node.Type === '<<节点域>>') {
                    if (node.Type === '<<功能域>>') {
                      colorGradient = new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
                            { offset: 0, color: 'rgb(250, 250, 210)' },
                            { offset: 1, color: 'rgb(238, 232, 170)' }
                      ]);
                    } else if (node.Type === '<<节点域>>') {
                      colorGradient = new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
                            { offset: 0, color: 'rgb(173, 216, 230)' },
                            { offset: 1, color: 'rgb(135, 206, 235)' }
                      ]);
                    }
                    if (node.group === mainKey) {
                      bubbleName = node.Name;
                      fatherKey = node.key;
                      if (node.Type === '<<节点域>>') {
                        eBubbleName.push(bubbleName);
                        eKey.push(node.key);
                      }
                      newOption.series[0].data.push({
                        name: bubbleName,
                        symbolSize: 90,
                        itemStyle: {
                          shadowBlur: 10,
                          shadowColor: 'rgba(25, 100, 150, 0.6)',
                          shadowOffsetY: 5,
                          color: colorGradient
                        },
                      });
                    } else if (node.group === fatherKey) {
                      if (node.Type === '<<节点域>>') {
                        eBubbleName.push(smallBubbleName);
                        eKey.push(node.key);
                      }
                      const smallBubbleName = `${node.Name}_${index + 1}`;
                      const distance = Math.min(Math.random() * 10, 10);
                      const angle = Math.random() * 2 * Math.PI;
                      const x = distance * Math.cos(angle);
                      const y = distance * Math.sin(angle);
                      newOption.series[0].data.push({
                        name: smallBubbleName,
                        symbolSize: 30,
                        x: x,
                        y: y,
                        itemStyle: {
                          shadowBlur: 10,
                          shadowColor: 'rgba(25, 100, 150, 0.6)',
                          shadowOffsetY: 5,
                          color: colorGradient
                        },
                        label: {
                          show: false
                        },
                        emphasis: {
                          label: {
                            show: true, // 悬停时显示标签
                            formatter: (params) => {
                              return params.data.myName; // 显示 myName
                            },
                            fontSize: 12,
                            fontWeight: 'bold'
                          }
                        },
                        clickable: true, // 添加 clickable 属性
                        key: node.key,
                        myName: node.Name
                      });
                      newOption.series[0].links.push({
                        source: bubbleName,
                        target: smallBubbleName,
                          lineStyle: {
                              width: 1, // 设置边的宽度为 2
                              opacity: 50, // 设置边的透明度为 0.8
                              type: 'dashed' 
                          }
                      });
                    }
                  }

                });
                item.json_content.linkDataArray.forEach((link, index) => {
                  const fromIndex = eKey.indexOf(link.from);
                  const toIndex = eKey.indexOf(link.to);
                  if(fromIndex !== -1 && toIndex !== -1)
                  { 
                    newOption.series[0].links.push({
                        source: eBubbleName[fromIndex],
                        target: eBubbleName[toIndex],
                        lineStyle: {
                              width: 3, // 设置边的宽度为 2
                              color: 'rgb(0, 0, 255)',
                              opacity: 100, // 设置边的透明度为 0.8
                              type: 'solid' 
                          }
                      });
                  }

                });
              }
            });
            this.option.push(newOption); // 将新的配置项对象添加到数组中

            const index = this.option.length - 1; // 获取新添加的配置项在数组中的索引
            this.nowIndex = index;
            chart.setOption(this.option[index]); // 设置图表配置
          });
    }, 
    showPreview(mainKey, name) {
      this.$nextTick(() => {
        const previewChart = echarts.init(document.getElementById('previewChart'));
        const previewOption = {
          title: {
            text: `子图预览`,
                top: '10px', // 设置标题显示在顶部
                left: 'center', // 设置标题水平居中
                textStyle: { // 设置标题样式
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#333',
                  textAlign: 'center' // 设置标题文字居中对齐
                }
          },
          tooltip: {},
          series: [
            {
              type: 'graph',
              layout: 'force',
              roam: true,
              force: {
                repulsion: 100,
                edgeLength: 60
              },
              data: [],
              links: [],
              lineStyle: {
                opacity: 0
              },
              label: {
                show: true,
                position: 'inside',
                formatter: '{b}',
                color: '#000',
                fontSize: 12,
                fontWeight: 'bold'
              },
              
            }
          ]
        };
        this.jsonData.forEach(item => {
              if (item.diagram_id && item.json_content.nodeDataArray && item.diagram_name == this.diagram.diagramName) {
                let fatherKey = null;
                let bubbleName = "test";
                item.json_content.nodeDataArray.forEach((node, index) => {
                  let colorGradient = null;
                  if (node.Type === '<<功能域>>' || node.Type === '<<节点域>>') {
                    if (node.Type === '<<功能域>>') {
                      colorGradient = new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
                            { offset: 0, color: 'rgb(250, 250, 210)' },
                            { offset: 1, color: 'rgb(238, 232, 170)' }
                      ]);
                    } else if (node.Type === '<<节点域>>') {
                      colorGradient = new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
                            { offset: 0, color: 'rgb(173, 216, 230)' },
                            { offset: 1, color: 'rgb(135, 206, 235)' }
                      ]);
                    }
                    if (node.group === mainKey) {
                      bubbleName = node.Name;
                      fatherKey = node.key;
                      previewOption.series[0].data.push({
                        name: bubbleName,
                        symbolSize: 90,
                        itemStyle: {
                          shadowBlur: 10,
                          shadowColor: 'rgba(25, 100, 150, 0.6)',
                          shadowOffsetY: 5,
                          color: colorGradient
                        },
                      });
                    } else if (node.group === fatherKey) {
                      const smallBubbleName = `${node.Name}_${index + 1}`;
                      const distance = Math.min(Math.random() * 10, 10);
                      const angle = Math.random() * 2 * Math.PI;
                      const x = distance * Math.cos(angle);
                      const y = distance * Math.sin(angle);
                      previewOption.series[0].data.push({
                        name: smallBubbleName,
                        symbolSize: 30,
                        x: x,
                        y: y,
                        itemStyle: {
                          shadowBlur: 10,
                          shadowColor: 'rgba(25, 100, 150, 0.6)',
                          shadowOffsetY: 5,
                          color: colorGradient
                        },
                        label: {
                          show: false
                        },
                        emphasis: {
                          label: {
                            show: false,//预览图就不显示标签了
                            formatter: (params) => {
                              return params.data.myName; // 显示 myName
                            },
                            fontSize: 12,
                            fontWeight: 'bold'
                          }
                        },
                        clickable: true, // 添加 clickable 属性
                        key: node.key,
                        myName: node.Name
                      });

                      previewOption.series[0].links.push({
                        source: bubbleName,
                        target: smallBubbleName
                      });
                    }
                  }
                });
              }
            });
        previewChart.setOption(previewOption);

      });
    },

    handleDropdownClick() {
      this.toggleSideBar();
      this.initTopoDiagram();
    },

    getDomain () {
      this.$ajax
        .get('api/diagram/getDomains', {
          params: {
            domainType: this.selectDomainType
          }
        })
        .then(response => {
          console.log(response);
          const code = response.data.code;
          if (code === 1) {
            this.domains=response.data.data;
            this.subDomainName=[];
            for (var domain in this.domains) {
              this.subDomainName.push({name: this.domains[domain].domainName});
              console.log(this.domains[domain].domainName);
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
    changeDomain (index) {
      this.subDomainIndex=index;
      let jsonObj = JSON.parse(this.domains[index].jsonContent);
      this.myLittleDiagram.model = go.Model.fromJson(JSON.stringify(jsonObj));
    },
    showSubModel (subModel,key) {
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
        //将导入的所有节点放到领域内
        this.myDiagram.model.setGroupKeyForNodeData(nodeArray[i],key);
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
    getNodeByName (name) {
      let jsonObj = JSON.parse(this.myDiagram.model.toJson());
      let nodeArray = jsonObj.nodeDataArray;
      for (let node of nodeArray) {
        if (node.Name === name) {
          return node.key;
        }
      }
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
    // for update the attributeData
    changeSelection () {
      const node = this.myDiagram.selection.first();
      this.myDiagram.clearSelection();
      this.myDiagram.select(node);
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
    },

    addVNToGroup (oldNode,newNode) {
    // 获取老节点（假设已经存在）
      var oldNode = myDiagram.findNodeForKey('oldNodeKey');
      if (oldNode) {
      // 创建一个新节点
        var newNode = { key: 'newNodeKey', text: 'New Node' };
      // 向图表模型中添加新节点
        myDiagram.model.addNodeData(newNode);
      //获取老节点的组合
        var group = oldNode.containingGroup;
        if (group) {
      //将新节点添加到老节点的组合中
            myDiagram.model.addLinkData({ from: group.data.key, to: newNode.key });
        } 
      }
    },
    /**
     * 检查模型不一致性
     * 
     * 该方法用于检测当前图表中的不一致性冲突，包括功能目标冲突和部署位置冲突等。
     * 对于特定图表ID(1349348588718428161)会使用预设的测试数据，其他图表会通过API请求后端服务。
     * 
     * 主要功能：
     * 1. 显示加载状态
     * 2. 处理预设测试数据或API返回的冲突数据
     * 3. 标识冲突节点(通过红色框高亮)
     * 4. 格式化冲突信息并显示在模态框中
     * 5. 处理错误情况
     * 
     * 副作用：
     * - 会修改组件状态(ifShowLoading1, items, toggle1等)
     * - 可能触发模态框显示
     * - 会调用identifyRedBox方法高亮冲突节点
     */
    checkInconsistency () {
      // this.deleteModelColor();
      this.ifShowLoading1 = true; // 显示 loading

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
        this.$ajax
          .post('api/diagram/domain/inconsistency', {
            jsonContent: JSON.stringify(
            JSON.parse(this.myDiagram.model.toJson())
          )
          })
          .then(response => {
            console.log(response);
            const code = response.data.code;
            /*
            if (code === 1) {
              let data=response.data.data
              var str1
              var res=''
              data.forEach(item=>{
                if (item.key === "0") {
                  str1='冲突类型：'+item.type+'<br>功能域节点：'+item.nodeName+'<br>冲突目标：'+item.goalName+'<br>消解方案: '+item.solution+'<br><hr>';
                  res=res+str1
                } else if (item.key === "1") {
                  str1='冲突类型：'+item.type+'<br>冲突目标：'+item.goalName+'<br>消解方案: '+item.solution+'<br><hr>';
                  res=res+str1
                } else if (item.key === "2") {
                  str1='冲突类型：'+item.type+'<br>功能域节点：'+item.nodeName+'<br>原始部署位置: '+item.deployedPosition+'<br>理想部署位置：'+item.idealPosition+'<br><hr>';
                  res=res+str1
                } else if (item.key === "3") {
                  str1='冲突类型：'+item.type+'<br>冲突目标：'+item.goalName+'<br>消解方案: '+item.solution+'<br><hr>';
                  res=res+str1
                } else if (item.key === "4") {
                  str1='冲突类型：'+item.type+'<br>功能域节点：'+item.nodeName+'<br>消解方案: '+item.solution+'<br><hr>';
                  res=res+str1
                } else {
                  res=res+'无法识别'
                }
                
              })
              this.inconsistencyRes = res;
              this.ifShowLoading1 = false; // loading 先关闭
              this.$nextTick(() => {
                // 等 DOM 完全渲染后再 show
                this.$refs.inconsistencyModal.show();
              });
              console.log(res);
            }
          })
          */

                        // ...existing code...
            if (code === 1) {
              let data = response.data.data;
              // 更美观的表格样式
              let table = `<table style="width:100%;border-collapse:collapse;font-size:15px;">
                <thead>
                  <tr style="background:#f5f7fa;">
                  <th style="border:1px solid #d3d3d3;padding:8px;font-weight:bold;white-space:nowrap;">冲突类型</th>
                  <th style="border:1px solid #d3d3d3;padding:8px;font-weight:bold;white-space:nowrap;">功能域节点</th>
                  <th style="border:1px solid #d3d3d3;padding:8px;font-weight:bold;white-space:nowrap;">冲突目标</th>
                  <th style="border:1px solid #d3d3d3;padding:8px;font-weight:bold;white-space:nowrap;">原始部署位置</th>
                  <th style="border:1px solid #d3d3d3;padding:8px;font-weight:bold;white-space:nowrap;">理想部署位置</th>
                  <th style="border:1px solid #d3d3d3;padding:8px;font-weight:bold;white-space:nowrap;">消解方案</th>
                  </tr>
                </thead>
                <tbody>`;
              data.forEach(item => {
                table += `<tr style="background:#fff;">
                  <td style="border:1px solid #d3d3d3;padding:8px;">${item.type || ''}</td>
                  <td style="border:1px solid #d3d3d3;padding:8px;">${item.nodeName || ''}</td>
                  <td style="border:1px solid #d3d3d3;padding:8px;">${item.goalName || ''}</td>
                  <td style="border:1px solid #d3d3d3;padding:8px;">${item.deployedPosition || ''}</td>
                  <td style="border:1px solid #d3d3d3;padding:8px;">${item.idealPosition || ''}</td>
                  <td style="border:1px solid #d3d3d3;padding:8px;">${item.solution || ''}</td>
                </tr>`;
              });
              table += `</tbody></table>`;
              this.inconsistencyRes = table;
              this.ifShowLoading1 = false; // loading 先关闭
              this.$nextTick(() => {
                this.$refs.inconsistencyModal.show();
              });
              console.log(table);
            }
            // ...existing code...
          })
          .catch(error => {
            this.$alert('识别失败，请重试');
            console.log(error);
            this.ifShowLoading1 = false;
          });
      }
 

    },


  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/css/bootstrap.css";
@import "../../assets/css/work.css";
@import "../../assets/css/dropdown.css";
@import "../../assets/css/DataInspector.css";
.subdomain-background {
  fill: '#ddf2f1' !important;
}
.white-background {
  background-color: white; /* 将导航栏的背景色设置为白色 */
}
.brand-content {
    display: flex; /* 使用 Flexbox 布局 */
    align-items: center; /* 在垂直方向上居中对齐 */
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
  padding: 0 ;
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