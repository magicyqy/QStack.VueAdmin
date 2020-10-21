<template>
  <el-popover placement="right"
             
              trigger="click"  v-model="isVisible">
    <el-tabs  class="icons-container" style="width:400px;" >

      <el-tab-pane label="Element-UI Icons">
        <div class="grid">
          <div v-for="item of elementIcons"
               :key="item"
               @click="choose(item,$event)" class="icon-item">
            <el-tooltip placement="top">
              <div slot="content">
                {{ generateElementIconCode(item) }}
              </div>
              <div >
                <i :class="'el-icon-' + item" />
                <span>{{ item }}</span>
              </div>
            </el-tooltip>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <el-button slot="reference">选择</el-button>
  </el-popover>
 
</template>

<script lang="ts">
  import { Component, Vue,Prop,Watch } from 'vue-property-decorator'
  import elementIcons from './element-icons'
 

  @Component({
    name: 'Icons'
  })
  export default class extends Vue {
    @Prop({ default: null }) private iconName!: string | null
    private isVisible=false
    private elementIcons = elementIcons

    private generateElementIconCode(symbol: string) {
      return `<i class="el-icon-${symbol}" />`
    }
    //@Watch("iconName")
    //private iconNameChange() {
    //  this.$emit('input', this.iconName)
    //}

    private choose(item: string, event: any) {
      //this.iconName = item
      this.$emit('input', item)
      this.isVisible=false
    }
  }
</script>

<style lang="scss" scoped>
  .el-popover {
    width:500px;height:500px;  overflow: auto;
  }
  .icons-container {
    margin: 10px 20px 0;
    /*overflow: hidden;*/
    .grid
  {
    max-height:400px;
    display: flex;
    flex-wrap: wrap;
    overflow: auto;
  }

  .icon-item {
    margin: 10px;
    height: 85px;
    text-align: center;
    width: 100px;    
    font-size: 20px;
    color: #24292e;
    cursor: pointer;
  }

  span {
    display: block;
    font-size: 16px;
    margin-top: 10px;
  }

  .disabled {
    pointer-events: none;
  }
}
</style>
