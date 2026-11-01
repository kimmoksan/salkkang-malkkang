from fastapi import FastAPI
from fastapi.testclient import TestClient
import pytest
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

from app.frontend import mount_frontend
from app.main import app
from app.serve import server_options


def test_static_build_preserves_api_and_rejects_missing_files(tmp_path):
    static = tmp_path / "dist"
    static.mkdir()
    (static / "index.html").write_text("<h1>살깡말깡</h1>", encoding="utf-8")
    (tmp_path / ".env").write_text("비공개", encoding="utf-8")
    application = FastAPI()

    @application.get("/api/health")
    def health():
        return {"status": "ok"}

    mount_frontend(application, static)
    client = TestClient(application)
    assert "살깡말깡" in client.get("/").text
    assert client.get("/api/health").json() == {"status": "ok"}
    assert client.get("/api/missing").status_code == 404
    assert client.get("/%2e%2e/.env").status_code == 404
    assert client.get("/.env").status_code == 404


def test_missing_frontend_build_fails_clearly(tmp_path):
    with pytest.raises(RuntimeError, match="npm run build"):
        mount_frontend(FastAPI(), tmp_path)


def test_production_defaults_ignore_forwarded_headers(monkeypatch):
    monkeypatch.delenv("FORWARDED_ALLOW_IPS", raising=False)
    options = server_options()
    assert options["workers"] == 1
    assert options["proxy_headers"] is False
    monkeypatch.setenv("FORWARDED_ALLOW_IPS", "*")
    with pytest.raises(ValueError):
        server_options()


def test_trusted_proxy_keeps_client_quotas_separate(monkeypatch):
    monkeypatch.setenv("RATE_LIMIT_PER_MIN", "1")
    client = TestClient(ProxyHeadersMiddleware(app, trusted_hosts="10.0.0.1"), client=("10.0.0.1", 1234))
    body = {"category": "robot_vacuum", "scene_id": "rv_daily", "reason": "청소 부담"}
    assert client.post("/api/hearing", json=body, headers={"X-Forwarded-For": "198.51.100.1"}).status_code == 200
    assert client.post("/api/hearing", json=body, headers={"X-Forwarded-For": "198.51.100.2"}).status_code == 200
    assert client.post("/api/hearing", json=body, headers={"X-Forwarded-For": "198.51.100.1"}).status_code == 429


def test_untrusted_client_cannot_bypass_quota_with_spoofed_header(monkeypatch):
    monkeypatch.setenv("RATE_LIMIT_PER_MIN", "1")
    client = TestClient(ProxyHeadersMiddleware(app, trusted_hosts="10.0.0.1"), client=("198.51.100.10", 1234))
    body = {"category": "robot_vacuum", "scene_id": "rv_daily", "reason": "청소 부담"}
    assert client.post("/api/hearing", json=body, headers={"X-Forwarded-For": "198.51.100.1"}).status_code == 200
    assert client.post("/api/hearing", json=body, headers={"X-Forwarded-For": "198.51.100.2"}).status_code == 429
