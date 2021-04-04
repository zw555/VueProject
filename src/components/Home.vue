<template>
  <el-container class="home-container">
<!--    头部-->
    <el-header>
      <div>
        <img src="../assets/logo.png" class="logo" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
<!--    页面主体区-->
    <el-container>
<!--      侧边栏-->
      <el-aside :width="isCollapse ? '64px':'200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
<!--        侧边栏菜单区域-->
        <el-menu
            background-color="#333744"
            text-color="#fff"
            active-text-color="#409EFF"
            :collapse="isCollapse"
            :collapse-transition="false"
            :router="true"
            unique-opened
            :default-active="activePath"
            >
<!--            使用$router.path最优解-->
<!--          一级菜单-->
          <el-submenu :index="item.id+''" v-for="item in menulist":key="item.id" >
            <template slot="title">
<!--              图标-->
              <i :class="inconsObj[item.id]"></i>
<!--              文本-->
              <span>{{item.authName}}</span>
            </template>
<!--            二级菜单-->
            <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children":key="subItem.id" @click="saveNavState('/'+subItem.path)">
              <template slot="title">
                <!--              图标-->
                <i class="el-icon-menu"></i>
                <!--              文本-->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>

          </el-submenu>
        </el-menu>
      </el-aside>
<!--      右侧主题内容-->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data(){
    return{
      menulist:[],
      inconsObj:{
        '125':'iconfont icon-yonghuguanli ',
        '103':'iconfont icon-zuzhigoujia ',
        '101':'iconfont icon-tanpanguanli ',
        '102':'iconfont icon-hetongguanli',
        '145':'iconfont icon-shejiguanli '
      },
      //默认不折叠
      isCollapse: false,
      //被激活的链接地址
      activePath:''
    }
  },
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods:{
    logout(){
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    saveNavState(activePath){
        window.sessionStorage.setItem('activePath',activePath)
    },
    //点击按钮，切换菜单折叠和展开
    toggleCollapse(){
        this.isCollapse = !this.isCollapse
    },
    // 获取所有的菜单
    async getMenuList(){
        const {data:res} = await this.$http.get('http://127.0.0.1:8888/api/private/v1/menus')
      if(res.meta.status != 200) return this.$message.error(res.meta.msg)
      this.menulist  = res.data
    }
  }
}
</script>

<style lang="less" scoped>
.logo{
  height: 50px;
  width: 50px;
}
.iconfont{
  margin-right: 10px;
}
.el-header{
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #ffffff;
  font-size: 20px;
  > div{
    display: flex;
    align-items: center;
    span{
      margin-left: 15px;
    }
  }
}
.el-aside{
  background-color: #333744;
}
.el-main{
  background-color: #EAEDF1;
}
.home-container{
  height: 100%;
}
.el-menu{
  border-right: none;
}

.toggle-button{
  background-color: #4A5064;
  color: white;
  font-size: 10px;
  text-align: center;
  line-height: 24px;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
