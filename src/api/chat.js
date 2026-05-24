import axios from '@/utils/axios'

const BASE_URL = '/ai/chat'

export function sendMessage(data) {
  return axios.post(BASE_URL, { ...data, stream: false })
}

export function getModels() {
  return axios.get(`${BASE_URL}/models`)
}

export function getConversations() {
  return axios.get(`${BASE_URL}/conversations`)
}

export function getMessages(conversationId) {
  return axios.get(`${BASE_URL}/conversations/${conversationId}/messages`)
}

export function deleteConversation(conversationId) {
  return axios.delete(`${BASE_URL}/conversations/${conversationId}`)
}

/**
 * 流式聊天 — 直接请求后端，绕过 Vue dev proxy（代理会缓冲 SSE 响应）
 * 开发环境用 VUE_APP_BASE_URL 直连后端，生产环境用相对路径
 */
export function sendStreamMessage(data, { onMessage, onDone, onError }) {
  const token = localStorage.getItem('Authorization')

  // 开发环境直连后端，绕过代理缓冲；生产环境走相对路径
  const isDev = process.env.NODE_ENV === 'development'
  const baseURL = isDev ? process.env.VUE_APP_BASE_URL : ''
  const url = `${baseURL}/ai/chat/stream`

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token || ''
    },
    body: JSON.stringify(data)
  }).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    function read() {
      reader.read().then(({ done, value }) => {
        if (done) {
          onDone && onDone()
          return
        }
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data:')) continue
          const data = trimmed.substring(5).trim()
          if (data === '[DONE]') {
            onDone && onDone()
            return
          }
          try {
            const parsed = JSON.parse(data)
            if (parsed.error) {
              onError && onError(parsed.error)
              return
            }
            if (parsed.content) {
              onMessage && onMessage(parsed.content)
            }
          } catch (e) {
            // 忽略解析失败的行
          }
        }
        read()
      }).catch(err => {
        onError && onError(err.message)
      })
    }
    read()
  }).catch(err => {
    onError && onError(err.message)
  })
}
