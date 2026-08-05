<script setup>
import { ref } from 'vue'

// 실시간 화면 출력을 위한 Vue 상태값 (수정 금지)
const result1 = ref('')
const result2 = ref('')
const result3 = ref('')

const runTask1 = () => {
  const members = ['김수원', '이서울', '박부산', '최대전']
  const rawData = { id: 101, grade: 'VIP', details: { score: 95 } }

  // 1. includes() 활용
  const memberContainsPark = members.includes('박부산')

  // 2. 객체 심층 비구조화 할당 (한 줄로 추출)
  const {
    grade,
    details: { score },
  } = rawData

  // 3. 템플릿 리터럴 바인딩
  result1.value = `부산 포함 여부: ${memberContainsPark} / 등급: ${grade} / 점수: ${score}점`
}

const runTask2 = () => {
  const currentCart = ['Apple', 'Banana']
  const newProduct = { name: 'Orange', stock: 0, preview: null }

  // 1. 배열 스프레드 연산자 병합
  const updatedCart = [...currentCart, newProduct.name]

  // 2. 옵셔널 체이닝 및 Null 병합 연산자 콤보
  const imgStatus = newProduct?.preview ?? '이미지 준비중'

  // 3. 0값 안전 보존을 위한 ?? 연산자 검증 (|| 연산자를 쓰면 10이 되어 감점)
  const finalStock = newProduct.stock ?? 10

  // 4. 출력
  result2.value = `카트: ${updatedCart} / 이미지: ${imgStatus} / 수량: ${finalStock}개`
}

// 가상의 백엔드 API (수정 금지 - Promise 반환형 화살표 함수)
const fetchUserId = () => new Promise((res) => setTimeout(() => res({ uid: 777 }), 400))
const fetchUserProfile = (uid) => new Promise((res) => setTimeout(() => res({ uid, nick: 'Graves' }), 400))

const runTask3 = async () => {
  result3.value = '⏳ 데이터 동기화 중...'

  // 1. try-catch 예외 처리망 구축
  try {
    // 2. 1차 await 실행 및 비구조화 할당 추출
    const { uid } = await fetchUserId()

    // 3. 2차 연쇄 await 실행 및 데이터 주입
    const { nick } = await fetchUserProfile(uid)

    // 4. 결과 출력
    result3.value = `동기화 성공: ${nick}님 환영합니다.`
  } catch (error) {
    result3.value = '통신 실패'
  }
}

const result4 = ref('')

const runTask4 = () => {
  const orders = [
    { item: '아메리카노', price: 4500, qty: 2 },
    { item: '카페라떼', price: 5000, qty: 1 },
    { item: '녹차', price: 4000, qty: 3 },
  ]

  // 1. filter → map → reduce 체이닝으로 2개 이상 주문한 금액만 합산
  const total = orders
    .filter((order) => order.qty >= 2)
    .map((order) => order.price * order.qty)
    .reduce((sum, amount) => sum + amount, 0)

  // 2. 구조분해 매개변수로 필요한 필드만 추출해 요약 문자열 생성
  const summary = orders.map(({ item, qty }) => `${item} x${qty}`).join(', ')

  result4.value = `2개 이상 주문 합계: ${total.toLocaleString()}원 / 전체 주문: ${summary}`
}

// 실전 API 연동: Open Trivia DB (키 발급 불필요)
const quiz = ref(null)
const quizLoading = ref(false)
const quizError = ref('')

const decodeText = (text) => decodeURIComponent(text)

const buildQuestion = ({ results: [q] }) => {
  // 배열 스프레드로 정답 + 오답을 합친 뒤 무작위 정렬
  const choices = [...q.incorrect_answers, q.correct_answer].map(decodeText).sort(() => Math.random() - 0.5)

  return {
    category: decodeText(q.category),
    question: decodeText(q.question),
    answer: decodeText(q.correct_answer),
    choices,
  }
}

