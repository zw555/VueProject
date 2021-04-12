<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row class="cat_opt">
        <el-col>
          <el-alert
              title="注意：只允许为第三级分类设置相关参数"
              type="warning"
              :closable="false"
              show-icon>
          </el-alert>
        </el-col>
      </el-row>
      <el-form ref="AddCateFormRef" label-width="100px"  >
        <el-form-item label="选择商品分类" >
          <el-cascader
              clearable
              filterable
              v-model="selectedKeys"
              :options="parentcatelist"
              :props="cascaderProps"
              @change="HandleChanged"
              ref="elcascader"
              @visible-change="elCascaderOnlick"
              @expand-change="elCascaderOnlick"
          ></el-cascader>
        </el-form-item>
      </el-form>

      <el-tabs v-model="activeName" @tab-click="handleClick">
<!--        动态参数列表-->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="isDisabled" @click="addDialogVisible = true">添加参数</el-button>
          <el-table
              :data="manyTableData" border stripe>
<!--            展开行-->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag closable v-for="(item,i) in scope.row.attr_vals" :key="i" @close="handleClose(i,scope.row)">
                  {{item}}
                </el-tag>
<!--                输入的文本框-->
                <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
<!--                添加的按钮-->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>

            </el-table-column>
            <!--            索引列-->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button class="el-icon-edit " type="primary" size="mini" @click="showEditDialog(scope.row)">修改</el-button>
                <el-button class="el-icon-delete" type="danger" size="mini" @click="removeUserById(scope.row)">删除</el-button>
              </template>
            </el-table-column>

          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="isDisabled" @click="addDialogVisible = true">添加属性</el-button>
<!--          动态参数表格-->
          <el-table
              :data="onlyTableData" border stripe>
