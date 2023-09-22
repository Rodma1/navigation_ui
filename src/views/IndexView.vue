<template>
    <div class="anchor-navigation">
      <el-container>
        <!-- 左侧导航栏 -->
        <el-aside width="200px">
          <el-menu :default-active="activeCategory" :unique-opened="true" class="category-menu">
            <el-menu-item v-for="category in categories" :key="category.id" :index="String(category.id)">
              <template v-if="category.children">
                <el-submenu :index="String(category.id + '_submenu')">
                  <template slot="title">
                    <i :class="category.icon"></i>
                    {{ category.title }}
                  </template>
                  <el-menu-item v-for="child in category.children" :key="child.id" :index="String(child.id)">
                    <a @click.prevent="scrollToCategory(child.id)">
                      <i :class="child.icon"></i>
                      {{ child.title }}
                    </a>
                  </el-menu-item>
                </el-submenu>
              </template>
              <template v-else>
                <a @click.prevent="scrollToCategory(category.id)">
                  <i :class="category.icon"></i>
                  {{ category.title }}
                </a>
              </template>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <!-- 右侧内容 -->
        <el-main>
          <div v-for="category in categories" :key="category.id" class="category">
            <div :id="'category-' + category.id" class="category-title">
              <i :class="category.icon"></i>
              {{ category.title }}
            </div>
            <el-card v-for="site in category.sites" :key="site.id" class="site-card site-block">
              <a :id="'site-' + site.id" :href="site.url" target="_blank">{{ site.linkText }}</a>
            </el-card>
            <!-- 添加子项的右侧内容 -->
            <div v-for="child in category.children" :key="child.id" class="category">
              <div :id="'category-' + child.id" class="category-title">
                <i :class="child.icon"></i>
                {{ child.title }}
              </div>
              <el-card v-for="site in child.sites" :key="site.id" class="site-card site-block">
                <a :id="'site-' + site.id" :href="site.url" target="_blank">{{ site.linkText }}</a>
              </el-card>
            </div>
          </div>
        </el-main>
      </el-container>
    </div>
  </template>
  
