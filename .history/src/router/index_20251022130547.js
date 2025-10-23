import Vue from 'vue'
import Router from 'vue-router'
// eslint-disable-next-line no-unused-vars
import index_2 from '../pages/index'
import index from '../pages/index_2'
import projects from '../pages/projects/projects'
import workspace from '../pages/workspace/workspace'
import TargetDetection from '../pages/TargetDetection.vue'
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
      path: '/target-detection', // 这个路径应该与 index.vue 中 router-link 的 to 属性一致
      name: 'TargetDetection', // 给路由起一个名字
      component: DomainModeling // 关联到导入的组件
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
