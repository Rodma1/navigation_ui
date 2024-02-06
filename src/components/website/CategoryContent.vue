<template>
    <div>
      <div :id="'category-' + category.id" class="category-title">
        <i :class="category.icon"></i>
        <h2>{{ category.name }}</h2>
      </div>
  
      <div v-for="site in category.sites" :key="site.id" class="site-card">
        <SiteCard :site="site" />
      </div>
  
      <div v-if="category.children && category.children.length">
        <CategoryContent v-for="child in category.children" :key="child.id" :category="child" />
      </div>
    </div>
  </template>
  
  <script>
  import SiteCard from "@/components/website/SiteCard.vue";
  
  export default {
    name: "CategoryContent",

    props: {
      category: Object,
    },
    components: {
      SiteCard,
      CategoryContent: this, // 组件本身自己调用
    },
  };
  </script>
  
  <style scoped>
  .category-title {
    font-size: 18px;
    margin-bottom: 10px;
  }
  
/* 修改 .site-card 样式，使小方块在同一行排列 */
.site-card {
  display: inline-block;
  /* 设置小方块为行内块元素 */
  width: 300px;
  /* 设置小方块的宽度 */
  height: 100px;
  margin-right: 20px;
  /* 设置小方块之间的右边距 */
  margin-bottom: 10px;
  /* 设置小方块之间的下边距 */
  vertical-align: top;
  /* 使小方块上对齐 */
  /* text-align: center; */
  background-color: #f7f7f7;
  border-radius: 10px;
  /* 添加圆角 */
  cursor: pointer;
}
  </style>
  