<!--            展开行-->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag closable v-for="(item,i) in scope.row.attr_vals" :key="i" @close="handleClose(i,scope.row)">
                  {{item}}
                </el-tag>
                <!--                输入的文本框-->
                <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!--                添加的按钮-->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!--            索引列-->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button class="el-icon-edit " type="primary" size="mini" @click="showEditDialog(scope.row)">修改</el-button>
                <el-button class="el-icon-delete" type="danger" size="mini" @click="removeUserById(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!--    添加参数的对话框-->
    <el-dialog
        :title="'添加'+titleText"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogColsed"
    >
      <el-form ref="addFormRef" :rules="addFormRules" :model="addForm" label-width="80px">
        <el-form-item prop="attr_name" :label="titleText">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addParams">确 定</el-button>
  </span>
    </el-dialog>
    <!--    修改参数的对话框-->
    <el-dialog
        :title="'修改'+titleText"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogColsed"
    >
      <el-form ref="editFormRef" :rules="addFormRules" :model="editForm" label-width="80px">
        <el-form-item prop="attr_name" :label="titleText">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editParams">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Params",
  data(){
    return{
      addFormRules:{
        attr_name:[
          { required: true, message: '请输入参数名称', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ]
      },
      //选择的父级分类id数组
      selectedKeys:[],
      //动态参数的数据
      manyTableData:[],
      //静态属性的数据
      onlyTableData:[],
      //父级商品分类数据
      parentcatelist:[],
      //添加参数的表单数据对象
      addForm:{
        attr_name:'',
      },
      editForm:{
        attr_name:'',
        attr_id:''
      },
      //被激活的页面名称
      activeName:'many',
      //默认情况下隐藏文本框
      inputVisible:false,
      //文本框中输入的内容
      inputValue:'',
      //控制添加对话框的显示与隐藏
      addDialogVisible:false,
      //控制修改对话框的显示与隐藏
      editDialogVisible:false,
      //指定级联选择器的配置对象
      cascaderProps:{
        checkStrictly:true,
        expandTrigger:'hover',
        value:'cat_id',
        label:'cat_name',
        children:'children'
      },
    }
  },
  computed:{
    //如果按钮需要被禁用，则返回true，否则返回false
    isDisabled(){
      if(this.selectedKeys.length !== 3) return true
      return false
    },
    //当前选中的三级分类的id
    cateId(){
      if(this.selectedKeys.length === 3){
        return this.selectedKeys[2]
      }
      return null
    },
    //动态计算标题的文本
    titleText(){
      if(this.activeName === 'many'){
        return '动态参数'
      }else {
        return '静态属性'
      }
    },
  },
  methods:{
    showEditDialog(goods){
      this.editForm.attr_name = goods.attr_name
      this.editForm.attr_id = goods.attr_id
      console.log(goods)
      this.editDialogVisible = true
    },
    editDialogColsed(){
      this.$refs.editFormRef.resetFields()
    },
    //tab页签点击事件的处理函数
    handleClick(){
      this.getParamsData()
    },
    addDialogColsed(){
      this.$refs.addFormRef.resetFields()
    },
    HandleChanged(){

      this.getParamsData()
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
    // 获取父级商品分类数据
    async getParentCateList() {
      const { data: res } = await this.$http.get('http://127.0.0.1:8888/api/private/v1/categories', {
        params: {type:3}
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }

      // 把数据列表赋值给catelist
      this.parentcatelist = res.data
      console.log(this.parentcatelist)
    },
    //获取参数的参数列表
    async getParamsData(){
      //反之，则说明没有选择任何父级分类
      if(this.selectedKeys.length !== 3){
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      //根据所选分类的id，和当前所处的面板，获取对应的参数
      const {data:res} = await this.$http.get(`http://127.0.0.1:8888/api/private/v1/categories/${this.cateId}/attributes`,{
        params: {sel: this.activeName}
      })
      if(res.meta.status != 200){
        return this.$message.error('获取失败')
      }

      res.data.forEach(item =>{
        item.attr_vals = item.attr_vals ?
        item.attr_vals = item.attr_vals.split(',') : []
        //控制文本框的显示与隐藏
        item.inputVisible = false
        item.inputValue = ''
      })
      console.log(res.data)
      if(this.activeName === 'many'){
        this.manyTableData = res.data
      }else {
        this.onlyTableData = res.data
      }
      this.$message.success('获取成功')
    },
    //删除参数数据
    async removeUserById(goods){
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if(confirmResult !== 'confirm'){
        return this.$message.info('已取消删除')
      }
      const {data:res} = await this.$http.delete(`http://127.0.0.1:8888/api/private/v1/categories/${this.cateId}/attributes/`+goods.attr_id)
      if(res.meta.status != 200) return this.$message.error('删除失败')
      this.getParamsData()
      return this.$message.success('删除成功')

    },
    //修改参数表单数据
    editParams(){
      this.$refs.editFormRef.validate(async valid => {
        if(!valid) return
        const {data:res} = await this.$http.put(`http://127.0.0.1:8888/api/private/v1/categories/${this.cateId}/attributes/`+this.editForm.attr_id,{
          attr_name:this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if(res.meta.status != 200){
          return this.$message.error('修改参数失败')
        }
        this.editDialogVisible = false
        this.$message.success('修改参数成功')
        this.getParamsData()
      })

    },
    //提交参数表单数据
    addParams(){
      this.$refs.addFormRef.validate(async valid => {
        if(!valid) return
        const {data:res} = await this.$http.post(`http://127.0.0.1:8888/api/private/v1/categories/${this.cateId}/attributes`,{
          attr_name:this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if(res.meta.status != 201){
          console.log(res.meta.status)
          return this.$message.error('添加参数失败')
        }
        console.log(res.data)
        this.editDialogVisible = false
        this.$message.success('添加参数成功')
        this.getParamsData()
      })

    },
    //文本框失去焦点或按下enter都会触发
    async handleInputConfirm(row){
      if(row.inputValue.trim().length === 0){
        row.inputValue = ''
        row.inputVisible = false
        return
      }

      row.attr_vals.push(row.inputValue.trim())
      row.inputVisible = false
      this.saveAttrVals(row)

    },
    //讲对 attr_Vals保存到数据库
    async saveAttrVals(row){
      //需要发起请求保存这次操作
      const {data:res} = await this.$http.put(`http://127.0.0.1:8888/api/private/v1/categories/${this.cateId}/attributes/`+row.attr_id,{
        attr_name:row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals:row.attr_vals.join(',')
      })
      if(res.meta.status != 200) return this.$message.error('修改参数失败')
      this.$message.success('修改参数成功')
    },
    //点击按钮，展示文本输入框
    showInput(row){
      row.inputValue = ''
      row.inputVisible = true
      //让文本框自动获取焦点
      //$nextTick方法的作用：当页面上元素被重新渲染之后才会执行回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    //删除对应的参数可选项
    async handleClose(i,row){
      row.attr_vals.splice(i,1)
      this.saveAttrVals(row)
    }
  },


  created() {
    this.getParentCateList()
  }
}
</script>

<style lang="less" scoped>
.cat_opt{
  margin: 15px 0;
}
.el-tag{
  margin: 10px  ;
}
.input-new-tag{
  width: 120px;
}
</style>