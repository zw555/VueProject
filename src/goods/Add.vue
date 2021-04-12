<template>
<div>
  <!--  面包屑导航-->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item >商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>添加商品</el-breadcrumb-item>
  </el-breadcrumb>
  <el-card>
    <el-alert
        title="添加商品信息"
        type="info"
        show-icon
        :closable="false"
        center>
    </el-alert>
<!--    步骤条-->
    <el-steps :active="activeIndex - 0" finish-status="success" align-center>
      <el-step title="基本信息"></el-step>
      <el-step title="商品参数"></el-step>
      <el-step title="商品属性"></el-step>
      <el-step title="商品照片"></el-step>
      <el-step title="商品内容"></el-step>
      <el-step title="完成"></el-step>
    </el-steps>
<!--    tab区域-->
    <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px" label-position="top">
    <el-tabs :tab-position="tabPosition" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
      <el-tab-pane label="基本信息" name="0">
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="addForm.goods_name" ></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="addForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="addForm.goods_weight" type="number"></el-input>
        </el-form-item>

        <el-form-item label="商品数量" prop="goods_number">
          <el-input v-model="addForm.goods_number" type="number"></el-input>
        </el-form-item>
          <el-form-item label="选择商品分类" prop="goods_cat">
            <el-cascader
                clearable
                filterable
                v-model="addForm.goods_cat"
                :options="catelist"
                :props="cateProps"
                @change="handleChanged"
                ref="elcascader"
                @visible-change="elCascaderOnlick"
                @expand-change="elCascaderOnlick"
            ></el-cascader>
          </el-form-item>
      </el-tab-pane>
      <el-tab-pane label="商品参数" name="1">
          <el-form-item
              v-for="(item,i) in manyTableData"
              :label="item.attr_name"
              :key="item.i"
              closable
              >
            <el-checkbox-group v-model="item.attr_vals" >
              <el-checkbox v-for="(cb,i) in item.attr_vals" border :label="cb" :key="i"></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
      </el-tab-pane>
      <el-tab-pane label="商品属性" name="2">
          <el-form-item v-for="(item,i) in onlyTableData" :label="item.attr_name" :key="i">
            <el-input v-model="item.attr_vals"></el-input>
          </el-form-item>
      </el-tab-pane>
      <el-tab-pane label="商品照片" name="3">
<!--        action表示图片要上传到的后台APi地址-->
        <el-upload
            class="upload-demo"
            :action="uploadURL"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :headers="headerObj"
            multiple
            :on-success="handleSuccess"
            :limit="3"
            list-type="picture">
          <el-button size="small" type="primary">点击上传</el-button>
        </el-upload>
      </el-tab-pane>
      <el-tab-pane label="商品内容" name="4">
        <quill-editor v-model="addForm.goods_introduce"></quill-editor>
        <el-button class="btnAdd" type="primary" @click="add">添加商品</el-button>
      </el-tab-pane>
    </el-tabs>
    </el-form>
  </el-card>
<!--  图片预览-->
  <el-dialog
      title="图片预览"
      :visible.sync="preViewVisible"
      width="50%"
      >
    <img :src="this.previewPath">
    <span slot="footer" class="dialog-footer">
  </span>
  </el-dialog>
</div>
</template>

