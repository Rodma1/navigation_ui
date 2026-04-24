<template>
  <div class="checkin-container">
    <!-- 页面头部 -->
    <div class="checkin-header">
      <h2>任务打卡记录</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增打卡
      </el-button>
    </div>

    <!-- 日期选择器 -->
    <div class="date-picker-container">
      <el-date-picker
        v-model="dateRange"
        type="datetimerange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :shortcuts="dateShortcuts"
        value-format="YYYY-MM-DD HH:mm:ss"
        @change="handleDateRangeChange"
      />
    </div>

    <!-- 打卡统计 -->
    <div class="checkin-stats">
      <div class="checkin-stats-title">打卡统计</div>
      <div class="checkin-stats-content">
        <div class="checkin-stats-item">
          <div class="checkin-stats-item-title">总打卡次数</div>
          <div class="checkin-stats-item-value">{{ statistics.totalCount }}</div>
        </div>
        <div class="checkin-stats-item">
          <div class="checkin-stats-item-title">完成打卡次数</div>
          <div class="checkin-stats-item-value">{{ statistics.completedCount }}</div>
        </div>
        <div class="checkin-stats-item">
          <div class="checkin-stats-item-title">完成率</div>
          <div class="checkin-stats-item-value">{{ statistics.completionRate }}%</div>
        </div>
      </div>
    </div>

    <!-- 打卡记录列表 -->
    <div class="checkin-list">
      <template v-if="checkinList.length === 0">
        <el-empty description="暂无打卡记录"></el-empty>
      </template>
      <template v-else>
        <el-card v-for="checkin in checkinList" :key="checkin.id" class="checkin-item">
          <div class="checkin-item-header">
            <span class="checkin-item-title">{{ checkin.taskPlanName }}</span>
            <div>
              <el-button type="primary" link @click="handleEdit(checkin)">编辑</el-button>
              <el-button type="danger" link @click="handleDelete(checkin)">删除</el-button>
            </div>
          </div>
          <div class="checkin-item-content">
            <p class="checkin-item-desc">{{ checkin.checkNote }}</p>
            <div class="checkin-item-info">
              <el-tag :type="checkin.checkStatus === '1' ? 'success' : 'warning'" size="small">
                {{ checkin.checkStatus === '1' ? '已完成' : '未完成' }}
              </el-tag>
              <span class="checkin-item-time">
                打卡时间：{{ formatDateTime(checkin.checkDate) }}
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
      :title="dialogType === 'add' ? '新增打卡' : '编辑打卡'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form
        ref="checkinFormRef"
        :model="checkinForm"
        :rules="checkinRules"
        label-width="80px"
        class="checkin-dialog-form"
      >
        <el-form-item label="任务计划" prop="taskId">
          <el-select
            v-model="checkinForm.taskId"
            placeholder="请选择任务计划"
            style="width: 100%"
            @change="handleTaskPlanChange"
          >
            <el-option
              v-for="task in taskPlanList"
              :key="task.id"
              :label="task.taskName"
              :value="task.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="打卡日期" prop="checkDate">
          <el-date-picker
            v-model="checkinForm.checkDate"
            type="datetime"
            placeholder="请选择打卡日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="打卡状态" prop="checkStatus">
          <el-select v-model="checkinForm.checkStatus" placeholder="请选择打卡状态" style="width: 100%">
            <el-option label="未完成" value="0" />
            <el-option label="已完成" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="打卡描述" prop="checkNote">
          <el-input
            v-model="checkinForm.checkNote"
            type="textarea"
            :rows="3"
            placeholder="请输入打卡描述"
          />
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
import {
  createTaskCheckIn,
  updateTaskCheckIn,
  deleteTaskCheckIn,
  getTaskCheckInStatistics,
  getTaskCheckInPage, getTaskPlanList
} from '@/api/task'

