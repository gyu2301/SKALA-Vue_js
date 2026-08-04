<script setup></script>

<template>
  <div class="app-container">
    <h1>⛅ 과제 4: 라우터 적용</h1>
    <hr />

    <nav class="navigation-bar">
      <RouterLink class="nav-item" to="/">📊 날씨 대시보드</RouterLink>
      <span class="divider">|</span>
      <RouterLink class="nav-item" to="/about">📄 서비스 소개</RouterLink>
    </nav>

    <RouterView />
  </div>
</template>

<style>
@import '@/assets/exercise.css';
</style>