<script>
import _ from 'loadsh'
export default {
name: "Add",
  data(){
    return{
      //上传图片的URL路径
      uploadURL:'https://www.liulongbin.top:8888/api/private/v1/upload',
      activeIndex:'0',
      tabPosition:'left',
      preViewVisible:false,
      //图片上传组件的headers请求头对象
      headerObj:{
        Authorization: window.sessionStorage.getItem('token')
      },
      addForm:{
        goods_name:'',
        goods_price:'',
        goods_number:'',
        goods_weight:'',
        //商品所属的分类数组
        goods_cat:[],
        //图片路径
        pics:[],
        //商品的详情描述
        goods_introduce:'',
        attrs:[]
      },

      //指定级联选择器的配置对象
      cateProps:{
        checkStrictly:true,
        expandTrigger:'hover',
        value:'cat_id',
        label:'cat_name',
        children:'children'
      },
      //商品分类数据
      catelist:[],
      //动态参数数据
      manyTableData:[],
      //静态参数数据
      onlyTableData:[],
      previewPath:'',
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      addRules:{
        goods_name:[
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ], goods_price:[
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ], goods_number:[
          { required: true, message: '请输入商品数量', trigger: 'blur' },
        ], goods_weight:[
          { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],goods_cat:[
          { required: true, message: '请选择商品分类', trigger: 'blur' },
        ]
      }
    }
  },
  computed:{

    getCateId(){
      console.log(this.addForm.goods_cat.length)
      if(this.addForm.goods_cat.length === 3)
      {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  },
  methods:{
     add(){
      this.$refs.addFormRef.validate(async valid =>{
        if(!valid) return this.$message.error('请填写必要的表单项目！')
        //执行添加的业务逻辑
        const  form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        this.onlyTableData.forEach(item =>{
          const newInfo = {
            attr_id:item.attr_id,
            attr_value:item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        this.manyTableData.forEach(item =>{
          const newInfo = {
            attr_id:item.attr_id,
            attr_value:item.attr_vals.join('')
          }
        })
        form.attrs = this.addForm.attrs
        console.log(form)
        const {data:res} = await this.$http.post('http://127.0.0.1:8888/api/private/v1/goods',form)
        if(res.meta.status !== 201){
          return this.$message.error('添加商品失败')
        }
        this.$message.success('添加商品成功')
        console.log(res.data)
        this.$router.push('/goods')
      })
    },
    //监听图片上传成功的事件
    handleSuccess(response){
      //1.拼接得到一个图片信息对象
      const picInfo = {pic:
      response.data.tmp_path}
      //2.将图片信息对象，push到pics数组
      this.addForm.pics.push(picInfo)
      console.log(response)
      console.log(this.addForm)
    },
  //处理移动图片的操作
    handleRemove(file){
      console.log()
      const filePath =
          file.response.data.tmp_path
      const i = this.addForm.pics.findIndex(x =>{
        x.pic = filePath
      })
      this.addForm.pics.splice(i,1)
      console.log(this.addForm)
    },
  //处理图片预览效果
    handlePreview(file){
      this.previewPath = file.response.data.url
      this.preViewVisible = true
    },
    async tabClicked(){

      if(this.activeIndex === '1'){
       const {data:res} = await this.$http.get(`http://127.0.0.1:8888/api/private/v1/categories/${this.getCateId}/attributes`,{
          params:{sel:'many'}
        })
        if(res.meta.status !== 200){
          return this.$message.error('获取动态参数失败')
        }
        res.data.forEach(item =>{
          item.attr_vals = item.attr_vals.length === 0 ?
          [] : item.attr_vals.split(',')
        })
        console.log(res.data)
        this.manyTableData = res.data
        this.$message.success('获取动态参数成功')
      }else if(this.activeIndex === '2'){
        const {data:res} = await this.$http.get(`http://127.0.0.1:8888/api/private/v1/categories/${this.getCateId}/attributes`,{
          params:{sel:'only'}
        })
        if(res.meta.status !== 200){
          return this.$message.error('获取静态参数失败')
        }
        console.log(res.data)
        this.onlyTableData = res.data
        this.$message.success('获取静态参数成功')
      }
    },
    beforeTabLeave(activeName,oldActiveName){
      // console.log('离开'+oldActiveName)
      // console.log('进入'+activeName)
      if(oldActiveName === '0' && this.addForm.goods_cat.length !==3){
        this.$message.error('请先选择商品分类')
        return false
      }
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
    //级联选择器发生变化会触发这个函数
    handleChanged(){
      //反之，则说明没有选择任何父级分类
      if(this.addForm.goods_cat.length !== 3){
        this.addForm.goods_cat = []
      }else{
        // this.$message.error('请')
      }
      console.log(this.addForm.goods_cat )
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
      console.log(this.catelist)
      this.total = res.data.total
    },
  },
  created() {
    this.getCateList()
  }
}
</script>

<style lang="less" scoped>
.el-checkbox{
  margin: 0 10px 0 0 !important;
}
.el-dialog{
  width: 100%;
}
.btnAdd{
  margin-top: 15px;
}
</style>