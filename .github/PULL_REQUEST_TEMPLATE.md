## 요약

<!-- 무엇을 왜 바꾸는가. 관련 이슈/인시던트 링크 -->

## 체크리스트

- [ ] `pnpm lint` / `pnpm typecheck` / `pnpm test` 통과
- [ ] 회귀 테스트 추가(버그 수정이라면 재발을 잡는 vitest 또는 maestro 플로우)
- [ ] 영향 배포 단위 확인: chattea-web(standalone·remote) / shell / chattea-mobile 중 어디가 영향받는가
- [ ] MF shared singleton(react/react-dom/react-query) 버전 변경 시 양쪽(`chattea-web` + `shell`) 함께 변경

## 롤백 노트

<!-- 되돌리는 방법: revert 후 재배포? shell 재배포 필요? 네이티브라면 스토어 심사 리드타임 고려했는가 -->

## 모니터링

<!-- 배포 후 볼 것: Sentry release, RUM service/version, /vitals 지표. 새 에러·지표 유입 가능성 -->
