<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item >商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
<!--    卡片视图区域-->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
<!--      表格区域-->
      <tree-table
          :data="catelist"
          :columns="columns"
          :expand-type="false"
          :selection-type="false"
          index-text="#"
          border
          show-index
      >
<!--        是否有效-->
      <template slot="isok" slot-scope="scope">
        <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:lightgreen;"></i>
        <i class="el-icon-error" v-else style="color:red;"></i>
      </template>
<!--        排序-->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <!--      操作-->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="editDialogVisible(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeRoleById(scope.row.cat_id)" >删除</el-button>
        </template>
      </tree-table>
<!--      分页区域-->
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[3, 5, 10, 15]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </el-card>
<!--    添加分类的对话框-->
    <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="50%"
        @close="addCateDialogClosed"
        >
      <el-form :model="addCateForm" :rules="AddCaterules" ref="AddCateFormRef" label-width="100px"  >
        <el-form-item label="商品名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item><el-form-item label="父级分类" >
        <el-cascader
            clearable
            filterable
            v-model="selectedKeys"
            :options="parentcatelist"
            :props="cascaderProps"
            @change="parentCateChanged"
            ref="elcascader"
            @visible-change="elCascaderOnlick"
            @expand-change="elCascaderOnlick"

            ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
    </el-dialog>
<!--    编辑分类的对话框-->
    <el-dialog
        title="添加分类"
        :visible.sync="editCateDialogVisible"
        width="50%"
        @close="editCateDialogClosed"
    >
      <el-form :model="editCateForm" :rules="AddCaterules" ref="AddCateFormRef" label-width="100px"  >
        <el-form-item label="商品名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editCate()">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Cate',
  // mixins: [],
  // components: {},
  // props: {},
  data() {
    return {
      //指定级联选择器的配置对象
      cascaderProps:{
        checkStrictly:true,
        expandTrigger:'hover',
        value:'cat_id',
        label:'cat_name',
        children:'children'
      },
      //选择的父级分类id数组
      selectedKeys:[],
      // cateId:'',
      AddCaterules:{
        cat_name:[
          { required: true, message: '请输入商品名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      },
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表，默认为空
      catelist: [],
      parentcatelist:[],
      //添加分类的表单数据对象
      addCateForm:{
        cat_pid:0,
        //将要添加的分类的名称
        cat_name: '',
        //默认添加分类的等级为一级分类
        cat_level:0
      },
      editCateForm:{
        cat_id:0,
        cat_pid:0,
        //将要添加的分类的名称
        cat_name: '',
        //默认添加分类的等级为一级分类
        cat_level:0
      },
      //控制添加分类的显示与隐藏
      addCateDialogVisible:false,
      //控制编辑分类的显示与隐藏
      editCateDialogVisible:false,
      // 总数据条数
      total: 0,
      //为table指定列的定义
      columns:[{
        label: '分类名称',
        prop: 'cat_name'
      },{
        label: '是否有效',
        prop: 'cat_deleted',
        //表示当前列定义为模板列
        type: 'template',
        //表示当前这一列使用模板名称
        template:'isok'
      },{
        label: '排序',
        prop: 'cat_level',
        //表示当前列定义为模板列
        type: 'template',
        //表示当前这一列使用模板名称
        template:'order'
      },{
        label: '操作',
        //表示当前列定义为模板列
        type: 'template',
        //表示当前这一列使用模板名称
        template:'opt'
      }]
    }
  },
  // watch: {},
  // computed: {},
  methods: {
    editCateDialogClosed(){
      this.editCateForm.cat_name=''
    },
    async removeRoleById(id){
      const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if(confirmResult !== 'confirm'){
        return this.$message.info('已取消删除')
      }
      const {data:res} = await this.$http.delete('http://127.0.0.1:8888/api/private/v1/categories/'+id)
      if(res.meta.status != 200) return this.$message.error('删除角色失败')
      this.$message.success('删除角色成功')
      this.getCateList()
      this.getParentCateList()
      this.editCateDialogVisible = false
    },
    editDialogVisible(goods){
      console.log(goods)
      this.editCateDialogVisible = true
      this.editCateForm.cat_name = goods.cat_name
      this.editCateForm.cat_id = goods.cat_id
    },
    async editCate(){
      const { data: res } = await this.$http.put('http://127.0.0.1:8888/api/private/v1/categories/'+this.editCateForm.cat_id, {cat_name:this.editCateForm.cat_name})
      if (res.meta.status !== 200) {
        return this.$message.error('添加分类失败！')
      }
      this.$message.success('添加分类成功！')
      this.getCateList()
      this.getParentCateList()
      this.editCateDialogVisible = false
    },
    //监听对话框的关闭事件，重置对话框
    addCateDialogClosed(){
      this.$refs.AddCateFormRef.resetFields()
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
      this.selectedKeys = []
    },
     addCate(){
      this.$refs.AddCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('http://127.0.0.1:8888/api/private/v1/categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        this.getCateList()
        this.getParentCateList()
        this.addCateDialogVisible = false
      })

    },
    //解决了级联选择器不能选择文字的问题，并且实现选中文字自动收起
    elCascaderOnlick() {
      let that = this;
      setTimeout(function() {
        document.querySelectorAll(".el-cascader-node__label").forEach(el => {
          el.onclick = function() {
            this.previousElementSibling.click();
            that.$refs.elcascader.dropDownVisible = false;
          };
        });
        document
            .querySelectorAll(".el-cascader-panel .el-radio")
            .forEach(el => {
              el.onclick = function() {
                that.$refs.elcascader.dropDownVisible = false;
              };
            });
      }, 100);
    },
    parentCateChanged(){
      //反之，则说明没有选择任何父级分类
      if(this.selectedKeys.length > 0){
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length-1]
        this.addCateForm.cat_level = this.selectedKeys.length
      }else{
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
        // console.log(this.addCateForm )
    },
    showAddCateDialog(){
      this.addCateDialogVisible = true
    },
    // 获取父级商品分类数据
    async getParentCateList() {
      const { data: res } = await this.$http.get('http://127.0.0.1:8888/api/private/v1/categories', {
        params: {type:2}
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }

      // 把数据列表赋值给catelist
      this.parentcatelist = res.data
      console.log(this.parentcatelist)
    },
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('http://127.0.0.1:8888/api/private/v1/categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      // 把数据列表赋值给catelist
      this.catelist = res.data.result
      // 为总数据条数赋值
      // console.log(this.catelist)
      this.total = res.data.total
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听pagenum改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    }
  },
  created() {
    this.getCateList()
    this.getParentCateList()
  },
  // mounted() {}
}
</script>


<style lang="less" scoped>
.el-cascader{
  width: 100%;
}
</style>