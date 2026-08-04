import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

// 7. Axios : OpenWeatherMap 실시간 날씨 데이터를 가져와 대시보드 전역에서 공유하는 스토어.
// 도시 목록은 useWeatherSearch 의 Mock 데이터를 대체한다. (id/이름/주소는 고정, 기온·상태·습도·풍속만 API로 채운다.)
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather'
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

const CITY_CONFIG = [
  { id: 'city_01', name: '서울', address: '대한민국 서울특별시', lat: 37.5665, lon: 126.978 },
  { id: 'city_02', name: '수원', address: '대한민국 경기도 수원시', lat: 37.2636, lon: 127.0286 },
  { id: 'city_03', name: '부산', address: '대한민국 부산광역시', lat: 35.1796, lon: 129.0756 },
  { id: 'city_04', name: '철원', address: '대한민국 강원특별자치도 철원군', lat: 38.1465, lon: 127.3132 },
  { id: 'city_05', name: '광주', address: '대한민국 광주광역시', lat: 35.1595, lon: 126.8526 },
  { id: 'city_06', name: '울산', address: '대한민국 울산광역시', lat: 35.5384, lon: 129.3114 },
]

// WeatherCard 의 STATUS_ICON(맑음/비/구름/흐림/눈)에 맞춰 OpenWeatherMap 응답을 분류한다.
// main 은 항상 영문이라 lang 파라미터와 무관하게 직접 매핑이 필요하다.
function mapStatus(data) {
  const main = data.weather?.[0]?.main
  const cloudiness = data.clouds?.all ?? 0

  if (['Rain', 'Drizzle', 'Thunderstorm'].includes(main)) return '비'
  if (main === 'Snow') return '눈'
  if (main === 'Clear') return '맑음'
  if (main === 'Clouds') return cloudiness > 50 ? '흐림' : '구름'
  return '흐림'
}

export const useWeatherStore = defineStore('weather', () => {
  const weatherList = ref([])
  const isLoading = ref(false)
  const errorMessage = ref('')
  const hasFetched = ref(false)

  async function fetchWeatherList() {
    if (!API_KEY) {
      errorMessage.value = '.env 파일에 OpenWeather API 키를 먼저 설정해주세요.'
      return
    }

    isLoading.value = true
    errorMessage.value = ''

    try {
      const responses = await Promise.all(
        CITY_CONFIG.map((city) =>
          axios.get(WEATHER_API_URL, {
            params: { lat: city.lat, lon: city.lon, appid: API_KEY, units: 'metric', lang: 'kr' },
          }),
        ),
      )

      weatherList.value = responses.map((response, index) => {
        const city = CITY_CONFIG[index]
        const data = response.data

        return {
          id: city.id,
          name: city.name,
          address: city.address,
          temp: Math.round(data.main.temp),
          status: mapStatus(data),
          humidity: data.main.humidity,
          wind: data.wind.speed,
        }
      })
    } catch (error) {
      const status = error.response?.status

      if (status === 401) {
        errorMessage.value = 'API 키가 올바르지 않거나 아직 활성화되지 않았습니다.'
      } else if (status === 429) {
        errorMessage.value = 'API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
      } else {
        errorMessage.value = '날씨 정보를 불러오지 못했습니다. 네트워크 상태를 확인해주세요.'
      }
    } finally {
      isLoading.value = false
      hasFetched.value = true
    }
  }

  return { weatherList, isLoading, errorMessage, hasFetched, fetchWeatherList }
})
