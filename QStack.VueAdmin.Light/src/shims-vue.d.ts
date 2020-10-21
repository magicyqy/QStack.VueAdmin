declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module 'element-ui/lib/locale/lang/*' {
  export const elementLocale: any
}
// TODO: remove this part after vue-count-to has its typescript file
declare module 'vue-count-to'
