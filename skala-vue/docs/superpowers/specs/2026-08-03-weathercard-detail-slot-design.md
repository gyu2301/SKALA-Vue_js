# WeatherCard 상세보기 버튼 Named/Scoped Slot 설계

## 목적
`WeatherCard.vue`의 "상세보기" 버튼 영역을 부모(`WeatherParent.vue`)가 커스터마이징할 수 있도록
named + scoped slot을 도입한다.

## 변경 사항

### 1. `WeatherCard.vue`
- 기존 하드코딩된 `<button class="btn-detail" @click.stop="emit('click-detail', city)">상세보기</button>`를
  named slot `detail-button`으로 교체한다.
- 슬롯 scope로 다음 데이터를 전달한다.
  - `city`: 현재 카드의 도시 객체
  - `isSelected`: 현재 카드 선택 여부
  - `onDetail`: 클릭 시 호출할 핸들러. `(event) => { event?.stopPropagation(); emit('click-detail', city) }` 형태로
    구현하여, 부모가 커스텀 UI에 `@click="onDetail"`만 연결해도 카드 선택(`select-card`) 이벤트로의
    버블링이 자동으로 차단되도록 한다.
- 슬롯의 fallback(기본) 콘텐츠로 기존 버튼 마크업을 그대로 유지한다. 슬롯을 채우지 않는 기존 사용처는
  동작·스타일 변화 없이 그대로 동작한다.

### 2. `WeatherParent.vue`
- `<WeatherCard>` 사용부에 `#detail-button="{ city, onDetail }"` 템플릿을 추가하여,
  기본 버튼 대신 텍스트 링크 스타일("자세히 보기 →" 등)의 커스텀 UI를 예시로 적용한다.
- 기존 `showDetail(city)` 핸들러를 그대로 재사용한다.

## 범위 밖
- 카드 자체의 다른 영역(제목, 게이지 등)에 대한 슬롯화는 포함하지 않는다.
- 기존 `select-card`, `click-detail` 이벤트 시그니처는 변경하지 않는다.
