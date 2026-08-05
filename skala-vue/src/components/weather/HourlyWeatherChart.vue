<script setup>
/**
 * [실습 8 확장 - 24시간 날씨 그래프]
 * OpenWeatherMap의 3시간 단위 예보 8개를 Canvas에 그려 약 24시간의 흐름을 표현한다.
 * 주황색 선은 기온, 파란색 막대는 강수 확률이며 섭씨/화씨 전환에도 반응한다.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  entries: { type: Array, default: () => [] },
  unit: { type: String, default: 'celsius' },
})

const canvasRef = ref(null)
let resizeObserver

const displayTemp = (value) =>
  props.unit === 'fahrenheit' ? Math.round((value * 9) / 5 + 32) : value

const unitSymbol = computed(() => (props.unit === 'fahrenheit' ? '℉' : '℃'))

// Canvas 해상도를 기기의 devicePixelRatio에 맞춰 고해상도 화면에서도 선명하게 그린다.
const draw = () => {
  const canvas = canvasRef.value
  if (!canvas || props.entries.length === 0) return

  const rect = canvas.getBoundingClientRect()
  const ratio = window.devicePixelRatio || 1
  const width = Math.max(rect.width, 320)
  const height = 280
  canvas.width = width * ratio
  canvas.height = height * ratio

  const context = canvas.getContext('2d')
  context.scale(ratio, ratio)
  context.clearRect(0, 0, width, height)

  const padding = { top: 34, right: 24, bottom: 52, left: 34 }
  const graphWidth = width - padding.left - padding.right
  const graphHeight = height - padding.top - padding.bottom
  const temperatures = props.entries.map((entry) => displayTemp(entry.temp))
  const minTemp = Math.min(...temperatures) - 2
  const maxTemp = Math.max(...temperatures) + 2
  const range = Math.max(maxTemp - minTemp, 1)
  const stepX = graphWidth / Math.max(props.entries.length - 1, 1)

  context.lineWidth = 1
  context.strokeStyle = '#e8eef5'
  for (let row = 0; row <= 4; row += 1) {
    const y = padding.top + (graphHeight / 4) * row
    context.beginPath()
    context.moveTo(padding.left, y)
    context.lineTo(width - padding.right, y)
    context.stroke()
  }

  // [강수 범례] 강수 확률을 파란 그라데이션 막대로 그린다.
  props.entries.forEach((entry, index) => {
    const x = padding.left + stepX * index
    const barHeight = (entry.precipitation / 100) * graphHeight * 0.55
    const gradient = context.createLinearGradient(0, padding.top + graphHeight - barHeight, 0, padding.top + graphHeight)
    gradient.addColorStop(0, 'rgba(64, 158, 255, .72)')
    gradient.addColorStop(1, 'rgba(64, 158, 255, .12)')
    context.fillStyle = gradient
    context.fillRect(x - 11, padding.top + graphHeight - barHeight, 22, barHeight)
  })

  // [기온 범례] 각 시간대의 기온을 좌표로 변환한 뒤 주황색 선으로 연결한다.
  const points = temperatures.map((temp, index) => ({
    x: padding.left + stepX * index,
    y: padding.top + ((maxTemp - temp) / range) * graphHeight * 0.72,
    temp,
  }))

  context.beginPath()
  points.forEach((point, index) => {
    if (index === 0) context.moveTo(point.x, point.y)
    else context.lineTo(point.x, point.y)
  })
  context.lineWidth = 3
  context.lineJoin = 'round'
  context.strokeStyle = '#ff7a45'
  context.shadowColor = 'rgba(255, 122, 69, .24)'
  context.shadowBlur = 8
  context.stroke()
  context.shadowBlur = 0

  points.forEach((point, index) => {
    context.beginPath()
    context.arc(point.x, point.y, 4.5, 0, Math.PI * 2)
    context.fillStyle = '#ffffff'
    context.fill()
    context.lineWidth = 3
    context.strokeStyle = '#ff7a45'
    context.stroke()

    context.fillStyle = '#2f3f52'
    context.font = '700 11px sans-serif'
    context.textAlign = 'center'
    context.fillText(`${point.temp}°`, point.x, point.y - 12)

    context.fillStyle = '#7c8b9d'
    context.font = '11px sans-serif'
    context.fillText(props.entries[index].time, point.x, height - 25)

    context.fillStyle = '#337ecc'
    context.font = '700 10px sans-serif'
    context.fillText(`${props.entries[index].precipitation}%`, point.x, height - 8)
  })
}

// 예보 데이터나 온도 단위가 바뀌면 차트를 즉시 다시 그린다.
watch(
  () => [props.entries, props.unit],
  () => nextTick(draw),
  { deep: true },
)

// 반응형 레이아웃: 카드 크기가 바뀌어도 Canvas가 자동으로 맞춰진다.
onMounted(() => {
  resizeObserver = new ResizeObserver(draw)
  if (canvasRef.value) resizeObserver.observe(canvasRef.value)
  draw()
})

onBeforeUnmount(() => resizeObserver?.disconnect())
</script>

<template>
  <div class="chart-shell">
    <!-- 차트의 두 지표를 설명하는 범례: 주황색=기온, 파란색=강수 확률 -->
    <div class="chart-legend">
      <span><i class="temp-key"></i> 기온 ({{ unitSymbol }})</span>
      <span><i class="rain-key"></i> 강수 확률 (%)</span>
    </div>
    <canvas ref="canvasRef" role="img" aria-label="24시간 기온과 강수 확률 그래프"></canvas>
  </div>
</template>

<style scoped>
.chart-shell {
  width: 100%;
  min-width: 0;
}

.chart-legend {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-bottom: 4px;
  color: #667085;
  font-size: 11px;
}

.chart-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.chart-legend i {
  width: 17px;
  height: 4px;
  border-radius: 999px;
}

.temp-key {
  background: #ff7a45;
}

.rain-key {
  background: #409eff;
}

canvas {
  display: block;
  width: 100%;
  height: 280px;
}
</style>
