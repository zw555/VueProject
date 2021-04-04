<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/users' }">用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card >
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList" ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>

        </el-col>

      </el-row>
      <el-table  :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
        <template slot-scope="scope">
            <el-switch @change="userStateChanged(scope.row)" v-model="scope.row.mg_state"></el-switch>
        </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
            <template slot-scope="scope">
<!--              修改按钮-->
                <el-button size="mini" alt="111" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)"></el-button>
<!--              删除按钮-->
              <el-button size="mini" type="danger" icon="el-icon-delete"  @click="removeUserById(scope.row.id)"></el-button>
<!--              分配角色按钮-->
              <el-tooltip  effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button size="mini" type="warning" icon="el-icon-setting"></el-button>
              </el-tooltip>
            </template>
        </el-table-column>
      </el-table>
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1, 2, 5, 10]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </el-card>
<!--    添加用户的对话框-->
    <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed"
        >
<!--      内容主体区-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username" >
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" >
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email" >
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile" >
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
        <!--      底部区域-->
      </el-form>
      <span slot="footer" class="dialog-footer" >
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="adduser">确 定</el-button>
      </span>
    </el-dialog>
<!--    修改用户对话框-->
    <el-dialog
        title="修改用户"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed"
    >
      <!--      内容主体区-->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username" >
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email" >
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile" >
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
        <!--      底部区域-->
      </el-form>
      <span slot="footer" class="dialog-footer" >
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data(){
    //验证邮箱的规则
    var checkEmail = (rule,value,cb) => {
      const regEmail = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/
      if(regEmail.test(value)){
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    var checkMobile = (rule,value,cb) => {
      const regMobile = /^1(3|4|5|6|7|8|9)\d{9}$/;
      if(regMobile.test(value))
        return cb()
      cb(new Error('请输入合法的手机号'))
    }
      return{
        //获取用户列表的参数对象
        queryInfo:{
          query:'',
          //当前的页数
          pagenum: 1,
          //当前每页显示多少数据
          pagesize: 2
        },
        //添加用户的表单数据
        addForm:{
          username:'',
          email:'',
          mobile:'',
          password:''
        },

        //添加表单的验证规则
        addFormRules:{
          username:[
            {required: true,message:'请输入用户名', trigger:'blur'},
            {
              min:3,max:10,
              message: '请用户名的长度在3-10之间',
              trigger: 'blur'
            }
          ],
          password:[
            {required: true,message:'请输入密码', trigger:'blur'},
            {
              min:6,max:15,
              message: '请密码的长度在6-15之间',
              trigger: 'blur'
            }
          ],
          email:[
            {required: true,message:'请输入邮箱',trigger:'blur'},
            {validator:checkEmail,trigger:'blur'}
          ],
          mobile:[
            {required: true,message:'请输入电话',trigger:'blur'},
            {validator:checkMobile,trigger: 'blur'}
          ]
        },
        editFormRules:{
          username:[
            {required: true,message:'请输入用户名', trigger:'blur'},
            {
              min:3,max:10,
              message: '请用户名的长度在3-10之间',
              trigger: 'blur'
            }
          ],

          email:[
            {required: true,message:'请输入邮箱',trigger:'blur'},
            {validator:checkEmail,trigger:'blur'}
          ],
          mobile:[
            {required: true,message:'请输入电话',trigger:'blur'},
            {validator:checkMobile,trigger: 'blur'}
          ]
        },
        userList:[],
        total:0,
        //控制添加用户对话框的隐藏
        addDialogVisible: false,
        //控制修改用户对话框的隐藏
        editDialogVisible: false,
        //查询到的用户信息
        editForm:{},
      }
  },
  created() {
    this.getUserList()
  },
  methods:{
    async getUserList(){
      const {data:res} = await this.$http.get('http://127.0.0.1:8888/api/private/v1/users',{params: this.queryInfo})
      if(res.meta.status != 200) return this.$message.error('获取用户失败')
      this.userList = res.data.users
      this.total = res.data.total
      console.log(res)
    },
    async removeUserById(id) {

      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if(confirmResult !== 'confirm'){
        return this.$message.info('已取消删除')
      }
      const {data:res} = await this.$http.delete('http://127.0.0.1:8888/api/private/v1/users/'+id)
      if(res.meta.status !=200) {
        return this.$message.error('删除用户失败')
      }
      this.getUserList()
      // this.pagenum = 1
      return this.$message.success('删除用户成功')

    },
    //监听添加用户对话框的对话事件
    addDialogClosed(){
        this.$refs.addFormRef.resetFields()
    },
    //监听switch开关状态的改变
    async userStateChanged(userinfo){
      // console.log(userinfo)
      const {data:res} = await this.$http.put( `http://127.0.0.1:8888/api/private/v1/users/${userinfo.id}/state/${userinfo.mg_state}`)
      if(res.meta.status !=200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      return this.$message.success('更新用户状态成功')
      },
    //监听pagesize改变的事件
    handleSizeChange(newSize){
        // console.log(newSize)
        this.queryInfo.pagesize = newSize
        this.getUserList()
    },
    //监听 页码值 改变的事件
    handleCurrentChange(newPage){
        this.queryInfo.pagenum = newPage
        this.getUserList()
    },
    //点击按钮添加新用户
    adduser(){
      //校验表单
       this.$refs.addFormRef.validate( async vaild =>{
          if(!vaild) return
          //可以发起添加用户的网络请求
          const {data:res} = await this.$http.post('http://127.0.0.1:8888/api/private/v1/users',this.addForm)
         if(res.meta.status != 201){
           this.$message.error('添加用户失败')
         }
         this.addDialogVisible = false
         this.$message.success('添加用户成功')
         console.log(res)
         this.getUserList()
        })
    },
    //编辑用户的对话框
    async showEditDialog(id){
      // console.log(id)
      const {data:res} = await this.$http.get('http://127.0.0.1:8888/api/private/v1/users/'+id)
      if(res.meta.status != 200){
        return this.$message.error('查询失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    //监听修改用户对话框的关闭事件
    editDialogClosed(){
        this.$refs.editFormRef.resetFields()
    },
    //修改用户信息并提交
    editUserInfo(){
      //校验表单
        this.$refs.editFormRef.validate(async vaild => {
            //发起修改用户信息的请求
          const {data:res} = await this.$http.put('http://127.0.0.1:8888/api/private/v1/users/'+this.editForm.id,{email:this.editForm.email,mobile:this.editForm.mobile})
          if(res.meta.status != 200) return this.$message.error('修改用户信息失败')
          //关闭对话框
          this.editDialogVisible = false
          //刷新用户列表
          this.getUserList()
          //提示修改成功
          this.$message.success('修改用户信息成功')
        })
    }

  }
}
</script>

<style lang="less" scoped>

</style>