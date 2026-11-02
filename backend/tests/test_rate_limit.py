from fastapi.testclient import TestClient

from app import main, rate_limit
from app.main import app

client = TestClient(app)
HEARING = {"category": "robot_vacuum", "scene_id": "rv_daily", "reason": "x"}


def test_intake_is_limited_per_ip_with_korean_message(monkeypatch):
    monkeypatch.setenv("RATE_LIMIT_PER_MIN", "3")
    body = {"category": "dryer", "product_text": "건조기", "reason": "x"}
    codes = [client.post("/api/intake", json=body).status_code for _ in range(4)]
    assert codes == [200, 200, 200, 429]
    assert "1분" in client.post("/api/intake", json=body).json()["detail"]


def test_mock_hearing_is_not_limited(monkeypatch):
    # 예시 공방은 비용이 없으니 답을 여러 번 바꿔도 막지 않는다(막히면 다음 장면으로 못 넘어가던 문제).
    monkeypatch.setenv("RATE_LIMIT_PER_MIN", "2")
    monkeypatch.delenv("APP_MODE", raising=False)
    assert all(client.post("/api/hearing", json=HEARING).status_code == 200 for _ in range(5))


def test_live_hearing_is_limited(monkeypatch):
    monkeypatch.setenv("RATE_LIMIT_PER_MIN", "2")
    monkeypatch.setenv("APP_MODE", "live")
    monkeypatch.setenv("GEMINI_API_KEY", "test-secret-value")
    monkeypatch.setenv("GEMINI_MODEL", "test-model")
    monkeypatch.setattr(main, "generate_json", lambda *a, **k: (_ for _ in ()).throw(main.GeminiError("x")))
    codes = [client.post("/api/hearing", json=HEARING).status_code for _ in range(3)]
    assert codes == [200, 200, 429]
