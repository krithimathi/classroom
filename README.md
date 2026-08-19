# Classroom 3D Tour (Three.js)

A no-build, browser-based Three.js prototype of the classroom design.

## Run it

Because browser ES modules should be served over HTTP, start a tiny local server in this folder.

### Python
```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

### Node alternative
```bash
npx serve .
```

## Navigation

- Left-drag: rotate
- Right-drag: pan
- Mouse wheel / trackpad: zoom
- Click any room area in the left menu: camera smoothly zooms to that center
- Double-click a 3D object: focus on it
- Floor Plan: top-down view
- Classroom View: reset
- Hide/Show Labels: toggle room labels

## Included classroom zones

- Student cubbies beside the entrance
- Calm Down Space
- Classroom Rules + Daily Calendar (August 2026)
- Classroom Library
- Arts Centre between library and phonics
- Phonics Centre
- Technology Supplies
- Math Manipulative Center with footer label, near the easel
- Number carpet
- 5 color-group student tables
  - Each has exactly 4 files/folders
  - Folder border matches table group color
- Orange Small Group Instruction table with no files
- Teacher's Area marked OFF LIMITS
  - laptop
  - sanitizer
  - first aid
  - tissues
  - towels
  - extra supplies
  - green reward bucket with black hair bands
  - trash bin
- Electric pencil sharpeners near technology supplies
- Classroom Jobs poster with 20 rotating student/helper assignments

## Notes

This version uses Three.js from jsDelivr CDN, so the machine needs internet access when the page loads.

To make the room dimensionally exact, change these constants in `app.js`:

```js
const ROOM_W = 24;
const ROOM_D = 17;
const WALL_H = 7;
```

All 3D measurements are arbitrary "room units"; you can treat 1 unit as 1 foot if desired.
