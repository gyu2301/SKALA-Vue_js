<script setup>
import { ref } from 'vue'
import LifecycleChild from '@/components/practices/component/LifecycleChild.vue'

const isShow = ref(true)
const lifecycleLogs = ref([])
let logId = 0

function handleLifecycleEvent(event) {
  lifecycleLogs.value.unshift({ id: ++logId, ...event })
  lifecycleLogs.value = lifecycleLogs.value.slice(0, 12)
}

function clearLogs() {
  lifecycleLogs.value = []
}
</script>

<template>
  <div class="practice-section lifecycle-practice">
    <div class="lifecycle-intro">
      <div>
        <h2>Lifecycle Hook 흐름 탐색기</h2>
        <p>컴포넌트를 생성·수정·소멸시키면서 Hook이 실행되는 순서를 확인합니다.</p>
      </div>
      <span class="component-status" :class="{ mounted: isShow }">
        {{ isShow ? '● MOUNTED' : '○ UNMOUNTED' }}
      </span>
    </div>

    <div class="lifecycle-actions">
      <button type="button" class="primary-action" @click="isShow = !isShow">
        {{ isShow ? '컴포넌트 소멸시키기' : '컴포넌트 다시 생성하기' }}
      </button>
      <button type="button" :disabled="lifecycleLogs.length === 0" @click="clearLogs">로그 지우기</button>
    </div>

    <div class="lifecycle-grid">
      <div class="component-stage">
        <span class="stage-label">CHILD COMPONENT</span>
        <LifecycleChild v-if="isShow" @lifecycle-event="handleLifecycleEvent" />
        <div v-else class="empty-component">
          <strong>컴포넌트가 DOM에서 제거되었습니다.</strong>
          <p>오른쪽 로그에서 onUnmounted 실행 결과를 확인해 보세요.</p>
        </div>
      </div>

      <div class="lifecycle-console">
        <div class="console-header">
          <span><i></i><i></i><i></i></span>
          <strong>Lifecycle Console</strong>
        </div>
        <ol v-if="lifecycleLogs.length" class="log-list">
          <li v-for="log in lifecycleLogs" :key="log.id">
            <time>{{ log.time }}</time>
            <span class="hook-name" :class="log.type">{{ log.type }}</span>
            <p>{{ log.message }}</p>
          </li>
        </ol>
        <p v-else class="empty-log">컴포넌트를 조작하면 실행 로그가 이곳에 표시됩니다.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lifecycle-intro,
.lifecycle-actions,
.console-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.lifecycle-intro p {
  margin: 0;
  color: #667085;
}

.component-status {
  flex: 0 0 auto;
  padding: 6px 10px;
  border-radius: 999px;
  background: #f2f4f7;
  color: #667085;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.component-status.mounted {
  background: #e8fff5;
  color: #087a55;
}

.lifecycle-actions {
  justify-content: flex-start;
  margin: 20px 0;
}

.lifecycle-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 1fr);
  gap: 16px;
}

.component-stage,
.lifecycle-console {
  min-height: 285px;
  border-radius: 14px;
}

.component-stage {
  padding: 18px;
  border: 1px dashed #a8b6c5;
  background: #f8fafc;
}

.stage-label {
  display: block;
  margin-bottom: 14px;
  color: #77839a;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.empty-component {
  display: grid;
  min-height: 200px;
  place-content: center;
  text-align: center;
  color: #667085;
}

.empty-component p {
  margin: 6px 0 0;
  font-size: 13px;
}

.lifecycle-console {
  overflow: hidden;
  background: #111827;
  color: #e5e7eb;
}

.console-header {
  padding: 10px 14px;
  border-bottom: 1px solid #2b3546;
  background: #1f2937;
  font-size: 12px;
}

.console-header > span {
  display: flex;
  gap: 5px;
}

.console-header i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fb7185;
}

.console-header i:nth-child(2) {
  background: #fbbf24;
}

.console-header i:nth-child(3) {
  background: #34d399;
}

.log-list {
  max-height: 310px;
  padding: 10px 14px 14px;
  margin: 0;
  overflow: auto;
  list-style: none;
}

.log-list li {
  display: grid;
  grid-template-columns: 62px 88px 1fr;
  gap: 8px;
  align-items: start;
  padding: 9px 0;
  border-bottom: 1px solid #263244;
  font-size: 12px;
}

.log-list time {
  color: #8290a8;
}

.hook-name {
  font-weight: 800;
  color: #fbbf24;
}

.hook-name.onMounted {
  color: #34d399;
}

.hook-name.onUnmounted {
  color: #fb7185;
}

.log-list p {
  margin: 0;
}

.empty-log {
  display: grid;
  min-height: 230px;
  padding: 24px;
  margin: 0;
  place-content: center;
  text-align: center;
  color: #8290a8;
  font-size: 13px;
}

@media (max-width: 850px) {
  .lifecycle-grid {
    grid-template-columns: 1fr;
  }
}
</style>
