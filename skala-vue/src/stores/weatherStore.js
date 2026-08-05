import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

// 7. Axios : OpenWeatherMap 실시간 날씨 데이터를 가져와 대시보드 전역에서 공유하는 스토어.
// 도시 목록은 useWeatherSearch 의 Mock 데이터를 대체한다. (id/이름/주소는 고정, 기온·상태·습도·풍속만 API로 채운다.)
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather'

// [실습 8 확장 - 24시간 예보]
// 상세 화면의 기온/강수 그래프에 필요한 3시간 단위 예보 API를 추가했다.
const FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast'
const GEO_API_URL = 'https://api.openweathermap.org/geo/1.0/direct'
const IP_LOCATION_API_URL = 'https://ipwho.is/'

// [과제 확장 - 대기질 메뉴] Modern JavaScript 과제 확장: 새 메뉴(대기질 정보)에서 쓸 API.
// 별도 키 발급 없이 기존 OpenWeatherMap API_KEY를 그대로 재사용할 수 있는 무료 엔드포인트다.
const AIR_POLLUTION_API_URL = 'https://api.openweathermap.org/data/2.5/air_pollution'

// [과제 확장 - 도시 정보 메뉴] Modern JavaScript 과제 확장 2탄: 새 메뉴(도시 정보)에서 쓸 API 두 개.
// 둘 다 키 발급이 필요 없는 무료 API다.
const TIME_API_URL = 'https://timeapi.io/api/time/current/zone'
const WIKIPEDIA_SUMMARY_API_URL = 'https://ko.wikipedia.org/api/rest_v1/page/summary'
// "파리" 같은 동음이의어(곤충 vs 도시) 문서를 걸렀을 때, 실제 도시 문서를 다시 찾기 위한 검색 API.
const WIKIPEDIA_SEARCH_API_URL = 'https://ko.wikipedia.org/w/api.php'
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

