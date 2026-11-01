"""빌드된 웹 화면을 API와 같은 주소에서 제공한다."""

from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles


def mount_frontend(app: FastAPI, directory: Path) -> None:
    if not (directory / "index.html").is_file():
        raise RuntimeError("웹 빌드가 없어요. frontend에서 npm run build를 먼저 실행해 주세요.")
    # API 라우트 등록 후 연결한다. 없는 API를 index.html로 바꾸지 않는다.
    app.mount("/", StaticFiles(directory=directory, html=True), name="frontend")