const runTask5 = async () => {
  quizLoading.value = true
  quizError.value = ''
  quiz.value = null

  try {
    // 1. Promise.all로 두 카테고리의 퀴즈를 동시에 요청 (병렬 async/await)
    const [generalRes, scienceRes] = await Promise.all([
      fetch('https://opentdb.com/api.php?amount=1&type=multiple&category=9&encode=url3986'),
      fetch('https://opentdb.com/api.php?amount=1&type=multiple&category=17&encode=url3986'),
    ])

    if (!generalRes.ok || !scienceRes.ok) {
      throw new Error('네트워크 오류')
    }

    // 2. 두 응답을 병렬로 JSON 파싱
    const [generalData, scienceData] = await Promise.all([generalRes.json(), scienceRes.json()])

    quiz.value = [buildQuestion(generalData), buildQuestion(scienceData)]
  } catch (error) {
    quizError.value = '퀴즈를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'
  } finally {
    quizLoading.value = false
  }
}
</script>

<template>
  <div class="practice-section">
    <h2>🎯 Modern JavaScript (ES6+) 실무 검증 과제룸</h2>

    <div class="card">
      <h3>과제 1. 데이터 추출 및 포맷팅</h3>
      <button @click="runTask1">과제 1 가동</button>
      <div class="console">결과창 1: {{ result1 }}</div>
    </div>

    <div class="card">
      <h3>과제 2. 불변성 복사 및 데이터 방어</h3>
      <button @click="runTask2">과제 2 가동</button>
      <div class="console">결과창 2: {{ result2 }}</div>
    </div>

    <div class="card">
      <h3>과제 3. 비동기 연쇄 파이프라인 (Async/Await)</h3>
      <button @click="runTask3">과제 3 가동</button>
      <div class="console">결과창 3: {{ result3 }}</div>
    </div>

    <div class="card">
      <h3>과제 4. 배열 고차함수 파이프라인 (filter·map·reduce)</h3>
      <button @click="runTask4">과제 4 가동</button>
      <div class="console">결과창 4: {{ result4 }}</div>
    </div>

    <div class="card">
      <h3>과제 5. 실전 API 연동 — 잡학 퀴즈 뽑기 (Open Trivia DB · fetch)</h3>
      <button @click="runTask5" :disabled="quizLoading">
        {{ quizLoading ? '퀴즈 불러오는 중...' : '과제 5 가동' }}
      </button>

      <p v-if="quizError" class="quiz-error" role="alert">{{ quizError }}</p>

      <div v-if="quiz" class="quiz-result">
        <article v-for="q in quiz" :key="q.question" class="quiz-question">
          <span class="quiz-category">{{ q.category }}</span>
          <p>{{ q.question }}</p>
          <ul>
            <li v-for="choice in q.choices" :key="choice" :class="{ correct: choice === q.answer }">
              {{ choice }}
            </li>
          </ul>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
}
button {
  background: #409eff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
button:hover {
  background: #66b1ff;
}
.console {
  background: #2d2d2d;
  color: #67c23a;
  padding: 12px;
  border-radius: 6px;
  margin-top: 12px;
  font-family: monospace;
  font-size: 14px;
}
button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.quiz-error {
  padding: 10px 12px;
  margin-top: 12px;
  border-radius: 6px;
  background: #fff1f3;
  color: #c01048;
  font-size: 13px;
}
.quiz-result {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
  margin-top: 14px;
}
.quiz-question {
  padding: 14px;
  border: 1px solid #e4e7ec;
  border-radius: 8px;
  background: white;
}
.quiz-category {
  color: #409eff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
}
.quiz-question p {
  margin: 6px 0 10px;
  font-weight: 600;
}
.quiz-question ul {
  display: grid;
  gap: 6px;
  padding: 0;
  margin: 0;
  list-style: none;
}
.quiz-question li {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
}
.quiz-question li.correct {
  border-color: #67c23a;
  background: #f0f9eb;
  color: #529b2e;
  font-weight: 700;
}
</style>
