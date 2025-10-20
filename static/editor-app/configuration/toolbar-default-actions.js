/*
 * Activiti Modeler component part of the Activiti project
 * Copyright 2005-2014 Alfresco Software, Ltd. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.

 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
'use strict'

var KISBPM = KISBPM || {}
KISBPM.TOOLBAR = {
  ACTIONS: {

    saveModel: function (services) {
      var modelMetaData = services.$scope.editor.getModelMetaData()

      var selection = services.$scope.editor.getSelection()
      services.$scope.editor.setSelection([])

      // Get the serialized svg image source
      var svgClone = services.$scope.editor.getCanvas().getSVGRepresentation(true)
      services.$scope.editor.setSelection(selection)
      if (services.$scope.editor.getCanvas().properties['oryx-showstripableelements'] === false) {
        var stripOutArray = jQuery(svgClone).find('.stripable-element')
        for (var i = stripOutArray.length - 1; i >= 0; i--) {
          stripOutArray[i].remove()
        }
      }

      // Remove all forced stripable elements
      var stripOutArray = jQuery(svgClone).find('.stripable-element-force')
      for (var i = stripOutArray.length - 1; i >= 0; i--) {
        stripOutArray[i].remove()
      }

      // Parse dom to string
      var svgDOM = DataManager.serialize(svgClone)
      svgDOM = svgDOM.replace(/marker-start="url\("#/g, 'marker-start="url(#').replace(/start"\)"/g, 'start\)"')
      svgDOM = svgDOM.replace(/marker-mid="url\("#/g, 'marker-mid="url(#').replace(/mid"\)"/g, 'mid\)"')
      svgDOM = svgDOM.replace(/marker-end="url\("#/g, 'marker-end="url(#').replace(/end"\)"/g, 'end\)"')
      var params = {
        jsonContent: JSON.stringify(services.$scope.editor.getJSON()),
        imageContent: svgDOM,
        diagramName: modelMetaData.name
      }

      // Update
      services.$http({
        method: 'PUT',
        data: params,
        ignoreErrors: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        transformRequest: function (obj) {
          var str = []
          for (var p in obj) {
            str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]))
          }
          return str.join('&')
        },
        url: KISBPM.URL.putModel(modelMetaData.modelId)
      })

        .success(function (data, status, headers, config) {
          services.$scope.editor.handleEvents({
            type: ORYX.CONFIG.EVENT_SAVED
          })

          // Fire event to all who is listening
          var saveEvent = {
            type: KISBPM.eventBus.EVENT_TYPE_MODEL_SAVED,
            model: params,
            modelId: modelMetaData.modelId,
            eventType: 'update-model'
          }
          KISBPM.eventBus.dispatch(KISBPM.eventBus.EVENT_TYPE_MODEL_SAVED, saveEvent)
        })
        .error(function (data, status, headers, config) {
          console.log('Something went wrong when updating the process model:' + JSON.stringify(data))
        })
    },

    undo: function (services) {
      // Get the last commands
      var lastCommands = services.$scope.undoStack.pop()

      if (lastCommands) {
        // Add the commands to the redo stack
        services.$scope.redoStack.push(lastCommands)

        // Force refresh of selection, might be that the undo command
        // impacts properties in the selected item
        if (services.$rootScope && services.$rootScope.forceSelectionRefresh) {
          services.$rootScope.forceSelectionRefresh = true
        }

        // Rollback every command
        for (var i = lastCommands.length - 1; i >= 0; --i) {
          lastCommands[i].rollback()
        }

        // Update and refresh the canvas
        services.$scope.editor.handleEvents({
          type: ORYX.CONFIG.EVENT_UNDO_ROLLBACK,
          commands: lastCommands
        })

        // Update
        services.$scope.editor.getCanvas().update()
        services.$scope.editor.updateSelection()
      }

      var toggleUndo = false
      if (services.$scope.undoStack.length == 0) {
        toggleUndo = true
      }

      var toggleRedo = false
      if (services.$scope.redoStack.length > 0) {
        toggleRedo = true
      }

      if (toggleUndo || toggleRedo) {
        for (var i = 0; i < services.$scope.items.length; i++) {
          var item = services.$scope.items[i]
          if (toggleUndo && item.action === 'KISBPM.TOOLBAR.ACTIONS.undo') {
            services.$scope.safeApply(function () {
              item.enabled = false
            })
          } else if (toggleRedo && item.action === 'KISBPM.TOOLBAR.ACTIONS.redo') {
            services.$scope.safeApply(function () {
              item.enabled = true
            })
          }
        }
      }
    },

    redo: function (services) {
      // Get the last commands from the redo stack
      var lastCommands = services.$scope.redoStack.pop()

      if (lastCommands) {
        // Add this commands to the undo stack
        services.$scope.undoStack.push(lastCommands)

        // Force refresh of selection, might be that the redo command
        // impacts properties in the selected item
        if (services.$rootScope && services.$rootScope.forceSelectionRefresh) {
          services.$rootScope.forceSelectionRefresh = true
        }

        // Execute those commands
        lastCommands.each(function (command) {
          command.execute()
        })

        // Update and refresh the canvas
        services.$scope.editor.handleEvents({
          type: ORYX.CONFIG.EVENT_UNDO_EXECUTE,
          commands: lastCommands
        })

        // Update
        services.$scope.editor.getCanvas().update()
        services.$scope.editor.updateSelection()
      }

      var toggleUndo = false
      if (services.$scope.undoStack.length > 0) {
        toggleUndo = true
      }

      var toggleRedo = false
      if (services.$scope.redoStack.length == 0) {
        toggleRedo = true
      }

      if (toggleUndo || toggleRedo) {
        for (var i = 0; i < services.$scope.items.length; i++) {
          var item = services.$scope.items[i]
          if (toggleUndo && item.action === 'KISBPM.TOOLBAR.ACTIONS.undo') {
            services.$scope.safeApply(function () {
              item.enabled = true
            })
          } else if (toggleRedo && item.action === 'KISBPM.TOOLBAR.ACTIONS.redo') {
            services.$scope.safeApply(function () {
              item.enabled = false
            })
          }
        }
      }
    },

    cut: function (services) {
      KISBPM.TOOLBAR.ACTIONS._getOryxEditPlugin(services.$scope).editCut()
      for (var i = 0; i < services.$scope.items.length; i++) {
        var item = services.$scope.items[i]
        if (item.action === 'KISBPM.TOOLBAR.ACTIONS.paste') {
          services.$scope.safeApply(function () {
            item.enabled = true
          })
        }
      }
    },

    copy: function (services) {
      KISBPM.TOOLBAR.ACTIONS._getOryxEditPlugin(services.$scope).editCopy()
      for (var i = 0; i < services.$scope.items.length; i++) {
        var item = services.$scope.items[i]
        if (item.action === 'KISBPM.TOOLBAR.ACTIONS.paste') {
          services.$scope.safeApply(function () {
            item.enabled = true
          })
        }
      }
    },

    paste: function (services) {
      KISBPM.TOOLBAR.ACTIONS._getOryxEditPlugin(services.$scope).editPaste()
    },

    deleteItem: function (services) {
      KISBPM.TOOLBAR.ACTIONS._getOryxEditPlugin(services.$scope).editDelete()
    },

    addBendPoint: function (services) {
      var dockerPlugin = KISBPM.TOOLBAR.ACTIONS._getOryxDockerPlugin(services.$scope)

      var enableAdd = !dockerPlugin.enabledAdd()
      dockerPlugin.setEnableAdd(enableAdd)
      if (enableAdd) {
        dockerPlugin.setEnableRemove(false)
        document.body.style.cursor = 'pointer'
      } else {
        document.body.style.cursor = 'default'
      }
    },

    removeBendPoint: function (services) {
      var dockerPlugin = KISBPM.TOOLBAR.ACTIONS._getOryxDockerPlugin(services.$scope)

      var enableRemove = !dockerPlugin.enabledRemove()
      dockerPlugin.setEnableRemove(enableRemove)
      if (enableRemove) {
        dockerPlugin.setEnableAdd(false)
        document.body.style.cursor = 'pointer'
      } else {
        document.body.style.cursor = 'default'
      }
    },

    exportModel: function (services) {
      window.location.href = KISBPM.URL.getBPMN(services.$scope.editor.getModelMetaData().modelId)
    },

    splitModel: function (services) {
      var modelMetaData = services.$scope.editor.getModelMetaData()

      services.$scope.editor.setSelection([])

      var params = {
        jsonContent: JSON.stringify(services.$scope.editor.getJSON())
      }

      // Update
      services.$http({
        method: 'PUT',
        data: params,
        ignoreErrors: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        transformRequest: function (obj) {
          var str = []
          for (var p in obj) {
            str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]))
          }
          return str.join('&')
        },
        url: KISBPM.URL.getSplitResult()
      })

        .success(function (data, status, headers, config) {
          // 创建红框部分的节点
          function parseSVG (s) {
            var div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div')
            div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + s + '</svg>'
            var frag = document.createDocumentFragment()
            while (div.firstChild.firstChild) { frag.appendChild(div.firstChild.firstChild) }
            return frag
          };

          data.data.forEach(rect => {
            var sv = parseSVG(
              '<g transform="translate(' + rect.x + ',' + rect.y + ')">' +
              '<rect width="' + rect.height + '"' + 'height="'+ rect.width +'"' +
              'stroke="red" fill="none" stroke-width="1" stroke-dasharray="2"></rect></g>'
            )
            var toAdd = document.getElementsByClassName('ORYX_Editor')[0].children[0].children[2]
            toAdd.append(sv)
          })
        })
        .error(function (data, status, headers, config) {
          console.log('Something went wrong when updating the process model:' + JSON.stringify(data))
        })
    },

    integrateModel: function (services) {
      var modelMetaData = services.$scope.editor.getModelMetaData()
      // var selection = services.$scope.editor.getSelection()
      // services.$scope.editor.setSelection([])
      // var itemPool = services.$scope.getStencilItemById('Pool')
      // var poolPos = {x: 0, y: 0}
      // var option = {}
      // option['type'] = services.$scope.modelData.model.stencilset.namespace + itemPool.id
      // option['namespace'] =services.$scope.modelData.model.stencilset.namespace
      // option['position'] = poolPos
      // option['parent'] = services.$scope.dragCurrentParent
      // var canAttach = true

      // // var item = $scope.getStencilItemById(ui.draggable[0].id);
      // // var pos = {x: event.pageX, y: event.pageY};
      // // var option = {};
      // // option['type'] = $scope.modelData.model.stencilset.namespace + item.id;
      // // option['namespace'] = $scope.modelData.model.stencilset.namespace;
      // // option['position'] = pos;
      // // option['parent'] = $scope.dragCurrentParent;
      
      // var commandClass = ORYX.Core.Command.extend({
      //   construct: function (option, dockedShape, canAttach, position, facade) {
      //     this.option = option
      //     this.docker = null
      //     this.dockedShape = dockedShape
      //     this.dockedShapeParent = dockedShape.parent || facade.getCanvas()
      //     this.position = position
      //     this.facade = facade
      //     this.selection = this.facade.getSelection()
      //     this.shape = null
      //     this.parent = null
      //     this.canAttach = canAttach
      //   },
      //   execute: function () {
      //     if (!this.shape) {
      //       this.shape = this.facade.createShape(option)
      //       this.parent = this.shape.parent
      //     } else if (this.parent) {
      //       this.parent.add(this.shape)
      //     }

      //     if (this.canAttach && this.shape.dockers && this.shape.dockers.length) {
      //       this.docker = this.shape.dockers[0]

      //       this.dockedShapeParent.add(this.docker.parent)

      //       // Set the Docker to the new Shape
      //       this.docker.setDockedShape(undefined)
      //       this.docker.bounds.centerMoveTo(this.position)
      //       if (this.dockedShape !== this.facade.getCanvas()) {
      //         this.docker.setDockedShape(this.dockedShape)
      //       }
      //       this.facade.setSelection([this.docker.parent])
      //     }

      //     this.facade.getCanvas().update()
      //     this.facade.updateSelection()
      //   },
      //   rollback: function () {
      //     if (this.shape) {
      //       this.facade.setSelection(this.selection.without(this.shape))
      //       this.facade.deleteShape(this.shape)
      //     }
      //     if (this.canAttach && this.docker) {
      //       this.docker.setDockedShape(undefined)
      //     }
      //     this.facade.getCanvas().update()
      //     this.facade.updateSelection()

      //   }
      // })

      // // Update canvas
      // var command = new commandClass(option, services.$scope.dragCurrentParent, canAttach, poolPos, services.$scope.editor)
      // services.$scope.editor.executeCommands([command])

      var params = {
        jsonContent: JSON.stringify(services.$scope.editor.getJSON())
      }
      // var a = services.$scope.editor.getSelection()
      // services.$scope.editor.getCanvas().add(a)
      
      var canvas = [services.$scope.editor.getCanvas().getChildNodes()[0].bounds.a.x, services.$scope.editor.getCanvas().getChildNodes()[0].bounds.b.x]
      console.log(canvas)
      var move = {x: 0, y: 300}
      services.$scope.editor.getCanvas().getChildNodes(false, function (shape) { shape.bounds.moveBy(move) })
      var edges = services.$scope.editor.getCanvas().getChildEdges().findAll(function (edge) { return edge.getAllDockedShapes().length > 0})
      var dockers = edges.collect(function (edge) { return edge.dockers.findAll(function (docker) { return !docker.getDockedShape() })}).flatten();
      dockers.each(function (docker) { docker.bounds.moveBy(move)})
      console.log(document.getElementsByClassName('ORYX_Editor')[0].children[0])
      // document.getElementsByClassName('ORYX_Editor')[0].children[0].children[2]
      function parseSVG (s) {
        var div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div')
        div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + s + '</svg>'
        var frag = document.createDocumentFragment()
        while (div.firstChild.firstChild) { frag.appendChild(div.firstChild.firstChild) }
        return frag
      };
      var addPool = document.getElementsByClassName('ORYX_Editor')[0].children[0].children[2]
      var poolSv = parseSVG(
        '<rect x="0" y="0" width="600" height="250"' +
        'stroke="black" fill="none" stroke-width="1" stroke-dasharray="2"></rect>'
      )
      addPool.append(poolSv)

      // var option={
      //   type:namespace + 'Pool'

      // }

      // this.facade.getCanvas().getChildNodes()
      // services.$scope.items //按钮
      // this.facade.getCanvas().update();
      // var option = {
      //   type: namespace + 'Lane',
      //   position:{x: 0,y: 0},
      //   namespace:shape.getStencil().namespace(),
      //   parent:shape
      // };
      // this.facade.createShape(option)
      // this.facade.getCanvas().update()
      // services.$scope.editor.getCanvas().update()
      // Update
      services.$http({
        method: 'PUT',
        data: params,
        ignoreErrors: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        transformRequest: function (obj) {
          var str = []
          for (var p in obj) {
            str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]))
          }
          return str.join('&')
        },
        url: KISBPM.URL.getSplitResult()
      })

        .success(function (data, status, headers, config) {
          // 创建框部分和虚线
          function parseSVG (s) {
            var div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div')
            div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + s + '</svg>'
            var frag = document.createDocumentFragment()
            while (div.firstChild.firstChild) { frag.appendChild(div.firstChild.firstChild) }
            return frag
          };
          var rectLocation = []
          data.data.forEach(rect => {
            var sv = parseSVG(
              '<g transform="translate(' + rect.x + ',' + rect.y + ')">' +
              '<rect width="' + rect.height + '"' + 'height="'+ rect.width +'"' +
              'stroke="black" fill="none" stroke-width="1" stroke-dasharray="2"></rect></g>'
            )
            rectLocation.push([rect.x, rect.y, rect.width, rect.height])
            var toAdd = document.getElementsByClassName('ORYX_Editor')[0].children[0].children[2]
            toAdd.append(sv)
          })
          // console.log(rectLocation)
          var addLine = document.getElementsByClassName('ORYX_Editor')[0].children[0].children[2]
          for (var i = 0; i < rectLocation.length - 1; i++) {
            // 根据x、y哪个更近来画虚线
            var finalbeginx, finalbeginy, finalendx, finalendy
            var largex, largey, smallx, smally, addwidth, addheight
            var smallxGroup, largexGroup, smallyGroup, largeyGroup
            // 判断位置左右上下和位置
            if (rectLocation[i][0] > rectLocation[i + 1][0]) {
              largex = rectLocation[i][0]
              smallx = rectLocation[i + 1][0]
              addwidth = rectLocation[i + 1][3]
              largexGroup = rectLocation[i]
              smallxGroup = rectLocation[i + 1]
            } else {
              largex = rectLocation[i + 1][0]
              smallx = rectLocation[i][0]
              addwidth = rectLocation[i][3]
              largexGroup = rectLocation[i + 1]
              smallxGroup = rectLocation[i]
            }
            // y
            if (rectLocation[i][1] > rectLocation[i + 1][1]) {
              largey = rectLocation[i][1]
              smally = rectLocation[i + 1][1]
              addheight = rectLocation[i + 1][2]
              largeyGroup = rectLocation[i]
              smallyGroup = rectLocation[i + 1]
            } else {
              largey = rectLocation[i + 1][1]
              smally = rectLocation[i][1]
              addheight = rectLocation[i][2]
              largeyGroup = rectLocation[i + 1]
              smallyGroup = rectLocation[i]
            }
            // 再判断是横向还是纵向
            if (Math.abs(largex - smallx - addwidth) < Math.abs(largey - smally - addheight)) {
              // 横向更近
              finalbeginx = smallxGroup[0] + smallxGroup[3]
              finalbeginy = smallxGroup[1] + (smallxGroup[2] / 2)  // 取一半高
              finalendx = largexGroup[0]
              finalendy = largexGroup[1] + (largexGroup[2] / 2)
            } else {
              // 纵向更近
              finalbeginx = smallyGroup[0] + (smallyGroup[3] / 2)
              finalbeginy = smallyGroup[1] + smallyGroup[2]
              finalendx = largeyGroup[0] + (largeyGroup[3] / 2)
              finalendy = largeyGroup[1]
            }
            // finalbeginx = rectLocation[i][0] + rectLocation[i][3] / 2
            // finalbeginy = rectLocation[i][1] + rectLocation[i][2] / 2
            // finalendx = rectLocation[i + 1][0] + rectLocation[i + 1][3] / 2
            // finalendy = rectLocation[i + 1][1] + rectLocation[i + 1][2] / 2
            // finalbeginx = rectLocation[i][0]
            // finalbeginy = rectLocation[i][1]
            // finalendx = rectLocation[i + 1][0]
            // finalendy = rectLocation[i + 1][1]
            // 模拟pool
            var sv = parseSVG(
              '' +
              '<line x1="' + finalbeginx + '"' + 'y1="' + finalbeginy + '"' +
              'x2="' + finalendx + '"' + 'y2="' + finalendy + '"' +
              'stroke="black"  stroke-width="0.5" stroke-dasharray="3 2"></line>'
            )
            addLine.append(sv)
          }
        })
        .error(function (data, status, headers, config) {
          console.log('Something went wrong when updating the process model:' + JSON.stringify(data))
        })
      services.$scope.editor.getCanvas().update()
    },
    /**
     * Helper method: fetches the Oryx Edit plugin from the provided scope,
     * if not on the scope, it is created and put on the scope for further use.
     *
     * It's important to reuse the same EditPlugin while the same scope is active,
     * as the clipboard is stored for the whole lifetime of the scope.
     */
    _getOryxEditPlugin: function ($scope) {
      if ($scope.oryxEditPlugin === undefined || $scope.oryxEditPlugin === null) {
        $scope.oryxEditPlugin = new ORYX.Plugins.Edit($scope.editor)
      }
      return $scope.oryxEditPlugin
    },

    zoomIn: function (services) {
      KISBPM.TOOLBAR.ACTIONS._getOryxViewPlugin(services.$scope).zoom([1.0 + ORYX.CONFIG.ZOOM_OFFSET])
    },

    zoomOut: function (services) {
      KISBPM.TOOLBAR.ACTIONS._getOryxViewPlugin(services.$scope).zoom([1.0 - ORYX.CONFIG.ZOOM_OFFSET])
    },

    zoomActual: function (services) {
      KISBPM.TOOLBAR.ACTIONS._getOryxViewPlugin(services.$scope).setAFixZoomLevel(1)
    },

    zoomFit: function (services) {
      KISBPM.TOOLBAR.ACTIONS._getOryxViewPlugin(services.$scope).zoomFitToModel()
    },

    alignVertical: function (services) {
      KISBPM.TOOLBAR.ACTIONS._getOryxArrangmentPlugin(services.$scope).alignShapes([ORYX.CONFIG.EDITOR_ALIGN_MIDDLE])
    },

    alignHorizontal: function (services) {
      KISBPM.TOOLBAR.ACTIONS._getOryxArrangmentPlugin(services.$scope).alignShapes([ORYX.CONFIG.EDITOR_ALIGN_CENTER])
    },

    sameSize: function (services) {
      KISBPM.TOOLBAR.ACTIONS._getOryxArrangmentPlugin(services.$scope).alignShapes([ORYX.CONFIG.EDITOR_ALIGN_SIZE])
    },

    closeEditor: function (services) {
      // window.location.href = "./index.html";
      window.location.href = '../projects'
    },

    /**
     * Helper method: fetches the Oryx View plugin from the provided scope,
     * if not on the scope, it is created and put on the scope for further use.
     */
    _getOryxViewPlugin: function ($scope) {
      if ($scope.oryxViewPlugin === undefined || $scope.oryxViewPlugin === null) {
        $scope.oryxViewPlugin = new ORYX.Plugins.View($scope.editor)
      }
      return $scope.oryxViewPlugin
    },

    _getOryxArrangmentPlugin: function ($scope) {
      if ($scope.oryxArrangmentPlugin === undefined || $scope.oryxArrangmentPlugin === null) {
        $scope.oryxArrangmentPlugin = new ORYX.Plugins.Arrangement($scope.editor)
      }
      return $scope.oryxArrangmentPlugin
    },

    _getOryxDockerPlugin: function ($scope) {
      if ($scope.oryxDockerPlugin === undefined || $scope.oryxDockerPlugin === null) {
        $scope.oryxDockerPlugin = new ORYX.Plugins.AddDocker($scope.editor)
      }
      return $scope.oryxDockerPlugin
    }
  }
}
