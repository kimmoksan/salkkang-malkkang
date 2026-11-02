"""사용자(IP)별 요청 제한. 링크 읽기·AI 호출처럼 비용이 드는 API를 한 사람이 몰아 쓰지 못하게 한다."""

import os
import threading
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request

WINDOW_SEC = 60
_lock = threading.Lock()
_hits: dict[str, deque[float]] = defaultdict(deque)


def limit(request: Request) -> None:
    # app.serve의 Uvicorn이 신뢰 프록시의 전달 헤더만 request.client에 반영한다.
    # 단일 프로세스 메모리 기준. 다중 서버 전환 시 공용 저장소가 필요하다.
    per_min = int(os.getenv("RATE_LIMIT_PER_MIN", "12"))
    key = f"{request.url.path}:{request.client.host if request.client else '-'}"
    now = time.monotonic()
    with _lock:
        q = _hits[key]
        while q and now - q[0] > WINDOW_SEC:
            q.popleft()
        if len(q) >= per_min:
            raise HTTPException(status_code=429, detail="요청이 너무 잦아요. 1분쯤 뒤에 다시 시도해 주세요.")
        q.append(now)
