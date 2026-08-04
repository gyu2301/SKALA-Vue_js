<script setup>
import { computed } from 'vue'
import { useLearningStore } from './stores/learning.js'

// 1. 학습환경 구성
import SampleOne from './components/practices/basic/SampleOne.vue'
import SampleTwo from './components/practices/basic/SampleTwo.vue'

// 2. Vue Directive
import VueHtml from './components/practices/basic/VueHtml.vue'
import VueHtmlXss from './components/practices/basic/VueHtmlXss.vue'
import VueText from './components/practices/basic/VueText.vue'
import VueBind from './components/practices/basic/VueBind.vue'
import VueBindClass from './components/practices/basic/VueBindClass.vue'
import VueBindStyle from './components/practices/basic/VueBindStyle.vue'
import VueBindShorthand from './components/practices/basic/VueBindShorthand.vue'
import VueIf from './components/practices/basic/VueIf.vue'
import VueShow from './components/practices/basic/VueShow.vue'
import VueFor from './components/practices/basic/VueFor.vue'
import VuePre from './components/practices/basic/VuePre.vue'
import VueCloak from './components/practices/basic/VueCloak.vue'
import VueOnce from './components/practices/basic/VueOnce.vue'
import VueMemo from './components/practices/basic/VueMemo.vue'

// 3. Vue Event Handling
import EventBasic from './components/practices/basic/EventBasic.vue'
import EventObject from './components/practices/basic/EventObject.vue'
import EventModifier from './components/practices/basic/EventModifier.vue'

// 4. Vue Form Handling & Vue Style
import ModelBasic from './components/practices/basic/ModelBasic.vue'
import ModelForm from './components/practices/basic/ModelForm.vue'
import ModelModifier from './components/practices/basic/ModelModifier.vue'
import StyleScoped from './components/practices/basic/StyleScoped.vue'

// 5. Reactive State
import ReactiveRef from './components/practices/composition/ReactiveRef.vue'
import ReactiveReactive from './components/practices/composition/ReactiveReactive.vue'

// 6. Computed & Watchers
import ComputedBasic from './components/practices/composition/ComputedBasic.vue'
import WatchersBasic from './components/practices/composition/WatchersBasic.vue'
import WatchersMulti from './components/practices/composition/WatchersMulti.vue'
import WatchersDeep from './components/practices/composition/WatchersDeep.vue'
import WatchersReactive from './components/practices/composition/WatchersReactive.vue'
import WatchersWatchEffect from './components/practices/composition/WatchersWatchEffect.vue'

// 7. Component Lifecycle
import LifecycleParent from './components/practices/component/LifecycleParent.vue'

// 8. Props & Emits
import PropsEmitsParent from './components/practices/component/PropsEmitsParent.vue'

// 9. Component Slot
import SlotDefaultParent from './components/practices/component/SlotDefaultParent.vue'
import SlotNamedParent from './components/practices/component/SlotNamedParent.vue'
import SlotScopedParent from './components/practices/component/SlotScopedParent.vue'

// 10. Pinia
import StoreCounter from './components/practices/library/StoreCounter.vue'

const dashboardStore = useLearningStore()

const challenges = [
  { id: 1, icon: '🌱', title: '학습환경 구성', description: '반응성 데이터와 Text Interpolation' },
  { id: 2, icon: '🧩', title: 'Vue Directive', description: '화면을 제어하는 Vue 지시자' },
  { id: 3, icon: '🖱️', title: 'Event Handling', description: '이벤트 객체와 Modifier' },
  { id: 4, icon: '📝', title: 'Form & Style', description: '양방향 바인딩과 Vue 스타일' },
  { id: 5, icon: '⚡', title: 'Reactive State', description: 'ref()와 reactive() 상태 관리' },
  { id: 6, icon: '👀', title: 'Computed & Watchers', description: '계산된 값과 데이터 감시' },
  { id: 7, icon: '🔄', title: 'Lifecycle', description: '컴포넌트 생명주기 Hook' },
  { id: 8, icon: '📨', title: 'Props & Emits', description: '부모·자식 컴포넌트 통신' },
  { id: 9, icon: '🗂️', title: 'Component Slot', description: 'Default·Named·Scoped Slot' },
  { id: 10, icon: '🍍', title: 'Pinia', description: '전역 Store 상태 관리' },
]

const currentChallenge = computed(() => challenges.find((challenge) => challenge.id === dashboardStore.activeChallengeId))
</script>

