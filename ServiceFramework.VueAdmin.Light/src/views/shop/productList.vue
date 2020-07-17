<template>
  <div class="app-container">
    <el-form :inline="true" v-model="listQuery" ref="searchForm" class="demo-form-inline">
      <el-form-item label="产品名称">
        <el-input v-model="listQuery.name"></el-input>
      </el-form-item>
      <el-form-item label="类别">
        <catagoryDropdown v-model="listQuery.catagoryId" />
      </el-form-item>
      <el-form-item label="日期">
        <el-date-picker v-model="listQuery.dateRange"
                        type="daterange"
                        value-format="yyyy-MM-dd hh:mm:ss"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        :default-time="['00:00:00', '23:59:59']">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
        <el-button @click="resetForm('searchForm')">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-button  type="primary" @click="addProduct">添加</el-button>
    </el-row>
    <el-table v-loading="listLoading"
              :data="list"
              border
              fit
              highlight-current-row
              style="width: 100%">
      <el-table-column width="60"
                       align="center"
                       label="ID">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column width="120px"
                       align="center"
                       label="发布日期">
        <template slot-scope="scope">
          <span>{{parseTime(scope.row.createDate)  }}</span>
        </template>
      </el-table-column>
     
      <el-table-column class-name="status-col"
                       label="Status"
                       width="110">
        <template slot-scope="{row}">
          <el-tag :type="row.state | statusFilter ">
            {{ showStatus(row.state) }}
          </el-tag>
        </template>
      </el-table-column>


      <el-table-column min-width="250px"
                       label="Title">
        <template slot-scope="{row}">
          <router-link :to="'/shop/productedit/'+row.id"
                       class="link-type">
            <span>{{ row.name }}</span>
          </router-link>
        </template>
      </el-table-column>


      <el-table-column align="center"
                       label="Actions"
                       width="200">
        <template slot-scope="scope">
          <router-link :to="'/shop/productedit/'+scope.row.id" style="margin-right:5px;">
            <el-button type="primary" title="编辑"
                       size="mini"
                       icon="el-icon-edit">
            </el-button>
          </router-link>
          <!--<el-popover placement="top" style="margin-right:5px;"
                      width="160" trigger="click" :ref="`popover-${scope.$index}`" @show="showPopover(scope.row)">
            >
            <el-input-number v-model="hotTop" size="small" :min="0" :max="10" label="描述文字"></el-input-number>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="scope._self.$refs[`popover-${scope.$index}`].doClose()">取消</el-button>
              <el-button type="primary" size="mini" @click="popConfirm(scope._self.$refs[`popover-${scope.$index}`],scope.row)">确定</el-button>
            </div>
            <el-button type="primary" title="置顶" slot="reference"
                       size="mini"
                       icon="el-icon-top">

            </el-button>
          </el-popover>-->
          <el-button type="primary" title="撤回" v-if="scope.row.state==1"
                     size="mini"
                     icon="el-icon-delete" @click="setProductState(scope.row,0)">
          </el-button>
          <el-button type="primary" title="发布" v-if="scope.row.state==0"
                     size="mini"
                     icon="el-icon-s-promotion" @click="setProductState(scope.row,1)">
          </el-button>
        </template>
      </el-table-column>




    </el-table>

    <pagination v-show="total>0"
                :total="total"
                :page.sync="listQuery.page"
                :limit.sync="listQuery.size"
                @pagination="getList" />
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import { getProducts, postProduct, updateProductState } from '@/api/product'
  import { IProduct, IProductImage } from '@/api/types'
  import Pagination from '@/components/Pagination/index.vue'
  import { Form, Popover } from 'element-ui'
  import catagoryDropdown from './components/catagoryDropdown.vue'
  import { dateformatter } from '@/utils/validate'
  @Component({
    name: 'ProductList',
    filters: {
      statusFilter: (status: number) => {
        const statusMap: string[] = [
          'gray', 'success', 'danger']
        
        return statusMap[status]
      }

    },
    components: {
      catagoryDropdown,
      Pagination
    }
  })
  export default class extends Vue {
    private total = 0
    private list: IProduct[] = []
    private listLoading = true
    private listQuery = {
      page: 1,
      size: 20,
      name:'',
      catagoryId: null,
      dateRange: ''
    }
    private popVisible: boolean = false
    private hotTop: number = 0

    created() {
      this.getList()
    }

    parseTime(timestamp: string) {
      return dateformatter(new Date(timestamp), 'yy-MM-dd hh:mm')
      //return new Date(timestamp).toISOString()
    }
    private async getList() {
      this.listLoading = true
      var searchOptions: any = {
        columns: [
          { name: 'name', search: { value: this.listQuery.name, Opeartor: 6 } },
          { name: 'productCategoryId', search: { value: this.listQuery.catagoryId, Opeartor: 1 } },
          { name: 'createDate', search: { valueMin: this.listQuery.dateRange.length > 0 ? this.listQuery.dateRange[0] : '', valueMax: this.listQuery.dateRange.length > 1 ? this.listQuery.dateRange[1] : '', Opeartor: 9 } },
        ],
        order: [],
        pageIndex: this.listQuery.page,
        pageSize: this.listQuery.size
      }
      const { data } = await getProducts(searchOptions)

      this.list = data.data
      this.total = data.totalCount
      // Just to simulate the time of the request
      setTimeout(() => {
        this.listLoading = false
      }, 0.5 * 1000)
    }
    private showStatus(state: number): string {
      return state==1?'已上架':'未上架'
    }

    private resetForm(formName: string) {
      (this.$refs[formName] as Form).resetFields();
    }

    private async onSubmit() {
      await this.getList()

    }

    private async showPopover(row: any) {
      this.hotTop = row.hotTop
    }
    

    private async setProductState(row: any, state: number) {
      await updateProductState({ productId: row.id, state: state })
      row.state = state
      this.$notify({
        title: 'Success',
        message: 'The post product state successfully',
        type: 'success',
        duration: 2000
      })
    }

    private async addProduct() {
      //console.log(this);
      this.$router.push('/shop/productcreate')
    }
  }
</script>

<style lang="scss" scoped>

  .edit-input {
    padding-right: 100px;
  }

  .cancel-btn {
    position: absolute;
    right: 15px;
    top: 10px;
  }
</style>
