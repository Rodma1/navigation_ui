<template>
  <div class="ai-chat">
    <div class="chat-sidebar">
      <el-button type="primary" class="new-chat-btn" @click="createNewChat" :icon="Plus" round>新建对话</el-button>
      <div class="conversation-list">
        <div
          v-for="conv in conversations"
          :key="conv.id"
          class="conversation-item"
          :class="{ active: currentConversationId === conv.id }"
          @click="switchConversation(conv)"
        >
          <el-icon><ChatDotRound /></el-icon>
          <span class="conversation-title">{{ conv.title }}</span>
          <el-icon class="delete-icon" @click.stop="handleDelete(conv.id)"><Delete /></el-icon>
        </div>
      </div>
    </div>

    <div class="chat-main">
      <div class="chat-toolbar">
        <el-select v-model="selectedModel" placeholder="选择模型" size="small" style="width: 160px">
          <el-option
            v-for="m in models"
            :key="m.value"
            :label="m.label"
            :value="m.value"
          />
        </el-select>
        <el-switch
          v-model="isStream"
          active-text="流式"
          inactive-text="直接"
          size="small"
        />
      </div>

      <div class="chat-messages" ref="messagesContainer">
        <div v-if="messages.length === 0" class="empty-hint">
          <el-icon :size="48" color="var(--color-text-muted)"><Promotion /></el-icon>
          <p>开始和 AI 对话吧</p>
        </div>
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="chat-bubble"
          :class="{ 'chat-bubble--user': msg.role === 'user', 'chat-bubble--ai': msg.role === 'assistant' }"
        >
          <div class="bubble-avatar">
            <el-icon :size="18"><component :is="msg.role === 'user' ? 'User' : 'Monitor'" /></el-icon>
          </div>
          <div class="bubble-body">
            <div v-if="msg.role === 'assistant'" class="bubble-content markdown-body" v-html="renderMarkdown(msg.content)"></div>
            <div v-else class="bubble-content">{{ msg.content }}</div>
          </div>
        </div>
        <div v-if="loading && isStream" class="chat-bubble chat-bubble--ai">
          <div class="bubble-avatar">
            <el-icon :size="18"><Monitor /></el-icon>
          </div>
          <div class="bubble-body">
            <div class="bubble-content markdown-body" v-html="renderMarkdown(streamingContent)"></div>
            <span class="cursor-blink">|</span>
          </div>
        </div>
      </div>

      <div class="chat-input-area">
        <el-input
          v-model="inputMessage"
          type="textarea"
          :rows="2"
          placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
          :disabled="loading"
          @keydown.enter.exact.prevent="handleSend"
        />
        <el-button
          type="primary"
          :icon="Promotion"
          :loading="loading && !isStream"
          :disabled="!inputMessage.trim() || loading"
          @click="handleSend"
        >
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ChatDotRound, Delete, Plus, Promotion, User, Monitor
} from '@element-plus/icons-vue'
import { marked } from 'marked'
import { getModels, getConversations, getMessages, deleteConversation, sendMessage, sendStreamMessage } from '@/api/chat'

