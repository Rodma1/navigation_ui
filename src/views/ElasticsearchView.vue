<template>
    <div>

        <el-form ref="form" :inline="true" :model="form" label-width="80px">
            <el-form-item label="协议">
                <el-select v-model="form.scheme" placeholder="请选择协议">
                    <el-option label="http" value="http"></el-option>
                    <el-option label="https" value="https"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="IP地址">
                <el-input style="width: 300px;" v-model="form.hostName"></el-input>
            </el-form-item>
            <el-form-item label="用户名">
                <el-input v-model="form.userName"></el-input>
            </el-form-item>
            <el-form-item label="密码">
                <el-input v-model="form.password"></el-input>
            </el-form-item>
            <el-form-item label="端口">
                <el-input v-model="form.port"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" :plain="true" @click="linkTest">链接测试</el-button>
            </el-form-item>
            <el-form-item>
                <div class="text item">

                    {{ '版本 ：' + versionInfo.number }}
                    <el-divider direction="vertical"></el-divider>
                    {{ '安装类型 ：' + versionInfo.buildType }}
                    <el-divider direction="vertical"></el-divider>
                    {{ 'lucene版本 ：' + versionInfo.luceneVersion }}
                </div>
            </el-form-item>
        </el-form>


        <el-tabs v-model="activeName" @tab-click="handleTabClick">
            <el-tab-pane label="索引操作" name="first"><ElasticIndicesView :connectParam="form"/></el-tab-pane>
            <el-tab-pane label="文档操作" name="second"><DocumentView :connectParam="form"/></el-tab-pane>
            <el-tab-pane label="别名操作" name="third"><AliasesView :connectParam="form"/></el-tab-pane>
            <el-tab-pane label="模板列表" name="fourth"><TemplateView :connectParam="form"></TemplateView></el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import ElasticIndicesView from "./elasticsearch/ElasticIndicesView.vue";
import DocumentView from "./elasticsearch/DocumentView.vue"
import AliasesView from "./elasticsearch/AliasesView.vue"
import TemplateView from "./elasticsearch/TemplateView.vue"
export default {
    components: { ElasticIndicesView, DocumentView, AliasesView, TemplateView },
    data() {
        return {
            form: {
                scheme: 'https',
                hostName: '192.168.248.128',
                userName: 'elastic',
                password: 'chenyunzhi123',
                port: '9200',

                operationCategory: 'INFO',
 
            },
            versionInfo: {
                "number": "-",
                "buildType": "-",
                "luceneVersion": "-"
            },

             activeName: ''
        }
    },
    methods: {
        onSubmit() {
            console.log(this.form)
            console.log('submit!');
        },
        async linkTest() {
            try {
                const params = this.form
                params.operationCategory = "INFO"
                const response = await this.axios.post('/api/elasticsearch/operation', params);
                this.$message({
                    message: '链接成功',
                    type: 'success'
                });
                this.versionInfo = response.data.data
                console.log(this.versionInfo)
                this.activeName = ''
            } catch (error) {
                this.$message.error('链接失败');
            }

        },
        handleTabClick(tab) {
            // console.log(tab, event);
            this.activeName = tab.name
        }
    }
}
</script>

<style>
.text {
    font-size: 14px;
}


.box-card {
    width: 480px;

}
</style>