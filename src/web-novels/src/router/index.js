import Vue from 'vue'
import Router from 'vue-router'
import novel from '@/views/novel';
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'novel',
      component: novel
    }
  ]
})