// 검색어 일부(prefix)만 입력해도 여러 도시가 매칭되게 하려고 이 목록을 직접 준비했다.
// OpenWeatherMap Geocoding API(q=도시명)는 부분 일치를 지원하지 않는다
// (실제 확인 결과: q=코펜 → 전혀 다른 인도네시아 마을(Kopen)이 매칭됨, q=프랑크 → 결과 없음).
// 그래서 이미 알고 있는 도시 이름 목록(CITY_DIRECTORY) 안에서 먼저 부분 일치를 검색하고,
// 그 안에 없는 도시만 Geocoding으로 정확한 이름을 찾는 2단계 방식으로 설계했다.
// [과제 확장 - 도시 정보 메뉴] 각 도시에 IANA 타임존 문자열을 추가했다.
// 세계 시각(timeapi.io)은 위경도가 아니라 타임존 이름으로 조회하는 API라서 필요하다.
// 검색(Geocoding)으로 새로 찾은 도시는 타임존을 모르므로 undefined로 남고,
// 이후 로직에서는 city.timezone 존재 여부로 세계 시각 조회를 건너뛴다.
const CITY_DIRECTORY = [
  // 국내 주요 도시 (city_01~06는 초기 대시보드에 자동 로딩되는 기본 6개 도시)
  { id: 'city_01', name: '서울', address: '대한민국 서울특별시', lat: 37.5665, lon: 126.978, timezone: 'Asia/Seoul' },
  { id: 'city_02', name: '수원', address: '대한민국 경기도 수원시', lat: 37.2636, lon: 127.0286, timezone: 'Asia/Seoul' },
  { id: 'city_03', name: '부산', address: '대한민국 부산광역시', lat: 35.1796, lon: 129.0756, timezone: 'Asia/Seoul' },
  { id: 'city_04', name: '철원', address: '대한민국 강원특별자치도 철원군', lat: 38.1465, lon: 127.3132, timezone: 'Asia/Seoul' },
  { id: 'city_05', name: '광주', address: '대한민국 광주광역시', lat: 35.1595, lon: 126.8526, timezone: 'Asia/Seoul' },
  { id: 'city_06', name: '울산', address: '대한민국 울산광역시', lat: 35.5384, lon: 129.3114, timezone: 'Asia/Seoul' },
  { id: 'dir_incheon', name: '인천', address: '대한민국 인천광역시', lat: 37.4563, lon: 126.7052, timezone: 'Asia/Seoul' },
  { id: 'dir_daejeon', name: '대전', address: '대한민국 대전광역시', lat: 36.3504, lon: 127.3845, timezone: 'Asia/Seoul' },
  { id: 'dir_daegu', name: '대구', address: '대한민국 대구광역시', lat: 35.8714, lon: 128.6014, timezone: 'Asia/Seoul' },
  { id: 'dir_chuncheon', name: '춘천', address: '대한민국 강원특별자치도 춘천시', lat: 37.8813, lon: 127.7298, timezone: 'Asia/Seoul' },
  { id: 'dir_jeju', name: '제주', address: '대한민국 제주특별자치도 제주시', lat: 33.4996, lon: 126.5312, timezone: 'Asia/Seoul' },
  { id: 'dir_jeonju', name: '전주', address: '대한민국 전북특별자치도 전주시', lat: 35.8242, lon: 127.148, timezone: 'Asia/Seoul' },

  // 해외 주요 도시
  { id: 'dir_tokyo', name: '도쿄', address: '일본 도쿄도', lat: 35.6762, lon: 139.6503, timezone: 'Asia/Tokyo' },
  { id: 'dir_osaka', name: '오사카', address: '일본 오사카부', lat: 34.6937, lon: 135.5023, timezone: 'Asia/Tokyo' },
  { id: 'dir_beijing', name: '베이징', address: '중국 베이징시', lat: 39.9042, lon: 116.4074, timezone: 'Asia/Shanghai' },
  { id: 'dir_shanghai', name: '상하이', address: '중국 상하이시', lat: 31.2304, lon: 121.4737, timezone: 'Asia/Shanghai' },
  { id: 'dir_hongkong', name: '홍콩', address: '중국 홍콩', lat: 22.3193, lon: 114.1694, timezone: 'Asia/Hong_Kong' },
  { id: 'dir_taipei', name: '타이베이', address: '대만 타이베이시', lat: 25.033, lon: 121.5654, timezone: 'Asia/Taipei' },
  { id: 'dir_bangkok', name: '방콕', address: '태국 방콕', lat: 13.7563, lon: 100.5018, timezone: 'Asia/Bangkok' },
  { id: 'dir_singapore', name: '싱가포르', address: '싱가포르', lat: 1.3521, lon: 103.8198, timezone: 'Asia/Singapore' },
  { id: 'dir_newyork', name: '뉴욕', address: '미국 뉴욕주 뉴욕시', lat: 40.7128, lon: -74.006, timezone: 'America/New_York' },
  { id: 'dir_losangeles', name: '로스앤젤레스', address: '미국 캘리포니아주 로스앤젤레스', lat: 34.0522, lon: -118.2437, timezone: 'America/Los_Angeles' },
  { id: 'dir_london', name: '런던', address: '영국 런던', lat: 51.5074, lon: -0.1278, timezone: 'Europe/London' },
  { id: 'dir_paris', name: '파리', address: '프랑스 파리', lat: 48.8566, lon: 2.3522, timezone: 'Europe/Paris' },
  { id: 'dir_berlin', name: '베를린', address: '독일 베를린', lat: 52.52, lon: 13.405, timezone: 'Europe/Berlin' },
  { id: 'dir_frankfurt', name: '프랑크푸르트', address: '독일 헤센주 프랑크푸르트', lat: 50.1109, lon: 8.6821, timezone: 'Europe/Berlin' },
  { id: 'dir_copenhagen', name: '코펜하겐', address: '덴마크 코펜하겐', lat: 55.6761, lon: 12.5683, timezone: 'Europe/Copenhagen' },
  { id: 'dir_rome', name: '로마', address: '이탈리아 로마', lat: 41.9028, lon: 12.4964, timezone: 'Europe/Rome' },
  { id: 'dir_madrid', name: '마드리드', address: '스페인 마드리드', lat: 40.4168, lon: -3.7038, timezone: 'Europe/Madrid' },
  { id: 'dir_sydney', name: '시드니', address: '호주 뉴사우스웨일스주 시드니', lat: -33.8688, lon: 151.2093, timezone: 'Australia/Sydney' },
  { id: 'dir_dubai', name: '두바이', address: '아랍에미리트 두바이', lat: 25.2048, lon: 55.2708, timezone: 'Asia/Dubai' },
  { id: 'dir_moscow', name: '모스크바', address: '러시아 모스크바', lat: 55.7558, lon: 37.6173, timezone: 'Europe/Moscow' },
]