export default {
  name: 'CheckInList',
  components: {
    Plus
  },

  setup() {

    // 日期范围
    const dateRange = ref([])
    const dateShortcuts = [
      {
        text: '最近一周',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
          return [start, end]
        }
      },
      {
        text: '最近一个月',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
          return [start, end]
        }
      },
      {
        text: '最近三个月',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
          return [start, end]
        }
      }
    ]

    // 分页参数
    const page = reactive({
      current: 1,
      size: 10,
      total: 0
    })

    // 打卡记录列表
    const checkinList = ref([])

    // 任务计划列表
    const taskPlanList = ref([])

    // 统计数据
    const statistics = reactive({
      totalCount: 0,
      completedCount: 0,
      completionRate: 0
    })

    // 对话框相关
    const dialogVisible = ref(false)
    const dialogType = ref('add')
    const checkinFormRef = ref(null)
    const checkinForm = reactive({
      id: null,
      taskId: null,
      taskPlanName: '',
      checkDate: '',
      checkStatus: '0',
      checkNote: ''
    })
    

    // 表单校验规则
    const checkinRules = {
      taskId: [
        { required: true, message: '请选择任务计划', trigger: 'change' }
      ],
      checkDate: [
        { required: true, message: '请选择打卡日期', trigger: 'change' }
      ],

      checkStatus: [
        { required: true, message: '请选择打卡状态', trigger: 'change' }
      ]
    }

    // 获取打卡记录列表
    const getCheckinList = async () => {
      try {
        const res = await getTaskCheckInPage({
          current: page.current,
          size: page.size,
          userId: 1, // TODO: 从用户信息中获取
          startTime: dateRange.value?.[0],
          endTime: dateRange.value?.[1]
        })
        if (res.data.code === 200) {
          checkinList.value = res.data.data.records
          page.total = res.data.total
        } else {
          ElMessage.error(res.message || '获取打卡记录失败')
        }
      } catch (error) {
        console.error('获取打卡记录失败:', error)
        ElMessage.error('获取打卡记录失败')
      }
    }

    // 获取任务计划列表
    const getPlanList = async () => {
      try {
        const res = await getTaskPlanList({
          userId: 1, // TODO: 从用户信息中获取
          taskType: null
        })
        if (res.data.code === 200) {
          taskPlanList.value = res.data.data
        } else {
          ElMessage.error(res.message || '获取任务计划列表失败')
        }
      } catch (error) {
        console.error('获取任务计划列表失败:', error)
        ElMessage.error('获取任务计划列表失败')
      }
    }

    // 获取打卡统计
    const getStatistics = async () => {
      try {
        const res = await getTaskCheckInStatistics({
          userId: 1, // TODO: 从用户信息中获取
          startTime: dateRange.value?.[0],
          endTime: dateRange.value?.[1]
        })
        console.info('打卡统计:', res)
        if (res.data.code === 200) {
          const stats = res.data.data
          let totalCount = 0
          let completedCount = 0
          
          Object.values(stats).forEach(dayStats => {
            totalCount += dayStats.totalCount
            completedCount += dayStats.completedCount
          })
          
          statistics.totalCount = totalCount
          statistics.completedCount = completedCount
          statistics.completionRate = totalCount > 0
            ? Math.round((completedCount / totalCount) * 100)
            : 0
        } else {
          ElMessage.error(res.message || '获取打卡统计失败')
        }
      } catch (error) {
        console.error('获取打卡统计失败:', error)
        ElMessage.error('获取打卡统计失败')
      }
    }

    // 日期范围改变
    const handleDateRangeChange = () => {
      page.current = 1
      getCheckinList()
      getStatistics()
    }

    // 分页大小改变
    const handleSizeChange = (val) => {
      page.size = val
      getCheckinList()
    }

    // 当前页改变
    const handleCurrentChange = (val) => {
      page.current = val
      getCheckinList()
    }

    // 新增打卡
    const handleAdd = () => {
      dialogType.value = 'add'
      Object.assign(checkinForm, {
        id: null,
        taskId: null,
        taskPlanName: '',
        checkDate: new Date().toISOString().split('T')[0],
        checkStatus: '0',
        checkNote: ''
      })
      dialogVisible.value = true
    }

    // 编辑打卡
    const handleEdit = (checkin) => {
      dialogType.value = 'edit'
      Object.assign(checkinForm, checkin)
      dialogVisible.value = true
    }

    // 删除打卡
    const handleDelete = (checkin) => {
      ElMessageBox.confirm(
        '确定要删除该打卡记录吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        try {
          const res = await deleteTaskCheckIn(checkin.id)
          if (res.code === 200) {
            ElMessage.success('删除成功')
            getCheckinList()
            getStatistics()
          } else {
            ElMessage.error(res.message || '删除失败')
          }
        } catch (error) {
          console.error('删除打卡记录失败:', error)
          ElMessage.error('删除打卡记录失败')
        }
      }).catch(() => {})
    }

    // 任务计划改变
    const handleTaskPlanChange = (taskId) => {
      const taskPlan = taskPlanList.value.find(task => task.id === taskId)
      if (taskPlan) {
        checkinForm.taskPlanName = taskPlan.taskName
      }
    }

    // 提交表单
    const handleSubmit = async () => {
      if (!checkinFormRef.value) return
      
      await checkinFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            const api = dialogType.value === 'add' ? createTaskCheckIn : updateTaskCheckIn
            const res = await api(checkinForm)
            
            if (res.data.code === 200) {
              ElMessage.success(dialogType.value === 'add' ? '新增成功' : '更新成功')
              dialogVisible.value = false
              await getCheckinList()
              await getStatistics()
            } else {
              ElMessage.error(res.data.message || (dialogType.value === 'add' ? '新增失败' : '更新失败'))
            }
          } catch (error) {
            console.error(dialogType.value === 'add' ? '新增打卡记录失败:' : '更新打卡记录失败:', error)
            ElMessage.error(dialogType.value === 'add' ? '新增打卡记录失败' : '更新打卡记录失败')
          }
        }
      })
    }

    // 格式化日期时间
    const formatDateTime = (datetime) => {
      if (!datetime) return ''
      return datetime.replace('T', ' ').split('.')[0]
    }
    const initDateRange = () => {
      const start = new Date()
      start.setHours(0, 0, 0, 0)

      const end = new Date()
      end.setHours(23, 59, 59, 999)

      dateRange.value = [
        start.toISOString().slice(0, 19).replace('T', ' '),
        end.toISOString().slice(0, 19).replace('T', ' ')
      ]
    }



    // 页面加载时获取数据
    onMounted(() => {
      initDateRange()
      getCheckinList()
      getPlanList()
      getStatistics()
    })

    return {
      dateRange,
      dateShortcuts,
      page,
      checkinList,
      taskPlanList,
      statistics,
      dialogVisible,
      dialogType,
      checkinFormRef,
      checkinForm,
      checkinRules,
      handleDateRangeChange,
      handleSizeChange,
      handleCurrentChange,
      handleAdd,
      handleEdit,
      handleDelete,
      handleTaskPlanChange,
      handleSubmit,
      formatDateTime
    }
  }
}

</script>

<style scoped>
.checkin-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
}

.checkin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.date-picker-container {
  margin-bottom: 20px;
}

.checkin-stats {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.checkin-stats-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
}

.checkin-stats-content {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.checkin-stats-item {
  flex: 1;
  min-width: 200px;
  padding: 15px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.checkin-stats-item-title {
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
}

.checkin-stats-item-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.checkin-list {
  margin-top: 20px;
}

.checkin-item {
  margin-bottom: 20px;
}

.checkin-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.checkin-item-title {
  font-size: 16px;
  font-weight: bold;
}

.checkin-item-content {
  color: #666;
}

.checkin-item-desc {
  margin: 10px 0;
}

.checkin-item-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.checkin-item-time {
  color: #999;
  font-size: 14px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.checkin-dialog-form {
  padding: 20px;
}

.checkin-dialog-form .el-form-item {
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .checkin-container {
    padding: 12px;
  }

  .checkin-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .checkin-stats-item {
    min-width: 120px;
  }

  .checkin-item-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .pagination-container {
    text-align: center;
  }

  .checkin-dialog-form {
    padding: 10px;
  }
}
</style> 