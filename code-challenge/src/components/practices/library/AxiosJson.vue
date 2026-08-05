<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'

const BASE_URL = 'https://jsonplaceholder.typicode.com/posts'

const items = ref([])
const titleInput = ref('')
const bodyInput = ref('')
const isLoading = ref(false)
const requestMethod = ref('READY')
const statusMessage = ref('CRUD 버튼을 눌러 Axios 요청을 실행해 보세요.')
const errorMessage = ref('')

function setStatus(method, message) {
  requestMethod.value = method
  statusMessage.value = message
  errorMessage.value = ''
}

async function readItems() {
  isLoading.value = true

  try {
    const response = await axios.get(BASE_URL, {
      params: { _limit: 3 },
    })

    items.value = response.data.map((item) => ({ ...item, clientKey: `server-${item.id}`, isTemporary: false }))
    setStatus('GET', `게시물 ${response.data.length}개를 조회했습니다.`)
  } catch (error) {
    errorMessage.value = `GET 요청 실패: ${error.message}`
  } finally {
    isLoading.value = false
  }
}

async function createItem() {
  if (!titleInput.value.trim()) {
    errorMessage.value = 'POST 요청에 사용할 제목을 입력해주세요.'
    return
  }

  isLoading.value = true

  try {
    const response = await axios.post(BASE_URL, {
      title: titleInput.value.trim(),
      body: bodyInput.value.trim() || 'Axios로 생성한 게시물입니다.',
      userId: 1,
    })

    items.value.unshift({ ...response.data, clientKey: `created-${Date.now()}`, isTemporary: true })
    titleInput.value = ''
    bodyInput.value = ''
    setStatus('POST', `새 게시물(ID: ${response.data.id})을 추가했습니다.`)
  } catch (error) {
    errorMessage.value = `POST 요청 실패: ${error.message}`
  } finally {
    isLoading.value = false
  }
}

async function updateItem(item) {
  const updatedTitle = item.title.endsWith('(수정됨)') ? item.title : `${item.title} (수정됨)`
  const targetIndex = items.value.findIndex((target) => target.clientKey === item.clientKey)

  // JSONPlaceholder의 POST 결과는 서버에 실제 저장되지 않으므로
  // 새로 추가한 임시 데이터는 화면 상태만 수정합니다.
  if (item.isTemporary) {
    items.value[targetIndex] = { ...item, title: updatedTitle }
    setStatus('PUT', `임시 게시물 ID ${item.id}을 화면에서 수정했습니다. (서버 미저장 데이터)`)
    return
  }

  isLoading.value = true

  try {
    const response = await axios.put(`${BASE_URL}/${item.id}`, {
      id: item.id,
      title: updatedTitle,
      body: item.body,
      userId: item.userId,
    })

    items.value[targetIndex] = { ...response.data, clientKey: item.clientKey, isTemporary: false }
    setStatus('PUT', `게시물 ID ${item.id}의 제목을 수정했습니다.`)
  } catch (error) {
    errorMessage.value = `PUT 요청 실패: ${error.message}`
  } finally {
    isLoading.value = false
  }
}

async function deleteItem(item) {
  // POST로 생성한 데이터는 서버에 존재하지 않으므로 화면에서만 제거합니다.
  if (item.isTemporary) {
    items.value = items.value.filter((target) => target.clientKey !== item.clientKey)
    setStatus('DELETE', `임시 게시물 ID ${item.id}을 화면에서 삭제했습니다. (서버 미저장 데이터)`)
    return
  }

  isLoading.value = true

  try {
    await axios.delete(`${BASE_URL}/${item.id}`)
    items.value = items.value.filter((target) => target.clientKey !== item.clientKey)
    setStatus('DELETE', `게시물 ID ${item.id}을 화면에서 삭제했습니다.`)
  } catch (error) {
    errorMessage.value = `DELETE 요청 실패: ${error.message}`
  } finally {
    isLoading.value = false
  }
}

onMounted(readItems)
</script>

