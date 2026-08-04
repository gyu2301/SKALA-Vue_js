<script setup>
// 온도/습도/바람 범례를 "낮음 ← ─── → 높음" 그라데이션 바 형태로 보여주는 표시 전용 컴포넌트.
defineProps({
  label: { type: String, required: true },
  segments: { type: Array, required: true }, // [{ icon, text, color }] 낮은 값 → 높은 값 순서
})
</script>

<template>
  <div class="range-row">
    <span class="range-label">{{ label }}</span>
    <div class="range-bar">
      <span class="arrow">←</span>
      <div class="range-track">
        <div
          v-for="seg in segments"
          :key="seg.text"
          class="range-segment"
          :style="{ backgroundColor: seg.color }"
        >
          {{ seg.icon }} {{ seg.text }}
        </div>
      </div>
      <span class="arrow">→</span>
    </div>
  </div>
</template>

<style scoped>
.range-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.range-row + .range-row {
  margin-top: 6px;
}

.range-label {
  flex: 0 0 52px;
  font-size: 12px;
  font-weight: 700;
  color: #495057;
}

.range-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.arrow {
  color: #adb5bd;
  font-size: 12px;
  font-weight: 700;
}

.range-track {
  display: flex;
  flex: 1;
  border: 1px solid #ced4da;
  border-radius: 999px;
  overflow: hidden;
}

.range-segment {
  flex: 1;
  padding: 4px 6px;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: #495057;
  white-space: nowrap;
}
.range-segment + .range-segment {
  border-left: 1px solid #ced4da;
}
</style>
