from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SURFACES = [
    ROOT / "AGENTS.md",
    ROOT / ".ai-company" / "repo-manifest.yaml",
    ROOT / ".ai-company" / "agent-context.yaml",
    ROOT / ".ai-company" / "status-snapshot.yaml",
    ROOT / ".ai-company" / "dual-interface.yaml",
]

CURRENT_CHAIN = [
    "DS-003@2.1.1",
    "RESP-DEV-AGENT-001@2.1.1",
    "PROC-VALIDATION-TASK-001@2.1.1",
    "PROC-CODEX-POST-MAIN-VALIDATION-001@1.1.1",
    "PROC-CHATGPT-AUDIT-001@2.1.1",
    "PROC-ISSUE-CLOSURE-001@2.1.1",
]


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def test_active_surfaces_do_not_publish_test_only_execution() -> None:
    joined = "\n".join(read(path) for path in SURFACES)
    assert "Test-only" not in joined
    assert "test-only" not in joined
    assert "blocked-by-cwa-test-only" not in joined


def test_current_ds003_chain_and_read_only_validator_are_projected() -> None:
    agents = read(ROOT / "AGENTS.md")
    for ref in CURRENT_CHAIN:
        assert ref in agents

    joined = "\n".join(read(path) for path in SURFACES[1:])
    assert "DS-003@2.1.1" in joined
    assert "testPullRequest: null" in joined
    assert "validatorRepositoryWrite: false" in joined
    assert "pendingValidationFreezesMain: false" in joined


def test_shared_adapter_dependency_uses_current_handoff_without_pass_promotion() -> None:
    joined = "\n".join(read(path) for path in SURFACES)
    assert "7656e4aaa9a05c3b1492a28fd1a78b167e56122b" in joined
    assert "AI-Workstream#242" in joined
    assert "AI-Workstream#243" in joined
    assert "sharedAdapterValidationStatus: pending" in joined
    assert "sharedAdapterProductionAdoption: blocked" in joined


def test_l3_product_and_runtime_truth_remain_fail_closed() -> None:
    joined = "\n".join(read(path) for path in SURFACES)
    assert "governanceLevel: L3" in joined
    assert "systemType: agricultural-weather-product" in joined
    assert "mockMayBeRepresentedAsLiveOfficialData: false" in joined
    assert "productionTlsVerificationRequired: true" in joined
    assert "tlsFailureMayBecomeTrustedData: false" in joined
    assert "verifiedConformance: false" in joined
    assert "productionReadiness: not-ready" in joined
