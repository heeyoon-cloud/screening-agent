# Screening Agent — 이희윤 심사 에이전트

스파크랩 벤처1본부 이희윤 상무의 개인 심사 에이전트.
SparkClaw, TIPS, 모태펀드 등 다양한 심사에서 일관된 철학으로 팀을 평가하고
결과를 Notion에 자동 아카이빙합니다.

## 구조

```
screening-agent/
├── CLAUDE.md              ← Claude Code 지시문 (항상 먼저 읽힘)
├── persona.md             ← 심사 철학 & 학습 누적
├── config.example.js      ← API 키 템플릿
├── config.js              ← API 키 (gitignore — 직접 생성)
├── src/
│   ├── index.html         ← 메인 앱
│   ├── app.js             ← 에이전트 로직
│   └── style.css          ← 스타일
└── screening_log/         ← 심사 결과 JSON 백업
```

## 시작하기

1. `config.example.js`를 `config.js`로 복사
2. Anthropic API Key 입력
3. `src/index.html`을 브라우저에서 열기

## Claude Code에서 사용하기

```bash
# 프로젝트 폴더에서
claude

# 자주 쓰는 명령
> 페르소나 업데이트해줘 — 오늘 심사에서 발견한 패턴
> 지난 심사들 패턴 분석해줘
> 이번 결과 Notion에 저장해줘
```

## Notion DB
- **위치**: Venture Workflow > 기타 > 기업심사 > 🔍 심사 결과 아카이브
- **Data Source**: `collection://42443699-1dd8-4e0d-9560-1ca63ad2a78e`

## 페르소나 강화 방법
심사가 끝날 때마다 `persona.md`의 [심사 후 학습] 섹션에 한 줄 추가.
Claude Code가 다음 심사에서 자동으로 반영.