// [실습 8 확장 - 세계 도시 구성]
// 지구본에서 대륙별 날씨가 고르게 보이도록 기본 대시보드는 세계 도시로 구성한다.
// 기존 국내 도시는 CITY_DIRECTORY에 그대로 남아 검색으로 즉시 추가할 수 있다.
const DEFAULT_CITY_IDS = [
  'city_01',
  'city_03',
  'dir_tokyo',
  'dir_singapore',
  'dir_newyork',
  'dir_london',
  'dir_paris',
  'dir_sydney',
]
const CITY_CONFIG = CITY_DIRECTORY.filter((city) => DEFAULT_CITY_IDS.includes(city.id))

// 검색어 하나로 매칭되는 도시가 아주 많아질 수 있으므로(prefix 특성상), 화면에는 최대 5개까지만 보여준다.
const MAX_SEARCH_RESULTS = 5

// [과제 확장 - 검색 후보 리스트] "Paris"처럼 여러 나라에 같은 이름의 도시가 있을 수 있어서,
// Geocoding에는 여유 있게 요청한 뒤(같은 도시의 지역어 중복도 섞여 온다) 화면에는 최대 5개까지만 보여준다.
const GEOCODING_FETCH_LIMIT = 8
const MAX_GEOCODING_RESULTS = 5

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

// [과제 확장 - 도시 정보 버그 수정]
// "파리"로 위키 요약을 바로 조회하면 도시가 아니라 곤충(파리)을 설명하는 동음이의어
// 문서가 걸린다(위키백과에서 실제 확인: type이 "disambiguation"). 이런 경우에는
// MediaWiki 검색 API로 "{도시명} 도시"를 검색해 실제 도시 문서 제목을 찾고, 그 제목으로
// 요약을 다시 조회한다. 검색 결과가 없으면 원래(동음이의어) 응답이라도 그대로 반환한다.
//
// [한계] 이 이름 기반 검색은 "Paris"처럼 한글 이름이 없는 도시에서는 훨씬 유명한 동명의
// 다른 대상(예: 축구 구단 "파리 생제르맹 FC")을 잘못 고르기도 한다. 그래서 CITY_DIRECTORY
// 밖에서 검색으로 추가된 도시(id가 "search_"로 시작)에 한해 좌표 기반 GeoSearch를 먼저
// 시도한다 — 실제 텍사스주 Paris에서는 정확히 맞았지만, 도시 자체에 좌표 태그가 없거나
// (예: 켄터키주 Paris는 도시가 아니라 인근 카운티 문서가 걸림) 도심에 다른 시설(대사관 등)이
// 몰려 있는 경우엔 여전히 부정확할 수 있다. 그래서 이미 잘 맞고 있는 기본 8개 대시보드
// 도시(CITY_DIRECTORY)에는 이 GeoSearch 우선 조회를 적용하지 않는다.
async function resolveWikipediaSummary(city) {
  if (city.id.startsWith('search_')) {
    const geoTitle = await findNearestWikipediaTitle(city.lat, city.lon)
    if (geoTitle) {
      const geoResponse = await axios.get(`${WIKIPEDIA_SUMMARY_API_URL}/${encodeURIComponent(geoTitle)}`)
      if (geoResponse.data.type !== 'disambiguation') return geoResponse
    }
  }

  const directResponse = await axios.get(`${WIKIPEDIA_SUMMARY_API_URL}/${encodeURIComponent(city.name)}`)
  if (directResponse.data.type !== 'disambiguation') return directResponse

  const searchResponse = await axios.get(WIKIPEDIA_SEARCH_API_URL, {
    params: { action: 'query', list: 'search', srsearch: `${city.name} 도시`, format: 'json', srlimit: 1, origin: '*' },
  })

  // 배열 구조분해로 검색 결과 1건(top 1)만 바로 꺼낸다.
  const [topResult] = searchResponse.data.query.search
  if (!topResult) return directResponse

  return axios.get(`${WIKIPEDIA_SUMMARY_API_URL}/${encodeURIComponent(topResult.title)}`)
}

