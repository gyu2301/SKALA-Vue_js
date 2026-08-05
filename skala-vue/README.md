# SKALA Weather Experience

Element Plus를 활용해 3일차 날씨 대시보드를 확장한 Vue 3 프로젝트입니다.

## 핵심 기능

- `earth.nullschool.net` 실시간 바람 지구본: 드래그 회전, 확대/축소, 세계 기류 확인
- OpenWeatherMap 도시 검색과 실시간 기온·습도·풍속
- 비·눈·폭염·건조 조건에 따른 생활 날씨 알림
- Today's Brief는 브라우저 현재 좌표를 우선 사용하고, 좌표 획득 실패 시 네트워크 기반 대략 위치로 대체
- 도시 상세 화면의 24시간 기온/강수 확률 차트
- 아침·점심·오후·저녁 시간대별 옷차림 추천
- 섭씨/화씨 전역 단위 전환

## Element Plus 활용 부분

`ElInput`, `ElButton`, `ElCard`, `ElAlert`, `ElTag`, `ElProgress`, `ElSkeleton`,
`ElEmpty`, `ElRadioGroup`, `ElMessage`, `ElLink`를 검색·피드백·상태 표시에 적용했습니다.

## 실행 방법

`.env`에 OpenWeatherMap API key를 설정합니다.

```sh
VITE_OPENWEATHER_API_KEY=your_api_key
```

```sh
npm install
npm run dev
```

지구본은 외부 실시간 데이터를 사용하므로 인터넷 연결이 필요합니다.

## 배포

[실습 10 - Vite 빌드 및 실무 배포] 과제 항목 점검 결과:

- **ESLint**: `npm run lint` 통과 (에러 없음)
- **API 키 환경 변수화**: `VITE_OPENWEATHER_API_KEY`를 `.env`로 분리, `.gitignore`에 등록되어 있어 Git에 커밋된 적 없음
- **정적 파일 호스팅**: GitHub Pages 대신 [Vercel](https://skala-vue-jsweather-viewer.vercel.app)로 이미 배포 완료. `npm run build` 산출물(`dist/`)을 그대로 정적 호스팅하므로 Node.js 서버 없이 서비스된다는 요구사항은 동일하게 충족되어 별도로 GitHub Pages에 재배포하지 않았습니다.
