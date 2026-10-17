#!/usr/bin/env python3
"""Compatibility wrapper — prefer scripts/build_publer_bulk_upload.py."""

from __future__ import annotations

import runpy
from pathlib import Path

if __name__ == "__main__":
    target = Path(__file__).with_name("build_publer_bulk_upload.py")
    runpy.run_path(str(target), run_name="__main__")
