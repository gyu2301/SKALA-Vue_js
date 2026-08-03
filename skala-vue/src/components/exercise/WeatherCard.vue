<script setup>
import { computed, onUpdated } from 'vue'

// 선택된 도시 객체(city)를 props 로 전달받아 표시만 한다.
// 이 카드가 현재 선택된 카드인지 여부(isSelected)도 부모의 selectedCityId 로부터 계산되어 넘어온다.
const props = defineProps({
  city: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
})

const emit = defineEmits(['select-card', 'click-detail'])

const HOT_THRESHOLD = 25
const MILD_THRESHOLD = 20
const GAUGE_MAX_TEMP = 40

// 기온을 막대 길이(%)와 색상으로 표현한다.
const gaugeStyle = computed(() => {
  const ratio = Math.min(Math.max(props.city.temp / GAUGE_MAX_TEMP, 0), 1)
  return {
    width: `${Math.round(ratio * 100)}%`,
    backgroundColor: props.city.temp >= HOT_THRESHOLD ? '#ff7675' : '#74b9ff',
  }
})

// 카드 선택(select-card) 버블링을 막고 상세보기(click-detail)를 emit한다.
// 슬롯으로 넘겨줘서 부모의 커스텀 버튼도 같은 방식으로 동작하게 한다.
const onDetail = (event) => {
  event?.stopPropagation()
  emit('click-detail', props.city)
}

// v-memo 효과 확인용: 이 카드가 실제로 리렌더링(패치)될 때마다 콘솔에 남긴다.
// WeatherParent 에서 v-memo="[city.id === selectedCityId]" 를 걸어두면,
// 이 카드의 선택 여부가 안 바뀌는 한 다른 카드가 선택되거나 도움말이 토글돼도
// 이 로그가 찍히지 않아야 한다.
onUpdated(() => {
  console.log(`[onUpdated] ${props.city.name} 카드 리렌더링`)
})
</script>

<template>
  <div
    class="weather-card"
    :class="{ 'is-selected': isSelected }"
    :title="`${city.name}의 현재 상태: ${city.status}`"
    @click="emit('select-card', city)"
  >
    <h4>{{ city.name }} ({{ city.status }})</h4>
    <p>현재 기온: {{ city.temp }}°C</p>

    <span v-if="city.temp >= HOT_THRESHOLD" class="badge hot">더움 (25도 이상)</span>
    <span v-else-if="city.temp >= MILD_THRESHOLD" class="badge mild">보통 (20~24도)</span>
    <span v-else class="badge cool">선선함 (20도 미만)</span>

    <div class="gauge-track">
      <div class="gauge-fill" :style="gaugeStyle"></div>
    </div>

    <!--
      detail-button 슬롯: 부모가 상세보기 버튼 영역을 커스터마이징할 수 있다.
      onDetail 이 event.stopPropagation() 까지 처리해주므로 부모는 @click="onDetail" 만 연결하면 된다.
    -->
    <slot name="detail-button" :city="city" :is-selected="isSelected" :on-detail="onDetail">
      <button class="btn-detail" @click="onDetail">상세보기</button>
    </slot>
  </div>
</template>

<style scoped>
.weather-card {
  background: #fff;
  border: 1px solid #dee2e6;
  padding: 12px;
  padding-right: 76px;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  transition:
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}
.weather-card:hover {
  border-color: #ced4da;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
/* 선택된 카드 강조 (:class 객체 바인딩으로 붙는다) */
.weather-card.is-selected {
  border-color: #2e7d32;
  box-shadow: 0 0 0 2px rgba(46, 125, 50, 0.15);
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 4px;
  color: #fff;
}
.hot {
  background-color: #ff7675;
}
.mild {
  background-color: #fdcb6e;
}
.cool {
  background-color: #74b9ff;
}

.gauge-track {
  height: 6px;
  margin-top: 10px;
  background: #eef1f4;
  border-radius: 3px;
  overflow: hidden;
}
.gauge-fill {
  height: 100%;
  border-radius: 3px;
  transition:
    width 0.3s ease,
    background-color 0.3s ease;
}

.btn-detail {
  position: absolute;
  right: 12px;
  top: 13px;
  padding: 5px 10px;
  font-size: 12px;
  background: #fff;
  border: 1px solid #ced4da;
  border-radius: 4px;
  color: #495057;
  cursor: pointer;
  transition: background 0.15s ease;
}
.btn-detail:hover {
  background: #f1f3f5;
}
</style>
