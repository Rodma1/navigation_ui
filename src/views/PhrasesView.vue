<template>
    <div>
        <el-button @click="refreshList">查询</el-button>
        <el-button @click="dialogVisible = true;getAllCategories()">创建句子</el-button>

        <el-button @click="categoryVisible = true;getAllCategories()">创建类别</el-button>
        <el-button @click="handleBatchDelete()">删除句子</el-button>

        <el-input style="width: 200px;margin-left: 10px"  v-model="pagePhrasesFrom.sentence" placeholder="查询句子"></el-input>
        <el-cascader style="width: 200px;margin-left: 10px;"
                     v-model="pagePhrasesFrom.categoryId"
                     :options="categoryOptions"
                     placeholder="查询句子类别"
                     :show-all-levels="true"
                     :props="{emitPath:false, multiple :false, checkStrictly: true,value: 'id',label:'name' }"
                     clearable>
        </el-cascader>

        <el-table
                :data="tableData"
                style="width: 100%" ref="multipleTable" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column
                    prop="sentence"
                    label="句子">
            </el-table-column>
            <el-table-column
                    prop="createTime"
                    label="创建时间">
            </el-table-column>
            <el-table-column
                prop="categoryName"
                label="类别名称">
            </el-table-column>
            <el-table-column
                align="right" label="推荐等级">
                <template slot-scope="scope">
                    <el-rate
                        v-model="scope.row.rank"
                        :colors="colors">

                    </el-rate>
                </template>
            </el-table-column>


            <el-table-column
                    align="right">
                <template slot-scope="scope">
                    <el-button
                            size="mini"
                            @click="updatePhrasesFrom=scope.row;updatePhrasesVisible = true;getAllCategories()">编辑句子</el-button>
                    <el-button
                            size="mini"
                            type="danger"
                            @click="handleDelete(scope.row)">删除句子</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
                       :page-size="pageSize" :total="total" layout="total, sizes, prev, pager, next, jumper"></el-pagination>

        <el-dialog title="创建句子" :visible.sync="dialogVisible" width="30%">
            <el-form ref="form" :model="createPhrasesFrom" label-width="80px">
                <el-form-item label="句子">
                    <el-input v-model="createPhrasesFrom.sentence"></el-input>
                </el-form-item>
                <el-form-item label="句子类别">
                    <el-cascader
                            v-model="createPhrasesFrom.categoryIds"
                            :options="categoryOptions"
                            :show-all-levels="false"
                            :props="{emitPath:false, multiple :true, checkStrictly: true,value: 'id',label:'name' }"
                            clearable>
                    </el-cascader>
                </el-form-item>

                <el-form-item label="推荐等级">
                    <el-rate
                        v-model="createPhrasesFrom.rank"
                        :colors="colors">
                    </el-rate>
                </el-form-item>
                <!-- 其他表单项 -->
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="createPhrases" :loading="false">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog title="创建类别" :visible.sync="categoryVisible" width="30%">
            <el-form ref="form" :model="createCategoryFrom" label-width="80px">
                <el-form-item label="类别名">
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
            <span slot="footer" class="dialog-footer">
                <el-button @click="categoryVisible = false">取 消</el-button>
                <el-button type="primary" @click="createPhrasesCategory" :loading="false">确 定</el-button>
            </span>
        </el-dialog>


        <el-dialog title="编辑句子" :visible.sync="updatePhrasesVisible" width="30%">
            <el-form ref="form" :model="updatePhrasesFrom" label-width="80px">
                <el-form-item label="句子">
                    <el-input v-model="updatePhrasesFrom.sentence"></el-input>
                </el-form-item>
                <el-form-item label="句子类别">
                    <el-cascader
                            v-model="updatePhrasesFrom.categoryIds"
                            :options="categoryOptions"
                            :show-all-levels="false"
                            :props="{emitPath:false, multiple :true, checkStrictly: true,value: 'id',label:'name' }"
                            clearable>
                    </el-cascader>

                    <el-form-item label="推荐等级">
                        <el-rate
                            v-model="updatePhrasesFrom.rank"
                            :colors="colors">
                        </el-rate>
                    </el-form-item>
                </el-form-item>
                <!-- 其他表单项 -->
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="updatePhrasesVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleEdit" :loading="false">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
export default {
    data() {
        return {
            tableData: [],
            currentPage: 1,
            pageSize: 10,
            total: 0,
            pagePhrasesFrom: {
                sentence: null,
                categoryId: null,
            },
            colors: ['#99A9BF', '#F7BA2A', '#FF9900'],
            categoryType: "PHRASES",
            dialogVisible: false,
            categoryVisible: false,
            updatePhrasesVisible: false,
            createPhrasesFrom: {
                sentence: '',
                categoryIds: [],
                rank: null
            },
            updatePhrasesFrom: {
                id: null,
                sentence: '',
                categoryIds: [],
                rank: null

            },
            deletePhrasesFrom: {
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
            this.getPage()
            this.currentPage = 1
            this.pageSize = 10
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
                    sentence: this.pagePhrasesFrom.sentence,
                    categoryId: this.pagePhrasesFrom.categoryId
                };
                const response = await this.axios.get('/api/phrases/pages',{params});
                this.tableData = response.data.data.rows

                this.total = response.data.data.total
                console.log("查询" + this.tableData)
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
         * 创建句子
         * @returns {Promise<void>}
         */
        async createPhrases() {
            try {
                const response = await this.axios.post('/api/phrases/insert', this.createPhrasesFrom);
                console.log(response.data)
                this.$message({
                    message: response.data.message,
                    type: 'success'
                });
                this.refreshList()
                this.createPhrasesFrom = {}
            } catch (error) {
                console.log(error)
            }

            // 表单验证和提交逻辑
            this.dialogVisible = false;
        },

        /**
         * 创建句子类别
         * @returns {Promise<void>}
         */
        async createPhrasesCategory() {
            try {
                this.createCategoryFrom.categoryType = this.categoryType
                const response = await this.axios.post('/api/categories/insert', this.createCategoryFrom);
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
         * 更新句子
         * @returns {Promise<void>}
         */
        async handleEdit() {
            try {
                const response = await this.axios.put('/api/phrases/update', this.updatePhrasesFrom);
                this.$message({
                    message: response.data.message,
                    type: 'success'
                });
                this.refreshList()
                this.updatePhrasesFrom = {}
            } catch (error) {
                console.log(error)
            }

            // 表单验证和提交逻辑
            this.updatePhrasesVisible = false;
        },
        /**
         * 删除句子
         * @param row
         * @returns {Promise<void>}
         */
        async handleDelete(row) {
            this.$confirm('此操作将删除句子, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                this.deletePhrasesFrom.ids = [row.id]
                const response = await this.axios.delete('/api/phrases/delete', {data:this.deletePhrasesFrom});
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
         * 批量删除句子
         * @returns {Promise<void>}
         */
        async handleBatchDelete() {
            this.$confirm('此操作将批量删除句子'+ ', 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                this.deletePhrasesFrom.ids = this.multipleSelection
                const response = await this.axios.delete('/api/phrases/delete', {data:this.deletePhrasesFrom});
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
                const response = await this.axios.get('/api/categories/getAllCategoryTree/' + this.categoryType);
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