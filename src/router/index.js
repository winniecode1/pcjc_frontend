import Vue from 'vue'
import Router from 'vue-router'
// eslint-disable-next-line no-unused-vars
import index_2 from '../pages/index'
import index from '../pages/index_2'
import projects from '../pages/projects/projects'
import workspace from '../pages/workspace/workspace'
import TargetDetection from '../pages/TargetDetection.vue'
import GroupNegotiation from '../pages/GroupNegotiation.vue'
import PriorKnowledge from '../pages/PriorKnowledge.vue'
import DecisionMaking from '../pages/DecisionMaking.vue'
import AttributionDiagnosis from '../pages/AttributionDiagnosis.vue'
import AttributionDiagnosisV2 from '../pages/AttributionDiagnosisV2.vue'
import HomePage from '../pages/home_page/index.vue'

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
      component: HomePage,
      pathMatch: 'full'
    },
    {
      path: '/target-detection', // 目标检测
      name: 'TargetDetection',
      component: TargetDetection
    },
    {
      path: '/prior-knowledge', // 先验知识
      name: 'PriorKnowledge',
      component: PriorKnowledge
    },
    {
      path: '/decisionmaking', // 决策选择
      name: 'DecisionMaking',
      component: DecisionMaking
    },
    {
      path: '/group-negotiation', // 群体协商
      name: 'GroupNegotiation',
      component: GroupNegotiation
    },
    {
      path: '/attributiondiagnosis', // 根因诊断
      name: 'AttributionDiagnosis',
      component: AttributionDiagnosisV2
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
