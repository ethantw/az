(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _optionJsx = require('./option.jsx');

var _optionJsx2 = _interopRequireDefault(_optionJsx);

{
  (function () {
    var convert2Ruby = function (text) {
      return text;
    };

    var Header = React.createClass({
      displayName: 'Header',

      render: function render() {
        return React.createElement(
          'header',
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
            { href: '//github.com/ethantw/autoruby' },
            'GitHub'
          )
        );
      }
    });

    var IO = React.createClass({
      displayName: 'IO',

      getInitialState: function getInitialState() {
        var text = '認得幾個字？';

        return {
          input: text,
          output: convert2Ruby(text)
        };
      },
      render: function render() {
        return React.createElement(
          'main',
          null,
          React.createElement(
            'textarea',
            null,
            this.state.input
          ),
          React.createElement(
            'button',
            { id: 'play' },
            '播放讀音'
          ),
          React.createElement(
            'h-ruby',
            null,
            this.state.output
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
          React.createElement(Header, null),
          React.createElement(IO, null),
          React.createElement(_optionJsx2['default'], null)
        );
      }
    });

    document.addEventListener('DOMContentLoaded', function () {
      return React.render(React.createElement(Page, null), document.body);
    });
  })();
}

},{"./option.jsx":2}],2:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvWWlqdW4vY29kZS9saWIvcnVieS9zcmMvdmlldy5qc3giLCIvVXNlcnMvWWlqdW4vY29kZS9saWIvcnVieS9zcmMvb3B0aW9uLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7eUJDQ21CLGNBQWM7Ozs7QUFFakM7O1FBRVMsWUFBWSxHQUFyQixVQUF1QixJQUFJLEVBQUc7QUFDNUIsYUFBTyxJQUFJLENBQUE7S0FDWjs7QUFFRCxRQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOzs7QUFDN0IsWUFBTSxFQUFBLGtCQUFHO0FBQ1AsZUFBTzs7O1VBQ0w7Ozs7V0FBbUI7VUFDbkI7O2NBQUcsSUFBSSxFQUFDLGNBQWM7O1dBQU87VUFDN0I7O2NBQUcsSUFBSSxFQUFDLCtCQUErQjs7V0FBVztTQUMzQyxDQUFBO09BQ1Y7S0FDRixDQUFDLENBQUE7O0FBRUYsUUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7O0FBQ3pCLHFCQUFlLEVBQUEsMkJBQUc7QUFDaEIsWUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFBOztBQUVuQixlQUFPO0FBQ0wsZUFBSyxFQUFFLElBQUk7QUFDWCxnQkFBTSxFQUFFLFlBQVksQ0FBRSxJQUFJLENBQUU7U0FDN0IsQ0FBQTtPQUNGO0FBQ0QsWUFBTSxFQUFBLGtCQUFHO0FBQ1AsZUFBTzs7O1VBQ0w7OztZQUFZLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSztXQUFhO1VBQ3pDOztjQUFRLEVBQUUsRUFBQyxNQUFNOztXQUFjO1VBQy9COzs7WUFBVSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU07V0FBVztTQUNqQyxDQUFBO09BQ1I7S0FDRixDQUFDLENBQUE7O0FBRUYsUUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7O0FBQzNCLFlBQU0sRUFBQSxr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QUFDZCxzQkFBTSxFQUFFLE1BQU07QUFDZCxvQkFBSSxFQUFJLE9BQU87ZUFDaEIsQUFBQyxHQUFHO1dBQ0Y7VUFFTDs7O1lBQ0Usb0JBQUMsTUFBTSxJQUFDLElBQUksRUFBQyxTQUFTLEVBQUMsTUFBTSxFQUFFLEVBQUUsT0FBTyxFQUFQLE9BQU8sRUFBRSxBQUFDLEVBQUMsSUFBSSxFQUFFO0FBQ2hELHNCQUFNLEVBQUUsSUFBSTtBQUNaLHNCQUFNLEVBQUUsSUFBSTtlQUNiLEFBQUMsR0FBRztXQUNGO1NBQ0Y7UUFDTCxvQkFBQyxLQUFLLE9BQUU7T0FDRixDQUFBO0tBQ1A7OztTQWhDa0IsTUFBTTtHQUFTLEtBQUssQ0FBQyxTQUFTOztxQkFBOUIsTUFBTTs7QUFtQzNCLE1BQU0sQ0FBQyxZQUFZLEdBQUc7QUFDcEIsUUFBTSxFQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUUsUUFBUSxDQUFFLElBQUssS0FBSztBQUN6QyxRQUFNLEVBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBRSxRQUFRLENBQUUsSUFBSyxRQUFRO0FBQzVDLFNBQU8sRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFFLFNBQVMsQ0FBRSxJQUFJLFFBQVE7Q0FDN0MsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbmltcG9ydCBPcHRpb24gZnJvbSAnLi9vcHRpb24uanN4J1xuXG57XG5cbmZ1bmN0aW9uIGNvbnZlcnQyUnVieSggdGV4dCApIHtcbiAgcmV0dXJuIHRleHRcbn1cblxubGV0IEhlYWRlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiA8aGVhZGVyPlxuICAgICAgPGJ1dHRvbj7oqK3lrpo8L2J1dHRvbj5cbiAgICAgIDxhIGhyZWY9Jy4vYWJvdXQuaHRtbCc+6Kqq5piOPC9hPlxuICAgICAgPGEgaHJlZj0nLy9naXRodWIuY29tL2V0aGFudHcvYXV0b3J1YnknPkdpdEh1YjwvYT5cbiAgICA8L2hlYWRlcj5cbiAgfVxufSlcblxubGV0IElPID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgbGV0IHRleHQgPSAn6KqN5b6X5bm+5YCL5a2X77yfJ1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGlucHV0OiB0ZXh0LFxuICAgICAgb3V0cHV0OiBjb252ZXJ0MlJ1YnkoIHRleHQgKVxuICAgIH1cbiAgfSxcbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiA8bWFpbj5cbiAgICAgIDx0ZXh0YXJlYT57IHRoaXMuc3RhdGUuaW5wdXQgfTwvdGV4dGFyZWE+IFxuICAgICAgPGJ1dHRvbiBpZD0ncGxheSc+5pKt5pS+6K6A6Z+zPC9idXR0b24+XG4gICAgICA8aC1ydWJ5PnsgdGhpcy5zdGF0ZS5vdXRwdXQgfTwvaC1ydWJ5PlxuICAgIDwvbWFpbj5cbiAgfVxufSlcblxubGV0IFBhZ2UgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gPGRpdiBpZD0nYm9keSc+XG4gICAgICA8SGVhZGVyIC8+XG4gICAgICA8SU8gLz5cbiAgICAgIDxPcHRpb24gLz5cbiAgICA8L2Rpdj5cbiAgfVxufSlcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgJ0RPTUNvbnRlbnRMb2FkZWQnLFxuICAoKSA9PiBSZWFjdC5yZW5kZXIoIDxQYWdlIC8+LCBkb2N1bWVudC5ib2R5IClcbilcblxufVxuXG4iLCJcbmNvbnN0IExTID0gd2luZG93LmxvY2FsU3RvcmFnZVxuXG5jbGFzcyBTZWxlY3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG4gICAgc3VwZXIoIHByb3BzIClcbiAgICBjb25zdCBpdGVtID0gcHJvcHMuaXRlbVxuICAgIGNvbnN0IG9wdGlvbiA9IHByb3BzLm9wdGlvblxuICAgIHRoaXMuc3RhdGUgPSB7IG9wdGlvbiwgaXRlbSB9XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgbmFtZSA9IHRoaXMucHJvcHMubmFtZVxuICAgIGNvbnN0IGl0ZW0gPSB0aGlzLnByb3BzLml0ZW1cbiAgICBjb25zdCB2YWwgPSBPYmplY3Qua2V5cyggaXRlbSApXG4gICAgbGV0IHsga2V5LCBzZWxlY3RlZCB9ID0gdGhpcy5zdGF0ZVxuICAgIHNlbGVjdGVkID0gc2VsZWN0ZWQgfHwgdmFsWzBdXG5cbiAgICByZXR1cm4gPGxhYmVsPnsgbmFtZSB9XG4gICAgICA8YnV0dG9uPnsgaXRlbVtzZWxlY3RlZF0gfTwvYnV0dG9uPlxuICAgICAgPHVsIGNsYXNzTmFtZT0nc2VsZWN0JyBoaWRkZW4+XG4gICAgICB7XG4gICAgICAgIHZhbC5tYXAoKCBvcHQgKSA9PiA8bGkga2V5PXtvcHR9PiB7IGl0ZW1bb3B0XSB9IDwvbGk+ICkgXG4gICAgICB9XG4gICAgICA8L3VsPlxuICAgIDwvbGFiZWw+XG4gIH1cbn1cblxubGV0IENsb3NlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIDxidXR0b24+6Zec6ZaJPC9idXR0b24+XG4gIH1cbn0pXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9wdGlvbiBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7IHN5bnRheCwgc3lzdGVtLCBkaXNwbGF5IH0gPSB0aGlzLnByb3BzXG4gICAgcmV0dXJuIDxkaXYgaWQ9J29wdGlvbic+XG4gICAgPENsb3NlLz5cbiAgICA8dWw+XG4gICAgICA8bGk+XG4gICAgICAgIDxTZWxlY3QgbmFtZT0n5Luj56K85qC85byPJyBvcHRpb249e3sgc3ludGF4IH19IGl0ZW09e3tcbiAgICAgICAgICBzaW1wOiAnSFRNTDXvvIjnsKHmmJPvvIknLFxuICAgICAgICAgIHJ0YzogICdIVE1MNe+8iOikh+WQiOW8j++8iScsXG4gICAgICAgICAgaGFuOiAgJ+a8ouWtl+aomea6luagvOW8j++8iOW3sua4suafk++8iSdcbiAgICAgICAgfX0gLz5cbiAgICAgIDwvbGk+XG5cbiAgICAgIDxsaT5cbiAgICAgICAgPFNlbGVjdCBuYW1lPSfmqJnpn7Pns7vntbEnIG9wdGlvbj17eyBzeXN0ZW0gfX0gaXRlbT17e1xuICAgICAgICAgIGJvdGg6ICAgJ+azqOmfs++8jeaLvOmfs+WFseWQjOaomeazqCcsXG4gICAgICAgICAgemh1eWluOiAn5rOo6Z+z56ym6JmfJyxcbiAgICAgICAgICBwaW55aW46ICfmvKLoqp7mi7zpn7MnLFxuICAgICAgICAgIHdhZGU6ICAgJ+WogeWmpeeRquaLvOmfsydcbiAgICAgICAgfX0gLz5cbiAgICAgIDwvbGk+XG5cbiAgICAgIDxsaT5cbiAgICAgICAgPFNlbGVjdCBuYW1lPSflpJrpn7PlrZfpoa/npLrmqJnpn7MnIG9wdGlvbj17eyBkaXNwbGF5IH19IGl0ZW09e3tcbiAgICAgICAgICB6aHV5aW46ICfms6jpn7MnLFxuICAgICAgICAgIHBpbnlpbjogJ+aLvOmfsydcbiAgICAgICAgfX0gLz5cbiAgICAgIDwvbGk+XG4gICAgPC91bD5cbiAgICA8Q2xvc2UvPlxuICAgIDwvZGl2PlxuICB9XG59XG5cbk9wdGlvbi5kZWZhdWx0UHJvcHMgPSB7XG4gIHN5bnRheDogIExTLmdldEl0ZW0oICdzeW50YXgnICkgIHx8ICdydGMnLFxuICBzeXN0ZW06ICBMUy5nZXRJdGVtKCAnc3lzdGVtJyApICB8fCAnemh1eWluJyxcbiAgZGlzcGxheTogTFMuZ2V0SXRlbSggJ2Rpc3BsYXknICkgfHwgJ3podXlpbidcbn1cblxuIl19
