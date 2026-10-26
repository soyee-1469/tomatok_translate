---
name: tomatalk-design-system
description: >-
  Applies the TomaTok Core Design System to the translate service web mock.
  Use when building, restyling, or reviewing TomaTok phone UI or translate
  screens, or when the user mentions DESIGN.md, TomaTok DS, 360px.
---

# TomaTok Design System

기존 TomaTok 메신저 DS가 Source of Truth다. 번역 서비스는 새 시스템을 만들지 않고 기존 토큰과 컴포넌트를 그대로 쓴다.

전체 스펙은 [reference.md](reference.md)를 그대로 따른다. 구현 전에 해당 파일을 읽는다.

## 적용 순서

1. `reference.md`의 Canvas / Spacing / Type / Color / Radius를 확인한다.
2. 번역 화면은 Core(라이트) 토큰을 쓴다.
3. 새 좌우 여백, 버튼 높이, 라운드, 타이포, spacing 체계를 만들지 않는다.

## 빠른 제약

- Canvas **360 × 800**, 본문 좌우 **20**, 내용 **320**
- Spacing **4 / 8 / 12 / 16 / 20**
- Header 48 / Tab 40 / GNB 64 / CTA 48
- Radius **8 / 12 / 16 / 20**
- Font Pretendard
- Primary `#CD313E`
- 로컬은 `http://localhost:5173`만 사용
- 번역 내부 화면에는 GNB를 넣지 않는다 (서비스 홈에만 사용)
