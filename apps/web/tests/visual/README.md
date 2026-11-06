# Map-control paint regression

Leaflet panes must remain inside the map's stacking context. Otherwise tiles
can paint over the title, layer buttons, legend and timeline even though the
controls remain in the accessibility tree and receive clicks.

Run the real page with its base tiles loaded. Select the temperature layer.
Capture an unmodified viewport PNG and a JSON sidecar with:

```json
{
  "viewport": {"width": 1440, "height": 1000},
  "rect": {"x": 1200, "y": 100, "width": 68, "height": 32},
  "expectedBackground": "rgb(255, 255, 255)",
  "case": "Active layer control paints above the map"
}
```

Use the actual viewport dimensions and active button's bounding rectangle and
computed background. Scroll the control into view before capture. The example
coordinates are illustrative. Do not repaint or annotate the captured PNG.
Also include an `interactive_hits` array for the two zoom anchors. Each item
has `name` and a boolean `hit`, obtained by checking whether the anchor contains
the element at its own center via `document.elementFromPoint`. Both must be
true; a foreground information card must not intercept either zoom control.

With Python and Pillow installed, run:

```text
python tests/visual/check_control_paint.py /path/to/capture
```

The stem selects `capture.png` and `capture.json`. The check samples empty
padding inside the opaque active button and writes `capture-result.json`.
It requires five of six samples to match white. Repeat at desktop and mobile
widths. This checks raster output, rather than a CSS class or DOM presence.

The 2026-11-06 baseline at `d5f3efa` failed 0/6: every sample was a map-water
pixel instead of the white control. Candidate acceptance must include the
matching green capture, normal layer selection, timeline and map-error checks.

The final local candidate passed 6/6 painted-padding samples on desktop and
390px mobile, with both native zoom anchors unobstructed. Its 32 browser
acceptance cases include successful layer/region/zoom interaction and explicit
tile-failure feedback. These are local-demo results; production API, TLS and
live CWA approval remain separate.
