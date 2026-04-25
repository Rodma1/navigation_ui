<template>
  <el-dialog
    :title="isEdit ? '编辑网站' : '新增网站'"
    v-model="visible"
    width="480px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="网站名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入网站名称" />
      </el-form-item>
      <el-form-item label="网站地址" prop="url">
        <el-input v-model="form.url" placeholder="请输入网站 URL" />
      </el-form-item>
      <el-form-item label="网站描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入网站描述" />
      </el-form-item>
      <el-form-item label="图片地址" prop="image">
        <el-input v-model="form.image" placeholder="请输入图片 URL（选填）" />
      </el-form-item>
      <el-form-item label="所属分类" prop="categoryId">
        <el-cascader
          v-model="form.categoryId"
          :options="categoryOptions"
          placeholder="请选择分类"
          :show-all-levels="true"
          :props="{ emitPath: false, checkStrictly: true, value: 'id', label: 'name' }"
          clearable
          style="width: 100%"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { createSite, updateSite, getAllCategoryTree } from '@/api/navigate'

export default {
  name: 'SiteDialog',
  props: {
    modelValue: Boolean,
    editData: {
      type: Object,
      default: null,
    },
  },
  emits: ['update:modelValue', 'success'],
  data() {
    return {
      form: {
        id: null,
        name: '',
        url: '',
        description: '',
        image: '',
        categoryId: null,
      },
      categoryOptions: [],
      submitting: false,
      rules: {
        name: [{ required: true, message: '请输入网站名称', trigger: 'blur' }],
        url: [{ required: true, message: '请输入网站地址', trigger: 'blur' }],
        categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
      },
    }
  },
  computed: {
    visible: {
      get() {
        return this.modelValue
      },
      set(val) {
        this.$emit('update:modelValue', val)
      },
    },
    isEdit() {
      return !!this.editData?.id
    },
  },
  watch: {
    modelValue(val) {
      if (val) {
        this.loadCategories()
        if (this.editData) {
          this.form = { ...this.editData }
        } else {
          this.resetForm()
        }
      }
    },
  },
  methods: {
    resetForm() {
      this.form = {
        id: null,
        name: '',
        url: '',
        description: '',
        image: '',
        categoryId: null,
      }
    },
    async loadCategories() {
      try {
        const res = await getAllCategoryTree()
        if (res.data.code === 200) {
          this.categoryOptions = res.data.data || []
        }
      } catch (e) {
        console.error('加载分类失败', e)
      }
    },
    handleClose() {
      this.visible = false
      this.resetForm()
      if (this.$refs.formRef) {
        this.$refs.formRef.resetFields()
      }
    },
    async handleSubmit() {
      if (!this.$refs.formRef) return
      await this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.submitting = true
        try {
          const api = this.isEdit ? updateSite : createSite
          const res = await api(this.form)
          if (res.data.code === 200) {
            this.$message.success(this.isEdit ? '更新成功' : '新增成功')
            this.$emit('success')
            this.handleClose()
          } else {
            this.$message.error(res.data.message || '操作失败')
          }
        } catch (e) {
          console.error('提交失败', e)
          this.$message.error('操作失败')
        } finally {
          this.submitting = false
        }
      })
    },
  },
}
</script>
