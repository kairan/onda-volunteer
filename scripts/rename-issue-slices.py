#!/usr/bin/env python3
"""Rename issue specs: filename prefix = GitHub issue #; done/ history uses legacy- prefix."""
from __future__ import annotations

import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ISSUES = ROOT / "docs/issues"
DONE = ISSUES / "done"

SLICE_TO_GH: dict[str, str] = {
    "15": "5",
    "16": "6",
    "17": "7",
    "18": "8",
    "19": "11",
    "20": "9",
    "21": "12",
    "22": "16",
    "23": "13",
    "24": "14",
    "25": "15",
    "26": "17",
    "27": "10",
    "28": "18",
    "29": "19",
    "30": "22",
    "31": "27",
    "32": "28",
    "33": "29",
    "34": "36",
    "35": "37",
    "36": "38",
    "37": "39",
    "38": "40",
    "39": "41",
    "40": "42",
    "41": "43",
    "42": "44",
    "43": "45",
    "44": "46",
    "45": "47",
    "46": "48",
    "47": "49",
    "48": "54",
    "49": "55",
    "50": "56",
    "51": "57",
    "52": "58",
    "53": "60",
}

# Explicit src -> dst (no chained globs)
FILE_RENAMES: list[tuple[str, str]] = [
    ("docs/issues/53-web-playwright-browser-e2e.md", "docs/issues/60-web-playwright-browser-e2e.md"),
    ("docs/issues/35-event-roster-read-inside-shell.md", "docs/issues/37-event-roster-read-inside-shell.md"),
    (
        "docs/issues/36-event-roster-writes-assign-release-unavailability-offer.md",
        "docs/issues/38-event-roster-writes-assign-release-unavailability-offer.md",
    ),
    ("docs/issues/38-time-away-bulk-mirror-ministries.md", "docs/issues/40-time-away-bulk-mirror-ministries.md"),
    ("docs/issues/39-leader-manages-volunteer-unavailability.md", "docs/issues/41-leader-manages-volunteer-unavailability.md"),
    ("docs/issues/40-admin-creates-public-event.md", "docs/issues/42-admin-creates-public-event.md"),
    ("docs/issues/41-leader-creates-rosters-private-event.md", "docs/issues/43-leader-creates-rosters-private-event.md"),
    ("docs/issues/42-role-catalog-maintain-rename-retire.md", "docs/issues/44-role-catalog-maintain-rename-retire.md"),
    ("docs/issues/43-admin-cancels-event-voids-assignments.md", "docs/issues/45-admin-cancels-event-voids-assignments.md"),
    (
        "docs/issues/44-admin-manages-ministry-membership-lifecycle.md",
        "docs/issues/46-admin-manages-ministry-membership-lifecycle.md",
    ),
    ("docs/issues/45-admin-delegates-leaders-across-churches.md", "docs/issues/47-admin-delegates-leaders-across-churches.md"),
    ("docs/issues/46-personal-local-time-i18n-closeout.md", "docs/issues/48-personal-local-time-i18n-closeout.md"),
    ("docs/issues/47-hope-polish-wcag-release-gate.md", "docs/issues/49-hope-polish-wcag-release-gate.md"),
    ("docs/issues/48-api-scheduling-invariants-module.md", "docs/issues/54-api-scheduling-invariants-module.md"),
    ("docs/issues/49-api-request-scoped-auth-context.md", "docs/issues/55-api-request-scoped-auth-context.md"),
    ("docs/issues/50-api-church-stewardship-access-module.md", "docs/issues/56-api-church-stewardship-access-module.md"),
    ("docs/issues/51-api-assignment-route-under-scheduling.md", "docs/issues/57-api-assignment-route-under-scheduling.md"),
    ("docs/issues/52-web-retire-legacy-event-routes.md", "docs/issues/58-web-retire-legacy-event-routes.md"),
    (
        "docs/issues/done/34-scheduling-hub-event-list-visibility.md",
        "docs/issues/done/36-scheduling-hub-event-list-visibility.md",
    ),
    (
        "docs/issues/done/37-time-away-self-service-unavailability.md",
        "docs/issues/done/39-time-away-self-service-unavailability.md",
    ),
    *[
        (f"docs/issues/done/{name}", f"docs/issues/done/legacy-{name}")
        for name in [
            "01-read-path-event-detail.md",
            "02-leader-first-assignment-public-event.md",
            "03-unavailability-blocks-assign.md",
            "04-cross-ministry-double-booking-rejected.md",
            "05-membership-deactivate-void-future-assignments.md",
            "06-volunteer-release-assignment-optional-unavailability.md",
            "07-supabase-auth-identity-mapping.md",
            "08-web-client-design-system-shell-i18n.md",
            "09-web-client-design-foundation.md",
            "10-web-client-i18n-controller.md",
            "11-web-client-shell-routing-landmarks.md",
            "12-web-client-nav-placeholder-routes.md",
            "13-web-client-church-campus-context.md",
            "14-web-client-feedback-overlays-patterns-print.md",
            "15-organization-context-reads.md",
            "16-identity-persisted-ui-locale.md",
            "17-dashboard-my-upcoming-assignments.md",
            "18-time-away-list-create-unavailability.md",
            "19-time-away-bulk-mirror-ministries.md",
            "20-scheduling-event-list.md",
            "21-event-roster-read-in-shell.md",
            "22-event-roster-assign-and-release.md",
            "23-leader-manages-volunteer-unavailability.md",
            "24-admin-creates-public-event.md",
            "25-leader-creates-private-event.md",
            "26-pending-membership-ux.md",
            "27-role-catalog-maintain-retire.md",
            "28-admin-cancels-event-voids-assignments.md",
            "29-personal-local-time-presentation.md",
            "30-auth-gate-volunteer-provisioning.md",
            "31-hope-token-foundation-font-swap.md",
            "32-hope-component-shell-restyle.md",
            "33-doc-cleanup-archive-lamborghini.md",
        ]
    ],
]

