<template>
  <el-cascader v-model="catagory" ref="cascader"
               :options="cascaderOptions"
               :props="cascaderProps"
               @change="handleChange"></el-cascader>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
  import { getCatagories } from '@/api/articles'
  import {   getParent } from '@/utils/validate'
  @Component({
    name: 'CatagoryDropdown'
  })
  export default class extends Vue {
    @Prop({ default: null }) private catagoryPath!: number|null
    private cascaderOptions: any = []
    private cascaderProps = {
      value: 'id',
      label: 'name',
      children: 'children',
      checkStrictly: true
    }

    created() {
      this.fetchCatagory()
      //this.fetchTags()
     
    }
    private async fetchCatagory() {
      const { data } = await getCatagories()
      this.cascaderOptions = data
    }

    get catagory(): Array<number> {
      if (!this.catagoryPath)
        return [];
      return getParent(this.cascaderOptions, this.catagoryPath).map(v => v.id)
    }

    set catagory(value) {
      //this.catagoryPath = (this.$refs.cascader as any).getCheckedNodes()[0].label
      //this.catagoryPath = value[value.length - 1]
      this.$emit('input', value[value.length - 1])
    }
    private handleChange(val:any) {

    }
  }
</script>

<style scoped>
</style>
