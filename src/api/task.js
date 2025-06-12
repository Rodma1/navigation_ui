import axios from '@/utils/axios'

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

// 获取打卡记录列表
export function getTaskCheckInList(params) {
  return axios.get('/task/checkin/list', { params })
}

// 创建打卡记录
export function createTaskCheckIn(data) {
  return axios.post('/task/checkin', data)
}

// 更新打卡记录
export function updateTaskCheckIn(data) {
  return axios.put('/task/checkin', data)
}

// 删除打卡记录
export function deleteTaskCheckIn(id) {
  return axios.delete(`/task/checkin/${id}`)
}

// 获取打卡统计
export function getTaskCheckInStatistics(params) {
  return axios.get('/task/checkin/statistics', { params })
} 