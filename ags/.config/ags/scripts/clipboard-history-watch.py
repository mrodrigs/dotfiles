#!/usr/bin/env python3
import hashlib
import json
import subprocess
import sys
import time
from pathlib import Path

CACHE_DIR = Path.home() / ".cache" / "ags"
IMAGES_DIR = CACHE_DIR / "clipboard-history"
HISTORY_FILE = CACHE_DIR / "clipboard-history.json"
MAX_ENTRIES = 20

TEXT_MIMES = ("text/plain;charset=utf-8", "text/plain", "STRING", "UTF8_STRING", "TEXT")


def list_types() -> list[str]:
    result = subprocess.run(["wl-paste", "--list-types"], capture_output=True, text=True)
    return [line for line in result.stdout.splitlines() if line]


def read_bytes(mime: str, no_newline: bool = False) -> bytes:
    cmd = ["wl-paste", "-t", mime]
    if no_newline:
        cmd.insert(1, "-n")
    return subprocess.run(cmd, capture_output=True).stdout


def load_history() -> list[dict]:
    try:
        return json.loads(HISTORY_FILE.read_text())
    except Exception:
        return []


def save_history(entries: list[dict]) -> None:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    tmp = HISTORY_FILE.with_suffix(".tmp")
    tmp.write_text(json.dumps(entries, ensure_ascii=False, indent=2))
    tmp.replace(HISTORY_FILE)


def make_preview(text: str) -> str:
    return " ".join(text.split())[:200]


def main() -> None:
    # wl-paste --watch pipes the selection to our stdin, but doesn't tell us
    # its mime type, so we drain it and query the clipboard ourselves instead.
    sys.stdin.buffer.read()

    types = list_types()
    if not types:
        return

    text_mime = next((m for m in TEXT_MIMES if m in types), None)
    image_mime = next((m for m in types if m.startswith("image/")), None)

    entries = load_history()

    if text_mime:
        data = read_bytes(text_mime, no_newline=True)
        text = data.decode("utf-8", errors="replace")
        if not text.strip():
            return
        entry_id = hashlib.sha256(data).hexdigest()
        entries = [e for e in entries if e["id"] != entry_id]
        entries.insert(
            0,
            {
                "id": entry_id,
                "type": "text",
                "text": text,
                "preview": make_preview(text),
                "mime": text_mime,
                "timestamp": int(time.time()),
            },
        )
    elif image_mime:
        data = read_bytes(image_mime)
        if not data:
            return
        entry_id = hashlib.sha256(data).hexdigest()
        entries = [e for e in entries if e["id"] != entry_id]
        ext = image_mime.split("/")[-1].split("+")[0]
        IMAGES_DIR.mkdir(parents=True, exist_ok=True)
        image_path = IMAGES_DIR / f"{entry_id}.{ext}"
        if not image_path.exists():
            image_path.write_bytes(data)
        entries.insert(
            0,
            {
                "id": entry_id,
                "type": "image",
                "image_path": str(image_path),
                "preview": "Imagem",
                "mime": image_mime,
                "timestamp": int(time.time()),
            },
        )
    else:
        return

    kept, dropped = entries[:MAX_ENTRIES], entries[MAX_ENTRIES:]
    for e in dropped:
        if e.get("type") == "image":
            Path(e["image_path"]).unlink(missing_ok=True)

    save_history(kept)


if __name__ == "__main__":
    main()