MARKDOWN_PATHS = [
    ROOT / "AGENTS.md",
    ROOT / "README.md",
    ROOT / "docs/issues/README.md",
    ROOT / "docs/issues/architecture-debt.md",
    *ISSUES.glob("*.md"),
    *DONE.glob("*.md"),
    *(ROOT / "docs").rglob("*.md"),
]


def git_mv(src: Path, dst: Path) -> None:
    subprocess.run(["git", "mv", str(src), str(dst)], cwd=ROOT, check=True)


def rename_files() -> None:
    for src, dst in FILE_RENAMES:
        git_mv(ROOT / src, ROOT / dst)


def replace_slice_refs(text: str) -> str:
    for src, dst in FILE_RENAMES:
        old = Path(src).name.split("-", 1)[0]
        new = Path(dst).name.split("-", 1)[0]
        if old.startswith("legacy"):
            continue
        text = text.replace(src.replace("docs/issues/", ""), Path(dst).name)
        text = text.replace(f"docs/issues/{Path(src).name}", f"docs/issues/{Path(dst).name}")

    for old in sorted(SLICE_TO_GH.keys(), key=lambda x: -len(x)):
        gh = SLICE_TO_GH[old]
        if old == gh:
            continue
        text = re.sub(rf"slice \*\*{old}\*\*", f"slice **{gh}**", text, flags=re.I)
        text = re.sub(rf"Slice \*\*{old}\*\*", f"Slice **{gh}**", text)
        text = re.sub(rf"Blocked on {old}\b", f"Blocked on {gh}", text, flags=re.I)
        text = re.sub(rf"After \*\*{old}\*\*", f"After **{gh}**", text)
        text = re.sub(rf"After {old}\b", f"After {gh}", text)
        text = re.sub(rf"During slice \*\*{old}\*\*", f"During slice **{gh}**", text, flags=re.I)
        text = re.sub(rf"During slice {old}\b", f"During slice {gh}", text, flags=re.I)
        text = re.sub(rf"^# {old} —", f"# {gh} —", text, flags=re.M)
        text = re.sub(rf"\| {old} \|", f"| {gh} |", text)
        text = re.sub(rf"\| \*\*{old}\*\* \|", f"| **{gh}** |", text)
        text = re.sub(rf"\({old}, GH", f"({gh}, GH", text)
        text = re.sub(rf"\*\*{old}\*\*, GH", f"**{gh}**, GH", text)
        text = re.sub(rf"slice {old}\b", f"slice {gh}", text, flags=re.I)
        text = re.sub(rf"Slice {old}\b", f"Slice {gh}", text)
        text = re.sub(rf"slices {old}–", f"slices {gh}–", text)
        text = re.sub(rf"slices \*\*{old}\*\*", f"slices **{gh}**", text)
        text = re.sub(rf"With \*\*{old}–", f"With **{gh}–", text)
        text = re.sub(rf"After \*\*{old}–", f"After **{gh}–", text)
        text = re.sub(rf"After {old}–", f"After {gh}–", text)
        text = re.sub(rf"After {old} \+", f"After {gh} +", text)

    def repl_range(m: re.Match[str]) -> str:
        a, sep, b = m.group(1), m.group(2), m.group(3)
        return f"**{SLICE_TO_GH.get(a, a)}{sep}{SLICE_TO_GH.get(b, b)}**"

    text = re.sub(r"\*\*(\d{2})([–-])(\d{2})\*\*", repl_range, text)
    return text


def update_markdown() -> None:
    seen: set[Path] = set()
    for path in MARKDOWN_PATHS:
        if not path.exists() or path in seen or ".git" in path.parts:
            continue
        seen.add(path)
        original = path.read_text(encoding="utf-8")
        updated = replace_slice_refs(original)
        if updated != original:
            path.write_text(updated, encoding="utf-8")


def main() -> None:
    rename_files()
    update_markdown()
    print("Done.")


if __name__ == "__main__":
    main()
