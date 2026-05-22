import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
from scipy.ndimage import maximum_filter, affine_transform, map_coordinates
import io
import base64

def compute_autocorr(img):
    gray  = img.mean(axis=2)
    gray -= gray.mean()
    h, w  = gray.shape
    F     = np.fft.fft2(gray, s=(2*h-1, 2*w-1))
    acorr = np.fft.ifft2(F * np.conj(F)).real
    acorr = np.fft.fftshift(acorr)
    acorr /= acorr.max()
    return acorr

def detect_lattice(acorr, img_shape, threshold=0.3):
    h, w   = img_shape
    cy, cx = acorr.shape[0]//2, acorr.shape[1]//2
    min_dist = max(int(min(h, w) * 0.04), 5)

    local_max = (
        (acorr == maximum_filter(acorr, size=min_dist*2+1)) &
        (acorr > threshold)
    )
    local_max[cy-min_dist:cy+min_dist+1, cx-min_dist:cx+min_dist+1] = False

    ys, xs = np.where(local_max)
    if len(ys) == 0:
        local_max = (
            (acorr == maximum_filter(acorr, size=min_dist*2+1)) &
            (acorr > 0.15)
        )
        local_max[cy-min_dist:cy+min_dist+1, cx-min_dist:cx+min_dist+1] = False
        ys, xs = np.where(local_max)

    ry    = (ys - cy).astype(float)
    rx    = (xs - cx).astype(float)
    dists = np.sqrt(rx**2 + ry**2)
    order = np.argsort(dists)
    peaks = [(rx[i], ry[i]) for i in order]

    v1 = np.array(peaks[0])
    v2 = None
    for p in peaks[1:]:
        v     = np.array(p)
        cross = abs(v1[0]*v[1] - v1[1]*v[0])
        if cross > 0.15 * np.linalg.norm(v1) * np.linalg.norm(v):
            v2 = v
            break

    if v2 is None:
        raise ValueError("Could not find two independent lattice vectors.")

    ang1 = np.degrees(np.arctan2(v1[1], v1[0]))
    ang2 = np.degrees(np.arctan2(v2[1], v2[0]))
    kind = "axis-aligned" if (abs(ang1) < 5 or abs(ang2) < 5) else "diagonal/rotated"
    print(f"v1 = ({v1[0]:+.1f}, {v1[1]:+.1f})  mag={np.linalg.norm(v1):.1f}px  angle={ang1:.1f}°")
    print(f"v2 = ({v2[0]:+.1f}, {v2[1]:+.1f})  mag={np.linalg.norm(v2):.1f}px  angle={ang2:.1f}°")
    print(f"Pattern type: {kind}")
    return v1, v2

def extract_tile(img, v1, v2):
    h, w   = img.shape[:2]
    cy, cx = h//2, w//2
    tw = max(int(round(np.linalg.norm(v1))), 2)
    th = max(int(round(np.linalg.norm(v2))), 2)
    A  = np.array([[v2[1]/th, v1[1]/tw],
                   [v2[0]/th, v1[0]/tw]])
    b  = np.array([cy - 0.5*v2[1] - 0.5*v1[1],
                   cx - 0.5*v2[0] - 0.5*v1[0]])
    tile = np.zeros((th, tw, 3))
    for ch in range(3):
        tile[:,:,ch] = affine_transform(img[:,:,ch], A, offset=b,
                                        output_shape=(th, tw),
                                        mode='wrap', order=3)
    print(f"Extracted tile: {tw}×{th}px")
    return tile

def reconstruct(tile, v1, v2, out_w, out_h):
    th, tw = tile.shape[:2]
    M      = np.array([[v1[0], v2[0]], [v1[1], v2[1]]], dtype=float)
    M_inv  = np.linalg.inv(M)

    rows, cols = np.mgrid[0:out_h, 0:out_w]
    x = cols.astype(float) - out_w / 2
    y = rows.astype(float) - out_h / 2

    alpha = (M_inv[0,0]*x + M_inv[0,1]*y) % 1.0
    beta  = (M_inv[1,0]*x + M_inv[1,1]*y) % 1.0

    tc = alpha * tw
    tr = beta  * th

    result = np.zeros((out_h, out_w, 3))
    for ch in range(3):
        result[:,:,ch] = map_coordinates(tile[:,:,ch], [tr, tc],
                                         mode='wrap', order=1)
    print(f"Reconstructed: {out_w}×{out_h}px")
    return result.clip(0, 1)

def fig_to_base64(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight', facecolor='#1a1a2e', edgecolor='none')
    buf.seek(0)
    return base64.b64encode(buf.read()).decode('utf-8')

def arr_to_base64(arr):
    img = Image.fromarray((arr * 255).clip(0, 255).astype(np.uint8))
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    return base64.b64encode(buf.read()).decode('utf-8')

def get_autocorr_b64(acorr, v1, v2):
    cy, cx = acorr.shape[0]//2, acorr.shape[1]//2
    crop = min(200, cy - 1, cx - 1)
    ac = acorr[cy-crop:cy+crop, cx-crop:cx+crop]

    # Use dark background for plot
    plt.style.use('dark_background')
    fig, ax = plt.subplots(figsize=(6, 6), facecolor='#1a1a2e')
    ax.imshow(ac, cmap='inferno', vmin=0, vmax=0.7)

    def in_bounds(dx, dy):
        return abs(dx) < crop and abs(dy) < crop

    ax.plot(crop, crop, 'c+', markersize=14, markeredgewidth=2, label='Zero lag')

    if in_bounds(v1[0], v1[1]):
        ax.plot(crop+v1[0], crop+v1[1], 'lime', marker='+',
                markersize=14, markeredgewidth=2, label=f'v1 ({v1[0]:.0f},{v1[1]:.0f})')
    if in_bounds(v2[0], v2[1]):
        ax.plot(crop+v2[0], crop+v2[1], 'r+',
                markersize=14, markeredgewidth=2, label=f'v2 ({v2[0]:.0f},{v2[1]:.0f})')

    ax.legend(fontsize=9, facecolor='#1a1a2e', edgecolor='white')
    ax.set_title(f"Autocorrelation map (crop={crop}px)", fontsize=11, color='white')
    ax.axis('off')
    plt.tight_layout()
    b64 = fig_to_base64(fig)
    plt.close(fig)
    return "data:image/png;base64," + b64

def process_texture(img, out_w, out_h):
    acorr = compute_autocorr(img)
    v1, v2 = detect_lattice(acorr, img.shape[:2])
    
    tile = extract_tile(img, v1, v2)
    result = reconstruct(tile, v1, v2, out_w, out_h)
    
    return {
        "original": "data:image/png;base64," + arr_to_base64(img),
        "autocorr": get_autocorr_b64(acorr, v1, v2),
        "tile": "data:image/png;base64," + arr_to_base64(tile),
        "reconstructed": "data:image/png;base64," + arr_to_base64(result),
        "vectors": {
            "v1": {"x": v1[0], "y": v1[1]},
            "v2": {"x": v2[0], "y": v2[1]}
        }
    }