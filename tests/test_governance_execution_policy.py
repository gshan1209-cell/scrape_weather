from pathlib import Path
import re

import pytest

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


LEGACY_EXECUTION_MARKERS = ("Test-only", "test-only", "blocked-by-cwa-test-only")
SUPERSEDED_DECISION = (
    "  - id: historical-shared-adapter-test-only-flow\n"
    "    status: superseded\n"
    "    decision: shared Adapter validation previously referenced independent Test-only flow\n"
    "    supersededBy: DS-003@2.1.1\n"
)


def active_surface_text(path: Path, content: str) -> str:
    # Preserve the approved history in the snapshot. Only this exact superseded
    # record, within resolvedDecisions, is historical; all other text is checked.
    if path != ROOT / ".ai-company" / "status-snapshot.yaml":
        return content
    section = re.search(r"(?ms)^resolvedDecisions:\n.*?(?=^[^\s#]|\Z)", content)
    if section is None:
        return content
    complete_record = (
        r"(?m)^" + re.escape(SUPERSEDED_DECISION)
        + r"(?=(?:[ \t]*(?:#[^\n]*)?\n)*(?:  - |[ \t]*\Z))"
    )
    active_section = re.sub(complete_record, "", section.group(), count=1)
    return content[:section.start()] + active_section + content[section.end():]


def assert_current_execution_only(path: Path, content: str) -> None:
    active = active_surface_text(path, content)
    for marker in LEGACY_EXECUTION_MARKERS:
        assert marker not in active, f"{path.name} publishes legacy execution marker: {marker}"


def test_active_surfaces_do_not_publish_test_only_execution() -> None:
    for path in SURFACES:
        assert_current_execution_only(path, read(path))


@pytest.mark.parametrize("marker", LEGACY_EXECUTION_MARKERS)
def test_history_exception_does_not_hide_active_legacy_execution(marker: str) -> None:
    content = "resolvedDecisions:\n" + SUPERSEDED_DECISION + f"\nexecution:\n  mode: {marker}\n"
    with pytest.raises(AssertionError):
        assert_current_execution_only(ROOT / ".ai-company" / "status-snapshot.yaml", content)


@pytest.mark.parametrize("path", [path for path in SURFACES if path.name != "status-snapshot.yaml"])
def test_other_surfaces_cannot_use_the_history_exception(path: Path) -> None:
    with pytest.raises(AssertionError):
        assert_current_execution_only(path, "resolvedDecisions:\n" + SUPERSEDED_DECISION)


@pytest.mark.parametrize("original,replacement", [
    ("status: superseded", "status: current"),
    ("supersededBy: DS-003@2.1.1", "supersededBy: DS-003@2.0.0"),
    ("resolvedDecisions:", "execution:"),
])
def test_reactivated_or_unqualified_history_remains_blocked(original: str, replacement: str) -> None:
    content = ("resolvedDecisions:\n" + SUPERSEDED_DECISION).replace(original, replacement)
    with pytest.raises(AssertionError):
        assert_current_execution_only(ROOT / ".ai-company" / "status-snapshot.yaml", content)


@pytest.mark.parametrize("extension", [
    "    status: current\n",
    "    supersededBy: DS-003@2.0.0\n",
    "    extra: unapproved\n",
    "      INVALID-AUTHORITY\n",
    "\n      INVALID-AUTHORITY\n",
    "# retained comment\n    extra: unapproved\n",
])
def test_extended_history_record_remains_blocked(extension: str) -> None:
    content = "resolvedDecisions:\n" + SUPERSEDED_DECISION + extension
    with pytest.raises(AssertionError):
        assert_current_execution_only(ROOT / ".ai-company" / "status-snapshot.yaml", content)


@pytest.mark.parametrize("boundary", [
    "",
    "\n",
    "  - id: another-decision\n    status: current\n",
    "\n    # preserved comment\n  - id: another-decision\n    status: current\n",
    "# preserved comment\n  - id: another-decision\n    status: current\n",
])
def test_exact_historical_record_allows_complete_record_boundaries(boundary: str) -> None:
    content = "resolvedDecisions:\n" + SUPERSEDED_DECISION + boundary
    assert_current_execution_only(ROOT / ".ai-company" / "status-snapshot.yaml", content)


def test_comments_after_history_remain_checked() -> None:
    content = "resolvedDecisions:\n" + SUPERSEDED_DECISION + "    # Test-only\n"
    with pytest.raises(AssertionError):
        assert_current_execution_only(ROOT / ".ai-company" / "status-snapshot.yaml", content)


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
