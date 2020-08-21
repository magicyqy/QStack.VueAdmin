<template>
  <div class="tag-group">
    <el-tag :key="tag.id"
            v-for="tag in dynamicTags"
            closable
            :disable-transitions="false"
           
            
            @close="handleClose(tag)">
      {{tag.name}}
    </el-tag>
    <el-input class="input-new-tag"
              v-if="inputVisible"
              v-model="inputValue.name"
              ref="saveTagInput"
              size="small"
              @keyup.enter.native="handleInputConfirm"
              @blur="handleInputConfirm">
    </el-input>
    <!--<el-button v-else class="button-new-tag" size="small" @click="showInput">+ New Tag</el-button>-->

  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import { ITag } from "@/api/types"
  import { getTags, deleteTag } from "@/api/articles"
  @Component({
    name: 'Tags',
    components: {

    }
  })
  export default class extends Vue {
    private dynamicTags: ITag[] = [];
    private inputVisible = false

    private inputValue: ITag = { id: 0, name: '' }

    async created() {
      const { data } = await getTags();
      this.dynamicTags = data;
    }


    private async handleClose(tag: ITag) {
      await deleteTag(tag.id)
      this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1)
    }

    private showInput() {
      this.inputVisible = true
      this.$nextTick(() => {
        //this.$refs.saveTagInput.$refs.input.focus()
      });
    }

    private handleInputConfirm() {
      let inputValue = this.inputValue
      if (inputValue) {
        this.dynamicTags.push(inputValue)
      }
      this.inputVisible = false
      this.inputValue = { id: 0, name: '' }
    }
  }
</script>
<style scoped>
  .tag-group{
    margin:40px;
  }
  .el-tag + .el-tag {
    margin-left: 10px;
  }

  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }

  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>
