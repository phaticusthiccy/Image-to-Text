#!/usr/bin/env node
'use strict';

var m_opts = {
  boolean: ['color', 'help'],
  alias: {
    'color':   'c',
    'c-ratio': 'r',
    'fit':     'f',
    'height':  't',
    'width':   'w',
    'help':    '?'
  }
}

var argv = require('minimist')(process.argv.slice(2), m_opts);

if (argv.help || argv.h) {
  console.log('');
  console.log('  Usage: tti [options] [path]');
  console.log('');
  console.log('  Options:');
  console.log('');
  console.log('    -c, --color      true for colorized result, false for monochrome result');
  console.log('    -r, --c-ratio    character width-height ratio');
  console.log('    -f, --fit        resize rule: box, height, width, original, none');
  console.log('    -t, --height     height to resize to');
  console.log('    -w, --width      width to resize to');
  console.log('');
  console.log('  See the readme for detailed options and defaults');
  console.log('');
  console.log('  Example:');
  console.log('');
  console.log('    $ tti image.png -c false        $ tti image.png -c true -t 50 -w 50         $ tti image.png -c false -fit original');
  console.log('etc...');
  console.log('');
  process.exit(0);
}

var options = {
  color:   argv['color'],
  c_ratio: argv['c-ratio'],
  fit:     argv['fit'],
  height:  argv['height'],
  width:   argv['width']
}

var errorOutput = function(message) {
  console.log(message);
  process.exit(1);
}

if (!options.fit)    options.fit    = 'box';
if (!options.width)  options.width  = '100%';
if (!options.height) options.height = '100%';

if (!argv._[0])      errorOutput('You must provide an image patch! \nEx: /root/image.png');

require('./index')(argv._[0], options).then(console.log).catch(errorOutput);