<template>
  <div class="dashboard-shell">
    <header class="dashboard-header">
      <div class="header-copy">
        <span class="eyebrow">SKALA · VUE 3 CODE CHALLENGE</span>
        <h1> Vue.js Challenge 대쉬보드</h1>
        <p>판교 8반 P275 최규원 Vue 기본 문법부터 Composition API, Component, Pinia까지 구현한 Challenge 결과입니다.</p>
      </div>

      <div class="progress-card">
        <div class="progress-summary">
          <div>
            <span>Challenge 확인 현황</span>
            <strong>{{ dashboardStore.completedCount }} / 10 확인</strong>
          </div>
          <b>{{ dashboardStore.progressRate }}%</b>
        </div>
        <div
          class="progress-track"
          role="progressbar"
          aria-label="Challenge 확인 현황"
          :aria-valuenow="dashboardStore.progressRate"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <span :style="{ width: `${dashboardStore.progressRate}%` }"></span>
        </div>
        <div class="progress-footer">
          <small>{{ dashboardStore.lastViewedMessage }}</small>
          <button type="button" :disabled="dashboardStore.completedCount === 0" @click="dashboardStore.resetProgress">확인 상태 초기화</button>
        </div>
      </div>
    </header>

    <div class="dashboard-layout">
      <aside class="challenge-navigation">
        <div class="navigation-title">
          <span>CURRICULUM</span>
          <strong>제출 Challenge</strong>
        </div>

        <nav aria-label="Vue Challenge 제출 목록">
          <button
            v-for="challenge in challenges"
            :key="challenge.id"
            type="button"
            class="challenge-menu"
            :class="{
              active: dashboardStore.activeChallengeId === challenge.id,
              completed: dashboardStore.isCompleted(challenge.id),
            }"
            :aria-current="dashboardStore.activeChallengeId === challenge.id ? 'page' : undefined"
            @click="dashboardStore.selectChallenge(challenge.id)"
          >
            <span class="menu-number">{{ challenge.id }}</span>
            <span class="menu-copy">
              <strong>{{ challenge.icon }} {{ challenge.title }}</strong>
              <small>{{ challenge.description }}</small>
            </span>
            <span class="menu-status">{{ dashboardStore.isCompleted(challenge.id) ? '✓' : '›' }}</span>
          </button>
        </nav>
      </aside>

      <main class="challenge-content">
        <header class="challenge-heading">
          <div>
            <span class="challenge-label">CHALLENGE {{ currentChallenge.id }}</span>
            <h2>{{ currentChallenge.icon }} {{ currentChallenge.title }}</h2>
            <p>{{ currentChallenge.description }}</p>
          </div>

          <label class="complete-toggle">
            <input
              type="checkbox"
              :checked="dashboardStore.isCompleted(currentChallenge.id)"
              @change="dashboardStore.toggleChallenge(currentChallenge.id)"
            />
            <span>확인 완료</span>
          </label>
        </header>

        <section v-if="dashboardStore.activeChallengeId === 1" class="challenge-examples">
          <SampleOne />
          <SampleTwo />
        </section>

        <section v-else-if="dashboardStore.activeChallengeId === 2" class="challenge-examples">
          <VueHtml />
          <VueHtmlXss />
          <VueText />
          <VueBind />
          <VueBindClass />
          <VueBindStyle />
          <VueBindShorthand />
          <VueIf />
          <VueShow />
          <VueFor />
          <VuePre />
          <VueCloak />
          <VueOnce />
          <VueMemo />
        </section>

        <section v-else-if="dashboardStore.activeChallengeId === 3" class="challenge-examples">
          <EventBasic />
          <EventObject />
          <EventModifier />
        </section>

        <section v-else-if="dashboardStore.activeChallengeId === 4" class="challenge-examples">
          <ModelBasic />
          <ModelForm />
          <ModelModifier />
          <StyleScoped />
        </section>

        <section v-else-if="dashboardStore.activeChallengeId === 5" class="challenge-examples">
          <ReactiveRef />
          <ReactiveReactive />
        </section>

        <section v-else-if="dashboardStore.activeChallengeId === 6" class="challenge-examples">
          <ComputedBasic />
          <WatchersBasic />
          <WatchersMulti />
          <WatchersDeep />
          <WatchersReactive />
          <WatchersWatchEffect />
        </section>

        <section v-else-if="dashboardStore.activeChallengeId === 7" class="challenge-examples">
          <LifecycleParent />
        </section>

        <section v-else-if="dashboardStore.activeChallengeId === 8" class="challenge-examples">
          <PropsEmitsParent />
        </section>

        <section v-else-if="dashboardStore.activeChallengeId === 9" class="challenge-examples">
          <SlotDefaultParent />
          <SlotNamedParent />
          <SlotScopedParent />
        </section>

        <section v-else class="challenge-examples">
          <StoreCounter />
        </section>

        <footer class="challenge-pagination">
          <button type="button" :disabled="dashboardStore.activeChallengeId === 1" @click="dashboardStore.moveChallenge(-1)">← 이전 Challenge</button>
          <span>{{ dashboardStore.activeChallengeId }} / 10</span>
          <button type="button" :disabled="dashboardStore.activeChallengeId === 10" @click="dashboardStore.moveChallenge(1)">다음 Challenge →</button>
        </footer>
      </main>
    </div>
  </div>
</template>

<style>
@import '@/assets/practice.css';
</style>
