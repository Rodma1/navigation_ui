<template>
    <div>
        <el-button @click="refreshList">查询</el-button>
        <el-button @click="dialogVisible = true;">创建备忘录</el-button>
        <el-button @click="handleBatchDelete()">删除备忘录</el-button>

        <el-input style="width: 200px;margin-left: 10px"  v-model="pageMemoryFrom.content" placeholder="查询备忘录名"></el-input>
        <el-table
        :data="tableData"
        style="width: 100%" ref="multipleTable" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column
                prop="content"
                label="内容">
            </el-table-column>
            <el-table-column
                prop="createTime"
                label="创建时间">
            </el-table-column>

            <el-table-column
                align="right">
                <template slot-scope="scope">
                    <el-button
                        size="mini"
                        @click="updateMemoryFrom=scope.row;updateMemoryVisible = true">编辑备忘录</el-button>
                    <el-button
                        size="mini"
                        type="danger"
                        @click="handleDelete(scope.row)">删除备忘录</el-button>
                </template>
            </el-table-column>
    </el-table>
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
                   :page-size="pageSize" :total="total" layout="total, sizes, prev, pager, next, jumper"></el-pagination>

        <el-dialog title="创建备忘录" :visible.sync="dialogVisible" width="30%">
            <el-form ref="form" :model="createMemoryFrom" label-width="80px">
                <el-form-item label="内容" >
                    <el-input   type="textarea"
                                autosize v-model="createMemoryFrom.content"></el-input>
                </el-form-item>
                <!-- 其他表单项 -->
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="createMemory" :loading="false">确 定</el-button>
            </span>
        </el-dialog>


        <el-dialog title="编辑备忘录" :visible.sync="updateMemoryVisible" width="30%">
            <el-form ref="form" :model="updateMemoryFrom" label-width="80px">
                <el-form-item label="内容">
                    <el-input  type="textarea" autosize v-model="updateMemoryFrom.content"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="updateMemoryVisible = false">取 消</el-button>
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
            pageMemoryFrom: {
                content: null,
                categoryId: null,
            },


            categoryType: "ARTICLE",
            dialogVisible: false,
            categoryVisible: false,
            updateMemoryVisible: false,
            createMemoryFrom: {
                content: '',
            },
            updateMemoryFrom: {
                id: null,
                content: '',
            },
            deleteMemoryFrom: {
                ids: [],
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
                    content: this.pageMemoryFrom.content,
                    categoryId: this.pageMemoryFrom.categoryId
                };
                const response = await this.axios.get('/api/memory/pages',{params});
                this.tableData = response.data.data.rows

                this.total = response.data.data.total
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
         * 创建备忘录
         * @returns {Promise<void>}
         */
        async createMemory() {
            try {
                const response = await this.axios.post('/api/memory/insert', this.createMemoryFrom);
                console.log(response.data)
                this.$message({
                    message: response.data.message,
                    type: 'success'
                });
                this.refreshList()
                this.createMemoryFrom = {}
            } catch (error) {
                console.log(error)
            }

            // 表单验证和提交逻辑
            this.dialogVisible = false;
        },


        /**
         * 更新备忘录
         * @returns {Promise<void>}
         */
        async handleEdit() {
            try {
                const response = await this.axios.put('/api/memory/update', this.updateMemoryFrom);
                this.$message({
                    message: response.data.message,
                    type: 'success'
                });
                this.refreshList()
                this.updateMemoryFrom = {}
            } catch (error) {
                console.log(error)
            }

            // 表单验证和提交逻辑
            this.updateMemoryVisible = false;
        },
        /**
         * 删除备忘录
         * @param row
         * @returns {Promise<void>}
         */
        async handleDelete(row) {
            this.$confirm('此操作将删除备忘录, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                this.deleteMemoryFrom.ids = [row.id]
                const response = await this.axios.delete('/api/memory/delete', {data:this.deleteMemoryFrom});
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
         * 批量删除备忘录
         * @returns {Promise<void>}
         */
        async handleBatchDelete() {
            this.$confirm('此操作将批量删除备忘录'+ ', 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                this.deleteMemoryFrom.ids = this.multipleSelection
                const response = await this.axios.delete('/api/memory/delete', {data:this.deleteMemoryFrom});
                this.$message({
                    message: response.data.message,
                    type: 'success'
                });
                this.refreshList()

            }).catch((error) => {
                console.log(error)
            });
        },


    },
    mounted() {
        this.refreshList()
    }
}
</script>