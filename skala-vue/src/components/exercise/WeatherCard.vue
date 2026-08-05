<script setup>
/**
 * [실습 8 - Element Plus 날씨 카드]
 * 기존 div/button/badge/gauge를 ElCard, ElButton, ElTag, ElProgress로 교체했다.
 * 선택·hover 효과와 상세보기 emit은 유지하면서 도시 주소와 큰 기온 표시를 추가했다.
 */
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
// ElProgress에 넘길 수 있도록 -10~40℃ 구간을 0~100%로 변환한다.
const gaugePercentage = computed(() => {
  const ratio = Math.min(Math.max((props.city.temp + 10) / 50, 0), 1)
  return Math.round(ratio * 100)
})

const temperatureColor = computed(() => {
  if (props.city.temp >= HOT_THRESHOLD) return '#f56c6c'
  if (props.city.temp >= MILD_THRESHOLD) return '#e6a23c'
  return '#409eff'
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
  <!-- [Element Plus] 날씨 요약 전체를 ElCard로 구성 -->
  <el-card
    class="weather-card"
    :class="{ 'is-selected': isSelected }"
    :title="`${city.name}의 현재 상태: ${city.status}`"
    @click="emit('select-card', city)"
  >
    <div class="card-topline">
      <div>
        <h4>{{ city.name }}</h4>
        <p class="address">{{ city.address }}</p>
      </div>
      <span class="weather-symbol" aria-hidden="true">{{ statusIcon }}</span>
    </div>

    <div class="temperature-row">
      <strong>{{ displayTemp }}<small>{{ configStore.unitSymbol }}</small></strong>
      <el-tag round effect="light">{{ city.status }}</el-tag>
    </div>

    <el-tag v-if="city.temp >= HOT_THRESHOLD" class="temperature-tag" type="danger" effect="plain" round>
      더움 ({{ toDisplayTemp(HOT_THRESHOLD) }}{{ configStore.unitSymbol }} 이상)
    </el-tag>
    <el-tag v-else-if="city.temp >= MILD_THRESHOLD" class="temperature-tag" type="warning" effect="plain" round>
      보통 ({{ toDisplayTemp(MILD_THRESHOLD) }}~{{ toDisplayTemp(HOT_THRESHOLD - 1) }}{{ configStore.unitSymbol }})
    </el-tag>
    <el-tag v-else class="temperature-tag" type="primary" effect="plain" round>
      선선함 ({{ toDisplayTemp(MILD_THRESHOLD) }}{{ configStore.unitSymbol }} 미만)
    </el-tag>

    <!-- 기온 구간을 ElProgress와 조건별 색상으로 시각화 -->
    <el-progress
      class="temperature-progress"
      :percentage="gaugePercentage"
      :color="temperatureColor"
      :show-text="false"
      :stroke-width="7"
    />

    <div class="stats-row">
      <span class="stat-chip">{{ humidityIcon }} {{ city.humidity }}%</span>
      <span class="stat-chip">{{ windIcon }} {{ city.wind }}m/s</span>
    </div>

    <!--
      detail-button 슬롯: 부모가 상세보기 버튼 영역을 커스터마이징할 수 있다.
      onDetail 이 event.stopPropagation() 까지 처리해주므로 부모는 @click="onDetail" 만 연결하면 된다.
    -->
    <slot name="detail-button" :city="city" :is-selected="isSelected" :on-detail="onDetail">
      <!-- [과제 확장] 문구가 길어서 "상세 날씨 보기"로 줄였다. -->
      <el-button class="btn-detail" type="primary" plain @click="onDetail">
        상세 날씨 보기 →
      </el-button>
    </slot>
  </el-card>
</template>

<style scoped>
.weather-card {
  position: relative;
  min-height: 260px;
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

.weather-card :deep(.el-card__body) {
  padding: 18px;
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

.card-topline,
.temperature-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.weather-card h4 {
  margin: 0 0 3px;
  color: #273849;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.address {
  overflow: hidden;
  max-width: 170px;
  margin: 4px 0 0;
  margin: 0;
  color: #98a2b3;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.weather-symbol {
  font-size: 34px;
  filter: drop-shadow(0 7px 9px rgba(39, 56, 73, 0.12));
}

.temperature-row {
  margin: 18px 0 10px;
}

.temperature-row > strong {
  color: #1b2b3b;
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.05em;
}

.temperature-row small {
  color: #667085;
  font-size: 15px;
  font-weight: 700;
}

.temperature-tag {
  max-width: 100%;
}

.temperature-progress {
  margin-top: 13px;
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
  width: 100%;
  margin-top: 15px;
  font-weight: 750;
}

@media (max-width: 440px) {
  .weather-card {
    min-height: auto;
  }

  .btn-detail {
    margin-top: 13px;
  }
}
</style>
