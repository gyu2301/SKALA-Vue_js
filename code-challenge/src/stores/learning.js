import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useLearningStore = defineStore('learning-progress', () => {
  const activeChallengeId = ref(1)
  const completedChallenges = ref([])
  const lastViewedMessage = ref('Challenge 1을 확인해주세요.')

  const completedCount = computed(() => completedChallenges.value.length)
  const progressRate = computed(() => Math.round((completedCount.value / 12) * 100))

  watch(activeChallengeId, (newId, oldId) => {
    lastViewedMessage.value = `Challenge ${oldId} 확인 후 Challenge ${newId} 내용을 보고 있습니다.`
  })

  function selectChallenge(id) {
    activeChallengeId.value = id
  }

  function toggleChallenge(id) {
    if (completedChallenges.value.includes(id)) {
      completedChallenges.value = completedChallenges.value.filter((challengeId) => challengeId !== id)
      return
    }

    completedChallenges.value.push(id)
  }

  function isCompleted(id) {
    return completedChallenges.value.includes(id)
  }

  function resetProgress() {
    completedChallenges.value = []
    activeChallengeId.value = 1
    lastViewedMessage.value = 'Challenge 확인 상태를 초기화했습니다.'
  }

  function moveChallenge(direction) {
    const nextId = activeChallengeId.value + direction
    if (nextId >= 1 && nextId <= 12) {
      activeChallengeId.value = nextId
    }
  }

  return {
    activeChallengeId,
    completedChallenges,
    completedCount,
    progressRate,
    lastViewedMessage,
    selectChallenge,
    toggleChallenge,
    isCompleted,
    resetProgress,
    moveChallenge,
  }
})
