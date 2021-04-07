<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card >
    <el-table
        :data="RightsList"
        stripe
        border
        style="width: 100%">
      <el-table-column
          type="index"
          label="#"
          width="50"
          >
      </el-table-column>
      <el-table-column
          prop="authName"
          label="权限名称"
          width="220">
      </el-table-column>
      <el-table-column
          prop="path"
          label="路径"
          width="220">
      </el-table-column>
      <el-table-column
          prop="level"
          label="权限等级"
          width="220">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.level === '0'">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
      </el-table-column>
    </el-table>
    </el-card>
  </div>

</template>

<script>
export default {
  name: "Right",
  created() {
    this.getRightList()
  },
  data(){
    return{
      RightsList:[]
    }
  },
  methods:{
    async getRightList(){
        const {data:res} = await this.$http.get('http://127.0.0.1:8888/api/private/v1/rights/list')
        if(res.meta.status != 200) return this.$message.error('获取数据失败')
        this.RightsList = res.data
        console.log(this.RightsList)
        this.$message.success('获取数据成功')
    }
  }
}
</script>

<style lang="less" scoped>

</style>