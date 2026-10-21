"""One-off: pull farmacialabotika.cl/products.json, curate ~40 products,
download their images locally and write data/products.json + data/products.js.

Run from the repo root:  python3 -I scripts/fetch-products.py
"""
import html
import json
import os
import re
import urllib.request

BASE = "https://farmacialabotika.cl"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_DIR = os.path.join(ROOT, "assets", "images", "products")
BRAND_DIR = os.path.join(ROOT, "assets", "images", "brands")
UA = {"User-Agent": "Mozilla/5.0 (demo storefront asset fetch)"}

# collection handle -> (match on product_type, how many)
BUCKETS = [
    ("vitaminas-y-minerales", "Suplementos, vitaminas y minerales", 12),
    ("dolor-fiebre-y-antiinflamatorio", "Dolor, Fiebre y Antiinflamatorio", 6),
    ("cuidado-de-la-piel", "Cuidado de la Piel y Rostro y Maquillaje", 6),
    ("mundo-bebe", "Aseo y Cuidado Bebé y Madre", 6),
    ("sistema-respiratorio-y-alergias", "Sistema Respiratorio y Alergias", 4),
]
OFFERS = 10

FICHA_LABELS = {
    "PRINCIPIO ACTIVO": "principio_activo",
    "BIOEQUIVALENTE": "bioequivalente",
    "CONDICIÓN DE VENTA": "condicion_de_venta",
    "FORMA FARMACÉUTICA": "forma_farmaceutica",
    "PRESENTACIÓN": "presentacion",
    "DOSIS POR ENVASE": "presentacion",
    "ACCIÓN TERAPÉUTICA": "accion_terapeutica",
}

BRAND_LOGOS = [
    "Logo_All_MD_63b316d2-af75-45ae-b157-63b6f2fc31ef.png",
    "Logo_All_Protection_187bd0fd-ab62-434e-ab15-1507a926d1c2.png",
    "Logo_Heltiqe_64f15779-d91c-4c12-99f4-a3fffac6e95b.png",
    "Logo_LVN_8554c28b-c5c8-46c8-b33f-97994898a6a6.png",
    "Logo_Senteq_25a7c45d-0ae9-44bb-883c-444eac19a582.png",
    "Logo_babytest_dc276821-2e3e-4519-9974-a5dd2319ad20.png",
]
LOGO = "LaBotika_Color_648cb663-e8ff-488b-a5d9-4c5ebe3c5045.png"


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        return r.read()


def text(fragment):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", fragment))).strip()


def parse_ficha(body):
    """Body alternates label / value blocks (markup varies), so split on tags."""
    segments = [text(s) for s in re.split(r"<[^>]+>", body or "")]
    segments = [s for s in segments if s]
    ficha = {}
    for label, value in zip(segments, segments[1:]):
        key = FICHA_LABELS.get(label.upper().rstrip(":"))
        if key and key not in ficha and value.lower() != "no aplica" and value.upper() not in FICHA_LABELS:
            ficha[key] = value
    return ficha


def is_rx(p):
    sale = parse_ficha(p["body_html"]).get("condicion_de_venta", "")
    return "receta" in sale.lower() or any(t.lower() == "con receta" for t in p["tags"])


def tidy_title(title):
    """'PARACETAMOL 500mg Comp. x 16' -> 'Paracetamol 500mg Comp. x 16' (keeps short codes like UP, HFA)."""
    return re.sub(r"\b([A-ZÁÉÍÓÚÑ]{4,})\b", lambda m: m.group(1).capitalize(), " ".join(title.split()))


def to_int(v):
    return int(float(v)) if v else None


def is_on_sale(p):
    v = p["variants"][0]
    return v.get("compare_at_price") and float(v["compare_at_price"]) > float(v["price"])


def download(src, dest):
    if os.path.exists(dest):
        return
    sep = "&" if "?" in src else "?"
    with open(dest, "wb") as f:
        f.write(get(src + sep + "width=800"))


def main():
    raw = []
    for page in range(1, 5):
        raw += json.loads(get(f"{BASE}/products.json?limit=250&page={page}"))["products"]
    pool = [p for p in raw if p["images"] and p["variants"][0].get("available", True)]

    chosen, seen = [], set()

    def take(p, collection):
        seen.add(p["id"])
        chosen.append((p, collection))

    # Prefer products that carry a ficha, so PDP-style data is real.
    rank = lambda p: (0 if parse_ficha(p["body_html"]) else 1, -len(p["images"]))
    for handle, ptype, n in BUCKETS:
        matches = sorted([p for p in pool if p["product_type"] == ptype], key=rank)
        for p in matches[:n]:
            take(p, handle)

    def discount(p):
        v = p["variants"][0]
        return 1 - float(v["price"]) / float(v["compare_at_price"])

    offers = sorted([p for p in pool if is_on_sale(p) and p["id"] not in seen and not is_rx(p)
                     and 0.15 < discount(p) < 0.5],
                    key=discount, reverse=True)
    lines = set()  # one product per line ("Pielarmina", "Jeringa"…) for variety
    for p in offers:
        line = p["title"].split()[0].lower()
        if line in lines:
            continue
        lines.add(line)
        take(p, "oferta")
        if len(lines) == OFFERS:
            break

    os.makedirs(IMG_DIR, exist_ok=True)
    out = []
    for p, collection in chosen:
        v = p["variants"][0]
        images = []
        for i, img in enumerate(p["images"][:4]):
            ext = os.path.splitext(img["src"].split("?")[0])[1].lower() or ".jpg"
            name = f"{p['handle']}{'' if i == 0 else '-' + str(i + 1)}{ext}"
            download(img["src"], os.path.join(IMG_DIR, name))
            images.append({"src": f"assets/images/products/{name}", "alt": tidy_title(p["title"]),
                           "width": img.get("width"), "height": img.get("height")})
        tags = list(p["tags"])
        if is_on_sale(p) and "oferta" not in tags:
            tags.append("oferta")
        out.append({
            "id": p["id"],
            "title": tidy_title(p["title"]),
            "handle": p["handle"],
            "vendor": p["vendor"],
            "product_type": p["product_type"],
            "price": to_int(v["price"]),
            "compare_at_price": to_int(v.get("compare_at_price")) if is_on_sale(p) else None,
            "available": v.get("available", True),
            "featured_image": images[0],
            "images": images,
            "tags": tags,
            "collections": [collection],
            "metafields": {"ficha": parse_ficha(p["body_html"])},
        })

    data = json.dumps(out, ensure_ascii=False, indent=2)
    with open(os.path.join(ROOT, "data", "products.json"), "w") as f:
        f.write(data + "\n")
    with open(os.path.join(ROOT, "data", "products.js"), "w") as f:
        f.write("// Generated by scripts/fetch-products.py — same data as products.json, for file:// use.\n")
        f.write(f"window.PRODUCTS = {data};\n")

    os.makedirs(BRAND_DIR, exist_ok=True)
    for name in BRAND_LOGOS:
        short = name.split("_", 1)[1].rsplit("_", 1)[0].lower().replace("_", "-")
        download(f"{BASE}/cdn/shop/files/{name}", os.path.join(BRAND_DIR, f"{short}.png"))
    download(f"{BASE}/cdn/shop/files/{LOGO}", os.path.join(ROOT, "assets", "images", "logo.png"))

    print(f"{len(out)} products, {sum(1 for p in out if p['metafields']['ficha'])} with ficha, "
          f"{sum(1 for p in out if p['compare_at_price'])} on sale")


if __name__ == "__main__":
    main()
