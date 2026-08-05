import { createApp } from 'vue'
import { createPinia } from 'pinia'

// [실습 8 - Element Plus 전역 적용]
// 각 컴포넌트에서 반복 import하지 않도록 Element Plus와 한국어 locale, 기본 CSS를 앱 시작점에 등록한다.
import ElementPlus from 'element-plus'
import ko from 'element-plus/es/locale/lang/ko'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 이 설정으로 <el-button>, <el-card>, <el-alert> 등을 전체 화면에서 사용할 수 있다.
app.use(ElementPlus, { locale: ko })

app.mount('#app')
