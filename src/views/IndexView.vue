<template>

  <div class="anchor-navigation">
      <!-- 左侧导航栏 -->
      <el-tree :data="categories" :props="defaultProps" @node-click="handleNodeClick"
        style="position: fixed; right: 10%; font-size: 100px;" ></el-tree>
    <el-container>

      <!-- 右侧内容 -->
      <el-main>
        <div v-for="category in categories" :key="category.id" class="category">
          <div :id="'category-' + category.id" class="category-title">
            <i :class="category.icon"></i>
              <h2>{{ category.name }}</h2>
          </div>

          <div v-for="site in category.sites" :key="site.id" class="site-card">
            <el-tooltip class="item" effect="dark" :content="site.url" placement="bottom">
              <el-card class="site-card  site-block">

                <a :id="'site-' + site.id" :href="site.url" target="_blank">
                    <image-preview  class="image" :src="site.image ? site.image : '/profile/upload/2023/10/08/'" />

                    <p class="category-p">
<!--                    <el-image style="width: 30%; height: 30%; margin-left: 10px; float: left; left: 10px;"-->
<!--                      :src="site.image"></el-image>-->
                    {{ site.name }} <br>

                    {{ site.description }}
                  </p>
                </a>
              </el-card>
            </el-tooltip>
          </div>


          <!-- 添加子项的右侧内容 -->
          <div v-for="child in category.children" :key="child.id" class="category">
            <div :id="'category-' + child.id" class="category-title">
              <i :class="child.icon"></i>
                <h3>{{ child.name }}</h3>
            </div>

            <div v-for="site in child.sites" :key="site.id" class="site-card">
              <el-tooltip class="item" effect="dark" :content="site.url" placement="bottom">
                <el-card class="site-card  site-block">

                    <a :id="'site-' + site.id" :href="site.url" target="_blank">
                        <image-preview  class="image" :src="site.image" />
                        <p class="category-p">
                            <!--                    <el-image style="width: 30%; height: 30%; margin-left: 10px; float: left; left: 10px;"-->
                            <!--                      :src="site.image"></el-image>-->
                            {{ site.name }} <br>

                            {{ site.description }}
                        </p>
                    </a>
                </el-card>
              </el-tooltip>
            </div>

                      <!-- 添加子项的右侧内容 -->
          <div v-for="childer in child.children" :key="childer.id" class="category">
            <div :id="'category-' + childer.id" class="category-title">
              <i :class="childer.icon"></i>
                <h4> {{ childer.name }}</h4>
            </div>

            <div v-for="site in childer.sites" :key="site.id" class="site-card">
              <el-tooltip class="item" effect="dark" :content="site.url" placement="bottom">
                <el-card class="site-card  site-block">

                    <a :id="'site-' + site.id" :href="site.url" target="_blank">
                        <image-preview  class="image" :src="site.image" />
                        <p class="category-p">
                            {{ site.name }} <br>

                            {{ site.description }}
                        </p>
                    </a>
                </el-card>
              </el-tooltip>
            </div>
          </div>
          </div>
        </div>
        <div class="demo-image">
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>

import ImagePreview from "@/components/ImagePreview/index.vue";

export default {
    components: {ImagePreview},
  data() {
    return {
      activeCategory: '1', // 默认选中第一个分类
      categories: [
        {
          "id": null,
          "parentId": null,
          "sort": null,
          "name": "",
          "icon": 'el-icon-search',

          "children": [],
          "delFlag": "0",
          "sites": [
            {
              "id": null,
              "categoryId": null,
              "name": "",
              "image": "",
              "description": "",
              "url": "",
              "createTime": "",
              "updateTime": "",
              "createBy": null,
              "updateBy": null
            }
          ]
        }

      ],
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    };
  },
  created() {
    const _this = this
    this.axios.get('/api/cyzNavigateCategory/tree').then(function (res) {
      _this.categories = res.data.data
      console.log(_this.categories)
    }).catch(error => {
      console.log(error)
    })
  },
  computed: {
    selectedCategory() {
      return this.categories.find(category => String(category.id) === this.activeCategory);
    },
  },
  methods: {
    handleNodeClick(data) {
      console.log(data.id);
      // 获取目标元素的位置
      const targetElement = document.getElementById('category-' + data.id);
      if (targetElement) {
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY;

        // 使用滚动动画将页面滚动到目标位置
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
      }
    },
  },
};
</script>

<style scoped>
.anchor-navigation {
  padding: 20px;
}
::v-deep .el-tree-node__label{
  font-size: 30%;
}

::v-deep .el-tree-node__content {
    height: 40%;
}
.category-menu {
  position: fixed;
  /* 使左侧导航固定在页面 */
  height: 100%;
  /* 设置导航高度为页面高度 */
  border-right: 1px solid #e4e7ed;
  overflow-y: auto;
  /* 添加滚动条以处理导航内容溢出情况 */
}

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

i {
  margin-right: 10px;
}


/* 添加媒体查询以调整列数 */
@media screen and (max-width: 1200px) {
  .category .site-card {
    width: 25%;
    /* 在页面宽度小于1200px时，每行最多显示四个方块 */
  }
}

@media screen and (max-width: 800px) {
  .category .site-card {
    width: 33.33%;
    /* 在页面宽度小于800px时，每行最多显示三个方块 */
  }
}

@media screen and (max-width: 600px) {
  .category .site-card {
    width: 50%;
    /* 在页面宽度小于600px时，每行最多显示两个方块 */
  }
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

