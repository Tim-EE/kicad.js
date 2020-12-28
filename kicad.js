var KiCad;


KiCad = function(canvas, options) {
  var context = null;

  var DEBUG = false;

  // check if canvas is usable
  if (canvas.getContext) {
	  var context = canvas.getContext('2d');
  } else {
	  throw 'Can\'t get context of canvas.';
  }

  // create empty options if not given as param
  if (options == null) {
	  options = {};
  }

  var defaults = {
    'Fg'        : {'r': 255,'g': 255,'b': 255},
    'Bg'        : {'r': 0,  'g': 0,  'b': 0},
    'F.Cu'      : {'r': 132,'g': 0,  'b': 0},
    'B.Cu'      : {'r': 0,  'g': 132,'b': 0},
    'F.Adhes'   : {'r': 132,'g': 0,  'b': 132},
    'B.Adhes'   : {'r': 0,  'g': 0,  'b': 132},
    'F.Paste'   : {'r': 132,'g': 0,  'b': 0},
    'B.Paste'   : {'r': 0,  'g': 194,'b': 194},
    'F.SilkS'   : {'r': 0,  'g': 132,'b': 132},
    'B.SilkS'   : {'r': 132,'g': 0,  'b': 132},
    'F.Mask'    : {'r': 132,'g': 0,  'b': 132},
    'B.Mask'    : {'r': 132,'g': 132,'b': 0},
    'Dwgs.User' : {'r': 194,'g': 194,'b': 194},
    'Cmts.User' : {'r': 0,  'g': 0,  'b': 132},
    'Eco1.User' : {'r': 0,  'g': 132,'b': 0},
    'Eco2.User' : {'r': 194,'g': 194,'b': 0},
    'Edge.Cuts' : {'r': 194,'g': 194,'b': 0},
    'Margin'    : {'r': 194,'g': 0,  'b': 194},
    'F.CrtYd'   : {'r': 132,'g': 132,'b': 132},
    'B.CrtYd'   : {'r': 0,  'g': 0,  'b': 0},
    'F.Fab'     : {'r': 194,'g': 194,'b': 0},
    'B.Fab'     : {'r': 132,'g': 0,  'b': 0},
	'Thruhole'  : {'r': 36, 'g': 16, 'b': 2},
	'Unknown'   : {'r': 255,'g': 0,  'b': 255},
    'grid'      : 1.27,
    'grid_color': {'r': 132,'g': 132,'b': 132},
	'show_outline_holes': true,
	'copper_layers':['F.Cu','B.Cu']
  };

  // fill options with defaults where no option was given by the user
  for (var key in defaults) {
	  options[key] = options[key] || defaults[key];
  }

  // holds the KiCAD file
  var data = {};
  // zoom level
  var zoom = 0;
  var default_zoom = 0;
  // x and y axis translation
  var move_x = 0;
  var move_y = 0;

  // draws the background grid
  var draw_grid = function(size) {
	  // we need the center for alignment
	  var center_x = canvas.width / 2;
	  var center_y = canvas.height / 2;

	  // find out how many dots fit in the canvas
	  var dots_x = parseInt(canvas.width / size);
	  dots_x += dots_x % 2;  // make it an even number
	  var dots_y = parseInt(canvas.height / size);
	  dots_y += dots_y % 2;  // make it an even number

	  // set the fill style for the grid
	  context.fillStyle = "rgba("
		  + options['grid_color']['r'] + ", "
		  + options['grid_color']['g'] + ", "
		  + options['grid_color']['b'] + ", 1)";

		  // draw the grid
	  	for (var x = 0; x <= dots_x; x++) {
	  		for (var y = 0; y <= dots_y; y++) {
	  			/*
	  			here the even numbers for x and y are important.
	  			draw the dots starting from the top left corner by moving the center half way left and up.
	  			you understand it if you stare at the code for 5 mins.
	  			 */
	  			var px = (x * size + center_x) - (dots_x / 2 * size) + move_x;
	  			var py = (y * size + center_y) - (dots_y / 2 * size) + move_y;

	  			// check if the dot is in the canvas (visible)
	  			if (px > 0 && px < canvas.width && py > 0 && py < canvas.height)
	  			{
	  				context.fillRect(px, py, 2, 2);
	  			}
	  		}
	  	}
  };

    // draw lines
    var draw_fpline = function(fpline) {
		context.lineCap = 'round';
        context.beginPath();
		context.strokeStyle = "rgba("
            + options[fpline['layer']]['r'] + ", "
            + options[fpline['layer']]['g'] + ", "
            + options[fpline['layer']]['b'] + ", 1)";
		context.lineWidth = fpline['width'];
		context.moveTo(fpline['x1'], fpline['y1']);
		context.lineTo(fpline['x2'], fpline['y2']);
		return context.stroke();
  };

  // draw poly lines
  var draw_fppoly = function(fppoly) {
    if (fppoly.points.length < 2)
    {
      return null;
    }
	context.fillStyle = "rgba(" + options[fppoly['layer']]['r'] + ", " + options[fppoly['layer']]['g'] + ", " + options[fppoly['layer']]['b'] + ", 1)";
    context.lineWidth = fppoly['width'];
	context.lineCap = 'round';
	context.beginPath();
	context.moveTo(fppoly.points[0][0], fppoly.points[0][1]);
	for (j = 1 ; j < fppoly.points.length; j++)
	{
		context.lineTo(fppoly.points[j][0], fppoly.points[j][1]);
	}
	context.closePath();
    return context.fill();
  };

  // draws circles
  var draw_fpcircle = function(fpcircle) {
	  context.beginPath();
	  context.strokeStyle = "rgba("
		  + options[fpcircle['layer']]['r'] + ", "
		  + options[fpcircle['layer']]['g'] + ", "
		  + options[fpcircle['layer']]['b'] + ", 1)";
	  context.lineWidth = fpcircle['width'];
	  context.arc(fpcircle['center_x'], fpcircle['center_y'], fpcircle['radius'], 0, 2 * Math.PI, false);
	  context.stroke();
  };

  // draws arcs
  var draw_fparc = function(fparc) {
    var dx = fparc['point_x'] - fparc['center_x'];
    var dy = fparc['point_y'] - fparc['center_y'];
    var start_angle = Math.atan2(dy, dx);
    var end_angle = start_angle + fparc['angle'] * Math.PI / 180;
	// use a clockwise rotation if the angle is negative
	var useCounterClockwiseRotation = fparc['angle'] < 0;

    context.beginPath();
	context.strokeStyle = "rgba("
		+ options[fparc['layer']]['r'] + ", "
		+ options[fparc['layer']]['g'] + ", "
		+ options[fparc['layer']]['b'] + ", 1)";
    context.lineWidth = fparc['width'];
    context.arc(fparc['center_x'], fparc['center_y'], fparc['radius'], start_angle, end_angle, useCounterClockwiseRotation);
    context.stroke();
  };

  // draws the text onto the canvas
  var draw_fptext = function(fptext)
  {
	context.save();
	var fontHeight = fptext['size']['height'];

	context.font = fontHeight + "px sans-serif";

	context.beginPath();
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.fillStyle = "rgba(" + options[fptext['layer']]['r'] + ", " + options[fptext['layer']]['g'] + ", " + options[fptext['layer']]['b'] + ", 1)";
	return context.fillText(fptext['value'], fptext['x'], fptext['y']);

  };

  // draws the pads
  var draw_pad = function(pad) {
	context.save();
	// get the layers used by the pad
	var layers = pad['layers'].split(',');

	var padRed = 0, padBlue = 0, padGreen = 0;

	// get the pad color
	if (layers.includes("*.Cu"))
	{
		options['copper_layers'].forEach(function(layer) {
			// add all of the copper layers to the pad color
			padRed += options[layer]['r'];
			padGreen += options[layer]['g'];
			padBlue += options[layer]['b'];
		});
	}
	else
	{
		var regex_copper_layer = new RegExp(".*\.Cu$");
		layers.forEach(function(layer) {
			// only add the copper layers to the pad color
			if (regex_copper_layer.test(layer))
			{
				padRed += options[layer]['r'];
				padGreen += options[layer]['g'];
				padBlue += options[layer]['b'];
			}
		});
	}

	// check that the pad color was set, if not, set it to the Unknown color
	// Note: this will cause custom stencil openings to be rendered with Unknown
	// color. See: http://kicad-pcb.org/libraries/klc/F6.3/ for more information
	if (padRed == 0 && padGreen == 0 && padBlue == 0)
	{
		// we have a pad on a nonstandard layer - set the pad color to Unknown
		padRed += options['Unknown']['r'];
		padGreen += options['Unknown']['g'];
		padBlue += options['Unknown']['b'];

	}

	// set the pad color
	context.fillStyle = "rgba(" + padRed + ", " + padGreen + ", " + padBlue + ", 1)";

	// move and rotate the pad
	context.translate(pad['x'], pad['y']);
	context.rotate((360 - pad.angle) * Math.PI / 180);

	// draw the pad shape
	switch (pad['shape']) {
		case 'circle':
			context.beginPath();
			context.arc(0, 0, pad['width'] / 2, 0, 2 * Math.PI, false);
			context.fill();
			break;
		case 'rect':
			context.fillRect(-pad['width'] / 2, -pad['height'] / 2, pad['width'], pad['height']);
			context.rect(-pad['width'] / 2, -pad['height'] / 2, pad['width'], pad['height']);
		  	context.fill();
			break;
		case 'oval':
			drawOval(context,0,0, pad['width'], pad['height'], true);
			break;
		case 'roundrect':
			var halfLinearWidth = pad['width'] / 2 * pad['roundrectRatio'];
			var halfLinearLength = pad['height'] / 2 * pad['roundrectRatio'];

			context.beginPath();
			context.moveTo(-halfLinearWidth, -pad['height'] / 2);
			context.lineTo(halfLinearWidth, -pad['height'] / 2);
			context.quadraticCurveTo(pad['width'] / 2, -pad['height'] / 2,pad['width'] / 2, - halfLinearLength);
			context.lineTo(pad['width'] / 2, halfLinearLength);
			context.quadraticCurveTo(pad['width'] / 2, pad['height'] / 2, halfLinearWidth, pad['height'] / 2);
			context.lineTo(-halfLinearWidth, pad['height'] / 2);
			context.quadraticCurveTo(-pad['width'] / 2, pad['height'] / 2, -pad['width'] / 2, halfLinearLength);
			context.lineTo(-pad['width'] / 2, -halfLinearLength);
			context.quadraticCurveTo(-pad['width'] / 2, -pad['height'] / 2, -halfLinearWidth, -pad['height'] / 2);
			// context.closePath();
			context.fill();
			break;
		case 'trapezoid':
			var dx = pad['rectDelta']['dx'];
			var dy = pad['rectDelta']['dy'];

			// only dx OR dy can be non zero!
			context.beginPath();
			context.moveTo(-pad['width'] / 2 + dy / 2,  -pad['height'] / 2 - dx / 2);
			context.lineTo(-pad['width'] / 2 - dy / 2,  pad['height'] / 2 + dx / 2);
			context.lineTo(pad['width'] / 2 + dy / 2, pad['height'] / 2 - dx / 2);
			context.lineTo(pad['width'] / 2 - dy / 2, -pad['height'] / 2 + dx / 2);
			context.closePath();
			context.fill();
			break;
		default:

	}

	// add drills, if necessary
    // if (pad['type'] === 'thru_hole' || pad['type'] === 'np_thru_hole')
    if (pad['drill']['type'] != 'none')
	{
	  // set styles for the drills and markings
	  context.fillStyle = "rgba(" + options['Thruhole']['r'] + ", " + options['Thruhole']['g'] + ", " + options['Thruhole']['b'] + ", 1)";
	  // add through hole markers on the Dwgs.User layer
	  context.strokeStyle = "rgba(" + options['Dwgs.User']['r'] + ", " + options['Dwgs.User']['g'] + ", " + options['Dwgs.User']['b'] + ", 1)";
	  context.lineCap = 'round';

	  if (pad['drill']['type'] === 'oval')
	  {
		// draw the oval drill hole
		drawOval(context, pad['drill']['offsetx'], pad['drill']['offsety'], pad['drill']['width'], pad['drill']['height'], true);
		context.fill();

		if (options['show_outline_holes'])
		{
			var minorAxis = Math.min(pad['drill']['width'], pad['drill']['height']);
			var lineWidth = minorAxis / 20;
			var capAdjust = context.lineCap == "butt" ? 0 : lineWidth / (2 * Math.sqrt(2));
			context.lineWidth = lineWidth;

			var a = pad['drill']['width'] / 2;
			var b = pad['drill']['height'] / 2;

			var xPosOffset = a * Math.cos(Math.PI / 4);
			var yPosOffset = b * Math.sin(Math.PI / 4);

			// draw the 'X' inside the hole
			context.beginPath();
			context.moveTo(pad['drill']['offsetx'] - xPosOffset + capAdjust, pad['drill']['offsety'] + yPosOffset - capAdjust);
			context.lineTo(pad['drill']['offsetx'] + xPosOffset - capAdjust, pad['drill']['offsety'] - yPosOffset + capAdjust);
			context.moveTo(pad['drill']['offsetx'] + xPosOffset -capAdjust, pad['drill']['offsety'] + yPosOffset - capAdjust);
			context.lineTo(pad['drill']['offsetx'] - xPosOffset + capAdjust, pad['drill']['offsety'] - yPosOffset + capAdjust);
			context.stroke();

			// draw dashed oval inside hole
			context.setLineDash([minorAxis / 10, minorAxis / 7]);
			context.beginPath();
			drawOval(context, pad['drill']['offsetx'], pad['drill']['offsety'], pad['drill']['width'] - lineWidth, pad['drill']['height'] - lineWidth, false);
			context.stroke();
		}
	  }
	  else // use a circular drill
	  {
		  // draw the circlar drill hole
		  context.beginPath();
		  context.arc(pad['drill']['offsetx'], pad['drill']['offsety'], pad['drill']['width'] / 2, 0, 2 * Math.PI, false);
		  context.fill();

		  // draw the hole markings, if set in the options (default)
		  if (options['show_outline_holes'] == true)
		  {

			  // draw the 'X' inside the circular hole
			  var drillRadius = pad['drill']['width'] / 2;
			  var xPosOffset = drillRadius * Math.sin(Math.PI / 4);
			  var yPosOffset = drillRadius * Math.cos(Math.PI / 4);
			  var lineWidth = pad['drill']['width'] / 20;
			  var capAdjust = context.lineCap == "butt" ? 0 : lineWidth / (2 * Math.sqrt(2));
			  context.lineWidth = lineWidth;

			  // if the cap is not 'butt', it will tack on a little extra length
			  context.beginPath();
			  context.moveTo(pad['drill']['offsetx'] - xPosOffset + capAdjust , pad['drill']['offsety'] + yPosOffset - capAdjust);
			  context.lineTo(pad['drill']['offsetx'] + xPosOffset - capAdjust, pad['drill']['offsety'] - yPosOffset + capAdjust);
			  context.moveTo(pad['drill']['offsetx'] + xPosOffset - capAdjust, pad['drill']['offsety'] + yPosOffset - capAdjust);
			  context.lineTo(pad['drill']['offsetx'] - xPosOffset + capAdjust, pad['drill']['offsety'] - yPosOffset + capAdjust);
			  context.stroke();

			  // draw dashed circle inside the hole
			  context.setLineDash([pad['drill']['width'] / 10, pad['drill']['width'] / 7]);
			  context.beginPath();
			  context.arc(pad['drill']['offsetx'], pad['drill']['offsety'], pad['drill']['width'] / 2  - lineWidth / 2, 0, 2 * Math.PI, false);
			  context.stroke();
		  }
	  }
    }
	context.restore();

    if (pad['num'] !== '')
	{
      context.beginPath();

	  // scale the pad text to fit within the pad
	  var fontSize = 14;
	  context.font = fontSize + "px sans-serif";
      context.textBaseline = 'middle';
	  context.textAlign = 'center';
	  var padName = pad['num'];
	  var padTextWidth = context.measureText(padName).width;
	  // decrease the font size until it fits in the pad
	  while (padTextWidth > (pad['width'] * 0.9) || fontSize > (pad['height'] * 0.9))
	  {
		fontSize--;
		context.font = fontSize + "px sans-serif";
		padTextWidth = context.measureText(padName).width;
		padTextHeight = context.measureText(padName).height;
	  }
	  context.fillStyle = "rgba("
		  + options['Fg']['r'] + ", "
		  + options['Fg']['g'] + ", "
		  + options['Fg']['b'] + ", 1)";
      context.fillText(padName, pad['x'], pad['y']);
    }

	return null;
  };
  var draw_footprint = function() {
    var bottom, canvas_height, canvas_width, fp_arc, fp_arcs, fp_circle, fp_circles, fp_line, fp_lines, fp_polys, fp_text, fp_texts, fparc, fpcircle, fpline, fptext, i, j, k, l, left, len, len1, len2, len3, len4, len5, line, m, max_height, max_width, n, num, o, pad, pads, prettylines, radius, regex_fparc, regex_fpcircle, regex_fpline, regex_fpolyline, regex_fptext, regex_fptext_efxt, regex_pad, results, right, top, update_dimensions, x, y;
    context.fillStyle = "rgb(" + options['Bg']['r'] + ", " + options['Bg']['g'] + ", " + options['Bg']['b'] + ")";
    context.fillRect(0, 0, canvas.width, canvas.height);
    left = 0;
    top = 0;
    right = 0;
    bottom = 0;
    update_dimensions = function(x, y) {
      if (parseFloat(x) < parseFloat(left))
	  {
        left = x;
      }
	  else if (parseFloat(x) > parseFloat(right))
	  {
        right = x;
      }
      if (parseFloat(y) < parseFloat(bottom))
	  {
        return bottom = y;
      }
	  else if (parseFloat(y) > parseFloat(top))
	  {
        return top = y;
      }
    };

	var list = [];

	var tokens = tokenize(data);
    var result = parseTokens(tokens, list);

    fp_lines = [];
    fp_circles = [];
    fp_arcs = [];
    fp_texts = [];
    fp_polys = [];
    pads = [];

	var found_fplines = getArray(result,"fp_line");
	for (i = 0 ; i < found_fplines.length; i++)
	{
		var lineArr = found_fplines[i][0];
		var start = getValue(lineArr,"start");
		var end = getValue(lineArr,"end");
		var layer = getValue(lineArr,"layer");
		var width = getValue(lineArr,"width");

		var fpline = {};
		fpline['x1'] = start[1];
		fpline['y1'] = start[2];
		fpline['x2'] = end[1];
		fpline['y2'] = end[2];
		fpline['width'] = width[1];
		fpline['layer'] = layer[1];

		fp_lines.push(fpline);

		update_dimensions(fpline['x1'], fpline['y1']);
        update_dimensions(fpline['x2'], fpline['y2']);
	}

	var found_fptexts = getArray(result,"fp_text");
	for (i = 0 ; i < found_fptexts.length; i++)
	{
		var textArr = found_fptexts[i][0];

		if (textArr.includes('hide'))
			continue;
		var position = getValue(textArr,"at");
		var end = getValue(textArr,"end");
		var layer = getValue(textArr,"layer");
		var effects = getValue(textArr,"effects");
		var font = getValue(effects,"font");
		var size = getValue(font,"size");
		var thickness = getValue(font,"thickness");

		var fptext = {
			x: position[1],
			y: position[2],
			value: textArr[2],
			layer: layer[1],
			size: {width: size[1], height: size[2]},
			thickness: thickness[1]
		};


		fp_texts.push(fptext);

		update_dimensions(fptext['x'], fptext['y']);
	}

	var found_fppolylines = getArray(result,"fp_poly");
	for (i = 0 ; i < found_fppolylines.length; i++)
	{
		var polylineArr = found_fppolylines[i][0];
		var points = getValue(polylineArr,"pts");
		var xypoints = getValue(points,"xy");
		var end = getValue(polylineArr,"end");
		var layer = getValue(polylineArr,"layer");
		var width = getValue(polylineArr,"width");

		var pointArr = []
		var minX = Number.MAX_SAFE_INTEGER;
		var minY = Number.MAX_SAFE_INTEGER;
		var maxX = Number.MIN_SAFE_INTEGER;
		var maxY = Number.MIN_SAFE_INTEGER;

		for (j = 1; j < points.length; j++)
		{
			var point = []
			point[0] = points[j][1];
			maxX = Math.max(maxX,point[0]);
			minX = Math.min(minX,point[0]);
			point[1] = points[j][2];
			maxY = Math.max(maxY,point[1]);
			minY = Math.min(minY,point[1]);
			pointArr.push(point)
		}

		var fp_poly = {
          points: pointArr,
          layer: layer[1],
          width: width[1],
		  zoom: zoom
        };

		 fp_polys.push(fp_poly);

		update_dimensions(minX, minY);
        update_dimensions(maxX, maxY);
	}

	var found_fparcs = getArray(result,"fp_arc");
	for (i = 0 ; i < found_fparcs.length; i++)
	{
		var arcArr = found_fparcs[i][0];
		var start = getValue(arcArr,"start");
		var end = getValue(arcArr,"end");
		var layer = getValue(arcArr,"layer");
		var width = getValue(arcArr,"width");
		var angle = getValue(arcArr,"angle");

		var radius = Math.sqrt(Math.pow(start[1] - end[1], 2) + Math.pow(start[2] - end[2], 2));
		fp_arc = {
          center_x: start[1],
          center_y: start[2],
          point_x: end[1],
          point_y: end[2],
          radius: radius,
          angle: angle[1],
          layer: layer[1],
          width: width[1]
        };

		fp_arcs.push(fp_arc);

		update_dimensions(fp_arc['center_x'] - fp_arc['radius'], fp_arc['center_y'] - fp_arc['radius']);
        update_dimensions(fp_arc['center_x'] + fp_arc['radius'], fp_arc['center_y'] + fp_arc['radius']);
	}

	var found_fpcircless = getArray(result,"fp_circle");
	for (i = 0 ; i < found_fpcircless.length; i++)
	{
		var circleArr = found_fpcircless[i][0];
		var center = getValue(circleArr,"center");
		var end = getValue(circleArr,"end");
		var layer = getValue(circleArr,"layer");
		var width = getValue(circleArr,"width");

		var radius = Math.sqrt(Math.pow(center[1] - end[1], 2) + Math.pow(center[2] - end[2], 2));

		fp_circle = {
          center_x: center[1],
          center_y: center[2],
          point_x: end[1],
          point_y: end[2],
          radius: radius,
          layer: layer[1],
          width: width[1]
        };

		fp_circles.push(fp_circle);

		update_dimensions(fp_circle['center_x'] - fp_circle['radius'], fp_circle['center_y'] - fp_circle['radius']);
        update_dimensions(fp_circle['center_x'] + fp_circle['radius'], fp_circle['center_y'] + fp_circle['radius']);
	}

	var found_pads = getArray(result,"pad");
	for (i = 0 ; i < found_pads.length; i++)
	{
		var padArr = found_pads[i][0];
		var padName = padArr[1];
		var padType = padArr[2];
		var padShape = padArr[3];
		var at = getValue(padArr,"at");
		var size = getValue(padArr,"size");
		var layerVal = getValue(padArr,"layers");
		var roundrectRatioVal = getValue(padArr,"roundrect_rratio");
		var drillArr = getValue(padArr,"drill");
		var drill = {};

		if (drillArr.length > 1)
		{
			var drillOffset = getValue(drillArr,"offset");
			if (drillArr.length > 2)
			{
				if (drillArr[1] === 'oval')
				{
					drill = {type:'oval',width: drillArr[2], height: drillArr[3]};
				}
				else
				{
					drill = {type:'circle',width: drillArr[1], height: drillArr[1]};
				}
			}
			else
			{
				drill = {type:'circle',width: drillArr[1], height: drillArr[1]};
			}

			if (drillOffset.length > 0)
			{
				drill['offsetx'] = drillOffset[1];
				drill['offsety'] = drillOffset[2];
			}
			else
			{
				drill['offsetx'] = 0;
				drill['offsety'] = 0;
			}
		}
		else
		{
			drill = {type:'none',width: 0, height: 0};
		}

		var rectDelta = {dx:0, dy:0};
		if (padShape == 'trapezoid')
		{
			var rectDeltaGroup = getValue(padArr,"rect_delta");
			if (rectDeltaGroup[1] == 0 || rectDeltaGroup[2] == 0)
			{
				// assuming the documentation is incorrect and should be '(rect_delta dx dy)'
				rectDelta = rectDelta = {dx:rectDeltaGroup[1], dy:rectDeltaGroup[2]}
			}
		}

		if (roundrectRatioVal.length > 1)
		{
			var roundrectRatio = roundrectRatioVal[1];
		}
		else
		{
			var r = Math.min(size[1], size[2]);
			var roundrectRatio = r * 0.25;
		}

		var layers = [];
		for (j = 1; j < layerVal.length; j++)
		{
			layers.push(layerVal[j]);
		}

		var rotation = 0;
		if (at.length > 3)
		{
			rotation = at[3];
		}

		var pad = {
          num: padName,
          type: padType,
          shape: padShape,
          x: at[1],
          y: at[2],
		  angle: rotation,
          width: size[1],
          height: size[2],
          layers: layers.toString(),
		  drill: drill,
		  rectDelta: rectDelta,
		  roundrectRatio: roundrectRatio
        };
        update_dimensions(pad['x'] - pad['width'] / 2, pad['y'] - pad['height'] / 2);
        update_dimensions(pad['x'] + pad['width'] / 2, pad['y'] + pad['height'] / 2);

        pads.push(pad);
	}

	if (DEBUG)
	{
		console.log("DEBUG: found " + fp_lines.length + " fp_lines");
		console.log("DEBUG: found " + fp_polys.length + " fp_polys");
		console.log("DEBUG: found " + fp_circles.length + " fp_circles");
		console.log("DEBUG: found " + fp_arcs.length + " fp_arcs");
		console.log("DEBUG: found " + fp_texts.length + " fp_texts");
		console.log("DEBUG: found " + pads.length + " pads");
	}
    canvas_width = canvas.width / 2;
    canvas_height = canvas.height / 2;
    max_width = Math.max(Math.abs(left), Math.abs(right));
    max_height = Math.max(Math.abs(top), Math.abs(bottom));
    if (!zoom) {
      zoom = Math.min((canvas_width - 10) / max_width, (canvas_height - 10) / max_height);
      default_zoom = zoom;
    }
	if (DEBUG)
	{
		console.log("DEBUG: max dimensions: left=" + left + "; right=" + right + "; top=" + top + "; bottom=" + bottom);
		console.log("DEBUG: zoom: " + zoom);
		console.log("DEBUG: moved: " + move_x + "x" + move_y);
	}
    draw_grid(options['grid'] * zoom );
    for (j = 0, len1 = fp_lines.length; j < len1; j++) {
      fpline = fp_lines[j];
      fpline['x1'] = fpline['x1'] * zoom + canvas_width + move_x;
      fpline['y1'] = fpline['y1'] * zoom + canvas_height + move_y;
      fpline['x2'] = fpline['x2'] * zoom + canvas_width + move_x;
      fpline['y2'] = fpline['y2'] * zoom + canvas_height + move_y;
      fpline['width'] *= zoom;
      draw_fpline(fpline);
    }
	for (j = 0, len1 = fp_polys.length; j < len1; j++)
	{
		for (k = 0; k < fp_polys[j].points.length;k++)
		{
			fp_polys[j].points[k][0] = fp_polys[j].points[k][0] * zoom + canvas_width + move_x;
			fp_polys[j].points[k][1] = fp_polys[j].points[k][1] * zoom + canvas_height + move_y;
		}

	  fp_polys[j]['width'] *= zoom;

      draw_fppoly(fp_polys[j]);
    }
    for (k = 0, len2 = fp_circles.length; k < len2; k++) {
      fpcircle = fp_circles[k];
      fpcircle['center_x'] = fpcircle['center_x'] * zoom + canvas_width + move_x;
      fpcircle['center_y'] = fpcircle['center_y'] * zoom + canvas_height + move_y;
      fpcircle['radius'] *= zoom;
      fpcircle['width'] *= zoom;
      draw_fpcircle(fpcircle);
    }
    for (l = 0, len3 = fp_arcs.length; l < len3; l++) {
      fparc = fp_arcs[l];
      fparc['center_x'] = fparc['center_x'] * zoom + canvas_width + move_x;
      fparc['center_y'] = fparc['center_y'] * zoom + canvas_height + move_y;
      fparc['point_x'] = fparc['point_x'] * zoom + canvas_width + move_x;
      fparc['point_y'] = fparc['point_y'] * zoom + canvas_height + move_y;
      fparc['width'] *= zoom;
      fparc['radius'] *= zoom;
      draw_fparc(fparc);
    }
    for (n = 0, len4 = fp_texts.length; n < len4; n++) {
      fptext = fp_texts[n];


	  fptext['x'] = fptext['x'] * zoom + canvas_width + move_x;
	  fptext['y'] = fptext['y'] * zoom + canvas_height + move_y;
	  fptext['size']['height'] *= zoom;

      draw_fptext(fptext);
    }
    results = [];
    for (o = 0, len5 = pads.length; o < len5; o++) {
      pad = pads[o];
      pad['x'] = pad['x'] * zoom + canvas_width + move_x;
      pad['y'] = pad['y'] * zoom + canvas_height + move_y;
      pad['width'] *= zoom;
      pad['height'] *= zoom;
	  pad['drill']['height'] *= zoom;
      pad['drill']['width'] *= zoom;
	  pad['drill']['offsetx'] *= zoom;
      pad['drill']['offsety'] *= zoom;
	  pad['rectDelta']['dx'] *= zoom;
      pad['rectDelta']['dy'] *= zoom;
      results.push(draw_pad(pad));
    }
    return results;
  };


  this.render = function(footprint) {
    data = getCommands(footprint);
	this.parsed_data = data;
	this.raw_data = footprint;
    //data = footprint;
    return draw_footprint();
  };
  getCommands = function(fileText)
  {
	var level = 0;
	parsedStr = "";

	for (var i = 0; i < fileText.length; i++)
	{
		if (fileText[i] == "\n" || fileText[i] == "\r" || fileText[i] == "\t")
			continue;

		if (fileText[i] == "(")
		{
			level++;
		}
		else
			if (fileText[i] == ")")
			{
				level--;
				if (level == 1)
				{
					parsedStr += ")\n"
					continue;
				}
			}

	  parsedStr += fileText[i];
	}

	//console.log(parsedStr);
	return parsedStr;
  };
  this.zoom = function(level)
  {
	if (zoom + level < 0)
		zoom = 0;
	else
		zoom = zoom + level;
    return draw_footprint();
  };
  this.getZoom = function() {
    return zoom;
  };
  this.getX = function() {
    return move_x;
  };
  this.getY = function() {
    return move_y;
  };

  this.move_up = function(px) {
    move_y = move_y + px;
    return draw_footprint();
  };
  this.move_down = function(px) {
    move_y = move_y - px;
    return draw_footprint();
  };
  this.move_left = function(px) {
    move_x = move_x + px;
    return draw_footprint();
  };
  this.move_right = function(px) {
    move_x = move_x - px;
    return draw_footprint();
  };
  this.reset = function() {
    zoom = default_zoom;
    move_x = 0;
    move_y = 0;
    return draw_footprint();
  };
  canvas.addEventListener('scroll', function(event) {
    return console.log(event);
  });
  return this;
};

