<template>
  <product-detail :is-edit="false" />
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import ProductDetail from './components/productDetail.vue'

  @Component({
    name: 'CreateProduct',
    components: {
      ProductDetail
    }
  })
  export default class extends Vue { }
</script>
