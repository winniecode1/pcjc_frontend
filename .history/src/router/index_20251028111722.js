import Vue from 'vue'
import Router from 'vue-router'
// eslint-disable-next-line no-unused-vars
import index_2 from '../pages/index'
import index from '../pages/index_2'
import projects from '../pages/projects/projects'
import workspace from '../pages/workspace/workspace'
import TargetDetection from '../pages/TargetDetection.vue'
import GroupNegotiation from '../pages/GroupNegotiation.vue'
import DecisionMaking from '../pages/DecisionMaking.vue'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/index',
      component: index_2,
      pathMatch: 'full'
    },
    {
      path: '/',
      component: index,
      pathMatch: 'full'
    },
    {
      path: '/target-detection', // 目标检测
      name: 'TargetDetection',
      component: TargetDetection
    },
    {
      path: '/decisionmaking', // 决策选择
      name: 'DecisionMaking',
      component: DecisionMaking
    },
    {
      path: '/decisionmaking', // 决策选择
      name: 'DecisionMaking',
      component: AttributionDiagnosis
    },
    {
      path: '/group-negotiation', // 群体协商
      name: 'GroupNegotiation',
      component: GroupNegotiation
    },
    {
      path: '/projects',
      component: projects
    },
    {
      path: '/workspace',
      component: workspace
    }
  ],
  mode: 'history'
})
