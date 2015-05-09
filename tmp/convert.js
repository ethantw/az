'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function XHR(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) callback(xhr.responseText);
  };
  xhr.open('GET', url, true);
  xhr.send('');
}

function done(input, data) {}

exports['default'] = function (input) {
  XHR('/data/sound.min.json', function (data) {
    return done(input, data);
  });
};

module.exports = exports['default'];