// 좌표에서 가장 가까운 위키백과 문서 제목을 찾는다(MediaWiki GeoSearch API).
// 이름이 아니라 위치로 찾기 때문에, 이름 검색이 엉뚱한 동명의 유명한 대상을 고르는 문제를 피한다.
async function findNearestWikipediaTitle(lat, lon) {
  const response = await axios.get(WIKIPEDIA_SEARCH_API_URL, {
    params: { action: 'query', list: 'geosearch', gscoord: `${lat}|${lon}`, gsradius: 10000, gslimit: 1, format: 'json', origin: '*' },
  })

  // 옵셔널 체이닝 + 널 병합: 반경 내에 문서가 없으면 조용히 null을 돌려주고 이름 검색으로 넘어간다.
  return response.data.query?.geosearch?.[0]?.title ?? null
}

export const useWeatherStore = defineStore('weather', () => {
  const weatherList = ref([])
  const isLoading = ref(false)
  const errorMessage = ref('')
  const hasFetched = ref(false)
  const isSearching = ref(false)
  const searchErrorMessage = ref('')
  // 검색으로 찾은 도시(들)를 담아두는 미리보기 목록. weatherList(대시보드 카드)와 분리해서,
  // 사용자가 "추가하기"를 눌러야만 weatherList로 옮겨지도록 한다.
  const searchResults = ref([])

  // [실습 8 확장 - 상세 예보 상태]
  // 도시별 예보를 id로 캐시하고, Element Plus Skeleton/Alert에 연결할 로딩·오류 상태를 관리한다.
  const forecastByCity = ref({})
  const forecastLoading = ref(false)
  const forecastError = ref('')
  const currentLocationCity = ref(null)
  const currentLocationSource = ref('')
  const currentLocationLoading = ref(false)
  const currentLocationError = ref('')

  // [과제 확장 - 대기질 상태] forecastByCity와 같은 방식으로 도시 id별 대기질 데이터를 캐시한다.
  const airQualityByCity = ref({})
  const isLoadingAirQuality = ref(false)
  const airQualityError = ref('')

  // [과제 확장 - 도시 정보 상태] 도시 id별로 { localTime, wiki } 를 캐시한다.
  const cityInsightsByCity = ref({})
  const isLoadingCityInsights = ref(false)
  const cityInsightsError = ref('')

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
          lat: city.lat,
          lon: city.lon,
          // [과제 확장 - 도시 정보 메뉴] 세계 시각 조회에 필요한 타임존을 함께 담아 보낸다.
          timezone: city.timezone,
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
  //   2) 하나도 없으면 CITY_DIRECTORY 밖의 임의 도시로 보고 Geocoding API로 후보 도시들을
  //      찾는다(이 경로는 부분 입력을 지원하지 않는다). "Paris"처럼 같은 이름의 도시가
  //      여러 나라에 있으면 후보를 전부(최대 5개) 반환해서 사용자가 직접 고르게 한다.
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
    searchResults.value = []

    try {
      const prefixResults = await searchByPrefix(trimmed)
      if (prefixResults.length > 0) {
        searchResults.value = prefixResults
        return prefixResults
      }

      // [과제 확장 - 검색 후보 리스트] "Paris" 같은 검색어는 나라별로 여러 도시가 매칭될 수 있어서
      // searchByGeocoding이 후보 배열(0~5개)을 반환한다.
      const geocodedResults = await searchByGeocoding(trimmed)
      if (geocodedResults.length === 0) {
        // [안내 멘트] Geocoding API는 한글 부분 일치를 지원하지 않아(위 CITY_DIRECTORY 주석 참고)
        // CITY_DIRECTORY 밖의 도시는 한글로 못 찾는 경우가 많다. 영어 재시도를 바로 안내한다.
        searchErrorMessage.value = `'${trimmed}'에 해당하는 도시를 찾을 수 없습니다. 영어 도시명(예: Tokyo, Paris)으로 다시 검색해 보세요.`
        return []
      }

      searchResults.value = geocodedResults
      return geocodedResults
    } catch {
      searchErrorMessage.value = '도시 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      return []
    } finally {
      isSearching.value = false
    }
  }

  // CITY_DIRECTORY 안에서 부분 일치하는 도시를 찾는다. 이미 weatherList 에 있는(=이미 대시보드에
  // 추가된) 도시는 다시 API를 부르지 않고 그대로 재사용해서 불필요한 호출을 줄인다. 아직 대시보드에
  // 없는 도시는 새로 fetch 하되, weatherList에는 넣지 않고 결과로만 반환한다("추가하기" 클릭 전까지는
  // 대시보드에 반영되지 않아야 하므로).
  async function searchByPrefix(trimmed) {
    const matches = CITY_DIRECTORY.filter((city) => city.name.includes(trimmed)).slice(0, MAX_SEARCH_RESULTS)
    if (matches.length === 0) return []

    const alreadyAdded = new Map(weatherList.value.map((city) => [city.id, city]))
    const toFetch = matches.filter((city) => !alreadyAdded.has(city.id))

    const fetchedCities =
      toFetch.length > 0
        ? await Promise.all(
            toFetch.map(async (city) => {
              const response = await axios.get(WEATHER_API_URL, {
                params: { lat: city.lat, lon: city.lon, appid: API_KEY, units: 'metric', lang: 'kr' },
              })
              const data = response.data

              return {
                id: city.id,
                name: city.name,
                address: city.address,
                temp: Math.round(data.main.temp),
                status: mapStatus(data),
                humidity: data.main.humidity,
                wind: data.wind.speed,
                lat: city.lat,
                lon: city.lon,
                // [과제 확장 - 도시 정보 메뉴] 세계 시각 조회에 필요한 타임존을 함께 담아 보낸다.
                timezone: city.timezone,
              }
            }),
          )
        : []

    const fetchedById = new Map(fetchedCities.map((city) => [city.id, city]))
    return matches.map((city) => alreadyAdded.get(city.id) ?? fetchedById.get(city.id))
  }

  // CITY_DIRECTORY 에 없는 임의 도시를 Geocoding API로 찾는다.
  // [과제 확장 - 검색 후보 리스트] 예전에는 limit:1로 첫 번째 결과 하나만 썼는데, "Paris"처럼
  // 같은 이름의 도시가 프랑스/미국(텍사스·켄터키주) 등 여러 나라에 있으면 항상 첫 매칭 하나만
  // 보여줘서 다른 나라의 동명 도시를 고를 방법이 없었다. 여유 있게 여러 개를 요청해 후보 배열로
  // 돌려주고, 사용자가 "검색 결과" 목록에서 원하는 도시를 직접 선택하게 한다.
  // "추가하기" 클릭 전까지는 weatherList(대시보드)에 반영하지 않고 후보 목록만 돌려준다.
  async function searchByGeocoding(trimmed) {
    const geoResponse = await axios.get(GEO_API_URL, {
      params: { q: trimmed, limit: GEOCODING_FETCH_LIMIT, appid: API_KEY },
    })

    if (geoResponse.data.length === 0) return []

    // Modern JS 포인트) Map을 이용해 "이름|국가|주(state)" 조합이 같은 중복 후보(OpenWeatherMap이
    // 같은 도시를 지역어별로 여러 번 반환하는 경우가 있다)를 걸러내고, 서로 다른 실제 도시만
    // 최대 MAX_GEOCODING_RESULTS개 남긴다.
    const uniquePlaces = [
      ...new Map(geoResponse.data.map((place) => [`${place.name}|${place.country}|${place.state ?? ''}`, place])).values(),
    ].slice(0, MAX_GEOCODING_RESULTS)

    // 좌표(id) 또는 이름으로 이미 대시보드에 있는 도시는 다시 API를 부르지 않고 그대로 재사용한다.
    const normalize = (name) => name.replace(/\s+/g, '')

    return Promise.all(
      uniquePlaces.map(async (place) => {
        const id = `search_${place.lat.toFixed(2)}_${place.lon.toFixed(2)}`
        const displayName = place.local_names?.ko ?? place.name

        const existing = weatherList.value.find(
          (city) => city.id === id || normalize(city.name) === normalize(displayName),
        )
        if (existing) return existing

        const weatherResponse = await axios.get(WEATHER_API_URL, {
          params: { lat: place.lat, lon: place.lon, appid: API_KEY, units: 'metric', lang: 'kr' },
        })

        const data = weatherResponse.data

        // Modern JS 포인트) state 유무에 따라 주소 문자열을 다르게 구성해서, 같은 이름의 도시를
        // 나라/주 단위로 구분할 수 있게 한다(예: "Paris, Ile-de-France, FR" vs "Paris, Texas, US").
        const address =
          place.country === 'KR'
            ? `대한민국 ${displayName}`
            : [place.name, place.state, place.country].filter(Boolean).join(', ')

        return {
          id,
          name: displayName,
          address,
          temp: Math.round(data.main.temp),
          status: mapStatus(data),
          humidity: data.main.humidity,
          wind: data.wind.speed,
          lat: place.lat,
          lon: place.lon,
        }
      }),
    )
  }

  // [실습 8 확장 - 예보 API 로직]
  // 상세 화면의 24시간 기온/강수량 차트용 3시간 단위 예보를 조회한다.
  // OpenWeatherMap 5 day / 3 hour forecast는 무료 API key에서도 사용 가능하다.
  async function fetchCityForecast(city) {
    if (!city || forecastByCity.value[city.id] || forecastLoading.value) return

    forecastLoading.value = true
    forecastError.value = ''

    try {
      const response = await axios.get(FORECAST_API_URL, {
        params: { lat: city.lat, lon: city.lon, appid: API_KEY, units: 'metric', lang: 'kr' },
      })

      forecastByCity.value = {
        ...forecastByCity.value,
        [city.id]: response.data.list.slice(0, 8).map((item) => ({
          time: new Date(item.dt * 1000).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          hour: new Date(item.dt * 1000).getHours(),
          temp: Math.round(item.main.temp),
          precipitation: Math.round((item.pop ?? 0) * 100),
          status: mapStatus(item),
        })),
      }
    } catch {
      forecastError.value = '시간대별 예보를 불러오지 못했습니다.'
    } finally {
      forecastLoading.value = false
    }
  }

  // [과제 확장 - 대기질 API 로직]
  // 대시보드 도시들의 미세먼지·대기질 지수를 한 번에 조회한다.
  // fetchCityForecast와 같은 캐시 전략: 이미 값이 있는 도시는 다시 요청하지 않는다.
  // Modern JS 포인트) Promise.all로 여러 도시를 병렬 요청하고, 각 응답은 중첩 구조분해
  // (list: [{ main: { aqi }, components }])로 필요한 값만 바로 꺼낸다.
  async function fetchAirQuality(cities) {
    if (!API_KEY || !cities || cities.length === 0) return

    const targets = cities.filter((city) => !airQualityByCity.value[city.id])
    if (targets.length === 0) return

    isLoadingAirQuality.value = true
    airQualityError.value = ''

    try {
      const responses = await Promise.all(
        targets.map((city) =>
          axios.get(AIR_POLLUTION_API_URL, {
            params: { lat: city.lat, lon: city.lon, appid: API_KEY },
          }),
        ),
      )

      // Modern JS 포인트) Object.fromEntries + map으로 [id, 데이터] 쌍의 배열을
      // 객체로 한 번에 변환하고, 스프레드로 기존 캐시(airQualityByCity)에 불변 병합한다.
      const fetchedEntries = responses.map((response, index) => {
        const city = targets[index]
        const {
          list: [{ main: { aqi } = {}, components = {} }],
        } = response.data

        return [
          city.id,
          {
            aqi: aqi ?? null,
            // 옵셔널 체이닝 + 널 병합: 특정 성분이 응답에 없어도 화면이 깨지지 않게 기본값 0을 준다.
            pm2_5: components?.pm2_5 ?? 0,
            pm10: components?.pm10 ?? 0,
            o3: components?.o3 ?? 0,
          },
        ]
      })

      airQualityByCity.value = {
        ...airQualityByCity.value,
        ...Object.fromEntries(fetchedEntries),
      }
    } catch {
      airQualityError.value = '대기질 정보를 불러오지 못했습니다.'
    } finally {
      isLoadingAirQuality.value = false
    }
  }

  // [과제 확장 - 도시 정보 API 로직]
  // 도시별 "현지 시각"(timeapi.io)과 "위키백과 요약"(Wikipedia REST API)을 함께 조회한다.
  // 두 API는 서로 무관하므로 하나가 실패해도(예: 검색으로 추가된 도시는 timezone이 없음,
  // 위키에 문서가 없는 도시) 나머지 하나는 살리기 위해 Promise.all이 아니라 Promise.allSettled를 쓴다.
  async function fetchCityInsights(cities) {
    if (!cities || cities.length === 0) return

    const targets = cities.filter((city) => !cityInsightsByCity.value[city.id])
    if (targets.length === 0) return

    isLoadingCityInsights.value = true
    cityInsightsError.value = ''

    try {
      // 도시마다 [현지 시각, 위키 요약] 두 요청을 병렬로 보내고, 도시들끼리도 Promise.all로 동시에 처리한다.
      const results = await Promise.all(
        targets.map(async (city) => {
          const [timeResult, wikiResult] = await Promise.allSettled([
            city.timezone
              ? axios.get(TIME_API_URL, { params: { timeZone: city.timezone } })
              : Promise.reject(new Error('타임존 정보 없음')),
            // "파리"(도시) vs "파리"(곤충)처럼 동음이의어 문서가 걸리는 경우까지 처리하는 헬퍼.
            resolveWikipediaSummary(city),
          ])

          // 구조분해로 필요한 필드만 꺼낸다. 실패한 요청은 null로 남겨 화면에서 옵셔널 체이닝으로 처리한다.
          let localTime = null
          if (timeResult.status === 'fulfilled') {
            const { hour, minute, dayOfWeek } = timeResult.value.data
            localTime = { hour, minute, dayOfWeek }
          }

          let wiki = null
          if (wikiResult.status === 'fulfilled') {
            const { extract, thumbnail } = wikiResult.value.data
            wiki = { extract, thumbnail: thumbnail?.source ?? null }
          }

          return [city.id, { localTime, wiki }]
        }),
      )

      // Object.fromEntries + 스프레드로 [id, 데이터] 쌍 배열을 기존 캐시에 불변 병합한다.
      cityInsightsByCity.value = {
        ...cityInsightsByCity.value,
        ...Object.fromEntries(results),
      }
    } catch {
      cityInsightsError.value = '도시 정보를 불러오지 못했습니다.'
    } finally {
      isLoadingCityInsights.value = false
    }
  }

  // [현재 위치 날씨] 브라우저가 제공한 위도/경도로 현재 날씨를 조회한다.
  // 위치 권한을 거부한 경우는 API를 호출하지 않고 화면에서 서울 기준으로 대체한다.
  async function fetchWeatherByCoordinates(lat, lon, source = 'device') {
    if (!API_KEY) {
      currentLocationError.value = 'OpenWeather API 키가 필요합니다.'
      return null
    }

    currentLocationLoading.value = true
    currentLocationError.value = ''

    try {
      const response = await axios.get(WEATHER_API_URL, {
        params: { lat, lon, appid: API_KEY, units: 'metric', lang: 'kr' },
      })
      const data = response.data
      const locationName = data.name || '현재 위치'

      currentLocationCity.value = {
        id: 'current_location',
        name: locationName,
        address: data.sys?.country ? `${locationName}, ${data.sys.country}` : '현재 위치',
        temp: Math.round(data.main.temp),
        status: mapStatus(data),
        humidity: data.main.humidity,
        wind: data.wind.speed,
        lat: data.coord?.lat ?? lat,
        lon: data.coord?.lon ?? lon,
      }
      currentLocationSource.value = source

      return currentLocationCity.value
    } catch {
      currentLocationError.value = '현재 위치의 날씨를 불러오지 못했습니다.'
      return null
    } finally {
      currentLocationLoading.value = false
    }
  }

  // 브라우저/운영체제가 GPS·Wi-Fi 좌표를 제공하지 못하는 경우의 2차 대체 방법.
  // 공인 IP의 도시 수준 대략적 위치를 얻어 Today's Brief가 항상 현재 지역을 기준으로 작동하게 한다.
  async function fetchApproximateLocationWeather() {
    currentLocationError.value = ''

    try {
      const response = await axios.get(IP_LOCATION_API_URL)
      const place = response.data

      if (!place.success || !Number.isFinite(place.latitude) || !Number.isFinite(place.longitude)) {
        throw new Error('IP location unavailable')
      }

      return await fetchWeatherByCoordinates(place.latitude, place.longitude, 'network')
    } catch {
      currentLocationError.value = '현재 지역을 확인하지 못했습니다.'
      return null
    }
  }

  // "추가하기" 클릭 시 검색 미리보기(searchResults)의 도시를 대시보드(weatherList)로 옮긴다.
  function addCityToDashboard(city) {
    const alreadyAdded = weatherList.value.some((existing) => existing.id === city.id)
    if (!alreadyAdded) {
      weatherList.value = [...weatherList.value, city]
    }
    searchResults.value = searchResults.value.filter((result) => result.id !== city.id)
  }

  return {
    weatherList,
    isLoading,
    errorMessage,
    hasFetched,
    isSearching,
    searchErrorMessage,
    searchResults,
    forecastByCity,
    forecastLoading,
    forecastError,
    currentLocationCity,
    currentLocationSource,
    currentLocationLoading,
    currentLocationError,
    // [과제 확장 - 대기질 상태/액션] 컴포저블·뷰에서 쓸 수 있도록 함께 반환한다.
    airQualityByCity,
    isLoadingAirQuality,
    airQualityError,
    // [과제 확장 - 도시 정보 상태/액션] 컴포저블·뷰에서 쓸 수 있도록 함께 반환한다.
    cityInsightsByCity,
    isLoadingCityInsights,
    cityInsightsError,
    fetchWeatherList,
    searchCity,
    addCityToDashboard,
    fetchCityForecast,
    fetchAirQuality,
    fetchCityInsights,
    fetchWeatherByCoordinates,
    fetchApproximateLocationWeather,
  }
})