if (typeof define !== 'undefined') {
  define('kicad', [], function() {
    return KiCad;
  });
} else if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = KiCad;
} else if (window) {
  window.KiCad = KiCad;
} else if (global) {
  global.KiCad = KiCad;
}

// draws an oval and either strokes or fills it
// Note: KiCad actually draws a stadium shape
function drawOval(context,centerX, centerY, width, height, doFill)
{
  // context.fillStyle() should be set before calling this function
  if (width > height)
  {
	  var r = height / 2;
	  var a_2 = (width - 2 * r) / 2;

	  context.beginPath();
	  context.arc(centerX + a_2, centerY, r, Math.PI /2, 3 * Math.PI / 2, true);
	  context.lineTo(centerX - a_2 , centerY - r);
	  context.arc(centerX - a_2, centerY, r, 3 * Math.PI / 2, Math.PI /2, true);
	  context.closePath();
  }
  else
  {
	  var r = width / 2;
      var a_2 = (height - 2 * r) / 2;

      context.beginPath();
      context.arc(centerX, centerY + a_2, r, 0, Math.PI, false);
      context.lineTo(centerX - r, centerY + a_2);
      context.arc(centerX, centerY - a_2, r, Math.PI, 2*Math.PI, false);
      context.closePath();
  }



  if (doFill)
  {
	context.fill();
  }
  else
  {
    context.stroke();
  }
  context.closePath();
}

