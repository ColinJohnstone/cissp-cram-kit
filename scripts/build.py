"""Builds index.html (a single self-contained page) from the files in src/.

Usage:  python3 scripts/build.py
"""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"

HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}[hidden]{display:none!important}img{max-width:100%}</style>
"""

data = "".join((SRC / f).read_text(encoding="utf-8") + "\n"
               for f in ["acronyms.js", "regs.js", "cheat.js", "questions.js"])
review = json.loads((SRC / "review.json").read_text(encoding="utf-8"))
data += "const REVIEW=" + json.dumps(review, ensure_ascii=False).replace("</", "<\\/") + ";\n"
app = (SRC / "app.js").read_text(encoding="utf-8")
for chunk in (data, app):
    assert "</script" not in chunk.lower(), "a closing script tag would break the page"

page = (SRC / "template.html").read_text(encoding="utf-8")
page = page.replace("/*__DATA__*/", data).replace("/*__APP__*/", app)
split = page.index('<header class="top">')
html = HEAD + page[:split] + "</head>\n<body>\n" + page[split:] + "\n</body>\n</html>\n"
(ROOT / "index.html").write_text(html, encoding="utf-8")
print(f"index.html written ({len(html) // 1024} KB)")
