<template>
  <div class="task-container">
    <div class="task-tabs">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="task-tab"
        :class="{ 'task-tab--active': activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <el-icon><component :is="tab.icon" /></el-icon>
        {{ tab.label }}
      </div>
    </div>

    <!-- 今日打卡 -->
    <div v-if="activeTab === 'today'" class="tab-content">
      <!-- 日期导航 -->
      <div class="date-nav">
        <el-button :icon="ArrowLeft" circle @click="changeDate(-1)" />
        <span class="date-nav-text" @click="goToday">
          {{ formatDateCN(currentDate) }}
          <span v-if="isToday" class="today-badge">今天</span>
        </span>
        <el-button :icon="ArrowRight" circle @click="changeDate(1)" />
      </div>

      <!-- 统计条 -->
      <div class="stats-bar">
        <div class="stats-item">
          <el-icon color="#10B981"><CircleCheck /></el-icon>
          <span>连续打卡 <strong>{{ calendarData.streak || 0 }}</strong> 天</span>
        </div>
        <div class="stats-item">
          <el-icon color="#4F6EF7"><Finished /></el-icon>
          <span>今日 <strong>{{ todayCheckedCount }}</strong>/{{ todayTasks.length }} 已完成</span>
        </div>
        <div class="stats-item stats-progress">
          <el-progress
            :percentage="todayProgress"
            :stroke-width="8"
            :show-text="false"
            color="#10B981"
          />
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-wrapper">
        <el-skeleton :rows="3" animated />
      </div>

      <!-- 任务列表 -->
      <div v-else-if="todayTasks.length === 0" class="empty-tip">
        <el-empty description="今天没有待执行的任务">
          <el-button type="primary" @click="activeTab = 'manage'">去创建任务</el-button>
        </el-empty>
      </div>
      <div v-else class="today-list">
        <div
          v-for="task in todayTasks"
          :key="task.taskId"
          class="today-card"
          :class="{ 'today-card--checked': task.checked }"
        >
          <div class="today-card-main">
            <div class="today-card-left">
              <span class="today-card-name">{{ task.taskName }}</span>
              <span v-if="task.startTime" class="today-card-time">
                {{ formatPlanDateRange(task.startTime, task.endTime) }}
              </span>
              <span v-if="task.checked && (task.actualStartTime || task.actualEndTime)" class="today-card-actual-time">
                实际：{{ task.actualStartTime || '' }}{{ task.actualStartTime && task.actualEndTime ? ' - ' : '' }}{{ task.actualEndTime || '' }}
              </span>
            </div>
            <div class="today-card-right">
              <template v-if="!task.checked">
                <el-button type="success" round size="small" @click="handleQuickCheckIn(task)">
                  打卡
                </el-button>
                <el-button text size="small" @click="toggleExpand(task.taskId)">
                  {{ expandedTasks[task.taskId] ? '收起' : '备注' }}
                </el-button>
              </template>
              <template v-else>
                <el-tag :type="task.checkStatus === '1' ? 'success' : task.checkStatus === '2' ? 'warning' : 'info'" size="small" effect="plain">
                  {{ checkStatusText(task.checkStatus) }}
                </el-tag>
                <el-button text size="small" @click="toggleExpand(task.taskId)">详情</el-button>
              </template>
            </div>
          </div>
          <!-- 展开备注 -->
          <div v-if="expandedTasks[task.taskId]" class="today-card-expand">
            <template v-if="!task.checked">
              <div class="expand-row-fields">
                <el-select v-model="quickForm.checkStatus" size="small" style="width: 120px;">
                  <el-option label="已完成" value="1" />
                  <el-option label="部分完成" value="2" />
                  <el-option label="未完成" value="0" />
                </el-select>
                <div class="expand-time-pick">
                  <el-time-select v-model="quickForm.actualStartTime" placeholder="实际开始" :max-time="quickForm.actualEndTime" start="06:00" step="00:30" end="23:30" size="small" />
                  <span class="expand-time-sep">-</span>
                  <el-time-select v-model="quickForm.actualEndTime" placeholder="实际结束" :min-time="quickForm.actualStartTime" start="06:00" step="00:30" end="23:30" size="small" />
                </div>
              </div>
              <el-input
                v-model="quickForm.checkNote"
                type="textarea"
                :rows="2"
                placeholder="打卡备注（可选）"
                size="small"
              />
              <div style="margin-top: 8px; text-align: right;">
                <el-button type="primary" size="small" @click="handleQuickCheckIn(task)">确认打卡</el-button>
              </div>
            </template>
            <template v-else>
              <div class="expand-row-fields">
                <el-select v-model="editForm.checkStatus" size="small" style="width: 120px;">
                  <el-option label="已完成" value="1" />
                  <el-option label="部分完成" value="2" />
                  <el-option label="未完成" value="0" />
                </el-select>
                <div class="expand-time-pick">
                  <el-time-select v-model="editForm.actualStartTime" placeholder="实际开始" :max-time="editForm.actualEndTime" start="06:00" step="00:30" end="23:30" size="small" />
                  <span class="expand-time-sep">-</span>
                  <el-time-select v-model="editForm.actualEndTime" placeholder="实际结束" :min-time="editForm.actualStartTime" start="06:00" step="00:30" end="23:30" size="small" />
                </div>
              </div>
              <el-input
                v-model="editForm.checkNote"
                type="textarea"
                :rows="2"
                placeholder="打卡备注（可选）"
                size="small"
              />
              <div style="margin-top: 8px; text-align: right; display: flex; justify-content: flex-end; gap: 8px;">
                <el-button type="primary" size="small" @click="handleUpdateCheckIn(task)">保存修改</el-button>
                <el-button type="danger" text size="small" @click="handleCancelCheckIn(task)">取消打卡</el-button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 打卡日历 -->
    <div v-if="activeTab === 'calendar'" class="tab-content">
      <div class="calendar-header">
        <el-button :icon="ArrowLeft" circle @click="changeMonth(-1)" />
        <span class="calendar-month">{{ calendarMonth }}月打卡日历</span>
        <el-button :icon="ArrowRight" circle @click="changeMonth(1)" />
      </div>

      <!-- 日历网格 -->
      <div class="calendar-grid">
        <div class="calendar-weekdays">
          <span v-for="d in weekdays" :key="d" class="calendar-weekday">{{ d }}</span>
        </div>
        <div class="calendar-days">
          <div
            v-for="(cell, idx) in calendarCells"
            :key="idx"
            class="calendar-cell"
            :class="{
              'calendar-cell--empty': !cell,
              'calendar-cell--today': cell && cell.isToday,
              'calendar-cell--selected': cell && cell.date === selectedCalendarDate
            }"
            @click="cell && selectCalendarDay(cell.date)"
          >
            <template v-if="cell">
              <span class="calendar-day-num">{{ cell.day }}</span>
              <div
                v-if="cell.stat"
                class="calendar-day-dot"
                :style="{ backgroundColor: getHeatColor(cell.stat.completionRate) }"
              ></div>
            </template>
          </div>
        </div>
      </div>

      <!-- 选中日期的详情 -->
      <div v-if="selectedCalendarDate" class="calendar-detail">
        <div class="calendar-detail-header">
          <span>{{ selectedCalendarDate }} 打卡详情</span>
          <el-button text size="small" @click="selectedCalendarDate = null">关闭</el-button>
        </div>
        <div v-if="calendarDetailLoading" style="padding: 12px;">
          <el-skeleton :rows="2" animated />
        </div>
        <div v-else-if="calendarDetailTasks.length === 0" class="empty-tip" style="padding: 12px 0;">
          <el-text type="info">当天无打卡记录</el-text>
        </div>
        <div v-else class="calendar-detail-list">
          <div v-for="task in calendarDetailTasks" :key="task.taskId" class="detail-item">
            <el-tag :type="task.checked && task.checkStatus === '1' ? 'success' : 'info'" size="small" effect="plain">
              {{ task.checked ? checkStatusText(task.checkStatus) : '未打卡' }}
            </el-tag>
            <span class="detail-name">{{ task.taskName }}</span>
          </div>
        </div>
      </div>

      <!-- 图例 -->
      <div class="calendar-legend">
        <span class="legend-label">少</span>
        <span class="legend-dot" style="background-color: #ebedf0;"></span>
        <span class="legend-dot" style="background-color: #9be9a8;"></span>
        <span class="legend-dot" style="background-color: #40c463;"></span>
        <span class="legend-dot" style="background-color: #30a14e;"></span>
        <span class="legend-dot" style="background-color: #216e39;"></span>
        <span class="legend-label">多</span>
      </div>
    </div>

    <!-- 任务管理 -->
    <div v-if="activeTab === 'manage'" class="tab-content">
      <div class="manage-header">
        <div class="manage-filters">
          <el-radio-group v-model="taskType" @change="loadPlanList" size="small">
            <el-radio-button label="1">学习</el-radio-button>
            <el-radio-button label="2">找工作</el-radio-button>
            <el-radio-button label="3">生活</el-radio-button>
          </el-radio-group>
          <el-radio-group v-model="statusFilter" @change="loadPlanList" size="small">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="1">进行中</el-radio-button>
            <el-radio-button label="0">已暂停</el-radio-button>
            <el-radio-button label="2">已结束</el-radio-button>
          </el-radio-group>
        </div>
        <el-button type="primary" size="small" @click="handleAddPlan">
          <el-icon><Plus /></el-icon>新增任务
        </el-button>
      </div>

      <!-- 统计面板 -->
      <div class="stats-panel">
        <div class="stats-panel-header">
          <span class="stats-panel-title">任务统计</span>
          <el-date-picker
            v-model="statsDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            size="small"
            style="width: 240px;"
            @change="loadPlanStats"
          />
        </div>
        <div class="stats-panel-cards">
          <div class="stats-panel-card">
            <div class="stats-panel-card-value">{{ planStats.totalCount }}</div>
            <div class="stats-panel-card-label">总任务数</div>
          </div>
          <div class="stats-panel-card">
            <div class="stats-panel-card-value">{{ planStats.totalCheckInCount }}</div>
            <div class="stats-panel-card-label">总打卡次数</div>
          </div>
          <div class="stats-panel-card">
            <div class="stats-panel-card-value">{{ planStats.completedCount }}</div>
            <div class="stats-panel-card-label">已完成次数</div>
          </div>
          <div class="stats-panel-card">
            <div class="stats-panel-card-value">{{ planStats.completionRate }}%</div>
            <div class="stats-panel-card-label">完成率</div>
          </div>
        </div>
      </div>

      <div v-if="planLoading" class="loading-wrapper">
        <el-skeleton :rows="3" animated />
      </div>
      <div v-else-if="planList.length === 0" class="empty-tip">
        <el-empty description="暂无任务计划" />
      </div>
      <div v-else class="plan-list">
        <div v-for="plan in planList" :key="plan.id" class="plan-card">
          <div class="plan-card-main">
            <div class="plan-card-left">
              <span class="plan-card-name">{{ plan.taskName }}</span>
              <span v-if="plan.startTime" class="plan-card-time">{{ formatPlanDateRange(plan.startTime, plan.endTime) }}</span>
            </div>
            <div class="plan-card-right">
              <el-tag :type="plan.status === '1' ? 'success' : plan.status === '2' ? 'info' : 'warning'" size="small" effect="plain">
                {{ plan.status === '1' ? '进行中' : plan.status === '2' ? '已结束' : '已暂停' }}
              </el-tag>
              <el-button type="primary" text size="small" @click="handleEditPlan(plan)">编辑</el-button>
              <el-button type="danger" text size="small" @click="handleDeletePlan(plan)">删除</el-button>
            </div>
          </div>
          <div v-if="plan.taskContent" class="plan-card-desc">{{ plan.taskContent }}</div>
          <div v-if="plan.weekDay" class="plan-card-week">
            <el-tag v-for="d in plan.weekDay.split(',')" :key="d" size="small" effect="plain" style="margin-right: 4px;">
              {{ weekDayMap[d.trim()] || d }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="planTotal > planPageSize" class="pagination-container">
        <el-pagination
          :current-page="planPage"
          :page-size="planPageSize"
          :total="planTotal"
          layout="prev, pager, next"
          @current-change="handlePlanPageChange"
          small
        />
      </div>

      <!-- 新增/编辑对话框 -->
      <el-dialog
        :title="planDialogType === 'add' ? '新增任务' : '编辑任务'"
        v-model="planDialogVisible"
        width="480px"
      >
        <el-form ref="planFormRef" :model="planForm" :rules="planRules" label-width="80px">
          <el-form-item label="任务名称" prop="taskName">
            <el-input v-model="planForm.taskName" placeholder="请输入任务名称" />
          </el-form-item>
          <el-form-item label="任务描述" prop="taskContent">
            <el-input v-model="planForm.taskContent" type="textarea" :rows="2" placeholder="请输入任务描述" />
          </el-form-item>
          <el-form-item label="执行星期">
            <el-checkbox-group v-model="planForm.weekDayList">
              <el-checkbox v-for="(label, key) in weekDayMap" :key="key" :label="key">{{ label }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="开始日期">
            <el-date-picker
              v-model="planForm.startTime"
              type="date"
              placeholder="选择开始日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="完成日期">
            <div style="display: flex; align-items: center; gap: 8px; width: 100%;">
              <el-date-picker
                v-model="planForm.endTime"
                type="date"
                placeholder="选择完成日期"
                value-format="YYYY-MM-DD"
                style="flex: 1"
                :disabled="planForm.ongoing"
              />
              <el-switch v-model="planForm.ongoing" active-text="一直持续" />
            </div>
          </el-form-item>
          <el-form-item label="任务状态" prop="status">
            <el-select v-model="planForm.status" style="width: 100%">
              <el-option label="进行中" value="1" />
              <el-option label="已暂停" value="0" />
              <el-option label="已结束" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="planForm.sort" :min="0" :max="999" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="planDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitPlan">确定</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowLeft, ArrowRight, CircleCheck, Finished, Calendar, List, Setting } from '@element-plus/icons-vue'
import {
  getTodayTasks,
  quickCheckIn,
  updateCheckIn,
  deleteCheckIn,
  getCalendarStats,
  getTaskPlanPage,
  createTaskPlan,
  updateTaskPlan,
  deleteTaskPlan,
  getPlanStats
} from '@/api/task'

export default {
  name: 'TaskView',
  components: { Plus, ArrowLeft, ArrowRight, CircleCheck, Finished, Calendar, List, Setting },
  setup() {
    const weekDayMap = { '1': '周一', '2': '周二', '3': '周三', '4': '周四', '5': '周五', '6': '周六', '7': '周日' }
    const weekdays = ['一', '二', '三', '四', '五', '六', '日']

    // === 通用 ===
    const activeTab = ref('today')
    const tabs = [
      { key: 'today', label: '今日打卡', icon: 'CircleCheck' },
      { key: 'calendar', label: '打卡日历', icon: 'Calendar' },
      { key: 'manage', label: '任务管理', icon: 'Setting' }
    ]

    // === 今日打卡 ===
    const currentDate = ref(new Date().toISOString().slice(0, 10))
    const todayTasks = ref([])
    const loading = ref(false)
    const expandedTasks = reactive({})
    const quickForm = reactive({ checkStatus: '1', checkNote: '', actualStartTime: '', actualEndTime: '' })
    const editForm = reactive({ checkStatus: '1', checkNote: '', actualStartTime: '', actualEndTime: '' })
    const calendarData = reactive({ streak: 0 })

    const isToday = computed(() => currentDate.value === new Date().toISOString().slice(0, 10))
    const todayCheckedCount = computed(() => todayTasks.value.filter(t => t.checked && t.checkStatus === '1').length)
    const todayProgress = computed(() => {
      if (todayTasks.value.length === 0) return 0
      return Math.round((todayCheckedCount.value / todayTasks.value.length) * 100)
    })

    const loadTodayTasks = async () => {
      loading.value = true
      try {
        const res = await getTodayTasks(currentDate.value)
        if (res.data.code === 200) {
          todayTasks.value = res.data.data || []
        }
      } catch (e) {
        console.error('加载今日任务失败', e)
      }
      loading.value = false
    }

    const changeDate = (delta) => {
      const d = new Date(currentDate.value)
      d.setDate(d.getDate() + delta)
      currentDate.value = d.toISOString().slice(0, 10)
      Object.keys(expandedTasks).forEach(k => delete expandedTasks[k])
    }

    const goToday = () => {
      currentDate.value = new Date().toISOString().slice(0, 10)
    }

    const toggleExpand = (taskId) => {
      expandedTasks[taskId] = !expandedTasks[taskId]
      if (expandedTasks[taskId]) {
        quickForm.checkStatus = '1'
        quickForm.checkNote = ''
        quickForm.actualStartTime = ''
        quickForm.actualEndTime = ''
        const task = todayTasks.value.find(t => t.taskId === taskId)
        if (task && task.checked) {
          editForm.checkStatus = task.checkStatus || '1'
          editForm.checkNote = task.checkNote || ''
          editForm.actualStartTime = task.actualStartTime || ''
          editForm.actualEndTime = task.actualEndTime || ''
        }
      }
    }

    const handleUpdateCheckIn = async (task) => {
      try {
        const res = await updateCheckIn({
          id: task.checkInId,
          taskId: task.taskId,
          checkStatus: editForm.checkStatus,
          checkNote: editForm.checkNote,
          actualStartTime: editForm.actualStartTime || null,
          actualEndTime: editForm.actualEndTime || null
        })
        if (res.data.code === 200) {
          ElMessage.success('修改成功')
          await loadTodayTasks()
          delete expandedTasks[task.taskId]
        } else {
          ElMessage.error(res.data.message || '修改失败')
        }
      } catch (e) {
        console.error('修改打卡失败', e)
      }
    }

    const handleQuickCheckIn = async (task) => {
      try {
        const data = {
          taskId: task.taskId,
          checkDate: currentDate.value,
          checkStatus: quickForm.checkStatus,
          checkNote: quickForm.checkNote,
          actualStartTime: quickForm.actualStartTime || null,
          actualEndTime: quickForm.actualEndTime || null
        }
        const res = await quickCheckIn(data)
        if (res.data.code === 200) {
          ElMessage.success('打卡成功')
          await loadTodayTasks()
          delete expandedTasks[task.taskId]
        } else {
          ElMessage.error(res.data.message || '打卡失败')
        }
      } catch (e) {
        console.error('打卡失败', e)
      }
    }

    const handleCancelCheckIn = async (task) => {
      try {
        await ElMessageBox.confirm('确定取消该打卡记录？', '提示', { type: 'warning' })
        const res = await deleteCheckIn(task.checkInId)
        if (res.data.code === 200) {
          ElMessage.success('已取消打卡')
          await loadTodayTasks()
        }
      } catch {
        // user cancelled
      }
    }

    const checkStatusText = (status) => {
      if (status === '1') return '已完成'
      if (status === '2') return '部分完成'
      return '未完成'
    }

    const formatPlanDateRange = (startTime, endTime) => {
      if (!startTime) return ''
      if (!endTime) return startTime + ' 起'
      return startTime + ' 至 ' + endTime
    }

    const formatDateCN = (dateStr) => {
      const d = new Date(dateStr)
      const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${weekNames[d.getDay()]}`
    }

    watch(currentDate, loadTodayTasks)

    // === 打卡日历 ===
    const calendarMonth = ref(new Date().toISOString().slice(0, 7))
    const calendarCells = ref([])
    const selectedCalendarDate = ref(null)
    const calendarDetailTasks = ref([])
    const calendarDetailLoading = ref(false)

    const loadCalendar = async () => {
      try {
        const res = await getCalendarStats(calendarMonth.value)
        if (res.data.code === 200) {
          const data = res.data.data
          calendarData.streak = data.streak || 0
          buildCalendarCells(data.dayStats || [])
        }
      } catch (e) {
        console.error('加载日历失败', e)
      }
    }

    const buildCalendarCells = (dayStats) => {
      const [year, month] = calendarMonth.value.split('-').map(Number)
      const firstDay = new Date(year, month - 1, 1)
      const lastDay = new Date(year, month, 0).getDate()
      // 周一为第一天
      let startDow = firstDay.getDay() - 1
      if (startDow < 0) startDow = 6

      const statMap = {}
      dayStats.forEach(s => { statMap[s.date] = s })

      const cells = []
      for (let i = 0; i < startDow; i++) cells.push(null)
      for (let d = 1; d <= lastDay; d++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        cells.push({
          day: d,
          date: dateStr,
          isToday: dateStr === new Date().toISOString().slice(0, 10),
          stat: statMap[dateStr] || null
        })
      }
      calendarCells.value = cells
    }

    const changeMonth = (delta) => {
      const [y, m] = calendarMonth.value.split('-').map(Number)
      const d = new Date(y, m - 1 + delta, 1)
      calendarMonth.value = d.toISOString().slice(0, 7)
    }

    const selectCalendarDay = async (date) => {
      selectedCalendarDate.value = date
      calendarDetailLoading.value = true
      try {
        const res = await getTodayTasks(date)
        if (res.data.code === 200) {
          calendarDetailTasks.value = res.data.data || []
        }
      } catch (e) {
        console.error('加载日期详情失败', e)
      }
      calendarDetailLoading.value = false
    }

    const getHeatColor = (rate) => {
      if (!rate || rate === 0) return '#ebedf0'
      if (rate < 25) return '#9be9a8'
      if (rate < 50) return '#40c463'
      if (rate < 75) return '#30a14e'
      return '#216e39'
    }

    watch(calendarMonth, loadCalendar)

    // === 任务管理 ===
    const taskType = ref('1')
    const statusFilter = ref('')
    const planList = ref([])
    const planLoading = ref(false)
    const planPage = ref(1)
    const planPageSize = 20
    const planTotal = ref(0)
    const planDialogVisible = ref(false)
    const planDialogType = ref('add')
    const planFormRef = ref(null)
    const planForm = reactive({
      id: null,
      taskName: '',
      taskContent: '',
      taskType: '1',
      startTime: '',
      endTime: '',
      ongoing: false,
      weekDayList: [],
      status: '1',
      sort: 0
    })
    watch(() => planForm.ongoing, (val) => {
      if (val) {
        planForm.endTime = ''
      }
    })
    const planRules = {
      taskName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
      status: [{ required: true, message: '请选择状态', trigger: 'change' }]
    }
    const statsDateRange = ref([])
    const planStats = reactive({ totalCount: 0, totalCheckInCount: 0, completedCount: 0, completionRate: 0 })

    const loadPlanList = async () => {
      planLoading.value = true
      loadPlanStats()
      try {
        const params = {
          current: planPage.value,
          size: planPageSize,
          userId: 1,
          taskType: taskType.value
        }
        if (statusFilter.value) {
          params.status = statusFilter.value
        }
        const res = await getTaskPlanPage(params)
        if (res.data.code === 200) {
          planList.value = res.data.data.records || []
          planTotal.value = res.data.data.total || 0
        }
      } catch (e) {
        console.error('加载任务列表失败', e)
      }
      planLoading.value = false
    }

    const handlePlanPageChange = (val) => {
      planPage.value = val
      loadPlanList()
    }

    const handleAddPlan = () => {
      planDialogType.value = 'add'
      Object.assign(planForm, {
        id: null, taskName: '', taskContent: '', taskType: taskType.value,
        startTime: '', endTime: '', ongoing: false, weekDayList: [], status: '1', sort: 0
      })
      planDialogVisible.value = true
    }

    const handleEditPlan = (plan) => {
      planDialogType.value = 'edit'
      Object.assign(planForm, {
        ...plan,
        weekDayList: plan.weekDay ? plan.weekDay.split(',').map(s => s.trim()) : [],
        ongoing: !plan.endTime
      })
      planDialogVisible.value = true
    }

    const handleDeletePlan = (plan) => {
      ElMessageBox.confirm('删除任务会同时删除关联的打卡记录，确定？', '提示', { type: 'warning' })
        .then(async () => {
          try {
            const res = await deleteTaskPlan(plan.id)
            if (res.data.code === 200) {
              ElMessage.success('删除成功')
              loadPlanList()
            }
          } catch (e) {
            console.error('删除失败', e)
          }
        }).catch(() => {})
    }

    const handleSubmitPlan = async () => {
      if (!planFormRef.value) return
      await planFormRef.value.validate(async (valid) => {
        if (!valid) return
        const data = {
          ...planForm,
          weekDay: planForm.weekDayList.length > 0 ? planForm.weekDayList.join(',') : null,
          endTime: planForm.ongoing ? null : (planForm.endTime || null)
        }
        delete data.weekDayList
        delete data.ongoing
        try {
          const api = planDialogType.value === 'add' ? createTaskPlan : updateTaskPlan
          const res = await api(data)
          if (res.data.code === 200) {
            ElMessage.success(planDialogType.value === 'add' ? '新增成功' : '更新成功')
            planDialogVisible.value = false
            loadPlanList()
          } else {
            ElMessage.error(res.data.message || '操作失败')
          }
        } catch (e) {
          console.error('提交失败', e)
        }
      })
    }

    const loadPlanStats = async () => {
      try {
        const params = { taskType: taskType.value }
        if (statsDateRange.value && statsDateRange.value.length === 2) {
          params.startTime = statsDateRange.value[0]
          params.endTime = statsDateRange.value[1]
        }
        const res = await getPlanStats(params)
        if (res.data.code === 200) {
          const data = res.data.data
          planStats.totalCount = data.totalCount || 0
          planStats.totalCheckInCount = data.totalCheckInCount || 0
          planStats.completedCount = data.completedCount || 0
          planStats.completionRate = data.completionRate || 0
        }
      } catch (e) {
        console.error('加载统计失败', e)
      }
    }

    // === 初始化 ===
    onMounted(() => {
      loadTodayTasks()
      loadCalendar()
      loadPlanList()
      loadPlanStats()
    })

    return {
      weekDayMap, weekdays, activeTab, tabs,
      currentDate, todayTasks, loading, expandedTasks, quickForm, editForm, calendarData,
      isToday, todayCheckedCount, todayProgress,
      changeDate, goToday, toggleExpand, handleQuickCheckIn, handleUpdateCheckIn, handleCancelCheckIn,
      checkStatusText, formatPlanDateRange, formatDateCN,
      calendarMonth, calendarCells, selectedCalendarDate, calendarDetailTasks, calendarDetailLoading,
      changeMonth, selectCalendarDay, getHeatColor,
      taskType, statusFilter, planList, planLoading, planPage, planPageSize, planTotal,
      statsDateRange, planStats, loadPlanList, loadPlanStats, handlePlanPageChange,
      planDialogVisible, planDialogType, planFormRef, planForm, planRules,
      handleAddPlan, handleEditPlan, handleDeletePlan, handleSubmitPlan
    }
  }
}
</script>

<style scoped>
.task-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 16px;
}

/* Tabs */
.task-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.task-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  transition: all 0.2s;
}

.task-tab:hover {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.task-tab--active {
  color: #fff;
  background: var(--el-color-primary);
}

.task-tab--active:hover {
  color: #fff;
  background: var(--el-color-primary);
}

/* 日期导航 */
.date-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
}

.date-nav-text {
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
}

.today-badge {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 8px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  background: #10B981;
  border-radius: 10px;
}

/* 统计条 */
.stats-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 16px;
  background: var(--el-bg-color);
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--el-text-color-regular);
  white-space: nowrap;
}

.stats-progress {
  flex: 1;
  min-width: 80px;
}

/* 今日任务卡片 */
.today-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.today-card {
  padding: 14px 16px;
  background: var(--el-bg-color);
  border-radius: 8px;
  border-left: 3px solid var(--el-color-primary);
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: all 0.2s;
}

.today-card--checked {
  border-left-color: #10B981;
  opacity: 0.85;
}

.today-card-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.today-card-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.today-card-name {
  font-size: 15px;
  font-weight: 600;
}

.today-card-time {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.today-card-actual-time {
  font-size: 12px;
  color: #10B981;
}

.expand-row-fields {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.expand-time-pick {
  display: flex;
  align-items: center;
  gap: 4px;
}

.expand-time-sep {
  color: var(--el-text-color-secondary);
}

.today-card-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.today-card-expand {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.expand-row {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin-bottom: 4px;
}

.expand-label {
  color: var(--el-text-color-secondary);
}

/* 日历 */
.calendar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
}

.calendar-month {
  font-size: 16px;
  font-weight: 600;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
}

.calendar-weekday {
  text-align: center;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  padding: 4px 0;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
}

.calendar-cell:hover {
  background: var(--el-color-primary-light-9);
}

.calendar-cell--empty {
  cursor: default;
}

.calendar-cell--empty:hover {
  background: transparent;
}

.calendar-cell--today .calendar-day-num {
  color: var(--el-color-primary);
  font-weight: 700;
}

.calendar-cell--selected {
  background: var(--el-color-primary-light-8) !important;
}

.calendar-day-num {
  font-size: 13px;
  line-height: 1;
}

.calendar-day-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 3px;
}

.calendar-detail {
  margin-top: 16px;
  padding: 12px;
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.calendar-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 14px;
}

.calendar-detail-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.detail-name {
  color: var(--el-text-color-regular);
}

.calendar-legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 12px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.legend-label {
  margin: 0 2px;
}

/* 任务管理 */
.manage-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
}

.manage-filters {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stats-panel {
  margin-bottom: 16px;
  padding: 14px 16px;
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.stats-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stats-panel-title {
  font-size: 14px;
  font-weight: 600;
}

.stats-panel-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stats-panel-card {
  text-align: center;
  padding: 8px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
}

.stats-panel-card-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--el-color-primary);
}

.stats-panel-card-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.plan-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.plan-card {
  padding: 12px 16px;
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.plan-card-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-card-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.plan-card-name {
  font-size: 15px;
  font-weight: 600;
}

.plan-card-time {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.plan-card-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.plan-card-desc {
  margin-top: 8px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.plan-card-week {
  margin-top: 6px;
}

/* 通用 */
.loading-wrapper {
  padding: 20px 0;
}

.empty-tip {
  padding: 30px 0;
  text-align: center;
}

.pagination-container {
  margin-top: 16px;
  text-align: center;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .task-container {
    padding: 10px;
  }

  .stats-bar {
    flex-wrap: wrap;
    gap: 10px;
  }

  .stats-progress {
    order: 3;
    width: 100%;
    min-width: auto;
  }

  .today-card-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .today-card-right {
    align-self: flex-end;
  }

  .plan-card-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .plan-card-right {
    align-self: flex-end;
  }

  .manage-header {
    flex-direction: column;
  }

  .stats-panel-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .calendar-cell {
    border-radius: 4px;
  }

  .calendar-day-dot {
    width: 6px;
    height: 6px;
  }
}
</style>
