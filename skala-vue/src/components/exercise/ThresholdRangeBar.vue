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
  gap: 10px;
}
.range-row + .range-row {
  margin-top: 8px;
}

.range-label {
  flex: 0 0 58px;
  color: #475467;
  font-size: 12px;
  font-weight: 750;
}

.range-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.arrow {
  color: #98a2b3;
  font-size: 12px;
  font-weight: 700;
}

.range-track {
  display: flex;
  flex: 1;
  overflow: hidden;
  border: 1px solid #d0d5dd;
  border-radius: 999px;
}

.range-segment {
  flex: 1;
  padding: 4px 6px;
  text-align: center;
  color: #475467;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}
.range-segment + .range-segment {
  border-left: 1px solid #d0d5dd;
}

@media (max-width: 620px) {
  .range-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }

  .range-label {
    flex-basis: auto;
  }

  .range-bar {
    width: 100%;
  }

  .range-segment {
    padding: 5px 3px;
    font-size: 9px;
  }
}
</style>
