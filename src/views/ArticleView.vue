<template>
    <div>
        <div class="toolbar">
          <div class="toolbar-actions">
            <el-button @click="refreshList">查询</el-button>
            <el-button @click="dialogVisible = true;getAllCategories()">创建文章</el-button>
            <el-button plain @click="categoryVisible = true;getAllCategories()">创建类别</el-button>
            <el-button @click="handleBatchDelete()">删除文章</el-button>
          </div>
          <div class="toolbar-filters">
            <el-input class="toolbar-input" v-model="pageArticleFrom.name" placeholder="查询文章名"></el-input>
            <el-input class="toolbar-input" v-model="pageArticleFrom.url" placeholder="查询文章地址"></el-input>
            <el-cascader class="toolbar-cascader"
                         v-model="pageArticleFrom.categoryId"
                         :options="categoryOptions"
                         placeholder="查询文章类别"
                         :show-all-levels="true"
                         :props="{emitPath:false, multiple :false, checkStrictly: true,value: 'id',label:'name' }"
                         clearable>
            </el-cascader>
          </div>
        </div>

        <el-table
            :data="tableData"
            style="width: 100%"
            ref="multipleTable"
            @selection-change="handleSelectionChange"
        >
            <el-table-column type="selection" width="55" />
            
            <el-table-column prop="name" label="文章名称" />
            <el-table-column prop="url" label="地址" />
            <el-table-column prop="createTime" label="创建时间" />
            <el-table-column prop="categoryName" label="类别名称" />

            <el-table-column prop="state" label="完成状态" width="100">
                <template #default="scope">
                    <el-switch
                        v-model="scope.row.state"
                        :active-value="1"
                        :inactive-value="0"
                        active-color="#13ce66"
                        inactive-color="#ff4949"
                        @click = "updateArticleState(scope.row)"
                    />
                </template>
            </el-table-column>

            <el-table-column align="right">
                <template #default="{ row }">
                    <el-button
                        @click="updateArticleFrom=row;updateArticleVisible = true;getAllCategories()">编辑文章</el-button>
                    <el-button
                        type="danger"
                        @click="handleDelete(row)"
                    >
                        删除文章
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-pagination
            :current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />

        <el-dialog title="创建文章"  v-model="dialogVisible" width="50%" height="50%">
            <el-form ref="form" :model="createArticleFrom" label-width="80px">
                <el-form-item label="文章名称">
                    <el-input v-model="createArticleFrom.name"></el-input>
                </el-form-item>
                <el-form-item label="文章地址">
                    <el-input v-model="createArticleFrom.url"></el-input>
                </el-form-item>
                <el-form-item label="完成状态">
                    <el-switch
                        v-model="createArticleFrom.state"
                        active-value="1"
                        inactive-value="0">
                    </el-switch>
                </el-form-item>
                <el-form-item label="文章类别">
                        <el-cascader
                            v-model="createArticleFrom.categoryIds"
                            :options="categoryOptions"
                            :show-all-levels="false"
                            :props="{emitPath:false, multiple :true, checkStrictly: true,value: 'id',label:'name' }"
                            clearable>
                        </el-cascader>
                </el-form-item>
                <!-- 其他表单项 -->
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="createArticle" :loading="false">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog title="创建类别" v-model="categoryVisible" width="30%">
            <el-form ref="form" :model="createCategoryFrom" label-width="80px">
                <el-form-item label="类别名称">
                    <el-input v-model="createCategoryFrom.name"></el-input>
                </el-form-item>
                <el-form-item label="图标">
                    <el-input v-model="createCategoryFrom.icon"></el-input>
                </el-form-item>
                <el-form-item label="排序">
                    <el-input v-model="createCategoryFrom.sort"></el-input>
                </el-form-item>
                <el-form-item label="父类别">
                    <el-cascader
                        v-model="createCategoryFrom.parentId"
                        :options="categoryOptions"
                        :show-all-levels="true"
                        :props="{emitPath:false, multiple :false, checkStrictly: true,value: 'id',label:'name' }"
                        clearable>
                    </el-cascader>
                </el-form-item>
                <!-- 其他表单项 -->
            </el-form>
          <template #footer>
            <div class="dialog-footer">
                <el-button @click="categoryVisible = false">取 消</el-button>
                <el-button type="primary" @click="createArticleCategory" :loading="false">确 定</el-button>
            </div>
          </template>
        </el-dialog>


        <el-dialog title="编辑文章" :model-value="updateArticleVisible"
                   @update:model-value = "updateArticleVisible = $event" width="30%">
            <el-form ref="form" :model="updateArticleFrom" label-width="80px">
                <el-form-item label="文章名称">
                    <el-input v-model="updateArticleFrom.name"></el-input>
                </el-form-item>
                <el-form-item label="文章地址">
                    <el-input v-model="updateArticleFrom.url"></el-input>
                </el-form-item>
                <el-form-item label="完成状态">
                    <el-switch
                        v-model="updateArticleFrom.state"
                        active-value="1"
                        inactive-value="0">
                    </el-switch>
                </el-form-item>
                <el-form-item label="文章类别">
                    <el-cascader
                        v-model="updateArticleFrom.categoryIds"
                        :options="categoryOptions"
                        :show-all-levels="false"
                        :props="{emitPath:false, multiple :true, checkStrictly: true,value: 'id',label:'name' }"
                        clearable>
                    </el-cascader>
                </el-form-item>
                <!-- 其他表单项 -->
            </el-form>
            <template #footer>
                <el-button @click="updateArticleVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleEdit" :loading="false">确 定</el-button>
            </template>
        </el-dialog>
    </div>



