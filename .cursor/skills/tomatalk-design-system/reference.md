# TomaTok Design System (번역 서비스)

> TomaTok 메신저 디자인 시스템을 **Source of Truth**로 사용한다. 번역 화면은 새 디자인 시스템을 만들지 않고 아래 토큰과 컴포넌트만 쓴다.

기준 파일:
- `src/index.css`
- `src/translate.css`
- `src/shell.tsx`

---

## 1. Canvas

| 항목 | 값 |
| --- | --- |
| 폰 프레임 | **360 × 800** |
| 프레임 라운드 | 36 |
| 좌우 패딩 | **20** |
| 본문 폭 | **320** |

풀블리드 허용:
- 헤더
- 푸터
- 바텀시트
- 탭
- GNB

본문 320 안에 배치:
- 카드
- 리스트
- 카피
- 번역 입력·결과
- 상세 콘텐츠

고정 높이:

| 영역 | 높이 |
| --- | --- |
| 상태바 | 44 |
| 헤더 | 48 |
| 탭 | 40 |
| GNB | 64 |
| 스크롤 영역 | 나머지 (`flex: 1`) |

기존 클래스:
- `.phone`
- `.status`
- `.header`
- `.phone-scroll`
- `.footer`
- `.gnb`

---

## 2. Spacing

기본 토큰:
- 4
- 8
- 12
- 16
- 20

| 용도 | 값 |
| --- | --- |
| 아이콘·텍스트 gap | 4–8 |
| 작은 텍스트 그룹 | 4 |
| 연관 요소 | 8 |
| 카드 내부 요소 | 12 |
| 컴포넌트 간 | 12–16 |
| 그리드 가로 gap | 12 |
| 그리드 세로 gap | 16 |
| 섹션 사이 | 18 |
| 본문 좌우 | 20 |
| 본문 하단 여유 | 24–28 |
| 푸터 | `8 20 16` 또는 `10 16 18` |

---

## 3. Typography

폰트:
- **Pretendard**
- fallback: `Noto Sans KR`
- fallback: `Apple SD Gothic Neo`

기본 행간: `1.4`  
제목 자간: `-0.2px ~ -0.3px`

| 역할 | 크기 | 굵기 |
| --- | --- | --- |
| 배지 | 9–10 | 700–800 |
| 캡션 | 11 | 500 |
| 보조 | 12 | 600–700 |
| 섹션/메타 | 13 | 500–700 |
| 본문 | 14 | 600–700 |
| 고스트 CTA | 15 | 600 |
| 주요 CTA | 16 | 700 |
| 화면 제목 | 17 | 600–700 |
| 브랜드 | 18 | 800 |
| 큰 타이틀 | 20 | 800 |

---

## 4. Core Color

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `--red` | `#CD313E` | 브랜드, 활성 탭, CTA, GNB 선택 |
| `--red-soft` | `#FFF5F5` | 연한 강조 배경 |
| `--blue` | `#3186F6` | 링크·정보 강조 |
| `--bg` | `#F5F5F5` | 폰·리스트 배경 |
| `--surface` | `#FFFFFF` | 헤더, 카드, 시트 |
| `--text` | `#010101` | 본문 |
| `--muted` | `#6B6E76` | 보조 카피 |
| `--line` | `rgba(0, 0, 0, 0.08)` | 구분선 |
| `--gray-box` | `#E8EAEF` | 회색 박스 |

보조값:
- `#222` 아이콘
- `#404040` 안내 본문
- `#F3F4F6` / `#F4F5F8` 입력 pill, 칩
- `#F1F1F3` 선택 원
- `#ECECF0` 채팅 배경
- `#E4E4E8` 보더, 시트 핸들
- `#C8C8CE` 비활성 보내기
- `#D5D7DE` 비활성 CTA
- `#C5C5C8` 플레이스홀더
- `rgba(0, 0, 0, 0.4)` 시트 딤

```css
accent-color: var(--red);
```

---

## 5. Radius

| 값 | 용도 |
| --- | --- |
| 8 | 작은 아웃라인 버튼, 그리드 셀 |
| 12 | 주요 버튼, 작은 카드 |
| 16 | 카드, 썸네일, 프로모 |
| 20 | 입력 pill, 시트 상단 |
| 50% | 아이콘 원, 아바타 |
| 36 | 폰 프레임 |

새 화면마다 radius를 임의로 만들지 않습니다.

---

## 6. Elevation

| 용도 | 값 |
| --- | --- |
| 카드 그림자 | `0 4px 16px rgba(0, 0, 0, 0.06)` |
| FAB | `0 6px 16px rgba(205, 49, 62, 0.35)` |
| 시트 딤 | `rgba(0, 0, 0, 0.4)` |
| 시트 핸들 | 36×4 / `#E4E4E7` / radius 2 |

Dark Theme에서는 그림자보다:
- Surface 명도차
- Border
- 이미지 대비

로 계층을 구분합니다.

기본 UI에 Glow를 사용하지 않습니다.

---

## 7. Icon

라이브러리:
`@phosphor-icons/react`

| 위치 | 크기 | weight |
| --- | --- | --- |
| 헤더 | 22 | light / regular |
| 입력·보내기 | 16–18 | bold / fill |
| 컴팩트 | 16 | bold |

---

## 8. Core Components

### Header
- 높이 48
- 가운데 제목 17/600
- 좌우 아이콘 버튼 44×44
- 뒤로가기: `ArrowLeft`

### Primary CTA
`.btn-red`
- width 100%
- height 48
- radius 12
- font 16/700

### Ghost Button
`.btn-ghost`
- 15/600

### Outline Red
`.btn-outline-red`
- height 32
- red border

### Chip
- height 32
- padding x12
- radius 16
- 13/600

### Tab
- height 40
- 비선택 `--muted`
- 선택 `--red`
- 하단 2px bar

### Bottom Sheet
- `absolute inset 0`
- 상단 radius 20
- padding `18 16 22`
- 취소 + 확정

### GNB
- 4칸 (친구 · 대화 · 서비스 · 더보기)
- height 64
- 상단 선
- 비선택 `#9AA0A6`
- 선택 `--red`

