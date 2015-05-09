(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilJs = require('./util.js');

var _utilJs2 = _interopRequireDefault(_utilJs);

var _optionJsx = require('./option.jsx');

var _optionJsx2 = _interopRequireDefault(_optionJsx);

var rcjk = Han.TYPESET.char.cjk;

_utilJs2['default'].XHR('/data/sound.min.json', function (sound) {
  _utilJs2['default'].XHR('/data/reverse.min.json', function (reverse) {

    var Sound = JSON.parse(sound);
    var Reverse = JSON.parse(reverse);

    _utilJs2['default'].annotate = function (input) {
      return _utilJs2['default'].jinzify(input).replace(rcjk, function (zi) {
        var yin = Sound[zi] ? Sound[zi].join('|') : null;
        return yin ? '`' + zi + ':' + yin + '~' : zi;
      });
    };

    var Nav = React.createClass({
      displayName: 'Nav',

      render: function render() {
        return React.createElement(
          'nav',
          null,
          React.createElement(
            'button',
            null,
            '設定'
          ),
          React.createElement(
            'a',
            { href: './about.html' },
            '說明'
          ),
          React.createElement(
            'a',
            { className: 'gh-repo', href: '//github.com/ethantw/az' },
            'GitHub'
          )
        );
      }
    });

    var IO = React.createClass({
      displayName: 'IO',

      getInitialState: function getInitialState() {
        var text = '認得幾個字的部分？';

        return {
          input: text,
          output: _utilJs2['default'].wrap.complex(_utilJs2['default'].annotate(text))
        };
      },

      handleInput: function handleInput(e) {
        var text = e.target.value;

        this.setState({
          input: text,
          output: _utilJs2['default'].wrap.complex(_utilJs2['default'].annotate(text))
        });
      },

      handlePlay: function handlePlay() {},

      render: function render() {
        return React.createElement(
          'main',
          { id: 'io' },
          React.createElement('textarea', { defaultValue: this.state.input, rows: '7', onChange: this.handleInput }),
          React.createElement('blockquote', { dangerouslySetInnerHTML: this.state.output }),
          React.createElement(
            'button',
            { id: 'play', title: '播放讀音', onClick: this.handlePlay },
            '播放讀音'
          )
        );
      }
    });

    var Page = React.createClass({
      displayName: 'Page',

      render: function render() {
        return React.createElement(
          'div',
          { id: 'body' },
          React.createElement(Nav, null),
          React.createElement(IO, null),
          React.createElement(_optionJsx2['default'], null)
        );
      }
    });

    var target = document.getElementById('page') || document.body;
    React.render(React.createElement(Page, null), target);
  });
});

},{"./option.jsx":2,"./util.js":3}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { desc = parent = getter = undefined; _again = false; var object = _x,
    property = _x2,
    receiver = _x3; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var LS = window.localStorage;

var Select = (function (_React$Component) {
  function Select(props) {
    _classCallCheck(this, Select);

    _get(Object.getPrototypeOf(Select.prototype), 'constructor', this).call(this, props);
    var item = props.item;
    var option = props.option;
    this.state = { option: option, item: item };
  }

  _inherits(Select, _React$Component);

  _createClass(Select, [{
    key: 'render',
    value: function render() {
      var name = this.props.name;
      var item = this.props.item;
      var val = Object.keys(item);
      var _state = this.state;
      var key = _state.key;
      var selected = _state.selected;

      selected = selected || val[0];

      return React.createElement(
        'label',
        null,
        name,
        React.createElement(
          'button',
          null,
          item[selected]
        ),
        React.createElement(
          'ul',
          { className: 'select', hidden: true },
          val.map(function (opt) {
            return React.createElement(
              'li',
              { key: opt },
              ' ',
              item[opt],
              ' '
            );
          })
        )
      );
    }
  }]);

  return Select;
})(React.Component);

var Close = React.createClass({
  displayName: 'Close',

  render: function render() {
    return React.createElement(
      'button',
      null,
      '關閉'
    );
  }
});

var Option = (function (_React$Component2) {
  function Option() {
    _classCallCheck(this, Option);

    if (_React$Component2 != null) {
      _React$Component2.apply(this, arguments);
    }
  }

  _inherits(Option, _React$Component2);

  _createClass(Option, [{
    key: 'render',
    value: function render() {
      var _props = this.props;
      var syntax = _props.syntax;
      var system = _props.system;
      var display = _props.display;

      return React.createElement(
        'div',
        { id: 'option' },
        React.createElement(Close, null),
        React.createElement(
          'ul',
          null,
          React.createElement(
            'li',
            null,
            React.createElement(Select, { name: '代碼格式', option: { syntax: syntax }, item: {
                simp: 'HTML5（簡易）',
                rtc: 'HTML5（複合式）',
                han: '漢字標準格式（已渲染）'
              } })
          ),
          React.createElement(
            'li',
            null,
            React.createElement(Select, { name: '標音系統', option: { system: system }, item: {
                both: '注音－拼音共同標注',
                zhuyin: '注音符號',
                pinyin: '漢語拼音',
                wade: '威妥瑪拼音'
              } })
          ),
          React.createElement(
            'li',
            null,
            React.createElement(Select, { name: '多音字顯示標音', option: { display: display }, item: {
                zhuyin: '注音',
                pinyin: '拼音'
              } })
          )
        ),
        React.createElement(Close, null)
      );
    }
  }]);

  return Option;
})(React.Component);

exports['default'] = Option;

Option.defaultProps = {
  syntax: LS.getItem('syntax') || 'rtc',
  system: LS.getItem('system') || 'zhuyin',
  display: LS.getItem('display') || 'zhuyin'
};
module.exports = exports['default'];

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var rcjk = Han.TYPESET.char.cjk;
var ranno = /`([^`:~]*):([^`:~]*)~/gi;

var Util = {
  XHR: function XHR(url, done) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) done(xhr.responseText);
    };
    xhr.open('GET', url, true);
    xhr.send('');
  },

  hanify: function hanify(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    Han(div).renderRuby();
    return { __html: div.innerHTML };
  },

  jinzify: function jinzify(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    Han(div).jinzify();
    return div.innerHTML;
  },

  wrap: {
    simp: function simp(html) {
      html = html.replace(ranno, function (match, zi, yin) {
        var all = yin.split('|');
        var az = all.length > 1 ? 'data-yin=\'' + yin + '\'' : '';

        return '<ruby class=\'zhuyin\'><a-z ' + az + '>' + zi + '<rt>' + all[0] + '</rt></a-z></ruby>';
      }).replace(/<\/ruby><ruby class=\'zhuyin\'>/g, '');
      return Util.hanify(html);
    },

    complex: function complex(html) {
      var rtc = '';
      var rbc = html.replace(ranno, function (match, zi, yin) {
        var all = yin.split('|');
        var az = all.length > 1 ? ' data-yin=\'' + yin + '\'' : '';

        rtc += '<rt>' + all[0] + '</rt>';
        return '<rb ' + az + '>' + zi + '</rb>';
      });
      rtc = '<rtc class=\'zhuyin\'>' + rtc + '</rtc>';
      html = '<ruby class=\'complex\'>' + (rbc + rtc) + '</ruby>';
      return Util.hanify(html);
    } } };

exports['default'] = Util;
module.exports = exports['default'];

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvWWlqdW4vY29kZS9saWIvYXovYXBwL3ZpZXcuanN4IiwiL1VzZXJzL1lpanVuL2NvZGUvbGliL2F6L2FwcC9vcHRpb24uanN4IiwiL1VzZXJzL1lpanVuL2NvZGUvbGliL2F6L2FwcC91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztzQkNDaUIsV0FBVzs7Ozt5QkFDVCxjQUFjOzs7O0FBRWpDLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQTs7QUFFakMsb0JBQUssR0FBRyxDQUFFLHNCQUFzQixFQUFFLFVBQUUsS0FBSyxFQUFNO0FBQy9DLHNCQUFLLEdBQUcsQ0FBRSx3QkFBd0IsRUFBRSxVQUFFLE9BQU8sRUFBTTs7QUFFbkQsUUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBRSxLQUFLLENBQUUsQ0FBQTtBQUNqQyxRQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFFLE9BQU8sQ0FBRSxDQUFBOztBQUVyQyx3QkFBSyxRQUFRLEdBQUcsVUFBRSxLQUFLO2FBQU0sb0JBQUssT0FBTyxDQUFFLEtBQUssQ0FBRSxDQUFDLE9BQU8sQ0FBRSxJQUFJLEVBQUUsVUFBRSxFQUFFLEVBQU07QUFDMUUsWUFBSSxHQUFHLEdBQUcsQUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUssS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUE7QUFDcEQsZUFBTyxHQUFHLFNBQVMsRUFBRSxTQUFNLEdBQUcsU0FBTyxFQUFFLENBQUE7T0FDeEMsQ0FBQztLQUFBLENBQUE7O0FBRUYsUUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7O0FBQzFCLFlBQU0sRUFBQSxrQkFBRztBQUNQ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QTs7QUFFekQsZ0RBQXFDLEVBQUUsU0FBTSxFQUFFLFlBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyx3QkFBcUI7T0FDcEYsQ0FDRixDQUFDLE9BQU8sQ0FBRSxrQ0FBa0MsRUFBRSxFQUFFLENBQUUsQ0FBQTtBQUNuRCxhQUFPLElBQUksQ0FBQyxNQUFNLENBQUUsSUFBSSxDQUFFLENBQUE7S0FDM0I7O0FBRUQsV0FBTyxFQUFBLGlCQUFFLElBQUksRUFBRztBQUNkLFVBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQTtBQUNaLFVBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUUsS0FBSyxFQUFFLFVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQU07QUFDbkQsWUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBRSxHQUFHLENBQUUsQ0FBQTtBQUMxQixZQUFJLEVBQUUsR0FBSSxBQUFFLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxvQkFBb0IsR0FBRyxVQUFPLEVBQUUsQ0FBQTs7QUFFMUQsV0FBRyxhQUFZLEdBQUcsQ0FBQyxDQUFDLENBQUMsVUFBUSxDQUFBO0FBQzdCLHdCQUFlLEVBQUUsU0FBTSxFQUFFLFdBQVE7T0FDbEMsQ0FBQyxDQUFBO0FBQ0YsU0FBRyw4QkFBMkIsR0FBRyxXQUFTLENBQUE7QUFDMUMsVUFBSSxpQ0FBNkIsR0FBRyxHQUFHLEdBQUcsQ0FBQSxZQUFVLENBQUE7QUFDcEQsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFFLElBQUksQ0FBRSxDQUFBO0tBQzNCLEVBQ0YsRUFDRixDQUFBOztxQkFFYyxJQUFJIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxuaW1wb3J0IFV0aWwgZnJvbSAnLi91dGlsLmpzJ1xuaW1wb3J0IE9wdGlvbiBmcm9tICcuL29wdGlvbi5qc3gnXG5cbmNvbnN0IHJjamsgPSBIYW4uVFlQRVNFVC5jaGFyLmNqa1xuXG5VdGlsLlhIUiggJy9kYXRhL3NvdW5kLm1pbi5qc29uJywgKCBzb3VuZCApID0+IHtcblV0aWwuWEhSKCAnL2RhdGEvcmV2ZXJzZS5taW4uanNvbicsICggcmV2ZXJzZSApID0+IHtcblxuY29uc3QgU291bmQgPSBKU09OLnBhcnNlKCBzb3VuZCApXG5jb25zdCBSZXZlcnNlID0gSlNPTi5wYXJzZSggcmV2ZXJzZSApXG5cblV0aWwuYW5ub3RhdGUgPSAoIGlucHV0ICkgPT4gVXRpbC5qaW56aWZ5KCBpbnB1dCApLnJlcGxhY2UoIHJjamssICggemkgKSA9PiB7XG4gIGxldCB5aW4gPSAoIFNvdW5kW3ppXSApID8gU291bmRbemldLmpvaW4oJ3wnKSA6IG51bGxcbiAgcmV0dXJuIHlpbiA/IGBcXGAkeyB6aSB9OiR7IHlpbiB9fmAgOiB6aVxufSlcblxubGV0IE5hdiA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiA8bmF2PlxuICAgICAgPGJ1dHRvbj7oqK3lrpo8L2J1dHRvbj5cbiAgICAgIDxhIGhyZWY9Jy4vYWJvdXQuaHRtbCc+6Kqq5piOPC9hPlxuICAgICAgPGEgY2xhc3NOYW1lPSdnaC1yZXBvJyBocmVmPScvL2dpdGh1Yi5jb20vZXRoYW50dy9heic+R2l0SHViPC9hPlxuICAgIDwvbmF2PlxuICB9XG59KVxuXG5sZXQgSU8gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICBsZXQgdGV4dCA9ICfoqo3lvpflub7lgIvlrZfnmoTpg6jliIbvvJ8nXG5cbiAgICByZXR1cm4ge1xuICAgICAgaW5wdXQ6IHRleHQsXG4gICAgICBvdXRwdXQ6IFV0aWwud3JhcC5jb21wbGV4KFV0aWwuYW5ub3RhdGUoIHRleHQgKSlcbiAgICB9XG4gIH0sXG5cbiAgaGFuZGxlSW5wdXQoIGUgKSB7XG4gICAgY29uc3QgdGV4dCA9IGUudGFyZ2V0LnZhbHVlXG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGlucHV0OiB0ZXh0LFxuICAgICAgb3V0cHV0OiBVdGlsLndyYXAuY29tcGxleChVdGlsLmFubm90YXRlKCB0ZXh0ICkpXG4gICAgfSlcbiAgfSxcblxuICBoYW5kbGVQbGF5KCkge1xuICB9LFxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gPG1haW4gaWQ9J2lvJz5cbiAgICAgIDx0ZXh0YXJlYSBkZWZhdWx0VmFsdWU9e3RoaXMuc3RhdGUuaW5wdXR9IHJvd3M9JzcnIG9uQ2hhbmdlPXt0aGlzLmhhbmRsZUlucHV0fSAvPiBcbiAgICAgIDxibG9ja3F1b3RlIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt0aGlzLnN0YXRlLm91dHB1dH0gLz5cbiAgICAgIDxidXR0b24gaWQ9J3BsYXknIHRpdGxlPSfmkq3mlL7oroDpn7MnIG9uQ2xpY2s9e3RoaXMuaGFuZGxlUGxheX0+5pKt5pS+6K6A6Z+zPC9idXR0b24+XG4gICAgPC9tYWluPlxuICB9XG59KVxuXG5sZXQgUGFnZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiA8ZGl2IGlkPSdib2R5Jz5cbiAgICAgIDxOYXYgLz5cbiAgICAgIDxJTyAvPlxuICAgICAgPE9wdGlvbiAvPlxuICAgIDwvZGl2PlxuICB9XG59KVxuXG5sZXQgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoICdwYWdlJyApIHx8IGRvY3VtZW50LmJvZHlcblJlYWN0LnJlbmRlciggPFBhZ2UgLz4sIHRhcmdldCApXG5cbn0pXG59KVxuXG4iLCJcbmNvbnN0IExTID0gd2luZG93LmxvY2FsU3RvcmFnZVxuXG5jbGFzcyBTZWxlY3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG4gICAgc3VwZXIoIHByb3BzIClcbiAgICBjb25zdCBpdGVtID0gcHJvcHMuaXRlbVxuICAgIGNvbnN0IG9wdGlvbiA9IHByb3BzLm9wdGlvblxuICAgIHRoaXMuc3RhdGUgPSB7IG9wdGlvbiwgaXRlbSB9XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgbmFtZSA9IHRoaXMucHJvcHMubmFtZVxuICAgIGNvbnN0IGl0ZW0gPSB0aGlzLnByb3BzLml0ZW1cbiAgICBjb25zdCB2YWwgPSBPYmplY3Qua2V5cyggaXRlbSApXG4gICAgbGV0IHsga2V5LCBzZWxlY3RlZCB9ID0gdGhpcy5zdGF0ZVxuICAgIHNlbGVjdGVkID0gc2VsZWN0ZWQgfHwgdmFsWzBdXG5cbiAgICByZXR1cm4gPGxhYmVsPnsgbmFtZSB9XG4gICAgICA8YnV0dG9uPnsgaXRlbVtzZWxlY3RlZF0gfTwvYnV0dG9uPlxuICAgICAgPHVsIGNsYXNzTmFtZT0nc2VsZWN0JyBoaWRkZW4+XG4gICAgICB7XG4gICAgICAgIHZhbC5tYXAoKCBvcHQgKSA9PiA8bGkga2V5PXtvcHR9PiB7IGl0ZW1bb3B0XSB9IDwvbGk+ICkgXG4gICAgICB9XG4gICAgICA8L3VsPlxuICAgIDwvbGFiZWw+XG4gIH1cbn1cblxubGV0IENsb3NlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIDxidXR0b24+6Zec6ZaJPC9idXR0b24+XG4gIH1cbn0pXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9wdGlvbiBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7IHN5bnRheCwgc3lzdGVtLCBkaXNwbGF5IH0gPSB0aGlzLnByb3BzXG4gICAgcmV0dXJuIDxkaXYgaWQ9J29wdGlvbic+XG4gICAgPENsb3NlLz5cbiAgICA8dWw+XG4gICAgICA8bGk+XG4gICAgICAgIDxTZWxlY3QgbmFtZT0n5Luj56K85qC85byPJyBvcHRpb249e3sgc3ludGF4IH19IGl0ZW09e3tcbiAgICAgICAgICBzaW1wOiAnSFRNTDXvvIjnsKHmmJPvvIknLFxuICAgICAgICAgIHJ0YzogICdIVE1MNe+8iOikh+WQiOW8j++8iScsXG4gICAgICAgICAgaGFuOiAgJ+a8ouWtl+aomea6luagvOW8j++8iOW3sua4suafk++8iSdcbiAgICAgICAgfX0gLz5cbiAgICAgIDwvbGk+XG5cbiAgICAgIDxsaT5cbiAgICAgICAgPFNlbGVjdCBuYW1lPSfmqJnpn7Pns7vntbEnIG9wdGlvbj17eyBzeXN0ZW0gfX0gaXRlbT17e1xuICAgICAgICAgIGJvdGg6ICAgJ+azqOmfs++8jeaLvOmfs+WFseWQjOaomeazqCcsXG4gICAgICAgICAgemh1eWluOiAn5rOo6Z+z56ym6JmfJyxcbiAgICAgICAgICBwaW55aW46ICfmvKLoqp7mi7zpn7MnLFxuICAgICAgICAgIHdhZGU6ICAgJ+WogeWmpeeRquaLvOmfsydcbiAgICAgICAgfX0gLz5cbiAgICAgIDwvbGk+XG5cbiAgICAgIDxsaT5cbiAgICAgICAgPFNlbGVjdCBuYW1lPSflpJrpn7PlrZfpoa/npLrmqJnpn7MnIG9wdGlvbj17eyBkaXNwbGF5IH19IGl0ZW09e3tcbiAgICAgICAgICB6aHV5aW46ICfms6jpn7MnLFxuICAgICAgICAgIHBpbnlpbjogJ+aLvOmfsydcbiAgICAgICAgfX0gLz5cbiAgICAgIDwvbGk+XG4gICAgPC91bD5cbiAgICA8Q2xvc2UvPlxuICAgIDwvZGl2PlxuICB9XG59XG5cbk9wdGlvbi5kZWZhdWx0UHJvcHMgPSB7XG4gIHN5bnRheDogIExTLmdldEl0ZW0oICdzeW50YXgnICkgIHx8ICdydGMnLFxuICBzeXN0ZW06ICBMUy5nZXRJdGVtKCAnc3lzdGVtJyApICB8fCAnemh1eWluJyxcbiAgZGlzcGxheTogTFMuZ2V0SXRlbSggJ2Rpc3BsYXknICkgfHwgJ3podXlpbidcbn1cblxuIiwiXG5jb25zdCByY2prID0gSGFuLlRZUEVTRVQuY2hhci5jamtcbmNvbnN0IHJhbm5vID0gL2AoW15gOn5dKik6KFteYDp+XSopfi9naVxuXG5sZXQgVXRpbCA9IHtcbiAgWEhSKCB1cmwsIGRvbmUgKSB7XG4gICAgbGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG5cbiAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gKCkgPT4ge1xuICAgICAgaWYgKCB4aHIucmVhZHlTdGF0ZSA9PT0gNCApICBkb25lKCB4aHIucmVzcG9uc2VUZXh0IClcbiAgICB9XG4gICAgeGhyLm9wZW4oICdHRVQnLCB1cmwsIHRydWUgKVxuICAgIHhoci5zZW5kKCAnJyApXG4gIH0sXG5cbiAgaGFuaWZ5KCBodG1sICkge1xuICAgIGxldCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApXG4gICAgZGl2LmlubmVySFRNTCA9IGh0bWxcbiAgICBIYW4oIGRpdiApLnJlbmRlclJ1YnkoKVxuICAgIHJldHVybiB7IF9faHRtbDogZGl2LmlubmVySFRNTCB9XG4gIH0sXG5cbiAgamluemlmeSggaHRtbCApIHtcbiAgICBsZXQgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKVxuICAgIGRpdi5pbm5lckhUTUwgPSBodG1sXG4gICAgSGFuKCBkaXYgKS5qaW56aWZ5KClcbiAgICByZXR1cm4gZGl2LmlubmVySFRNTFxuICB9LFxuXG4gIHdyYXA6IHtcbiAgICBzaW1wKCBodG1sICkge1xuICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZShcbiAgICAgICAgcmFubm8sICggbWF0Y2gsIHppLCB5aW4gKSA9PiB7XG4gICAgICAgICAgbGV0IGFsbCA9IHlpbi5zcGxpdCggJ3wnIClcbiAgICAgICAgICBsZXQgYXogID0gKCBhbGwubGVuZ3RoID4gMSApID8gYGRhdGEteWluPSckeyB5aW4gfSdgIDogJydcblxuICAgICAgICAgIHJldHVybiBgPHJ1YnkgY2xhc3M9J3podXlpbic+PGEteiAkeyBheiB9PiR7IHppIH08cnQ+JHsgYWxsWzBdIH08L3J0PjwvYS16PjwvcnVieT5gXG4gICAgICAgIH1cbiAgICAgICkucmVwbGFjZSggLzxcXC9ydWJ5PjxydWJ5IGNsYXNzPVxcJ3podXlpblxcJz4vZywgJycgKVxuICAgICAgcmV0dXJuIFV0aWwuaGFuaWZ5KCBodG1sIClcbiAgICB9LFxuXG4gICAgY29tcGxleCggaHRtbCApIHtcbiAgICAgIGxldCBydGMgPSAnJ1xuICAgICAgbGV0IHJiYyA9IGh0bWwucmVwbGFjZSggcmFubm8sICggbWF0Y2gsIHppLCB5aW4gKSA9PiB7XG4gICAgICAgIGxldCBhbGwgPSB5aW4uc3BsaXQoICd8JyApXG4gICAgICAgIGxldCBheiAgPSAoIGFsbC5sZW5ndGggPiAxICkgPyBgIGRhdGEteWluPSckeyB5aW4gfSdgIDogJydcblxuICAgICAgICBydGMgKz0gYDxydD4keyBhbGxbMF0gfTwvcnQ+YFxuICAgICAgICByZXR1cm4gYDxyYiAkeyBheiB9PiR7IHppIH08L3JiPmBcbiAgICAgIH0pXG4gICAgICBydGMgPSBgPHJ0YyBjbGFzcz0nemh1eWluJz4keyBydGMgfTwvcnRjPmBcbiAgICAgIGh0bWwgPSBgPHJ1YnkgY2xhc3M9J2NvbXBsZXgnPiR7IHJiYyArIHJ0YyB9PC9ydWJ5PmBcbiAgICAgIHJldHVybiBVdGlsLmhhbmlmeSggaHRtbCApXG4gICAgfSxcbiAgfSxcbn1cblxuZXhwb3J0IGRlZmF1bHQgVXRpbFxuXG4iXX0=
