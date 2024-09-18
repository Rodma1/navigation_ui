<template>
    <div class="json-viewer-container">
        <el-button @click="refreshList">查询</el-button>
        <el-button type="danger" @click="batchDelete">批量删除</el-button>
        <el-button type="primary" @click="showCreateDialog">创建 JSON 数据</el-button>
        <el-input style="width: 200px;margin-left: 10px"  v-model="documentId" placeholder="根据文章Id查询"></el-input>

        <el-select v-model="indices"  multiple  placeholder="请选择">
            <el-option v-for="item in indexNames" :key="item" :label="item" :value="item">
            </el-option>
        </el-select>

        <b style="margin-left: 5%;">总数： {{ count }}</b>
        <el-dialog title="创建 JSON 数据" :visible.sync="createDialogVisible" width="30%" @close="resetCreateForm">
            <el-input type="textarea" v-model="newJson" placeholder="请输入 JSON 数据" :rows="10"></el-input>
            <el-select v-model="selectIndex" clearable placeholder="请选择">
                <el-option v-for="item in indexNames" :key="item" :label="item" :value="item">
                </el-option>
            </el-select>

            <span slot="footer" class="dialog-footer">
                <el-button @click="createDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="createJson">创建</el-button>
            </span>
        </el-dialog>
        <div v-for="item in  jsonData" :key="item.id" class="json-item">
            <el-checkbox v-model="selectedItems" :label="item.id" class="custom-checkbox">
                <div class="checkbox-content">
                    <span class="index-name">索引名: {{ item.index }}</span>
                    <span class="index-id">索引id: {{ item.id }}</span>
                </div>

            </el-checkbox>

            <el-button style="margin-left: 5%;" type="text" icon="el-icon-document-copy"
                @click="copyJson(item.source)">复制</el-button>

            <json-viewer :value="item.source" style="font-size: 18px;" :expanded="true"></json-viewer>
        </div>
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
            :page-size="pageSize" :total="count" layout="total, sizes, prev, pager, next, jumper"></el-pagination>

    </div>
</template>

<script>

export default {
    props: {
        connectParam: Object,
    },

    data() {
        return {
            jsonData: [
            ],
            createDialogVisible: false,
            newJson: '',
            currentPage: 1,
            pageSize: 10,
            selectedItems: [],
            operationCategory: "DOCUMENT",
            count: 0,
            indexNames: [],
            selectIndex: '',
            documentId: '',
            indices:[],
        };
    },

    methods: {
        // 刷新
        refreshList() {
            // 执行刷新列表的操作
            this.getDocumentsPage()
            this.getDocumentCount()
            this.currentPage = 1
            this.pageSize = 10
        },
        //  获取链接请求参数
        getParams(operationType) {
            const params = this.connectParam
            params.operationCategory = this.operationCategory
            params.operationType = operationType
            return params
        },
        //  获取文档列表数据

        async getDocumentsPage() {
            // 假设使用axios发起请求获取数据

            try {

                let names = [];
                if (this.indices.length === 0 || !this.indices) {
                    await this.getindexNames()
                    names =  this.indexNames;
                } else {
                    names = this.indices;
                }

                const params = this.getParams("PAGE")
                params.pageSize = this.pageSize
                params.pageNum = this.currentPage
                params.documentId = this.documentId
                params.indices = names
                const response = await this.axios.post('/api/elasticsearch/operation', params);
                this.jsonData = response.data.data
                console.log("查询" + this.jsonData)
            } catch (error) {
                console.log(error)
            }


        },
        showCreateDialog() {
            this.createDialogVisible = true;
            this.getindexNames()

        },
        resetCreateForm() {
            this.newJson = '';
        },
        async createJson() {
            try {
                const parsedJson = JSON.parse(this.newJson);
                if (Array.isArray(parsedJson)) {
                    parsedJson.forEach(item => {
                        this.jsonData.push({ ...item, id: this.jsonData.length + 1 });
                    });
                } else {
                    // this.jsonData.push({ ...parsedJson, id: this.jsonData.length + 1 });
                    const params = this.getParams("INSERT")
                    params.document = JSON.stringify(parsedJson);
                    params.indexName = this.selectIndex
                    const response = await this.axios.post('/api/elasticsearch/operation', params);
                    this.refreshList()
                    this.$message({
                        message: response.data.message,
                        type: 'success'
                    });
                }

                this.createDialogVisible = false;
                this.resetCreateForm();

            } catch (error) {
                this.$message.error(error.message);
            }
        },
        handleSizeChange(size) {
            this.pageSize = size;
            this.currentPage = 1;
            this.getDocumentsPage()

        },
        handleCurrentChange(page) {
            this.currentPage = page;
            this.getDocumentsPage()
        },

        async getindexNames() {
            const params = this.getParams("INDEX_LIST")
            params.operationCategory = "INDEX"
            const response = await this.axios.post('/api/elasticsearch/operation', params);
            const values = response.data.data
            const indexNames = []
            values.forEach(item => {
                indexNames.push(item.index)
            })
            this.indexNames = indexNames;
        },

        async batchDelete() {

            // console.log(this.selectedItems)
            // this.jsonData = this.jsonData.filter(item => !this.selectedItems.includes(item.id));

            this.$confirm('此操作将永久删除选中的索引文档, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {

                const params = this.getParams("DELETE")
                params.documentIds = this.selectedItems
                params.indices = this.indexNames
                const response = await this.axios.post('/api/elasticsearch/operation', params);
                this.selectedItems = [];
                this.refreshList()
                this.$message({
                    message: response.data.message,
                    type: 'success'
                });
            }).catch((error) => {
                console.log(error)
            });



        },
        // 获取总数
        async getDocumentCount() {
            const params = this.getParams("COUNT")
            const response = await this.axios.post('/api/elasticsearch/operation', params);
            this.count = response.data.data
        },
        copyJson(item) {
            const el = document.createElement('textarea');
            el.value = JSON.stringify(item, null, 2);
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            this.$message.success('JSON 已复制到剪贴板');
        }
    },
    // mounted() {
    //     this.getindexNames()
    // }
};
</script>

<style>
.json-viewer-container {
    max-width: 60%;
    margin: 50px auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.json-item {
    margin-bottom: 20px;
    padding: 10px;
    border-bottom: 1px solid #eee;
    position: relative;
}

.json-viewer-container .json-viewer {
    font-family: 'Courier New', Courier, monospace;
    font-size: 14px;
    line-height: 1.6;
}

.el-checkbox {
    margin-right: 10px;
}

.custom-checkbox {
    font-size: 14px;
    display: flex;
    align-items: center;
}

.checkbox-content {
    display: flex;
    align-items: center;
    padding: 5px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: #f9f9f9;
    margin-left: 5px;
}

.index-name {
    margin-right: 10px;
    font-weight: bold;
    color: #333;
}

.index-id {
    color: #555;
}
</style>
