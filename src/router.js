import Vue from 'vue'
import Router from 'vue-router'
import Login from "@/components/Login";
import Home from "@/components/Home";

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: '/login',
      component: Login
    },
    {
      path:'/login',
      component: Login
    },
    {
      path:'/home',
      component: Home
    }
  ]
})
//拦截器导航守卫
router.beforeEach((to,from,next) => {
//to将要访问的路径
//from 代表从哪个路径来
//next 是一个函数，表示放行
  if(to.path == '/login') return next();
  //获取token
  const tokenStr = window.sessionStorage.getItem('token');
  if(!tokenStr) return next('/login');
  next()
})

export default router