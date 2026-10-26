# TomaTok 번역 서비스 (웹 시안)

React(Vite)로 만든 TomaTok 번역 서비스 화면 시안입니다. 360×800 폰 프레임으로 렌더링되며, 브라우저 캡처/드래그로 Figma에 붙일 수 있습니다.

```bash
npm install
npm run dev
```

기본 주소: http://localhost:5173/tomatok_translate/

## 화면

| 화면 | 주소 |
| --- | --- |
| 서비스 메뉴 | `/services` |
| 기본 번역 (입력하면 결과 자동 표시) | `/services/translate` |

번역 화면 하단 메뉴에서 **음성 · 대화 · 이미지 · 문서** 번역 모드로 들어갑니다.

## 구조

- `src/translate/TranslateScreens.tsx` 서비스 메뉴, 기본 번역 화면
- `src/translate/TranslateModes.tsx` 음성 · 대화 · 이미지 · 문서 모드, 언어 선택
- `src/translate/data.ts` 언어 목록, 번역 샘플 데이터
- `src/translate.css` 번역 화면 스타일
- `src/shell.tsx` 공용 폰 프레임 · 헤더 · 하단 탭
- `DESIGN.md` 디자인 토큰 · 컴포넌트 규칙

## 배포

`main`에 푸시하면 GitHub Actions(`.github/workflows/deploy.yml`)가 빌드해서 GitHub Pages에 올립니다.

- 주소: https://soyee-1469.github.io/tomatok_translate/
