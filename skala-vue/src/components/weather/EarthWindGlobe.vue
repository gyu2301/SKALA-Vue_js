<script setup>
/**
 * [실습 8 확장 - 회전하는 실시간 지구본]
 * earth.nullschool.net의 실시간 바람 지도를 iframe으로 연결한 새 컴포넌트이다.
 * 사용자는 iframe 안에서 드래그로 지구를 회전하고, +/- 버튼으로 확대/축소할 수 있다.
 * (다른 도메인 iframe이라 위/휠·트랙패드 핀치 이벤트가 부모 문서로 전달되지 않아
 * 자체 스크롤 확대는 동작하지 않는다. 대신 URL의 orthographic scale 파라미터를
 * 버튼으로 바꿔 iframe을 다시 로드하는 방식으로 확대를 구현했다.)
 * Element Plus의 ElCard, ElTag, ElLink로 타이틀·실시간 상태·외부 링크 UI를 구성했다.
 */
import { computed, ref } from 'vue'

defineProps({
  compact: { type: Boolean, default: false },
})

// 외부 시각화가 로드되기 전 로딩 안내를 보여주기 위한 반응형 상태.
// orthographic=lon,lat,scale 의 세 번째 값(scale)이 지도 확대 배율이다. iframe이 다른
// 도메인(earth.nullschool.net)이라 마우스 휠이 내부 지도 확대 대신 우리 페이지 스크롤로
// 먹히는 경우가 흔해서, +/- 버튼으로 이 값을 바꿔 iframe src를 새로 로드하는 방식으로
// 확대/축소를 구현한다.
const EARTH_LON = -225.0
const EARTH_LAT = 0.0
const MIN_SCALE = 100
const MAX_SCALE = 2000
const SCALE_STEP = 80

const scale = ref(319)

const EARTH_URL = computed(
  () =>
    `https://earth.nullschool.net/#current/wind/surface/level/orthographic=${EARTH_LON.toFixed(2)},${EARTH_LAT.toFixed(2)},${scale.value}`,
)

const isLoaded = ref(false)

const zoomIn = () => {
  scale.value = Math.min(MAX_SCALE, scale.value + SCALE_STEP)
}

const zoomOut = () => {
  scale.value = Math.max(MIN_SCALE, scale.value - SCALE_STEP)
}
</script>

<template>
  <!-- [Element Plus] 지구본 전체를 ElCard로 묶고 LIVE 배지와 외부 링크를 제공한다. -->
  <el-card class="earth-card" :class="{ 'is-compact': compact }" shadow="never">
    <template #header>
      <div class="earth-card__header">
        <div>
          <div class="earth-title-row">
            <h3>실시간 글로벌 바람 지구본</h3>
            <el-tag type="success" effect="dark" round>LIVE</el-tag>
          </div>
          <p>드래그해 지구를 돌리고, 우측 하단 +/- 버튼으로 관심 지역을 확대해 보세요.</p>
        </div>
        <el-link :href="EARTH_URL" target="_blank" type="primary" :underline="false">
          큰 화면으로 열기 ↗
        </el-link>
      </div>
    </template>

    <!-- [아이디어 구현] 지구본 사이트를 앱 안에 임베드하고 로딩 중에는 대체 UI를 표시한다. -->
    <div class="earth-frame-wrap">
      <div v-if="isLoaded" class="interaction-hint" aria-hidden="true">
        <span class="drag-icon">↔</span>
        <strong>마우스로 끌어서 지구본을 돌려보세요!</strong>
      </div>
      <div v-if="!isLoaded" class="earth-loading">
        <span class="loading-spinner" aria-hidden="true"></span>
        <strong>전 세계 바람 데이터를 불러오는 중</strong>
        <span>잠시만 기다려 주세요.</span>
      </div>
      <iframe
        :src="EARTH_URL"
        title="earth.nullschool.net 실시간 세계 바람 지구본"
        loading="lazy"
        referrerpolicy="strict-origin-when-cross-origin"
        allow="geolocation"
        @load="isLoaded = true"
      ></iframe>
      <div class="zoom-controls" role="group" aria-label="지구본 확대/축소">
        <button
          type="button"
          class="zoom-btn"
          :disabled="scale >= MAX_SCALE"
          aria-label="확대"
          @click="zoomIn"
        >
          +
        </button>
        <button
          type="button"
          class="zoom-btn"
          :disabled="scale <= MIN_SCALE"
          aria-label="축소"
          @click="zoomOut"
        >
          −
        </button>
      </div>
    </div>

    <div class="earth-footer">
      <span><i class="wind-dot"></i> 표면 바람</span>
      <span><i class="storm-dot"></i> 강한 기류</span>
      <small>External visualization by earth.nullschool.net</small>
    </div>
  </el-card>
</template>

<style scoped>
.earth-card {
  overflow: hidden;
  border: 1px solid #d9e5f2;
  border-radius: 22px;
  background: #071426;
}

.earth-card :deep(.el-card__header) {
  padding: 20px 22px;
  border-bottom-color: rgba(255, 255, 255, 0.1);
  background: #0b1b30;
}

