#!/usr/bin/env python3
"""ARVENAIRE production static-site validation.

Runs without third-party dependencies. Intended for local use and CI.
"""
from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
TEXT_EXTENSIONS = {".html", ".css", ".js", ".md", ".txt", ".xml", ".json", ".py"}

ERRORS: list[str] = []


def fail(message: str) -> None:
    ERRORS.append(message)


def read(path: str | Path) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def text_files() -> list[Path]:
    files: list[Path] = []
    for path in ROOT.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in TEXT_EXTENSIONS:
            continue
        if ".git" in path.parts:
            continue
        files.append(path)
    return files


class ReferenceParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.refs: list[tuple[str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        for attr in ("href", "src"):
            value = values.get(attr)
            if value:
                self.refs.append((attr, value.strip()))


def validate_local_references() -> None:
    for html_path in ROOT.glob("*.html"):
        parser = ReferenceParser()
        parser.feed(html_path.read_text(encoding="utf-8"))
        for attr, raw in parser.refs:
            parsed = urlsplit(raw)
            if parsed.scheme in {"http", "https", "mailto", "tel", "data", "javascript"}:
                continue
            if raw.startswith("#") or not parsed.path:
                continue
            target_text = unquote(parsed.path)
            target = ROOT / target_text.lstrip("/") if target_text.startswith("/") else html_path.parent / target_text
            if target_text.endswith("/"):
                target = target / "index.html"
            if not target.exists():
                fail(f"Broken local {attr} in {html_path.name}: {raw} -> {target.relative_to(ROOT)}")


def validate_no_regressions(files: list[Path]) -> None:
    banned = {
        "100% free, always": "obsolete all-free commercial claim",
        "revenue comes from university partnerships": "unsupported revenue claim",
        "100% free service": "obsolete all-free service claim",
        "60-min strategy session": "obsolete session duration",
        "60 minutes in duration": "obsolete session duration",
    }
    for path in files:
        content = path.read_text(encoding="utf-8", errors="strict").lower()
        for phrase, reason in banned.items():
            if phrase in content:
                fail(f"{reason} found in {path.relative_to(ROOT)}: {phrase!r}")

    endpoint = "https://api.web3forms.com/submit"
    endpoint_files = [p.relative_to(ROOT).as_posix() for p in files if endpoint in p.read_text(encoding="utf-8")]
    if endpoint_files != ["js/forms.js"]:
        fail(f"Web3Forms endpoint must exist only in js/forms.js; found in {endpoint_files}")

    key = "5e418a41-4cad-44f0-9b93-eccaeff3f36c"
    key_files = [p.relative_to(ROOT).as_posix() for p in files if key in p.read_text(encoding="utf-8")]
    if key_files != ["js/forms.js"]:
        fail(f"Web3Forms access key must exist only in js/forms.js; found in {key_files}")


def validate_commercial_invariants() -> None:
    checks = {
        "js/offers.js": ["120 minutes", "₹2,499", "₹499"],
        "terms.html": ["120 minutes", "₹2,499", "₹499"],
        "refunds.html": ["120 minutes", "₹2,499", "₹499"],
    }
    for path, tokens in checks.items():
        content = read(path).lower()
        for token in tokens:
            if token.lower() not in content:
                fail(f"Commercial invariant {token!r} missing from {path}")

    for path in ("germany.html", "japan.html", "korea.html"):
        content = read(path)
        for required in ("css/country.css", "js/scholarships.js", "js/country.js"):
            if required not in content:
                fail(f"{path} must load {required}")
        for obsolete in ("career-priority", "-polish.css", "_scene.js", "style_cloud_journey.css"):
            if obsolete in content:
                fail(f"{path} still references obsolete country layer: {obsolete}")

    for path in ("blog.html", "contact.html", "resources.html"):
        if 'href="css/style.css"' not in read(path):
            fail(f"{path} must continue loading css/style.css")


def validate_legacy_removal() -> None:
    obsolete = [
        "js/data.js",
        "js/main.js",
        "js/japan_particle_scene.js",
        "js/webgl_journey.js",
        "js/japan_scene.js",
        "js/germany_scene.js",
        "js/korea_scene.js",
        "css/style_cloud_journey.css",
        "css/career-bridge.css",
        "css/germany-career-priority.css",
        "css/germany-polish.css",
        "css/japan-polish.css",
        "css/korea-polish.css",
        "img/japan/campus.png",
        "img/japan/fuji.png",
        "img/japan/kyoto-university.webp",
        "img/japan/sakura.png",
        "img/japan/street.png",
        "img/japan/tohoku-university.webp",
        "img/japan/torii.png",
        "img/japan/university-of-tokyo.webp",
        "img/shared/admission-workspace.webp",
        "img/shared/consulting-desk.webp",
    ]
    for path in obsolete:
        if (ROOT / path).exists():
            fail(f"Obsolete file still present: {path}")

    if not (ROOT / "opengraph.jpg").exists():
        fail("opengraph.jpg must remain; production pages use it for social previews")


def validate_forms() -> None:
    form_pages = {"index.html": 1, "contact.html": 1, "resources.html": 1}
    for path, minimum in form_pages.items():
        content = read(path)
        count = len(re.findall(r"<form\b[^>]*\bdata-arvenaire-form\b", content, flags=re.I))
        if count < minimum:
            fail(f"{path} should contain at least {minimum} centrally-bound ARVENAIRE form(s); found {count}")
        if "api.web3forms.com/submit" in content:
            fail(f"{path} contains inline Web3Forms network code")

    contact = read("contact.html")
    for topic in ("germany_career", "japan_career", "korea_career", "germany_kit", "strategy_session", "china_waitlist", "australia_waitlist"):
        if f'value="{topic}"' not in contact:
            fail(f"contact.html missing supported topic value: {topic}")


def main() -> int:
    files = text_files()
    validate_local_references()
    validate_no_regressions(files)
    validate_commercial_invariants()
    validate_legacy_removal()
    validate_forms()

    if ERRORS:
        print("ARVENAIRE validation FAILED:\n")
        for item in ERRORS:
            print(f" - {item}")
        return 1

    print(f"ARVENAIRE validation passed: {len(files)} text files checked.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
