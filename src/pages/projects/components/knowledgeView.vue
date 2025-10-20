
<template>
  <div>
    <b-row>
      <b-col :md="2">
        <b-row :md="6"><b-button  type="primary" size="small" style="margin-left:25px; margin-top:20px; width:100px" @click="back" >返回</b-button></b-row>
        <b-row :md="2" style="color: #f3989b; margin-top:15px; font-size: large"></b-row>
        <b-row v-for="(name,index) in diagramNames" :key="index" style=" margin-left:5px;margin-top:15px; font-size: large">
          <b-col v-for="(color,ind) in colorSet" :key="ind" v-if="index == ind"><i class="fas fa-circle" v-bind:style="color"  ></i> {{name}}</b-col>
        </b-row>
<!--        <b-row :md="2"><b-col><i class="fas fa-circle" style="color: #f3989b; margin-top:15px; font-size: large"></i> 目标流程</b-col></b-row>-->
<!--        <b-row :md="2"><b-col><i class="fas fa-circle" style="color: #6495ED; margin-top:15px;"></i> 业务流程</b-col></b-row>-->
<!--        <b-row :md="2"><b-col><i class="fas fa-circle" style="color: #eeff41; margin-top:15px;"></i> 价值流程</b-col></b-row>-->
      </b-col>
      <b-col :md="10">
        <div class="force-pane"  id="myDiv">

          <svg id="mySvg"></svg>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
/**
   * 力导向图
   */
import * as d3 from 'd3'
let gs = ''
let forceSimulation = ''
let links = ''
let linksText = ''

