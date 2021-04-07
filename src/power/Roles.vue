<template>
  <div>
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>权限管理</el-breadcrumb-item>
    <el-breadcrumb-item>角色列表</el-breadcrumb-item>
  </el-breadcrumb>
  <el-card >
    <el-button type="primary" @click="addRole">添加角色</el-button>
    <el-table
        :data="RolesList"
        stripe
        border
        style="width: 100%">
<!--      展开列-->
      <el-table-column
          type="expand"
          width="50"
          >
        <template slot-scope="scope">
          <el-row :class="['bdbottom',i1 === 0 ? 'bdtop':'','vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
<!--            渲染一级权限-->
            <el-col :span="5">
              <el-tag @close="removeRightbyid(scope.row,item1.id)" closable>{{item1.authName}}</el-tag>
              <i class="el-icon-caret-right"></i>
            </el-col>
<!--            渲染二级,三级权限-->
            <el-col :span="19">
              <el-row :class="[i2 === 0 ? '':'bdtop','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
<!--                通过for循环 嵌套渲染二级权限-->
                <el-col :span="6">
                  <el-tag type="success" @close="removeRightbyid(scope.row,item2.id)" closable>{{item2.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <el-col :span="18">
                  <el-tag v-for="(item3,i3) in item2.children" :key="item3.id" @close="removeRightbyid(scope.row,item3.id)" closable>{{item3.authName}}</el-tag>
                </el-col>
              </el-row>

            </el-col>

          </el-row>
        </template>

      </el-table-column>
<!--      索引列-->
      <el-table-column
          type="index"
          label="#"
          width="50"
      >
      </el-table-column>
      <el-table-column
          prop="roleName"
          label="角色名称"
          >
      </el-table-column>
      <el-table-column
          prop="roleDesc"
          label="角色描述"
          >
      </el-table-column>
      <el-table-column
          prop="level"
          label="操作"
          >
        <template slot-scope="scope">
          <!--              修改按钮-->
          <el-button size="mini" alt="111" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
          <!--              删除按钮-->
          <el-button size="mini" type="danger" icon="el-icon-delete"  @click="removeUserById(scope.row.id)">删除</el-button>
          <!--              分配角色按钮-->
          <el-tooltip  effect="dark" content="分配权限" placement="top" :enterable="false">
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
    <el-dialog
        title="提示"
        :visible.sync="setRightDialogVisible"
        width="50%"
        >
<!--      树形控件-->
      <el-tree
          :data="RightsList"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="defKeys"
          ref="treeRef"
          :props="treeProps">
      </el-tree>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights()">确 定</el-button>
  </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  created() {
    this.getRolesList()
  },
  data(){
    return{
      //树形数据默认选中的id
      defKeys:[],
      //所有权限的树形数据
      RightsList:[],
      //所有角色列表数据
      RolesList:[],
      //即将分配权限的角色id
      roleId: '',
      //控制分配权限对话框的显示与隐藏
      setRightDialogVisible:false,

      treeProps:{
        children:'children',
        label:'authName'
      }
    }
  },
  methods:{
    async getRolesList(){
      const {data:res} = await this.$http.get('http://127.0.0.1:8888/api/private/v1/roles')
      if(res.meta.status != 200) return this.$message.error('获取角色信息失败')
      this.RolesList = res.data
      console.log(res.data)
      // return this.$message.success('获取角色信息成功')
    },
    addRole(){
    },
    //根据id删除对应权限
    async removeRightbyid(role,rigthsid) {
      //弹框提示用户是否删除
     const confirmResulf = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if(confirmResulf !== 'confirm'){
        return this.$message.info('取消了删除')
      }
      const {data:res} = await this.$http.delete(`http://127.0.0.1:8888/api/private/v1/roles/${role.id}/rights/${rigthsid}`)
      console.log(res.data)
      if(res.meta.status != 200) return this.$message.error('删除权限失败')
      this.$message.success('删除权限成功')
      role.children = res.data
    },
    //展示分配权限的对话框
    async showSetRightDialog(role){
      this.roleId = role.id
      this.defKeys = []
      const {data:res} = await this.$http.get('http://127.0.0.1:8888/api/private/v1/rights/tree')
      if(res.meta.status != 200) return this.$message.error('获取树形数据失败')
      //获取到的数据保存到RIghtsList中
      this.RightsList = res.data
      console.log(res.data)
      //递归获取三级节点的id
      this.getLeadfKeys(role,this.defKeys)
      this.$message.success('获取树形数据成功')
      this.setRightDialogVisible = !this.setRightDialogVisible
    },
    //通过递归的形式，获取角色下所有三级权限的id，并保存到defKeys数组中
    getLeadfKeys(node,arr){
      //如果当前node节点不包含children属性，则是三级节点
        if(!node.children){
          return arr.push(node.id)
        }
        node.children.forEach(item =>
        this.getLeadfKeys(item,arr))
    },
    //点击为角色分配权限
    async allotRights(){
        const keys = [
          ...this.$refs.treeRef.
              getCheckedKeys(),
          ...this.$refs.treeRef.
              getHalfCheckedNodes()
        ]
      // console.log(keys)
      const idStr = keys.join(',')
      const {data:res} = await this.$http.post(`http://127.0.0.1:8888/api/private/v1/roles/${this.roleId}/rights`,{rids:idStr})
      if(res.meta.status != 200) return this.$message.error('分配权限失败')
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialogVisible = true
    }
    }
}
</script>

<style lang="less" scoped>
.el-tag{
  margin: 7px;

}
.vcenter{
  display: flex;
  align-items: center;
}
.bdtop{
  border-top: 2px solid #eee;
}
.bdbottom{
  border-bottom: 2px solid #eee;
}
</style>