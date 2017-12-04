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

First you need to create a `<canvas>` element somewhere. Give it an id and a
data attribute holding the url to the footprint file. Then preferebly at the
bottom of the page load the kicad.js file.
After that make another `<script>` block.

You can set options to define grid size and colors for the footprint. See the sorce files for possible values.

```js
var options = {
    grid: 1.27
};
```

Or with plain Javascript:

```js
var canvas = document.getElementById("#kicad");
```

You can then create a kicad_viewer object and attach it to the canvas with your set of
options:

```js
var kicadviewer = new kicad_viewer(canvas, options);
```

Finally download the footprint file for example with something like a fetch call
and use the `render(data)` function of your kicad_viewer object to render the footprint.

```js
fetch(canvas.data("footprint"))
    .then(res => res.text())
    .then(data => kicadviewer.render(data));
```

