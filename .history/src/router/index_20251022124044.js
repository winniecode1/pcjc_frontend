import Vue from 'vue'
import Router from 'vue-router'
// eslint-disable-next-line no-unused-vars
import index_2 from '../pages/index'
import index from '../pages/index_2'
import projects from '../pages/projects/projects'
import workspace from '../pages/workspace/workspace'

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
      // 添加新的路由记录
      path: '/domain-modeling', 
      name: 'DomainModeling',
      component: DomainModeling // 关联到您的新组件
    }

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