// let edges=[{source:0,target:1,relation:"hasGoal",type:"resolved",value:1}];
//
// let nodes=[{name:"music"},{name:"delay huge amount"},{name:"delay"},{name:"huge amount"},{name:"0"}];
export default {
  name: 'Scale',
  data () {
    return {
      id: '',
      diagrams: [],
      diagramIDs: [],
      diagramTypes: [],
      diagramNames: [],
      nodes: [],
      edges: [],
      mapping: [],
      jsonText: '',
      text: '',
      width: 1400,
      height: 1000,
      circleR: 15,
      colorSet: [
        {color: '#eeff41'},
        {color: '#f3989b'},
        {color: '#6495ED'},
        {color: '#76EEC6'},
        // {color: '#7B68EE'},
        {color: '#00CD00'},
        {color: '#FFF68F'},
        {color: '#DAA520'},
        {color: '#8B4513'},
        {color: '#FF0000'}]
    }
  },
  // created:function(){
  //     this.getParams();
  // },
  computed: {
    listenChange () {
      const {nodes, edges, mapping} = this
      return {nodes, edges, mapping}
    }
  },
  watch: {
    // 监测路由变化,只要变化了就调用获取路由参数方法将数据存储本组件即可
    '$route': 'getParams',
    listenChange: {
      handler: function (newval, oldval) {
        // 1.创建svg画布
        console.log('in1', this.nodes.toString())
        let marge = { top: 60, bottom: 20, left: 10, right: 60 }
        // let width = document.getElementById(this.id).clientWidth
        // let height = document.getElementById(this.id).clientHeight
        // let width = 1600
        // let height = 1000
        const svg = d3
        // .select(this.$el)
          .select('#mySvg')
          // .select('svg').remove()
          // .append('svg')
          .attr('width', this.width)
          .attr('height', this.height)
        svg.selectAll('*').remove()
        let g = svg
          .append('g')
          .attr(
            'transform',
            'translate(' + marge.top + ',' + marge.left + ')'
          )

        // 2.设置一个color的颜色比例尺，为了让不同的扇形呈现不同的颜色
        var colorScale = d3
          .scaleOrdinal()
          .domain(d3.range(this.nodes.length))
          .range(d3.schemeCategory10)

        // 3.新建一个力导向图
        forceSimulation = d3
          .forceSimulation()
          .force('link', d3.forceLink())
          .force('charge', d3.forceManyBody())
          .force('center', d3.forceCenter())

        // 4. 初始化力导向图
        // 生成节点数据
        forceSimulation.nodes(this.nodes).on('tick', this.ticked)
        // 生成边数据
        forceSimulation
          .force('link')
          .links(this.edges)
          .distance(function (d) {
            // 每一边的长度
            return d.value * 100
          })
        // 设置图形的中心位置
        forceSimulation
          .force('center')
          .x(this.width / 4)
          .y(this.height / 4)
        // 绘制箭头
        var defs = svg.append('defs')

        var arrowMarker = defs.append('marker')
          .attr('id', 'arrow')
          .attr('markerUnits', 'strokeWidth')
          .attr('markerWidth', '8')
          .attr('markerHeight', '8')
          .attr('viewBox', '0 0 12 12')
          .attr('refX', '13')
          .attr('refY', '6')
          .attr('orient', 'auto')

        let arrowPath = 'M2,2 L10,6 L2,10 L6,6 L2,2'

        arrowMarker.append('path')
          .attr('d', arrowPath)
          .attr('fill', '#8B8B7A')
        // 5. 绘制边(有了节点和边的数据后)
        links = g
          .append('g')
          .selectAll('line')
          .data(this.edges)
          .enter()
          .append('line')
          .attr('stroke', function (d, i) {
            return colorScale(i)
          })
          .attr('stroke-width', 1)
          .attr('marker-end', 'url(#arrow)')
        linksText = g
          .append('g')
          .selectAll('text')
          .data(this.edges)
          .enter()
          .append('text')
          .text(function (d) {
            return d.relation
          })

        // 6. 绘制节点, 先为节点和节点上的文字分组
        console.log('12121', this.nodes, this.mapping, this.edges)
        gs = g
          .selectAll('.circleText')
          .data(this.nodes)
          .enter()
          .append('g')
          .attr('transform', function (d, i) {
            var cirX = d.x
            var cirY = d.y
            return 'translate(' + cirX + ',' + cirY + ')'
          })
          .call(
            d3
              .drag()
              .on('start', this.dragStart)
              .on('drag', this.drag)
              .on('end', this.dragEnd)
          )

        // 绘制节点
        gs.append('circle')
          .attr('r', this.circleR)
          .on('click', function (node) {
            // 单击时让连接线加粗
            links.style('stroke-width', function (line) {
              if (line.source.name === node.name || line.target.name === node.name) {
                return 4
              } else {
                return 1
              }
            })
            // d3.select(this).style('stroke-width',2);
          })
          .attr('fill', function (d, i) {
            return d.belong
          })
        // 文字
        gs.append('text')
          .attr('x', -10)
          .attr('y', -20)
          .attr('dy', 10)
          .text(function (d) {
            return d.name
          })
      }
    }

  },
  methods: {
    bug () {
      console.log(this.nodes)
    },
    back () {
      this.$router.go(-1)
    },
    // 获取点和边
    getNodes () {
      var nodes = [
        {name: '通信运营商/角色', type: '角色', belong: '#6495ED'},
        {name: '装维人员/角色', type: '角色', belong: '#6495ED'},
        {name: '提供提醒网络服务/目标', type: '目标', belong: '#6495ED'},
        {name: '费用/价值对象', type: '价值对象', belong: '#6495ED'},
        {name: '通信网络服务的安装与维护/价值活动', type: '价值活动', belong: '#6495ED'},
        {name: '装维服务/价值对象', type: '价值对象', belong: '#6495ED'},
        {name: '开始/event', type: '价值对象', belong: '#f3989b'},
        {name: '运输/task', type: '价值对象', belong: '#f3989b'},
        {name: '结束/event', type: '价值对象', belong: '#f3989b'}
      ]

      var links = [
        {source: 0, target: 1, relation: '普通连接', value: 1.5},
        {source: 1, target: 2, relation: '普通连接', value: 2},
        {source: 2, target: 3, relation: '普通连接', value: 2},
        {source: 3, target: 4, relation: '普通连接', value: 2},
        {source: 4, target: 5, relation: '普通连接', value: 2},
        {source: 5, target: 1, relation: '普通连接', value: 2},
        {source: 5, target: 2, relation: '普通连接', value: 3},
        {source: 6, target: 7, relation: '', value: 3},
        {source: 7, target: 8, relation: '', value: 3},
        {source: 7, target: 2, relation: '实现', value: 3}
      ]

      this.edges = links
      this.nodes = nodes
    },
    showDataGrapth () {
      let IDs = ''
      for (let i = 0; i < this.diagramIDs.length; i++) {
        IDs += this.diagramIDs[i] + ';'
      }
      this.$ajax.get('api/diagram/withDiagrams', {
        params: {
          'diagramIds': IDs
        }
      })
        .then((response) => {
          console.log(response)
          const code = response.data.code
          if (code === 1) {
            this.diagrams = response.data.data
            console.log('diagrams', this.diagrams)
            for (let j = 0; j < this.diagrams.length; j++) {
              let diagram = this.diagrams[j]
              this.jsonText = this.diagrams[j].jsonContent
              let jsonObj = JSON.parse(this.jsonText)
              let modelName = jsonObj.class
              console.log('modelName', modelName)
              if (diagram.diagramType === 'BPMN') {
                this.getBPMNnodesAndlinks(jsonObj, j, this.diagrams[j].diagramId)
              } else {
                this.getNodesAndLinks(jsonObj, j, this.diagrams[j].diagramId)
              }
            }
          }
        })
        .catch((error) => {
          console.log(error)
        })
    },
    getBPMNnodesAndlinks (jsonObj, index, filename) {
      let linkArray = jsonObj.linkDataArray
      let nodeArray = jsonObj.nodeDataArray
      for (let i = 0; i < nodeArray.length; i++) {
        this.mapping.push(filename + nodeArray[i].key)
        let node = {}
        node.name = nodeArray[i].text.toString() + '/' + nodeArray[i].category.toString()
        node.type = nodeArray[i].category.toString()
        node.belong = this.colorSet[index].color
        // node.nodeType = nodeArray[i].nodeType
        this.nodes.push(node)
      }
      for (let j = 0; j < linkArray.length; j++) {
        let link = {}
        console.log('source', this.mapping.indexOf(filename + linkArray[j].from).toString())
        link.source = parseInt(this.mapping.indexOf(filename + linkArray[j].from).toString())
        link.target = parseInt(this.mapping.indexOf(filename + linkArray[j].to).toString())
        let linkType = linkArray[j].category
        // console.log(linkType)
        linkType = linkType === undefined ? '普通连接' : linkType
        link.relation = linkType
        link.type = 'resolved'
        link.value = 1.3
        this.edges.push(link)
      }
    },
    getNodesAndLinks (jsonObj, index, filename) {
      let linkArray = jsonObj.linkDataArray
      let nodeArray = jsonObj.nodeDataArray
      // let mapping = []
      // let pnodes = []
      // let plinks = []
      // this.nodes.push({name: '通信运营商', type: '角色'})
      for (let i = 0; i < nodeArray.length; i++) {
        this.mapping.push(filename + nodeArray[i].key)
        let node = {}
        node.name = nodeArray[i].Name.toString() + '/' + nodeArray[i].Type.substring(2, nodeArray[i].Type.length - 2).toString()
        node.type = nodeArray[i].Type.substring(2, nodeArray[i].Type.length - 2).toString()
        node.belong = this.colorSet[index].color
        // node.nodeType = nodeArray[i].nodeType
        this.nodes.push(node)
      }
      for (let j = 0; j < linkArray.length; j++) {
        let link = {}
        console.log('source', this.mapping.indexOf(filename + linkArray[j].from).toString())
        link.source = parseInt(this.mapping.indexOf(filename + linkArray[j].from).toString())
        link.target = parseInt(this.mapping.indexOf(filename + linkArray[j].to).toString())
        let linkType = linkArray[j].Linktype
        // console.log(linkType)
        linkType = linkType === undefined ? '普通连接' : linkType
        link.relation = linkType
        link.type = 'resolved'
        link.value = this.randomFloor(1, 3)
        this.edges.push(link)
      }
      // this.nodes = pnodes
      console.log('currentnodes', this.nodes)
    },
    getLinks (jsonObj, index) {
      let linkArray = jsonObj.linkDataArray
      // let nodeArray = jsonObj.nodeDataArray
      // let pnodes = []
      // let plinks = []
      // this.nodes.push({name: '通信运营商', type: '角色'})
      for (let j = 0; j < linkArray.length; j++) {
      }
    },
    // 生成[min,max]随机浮点数
    randomFloor (min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min)
    },
    // 通过js的内置对象JSON来进行数组对象的深拷贝
    deepClone2 (obj) {
      let _obj = JSON.stringify(obj)
      let objClone = JSON.parse(_obj)
      return objClone
    },
    getParams: function () {
      // 取到路由带过来的参数
      // this.nodes = this.$route.query.nodes
      this.diagramIDs = this.$route.query.diagramIDs
      this.diagramTypes = this.$route.query.diagramTypes
      this.diagramNames = this.$route.query.diagramNames
      // this.getNodes()
      // console.log('names', this.diagramNames)
      this.showDataGrapth()
      // console.log('1', n)
      console.log('last', this.nodes.length, this.nodes.toString())
      // 将数据放在当前组件的数据内
    },
    uuid () {
      function s4 () {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1)
      }
      return (
        s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
      )
    },
    ticked () {
      gs
        .attr('x', function (d) {
          return validateXY(d.x, 'x')
        })
        .attr('y', function (d) {
          return validateXY(d.y, 'y')
        })
      // 更新连线坐标
      links.attr('x1', function (d) { return validateXY(d.source.x, 'x') })
        .attr('y1', function (d) { return validateXY(d.source.y, 'y') })
        .attr('x2', function (d) { return validateXY(d.target.x, 'x') })
        .attr('y2', function (d) { return validateXY(d.target.y, 'y') })

      linksText
        .attr('x', function (d) {
          return (d.source.x + d.target.x) / 2
        })
        .attr('y', function (d) {
          return (d.source.y + d.target.y) / 2
        })

      gs.attr('transform', d => {
        if (d.x > 1200 - 15) {
          d.x = 1200 - 15
        } else if (d.x < 15) {
          d.x = 15
        } else {
          d.x = d.x
        }
        if (d.y > 800 - 15) {
          d.y = 800 - 15
        } else if (d.y < 15) {
          d.y = 15
        } else {
          d.y = d.y
        }
        return 'translate(' + d.x + ',' + d.y + ')'
      })
      // 校验坐标是否在范围内，15为圆的半径
      function validateXY (val, type) {
        console.log()
        var r = 15
        if (val < r) return r
        if (type === 'x') {
          if (val > 1200 - r) return 1200 - r
        } else {
          if (val > 800 - r) return 800 - r
        }
        return val
      }
    },
    dragStart (d) {
      if (!d3.event.active) {
        // 设置衰减系数，对节点位置移动过程的模拟，数值越高移动越快，数值范围[0，1]
        forceSimulation.alphaTarget(0.8).restart()
      }
      if (d.x > 1200 - 15) {
        d.fx = 1200 - 15
      } else if (d.x < 15) {
        d.fx = 15
      } else {
        d.fx = d.x
      }
      if (d.y > 800 - 15) {
        d.fy = 800 - 15
      } else if (d.y < 15) {
        d.fy = 15
      } else {
        d.fy = d.y
      }
      // d.fx = d.x
      // d.fx = d.x
    },
    dragEnd (d) {
      if (d3.event.x > 1200 - 15) {
        d.fx = 1200 - 15
      } else if (d3.event.x < 15) {
        d.fx = 15
      } else {
        d.fx = d3.event.x
      }
      if (d3.event.y > 800 - 15) {
        d.fy = 800 - 15
      } else if (d3.event.y < 15) {
        d.fy = 15
      } else {
        d.fy = d3.event.y
      }
      // d.fx = d3.event.x
      // d.fy = d3.event.y
    },
    drag (d) {
      if (!d3.event.active) {
        forceSimulation.alphaTarget(0)
      }
      d.fx = null
      d.fy = null
    }
  },
  beforeRouteLeave (to, from, next) {
    // 设置下一个路由的 meta
    to.meta.keepAlive = true // B 跳转到 A 时，让 A 缓存，即不刷新
    next()
  },

  mounted () {
    // this.id = this.uuid()
    this.getParams()
  }
}
</script>
<style  scoped>
  .force-pane {
    width: 100%;
    height: 1000px;
  }
</style>
