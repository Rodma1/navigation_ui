// import request from '@/utils/axios'
//
// // 文章管理相关接口
// export function getArticleList(params) {
//   return request({
//     url: '/cyzArticle/pages',
//     method: 'get',
//     params
//   })
// }
//
// export function createArticle(data) {
//   return request({
//     url: '/cyzArticle/insert',
//     method: 'post',
//     data
//   })
// }
//
// export function updateArticle(data) {
//   return request({
//     url: '/cyzArticle/update',
//     method: 'put',
//     data
//   })
// }
//
// export function updateArticleStatus(data) {
//   return request({
//     url: '/cyzArticle/updateStatus',
//     method: 'put',
//     data
//   })
// }
//
// export function deleteArticle(data) {
//   return request({
//     url: '/cyzArticle/delete',
//     method: 'delete',
//     data
//   })
// }
//
// // 分类管理相关接口
// export function getCategoryTree(categoryType) {
//   return request({
//     url: `/api/categories/getAllCategoryTree/${categoryType}`,
//     method: 'get'
//   })
// }
//
// export function createCategory(data) {
//   return request({
//     url: '/categories/insert',
//     method: 'post',
//     data
//   })
// }