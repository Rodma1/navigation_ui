<template>
  <el-dialog
    :title="parentId ? '新增子分类' : '新增分类'"
    v-model="visible"
    width="420px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入分类名称" />
      </el-form-item>
      <el-form-item label="图标" prop="icon">
        <el-input v-model="form.icon" placeholder="图标名称（选填）" />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="form.sort" :min="0" :max="999" style="width: 100%" />
      </el-form-item>
      <el-form-item label="父分类" prop="parentId">
        <el-cascader
          v-model="form.parentId"
          :options="categoryOptions"
          placeholder="无（顶级分类）"
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
import { createCategory, getAllCategoryTree } from '@/api/navigate'

export default {
  name: 'CategoryDialog',
  props: {
    modelValue: Boolean,
    parentId: {
      type: Number,
      default: null,
    },
  },
  emits: ['update:modelValue', 'success'],
  data() {
    return {
      form: {
        name: '',
        icon: '',
        sort: 0,
        parentId: null,
      },
      categoryOptions: [],
      submitting: false,
      rules: {
        name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
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
  },
  watch: {
    modelValue(val) {
      if (val) {
        this.loadCategories()
        this.form.parentId = this.parentId
        if (!this.parentId) {
          this.form = { name: '', icon: '', sort: 0, parentId: null }
        }
      }
    },
  },
  methods: {
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
      this.form = { name: '', icon: '', sort: 0, parentId: null }
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
          const res = await createCategory(this.form)
          if (res.data.code === 200) {
            this.$message.success('新增分类成功')
            this.$emit('success')
            this.handleClose()
          } else {
            this.$message.error(res.data.message || '新增分类失败')
          }
        } catch (e) {
          console.error('新增分类失败', e)
          this.$message.error('新增分类失败')
        } finally {
          this.submitting = false
        }
      })
    },
  },
}
</script>