</template>

<script>
import {ElMessage} from "element-plus";

export default {
    data() {
        return {
            tableData: [],
            currentPage: 1,
            pageSize: 10,
            total: 0,
            pageArticleFrom: {
                name: null,
                categoryId: null,
                url: null,

            },


            categoryType: "ARTICLE",
            dialogVisible: false,
            categoryVisible:  false,
            updateArticleVisible: false,
            createArticleFrom: {
                name: '',
                url: '',
                state: 0,
                categoryIds: [],
            },
            updateArticleFrom: {
                id: null,
                name: '',
                url: '',
                state: 0,
                categoryIds: [],
            },
            updateArticleStatusFrom: {
                id: null,
                state: 0,
            },
            deleteArticleFrom: {
                ids: [],
            },
            createCategoryFrom: {
                name: '',
                icon: '',
                sort: 0,
                parentId: null,
                categoryType: this.categoryType
            },
            categoryOptions: [],
            categoryOptionsValue: '',
            multipleSelection: []
        }
    },
    methods: {
        // 刷新
        refreshList() {
            // 执行刷新列表的操作
            this.currentPage = 1
            this.pageSize = 10
            this.getPage()

        },
        handleSelectionChange(val) {
            this.multipleSelection = [];
            val.forEach(element => {
                this.multipleSelection.push(element.id)
            });
        },
        /**
         * 获取文档列表数据
          * @returns {Promise<void>}
         */
        async getPage() {
            // 假设使用axios发起请求获取数据

            try {
                const params = {
                    pageSize: this.pageSize,
                    pageNum: this.currentPage,
                    name: this.pageArticleFrom.name,
                    url: this.pageArticleFrom.url,
                    categoryId: this.pageArticleFrom.categoryId
                };
                const response = await this.axios.get('/cyzArticle/pages',{params});
                console.log(response.data)
                this.tableData = response.data.data.rows.map(row => ({
                    ...row,
                    state: Number(row.state),
                    id: row.id
                }));
                console.log(this.tableData)
                this.total = response.data.data.total
                // console.log("查询" + this.tableData)
            } catch (error) {
                console.log(error)
            }


        },
        handleSizeChange(size) {
            this.pageSize = size;
            this.currentPage = 1;
            this.getPage()

        },
        handleCurrentChange(page) {
            this.currentPage = page;
            this.getPage()
        },
        /**
         * 创建文章
         * @returns {Promise<void>}
         */
        async createArticle() {
            try {
                const response = await this.axios.post('/cyzArticle/insert', this.createArticleFrom);
                console.log(response.data)
                this.$message({
                    message: response.data.message,
                    type: 'success'
                });
                this.refreshList()
                this.createArticleFrom = {}
            } catch (error) {
                console.log(error)
            }

            // 表单验证和提交逻辑
            this.dialogVisible = false;
        },

        /**
         * 创建文章类别
         * @returns {Promise<void>}
         */
        async createArticleCategory() {
            try {
                this.createCategoryFrom.categoryType = this.categoryType
                const response = await this.axios.post('/categories/insert', this.createCategoryFrom);
                this.$message({
                    message: response.data.message,
                    type: 'success'
                });
                // this.refreshList()
                this.createCategoryFrom = {}
            } catch (error) {
                console.log(error)
            }

            // 表单验证和提交逻辑
            this.categoryVisible = false;
        },

        /**
         * 更新文章状态
         * @param row
         * @returns {Promise<void>}
         */
        async updateArticleState(row) {
            try {
                this.updateArticleStatusFrom.id = row.id
                this.updateArticleStatusFrom.state = row.state
                const response = await this.axios.put('/cyzArticle/updateStatus', this.updateArticleStatusFrom);
                this.$message({
                    message: response.data.message,
                    type: 'success'
                });
                this.refreshList()
                this.updateArticleStatusFrom = {}
            } catch (error) {
                console.log(error)
                ElMessage.error('更新失败')
            }
        },

        /**
         * 更新文章
         * @returns {Promise<void>}
         */
        async handleEdit() {
            try {
                const response = await this.axios.put('/cyzArticle/update', this.updateArticleFrom);
                this.$message({
                    message: response.data.message,
                    type: 'success'
                });
                this.refreshList()
                this.updateArticleFrom = {}
            } catch (error) {
                console.log(error)
            }

            // 表单验证和提交逻辑
            this.updateArticleVisible = false;
        },
        /**
         * 删除文章
         * @param row
         * @returns {Promise<void>}
         */
        async handleDelete(row) {
            this.$confirm('此操作将删除文章'+ row.name +', 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                this.deleteArticleFrom.ids = [row.id]
                const response = await this.axios.delete('/cyzArticle/delete', {data:this.deleteArticleFrom});
                this.$message({
                    message: response.data.message,
                    type: 'success'
                });
                this.refreshList()

            }).catch((error) => {
                console.log(error)
            });
        },

        /**
         * 批量删除文章
         * @returns {Promise<void>}
         */
        async handleBatchDelete() {
            this.$confirm('此操作将批量删除文章'+ ', 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                this.deleteArticleFrom.ids = this.multipleSelection
                const response = await this.axios.delete('/cyzArticle/delete', {data:this.deleteArticleFrom});
                this.$message({
                    message: response.data.message,
                    type: 'success'
                });
                this.refreshList()

            }).catch((error) => {
                console.log(error)
            });
        },


        /**
         * 获取类别树
         */
        async getAllCategories() {
            // 假设使用axios发起请求获取数据

            try {
                const response = await this.axios.get('/categories/getAllCategoryTree/' + this.categoryType);
                this.categoryOptions = response.data.data
            } catch (error) {
                console.log(error)
            }


        },

    },
    mounted() {
        this.refreshList()
        this.getAllCategories()
    }
}
</script>

<style scoped>
.toolbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.toolbar-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.toolbar-input {
  width: 200px;
}

.toolbar-cascader {
  width: 200px;
}

@media (max-width: 768px) {
  .toolbar-input {
    width: 100%;
  }

  .toolbar-cascader {
    width: 100%;
  }
}
</style>