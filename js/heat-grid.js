/*
 * HeatGrid.js
 * Copyright (C) 2011  Andrew E. Bruno <aeb@qnot.org>
 *
 * Gradient functionality ported from Java Heat Map written by Matthew Beckler.
 * See http://www.mbeckler.org/heatMap/
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
var HeatGrid = function() {
    var GRADIENT_MAROON_TO_GOLD = createGradient([160,0,0], [255,255,0], 500);
    var GRADIENT_BLUE_TO_RED = createGradient([0,0,255], [255,0,0], 500);
    var GRADIENT_BLACK_TO_WHITE = createGradient([0,0,0], [255,255,255], 500);
    var GRADIENT_RED_TO_GREEN = createGradient([255,0,0], [0,255,0], 500);
    var GRADIENT_GREEN_YELLOW_ORANGE_RED = createMultiGradient([ [0,255,0], [255,255,0], [255,165,0], [255,0,0] ], 500);
    var GRADIENT_RAINBOW = createMultiGradient([ [181,32,255], [0,0,255], [0,255,0], [255,255,0], [255,165,0], [255,0,0] ], 500);
    var GRADIENT_HOT = createMultiGradient([ [0,0,0], [87,0,0], [255,0,0], [255,165,0], [255,255,0], [255,255,255] ], 500);
    var GRADIENT_HEAT = createMultiGradient([ [0,0,0], [105,0,0], [192,23,0], [255,150,38],[255,255,255] ], 500);
    var GRADIENT_ROY = createMultiGradient([ [255,0,0], [255,165,0], [255,255,0] ], 500);

    /**
     * Draws a heatmap on the given canvas element. Example usage:
     *
     *   HeatGrid.draw('grid', data, {
     *       gradient: HeatGrid.GRADIENT_HEAT,
     *       rows: 40,
     *       cols: 35,
     *       swidth: 10,
     *       sheight: 10,
     *   });
     * 
     * @param canvas element (can be id string '#id' or element)
     * @param array of data (values should be normalized between 0 < data[i] < 1
     * @param o (options)
     *        o.gradient = The gradient to use (example: HeatGrid.GRADIENT_HEAT)
     *        o.rows = # rows in the grid
     *        o.cols = # columns in the grid
     *        o.swidth = width (in pixels) of each square of the grid
     *        o.sheight = height (in pixels) of each square of the grid
     * 
     */
    function draw(cv, data, o) {
        if(!(Object.prototype.toString.call(data) === '[object Array]')) {
            throw new Error('data must be an array');
        }
        var size = o.rows * o.cols;
        var canvas = cv;
        if(typeof cv == 'string') {
            canvas = document.getElementById(cv);
        }

        if(!canvas.getContext) {
            throw new Error('must provide a canvas element to draw on');
        }

        if(data.length != size ) {
            throw new Error('rows * cols must be equal to the size of your data array');
        }

        var gradient = GRADIENT_HEAT;
        if(o.gradient) {
            gradient = o.gradient;
        }

        var width = o.cols * o.swidth;
        var height = o.rows * o.sheight;
        canvas.width = width;
        canvas.height = height;

        var ctx = canvas.getContext('2d');
        var image = ctx.createImageData(width,height);
        var imageData = image.data;

        var row = 0;
        var col = 0;
        for(var x = 1; x <= size; x++) {
            // XXX must be: 0 < point < 1
            var point = data[x-1];

            var colorIndex = Math.floor(point * (gradient.length - 1));
            var color = gradient[colorIndex];

            for(var i = 0; i < o.sheight; i++) {
                var r = row+i;
                for(var j = 0; j < o.swidth; j++) {
                    var c = col+j;
                    imageData[((r*(image.width*4)) + (c*4)) + 0] = color[0];
                    imageData[((r*(image.width*4)) + (c*4)) + 1] = color[1];
                    imageData[((r*(image.width*4)) + (c*4)) + 2] = color[2];
                    imageData[((r*(image.width*4)) + (c*4)) + 3] = 255;
                } 
            } 
            col += o.swidth;

            if((x % o.cols) == 0) {
                row += o.sheight;
                col = 0;
            }
        }

        image.data = imageData;
        ctx.putImageData(image, 0, 0);
    }

    // This function is a port of Java Heat Map
    // Written by Matthew Beckler: http://www.mbeckler.org/heatMap/
    /**
     * Creates an array of colors for use as a gradient, using a linear 
     * interpolation between the two specified colors. Colors are in the form
     * of an array with 3 integers [r,g,b]
     * 
     * @param one color used for the bottom of the gradient
     * @param two color used for the top of the gradient
     * @param numSteps The number of steps in the gradient. 250 is a good number.
     */
    function createGradient(one, two, numSteps) {
        var r1 = one[0];
        var g1 = one[1];
        var b1 = one[2];

        var r2 = two[0];
        var g2 = two[1];
        var b2 = two[2];

        var newR = 0;
        var newG = 0;
        var newB = 0;

        var gradient = new Array(numSteps);
        var iNorm;
        for(var i = 0; i < numSteps; i++) {
            gradient[i] = new Array(3);
            iNorm = i / numSteps; //a normalized [0:1] variable
            gradient[i][0] = (r1 + iNorm * (r2 - r1));
            gradient[i][1] = (g1 + iNorm * (g2 - g1));
            gradient[i][2] = (b1 + iNorm * (b2 - b1));
        }

        return gradient;
    }

    // This function is a port of Java Heat Map
    // Written by Matthew Beckler: http://www.mbeckler.org/heatMap/
    /**
     * Creates an array of colors for use as a gradient, using an array
     * of colors. It uses a linear interpolation between each pair of
     * points. Colors are in the form of an array with 3 integers [r,g,b]
     *
     * @param colors An array of colors used for the gradient. The color at index 0 will be the lowest color.
     * @param numSteps The number of steps in the gradient. 250 is a good number.
     */
    function createMultiGradient(colors, numSteps) {
        //we assume a linear gradient, with equal spacing between colors
        //The final gradient will be made up of n 'sections', where n = colors.length - 1
        var numSections = colors.length - 1;
        var gradientIndex = 0; //points to the next open spot in the final gradient
        var gradient = new Array(numSteps);
        var temp;

        if(numSections <= 0) {
            throw new Error("You must pass in at least 2 colors in the array!");
        }

        for(var section = 0; section < numSections; section++) {
            //we divide the gradient into (n - 1) sections, and do a regular gradient for each
            temp = createGradient(colors[section], colors[section+1], Math.round(numSteps / numSections));
            for(var i = 0; i < temp.length; i++) {
                //copy the sub-gradient into the overall gradient
                gradient[gradientIndex++] = temp[i];
            }
        }

        if(gradientIndex < numSteps) {
            //The rounding didn't work out in our favor, and there is at least
            // one unfilled slot in the gradient[] array.
            //We can just copy the final color there
            for(/* nothing to initialize */; gradientIndex < numSteps; gradientIndex++) {
                gradient[gradientIndex] = colors[colors.length - 1];
            }
        }

        return gradient;
    }

    // Revealing Module Pattern... public variables and methods
    return {
        // Constant gradients 
        GRADIENT_MAROON_TO_GOLD: GRADIENT_MAROON_TO_GOLD,
        GRADIENT_BLUE_TO_RED: GRADIENT_BLUE_TO_RED,
        GRADIENT_BLACK_TO_WHITE: GRADIENT_BLACK_TO_WHITE,
        GRADIENT_RED_TO_GREEN: GRADIENT_RED_TO_GREEN,
        GRADIENT_GREEN_YELLOW_ORANGE_RED: GRADIENT_GREEN_YELLOW_ORANGE_RED,
        GRADIENT_RAINBOW: GRADIENT_RAINBOW,
        GRADIENT_HOT: GRADIENT_HOT,
        GRADIENT_HEAT: GRADIENT_HEAT,
        GRADIENT_ROY: GRADIENT_ROY,

        // public methods
        draw: draw,
        createGradient: createGradient,
        createMultiGradient: createMultiGradient
    }
}();
