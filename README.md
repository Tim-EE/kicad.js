# kicad-viewer

kicad-viewer is a footprint viewer for [KiCAD](http://kicad-pcb.org/) footprint files.

This version includes some updates from the original:
* small fixes (spelling mistakes, color changes to match KiCAD, etc.)
* implemented polyline support
* implemented rounded rectangle pads
* mouse-controlled zoom and pan capability


Also, the original branch switched to a Node.js implementation. Thsi one reverts it to a stand-alone HTML & Javascript file, so nothing needs to be installed prior to use.

## Usage

The `index.html` file contains the file to load in the browser.

It comes with a sample solder jumper footprint.

To try a new footprint, simply paste the contents of the *.kicad_mod file into the textbox and click the "Update Footprint" button.
