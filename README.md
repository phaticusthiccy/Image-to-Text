# Image-to-Text
It converts images too rgba based text. 

### NPM PACKAGE 📦
`npm i @phaticusthiccy/image-to-text`

### Example 🧪
```js
var tti = require('@phaticusthiccy/image-to-text');

var options = {
  fit:    'box',
  width:  200,
  height: 100
}

tti('path/to/image.png', options, function (err, rgba) {
  if (err) throw err;

  console.log(rgba);
});
```

### CLI 💻
```
Getting ready..
```
