<template>
  <div>
    <!--  面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item >订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList" ></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table
          :data="orderData"
          border
          stripe
          style="width: 100%">
        <el-table-column type="index" label="#">

        </el-table-column>
        <el-table-column
            prop="order_number"
            label="订单编号"
            >
        </el-table-column>
        <el-table-column
            prop="order_price"
            label="订单价格"
            width="80">
        </el-table-column>
        <el-table-column
            prop="order_pay"
            label="是否付款"
        width="80">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.order_pay === '0'">未付款</el-tag>
            <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column
            prop="is_send"
            label="是否发货"
            width="80">
        </el-table-column>
        <el-table-column
            label="下单时间"
        width="200">
          <template slot-scope="scope">
            {{scope.row.create_time |   dataFormat}}
          </template>

        </el-table-column>
        <el-table-column
            label="操作"
        width="180">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showBox"></el-button>
            <el-button size="mini" type="success" icon="el-icon-location-outline" @click="showProgressBox(scope.row.user_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[5, 10, 15]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </el-card>
<!--    修改地址的对话框-->
    <el-dialog
        title="修改地址"
        :visible.sync="addressVisible"
        width="50%"
        @close="addressDialogClosed"
        >
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px" class="demo-ruleForm">
        <el-form-item label="省市县/区" prop="address1">
          <el-cascader :options="cityData" clearable :props="{ expandTrigger: 'hover' }" v-model="addressForm.address1"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addressVisible = false">取 消</el-button>
    <el-button type="primary" @click="addressVisible = false">确 定</el-button>
  </span>
    </el-dialog>
<!--展示物流信息的对话框-->
    <el-dialog
        title="修改地址"
        :visible.sync="progressVisible"
        width="50%"
    >
      <el-timeline>
        <el-timeline-item
            v-for="(activity, index) in progressInfo"
            :key="index"
            :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>

  </div>
</template>

<script>
import cityData from "@/order/citydata";
export default {
name: "Order",
  data(){
    return{
      queryInfo:{
        query:'',
        pagenum:1,
        pagesize:10,
      },
      addressForm:{
        address1:[],
        address2:''
      },
      addressFormRules:{
        address1: [
          { required: true, message: '请选择省市区县', trigger: 'blur' },
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' },
        ]
      },
      total:0,
      orderData:[],
      cityData,
      //由于接口失效使用模拟数据
      progressInfo:[
        {
          "time": "2018-05-10 09:39:00",
          "ftime": "2018-05-10 09:39:00",
          "context": "已签收,感谢使用顺丰,期待再次为您服务",
          "location": ""
        },
        {
          "time": "2018-05-10 08:23:00",
          "ftime": "2018-05-10 08:23:00",
          "context": "[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件",
          "location": ""
        },
        {
          "time": "2018-05-10 07:32:00",
          "ftime": "2018-05-10 07:32:00",
          "context": "快件到达 [北京海淀育新小区营业点]",
          "location": ""
        },
        {
          "time": "2018-05-10 02:03:00",
          "ftime": "2018-05-10 02:03:00",
          "context": "快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]",
          "location": ""
        },
        {
          "time": "2018-05-09 23:05:00",
          "ftime": "2018-05-09 23:05:00",
          "context": "快件到达 [北京顺义集散中心]",
          "location": ""
        },
        {
          "time": "2018-05-09 21:21:00",
          "ftime": "2018-05-09 21:21:00",
          "context": "快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]",
          "location": ""
        },
        {
          "time": "2018-05-09 13:07:00",
          "ftime": "2018-05-09 13:07:00",
          "context": "顺丰速运 已收取快件",
          "location": ""
        },
        {
          "time": "2018-05-09 12:25:03",
          "ftime": "2018-05-09 12:25:03",
          "context": "卖家发货",
          "location": ""
        },
        {
          "time": "2018-05-09 12:22:24",
          "ftime": "2018-05-09 12:22:24",
          "context": "您的订单将由HLA（北京海淀区清河中街店）门店安排发货。",
          "location": ""
        },
        {
          "time": "2018-05-08 21:36:04",
          "ftime": "2018-05-08 21:36:04",
          "context": "商品已经下单",
          "location": ""
        }
      ],
      //控制对话框隐藏与显示
      addressVisible:false,
      //控制物流对话框隐藏与显示
      progressVisible:false
    }
  },
  methods:{
    addressDialogClosed(){
      this.$refs.addressFormRef.resetFields()
    },
    async getOrderList(){
      const {data:res} = await this.$http.get('http://127.0.0.1:8888/api/private/v1/orders',{params:this.queryInfo})
      if(res.meta.status != 200) return this.$message.error('获取订单数据失败')
      console.log(res.data)
      this.orderData = res.data.goods
      this.total = res.data.total
      // return this.$message.success('获取订单数据成功')
    },
    handleSizeChange(newSize){
      console.log(newSize)
      this.queryInfo.pagenum = newSize
      this.getOrderList()
    },
    handleCurrentChange(newPage){
      console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    //展示修改地址的对话框
    showBox(){
      this.addressVisible = true
    },
    // 展示物流进度的对话框
    async showProgressBox() {
      // const { data: res } = await this.$http.get('http://127.0.0.1:8888/api/private/v1/kuaidi/1106975712662')
      // if (res.meta.status !== 200) {
      //   return this.$message.error('获取物流信息失败！')
      // }
      // console.log(res)
      // this.progressInfo = res.data
      this.progressVisible = true
    }
  },
  computed:{

  },
  created() {
  this.getOrderList()
  }
}
</script>

<style lang="less" scoped>
.el-cascader{
  width: 100%;
}
</style>