# kicad.js v0.1.0
# (c) 2015 Ricardo (XenGi) Band

color = {}
color['Fg'] = {'r': 255, 'g': 255, 'b': 255}
color['Bg'] = {'r': 0, 'g': 0, 'b': 0}
color['F.Cu'] = {'r': 132, 'g': 0, 'b': 0}
color['B.Cu'] = {'r': 0, 'g': 132, 'b': 0}
color['F.Adhes'] = {'r': 132, 'g': 0, 'b': 132}
color['B.Adhes'] = {'r': 0, 'g': 0, 'b': 132}
color['F.Paste'] = {'r': 132, 'g': 0, 'b': 0}
color['B.Paste'] = {'r': 0, 'g': 194, 'b': 194}
color['F.SilkS'] = {'r': 0, 'g': 132, 'b': 132}
color['B.SilkS'] = {'r': 132, 'g': 0, 'b': 132}
color['F.Mask'] = {'r': 132, 'g': 0, 'b': 132}
color['B.Mask'] = {'r': 132, 'g': 132, 'b': 0}
color['Dwgs.User'] = {'r': 194, 'g': 194, 'b': 194}
color['Cmts.User'] = {'r': 0, 'g': 0, 'b': 132}
color['Eco1.User'] = {'r': 0, 'g': 132, 'b': 0}
color['Eco2.user'] = {'r': 194, 'g': 194, 'b': 0}
color['Egde.Cuts'] = {'r': 194, 'g': 194, 'b': 0}
color['Margin'] = {'r': 194, 'g': 0, 'b': 194}
color['F.Crtyd'] = {'r': 132, 'g': 132, 'b': 132}
color['B.CrtYd'] = {'r': 0, 'g': 0, 'b': 0}
color['F.Fab'] = {'r': 194, 'g': 194, 'b': 0}
color['B.Fab'] = {'r': 132, 'g': 0, 'b': 0}

draw_pad = (c, pad) ->
    if pad['shape'] == 'circle'
        c.beginPath()
        # TODO: change circle to elipse and also use height
        # or is width and height always the same with circles?
        c.arc(pad['x'], pad['y'], pad['width'] / 2, 0, 2 * Math.PI, false)
        c.fillStyle = "rgba(#{color['B.Mask']['r']},
                            #{color['B.Mask']['g']},
                            #{color['B.Mask']['b']},
                            1)"
        c.fill()
    else if pad['shape'] == 'rect'
        c.beginPath()
        c.fillRect(pad['x'], pad['y'], pad['width'], pad['height'])
        c.fillStyle = "rgba(#{color['B.Mask']['r']},
                            #{color['B.Mask']['g']},
                            #{color['B.Mask']['b']},
                            1)"
        c.fill()

    if pad['type'] == 'thru_hole'
        c.beginPath()
        c.arc(pad['x'], pad['y'], pad['drill'] / 2, 0, 2 * Math.PI, false)
        c.fillStyle = "rgba(#{color['Bg']['r']},
                            #{color['Bg']['g']},
                            #{color['Bg']['b']},
                            1)"
        c.fill()

    c.beginPath()
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    c.fillStyle = "rgba(#{color['Fg']['r']},
                        #{color['Fg']['g']},
                        #{color['Fg']['b']},
                        1)"
    c.fillText(pad['num'], pad['x'], pad['y'])


draw_line = (c, line) ->
    c.strokeStyle = "rgba(#{color[line['layer']]['r']},
                          #{color[line['layer']]['g']},
                          #{color[line['layer']]['b']},
                          1)"
    c.lineWidth = line['width']
    c.lineCap = 'square'
    c.beginPath()
    c.moveTo(line['x1'], line['y1'])
    c.lineTo(line['x2'], line['y2'])
    c.stroke()


