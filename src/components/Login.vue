<template>
  <div class="login_cantainer">
    <div class="login_box">
      <div class="avatar_box">
        <!--          头像区域-->
        <img src="../assets/logo.png" alt="logo">
      </div>
      <!--登录表单区域-->
      <el-form ref="loginformRef" :model="Loginform" :rules="loginFormRules" class="login_form">
<!--        用户名-->
        <el-form-item prop="username">
          <el-input placeholder="请输入用户名" prefix-icon="el-icon-user" v-model="Loginform.username"></el-input>
        </el-form-item>
<!--        密码-->
        <el-form-item prop="password" >
          <el-input  placeholder="请输入密码" prefix-icon="el-icon-unlock" v-model="Loginform.password" show-password></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>

    </div>
  </div>
</template>
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
<script>
export default {
  data(){
    return{
      Loginform:{
        username:'admin',
        password:'123456',
      },
      //这是验证表单的规则
      loginFormRules:{
        //验证用户名是否合法
        username:[
          {require:true,message:'请输入姓名',trigger:'blur'},
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 验证密码是否合法
        password:[
          {require:true,message:'请输入姓名',trigger:'blur'},
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods:{
    resetLoginForm(){
      this.$refs.loginformRef.resetFields();
    },
    login(){
      this.$refs.loginformRef.validate(async (valid) => {
        if(!valid) return ;
        let {data: res} = await this.$http.post('http://127.0.0.1:8888/api/private/v1/login', this.Loginform);
        if(res.meta.status != 200) return this.$message.error('登录失败');
        this.$message.success('登录成功');
        window.sessionStorage.setItem('token',res.data.token);
        this.$router.push("/home");
      });
    }
  }
}
</script>

<style lang="less" scoped>

.login_cantainer{
  background-color: #2b4b6b;
  height: 100%;
}
.login_box{
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
}
.avatar_box{
  height: 130px;
  width: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%,-50%);
  background-color: #fff;
  img{
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
}
.btns{
  display: flex;
  justify-content: flex-end;
}
.login_form{
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
</style>