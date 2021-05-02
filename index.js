'use strict';

var Jimp = require('jimp'),
    Couleurs = require('couleurs'),
    terminalCharWidth = require('terminal-char-width'),
    windowSize = require('window-size');

var chars = ' .,:;i1tfLCG08@',
    num_c = chars.length - 1;

module.exports = function (path, second, third) {
  var opts          = {},
      callback;

  if (typeof second === 'object') {
    opts = second;
    if (typeof third === 'function') {
      callback = third;
    }
  } else if (typeof second === 'function') {
    callback = second;
  }
  if (!callback) {
    return new Promise(function(resolve, reject) {
      tti_core(path, opts, function(err, success) {
        if (err) return reject(err);
        if (success) return resolve(success);
      });
    });
  }
  tti_core(path, opts, callback || console.log);
}

/**
 * The module's core functionality.
 *
 * @param  [string]   path      - The full path to the image to be asciified
 * @param  [Object]   opts      - The options object
 * @param  [Function] callback  - Callback function
 *
 * @returns [void]
 */
var tti_core = function(path, opts, callback) {
  Jimp.read(path, function(err, image) {
    if (err) return callback('Error: ' + err);
    if (opts.width && opts.width.toString().substr(-1) === '%') {
      opts.width = Math.floor((parseInt(opts.width.slice(0, -1)) / 100) * (windowSize.width * terminalCharWidth));
    }
    if (opts.height && opts.height.toString().substr(-1) === '%') {
      opts.height = Math.floor((parseInt(opts.height.slice(0, -1)) / 100) * windowSize.height);
    }
    var options = {
      fit:     opts.fit     ? opts.fit               : 'original',
      width:   opts.width   ? parseInt(opts.width)   : image.bitmap.width,
      height:  opts.height  ? parseInt(opts.height)  : image.bitmap.height,
      c_ratio: opts.c_ratio ? parseInt(opts.c_ratio) : 2,

      color:      opts.color  == false    ? false : true,
      as_string:  opts.format === 'array' ? false : true
    }
    var new_dims = calculate_dims(image, options);
    image.resize(new_dims[0], new_dims[1]);
    var ascii = '';
    if (!options.as_string) ascii = [];
    var norm  = (255 * 4 / num_c);
    var i, j, c;
    for (j = 0; j < image.bitmap.height; j++) {  
      if (!options.as_string) ascii.push([]);
      for (i = 0; i < image.bitmap.width; i++) {    
        for (c = 0; c < options.c_ratio; c++) {   
          var next = chars.charAt(Math.round(intensity(image, i, j) / norm));
          if (options.color) {
            var clr = Jimp.intToRGBA(image.getPixelColor(i, j));
            next = Couleurs.fg(next, clr.r, clr.g, clr.b);
          }
          if (options.as_string)
            ascii += next;
          else
            ascii[j].push(next);
        }
      }
      if (options.as_string && j != image.bitmap.height - 1) ascii += '\n';
    }
    callback(null, ascii);
  });
}

/**
 * Calculates the new dimensions of the image, given the options.
 *
 * @param [Image]  img  - The image (only width and height props needed)
 * @param [Object] opts - The options object
 *
 * @returns [Array] An array of the format [width, height]
 */
var calculate_dims = function (img, opts) {
  switch (opts.fit) {
    case 'width':
      return [opts.width, img.bitmap.height * (opts.width / img.bitmap.width)];
    case 'height':
      return [img.bitmap.width * (opts.height / img.bitmap.height, opts.height)];
    case 'none':
      return [opts.width, opts.height];
    case 'box':
      var w_ratio = img.bitmap.width  / opts.width,
          h_ratio = img.bitmap.height / opts.height,
          neww, newh;
      if (w_ratio > h_ratio) {
          newh = Math.round(img.bitmap.height / w_ratio);
          neww = opts.width;
      } else {
          neww = Math.round(img.bitmap.width / h_ratio);
          newh = opts.height;
      }
      return [neww, newh];
    case 'original':
    default:
      if (opts.fit !== 'original')
        console.error('Invalid option "fit", assuming "original"');
      return [img.bitmap.width, img.bitmap.height];
  }
}

/**
 * Calculates the "intensity" at a point (x, y) in the image, (0, 0) being the
 *   top left corner of the image. Linear combination of rgb_weights with RGB
 *   values at the specified point.
 *
 * @param [Image] i - The image object
 * @param [int]   x - The x coord
 * @param [int]   y - The y coord
 *
 * @returns [int] An int in [0, 1020] representing the intensity of the pixel
 */
var intensity = function (i, x, y) {
  var color = Jimp.intToRGBA(i.getPixelColor(x, y));
  return color.r + color.g + color.b + color.a;
}
