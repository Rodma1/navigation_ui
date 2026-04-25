import axios from '@/utils/axios'

// 获取分类树
export function getCategoryTree() {
  return axios.get('/cyzNavigateCategory/tree')
}

// 新增网站
export function createSite(data) {
  return axios.post('/cyzNavigateSite/insert', data)
}

// 更新网站
export function updateSite(data) {
  return axios.put('/cyzNavigateSite/update', data)
}

// 删除网站
export function deleteSite(ids) {
  return axios.delete('/cyzNavigateSite/delete', { data: { ids } })
}

// 新增分类（走工厂模式接口）
export function createCategory(data) {
  return axios.post('/categories/insert', { ...data, categoryType: 'NAVIGATE' })
}

// 删除分类
export function deleteCategory(id) {
  return axios.post('/categories/delete', { id, categoryType: 'NAVIGATE' })
}

// 获取全部分类树（用于级联选择）
export function getAllCategoryTree() {
  return axios.get('/categories/getAllCategoryTree/NAVIGATE')
}
