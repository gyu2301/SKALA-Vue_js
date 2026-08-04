import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

// 7. Axios : OpenWeatherMap 실시간 날씨 데이터를 가져와 대시보드 전역에서 공유하는 스토어.
// 도시 목록은 useWeatherSearch 의 Mock 데이터를 대체한다. (id/이름/주소는 고정, 기온·상태·습도·풍속만 API로 채운다.)
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather'
const GEO_API_URL = 'https://api.openweathermap.org/geo/1.0/direct'
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

// 검색어 일부(prefix)만 입력해도 여러 도시가 매칭되게 하려고 이 목록을 직접 준비했다.
// OpenWeatherMap Geocoding API(q=도시명)는 부분 일치를 지원하지 않는다
// (실제 확인 결과: q=코펜 → 전혀 다른 인도네시아 마을(Kopen)이 매칭됨, q=프랑크 → 결과 없음).
// 그래서 이미 알고 있는 도시 이름 목록(CITY_DIRECTORY) 안에서 먼저 부분 일치를 검색하고,
// 그 안에 없는 도시만 Geocoding으로 정확한 이름을 찾는 2단계 방식으로 설계했다.
const CITY_DIRECTORY = [
  // 국내 주요 도시 (city_01~06는 초기 대시보드에 자동 로딩되는 기본 6개 도시)
  { id: 'city_01', name: '서울', address: '대한민국 서울특별시', lat: 37.5665, lon: 126.978 },
  { id: 'city_02', name: '수원', address: '대한민국 경기도 수원시', lat: 37.2636, lon: 127.0286 },
  { id: 'city_03', name: '부산', address: '대한민국 부산광역시', lat: 35.1796, lon: 129.0756 },
  { id: 'city_04', name: '철원', address: '대한민국 강원특별자치도 철원군', lat: 38.1465, lon: 127.3132 },
  { id: 'city_05', name: '광주', address: '대한민국 광주광역시', lat: 35.1595, lon: 126.8526 },
  { id: 'city_06', name: '울산', address: '대한민국 울산광역시', lat: 35.5384, lon: 129.3114 },
  { id: 'dir_incheon', name: '인천', address: '대한민국 인천광역시', lat: 37.4563, lon: 126.7052 },
  { id: 'dir_daejeon', name: '대전', address: '대한민국 대전광역시', lat: 36.3504, lon: 127.3845 },
  { id: 'dir_daegu', name: '대구', address: '대한민국 대구광역시', lat: 35.8714, lon: 128.6014 },
  { id: 'dir_chuncheon', name: '춘천', address: '대한민국 강원특별자치도 춘천시', lat: 37.8813, lon: 127.7298 },
  { id: 'dir_jeju', name: '제주', address: '대한민국 제주특별자치도 제주시', lat: 33.4996, lon: 126.5312 },
  { id: 'dir_jeonju', name: '전주', address: '대한민국 전북특별자치도 전주시', lat: 35.8242, lon: 127.148 },

  // 해외 주요 도시
  { id: 'dir_tokyo', name: '도쿄', address: '일본 도쿄도', lat: 35.6762, lon: 139.6503 },
  { id: 'dir_osaka', name: '오사카', address: '일본 오사카부', lat: 34.6937, lon: 135.5023 },
  { id: 'dir_beijing', name: '베이징', address: '중국 베이징시', lat: 39.9042, lon: 116.4074 },
  { id: 'dir_shanghai', name: '상하이', address: '중국 상하이시', lat: 31.2304, lon: 121.4737 },
  { id: 'dir_hongkong', name: '홍콩', address: '중국 홍콩', lat: 22.3193, lon: 114.1694 },
  { id: 'dir_taipei', name: '타이베이', address: '대만 타이베이시', lat: 25.033, lon: 121.5654 },
  { id: 'dir_bangkok', name: '방콕', address: '태국 방콕', lat: 13.7563, lon: 100.5018 },
  { id: 'dir_singapore', name: '싱가포르', address: '싱가포르', lat: 1.3521, lon: 103.8198 },
  { id: 'dir_newyork', name: '뉴욕', address: '미국 뉴욕주 뉴욕시', lat: 40.7128, lon: -74.006 },
  { id: 'dir_losangeles', name: '로스앤젤레스', address: '미국 캘리포니아주 로스앤젤레스', lat: 34.0522, lon: -118.2437 },
  { id: 'dir_london', name: '런던', address: '영국 런던', lat: 51.5074, lon: -0.1278 },
  { id: 'dir_paris', name: '파리', address: '프랑스 파리', lat: 48.8566, lon: 2.3522 },
  { id: 'dir_berlin', name: '베를린', address: '독일 베를린', lat: 52.52, lon: 13.405 },
  { id: 'dir_frankfurt', name: '프랑크푸르트', address: '독일 헤센주 프랑크푸르트', lat: 50.1109, lon: 8.6821 },
  { id: 'dir_copenhagen', name: '코펜하겐', address: '덴마크 코펜하겐', lat: 55.6761, lon: 12.5683 },
  { id: 'dir_rome', name: '로마', address: '이탈리아 로마', lat: 41.9028, lon: 12.4964 },
  { id: 'dir_madrid', name: '마드리드', address: '스페인 마드리드', lat: 40.4168, lon: -3.7038 },
  { id: 'dir_sydney', name: '시드니', address: '호주 뉴사우스웨일스주 시드니', lat: -33.8688, lon: 151.2093 },
  { id: 'dir_dubai', name: '두바이', address: '아랍에미리트 두바이', lat: 25.2048, lon: 55.2708 },
  { id: 'dir_moscow', name: '모스크바', address: '러시아 모스크바', lat: 55.7558, lon: 37.6173 },
]

