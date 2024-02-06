<template>
    <el-tooltip class="item" effect="dark" :content="site.url" placement="bottom">
      <el-card class="site-card  site-block">
        <a :id="'site-' + site.id" :href="site.url" target="_blank">
          <image-preview class="image" :src="site.image ? site.image : '/logo.png'" />
          <p class="category-p">
            {{ site.name }} <br>
            {{ site.description }}
          </p>
        </a>
      </el-card>
    </el-tooltip>
  </template>
  
  <script>
  import ImagePreview from "@/components/ImagePreview/index.vue";
  
  export default {
    props: {
      site: Object,
    },
    components: {
      ImagePreview,
    },
  };
  </script>
  
  <style scoped>
  /* Add your scoped styles here */
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

.site-block a {
  text-decoration: none;
  color: #333;
  font-size: 14px;
  /* 设置文字大小 */
}

.site-block:hover {
  background-color: #0078d4;
  /* 悬停时改变背景颜色 */
}

.site-block:hover a {
  color: #fff;
  /* 悬停时改变文字颜色 */
}

@media screen and (max-width: 400px) {
  .category .site-card {
    width: 100%;
    /* 在页面宽度小于400px时，每行只显示一个方块，占满整行 */
  }
}
.image {
    width: 50px;
    height: 50px;
    margin-right: 10px;
    float: left;
}
.category-p {
    width: 70%;
    float: left;
    margin-top: auto;
}
  </style>
  