<template>
    <div class="json-viewer-container">
        <el-button @click="getDocumentsPage">查询</el-button>
        <el-button type="danger" @click="batchDelete">批量删除</el-button>
        <el-button type="primary" @click="showCreateDialog">创建 JSON 数据</el-button>
        <el-dialog title="创建 JSON 数据" :visible.sync="createDialogVisible" width="30%" @close="resetCreateForm">
            <el-input type="textarea" v-model="newJson" placeholder="请输入 JSON 数据" :rows="10"></el-input>
            <span slot="footer" class="dialog-footer">
                <el-button @click="createDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="createJson">创建</el-button>
            </span>
        </el-dialog>
        <div v-for="item in pagedData" :key="item.id" class="json-item">
            <el-checkbox v-model="selectedItems" :label="item.id" class="custom-checkbox">
                <div class="checkbox-content">
                    <span class="index-name">索引名: {{ item.index }}</span>
                    <span class="index-id">索引id: {{ item.id }}</span>
                </div>
            </el-checkbox>
            <json-viewer :value="item.source" style="font-size: 18px;" :expanded="true"></json-viewer>
            <el-button type="text" icon="el-icon-document-copy" @click="copyJson(item.source)">复制</el-button>
        </div>
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
            :page-size="pageSize" :total="jsonData.length" layout="total, sizes, prev, pager, next, jumper"></el-pagination>

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
        };
    },
    computed: {
        pagedData() {
            const start = (this.currentPage - 1) * this.pageSize;
            const end = start + this.pageSize;
            return this.jsonData.slice(start, end);
        }
    },
    methods: {
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
                const params = this.getParams("PAGE")
                params.pageSize = this.pageSize
                params.pageNum = this.currentPage
                const response = await this.axios.post('/api/elasticsearch/operation', params);
                this.jsonData = response.data.data
                console.log("查询" + this.jsonData)
            } catch (error) {
                console.log(error)
            }


        },
        showCreateDialog() {
            this.createDialogVisible = true;
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
                    params.indexName = "sdfd"
                    const response = await this.axios.post('/api/elasticsearch/operation', params);
                    this.getDocumentsPage()
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
        },
        handleCurrentChange(page) {
            this.currentPage = page;
        },
        async batchDelete() {
            try {
                // console.log(this.selectedItems)
                // this.jsonData = this.jsonData.filter(item => !this.selectedItems.includes(item.id));
                
                var params = this.getParams("INDEX_LIST")
                params.operationCategory = "INDEX"
                const response = await this.axios.post('/api/elasticsearch/operation', params);
                const values = response.data.data
                const indexNames = []
                values.forEach(item => {
                    indexNames.push(item.index)
                })
                
                params = this.getParams("DELETE")
                params.documentIds = this.selectedItems
                params.indices = indexNames
                await this.axios.post('/api/elasticsearch/operation', params);
                this.selectedItems = [];
                this.getDocumentsPage()
                this.$message({
                        message: response.data.message,
                        type: 'success'
                    });
            } catch (error) {
                this.$message.error(error.message);
            }


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
    mounted() {
        this.getDocumentsPage()
    }
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
  