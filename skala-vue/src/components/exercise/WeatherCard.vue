<script setup>
import { computed, onUpdated } from 'vue'
import {
  HOT_THRESHOLD,
  MILD_THRESHOLD,
  HUMIDITY_HIGH,
  HUMIDITY_LOW,
  WIND_STRONG,
  WIND_CALM,
} from '@/constants/weatherThresholds'
import { useConfigStore } from '@/stores/configStore'

const configStore = useConfigStore()

// 선택된 도시 객체(city)를 props 로 전달받아 표시만 한다.
// 이 카드가 현재 선택된 카드인지 여부(isSelected)도 부모의 selectedCityId 로부터 계산되어 넘어온다.
const props = defineProps({
  city: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
})

const emit = defineEmits(['select-card', 'click-detail'])

const GAUGE_MAX_TEMP = 40

const STATUS_ICON = {
  맑음: '☀️',
  비: '🌧️',
  구름: '☁️',
  흐림: '🌥️',
  눈: '❄️',
}

// 날씨 상태 문구에 어울리는 이모지를 붙인다. 목록에 없는 상태는 기본 구름 아이콘으로 대체.
const statusIcon = computed(() => STATUS_ICON[props.city.status] ?? '🌤️')

// 화면 표시용 기온 변환. Mock 데이터(city.temp)와 임계값(HOT_THRESHOLD 등)은 항상 섭씨 원본이며,
// 게이지/배지 판정 기준은 그대로 섭씨를 사용하고, 사용자에게 보여주는 숫자만 단위 설정에 맞춰 변환한다.
const toDisplayTemp = (celsius) => {
  if (configStore.unit === 'fahrenheit') {
    return Math.round((celsius * 9) / 5 + 32)
  }
  return celsius
}

const displayTemp = computed(() => toDisplayTemp(props.city.temp))

// 기온을 막대 길이(%)와 색상으로 표현한다.
const gaugeStyle = computed(() => {
  const ratio = Math.min(Math.max(props.city.temp / GAUGE_MAX_TEMP, 0), 1)
  return {
    width: `${Math.round(ratio * 100)}%`,
    backgroundColor: props.city.temp >= HOT_THRESHOLD ? '#ff7675' : '#74b9ff',
  }
})

// 습도가 높을수록 물방울, 낮을수록 건조함을 직관적으로 표현한다.
const humidityIcon = computed(() => {
  if (props.city.humidity >= HUMIDITY_HIGH) return '💧'
  if (props.city.humidity < HUMIDITY_LOW) return '🌵'
  return '🌫️'
})

// 풍속이 강할수록 바람, 약할수록 잔잔함을 직관적으로 표현한다.
const windIcon = computed(() => {
  if (props.city.wind >= WIND_STRONG) return '🌬️'
  if (props.city.wind < WIND_CALM) return '😌'
  return '🍃'
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
    <h4>{{ city.name }}</h4>
    <p>현재 기온: {{ displayTemp }}{{ configStore.unitSymbol }}</p>
    <p class="status-line">{{ statusIcon }} {{ city.status }}</p>

    <span v-if="city.temp >= HOT_THRESHOLD" class="badge hot">
      더움 ({{ toDisplayTemp(HOT_THRESHOLD) }}{{ configStore.unitSymbol }} 이상)
    </span>
    <span v-else-if="city.temp >= MILD_THRESHOLD" class="badge mild">
      보통 ({{ toDisplayTemp(MILD_THRESHOLD) }}~{{ toDisplayTemp(HOT_THRESHOLD - 1) }}{{ configStore.unitSymbol }})
    </span>
    <span v-else class="badge cool">
      선선함 ({{ toDisplayTemp(MILD_THRESHOLD) }}{{ configStore.unitSymbol }} 미만)
    </span>

    <div class="gauge-track">
      <div class="gauge-fill" :style="gaugeStyle"></div>
    </div>

    <div class="stats-row">
      <span class="stat-chip">{{ humidityIcon }} {{ city.humidity }}%</span>
      <span class="stat-chip">{{ windIcon }} {{ city.wind }}m/s</span>
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
  position: relative;
  min-height: 210px;
  padding: 17px;
  padding-right: 92px;
  border: 1px solid #e4e7ec;
  border-radius: 14px;
  background: linear-gradient(145deg, #ffffff, #fbfdfc);
  cursor: pointer;
  box-shadow: 0 3px 12px rgba(16, 24, 40, 0.035);
  transition:
    box-shadow 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease;
}
.weather-card:hover {
  border-color: #b8d9cd;
  box-shadow: 0 12px 24px rgba(39, 56, 73, 0.09);
  transform: translateY(-2px);
}
/* 선택된 카드 강조 (:class 객체 바인딩으로 붙는다) */
.weather-card.is-selected {
  border-color: #42b883;
  background: linear-gradient(145deg, #ffffff, #effaf6);
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.12);
}

.weather-card h4 {
  margin: 0 0 3px;
  color: #273849;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.weather-card > p:not(.status-line) {
  margin: 0;
  color: #475467;
  font-size: 13px;
}

.badge {
  display: inline-block;
  padding: 5px 9px;
  border-radius: 999px;
  color: #344054;
  font-size: 11px;
  font-weight: 700;
}
.hot {
  background-color: #ffe4e2;
  color: #b42318;
}
.mild {
  background-color: #fef0c7;
  color: #93370d;
}
.cool {
  background-color: #e0f2fe;
  color: #026aa2;
}

.status-line {
  margin: 3px 0 12px;
  color: #667085;
  font-size: 12px;
}

.gauge-track {
  height: 7px;
  margin-top: 13px;
  overflow: hidden;
  border-radius: 999px;
  background: #eef1f4;
}
.gauge-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.3s ease,
    background-color 0.3s ease;
}

.stats-row {
  flex-wrap: wrap;
  display: flex;
  gap: 6px;
  margin-top: 12px;
}
.stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 4px 9px;
  background: #f2f4f7;
  border-radius: 999px;
  color: #475467;
  font-size: 11px;
  font-weight: 700;
}

.btn-detail {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 6px 10px;
  border: 1px solid #c9ded7;
  border-radius: 8px;
  background: #f5fbf9;
  color: #24644f;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}
.btn-detail:hover {
  border-color: #42b883;
  background: #effaf6;
}

@media (max-width: 440px) {
  .weather-card {
    padding-right: 17px;
  }

  .btn-detail {
    position: static;
    width: 100%;
    margin-top: 13px;
  }
}
</style>
