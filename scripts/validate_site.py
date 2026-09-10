#!/usr/bin/env python3
"""ARVENAIRE production static-site validation. No third-party dependencies."""
from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
SELF = Path(__file__).resolve()
TEXT_EXTENSIONS = {".html", ".css", ".js", ".md", ".txt", ".xml", ".json", ".py", ".yml", ".yaml"}
ERRORS: list[str] = []


def fail(message: str) -> None:
    ERRORS.append(message)


def read(path: str | Path) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def text_files() -> list[Path]:
    return [
        path for path in ROOT.rglob("*")
        if path.is_file()
        and path.suffix.lower() in TEXT_EXTENSIONS
        and ".git" not in path.parts
    ]


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


def content_files(files: list[Path]) -> list[Path]:
    """Files whose literal content represents the product, excluding this rule file itself."""
    return [path for path in files if path.resolve() != SELF]


def validate_no_regressions(files: list[Path]) -> None:
    scanned = content_files(files)
    banned = {
        "100% free, always": "obsolete all-free commercial claim",
        "revenue comes from university partnerships": "unsupported revenue claim",
        "100% free service": "obsolete all-free service claim",
        "60-min strategy session": "obsolete session duration",
        "60 minutes in duration": "obsolete session duration",
    }
    for path in scanned:
        content = path.read_text(encoding="utf-8").lower()
        for phrase, reason in banned.items():
            if phrase in content:
                fail(f"{reason} found in {path.relative_to(ROOT)}: {phrase!r}")

    endpoint = "https://api.web3forms.com/submit"
    endpoint_files = [p.relative_to(ROOT).as_posix() for p in scanned if endpoint in p.read_text(encoding="utf-8")]
    if endpoint_files != ["js/forms.js"]:
        fail(f"Web3Forms endpoint must exist only in js/forms.js; found in {endpoint_files}")

    key = "5e418a41-4cad-44f0-9b93-eccaeff3f36c"
    key_files = [p.relative_to(ROOT).as_posix() for p in scanned if key in p.read_text(encoding="utf-8")]
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


def validate_blog() -> None:
    article_pages = (
        "blog-mext-2027.html",
        "blog-aps-germany.html",
        "blog-gks-graduate.html",
        "blog-werkstudent-germany.html",
        "blog-motivation-letter-europe.html",
        "blog-robotics-portfolio.html",
    )
    blog = read("blog.html")
    for required in ("css/site-pages.css", "css/blog.css", "js/site.js", "js/blog.js", "js/transitions.js"):
        if required not in blog:
            fail(f"blog.html must load {required}")
    for obsolete in ("<style>", "onclick=", "const articles", "readerOverlay", "readArticle(", "innerHTML"):
        if obsolete.lower() in blog.lower():
            fail(f"blog.html still contains legacy inline-reader architecture: {obsolete}")
    for required in ("Reviewed Sep 11, 2026", '"@type":"Blog"', "Editorial standard:"):
        if required not in blog:
            fail(f"blog.html missing production editorial/SEO invariant: {required}")

    sitemap = read("sitemap.xml")
    for path in article_pages:
        if not (ROOT / path).exists():
            fail(f"Missing production blog article: {path}")
            continue
        content = read(path)
        for required in ("css/style.css", "css/site-pages.css", "css/blog.css", "js/site.js", "js/transitions.js", "article-sourcebox", "Reviewed: 11 September 2026"):
            if required not in content:
                fail(f"{path} missing blog production invariant: {required}")
        if "onclick=" in content.lower() or "<style>" in content.lower():
            fail(f"{path} must not restore inline behavior/style architecture")
        canonical = path.removesuffix(".html")
        if f"https://arvenaire.com/{canonical}" not in content:
            fail(f"{path} missing expected canonical URL")
        if f"https://arvenaire.com/{canonical}" not in sitemap:
            fail(f"sitemap.xml missing blog article route: {canonical}")


