<script setup>
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'

const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather'
const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY

const city = ref('Seoul')
const weather = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')

const hasApiKey = computed(() => Boolean(apiKey && apiKey !== 'your_openweather_api_key'))
const weatherIconUrl = computed(() => {
  const icon = weather.value?.weather?.[0]?.icon
  return icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : ''
})

async function fetchWeather() {
  if (!hasApiKey.value) {
    errorMessage.value = '.env 파일에 OpenWeather API 키를 먼저 설정해주세요.'
    return
  }

  if (!city.value.trim()) {
    errorMessage.value = '조회할 도시명을 입력해주세요.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await axios.get(WEATHER_API_URL, {
      params: {
        q: city.value.trim(),
        appid: apiKey,
        units: 'metric',
        lang: 'kr',
      },
    })

    weather.value = response.data
  } catch (error) {
    const status = error.response?.status

    if (status === 401) {
      errorMessage.value = 'API 키가 올바르지 않거나 아직 활성화되지 않았습니다.'
    } else if (status === 404) {
      errorMessage.value = '도시를 찾지 못했습니다. 영문 도시명으로 다시 검색해주세요.'
    } else if (status === 429) {
      errorMessage.value = 'API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
    } else {
      errorMessage.value = '날씨 정보를 불러오지 못했습니다. 네트워크 상태를 확인해주세요.'
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (hasApiKey.value) {
    fetchWeather()
  }
})
</script>

<template>
  <div class="practice-section weather-practice">
    <div class="api-example-heading">
      <div>
        <span>OPENWEATHER · GET</span>
        <h2>Axios Weather Example</h2>
        <p>도시명을 전달하고 현재 날씨 JSON 데이터를 받아 화면에 표시합니다.</p>
      </div>
      <span class="api-status" :class="{ ready: hasApiKey }">{{ hasApiKey ? 'API KEY READY' : 'API KEY REQUIRED' }}</span>
    </div>

    <div v-if="!hasApiKey" class="key-guide">
      <strong>API 키 설정이 필요합니다.</strong>
      <p><code>.env.example</code>을 복사해 <code>.env</code>로 만든 후 발급받은 키를 입력해주세요.</p>
      <code>VITE_OPENWEATHER_API_KEY=발급받은_API_KEY</code>
    </div>

    <form class="weather-search" @submit.prevent="fetchWeather">
      <label for="weather-city">도시명</label>
      <input id="weather-city" v-model.trim="city" type="text" placeholder="예: Seoul, Busan, Jeju" />
      <button type="submit" class="primary-action" :disabled="isLoading">
        {{ isLoading ? '조회 중...' : '날씨 조회' }}
      </button>
    </form>

    <p v-if="errorMessage" class="api-error" role="alert">{{ errorMessage }}</p>

    <div v-if="weather" class="weather-result">
      <div class="weather-main">
        <img v-if="weatherIconUrl" :src="weatherIconUrl" :alt="weather.weather[0].description" />
        <div>
          <span>{{ weather.sys.country }} · {{ weather.name }}</span>
          <strong>{{ Math.round(weather.main.temp) }}°</strong>
          <p>{{ weather.weather[0].description }}</p>
        </div>
      </div>

      <dl class="weather-details">
        <div>
          <dt>체감 온도</dt>
          <dd>{{ Math.round(weather.main.feels_like) }}°C</dd>
        </div>
        <div>
          <dt>습도</dt>
          <dd>{{ weather.main.humidity }}%</dd>
        </div>
        <div>
          <dt>풍속</dt>
          <dd>{{ weather.wind.speed }}m/s</dd>
        </div>
        <div>
          <dt>기압</dt>
          <dd>{{ weather.main.pressure }}hPa</dd>
        </div>
      </dl>
    </div>

    <details class="response-preview">
      <summary>Axios 요청 코드 확인</summary>
      <pre><code>axios.get('/data/2.5/weather', {
  params: { q: city, appid: apiKey, units: 'metric', lang: 'kr' }
})</code></pre>
    </details>
  </div>
</template>

<style scoped>
.api-example-heading,
.weather-search,
.weather-main {
  display: flex;
  align-items: center;
}

.api-example-heading {
  justify-content: space-between;
  gap: 18px;
}

.api-example-heading > div > span,
.weather-main span {
  color: #087a55;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.api-example-heading h2 {
  margin-top: 3px;
}

.api-example-heading p {
  margin: 0;
  color: #667085;
}

.api-status {
  flex: 0 0 auto;
  padding: 6px 10px;
  border-radius: 999px;
  background: #fff4e5;
  color: #b54708;
  font-size: 10px;
  font-weight: 800;
}

.api-status.ready {
  background: #e8fff5;
  color: #087a55;
}

.key-guide {
  padding: 16px;
  margin-top: 18px;
  border: 1px solid #fedf89;
  border-radius: 12px;
  background: #fffaeb;
  color: #7a2e0e;
}

.key-guide p {
  margin: 5px 0 10px;
}

.key-guide code,
.response-preview code {
  font-family: 'SFMono-Regular', Consolas, monospace;
}

.key-guide > code {
  display: block;
  padding: 8px 10px;
  overflow-wrap: anywhere;
  border-radius: 7px;
  background: #fff3cd;
  font-size: 12px;
}

.weather-search {
  gap: 9px;
  padding: 16px;
  margin-top: 18px;
  border-radius: 12px;
  background: #f2f7f9;
}

.weather-search label {
  flex: 0 0 auto;
  color: #475467;
  font-size: 12px;
  font-weight: 800;
}

.weather-search input {
  flex: 1 1 auto;
  min-width: 120px;
}

.api-error {
  padding: 10px 12px;
  border-radius: 8px;
  background: #fff1f3;
  color: #c01048;
  font-size: 13px;
}

.weather-result {
  display: grid;
  grid-template-columns: minmax(220px, 0.9fr) minmax(300px, 1.1fr);
  gap: 18px;
  padding: 20px;
  margin-top: 18px;
  border-radius: 16px;
  background: linear-gradient(135deg, #17324d, #176b75);
  color: white;
}

.weather-main {
  gap: 8px;
}

.weather-main img {
  width: 90px;
  height: 90px;
}

.weather-main span {
  color: #9ee5d3;
}

.weather-main strong {
  display: block;
  font-size: 48px;
  line-height: 1;
}

.weather-main p {
  margin: 5px 0 0;
  color: #d8eeeb;
}

.weather-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin: 0;
}

.weather-details > div {
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
}

.weather-details dt {
  color: #b9d8d6;
  font-size: 11px;
}

.weather-details dd {
  margin: 3px 0 0;
  font-weight: 800;
}

.response-preview {
  margin-top: 18px;
  color: #475467;
  font-size: 13px;
}

.response-preview summary {
  cursor: pointer;
  font-weight: 700;
}

.response-preview pre {
  padding: 13px;
  overflow: auto;
  border-radius: 9px;
  background: #101828;
  color: #d1fadf;
  font-size: 12px;
}

@media (max-width: 720px) {
  .api-example-heading,
  .weather-search {
    align-items: flex-start;
    flex-direction: column;
  }

  .weather-search input,
  .weather-search button {
    width: 100%;
  }

  .weather-result {
    grid-template-columns: 1fr;
  }
}
</style>
