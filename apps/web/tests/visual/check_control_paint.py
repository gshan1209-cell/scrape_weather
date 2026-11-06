"""Check actual raster output of an opaque active control, not implementation classes.

Removing the map's stacking boundary must fail this check when tile pixels cover
the active control. Run after capturing its DOM rect and an unmodified viewport PNG.
"""
import json, re, sys
from pathlib import Path
from PIL import Image

stem=Path(sys.argv[1])
meta=json.loads(stem.with_suffix('.json').read_text(encoding='utf-8'))
im=Image.open(stem.with_suffix('.png')).convert('RGB')
r=meta['rect']; viewport=meta['viewport']
expected=tuple(map(int,re.findall(r'\d+',meta['expectedBackground'])[:3]))
assert expected==(255,255,255), 'Expected a fully opaque active white button'
assert 0<=r['x'] and 0<=r['y'] and r['x']+r['width']<=viewport['width'] and r['y']+r['height']<=viewport['height']
sx,sy=im.width/viewport['width'],im.height/viewport['height']
samples=[]
for fx in (.25,.5,.75):
    for dy in (3,r['height']-4):
        xy=(round((r['x']+r['width']*fx)*sx),round((r['y']+dy)*sy))
        rgb=im.getpixel(xy)
        samples.append({'xy':xy,'rgb':rgb,'matches':max(abs(a-b) for a,b in zip(rgb,expected))<=12})
matched=sum(s['matches'] for s in samples)
hits=meta.get('interactive_hits',[])
hits_ok=all(h['hit'] for h in hits)
result={'status':'PASS' if matched>=5 and hits_ok else 'FAIL','matching_samples':matched,'samples':samples,'interactive_hits':hits,
        'case':meta['case'],'criterion':'At least 5 of 6 padding pixels match the control background and all captured zoom hit targets are unobstructed'}
stem.with_name(stem.name+'-result.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps(result))
sys.exit(0 if result['status']=='PASS' else 1)