export default {
  name: 'AiChatView',
  components: { ChatDotRound, Delete, Plus, Promotion, User, Monitor },
  setup() {
    const models = ref([])
    const selectedModel = ref('')
    const isStream = ref(true)
    const conversations = ref([])
    const currentConversationId = ref(null)
    const messages = ref([])
    const inputMessage = ref('')
    const loading = ref(false)
    const streamingContent = ref('')
    const messagesContainer = ref(null)

    onMounted(async () => {
      await loadModels()
      await loadConversations()
    })

    async function loadModels() {
      try {
        const res = await getModels()
        models.value = res.data?.data || []
        if (models.value.length > 0) {
          selectedModel.value = models.value[0].value
        }
      } catch (e) {
        console.error('加载模型列表失败', e)
      }
    }

    async function loadConversations() {
      try {
        const res = await getConversations()
        conversations.value = res.data?.data || []
      } catch (e) {
        console.error('加载会话列表失败', e)
      }
    }

    async function switchConversation(conv) {
      currentConversationId.value = conv.id
      try {
        const res = await getMessages(conv.id)
        messages.value = (res.data?.data || []).map(m => ({
          role: m.role,
          content: m.content
        }))
        scrollToBottom()
      } catch (e) {
        console.error('加载消息失败', e)
      }
    }

    function createNewChat() {
      currentConversationId.value = null
      messages.value = []
      streamingContent.value = ''
    }

    async function handleDelete(id) {
      try {
        await ElMessageBox.confirm('确定删除该对话？', '提示', { type: 'warning' })
        await deleteConversation(id)
        if (currentConversationId.value === id) {
          createNewChat()
        }
        await loadConversations()
        ElMessage.success('已删除')
      } catch (e) {
        if (e !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }

    async function handleSend() {
      const text = inputMessage.value.trim()
      if (!text || loading.value) return

      messages.value.push({ role: 'user', content: text })
      inputMessage.value = ''
      loading.value = true
      streamingContent.value = ''

      const requestData = {
        message: text,
        conversationId: currentConversationId.value,
        model: selectedModel.value
      }

      if (isStream.value) {
        sendStreamMessage(requestData, {
          onMessage(token) {
            streamingContent.value += token
            scrollToBottom()
          },
          onDone() {
            if (streamingContent.value) {
              messages.value.push({ role: 'assistant', content: streamingContent.value })
            }
            streamingContent.value = ''
            loading.value = false
            loadConversations()
            scrollToBottom()
          },
          onError(err) {
            ElMessage.error('AI 服务错误: ' + err)
            loading.value = false
            streamingContent.value = ''
          }
        })
      } else {
        try {
          const res = await sendMessage(requestData)
          const data = res.data?.data
          if (data) {
            messages.value.push({ role: 'assistant', content: data.message })
            if (data.conversationId && !currentConversationId.value) {
              currentConversationId.value = data.conversationId
            }
            await loadConversations()
          }
        } catch (e) {
          ElMessage.error('发送失败')
        } finally {
          loading.value = false
          scrollToBottom()
        }
      }
    }

    function renderMarkdown(content) {
      if (!content) return ''
      try {
        return marked.parse(content)
      } catch (e) {
        return content
      }
    }

    function scrollToBottom() {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
    }

    return {
      models, selectedModel, isStream,
      conversations, currentConversationId,
      messages, inputMessage, loading,
      streamingContent, messagesContainer,
      createNewChat, switchConversation, handleDelete, handleSend,
      renderMarkdown, Plus, Promotion, User, Monitor
    }
  }
}
</script>

<style lang="scss" scoped>
.ai-chat {
  display: flex;
  height: calc(100vh - 64px - 48px);
  gap: 0;
  margin: -24px;
  background: var(--color-bg-body, #f5f7fa);
}

:root[data-theme="dark"] .ai-chat {
  background: var(--color-bg-body, #0f172a);
}

.chat-sidebar {
  width: 240px;
  background: var(--color-bg-surface, #fff);
  border-right: 1px solid var(--color-border-light, #e5e7eb);
  display: flex;
  flex-direction: column;
  padding: 16px;
  flex-shrink: 0;
}

:root[data-theme="dark"] .chat-sidebar {
  background: #1e293b;
  border-right-color: #334155;
}

.new-chat-btn {
  width: 100%;
  margin-bottom: 12px;
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--color-text-secondary, #64748b);
  transition: all 0.2s;
  margin-bottom: 4px;

  &:hover {
    background: var(--color-primary-bg, #eff6ff);
    color: var(--color-primary, #3b82f6);

    .delete-icon {
      opacity: 1;
    }
  }

  &.active {
    background: var(--color-primary-bg, #eff6ff);
    color: var(--color-primary, #3b82f6);
    font-weight: 500;
  }
}

.conversation-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.delete-icon {
  opacity: 0;
  font-size: 14px;
  color: var(--color-text-muted, #94a3b8);
  transition: opacity 0.2s;

  &:hover {
    color: #ef4444;
  }
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--color-border-light, #e5e7eb);
  background: var(--color-bg-surface, #fff);
}

:root[data-theme="dark"] .chat-toolbar {
  background: #1e293b;
  border-bottom-color: #334155;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-hint {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted, #94a3b8);
  gap: 12px;

  p {
    font-size: 16px;
    margin: 0;
  }
}

.chat-bubble {
  display: flex;
  gap: 10px;
  max-width: 80%;

  &--user {
    align-self: flex-end;
    flex-direction: row-reverse;

    .bubble-avatar {
      background: var(--color-primary, #3b82f6);
      color: #fff;
    }

    .bubble-content {
      background: var(--color-primary, #3b82f6);
      color: #fff;
    }
  }

  &--ai {
    align-self: flex-start;

    .bubble-avatar {
      background: var(--color-bg-surface, #f1f5f9);
      color: var(--color-primary, #3b82f6);
    }

    .bubble-content {
      background: var(--color-bg-surface, #f1f5f9);
      color: var(--color-text-primary, #1e293b);
    }
  }
}

:root[data-theme="dark"] .chat-bubble--ai .bubble-avatar {
  background: #334155;
  color: #60a5fa;
}

:root[data-theme="dark"] .chat-bubble--ai .bubble-content {
  background: #334155;
  color: #e2e8f0;
}

.bubble-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bubble-body {
  display: flex;
  align-items: flex-start;
  gap: 0;
}

.bubble-content {
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}

.markdown-body {
  :deep(pre) {
    background: #1e293b;
    color: #e2e8f0;
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 8px 0;
    font-size: 13px;
  }

  :deep(code) {
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  }

  :deep(p) {
    margin: 4px 0;
  }

  :deep(ul), :deep(ol) {
    padding-left: 20px;
    margin: 4px 0;
  }

  :deep(blockquote) {
    border-left: 3px solid var(--color-primary, #3b82f6);
    margin: 8px 0;
    padding-left: 12px;
    color: var(--color-text-secondary, #64748b);
  }
}

.cursor-blink {
  animation: blink 1s step-end infinite;
  color: var(--color-primary, #3b82f6);
  font-weight: bold;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.chat-input-area {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--color-border-light, #e5e7eb);
  background: var(--color-bg-surface, #fff);
  align-items: flex-end;
}

:root[data-theme="dark"] .chat-input-area {
  background: #1e293b;
  border-top-color: #334155;
}

.chat-input-area .el-textarea {
  flex: 1;
}
</style>
