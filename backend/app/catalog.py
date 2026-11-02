"""수동 검수한 카탈로그만 읽는다. 자료 오류가 서버 시작을 막지 않는다."""

import json
import logging
import re
from collections import defaultdict
from datetime import date
from pathlib import Path

from pydantic import AnyHttpUrl, BaseModel, Field, StrictStr, TypeAdapter, ValidationError

CATALOG_PATH = Path(__file__).resolve().parents[2] / "docs" / "catalog" / "catalog_v0.json"
logger = logging.getLogger(__name__)


class CatalogSummary(BaseModel):
    brand: StrictStr = Field(min_length=1)
    model: StrictStr = Field(min_length=1)
    name: StrictStr = Field(min_length=1)
    url: AnyHttpUrl
    status: StrictStr = Field(min_length=1)
    variant: str | None = None  # 같은 이름의 다른 모델과 구별되는 핵심 사양(화면 표시용, 공식 이름은 그대로)


class CatalogEntry(CatalogSummary):
    category: StrictStr
    p: dict[str, StrictStr]
    checked_at: date


def load_catalog() -> list[CatalogEntry]:
    try:
        data = json.loads(CATALOG_PATH.read_text(encoding="utf-8-sig"))
        items = TypeAdapter(list[CatalogEntry]).validate_python(data)
        models = [p.model for p in items]
        if len(models) != len(set(models)) or any(
            p.category not in {"robot_vacuum", "dishwasher", "dryer", "air_purifier"} for p in items
        ):
            raise ValueError("모델 또는 제품군이 올바르지 않아요.")
        return items
    except (OSError, UnicodeError, ValueError, ValidationError):
        logger.warning("제품 카탈로그를 읽지 못해 빈 목록을 사용합니다.")
        return []


PRIORITY = ("용량", "면적", "인용", "건조", "무게")


def _label(key: str, value: str) -> str:
    """'건조 용량 (kg)', '20' -> '건조 용량 20kg'"""
    m = re.match(r"^(.*?)\s*\(([^()]*)\)\s*$", key)
    name, unit = (m.group(1), m.group(2)) if m and len(m.group(2)) <= 4 else (key, "")
    return f"{name} {value}{unit}".strip()


def with_variants(items: list[CatalogEntry]) -> list[CatalogEntry]:
    """같은 이름끼리 값이 다른 사양 최대 2개를 골라 variant로 붙인다(용량·면적 등을 먼저)."""
    groups: dict[str, list[CatalogEntry]] = defaultdict(list)
    for it in items:
        groups[f"{it.category}|{it.name}"].append(it)
    out = []
    for it in items:
        same = [o for o in groups[f"{it.category}|{it.name}"] if o is not it]
        if not same:
            out.append(it)
            continue
        # 목록에서 한눈에 읽히는 짧은 값만(O/X·긴 치수 표기는 제외)
        diff = [k for k, v in it.p.items() if all(o.p.get(k) != v for o in same) and v not in ("O", "X", "-") and len(v) <= 12]
        diff.sort(key=lambda k: next((i for i, w in enumerate(PRIORITY) if w in k), len(PRIORITY)))
        out.append(it.model_copy(update={"variant": " · ".join(_label(k, it.p[k]) for k in diff[:2]) or None}))
    return out
