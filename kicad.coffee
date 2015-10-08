# kicad.js v0.2.0
# (c) 2015 Ricardo (XenGi) Band

defaults = {
    'Fg': {'r': 255, 'g': 255, 'b': 255},
    'Bg': {'r': 0, 'g': 0, 'b': 0},
    'F.Cu': {'r': 132, 'g': 0, 'b': 0},
    'B.Cu': {'r': 0, 'g': 132, 'b': 0},
    'F.Adhes': {'r': 132, 'g': 0, 'b': 132},
    'B.Adhes': {'r': 0, 'g': 0, 'b': 132},
    'F.Paste': {'r': 132, 'g': 0, 'b': 0},
    'B.Paste': {'r': 0, 'g': 194, 'b': 194},
    'F.SilkS': {'r': 0, 'g': 132, 'b': 132},
    'B.SilkS': {'r': 132, 'g': 0, 'b': 132},
    'F.Mask': {'r': 132, 'g': 0, 'b': 132},
    'B.Mask': {'r': 132, 'g': 132, 'b': 0},
    'Dwgs.User': {'r': 194, 'g': 194, 'b': 194},
    'Cmts.User': {'r': 0, 'g': 0, 'b': 132},
    'Eco1.User': {'r': 0, 'g': 132, 'b': 0},
    'Eco2.user': {'r': 194, 'g': 194, 'b': 0},
    'Egde.Cuts': {'r': 194, 'g': 194, 'b': 0},
    'Margin': {'r': 194, 'g': 0, 'b': 194},
    'F.Crtyd': {'r': 132, 'g': 132, 'b': 132},
    'B.CrtYd': {'r': 0, 'g': 0, 'b': 0},
    'F.Fab': {'r': 194, 'g': 194, 'b': 0},
    'B.Fab': {'r': 132, 'g': 0, 'b': 0},
    'grid': 1.27
}

