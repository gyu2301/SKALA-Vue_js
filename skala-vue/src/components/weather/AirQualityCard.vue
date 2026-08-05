<script setup>
/**
 * [과제 확장 - 대기질 메뉴]
 * WeatherCard.vue와 같은 카드 톤(el-card + el-tag + stat-chip)을 재사용해서
 * 대시보드 전체에서 시각적으로 통일감을 유지한다.
 * city prop은 useAirQuality의 citiesWithAirQuality가 만들어주는, 날씨 정보 + 대기질(level 포함)이
 * 합쳐진 객체다.
 */
defineProps({
  city: { type: Object, required: true },
})
</script>

<template>
  <el-card class="air-quality-card" :title="`${city.name}의 대기질: ${city.level.label}`">
    <div class="card-topline">
      <div>
        <h4>{{ city.name }}</h4>
        <p class="address">{{ city.address }}</p>
      </div>
      <!-- AQI 단계별 색상을 인라인 스타일로 el-tag에 그대로 입힌다 (색상표는 constants/airQualityLevels.js) -->
      <el-tag round effect="dark" :color="city.level.color" class="aqi-tag">
        {{ city.level.label }}
      </el-tag>
    </div>

    <p class="advice">{{ city.level.advice }}</p>

    <div class="stats-row">
      <!-- toFixed는 소수 첫째 자리까지만 보여주기 위한 표시용 가공이라 원본 city.pm2_5는 그대로 둔다 -->
      <span class="stat-chip">🌫️ PM2.5 {{ city.pm2_5?.toFixed(1) ?? '-' }}</span>
      <span class="stat-chip">💨 PM10 {{ city.pm10?.toFixed(1) ?? '-' }}</span>
      <span class="stat-chip">🌤️ O₃ {{ city.o3?.toFixed(1) ?? '-' }}</span>
    </div>
  </el-card>
</template>

<style scoped>
.air-quality-card {
  min-height: 190px;
  border: 1px solid #e4e7ec;
  border-radius: 14px;
  background: linear-gradient(145deg, #ffffff, #fbfdfc);
  box-shadow: 0 3px 12px rgba(16, 24, 40, 0.035);
}

.air-quality-card :deep(.el-card__body) {
  padding: 18px;
}

.card-topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.air-quality-card h4 {
  margin: 0 0 3px;
  color: #273849;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.address {
  margin: 0;
  overflow: hidden;
  max-width: 170px;
  color: #98a2b3;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.aqi-tag {
  flex: 0 0 auto;
  border: none;
  font-weight: 750;
}

.advice {
  margin: 14px 0 0;
  color: #475467;
  font-size: 12px;
}

.stats-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 14px;
}

.stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 4px 9px;
  border-radius: 999px;
  background: #f2f4f7;
  color: #475467;
  font-size: 11px;
  font-weight: 700;
}
</style>