<script>
export default {
    data() {
        return {
            activeCategory: '1', // 默认选中第一个分类
            categories: [
                {
                    id: 1,
                    title: '搜索引擎',
                    icon: 'el-icon-search',
                    sites: [
                        { id: 1, linkText: 'Google', url: 'https://www.google.com' },
                        { id: 2, linkText: 'Bing', url: 'https://www.bing.com' },
                        { id: 3, linkText: '百度', url: 'https://www.baidu.com' },
                    ],
                },
                {
                    id: 2,
                    title: '社交网络1',
                    icon: 'el-icon-s-promotion',
                    sites: [
                        { id: 4, linkText: 'Twitter', url: 'https://twitter.com' },
                        { id: 5, linkText: 'Facebook', url: 'https://www.facebook.com' },
                        { id: 6, linkText: 'LinkedIn', url: 'https://www.linkedin.com' },
                    ],
                },

                {
                    id: 3,
                    title: '社交网络2',
                    icon: 'el-icon-s-promotion',
                    sites: [
                        { id: 7, linkText: 'Twitter', url: 'https://twitter.com' },
                        { id: 8, linkText: 'Facebook', url: 'https://www.facebook.com' },
                        { id: 9, linkText: 'LinkedIn', url: 'https://www.linkedin.com' },
                    ],
                }
                ,
                {
                    id: 4,
                    title: '社交网络3',
                    icon: 'el-icon-s-promotion',
                    sites: [
                        { id: 10, linkText: 'Twitter', url: 'https://twitter.com' },
                        { id: 11, linkText: 'Facebook', url: 'https://www.facebook.com' },
                        { id: 12, linkText: 'LinkedIn', url: 'https://www.linkedin.com' },
                    ],
                }
                ,
                {
                    id: 5,
                    title: '社交网络4',
                    icon: 'el-icon-s-promotion',
                    sites: [
                        { id: 13, linkText: 'Twitter', url: 'https://twitter.com' },
                        { id: 14, linkText: 'Facebook', url: 'https://www.facebook.com' },
                        { id: 15, linkText: 'LinkedIn', url: 'https://www.linkedin.com' },
                    ],
                }
                ,
                {
                    id: 6,
                    title: '社交网络5',
                    icon: 'el-icon-s-promotion',
                    sites: [
                        { id: 16, linkText: 'Twitter', url: 'https://twitter.com' },
                        { id: 17, linkText: 'Facebook', url: 'https://www.facebook.com' },
                        { id: 18, linkText: 'LinkedIn', url: 'https://www.linkedin.com' },
                    ],
                }
                ,
                {
                    id: 7,
                    title: '社交网络7',
                    icon: 'el-icon-s-promotion',
                    sites: [
                        { id: 19, linkText: 'Twitter', url: 'https://twitter.com' },
                        { id: 20, linkText: 'Facebook', url: 'https://www.facebook.com' },
                        { id: 21, linkText: 'LinkedIn', url: 'https://www.linkedin.com' },
                    ],
                },
                {
                    id: 8,
                    title: '社交网络8',
                    icon: 'el-icon-s-promotion',
                    sites: [
                        { id: 22, linkText: 'Twitter', url: 'https://twitter.com' },
                        { id: 23, linkText: 'Facebook', url: 'https://www.facebook.com' },
                        { id: 24, linkText: 'LinkedIn', url: 'https://www.linkedin.com' },
                    ],
                }
                ,
                {
                    id: 9,
                    title: '社交网络9',
                    icon: 'el-icon-s-promotion',
                    sites: [
                        { id: 25, linkText: 'Twitter', url: 'https://twitter.com' },
                        { id: 26, linkText: 'Facebook', url: 'https://www.facebook.com' },
                        { id: 27, linkText: 'LinkedIn', url: 'https://www.linkedin.com' },
                    ],
                }
                ,
                {
                    id: 10,
                    title: '社交网络10',
                    icon: 'el-icon-s-promotion',
                    sites: [
                        { id: 28, linkText: 'Twitter', url: 'https://twitter.com' },
                        { id: 29, linkText: 'Facebook', url: 'https://www.facebook.com' },
                        { id: 30, linkText: 'LinkedIn', url: 'https://www.linkedin.com' },
                    ],
                },
                {
                    id: 11,
                    title: '技术社区11',
                    icon: 'el-icon-service',
                    sites: [
                                { id: 34, linkText: 'Node.js', url: 'https://nodejs.org' },
                                { id: 35, linkText: 'Spring', url: 'https://spring.io' },
                                { id: 36, linkText: 'Django', url: 'https://www.djangoproject.com' },
                            ],
                    children: [
                        {
                            id: 99,
                            title: '前端开发',
                            icon: 'el-icon-s-promotion',
                            sites: [
                                { id: 31, linkText: 'Vue.js', url: 'https://vuejs.org' },
                                { id: 32, linkText: 'React', url: 'https://reactjs.org' },
                                { id: 33, linkText: 'Angular', url: 'https://angular.io' },
                            ],
                        },
                        {
                            id: 100,
                            title: '后端开发',
                            icon: 'el-icon-s-promotion',
                            sites: [
                                { id: 37, linkText: 'Node.js', url: 'https://nodejs.org' },
                                { id: 38, linkText: 'Spring', url: 'https://spring.io' },
                                { id: 39, linkText: 'Django', url: 'https://www.djangoproject.com' },
                            ],
                        },
                    ],
                }

            ],
        };
    },
    computed: {
        selectedCategory() {
            return this.categories.find(category => String(category.id) === this.activeCategory);
        },
    },
    methods: {
        scrollToCategory(id) {
            // 获取目标元素的位置
            const targetElement = document.getElementById('category-' + id);
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
    display: inline-block; /* 设置小方块为行内块元素 */
    width: 300px; /* 设置小方块的宽度 */
    height: 100px;
    margin-right: 20px; /* 设置小方块之间的右边距 */
    margin-bottom: 10px; /* 设置小方块之间的下边距 */
    vertical-align: top; /* 使小方块上对齐 */
    text-align: center;
    background-color: #f7f7f7;
    border-radius: 10px; /* 添加圆角 */
    cursor: pointer;
}

.site-block a {
    text-decoration: none;
    color: #333;
    font-size: 14px; /* 设置文字大小 */
}

.site-block:hover {
    background-color: #0078d4; /* 悬停时改变背景颜色 */
}

.site-block:hover a {
    color: #fff; /* 悬停时改变文字颜色 */
}

i {
    margin-right: 10px;
}

/* 添加媒体查询以调整列数 */
@media screen and (max-width: 1200px) {
  .category .site-card {
    width: 25%; /* 在页面宽度小于1200px时，每行最多显示四个方块 */
  }
}

@media screen and (max-width: 800px) {
  .category .site-card {
    width: 33.33%; /* 在页面宽度小于800px时，每行最多显示三个方块 */
  }
}

@media screen and (max-width: 600px) {
  .category .site-card {
    width: 50%; /* 在页面宽度小于600px时，每行最多显示两个方块 */
  }
}

@media screen and (max-width: 400px) {
  .category .site-card {
    width: 100%; /* 在页面宽度小于400px时，每行只显示一个方块，占满整行 */
  }
}
</style>