KiCad = (canvas, options = {}) ->
    if canvas.getContext
        context = canvas.getContext('2d')
    else
        throw("Can't get context of canvas.")

    data = {}
    zoom = 0

    for key of defaults
        options[key] = options[key] or defaults[key]

    draw_grid = (size) ->
        center_x = canvas.width / 2
        center_y = canvas.height / 2
        dots_x = parseInt(canvas.width / size)
        dots_x += dots_x % 2  # make it an even number
        dots_y = parseInt(canvas.height / size)
        dots_y += dots_y % 2  # make it an even number
        for x in [0..dots_x]
            for y in [0..dots_y]
                _x = x * size + center_x
                _y = y * size + center_y

                context.beginPath()
                context.strokeStyle = "rgba(132, 132, 132, 1)"
                # here the even numbers for x and y are important
                context.fillRect(_x - dots_x / 2 * size, _y - dots_y / 2 * size, 1, 1)
                #context.arc(_x - dots_x / 2 * size, _y - dots_y / 2 * size, 0.5, 0, 2 * Math.PI)
                #context.fill()
                context.stroke()


    draw_fpline = (fpline) ->
        context.strokeStyle = "rgba(#{options[fpline['layer']]['r']},
                                    #{options[fpline['layer']]['g']},
                                    #{options[fpline['layer']]['b']},
                                    1)"
        context.lineWidth = fpline['width']
        context.lineCap = 'square'
        context.beginPath()
        context.moveTo(fpline['x1'], fpline['y1'])
        context.lineTo(fpline['x2'], fpline['y2'])
        context.stroke()


    draw_fpcircle = (fpcircle) ->
        context.beginPath()
        context.strokeStyle = "rgba(#{options[fpcircle['layer']]['r']},
                                    #{options[fpcircle['layer']]['g']},
                                    #{options[fpcircle['layer']]['b']},
                                    1)"
        context.arc(fpcircle['center_x'], fpcircle['center_y'], fpcircle['radius'], 0, 2 * Math.PI, false)
        context.lineWidth = fpcircle['width']
        context.stroke()


    draw_fparc = (fparc) ->
        dx = fparc['point_x'] - fparc['center_x']
        dy = fparc['point_y'] - fparc['center_y']
        start_angle = Math.atan2(dy, dx)
        end_angle = start_angle + fparc['angle'] * Math.PI / 180

        context.beginPath()
        context.strokeStyle = "rgba(#{options[fparc['layer']]['r']},
                                    #{options[fparc['layer']]['g']},
                                    #{options[fparc['layer']]['b']},
                                    1)"
        context.arc(fparc['center_x'], fparc['center_y'], fparc['radius'], start_angle, end_angle, false)
        context.lineWidth = fparc['width']
        context.stroke()


    draw_fptext = (fptext) ->
        # TODO: implement me!
        return


    draw_pad = (pad) ->
        if pad['shape'] == 'circle'
            context.beginPath()
            context.arc(pad['x'], pad['y'], pad['width'] / 2, 0, 2 * Math.PI, false)
            context.fillStyle = "rgba(#{options['B.Mask']['r']},
                                      #{options['B.Mask']['g']},
                                      #{options['B.Mask']['b']},
                                      1)"
            context.fill()
        #else if pad['shape'] == 'oval'
            # TODO: implement me!
            #context.beginPath()
            #
            #context.fillStyle = "rgba(#{options['B.Mask']['r']},
            #                          #{options['B.Mask']['g']},
            #                          #{options['B.Mask']['b']},
            #                          1)"
            #context.fill()
        else if pad['shape'] == 'rect'
            context.beginPath()
            context.fillRect(pad['x'], pad['y'], pad['width'], pad['height'])
            context.fillStyle = "rgba(#{options['B.Mask']['r']},
                                      #{options['B.Mask']['g']},
                                      #{options['B.Mask']['b']},
                                      1)"
            context.fill()

        if pad['type'] == 'thru_hole'
            context.beginPath()
            context.arc(pad['x'], pad['y'], pad['drill'] / 2, 0, 2 * Math.PI, false)
            context.fillStyle = "rgba(#{options['Bg']['r']},
                                      #{options['Bg']['g']},
                                      #{options['Bg']['b']},
                                      1)"
            context.fill()
        #else if pad['type'] == 'np_thru_hole'
            # TODO: implement me!
        #else if pad['type'] == 'smd'
            # TODO: implement me!

        if pad['num'] != ''
            context.beginPath()
            context.textAlign = 'center'
            context.textBaseline = 'middle'
            context.fillStyle = "rgba(#{options['Fg']['r']},
                                      #{options['Fg']['g']},
                                      #{options['Fg']['b']},
                                      1)"
            context.fillText(pad['num'], pad['x'], pad['y'])


    draw_footprint = () ->
        # draw background
        context.fillStyle = "rgb(#{options['Bg']['r']}, #{options['Bg']['g']}, #{options['Bg']['b']})"
        context.fillRect(0, 0, canvas.width, canvas.height)

        # set outer boundaries of pretty file
        left = 0
        top = 0
        right = 0
        bottom = 0

        update_dimensions = (x, y) ->
            if parseFloat(x) < parseFloat(left)
                left = x
            else if parseFloat(x) > parseFloat(right)
                right = x
            if parseFloat(y) < parseFloat(bottom)
                bottom = y
            else if parseFloat(y) > parseFloat(top)
                top = y

        # save all lines in a list to draw them later
        fp_lines = []
        fp_circles = []
        fp_arcs = []
        fp_texts = []
        pads = []

        # read pretty file
        prettylines = data.split('\n')
        for l in prettylines
            l = l.trim()

            regex_fpline = /\(fp_line\ \(start\ ([-.\d]*)\ ([-.\d]*)\)\ \(end\ ([-.\d]*)\ ([-.\d]*)\)\ \(layer\ ([.a-zA-Z]*)\)\ \(width\ ([-.\d]*)\)\)/g
            while (m = regex_fpline.exec(l)) != null
            # TODO: forgot what the next 2 lines do..
                if m.index == regex_fpline.lastIndex
                    regex_fpline.lastIndex++

                fp_line = {}
                fp_line['x1'] = parseFloat(m[1])
                fp_line['y1'] = parseFloat(m[2])
                fp_line['x2'] = parseFloat(m[3])
                fp_line['y2'] = parseFloat(m[4])
                fp_line['layer'] = m[5]
                fp_line['width'] = parseFloat(m[6])

                update_dimensions(fp_line['x1'], fp_line['y1'])
                update_dimensions(fp_line['x2'], fp_line['y2'])

                fp_lines.push(fp_line)

            regex_fparc = /\(fp_arc\ \(start\ ([-.\d]*)\ ([-.\d]*)\)\ \(end\ ([-.\d]*)\ ([-.\d]*)\)\ \(angle\ ([-.\d]*)\)\ \(layer\ ([.a-zA-Z]*)\)\ \(width\ ([-.\d]*)\)\)/g
            while (m = regex_fparc.exec(l)) != null
                if m.index == regex_fparc.lastIndex
                    regex_fparc.lastIndex++

                fp_arc = {}
                fp_arc['center_x'] = parseFloat(m[1])
                fp_arc['center_y'] = parseFloat(m[2])
                fp_arc['point_x'] = parseFloat(m[3])
                fp_arc['point_y'] = parseFloat(m[4])
                fp_arc['radius'] = Math.sqrt(Math.pow(fp_arc['center_x'] - fp_arc['point_x'], 2) +
                                             Math.pow(fp_arc['center_y'] - fp_arc['point_y'], 2))
                fp_arc['angle'] = parseFloat(m[5])
                fp_arc['layer'] = m[6]
                fp_arc['width'] = parseFloat(m[7])

                update_dimensions(fp_arc['center_x'] - fp_arc['radius'],
                                  fp_arc['center_y'] - fp_arc['radius'])
                update_dimensions(fp_arc['center_x'] + fp_arc['radius'],
                                  fp_arc['center_y'] + fp_arc['radius'])

                fp_arcs.push(fp_arc)


            regex_fpcircle = /\(fp_circle\ \(center\ ([-.\d]+)\ ([-.\d]+)\)\ \(end\ ([-.\d]+)\ ([-.\d]+)\)\ \(layer\ ([.\w]+)\)\ \(width\ ([.\d]+)\)\)/g
            while (m = regex_fpcircle.exec(l)) != null
                if m.index == regex_fpcircle.lastIndex
                    regex_fpcircle.lastIndex++

                fp_circle = {}
                fp_circle['center_x'] = parseFloat(m[1])
                fp_circle['center_y'] = parseFloat(m[2])
                x = parseFloat(m[3])
                y = parseFloat(m[4])
                fp_circle['radius'] = Math.sqrt(Math.pow(fp_circle['center_x'] - x, 2) +
                                                Math.pow(fp_circle['center_y'] - y, 2))
                fp_circle['layer'] = m[5]
                fp_circle['width'] = parseFloat(m[6])

                update_dimensions(fp_circle['center_x'] - fp_circle['radius'],
                                  fp_circle['center_y'] - fp_circle['radius'])
                update_dimensions(fp_circle['center_x'] + fp_circle['radius'],
                                  fp_circle['center_y'] + fp_circle['radius'])

                fp_circles.push(fp_circle)


            regex_pad = /\(pad\ ([\d]*)\ ([_a-z]*)\ ([a-z]*)\ \(at\ ([-.\d]*)\ ([-.\d]*)\)\ \(size\ ([.\d]*)\ ([.\d]*)\)\ \(drill\ ([.\d]*)\)\ \(layers\ ([\w\d\s\.\*]*)\)\)/g
            while (m = regex_pad.exec(l)) != null
                # TODO: forgot what the next 2 lines do..
                if m.index == regex_pad.lastIndex
                    regex_pad.lastIndex++

                pad = {}
                pad['num'] = ''
                if m[1] != '""'
                    pad['num'] = m[1]
                pad['type'] = m[2]
                pad['shape'] = m[3]
                pad['x'] = parseFloat(m[4])
                pad['y'] = parseFloat(m[5])
                pad['width'] = parseFloat(m[6])
                pad['height'] = parseFloat(m[7])
                pad['drill'] = parseFloat(m[8])
                pad['layers'] = m[9].split(' ')

                update_dimensions(pad['x'] - pad['width'] / 2,
                                  pad['y'] - pad['height'] / 2)
                update_dimensions(pad['x'] + pad['width'] / 2,
                                  pad['y'] + pad['height'] / 2)

                pads.push(pad)

            regex_fptext = /\(fp_text\ (reference|value|user)\ (.)+\ \(at\ ([-.\d]+)\ ([-.\d]+)(\ [-.\d]+)?\)\ \(layer\ ([.\w\d])+\)/g
            while (m = regex_fptext.exec(l)) != null
                if m.index == regex_fptext.lastIndex
                    regex_fptext.lastIndex++

                fp_text = {}
                fp_text['type'] = m[1]
                fp_text['text'] = m[2]
                fp_text['x'] = m[3]
                fp_text['y'] = m[4]
                if m[6]
                    fp_text['degrees'] = m[5]
                    fp_text['layer'] = m[6]
                else
                    fp_text['degrees'] = 0
                    fp_text['layer'] = m[5]

                update_dimensions(fp_text['x'], fp_text['y'])

                fp_texts.push(fp_text)

            regex_fptext_efxt = /\(effects\ \(font\ \(size\ ([.\d]+)\ ([.\d]+)\)\ \(thickness\ ([.\d]+)\)\)\)/g
            while (m = regex_fptext_efx.exec(l)) != null
                if m.index == regex_fptext_efx.lastIndex
                    regex_fptext_efx.lastIndex++

                fp_texts[fp_texts.length - 1]['width'] = m[1]
                fp_texts[fp_texts.length - 1]['height'] = m[2]
                fp_texts[fp_texts.length - 1]['thickness'] = m[3]

        console.log("DEBUG: found #{fp_lines.length} fp_lines")
        console.log("DEBUG: found #{fp_circles.length} fp_circles")
        console.log("DEBUG: found #{fp_arcs.length} fp_arcs")
        console.log("DEBUG: found #{fp_texts.length} fp_texts")
        console.log("DEBUG: found #{pads.length} pads")

        # calculate zoom factor
        cw = canvas.width / 2
        ch = canvas.height / 2
        maxw = Math.max(Math.abs(left), Math.abs(right))
        maxh = Math.max(Math.abs(top), Math.abs(bottom))
        if not zoom
            zoom = Math.min((cw - 10) / maxw, (ch - 10) / maxh)

        console.log("DEBUG: max dimensions: left=#{left}; right=#{right}; top=#{top}; bottom=#{bottom}")
        console.log("DEBUG: zoom: #{zoom}")


        # draw everything
        draw_grid(options['grid'] * zoom)

        for fpline in fp_lines
            # translate coords
            fpline['x1'] = fpline['x1'] * zoom + cw
            fpline['y1'] = fpline['y1'] * zoom + ch
            fpline['x2'] = fpline['x2'] * zoom + cw
            fpline['y2'] = fpline['y2'] * zoom + ch
            fpline['width'] *= zoom
            draw_fpline(fpline)

        for fpcircle in fp_circles
            # translate coords
            fpcircle['center_x'] = fpcircle['center_x'] * zoom + cw
            fpcircle['center_y'] = fpcircle['center_y'] * zoom + ch
            fpcircle['radius'] *= zoom
            fpcircle['width'] *= zoom
            draw_fpcircle(fpcircle)

        for fparc in fp_arcs
            # translate coords
            fparc['center_x'] = fparc['center_x'] * zoom + cw
            fparc['center_y'] = fparc['center_y'] * zoom + ch
            fparc['point_x'] = fparc['point_x'] * zoom + cw
            fparc['point_y'] = fparc['point_y'] * zoom + ch
            fparc['width'] *= zoom
            fparc['radius'] *= zoom
            draw_fparc(fparc)

        for fptext in fp_texts
            # translate coords
            #fptext['center_x'] = fptext['center_x'] * zoom + cw
            #fptext['center_y'] = fptext['center_y'] * zoom + ch
            #fptext['width'] *= zoom
            draw_fptext(fptext)

        for pad in pads
            # translate coords
            pad['x'] = pad['x'] * zoom + cw
            pad['y'] = pad['y'] * zoom + ch
            pad['width'] *= zoom
            pad['height'] *= zoom
            pad['drill'] *= zoom
            draw_pad(pad)

    this.render = (footprint) ->
        data = footprint
        draw_footprint()

    this.zoom = (level) ->
        zoom = zoom + level
        draw_footprint()

    return this


if typeof(define) != 'undefined'
    define 'kicad', [], () ->
        return KiCad
else if typeof(module) != 'undefined' && typeof(module.exports) != 'undefined'
    module.exports = KiCad
else if window
    window.KiCad = KiCad
else if global
    global.KiCad = KiCad

