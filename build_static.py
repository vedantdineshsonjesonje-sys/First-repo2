"""Copy only public assets into the Netlify publish directory."""
from pathlib import Path
from shutil import copyfile

ROOT = Path(__file__).resolve().parent
ASSETS = ("index.html", "app.js", "styles.css", ".nojekyll")

def build():
    target = ROOT / "public"
    target.mkdir(exist_ok=True)
    unexpected = {p.name for p in target.iterdir()} - set(ASSETS)
    if unexpected:
        raise RuntimeError(f"Unexpected files in public/: {sorted(unexpected)}")
    for name in ASSETS:
        copyfile(ROOT / name, target / name)

if __name__ == "__main__":
    build()
