<script setup>
import UnitToggler from '@/components/exercise/UnitToggler.vue'
</script>

<template>
  <div class="app-container">
    <h1>⛅ 과제 5: 스토어 적용</h1>
    <hr />

    <nav class="navigation-bar">
      <div class="nav-links">
        <RouterLink class="nav-item" to="/">📊 날씨 대시보드</RouterLink>
        <span class="divider">|</span>
        <RouterLink class="nav-item" to="/about">📄 서비스 소개</RouterLink>
      </div>
      <UnitToggler />
    </nav>

    <RouterView />
  </div>
</template>

<style>
@import '@/assets/exercise.css';
</style>
