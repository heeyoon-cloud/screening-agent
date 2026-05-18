# Screening Agent — Claude Code 지시문

## 이 프로젝트가 뭔가요
이희윤(SparkLabs 벤처1본부 상무)의 개인 심사 에이전트입니다.
스파크클로 배치, TIPS, 모태펀드 등 다양한 심사에서 일관된 평가 기준과 페르소나로 팀을 평가하고,
결과를 Notion DB에 자동 아카이빙합니다.

## 핵심 파일
- `persona.md` — 이희윤 심사 철학 (수정하면 다음 심사부터 반영)
- `src/index.html` — 메인 앱 (claude.ai 위젯 버전과 동일)
- `src/app.js` — 에이전트 핵심 로직
- `src/style.css` — 스타일
- `config.js` — API 키 설정 (gitignore됨, config.example.js 참고)
- `screening_log/` — 심사 결과 JSON 로컬 백업

## 페르소나 업데이트 방법
심사가 끝난 뒤 `persona.md`의 [심사 후 학습] 섹션에 한 줄 추가하세요.
예: `- 2025-05: 고객 인터뷰 50명 이상 한 팀이 모두 PASS였다.`

## Notion DB 정보
- DB: 🔍 심사 결과 아카이브
- 위치: Venture Workflow > 기타(포트폴리오 외) > 기업심사
- Data Source ID: collection://42443699-1dd8-4e0d-9560-1ca63ad2a78e

## 자주 하는 작업
- "페르소나 업데이트해줘" → persona.md 편집
- "이번 심사 결과 Notion에 저장해줘" → notion-create-pages 호출
- "지난 심사들 패턴 분석해줘" → screening_log/ 파일들 분석
