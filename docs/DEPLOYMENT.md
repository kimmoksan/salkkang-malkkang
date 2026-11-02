# 예시 모드 배포 준비

현재 상태: 로컬에서 빌드된 웹과 API의 단일 주소 실행을 확인한다. 외부 호스팅은 아직 선택·배포하지 않았다. 실제 AI는 사용자 요청으로 보류 중이다.

## 로컬 운영 실행

저장소 루트에서 최초 `scripts/setup.ps1`, 이후 `scripts/check.ps1`로 빌드·검사하고 `scripts/start.ps1`을 실행한다. http://127.0.0.1:8000/ 에서 화면, /api/health 에서 `mode=mock`을 확인한다. 개발용 Vite 서버는 필요 없다.

서버 환경변수는 backend/.env보다 우선한다. 예시 시연에는 `APP_MODE=mock`을 명시한다. `.env`나 키를 프론트 빌드에 넣지 않는다.

## 호스팅용 명령

Node 22+, Python 3.12, uv가 있는 단일 서버 기준이다. 루트에서 순서대로 실행하고 하나라도 실패하면 배포를 중단한다.

```sh
npm --prefix frontend ci
npm --prefix frontend run build
uv sync --project backend --locked --no-dev
cd backend
uv run --no-sync python -m app.serve
```

환경변수:

| 변수 | 예시 모드 설정 |
|---|---|
| APP_MODE | mock |
| SERVE_FRONTEND | 1 |
| HOST | 호스팅에서는 0.0.0.0, 로컬 기본은 127.0.0.1 |
| PORT | 호스팅이 지정한 포트, 기본 8000 |
| RATE_LIMIT_PER_MIN | API별·IP별 12회/분 |
| FORWARDED_ALLOW_IPS | 직접 접속이면 빈 값. 프록시 뒤에서는 실제 신뢰 프록시 IP/CIDR만 지정 |

## 프록시와 요청 제한

- 운영 진입점 `app.serve`는 전달 헤더를 기본으로 무시한다. 신뢰 프록시를 지정했을 때만 Uvicorn이 X-Forwarded-For를 처리하고 요청 제한이 그 사용자 IP를 사용한다. 별도의 임의 헤더 파싱은 하지 않는다.
- `*`는 허용하지 않는다. 프록시 IP/CIDR을 호스팅 문서·설정에서 확인하고, 그 프록시가 외부에서 받은 전달 헤더를 정리하는지 확인해야 한다.
- 요청 횟수와 AI 호출 상한은 프로세스 메모리에 있다. 운영 진입점은 worker 1개로 고정한다. 호스팅 replica도 1개로 설정한다. 재시작 시 초기화되며 영구적인 일일 비용 보장은 아니다.
- 다중 서버·다중 worker로 확장할 때는 먼저 공용 카운터 저장소로 전환한다. 지금 단계에 유료 DB를 추가하지 않는다.

## 배포 직전·직후

1. `scripts/check.ps1` 통과와 원격 PR 최신 커밋의 CI 성공 확인.
2. 배포 대상 develop/main 커밋과 환경변수 확인. 프론트·백엔드·docs/catalog가 같은 커밋이어야 한다.
3. 빌드 결과만 정적으로 제공한다. 소스·.env를 웹 루트에 놓지 않는다.
4. 호스팅 URL에서 `/api/health`의 mock, `/api/catalog` 36개와 각 제품군 9개, `/` 화면·이미지 로드 확인.
5. 제품 선택 → 질문 답변·변경·생략 → 결과·복사 흐름 확인. 모바일 가로 넘침, API 429와 실패 후 입력 유지 확인.
6. 프록시를 통과한 서로 다른 두 클라이언트의 요청 제한이 분리되는지 실제 호스팅에서 확인.

외부 배포 URL·프록시 정보·호스팅 계정은 아직 정해지지 않았다. 위 항목의 실제 호스팅 검증을 완료했다고 간주하지 않는다.

## Render 배포 (2026-11-02 선택)

- 방식: Docker 단일 서비스(`Dockerfile`), 블루프린트 `render.yaml`(main 브랜치 자동 배포, 무료 플랜, 싱가포르, 헬스체크 `/api/health`).
- 모드: 실제 AI(`APP_MODE=live`) + Gemini 무료 한도 + 소진·실패 시 예시 공방 대체. `GEMINI_API_KEY`는 Render 대시보드에서 사용자가 직접 입력(`sync: false`).
- 프록시: Render 내부 사설망 `10.0.0.0/8`만 신뢰해 실제 사용자 IP로 요청 제한. 배포 후 서로 다른 두 기기로 제한 분리를 확인해야 함(미확인).
- 로컬 확인: 이미지 대신 같은 명령(`SERVE_FRONTEND=1 HOST=127.0.0.1 PORT=8010 FORWARDED_ALLOW_IPS=10.0.0.0/8 python -m app.serve`)으로 `/`, `/api/health`, `/api/catalog`(54개), 이미지 로드, 없는 API 404 확인. Docker 이미지 빌드는 로컬에 Docker가 없어 Render 첫 빌드에서 확인.
- 무료 플랜 특성: 15분간 요청이 없으면 잠들고 첫 접속에 수십 초 걸림. 재시작하면 요청 제한·AI 호출 횟수(메모리)가 초기화됨.