def validate_legacy_removal() -> None:
    obsolete = [
        "js/data.js", "js/main.js", "js/japan_particle_scene.js", "js/webgl_journey.js",
        "js/japan_scene.js", "js/germany_scene.js", "js/korea_scene.js",
        "css/style_cloud_journey.css", "css/career-bridge.css", "css/germany-career-priority.css",
        "css/germany-polish.css", "css/japan-polish.css", "css/korea-polish.css",
        "img/japan/campus.png", "img/japan/fuji.png", "img/japan/kyoto-university.webp",
        "img/japan/sakura.png", "img/japan/street.png", "img/japan/tohoku-university.webp",
        "img/japan/torii.png", "img/japan/university-of-tokyo.webp",
        "img/shared/admission-workspace.webp", "img/shared/consulting-desk.webp",
    ]
    for path in obsolete:
        if (ROOT / path).exists():
            fail(f"Obsolete file still present: {path}")
    if not (ROOT / "opengraph.jpg").exists():
        fail("opengraph.jpg must remain because production pages use it for social previews")


def validate_forms() -> None:
    for path in ("index.html", "contact.html", "resources.html"):
        content = read(path)
        count = len(re.findall(r"<form\b[^>]*\bdata-arvenaire-form\b", content, flags=re.I))
        if count < 1:
            fail(f"{path} must contain a centrally-bound ARVENAIRE form")
        if "api.web3forms.com/submit" in content:
            fail(f"{path} contains inline Web3Forms network code")

    contact = read("contact.html")
    for topic in ("germany_career", "japan_career", "korea_career", "germany_kit", "strategy_session", "china_waitlist", "australia_waitlist"):
        if f'value="{topic}"' not in contact:
            fail(f"contact.html missing supported topic value: {topic}")


def validate_vercel_security() -> None:
    try:
        config = json.loads(read("vercel.json"))
    except (json.JSONDecodeError, OSError) as exc:
        fail(f"vercel.json is not valid JSON: {exc}")
        return

    if config.get("$schema") != "https://openapi.vercel.sh/vercel.json":
        fail("vercel.json should declare the official Vercel JSON schema")

    rules = config.get("headers", [])
    global_rule = next((rule for rule in rules if rule.get("source") == "/(.*)"), None)
    if not global_rule:
        fail("vercel.json is missing the global security-header rule")
        return

    headers = {item.get("key"): item.get("value", "") for item in global_rule.get("headers", [])}
    required_headers = {
        "Content-Security-Policy",
        "Strict-Transport-Security",
        "Referrer-Policy",
        "Permissions-Policy",
        "X-Content-Type-Options",
        "X-Frame-Options",
        "Cross-Origin-Opener-Policy",
    }
    missing = sorted(required_headers - headers.keys())
    if missing:
        fail(f"vercel.json missing security headers: {missing}")

    if "X-XSS-Protection" in headers:
        fail("vercel.json must not restore the obsolete X-XSS-Protection filter header")

    csp = headers.get("Content-Security-Policy", "")
    for directive in (
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com",
        "https://*.unsplash.com",
        "https://api.web3forms.com",
        "upgrade-insecure-requests",
    ):
        if directive not in csp:
            fail(f"Content-Security-Policy missing required directive/source: {directive}")

    if headers.get("X-Content-Type-Options") != "nosniff":
        fail("X-Content-Type-Options must remain nosniff")
    if headers.get("X-Frame-Options") != "DENY":
        fail("X-Frame-Options must remain DENY")
    if headers.get("Referrer-Policy") != "strict-origin-when-cross-origin":
        fail("Referrer-Policy must be strict-origin-when-cross-origin")

    for source in ("/css/(.*)", "/js/(.*)"):
        rule = next((item for item in rules if item.get("source") == source), None)
        if not rule:
            fail(f"vercel.json missing cache rule for {source}")
            continue
        cache = {item.get("key"): item.get("value", "") for item in rule.get("headers", [])}.get("Cache-Control")
        if cache != "public, max-age=0, must-revalidate":
            fail(f"{source} must revalidate unhashed assets; found Cache-Control={cache!r}")


def main() -> int:
    files = text_files()
    validate_local_references()
    validate_no_regressions(files)
    validate_commercial_invariants()
    validate_blog()
    validate_legacy_removal()
    validate_forms()
    validate_vercel_security()
    if ERRORS:
        print("ARVENAIRE validation FAILED:\n")
        for item in ERRORS:
            print(f" - {item}")
        return 1
    print(f"ARVENAIRE validation passed: {len(files)} text files checked.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
