// [과제 확장 - 대기질 메뉴] weatherThresholds.js 와 같은 방식으로, 대기질 카드와
// 요약 스트립이 함께 참조하는 AQI(1~5) 기준값을 한 곳에 모아둔다.
// OpenWeatherMap Air Pollution API의 main.aqi 는 1(매우 좋음)~5(매우 나쁨) 정수로 온다.
// Map을 쓴 이유: 객체 리터럴 대신 숫자 키를 그대로 쓸 수 있고, .get(aqi) 로 조회할 때
// 정의되지 않은 값이면 undefined 를 자연스럽게 돌려줘서 호출부의 옵셔널 체이닝(?.)과 잘 맞는다.
export const AQI_LEVELS = new Map([
  [1, { label: '매우 좋음', color: '#3fb950', advice: '야외 활동하기 좋은 날이에요.' }],
  [2, { label: '좋음', color: '#67c23a', advice: '평소처럼 야외 활동해도 괜찮아요.' }],
  [3, { label: '보통', color: '#e6a23c', advice: '민감군은 장시간 외부 활동을 줄이는 게 좋아요.' }],
  [4, { label: '나쁨', color: '#f56c6c', advice: '외출 시 마스크를 착용하세요.' }],
  [5, { label: '매우 나쁨', color: '#c0392b', advice: '가급적 실내에 머무르고 환기를 자제하세요.' }],
])

// 목록에 없는 aqi 값(응답 지연·오류 등)이 와도 화면이 깨지지 않도록 하는 기본값.
export const UNKNOWN_AQI_LEVEL = { label: '정보 없음', color: '#98a2b3', advice: '대기질 정보를 아직 불러오지 못했어요.' }
