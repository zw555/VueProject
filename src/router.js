import Vue from 'vue'
import Router from 'vue-router'
import Login from "@/components/Login";
import Home from "@/components/Home";
import Welcome from "@/components/Welcome";
import Users from "@/components/Users";
import Rights from "@/power/Rights";
import Roles from "@/power/Roles";
import Cate from "@/goods/Cate";
import Params from "@/goods/Params";
import GoodList from "@/goods/List";
import Add from "@/goods/Add";
import Order from "@/order/Order";
Vue.use(Router)

const router = new Router({
  routes: [
    {
      path:'/',redirect:'/login'
    },
    {
      path: '/',
      component: Login
    },
    {
      path:'/login',
      component: Login,

    },

    {
      path:'/home',
      component: Home,
      redirect:'/welcome',
      children:[
          {path:'/welcome', component: Welcome},
          {path:'/users',component:Users},
          {path:'/rights', component: Rights},
          {path:'/roles', component: Roles},
          {path:'/categories', component: Cate},
          {path:'/params', component: Params},
          {path:'/orders', component: Order},
          {path:'/goods', component: GoodList,},
          {path:'/goods/add',component:Add}
      ]
    },

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