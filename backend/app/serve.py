"""단일 프로세스 운영 진입점. 전달 헤더는 지정한 프록시만 신뢰한다."""

import os

import uvicorn
from dotenv import load_dotenv


def server_options() -> dict:
    trusted = os.getenv("FORWARDED_ALLOW_IPS", "").strip()
    if any(host.strip() == "*" for host in trusted.split(",")):
        raise ValueError("FORWARDED_ALLOW_IPS에는 * 대신 신뢰할 프록시 IP/CIDR을 지정해 주세요.")
    return {
        "host": os.getenv("HOST", "127.0.0.1"),
        "port": int(os.getenv("PORT", "8000")),
        "workers": 1,
        "proxy_headers": bool(trusted),
        "forwarded_allow_ips": trusted,
    }


if __name__ == "__main__":
    load_dotenv()
    uvicorn.run("app.main:app", **server_options())