.earth-card :deep(.el-card__body) {
  padding: 0;
}

/* 넓은 화면에서 WEATHER MENU 아래에 들어가는 소형 지구본 */
.earth-card.is-compact {
  margin-top: 12px;
  border-radius: 15px;
}

.earth-card.is-compact :deep(.el-card__header) {
  padding: 12px;
}

.earth-card.is-compact .earth-card__header {
  display: grid;
  gap: 8px;
}

.earth-card.is-compact .earth-title-row {
  align-items: flex-start;
}

.earth-card.is-compact h3 {
  font-size: 13px;
}

.earth-card.is-compact p {
  font-size: 9px;
  line-height: 1.45;
}

.earth-card.is-compact .earth-frame-wrap {
  height: 285px;
}

/* 외부 지구본에 충분한 렌더링 폭을 주고 결과만 사이드바 크기로 축소해 지구 전체가 보이게 한다. */
.earth-card.is-compact iframe {
  width: 760px;
  height: 1018px;
  transform: scale(0.28);
  transform-origin: top left;
}

.earth-card.is-compact .interaction-hint {
  top: 8px;
  right: 8px;
  left: 8px;
  justify-content: center;
  padding: 7px;
  font-size: 9px;
}

.earth-card.is-compact .drag-icon {
  width: 21px;
  height: 21px;
  font-size: 12px;
}

.earth-card.is-compact .earth-footer {
  gap: 8px;
  padding: 9px 11px;
}

.earth-card.is-compact .earth-footer small {
  display: none;
}

.earth-card__header,
.earth-title-row,
.earth-footer {
  display: flex;
  align-items: center;
}

.earth-card__header {
  justify-content: space-between;
  gap: 18px;
}

.earth-title-row {
  gap: 10px;
}

h3 {
  margin: 0;
  color: #f5f9ff;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

p {
  margin: 5px 0 0;
  color: #9fb4ce;
  font-size: 12px;
}

.earth-frame-wrap {
  position: relative;
  height: clamp(390px, 55vw, 620px);
  /* iframe 안(다른 도메인) 콘텐츠가 휠 이벤트를 소비하지 않을 때 그 스크롤이
     바깥 페이지로 번지지 않도록 막는다. */
  overscroll-behavior: contain;
  background:
    radial-gradient(circle at 50% 45%, rgba(27, 111, 161, 0.35), transparent 34%),
    #050b13;
}

iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

.zoom-controls {
  position: absolute;
  right: 14px;
  bottom: 14px;
  z-index: 3;
  display: grid;
  gap: 6px;
}

.zoom-btn {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 1px solid rgba(103, 224, 212, 0.45);
  border-radius: 8px;
  color: #efffff;
  background: rgba(5, 20, 36, 0.78);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(10px);
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}

.zoom-btn:hover:not(:disabled) {
  background: rgba(11, 27, 48, 0.9);
}

.zoom-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.earth-card.is-compact .zoom-controls {
  right: 8px;
  bottom: 8px;
  gap: 4px;
}

.earth-card.is-compact .zoom-btn {
  width: 22px;
  height: 22px;
  font-size: 12px;
}

.earth-loading {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 8px;
  color: #d9e9f8;
  background: #071426;
}

.earth-loading span {
  color: #7991aa;
  font-size: 12px;
}

.earth-loading .loading-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(121, 172, 214, 0.28);
  border-top-color: #49d6c8;
  border-radius: 50%;
  animation: earth-spin 0.8s linear infinite;
}

.interaction-hint {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 13px;
  border: 1px solid rgba(103, 224, 212, 0.45);
  border-radius: 999px;
  color: #efffff;
  background: rgba(5, 20, 36, 0.78);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(10px);
  font-size: 11px;
  pointer-events: none;
  animation: hint-float 2.2s ease-in-out infinite;
}

.drag-icon {
  display: grid;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  color: #071426;
  background: #49d6c8;
  font-size: 15px;
  place-items: center;
}

@keyframes hint-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(3px);
  }
}

@keyframes earth-spin {
  to {
    transform: rotate(360deg);
  }
}

.earth-footer {
  flex-wrap: wrap;
  gap: 16px;
  padding: 12px 20px;
  color: #aabed2;
  background: #081525;
  font-size: 11px;
}

.earth-footer span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.earth-footer i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.wind-dot {
  background: #49d6c8;
  box-shadow: 0 0 8px #49d6c8;
}

.storm-dot {
  background: #ffcd70;
  box-shadow: 0 0 8px #ffcd70;
}

.earth-footer small {
  margin-left: auto;
  color: #60778e;
}

@media (max-width: 640px) {
  .earth-card__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .earth-frame-wrap {
    height: 430px;
  }

  .interaction-hint {
    right: 12px;
    left: 12px;
    justify-content: center;
  }

  .interaction-hint strong {
    font-size: 10px;
  }

  .earth-footer small {
    width: 100%;
    margin-left: 0;
  }
}
</style>
