// WeatherCard 배지/이모지와 대시보드 범례가 함께 참조하는 기준값.
// 한 곳만 바꾸면 카드 표시와 범례 문구가 항상 같은 기준을 보여준다.
export const HOT_THRESHOLD = 25
export const MILD_THRESHOLD = 20

// 생활 날씨 가이드(보온/방한 안내) 전용 기준. 기상청 기온별 옷차림 안내에서
// 자켓·트렌치코트가 필요해지는 구간(9~11도)의 하한을 따른다. MILD_THRESHOLD(20도)는
// 카드 배지/범례용이라 "쌀쌀해서 겉옷이 필요한" 실제 체감과 맞지 않아 별도로 둔다.
export const COLD_ADVISORY_THRESHOLD = 9

export const HUMIDITY_HIGH = 70
export const HUMIDITY_LOW = 40

export const WIND_STRONG = 4
export const WIND_CALM = 2
