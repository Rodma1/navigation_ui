<template>
  <div class="file-upload-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>文件上传</span>
      </div>
      <div class="upload-section">
        <el-select v-model="selectedBucket" placeholder="请选择存储桶" style="margin-bottom: 20px; width: 200px;">
          <el-option
            v-for="bucket in buckets"
            :key="bucket"
            :label="bucket"
            :value="bucket">
          </el-option>
        </el-select>
        <el-upload
          class="upload-demo"
          :action="uploadUrl"
          :on-success="handleSuccess"
          :on-error="handleError"
          :before-upload="beforeUpload"
          :headers="headers"
          :data="uploadData"
          list-type="picture-card"
          :file-list="fileList"
          :auto-upload="true">
          <i class="el-icon-plus"></i>
        </el-upload>
      </div>
    </el-card>

    <el-card class="box-card" style="margin-top: 20px;">
      <div slot="header" class="clearfix">
        <span>图片展示</span>
      </div>
      <div class="image-list">
        <el-row :gutter="20">
          <el-col :span="6" v-for="(item, index) in imageList" :key="index">
            <el-card :body-style="{ padding: '0px' }" class="image-card">
              <img :src="item.url" class="image">
              <div style="padding: 14px;">
                <span>{{ item.name }}</span>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'FileUpload',
  data() {
    return {
      fileList: [],
      imageList: [],
      buckets: [],
      selectedBucket: '',
      headers: {
        // 如果需要认证，可以在这里添加token
      },
      uploadData: {
        // 上传时的额外参数
      }
    }
  },
  computed: {
    uploadUrl() {
      return this.selectedBucket ? `/api/file/fileStreamUpload?bucketName=${this.selectedBucket}` : '';
    }
  },
  watch: {
    selectedBucket(newVal) {
      if (newVal) {
        this.loadImages();
      }
    }
  },
  created() {
    this.loadBuckets();
  },
  methods: {
    async loadBuckets() {
      try {
        const response = await this.axios.get('/file/getAllBuckets');
        if (response.data.code === 200) {
          this.buckets = response.data.data;
          if (this.buckets.length > 0) {
            this.selectedBucket = this.buckets[0];
          }
        }
      } catch (error) {
        console.error('加载存储桶失败:', error);
        this.$message.error('加载存储桶失败');
      }
    },
    beforeUpload(file) {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        this.$message.error('只能上传图片文件！');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 2MB!');
        return false;
      }
      return true;
    },
    handleSuccess() {
      this.$message.success('上传成功');
      this.loadImages();
    },
    handleError(err) {
      this.$message.error('上传失败');
      console.error(err);
    },
    async loadImages() {
      if (!this.selectedBucket) return;
      
      try {
        const response = await this.axios.get('/file/getFileList', {
          params: {
            bucketName: this.selectedBucket
          }
        });
        if (response.data.code === 200) {
          this.imageList = response.data.data.map(item => ({
            name: item.name,
            url: item.url // 这里需要根据实际返回的数据结构调整
          }));
        }
      } catch (error) {
        console.error('加载图片失败:', error);
        this.$message.error('加载图片失败');
      }
    }
  }
}
</script>

<style scoped>
.file-upload-container {
  padding: 20px;
}

.upload-section {
  margin-bottom: 20px;
}

.image-list {
  margin-top: 20px;
}

.image-card {
  margin-bottom: 20px;
}

.image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both;
}
</style>