import ast
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "apps" / "api" / "app" / "core" / "config.py"
CLIENT = ROOT / "apps" / "api" / "app" / "services" / "cwa_client.py"
README = ROOT / "README.md"
ENV_EXAMPLE = ROOT / ".env.example"


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def test_runtime_config_cannot_expose_a_boolean_tls_disable_switch() -> None:
    config = read(CONFIG)
    assert "CWA_VERIFY_SSL: bool" not in config
    if "CWA_VERIFY_SSL" in config:
        assert "Literal[True]" in config


def test_cwa_http_clients_never_allow_verify_false_or_runtime_toggle() -> None:
    source = read(CLIENT)
    assert "verify=False" not in source
    assert "settings.CWA_VERIFY_SSL" not in source

    tree = ast.parse(source)
    async_client_calls = []
    for node in ast.walk(tree):
        if not isinstance(node, ast.Call):
            continue
        func = node.func
        if isinstance(func, ast.Attribute) and func.attr == "AsyncClient":
            async_client_calls.append(node)

    assert async_client_calls, "Expected at least one httpx.AsyncClient call"
    for call in async_client_calls:
        verify_keywords = [kw for kw in call.keywords if kw.arg == "verify"]
        assert len(verify_keywords) == 1
        value = verify_keywords[0].value
        assert isinstance(value, ast.Constant) and value.value is True


def test_human_and_env_guidance_enforce_fail_closed_tls() -> None:
    readme = read(README)
    env_example = read(ENV_EXAMPLE)

    # Historical insecure guidance must never return.
    assert "可暫時在 `.env` 設定 `CWA_VERIFY_SSL=false`" not in readme
    assert "Set false only for local development" not in env_example
    assert "CWA_VERIFY_SSL=false" not in env_example

    # Current guidance must explicitly preserve the fail-closed contract.
    assert "Fail Closed" in readme
    assert "不要停用 TLS 憑證驗證" in readme
    assert "must remain true" in env_example
    assert "Setting false is rejected" in env_example
