<template>
  <div class="plan-container">
    <!-- 页面头部 -->
    <div class="plan-header">
      <h2>任务计划管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增任务
      </el-button>
    </div>

    <!-- 任务类型切换 -->
    <div class="task-type-switch">
      <el-radio-group v-model="taskType" @change="handleTaskTypeChange">
        <el-radio-button label="1">考研任务</el-radio-button>
        <el-radio-button label="2">找工作任务</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 任务列表 -->
    <div class="plan-list">
      <template v-if="planList.length === 0">
        <el-empty description="暂无任务计划"></el-empty>
      </template>
      <template v-else>
        <el-card v-for="plan in planList" :key="plan.id" class="plan-item">
          <template #header>
            <div class="plan-item-header">
              <span class="plan-item-title">{{ plan.taskName }}</span>
              <div>
                <el-button type="primary" link @click="handleEdit(plan)">编辑</el-button>
                <el-button type="danger" link @click="handleDelete(plan)">删除</el-button>
              </div>
            </div>
          </template>
          <div class="plan-item-content">
            <p class="plan-item-desc">{{ plan.taskContent }}</p>
            <div class="plan-item-info">
              <el-tag :type="plan.taskStatus === '1' ? 'success' : 'warning'" size="small">
                {{ plan.taskStatus === '1' ? '进行中' : '已暂停' }}
              </el-tag>
              <span class="plan-item-time">
                开始时间：{{ formatDate(plan.startTime) }}
                <template v-if="plan.endTime">
                  - {{ formatDate(plan.endTime) }}
                </template>
              </span>
            </div>
          </div>
        </el-card>
      </template>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        :current-page="page.current"
        :page-size="page.size"
        :total="page.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增任务' : '编辑任务'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form
        ref="planFormRef"
        :model="planForm"
        :rules="planRules"
        label-width="80px"
        class="plan-dialog-form"
      >
        <el-form-item label="任务名称" prop="taskName">
          <el-input v-model="planForm.taskName" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务描述" prop="taskContent">
          <el-input
            v-model="planForm.taskContent"
            type="textarea"
            :rows="3"
            placeholder="请输入任务描述"
          />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="planForm.startTime"
            type="date"
            placeholder="请选择开始时间"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="planForm.endTime"
            type="date"
            placeholder="请选择结束时间"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="任务状态" prop="taskStatus">
          <el-select v-model="planForm.taskStatus" placeholder="请选择任务状态" style="width: 100%">
            <el-option label="进行中" value="1" />
            <el-option label="已暂停" value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {createTaskPlan, updateTaskPlan, deleteTaskPlan, getTaskPlanPage} from '@/api/task'

export default {
  name: 'PlanList',
  components: {
    Plus
  },
  setup() {
    // 任务类型
    const taskType = ref('1')

    // 分页参数
    const page = reactive({
      current: 1,
      size: 10,
      total: 0
    })

    // 任务列表
    const planList = ref([])

    // 对话框相关
    const dialogVisible = ref(false)
    const dialogType = ref('add')
    const planFormRef = ref(null)
    const planForm = reactive({
      id: null,
      taskName: '',
      taskContent: '',
      taskType: '1',
      startTime: '',
      endTime: '',
      taskStatus: '1'
    })

    // 表单校验规则
    const planRules = {
      taskName: [
        { required: true, message: '请输入任务名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
      ],
      taskContent: [
        { required: true, message: '请输入任务描述', trigger: 'blur' }
      ],
      startTime: [
        { required: true, message: '请选择开始时间', trigger: 'change' }
      ],
      taskStatus: [
        { required: true, message: '请选择任务状态', trigger: 'change' }
      ]
    }

    // 获取任务列表
    const getPlanList = async () => {
      try {
        const res = await getTaskPlanPage({
          current: page.current,
          size: page.size,
          userId: 1, // TODO: 从用户信息中获取
          taskType: taskType.value
        })
        if (res.data.code === 200) {
          planList.value = res.data.data.records
          page.total = res.data.total
        } else {
          ElMessage.error(res.message || '获取任务列表失败')
        }
      } catch (error) {
        console.error('获取任务列表失败:', error)
        ElMessage.error('获取任务列表失败')
      }
    }

    // 任务类型改变
    const handleTaskTypeChange = () => {
      page.current = 1
      getPlanList()
    }

    // 分页大小改变
    const handleSizeChange = (val) => {
      page.size = val
      getPlanList()
    }

    // 当前页改变
    const handleCurrentChange = (val) => {
      page.current = val
      getPlanList()
    }

    // 新增任务
    const handleAdd = () => {
      dialogType.value = 'add'
      Object.assign(planForm, {
        id: null,
        taskName: '',
        taskContent: '',
        taskType: taskType.value,
        startTime: '',
        endTime: '',
        taskStatus: '1'
      })
      dialogVisible.value = true
    }

    // 编辑任务
    const handleEdit = (plan) => {
      dialogType.value = 'edit'
      Object.assign(planForm, plan)
      dialogVisible.value = true
    }

    // 删除任务
    const handleDelete = (plan) => {
      ElMessageBox.confirm(
        '确定要删除该任务吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        try {
          const res = await deleteTaskPlan(plan.id)
          if (res.data.code === 200) {
            ElMessage.success('删除成功')
            getPlanList()
          } else {
            ElMessage.error(res.message || '删除失败')
          }
        } catch (error) {
          console.error('删除任务失败:', error)
          ElMessage.error('删除任务失败')
        }
      }).catch(() => {})
    }

    // 提交表单
    const handleSubmit = async () => {
      if (!planFormRef.value) return
      
      await planFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            const api = dialogType.value === 'add' ? createTaskPlan : updateTaskPlan
            const res = await api(planForm)
            
            if (res.data.code === 200) {
              ElMessage.success(dialogType.value === 'add' ? '新增成功' : '更新成功')
              dialogVisible.value = false
              await getPlanList()
            } else {
              ElMessage.error(res.message || (dialogType.value === 'add' ? '新增失败' : '更新失败'))
            }
          } catch (error) {
            console.error(dialogType.value === 'add' ? '新增任务失败:' : '更新任务失败:', error)
            ElMessage.error(dialogType.value === 'add' ? '新增任务失败' : '更新任务失败')
          }
        }
      })
    }

    // 格式化日期
    const formatDate = (date) => {
      if (!date) return ''
      return date
    }

    // 页面加载时获取数据
    onMounted(() => {
      getPlanList()
    })

    return {
      taskType,
      page,
      planList,
      dialogVisible,
      dialogType,
      planFormRef,
      planForm,
      planRules,
      handleTaskTypeChange,
      handleSizeChange,
      handleCurrentChange,
      handleAdd,
      handleEdit,
      handleDelete,
      handleSubmit,
      formatDate
    }
  }
}
</script>

<style scoped>
.plan-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.task-type-switch {
  margin-bottom: 20px;
}

.plan-list {
  margin-top: 20px;
}

.plan-item {
  margin-bottom: 20px;
}

.plan-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-item-title {
  font-size: 16px;
  font-weight: bold;
}

.plan-item-content {
  color: #666;
}

.plan-item-desc {
  margin: 10px 0;
}

.plan-item-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.plan-item-time {
  color: #999;
  font-size: 14px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.plan-dialog-form {
  padding: 20px;
}

.plan-dialog-form .el-form-item {
  margin-bottom: 20px;
}
</style> 