import axios from '@/utils/axios'

// 获取今日任务列表（含打卡状态）
export function getTodayTasks(date) {
  return axios.get('/task/checkin/today', { params: { date } })
}

// 一键打卡
export function quickCheckIn(data) {
  return axios.post('/task/checkin/quick', data)
}

// 更新打卡记录
export function updateCheckIn(data) {
  return axios.put('/task/checkin', data)
}

// 删除打卡记录
export function deleteCheckIn(id) {
  return axios.delete(`/task/checkin/${id}`)
}

// 获取打卡日历统计
export function getCalendarStats(month) {
  return axios.get('/task/checkin/calendar', { params: { month } })
}

// 获取任务计划列表
export function getTaskPlanList(params) {
  return axios.get('/task/plan/list', { params })
}

// 获取任务计划分页列表
export function getTaskPlanPage(params) {
  return axios.get('/task/plan/page', { params })
}

// 创建任务计划
export function createTaskPlan(data) {
  return axios.post('/task/plan', data)
}

// 更新任务计划
export function updateTaskPlan(data) {
  return axios.put('/task/plan', data)
}

// 删除任务计划
export function deleteTaskPlan(id) {
  return axios.delete(`/task/plan/${id}`)
}

// 获取任务计划统计
export function getPlanStats(params) {
  return axios.get('/task/plan/stats', { params })
}
