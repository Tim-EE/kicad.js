# kicad-viewer

kicad-viewer is a footprint viewer for [KiCAD](http://kicad-pcb.org/) footprint files.

## Usage

Here's a simple snippet that shows how to use kicad-viewer:

```html
<canvas id="kicad" data-footprint="/Teensy3.x_LC.kicad_mod" width="480" height="320"></canvas>

<script src="kicad.js"></script>
<script>
    'use strict';

    var options = {
        grid: 1.27
    };

    var canvas = document.getElementById("#kicad");

    var kicadviewer = new kicad_viewer(canvas, options);

    fetch(canvas.data("footprint"))
        .then(res => res.text())
        .then(data => kicadviewer.render(data));
</script>
```