<template>
  <div class="practice-section json-practice">
    <div class="json-heading">
      <div>
        <span>JSONPLACEHOLDER · REST</span>
        <h2>Axios JSON CRUD Example</h2>
        <p>GET, POST, PUT, DELETE 요청과 응답 데이터를 한 화면에서 확인합니다.</p>
      </div>
      <span class="method-badge" :class="requestMethod.toLowerCase()">{{ requestMethod }}</span>
    </div>

    <form class="create-form" @submit.prevent="createItem">
      <div>
        <label for="post-title">게시물 제목</label>
        <input id="post-title" v-model.trim="titleInput" type="text" placeholder="POST 요청에 사용할 제목" />
      </div>
      <div>
        <label for="post-body">게시물 내용</label>
        <input id="post-body" v-model.trim="bodyInput" type="text" placeholder="내용을 입력하세요" />
      </div>
      <button type="submit" class="post-button" :disabled="isLoading">POST 추가</button>
    </form>

    <div class="request-status" aria-live="polite">
      <strong>{{ requestMethod }}</strong>
      <span>{{ statusMessage }}</span>
      <button type="button" :disabled="isLoading" @click="readItems">GET 새로고침</button>
    </div>

    <p v-if="errorMessage" class="api-error" role="alert">{{ errorMessage }}</p>

    <div v-if="isLoading && items.length === 0" class="loading-state">Axios로 JSON 데이터를 불러오는 중입니다...</div>

    <div v-else-if="items.length" class="post-list">
      <article v-for="item in items" :key="item.clientKey" class="post-item">
        <span>ID: {{ item.id }} <b v-if="item.isTemporary">· TEMP</b></span>
        <h3>{{ item.title }}</h3>
        <p>{{ item.body }}</p>
        <div>
          <button type="button" class="put-button" :disabled="isLoading" @click="updateItem(item)">PUT 수정</button>
          <button type="button" class="delete-button" :disabled="isLoading" @click="deleteItem(item)">DELETE 삭제</button>
        </div>
      </article>
    </div>

    <div v-else class="loading-state">표시할 게시물이 없습니다. POST로 새 데이터를 추가해 보세요.</div>

    <p class="fake-api-note"><strong>연습용 API 안내:</strong> JSONPlaceholder는 POST·PUT·DELETE 응답을 반환하지만 서버 데이터는 실제로 영구 변경되지 않습니다.</p>
  </div>
</template>

<style scoped>
.json-heading,
.request-status,
.post-item > div {
  display: flex;
  align-items: center;
}

.json-heading {
  justify-content: space-between;
  gap: 18px;
}

.json-heading > div > span,
.create-form label,
.post-item > span {
  color: #7f56d9;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.json-heading h2 {
  margin-top: 3px;
}

.json-heading p {
  margin: 0;
  color: #667085;
}

.method-badge {
  min-width: 62px;
  padding: 7px 10px;
  border-radius: 999px;
  background: #f2f4f7;
  color: #475467;
  font-size: 11px;
  font-weight: 850;
  text-align: center;
}

.method-badge.get {
  background: #eaf4ff;
  color: #175cd3;
}

.method-badge.post {
  background: #e8fff5;
  color: #087a55;
}

.method-badge.put {
  background: #fff7d6;
  color: #a15c07;
}

.method-badge.delete {
  background: #fff1f3;
  color: #c01048;
}

.create-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr) auto;
  gap: 10px;
  align-items: end;
  padding: 16px;
  margin-top: 18px;
  border: 1px solid #e9d7fe;
  border-radius: 12px;
  background: #faf7ff;
}

.create-form > div {
  display: grid;
  gap: 5px;
}

.post-button {
  border-color: #087a55;
  background: #087a55;
  color: white;
}

.request-status {
  gap: 10px;
  padding: 11px 13px;
  margin-top: 12px;
  border-radius: 9px;
  background: #f2f4f7;
  color: #475467;
  font-size: 12px;
}

.request-status strong {
  color: #6941c6;
}

.request-status span {
  flex: 1 1 auto;
}

.request-status button {
  flex: 0 0 auto;
  padding: 5px 8px;
  font-size: 11px;
}

.api-error {
  padding: 10px 12px;
  border-radius: 8px;
  background: #fff1f3;
  color: #c01048;
  font-size: 13px;
}

.post-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.post-item {
  display: flex;
  min-width: 0;
  min-height: 220px;
  padding: 15px;
  border: 1px solid #e4e7ec;
  border-radius: 12px;
  flex-direction: column;
  background: white;
}

.post-item h3 {
  margin-top: 9px;
  color: #344054;
  font-size: 14px;
}

.post-item p {
  display: -webkit-box;
  margin: 0 0 14px;
  overflow: hidden;
  color: #667085;
  font-size: 12px;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
}

.post-item > div {
  gap: 7px;
  margin-top: auto;
}

.post-item button {
  flex: 1 1 0;
  padding: 6px;
  font-size: 11px;
}

.put-button {
  border-color: #fdb022;
  background: #fffaeb;
  color: #a15c07;
}

.delete-button {
  border-color: #fda29b;
  background: #fff1f3;
  color: #c01048;
}

.loading-state {
  display: grid;
  min-height: 160px;
  margin-top: 16px;
  border: 1px dashed #d0d5dd;
  border-radius: 12px;
  place-content: center;
  color: #667085;
  text-align: center;
}

.fake-api-note {
  padding: 10px 12px;
  margin: 14px 0 0;
  border-left: 3px solid #7f56d9;
  background: #faf7ff;
  color: #667085;
  font-size: 12px;
}

@media (max-width: 900px) {
  .post-list {
    grid-template-columns: 1fr;
  }

  .post-item {
    min-height: auto;
  }
}

@media (max-width: 680px) {
  .json-heading,
  .request-status {
    align-items: flex-start;
    flex-direction: column;
  }

  .create-form {
    grid-template-columns: 1fr;
  }

  .request-status button {
    width: 100%;
  }
}
</style>