draw_footprint = (canvas, data) ->
    if canvas.getContext
        context = canvas.getContext('2d')

        # draw background
        context.fillStyle = "rgb(#{color['Bg']['r']}, #{color['Bg']['g']}, #{color['Bg']['b']})"
        context.fillRect(0, 0, canvas.width, canvas.height)

        # set outer boundaries of pretty file
        left = 0
        top = 0
        right = 0
        bottom = 0

        # save all lines in a list to draw them later
        fp_lines = []
        pads = []

        # read pretty file
        prettylines = data.split('\n')
        for l in prettylines
            l = l.trim()

            # regex for fp_line
            rex_line = /\(fp_line\ \(start\ ([-.\d]*)\ ([-.\d]*)\)\ \(end\ ([-.\d]*)\ ([-.\d]*)\)\ \(layer\ ([.a-zA-Z]*)\)\ \(width\ ([-.\d]*)\)\)/g
            while((m = rex_line.exec(l)) != null)
            # TODO: forgot what the next 2 lines do..
                if (m.index == rex_line.lastIndex)
                    rex_line.lastIndex++

                min_x = Math.min(m[1], m[3])
                max_x = Math.max(m[1], m[3])
                min_y = Math.min(m[2], m[4])
                max_y = Math.max(m[2], m[4])
                if min_x < left
                    left = min_x
                if max_x > right
                    right = max_x
                if min_y < bottom
                    bottom = min_y
                if max_y > top
                    top = max_y

                fp_line = {}
                fp_line['x1'] = m[1]
                fp_line['y1'] = m[2]
                fp_line['x2'] = m[3]
                fp_line['y2'] = m[4]
                fp_line['layer'] = m[5]
                fp_line['width'] = m[6]

                fp_lines.push(fp_line)

            rex_pad = /\(pad\ ([\d]*)\ ([_a-z]*)\ ([a-z]*)\ \(at\ ([-.\d]*)\ ([-.\d]*)\)\ \(size\ ([.\d]*)\ ([.\d]*)\)\ \(drill\ ([.\d]*)\)\ \(layers\ ([\w\d\s\.\*]*)\)\)/g
            while((m = rex_pad.exec(l)) != null)
            # TODO: forgot what the next 2 lines do..
                if (m.index == rex_pad.lastIndex)
                    rex_pad.lastIndex++

                pad = {}
                pad['num'] = m[1]
                pad['type'] = m[2]
                pad['shape'] = m[3]
                pad['x'] = m[4]
                pad['y'] = m[5]
                pad['width'] = m[6]
                pad['height'] = m[7]
                pad['drill'] = m[8]
                pad['layers'] = m[9].split(' ')

                pads.push(pad)

        console.log("DEBUG: found #{fp_lines.length} fp_lines")
        console.log("DEBUG: found #{pads.length} pads")

        cw = canvas.width / 2
        ch = canvas.height / 2

        # calculate zoom factor
        maxw = Math.max(Math.abs(left), Math.abs(right))
        maxh = Math.max(Math.abs(top), Math.abs(bottom))
        zoom = Math.min((cw-10)/maxw, (ch-10)/maxh)
        console.log("DEBUG: max dimensions: left=#{left}; right=#{right}; top=#{top}; bottom=#{bottom}")
        console.log("DEBUG: zoom: #{zoom}")

        # draw fp_lines
        for line in fp_lines
            # translate coords
            line['x1'] = line['x1'] * zoom + cw
            line['y1'] = line['y1'] * zoom + ch
            line['x2'] = line['x2'] * zoom + cw
            line['y2'] = line['y2'] * zoom + ch
            line['width'] *= zoom
            draw_line(context, line)

        # draw pads
        for pad in pads
            pad['x'] = pad['x'] * zoom + cw
            pad['y'] = pad['y'] * zoom + ch
            pad['width'] *= zoom
            pad['height'] *= zoom
            pad['drill'] *= zoom

            draw_pad(context, pad)

# look for canvas elements with class kicad and draw them
$ () ->
    $('canvas.kicad').each (i, val) ->
        if $(this).attr('data-kicad-footprint')
            $.get $(this).attr('data-kicad-footprint'), (data) ->
                draw_footprint(val, data)