const DEFAULT_CITY_IDS = ['city_01', 'city_02', 'city_03', 'city_04', 'city_05', 'city_06']
const CITY_CONFIG = CITY_DIRECTORY.filter((city) => DEFAULT_CITY_IDS.includes(city.id))

// 검색어 하나로 매칭되는 도시가 아주 많아질 수 있으므로(prefix 특성상), 화면에는 최대 5개까지만 보여준다.
const MAX_SEARCH_RESULTS = 5

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
  const isSearching = ref(false)
  const searchErrorMessage = ref('')

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

  /**
   * 도시 검색 카드 중복 버그 수정 기록
   * ------------------------------------------------------------------------
   * 증상: 검색창에 "파리", "뉴욕"처럼 한글 도시명을 입력하고 Enter를 누르면
   *       같은 도시 카드가 두 개씩 추가됨.
   *
   * 원인 1) SearchBar.vue 의 keyup.enter 핸들러가 한글 IME 조합을 확정하는
   *         Enter와 실제 제출용 Enter를 구분하지 못해 select-first 이벤트가
   *         두 번 emit됨 → 이 아래 searchCity()가 같은 검색어로 두 번 호출됨.
   *         (해결: SearchBar.vue의 handleEnter에 event.isComposing 가드 추가)
   *
   * 원인 2) 위 두 번의 호출이 동시에(concurrent) 실행되면, 아직 weatherList에
   *         반영되기 전이라 "이미 있는 도시인지" 확인하는 중복 체크를 둘 다
   *         통과해버려서 동일 도시가 두 번 push됨.
   *         (해결: 같은 검색어가 진행 중이면 새 axios 호출 없이 pendingSearches에
   *          저장된 진행 중인 Promise를 그대로 재사용하도록 변경 -> 바로 아래)
   *
   * 원인 3) 중복 체크가 좌표 기반 id(`search_lat_lon`)만 비교해서, 이미 기본
   *         6개 도시 목록(city_01~06)에 있는 도시를 검색으로 다시 찾으면
   *         id 형식이 달라 중복으로 추가될 여지가 있었음.
   *         (해결: performSearch에서 id뿐 아니라 도시 이름(공백 제거 후)도
   *          함께 비교하도록 변경)
   * ------------------------------------------------------------------------
   */
  const pendingSearches = new Map()

  // 도시를 검색한다. 결과는 항상 배열(0~5개)로 반환한다.
  //   1) CITY_DIRECTORY 안에서 이름에 검색어가 포함되는 도시를 최대 5개까지 찾는다.
  //      ('울' → 울산/서울, '프랑크' → 프랑크푸르트 처럼 부분 입력도 매칭된다)
  //   2) 하나도 없으면 CITY_DIRECTORY 밖의 임의 도시로 보고 Geocoding API로 정확한
  //      이름 하나를 찾는다(이 경로는 부분 입력을 지원하지 않는다).
  function searchCity(query) {
    const trimmed = query.trim()
    if (!trimmed || !API_KEY) return Promise.resolve([])

    if (pendingSearches.has(trimmed)) {
      return pendingSearches.get(trimmed)
    }

    const promise = performSearch(trimmed).finally(() => {
      pendingSearches.delete(trimmed)
    })
    pendingSearches.set(trimmed, promise)
    return promise
  }

  async function performSearch(trimmed) {
    isSearching.value = true
    searchErrorMessage.value = ''

    try {
      const prefixResults = await searchByPrefix(trimmed)
      if (prefixResults.length > 0) return prefixResults

      const exactResult = await searchByGeocoding(trimmed)
      if (!exactResult) {
        searchErrorMessage.value = `'${trimmed}'에 해당하는 도시를 찾을 수 없습니다. 다른 이름으로 검색해 보세요.`
        return []
      }

      return [exactResult]
    } catch {
      searchErrorMessage.value = '도시 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      return []
    } finally {
      isSearching.value = false
    }
  }

  // CITY_DIRECTORY 안에서 부분 일치하는 도시를 찾는다. 이미 weatherList 에 있는(=이미
  // 조회해본) 도시는 다시 API를 부르지 않고 그대로 재사용해서 불필요한 호출을 줄인다.
  async function searchByPrefix(trimmed) {
    const matches = CITY_DIRECTORY.filter((city) => city.name.includes(trimmed)).slice(0, MAX_SEARCH_RESULTS)
    if (matches.length === 0) return []

    const toFetch = matches.filter((city) => !weatherList.value.some((existing) => existing.id === city.id))

    if (toFetch.length > 0) {
      const responses = await Promise.all(
        toFetch.map((city) =>
          axios.get(WEATHER_API_URL, {
            params: { lat: city.lat, lon: city.lon, appid: API_KEY, units: 'metric', lang: 'kr' },
          }),
        ),
      )

      const fetchedCities = responses.map((response, index) => {
        const city = toFetch[index]
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

      weatherList.value = [...weatherList.value, ...fetchedCities]
    }

    return weatherList.value.filter((city) => matches.some((match) => match.id === city.id))
  }

  // CITY_DIRECTORY 에 없는 임의 도시를 Geocoding API로 찾는다(정확한 이름 필요).
  async function searchByGeocoding(trimmed) {
    const geoResponse = await axios.get(GEO_API_URL, {
      params: { q: trimmed, limit: 1, appid: API_KEY },
    })

    const place = geoResponse.data[0]
    if (!place) return null

    const id = `search_${place.lat.toFixed(2)}_${place.lon.toFixed(2)}`
    const displayName = place.local_names?.ko ?? place.name

    // 좌표(id)뿐 아니라 이름으로도 중복을 확인한다. 기본/디렉터리 도시를 다시 검색하면
    // 좌표 기반 id는 서로 다르게 계산되므로, 이름이 같으면 기존 카드를 재사용한다.
    const normalize = (name) => name.replace(/\s+/g, '')
    const existing = weatherList.value.find(
      (city) => city.id === id || normalize(city.name) === normalize(displayName),
    )
    if (existing) return existing

    const weatherResponse = await axios.get(WEATHER_API_URL, {
      params: { lat: place.lat, lon: place.lon, appid: API_KEY, units: 'metric', lang: 'kr' },
    })

    const data = weatherResponse.data

    const city = {
      id,
      name: displayName,
      address: place.country === 'KR' ? `대한민국 ${displayName}` : `${place.name}, ${place.country}`,
      temp: Math.round(data.main.temp),
      status: mapStatus(data),
      humidity: data.main.humidity,
      wind: data.wind.speed,
    }

    weatherList.value = [...weatherList.value, city]
    return city
  }

  return {
    weatherList,
    isLoading,
    errorMessage,
    hasFetched,
    isSearching,
    searchErrorMessage,
    fetchWeatherList,
    searchCity,
  }
})
