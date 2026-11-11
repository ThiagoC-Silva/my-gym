#!/usr/bin/env python3
"""Recodifica a mídia animada de um exercício para o card (ExerciseMedia).

    python3 scripts/recode-media.py <original.webp> <saida.webp> [-q 75]

Sempre partir do ORIGINAL (nunca recodificar um arquivo já recodificado).
Requer libwebp-tools (`sudo apt install -y webp`): anim_dump, img2webp, cwebp, webpmux.
Requer Python com Pillow.

Etapas:
  1. anim_dump  → frames compostos (canvas inteiro), um PNG por frame.
  2. webpmux    → duração de cada frame. (O Pillow não lê `duration` de WebP animado.)
  3. Corte da margem branca: um único retângulo para TODOS os frames, igual à união
     dos pixels com conteúdo + folga. Assim nenhum frame do movimento é cortado e o
     enquadramento não pula durante o loop.
  4. Redimensiona para caber em 966×408 px = 3× a caixa de 322×136 pt
     (`object-fit: contain`). Nunca amplia.
  5. img2webp lossy com -d por frame. Se o encoder fundir frames quase idênticos
     (o WebPAnimEncoder faz isso em modo lossy, somando a duração no anterior),
     refaz frame a frame com cwebp + webpmux, que não descarta nenhum frame.
  6. Validação: mesmo nº de frames, mesma duração por frame e no total, ordem
     preservada e PSNR por frame. Sai com código 1 se algo falhar.
"""
import argparse, math, pathlib, re, subprocess, sys, tempfile

from PIL import Image, ImageChops, ImageStat

BOX_W, BOX_H = 322 * 3, 136 * 3  # caixa da mídia em px @3x
WHITE_THRESHOLD = 235            # pixel é "conteúdo" se algum canal < 235
PAD_RATIO = 0.03                 # folga do corte, em fração do maior lado do conteúdo
MIN_PSNR = 32.0


def run(*cmd):
    return subprocess.run(cmd, check=True, capture_output=True, text=True).stdout


def webp_info(path):
    out = run("webpmux", "-info", str(path))
    w, h = map(int, re.search(r"Canvas size: (\d+) x (\d+)", out).groups())
    durs = [int(l.split()[6]) for l in out.splitlines() if re.match(r"^\s*\d+:", l)]
    return w, h, durs


def dump(path, folder):
    folder.mkdir()
    run("anim_dump", "-folder", str(folder), "-prefix", "f_", str(path))
    return sorted(folder.glob("f_*.png"))


def rgb(path):
    return Image.open(path).convert("RGB")


def same(a, b):
    return ImageChops.difference(a, b).getbbox() is None


def psnr(a, b):
    mse = sum(v ** 2 for v in ImageStat.Stat(ImageChops.difference(a, b)).rms) / 3
    return 99.0 if mse == 0 else 20 * math.log10(255 / math.sqrt(mse))


def content_box(frames, w, h):
    # bbox da união das máscaras = união das bboxes de cada frame
    boxes = []
    for f in frames:
        r, g, b = rgb(f).split()
        darkest = ImageChops.darker(ImageChops.darker(r, g), b)
        bb = darkest.point(lambda v: 255 if v < WHITE_THRESHOLD else 0).getbbox()
        if bb:
            boxes.append(bb)
    if not boxes:
        return 0, 0, w, h
    x0, y0 = min(b[0] for b in boxes), min(b[1] for b in boxes)
    x1, y1 = max(b[2] for b in boxes), max(b[3] for b in boxes)
    pad = round(max(x1 - x0, y1 - y0) * PAD_RATIO)
    return max(0, x0 - pad), max(0, y0 - pad), min(w, x1 + pad), min(h, y1 + pad)


def encode_img2webp(frames, durs, q, dst):
    args = ["-loop", "0"]
    for p, d in zip(frames, durs):
        args += ["-lossy", "-q", str(q), "-m", "6", "-d", str(d), str(p)]
    run("img2webp", *args, "-o", str(dst))


def encode_per_frame(frames, durs, q, dst, tmp):
    tmp.mkdir()
    args = []
    for p, d in zip(frames, durs):
        fw = tmp / (p.stem + ".webp")
        run("cwebp", "-quiet", "-q", str(q), "-m", "6", str(p), "-o", str(fw))
        args += ["-frame", str(fw), f"+{d}+0+0+0-b"]
    run("webpmux", *args, "-loop", "0", "-bgcolor", "255,255,255,255", "-o", str(dst))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("src", type=pathlib.Path)
    ap.add_argument("dst", type=pathlib.Path)
    ap.add_argument("-q", type=float, default=75, help="qualidade lossy (padrão 75)")
    a = ap.parse_args()

    w, h, durs = webp_info(a.src)
    with tempfile.TemporaryDirectory() as td:
        td = pathlib.Path(td)
        frames = dump(a.src, td / "in")
        if len(frames) != len(durs):
            sys.exit(f"anim_dump extraiu {len(frames)} frames, webpmux lista {len(durs)}")

        x0, y0, x1, y1 = content_box(frames, w, h)
        cw, ch = x1 - x0, y1 - y0
        scale = min(1.0, BOX_W / cw, BOX_H / ch)
        nw, nh = max(1, round(cw * scale)), max(1, round(ch * scale))

        (td / "prep").mkdir()
        prepared = []
        for f in frames:
            im = Image.open(f).convert("RGB").crop((x0, y0, x1, y1))
            if (nw, nh) != (cw, ch):
                im = im.resize((nw, nh), Image.LANCZOS)
            p = td / "prep" / f.name
            im.save(p)
            prepared.append(p)

        a.dst.parent.mkdir(parents=True, exist_ok=True)
        mode = "img2webp"
        encode_img2webp(prepared, durs, a.q, a.dst)
        if len(webp_info(a.dst)[2]) != len(durs):
            mode = "cwebp+webpmux"
            encode_per_frame(prepared, durs, a.q, a.dst, td / "fw")

        # ---- validação ----
        ow, oh, odurs = webp_info(a.dst)
        outs = dump(a.dst, td / "out")
        errors = []
        if not (len(odurs) == len(outs) == len(durs)):
            errors.append(f"frames {len(durs)} -> {len(odurs)}")
        if odurs != durs:
            errors.append("duração por frame difere")
        if sum(odurs) != sum(durs):
            errors.append(f"loop {sum(durs)} -> {sum(odurs)} ms")
        ref = [rgb(p) for p in prepared]
        got = [rgb(p) for p in outs]
        ps = [psnr(r, g) for r, g in zip(ref, got)]
        n = len(got)
        for i in range(n if n > 1 else 0):
            j = (i + 1) % n
            if not same(ref[i], ref[j]) and psnr(got[i], ref[j]) > ps[i] + 0.01:
                errors.append(f"frame {i} parece fora de ordem")
                break
        if ps and min(ps) < MIN_PSNR:
            errors.append(f"PSNR mínimo {min(ps):.1f} dB < {MIN_PSNR}")

    kb = lambda p: p.stat().st_size / 1024
    print(f"{'OK   ' if not errors else 'FALHA'} {a.src.name:30} {w}x{h} corte {cw}x{ch}+{x0}+{y0} -> {ow}x{oh} "
          f"| frames {len(durs)}->{len(odurs)} loop {sum(durs)}->{sum(odurs)} ms "
          f"| PSNR min {min(ps):.1f} dB | {kb(a.src):.0f} -> {kb(a.dst):.0f} KB [{mode}]")
    for e in errors:
        print("      ✗", e)
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
