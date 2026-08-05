<script setup>
import { ref } from 'vue'

// 미션 3. .env.staging / .env.production 에 정의한 VITE_API_URL 을 화면과 콘솔에 노출
const apiUrl = ref(import.meta.env.VITE_API_URL)
const mode = ref(import.meta.env.MODE)

const runEnvCheck = () => {
  // eslint 'no-console': 'off' 설정 덕분에 이 로그는 에러 없이 허용된다
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL)
  console.log('MODE:', import.meta.env.MODE)
  apiUrl.value = import.meta.env.VITE_API_URL
  mode.value = import.meta.env.MODE
}
</script>

<template>
  <div class="practice-section">
    <h2>🚀 Vite 빌드 및 실무 배포</h2>

    <div class="card">
      <h3>미션 1. ESLint Custom 규칙 (eqeqeq · no-console)</h3>
      <p class="mission-desc"><code>eslint.config.js</code>의 <code>app/custom-rules</code> 블록에 두 규칙을 등록했다.</p>
      <pre class="console">'no-console': 'off',        // console.log 허용
eqeqeq: ['error', 'always'], // == / != 사용 시 에러</pre>

      <p class="mission-desc">검증을 위해 <code>SampleOne.vue</code>에 아래 코드를 일시적으로 삽입하고 저장했다.</p>
      <pre class="console">const userAge = 20
if (userAge == 20) {
  console.log('intentional loose comparison for eqeqeq lint test')
}</pre>

      <p class="mission-desc">에디터 물결선 툴팁과 <code>npm run lint</code> 실행 결과에 아래 에러가 그대로 검출되었다 (검증 후 코드는 원복).</p>
      <pre class="console">src/components/practices/basic/SampleOne.vue
  5:13  error  Expected '===' and instead saw '=='  eqeqeq</pre>
    </div>

    <div class="card">
      <h3>미션 2. Prettier 포맷팅</h3>
      <p class="mission-desc">임의의 컴포넌트 <code>&lt;script setup&gt;</code>에 정렬이 엉망인 아래 코드를 입력하고 <code>npm run format</code>을 실행했다.</p>
      <pre class="console">// 포맷팅 전
const     myRegion = `Suwon` ;
        const regionGreeting = `웰컴 투 ${myRegion}`;

// 포맷팅 후
const myRegion = `Suwon`
const regionGreeting = `웰컴 투 ${myRegion}`</pre>
      <p class="mission-desc">
        백틱(<code>`</code>)은 Prettier가 절대 다른 인용부호로 바꾸지 않으므로 그대로 유지되었고, <code>const</code>와 변수명 사이의 불필요한 공백·들여쓰기만
        1칸으로 정리되었다. 프로젝트에 <code>.prettierrc.json</code>(<code>semi: false, singleQuote: true</code>)이 없었던 것을 이번에 함께 추가해서, 세미콜론도
        규칙대로 제거된다.
      </p>
    </div>

    <div class="card">
      <h3>미션 3. 환경별 .env 파일 (VITE_API_URL)</h3>
      <p class="mission-desc">
        <code>.env.staging</code> → <code>VITE_API_URL=https://api-stage.skcc.com</code><br />
        <code>.env.production</code> → <code>VITE_API_URL=https://api-prod.skcc.com</code>
      </p>
      <button @click="runEnvCheck">환경변수 출력 (import.meta.env.VITE_API_URL)</button>
      <div class="console">MODE: {{ mode }} / VITE_API_URL: {{ apiUrl ?? '(undefined — dev 서버는 .env.staging/.env.production을 로드하지 않는다)' }}</div>
      <p class="mission-desc">
        <code>npm run build:staging</code>(= <code>vite build --mode staging</code>) 실행 시 터미널에 <code>building client environment for staging...</code>
        문구가 출력되어, Vite가 <code>.env.staging</code> 파일을 로드했음을 확인할 수 있었다.
      </p>
      <p class="mission-desc">
        <code>.env.staging</code> / <code>.env.production</code>은 <code>.gitignore</code>에 걸려 GitHub·Vercel에는 올라가지 않는다. 로컬 빌드에서는
        위처럼 파일 값이 바로 반영되지만, <strong>배포된 Vercel 사이트</strong>에서 실제 값을 보려면 Vercel 프로젝트의
        <strong>Settings → Environment Variables</strong>에 <code>VITE_API_URL</code>을 환경별로 등록하고 재배포해야 한다.
      </p>
    </div>

    <div class="card">
      <h3>미션 4. Production Build 산출물</h3>
      <p class="mission-desc"><code>npm run build</code> 실행 후 루트에 생성된 <code>dist/</code> 구조를 확인했다.</p>
      <pre class="console">dist/
├── index.html
└── assets/
    ├── index-DiblRG0r.js
    └── index-Ngetr0bM.css</pre>
      <p class="mission-desc">파일명은 <code>main-xxxx.js</code>가 아니라 Vite 기본 entry 이름인 <code>index-[해시].js</code> / <code>index-[해시].css</code> 형태로 생성되며, 해시값은 빌드할 때마다 콘텐츠 기준으로 새로 계산된다 (캐시 무효화 목적).</p>
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
.mission-desc {
  font-size: 14px;
  line-height: 1.6;
  color: #444;
  margin: 10px 0;
}
.mission-desc code {
  background: #eef1f6;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 13px;
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
  font-size: 13px;
  white-space: pre-wrap;
  overflow-x: auto;
}
</style>
