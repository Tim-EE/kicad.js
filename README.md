# kicad.js

kicad.js is a footprint viewer for [KiCAD](http://kicad-pcb.org/) footprint files.

## Compilation

I'm unable to code in JavaScript without screaming every few minutes so I did
kicad.js in coffeescript. You can compile it to JavaScript by installing
coffeescipt. it should be available in your standard distribution packages or
at [coffeescript.org](http://coffeescript.org/).

## Installation

Just put kicad.js where you usually put your JavaScript files.

## Usage

Here's a simple snippet that shows how to use kicad.js:

```html
<canvas id="kicad" data-footprint="/Teensy3.x_LC.kicad_mod" width="480" height="320"></canvas>

<script src="jquery-2.1.4.min.js"></script>
<script src="kicad.js"></script>
<script>
	(() => {
		"use strict";

		var options = {
        	grid: 1.27
        };

        var canvas = $("#kicad");

        var kicadviewer = new KiCad(canvas[0], options);

        Promise.resolve($.get(canvas.data('footprint'))).then(data => {
            kicadviewer.render(data);
        });

    })();
</script>
```

First you need to create a `<canvas>` element somewhere. Give it an id and a
data attribute holding the url to the footprint file. Then preferebly at the
bottom of the page load the kicad.js file.
After that make another `<script>` block.

You can set options to define grid size and colors for the footprint.

```js
var options = {
    grid: 1.27
};
```

Then you need to find the canvas element for example with jQuery.

```js
var canvas = $("#kicad");
```

You can then create a KiCad object and attach it to the canvas with your set of
options. note that jQuery always returns a list of found elements, so you need
to give it the first item in the list.

```js
var kicadviewer = new KiCad(canvas[0], options);
```

Finally download the footprint file for example with an AJAX call and use the
`render(data)` function of your KiCad object to render the footprint.

```js
Promise.resolve($.get(canvas.data('footprint'))).then(data => {
    kicadviewer.render(data);
});
```

If everything works it should look like this:

![screenshot](https://github.com/xengi/kicad.js/raw/master/screenshot.png "Screenshot")