/* S-expression parsing */
var categorize = function(input) {
     if (!isNaN(parseFloat(input))) {
       return parseFloat(input);
     } else if (input[0] === '"' && input.slice(-1) === '"') {
       return input.slice(1, -1);
     } else {
       return input ;
     }
   };
var tokenize = function(input) {
     return input.replace(/\(/g, ' ( ')
           .replace(/\)/g, ' ) ')
           .trim()
           .split(/\s+/);
   };
var parseTokens = function(input, list) {
    if (list === undefined)
	{
      return parseTokens(input, []);
    }
	else
	{
      var token = input.shift();
      if (token === undefined)
	  {
        return list.pop();
      }
	  else if (token === "(")
	  {
        list.push(parseTokens(input, []));
        return parseTokens(input, list);
      }
	  else if (token === ")")
	  {
        return list;
      }
	  else
	  {
        return parseTokens(input, list.concat(categorize(token)));
      }
    }
  };	
function getArray(data, value, level = 0)
{
	var result = [];
	var i = 0;
	while(i < data.length)
	{
		if (data[i] === value)
		{
			result.push(data);
			i++;
			break;
		}
		else
		{
			if (Array.isArray(data[i]))
			{
				var tempArr = getArray(data[i],value, level + 1);
				if (tempArr.length > 0)
				{
					result.push(tempArr);
				}
			}
		}
		i++;
	}
	return result;
}
function getValue(data, value, level = 0)
{
	var result = [];
	var i = 0;
	while(i < data.length)
	{
		if (data[i] === value)
			return (data);
		else if (Array.isArray(data[i]))
			{
				var tempArr = getValue(data[i],value, level + 1);
				if (tempArr.length > 0)
					return tempArr;
			}
		i++;
	}
	return result;
}