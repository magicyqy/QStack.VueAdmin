<template>
  <product-detail :is-edit="true" />
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import ProductDetail from './components/productDetail.vue'

  @Component({
    name: 'EditProduct',
    components: {
      ProductDetail
    }
  })
  export default class extends Vue { }
</script>
