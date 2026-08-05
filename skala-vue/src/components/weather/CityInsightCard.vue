<script setup>
/**
 * [과제 확장 - 도시 정보 메뉴]
 * useCityInsights가 만들어주는, 날씨 정보 + 현지 시각(localTime) + 위키 요약(wiki)이
 * 합쳐진 city 객체를 받아 카드 하나로 보여준다. AirQualityCard.vue와 같은 el-card 톤을 재사용한다.
 */
import { computed } from 'vue'

const props = defineProps({
  city: { type: Object, required: true },
})

// 도시 이름을 그대로 위키백과 문서 경로에 쓴다. 한글이 섞여 있으므로 encodeURIComponent로 인코딩한다.
const wikipediaUrl = computed(() => `https://ko.wikipedia.org/wiki/${encodeURIComponent(props.city.name)}`)
</script>

<template>
  <el-card class="city-insight-card" :title="`${city.name}의 현지 시각과 정보`">
    <div class="card-topline">
      <div>
        <h4>{{ city.name }}</h4>
        <p class="address">{{ city.address }}</p>
      </div>

      <!-- localTime이 아직 없으면(로딩 중이거나 timezone 정보가 없는 검색 도시) 배지를 숨긴다 -->
      <el-tag v-if="city.localTimeLabel" round effect="dark" :type="city.isDaytime ? 'warning' : 'info'" class="time-tag">
        {{ city.isDaytime ? '☀️' : '🌙' }} {{ city.localTimeLabel }}
      </el-tag>
    </div>

    <div v-if="city.wiki" class="wiki-section">
      <img v-if="city.wiki.thumbnail" :src="city.wiki.thumbnail" :alt="city.name" class="wiki-thumbnail" />
      <p class="wiki-extract">{{ city.wiki.extract }}</p>
      <a :href="wikipediaUrl" target="_blank" rel="noopener noreferrer" class="wiki-link">
        위키백과에서 더 보기 →
      </a>
    </div>
    <p v-else class="wiki-empty">위키백과 요약을 아직 불러오지 못했어요.</p>
  </el-card>
</template>

<style scoped>
.city-insight-card {
  min-height: 220px;
  border: 1px solid #e4e7ec;
  border-radius: 14px;
  background: linear-gradient(145deg, #ffffff, #fbfdfc);
  box-shadow: 0 3px 12px rgba(16, 24, 40, 0.035);
}

.city-insight-card :deep(.el-card__body) {
  padding: 18px;
}

.card-topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.city-insight-card h4 {
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

.time-tag {
  flex: 0 0 auto;
  font-weight: 750;
}

.wiki-section {
  margin-top: 14px;
}

.wiki-thumbnail {
  width: 100%;
  height: 110px;
  margin-bottom: 10px;
  border-radius: 10px;
  object-fit: cover;
}

.wiki-extract {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: #475467;
  font-size: 12px;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
}

.wiki-link {
  display: inline-block;
  margin-top: 8px;
  color: #337ecc;
  font-size: 11px;
  font-weight: 750;
  text-decoration: none;
}

.wiki-link:hover {
  text-decoration: underline;
}

.wiki-empty {
  margin: 14px 0 0;
  color: #98a2b3;
  font-size: 12px;
}
</style>
