# kicad.js

kicad.js is a footprint viewer for [KiCAD](http://kicad-pcb.org/) footprint files.

## Compilation

I'm unable to code in JavaScript without screaming every few minutes so I did
kicad.js in coffeescript. You can compile it to JavaScript by installing
coffeescipt. it should be available in your standard distribution packages or
at [coffeescript.org](http://coffeescript.org/).

## Installation

Just put kicad.js where you usually put your JavaScript files. You will also
need [jQuery](http://coffeescript.org/) v2.1.4 or later. I haven't tested any
earlier versions. Maybe they work too.

## Usage

Here's a simple snippet that shows how to use kicad.js:

```
<canvas class="kicad" data-kicad-footprint="/Teensy3.x_LC.kicad_mod" width="480" height="320"></canvas>

<script src="jquery-2.1.4.min.js"></script>
<script src="kicad.js"></script>
```

First you need to create a `<canvas>` element somewhere. Give it the class
`kicad` and add a data attribute containing the url to the footprint file. Then
preferebly at the bottom of the page load jQuery and the kicad.js file.
KiCAD.js looks automatically for canvas elements with the class `kicad` and draws
the footprint files in the dtaa attribute. This is done with an asynchronous
AJAX call.

If everything works it should look like this:

![screenshot](https://github.com/xengi/kicad.js/raw/master/screenshot.png "Screenshot")
