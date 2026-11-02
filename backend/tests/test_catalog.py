import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app import catalog
from app.main import app

client = TestClient(app)
FIXTURE = Path(__file__).parent / "fixtures" / "catalog.json"
BASE = {"category": "robot_vacuum", "catalog_model": "TEST-R1", "reason": "청소 부담 줄이기"}


@pytest.fixture(autouse=True)
def fixture_catalog(monkeypatch):
    monkeypatch.setattr(catalog, "CATALOG_PATH", FIXTURE)


def test_list_and_category_filter_keep_discontinued():
    items = client.get("/api/catalog").json()
    assert len(items) == 3
    assert set(items[0]) == {"brand", "model", "name", "url", "status", "variant"}
    robots = client.get("/api/catalog?category=robot_vacuum").json()
    assert [p["model"] for p in robots] == ["TEST-R1", "TEST-R2"]
    assert robots[1]["status"] == "단종"
    assert len(client.get("/api/catalog?category=dryer").json()) == 1
    assert client.get("/api/catalog?category=tv").status_code == 422


def test_catalog_specs_keep_keys_values_and_official_provenance():
    res = client.post("/api/intake", json=BASE)
    assert res.status_code == 200
    product = res.json()
    fixture = json.loads(FIXTURE.read_text(encoding="utf-8"))[0]
    assert {s["key"]: s["value"] for s in product["specs"]} == fixture["p"]
    assert all(s["label"] == s["key"] for s in product["specs"])
    source = product["sources"][0]
    assert source["kind"] == "catalog"
    assert source["url"] == fixture["url"] and source["checked_at"] == fixture["checked_at"]
    assert all(s["source_id"] == source["id"] for s in product["specs"])
    assert "TEST-R1" in product["name"] and product["is_example"] is False
    assert product["link_read"] is False  # 공식 웹페이지를 실시간으로 읽었다고 표시하지 않음
    assert product["specs"][0]["status"] == "confirmed"
    assert product["specs"][2]["status"] == "needs_check"


@pytest.mark.parametrize("over", [
    {"catalog_model": "missing"}, {"category": "dryer"},
])
def test_invalid_catalog_input_rejected(over):
    assert client.post("/api/intake", json={**BASE, **over}).status_code == 422


def test_reason_edit_and_extra_text_preserve_official_specs():
    body = client.post("/api/intake", json={**BASE, "reason": "관리 부담 줄이기", "product_text": "사용자가 추가한 메모"}).json()
    assert body["reason"] == "관리 부담 줄이기"
    assert [s["kind"] for s in body["sources"]] == ["catalog", "user_input"]
    assert body["sources"][1]["text"] == "사용자가 추가한 메모"
    assert all(s["source_id"] == "src_catalog" for s in body["specs"])


def test_discontinued_model_has_notice():
    body = client.post("/api/intake", json={**BASE, "catalog_model": "TEST-R2"}).json()
    assert any("단종" in n for n in body["notices"])


@pytest.mark.parametrize("contents", [None, "{broken", "{}", "[{\"model\": 123}]", "\xff"])
def test_missing_or_broken_json_returns_empty_without_crashing(monkeypatch, tmp_path, contents):
    path = tmp_path / "catalog.json"
    if contents is not None:
        path.write_bytes(contents.encode("latin-1"))
    monkeypatch.setattr(catalog, "CATALOG_PATH", path)
    response = client.get("/api/catalog")
    assert response.status_code == 200 and response.json() == []
    assert client.get("/api/health").status_code == 200
    assert client.post("/api/intake", json=BASE).status_code == 422


def test_empty_manual_input_is_still_rejected():
    assert client.post("/api/intake", json={"category": "dryer", "reason": "빨래 말리기"}).status_code == 422


def test_same_name_models_get_distinguishing_variant():
    from app.catalog import CatalogEntry, with_variants
    base = dict(brand="LG전자", category="dryer", name="트롬 건조기", url="https://www.lge.co.kr/x", status="판매중", checked_at="2026-11-02")
    a = CatalogEntry(model="A20", p={"건조 용량 (kg)": "20", "색상": "화이트"}, **base)
    b = CatalogEntry(model="B18", p={"건조 용량 (kg)": "18", "색상": "화이트"}, **base)
    c = CatalogEntry(model="C1", p={"건조 용량 (kg)": "9"}, **{**base, "name": "다른 이름"})
    out = {x.model: x.variant for x in with_variants([a, b, c])}
    assert out == {"A20": "건조 용량 20kg", "B18": "건조 용량 18kg", "C1": None}  # 이름이 겹칠 때만, 같은 값(색상)은 제외


def test_catalog_pick_without_reason_is_accepted():
    assert client.post("/api/intake", json={"category": "robot_vacuum", "catalog_model": "TEST-R1", "reason": " "}).status_code == 200
