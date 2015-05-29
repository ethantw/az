(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reg = require('./reg');

var _simp = require('./simp');

var _simp2 = _interopRequireDefault(_simp);

var _util = require('./util');

var _util2 = _interopRequireDefault(_util);

var _viewJsx = require('./view.jsx');

var _viewJsx2 = _interopRequireDefault(_viewJsx);

var KEY = {
  '74': 'j',
  '75': 'k',
  '72': 'h',
  '76': 'l' };

function isPicking(elem) {
  return elem instanceof Element ? elem.classList.contains('picking') : false;
}

function pick(elem, idx) {
  try {
    elem.click();
    if (idx) document.querySelector('a-z[i=\'' + idx + '\']').classList.add('picking');
  } catch (e) {}
}

document.addEventListener('keydown', function (e) {
  if (e.target.matches('#input')) return;
  if (49 > e.which || e.which > 57 && !Object.keys(KEY).find(function (key) {
    return parseInt(key) === e.which;
  })) return;

  var $io = document.getElementById('io');
  var picking = isPicking($io);
  var $az = Array.from(document.querySelectorAll('a-z'));
  var $current = $az.find(isPicking);
  var idx = $current ? parseInt($current.getAttribute('i')) : -1;

  var $pickr = document.getElementById('pickr');
  var $yin = $pickr.querySelector('li.current');
  var isPickrOn = !!$pickr.offsetParent;

  switch (KEY[e.which]) {
    // Pick Zi (heteronym)
    case 'j':
      try {
        pick($az[idx + 1].querySelector('rb, ruby, h-ruby'));
      } catch (e) {}
      break;
    case 'k':
      try {
        pick($az[idx - 1].querySelector('rb, ruby, h-ruby'));
      } catch (e) {}
      break;
    // Pick Yin
    case 'h':
      try {
        if (isPickrOn) pick($yin.previousSibling, idx);
      } catch (e) {}
      break;
    case 'l':
      try {
        if (isPickrOn) pick($yin.nextSibling, idx);
      } catch (e) {}
      break;
    // Pick Yin via ordered numbers
    default:
      if (!isPickrOn) return;
      try {
        var nth = e.which - 49 + 1;
        pick($pickr.querySelector('li:nth-child(' + nth + ')') || $pickr.querySelector('li:last-child'), idx);
      } catch (e) {}
  }
});

_util2['default'].XHR(['./data/sound.min.json', './data/pinyin.min.json'], function (Sound, Romanization) {
  var Pinyin = Romanization.Pinyin;
  var WG = Romanization.WG;

  var Vowel = {
    a: ['a', 'ā', 'á', 'ǎ', 'à'],
    e: ['e', 'ē', 'é', 'ě', 'è'],
    i: ['i', 'ī', 'í', 'ǐ', 'ì'],
    o: ['o', 'ō', 'ó', 'ǒ', 'ò'],
    u: ['u', 'ū', 'ú', 'ǔ', 'ù'],
    'ü': ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ'],
    wg: ['⁰', '¹', '²', '³', '⁴']
  };

  var remark = typeof Remarkable !== 'undefined' ? new Remarkable('commonmark') : undefined;
  var md = remark ? remark : { render: function render(raw) {
      return raw;
    } };

  Object.assign(_util2['default'], {
    annotate: function annotate(input) {
      var pickee = arguments[1] === undefined ? [] : arguments[1];
      var doesAvoidMatching = arguments[2] === undefined ? false : arguments[2];

      var system = _util2['default'].LS.get('system');
      var jinze = _util2['default'].LS.get('jinze') !== 'no' ? true : false;
      var az = [];
      var raw = md.render(input);
      var hinst = _util2['default'].hinst(raw, jinze);

      hinst.avoid('pre, code').replace(_reg.cjk, function (portion, match) {
        var zi = match[0];
        var sound = Sound[zi];

        // Simplified/variant Hanzi support
        if (!sound) {
          var idx = _simp2['default'].indexOf(zi);
          var trad = (idx + 1) % 2 ? _simp2['default'][idx + 1] : zi;
          sound = Sound[trad];
          if (!sound) return zi;
        }

        var isHeter = sound.length > 1;
        var isPicked = false;
        var ret = sound[0];
        var end = '';

        if (isHeter) {
          var i = az.length;
          var picked = pickee[i] || 0;
          var doesMatch = picked && picked.zi === zi;

          az.push(sound);
          if (picked && !doesMatch && !doesAvoidMatching) {
            pickee = [];
          } else if (doesMatch) {
            isPicked = true;
            ret = typeof picked.yin === 'number' ? sound[picked.yin] : picked.yin;
          } else if (doesAvoidMatching) {
            var deci = parseInt(picked, 16);
            ret = sound[deci];
            pickee[i] = { zi: zi, yin: deci };
          }
        }

        if (system === 'pinyin') {
          ret = _util2['default'].getPinyin(ret);
        } else if (system === 'wg') {
          ret = _util2['default'].getWG(ret);
        } else if (system === 'both') {
          ret = _util2['default'].getBoth(ret);
        }

        end += isHeter ? '*' : '';
        end += isPicked ? '*' : '';

        return '`' + zi + ':' + (ret + end) + '~';
      });
      raw = hinst.context.innerHTML;
      return { az: az, raw: raw, pickee: pickee };
    },

    getPinyin: function getPinyin(sound) {
      var _Util$getYD = _util2['default'].getYD(sound, true);

      var yin = _Util$getYD.yin;
      var diao = _Util$getYD.diao;

      var pinyin = Pinyin[yin] || sound;
      pinyin = pinyin.replace(/([aeiouü])+/i, function (v) {
        if (/[aeo]/i.test(v)) {
          return v.replace(/([aeo])/i, function (v) {
            return Vowel[v][diao];
          });
        } else if (/iu/i.test(v)) {
          return v.replace(/u/i, Vowel.u[diao]);
        } else if (/[iuü]/i.test(v)) {
          return v.replace(/([iuü])/i, function (v) {
            return Vowel[v][diao];
          });
        }
        return v;
      });
      return pinyin || sound;
    },

    getWG: function getWG(sound) {
      var _Util$getYD2 = _util2['default'].getYD(sound, true);

      var yin = _Util$getYD2.yin;
      var diao = _Util$getYD2.diao;

      var pinyin = Pinyin[yin] || sound;
      return (WG[pinyin] || pinyin) + Vowel.wg[diao];
    },

    getBoth: function getBoth(sound) {
      var pinyin = _util2['default'].getPinyin(sound);
      return '' + sound + '|' + pinyin;
    },

    speak: function speak(text) {
      if (!window.SpeechSynthesisUtterance) return alert(text);
      var utter = new window.SpeechSynthesisUtterance(text);
      utter.lang = 'zh-TW';
      window.speechSynthesis.speak(utter);
      console.log(text);
    } });

  var view = React.createElement(_viewJsx2['default'](_util2['default']));
  var target = document.getElementById('page') || document.body;
  React.render(view, target);
});

},{"./reg":3,"./simp":4,"./util":5,"./view.jsx":6}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { desc = parent = getter = undefined; _again = false; var object = _x,
    property = _x2,
    receiver = _x3; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _util = require('./util');

var _util2 = _interopRequireDefault(_util);

var Close = (function (_React$Component) {
  function Close(props) {
    _classCallCheck(this, Close);

    _get(Object.getPrototypeOf(Close.prototype), 'constructor', this).call(this, props);
    this.closePref = this.closePref.bind(this);
  }

  _inherits(Close, _React$Component);

  _createClass(Close, [{
    key: 'closePref',
    value: function closePref() {
      this.props.parent.toggleUI('pref');
    }
  }, {
    key: 'render',
    value: function render() {
      return React.createElement(
        'button',
        { className: 'close', onClick: this.closePref },
        '關閉'
      );
    }
  }]);

  return Close;
})(React.Component);

var Select = (function (_React$Component2) {
  function Select(props) {
    _classCallCheck(this, Select);

    _get(Object.getPrototypeOf(Select.prototype), 'constructor', this).call(this, props);

    var item = props.item;
    var pref = props.pref;
    var selected = props.val;
    this.state = { pref: pref, item: item, selected: selected };

    this.node = this.node.bind(this);
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
  }

  _inherits(Select, _React$Component2);

  _createClass(Select, [{
    key: 'node',
    value: function node() {
      var node = React.findDOMNode(this.refs.select);
      var clazz = node.classList;
      return { node: node, clazz: clazz };
    }
  }, {
    key: 'open',
    value: function open() {
      this.node().clazz.add('open');
    }
  }, {
    key: 'close',
    value: function close() {
      this.node().clazz.remove('open');
    }
  }, {
    key: 'handleToggle',
    value: function handleToggle() {
      var _node = this.node();

      var clazz = _node.clazz;

      var isntOpen = !clazz.contains('open');
      var remover = function remover() {};

      if (isntOpen) {
        this.open();
        remover = _util2['default'].listenToLosingFocus('label.open ul *', this.close);
      } else {
        this.close();
        remover();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var id = this.props.id;
      var name = this.props.name;
      var item = this.props.item;
      var key = Object.keys(item);
      var selected = this.state.selected || key[0];

      return React.createElement(
        'label',
        { ref: 'select' },
        name,
        React.createElement(
          'button',
          { onClick: this.handleToggle },
          item[selected]
        ),
        React.createElement(
          'ul',
          { className: 'select' },
          key.map(function (key) {
            return React.createElement(
              'li',
              {
                className: selected === key ? 'selected' : '',
                onClick: function () {
                  _util2['default'].LS.set(id, key);
                  _this2.props.io.setPref();
                  _this2.setState({ selected: key });
                } },
              item[key]
            );
          })
        )
      );
    }
  }]);

  return Select;
})(React.Component);

var Pref = (function (_React$Component3) {
  function Pref(props) {
    _classCallCheck(this, Pref);

    _get(Object.getPrototypeOf(Pref.prototype), 'constructor', this).call(this, props);
    this.state = {
      pref: {
        syntax: _util2['default'].LS.get('syntax') || 'han',
        system: _util2['default'].LS.get('system') || 'zhuyin',
        display: _util2['default'].LS.get('display') || 'zhuyin',
        jinze: _util2['default'].LS.get('jinze') || 'yes' } };
  }

  _inherits(Pref, _React$Component3);

  _createClass(Pref, [{
    key: 'render',
    value: function render() {
      var io = this.props.io;
      var _state$pref = this.state.pref;
      var syntax = _state$pref.syntax;
      var system = _state$pref.system;
      var display = _state$pref.display;
      var jinze = _state$pref.jinze;

      return React.createElement(
        'div',
        { id: 'pref', className: 'layout' },
        React.createElement(Close, { parent: this.props.parent }),
        React.createElement(
          'ul',
          null,
          React.createElement(
            'li',
            null,
            React.createElement(Select, { io: io, name: '代碼生成格式', id: 'syntax', val: syntax, item: {
                simp: 'HTML5（簡易）',
                rtc: 'HTML5（複合式）',
                han: '漢字標準格式（已渲染）'
              } })
          ),
          React.createElement(
            'li',
            null,
            React.createElement(Select, { io: io, name: '標音系統', id: 'system', val: system, item: {
                both: '注音－拼音共同標注',
                zhuyin: '注音符號',
                pinyin: '漢語拼音',
                wg: '威妥瑪拼音'
              } })
          ),
          React.createElement(
            'li',
            null,
            React.createElement(Select, { io: io, name: '選擇發音時的標音系統', id: 'display', val: display, item: {
                zhuyin: '注音',
                pinyin: '拼音'
              } })
          ),
          React.createElement(
            'li',
            null,
            React.createElement(Select, { io: io, name: '標點禁則渲染', id: 'jinze', val: jinze, item: {
                yes: '啓用',
                no: '關閉'
              } })
          )
        ),
        React.createElement(Close, { parent: this.props.parent })
      );
    }
  }]);

  return Pref;
})(React.Component);

exports['default'] = Pref;
module.exports = exports['default'];

},{"./util":5}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = {
  cjk: Han.TYPESET.char.cjk,
  zhuyin: Han.TYPESET.zhuyin,
  anno: /`([^`:~]*):([^`:~]*)~/gi,
  heter: /\*$/,
  picked: /\*\*$/,
  both: /\|/ };
module.exports = exports["default"];

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = '与與丒囟专專丗卅业業丛叢东東丝絲両兩丢丟两兩严嚴丧喪个個丬爿丯丰临臨丶⼂为為丽麗举舉义義乌烏乐樂乔喬习習乡鄉书書买買乱亂亀龜亁乾争爭亏虧亘亙亚亞产產亩畝亲親亵褻亸嚲亻人亿億仅僅从從仑崙仓倉仪儀们們仮假众眾会會伛傴伞傘伟偉传傳伤傷伥倀伦倫伧傖伪偽伫佇体體佥僉侠俠侣侶侥僥侦偵侧側侨僑侩儈侪儕侬儂俣俁俦儔俨儼俩倆俪儷俭儉债債倾傾偬傯偻僂偾僨偿償傥儻傧儐储儲傩儺兎兔兑兌兖兗兪俞兰蘭关關兴興兹茲养養兽獸兾糞兿藝冁囅内內円丹冈岡册冊写寫军軍农農冝宜冦寇冧霖冨富冩寫冮江冯馮冲沖决決况況冸泮冺泯冻凍冿津净淨凁涑凂浼凃涂凄淒凉涼减減凑湊凒溰凓溧凕溟凖準凙澤凛凜凟瀆凤鳳凥尻処處凨云凫鳧凬凰凭憑凮鳳凯凱凴憑击擊凼窞凾亟凿鑿刄刃刅刃刋刊刍芻刘劉则則刚剛创創删刪刦劫刧劫别別刭剄刴剁刹剎刼劫刽劊刿劌剀剴剂劑剐剮剑劍剥剝剧劇剰剩劎劍劒劍劔劍劝勸办辦务務劢勱动動励勵劲勁劳勞労勞劵卷効效劽裂势勢勅敕勋勛勐猛勚勩勠戮勥強勧勸匀勻匦匭匮匱区區医醫华華协協单單卖賣単單卙斟卛攣卟嚇卢盧卤鹵卥囟卧臥卫衛却卻卺巹厅廳历歷厉厲压壓厌厭厕廁厛廳厠廁厢廂厣厴厦廈厨廚厩廄厮廝厰廠厳嚴厶⼛县縣叁參叄參叆靉叇靆双雙収收叏發叐發发發变變叙敘叠疊叧另叶葉号號叹嘆叽嘰吓嚇吕呂吖嗄吗嗎吣唚吨噸启啟吴吳吿告呋咐呐吶呑吞呒嘸呓囈呕嘔呖嚦呗唄员員呙咼呛嗆呜嗚呪咒咏詠咙嚨咛嚀咝吱咣光咤吒哌呱响響哐匡哑啞哒噠哓嘵哔嗶哕噦哗嘩哙噲哜嚌哝噥哟喲唝嗊唠嘮唡啢唢嗩唣嗦唤喚唿呼啉咻啧嘖啬嗇啭囀啰囉啴嘽啸嘯喷噴喹奎喽嘍喾嚳嗪唚嗫囁嗬呵嗳噯嗵通嘘噓嘞咧嘠嘎嘣迸嘤嚶嘨嘯嘭膨嘱囑嘷嚎噜嚕噻塞噼劈嚔涕嚢囊嚣囂嚯謔团團园園囱囪围圍囵圇国國图圖圆圓圣聖圹壙场場块塊坚堅坛壇坜壢坝壩坞塢坟墳坠墜垄壟垅壟垆壚垒壘垦墾垧坰垩堊垫墊垲塏垴瑙埘塒埚堝堑塹堕墮塡填塬原墙牆壮壯声聲壳殼壶壺壸壼夂⼢处處备備夊⼢够夠头頭夹夾夺奪奁奩奂奐奋奮奖獎奥奧妆妝妇婦妈媽妩嫵妪嫗妫媯姗姍姹奼娄婁娅婭娆嬈娇嬌娈孌娱娛娲媧娴嫻婳嫿婴嬰婵嬋婶嬸媪媼嫒嬡嫔嬪嫱嬙嬷嬤孙孫学學孪孿孶孳宝寶实實宠寵审審宪憲宫宮宽寬宾賓寝寢对對寻尋导導対對寿壽専專尅剋将將尓爾尔爾尘塵尝嘗尧堯尴尷尽盡层層屃屭屉屜届屆屛屏属屬屡屢屦屨屿嶼岁歲岂豈岖嶇岗崗岘峴岙嶴岚嵐岛島岭嶺岿巋峄嶧峡峽峣嶢峤嶠峥崢峦巒峯峰崂嶗崃崍崄嶮崭嶄崾要嵘嶸嵚嶔嵝嶁巄巃巅巔巌巖巓巔巩鞏币幣帅帥师師帏幃帐帳帜幟带帶帧幀帮幫帯帶帱幬帻幘帼幗幂冪幇幫幚幫幞襆幷并广廣庁廳広麼庄莊庅麼庆慶庐廬庑廡库庫应應庙廟庞龐废廢庼廎廏廄廐廄廪廩廴⼵廵巡开開异異弃棄弑弒张張弥彌弯彎弹彈强強归歸当當录錄彚彙彛羿彜羿彟獲彠獲彡⼺彦彥彻徹径徑徕徠徸德忄心忆憶忏懺忧憂忾愾怀懷态態怂慫怃憮怅悵怆愴怜憐总總怼懟怿懌恋戀恒恆恳懇恶惡恸慟恹懨恺愷恻惻恼惱恽惲悦悅悫愨悬懸悭慳悯憫惊驚惧懼惨慘惩懲惫憊惬愜惭慚惮憚惯慣惽惛愠慍愤憤愦憒慑懾慭憖憷楚懑懣懒懶懔懍懴懺戅戇戆戇戋戔戏戲戗戧战戰戝敗戦戰戬戩戯戲戱戲户戶戸戶扌手执執扩擴扪捫扫掃扬揚扰擾抅拘抚撫抛拋抟摶抠摳抡掄抢搶护護报報担擔拟擬拢攏拣揀拥擁拦攔拧擰拨撥择擇挚摯挛攣挜掗挝撾挞撻挟挾挠撓挡擋挢撟挣掙挤擠挥揮挦撏捞撈损損捡撿换換捣搗掳擄掴摑掷擲掸撣掺摻掼摜揸喳揽攬揿撳搀攙搁擱搂摟搃摠搅攪携攜摄攝摅攄摆擺摇搖摈擯摊攤撃擊撄攖撑撐撪攆撵攆撷擷撹攪撺攛擕攜擞擻擡抬擥掔擧舉擪壓攒攢攵又敇敕敌敵敛斂敮歃数數斉齊斋齋斎齋斓斕斩斬断斷旧舊时時旷曠旸暘昙曇昼晝昽曨显顯晋晉晓曉晔曄晕暈晖暉暂暫暧曖术術杀殺杂雜权權条條来來杨楊极極枞樅枢樞枣棗枥櫪枧見枨棖枪槍枫楓枭梟柠檸柽檉栀梔栅柵标標栈棧栉櫛栊櫳栋棟栌櫨栎櫟栏欄树樹样樣栾欒桊棬桠椏桡橈桢楨档檔桤榿桥橋桦樺桧檜桨槳桩樁梦夢梼檮梾棶检檢棂欞椁槨椟櫝椠槧椭橢楼樓楽樂榄欖榇櫬榈櫚榉櫸榘矩槚檟槛檻槟檳槠櫧横橫樯檣樱櫻橥櫫橱櫥橹櫓橼櫞檪櫟檫察欢歡欤歟欧歐歳歲歴曆歺歲歼殲殁歿殇殤残殘殒殞殓殮殚殫殡殯殱殲殴毆毁毀毂轂毕畢毙斃毡氈毵毿毶鞠気氣氢氫氩氬氲氳氵水氽汆汇匯汉漢污汙汤湯汹洶沟溝没沒沣灃沤漚沥瀝沦淪沧滄沨渢沩溈沪滬沵濔泞濘泪淚泶澩泷瀧泸瀘泺濼泻瀉泼潑泽澤泾涇洁潔浃浹浅淺浆漿浇澆浈湞浊濁测測浍澮济濟浏瀏浐滻浑渾浒滸浓濃浔潯浕濜浜濱涙淚涛濤涝澇涞淶涟漣涡渦涣渙涤滌润潤涧澗涨漲涩澀淀澱渊淵渌淥渍漬渎瀆渐漸渑澠渔漁渖瀋渗滲温溫湼涅湾灣湿濕溃潰溅濺溆漵溇漊滙匯滚滾滝瀧滞滯滟灩滠灄满滿滢瀅滤濾滥濫滦灤滨濱滩灘滪澦漑溉潆瀠潇瀟潋瀲潍濰潜潛潴瀦澜瀾濑瀨濒瀕灎灩灏灝灔灩灜瀛灧灩灬火灭滅灯燈灵靈灾災灿燦炀煬炉爐炖燉炜煒炝熗点點炼煉炽熾烁爍烂爛烃烴烛燭烟煙烦煩烧燒烨燁烩燴烫燙烬燼热熱焕煥焖燜焘燾煅煆煳糊煺退熘溜爱愛爲為爷爺牍牘牜牛牦犛牵牽牺犧犊犢犟強犭犬状狀犷獷犸馬犹猶狈狽狍包狝獮狞獰独獨狭狹狮獅狯獪狰猙狱獄狲猻猃獫猎獵猕獼猡玀猪豬猫貓猬蝟献獻獭獺玑璣玙璵玚瑒玛瑪玮瑋环環现現玱瑲玺璽珏玨珐琺珑瓏珰璫珱瓔珲琿琏璉琐瑣琼瓊瑶瑤瑷璦璎瓔瓒瓚瓯甌産產电電画畫畅暢畲畬畳疊畴疇畵畫疎疏疖癤疗療疟瘧疠癘疡瘍疬癆疮瘡疯瘋疴痾痈癰痉痙痖啞痨癆痩瘦痪瘓痫癇痬瘍瘅癉瘆疹瘗瘞瘘瘺瘪癟瘫癱瘾癮瘿癭癀廣癍斑癎癇癞癩癣癬癫癲発發皑皚皱皺皲皸盏盞盐鹽监監盖蓋盗盜盘盤県縣眍區眞真眦眥眬矓着著睁睜睐睞睑瞼瞒瞞瞩矚矤病矫矯矶磯矾礬矿礦砀碭码碼砖磚砗硨砚硯砜風砺礪砻礱砾礫础礎硁硜硕碩硖硤硗磽硙磑硚礄硷鹼碍礙碛磧碜磣碱鹼碹宣磙袞礻示礼禮祎禕祢禰祯禎祷禱祸禍禀稟禄祿禅禪离離秃禿秆稈积積称稱秽穢秾穠税稅稣穌稳穩穑穡穷窮窃竊窍竅窑窯窜竄窝窩窥窺窦竇窭窶竖豎竜龍竞競笃篤笋筍笔筆笕筧笺箋笼籠笾籩筚篳筛篩筜簹筝箏筹籌签簽简簡箓籙箢宛箦簀箧篋箨籜箩籮箪簞箫簫篑簣篓簍篮籃篱籬簖籪籁籟籴糴类類籼秈粜糶粝糲粤粵粪糞粮糧糁糝糇餱糹糸紧緊絵繪絶絕絷縶綘健継繼続續緜綿縂總縄繩繋繫繍繡纟糸纠糾纡紆红紅纣紂纤纖纥紇约約级級纨紈纩纊纪紀纫紉纬緯纭紜纮紘纯純纰紕纱紗纲綱纳納纴紝纵縱纶綸纷紛纸紙纹紋纺紡纻紵纼紖纽紐纾紓线線绀紺绁紲绂紱练練组組绅紳细細织織终終绉縐绊絆绋紼绌絀绍紹绎繹经經绐紿绑綁绒絨结結绔褲绕繞绖絰绗絎绘繪给給绚絢绛絳络絡绝絕绞絞统統绠綆绡綃绢絹绣繡绤綌绥綏绦絛继繼绨綈绩績绪緒绫綾续續绮綺绯緋绰綽绱鞜绲緄绳繩维維绵綿绶綬绷繃绸綢绹綯绺綹绻綣综綜绽綻绾綰绿綠缀綴缁緇缂緙缃緗缄緘缅緬缆纜缇緹缈緲缉緝缊縕缋繢缌緦缍綞缎緞缏緶缐線缑緱缒縋缓緩缔締缕縷编編缗緡缘緣缙縉缚縛缛縟缜縝缝縫缞縗缟縞缠纏缡縭缢縊缣縑缤繽缥縹缦縵缧縲缨纓缩縮缪繆缫繅缬纈缭繚缮繕缯繒缰韁缱繾缲繰缳繯缴繳缵纘罂罌罗羅罚罰罢罷罴羆羁羈羗羌羟羥羡羨羣群羮羹翘翹翙翽翚翬耢勞耥尚耧耬耸聳耻恥聂聶聋聾职職聍聹联聯聩聵聪聰肀聿肃肅肠腸肤膚肷欠肾腎肿腫胀脹胁脅胆膽胧朧胨東胪臚胫脛胶膠脉脈脍膾脏髒脐臍脑腦脓膿脔臠脚腳脱脫脲反脶腡脸臉腭齶腻膩腽膃腾騰膑臏臓摹臜臢舆輿舣艤舰艦舱艙舻艫艰艱艹艸艺藝节節芈羋芗薌芜蕪芦蘆苁蓯苇葦苋莧苌萇苍蒼苎苧苏蘇苘萵茎莖茏蘢茑蔦茔塋茕煢茧繭荆荊荚莢荛蕘荜蓽荞蕎荟薈荠薺荡蕩荣榮荤葷荥滎荦犖荧熒荨蕁荩藎荪蓀荫蔭荬賣荭葒荮紂药藥莅蒞莱萊莲蓮莳蒔莴萵获獲莸蕕莹瑩莺鶯莼蓴菭恰萚蘀萝蘿萤螢营營萦縈萧蕭萨薩葱蔥蒇蕆蒉蕢蒋蔣蒌蔞蓝藍蓟薊蓠蘺蓦驀蔷薔蔹蘞蔺藺蔼藹蕲蘄蕴蘊薮藪藁槁藓蘚蘖蘗虏虜虑慮虚虛虬虯虮蟣虽雖虾蝦虿蠆蚀蝕蚁蟻蚂螞蚕蠶蚬蜆蛊蠱蛎蠣蛏蟶蛮蠻蛰蟄蛱蛺蛲蟯蛳螄蛴蠐蜕蛻蜖汀蜗蝸蝇蠅蝈蟈蝉蟬蝼螻蝾蠑蝿蠅螀螿螨顢蟏蠨蟮蟺蠎蟒衅釁衔銜衤衣补補衬襯衮袞袄襖袅裊袆褘袭襲袯襏袴褲装裝裆襠裈褌裢褳裣襝裤褲裥襉褛褸褴襤襕襴覇霸覚覺覧覽覩睹见見观觀规規觅覓视視觇覘览覽觉覺觊覬觋覡觌覿觎覦觏覯觐覲觑覷觗觝觞觴触觸觯觶訡吟詟讋詤謊誀浴誉譽誊謄説說読讀讁謫讠言计計订訂讣訃认認讥譏讦訐讧訌讨討让讓讪訕讫訖训訓议議讯訊记記讱訒讲講讳諱讴謳讵詎讶訝讷訥许許讹訛论論讼訟讽諷设設访訪诀訣证證诂詁诃訶评評诅詛识識诇詗诈詐诉訴诊診诋詆诌謅词詞诎詘诏詔诐詖译譯诒詒诓誆诔誄试試诖詿诗詩诘詰诙詼诚誠诛誅诜詵话話诞誕诟詬诠詮诡詭询詢诣詣诤諍该該详詳诧詫诨諢诩詡诪譸诫誡诬誣语語诮誚误誤诰誥诱誘诲誨诳誑说說诵誦诶誒请請诸諸诹諏诺諾读讀诼諑诽誹课課诿諉谀諛谁誰谂諗调調谄諂谅諒谆諄谇誶谈談谊誼谋謀谌諶谍諜谎謊谏諫谐諧谑謔谒謁谓謂谔諤谕諭谖諼谗讒谘諮谙諳谚諺谛諦谜謎谝諞谞住谟謨谠讜谡謖谢謝谣謠谤謗谥謚谦謙谧謐谨謹谩謾谪謫谫譾谬謬谭譚谮譖谯譙谰讕谱譜谲譎谳讞谴譴谵譫谶讖豮豶貭亍貮貳賍贓賎賤賖賒賘髒贋贗贘償贝貝贞貞负負贡貢财財责責贤賢败敗账賬货貨质質贩販贪貪贫貧贬貶购購贮貯贯貫贰貳贱賤贲賁贳貰贴貼贵貴贶貺贷貸贸貿费費贺賀贻貽贼賊贽贄贾賈贿賄赀貲赁賃赂賂赃贓资資赅賅赆贐赇賕赈賑赉賚赊賒赋賦赌賭赍齎赎贖赏賞赐賜赑贔赒賙赓賡赔賠赖賴赗賵赘贅赙賻赚賺赛賽赜賾赝贗赞贊赟贇赠贈赡贍赢贏赣贛赪赬赵趙趋趨趱趲趸躉跃躍跄蹌跞躒践踐跶躂跷蹺跸蹕跹躚跻躋踌躊踪蹤踬躓踯躑蹑躡蹒蹣蹰躕蹿躥躏躪躜躦躯軀车車轧軋轨軌轩軒轪軑轫軔转轉轭軛轮輪软軟轰轟轱古轲軻轳轤轴軸轵軹轶軼轷乎轸軫轹轢轺軺轻輕轼軾载載轾輊轿轎辀輈辁輇辂輅较較辄輒辅輔辆輛辇輦辈輩辉輝辊輥辋輞辌輬辍輟辎輜辏輳辐輻辑輯辒轀输輸辔轡辕轅辖轄辗輾辘轆辙轍辚轔辞辭辩辯辫辮辬辨边邊辽遼达達迁遷过過迈邁运運还還这這进進远遠违違连連迟遲迩邇迳逕迹跡选選逊遜递遞逦邐逻邏遗遺遥遙邓鄧邝鄺邬鄔邮郵邹鄒邺鄴邻鄰郄卻郏郟郐鄶郑鄭郓鄆郦酈郧鄖郷鄉郸鄲鄊鄉鄕鄉鄷酆酝醞酦醱酱醬酽釅酾釃酿釀释釋釡斧鉴鑒銮鑾錾鏨鎻鎖钅金钆釓钇釔针針钉釘钊釗钋釙钌釕钍釷钏釧钐釤钑鈒钒釩钓釣钔鍆钕釹钖鍚钗釵钘鈃钙鈣钚鈽钛鈦钜鉅钝鈍钞鈔钟鐘钠鈉钡鋇钢鋼钣鈑钤鈐钥鑰钦欽钧鈞钨鎢钩鉤钪鈧钫鈁钬鈥钮鈕钯鈀钰鈺钱錢钲鉦钳鉗钴鈷钵缽钶鈳钸鈽钹鈸钺鉞钻鑽钼鉬钽鉭钾鉀钿鈿铀鈾铁鐵铂鉑铃鈴铄鑠铅鉛铆鉚铈鈰铉鉉铊鉈铋鉍铌鈮铍鈹铎鐸铏鉶铐銬铑銠铒鉺铓鋩铔錏铕銪铖鋮铗鋏铘邪铙鐃铚銍铛鐺铜銅铝鋁铞吊铟銦铠鎧铡鍘铢銖铣銑铤鋌铥銩铦銛铧鏵铨銓铩鎩铪鉿铫銚铬鉻铭銘铮錚铯銫铰鉸铱銥铲鏟铳銃铴鐋铵銨银銀铷銣铸鑄铹鐒铺鋪铻鋙铼錸铽鋱链鏈铿鏗销銷锁鎖锂鋰锃呈锄鋤锅鍋锆鋯锇鋨锈鏽锉銼锊鋝锋鋒锌鋅锍琉锎鉲锏閒锐銳锑銻锒鋃锓鋟锔鋦锕錒锖錆锗鍺锘若错錯锚錨锛錛锜錡锝鎝锞錁锟錕锠琛锡錫锢錮锣鑼锤錘锥錐锦錦锧鑕锨杴锪忽锫培锬錟锭錠键鍵锯鋸锰錳锱錙锲鍥锴鍇锵鏘锶鍶锷鍔锸鍤锹鍬锺鍾锻鍛锼鎪锽鍠锾鍰锿鑀镀鍍镁鎂镂鏤镃鎡镄鐨镅鋂镆鏌镇鎮镈鎛镉鎘镊鑷镋钂镌鐫镍鎳镎拿镏鎦镐鎬镑鎊镒鎰镓鎵镔鑌镕鎔镖鏢镗鏜镘鏝镙鏍镛鏞镜鏡镝鏑镞鏃镟鏇镠鏐镡鐔镢钁镣鐐镤鏷镥魯镧鑭镨鐠镩串镪鏹镫鐙镬鑊镭鐳镮鐶镯鐲镰鐮镱鐿镲察镳鑣镴鑞镵鑱镶鑲长長閲閱门門闩閂闪閃闫閆闬閈闭閉问問闯闖闰閏闱闈闲閒闳閎间間闵閔闶閌闷悶闸閘闹鬧闺閨闻聞闼闥闽閩闾閭闿闓阀閥阁閣阂閡阃閫阄鬮阅閱阆閬阇闍阈閾阉閹阊閶阋鬩阌閿阍閽阎閻阏閼阐闡阑闌阒闃阓闠阔闊阕闋阖闔阗闐阘闒阙闕阚闞阛闤阝阜队隊阳陽阴陰阵陣阶階际際陆陸陇隴陈陳陉陘陕陝陧隉陨隕险險隂陰隌暗随隨隐隱隠隱隷隸隽雋难難雏雛雠讎雳靂雾霧霁霽霊靈霭靄靓靚静靜靥靨鞑韃鞒轎鞯韉鞲韝鞽轎韦韋韧韌韨韍韩韓韪韙韫韞韬韜韯籤韲齋韵韻顋腮顔顏顕顯页頁顶頂顷頃顸頇项項顺順须須顼頊顽頑顾顧顿頓颀頎颁頒颂頌颃頏预預颅顱领領颇頗颈頸颉頡颊頰颋頲颌頜颍潁颎熲颏頦颐頤频頻颓頹颔頷颕穎颖穎颗顆题題颙顒颚顎颛顓颜顏额額颞顳颟顢颠顛颡顙颢顥颣纇颤顫颥須颦顰颧顴颷飆风風飏颺飐颭飑颮飒颯飓颶飔颸飕颼飖颻飗飀飘飄飙飆飚飆飞飛飨饗飬養飮飲飱餐餍饜饣食饤飣饥飢饦飥饧餳饨飩饩餼饪飪饫飫饬飭饭飯饮飲饯餞饰飾饱飽饲飼饴飴饵餌饶饒饷餉饺餃饼餅饽餑饾餖饿餓馀餘馁餒馂餕馄餛馅餡馆館馇查馈饋馉稹馊餿馋饞馌饁馍饃馎餺馏餾馐饈馑饉馒饅馓饊馔饌馕囊马馬驭馭驮馱驯馴驰馳驱驅驲馹驳駁驴驢驵駔驶駛驷駟驸駙驹駒驺騶驻駐驼駝驽駑驾駕驿驛骀駘骁驍骂罵骃駰骄驕骅驊骆駱骇駭骈駢骊驪骋騁验驗骍騂骎駸骏駿骐騏骑騎骒騍骓騅骕驌骖驂骗騙骘騭骙騤骚騷骛騖骜驁骝騮骞騫骟騸骠驃骡騾骢驄骣驏骤驟骥驥骦驦骧驤髅髏髋髖髌髕鬓鬢魇魘魉魎鱼魚鱿魷鲀魨鲁魯鲂魴鲅鱍鲆平鲇占鲈鱸鲊鮓鲋鮒鲍鮑鲎鱟鲐鮐鲑鮭鲒鮚鲔鮪鲕鮞鲖鮦鲙鱠鲚鱭鲛鮫鲜鮮鲞鯗鲟鱘鲠鯁鲡鱺鲢鰱鲣鰹鲤鯉鲥鰣鲦鰷鲧鯀鲨鯊鲩鯇鲫鯽鲭鯖鲮鯪鲰鯫鲱鯡鲲鯤鲳鯧鲴固鲵鯢鲶鯰鲷鯛鲸鯨鲺虱鲻鯔鲼賁鲽鰈鲿鱨鳀鯷鳃鰓鳄鱷鳅鰍鳆鰒鳇鰉鳊扁鳋蚤鳌鰲鳍鰭鳏鰥鳐鰩鳒鰜鳔鰾鳕鱈鳖鱉鳗鰻鳘鱉鳙庸鳛鰼鳜鱖鳝鱔鳞鱗鳟鱒鳡鰲鳢鱧鳣鱣鸟鳥鸠鳩鸡雞鸢鳶鸣鳴鸤鳲鸥鷗鸦鴉鸧鶬鸨鴇鸩鴆鸪鴣鸬鸕鸭鴨鸮鴞鸯鴦鸰鴒鸱鴟鸲鴝鸳鴛鸵鴕鸶鷥鸷鷙鸹鴰鸺鵂鸼鵃鸽鴿鸾鸞鸿鴻鹁鵓鹂鸝鹃鵑鹄鵠鹅鵝鹆鵒鹇鷳鹈鵜鹉鵡鹊鵲鹋苗鹌鵪鹎鵯鹏鵬鹑鶉鹒鶊鹓鵷鹔鷫鹕鶘鹖鶡鹗鶚鹘鶻鹙鶖鹚鶿鹛眉鹜鶩鹝鷊鹞鷂鹠鶹鹡鶺鹢鷁鹣鶼鹤鶴鹥鷖鹦鸚鹧鷓鹨鷚鹩鷯鹪鷦鹫鷲鹬鷸鹭鷺鹯鸇鹰鷹鹱獲鹲鸏鹳鸛鹾鹺麦麥麸麩麹麴麺麵麽麼黄黃黉黌黒黑黙默黡黶黩黷黪黲黾黽鼋黿鼍鼉鼗鞀鼹鼴齄皻齐齊齑齏齿齒龀齔龁齕龂齗龃齟龄齡龅齙龆齠龇齜龈齦龉齬龊齪龋齲龌齷龙龍龚龔龛龕龟龜';
module.exports = exports['default'];

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reg = require('./reg');

var _reg2 = _interopRequireDefault(_reg);

var Util = {
  XHR: function XHR(url, done) {
    var data = [];
    url = url instanceof Array ? url : [url];

    // TODO: substitute with `[].fill()` instead
    for (var i = 0, up = url.length; i < up; i++) {
      data[i] = undefined;
    }

    url.forEach(function (url, i) {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          data[i] = JSON.parse(xhr.responseText);
          if (data.every(function (data) {
            return !!data;
          })) done.apply(undefined, data);
        }
      };
      xhr.open('GET', url, true);
      xhr.send('');
    });
  },

  inverse: function inverse(obj) {
    var ret = {};
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        ret[obj[prop]] = prop;
      }
    }
    return ret;
  },

  LS: {
    get: function get(id) {
      return window.localStorage.getItem(id);
    },
    set: function set(id, val) {
      return window.localStorage.setItem(id, val);
    } },

  listenToLosingFocus: function listenToLosingFocus(selector, loseFocus) {
    var remover = undefined;
    var listener = function listener(e) {
      if (e.target.matches(selector)) return;
      loseFocus();
      remover = document.removeEventListener('click', listener);
    };
    document.addEventListener('click', listener);
    return remover;
  },

  mergeRuby: function mergeRuby(html) {
    return html.replace(/<\/ruby><ruby\sclass=([\"\'])(zhuyin|pinyin)\1>/gi, '');
  },

  rubify: function rubify(html) {
    var div = document.createElement('div');
    div.innerHTML = Util.mergeRuby(html);
    Han(div).renderRuby();
    Array.from(div.querySelectorAll('a-z')).map(function (az, i) {
      return az.setAttribute('i', i);
    });
    html = div.innerHTML;
    return { __html: html };
  },

  // hinst: Han instance
  hinst: function hinst(html) {
    var jinze = arguments[1] === undefined ? true : arguments[1];

    var div = document.createElement('div');
    div.innerHTML = html;
    var ret = jinze ? Han(div).jinzify() : Han(div);
    return Han.find(ret.context);
  },

  getYD: function getYD(sound, returnDiaoInDigit) {
    var yin = sound.replace(_reg2['default'].zhuyin.diao, '') || '';
    var diao = sound.replace(yin, '') || '';

    if (returnDiaoInDigit) {
      if (!diao) diao = '1';
      diao = diao.replace('ˋ', '4').replace('ˇ', '3').replace('ˊ', '2').replace('˙', '0');
    }
    return { yin: yin, diao: diao };
  },

  getAZInfo: function getAZInfo(target) {
    if (!target.matches('a-z, a-z *')) return;
    var ru = undefined,
        rb = undefined,
        zi = undefined,
        style = undefined,
        i = undefined;

    while (target.nodeName !== 'A-Z') {
      target = target.parentNode;
    }

    target.classList.add('picking');
    i = target.getAttribute('i');
    ru = target.querySelector('h-ru') || target;
    rb = target.querySelector('rb');
    zi = (rb || target).textContent[0];

    style = {
      left: '' + target.offsetLeft + 'px',
      top: '' + target.offsetTop + 'px' };
    return { i: i, style: style, zi: zi };
  },

  wrap: {
    simple: function simple(raw) {
      var isntZhuyin = arguments[1] === undefined ? false : arguments[1];

      var clazz = isntZhuyin ? 'pinyin' : 'zhuyin';
      var code = raw.replace(_reg2['default'].anno, function (match, zi, yin) {
        var isHeter = _reg2['default'].heter.test(yin);
        var isPicked = _reg2['default'].picked.test(yin) ? ' picked' : '';
        var arb = '' + zi + '<rt>' + yin.replace(/\*+$/g, '') + '</rt>';
        return isHeter ? '<a-z class="' + isPicked + '"><ruby class="' + clazz + '">' + arb + '</ruby></a-z>' : '<ruby class="' + clazz + '">' + arb + '</ruby>';
      });
      return {
        code: code,
        output: Util.rubify(code) };
    },

    complex: function complex(raw) {
      var isntZhuyin = arguments[1] === undefined ? false : arguments[1];

      var clazz = isntZhuyin ? 'pinyin' : 'zhuyin';
      var div = document.createElement('div');
      var code = undefined,
          rbc = undefined;

      div.innerHTML = raw;

      Array.from(div.querySelectorAll('*:not(li) p, li, h1, h2, h3, h4, h5, h6')).forEach(function (elem) {
        var code = elem.innerHTML;
        var rbc = '';
        var rtc = '';
        var rtc2 = '';

        rbc = code.replace(_reg2['default'].anno, function (match, zi, yin) {
          var isHeter = _reg2['default'].heter.test(yin);
          var isPicked = _reg2['default'].picked.test(yin) ? 'class="picked"' : '';
          var isBoth = _reg2['default'].both.test(yin);
          var rb = '<rb>' + zi + '</rb>';

          yin = yin.replace(/\*+$/g, '').split('|');
          rtc += '<rt>' + yin[0] + '</rt>';
          rtc2 += isBoth ? '<rt>' + yin[1] + '</rt>' : '';
          return isHeter ? '<a-z ' + isPicked + '>' + rb + '</a-z>' : rb;
        });

        elem.innerHTML = ('\n          <ruby class="complex">' + rbc + '\n            <rtc class="' + clazz + '">' + rtc + '</rtc>\n            ' + (rtc2 ? '<rtc class="pinyin">' + rtc2 + '</rtc>' : '') + '\n          </ruby>\n        ').replace(/\n\s+/gi, '');
      });

      code = div.innerHTML;
      return {
        code: code,
        output: Util.rubify(code) };
    },

    zhuyin: function zhuyin(rt, isSelfContained) {
      var yin = rt.replace(_reg2['default'].zhuyin.diao, '') || '';
      var diao = rt.replace(yin, '') || '';
      var len = yin.length;
      var html = ('\n        <h-zhuyin diao=\'' + diao + '\' length=\'' + len + '\'>\n          <h-yin>' + yin + '</h-yin>\n          <h-diao>' + diao + '</h-diao>\n        </h-zhuyin>\n      ').replace(/\n\s*/g, '');
      return isSelfContained ? { __html: '' + html } : { html: html, yin: yin, diao: diao, len: len };
    } } };

exports['default'] = Util;
module.exports = exports['default'];

},{"./reg":3}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

var _reg = require('./reg');

var _reg2 = _interopRequireDefault(_reg);

var _prefJsx = require('./pref.jsx');

var _prefJsx2 = _interopRequireDefault(_prefJsx);

var WWW = 'https://az.hanzi.co/';
var LIB = {
  css: '<link rel="stylesheet" href="//az.hanzi.co/201505/han.ruby.css">',
  js: '<script src="//cdnjs.cloudflare.com/ajax/libs/Han/3.2.1/han.min.js"></script>',
  render: '<script>document.addEventListener("DOMContentLoaded",function(){Han().initCond().renderRuby()})</script>' };

exports['default'] = function (Util) {

  var Nav = React.createClass({
    displayName: 'Nav',

    togglePref: function togglePref() {
      this.props.parent.toggleUI('pref');
    },

    render: function render() {
      return React.createElement(
        'nav',
        { className: 'layout' },
        React.createElement(
          'button',
          { className: 'pref', onClick: this.togglePref },
          '設定'
        ),
        React.createElement(
          'a',
          { className: 'about', href: './about.html' },
          '說明'
        ),
        React.createElement(
          'a',
          { className: 'gh-repo', href: '//github.com/ethantw/az' },
          'GitHub'
        )
      );
    } });

  var Speaker = React.createClass({
    displayName: 'Speaker',

    render: function render() {
      var _this = this;

      return React.createElement(
        'button',
        { className: 'speaker', title: '播放讀音', onClick: function () {
            Util.speak(_this.props.speak);
          } },
        '播放讀音'
      );
    }
  });

  var IO = React.createClass({
    displayName: 'IO',

    getInitialState: function getInitialState() {
      return {
        current: 0,
        zi: null,
        currentYin: 0,
        picking: false,
        pickrXY: {} };
    },

    componentWillMount: function componentWillMount() {
      var def = [encodeURIComponent('用《[萌典](https://moedict.tw/)》*半自動*為漢字[#的部分](https://twitter.com/?q=#的部分)來標注發音嗎？\n\n讓媽媽——\\\n來，安裝窗戶。'), '121'];

      // Do not use `location.hash` for Firefox decodes URI improperly
      var hash = location.href.split('#')[1] || def.join('/');
      hash += /\//.test(hash) ? '' : '/0';

      var _hash$split = hash.split('/');

      var _hash$split2 = _slicedToArray(_hash$split, 2);

      var input = _hash$split2[0];
      var pickee = _hash$split2[1];

      input = decodeURIComponent(input);
      pickee = pickee.split('') || [0];
      this.IO(pickee, input, true);
    },

    componentDidMount: function componentDidMount() {
      var node = React.findDOMNode(this.refs.input);
      node.focus();
      node.select();
      this.setPref();
    },

    componentDidUpdate: function componentDidUpdate() {
      var _this2 = this;

      var output = React.findDOMNode(this.refs.output);
      Array.from(output.querySelectorAll('*:not(li) p, li, h1, h2, h3, h4, h5, h6')).forEach(function (elem) {
        var holder = document.createElement('span');
        var before = elem.querySelector('.speaker-holder');
        var p = elem.cloneNode(true);

        Array.from(p.querySelectorAll('h-ru, ruby')).map(function (ru) {
          var zi = ru.textContent.replace(Han.TYPESET.group.western, '').replace(/[⁰¹²³⁴]/gi, '').replace(new RegExp('' + Han.UNICODE.zhuyin.base, 'gi'), '').replace(new RegExp('' + Han.UNICODE.zhuyin.tone, 'gi'), '');
          //.replace( new RegExp( `${Han.UNICODE.zhuyin.ruyun}`, 'gi' ), '' )
          ru.innerHTML = zi;

          if (ru.matches('a-z *')) {
            var az = ru.parentNode;
            while (!az.matches('a-z')) {
              az = az.parentNode;
            }
            var i = az.getAttribute('i');
            var picked = _this2.state.pickee[i] ? _this2.state.pickee[i].yin : 0;
            var sound = _this2.state.az[i][picked].replace(/^˙(.+)$/i, '$1˙');
            ru.innerHTML = '|' + sound + '|';
          }
          return ru;
        });

        var speak = p.textContent.replace(/播放讀音$/, '');

        holder.classList.add('speaker-holder');
        if (before) elem.removeChild(before);
        elem.appendChild(holder);
        React.render(React.createElement(Speaker, { speak: speak }), holder);
      });
    },

    setPref: function setPref() {
      var node = React.findDOMNode(this.refs.io);
      var system = Util.LS.get('system') || 'zhuyin';
      var display = Util.LS.get('display') || 'zhuyin';

      this.IO();
      node.setAttribute('data-system', system);
      node.setAttribute('data-display', display);
    },

    IO: function IO() {
      var pickee = arguments[0] === undefined ? this.state.pickee : arguments[0];
      var input = arguments[1] === undefined ? this.state.input : arguments[1];
      var doAvoidMatching = arguments[2] === undefined ? false : arguments[2];

      var syntax = Util.LS.get('syntax');
      var system = Util.LS.get('system');
      var method = syntax === 'simp' && system !== 'both' ? 'simple' : 'complex';
      var isntZhuyin = system === 'pinyin' || system === 'wg';

      var result = Util.annotate(input, pickee, doAvoidMatching);
      var az = result.az;
      var raw = result.raw;

      var _Util$wrap$method = Util.wrap[method](raw, isntZhuyin);

      var code = _Util$wrap$method.code;
      var output = _Util$wrap$method.output;

      var url = undefined;
      pickee = result.pickee;

      {
        var key = Object.keys(pickee);
        var p = [0];
        for (var i = 0, end = key[key.length - 1]; i <= end; i++) {
          p[i] = pickee.hasOwnProperty(i) ? pickee[i].yin.toString(16) : '0';
        }
        url = '' + WWW + '#' + encodeURIComponent(input) + '/' + p.join('');
      }

      code = syntax === 'han' ? output.__html : code;
      code += '\n' + (syntax === 'han' ? LIB.css : '' + LIB.css + '\n' + LIB.js + '\n' + LIB.render) + '\n';
      code = Util.mergeRuby(code.replace(/<a\-z[^>]*>/gi, '').replace(/<\/a\-z>/gi, ''));

      this.setState({ input: input, az: az, code: code, output: output, url: url, pickee: pickee });
    },

    handleInput: function handleInput(e) {
      this.setPicking(false);
      this.setState({ input: e.target.value }, this.IO);
    },

    setPicking: function setPicking() {
      var sw = arguments[0] === undefined ? true : arguments[0];

      var clazz = React.findDOMNode(this.refs.io).classList;
      var method = sw ? 'add' : 'remove';
      clazz[method]('picking');
      this.setState({ picking: sw });
    },

    pickZi: function pickZi(e) {
      var _this3 = this;

      var target = e.target;
      var az = undefined;
      var cleanFormer = function cleanFormer() {
        var former = React.findDOMNode(_this3.refs.output).querySelector('a-z.picking');
        if (former) former.classList.remove('picking');
        _this3.setPicking(false);
      };

      if (target.matches('a[href], a[href] *') && !(e.metaKey || e.shiftKey || e.ctrlKey || e.altKey)) {
        e.preventDefault();
      }

      cleanFormer();
      az = Util.getAZInfo(e.target);
      if (!az) return;

      var current = az.i;
      var zi = az.zi;
      var picked = this.state.pickee[current];
      var currentYin = picked ? picked.yin : 0;
      var pickrXY = az.style || null;
      this.setPicking();
      this.setState({ current: current, currentYin: currentYin, zi: zi, pickrXY: pickrXY });
      Util.listenToLosingFocus('a-z *, #pickr *, nav *, #pref *', cleanFormer);
    },

    pickYin: function pickYin(i) {
      var output = React.findDOMNode(this.refs.output);
      var current = this.state.current;
      var pickee = this.state.pickee;
      pickee[current] = {
        zi: this.state.zi,
        yin: i
      };
      this.IO(pickee);
      this.setState({ currentYin: i });
    },

    render: function render() {
      var _this4 = this;

      var current = this.state.az[this.state.current] || [];
      var utility = [{ c: 'input', n: '輸入' }, { c: 'code', n: '拷貝輸出代碼' }, { c: 'url', n: '拷貝網址' }];
      return React.createElement(
        'main',
        { id: 'io', ref: 'io', className: 'layout' },
        React.createElement(
          'div',
          { id: 'in', ref: 'in', className: 'input' },
          React.createElement('textarea', { id: 'input', ref: 'input', defaultValue: this.state.input, onChange: this.handleInput }),
          React.createElement('textarea', { id: 'code', value: this.state.code }),
          React.createElement('textarea', { id: 'url', value: this.state.url }),
          React.createElement(
            'ul',
            { id: 'utility' },
            utility.map(function (it) {
              return React.createElement(
                'li',
                { className: it.c },
                React.createElement(
                  'button',
                  { onClick: function () {
                      var node = React.findDOMNode(_this4.refs['in']);
                      var isLocked = node.classList.contains('locked');
                      var textarea = document.getElementById(it.c);
                      node.className = it.c + (isLocked ? ' locked' : '');
                      textarea.focus();
                      textarea.select();
                      textarea.scrollTop = textarea.scrollHeight;
                    } },
                  it.n
                )
              );
            }),
            React.createElement(
              'li',
              { className: 'lock' },
              React.createElement(
                'button',
                { onClick: function () {
                    var clazz = React.findDOMNode(_this4.refs['in']).classList;
                    var input = React.findDOMNode(_this4.refs.input);
                    clazz.toggle('locked');
                    input.readOnly = !input.readOnly;
                  } },
                '輸入框鎖定切換'
              )
            )
          )
        ),
        React.createElement(
          'div',
          { id: 'out' },
          React.createElement('article', { ref: 'output', onClick: this.pickZi, dangerouslySetInnerHTML: this.state.output }),
          React.createElement(
            'ul',
            { id: 'pickr', hidden: true, style: this.state.pickrXY },
            current.map(function (sound, i) {
              var currentYin = _this4.state.currentYin || 0;
              var display = Util.LS.get('display');
              var clazz = i === currentYin ? 'current' : '';
              var rt = display === 'pinyin' ? { __html: Util.getPinyin(sound) } : Util.wrap.zhuyin(sound, true);
              return React.createElement('li', { onClick: function () {
                  return _this4.pickYin(i);
                }, className: clazz, dangerouslySetInnerHTML: rt });
            })
          )
        )
      );
    } });

  var Page = React.createClass({
    displayName: 'Page',

    getInitialState: function getInitialState() {
      return {
        init: true,
        pref: false,
        about: false
      };
    },

    componentDidMount: function componentDidMount() {
      Han().initCond();
    },

    toggleUI: function toggleUI(component) {
      var clazz = React.findDOMNode(this.refs.body).classList;
      clazz.toggle(component);
      clazz.add('not-init');
      clazz.remove('init');
      this.setState({ init: false });
    },

    render: function render() {
      return React.createElement(
        'div',
        { id: 'body', ref: 'body', className: 'layout init' },
        React.createElement(Nav, { parent: this }),
        React.createElement(IO, { ref: 'io', parent: this }),
        React.createElement(_prefJsx2['default'], { parent: this, io: this.refs.io })
      );
    } });

  return Page;
};

module.exports = exports['default'];

},{"./pref.jsx":2,"./reg":3}],7:[function(require,module,exports){
(function (global){
"use strict";

require("core-js/shim");

require("regenerator/runtime");

if (global._babelPolyfill) {
  throw new Error("only one instance of babel/polyfill is allowed");
}
global._babelPolyfill = true;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"core-js/shim":91,"regenerator/runtime":92}],8:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var $ = require('./$');
module.exports = function(IS_INCLUDES){
  return function($this, el, fromIndex){
    var O      = $.toObject($this)
      , length = $.toLength(O.length)
      , index  = $.toIndex(fromIndex, length)
      , value;
    if(IS_INCLUDES && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
      if(O[index] === el)return IS_INCLUDES || index;
    } return !IS_INCLUDES && -1;
  };
};
},{"./$":28}],9:[function(require,module,exports){
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var $   = require('./$')
  , ctx = require('./$.ctx');
module.exports = function(TYPE){
  var IS_MAP        = TYPE == 1
    , IS_FILTER     = TYPE == 2
    , IS_SOME       = TYPE == 3
    , IS_EVERY      = TYPE == 4
    , IS_FIND_INDEX = TYPE == 6
    , NO_HOLES      = TYPE == 5 || IS_FIND_INDEX;
  return function($this, callbackfn, that){
    var O      = Object($.assertDefined($this))
      , self   = $.ES5Object(O)
      , f      = ctx(callbackfn, that, 3)
      , length = $.toLength(self.length)
      , index  = 0
      , result = IS_MAP ? Array(length) : IS_FILTER ? [] : undefined
      , val, res;
    for(;length > index; index++)if(NO_HOLES || index in self){
      val = self[index];
      res = f(val, index, O);
      if(TYPE){
        if(IS_MAP)result[index] = res;            // map
        else if(res)switch(TYPE){
          case 3: return true;                    // some
          case 5: return val;                     // find
          case 6: return index;                   // findIndex
          case 2: result.push(val);               // filter
        } else if(IS_EVERY)return false;          // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};
},{"./$":28,"./$.ctx":17}],10:[function(require,module,exports){
var $ = require('./$');
function assert(condition, msg1, msg2){
  if(!condition)throw TypeError(msg2 ? msg1 + msg2 : msg1);
}
assert.def = $.assertDefined;
assert.fn = function(it){
  if(!$.isFunction(it))throw TypeError(it + ' is not a function!');
  return it;
};
assert.obj = function(it){
  if(!$.isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
assert.inst = function(it, Constructor, name){
  if(!(it instanceof Constructor))throw TypeError(name + ": use the 'new' operator!");
  return it;
};
module.exports = assert;
},{"./$":28}],11:[function(require,module,exports){
var $        = require('./$')
  , enumKeys = require('./$.enum-keys');
// 19.1.2.1 Object.assign(target, source, ...)
/* eslint-disable no-unused-vars */
module.exports = Object.assign || function assign(target, source){
/* eslint-enable no-unused-vars */
  var T = Object($.assertDefined(target))
    , l = arguments.length
    , i = 1;
  while(l > i){
    var S      = $.ES5Object(arguments[i++])
      , keys   = enumKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)T[key = keys[j++]] = S[key];
  }
  return T;
};
},{"./$":28,"./$.enum-keys":20}],12:[function(require,module,exports){
var $        = require('./$')
  , TAG      = require('./$.wks')('toStringTag')
  , toString = {}.toString;
function cof(it){
  return toString.call(it).slice(8, -1);
}
cof.classof = function(it){
  var O, T;
  return it == undefined ? it === undefined ? 'Undefined' : 'Null'
    : typeof (T = (O = Object(it))[TAG]) == 'string' ? T : cof(O);
};
cof.set = function(it, tag, stat){
  if(it && !$.has(it = stat ? it : it.prototype, TAG))$.hide(it, TAG, tag);
};
module.exports = cof;
},{"./$":28,"./$.wks":42}],13:[function(require,module,exports){
'use strict';
var $        = require('./$')
  , ctx      = require('./$.ctx')
  , safe     = require('./$.uid').safe
  , assert   = require('./$.assert')
  , forOf    = require('./$.for-of')
  , step     = require('./$.iter').step
  , has      = $.has
  , set      = $.set
  , isObject = $.isObject
  , hide     = $.hide
  , isFrozen = Object.isFrozen || $.core.Object.isFrozen
  , ID       = safe('id')
  , O1       = safe('O1')
  , LAST     = safe('last')
  , FIRST    = safe('first')
  , ITER     = safe('iter')
  , SIZE     = $.DESC ? safe('size') : 'size'
  , id       = 0;

function fastKey(it, create){
  // return primitive with prefix
  if(!isObject(it))return (typeof it == 'string' ? 'S' : 'P') + it;
  // can't set id to frozen object
  if(isFrozen(it))return 'F';
  if(!has(it, ID)){
    // not necessary to add id
    if(!create)return 'E';
    // add missing object id
    hide(it, ID, ++id);
  // return object id with prefix
  } return 'O' + it[ID];
}

function getEntry(that, key){
  // fast case
  var index = fastKey(key), entry;
  if(index != 'F')return that[O1][index];
  // frozen object case
  for(entry = that[FIRST]; entry; entry = entry.n){
    if(entry.k == key)return entry;
  }
}

module.exports = {
  getConstructor: function(NAME, IS_MAP, ADDER){
    function C(){
      var that     = assert.inst(this, C, NAME)
        , iterable = arguments[0];
      set(that, O1, $.create(null));
      set(that, SIZE, 0);
      set(that, LAST, undefined);
      set(that, FIRST, undefined);
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    }
    $.mix(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear(){
        for(var that = this, data = that[O1], entry = that[FIRST]; entry; entry = entry.n){
          entry.r = true;
          if(entry.p)entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that[FIRST] = that[LAST] = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function(key){
        var that  = this
          , entry = getEntry(that, key);
        if(entry){
          var next = entry.n
            , prev = entry.p;
          delete that[O1][entry.i];
          entry.r = true;
          if(prev)prev.n = next;
          if(next)next.p = prev;
          if(that[FIRST] == entry)that[FIRST] = next;
          if(that[LAST] == entry)that[LAST] = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /*, that = undefined */){
        var f = ctx(callbackfn, arguments[1], 3)
          , entry;
        while(entry = entry ? entry.n : this[FIRST]){
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while(entry && entry.r)entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key){
        return !!getEntry(this, key);
      }
    });
    if($.DESC)$.setDesc(C.prototype, 'size', {
      get: function(){
        return assert.def(this[SIZE]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var entry = getEntry(that, key)
      , prev, index;
    // change existing entry
    if(entry){
      entry.v = value;
    // create new entry
    } else {
      that[LAST] = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that[LAST],          // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if(!that[FIRST])that[FIRST] = entry;
      if(prev)prev.n = entry;
      that[SIZE]++;
      // add to index
      if(index != 'F')that[O1][index] = entry;
    } return that;
  },
  getEntry: getEntry,
  // add .keys, .values, .entries, [@@iterator]
  // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
  setIter: function(C, NAME, IS_MAP){
    require('./$.iter-define')(C, NAME, function(iterated, kind){
      set(this, ITER, {o: iterated, k: kind});
    }, function(){
      var iter  = this[ITER]
        , kind  = iter.k
        , entry = iter.l;
      // revert to the last existing entry
      while(entry && entry.r)entry = entry.p;
      // get next entry
      if(!iter.o || !(iter.l = entry = entry ? entry.n : iter.o[FIRST])){
        // or finish the iteration
        iter.o = undefined;
        return step(1);
      }
      // return step by kind
      if(kind == 'keys'  )return step(0, entry.k);
      if(kind == 'values')return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values' , !IS_MAP, true);
  }
};
},{"./$":28,"./$.assert":10,"./$.ctx":17,"./$.for-of":21,"./$.iter":27,"./$.iter-define":25,"./$.uid":40}],14:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $def  = require('./$.def')
  , forOf = require('./$.for-of');
module.exports = function(NAME){
  $def($def.P, NAME, {
    toJSON: function toJSON(){
      var arr = [];
      forOf(this, false, arr.push, arr);
      return arr;
    }
  });
};
},{"./$.def":18,"./$.for-of":21}],15:[function(require,module,exports){
'use strict';
var $         = require('./$')
  , safe      = require('./$.uid').safe
  , assert    = require('./$.assert')
  , forOf     = require('./$.for-of')
  , _has      = $.has
  , isObject  = $.isObject
  , hide      = $.hide
  , isFrozen  = Object.isFrozen || $.core.Object.isFrozen
  , id        = 0
  , ID        = safe('id')
  , WEAK      = safe('weak')
  , LEAK      = safe('leak')
  , method    = require('./$.array-methods')
  , find      = method(5)
  , findIndex = method(6);
function findFrozen(store, key){
  return find(store.array, function(it){
    return it[0] === key;
  });
}
// fallback for frozen keys
function leakStore(that){
  return that[LEAK] || hide(that, LEAK, {
    array: [],
    get: function(key){
      var entry = findFrozen(this, key);
      if(entry)return entry[1];
    },
    has: function(key){
      return !!findFrozen(this, key);
    },
    set: function(key, value){
      var entry = findFrozen(this, key);
      if(entry)entry[1] = value;
      else this.array.push([key, value]);
    },
    'delete': function(key){
      var index = findIndex(this.array, function(it){
        return it[0] === key;
      });
      if(~index)this.array.splice(index, 1);
      return !!~index;
    }
  })[LEAK];
}

module.exports = {
  getConstructor: function(NAME, IS_MAP, ADDER){
    function C(){
      $.set(assert.inst(this, C, NAME), ID, id++);
      var iterable = arguments[0];
      if(iterable != undefined)forOf(iterable, IS_MAP, this[ADDER], this);
    }
    $.mix(C.prototype, {
      // 23.3.3.2 WeakMap.prototype.delete(key)
      // 23.4.3.3 WeakSet.prototype.delete(value)
      'delete': function(key){
        if(!isObject(key))return false;
        if(isFrozen(key))return leakStore(this)['delete'](key);
        return _has(key, WEAK) && _has(key[WEAK], this[ID]) && delete key[WEAK][this[ID]];
      },
      // 23.3.3.4 WeakMap.prototype.has(key)
      // 23.4.3.4 WeakSet.prototype.has(value)
      has: function has(key){
        if(!isObject(key))return false;
        if(isFrozen(key))return leakStore(this).has(key);
        return _has(key, WEAK) && _has(key[WEAK], this[ID]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    if(isFrozen(assert.obj(key))){
      leakStore(that).set(key, value);
    } else {
      _has(key, WEAK) || hide(key, WEAK, {});
      key[WEAK][that[ID]] = value;
    } return that;
  },
  leakStore: leakStore,
  WEAK: WEAK,
  ID: ID
};
},{"./$":28,"./$.array-methods":9,"./$.assert":10,"./$.for-of":21,"./$.uid":40}],16:[function(require,module,exports){
'use strict';
var $     = require('./$')
  , $def  = require('./$.def')
  , BUGGY = require('./$.iter').BUGGY
  , forOf = require('./$.for-of')
  , species = require('./$.species')
  , assertInstance = require('./$.assert').inst;

module.exports = function(NAME, methods, common, IS_MAP, IS_WEAK){
  var Base  = $.g[NAME]
    , C     = Base
    , ADDER = IS_MAP ? 'set' : 'add'
    , proto = C && C.prototype
    , O     = {};
  function fixMethod(KEY, CHAIN){
    var method = proto[KEY];
    if($.FW)proto[KEY] = function(a, b){
      var result = method.call(this, a === 0 ? 0 : a, b);
      return CHAIN ? this : result;
    };
  }
  if(!$.isFunction(C) || !(IS_WEAK || !BUGGY && proto.forEach && proto.entries)){
    // create collection constructor
    C = common.getConstructor(NAME, IS_MAP, ADDER);
    $.mix(C.prototype, methods);
  } else {
    var inst  = new C
      , chain = inst[ADDER](IS_WEAK ? {} : -0, 1)
      , buggyZero;
    // wrap for init collections from iterable
    if(!require('./$.iter-detect')(function(iter){ new C(iter); })){ // eslint-disable-line no-new
      C = function(){
        assertInstance(this, C, NAME);
        var that     = new Base
          , iterable = arguments[0];
        if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
        return that;
      };
      C.prototype = proto;
      if($.FW)proto.constructor = C;
    }
    IS_WEAK || inst.forEach(function(val, key){
      buggyZero = 1 / key === -Infinity;
    });
    // fix converting -0 key to +0
    if(buggyZero){
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }
    // + fix .add & .set for chaining
    if(buggyZero || chain !== inst)fixMethod(ADDER, true);
  }

  require('./$.cof').set(C, NAME);

  O[NAME] = C;
  $def($def.G + $def.W + $def.F * (C != Base), O);
  species(C);
  species($.core[NAME]); // for wrapper

  if(!IS_WEAK)common.setIter(C, NAME, IS_MAP);

  return C;
};
},{"./$":28,"./$.assert":10,"./$.cof":12,"./$.def":18,"./$.for-of":21,"./$.iter":27,"./$.iter-detect":26,"./$.species":34}],17:[function(require,module,exports){
// Optional / simple context binding
var assertFunction = require('./$.assert').fn;
module.exports = function(fn, that, length){
  assertFunction(fn);
  if(~length && that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  } return function(/* ...args */){
      return fn.apply(that, arguments);
    };
};
},{"./$.assert":10}],18:[function(require,module,exports){
var $          = require('./$')
  , global     = $.g
  , core       = $.core
  , isFunction = $.isFunction;
function ctx(fn, that){
  return function(){
    return fn.apply(that, arguments);
  };
}
global.core = core;
// type bitmap
$def.F = 1;  // forced
$def.G = 2;  // global
$def.S = 4;  // static
$def.P = 8;  // proto
$def.B = 16; // bind
$def.W = 32; // wrap
function $def(type, name, source){
  var key, own, out, exp
    , isGlobal = type & $def.G
    , target   = isGlobal ? global : type & $def.S
        ? global[name] : (global[name] || {}).prototype
    , exports  = isGlobal ? core : core[name] || (core[name] = {});
  if(isGlobal)source = name;
  for(key in source){
    // contains in native
    own = !(type & $def.F) && target && key in target;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    if(type & $def.B && own)exp = ctx(out, global);
    else exp = type & $def.P && isFunction(out) ? ctx(Function.call, out) : out;
    // extend global
    if(target && !own){
      if(isGlobal)target[key] = out;
      else delete target[key] && $.hide(target, key, out);
    }
    // export
    if(exports[key] != out)$.hide(exports, key, exp);
  }
}
module.exports = $def;
},{"./$":28}],19:[function(require,module,exports){
var $        = require('./$')
  , document = $.g.document
  , isObject = $.isObject
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./$":28}],20:[function(require,module,exports){
var $ = require('./$');
module.exports = function(it){
  var keys       = $.getKeys(it)
    , getDesc    = $.getDesc
    , getSymbols = $.getSymbols;
  if(getSymbols)$.each.call(getSymbols(it), function(key){
    if(getDesc(it, key).enumerable)keys.push(key);
  });
  return keys;
};
},{"./$":28}],21:[function(require,module,exports){
var ctx  = require('./$.ctx')
  , get  = require('./$.iter').get
  , call = require('./$.iter-call');
module.exports = function(iterable, entries, fn, that){
  var iterator = get(iterable)
    , f        = ctx(fn, that, entries ? 2 : 1)
    , step;
  while(!(step = iterator.next()).done){
    if(call(iterator, f, step.value, entries) === false){
      return call.close(iterator);
    }
  }
};
},{"./$.ctx":17,"./$.iter":27,"./$.iter-call":24}],22:[function(require,module,exports){
module.exports = function($){
  $.FW   = true;
  $.path = $.g;
  return $;
};
},{}],23:[function(require,module,exports){
// Fast apply
// http://jsperf.lnkit.com/fast-apply/5
module.exports = function(fn, args, that){
  var un = that === undefined;
  switch(args.length){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
    case 5: return un ? fn(args[0], args[1], args[2], args[3], args[4])
                      : fn.call(that, args[0], args[1], args[2], args[3], args[4]);
  } return              fn.apply(that, args);
};
},{}],24:[function(require,module,exports){
var assertObject = require('./$.assert').obj;
function close(iterator){
  var ret = iterator['return'];
  if(ret !== undefined)assertObject(ret.call(iterator));
}
function call(iterator, fn, value, entries){
  try {
    return entries ? fn(assertObject(value)[0], value[1]) : fn(value);
  } catch(e){
    close(iterator);
    throw e;
  }
}
call.close = close;
module.exports = call;
},{"./$.assert":10}],25:[function(require,module,exports){
var $def            = require('./$.def')
  , $               = require('./$')
  , cof             = require('./$.cof')
  , $iter           = require('./$.iter')
  , SYMBOL_ITERATOR = require('./$.wks')('iterator')
  , FF_ITERATOR     = '@@iterator'
  , KEYS            = 'keys'
  , VALUES          = 'values'
  , Iterators       = $iter.Iterators;
module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCE){
  $iter.create(Constructor, NAME, next);
  function createMethod(kind){
    function $$(that){
      return new Constructor(that, kind);
    }
    switch(kind){
      case KEYS: return function keys(){ return $$(this); };
      case VALUES: return function values(){ return $$(this); };
    } return function entries(){ return $$(this); };
  }
  var TAG      = NAME + ' Iterator'
    , proto    = Base.prototype
    , _native  = proto[SYMBOL_ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , _default = _native || createMethod(DEFAULT)
    , methods, key;
  // Fix native
  if(_native){
    var IteratorPrototype = $.getProto(_default.call(new Base));
    // Set @@toStringTag to native iterators
    cof.set(IteratorPrototype, TAG, true);
    // FF fix
    if($.FW && $.has(proto, FF_ITERATOR))$iter.set(IteratorPrototype, $.that);
  }
  // Define iterator
  if($.FW)$iter.set(proto, _default);
  // Plug for library
  Iterators[NAME] = _default;
  Iterators[TAG]  = $.that;
  if(DEFAULT){
    methods = {
      keys:    IS_SET            ? _default : createMethod(KEYS),
      values:  DEFAULT == VALUES ? _default : createMethod(VALUES),
      entries: DEFAULT != VALUES ? _default : createMethod('entries')
    };
    if(FORCE)for(key in methods){
      if(!(key in proto))$.hide(proto, key, methods[key]);
    } else $def($def.P + $def.F * $iter.BUGGY, NAME, methods);
  }
};
},{"./$":28,"./$.cof":12,"./$.def":18,"./$.iter":27,"./$.wks":42}],26:[function(require,module,exports){
var SYMBOL_ITERATOR = require('./$.wks')('iterator')
  , SAFE_CLOSING    = false;
try {
  var riter = [7][SYMBOL_ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }
module.exports = function(exec){
  if(!SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[SYMBOL_ITERATOR]();
    iter.next = function(){ safe = true; };
    arr[SYMBOL_ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"./$.wks":42}],27:[function(require,module,exports){
'use strict';
var $                 = require('./$')
  , cof               = require('./$.cof')
  , assertObject      = require('./$.assert').obj
  , SYMBOL_ITERATOR   = require('./$.wks')('iterator')
  , FF_ITERATOR       = '@@iterator'
  , Iterators         = {}
  , IteratorPrototype = {};
// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
setIterator(IteratorPrototype, $.that);
function setIterator(O, value){
  $.hide(O, SYMBOL_ITERATOR, value);
  // Add iterator for FF iterator protocol
  if(FF_ITERATOR in [])$.hide(O, FF_ITERATOR, value);
}

module.exports = {
  // Safari has buggy iterators w/o `next`
  BUGGY: 'keys' in [] && !('next' in [].keys()),
  Iterators: Iterators,
  step: function(done, value){
    return {value: value, done: !!done};
  },
  is: function(it){
    var O      = Object(it)
      , Symbol = $.g.Symbol
      , SYM    = Symbol && Symbol.iterator || FF_ITERATOR;
    return SYM in O || SYMBOL_ITERATOR in O || $.has(Iterators, cof.classof(O));
  },
  get: function(it){
    var Symbol  = $.g.Symbol
      , ext     = it[Symbol && Symbol.iterator || FF_ITERATOR]
      , getIter = ext || it[SYMBOL_ITERATOR] || Iterators[cof.classof(it)];
    return assertObject(getIter.call(it));
  },
  set: setIterator,
  create: function(Constructor, NAME, next, proto){
    Constructor.prototype = $.create(proto || IteratorPrototype, {next: $.desc(1, next)});
    cof.set(Constructor, NAME + ' Iterator');
  }
};
},{"./$":28,"./$.assert":10,"./$.cof":12,"./$.wks":42}],28:[function(require,module,exports){
'use strict';
var global = typeof self != 'undefined' ? self : Function('return this')()
  , core   = {}
  , defineProperty = Object.defineProperty
  , hasOwnProperty = {}.hasOwnProperty
  , ceil  = Math.ceil
  , floor = Math.floor
  , max   = Math.max
  , min   = Math.min;
// The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
var DESC = !!function(){
  try {
    return defineProperty({}, 'a', {get: function(){ return 2; }}).a == 2;
  } catch(e){ /* empty */ }
}();
var hide = createDefiner(1);
// 7.1.4 ToInteger
function toInteger(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
}
function desc(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
}
function simpleSet(object, key, value){
  object[key] = value;
  return object;
}
function createDefiner(bitmap){
  return DESC ? function(object, key, value){
    return $.setDesc(object, key, desc(bitmap, value));
  } : simpleSet;
}

function isObject(it){
  return it !== null && (typeof it == 'object' || typeof it == 'function');
}
function isFunction(it){
  return typeof it == 'function';
}
function assertDefined(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
}

var $ = module.exports = require('./$.fw')({
  g: global,
  core: core,
  html: global.document && document.documentElement,
  // http://jsperf.com/core-js-isobject
  isObject:   isObject,
  isFunction: isFunction,
  it: function(it){
    return it;
  },
  that: function(){
    return this;
  },
  // 7.1.4 ToInteger
  toInteger: toInteger,
  // 7.1.15 ToLength
  toLength: function(it){
    return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
  },
  toIndex: function(index, length){
    index = toInteger(index);
    return index < 0 ? max(index + length, 0) : min(index, length);
  },
  has: function(it, key){
    return hasOwnProperty.call(it, key);
  },
  create:     Object.create,
  getProto:   Object.getPrototypeOf,
  DESC:       DESC,
  desc:       desc,
  getDesc:    Object.getOwnPropertyDescriptor,
  setDesc:    defineProperty,
  setDescs:   Object.defineProperties,
  getKeys:    Object.keys,
  getNames:   Object.getOwnPropertyNames,
  getSymbols: Object.getOwnPropertySymbols,
  assertDefined: assertDefined,
  // Dummy, fix for not array-like ES3 string in es5 module
  ES5Object: Object,
  toObject: function(it){
    return $.ES5Object(assertDefined(it));
  },
  hide: hide,
  def: createDefiner(0),
  set: global.Symbol ? simpleSet : hide,
  mix: function(target, src){
    for(var key in src)hide(target, key, src[key]);
    return target;
  },
  each: [].forEach
});
/* eslint-disable no-undef */
if(typeof __e != 'undefined')__e = core;
if(typeof __g != 'undefined')__g = global;
},{"./$.fw":22}],29:[function(require,module,exports){
var $ = require('./$');
module.exports = function(object, el){
  var O      = $.toObject(object)
    , keys   = $.getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
};
},{"./$":28}],30:[function(require,module,exports){
var $            = require('./$')
  , assertObject = require('./$.assert').obj;
module.exports = function ownKeys(it){
  assertObject(it);
  var keys       = $.getNames(it)
    , getSymbols = $.getSymbols;
  return getSymbols ? keys.concat(getSymbols(it)) : keys;
};
},{"./$":28,"./$.assert":10}],31:[function(require,module,exports){
'use strict';
var $      = require('./$')
  , invoke = require('./$.invoke')
  , assertFunction = require('./$.assert').fn;
module.exports = function(/* ...pargs */){
  var fn     = assertFunction(this)
    , length = arguments.length
    , pargs  = Array(length)
    , i      = 0
    , _      = $.path._
    , holder = false;
  while(length > i)if((pargs[i] = arguments[i++]) === _)holder = true;
  return function(/* ...args */){
    var that    = this
      , _length = arguments.length
      , j = 0, k = 0, args;
    if(!holder && !_length)return invoke(fn, pargs, that);
    args = pargs.slice();
    if(holder)for(;length > j; j++)if(args[j] === _)args[j] = arguments[k++];
    while(_length > k)args.push(arguments[k++]);
    return invoke(fn, args, that);
  };
};
},{"./$":28,"./$.assert":10,"./$.invoke":23}],32:[function(require,module,exports){
'use strict';
module.exports = function(regExp, replace, isStatic){
  var replacer = replace === Object(replace) ? function(part){
    return replace[part];
  } : replace;
  return function(it){
    return String(isStatic ? it : this).replace(regExp, replacer);
  };
};
},{}],33:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var $      = require('./$')
  , assert = require('./$.assert');
function check(O, proto){
  assert.obj(O);
  assert(proto === null || $.isObject(proto), proto, ": can't set as prototype!");
}
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} // eslint-disable-line
    ? function(buggy, set){
        try {
          set = require('./$.ctx')(Function.call, $.getDesc(Object.prototype, '__proto__').set, 2);
          set({}, []);
        } catch(e){ buggy = true; }
        return function setPrototypeOf(O, proto){
          check(O, proto);
          if(buggy)O.__proto__ = proto;
          else set(O, proto);
          return O;
        };
      }()
    : undefined),
  check: check
};
},{"./$":28,"./$.assert":10,"./$.ctx":17}],34:[function(require,module,exports){
var $       = require('./$')
  , SPECIES = require('./$.wks')('species');
module.exports = function(C){
  if($.DESC && !(SPECIES in C))$.setDesc(C, SPECIES, {
    configurable: true,
    get: $.that
  });
};
},{"./$":28,"./$.wks":42}],35:[function(require,module,exports){
// true  -> String#at
// false -> String#codePointAt
var $ = require('./$');
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String($.assertDefined(that))
      , i = $.toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l
      || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
        ? TO_STRING ? s.charAt(i) : a
        : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./$":28}],36:[function(require,module,exports){
// http://wiki.ecmascript.org/doku.php?id=strawman:string_padding
var $      = require('./$')
  , repeat = require('./$.string-repeat');

module.exports = function(that, minLength, fillChar, left){
  // 1. Let O be CheckObjectCoercible(this value).
  // 2. Let S be ToString(O).
  var S = String($.assertDefined(that));
  // 4. If intMinLength is undefined, return S.
  if(minLength === undefined)return S;
  // 4. Let intMinLength be ToInteger(minLength).
  var intMinLength = $.toInteger(minLength);
  // 5. Let fillLen be the number of characters in S minus intMinLength.
  var fillLen = intMinLength - S.length;
  // 6. If fillLen < 0, then throw a RangeError exception.
  // 7. If fillLen is +∞, then throw a RangeError exception.
  if(fillLen < 0 || fillLen === Infinity){
    throw new RangeError('Cannot satisfy string length ' + minLength + ' for string: ' + S);
  }
  // 8. Let sFillStr be the string represented by fillStr.
  // 9. If sFillStr is undefined, let sFillStr be a space character.
  var sFillStr = fillChar === undefined ? ' ' : String(fillChar);
  // 10. Let sFillVal be a String made of sFillStr, repeated until fillLen is met.
  var sFillVal = repeat.call(sFillStr, Math.ceil(fillLen / sFillStr.length));
  // truncate if we overflowed
  if(sFillVal.length > fillLen)sFillVal = left
    ? sFillVal.slice(sFillVal.length - fillLen)
    : sFillVal.slice(0, fillLen);
  // 11. Return a string made from sFillVal, followed by S.
  // 11. Return a String made from S, followed by sFillVal.
  return left ? sFillVal.concat(S) : S.concat(sFillVal);
};
},{"./$":28,"./$.string-repeat":37}],37:[function(require,module,exports){
'use strict';
var $ = require('./$');

module.exports = function repeat(count){
  var str = String($.assertDefined(this))
    , res = ''
    , n   = $.toInteger(count);
  if(n < 0 || n == Infinity)throw RangeError("Count can't be negative");
  for(;n > 0; (n >>>= 1) && (str += str))if(n & 1)res += str;
  return res;
};
},{"./$":28}],38:[function(require,module,exports){
'use strict';
var $      = require('./$')
  , ctx    = require('./$.ctx')
  , cof    = require('./$.cof')
  , invoke = require('./$.invoke')
  , cel    = require('./$.dom-create')
  , global             = $.g
  , isFunction         = $.isFunction
  , html               = $.html
  , process            = global.process
  , setTask            = global.setImmediate
  , clearTask          = global.clearImmediate
  , postMessage        = global.postMessage
  , addEventListener   = global.addEventListener
  , MessageChannel     = global.MessageChannel
  , counter            = 0
  , queue              = {}
  , ONREADYSTATECHANGE = 'onreadystatechange'
  , defer, channel, port;
function run(){
  var id = +this;
  if($.has(queue, id)){
    var fn = queue[id];
    delete queue[id];
    fn();
  }
}
function listner(event){
  run.call(event.data);
}
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if(!isFunction(setTask) || !isFunction(clearTask)){
  setTask = function(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(isFunction(fn) ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function(id){
    delete queue[id];
  };
  // Node.js 0.8-
  if(cof(process) == 'process'){
    defer = function(id){
      process.nextTick(ctx(run, id, 1));
    };
  // Modern browsers, skip implementation for WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is object
  } else if(addEventListener && isFunction(postMessage) && !global.importScripts){
    defer = function(id){
      postMessage(id, '*');
    };
    addEventListener('message', listner, false);
  // WebWorkers
  } else if(isFunction(MessageChannel)){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listner;
    defer = ctx(port.postMessage, port, 1);
  // IE8-
  } else if(ONREADYSTATECHANGE in cel('script')){
    defer = function(id){
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set:   setTask,
  clear: clearTask
};
},{"./$":28,"./$.cof":12,"./$.ctx":17,"./$.dom-create":19,"./$.invoke":23}],39:[function(require,module,exports){
module.exports = function(exec){
  try {
    exec();
    return false;
  } catch(e){
    return true;
  }
};
},{}],40:[function(require,module,exports){
var sid = 0;
function uid(key){
  return 'Symbol(' + key + ')_' + (++sid + Math.random()).toString(36);
}
uid.safe = require('./$').g.Symbol || uid;
module.exports = uid;
},{"./$":28}],41:[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var $           = require('./$')
  , UNSCOPABLES = require('./$.wks')('unscopables');
if($.FW && !(UNSCOPABLES in []))$.hide(Array.prototype, UNSCOPABLES, {});
module.exports = function(key){
  if($.FW)[][UNSCOPABLES][key] = true;
};
},{"./$":28,"./$.wks":42}],42:[function(require,module,exports){
var global = require('./$').g
  , store  = {};
module.exports = function(name){
  return store[name] || (store[name] =
    global.Symbol && global.Symbol[name] || require('./$.uid').safe('Symbol.' + name));
};
},{"./$":28,"./$.uid":40}],43:[function(require,module,exports){
var $                = require('./$')
  , cel              = require('./$.dom-create')
  , cof              = require('./$.cof')
  , $def             = require('./$.def')
  , invoke           = require('./$.invoke')
  , arrayMethod      = require('./$.array-methods')
  , IE_PROTO         = require('./$.uid').safe('__proto__')
  , assert           = require('./$.assert')
  , assertObject     = assert.obj
  , ObjectProto      = Object.prototype
  , A                = []
  , slice            = A.slice
  , indexOf          = A.indexOf
  , classof          = cof.classof
  , has              = $.has
  , defineProperty   = $.setDesc
  , getOwnDescriptor = $.getDesc
  , defineProperties = $.setDescs
  , isFunction       = $.isFunction
  , toObject         = $.toObject
  , toLength         = $.toLength
  , IE8_DOM_DEFINE   = false
  , $indexOf         = require('./$.array-includes')(false)
  , $forEach         = arrayMethod(0)
  , $map             = arrayMethod(1)
  , $filter          = arrayMethod(2)
  , $some            = arrayMethod(3)
  , $every           = arrayMethod(4);

if(!$.DESC){
  try {
    IE8_DOM_DEFINE = defineProperty(cel('div'), 'x',
      {get: function(){ return 8; }}
    ).x == 8;
  } catch(e){ /* empty */ }
  $.setDesc = function(O, P, Attributes){
    if(IE8_DOM_DEFINE)try {
      return defineProperty(O, P, Attributes);
    } catch(e){ /* empty */ }
    if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
    if('value' in Attributes)assertObject(O)[P] = Attributes.value;
    return O;
  };
  $.getDesc = function(O, P){
    if(IE8_DOM_DEFINE)try {
      return getOwnDescriptor(O, P);
    } catch(e){ /* empty */ }
    if(has(O, P))return $.desc(!ObjectProto.propertyIsEnumerable.call(O, P), O[P]);
  };
  $.setDescs = defineProperties = function(O, Properties){
    assertObject(O);
    var keys   = $.getKeys(Properties)
      , length = keys.length
      , i = 0
      , P;
    while(length > i)$.setDesc(O, P = keys[i++], Properties[P]);
    return O;
  };
}
$def($def.S + $def.F * !$.DESC, 'Object', {
  // 19.1.2.6 / 15.2.3.3 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $.getDesc,
  // 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
  defineProperty: $.setDesc,
  // 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
  defineProperties: defineProperties
});

  // IE 8- don't enum bug keys
var keys1 = ('constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,' +
            'toLocaleString,toString,valueOf').split(',')
  // Additional keys for getOwnPropertyNames
  , keys2 = keys1.concat('length', 'prototype')
  , keysLen1 = keys1.length;

// Create object with `null` prototype: use iframe Object with cleared prototype
var createDict = function(){
  // Thrash, waste and sodomy: IE GC bug
  var iframe = cel('iframe')
    , i      = keysLen1
    , gt     = '>'
    , iframeDocument;
  iframe.style.display = 'none';
  $.html.appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write('<script>document.F=Object</script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while(i--)delete createDict.prototype[keys1[i]];
  return createDict();
};
function createGetKeys(names, length){
  return function(object){
    var O      = toObject(object)
      , i      = 0
      , result = []
      , key;
    for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
    // Don't enum bug & hidden keys
    while(length > i)if(has(O, key = names[i++])){
      ~indexOf.call(result, key) || result.push(key);
    }
    return result;
  };
}
function isPrimitive(it){ return !$.isObject(it); }
function Empty(){}
$def($def.S, 'Object', {
  // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
  getPrototypeOf: $.getProto = $.getProto || function(O){
    O = Object(assert.def(O));
    if(has(O, IE_PROTO))return O[IE_PROTO];
    if(isFunction(O.constructor) && O instanceof O.constructor){
      return O.constructor.prototype;
    } return O instanceof Object ? ObjectProto : null;
  },
  // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $.getNames = $.getNames || createGetKeys(keys2, keys2.length, true),
  // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
  create: $.create = $.create || function(O, /*?*/Properties){
    var result;
    if(O !== null){
      Empty.prototype = assertObject(O);
      result = new Empty();
      Empty.prototype = null;
      // add "__proto__" for Object.getPrototypeOf shim
      result[IE_PROTO] = O;
    } else result = createDict();
    return Properties === undefined ? result : defineProperties(result, Properties);
  },
  // 19.1.2.14 / 15.2.3.14 Object.keys(O)
  keys: $.getKeys = $.getKeys || createGetKeys(keys1, keysLen1, false),
  // 19.1.2.17 / 15.2.3.8 Object.seal(O)
  seal: $.it, // <- cap
  // 19.1.2.5 / 15.2.3.9 Object.freeze(O)
  freeze: $.it, // <- cap
  // 19.1.2.15 / 15.2.3.10 Object.preventExtensions(O)
  preventExtensions: $.it, // <- cap
  // 19.1.2.13 / 15.2.3.11 Object.isSealed(O)
  isSealed: isPrimitive, // <- cap
  // 19.1.2.12 / 15.2.3.12 Object.isFrozen(O)
  isFrozen: isPrimitive, // <- cap
  // 19.1.2.11 / 15.2.3.13 Object.isExtensible(O)
  isExtensible: $.isObject // <- cap
});

// 19.2.3.2 / 15.3.4.5 Function.prototype.bind(thisArg, args...)
$def($def.P, 'Function', {
  bind: function(that /*, args... */){
    var fn       = assert.fn(this)
      , partArgs = slice.call(arguments, 1);
    function bound(/* args... */){
      var args = partArgs.concat(slice.call(arguments));
      return invoke(fn, args, this instanceof bound ? $.create(fn.prototype) : that);
    }
    if(fn.prototype)bound.prototype = fn.prototype;
    return bound;
  }
});

// Fix for not array-like ES3 string
function arrayMethodFix(fn){
  return function(){
    return fn.apply($.ES5Object(this), arguments);
  };
}
if(!(0 in Object('z') && 'z'[0] == 'z')){
  $.ES5Object = function(it){
    return cof(it) == 'String' ? it.split('') : Object(it);
  };
}
$def($def.P + $def.F * ($.ES5Object != Object), 'Array', {
  slice: arrayMethodFix(slice),
  join: arrayMethodFix(A.join)
});

// 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
$def($def.S, 'Array', {
  isArray: function(arg){
    return cof(arg) == 'Array';
  }
});
function createArrayReduce(isRight){
  return function(callbackfn, memo){
    assert.fn(callbackfn);
    var O      = toObject(this)
      , length = toLength(O.length)
      , index  = isRight ? length - 1 : 0
      , i      = isRight ? -1 : 1;
    if(arguments.length < 2)for(;;){
      if(index in O){
        memo = O[index];
        index += i;
        break;
      }
      index += i;
      assert(isRight ? index >= 0 : length > index, 'Reduce of empty array with no initial value');
    }
    for(;isRight ? index >= 0 : length > index; index += i)if(index in O){
      memo = callbackfn(memo, O[index], index, this);
    }
    return memo;
  };
}
$def($def.P, 'Array', {
  // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
  forEach: $.each = $.each || function forEach(callbackfn/*, that = undefined */){
    return $forEach(this, callbackfn, arguments[1]);
  },
  // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
  map: function map(callbackfn/*, that = undefined */){
    return $map(this, callbackfn, arguments[1]);
  },
  // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
  filter: function filter(callbackfn/*, that = undefined */){
    return $filter(this, callbackfn, arguments[1]);
  },
  // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
  some: function some(callbackfn/*, that = undefined */){
    return $some(this, callbackfn, arguments[1]);
  },
  // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
  every: function every(callbackfn/*, that = undefined */){
    return $every(this, callbackfn, arguments[1]);
  },
  // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
  reduce: createArrayReduce(false),
  // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
  reduceRight: createArrayReduce(true),
  // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
  indexOf: indexOf = indexOf || function indexOf(el /*, fromIndex = 0 */){
    return $indexOf(this, el, arguments[1]);
  },
  // 22.1.3.14 / 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex])
  lastIndexOf: function(el, fromIndex /* = @[*-1] */){
    var O      = toObject(this)
      , length = toLength(O.length)
      , index  = length - 1;
    if(arguments.length > 1)index = Math.min(index, $.toInteger(fromIndex));
    if(index < 0)index = toLength(length + index);
    for(;index >= 0; index--)if(index in O)if(O[index] === el)return index;
    return -1;
  }
});

// 21.1.3.25 / 15.5.4.20 String.prototype.trim()
$def($def.P, 'String', {trim: require('./$.replacer')(/^\s*([\s\S]*\S)?\s*$/, '$1')});

// 20.3.3.1 / 15.9.4.4 Date.now()
$def($def.S, 'Date', {now: function(){
  return +new Date;
}});

function lz(num){
  return num > 9 ? num : '0' + num;
}

// 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()
// PhantomJS and old webkit had a broken Date implementation.
var date       = new Date(-5e13 - 1)
  , brokenDate = !(date.toISOString && date.toISOString() == '0385-07-25T07:06:39.999Z'
      && require('./$.throws')(function(){ new Date(NaN).toISOString(); }));
$def($def.P + $def.F * brokenDate, 'Date', {toISOString: function(){
  if(!isFinite(this))throw RangeError('Invalid time value');
  var d = this
    , y = d.getUTCFullYear()
    , m = d.getUTCMilliseconds()
    , s = y < 0 ? '-' : y > 9999 ? '+' : '';
  return s + ('00000' + Math.abs(y)).slice(s ? -6 : -4) +
    '-' + lz(d.getUTCMonth() + 1) + '-' + lz(d.getUTCDate()) +
    'T' + lz(d.getUTCHours()) + ':' + lz(d.getUTCMinutes()) +
    ':' + lz(d.getUTCSeconds()) + '.' + (m > 99 ? m : '0' + lz(m)) + 'Z';
}});

if(classof(function(){ return arguments; }()) == 'Object')cof.classof = function(it){
  var tag = classof(it);
  return tag == 'Object' && isFunction(it.callee) ? 'Arguments' : tag;
};
},{"./$":28,"./$.array-includes":8,"./$.array-methods":9,"./$.assert":10,"./$.cof":12,"./$.def":18,"./$.dom-create":19,"./$.invoke":23,"./$.replacer":32,"./$.throws":39,"./$.uid":40}],44:[function(require,module,exports){
'use strict';
var $       = require('./$')
  , $def    = require('./$.def')
  , toIndex = $.toIndex;
$def($def.P, 'Array', {
  // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
  copyWithin: function copyWithin(target/* = 0 */, start /* = 0, end = @length */){
    var O     = Object($.assertDefined(this))
      , len   = $.toLength(O.length)
      , to    = toIndex(target, len)
      , from  = toIndex(start, len)
      , end   = arguments[2]
      , fin   = end === undefined ? len : toIndex(end, len)
      , count = Math.min(fin - from, len - to)
      , inc   = 1;
    if(from < to && to < from + count){
      inc  = -1;
      from = from + count - 1;
      to   = to   + count - 1;
    }
    while(count-- > 0){
      if(from in O)O[to] = O[from];
      else delete O[to];
      to   += inc;
      from += inc;
    } return O;
  }
});
require('./$.unscope')('copyWithin');
},{"./$":28,"./$.def":18,"./$.unscope":41}],45:[function(require,module,exports){
'use strict';
var $       = require('./$')
  , $def    = require('./$.def')
  , toIndex = $.toIndex;
$def($def.P, 'Array', {
  // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
  fill: function fill(value /*, start = 0, end = @length */){
    var O      = Object($.assertDefined(this))
      , length = $.toLength(O.length)
      , index  = toIndex(arguments[1], length)
      , end    = arguments[2]
      , endPos = end === undefined ? length : toIndex(end, length);
    while(endPos > index)O[index++] = value;
    return O;
  }
});
require('./$.unscope')('fill');
},{"./$":28,"./$.def":18,"./$.unscope":41}],46:[function(require,module,exports){
'use strict';
// 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
var KEY    = 'findIndex'
  , $def   = require('./$.def')
  , forced = true
  , $find  = require('./$.array-methods')(6);
// Shouldn't skip holes
if(KEY in [])Array(1)[KEY](function(){ forced = false; });
$def($def.P + $def.F * forced, 'Array', {
  findIndex: function findIndex(callbackfn/*, that = undefined */){
    return $find(this, callbackfn, arguments[1]);
  }
});
require('./$.unscope')(KEY);
},{"./$.array-methods":9,"./$.def":18,"./$.unscope":41}],47:[function(require,module,exports){
'use strict';
// 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
var KEY    = 'find'
  , $def   = require('./$.def')
  , forced = true
  , $find  = require('./$.array-methods')(5);
// Shouldn't skip holes
if(KEY in [])Array(1)[KEY](function(){ forced = false; });
$def($def.P + $def.F * forced, 'Array', {
  find: function find(callbackfn/*, that = undefined */){
    return $find(this, callbackfn, arguments[1]);
  }
});
require('./$.unscope')(KEY);
},{"./$.array-methods":9,"./$.def":18,"./$.unscope":41}],48:[function(require,module,exports){
var $     = require('./$')
  , ctx   = require('./$.ctx')
  , $def  = require('./$.def')
  , $iter = require('./$.iter')
  , call  = require('./$.iter-call');
$def($def.S + $def.F * !require('./$.iter-detect')(function(iter){ Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
    var O       = Object($.assertDefined(arrayLike))
      , mapfn   = arguments[1]
      , mapping = mapfn !== undefined
      , f       = mapping ? ctx(mapfn, arguments[2], 2) : undefined
      , index   = 0
      , length, result, step, iterator;
    if($iter.is(O)){
      iterator = $iter.get(O);
      // strange IE quirks mode bug -> use typeof instead of isFunction
      result   = new (typeof this == 'function' ? this : Array);
      for(; !(step = iterator.next()).done; index++){
        result[index] = mapping ? call(iterator, f, [step.value, index], true) : step.value;
      }
    } else {
      // strange IE quirks mode bug -> use typeof instead of isFunction
      result = new (typeof this == 'function' ? this : Array)(length = $.toLength(O.length));
      for(; length > index; index++){
        result[index] = mapping ? f(O[index], index) : O[index];
      }
    }
    result.length = index;
    return result;
  }
});
},{"./$":28,"./$.ctx":17,"./$.def":18,"./$.iter":27,"./$.iter-call":24,"./$.iter-detect":26}],49:[function(require,module,exports){
var $          = require('./$')
  , setUnscope = require('./$.unscope')
  , ITER       = require('./$.uid').safe('iter')
  , $iter      = require('./$.iter')
  , step       = $iter.step
  , Iterators  = $iter.Iterators;

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
require('./$.iter-define')(Array, 'Array', function(iterated, kind){
  $.set(this, ITER, {o: $.toObject(iterated), i: 0, k: kind});
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var iter  = this[ITER]
    , O     = iter.o
    , kind  = iter.k
    , index = iter.i++;
  if(!O || index >= O.length){
    iter.o = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

setUnscope('keys');
setUnscope('values');
setUnscope('entries');
},{"./$":28,"./$.iter":27,"./$.iter-define":25,"./$.uid":40,"./$.unscope":41}],50:[function(require,module,exports){
var $def = require('./$.def');
$def($def.S, 'Array', {
  // 22.1.2.3 Array.of( ...items)
  of: function of(/* ...args */){
    var index  = 0
      , length = arguments.length
      // strange IE quirks mode bug -> use typeof instead of isFunction
      , result = new (typeof this == 'function' ? this : Array)(length);
    while(length > index)result[index] = arguments[index++];
    result.length = length;
    return result;
  }
});
},{"./$.def":18}],51:[function(require,module,exports){
require('./$.species')(Array);
},{"./$.species":34}],52:[function(require,module,exports){
var $             = require('./$')
  , HAS_INSTANCE  = require('./$.wks')('hasInstance')
  , FunctionProto = Function.prototype;
// 19.2.3.6 Function.prototype[@@hasInstance](V)
if(!(HAS_INSTANCE in FunctionProto))$.setDesc(FunctionProto, HAS_INSTANCE, {value: function(O){
  if(!$.isFunction(this) || !$.isObject(O))return false;
  if(!$.isObject(this.prototype))return O instanceof this;
  // for environment w/o native `@@hasInstance` logic enough `instanceof`, but add this:
  while(O = $.getProto(O))if(this.prototype === O)return true;
  return false;
}});
},{"./$":28,"./$.wks":42}],53:[function(require,module,exports){
'use strict';
var $    = require('./$')
  , NAME = 'name'
  , setDesc = $.setDesc
  , FunctionProto = Function.prototype;
// 19.2.4.2 name
NAME in FunctionProto || $.FW && $.DESC && setDesc(FunctionProto, NAME, {
  configurable: true,
  get: function(){
    var match = String(this).match(/^\s*function ([^ (]*)/)
      , name  = match ? match[1] : '';
    $.has(this, NAME) || setDesc(this, NAME, $.desc(5, name));
    return name;
  },
  set: function(value){
    $.has(this, NAME) || setDesc(this, NAME, $.desc(0, value));
  }
});
},{"./$":28}],54:[function(require,module,exports){
'use strict';
var strong = require('./$.collection-strong');

// 23.1 Map Objects
require('./$.collection')('Map', {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key){
    var entry = strong.getEntry(this, key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value){
    return strong.def(this, key === 0 ? 0 : key, value);
  }
}, strong, true);
},{"./$.collection":16,"./$.collection-strong":13}],55:[function(require,module,exports){
var Infinity = 1 / 0
  , $def  = require('./$.def')
  , E     = Math.E
  , pow   = Math.pow
  , abs   = Math.abs
  , exp   = Math.exp
  , log   = Math.log
  , sqrt  = Math.sqrt
  , ceil  = Math.ceil
  , floor = Math.floor
  , EPSILON   = pow(2, -52)
  , EPSILON32 = pow(2, -23)
  , MAX32     = pow(2, 127) * (2 - EPSILON32)
  , MIN32     = pow(2, -126);
function roundTiesToEven(n){
  return n + 1 / EPSILON - 1 / EPSILON;
}

// 20.2.2.28 Math.sign(x)
function sign(x){
  return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
}
// 20.2.2.5 Math.asinh(x)
function asinh(x){
  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : log(x + sqrt(x * x + 1));
}
// 20.2.2.14 Math.expm1(x)
function expm1(x){
  return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : exp(x) - 1;
}

$def($def.S, 'Math', {
  // 20.2.2.3 Math.acosh(x)
  acosh: function acosh(x){
    return (x = +x) < 1 ? NaN : isFinite(x) ? log(x / E + sqrt(x + 1) * sqrt(x - 1) / E) + 1 : x;
  },
  // 20.2.2.5 Math.asinh(x)
  asinh: asinh,
  // 20.2.2.7 Math.atanh(x)
  atanh: function atanh(x){
    return (x = +x) == 0 ? x : log((1 + x) / (1 - x)) / 2;
  },
  // 20.2.2.9 Math.cbrt(x)
  cbrt: function cbrt(x){
    return sign(x = +x) * pow(abs(x), 1 / 3);
  },
  // 20.2.2.11 Math.clz32(x)
  clz32: function clz32(x){
    return (x >>>= 0) ? 31 - floor(log(x + 0.5) * Math.LOG2E) : 32;
  },
  // 20.2.2.12 Math.cosh(x)
  cosh: function cosh(x){
    return (exp(x = +x) + exp(-x)) / 2;
  },
  // 20.2.2.14 Math.expm1(x)
  expm1: expm1,
  // 20.2.2.16 Math.fround(x)
  fround: function fround(x){
    var $abs  = abs(x)
      , $sign = sign(x)
      , a, result;
    if($abs < MIN32)return $sign * roundTiesToEven($abs / MIN32 / EPSILON32) * MIN32 * EPSILON32;
    a = (1 + EPSILON32 / EPSILON) * $abs;
    result = a - (a - $abs);
    if(result > MAX32 || result != result)return $sign * Infinity;
    return $sign * result;
  },
  // 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
  hypot: function hypot(value1, value2){ // eslint-disable-line no-unused-vars
    var sum  = 0
      , len1 = arguments.length
      , len2 = len1
      , args = Array(len1)
      , larg = -Infinity
      , arg;
    while(len1--){
      arg = args[len1] = +arguments[len1];
      if(arg == Infinity || arg == -Infinity)return Infinity;
      if(arg > larg)larg = arg;
    }
    larg = arg || 1;
    while(len2--)sum += pow(args[len2] / larg, 2);
    return larg * sqrt(sum);
  },
  // 20.2.2.18 Math.imul(x, y)
  imul: function imul(x, y){
    var UInt16 = 0xffff
      , xn = +x
      , yn = +y
      , xl = UInt16 & xn
      , yl = UInt16 & yn;
    return 0 | xl * yl + ((UInt16 & xn >>> 16) * yl + xl * (UInt16 & yn >>> 16) << 16 >>> 0);
  },
  // 20.2.2.20 Math.log1p(x)
  log1p: function log1p(x){
    return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : log(1 + x);
  },
  // 20.2.2.21 Math.log10(x)
  log10: function log10(x){
    return log(x) / Math.LN10;
  },
  // 20.2.2.22 Math.log2(x)
  log2: function log2(x){
    return log(x) / Math.LN2;
  },
  // 20.2.2.28 Math.sign(x)
  sign: sign,
  // 20.2.2.30 Math.sinh(x)
  sinh: function sinh(x){
    return abs(x = +x) < 1 ? (expm1(x) - expm1(-x)) / 2 : (exp(x - 1) - exp(-x - 1)) * (E / 2);
  },
  // 20.2.2.33 Math.tanh(x)
  tanh: function tanh(x){
    var a = expm1(x = +x)
      , b = expm1(-x);
    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
  },
  // 20.2.2.34 Math.trunc(x)
  trunc: function trunc(it){
    return (it > 0 ? floor : ceil)(it);
  }
});
},{"./$.def":18}],56:[function(require,module,exports){
'use strict';
var $          = require('./$')
  , isObject   = $.isObject
  , isFunction = $.isFunction
  , NUMBER     = 'Number'
  , $Number    = $.g[NUMBER]
  , Base       = $Number
  , proto      = $Number.prototype;
function toPrimitive(it){
  var fn, val;
  if(isFunction(fn = it.valueOf) && !isObject(val = fn.call(it)))return val;
  if(isFunction(fn = it.toString) && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to number");
}
function toNumber(it){
  if(isObject(it))it = toPrimitive(it);
  if(typeof it == 'string' && it.length > 2 && it.charCodeAt(0) == 48){
    var binary = false;
    switch(it.charCodeAt(1)){
      case 66 : case 98  : binary = true;
      case 79 : case 111 : return parseInt(it.slice(2), binary ? 2 : 8);
    }
  } return +it;
}
if($.FW && !($Number('0o1') && $Number('0b1'))){
  $Number = function Number(it){
    return this instanceof $Number ? new Base(toNumber(it)) : toNumber(it);
  };
  $.each.call($.DESC ? $.getNames(Base) : (
      // ES3:
      'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
      // ES6 (in case, if modules with ES6 Number statics required before):
      'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
      'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
    ).split(','), function(key){
      if($.has(Base, key) && !$.has($Number, key)){
        $.setDesc($Number, key, $.getDesc(Base, key));
      }
    }
  );
  $Number.prototype = proto;
  proto.constructor = $Number;
  $.hide($.g, NUMBER, $Number);
}
},{"./$":28}],57:[function(require,module,exports){
var $     = require('./$')
  , $def  = require('./$.def')
  , abs   = Math.abs
  , floor = Math.floor
  , _isFinite = $.g.isFinite
  , MAX_SAFE_INTEGER = 0x1fffffffffffff; // pow(2, 53) - 1 == 9007199254740991;
function isInteger(it){
  return !$.isObject(it) && _isFinite(it) && floor(it) === it;
}
$def($def.S, 'Number', {
  // 20.1.2.1 Number.EPSILON
  EPSILON: Math.pow(2, -52),
  // 20.1.2.2 Number.isFinite(number)
  isFinite: function isFinite(it){
    return typeof it == 'number' && _isFinite(it);
  },
  // 20.1.2.3 Number.isInteger(number)
  isInteger: isInteger,
  // 20.1.2.4 Number.isNaN(number)
  isNaN: function isNaN(number){
    return number != number;
  },
  // 20.1.2.5 Number.isSafeInteger(number)
  isSafeInteger: function isSafeInteger(number){
    return isInteger(number) && abs(number) <= MAX_SAFE_INTEGER;
  },
  // 20.1.2.6 Number.MAX_SAFE_INTEGER
  MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
  // 20.1.2.10 Number.MIN_SAFE_INTEGER
  MIN_SAFE_INTEGER: -MAX_SAFE_INTEGER,
  // 20.1.2.12 Number.parseFloat(string)
  parseFloat: parseFloat,
  // 20.1.2.13 Number.parseInt(string, radix)
  parseInt: parseInt
});
},{"./$":28,"./$.def":18}],58:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $def = require('./$.def');
$def($def.S, 'Object', {assign: require('./$.assign')});
},{"./$.assign":11,"./$.def":18}],59:[function(require,module,exports){
// 19.1.3.10 Object.is(value1, value2)
var $def = require('./$.def');
$def($def.S, 'Object', {
  is: function is(x, y){
    return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
  }
});
},{"./$.def":18}],60:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $def = require('./$.def');
$def($def.S, 'Object', {setPrototypeOf: require('./$.set-proto').set});
},{"./$.def":18,"./$.set-proto":33}],61:[function(require,module,exports){
var $        = require('./$')
  , $def     = require('./$.def')
  , isObject = $.isObject
  , toObject = $.toObject;
function wrapObjectMethod(METHOD, MODE){
  var fn  = ($.core.Object || {})[METHOD] || Object[METHOD]
    , f   = 0
    , o   = {};
  o[METHOD] = MODE == 1 ? function(it){
    return isObject(it) ? fn(it) : it;
  } : MODE == 2 ? function(it){
    return isObject(it) ? fn(it) : true;
  } : MODE == 3 ? function(it){
    return isObject(it) ? fn(it) : false;
  } : MODE == 4 ? function getOwnPropertyDescriptor(it, key){
    return fn(toObject(it), key);
  } : MODE == 5 ? function getPrototypeOf(it){
    return fn(Object($.assertDefined(it)));
  } : function(it){
    return fn(toObject(it));
  };
  try {
    fn('z');
  } catch(e){
    f = 1;
  }
  $def($def.S + $def.F * f, 'Object', o);
}
wrapObjectMethod('freeze', 1);
wrapObjectMethod('seal', 1);
wrapObjectMethod('preventExtensions', 1);
wrapObjectMethod('isFrozen', 2);
wrapObjectMethod('isSealed', 2);
wrapObjectMethod('isExtensible', 3);
wrapObjectMethod('getOwnPropertyDescriptor', 4);
wrapObjectMethod('getPrototypeOf', 5);
wrapObjectMethod('keys');
wrapObjectMethod('getOwnPropertyNames');
},{"./$":28,"./$.def":18}],62:[function(require,module,exports){
'use strict';
// 19.1.3.6 Object.prototype.toString()
var $   = require('./$')
  , cof = require('./$.cof')
  , tmp = {};
tmp[require('./$.wks')('toStringTag')] = 'z';
if($.FW && cof(tmp) != 'z')$.hide(Object.prototype, 'toString', function toString(){
  return '[object ' + cof.classof(this) + ']';
});
},{"./$":28,"./$.cof":12,"./$.wks":42}],63:[function(require,module,exports){
'use strict';
var $        = require('./$')
  , ctx      = require('./$.ctx')
  , cof      = require('./$.cof')
  , $def     = require('./$.def')
  , assert   = require('./$.assert')
  , forOf    = require('./$.for-of')
  , setProto = require('./$.set-proto').set
  , species  = require('./$.species')
  , SPECIES  = require('./$.wks')('species')
  , RECORD   = require('./$.uid').safe('record')
  , PROMISE  = 'Promise'
  , global   = $.g
  , process  = global.process
  , asap     = process && process.nextTick || require('./$.task').set
  , P        = global[PROMISE]
  , isFunction     = $.isFunction
  , isObject       = $.isObject
  , assertFunction = assert.fn
  , assertObject   = assert.obj;

var useNative = function(){
  var test, works = false;
  function P2(x){
    var self = new P(x);
    setProto(self, P2.prototype);
    return self;
  }
  try {
    works = isFunction(P) && isFunction(P.resolve) && P.resolve(test = new P(function(){})) == test;
    setProto(P2, P);
    P2.prototype = $.create(P.prototype, {constructor: {value: P2}});
    // actual Firefox has broken subclass support, test that
    if(!(P2.resolve(5).then(function(){}) instanceof P2)){
      works = false;
    }
  } catch(e){ works = false; }
  return works;
}();

// helpers
function getConstructor(C){
  var S = assertObject(C)[SPECIES];
  return S != undefined ? S : C;
}
function isThenable(it){
  var then;
  if(isObject(it))then = it.then;
  return isFunction(then) ? then : false;
}
function notify(record){
  var chain = record.c;
  if(chain.length)asap(function(){
    var value = record.v
      , ok    = record.s == 1
      , i     = 0;
    function run(react){
      var cb = ok ? react.ok : react.fail
        , ret, then;
      try {
        if(cb){
          if(!ok)record.h = true;
          ret = cb === true ? value : cb(value);
          if(ret === react.P){
            react.rej(TypeError('Promise-chain cycle'));
          } else if(then = isThenable(ret)){
            then.call(ret, react.res, react.rej);
          } else react.res(ret);
        } else react.rej(value);
      } catch(err){
        react.rej(err);
      }
    }
    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
    chain.length = 0;
  });
}
function isUnhandled(promise){
  var record = promise[RECORD]
    , chain  = record.a || record.c
    , i      = 0
    , react;
  if(record.h)return false;
  while(chain.length > i){
    react = chain[i++];
    if(react.fail || !isUnhandled(react.P))return false;
  } return true;
}
function $reject(value){
  var record = this
    , promise;
  if(record.d)return;
  record.d = true;
  record = record.r || record; // unwrap
  record.v = value;
  record.s = 2;
  record.a = record.c.slice();
  setTimeout(function(){
    asap(function(){
      if(isUnhandled(promise = record.p)){
        if(cof(process) == 'process'){
          process.emit('unhandledRejection', value, promise);
        } else if(global.console && isFunction(console.error)){
          console.error('Unhandled promise rejection', value);
        }
      }
      record.a = undefined;
    });
  }, 1);
  notify(record);
}
function $resolve(value){
  var record = this
    , then, wrapper;
  if(record.d)return;
  record.d = true;
  record = record.r || record; // unwrap
  try {
    if(then = isThenable(value)){
      wrapper = {r: record, d: false}; // wrap
      then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
    } else {
      record.v = value;
      record.s = 1;
      notify(record);
    }
  } catch(err){
    $reject.call(wrapper || {r: record, d: false}, err); // wrap
  }
}

// constructor polyfill
if(!useNative){
  // 25.4.3.1 Promise(executor)
  P = function Promise(executor){
    assertFunction(executor);
    var record = {
      p: assert.inst(this, P, PROMISE),       // <- promise
      c: [],                                  // <- awaiting reactions
      a: undefined,                           // <- checked in isUnhandled reactions
      s: 0,                                   // <- state
      d: false,                               // <- done
      v: undefined,                           // <- value
      h: false                                // <- handled rejection
    };
    $.hide(this, RECORD, record);
    try {
      executor(ctx($resolve, record, 1), ctx($reject, record, 1));
    } catch(err){
      $reject.call(record, err);
    }
  };
  $.mix(P.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected){
      var S = assertObject(assertObject(this).constructor)[SPECIES];
      var react = {
        ok:   isFunction(onFulfilled) ? onFulfilled : true,
        fail: isFunction(onRejected)  ? onRejected  : false
      };
      var promise = react.P = new (S != undefined ? S : P)(function(res, rej){
        react.res = assertFunction(res);
        react.rej = assertFunction(rej);
      });
      var record = this[RECORD];
      record.c.push(react);
      if(record.a)record.a.push(react);
      record.s && notify(record);
      return promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function(onRejected){
      return this.then(undefined, onRejected);
    }
  });
}

// export
$def($def.G + $def.W + $def.F * !useNative, {Promise: P});
cof.set(P, PROMISE);
species(P);
species($.core[PROMISE]); // for wrapper

// statics
$def($def.S + $def.F * !useNative, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r){
    return new (getConstructor(this))(function(res, rej){
      rej(r);
    });
  },
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x){
    return isObject(x) && RECORD in x && $.getProto(x) === this.prototype
      ? x : new (getConstructor(this))(function(res){
        res(x);
      });
  }
});
$def($def.S + $def.F * !(useNative && require('./$.iter-detect')(function(iter){
  P.all(iter)['catch'](function(){});
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable){
    var C      = getConstructor(this)
      , values = [];
    return new C(function(res, rej){
      forOf(iterable, false, values.push, values);
      var remaining = values.length
        , results   = Array(remaining);
      if(remaining)$.each.call(values, function(promise, index){
        C.resolve(promise).then(function(value){
          results[index] = value;
          --remaining || res(results);
        }, rej);
      });
      else res(results);
    });
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable){
    var C = getConstructor(this);
    return new C(function(res, rej){
      forOf(iterable, false, function(promise){
        C.resolve(promise).then(res, rej);
      });
    });
  }
});
},{"./$":28,"./$.assert":10,"./$.cof":12,"./$.ctx":17,"./$.def":18,"./$.for-of":21,"./$.iter-detect":26,"./$.set-proto":33,"./$.species":34,"./$.task":38,"./$.uid":40,"./$.wks":42}],64:[function(require,module,exports){
var $         = require('./$')
  , $def      = require('./$.def')
  , setProto  = require('./$.set-proto')
  , $iter     = require('./$.iter')
  , ITERATOR  = require('./$.wks')('iterator')
  , ITER      = require('./$.uid').safe('iter')
  , step      = $iter.step
  , assert    = require('./$.assert')
  , isObject  = $.isObject
  , getProto  = $.getProto
  , $Reflect  = $.g.Reflect
  , _apply    = Function.apply
  , assertObject = assert.obj
  , _isExtensible = Object.isExtensible || $.isObject
  , _preventExtensions = Object.preventExtensions || $.it
  // IE TP has broken Reflect.enumerate
  , buggyEnumerate = !($Reflect && $Reflect.enumerate && ITERATOR in $Reflect.enumerate({}));

function Enumerate(iterated){
  $.set(this, ITER, {o: iterated, k: undefined, i: 0});
}
$iter.create(Enumerate, 'Object', function(){
  var iter = this[ITER]
    , keys = iter.k
    , key;
  if(keys == undefined){
    iter.k = keys = [];
    for(key in iter.o)keys.push(key);
  }
  do {
    if(iter.i >= keys.length)return step(1);
  } while(!((key = keys[iter.i++]) in iter.o));
  return step(0, key);
});

var reflect = {
  // 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
  apply: function apply(target, thisArgument, argumentsList){
    return _apply.call(target, thisArgument, argumentsList);
  },
  // 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
  construct: function construct(target, argumentsList /*, newTarget*/){
    var proto    = assert.fn(arguments.length < 3 ? target : arguments[2]).prototype
      , instance = $.create(isObject(proto) ? proto : Object.prototype)
      , result   = _apply.call(target, instance, argumentsList);
    return isObject(result) ? result : instance;
  },
  // 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
  defineProperty: function defineProperty(target, propertyKey, attributes){
    assertObject(target);
    try {
      $.setDesc(target, propertyKey, attributes);
      return true;
    } catch(e){
      return false;
    }
  },
  // 26.1.4 Reflect.deleteProperty(target, propertyKey)
  deleteProperty: function deleteProperty(target, propertyKey){
    var desc = $.getDesc(assertObject(target), propertyKey);
    return desc && !desc.configurable ? false : delete target[propertyKey];
  },
  // 26.1.6 Reflect.get(target, propertyKey [, receiver])
  get: function get(target, propertyKey/*, receiver*/){
    var receiver = arguments.length < 3 ? target : arguments[2]
      , desc = $.getDesc(assertObject(target), propertyKey), proto;
    if(desc)return $.has(desc, 'value')
      ? desc.value
      : desc.get === undefined
        ? undefined
        : desc.get.call(receiver);
    return isObject(proto = getProto(target))
      ? get(proto, propertyKey, receiver)
      : undefined;
  },
  // 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey){
    return $.getDesc(assertObject(target), propertyKey);
  },
  // 26.1.8 Reflect.getPrototypeOf(target)
  getPrototypeOf: function getPrototypeOf(target){
    return getProto(assertObject(target));
  },
  // 26.1.9 Reflect.has(target, propertyKey)
  has: function has(target, propertyKey){
    return propertyKey in target;
  },
  // 26.1.10 Reflect.isExtensible(target)
  isExtensible: function isExtensible(target){
    return _isExtensible(assertObject(target));
  },
  // 26.1.11 Reflect.ownKeys(target)
  ownKeys: require('./$.own-keys'),
  // 26.1.12 Reflect.preventExtensions(target)
  preventExtensions: function preventExtensions(target){
    assertObject(target);
    try {
      _preventExtensions(target);
      return true;
    } catch(e){
      return false;
    }
  },
  // 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
  set: function set(target, propertyKey, V/*, receiver*/){
    var receiver = arguments.length < 4 ? target : arguments[3]
      , ownDesc  = $.getDesc(assertObject(target), propertyKey)
      , existingDescriptor, proto;
    if(!ownDesc){
      if(isObject(proto = getProto(target))){
        return set(proto, propertyKey, V, receiver);
      }
      ownDesc = $.desc(0);
    }
    if($.has(ownDesc, 'value')){
      if(ownDesc.writable === false || !isObject(receiver))return false;
      existingDescriptor = $.getDesc(receiver, propertyKey) || $.desc(0);
      existingDescriptor.value = V;
      $.setDesc(receiver, propertyKey, existingDescriptor);
      return true;
    }
    return ownDesc.set === undefined ? false : (ownDesc.set.call(receiver, V), true);
  }
};
// 26.1.14 Reflect.setPrototypeOf(target, proto)
if(setProto)reflect.setPrototypeOf = function setPrototypeOf(target, proto){
  setProto.check(target, proto);
  try {
    setProto.set(target, proto);
    return true;
  } catch(e){
    return false;
  }
};

$def($def.G, {Reflect: {}});

$def($def.S + $def.F * buggyEnumerate, 'Reflect', {
  // 26.1.5 Reflect.enumerate(target)
  enumerate: function enumerate(target){
    return new Enumerate(assertObject(target));
  }
});

$def($def.S, 'Reflect', reflect);
},{"./$":28,"./$.assert":10,"./$.def":18,"./$.iter":27,"./$.own-keys":30,"./$.set-proto":33,"./$.uid":40,"./$.wks":42}],65:[function(require,module,exports){
var $       = require('./$')
  , cof     = require('./$.cof')
  , $RegExp = $.g.RegExp
  , Base    = $RegExp
  , proto   = $RegExp.prototype
  , re      = /a/g
  // "new" creates a new object
  , CORRECT_NEW = new $RegExp(re) !== re
  // RegExp allows a regex with flags as the pattern
  , ALLOWS_RE_WITH_FLAGS = function(){
    try {
      return $RegExp(re, 'i') == '/a/i';
    } catch(e){ /* empty */ }
  }();
if($.FW && $.DESC){
  if(!CORRECT_NEW || !ALLOWS_RE_WITH_FLAGS){
    $RegExp = function RegExp(pattern, flags){
      var patternIsRegExp  = cof(pattern) == 'RegExp'
        , flagsIsUndefined = flags === undefined;
      if(!(this instanceof $RegExp) && patternIsRegExp && flagsIsUndefined)return pattern;
      return CORRECT_NEW
        ? new Base(patternIsRegExp && !flagsIsUndefined ? pattern.source : pattern, flags)
        : new Base(patternIsRegExp ? pattern.source : pattern
          , patternIsRegExp && flagsIsUndefined ? pattern.flags : flags);
    };
    $.each.call($.getNames(Base), function(key){
      key in $RegExp || $.setDesc($RegExp, key, {
        configurable: true,
        get: function(){ return Base[key]; },
        set: function(it){ Base[key] = it; }
      });
    });
    proto.constructor = $RegExp;
    $RegExp.prototype = proto;
    $.hide($.g, 'RegExp', $RegExp);
  }
  // 21.2.5.3 get RegExp.prototype.flags()
  if(/./g.flags != 'g')$.setDesc(proto, 'flags', {
    configurable: true,
    get: require('./$.replacer')(/^.*\/(\w*)$/, '$1')
  });
}
require('./$.species')($RegExp);
},{"./$":28,"./$.cof":12,"./$.replacer":32,"./$.species":34}],66:[function(require,module,exports){
'use strict';
var strong = require('./$.collection-strong');

// 23.2 Set Objects
require('./$.collection')('Set', {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value){
    return strong.def(this, value = value === 0 ? 0 : value, value);
  }
}, strong);
},{"./$.collection":16,"./$.collection-strong":13}],67:[function(require,module,exports){
'use strict';
var $def = require('./$.def')
  , $at  = require('./$.string-at')(false);
$def($def.P, 'String', {
  // 21.1.3.3 String.prototype.codePointAt(pos)
  codePointAt: function codePointAt(pos){
    return $at(this, pos);
  }
});
},{"./$.def":18,"./$.string-at":35}],68:[function(require,module,exports){
'use strict';
var $    = require('./$')
  , cof  = require('./$.cof')
  , $def = require('./$.def')
  , toLength = $.toLength;

// should throw error on regex
$def($def.P + $def.F * !require('./$.throws')(function(){ 'q'.endsWith(/./); }), 'String', {
  // 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
  endsWith: function endsWith(searchString /*, endPosition = @length */){
    if(cof(searchString) == 'RegExp')throw TypeError();
    var that = String($.assertDefined(this))
      , endPosition = arguments[1]
      , len = toLength(that.length)
      , end = endPosition === undefined ? len : Math.min(toLength(endPosition), len);
    searchString += '';
    return that.slice(end - searchString.length, end) === searchString;
  }
});
},{"./$":28,"./$.cof":12,"./$.def":18,"./$.throws":39}],69:[function(require,module,exports){
var $def    = require('./$.def')
  , toIndex = require('./$').toIndex
  , fromCharCode = String.fromCharCode
  , $fromCodePoint = String.fromCodePoint;

// length should be 1, old FF problem
$def($def.S + $def.F * (!!$fromCodePoint && $fromCodePoint.length != 1), 'String', {
  // 21.1.2.2 String.fromCodePoint(...codePoints)
  fromCodePoint: function fromCodePoint(x){ // eslint-disable-line no-unused-vars
    var res = []
      , len = arguments.length
      , i   = 0
      , code;
    while(len > i){
      code = +arguments[i++];
      if(toIndex(code, 0x10ffff) !== code)throw RangeError(code + ' is not a valid code point');
      res.push(code < 0x10000
        ? fromCharCode(code)
        : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
      );
    } return res.join('');
  }
});
},{"./$":28,"./$.def":18}],70:[function(require,module,exports){
'use strict';
var $    = require('./$')
  , cof  = require('./$.cof')
  , $def = require('./$.def');

$def($def.P, 'String', {
  // 21.1.3.7 String.prototype.includes(searchString, position = 0)
  includes: function includes(searchString /*, position = 0 */){
    if(cof(searchString) == 'RegExp')throw TypeError();
    return !!~String($.assertDefined(this)).indexOf(searchString, arguments[1]);
  }
});
},{"./$":28,"./$.cof":12,"./$.def":18}],71:[function(require,module,exports){
var set   = require('./$').set
  , $at   = require('./$.string-at')(true)
  , ITER  = require('./$.uid').safe('iter')
  , $iter = require('./$.iter')
  , step  = $iter.step;

// 21.1.3.27 String.prototype[@@iterator]()
require('./$.iter-define')(String, 'String', function(iterated){
  set(this, ITER, {o: String(iterated), i: 0});
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var iter  = this[ITER]
    , O     = iter.o
    , index = iter.i
    , point;
  if(index >= O.length)return step(1);
  point = $at(O, index);
  iter.i += point.length;
  return step(0, point);
});
},{"./$":28,"./$.iter":27,"./$.iter-define":25,"./$.string-at":35,"./$.uid":40}],72:[function(require,module,exports){
var $    = require('./$')
  , $def = require('./$.def');

$def($def.S, 'String', {
  // 21.1.2.4 String.raw(callSite, ...substitutions)
  raw: function raw(callSite){
    var tpl = $.toObject(callSite.raw)
      , len = $.toLength(tpl.length)
      , sln = arguments.length
      , res = []
      , i   = 0;
    while(len > i){
      res.push(String(tpl[i++]));
      if(i < sln)res.push(String(arguments[i]));
    } return res.join('');
  }
});
},{"./$":28,"./$.def":18}],73:[function(require,module,exports){
var $def = require('./$.def');

$def($def.P, 'String', {
  // 21.1.3.13 String.prototype.repeat(count)
  repeat: require('./$.string-repeat')
});
},{"./$.def":18,"./$.string-repeat":37}],74:[function(require,module,exports){
'use strict';
var $    = require('./$')
  , cof  = require('./$.cof')
  , $def = require('./$.def');

// should throw error on regex
$def($def.P + $def.F * !require('./$.throws')(function(){ 'q'.startsWith(/./); }), 'String', {
  // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
  startsWith: function startsWith(searchString /*, position = 0 */){
    if(cof(searchString) == 'RegExp')throw TypeError();
    var that  = String($.assertDefined(this))
      , index = $.toLength(Math.min(arguments[1], that.length));
    searchString += '';
    return that.slice(index, index + searchString.length) === searchString;
  }
});
},{"./$":28,"./$.cof":12,"./$.def":18,"./$.throws":39}],75:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var $        = require('./$')
  , setTag   = require('./$.cof').set
  , uid      = require('./$.uid')
  , $def     = require('./$.def')
  , keyOf    = require('./$.keyof')
  , enumKeys = require('./$.enum-keys')
  , assertObject = require('./$.assert').obj
  , has      = $.has
  , $create  = $.create
  , getDesc  = $.getDesc
  , setDesc  = $.setDesc
  , desc     = $.desc
  , getNames = $.getNames
  , toObject = $.toObject
  , $Symbol  = $.g.Symbol
  , setter   = false
  , TAG      = uid('tag')
  , HIDDEN   = uid('hidden')
  , SymbolRegistry = {}
  , AllSymbols = {}
  , useNative = $.isFunction($Symbol);

function wrap(tag){
  var sym = AllSymbols[tag] = $.set($create($Symbol.prototype), TAG, tag);
  $.DESC && setter && setDesc(Object.prototype, tag, {
    configurable: true,
    set: function(value){
      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
      setDesc(this, tag, desc(1, value));
    }
  });
  return sym;
}

function defineProperty(it, key, D){
  if(D && has(AllSymbols, key)){
    if(!D.enumerable){
      if(!has(it, HIDDEN))setDesc(it, HIDDEN, desc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
      D.enumerable = false;
    }
  } return setDesc(it, key, D);
}
function defineProperties(it, P){
  assertObject(it);
  var keys = enumKeys(P = toObject(P))
    , i    = 0
    , l = keys.length
    , key;
  while(l > i)defineProperty(it, key = keys[i++], P[key]);
  return it;
}
function create(it, P){
  return P === undefined ? $create(it) : defineProperties($create(it), P);
}
function getOwnPropertyDescriptor(it, key){
  var D = getDesc(it = toObject(it), key);
  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
  return D;
}
function getOwnPropertyNames(it){
  var names  = getNames(toObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i)if(!has(AllSymbols, key = names[i++]) && key != HIDDEN)result.push(key);
  return result;
}
function getOwnPropertySymbols(it){
  var names  = getNames(toObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i)if(has(AllSymbols, key = names[i++]))result.push(AllSymbols[key]);
  return result;
}

// 19.4.1.1 Symbol([description])
if(!useNative){
  $Symbol = function Symbol(description){
    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor');
    return wrap(uid(description));
  };
  $.hide($Symbol.prototype, 'toString', function(){
    return this[TAG];
  });

  $.create     = create;
  $.setDesc    = defineProperty;
  $.getDesc    = getOwnPropertyDescriptor;
  $.setDescs   = defineProperties;
  $.getNames   = getOwnPropertyNames;
  $.getSymbols = getOwnPropertySymbols;
}

var symbolStatics = {
  // 19.4.2.1 Symbol.for(key)
  'for': function(key){
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(key){
    return keyOf(SymbolRegistry, key);
  },
  useSetter: function(){ setter = true; },
  useSimple: function(){ setter = false; }
};
// 19.4.2.2 Symbol.hasInstance
// 19.4.2.3 Symbol.isConcatSpreadable
// 19.4.2.4 Symbol.iterator
// 19.4.2.6 Symbol.match
// 19.4.2.8 Symbol.replace
// 19.4.2.9 Symbol.search
// 19.4.2.10 Symbol.species
// 19.4.2.11 Symbol.split
// 19.4.2.12 Symbol.toPrimitive
// 19.4.2.13 Symbol.toStringTag
// 19.4.2.14 Symbol.unscopables
$.each.call((
    'hasInstance,isConcatSpreadable,iterator,match,replace,search,' +
    'species,split,toPrimitive,toStringTag,unscopables'
  ).split(','), function(it){
    var sym = require('./$.wks')(it);
    symbolStatics[it] = useNative ? sym : wrap(sym);
  }
);

setter = true;

$def($def.G + $def.W, {Symbol: $Symbol});

$def($def.S, 'Symbol', symbolStatics);

$def($def.S + $def.F * !useNative, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: getOwnPropertySymbols
});

// 19.4.3.5 Symbol.prototype[@@toStringTag]
setTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setTag($.g.JSON, 'JSON', true);
},{"./$":28,"./$.assert":10,"./$.cof":12,"./$.def":18,"./$.enum-keys":20,"./$.keyof":29,"./$.uid":40,"./$.wks":42}],76:[function(require,module,exports){
'use strict';
var $         = require('./$')
  , weak      = require('./$.collection-weak')
  , leakStore = weak.leakStore
  , ID        = weak.ID
  , WEAK      = weak.WEAK
  , has       = $.has
  , isObject  = $.isObject
  , isFrozen  = Object.isFrozen || $.core.Object.isFrozen
  , tmp       = {};

// 23.3 WeakMap Objects
var WeakMap = require('./$.collection')('WeakMap', {
  // 23.3.3.3 WeakMap.prototype.get(key)
  get: function get(key){
    if(isObject(key)){
      if(isFrozen(key))return leakStore(this).get(key);
      if(has(key, WEAK))return key[WEAK][this[ID]];
    }
  },
  // 23.3.3.5 WeakMap.prototype.set(key, value)
  set: function set(key, value){
    return weak.def(this, key, value);
  }
}, weak, true, true);

// IE11 WeakMap frozen keys fix
if($.FW && new WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7){
  $.each.call(['delete', 'has', 'get', 'set'], function(key){
    var method = WeakMap.prototype[key];
    WeakMap.prototype[key] = function(a, b){
      // store frozen objects on leaky map
      if(isObject(a) && isFrozen(a)){
        var result = leakStore(this)[key](a, b);
        return key == 'set' ? this : result;
      // store all the rest on native weakmap
      } return method.call(this, a, b);
    };
  });
}
},{"./$":28,"./$.collection":16,"./$.collection-weak":15}],77:[function(require,module,exports){
'use strict';
var weak = require('./$.collection-weak');

// 23.4 WeakSet Objects
require('./$.collection')('WeakSet', {
  // 23.4.3.1 WeakSet.prototype.add(value)
  add: function add(value){
    return weak.def(this, value, true);
  }
}, weak, false, true);
},{"./$.collection":16,"./$.collection-weak":15}],78:[function(require,module,exports){
// https://github.com/domenic/Array.prototype.includes
var $def      = require('./$.def')
  , $includes = require('./$.array-includes')(true);
$def($def.P, 'Array', {
  includes: function includes(el /*, fromIndex = 0 */){
    return $includes(this, el, arguments[1]);
  }
});
require('./$.unscope')('includes');
},{"./$.array-includes":8,"./$.def":18,"./$.unscope":41}],79:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
require('./$.collection-to-json')('Map');
},{"./$.collection-to-json":14}],80:[function(require,module,exports){
// https://gist.github.com/WebReflection/9353781
var $       = require('./$')
  , $def    = require('./$.def')
  , ownKeys = require('./$.own-keys');

$def($def.S, 'Object', {
  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object){
    var O      = $.toObject(object)
      , result = {};
    $.each.call(ownKeys(O), function(key){
      $.setDesc(result, key, $.desc(0, $.getDesc(O, key)));
    });
    return result;
  }
});
},{"./$":28,"./$.def":18,"./$.own-keys":30}],81:[function(require,module,exports){
// http://goo.gl/XkBrjD
var $    = require('./$')
  , $def = require('./$.def');
function createObjectToArray(isEntries){
  return function(object){
    var O      = $.toObject(object)
      , keys   = $.getKeys(O)
      , length = keys.length
      , i      = 0
      , result = Array(length)
      , key;
    if(isEntries)while(length > i)result[i] = [key = keys[i++], O[key]];
    else while(length > i)result[i] = O[keys[i++]];
    return result;
  };
}
$def($def.S, 'Object', {
  values:  createObjectToArray(false),
  entries: createObjectToArray(true)
});
},{"./$":28,"./$.def":18}],82:[function(require,module,exports){
// https://gist.github.com/kangax/9698100
var $def = require('./$.def');
$def($def.S, 'RegExp', {
  escape: require('./$.replacer')(/([\\\-[\]{}()*+?.,^$|])/g, '\\$1', true)
});
},{"./$.def":18,"./$.replacer":32}],83:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
require('./$.collection-to-json')('Set');
},{"./$.collection-to-json":14}],84:[function(require,module,exports){
// https://github.com/mathiasbynens/String.prototype.at
'use strict';
var $def = require('./$.def')
  , $at  = require('./$.string-at')(true);
$def($def.P, 'String', {
  at: function at(pos){
    return $at(this, pos);
  }
});
},{"./$.def":18,"./$.string-at":35}],85:[function(require,module,exports){
'use strict';
var $def = require('./$.def')
  , $pad = require('./$.string-pad');
$def($def.P, 'String', {
  lpad: function lpad(n){
    return $pad(this, n, arguments[1], true);
  }
});
},{"./$.def":18,"./$.string-pad":36}],86:[function(require,module,exports){
'use strict';
var $def = require('./$.def')
  , $pad = require('./$.string-pad');
$def($def.P, 'String', {
  rpad: function rpad(n){
    return $pad(this, n, arguments[1], false);
  }
});
},{"./$.def":18,"./$.string-pad":36}],87:[function(require,module,exports){
// JavaScript 1.6 / Strawman array statics shim
var $       = require('./$')
  , $def    = require('./$.def')
  , $Array  = $.core.Array || Array
  , statics = {};
function setStatics(keys, length){
  $.each.call(keys.split(','), function(key){
    if(length == undefined && key in $Array)statics[key] = $Array[key];
    else if(key in [])statics[key] = require('./$.ctx')(Function.call, [][key], length);
  });
}
setStatics('pop,reverse,shift,keys,values,entries', 1);
setStatics('indexOf,every,some,forEach,map,filter,find,findIndex,includes', 3);
setStatics('join,slice,concat,push,splice,unshift,sort,lastIndexOf,' +
           'reduce,reduceRight,copyWithin,fill,turn');
$def($def.S, 'Array', statics);
},{"./$":28,"./$.ctx":17,"./$.def":18}],88:[function(require,module,exports){
require('./es6.array.iterator');
var $           = require('./$')
  , Iterators   = require('./$.iter').Iterators
  , ITERATOR    = require('./$.wks')('iterator')
  , ArrayValues = Iterators.Array
  , NodeList    = $.g.NodeList;
if($.FW && NodeList && !(ITERATOR in NodeList.prototype)){
  $.hide(NodeList.prototype, ITERATOR, ArrayValues);
}
Iterators.NodeList = ArrayValues;
},{"./$":28,"./$.iter":27,"./$.wks":42,"./es6.array.iterator":49}],89:[function(require,module,exports){
var $def  = require('./$.def')
  , $task = require('./$.task');
$def($def.G + $def.B, {
  setImmediate:   $task.set,
  clearImmediate: $task.clear
});
},{"./$.def":18,"./$.task":38}],90:[function(require,module,exports){
// ie9- setTimeout & setInterval additional parameters fix
var $         = require('./$')
  , $def      = require('./$.def')
  , invoke    = require('./$.invoke')
  , partial   = require('./$.partial')
  , navigator = $.g.navigator
  , MSIE      = !!navigator && /MSIE .\./.test(navigator.userAgent); // <- dirty ie9- check
function wrap(set){
  return MSIE ? function(fn, time /*, ...args */){
    return set(invoke(
      partial,
      [].slice.call(arguments, 2),
      $.isFunction(fn) ? fn : Function(fn)
    ), time);
  } : set;
}
$def($def.G + $def.B + $def.F * MSIE, {
  setTimeout:  wrap($.g.setTimeout),
  setInterval: wrap($.g.setInterval)
});
},{"./$":28,"./$.def":18,"./$.invoke":23,"./$.partial":31}],91:[function(require,module,exports){
require('./modules/es5');
require('./modules/es6.symbol');
require('./modules/es6.object.assign');
require('./modules/es6.object.is');
require('./modules/es6.object.set-prototype-of');
require('./modules/es6.object.to-string');
require('./modules/es6.object.statics-accept-primitives');
require('./modules/es6.function.name');
require('./modules/es6.function.has-instance');
require('./modules/es6.number.constructor');
require('./modules/es6.number.statics');
require('./modules/es6.math');
require('./modules/es6.string.from-code-point');
require('./modules/es6.string.raw');
require('./modules/es6.string.iterator');
require('./modules/es6.string.code-point-at');
require('./modules/es6.string.ends-with');
require('./modules/es6.string.includes');
require('./modules/es6.string.repeat');
require('./modules/es6.string.starts-with');
require('./modules/es6.array.from');
require('./modules/es6.array.of');
require('./modules/es6.array.iterator');
require('./modules/es6.array.species');
require('./modules/es6.array.copy-within');
require('./modules/es6.array.fill');
require('./modules/es6.array.find');
require('./modules/es6.array.find-index');
require('./modules/es6.regexp');
require('./modules/es6.promise');
require('./modules/es6.map');
require('./modules/es6.set');
require('./modules/es6.weak-map');
require('./modules/es6.weak-set');
require('./modules/es6.reflect');
require('./modules/es7.array.includes');
require('./modules/es7.string.at');
require('./modules/es7.string.lpad');
require('./modules/es7.string.rpad');
require('./modules/es7.regexp.escape');
require('./modules/es7.object.get-own-property-descriptors');
require('./modules/es7.object.to-array');
require('./modules/es7.map.to-json');
require('./modules/es7.set.to-json');
require('./modules/js.array.statics');
require('./modules/web.timers');
require('./modules/web.immediate');
require('./modules/web.dom.iterable');
module.exports = require('./modules/$').core;

},{"./modules/$":28,"./modules/es5":43,"./modules/es6.array.copy-within":44,"./modules/es6.array.fill":45,"./modules/es6.array.find":47,"./modules/es6.array.find-index":46,"./modules/es6.array.from":48,"./modules/es6.array.iterator":49,"./modules/es6.array.of":50,"./modules/es6.array.species":51,"./modules/es6.function.has-instance":52,"./modules/es6.function.name":53,"./modules/es6.map":54,"./modules/es6.math":55,"./modules/es6.number.constructor":56,"./modules/es6.number.statics":57,"./modules/es6.object.assign":58,"./modules/es6.object.is":59,"./modules/es6.object.set-prototype-of":60,"./modules/es6.object.statics-accept-primitives":61,"./modules/es6.object.to-string":62,"./modules/es6.promise":63,"./modules/es6.reflect":64,"./modules/es6.regexp":65,"./modules/es6.set":66,"./modules/es6.string.code-point-at":67,"./modules/es6.string.ends-with":68,"./modules/es6.string.from-code-point":69,"./modules/es6.string.includes":70,"./modules/es6.string.iterator":71,"./modules/es6.string.raw":72,"./modules/es6.string.repeat":73,"./modules/es6.string.starts-with":74,"./modules/es6.symbol":75,"./modules/es6.weak-map":76,"./modules/es6.weak-set":77,"./modules/es7.array.includes":78,"./modules/es7.map.to-json":79,"./modules/es7.object.get-own-property-descriptors":80,"./modules/es7.object.to-array":81,"./modules/es7.regexp.escape":82,"./modules/es7.set.to-json":83,"./modules/es7.string.at":84,"./modules/es7.string.lpad":85,"./modules/es7.string.rpad":86,"./modules/js.array.statics":87,"./modules/web.dom.iterable":88,"./modules/web.immediate":89,"./modules/web.timers":90}],92:[function(require,module,exports){
(function (global){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

!(function(global) {
  "use strict";

  var hasOwn = Object.prototype.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var iteratorSymbol =
    typeof Symbol === "function" && Symbol.iterator || "@@iterator";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided, then outerFn.prototype instanceof Generator.
    var generator = Object.create((outerFn || Generator).prototype);

    generator._invoke = makeInvokeMethod(
      innerFn, self || null,
      new Context(tryLocsList || [])
    );

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = "GeneratorFunction";

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    genFun.__proto__ = GeneratorFunctionPrototype;
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    return new Promise(function(resolve, reject) {
      var generator = wrap(innerFn, outerFn, self, tryLocsList);
      var callNext = step.bind(generator, "next");
      var callThrow = step.bind(generator, "throw");

      function step(method, arg) {
        var record = tryCatch(generator[method], generator, arg);
        if (record.type === "throw") {
          reject(record.arg);
          return;
        }

        var info = record.arg;
        if (info.done) {
          resolve(info.value);
        } else {
          Promise.resolve(info.value).then(callNext, callThrow);
        }
      }

      callNext();
    });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          if (method === "return" ||
              (method === "throw" && delegate.iterator[method] === undefined)) {
            // A return or throw (when the delegate iterator has no throw
            // method) always terminates the yield* loop.
            context.delegate = null;

            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            var returnMethod = delegate.iterator["return"];
            if (returnMethod) {
              var record = tryCatch(returnMethod, delegate.iterator, arg);
              if (record.type === "throw") {
                // If the return method threw an exception, let that
                // exception prevail over the original return or throw.
                method = "throw";
                arg = record.arg;
                continue;
              }
            }

            if (method === "return") {
              // Continue with the outer return, now that the delegate
              // iterator has been terminated.
              continue;
            }
          }

          var record = tryCatch(
            delegate.iterator[method],
            delegate.iterator,
            arg
          );

          if (record.type === "throw") {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = record.arg;
            continue;
          }

          // Delegate generator ran and handled its own exceptions so
          // regardless of what the method was, we continue as if it is
          // "next" with an undefined arg.
          method = "next";
          arg = undefined;

          var info = record.arg;
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            state = GenStateSuspendedYield;
            return info;
          }

          context.delegate = null;
        }

        if (method === "next") {
          if (state === GenStateSuspendedYield) {
            context.sent = arg;
          } else {
            delete context.sent;
          }

        } else if (method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw arg;
          }

          if (context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined;
          }

        } else if (method === "return") {
          context.abrupt("return", arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          var info = {
            value: record.arg,
            done: context.done
          };

          if (record.arg === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(arg) call above.
          method = "throw";
          arg = record.arg;
        }
      }
    };
  }

  function defineGeneratorMethod(method) {
    Gp[method] = function(arg) {
      return this._invoke(method, arg);
    };
  }
  defineGeneratorMethod("next");
  defineGeneratorMethod("throw");
  defineGeneratorMethod("return");

  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset();
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function() {
      this.prev = 0;
      this.next = 0;
      this.sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      // Pre-initialize at least 20 temporary variables to enable hidden
      // class optimizations for simple generators.
      for (var tempIndex = 0, tempName;
           hasOwn.call(this, tempName = "t" + tempIndex) || tempIndex < 20;
           ++tempIndex) {
        this[tempName] = null;
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.next = finallyEntry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          return this.complete(entry.completion, entry.afterLoc);
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };
})(
  // Among the various tricks for obtaining a reference to the global
  // object, this seems to be the most reliable technique that does not
  // use indirect eval (which violates Content Security Policy).
  typeof global === "object" ? global :
  typeof window === "object" ? window :
  typeof self === "object" ? self : this
);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],93:[function(require,module,exports){
module.exports = require("./lib/babel/polyfill");

},{"./lib/babel/polyfill":7}],94:[function(require,module,exports){
"use strict";

module.exports = require("babel-core/polyfill");

},{"babel-core/polyfill":93}]},{},[1,94])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvWWlqdW4vY29kZS9saWIvYXovYXBwL21haW4uanMiLCIvVXNlcnMvWWlqdW4vY29kZS9saWIvYXovYXBwL3ByZWYuanN4IiwiL1VzZXJzL1lpanVuL2NvZGUvbGliL2F6L2FwcC9yZWcuanMiLCIvVXNlcnMvWWlqdW4vY29kZS9saWIvYXovYXBwL3NpbXAuanMiLCIvVXNlcnMvWWlqdW4vY29kZS9saWIvYXovYXBwL3V0aWwuanMiLCIvVXNlcnMvWWlqdW4vY29kZS9saWIvYXovYXBwL3ZpZXcuanN4Iiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL2xpYi9iYWJlbC9wb2x5ZmlsbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuYXJyYXktaW5jbHVkZXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmFycmF5LW1ldGhvZHMuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmFzc2VydC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuYXNzaWduLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5jb2YuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmNvbGxlY3Rpb24tc3Ryb25nLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5jb2xsZWN0aW9uLXRvLWpzb24uanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmNvbGxlY3Rpb24td2Vhay5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuY29sbGVjdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuY3R4LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5kZWYuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmRvbS1jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmVudW0ta2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuZm9yLW9mLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5mdy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuaW52b2tlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5pdGVyLWNhbGwuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLml0ZXItZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5pdGVyLWRldGVjdC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuaXRlci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmtleW9mLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5vd24ta2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQucGFydGlhbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQucmVwbGFjZXIuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnNldC1wcm90by5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuc3BlY2llcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuc3RyaW5nLWF0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5zdHJpbmctcGFkLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5zdHJpbmctcmVwZWF0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC50YXNrLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC50aHJvd3MuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnVpZC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQudW5zY29wZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQud2tzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM1LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LmFycmF5LmNvcHktd2l0aGluLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LmFycmF5LmZpbGwuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuZmluZC1pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5hcnJheS5maW5kLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LmFycmF5LmZyb20uanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuaXRlcmF0b3IuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkub2YuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuc3BlY2llcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5mdW5jdGlvbi5oYXMtaW5zdGFuY2UuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuZnVuY3Rpb24ubmFtZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5tYXAuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYubWF0aC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5udW1iZXIuY29uc3RydWN0b3IuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYubnVtYmVyLnN0YXRpY3MuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYub2JqZWN0LmFzc2lnbi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5vYmplY3QuaXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYub2JqZWN0LnNldC1wcm90b3R5cGUtb2YuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYub2JqZWN0LnN0YXRpY3MtYWNjZXB0LXByaW1pdGl2ZXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5wcm9taXNlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnJlZmxlY3QuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYucmVnZXhwLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnNldC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5zdHJpbmcuY29kZS1wb2ludC1hdC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5zdHJpbmcuZW5kcy13aXRoLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN0cmluZy5mcm9tLWNvZGUtcG9pbnQuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc3RyaW5nLmluY2x1ZGVzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5zdHJpbmcucmF3LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN0cmluZy5yZXBlYXQuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc3RyaW5nLnN0YXJ0cy13aXRoLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN5bWJvbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi53ZWFrLW1hcC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi53ZWFrLXNldC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5hcnJheS5pbmNsdWRlcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5tYXAudG8tanNvbi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5vYmplY3QuZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9ycy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5vYmplY3QudG8tYXJyYXkuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczcucmVnZXhwLmVzY2FwZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5zZXQudG8tanNvbi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5zdHJpbmcuYXQuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczcuc3RyaW5nLmxwYWQuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczcuc3RyaW5nLnJwYWQuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9qcy5hcnJheS5zdGF0aWNzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvd2ViLmRvbS5pdGVyYWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL3dlYi5pbW1lZGlhdGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy93ZWIudGltZXJzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL3NoaW0uanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL3JlZ2VuZXJhdG9yL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvcG9seWZpbGwuanMiLCIvVXNlcnMvWWlqdW4vY29kZS9saWIvYXovbm9kZV9tb2R1bGVzL2JhYmVsaWZ5L3BvbHlmaWxsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OzttQkNDb0IsT0FBTzs7b0JBQ1AsUUFBUTs7OztvQkFDUixRQUFROzs7O3VCQUNSLFlBQVk7Ozs7QUFFaEMsSUFBTSxHQUFHLEdBQUc7QUFDVixNQUFJLEVBQUUsR0FBRztBQUNULE1BQUksRUFBRSxHQUFHO0FBQ1QsTUFBSSxFQUFFLEdBQUc7QUFDVCxNQUFJLEVBQUUsR0FBRyxFQUNWLENBQUE7O0FBRUQsU0FBUyxTQUFTLENBQUUsSUFBSSxFQUFHO0FBQ3pCLFNBQU8sQUFBRSxJQUFJLFlBQVksT0FBTyxHQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFFLFNBQVMsQ0FBRSxHQUFHLEtBQUssQ0FBQTtDQUNsRjs7QUFFRCxTQUFTLElBQUksQ0FBRSxJQUFJLEVBQUUsR0FBRyxFQUFHO0FBQ3pCLE1BQUk7QUFDRixRQUFJLENBQUMsS0FBSyxFQUFFLENBQUE7QUFDWixRQUFLLEdBQUcsRUFBSSxRQUFRLENBQUMsYUFBYSxjQUFZLEdBQUcsU0FBTSxD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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNwakJBO0FBQ0E7Ozs7QUNEQSxNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxuaW1wb3J0IHsgY2prIH0gZnJvbSAnLi9yZWcnXG5pbXBvcnQgU0lNUCAgICBmcm9tICcuL3NpbXAnXG5pbXBvcnQgVXRpbCAgICBmcm9tICcuL3V0aWwnXG5pbXBvcnQgVmlldyAgICBmcm9tICcuL3ZpZXcuanN4J1xuXG5jb25zdCBLRVkgPSB7XG4gICc3NCc6ICdqJyxcbiAgJzc1JzogJ2snLFxuICAnNzInOiAnaCcsXG4gICc3Nic6ICdsJyxcbn1cblxuZnVuY3Rpb24gaXNQaWNraW5nKCBlbGVtICkge1xuICByZXR1cm4gKCBlbGVtIGluc3RhbmNlb2YgRWxlbWVudCApID8gZWxlbS5jbGFzc0xpc3QuY29udGFpbnMoICdwaWNraW5nJyApIDogZmFsc2Vcbn1cblxuZnVuY3Rpb24gcGljayggZWxlbSwgaWR4ICkge1xuICB0cnkge1xuICAgIGVsZW0uY2xpY2soKVxuICAgIGlmICggaWR4ICkgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoIGBhLXpbaT0nJHtpZHh9J11gICkuY2xhc3NMaXN0LmFkZCggJ3BpY2tpbmcnIClcbiAgfSBjYXRjaChlKSB7fVxufVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsICggZSApID0+IHtcbiAgaWYgKCBlLnRhcmdldC5tYXRjaGVzKCAnI2lucHV0JyApKSAgcmV0dXJuXG4gIGlmICggNDkgPiBlLndoaWNoIHx8IGUud2hpY2ggPiA1NyAmJiAhT2JqZWN0LmtleXMoIEtFWSApLmZpbmQoKCBrZXkgKSA9PiBwYXJzZUludCgga2V5ICkgPT09IGUud2hpY2ggKSkgIHJldHVyblxuXG4gIGxldCAkaW8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggJ2lvJyApXG4gIGxldCBwaWNraW5nID0gaXNQaWNraW5nKCAkaW8gKVxuICBsZXQgJGF6ID0gQXJyYXkuZnJvbSggZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCggJ2EteicgKSlcbiAgbGV0ICRjdXJyZW50ID0gJGF6LmZpbmQoIGlzUGlja2luZyApXG4gIGxldCBpZHggPSAoICRjdXJyZW50ICkgPyBwYXJzZUludCggJGN1cnJlbnQuZ2V0QXR0cmlidXRlKCAnaScgKSkgOiAtMVxuXG4gIGxldCAkcGlja3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggJ3BpY2tyJyApXG4gIGxldCAkeWluICAgPSAkcGlja3IucXVlcnlTZWxlY3RvciggJ2xpLmN1cnJlbnQnIClcbiAgbGV0IGlzUGlja3JPbiA9ICEhJHBpY2tyLm9mZnNldFBhcmVudFxuXG4gIHN3aXRjaCAoIEtFWVsgZS53aGljaCBdICkge1xuICAgIC8vIFBpY2sgWmkgKGhldGVyb255bSlcbiAgICBjYXNlICdqJzpcbiAgICAgIHRyeSB7XG4gICAgICAgIHBpY2soICRheltpZHgrMV0ucXVlcnlTZWxlY3RvciggJ3JiLCBydWJ5LCBoLXJ1YnknICkpXG4gICAgICB9IGNhdGNoKGUpIHt9XG4gICAgICBicmVha1xuICAgIGNhc2UgJ2snOlxuICAgICAgdHJ5IHtcbiAgICAgICAgcGljayggJGF6W2lkeC0xXS5xdWVyeVNlbGVjdG9yKCAncmIsIHJ1YnksIGgtcnVieScgKSlcbiAgICAgIH0gY2F0Y2goZSkge31cbiAgICAgIGJyZWFrXG4gICAgLy8gUGljayBZaW5cbiAgICBjYXNlICdoJzpcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICggaXNQaWNrck9uICkgIHBpY2soICR5aW4ucHJldmlvdXNTaWJsaW5nLCBpZHggKVxuICAgICAgfSBjYXRjaChlKSB7fVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdsJzpcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICggaXNQaWNrck9uICkgIHBpY2soICR5aW4ubmV4dFNpYmxpbmcsIGlkeCApXG4gICAgICB9IGNhdGNoKGUpIHt9XG4gICAgICBicmVha1xuICAgIC8vIFBpY2sgWWluIHZpYSBvcmRlcmVkIG51bWJlcnNcbiAgICBkZWZhdWx0OlxuICAgICAgaWYgKCAhaXNQaWNrck9uICkgIHJldHVyblxuICAgICAgdHJ5IHtcbiAgICAgICAgbGV0IG50aCA9IGUud2hpY2ggLSA0OSArIDFcbiAgICAgICAgcGljayhcbiAgICAgICAgICAkcGlja3IucXVlcnlTZWxlY3RvciggYGxpOm50aC1jaGlsZCgke250aH0pYCApIHx8ICRwaWNrci5xdWVyeVNlbGVjdG9yKCAnbGk6bGFzdC1jaGlsZCcgKSxcbiAgICAgICAgICBpZHhcbiAgICAgICAgKVxuICAgICAgfSBjYXRjaChlKSB7fVxuICB9XG59KVxuXG5VdGlsLlhIUihbXG4gICcuL2RhdGEvc291bmQubWluLmpzb24nLFxuICAnLi9kYXRhL3Bpbnlpbi5taW4uanNvbicsXG5dLCAoIFNvdW5kLCBSb21hbml6YXRpb24gKSA9PiB7XG5cbmNvbnN0IHsgUGlueWluLCBXRyB9ID0gUm9tYW5pemF0aW9uXG5cbmNvbnN0IFZvd2VsID0ge1xuICAgYTogIFsgJ2EnLCAnxIEnLCAnw6EnLCAnx44nLCAnw6AnIF0sXG4gICBlOiAgWyAnZScsICfEkycsICfDqScsICfEmycsICfDqCcgXSxcbiAgIGk6ICBbICdpJywgJ8SrJywgJ8OtJywgJ8eQJywgJ8OsJyBdLFxuICAgbzogIFsgJ28nLCAnxY0nLCAnw7MnLCAnx5InLCAnw7InIF0sXG4gICB1OiAgWyAndScsICfFqycsICfDuicsICfHlCcsICfDuScgXSxcbiAgJ8O8JzogWyAnw7wnLCAnx5YnLCAnx5gnLCAnx5onLCAnx5wnIF0sXG4gIHdnOiAgWyAn4oGwJywgJ8K5JywgJ8KyJywgJ8KzJywgJ+KBtCcgXVxufVxuXG5sZXQgcmVtYXJrID0gdHlwZW9mIFJlbWFya2FibGUgIT09ICd1bmRlZmluZWQnID8gbmV3IFJlbWFya2FibGUoICdjb21tb25tYXJrJyApIDogdW5kZWZpbmVkXG5sZXQgbWQgICAgID0gcmVtYXJrID8gcmVtYXJrIDogeyByZW5kZXI6ICggcmF3ICkgPT4gcmF3IH1cblxuT2JqZWN0LmFzc2lnbiggVXRpbCwge1xuICBhbm5vdGF0ZSggaW5wdXQsIHBpY2tlZT1bXSwgZG9lc0F2b2lkTWF0Y2hpbmc9ZmFsc2UgKSB7XG4gICAgbGV0IHN5c3RlbSA9IFV0aWwuTFMuZ2V0KCAnc3lzdGVtJyApXG4gICAgbGV0IGppbnplICA9IFV0aWwuTFMuZ2V0KCAnamluemUnICkgIT09ICdubycgPyB0cnVlIDogZmFsc2VcbiAgICBsZXQgYXogICAgID0gW11cbiAgICBsZXQgcmF3ICAgID0gbWQucmVuZGVyKCBpbnB1dCApXG4gICAgbGV0IGhpbnN0ICA9IFV0aWwuaGluc3QoIHJhdywgamluemUgKVxuXG4gICAgaGluc3RcbiAgICAuYXZvaWQoICdwcmUsIGNvZGUnIClcbiAgICAucmVwbGFjZSggY2prLCAoIHBvcnRpb24sIG1hdGNoICkgPT4ge1xuICAgICAgbGV0IHppICAgID0gbWF0Y2hbMF1cbiAgICAgIGxldCBzb3VuZCA9IFNvdW5kW3ppXVxuXG4gICAgICAvLyBTaW1wbGlmaWVkL3ZhcmlhbnQgSGFuemkgc3VwcG9ydFxuICAgICAgaWYgKCAhc291bmQgKSB7XG4gICAgICAgIGxldCBpZHggICA9IFNJTVAuaW5kZXhPZiggemkgKVxuICAgICAgICBsZXQgdHJhZCAgPSAoKCBpZHgrMSApICUgMiApID8gU0lNUFtpZHggKyAxXSA6IHppXG4gICAgICAgIHNvdW5kICAgICA9IFNvdW5kW3RyYWRdXG4gICAgICAgIGlmICggIXNvdW5kICkgIHJldHVybiB6aVxuICAgICAgfVxuXG4gICAgICBsZXQgaXNIZXRlciAgPSBzb3VuZC5sZW5ndGggPiAxXG4gICAgICBsZXQgaXNQaWNrZWQgPSBmYWxzZSBcbiAgICAgIGxldCByZXQgICAgICA9IHNvdW5kWzBdXG4gICAgICBsZXQgZW5kICAgICAgPSAnJ1xuXG4gICAgICBpZiAoIGlzSGV0ZXIgKSB7XG4gICAgICAgIGxldCBpID0gYXoubGVuZ3RoXG4gICAgICAgIGxldCBwaWNrZWQgPSBwaWNrZWVbaV0gfHwgMFxuICAgICAgICBsZXQgZG9lc01hdGNoID0gcGlja2VkICYmIHBpY2tlZC56aSA9PT0gemlcblxuICAgICAgICBhei5wdXNoKCBzb3VuZCApXG4gICAgICAgIGlmICggcGlja2VkICYmICFkb2VzTWF0Y2ggJiYgIWRvZXNBdm9pZE1hdGNoaW5nICkge1xuICAgICAgICAgIHBpY2tlZSA9IFtdXG4gICAgICAgIH0gZWxzZSBpZiAoIGRvZXNNYXRjaCApIHtcbiAgICAgICAgICBpc1BpY2tlZCA9IHRydWVcbiAgICAgICAgICByZXQgPSB0eXBlb2YgcGlja2VkLnlpbiA9PT0gJ251bWJlcicgPyBzb3VuZFtwaWNrZWQueWluXSA6IHBpY2tlZC55aW5cbiAgICAgICAgfSBlbHNlIGlmICggZG9lc0F2b2lkTWF0Y2hpbmcgKSB7XG4gICAgICAgICAgbGV0IGRlY2kgPSBwYXJzZUludCggcGlja2VkLCAxNiApXG4gICAgICAgICAgcmV0ID0gc291bmRbZGVjaV1cbiAgICAgICAgICBwaWNrZWVbaV0gPSB7IHppLCB5aW46IGRlY2kgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICggIHN5c3RlbSA9PT0gJ3BpbnlpbicgKSB7XG4gICAgICAgIHJldCA9IFV0aWwuZ2V0UGlueWluKCByZXQgKVxuICAgICAgfSBlbHNlIGlmICggc3lzdGVtID09PSAnd2cnICkge1xuICAgICAgICByZXQgPSBVdGlsLmdldFdHKCByZXQgKVxuICAgICAgfSBlbHNlIGlmICggc3lzdGVtID09PSAnYm90aCcgKSB7XG4gICAgICAgIHJldCA9IFV0aWwuZ2V0Qm90aCggcmV0IClcbiAgICAgIH1cblxuICAgICAgZW5kICs9IGlzSGV0ZXIgID8gJyonIDogJydcbiAgICAgIGVuZCArPSBpc1BpY2tlZCA/ICcqJyA6ICcnXG5cbiAgICAgIHJldHVybiBgXFxgJHsgemkgfTokeyByZXQgKyBlbmQgfX5gXG4gICAgfSlcbiAgICByYXcgPSBoaW5zdC5jb250ZXh0LmlubmVySFRNTFxuICAgIHJldHVybiB7IGF6LCByYXcsIHBpY2tlZSB9XG4gIH0sXG5cbiAgZ2V0UGlueWluKCBzb3VuZCApIHtcbiAgICBsZXQgeyB5aW4sIGRpYW8gfSA9IFV0aWwuZ2V0WUQoIHNvdW5kLCB0cnVlIClcbiAgICBsZXQgcGlueWluID0gUGlueWluWyB5aW4gXSB8fCBzb3VuZFxuICAgIHBpbnlpbiA9IHBpbnlpblxuICAgICAgLnJlcGxhY2UoIC8oW2FlaW91w7xdKSsvaSwgKCB2ICkgPT4ge1xuICAgICAgICBpZiAoIC9bYWVvXS9pLnRlc3QoIHYgKSkge1xuICAgICAgICAgIHJldHVybiB2LnJlcGxhY2UoIC8oW2Flb10pL2ksICggdiApID0+IFZvd2VsW3ZdW2RpYW9dIClcbiAgICAgICAgfSBlbHNlIGlmICggL2l1L2kudGVzdCggdiApKSB7XG4gICAgICAgICAgcmV0dXJuIHYucmVwbGFjZSggL3UvaSwgVm93ZWwudVtkaWFvXSApXG4gICAgICAgIH0gZWxzZSBpZiAoIC9baXXDvF0vaS50ZXN0KCB2ICkpIHtcbiAgICAgICAgICByZXR1cm4gdi5yZXBsYWNlKCAvKFtpdcO8XSkvaSwgKCB2ICkgPT4gVm93ZWxbdl1bZGlhb10gKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2XG4gICAgICB9KVxuICAgIHJldHVybiBwaW55aW4gfHwgc291bmRcbiAgfSxcblxuICBnZXRXRyggc291bmQgKSB7XG4gICAgbGV0IHsgeWluLCBkaWFvIH0gPSBVdGlsLmdldFlEKCBzb3VuZCwgdHJ1ZSApXG4gICAgbGV0IHBpbnlpbiA9IFBpbnlpblsgeWluIF0gfHwgc291bmRcbiAgICByZXR1cm4gKCBXR1sgcGlueWluIF0gfHwgcGlueWluICkgKyBWb3dlbC53Z1sgZGlhbyBdXG4gIH0sXG5cbiAgZ2V0Qm90aCggc291bmQgKSB7XG4gICAgbGV0IHBpbnlpbiA9IFV0aWwuZ2V0UGlueWluKCBzb3VuZCApXG4gICAgcmV0dXJuIGAkeyBzb3VuZCB9fCR7IHBpbnlpbiB9YFxuICB9LFxuXG4gIHNwZWFrKCB0ZXh0ICkge1xuICAgIGlmICggIXdpbmRvdy5TcGVlY2hTeW50aGVzaXNVdHRlcmFuY2UgKSAgcmV0dXJuIGFsZXJ0KCB0ZXh0IClcbiAgICBsZXQgdXR0ZXIgPSBuZXcgd2luZG93LlNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZSggdGV4dCApXG4gICAgdXR0ZXIubGFuZyA9ICd6aC1UVydcbiAgICB3aW5kb3cuc3BlZWNoU3ludGhlc2lzLnNwZWFrKCB1dHRlciApXG4gICAgY29uc29sZS5sb2coIHRleHQgKVxuICB9LFxufSlcblxubGV0IHZpZXcgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFZpZXcoIFV0aWwgKSlcbmxldCB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggJ3BhZ2UnICkgfHwgZG9jdW1lbnQuYm9keVxuUmVhY3QucmVuZGVyKCB2aWV3LCB0YXJnZXQgKVxuXG59KVxuXG4iLCJcbmltcG9ydCBVdGlsIGZyb20gJy4vdXRpbCdcblxuY2xhc3MgQ2xvc2UgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG4gICAgc3VwZXIoIHByb3BzIClcbiAgICB0aGlzLmNsb3NlUHJlZiA9IHRoaXMuY2xvc2VQcmVmLmJpbmQoIHRoaXMgKVxuICB9XG5cbiAgY2xvc2VQcmVmKCkge1xuICAgIHRoaXMucHJvcHMucGFyZW50LnRvZ2dsZVVJKCAncHJlZicgKVxuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgPGJ1dHRvbiBjbGFzc05hbWU9J2Nsb3NlJyBvbkNsaWNrPXt0aGlzLmNsb3NlUHJlZn0+6Zec6ZaJPC9idXR0b24+XG4gICAgKVxuICB9XG59XG5cbmNsYXNzIFNlbGVjdCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKCBwcm9wcyApIHtcbiAgICBzdXBlciggcHJvcHMgKVxuXG4gICAgY29uc3QgaXRlbSAgID0gcHJvcHMuaXRlbVxuICAgIGNvbnN0IHByZWYgICA9IHByb3BzLnByZWZcbiAgICBsZXQgc2VsZWN0ZWQgPSBwcm9wcy52YWxcbiAgICB0aGlzLnN0YXRlICAgPSB7IHByZWYsIGl0ZW0sIHNlbGVjdGVkIH1cblxuICAgIHRoaXMubm9kZSAgPSB0aGlzLm5vZGUuYmluZCggdGhpcyApXG4gICAgdGhpcy5vcGVuICA9IHRoaXMub3Blbi5iaW5kKCB0aGlzIClcbiAgICB0aGlzLmNsb3NlID0gdGhpcy5jbG9zZS5iaW5kKCB0aGlzIClcbiAgICB0aGlzLmhhbmRsZVRvZ2dsZSA9IHRoaXMuaGFuZGxlVG9nZ2xlLmJpbmQoIHRoaXMgKVxuICB9XG5cbiAgbm9kZSgpIHtcbiAgICBsZXQgbm9kZSAgPSBSZWFjdC5maW5kRE9NTm9kZSggdGhpcy5yZWZzLnNlbGVjdCApXG4gICAgbGV0IGNsYXp6ID0gbm9kZS5jbGFzc0xpc3RcbiAgICByZXR1cm4geyBub2RlLCBjbGF6eiB9XG4gIH1cblxuICBvcGVuKCkge1xuICAgIHRoaXMubm9kZSgpLmNsYXp6LmFkZCggJ29wZW4nIClcbiAgfVxuXG4gIGNsb3NlKCkge1xuICAgIHRoaXMubm9kZSgpLmNsYXp6LnJlbW92ZSggJ29wZW4nIClcbiAgfVxuXG4gIGhhbmRsZVRvZ2dsZSgpIHtcbiAgICBsZXQgeyBjbGF6eiB9ID0gdGhpcy5ub2RlKClcbiAgICBsZXQgaXNudE9wZW4gPSAhY2xhenouY29udGFpbnMoICdvcGVuJyApXG4gICAgbGV0IHJlbW92ZXIgPSAoKSA9PiB7fVxuXG4gICAgaWYgKCBpc250T3BlbiApIHtcbiAgICAgIHRoaXMub3BlbigpXG4gICAgICByZW1vdmVyID0gVXRpbC5saXN0ZW5Ub0xvc2luZ0ZvY3VzKCAnbGFiZWwub3BlbiB1bCAqJywgdGhpcy5jbG9zZSApXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY2xvc2UoKVxuICAgICAgcmVtb3ZlcigpXG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IGlkICAgPSB0aGlzLnByb3BzLmlkXG4gICAgY29uc3QgbmFtZSA9IHRoaXMucHJvcHMubmFtZVxuICAgIGNvbnN0IGl0ZW0gPSB0aGlzLnByb3BzLml0ZW1cbiAgICBjb25zdCBrZXkgID0gT2JqZWN0LmtleXMoIGl0ZW0gKVxuICAgIGxldCBzZWxlY3RlZCA9IHRoaXMuc3RhdGUuc2VsZWN0ZWQgfHwga2V5WzBdXG5cbiAgICByZXR1cm4gKFxuICAgIDxsYWJlbCByZWY9J3NlbGVjdCc+eyBuYW1lIH1cbiAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5oYW5kbGVUb2dnbGV9PnsgaXRlbVtzZWxlY3RlZF0gfTwvYnV0dG9uPlxuICAgICAgPHVsIGNsYXNzTmFtZT0nc2VsZWN0Jz5cbiAgICAgIHtcbiAgICAgICAga2V5Lm1hcCgoIGtleSApID0+IDxsaVxuICAgICAgICAgIGNsYXNzTmFtZT17IHNlbGVjdGVkID09PSBrZXkgPyAnc2VsZWN0ZWQnIDogJycgfVxuICAgICAgICAgIG9uQ2xpY2s9eyAoKSA9PiB7XG4gICAgICAgICAgICBVdGlsLkxTLnNldCggaWQsIGtleSApXG4gICAgICAgICAgICB0aGlzLnByb3BzLmlvLnNldFByZWYoKVxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNlbGVjdGVkOiBrZXkgfSlcbiAgICAgICAgICB9fT57IGl0ZW1ba2V5XSB9PC9saT4gKVxuICAgICAgfVxuICAgICAgPC91bD5cbiAgICA8L2xhYmVsPlxuICAgIClcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcmVmIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IoIHByb3BzICkge1xuICAgIHN1cGVyKCBwcm9wcyApIFxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBwcmVmOiB7XG4gICAgICAgIHN5bnRheDogIFV0aWwuTFMuZ2V0KCAnc3ludGF4JyApICB8fCAnaGFuJyxcbiAgICAgICAgc3lzdGVtOiAgVXRpbC5MUy5nZXQoICdzeXN0ZW0nICkgIHx8ICd6aHV5aW4nLFxuICAgICAgICBkaXNwbGF5OiBVdGlsLkxTLmdldCggJ2Rpc3BsYXknICkgfHwgJ3podXlpbicsXG4gICAgICAgIGppbnplOiAgIFV0aWwuTFMuZ2V0KCAnamluemUnICkgICB8fCAneWVzJyxcbiAgICAgIH0sXG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IGlvID0gdGhpcy5wcm9wcy5pb1xuICAgIGNvbnN0IHsgc3ludGF4LCBzeXN0ZW0sIGRpc3BsYXksIGppbnplIH0gPSB0aGlzLnN0YXRlLnByZWZcblxuICAgIHJldHVybiAoXG4gICAgPGRpdiBpZD0ncHJlZicgY2xhc3NOYW1lPSdsYXlvdXQnPlxuICAgICAgPENsb3NlIHBhcmVudD17dGhpcy5wcm9wcy5wYXJlbnR9IC8+XG4gICAgICA8dWw+XG4gICAgICAgIDxsaT5cbiAgICAgICAgICA8U2VsZWN0IGlvPXtpb30gbmFtZT0n5Luj56K855Sf5oiQ5qC85byPJyBpZD0nc3ludGF4JyB2YWw9e3N5bnRheH0gaXRlbT17e1xuICAgICAgICAgICAgc2ltcDogJ0hUTUw177yI57Ch5piT77yJJyxcbiAgICAgICAgICAgIHJ0YzogICdIVE1MNe+8iOikh+WQiOW8j++8iScsXG4gICAgICAgICAgICBoYW46ICAn5ryi5a2X5qiZ5rqW5qC85byP77yI5bey5riy5p+T77yJJ1xuICAgICAgICAgIH19IC8+XG4gICAgICAgIDwvbGk+XG4gICAgICAgIDxsaT5cbiAgICAgICAgICA8U2VsZWN0IGlvPXtpb30gbmFtZT0n5qiZ6Z+z57O757WxJyBpZD0nc3lzdGVtJyB2YWw9e3N5c3RlbX0gaXRlbT17e1xuICAgICAgICAgICAgYm90aDogICAn5rOo6Z+z77yN5ou86Z+z5YWx5ZCM5qiZ5rOoJyxcbiAgICAgICAgICAgIHpodXlpbjogJ+azqOmfs+espuiZnycsXG4gICAgICAgICAgICBwaW55aW46ICfmvKLoqp7mi7zpn7MnLFxuICAgICAgICAgICAgd2c6ICAgICAn5aiB5aal55Gq5ou86Z+zJ1xuICAgICAgICAgIH19IC8+XG4gICAgICAgIDwvbGk+XG4gICAgICAgIDxsaT5cbiAgICAgICAgICA8U2VsZWN0IGlvPXtpb30gbmFtZT0n6YG45pOH55m86Z+z5pmC55qE5qiZ6Z+z57O757WxJyBpZD0nZGlzcGxheScgdmFsPXtkaXNwbGF5fSBpdGVtPXt7XG4gICAgICAgICAgICB6aHV5aW46ICfms6jpn7MnLFxuICAgICAgICAgICAgcGlueWluOiAn5ou86Z+zJ1xuICAgICAgICAgIH19IC8+XG4gICAgICAgIDwvbGk+XG4gICAgICAgIDxsaT5cbiAgICAgICAgICA8U2VsZWN0IGlvPXtpb30gbmFtZT0n5qiZ6bue56aB5YmH5riy5p+TJyBpZD0namluemUnIHZhbD17amluemV9IGl0ZW09e3tcbiAgICAgICAgICAgIHllczogJ+WVk+eUqCcsXG4gICAgICAgICAgICBubzogICfpl5zploknXG4gICAgICAgICAgfX0gLz5cbiAgICAgICAgPC9saT5cbiAgICAgIDwvdWw+XG4gICAgICA8Q2xvc2UgcGFyZW50PXt0aGlzLnByb3BzLnBhcmVudH0gLz5cbiAgICA8L2Rpdj5cbiAgICApXG4gIH1cbn1cblxuIiwiXG5leHBvcnQgZGVmYXVsdCB7XG4gIGNqazogICAgSGFuLlRZUEVTRVQuY2hhci5jamssXG4gIHpodXlpbjogSGFuLlRZUEVTRVQuemh1eWluLFxuICBhbm5vOiAgIC9gKFteYDp+XSopOihbXmA6fl0qKX4vZ2ksXG4gIGhldGVyOiAgL1xcKiQvLFxuICBwaWNrZWQ6IC9cXCpcXCokLyxcbiAgYm90aDogICAvXFx8Lyxcbn1cblxuIiwiZXhwb3J0IGRlZmF1bHQgICfkuI7oiIfkuJLlm5/kuJPlsIjkuJfljYXkuJrmpa3kuJvlj6LkuJzmnbHkuJ3ntbLkuKHlhankuKLkuJ/kuKTlhankuKXlmrTkuKfllqrkuKrlgIvkuKzniL/kuK/kuLDkuLToh6jkuLbivILkuLrngrrkuL3pupfkuL7oiInkuYnnvqnkuYzng4/kuZDmqILkuZTllqzkuaDnv5LkuaHphInkuabmm7jkubDosrfkubHkuoLkuoDpvpzkuoHkub7kuonniK3kuo/omafkupjkupnkuprkup7kuqfnlKLkuqnnlZ3kurLopqrkurXopLvkurjlmrLkurvkurrkur/lhITku4Xlg4Xku47lvp7ku5HltJnku5PlgInku6rlhIDku6zlgJHku67lgYfkvJfnnL7kvJrmnIPkvJvlgrTkvJ7lgpjkvJ/lgYnkvKDlgrPkvKTlgrfkvKXlgIDkvKblgKvkvKflgpbkvKrlgb3kvKvkvYfkvZPpq5TkvaXlg4nkvqDkv6DkvqPkvrbkvqXlg6XkvqblgbXkvqflgbTkvqjlg5HkvqnlhIjkvqrlhJXkvqzlhILkv6Pkv4Hkv6blhJTkv6jlhLzkv6nlgIbkv6rlhLfkv63lhInlgLrlgrXlgL7lgr7lgazlgq/lgbvlg4Llgb7lg6jlgb/lhJ/lgqXlhLvlgqflhJDlgqjlhLLlgqnlhLrlhY7lhZTlhZHlhYzlhZblhZflharkv57lhbDomK3lhbPpl5zlhbToiIjlhbnojLLlhbvppIrlhb3njbjlhb7ns57lhb/ol53lhoHlm4XlhoXlhaflhobkuLnlhojlsqHlhozlhorlhpnlr6vlhpvou43lhpzovrLlhp3lrpzlhqblr4flhqfpnJblhqjlr4zlhqnlr6vlhq7msZ/lhq/ppq7lhrLmspblhrPmsbrlhrXms4Hlhrjms67lhrrms6/lhrvlh43lhr/mtKXlh4Dmt6jlh4HmtpHlh4Lmtbzlh4PmtoLlh4Tmt5Llh4nmtrzlh4/muJvlh5HmuYrlh5LmurDlh5Pmuqflh5Xmup/lh5bmupblh5nmvqTlh5vlh5zlh5/ngIblh6Tps7Plh6XlsLvlh6bomZXlh6jkupHlh6vps6flh6zlh7Dlh63mhpHlh67ps7Plh6/lh7Hlh7TmhpHlh7vmk4rlh7znqp7lh77kup/lh7/pkb/liITliIPliIXliIPliIvliIrliI3oirvliJjlionliJnliYfliJrliZvliJvlibXliKDliKrliKbliqvliKfliqvliKvliKXliK3liYTliLTliYHliLnliY7liLzliqvliL3liorliL/liozliYDlibTliYLlipHliZDlia7liZHlio3liaXliZ3liaflioflibDlianlio7lio3lipLlio3lipTlio3lip3li7jlip7ovqbliqHli5nliqLli7Hliqjli5XlirHli7XlirLli4HlirPli57lirTli57lirXljbflirnmlYjlir3oo4Llir/li6Lli4XmlZXli4vli5vli5DnjJvli5rli6nli6DmiK7li6XlvLfli6fli7jljIDli7vljKbljK3ljK7ljLHljLrljYDljLvphqvljY7oj6/ljY/ljZTljZXllq7ljZbos6PljZjllq7ljZnmlp/ljZvmlKPljZ/lmofljaLnm6fljaTpubXljaXlm5/ljafoh6XljavooZvljbTljbvljbrlt7nljoXlu7PljobmrbfljonljrLljovlo5Pljozljq3ljpXlu4Hljpvlu7PljqDlu4HljqLlu4LljqPljrTljqblu4jljqjlu5rljqnlu4Tljq7lu53ljrDlu6DljrPlmrTljrbivJvljr/nuKPlj4Hlj4Plj4Tlj4Plj4bpnYnlj4fpnYblj4zpm5nlj47mlLblj4/nmbzlj5Dnmbzlj5Hnmbzlj5jororlj5nmlZjlj6Dnlorlj6flj6blj7bokYnlj7fomZ/lj7nlmIblj73lmLDlkJPlmoflkJXlkYLlkJbll4TlkJfll47lkKPllJrlkKjlmbjlkK/llZ/lkLTlkLPlkL/lkYrlkYvlkpDlkZDlkLblkZHlkJ7lkZLlmLjlkZPlm4jlkZXlmJTlkZblmqblkZfllITlkZjlk6HlkZnlkrzlkZvll4blkZzll5rlkarlkpLlko/oqaDlkpnlmqjlkpvlmoDlkp3lkLHlkqPlhYnlkqTlkJLlk4zlkbHlk43pn7/lk5DljKHlk5HllZ7lk5LlmaDlk5PlmLXlk5Tll7blk5Xlmablk5flmKnlk5nlmbLlk5zlmozlk53lmaXlk5/llrLllJ3ll4rllKDlmK7llKHllaLllKLll6nllKPll6bllKTllprllL/lkbzllYnlkrvllaflmJbllazll4flla3lm4DllbDlm4nllbTlmL3llbjlmK/llrflmbTllrnlpY7llr3lmI3llr7lmrPll6rllJrll6vlm4Hll6zlkbXll7Plma/ll7XpgJrlmJjlmZPlmJ7lkqflmKDlmI7lmKPov7jlmKTlmrblmKjlmK/lmK3ohqjlmLHlm5HlmLflmo7lmZzlmpXlmbvloZ7lmbzliojlmpTmtpXlmqLlm4rlmqPlm4Llmq/orJTlm6LlnJjlm63lnJLlm7Hlm6rlm7TlnI3lm7XlnIflm73lnIvlm77lnJblnIblnJPlnKPogZblnLnlo5nlnLrloLTlnZfloYrlnZrloIXlnZvlo4flnZzlo6LlnZ3lo6nlnZ7loaLlnZ/lorPlnaDlopzlnoTlo5/lnoXlo5/lnoblo5rlnpLlo5jlnqblor7lnqflnbDlnqnloIrlnqvloorlnrLloY/lnrTnkZnln5jloZLln5rloJ3loJHlobnloJXloq7loaHloavloazljp/lopnniYblo67lo6/lo7DogbLlo7Pmrrzlo7blo7rlo7jlo7zlpILivKLlpITomZXlpIflgpnlpIrivKLlpJ/lpKDlpLTpoK3lpLnlpL7lpLrlparlpYHlpanlpYLlpZDlpYvlpa7lpZbnjY7lpaXlpaflpoblpp3lpoflqablpojlqr3lpqnlq7Xlpqrlq5flpqvlqq/lp5flp43lp7nlpbzlqITlqYHlqIXlqa3lqIblrIjlqIflrIzlqIjlrYzlqLHlqJvlqLLlqqflqLTlq7vlqbPlq7/lqbTlrLDlqbXlrIvlqbblrLjlqqrlqrzlq5LlrKHlq5TlrKrlq7HlrJnlrLflrKTlrZnlravlrablrbjlrarlrb/lrbblrbPlrp3lr7blrp7lr6blrqDlr7XlrqHlr6nlrqrmhrLlrqvlrq7lrr3lr6zlrr7os5Plr53lr6Llr7nlsI3lr7vlsIvlr7zlsI7lr77lsI3lr7/lo73lsILlsIjlsIXliYvlsIblsIflsJPniL7lsJTniL7lsJjlobXlsJ3lmJflsKfloK/lsLTlsLflsL3nm6HlsYLlsaTlsYPlsa3lsYnlsZzlsYrlsYblsZvlsY/lsZ7lsazlsaHlsaLlsablsajlsb/ltrzlsoHmrbLlsoLosYjlspbltoflspfltJflspjls7TlspnltrTlsprltZDlspvls7blsq3ltrrlsr/lt4vls4Tltqfls6Hls73ls6PltqLls6TltqDls6XltKLls6blt5Lls6/ls7DltILltpfltIPltI3ltITltq7ltK3ltoTltL7opoHltZjltrjltZrltpTltZ3ltoHlt4Tlt4Plt4Xlt5Tlt4zlt5blt5Plt5Tlt6npno/luIHluaPluIXluKXluIjluKvluI/luYPluJDluLPluJzluZ/luKbluLbluKfluYDluK7luavluK/luLbluLHluazluLvluZjluLzluZfluYLlhqrluYfluavluZrluavluZ7opYblubflubblub/lu6PluoHlu7PluoPpurzluoTojorluoXpurzluobmhbblupDlu6zlupHlu6HlupPluqvlupTmh4nlupnlu5/lup7pvpDlup/lu6Llurzlu47lu4/lu4Tlu5Dlu4Tlu6rlu6nlu7TivLXlu7Xlt6HlvIDplovlvILnlbDlvIPmo4TlvJHlvJLlvKDlvLXlvKXlvYzlvK/lvY7lvLnlvYjlvLrlvLflvZLmrbjlvZPnlbblvZXpjITlvZrlvZnlvZvnvr/lvZznvr/lvZ/njbLlvaDnjbLlvaHivLrlvablvaXlvbvlvrnlvoTlvpHlvpXlvqDlvrjlvrflv4Tlv4Plv4bmhrblv4/mh7rlv6fmhoLlv77mhL7mgIDmh7fmgIHmhYvmgILmhavmgIPmhq7mgIXmgrXmgIbmhLTmgJzmhpDmgLvnuL3mgLzmh5/mgL/mh4zmgYvmiIDmgZLmgYbmgbPmh4fmgbbmg6HmgbjmhZ/mgbnmh6jmgbrmhLfmgbvmg7vmgbzmg7Hmgb3mg7LmgqbmgoXmgqvmhKjmgqzmh7jmgq3mhbPmgq/mhqvmg4rpqZrmg6fmh7zmg6jmhZjmg6nmh7Lmg6vmhormg6zmhJzmg63mhZrmg67mhprmg6/mhaPmg73mg5vmhKDmhY3mhKTmhqTmhKbmhpLmhZHmh77mha3mhpbmhrfmpZrmh5Hmh6Pmh5Lmh7bmh5Tmh43mh7Tmh7rmiIXmiIfmiIbmiIfmiIvmiJTmiI/miLLmiJfmiKfmiJjmiLDmiJ3mlZfmiKbmiLDmiKzmiKnmiK/miLLmiLHmiLLmiLfmiLbmiLjmiLbmiYzmiYvmiafln7fmianmk7TmiarmjavmiavmjoPmiazmj5rmibDmk77mioXmi5jmiprmkqvmipvmi4vmip/mkbbmiqDmkbPmiqHmjoTmiqLmkLbmiqTorbfmiqXloLHmi4Xmk5Tmi5/mk6zmi6LmlI/mi6Pmj4Dmi6Xmk4Hmi6bmlJTmi6fmk7Dmi6jmkqXmi6nmk4fmjJrmka/mjJvmlKPmjJzmjpfmjJ3mkr7mjJ7mkrvmjJ/mjL7mjKDmkpPmjKHmk4vmjKLmkp/mjKPmjpnmjKTmk6DmjKXmj67mjKbmko/mjZ7mkojmjZ/mkI3mjaHmkr/mjaLmj5vmjaPmkJfmjrPmk4TmjrTmkZHmjrfmk7LmjrjmkqPmjrrmkbvmjrzmkZzmj7jllrPmj73mlKzmj7/mkrPmkIDmlJnmkIHmk7HmkILmkZ/mkIPmkaDmkIXmlKrmkLrmlJzmkYTmlJ3mkYXmlITmkYbmk7rmkYfmkJbmkYjmk6/mkYrmlKTmkoPmk4rmkoTmlJbmkpHmkpDmkqrmlIbmkrXmlIbmkrfmk7fmkrnmlKrmkrrmlJvmk5XmlJzmk57mk7vmk6Hmiqzmk6XmjpTmk6foiInmk6rlo5PmlJLmlKLmlLXlj4jmlYfmlZXmlYzmlbXmlZvmloLmla7mrYPmlbDmlbjmlonpvYrmlovpvYvmlo7pvYvmlpPmlpXmlqnmlqzmlq3mlrfml6foiIrml7bmmYLml7fmm6Dml7jmmpjmmJnmm4fmmLzmmZ3mmL3mm6jmmL7poa/mmYvmmYnmmZPmm4nmmZTmm4TmmZXmmojmmZbmmonmmoLmmqvmmqfmm5bmnK/ooZPmnYDmrrrmnYLpm5zmnYPmrIrmnaHmop3mnaXkvobmnajmpYrmnoHmpbXmnp7mqIXmnqLmqJ7mnqPmo5fmnqXmq6rmnqfopovmnqjmo5bmnqrmp43mnqvmpZPmnq3mop/mn6Dmqrjmn73mqonmoIDmopTmoIXmn7XmoIfmqJnmoIjmo6fmoInmq5vmoIrmq7PmoIvmo5/moIzmq6jmoI7mq5/moI/mrITmoJHmqLnmoLfmqKPmoL7mrJLmoYrmo6zmoaDmpI/moaHmqYjmoaLmpajmoaPmqpTmoaTmpr/moaXmqYvmoabmqLrmoafmqpzmoajmp7PmoanmqIHmoqblpKLmorzmqq7mor7mo7bmo4DmqqLmo4LmrJ7mpIHmp6jmpJ/mq53mpKDmp6fmpK3mqaLmpbzmqJPmpb3mqILmpoTmrJbmpofmq6zmpojmq5rmponmq7jmppjnn6nmp5rmqp/mp5vmqrvmp5/mqrPmp6Dmq6fmqKrmqavmqK/mqqPmqLHmq7vmqaXmq6vmqbHmq6Xmqbnmq5Pmqbzmq57mqqrmq5/mqqvlr5/mrKLmraHmrKTmrZ/mrKfmrZDmrbPmrbLmrbTmm4bmrbrmrbLmrbzmrrLmroHmrb/mrofmrqTmrovmrpjmrpLmrp7mrpPmrq7mrprmrqvmrqHmrq/mrrHmrrLmrrTmr4bmr4Hmr4Dmr4LovYLmr5XnlaLmr5nmloPmr6HmsIjmr7Xmr7/mr7bpnqDmsJfmsKPmsKLmsKvmsKnmsKzmsLLmsLPmsLXmsLTmsL3msYbmsYfljK/msYnmvKLmsaHmsZnmsaTmua/msbnmtLbmsp/mup3msqHmspLmsqPngYPmsqTmvJrmsqXngJ3msqbmt6rmsqfmu4TmsqjmuKLmsqnmuojmsqrmu6zmsrXmv5Tms57mv5jms6rmt5rms7bmvqnms7fngKfms7jngJjms7rmv7zms7vngInms7zmvZHms73mvqTms77mtofmtIHmvZTmtYPmtbnmtYXmt7rmtYbmvL/mtYfmvobmtYjmuZ7mtYrmv4HmtYvmuKzmtY3mvq7mtY7mv5/mtY/ngI/mtZDmu7vmtZHmuL7mtZLmu7jmtZPmv4PmtZTmva/mtZXmv5zmtZzmv7Hmtpnmt5rmtpvmv6Tmtp3mvofmtp7mt7bmtp/mvKPmtqHmuKbmtqPmuJnmtqTmu4zmtqbmvaTmtqfmvpfmtqjmvLLmtqnmvoDmt4DmvrHmuIrmt7XmuIzmt6XmuI3mvKzmuI7ngIbmuJDmvLjmuJHmvqDmuJTmvIHmuJbngIvmuJfmu7LmuKnmuqvmubzmtoXmub7ngaPmub/mv5XmuoPmvbDmuoXmv7rmuobmvLXmuofmvIrmu5nljK/mu5rmu77mu53ngKfmu57mu6/mu5/nganmu6DngYTmu6Hmu7/mu6LngIXmu6Tmv77mu6Xmv6vmu6bngaTmu6jmv7Hmu6nngZjmu6rmvqbmvJHmuonmvYbngKDmvYfngJ/mvYvngLLmvY3mv7DmvZzmvZvmvbTngKbmvpzngL7mv5HngKjmv5LngJXngY7nganngY/ngZ3ngZTnganngZzngJvngafnganngazngavnga3mu4Xnga/nh4jngbXpnYjngb7ngb3ngb/nh6bngoDnhazngonniJDngpbnh4nngpznhZLngp3nhpfngrnpu57ngrznhYnngr3nhr7ng4HniI3ng4LniJvng4Png7Tng5vnh63ng5/nhZnng6bnhanng6fnh5Lng6jnh4Hng6nnh7Tng6vnh5nng6znh7zng63nhrHnhJXnhaXnhJbnh5znhJjnh77nhYXnhYbnhbPns4rnhbrpgIDnhpjmupzniLHmhJvniLLngrrniLfniLrniY3niZjniZzniZvniabnipvnibXnib3nibrniqfniorniqLnip/lvLfniq3niqznirbni4DnirfnjbfnirjppqznirnnjLbni4jni73ni43ljIXni53nja7ni57njbDni6znjajni63ni7nni67njYXni6/njarni7DnjJnni7HnjYTni7LnjLvnjIPnjavnjI7njbXnjJXnjbznjKHnjoDnjKrosaznjKvospPnjKzonZ/njK7njbvnja3njbrnjpHnkqPnjpnnkrXnjprnkZLnjpvnkarnjq7nkYvnjq/nkrDnjrDnj77njrHnkbLnjrrnkr3nj4/njqjnj5DnkLrnj5Hnk4/nj7Dnkqvnj7Hnk5Tnj7LnkL/nkI/nkonnkJDnkaPnkLznk4rnkbbnkaTnkbfnkqbnko7nk5Tnk5Lnk5rnk6/nlIznlKPnlKLnlLXpm7vnlLvnlavnlYXmmqLnlbLnlaznlbPnlornlbTnlofnlbXnlavnlo7nlo/nlpbnmaTnlpfnmYLnlp/nmKfnlqDnmZjnlqHnmI3nlqznmYbnlq7nmKHnlq/nmIvnlrTnl77nl4jnmbDnl4nnl5nnl5bllZ7nl6jnmYbnl6nnmKbnl6rnmJPnl6vnmYfnl6znmI3nmIXnmYnnmIbnlrnnmJfnmJ7nmJjnmLrnmKrnmZ/nmKvnmbHnmL7nma7nmL/nma3nmYDlu6PnmY3mlpHnmY7nmYfnmZ7nmannmaPnmaznmavnmbLnmbrnmbznmpHnmprnmrHnmrrnmrLnmrjnm4/nm57nm5Dpub3nm5Hnm6Pnm5bok4vnm5fnm5znm5jnm6TnnIznuKPnnI3ljYDnnJ7nnJ/nnKbnnKXnnKznn5PnnYDokZfnnYHnnZznnZDnnZ7nnZHnnrznnpLnnp7nnqnnn5rnn6Tnl4Xnn6vnn6/nn7bno6/nn77npKznn7/npKbnoIDnoq3noIHnorznoJbno5rnoJfnoajnoJrnoa/noJzpoqjnoLrnpKrnoLvnpLHnoL7npKvnoYDnpI7noYHnoZznoZXnoqnnoZbnoaTnoZfno73noZnno5HnoZrnpITnobfpubznoo3npJnnopvno6fnopzno6PnorHpubznornlrqPno5noop7npLvnpLrnpLznpq7npY7nppXnpaLnprDnpa/npo7npbfnprHnpbjnpo3npoDnqJ/npoTnpb/npoXnpqrnprvpm6Lnp4Pnpr/np4bnqIjnp6/nqY3np7DnqLHnp73nqaLnp77nqaDnqI7nqIXnqKPnqYznqLPnqannqZHnqaHnqbfnqq7nqoPnq4rnqo3nq4XnqpHnqq/nqpznq4Tnqp3nqqnnqqXnqrrnqqbnq4fnqq3nqrbnq5bosY7nq5zpvo3nq57nq7bnrIPnr6TnrIvnrY3nrJTnrYbnrJXnrafnrLrnrovnrLznsaDnrL7nsannrZrnr7PnrZvnr6nnrZznsLnnrZ3nro/nrbnnsYznrb7nsL3nroDnsKHnrpPnsZnnrqLlrpvnrqbnsIDnrqfnr4vnrqjnsZznrqnnsa7nrqrnsJ7nrqvnsKvnr5HnsKPnr5PnsI3nr67nsYPnr7HnsaznsJbnsarnsYHnsZ/nsbTns7TnsbvpoZ7nsbznp4jnspzns7bnsp3ns7LnsqTnsrXnsqrns57nsq7ns6fns4Hns53ns4fppLHns7nns7jntKfnt4rntbXnuarntbbntZXntbfnuLbntpjlgaXntpnnubzntprnuoznt5zntr/nuILnuL3nuITnuannuYvnuavnuY3nuaHnup/ns7jnuqDns77nuqHntIbnuqLntIXnuqPntILnuqTnupbnuqXntIfnuqbntITnuqfntJrnuqjntIjnuqnnuornuqrntIDnuqvntInnuqznt6/nuq3ntJznuq7ntJjnuq/ntJTnurDntJXnurHntJfnurLntrHnurPntI3nurTntJ3nurXnuLHnurbntrjnurfntJvnurjntJnnurnntIvnurrntKHnurvntLXnurzntJbnur3ntJDnur7ntJPnur/nt5rnu4DntLrnu4HntLLnu4LntLHnu4Pnt7Tnu4TntYTnu4XntLPnu4bntLDnu4fnuZTnu4jntYLnu4nnuJDnu4rntYbnu4vntLznu4zntYDnu43ntLnnu47nubnnu4/ntpPnu5DntL/nu5HntoHnu5Lntajnu5PntZDnu5TopLLnu5XnuZ7nu5bntbDnu5fntY7nu5jnuarnu5nntabnu5rntaLnu5vntbPnu5zntaHnu53ntZXnu57ntZ7nu5/ntbHnu6Dntobnu6HntoPnu6Lntbnnu6PnuaHnu6Tntoznu6Xnto/nu6bntZvnu6fnubznu6jntojnu6nnuL7nu6rnt5Lnu6vntr7nu63nuoznu67ntrrnu6/nt4vnu7Dntr3nu7Hpnpznu7Lnt4Tnu7Pnuannu7Tntq3nu7Xntr/nu7bntqznu7fnuYPnu7jntqLnu7nntq/nu7rntrnnu7vntqPnu7zntpznu73ntrvnu77ntrDnu7/ntqDnvIDntrTnvIHnt4fnvILnt5nnvIPnt5fnvITnt5jnvIXnt6znvIbnupznvIfnt7nnvIjnt7LnvInnt53nvIrnuJXnvIvnuaLnvIznt6bnvI3ntp7nvI7nt57nvI/nt7bnvJDnt5rnvJHnt7HnvJLnuIvnvJPnt6nnvJTnt6DnvJXnuLfnvJbnt6jnvJfnt6HnvJjnt6PnvJnnuInnvJrnuJvnvJvnuJ/nvJznuJ3nvJ3nuKvnvJ7nuJfnvJ/nuJ7nvKDnuo/nvKHnuK3nvKLnuIrnvKPnuJHnvKTnub3nvKXnuLnnvKbnuLXnvKfnuLLnvKjnupPnvKnnuK7nvKrnuYbnvKvnuYXnvKznuojnvK3nuZrnvK7nuZXnvK/nuZLnvLDpn4HnvLHnub7nvLLnubDnvLPnua/nvLTnubPnvLXnupjnvYLnvYznvZfnvoXnvZrnvbDnvaLnvbfnvbTnvobnvoHnvojnvpfnvoznvp/nvqXnvqHnvqjnvqPnvqTnvq7nvrnnv5jnv7nnv5nnv73nv5rnv6zogKLli57ogKXlsJrogKfogKzogLjogbPogLvmgaXogYLogbbogYvogb7ogYzogbfogY3ogbnogZToga/oganogbXogarogbDogoDogb/ogoPogoXogqDohbjogqTohprogrfmrKDogr7ohY7ogr/ohavog4DohLnog4HohIXog4bohr3og6fmnKfog6jmnbHog6roh5rog6vohJvog7bohqDohInohIjohI3ohr7ohI/pq5LohJDoh43ohJHohabohJPohr/ohJToh6DohJrohbPohLHohKvohLLlj43ohLbohaHohLjoh4noha3pvbbohbvohqnohb3ohoPohb7pqLDohpHoh4/oh5Pmkbnoh5zoh6LoiIbovL/oiKPoiaToiLDoiaboiLHoiZnoiLvoiavoibDoibHoibnoibjoibrol53oioLnr4DoiojnvovoipfolozoipzolaroiqbomIboi4Hok6/oi4fokaboi4vojqfoi4zokIfoi43okrzoi47oi6foi4/omIfoi5jokLXojI7ojpbojI/omKLojJHolKbojJTloYvojJXnhaLojKfnua3ojYbojYrojZrojqLojZvolZjojZzok73ojZ7olY7ojZ/olojojaDolrrojaHolanojaPmpq7ojaTokbfojaXmu47ojabnipbojafnhpLojajolYHojanol47ojarok4DojavolK3ojazos6Poja3okZLoja7ntILoja/ol6XojoXokp7ojrHokIrojrLok67ojrPokpTojrTokLXojrfnjbLojrjolZXojrnnkanojrrptq/ojrzok7Toj63mgbDokJromIDokJ3omL/okKTonqLokKXnh5/okKbnuIjokKfola3okKjolqnokbHolKXokofolYbokonolaLokovolKPokozolJ7ok53ol43ok5/olorok6DomLrok6bpqYDolLfolpTolLnomJ7olLrol7rolLzol7nolbLomITolbTomIrolq7ol6rol4Hmp4Hol5PomJromJbomJfomY/omZzomZHmha7omZromZvomazoma/oma7on6Pomb3pm5bomb7onabomb/ooIbomoDonZXomoHon7vomoLonp7ompXooLbomqzonIbom4rooLHom47ooKPom4/on7bom67ooLvom7Don4Tom7Hom7rom7Lon6/om7PonoTom7TooJDonJXom7vonJbmsYDonJfonbjonYfooIXonYjon4jonYnon6zonbzonrvonb7ooJHonb/ooIXonoDonr/onqjpoaLon4/ooKjon67on7rooI7on5LooYXph4HooZTpipzooaTooaPooaXoo5zooazopa/ooa7oop7oooTopZboooXoo4rooobopJjooq3opbLooq/opY/oorTopLLoo4Xoo53oo4bopaDoo4jopIzoo6LopLPoo6PopZ3oo6TopLLoo6XopYnopJvopLjopLTopaTopZXopbTopofpnLjopproprropqfopr3opqnnnbnop4Hopovop4Lop4Dop4Topo/op4XoppPop4boppbop4foppjop4jopr3op4noprrop4ropqzop4vopqHop4zopr/op47opqbop4/opq/op5DoprLop5Hoprfop5fop53op57op7Top6bop7jop6/op7boqKHlkJ/oqZ/orovoqaTorIroqoDmtbToqonorb3oqororIToqqzoqqroqq3oroDoroHorKvorqDoqIDorqHoqIjorqLoqILorqPoqIPorqToqo3orqXorY/orqboqJDorqfoqIzorqjoqI7orqnorpPorqroqJXorqvoqJborq3oqJPorq7orbDorq/oqIrorrDoqJjorrHoqJLorrLorJvorrPoq7HorrTorLPorrXoqY7orrboqJ3orrfoqKXorrjoqLHorrnoqJvorrroq5borrzoqJ/orr3oq7forr7oqK3orr/oqKror4DoqKPor4HorYnor4LoqYHor4PoqLbor4ToqZXor4XoqZvor4borZjor4foqZfor4joqZDor4noqLTor4roqLror4voqYbor4zorIXor43oqZ7or47oqZjor4/oqZTor5DoqZbor5Hora/or5LoqZLor5Poqobor5ToqoTor5Xoqabor5boqb/or5foqanor5joqbDor5noqbzor5roqqDor5voqoXor5zoqbXor53oqbHor57oqpXor5/oqazor6Doqa7or6Hoqa3or6LoqaLor6PoqaPor6Toq43or6XoqbLor6boqbPor6foqavor6joq6Lor6noqaHor6rorbjor6voqqHor6zoqqPor63oqp7or67oqpror6/oqqTor7DoqqXor7Hoqpjor7Loqqjor7PoqpHor7Toqqror7Xoqqbor7boqpLor7foq4vor7joq7jor7noq4/or7roq77or7voroDor7zoq5Hor73oqrnor77oqrLor7/oq4nosIDoq5vosIHoqrDosILoq5fosIPoqr/osIToq4LosIXoq5LosIboq4TosIfoqrbosIjoq4fosIroqrzosIvorIDosIzoq7bosI3oq5zosI7orIrosI/oq6vosJDoq6fosJHorJTosJLorIHosJPorILosJToq6TosJXoq63osJboq7zosJforpLosJjoq67osJnoq7PosJroq7rosJvoq6bosJzorI7osJ3oq57osJ7kvY/osJ/orKjosKDorpzosKHorJbosKLorJ3osKPorKDosKTorJfosKXorJrosKborJnosKforJDosKjorLnosKnorL7osKrorKvosKvorb7osKzorKzosK3orZrosK7orZbosK/orZnosLDorpXosLHorZzosLLorY7osLPorp7osLTorbTosLXoravosLborpbosa7osbbosq3kuo3osq7osrPos43otJPos47os6Tos5bos5Los5jpq5LotIvotJfotJjlhJ/otJ3osp3otJ7osp7otJ/osqDotKHosqLotKLosqHotKPosqzotKTos6LotKXmlZfotKbos6zotKfosqjotKjos6rotKnosqnotKrosqrotKvosqfotKzosrbotK3os7zotK7osq/otK/osqvotLDosrPotLHos6TotLLos4HotLPosrDotLTosrzotLXosrTotLbosrrotLfosrjotLjosr/otLnosrvotLros4DotLvosr3otLzos4rotL3otITotL7os4jotL/os4TotYDosrLotYHos4PotYLos4LotYPotJPotYTos4fotYXos4XotYbotJDotYfos5XotYjos5HotYnos5rotYros5LotYvos6botYzos63otY3pvY7otY7otJbotY/os57otZDos5zotZHotJTotZLos5notZPos6HotZTos6DotZbos7TotZfos7XotZjotIXotZnos7votZros7rotZvos73otZzos77otZ3otJfotZ7otIrotZ/otIfotaDotIjotaHotI3otaLotI/otaPotJvotarotazotbXotpnotovotqjotrHotrLotrjouonot4Pouo3ot4TouYzot57oupLot7XouJDot7bouoLot7foubrot7jouZXot7nouprot7vouovouIzouorouKrouaTouKzoupPouK/oupHouZHouqHouZLouaPoubDoupXoub/ouqXouo/ouqroupzouqbouq/ou4Dovabou4rovafou4vovajou4zovanou5Lovarou5Hovavou5TovazovYnova3ou5vova7ovKrova/ou5/ovbDovZ/ovbHlj6TovbLou7vovbPovaTovbTou7jovbXou7novbbou7zovbfkuY7ovbjou6vovbnovaLovbrou7rovbvovJXovbzou77ovb3ovInovb7ovIrovb/ovY7ovoDovIjovoHovIfovoLovIXovoPovIPovoTovJLovoXovJTovobovJvovofovKbovojovKnovonovJ3ovorovKXovovovJ7ovozovKzovo3ovJ/ovo7ovJzovo/ovLPovpDovLvovpHovK/ovpLovYDovpPovLjovpTovaHovpXovYXovpbovYTovpfovL7ovpjovYbovpnovY3ovprovZTovp7ovq3ovqnovq/ovqvovq7ovqzovqjovrnpgorovr3pgbzovr7pgZTov4Hpgbfov4fpgY7ov4jpgoHov5DpgYvov5jpgoTov5npgJnov5vpgLLov5zpgaDov53pgZXov57pgKPov5/pgbLov6npgofov7PpgJXov7not6HpgInpgbjpgIrpgZzpgJLpgZ7pgKbpgpDpgLvpgo/pgZfpgbrpgaXpgZnpgpPphKfpgp3phLrpgqzphJTpgq7pg7XpgrnphJLpgrrphLTpgrvphLDpg4Tljbvpg4/pg5/pg5DphLbpg5HphK3pg5PphIbpg6bphYjpg6fphJbpg7fphInpg7jphLLphIrphInphJXphInphLfphYbphZ3php7phabphrHphbHphqzphb3ph4Xphb7ph4Pphb/ph4Dph4rph4vph6HmlqfpibTpkZLpiq7pkb7pjL7pj6jpjrvpjpbpkoXph5Hpkobph5Ppkofph5Tpkojph53pkonph5jpkorph5fpkovph5npkozph5Xpko3ph7fpko/ph6fpkpDph6TpkpHpiJLpkpLph6npkpPph6PpkpTpjYbpkpXph7npkpbpjZrpkpfph7XpkpjpiIPpkpnpiKPpkprpiL3pkpvpiKbpkpzpiYXpkp3piI3pkp7piJTpkp/pkJjpkqDpiInpkqHpi4fpkqLpi7zpkqPpiJHpkqTpiJDpkqXpkbDpkqbmrL3pkqfpiJ7pkqjpjqLpkqnpiaTpkqrpiKfpkqvpiIHpkqzpiKXpkq7piJXpkq/piIDpkrDpiLrpkrHpjKLpkrLpiabpkrPpiZfpkrTpiLfpkrXnvL3pkrbpiLPpkrjpiL3pkrnpiLjpkrrpiZ7pkrvpkb3pkrzpiazpkr3pia3pkr7piYDpkr/piL/pk4DpiL7pk4HpkLXpk4LpiZHpk4PpiLTpk4TpkaDpk4XpiZvpk4bpiZrpk4jpiLDpk4npiYnpk4rpiYjpk4vpiY3pk4zpiK7pk43piLnpk47pkLjpk4/pibbpk5Dpiqzpk5HpiqDpk5Lpibrpk5Ppi6npk5TpjI/pk5Xpiqrpk5bpi67pk5fpi4/pk5jpgqrpk5npkIPpk5rpio3pk5vpkLrpk5zpioXpk53pi4Hpk57lkIrpk5/piqbpk6Dpjqfpk6HpjZjpk6Lpipbpk6PpipHpk6Tpi4zpk6Xpiqnpk6bpipvpk6fpj7Xpk6jpipPpk6npjqnpk6rpib/pk6vpiprpk6zpibvpk63pipjpk67pjJrpk6/piqvpk7Dpibjpk7HpiqXpk7Lpj5/pk7PpioPpk7TpkIvpk7Xpiqjpk7bpioDpk7fpiqPpk7jpkYTpk7npkJLpk7rpi6rpk7vpi5npk7zpjLjpk73pi7Hpk77pj4jpk7/pj5fplIDpirfplIHpjpbplILpi7DplIPlkYjplITpi6TplIXpjYvplIbpi6/plIfpi6jplIjpj73plInpirzplIrpi53plIvpi5LplIzpi4XplI3nkInplI7pibLplI/plpLplJDpirPplJHpirvplJLpi4PplJPpi5/plJTpi6bplJXpjJLplJbpjIbplJfpjbrplJjoi6XplJnpjK/plJrpjKjplJvpjJvplJzpjKHplJ3pjp3plJ7pjIHplJ/pjJXplKDnkJvplKHpjKvplKLpjK7plKPpkbzplKTpjJjplKXpjJDplKbpjKbplKfpkZXplKjmnbTplKrlv73plKvln7nplKzpjJ/plK3pjKDplK7pjbXplK/pi7jplLDpjLPplLHpjJnplLLpjaXplLTpjYfplLXpj5jplLbpjbbplLfpjZTplLjpjaTplLnpjazplLrpjb7plLvpjZvplLzpjqrplL3pjaDplL7pjbDplL/pkYDplYDpjY3plYHpjoLplYLpj6TplYPpjqHplYTpkKjplYXpi4LplYbpj4zplYfpjq7plYjpjpvplYnpjpjplYrpkbfplYvpkoLplYzpkKvplY3pjrPplY7mi7/plY/pjqbplZDpjqzplZHpjorplZLpjrDplZPpjrXplZTpkYzplZXpjpTplZbpj6LplZfpj5zplZjpj53plZnpj43plZvpj57plZzpj6HplZ3pj5HplZ7pj4PplZ/pj4fplaDpj5DplaHpkJTplaLpkoHplaPpkJDplaTpj7fplaXpra/plafpka3plajpkKDplankuLLplarpj7nplavpkJnplazpkYrpla3pkLPpla7pkLbpla/pkLLplbDpkK7plbHpkL/plbLlr5/plbPpkaPplbTpkZ7plbXpkbHplbbpkbLplb/plbfplrLplrHpl6jploDpl6nploLpl6rploPpl6vplobpl6zplojpl63plonpl67llY/pl6/pl5bpl7Dplo/pl7Hpl4jpl7LplpLpl7Pplo7pl7TplpPpl7XplpTpl7bplozpl7fmgrbpl7jplpjpl7nprKfpl7rplqjpl7vogZ7pl7zpl6Xpl73plqnpl77plq3pl7/pl5PpmIDplqXpmIHplqPpmILplqHpmIPplqvpmITprK7pmIXplrHpmIbplqzpmIfpl43pmIjplr7pmInplrnpmIrplrbpmIvprKnpmIzplr/pmI3plr3pmI7plrvpmI/plrzpmJDpl6HpmJHpl4zpmJLpl4PpmJPpl6DpmJTpl4rpmJXpl4vpmJbpl5TpmJfpl5DpmJjpl5LpmJnpl5XpmJrpl57pmJvpl6TpmJ3pmJzpmJ/pmorpmLPpmb3pmLTpmbDpmLXpmaPpmLbpmo7pmYXpmpvpmYbpmbjpmYfpmrTpmYjpmbPpmYnpmZjpmZXpmZ3pmafpmonpmajpmpXpmanpmqrpmoLpmbDpmozmmpfpmo/pmqjpmpDpmrHpmqDpmrHpmrfpmrjpmr3pm4vpmr7pm6Ppm4/pm5vpm6Doro7pm7PpnYLpm77pnKfpnIHpnL3pnIrpnYjpnK3pnYTpnZPpnZrpnZnpnZzpnaXpnajpnpHpn4PpnpLovY7pnq/pn4npnrLpn53pnr3ovY7pn6bpn4vpn6fpn4zpn6jpn43pn6npn5Ppn6rpn5npn6vpn57pn6zpn5zpn6/nsaTpn7LpvYvpn7Xpn7vpoYvoha7poZTpoY/poZXpoa/pobXpoIHpobbpoILpobfpoIPpobjpoIfpobnpoIXpobrpoIbpobvpoIjpobzpoIrpob3poJHpob7poafpob/poJPpooDpoI7pooHpoJLpooLpoIzpooPpoI/pooTpoJDpooXpobHpoobpoJjpoofpoJfpoojpoLjpoonpoKHpoorpoLDpoovpoLLpoozpoJzpoo3mvYHpoo7nhrLpoo/poKbpopDpoKTpopHpoLvpopPpoLnpopTpoLfpopXnqY7popbnqY7popfpoYbpopjpoYzpopnpoZLpoprpoY7popvpoZPpopzpoY/pop3poY3pop7pobPpop/poaLpoqDpoZvpoqHpoZnpoqLpoaXpoqPnuofpoqTpoavpoqXpoIjpoqbpobDpoqfpobTporfpo4bpo47poqjpo4/porrpo5Dpoq3po5Hpoq7po5Lpoq/po5Pporbpo5Tporjpo5Xporzpo5bporvpo5fpo4Dpo5jpo4Tpo5npo4bpo5rpo4bpo57po5vpo6jppZfpo6zppIrpo67po7Lpo7HppJDppI3ppZzppaPpo5/ppaTpo6PppaXpo6Lppabpo6XppafppLPppajpo6nppanppLzpparpo6rppavpo6vppazpo63ppa3po6/ppa7po7Lppa/ppJ7ppbDpo77ppbHpo73ppbLpo7zppbTpo7TppbXppIzppbbppZLppbfppInppbrppIPppbzppIXppb3ppJHppb7ppJbppb/ppJPppoDppJjppoHppJLppoLppJXppoTppJvppoXppKHppobppKjppofmn6XppojppYvpponnqLnpporppL/ppovppZ7ppozppYHppo3ppYPppo7ppLrppo/ppL7pppDppYjpppHppYnpppLppYXpppPppYrpppTppYzpppXlm4rpqazppqzpqa3ppq3pqa7pprHpqa/pprTpqbDpprPpqbHpqYXpqbLpprnpqbPpp4HpqbTpqaLpqbXpp5Tpqbbpp5vpqbfpp5/pqbjpp5npqbnpp5LpqbrpqLbpqbvpp5Dpqbzpp53pqb3pp5Hpqb7pp5Xpqb/pqZvpqoDpp5jpqoHpqY3pqoLnvbXpqoPpp7DpqoTpqZXpqoXpqYrpqobpp7Hpqofpp63pqojpp6LpqorpqarpqovpqIHpqozpqZfpqo3pqILpqo7pp7jpqo/pp7/pqpDpqI/pqpHpqI7pqpLpqI3pqpPpqIXpqpXpqYzpqpbpqYLpqpfpqJnpqpjpqK3pqpnpqKTpqprpqLfpqpvpqJbpqpzpqYHpqp3pqK7pqp7pqKvpqp/pqLjpqqDpqYPpqqHpqL7pqqLpqYTpqqPpqY/pqqTpqZ/pqqXpqaXpqqbpqabpqqfpqaTpq4Xpq4/pq4vpq5bpq4zpq5XprJPprKLprYfprZjprYnprY7psbzprZrpsb/prbfpsoDprajpsoHpra/psoLprbTpsoXpsY3psoblubPpsofljaDpsojpsbjpsorprpPpsovprpLpso3prpHpso7psZ/pspDprpDpspHprq3pspLprprpspTprqrpspXprp7pspbprqbpspnpsaDpsprpsa3pspvprqvpspzprq7psp7pr5fpsp/psZjpsqDpr4HpsqHpsbrpsqLpsLHpsqPpsLnpsqTpr4npsqXpsKPpsqbpsLfpsqfpr4Dpsqjpr4rpsqnpr4fpsqvpr73psq3pr5bpsq7pr6rpsrDpr6vpsrHpr6HpsrLpr6TpsrPpr6fpsrTlm7rpsrXpr6Lpsrbpr7Dpsrfpr5vpsrjpr6jpsrrombHpsrvpr5Tpsrzos4Hpsr3psIjpsr/psajps4Dpr7fps4PpsJPps4Tpsbfps4XpsI3ps4bpsJLps4fpsInps4rmiYHps4vomqTps4zpsLLps43psK3ps4/psKXps5DpsKnps5LpsJzps5TpsL7ps5XpsYjps5bpsYnps5fpsLvps5jpsYnps5nlurjps5vpsLzps5zpsZbps53psZTps57psZfps5/psZLps6HpsLLps6Lpsafps6PpsaPpuJ/ps6XpuKDps6npuKHpm57puKLps7bpuKPps7TpuKTps7LpuKXpt5fpuKbptInpuKfptqzpuKjptIfpuKnptIbpuKrptKPpuKzpuJXpuK3ptKjpuK7ptJ7puK/ptKbpuLDptJLpuLHptJ/puLLptJ3puLPptJvpuLXptJXpuLbpt6XpuLfpt5npuLnptLDpuLrptYLpuLzptYPpuL3ptL/puL7puJ7puL/ptLvpuYHptZPpuYLpuJ3puYPptZHpuYTptaDpuYXptZ3puYbptZLpuYfpt7PpuYjptZzpuYnptaHpuYrptbLpuYvoi5fpuYzptarpuY7pta/puY/ptazpuZHptonpuZLptorpuZPptbfpuZTpt6vpuZXptpjpuZbptqHpuZfptprpuZjptrvpuZnptpbpuZrptr/puZvnnInpuZzptqnpuZ3pt4rpuZ7pt4LpuaDptrnpuaHptrrpuaLpt4HpuaPptrzpuaTptrTpuaXpt5bpuabpuJrpuafpt5Ppuajpt5rpuanpt6/puarpt6bpuavpt7Lpuazpt7jpua3pt7rpua/puIfpubDpt7npubHnjbLpubLpuI/pubPpuJvpub7pubrpuqbpuqXpurjpuqnpurnpurTpurrpurXpur3purzpu4Tpu4Ppu4npu4zpu5Lpu5Hpu5npu5jpu6Hpu7bpu6npu7fpu6rpu7Lpu77pu73pvIvpu7/pvI3pvInpvJfpnoDpvLnpvLTpvYTnmrvpvZDpvYrpvZHpvY/pvb/pvZLpvoDpvZTpvoHpvZXpvoLpvZfpvoPpvZ/pvoTpvaHpvoXpvZnpvobpvaDpvofpvZzpvojpvabpvonpvazpvorpvarpvovpvbLpvozpvbfpvpnpvo3pvprpvpTpvpvpvpXpvp/pvpwnXG4iLCJcbmltcG9ydCBSIGZyb20gJy4vcmVnJ1xuXG5sZXQgVXRpbCA9IHtcbiAgWEhSKCB1cmwsIGRvbmUgKSB7XG4gICAgbGV0IGRhdGEgPSBbXVxuICAgIHVybCA9IHVybCBpbnN0YW5jZW9mIEFycmF5ID8gdXJsIDogWyB1cmwgXVxuXG4gICAgLy8gVE9ETzogc3Vic3RpdHV0ZSB3aXRoIGBbXS5maWxsKClgIGluc3RlYWRcbiAgICBmb3IgKCBsZXQgaSA9IDAsIHVwID0gdXJsLmxlbmd0aDsgaSA8IHVwOyBpKysgKSB7XG4gICAgICBkYXRhW2ldID0gdW5kZWZpbmVkXG4gICAgfVxuXG4gICAgdXJsLmZvckVhY2goICggdXJsLCBpICkgPT4ge1xuICAgICAgbGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gKCkgPT4ge1xuICAgICAgICBpZiAoIHhoci5yZWFkeVN0YXRlID09PSA0ICkge1xuICAgICAgICAgIGRhdGFbaV0gPSBKU09OLnBhcnNlKCB4aHIucmVzcG9uc2VUZXh0IClcbiAgICAgICAgICBpZiAoIGRhdGEuZXZlcnkoKCBkYXRhICkgPT4gISFkYXRhICkpICBkb25lKCAuLi5kYXRhIClcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgeGhyLm9wZW4oICdHRVQnLCB1cmwsIHRydWUgKVxuICAgICAgeGhyLnNlbmQoICcnIClcbiAgICB9KVxuICB9LFxuXG4gIGludmVyc2UoIG9iaiApIHtcbiAgICBsZXQgcmV0ID0ge31cbiAgICBmb3IgKCBsZXQgcHJvcCBpbiBvYmogKSB7XG4gICAgICBpZiAoIG9iai5oYXNPd25Qcm9wZXJ0eSggcHJvcCApKSB7XG4gICAgICAgIHJldFsgb2JqW3Byb3BdIF0gPSBwcm9wXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXRcbiAgfSxcblxuICBMUzoge1xuICAgIGdldCggaWQgKSAgICAgIHsgIHJldHVybiB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oIGlkICkgIH0sXG4gICAgc2V0KCBpZCwgdmFsICkgeyAgcmV0dXJuIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSggaWQsIHZhbCApICB9LFxuICB9LFxuXG4gIGxpc3RlblRvTG9zaW5nRm9jdXMoIHNlbGVjdG9yLCBsb3NlRm9jdXMgKSB7XG4gICAgbGV0IHJlbW92ZXJcbiAgICBsZXQgbGlzdGVuZXIgPSAoIGUgKSA9PiB7XG4gICAgICBpZiAoIGUudGFyZ2V0Lm1hdGNoZXMoIHNlbGVjdG9yICkpICByZXR1cm5cbiAgICAgIGxvc2VGb2N1cygpXG4gICAgICByZW1vdmVyID0gZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgbGlzdGVuZXIgKVxuICAgIH0gXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgbGlzdGVuZXIgKVxuICAgIHJldHVybiByZW1vdmVyXG4gIH0sXG5cbiAgbWVyZ2VSdWJ5KCBodG1sICkge1xuICAgIHJldHVybiBodG1sLnJlcGxhY2UoIC88XFwvcnVieT48cnVieVxcc2NsYXNzPShbXFxcIlxcJ10pKHpodXlpbnxwaW55aW4pXFwxPi9naSwgJycgKVxuICB9LFxuXG4gIHJ1YmlmeSggaHRtbCApIHtcbiAgICBsZXQgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKVxuICAgIGRpdi5pbm5lckhUTUwgPSBVdGlsLm1lcmdlUnVieSggaHRtbCApXG4gICAgSGFuKCBkaXYgKS5yZW5kZXJSdWJ5KClcbiAgICBBcnJheS5mcm9tKCBkaXYucXVlcnlTZWxlY3RvckFsbCggJ2EteicgKSkubWFwKCggYXosIGkgKSA9PiBhei5zZXRBdHRyaWJ1dGUoICdpJywgaSApKVxuICAgIGh0bWwgPSBkaXYuaW5uZXJIVE1MXG4gICAgcmV0dXJuIHsgX19odG1sOiBodG1sIH1cbiAgfSxcblxuICAvLyBoaW5zdDogSGFuIGluc3RhbmNlXG4gIGhpbnN0KCBodG1sLCBqaW56ZT10cnVlICkge1xuICAgIGxldCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApXG4gICAgZGl2LmlubmVySFRNTCA9IGh0bWxcbiAgICBsZXQgcmV0ID0gamluemUgPyBIYW4oIGRpdiApLmppbnppZnkoKSA6IEhhbiggZGl2IClcbiAgICByZXR1cm4gSGFuLmZpbmQoIHJldC5jb250ZXh0IClcbiAgfSxcblxuICBnZXRZRCggc291bmQsIHJldHVybkRpYW9JbkRpZ2l0ICkge1xuICAgIGxldCB5aW4gID0gc291bmQucmVwbGFjZSggUi56aHV5aW4uZGlhbywgJycgKSB8fCAnJ1xuICAgIGxldCBkaWFvID0gc291bmQucmVwbGFjZSggeWluLCAnJyApIHx8ICcnXG5cbiAgICBpZiAoIHJldHVybkRpYW9JbkRpZ2l0ICkge1xuICAgICAgaWYgKCAhZGlhbyApIGRpYW8gPSAnMSdcbiAgICAgIGRpYW8gPSBkaWFvXG4gICAgICAgIC5yZXBsYWNlKCAny4snLCAnNCcgKVxuICAgICAgICAucmVwbGFjZSggJ8uHJywgJzMnIClcbiAgICAgICAgLnJlcGxhY2UoICfLiicsICcyJyApXG4gICAgICAgIC5yZXBsYWNlKCAny5knLCAnMCcgKVxuICAgIH1cbiAgICByZXR1cm4geyB5aW4sIGRpYW8gfVxuICB9LFxuXG4gIGdldEFaSW5mbyggdGFyZ2V0ICkge1xuICAgIGlmICggIXRhcmdldC5tYXRjaGVzKCAnYS16LCBhLXogKicgKSkgIHJldHVyblxuICAgIGxldCBydSwgcmIsIHppLCBzdHlsZSwgaVxuXG4gICAgd2hpbGUgKCB0YXJnZXQubm9kZU5hbWUgIT09ICdBLVonICkge1xuICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGVcbiAgICB9XG5cbiAgICB0YXJnZXQuY2xhc3NMaXN0LmFkZCggJ3BpY2tpbmcnIClcbiAgICBpICA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoICdpJyApXG4gICAgcnUgPSB0YXJnZXQucXVlcnlTZWxlY3RvciggJ2gtcnUnICkgfHwgdGFyZ2V0XG4gICAgcmIgPSB0YXJnZXQucXVlcnlTZWxlY3RvciggJ3JiJyApXG4gICAgemkgPSAoIHJiIHx8IHRhcmdldCApLnRleHRDb250ZW50WzBdXG5cbiAgICBzdHlsZSA9IHtcbiAgICAgIGxlZnQ6IGAke3RhcmdldC5vZmZzZXRMZWZ0fXB4YCxcbiAgICAgIHRvcDogIGAke3RhcmdldC5vZmZzZXRUb3B9cHhgLFxuICAgIH1cbiAgICByZXR1cm4geyBpLCBzdHlsZSwgemkgfVxuICB9LFxuXG4gIHdyYXA6IHtcbiAgICBzaW1wbGUoIHJhdywgaXNudFpodXlpbj1mYWxzZSApIHtcbiAgICAgIGxldCBjbGF6eiA9IGlzbnRaaHV5aW4gPyAncGlueWluJyA6ICd6aHV5aW4nXG4gICAgICBsZXQgY29kZSA9IHJhdy5yZXBsYWNlKFxuICAgICAgICBSLmFubm8sICggbWF0Y2gsIHppLCB5aW4gKSA9PiB7XG4gICAgICAgICAgbGV0IGlzSGV0ZXIgID0gUi5oZXRlci50ZXN0KCB5aW4gKVxuICAgICAgICAgIGxldCBpc1BpY2tlZCA9IFIucGlja2VkLnRlc3QoIHlpbiApID8gJyBwaWNrZWQnIDogJydcbiAgICAgICAgICBsZXQgYXJiICAgICAgPSBgJHsgemkgfTxydD4keyB5aW4ucmVwbGFjZSggL1xcKiskL2csICcnICkgfTwvcnQ+YFxuICAgICAgICAgIHJldHVybiAoIGlzSGV0ZXIgKSA/XG4gICAgICAgICAgICBgPGEteiBjbGFzcz1cIiR7IGlzUGlja2VkIH1cIj48cnVieSBjbGFzcz1cIiR7IGNsYXp6IH1cIj4keyBhcmIgfTwvcnVieT48L2Etej5gIDpcbiAgICAgICAgICAgIGA8cnVieSBjbGFzcz1cIiR7IGNsYXp6IH1cIj4keyBhcmIgfTwvcnVieT5gXG4gICAgICAgIH1cbiAgICAgIClcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvZGUsXG4gICAgICAgIG91dHB1dDogVXRpbC5ydWJpZnkoIGNvZGUgKSxcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY29tcGxleCggcmF3LCBpc250Wmh1eWluPWZhbHNlICkge1xuICAgICAgbGV0IGNsYXp6ID0gaXNudFpodXlpbiA/ICdwaW55aW4nIDogJ3podXlpbidcbiAgICAgIGxldCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApXG4gICAgICBsZXQgY29kZSwgcmJjXG5cbiAgICAgIGRpdi5pbm5lckhUTUwgPSByYXdcblxuICAgICAgQXJyYXlcbiAgICAgIC5mcm9tKCBkaXYucXVlcnlTZWxlY3RvckFsbCggJyo6bm90KGxpKSBwLCBsaSwgaDEsIGgyLCBoMywgaDQsIGg1LCBoNicgKSlcbiAgICAgIC5mb3JFYWNoKCggZWxlbSApID0+IHtcbiAgICAgICAgbGV0IFsgY29kZSwgcmJjLCBydGMsIHJ0YzIgXSA9IFsgZWxlbS5pbm5lckhUTUwsICcnLCAnJywgJycgXVxuXG4gICAgICAgIHJiYyA9IGNvZGUucmVwbGFjZSggUi5hbm5vLCAoIG1hdGNoLCB6aSwgeWluICkgPT4ge1xuICAgICAgICAgIGxldCBpc0hldGVyICA9IFIuaGV0ZXIudGVzdCggeWluIClcbiAgICAgICAgICBsZXQgaXNQaWNrZWQgPSBSLnBpY2tlZC50ZXN0KCB5aW4gKSA/ICdjbGFzcz1cInBpY2tlZFwiJyA6ICcnXG4gICAgICAgICAgbGV0IGlzQm90aCAgID0gUi5ib3RoLnRlc3QoIHlpbiApXG4gICAgICAgICAgbGV0IHJiICAgICAgID0gYDxyYj4keyB6aSB9PC9yYj5gXG5cbiAgICAgICAgICB5aW4gICA9IHlpbi5yZXBsYWNlKCAvXFwqKyQvZywgJycgKS5zcGxpdCggJ3wnIClcbiAgICAgICAgICBydGMgICs9IGA8cnQ+JHsgeWluWzBdIH08L3J0PmBcbiAgICAgICAgICBydGMyICs9IGlzQm90aCA/IGA8cnQ+JHsgeWluWzFdIH08L3J0PmAgOiAnJ1xuICAgICAgICAgIHJldHVybiBpc0hldGVyID8gYDxhLXogJHsgaXNQaWNrZWQgfT4keyByYiB9PC9hLXo+YCA6IHJiXG4gICAgICAgIH0pXG5cbiAgICAgICAgZWxlbS5pbm5lckhUTUwgPSBgXG4gICAgICAgICAgPHJ1YnkgY2xhc3M9XCJjb21wbGV4XCI+JHsgcmJjIH1cbiAgICAgICAgICAgIDxydGMgY2xhc3M9XCIkeyBjbGF6eiB9XCI+JHsgcnRjIH08L3J0Yz5cbiAgICAgICAgICAgICR7IHJ0YzIgPyBgPHJ0YyBjbGFzcz1cInBpbnlpblwiPiR7IHJ0YzIgfTwvcnRjPmAgOiAnJyB9XG4gICAgICAgICAgPC9ydWJ5PlxuICAgICAgICBgLnJlcGxhY2UoIC9cXG5cXHMrL2dpLCAnJyApXG4gICAgICB9KVxuXG4gICAgICBjb2RlID0gZGl2LmlubmVySFRNTFxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29kZSxcbiAgICAgICAgb3V0cHV0OiBVdGlsLnJ1YmlmeSggY29kZSApLFxuICAgICAgfVxuICAgIH0sXG5cbiAgICB6aHV5aW4oIHJ0LCBpc1NlbGZDb250YWluZWQgKSB7XG4gICAgICBsZXQgeWluICA9IHJ0LnJlcGxhY2UoIFIuemh1eWluLmRpYW8sICcnICkgfHwgJydcbiAgICAgIGxldCBkaWFvID0gcnQucmVwbGFjZSggeWluLCAnJyApIHx8ICcnXG4gICAgICBsZXQgbGVuICA9IHlpbi5sZW5ndGhcbiAgICAgIGxldCBodG1sID0gYFxuICAgICAgICA8aC16aHV5aW4gZGlhbz0nJHsgZGlhbyB9JyBsZW5ndGg9JyR7IGxlbiB9Jz5cbiAgICAgICAgICA8aC15aW4+JHsgeWluIH08L2gteWluPlxuICAgICAgICAgIDxoLWRpYW8+JHsgZGlhbyB9PC9oLWRpYW8+XG4gICAgICAgIDwvaC16aHV5aW4+XG4gICAgICBgLnJlcGxhY2UoIC9cXG5cXHMqL2csICcnIClcbiAgICAgIHJldHVybiBpc1NlbGZDb250YWluZWQgPyB7IF9faHRtbDogYCR7aHRtbH1gIH0gOiB7IGh0bWwsIHlpbiwgZGlhbywgbGVuIH1cbiAgICB9LFxuICB9LFxufVxuXG5leHBvcnQgZGVmYXVsdCBVdGlsXG5cbiIsIlxuaW1wb3J0IFIgICAgIGZyb20gJy4vcmVnJ1xuaW1wb3J0IFByZWYgIGZyb20gJy4vcHJlZi5qc3gnXG5cbmNvbnN0IFdXVyA9ICdodHRwczovL2F6LmhhbnppLmNvLydcbmNvbnN0IExJQiA9IHtcbiAgY3NzOiAgICAnPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIGhyZWY9XCIvL2F6LmhhbnppLmNvLzIwMTUwNS9oYW4ucnVieS5jc3NcIj4nLFxuICBqczogICAgICc8c2NyaXB0IHNyYz1cIi8vY2RuanMuY2xvdWRmbGFyZS5jb20vYWpheC9saWJzL0hhbi8zLjIuMS9oYW4ubWluLmpzXCI+PC9zY3JpcHQ+JyxcbiAgcmVuZGVyOiAnPHNjcmlwdD5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLGZ1bmN0aW9uKCl7SGFuKCkuaW5pdENvbmQoKS5yZW5kZXJSdWJ5KCl9KTwvc2NyaXB0PicsXG59XG5cbmV4cG9ydCBkZWZhdWx0ICggVXRpbCApID0+IHtcblxubGV0IE5hdiA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgdG9nZ2xlUHJlZigpIHtcbiAgICB0aGlzLnByb3BzLnBhcmVudC50b2dnbGVVSSggJ3ByZWYnIClcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICA8bmF2IGNsYXNzTmFtZT0nbGF5b3V0Jz5cbiAgICAgIDxidXR0b24gY2xhc3NOYW1lPSdwcmVmJyBvbkNsaWNrPXt0aGlzLnRvZ2dsZVByZWZ9PuioreWumjwvYnV0dG9uPlxuICAgICAgPGEgY2xhc3NOYW1lPSdhYm91dCcgaHJlZj0nLi9hYm91dC5odG1sJz7oqqrmmI48L2E+XG4gICAgICA8YSBjbGFzc05hbWU9J2doLXJlcG8nIGhyZWY9Jy8vZ2l0aHViLmNvbS9ldGhhbnR3L2F6Jz5HaXRIdWI8L2E+XG4gICAgPC9uYXY+XG4gICAgKVxuICB9LFxufSlcblxubGV0IFNwZWFrZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgIDxidXR0b24gY2xhc3NOYW1lPSdzcGVha2VyJyB0aXRsZT0n5pKt5pS+6K6A6Z+zJyBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICBVdGlsLnNwZWFrKCB0aGlzLnByb3BzLnNwZWFrIClcbiAgICB9fT7mkq3mlL7oroDpn7M8L2J1dHRvbj5cbiAgICApXG4gIH1cbn0pXG5cbmxldCBJTyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjdXJyZW50OiAwLFxuICAgICAgemk6IG51bGwsXG4gICAgICBjdXJyZW50WWluOiAwLFxuICAgICAgcGlja2luZzogZmFsc2UsXG4gICAgICBwaWNrclhZOiB7fSxcbiAgICB9XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgIGxldCBkZWYgPSBbXG4gICAgICBlbmNvZGVVUklDb21wb25lbnQoIFxuYOeUqOOAilvokIzlhbhdKGh0dHBzOi8vbW9lZGljdC50dy8p44CLKuWNiuiHquWLlSrngrrmvKLlrZdbI+eahOmDqOWIhl0oaHR0cHM6Ly90d2l0dGVyLmNvbS8/cT0j55qE6YOo5YiGKeS+huaomeazqOeZvOmfs+WXju+8n1xuXG7orpPlqr3lqr3igJTigJRcXFxcXG7kvobvvIzlronoo53nqpfmiLbjgIJgXG4gICAgICApLFxuICAgICAgJzEyMSdcbiAgICBdXG5cbiAgICAvLyBEbyBub3QgdXNlIGBsb2NhdGlvbi5oYXNoYCBmb3IgRmlyZWZveCBkZWNvZGVzIFVSSSBpbXByb3Blcmx5XG4gICAgbGV0IGhhc2ggPSBsb2NhdGlvbi5ocmVmLnNwbGl0KCcjJylbMV0gfHwgZGVmLmpvaW4oJy8nKVxuICAgIGhhc2ggKz0gL1xcLy8udGVzdCggaGFzaCApID8gJycgOiAnLzAnXG5cbiAgICBsZXQgWyBpbnB1dCwgcGlja2VlIF0gPSBoYXNoLnNwbGl0KCcvJylcblxuICAgIGlucHV0ICA9IGRlY29kZVVSSUNvbXBvbmVudCggaW5wdXQgKVxuICAgIHBpY2tlZSA9IHBpY2tlZS5zcGxpdCgnJykgfHwgWyAwIF1cbiAgICB0aGlzLklPKCBwaWNrZWUsIGlucHV0LCB0cnVlIClcbiAgfSxcblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICBsZXQgbm9kZSA9IFJlYWN0LmZpbmRET01Ob2RlKCB0aGlzLnJlZnMuaW5wdXQgKVxuICAgIG5vZGUuZm9jdXMoKVxuICAgIG5vZGUuc2VsZWN0KClcbiAgICB0aGlzLnNldFByZWYoKVxuICB9LFxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcbiAgICBsZXQgb3V0cHV0ID0gUmVhY3QuZmluZERPTU5vZGUoIHRoaXMucmVmcy5vdXRwdXQgKVxuICAgIEFycmF5LmZyb20oIG91dHB1dC5xdWVyeVNlbGVjdG9yQWxsKCAnKjpub3QobGkpIHAsIGxpLCBoMSwgaDIsIGgzLCBoNCwgaDUsIGg2JyApKVxuICAgIC5mb3JFYWNoKCggZWxlbSApID0+IHtcbiAgICAgIGxldCBob2xkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnc3BhbicgKVxuICAgICAgbGV0IGJlZm9yZSA9IGVsZW0ucXVlcnlTZWxlY3RvciggJy5zcGVha2VyLWhvbGRlcicgKVxuICAgICAgbGV0IHAgPSBlbGVtLmNsb25lTm9kZSggdHJ1ZSApXG5cbiAgICAgIEFycmF5LmZyb20oIHAucXVlcnlTZWxlY3RvckFsbCggJ2gtcnUsIHJ1YnknICkpXG4gICAgICAubWFwKCggcnUgKSA9PiB7XG4gICAgICAgIGxldCB6aSA9IHJ1LnRleHRDb250ZW50XG4gICAgICAgICAgLnJlcGxhY2UoIEhhbi5UWVBFU0VULmdyb3VwLndlc3Rlcm4sICcnIClcbiAgICAgICAgICAucmVwbGFjZSggL1vigbDCucKywrPigbRdL2dpLCAnJyApXG4gICAgICAgICAgLnJlcGxhY2UoIG5ldyBSZWdFeHAoIGAke0hhbi5VTklDT0RFLnpodXlpbi5iYXNlfWAsICdnaScgKSwgJycgKVxuICAgICAgICAgIC5yZXBsYWNlKCBuZXcgUmVnRXhwKCBgJHtIYW4uVU5JQ09ERS56aHV5aW4udG9uZX1gLCAnZ2knICksICcnIClcbiAgICAgICAgICAvLy5yZXBsYWNlKCBuZXcgUmVnRXhwKCBgJHtIYW4uVU5JQ09ERS56aHV5aW4ucnV5dW59YCwgJ2dpJyApLCAnJyApXG4gICAgICAgIHJ1LmlubmVySFRNTCA9IHppXG5cbiAgICAgICAgaWYgKCBydS5tYXRjaGVzKCAnYS16IConICkpIHtcbiAgICAgICAgICBsZXQgYXogPSBydS5wYXJlbnROb2RlXG4gICAgICAgICAgd2hpbGUgKCAhYXoubWF0Y2hlcyggJ2EteicgKSkge1xuICAgICAgICAgICAgYXogPSBhei5wYXJlbnROb2RlIFxuICAgICAgICAgIH1cbiAgICAgICAgICBsZXQgaSAgPSBhei5nZXRBdHRyaWJ1dGUoICdpJyApXG4gICAgICAgICAgbGV0IHBpY2tlZCA9IHRoaXMuc3RhdGUucGlja2VlW2ldID8gdGhpcy5zdGF0ZS5waWNrZWVbaV0ueWluIDogMFxuICAgICAgICAgIGxldCBzb3VuZCA9IHRoaXMuc3RhdGUuYXpbaV1bcGlja2VkXS5yZXBsYWNlKCAvXsuZKC4rKSQvaSwgJyQxy5knIClcbiAgICAgICAgICBydS5pbm5lckhUTUwgPSBgfCR7c291bmR9fGBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcnVcbiAgICAgIH0pXG5cbiAgICAgIGxldCBzcGVhayAgPSBwLnRleHRDb250ZW50LnJlcGxhY2UoIC/mkq3mlL7oroDpn7MkLywgJycgKVxuXG4gICAgICBob2xkZXIuY2xhc3NMaXN0LmFkZCggJ3NwZWFrZXItaG9sZGVyJyApXG4gICAgICBpZiAoIGJlZm9yZSApICBlbGVtLnJlbW92ZUNoaWxkKCBiZWZvcmUgKVxuICAgICAgZWxlbS5hcHBlbmRDaGlsZCggaG9sZGVyIClcbiAgICAgIFJlYWN0LnJlbmRlciggUmVhY3QuY3JlYXRlRWxlbWVudCggU3BlYWtlciwgeyBzcGVhayB9KSwgaG9sZGVyIClcbiAgICB9KVxuICB9LFxuXG4gIHNldFByZWYoKSB7XG4gICAgbGV0IG5vZGUgICAgPSBSZWFjdC5maW5kRE9NTm9kZSggdGhpcy5yZWZzLmlvIClcbiAgICBsZXQgc3lzdGVtICA9IFV0aWwuTFMuZ2V0KCAnc3lzdGVtJyApIHx8ICd6aHV5aW4nXG4gICAgbGV0IGRpc3BsYXkgPSBVdGlsLkxTLmdldCggJ2Rpc3BsYXknICkgfHwgJ3podXlpbidcblxuICAgIHRoaXMuSU8oKVxuICAgIG5vZGUuc2V0QXR0cmlidXRlKCAnZGF0YS1zeXN0ZW0nLCAgc3lzdGVtICApXG4gICAgbm9kZS5zZXRBdHRyaWJ1dGUoICdkYXRhLWRpc3BsYXknLCBkaXNwbGF5IClcbiAgfSxcblxuICBJTyggcGlja2VlPXRoaXMuc3RhdGUucGlja2VlLCBpbnB1dD10aGlzLnN0YXRlLmlucHV0LCBkb0F2b2lkTWF0Y2hpbmc9ZmFsc2UgKSB7XG4gICAgbGV0IHN5bnRheCA9IFV0aWwuTFMuZ2V0KCAnc3ludGF4JyApXG4gICAgbGV0IHN5c3RlbSA9IFV0aWwuTFMuZ2V0KCAnc3lzdGVtJyApXG4gICAgbGV0IG1ldGhvZCA9ICggc3ludGF4ID09PSAnc2ltcCcgJiYgc3lzdGVtICE9PSAnYm90aCcgKSA/ICdzaW1wbGUnIDogJ2NvbXBsZXgnXG4gICAgbGV0IGlzbnRaaHV5aW4gPSBzeXN0ZW0gPT09ICdwaW55aW4nIHx8IHN5c3RlbSA9PT0gJ3dnJ1xuXG4gICAgbGV0IHJlc3VsdCA9IFV0aWwuYW5ub3RhdGUoIGlucHV0LCBwaWNrZWUsIGRvQXZvaWRNYXRjaGluZyApXG4gICAgbGV0IHsgYXosIHJhdyB9ICAgICAgPSByZXN1bHRcbiAgICBsZXQgeyBjb2RlLCBvdXRwdXQgfSA9IFV0aWwud3JhcFttZXRob2RdKCByYXcsIGlzbnRaaHV5aW4gKVxuICAgIGxldCB1cmxcbiAgICBwaWNrZWUgPSByZXN1bHQucGlja2VlXG5cbiAgICB7XG4gICAgICBsZXQga2V5ID0gT2JqZWN0LmtleXMoIHBpY2tlZSApXG4gICAgICBsZXQgcCAgID0gWyAwIF1cbiAgICAgIGZvciAoIGxldCBpID0gMCwgZW5kID0ga2V5W2tleS5sZW5ndGgtMV07IGkgPD0gZW5kOyBpKysgKSB7XG4gICAgICAgIHBbaV0gPSBwaWNrZWUuaGFzT3duUHJvcGVydHkoIGkgKSA/ICggcGlja2VlW2ldLnlpbiApLnRvU3RyaW5nKDE2KSA6ICcwJ1xuICAgICAgfVxuICAgICAgdXJsID0gYCR7V1dXfSMke2VuY29kZVVSSUNvbXBvbmVudCggaW5wdXQgKX0vJHtwLmpvaW4oJycpfWBcbiAgICB9XG5cbiAgICBjb2RlID0gc3ludGF4ID09PSAnaGFuJyA/IG91dHB1dC5fX2h0bWwgOiBjb2RlXG4gICAgY29kZSArPSBgXFxuJHtcbiAgICAgIHN5bnRheCA9PT0gJ2hhbicgPyBMSUIuY3NzIDogYCR7TElCLmNzc31cXG4ke0xJQi5qc31cXG4ke0xJQi5yZW5kZXJ9YFxuICAgIH1cXG5gXG4gICAgY29kZSA9IFV0aWwubWVyZ2VSdWJ5KFxuICAgICAgY29kZVxuICAgICAgLnJlcGxhY2UoIC88YVxcLXpbXj5dKj4vZ2ksICcnIClcbiAgICAgIC5yZXBsYWNlKCAvPFxcL2FcXC16Pi9naSwgJycgKVxuICAgIClcblxuICAgIHRoaXMuc2V0U3RhdGUoeyBpbnB1dCwgYXosIGNvZGUsIG91dHB1dCwgdXJsLCBwaWNrZWUgfSlcbiAgfSxcblxuICBoYW5kbGVJbnB1dCggZSApIHtcbiAgICB0aGlzLnNldFBpY2tpbmcoIGZhbHNlIClcbiAgICB0aGlzLnNldFN0YXRlKHsgaW5wdXQ6IGUudGFyZ2V0LnZhbHVlIH0sIHRoaXMuSU8gKVxuICB9LFxuXG4gIHNldFBpY2tpbmcoIHN3ID0gdHJ1ZSApIHtcbiAgICBsZXQgY2xhenogPSBSZWFjdC5maW5kRE9NTm9kZSggdGhpcy5yZWZzLmlvICkuY2xhc3NMaXN0XG4gICAgbGV0IG1ldGhvZCA9IHN3ID8gJ2FkZCcgOiAncmVtb3ZlJ1xuICAgIGNsYXp6W21ldGhvZF0oICdwaWNraW5nJyApXG4gICAgdGhpcy5zZXRTdGF0ZSh7IHBpY2tpbmc6IHN3IH0pXG4gIH0sXG5cbiAgcGlja1ppKCBlICkge1xuICAgIGxldCB0YXJnZXQgPSBlLnRhcmdldFxuICAgIGxldCBhelxuICAgIGxldCBjbGVhbkZvcm1lciA9ICgpID0+IHtcbiAgICAgIGxldCBmb3JtZXIgPSBSZWFjdC5maW5kRE9NTm9kZSggdGhpcy5yZWZzLm91dHB1dCApLnF1ZXJ5U2VsZWN0b3IoICdhLXoucGlja2luZycgKVxuICAgICAgaWYgKCBmb3JtZXIgKSAgZm9ybWVyLmNsYXNzTGlzdC5yZW1vdmUoICdwaWNraW5nJyApXG4gICAgICB0aGlzLnNldFBpY2tpbmcoIGZhbHNlIClcbiAgICB9XG5cbiAgICBpZiAoIHRhcmdldC5tYXRjaGVzKCAnYVtocmVmXSwgYVtocmVmXSAqJyApICYmICEoIGUubWV0YUtleSB8fCBlLnNoaWZ0S2V5IHx8IGUuY3RybEtleSB8fCBlLmFsdEtleSApKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICB9XG5cbiAgICBjbGVhbkZvcm1lcigpXG4gICAgYXogPSBVdGlsLmdldEFaSW5mbyggZS50YXJnZXQgKVxuICAgIGlmICggIWF6ICkgIHJldHVyblxuXG4gICAgbGV0IGN1cnJlbnQgICAgPSBhei5pXG4gICAgbGV0IHppICAgICAgICAgPSBhei56aVxuICAgIGxldCBwaWNrZWQgICAgID0gdGhpcy5zdGF0ZS5waWNrZWVbY3VycmVudF1cbiAgICBsZXQgY3VycmVudFlpbiA9IHBpY2tlZCA/IHBpY2tlZC55aW4gOiAwXG4gICAgbGV0IHBpY2tyWFkgICAgPSBhei5zdHlsZSB8fCBudWxsXG4gICAgdGhpcy5zZXRQaWNraW5nKClcbiAgICB0aGlzLnNldFN0YXRlKHsgY3VycmVudCwgY3VycmVudFlpbiwgemksIHBpY2tyWFkgfSlcbiAgICBVdGlsLmxpc3RlblRvTG9zaW5nRm9jdXMoICdhLXogKiwgI3BpY2tyICosIG5hdiAqLCAjcHJlZiAqJywgY2xlYW5Gb3JtZXIgKVxuICB9LFxuXG4gIHBpY2tZaW4oIGkgKSB7XG4gICAgbGV0IG91dHB1dCAgPSBSZWFjdC5maW5kRE9NTm9kZSggdGhpcy5yZWZzLm91dHB1dCApXG4gICAgbGV0IGN1cnJlbnQgPSB0aGlzLnN0YXRlLmN1cnJlbnRcbiAgICBsZXQgcGlja2VlICA9IHRoaXMuc3RhdGUucGlja2VlXG4gICAgcGlja2VlW2N1cnJlbnRdID0ge1xuICAgICAgemk6ICB0aGlzLnN0YXRlLnppLFxuICAgICAgeWluOiBpXG4gICAgfVxuICAgIHRoaXMuSU8oIHBpY2tlZSApXG4gICAgdGhpcy5zZXRTdGF0ZSh7IGN1cnJlbnRZaW46IGkgfSlcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgbGV0IGN1cnJlbnQgPSB0aGlzLnN0YXRlLmF6W3RoaXMuc3RhdGUuY3VycmVudF0gfHwgW11cbiAgICBsZXQgdXRpbGl0eSA9IFtcbiAgICAgIHsgYzogJ2lucHV0JywgbjogJ+i8uOWFpScgfSxcbiAgICAgIHsgYzogJ2NvZGUnLCAgbjogJ+aLt+iynei8uOWHuuS7o+eivCcgfSxcbiAgICAgIHsgYzogJ3VybCcsICAgbjogJ+aLt+iynee2suWdgCcgfSxcbiAgICBdXG4gICAgcmV0dXJuIChcbiAgICA8bWFpbiBpZD0naW8nIHJlZj0naW8nIGNsYXNzTmFtZT0nbGF5b3V0Jz5cbiAgICAgIDxkaXYgaWQ9J2luJyByZWY9J2luJyBjbGFzc05hbWU9J2lucHV0Jz5cbiAgICAgICAgPHRleHRhcmVhIGlkPSdpbnB1dCcgcmVmPSdpbnB1dCcgZGVmYXVsdFZhbHVlPXt0aGlzLnN0YXRlLmlucHV0fSBvbkNoYW5nZT17dGhpcy5oYW5kbGVJbnB1dH0gLz5cbiAgICAgICAgPHRleHRhcmVhIGlkPSdjb2RlJyB2YWx1ZT17dGhpcy5zdGF0ZS5jb2RlfSAvPlxuICAgICAgICA8dGV4dGFyZWEgaWQ9J3VybCcgdmFsdWU9e3RoaXMuc3RhdGUudXJsfSAvPlxuICAgICAgICA8dWwgaWQ9J3V0aWxpdHknPlxuICAgICAgICAgIHtcbiAgICAgICAgICB1dGlsaXR5Lm1hcCgoIGl0ICkgPT4gKFxuICAgICAgICAgICAgPGxpIGNsYXNzTmFtZT17IGl0LmMgfT5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IG5vZGUgICAgID0gUmVhY3QuZmluZERPTU5vZGUoIHRoaXMucmVmc1snaW4nXSApXG4gICAgICAgICAgICAgICAgbGV0IGlzTG9ja2VkID0gbm9kZS5jbGFzc0xpc3QuY29udGFpbnMoICdsb2NrZWQnIClcbiAgICAgICAgICAgICAgICBsZXQgdGV4dGFyZWEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggaXQuYyApXG4gICAgICAgICAgICAgICAgbm9kZS5jbGFzc05hbWUgPSBpdC5jICsgKCBpc0xvY2tlZCA/ICcgbG9ja2VkJyA6ICcnIClcbiAgICAgICAgICAgICAgICB0ZXh0YXJlYS5mb2N1cygpXG4gICAgICAgICAgICAgICAgdGV4dGFyZWEuc2VsZWN0KClcbiAgICAgICAgICAgICAgICB0ZXh0YXJlYS5zY3JvbGxUb3AgPSB0ZXh0YXJlYS5zY3JvbGxIZWlnaHRcbiAgICAgICAgICAgICAgfX0+eyBpdC5uIH08L2J1dHRvbj5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgKSlcbiAgICAgICAgICB9XG4gICAgICAgICAgPGxpIGNsYXNzTmFtZT0nbG9jayc+PGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICBsZXQgY2xhenogID0gUmVhY3QuZmluZERPTU5vZGUoIHRoaXMucmVmc1snaW4nXSApLmNsYXNzTGlzdFxuICAgICAgICAgICAgbGV0IGlucHV0ICA9IFJlYWN0LmZpbmRET01Ob2RlKCB0aGlzLnJlZnMuaW5wdXQgKVxuICAgICAgICAgICAgY2xhenoudG9nZ2xlKCAnbG9ja2VkJyApXG4gICAgICAgICAgICBpbnB1dC5yZWFkT25seSA9ICFpbnB1dC5yZWFkT25seVxuICAgICAgICAgIH19Pui8uOWFpeahhumOluWumuWIh+aPmzwvYnV0dG9uPjwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBpZD0nb3V0Jz5cbiAgICAgICAgPGFydGljbGUgcmVmPSdvdXRwdXQnIG9uQ2xpY2s9e3RoaXMucGlja1ppfSBkYW5nZXJvdXNseVNldElubmVySFRNTD17dGhpcy5zdGF0ZS5vdXRwdXR9IC8+XG4gICAgICAgIDx1bCBpZD0ncGlja3InIGhpZGRlbiBzdHlsZT17dGhpcy5zdGF0ZS5waWNrclhZfT57XG4gICAgICAgICAgY3VycmVudC5tYXAoKCBzb3VuZCwgaSApID0+IHtcbiAgICAgICAgICAgIGxldCBjdXJyZW50WWluID0gdGhpcy5zdGF0ZS5jdXJyZW50WWluIHx8IDBcbiAgICAgICAgICAgIGxldCBkaXNwbGF5ICAgID0gVXRpbC5MUy5nZXQoICdkaXNwbGF5JyApXG4gICAgICAgICAgICBsZXQgY2xhenogICAgICA9IGkgPT09IGN1cnJlbnRZaW4gPyAnY3VycmVudCcgOiAnJ1xuICAgICAgICAgICAgbGV0IHJ0ICAgICAgICAgPSBkaXNwbGF5ID09PSAncGlueWluJyA/XG4gICAgICAgICAgICAgIHsgX19odG1sOiBVdGlsLmdldFBpbnlpbiggc291bmQgKSB9XG4gICAgICAgICAgICAgIDpcbiAgICAgICAgICAgICAgICBVdGlsLndyYXAuemh1eWluKCBzb3VuZCwgdHJ1ZSApXG4gICAgICAgICAgICByZXR1cm4gPGxpIG9uQ2xpY2s9eygpID0+IHRoaXMucGlja1lpbiggaSApfSBjbGFzc05hbWU9e2NsYXp6fSBkYW5nZXJvdXNseVNldElubmVySFRNTD17cnR9IC8+XG4gICAgICAgICAgfSlcbiAgICAgICAgfTwvdWw+XG4gICAgICA8L2Rpdj5cbiAgICA8L21haW4+XG4gICAgKVxuICB9LFxufSlcblxubGV0IFBhZ2UgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaW5pdDogIHRydWUsXG4gICAgICBwcmVmOiAgZmFsc2UsXG4gICAgICBhYm91dDogZmFsc2VcbiAgICB9XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgSGFuKCkuaW5pdENvbmQoKVxuICB9LFxuXG4gIHRvZ2dsZVVJKCBjb21wb25lbnQgKSB7XG4gICAgbGV0IGNsYXp6ID0gUmVhY3QuZmluZERPTU5vZGUoIHRoaXMucmVmcy5ib2R5ICkuY2xhc3NMaXN0XG4gICAgY2xhenoudG9nZ2xlKCBjb21wb25lbnQgKVxuICAgIGNsYXp6LmFkZCggJ25vdC1pbml0JyApXG4gICAgY2xhenoucmVtb3ZlKCAnaW5pdCcgKVxuICAgIHRoaXMuc2V0U3RhdGUoeyBpbml0OiBmYWxzZSB9KVxuICB9LFxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgIDxkaXYgaWQ9J2JvZHknIHJlZj0nYm9keScgY2xhc3NOYW1lPSdsYXlvdXQgaW5pdCc+XG4gICAgICA8TmF2IHBhcmVudD17dGhpc30gLz5cbiAgICAgIDxJTyByZWY9J2lvJyBwYXJlbnQ9e3RoaXN9IC8+XG4gICAgICA8UHJlZiBwYXJlbnQ9e3RoaXN9IGlvPXt0aGlzLnJlZnMuaW99IC8+XG4gICAgPC9kaXY+XG4gICAgKVxuICB9LFxufSlcblxucmV0dXJuIFBhZ2Vcbn1cblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnJlcXVpcmUoXCJjb3JlLWpzL3NoaW1cIik7XG5cbnJlcXVpcmUoXCJyZWdlbmVyYXRvci9ydW50aW1lXCIpO1xuXG5pZiAoZ2xvYmFsLl9iYWJlbFBvbHlmaWxsKSB7XG4gIHRocm93IG5ldyBFcnJvcihcIm9ubHkgb25lIGluc3RhbmNlIG9mIGJhYmVsL3BvbHlmaWxsIGlzIGFsbG93ZWRcIik7XG59XG5nbG9iYWwuX2JhYmVsUG9seWZpbGwgPSB0cnVlOyIsIi8vIGZhbHNlIC0+IEFycmF5I2luZGV4T2ZcclxuLy8gdHJ1ZSAgLT4gQXJyYXkjaW5jbHVkZXNcclxudmFyICQgPSByZXF1aXJlKCcuLyQnKTtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihJU19JTkNMVURFUyl7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uKCR0aGlzLCBlbCwgZnJvbUluZGV4KXtcclxuICAgIHZhciBPICAgICAgPSAkLnRvT2JqZWN0KCR0aGlzKVxyXG4gICAgICAsIGxlbmd0aCA9ICQudG9MZW5ndGgoTy5sZW5ndGgpXHJcbiAgICAgICwgaW5kZXggID0gJC50b0luZGV4KGZyb21JbmRleCwgbGVuZ3RoKVxyXG4gICAgICAsIHZhbHVlO1xyXG4gICAgaWYoSVNfSU5DTFVERVMgJiYgZWwgIT0gZWwpd2hpbGUobGVuZ3RoID4gaW5kZXgpe1xyXG4gICAgICB2YWx1ZSA9IE9baW5kZXgrK107XHJcbiAgICAgIGlmKHZhbHVlICE9IHZhbHVlKXJldHVybiB0cnVlO1xyXG4gICAgfSBlbHNlIGZvcig7bGVuZ3RoID4gaW5kZXg7IGluZGV4KyspaWYoSVNfSU5DTFVERVMgfHwgaW5kZXggaW4gTyl7XHJcbiAgICAgIGlmKE9baW5kZXhdID09PSBlbClyZXR1cm4gSVNfSU5DTFVERVMgfHwgaW5kZXg7XHJcbiAgICB9IHJldHVybiAhSVNfSU5DTFVERVMgJiYgLTE7XHJcbiAgfTtcclxufTsiLCIvLyAwIC0+IEFycmF5I2ZvckVhY2hcclxuLy8gMSAtPiBBcnJheSNtYXBcclxuLy8gMiAtPiBBcnJheSNmaWx0ZXJcclxuLy8gMyAtPiBBcnJheSNzb21lXHJcbi8vIDQgLT4gQXJyYXkjZXZlcnlcclxuLy8gNSAtPiBBcnJheSNmaW5kXHJcbi8vIDYgLT4gQXJyYXkjZmluZEluZGV4XHJcbnZhciAkICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgY3R4ID0gcmVxdWlyZSgnLi8kLmN0eCcpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKFRZUEUpe1xyXG4gIHZhciBJU19NQVAgICAgICAgID0gVFlQRSA9PSAxXHJcbiAgICAsIElTX0ZJTFRFUiAgICAgPSBUWVBFID09IDJcclxuICAgICwgSVNfU09NRSAgICAgICA9IFRZUEUgPT0gM1xyXG4gICAgLCBJU19FVkVSWSAgICAgID0gVFlQRSA9PSA0XHJcbiAgICAsIElTX0ZJTkRfSU5ERVggPSBUWVBFID09IDZcclxuICAgICwgTk9fSE9MRVMgICAgICA9IFRZUEUgPT0gNSB8fCBJU19GSU5EX0lOREVYO1xyXG4gIHJldHVybiBmdW5jdGlvbigkdGhpcywgY2FsbGJhY2tmbiwgdGhhdCl7XHJcbiAgICB2YXIgTyAgICAgID0gT2JqZWN0KCQuYXNzZXJ0RGVmaW5lZCgkdGhpcykpXHJcbiAgICAgICwgc2VsZiAgID0gJC5FUzVPYmplY3QoTylcclxuICAgICAgLCBmICAgICAgPSBjdHgoY2FsbGJhY2tmbiwgdGhhdCwgMylcclxuICAgICAgLCBsZW5ndGggPSAkLnRvTGVuZ3RoKHNlbGYubGVuZ3RoKVxyXG4gICAgICAsIGluZGV4ICA9IDBcclxuICAgICAgLCByZXN1bHQgPSBJU19NQVAgPyBBcnJheShsZW5ndGgpIDogSVNfRklMVEVSID8gW10gOiB1bmRlZmluZWRcclxuICAgICAgLCB2YWwsIHJlcztcclxuICAgIGZvcig7bGVuZ3RoID4gaW5kZXg7IGluZGV4KyspaWYoTk9fSE9MRVMgfHwgaW5kZXggaW4gc2VsZil7XHJcbiAgICAgIHZhbCA9IHNlbGZbaW5kZXhdO1xyXG4gICAgICByZXMgPSBmKHZhbCwgaW5kZXgsIE8pO1xyXG4gICAgICBpZihUWVBFKXtcclxuICAgICAgICBpZihJU19NQVApcmVzdWx0W2luZGV4XSA9IHJlczsgICAgICAgICAgICAvLyBtYXBcclxuICAgICAgICBlbHNlIGlmKHJlcylzd2l0Y2goVFlQRSl7XHJcbiAgICAgICAgICBjYXNlIDM6IHJldHVybiB0cnVlOyAgICAgICAgICAgICAgICAgICAgLy8gc29tZVxyXG4gICAgICAgICAgY2FzZSA1OiByZXR1cm4gdmFsOyAgICAgICAgICAgICAgICAgICAgIC8vIGZpbmRcclxuICAgICAgICAgIGNhc2UgNjogcmV0dXJuIGluZGV4OyAgICAgICAgICAgICAgICAgICAvLyBmaW5kSW5kZXhcclxuICAgICAgICAgIGNhc2UgMjogcmVzdWx0LnB1c2godmFsKTsgICAgICAgICAgICAgICAvLyBmaWx0ZXJcclxuICAgICAgICB9IGVsc2UgaWYoSVNfRVZFUlkpcmV0dXJuIGZhbHNlOyAgICAgICAgICAvLyBldmVyeVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gSVNfRklORF9JTkRFWCA/IC0xIDogSVNfU09NRSB8fCBJU19FVkVSWSA/IElTX0VWRVJZIDogcmVzdWx0O1xyXG4gIH07XHJcbn07IiwidmFyICQgPSByZXF1aXJlKCcuLyQnKTtcclxuZnVuY3Rpb24gYXNzZXJ0KGNvbmRpdGlvbiwgbXNnMSwgbXNnMil7XHJcbiAgaWYoIWNvbmRpdGlvbil0aHJvdyBUeXBlRXJyb3IobXNnMiA/IG1zZzEgKyBtc2cyIDogbXNnMSk7XHJcbn1cclxuYXNzZXJ0LmRlZiA9ICQuYXNzZXJ0RGVmaW5lZDtcclxuYXNzZXJ0LmZuID0gZnVuY3Rpb24oaXQpe1xyXG4gIGlmKCEkLmlzRnVuY3Rpb24oaXQpKXRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGEgZnVuY3Rpb24hJyk7XHJcbiAgcmV0dXJuIGl0O1xyXG59O1xyXG5hc3NlcnQub2JqID0gZnVuY3Rpb24oaXQpe1xyXG4gIGlmKCEkLmlzT2JqZWN0KGl0KSl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhbiBvYmplY3QhJyk7XHJcbiAgcmV0dXJuIGl0O1xyXG59O1xyXG5hc3NlcnQuaW5zdCA9IGZ1bmN0aW9uKGl0LCBDb25zdHJ1Y3RvciwgbmFtZSl7XHJcbiAgaWYoIShpdCBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSl0aHJvdyBUeXBlRXJyb3IobmFtZSArIFwiOiB1c2UgdGhlICduZXcnIG9wZXJhdG9yIVwiKTtcclxuICByZXR1cm4gaXQ7XHJcbn07XHJcbm1vZHVsZS5leHBvcnRzID0gYXNzZXJ0OyIsInZhciAkICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBlbnVtS2V5cyA9IHJlcXVpcmUoJy4vJC5lbnVtLWtleXMnKTtcclxuLy8gMTkuMS4yLjEgT2JqZWN0LmFzc2lnbih0YXJnZXQsIHNvdXJjZSwgLi4uKVxyXG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gYXNzaWduKHRhcmdldCwgc291cmNlKXtcclxuLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xyXG4gIHZhciBUID0gT2JqZWN0KCQuYXNzZXJ0RGVmaW5lZCh0YXJnZXQpKVxyXG4gICAgLCBsID0gYXJndW1lbnRzLmxlbmd0aFxyXG4gICAgLCBpID0gMTtcclxuICB3aGlsZShsID4gaSl7XHJcbiAgICB2YXIgUyAgICAgID0gJC5FUzVPYmplY3QoYXJndW1lbnRzW2krK10pXHJcbiAgICAgICwga2V5cyAgID0gZW51bUtleXMoUylcclxuICAgICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxyXG4gICAgICAsIGogICAgICA9IDBcclxuICAgICAgLCBrZXk7XHJcbiAgICB3aGlsZShsZW5ndGggPiBqKVRba2V5ID0ga2V5c1tqKytdXSA9IFNba2V5XTtcclxuICB9XHJcbiAgcmV0dXJuIFQ7XHJcbn07IiwidmFyICQgICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIFRBRyAgICAgID0gcmVxdWlyZSgnLi8kLndrcycpKCd0b1N0cmluZ1RhZycpXHJcbiAgLCB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xyXG5mdW5jdGlvbiBjb2YoaXQpe1xyXG4gIHJldHVybiB0b1N0cmluZy5jYWxsKGl0KS5zbGljZSg4LCAtMSk7XHJcbn1cclxuY29mLmNsYXNzb2YgPSBmdW5jdGlvbihpdCl7XHJcbiAgdmFyIE8sIFQ7XHJcbiAgcmV0dXJuIGl0ID09IHVuZGVmaW5lZCA/IGl0ID09PSB1bmRlZmluZWQgPyAnVW5kZWZpbmVkJyA6ICdOdWxsJ1xyXG4gICAgOiB0eXBlb2YgKFQgPSAoTyA9IE9iamVjdChpdCkpW1RBR10pID09ICdzdHJpbmcnID8gVCA6IGNvZihPKTtcclxufTtcclxuY29mLnNldCA9IGZ1bmN0aW9uKGl0LCB0YWcsIHN0YXQpe1xyXG4gIGlmKGl0ICYmICEkLmhhcyhpdCA9IHN0YXQgPyBpdCA6IGl0LnByb3RvdHlwZSwgVEFHKSkkLmhpZGUoaXQsIFRBRywgdGFnKTtcclxufTtcclxubW9kdWxlLmV4cG9ydHMgPSBjb2Y7IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgJCAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgY3R4ICAgICAgPSByZXF1aXJlKCcuLyQuY3R4JylcclxuICAsIHNhZmUgICAgID0gcmVxdWlyZSgnLi8kLnVpZCcpLnNhZmVcclxuICAsIGFzc2VydCAgID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpXHJcbiAgLCBmb3JPZiAgICA9IHJlcXVpcmUoJy4vJC5mb3Itb2YnKVxyXG4gICwgc3RlcCAgICAgPSByZXF1aXJlKCcuLyQuaXRlcicpLnN0ZXBcclxuICAsIGhhcyAgICAgID0gJC5oYXNcclxuICAsIHNldCAgICAgID0gJC5zZXRcclxuICAsIGlzT2JqZWN0ID0gJC5pc09iamVjdFxyXG4gICwgaGlkZSAgICAgPSAkLmhpZGVcclxuICAsIGlzRnJvemVuID0gT2JqZWN0LmlzRnJvemVuIHx8ICQuY29yZS5PYmplY3QuaXNGcm96ZW5cclxuICAsIElEICAgICAgID0gc2FmZSgnaWQnKVxyXG4gICwgTzEgICAgICAgPSBzYWZlKCdPMScpXHJcbiAgLCBMQVNUICAgICA9IHNhZmUoJ2xhc3QnKVxyXG4gICwgRklSU1QgICAgPSBzYWZlKCdmaXJzdCcpXHJcbiAgLCBJVEVSICAgICA9IHNhZmUoJ2l0ZXInKVxyXG4gICwgU0laRSAgICAgPSAkLkRFU0MgPyBzYWZlKCdzaXplJykgOiAnc2l6ZSdcclxuICAsIGlkICAgICAgID0gMDtcclxuXHJcbmZ1bmN0aW9uIGZhc3RLZXkoaXQsIGNyZWF0ZSl7XHJcbiAgLy8gcmV0dXJuIHByaW1pdGl2ZSB3aXRoIHByZWZpeFxyXG4gIGlmKCFpc09iamVjdChpdCkpcmV0dXJuICh0eXBlb2YgaXQgPT0gJ3N0cmluZycgPyAnUycgOiAnUCcpICsgaXQ7XHJcbiAgLy8gY2FuJ3Qgc2V0IGlkIHRvIGZyb3plbiBvYmplY3RcclxuICBpZihpc0Zyb3plbihpdCkpcmV0dXJuICdGJztcclxuICBpZighaGFzKGl0LCBJRCkpe1xyXG4gICAgLy8gbm90IG5lY2Vzc2FyeSB0byBhZGQgaWRcclxuICAgIGlmKCFjcmVhdGUpcmV0dXJuICdFJztcclxuICAgIC8vIGFkZCBtaXNzaW5nIG9iamVjdCBpZFxyXG4gICAgaGlkZShpdCwgSUQsICsraWQpO1xyXG4gIC8vIHJldHVybiBvYmplY3QgaWQgd2l0aCBwcmVmaXhcclxuICB9IHJldHVybiAnTycgKyBpdFtJRF07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEVudHJ5KHRoYXQsIGtleSl7XHJcbiAgLy8gZmFzdCBjYXNlXHJcbiAgdmFyIGluZGV4ID0gZmFzdEtleShrZXkpLCBlbnRyeTtcclxuICBpZihpbmRleCAhPSAnRicpcmV0dXJuIHRoYXRbTzFdW2luZGV4XTtcclxuICAvLyBmcm96ZW4gb2JqZWN0IGNhc2VcclxuICBmb3IoZW50cnkgPSB0aGF0W0ZJUlNUXTsgZW50cnk7IGVudHJ5ID0gZW50cnkubil7XHJcbiAgICBpZihlbnRyeS5rID09IGtleSlyZXR1cm4gZW50cnk7XHJcbiAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBnZXRDb25zdHJ1Y3RvcjogZnVuY3Rpb24oTkFNRSwgSVNfTUFQLCBBRERFUil7XHJcbiAgICBmdW5jdGlvbiBDKCl7XHJcbiAgICAgIHZhciB0aGF0ICAgICA9IGFzc2VydC5pbnN0KHRoaXMsIEMsIE5BTUUpXHJcbiAgICAgICAgLCBpdGVyYWJsZSA9IGFyZ3VtZW50c1swXTtcclxuICAgICAgc2V0KHRoYXQsIE8xLCAkLmNyZWF0ZShudWxsKSk7XHJcbiAgICAgIHNldCh0aGF0LCBTSVpFLCAwKTtcclxuICAgICAgc2V0KHRoYXQsIExBU1QsIHVuZGVmaW5lZCk7XHJcbiAgICAgIHNldCh0aGF0LCBGSVJTVCwgdW5kZWZpbmVkKTtcclxuICAgICAgaWYoaXRlcmFibGUgIT0gdW5kZWZpbmVkKWZvck9mKGl0ZXJhYmxlLCBJU19NQVAsIHRoYXRbQURERVJdLCB0aGF0KTtcclxuICAgIH1cclxuICAgICQubWl4KEMucHJvdG90eXBlLCB7XHJcbiAgICAgIC8vIDIzLjEuMy4xIE1hcC5wcm90b3R5cGUuY2xlYXIoKVxyXG4gICAgICAvLyAyMy4yLjMuMiBTZXQucHJvdG90eXBlLmNsZWFyKClcclxuICAgICAgY2xlYXI6IGZ1bmN0aW9uIGNsZWFyKCl7XHJcbiAgICAgICAgZm9yKHZhciB0aGF0ID0gdGhpcywgZGF0YSA9IHRoYXRbTzFdLCBlbnRyeSA9IHRoYXRbRklSU1RdOyBlbnRyeTsgZW50cnkgPSBlbnRyeS5uKXtcclxuICAgICAgICAgIGVudHJ5LnIgPSB0cnVlO1xyXG4gICAgICAgICAgaWYoZW50cnkucCllbnRyeS5wID0gZW50cnkucC5uID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgZGVsZXRlIGRhdGFbZW50cnkuaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoYXRbRklSU1RdID0gdGhhdFtMQVNUXSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB0aGF0W1NJWkVdID0gMDtcclxuICAgICAgfSxcclxuICAgICAgLy8gMjMuMS4zLjMgTWFwLnByb3RvdHlwZS5kZWxldGUoa2V5KVxyXG4gICAgICAvLyAyMy4yLjMuNCBTZXQucHJvdG90eXBlLmRlbGV0ZSh2YWx1ZSlcclxuICAgICAgJ2RlbGV0ZSc6IGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgICAgdmFyIHRoYXQgID0gdGhpc1xyXG4gICAgICAgICAgLCBlbnRyeSA9IGdldEVudHJ5KHRoYXQsIGtleSk7XHJcbiAgICAgICAgaWYoZW50cnkpe1xyXG4gICAgICAgICAgdmFyIG5leHQgPSBlbnRyeS5uXHJcbiAgICAgICAgICAgICwgcHJldiA9IGVudHJ5LnA7XHJcbiAgICAgICAgICBkZWxldGUgdGhhdFtPMV1bZW50cnkuaV07XHJcbiAgICAgICAgICBlbnRyeS5yID0gdHJ1ZTtcclxuICAgICAgICAgIGlmKHByZXYpcHJldi5uID0gbmV4dDtcclxuICAgICAgICAgIGlmKG5leHQpbmV4dC5wID0gcHJldjtcclxuICAgICAgICAgIGlmKHRoYXRbRklSU1RdID09IGVudHJ5KXRoYXRbRklSU1RdID0gbmV4dDtcclxuICAgICAgICAgIGlmKHRoYXRbTEFTVF0gPT0gZW50cnkpdGhhdFtMQVNUXSA9IHByZXY7XHJcbiAgICAgICAgICB0aGF0W1NJWkVdLS07XHJcbiAgICAgICAgfSByZXR1cm4gISFlbnRyeTtcclxuICAgICAgfSxcclxuICAgICAgLy8gMjMuMi4zLjYgU2V0LnByb3RvdHlwZS5mb3JFYWNoKGNhbGxiYWNrZm4sIHRoaXNBcmcgPSB1bmRlZmluZWQpXHJcbiAgICAgIC8vIDIzLjEuMy41IE1hcC5wcm90b3R5cGUuZm9yRWFjaChjYWxsYmFja2ZuLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxyXG4gICAgICBmb3JFYWNoOiBmdW5jdGlvbiBmb3JFYWNoKGNhbGxiYWNrZm4gLyosIHRoYXQgPSB1bmRlZmluZWQgKi8pe1xyXG4gICAgICAgIHZhciBmID0gY3R4KGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSwgMylcclxuICAgICAgICAgICwgZW50cnk7XHJcbiAgICAgICAgd2hpbGUoZW50cnkgPSBlbnRyeSA/IGVudHJ5Lm4gOiB0aGlzW0ZJUlNUXSl7XHJcbiAgICAgICAgICBmKGVudHJ5LnYsIGVudHJ5LmssIHRoaXMpO1xyXG4gICAgICAgICAgLy8gcmV2ZXJ0IHRvIHRoZSBsYXN0IGV4aXN0aW5nIGVudHJ5XHJcbiAgICAgICAgICB3aGlsZShlbnRyeSAmJiBlbnRyeS5yKWVudHJ5ID0gZW50cnkucDtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIC8vIDIzLjEuMy43IE1hcC5wcm90b3R5cGUuaGFzKGtleSlcclxuICAgICAgLy8gMjMuMi4zLjcgU2V0LnByb3RvdHlwZS5oYXModmFsdWUpXHJcbiAgICAgIGhhczogZnVuY3Rpb24gaGFzKGtleSl7XHJcbiAgICAgICAgcmV0dXJuICEhZ2V0RW50cnkodGhpcywga2V5KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBpZigkLkRFU0MpJC5zZXREZXNjKEMucHJvdG90eXBlLCAnc2l6ZScsIHtcclxuICAgICAgZ2V0OiBmdW5jdGlvbigpe1xyXG4gICAgICAgIHJldHVybiBhc3NlcnQuZGVmKHRoaXNbU0laRV0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBDO1xyXG4gIH0sXHJcbiAgZGVmOiBmdW5jdGlvbih0aGF0LCBrZXksIHZhbHVlKXtcclxuICAgIHZhciBlbnRyeSA9IGdldEVudHJ5KHRoYXQsIGtleSlcclxuICAgICAgLCBwcmV2LCBpbmRleDtcclxuICAgIC8vIGNoYW5nZSBleGlzdGluZyBlbnRyeVxyXG4gICAgaWYoZW50cnkpe1xyXG4gICAgICBlbnRyeS52ID0gdmFsdWU7XHJcbiAgICAvLyBjcmVhdGUgbmV3IGVudHJ5XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGF0W0xBU1RdID0gZW50cnkgPSB7XHJcbiAgICAgICAgaTogaW5kZXggPSBmYXN0S2V5KGtleSwgdHJ1ZSksIC8vIDwtIGluZGV4XHJcbiAgICAgICAgazoga2V5LCAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIGtleVxyXG4gICAgICAgIHY6IHZhbHVlLCAgICAgICAgICAgICAgICAgICAgICAvLyA8LSB2YWx1ZVxyXG4gICAgICAgIHA6IHByZXYgPSB0aGF0W0xBU1RdLCAgICAgICAgICAvLyA8LSBwcmV2aW91cyBlbnRyeVxyXG4gICAgICAgIG46IHVuZGVmaW5lZCwgICAgICAgICAgICAgICAgICAvLyA8LSBuZXh0IGVudHJ5XHJcbiAgICAgICAgcjogZmFsc2UgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIHJlbW92ZWRcclxuICAgICAgfTtcclxuICAgICAgaWYoIXRoYXRbRklSU1RdKXRoYXRbRklSU1RdID0gZW50cnk7XHJcbiAgICAgIGlmKHByZXYpcHJldi5uID0gZW50cnk7XHJcbiAgICAgIHRoYXRbU0laRV0rKztcclxuICAgICAgLy8gYWRkIHRvIGluZGV4XHJcbiAgICAgIGlmKGluZGV4ICE9ICdGJyl0aGF0W08xXVtpbmRleF0gPSBlbnRyeTtcclxuICAgIH0gcmV0dXJuIHRoYXQ7XHJcbiAgfSxcclxuICBnZXRFbnRyeTogZ2V0RW50cnksXHJcbiAgLy8gYWRkIC5rZXlzLCAudmFsdWVzLCAuZW50cmllcywgW0BAaXRlcmF0b3JdXHJcbiAgLy8gMjMuMS4zLjQsIDIzLjEuMy44LCAyMy4xLjMuMTEsIDIzLjEuMy4xMiwgMjMuMi4zLjUsIDIzLjIuMy44LCAyMy4yLjMuMTAsIDIzLjIuMy4xMVxyXG4gIHNldEl0ZXI6IGZ1bmN0aW9uKEMsIE5BTUUsIElTX01BUCl7XHJcbiAgICByZXF1aXJlKCcuLyQuaXRlci1kZWZpbmUnKShDLCBOQU1FLCBmdW5jdGlvbihpdGVyYXRlZCwga2luZCl7XHJcbiAgICAgIHNldCh0aGlzLCBJVEVSLCB7bzogaXRlcmF0ZWQsIGs6IGtpbmR9KTtcclxuICAgIH0sIGZ1bmN0aW9uKCl7XHJcbiAgICAgIHZhciBpdGVyICA9IHRoaXNbSVRFUl1cclxuICAgICAgICAsIGtpbmQgID0gaXRlci5rXHJcbiAgICAgICAgLCBlbnRyeSA9IGl0ZXIubDtcclxuICAgICAgLy8gcmV2ZXJ0IHRvIHRoZSBsYXN0IGV4aXN0aW5nIGVudHJ5XHJcbiAgICAgIHdoaWxlKGVudHJ5ICYmIGVudHJ5LnIpZW50cnkgPSBlbnRyeS5wO1xyXG4gICAgICAvLyBnZXQgbmV4dCBlbnRyeVxyXG4gICAgICBpZighaXRlci5vIHx8ICEoaXRlci5sID0gZW50cnkgPSBlbnRyeSA/IGVudHJ5Lm4gOiBpdGVyLm9bRklSU1RdKSl7XHJcbiAgICAgICAgLy8gb3IgZmluaXNoIHRoZSBpdGVyYXRpb25cclxuICAgICAgICBpdGVyLm8gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgcmV0dXJuIHN0ZXAoMSk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gcmV0dXJuIHN0ZXAgYnkga2luZFxyXG4gICAgICBpZihraW5kID09ICdrZXlzJyAgKXJldHVybiBzdGVwKDAsIGVudHJ5LmspO1xyXG4gICAgICBpZihraW5kID09ICd2YWx1ZXMnKXJldHVybiBzdGVwKDAsIGVudHJ5LnYpO1xyXG4gICAgICByZXR1cm4gc3RlcCgwLCBbZW50cnkuaywgZW50cnkudl0pO1xyXG4gICAgfSwgSVNfTUFQID8gJ2VudHJpZXMnIDogJ3ZhbHVlcycgLCAhSVNfTUFQLCB0cnVlKTtcclxuICB9XHJcbn07IiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL0RhdmlkQnJ1YW50L01hcC1TZXQucHJvdG90eXBlLnRvSlNPTlxyXG52YXIgJGRlZiAgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsIGZvck9mID0gcmVxdWlyZSgnLi8kLmZvci1vZicpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKE5BTUUpe1xyXG4gICRkZWYoJGRlZi5QLCBOQU1FLCB7XHJcbiAgICB0b0pTT046IGZ1bmN0aW9uIHRvSlNPTigpe1xyXG4gICAgICB2YXIgYXJyID0gW107XHJcbiAgICAgIGZvck9mKHRoaXMsIGZhbHNlLCBhcnIucHVzaCwgYXJyKTtcclxuICAgICAgcmV0dXJuIGFycjtcclxuICAgIH1cclxuICB9KTtcclxufTsiLCIndXNlIHN0cmljdCc7XHJcbnZhciAkICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgc2FmZSAgICAgID0gcmVxdWlyZSgnLi8kLnVpZCcpLnNhZmVcclxuICAsIGFzc2VydCAgICA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKVxyXG4gICwgZm9yT2YgICAgID0gcmVxdWlyZSgnLi8kLmZvci1vZicpXHJcbiAgLCBfaGFzICAgICAgPSAkLmhhc1xyXG4gICwgaXNPYmplY3QgID0gJC5pc09iamVjdFxyXG4gICwgaGlkZSAgICAgID0gJC5oaWRlXHJcbiAgLCBpc0Zyb3plbiAgPSBPYmplY3QuaXNGcm96ZW4gfHwgJC5jb3JlLk9iamVjdC5pc0Zyb3plblxyXG4gICwgaWQgICAgICAgID0gMFxyXG4gICwgSUQgICAgICAgID0gc2FmZSgnaWQnKVxyXG4gICwgV0VBSyAgICAgID0gc2FmZSgnd2VhaycpXHJcbiAgLCBMRUFLICAgICAgPSBzYWZlKCdsZWFrJylcclxuICAsIG1ldGhvZCAgICA9IHJlcXVpcmUoJy4vJC5hcnJheS1tZXRob2RzJylcclxuICAsIGZpbmQgICAgICA9IG1ldGhvZCg1KVxyXG4gICwgZmluZEluZGV4ID0gbWV0aG9kKDYpO1xyXG5mdW5jdGlvbiBmaW5kRnJvemVuKHN0b3JlLCBrZXkpe1xyXG4gIHJldHVybiBmaW5kKHN0b3JlLmFycmF5LCBmdW5jdGlvbihpdCl7XHJcbiAgICByZXR1cm4gaXRbMF0gPT09IGtleTtcclxuICB9KTtcclxufVxyXG4vLyBmYWxsYmFjayBmb3IgZnJvemVuIGtleXNcclxuZnVuY3Rpb24gbGVha1N0b3JlKHRoYXQpe1xyXG4gIHJldHVybiB0aGF0W0xFQUtdIHx8IGhpZGUodGhhdCwgTEVBSywge1xyXG4gICAgYXJyYXk6IFtdLFxyXG4gICAgZ2V0OiBmdW5jdGlvbihrZXkpe1xyXG4gICAgICB2YXIgZW50cnkgPSBmaW5kRnJvemVuKHRoaXMsIGtleSk7XHJcbiAgICAgIGlmKGVudHJ5KXJldHVybiBlbnRyeVsxXTtcclxuICAgIH0sXHJcbiAgICBoYXM6IGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgIHJldHVybiAhIWZpbmRGcm96ZW4odGhpcywga2V5KTtcclxuICAgIH0sXHJcbiAgICBzZXQ6IGZ1bmN0aW9uKGtleSwgdmFsdWUpe1xyXG4gICAgICB2YXIgZW50cnkgPSBmaW5kRnJvemVuKHRoaXMsIGtleSk7XHJcbiAgICAgIGlmKGVudHJ5KWVudHJ5WzFdID0gdmFsdWU7XHJcbiAgICAgIGVsc2UgdGhpcy5hcnJheS5wdXNoKFtrZXksIHZhbHVlXSk7XHJcbiAgICB9LFxyXG4gICAgJ2RlbGV0ZSc6IGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgIHZhciBpbmRleCA9IGZpbmRJbmRleCh0aGlzLmFycmF5LCBmdW5jdGlvbihpdCl7XHJcbiAgICAgICAgcmV0dXJuIGl0WzBdID09PSBrZXk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBpZih+aW5kZXgpdGhpcy5hcnJheS5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICByZXR1cm4gISF+aW5kZXg7XHJcbiAgICB9XHJcbiAgfSlbTEVBS107XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIGdldENvbnN0cnVjdG9yOiBmdW5jdGlvbihOQU1FLCBJU19NQVAsIEFEREVSKXtcclxuICAgIGZ1bmN0aW9uIEMoKXtcclxuICAgICAgJC5zZXQoYXNzZXJ0Lmluc3QodGhpcywgQywgTkFNRSksIElELCBpZCsrKTtcclxuICAgICAgdmFyIGl0ZXJhYmxlID0gYXJndW1lbnRzWzBdO1xyXG4gICAgICBpZihpdGVyYWJsZSAhPSB1bmRlZmluZWQpZm9yT2YoaXRlcmFibGUsIElTX01BUCwgdGhpc1tBRERFUl0sIHRoaXMpO1xyXG4gICAgfVxyXG4gICAgJC5taXgoQy5wcm90b3R5cGUsIHtcclxuICAgICAgLy8gMjMuMy4zLjIgV2Vha01hcC5wcm90b3R5cGUuZGVsZXRlKGtleSlcclxuICAgICAgLy8gMjMuNC4zLjMgV2Vha1NldC5wcm90b3R5cGUuZGVsZXRlKHZhbHVlKVxyXG4gICAgICAnZGVsZXRlJzogZnVuY3Rpb24oa2V5KXtcclxuICAgICAgICBpZighaXNPYmplY3Qoa2V5KSlyZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgaWYoaXNGcm96ZW4oa2V5KSlyZXR1cm4gbGVha1N0b3JlKHRoaXMpWydkZWxldGUnXShrZXkpO1xyXG4gICAgICAgIHJldHVybiBfaGFzKGtleSwgV0VBSykgJiYgX2hhcyhrZXlbV0VBS10sIHRoaXNbSURdKSAmJiBkZWxldGUga2V5W1dFQUtdW3RoaXNbSURdXTtcclxuICAgICAgfSxcclxuICAgICAgLy8gMjMuMy4zLjQgV2Vha01hcC5wcm90b3R5cGUuaGFzKGtleSlcclxuICAgICAgLy8gMjMuNC4zLjQgV2Vha1NldC5wcm90b3R5cGUuaGFzKHZhbHVlKVxyXG4gICAgICBoYXM6IGZ1bmN0aW9uIGhhcyhrZXkpe1xyXG4gICAgICAgIGlmKCFpc09iamVjdChrZXkpKXJldHVybiBmYWxzZTtcclxuICAgICAgICBpZihpc0Zyb3plbihrZXkpKXJldHVybiBsZWFrU3RvcmUodGhpcykuaGFzKGtleSk7XHJcbiAgICAgICAgcmV0dXJuIF9oYXMoa2V5LCBXRUFLKSAmJiBfaGFzKGtleVtXRUFLXSwgdGhpc1tJRF0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBDO1xyXG4gIH0sXHJcbiAgZGVmOiBmdW5jdGlvbih0aGF0LCBrZXksIHZhbHVlKXtcclxuICAgIGlmKGlzRnJvemVuKGFzc2VydC5vYmooa2V5KSkpe1xyXG4gICAgICBsZWFrU3RvcmUodGhhdCkuc2V0KGtleSwgdmFsdWUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgX2hhcyhrZXksIFdFQUspIHx8IGhpZGUoa2V5LCBXRUFLLCB7fSk7XHJcbiAgICAgIGtleVtXRUFLXVt0aGF0W0lEXV0gPSB2YWx1ZTtcclxuICAgIH0gcmV0dXJuIHRoYXQ7XHJcbiAgfSxcclxuICBsZWFrU3RvcmU6IGxlYWtTdG9yZSxcclxuICBXRUFLOiBXRUFLLFxyXG4gIElEOiBJRFxyXG59OyIsIid1c2Ugc3RyaWN0JztcclxudmFyICQgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsICRkZWYgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCBCVUdHWSA9IHJlcXVpcmUoJy4vJC5pdGVyJykuQlVHR1lcclxuICAsIGZvck9mID0gcmVxdWlyZSgnLi8kLmZvci1vZicpXHJcbiAgLCBzcGVjaWVzID0gcmVxdWlyZSgnLi8kLnNwZWNpZXMnKVxyXG4gICwgYXNzZXJ0SW5zdGFuY2UgPSByZXF1aXJlKCcuLyQuYXNzZXJ0JykuaW5zdDtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oTkFNRSwgbWV0aG9kcywgY29tbW9uLCBJU19NQVAsIElTX1dFQUspe1xyXG4gIHZhciBCYXNlICA9ICQuZ1tOQU1FXVxyXG4gICAgLCBDICAgICA9IEJhc2VcclxuICAgICwgQURERVIgPSBJU19NQVAgPyAnc2V0JyA6ICdhZGQnXHJcbiAgICAsIHByb3RvID0gQyAmJiBDLnByb3RvdHlwZVxyXG4gICAgLCBPICAgICA9IHt9O1xyXG4gIGZ1bmN0aW9uIGZpeE1ldGhvZChLRVksIENIQUlOKXtcclxuICAgIHZhciBtZXRob2QgPSBwcm90b1tLRVldO1xyXG4gICAgaWYoJC5GVylwcm90b1tLRVldID0gZnVuY3Rpb24oYSwgYil7XHJcbiAgICAgIHZhciByZXN1bHQgPSBtZXRob2QuY2FsbCh0aGlzLCBhID09PSAwID8gMCA6IGEsIGIpO1xyXG4gICAgICByZXR1cm4gQ0hBSU4gPyB0aGlzIDogcmVzdWx0O1xyXG4gICAgfTtcclxuICB9XHJcbiAgaWYoISQuaXNGdW5jdGlvbihDKSB8fCAhKElTX1dFQUsgfHwgIUJVR0dZICYmIHByb3RvLmZvckVhY2ggJiYgcHJvdG8uZW50cmllcykpe1xyXG4gICAgLy8gY3JlYXRlIGNvbGxlY3Rpb24gY29uc3RydWN0b3JcclxuICAgIEMgPSBjb21tb24uZ2V0Q29uc3RydWN0b3IoTkFNRSwgSVNfTUFQLCBBRERFUik7XHJcbiAgICAkLm1peChDLnByb3RvdHlwZSwgbWV0aG9kcyk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHZhciBpbnN0ICA9IG5ldyBDXHJcbiAgICAgICwgY2hhaW4gPSBpbnN0W0FEREVSXShJU19XRUFLID8ge30gOiAtMCwgMSlcclxuICAgICAgLCBidWdneVplcm87XHJcbiAgICAvLyB3cmFwIGZvciBpbml0IGNvbGxlY3Rpb25zIGZyb20gaXRlcmFibGVcclxuICAgIGlmKCFyZXF1aXJlKCcuLyQuaXRlci1kZXRlY3QnKShmdW5jdGlvbihpdGVyKXsgbmV3IEMoaXRlcik7IH0pKXsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1uZXdcclxuICAgICAgQyA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgYXNzZXJ0SW5zdGFuY2UodGhpcywgQywgTkFNRSk7XHJcbiAgICAgICAgdmFyIHRoYXQgICAgID0gbmV3IEJhc2VcclxuICAgICAgICAgICwgaXRlcmFibGUgPSBhcmd1bWVudHNbMF07XHJcbiAgICAgICAgaWYoaXRlcmFibGUgIT0gdW5kZWZpbmVkKWZvck9mKGl0ZXJhYmxlLCBJU19NQVAsIHRoYXRbQURERVJdLCB0aGF0KTtcclxuICAgICAgICByZXR1cm4gdGhhdDtcclxuICAgICAgfTtcclxuICAgICAgQy5wcm90b3R5cGUgPSBwcm90bztcclxuICAgICAgaWYoJC5GVylwcm90by5jb25zdHJ1Y3RvciA9IEM7XHJcbiAgICB9XHJcbiAgICBJU19XRUFLIHx8IGluc3QuZm9yRWFjaChmdW5jdGlvbih2YWwsIGtleSl7XHJcbiAgICAgIGJ1Z2d5WmVybyA9IDEgLyBrZXkgPT09IC1JbmZpbml0eTtcclxuICAgIH0pO1xyXG4gICAgLy8gZml4IGNvbnZlcnRpbmcgLTAga2V5IHRvICswXHJcbiAgICBpZihidWdneVplcm8pe1xyXG4gICAgICBmaXhNZXRob2QoJ2RlbGV0ZScpO1xyXG4gICAgICBmaXhNZXRob2QoJ2hhcycpO1xyXG4gICAgICBJU19NQVAgJiYgZml4TWV0aG9kKCdnZXQnKTtcclxuICAgIH1cclxuICAgIC8vICsgZml4IC5hZGQgJiAuc2V0IGZvciBjaGFpbmluZ1xyXG4gICAgaWYoYnVnZ3laZXJvIHx8IGNoYWluICE9PSBpbnN0KWZpeE1ldGhvZChBRERFUiwgdHJ1ZSk7XHJcbiAgfVxyXG5cclxuICByZXF1aXJlKCcuLyQuY29mJykuc2V0KEMsIE5BTUUpO1xyXG5cclxuICBPW05BTUVdID0gQztcclxuICAkZGVmKCRkZWYuRyArICRkZWYuVyArICRkZWYuRiAqIChDICE9IEJhc2UpLCBPKTtcclxuICBzcGVjaWVzKEMpO1xyXG4gIHNwZWNpZXMoJC5jb3JlW05BTUVdKTsgLy8gZm9yIHdyYXBwZXJcclxuXHJcbiAgaWYoIUlTX1dFQUspY29tbW9uLnNldEl0ZXIoQywgTkFNRSwgSVNfTUFQKTtcclxuXHJcbiAgcmV0dXJuIEM7XHJcbn07IiwiLy8gT3B0aW9uYWwgLyBzaW1wbGUgY29udGV4dCBiaW5kaW5nXHJcbnZhciBhc3NlcnRGdW5jdGlvbiA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKS5mbjtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmbiwgdGhhdCwgbGVuZ3RoKXtcclxuICBhc3NlcnRGdW5jdGlvbihmbik7XHJcbiAgaWYofmxlbmd0aCAmJiB0aGF0ID09PSB1bmRlZmluZWQpcmV0dXJuIGZuO1xyXG4gIHN3aXRjaChsZW5ndGgpe1xyXG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24oYSl7XHJcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEpO1xyXG4gICAgfTtcclxuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmN0aW9uKGEsIGIpe1xyXG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiKTtcclxuICAgIH07XHJcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbihhLCBiLCBjKXtcclxuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYiwgYyk7XHJcbiAgICB9O1xyXG4gIH0gcmV0dXJuIGZ1bmN0aW9uKC8qIC4uLmFyZ3MgKi8pe1xyXG4gICAgICByZXR1cm4gZm4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcclxuICAgIH07XHJcbn07IiwidmFyICQgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgZ2xvYmFsICAgICA9ICQuZ1xyXG4gICwgY29yZSAgICAgICA9ICQuY29yZVxyXG4gICwgaXNGdW5jdGlvbiA9ICQuaXNGdW5jdGlvbjtcclxuZnVuY3Rpb24gY3R4KGZuLCB0aGF0KXtcclxuICByZXR1cm4gZnVuY3Rpb24oKXtcclxuICAgIHJldHVybiBmbi5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xyXG4gIH07XHJcbn1cclxuZ2xvYmFsLmNvcmUgPSBjb3JlO1xyXG4vLyB0eXBlIGJpdG1hcFxyXG4kZGVmLkYgPSAxOyAgLy8gZm9yY2VkXHJcbiRkZWYuRyA9IDI7ICAvLyBnbG9iYWxcclxuJGRlZi5TID0gNDsgIC8vIHN0YXRpY1xyXG4kZGVmLlAgPSA4OyAgLy8gcHJvdG9cclxuJGRlZi5CID0gMTY7IC8vIGJpbmRcclxuJGRlZi5XID0gMzI7IC8vIHdyYXBcclxuZnVuY3Rpb24gJGRlZih0eXBlLCBuYW1lLCBzb3VyY2Upe1xyXG4gIHZhciBrZXksIG93biwgb3V0LCBleHBcclxuICAgICwgaXNHbG9iYWwgPSB0eXBlICYgJGRlZi5HXHJcbiAgICAsIHRhcmdldCAgID0gaXNHbG9iYWwgPyBnbG9iYWwgOiB0eXBlICYgJGRlZi5TXHJcbiAgICAgICAgPyBnbG9iYWxbbmFtZV0gOiAoZ2xvYmFsW25hbWVdIHx8IHt9KS5wcm90b3R5cGVcclxuICAgICwgZXhwb3J0cyAgPSBpc0dsb2JhbCA/IGNvcmUgOiBjb3JlW25hbWVdIHx8IChjb3JlW25hbWVdID0ge30pO1xyXG4gIGlmKGlzR2xvYmFsKXNvdXJjZSA9IG5hbWU7XHJcbiAgZm9yKGtleSBpbiBzb3VyY2Upe1xyXG4gICAgLy8gY29udGFpbnMgaW4gbmF0aXZlXHJcbiAgICBvd24gPSAhKHR5cGUgJiAkZGVmLkYpICYmIHRhcmdldCAmJiBrZXkgaW4gdGFyZ2V0O1xyXG4gICAgLy8gZXhwb3J0IG5hdGl2ZSBvciBwYXNzZWRcclxuICAgIG91dCA9IChvd24gPyB0YXJnZXQgOiBzb3VyY2UpW2tleV07XHJcbiAgICAvLyBiaW5kIHRpbWVycyB0byBnbG9iYWwgZm9yIGNhbGwgZnJvbSBleHBvcnQgY29udGV4dFxyXG4gICAgaWYodHlwZSAmICRkZWYuQiAmJiBvd24pZXhwID0gY3R4KG91dCwgZ2xvYmFsKTtcclxuICAgIGVsc2UgZXhwID0gdHlwZSAmICRkZWYuUCAmJiBpc0Z1bmN0aW9uKG91dCkgPyBjdHgoRnVuY3Rpb24uY2FsbCwgb3V0KSA6IG91dDtcclxuICAgIC8vIGV4dGVuZCBnbG9iYWxcclxuICAgIGlmKHRhcmdldCAmJiAhb3duKXtcclxuICAgICAgaWYoaXNHbG9iYWwpdGFyZ2V0W2tleV0gPSBvdXQ7XHJcbiAgICAgIGVsc2UgZGVsZXRlIHRhcmdldFtrZXldICYmICQuaGlkZSh0YXJnZXQsIGtleSwgb3V0KTtcclxuICAgIH1cclxuICAgIC8vIGV4cG9ydFxyXG4gICAgaWYoZXhwb3J0c1trZXldICE9IG91dCkkLmhpZGUoZXhwb3J0cywga2V5LCBleHApO1xyXG4gIH1cclxufVxyXG5tb2R1bGUuZXhwb3J0cyA9ICRkZWY7IiwidmFyICQgICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIGRvY3VtZW50ID0gJC5nLmRvY3VtZW50XHJcbiAgLCBpc09iamVjdCA9ICQuaXNPYmplY3RcclxuICAvLyBpbiBvbGQgSUUgdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgaXMgJ29iamVjdCdcclxuICAsIGlzID0gaXNPYmplY3QoZG9jdW1lbnQpICYmIGlzT2JqZWN0KGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcclxuICByZXR1cm4gaXMgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGl0KSA6IHt9O1xyXG59OyIsInZhciAkID0gcmVxdWlyZSgnLi8kJyk7XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xyXG4gIHZhciBrZXlzICAgICAgID0gJC5nZXRLZXlzKGl0KVxyXG4gICAgLCBnZXREZXNjICAgID0gJC5nZXREZXNjXHJcbiAgICAsIGdldFN5bWJvbHMgPSAkLmdldFN5bWJvbHM7XHJcbiAgaWYoZ2V0U3ltYm9scykkLmVhY2guY2FsbChnZXRTeW1ib2xzKGl0KSwgZnVuY3Rpb24oa2V5KXtcclxuICAgIGlmKGdldERlc2MoaXQsIGtleSkuZW51bWVyYWJsZSlrZXlzLnB1c2goa2V5KTtcclxuICB9KTtcclxuICByZXR1cm4ga2V5cztcclxufTsiLCJ2YXIgY3R4ICA9IHJlcXVpcmUoJy4vJC5jdHgnKVxyXG4gICwgZ2V0ICA9IHJlcXVpcmUoJy4vJC5pdGVyJykuZ2V0XHJcbiAgLCBjYWxsID0gcmVxdWlyZSgnLi8kLml0ZXItY2FsbCcpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0ZXJhYmxlLCBlbnRyaWVzLCBmbiwgdGhhdCl7XHJcbiAgdmFyIGl0ZXJhdG9yID0gZ2V0KGl0ZXJhYmxlKVxyXG4gICAgLCBmICAgICAgICA9IGN0eChmbiwgdGhhdCwgZW50cmllcyA/IDIgOiAxKVxyXG4gICAgLCBzdGVwO1xyXG4gIHdoaWxlKCEoc3RlcCA9IGl0ZXJhdG9yLm5leHQoKSkuZG9uZSl7XHJcbiAgICBpZihjYWxsKGl0ZXJhdG9yLCBmLCBzdGVwLnZhbHVlLCBlbnRyaWVzKSA9PT0gZmFsc2Upe1xyXG4gICAgICByZXR1cm4gY2FsbC5jbG9zZShpdGVyYXRvcik7XHJcbiAgICB9XHJcbiAgfVxyXG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJCl7XHJcbiAgJC5GVyAgID0gdHJ1ZTtcclxuICAkLnBhdGggPSAkLmc7XHJcbiAgcmV0dXJuICQ7XHJcbn07IiwiLy8gRmFzdCBhcHBseVxyXG4vLyBodHRwOi8vanNwZXJmLmxua2l0LmNvbS9mYXN0LWFwcGx5LzVcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmbiwgYXJncywgdGhhdCl7XHJcbiAgdmFyIHVuID0gdGhhdCA9PT0gdW5kZWZpbmVkO1xyXG4gIHN3aXRjaChhcmdzLmxlbmd0aCl7XHJcbiAgICBjYXNlIDA6IHJldHVybiB1biA/IGZuKClcclxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0KTtcclxuICAgIGNhc2UgMTogcmV0dXJuIHVuID8gZm4oYXJnc1swXSlcclxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdKTtcclxuICAgIGNhc2UgMjogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSlcclxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdKTtcclxuICAgIGNhc2UgMzogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSlcclxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdKTtcclxuICAgIGNhc2UgNDogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSlcclxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdLCBhcmdzWzNdKTtcclxuICAgIGNhc2UgNTogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSwgYXJnc1s0XSlcclxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdLCBhcmdzWzNdLCBhcmdzWzRdKTtcclxuICB9IHJldHVybiAgICAgICAgICAgICAgZm4uYXBwbHkodGhhdCwgYXJncyk7XHJcbn07IiwidmFyIGFzc2VydE9iamVjdCA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKS5vYmo7XHJcbmZ1bmN0aW9uIGNsb3NlKGl0ZXJhdG9yKXtcclxuICB2YXIgcmV0ID0gaXRlcmF0b3JbJ3JldHVybiddO1xyXG4gIGlmKHJldCAhPT0gdW5kZWZpbmVkKWFzc2VydE9iamVjdChyZXQuY2FsbChpdGVyYXRvcikpO1xyXG59XHJcbmZ1bmN0aW9uIGNhbGwoaXRlcmF0b3IsIGZuLCB2YWx1ZSwgZW50cmllcyl7XHJcbiAgdHJ5IHtcclxuICAgIHJldHVybiBlbnRyaWVzID8gZm4oYXNzZXJ0T2JqZWN0KHZhbHVlKVswXSwgdmFsdWVbMV0pIDogZm4odmFsdWUpO1xyXG4gIH0gY2F0Y2goZSl7XHJcbiAgICBjbG9zZShpdGVyYXRvcik7XHJcbiAgICB0aHJvdyBlO1xyXG4gIH1cclxufVxyXG5jYWxsLmNsb3NlID0gY2xvc2U7XHJcbm1vZHVsZS5leHBvcnRzID0gY2FsbDsiLCJ2YXIgJGRlZiAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCAkICAgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgY29mICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmNvZicpXHJcbiAgLCAkaXRlciAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuaXRlcicpXHJcbiAgLCBTWU1CT0xfSVRFUkFUT1IgPSByZXF1aXJlKCcuLyQud2tzJykoJ2l0ZXJhdG9yJylcclxuICAsIEZGX0lURVJBVE9SICAgICA9ICdAQGl0ZXJhdG9yJ1xyXG4gICwgS0VZUyAgICAgICAgICAgID0gJ2tleXMnXHJcbiAgLCBWQUxVRVMgICAgICAgICAgPSAndmFsdWVzJ1xyXG4gICwgSXRlcmF0b3JzICAgICAgID0gJGl0ZXIuSXRlcmF0b3JzO1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKEJhc2UsIE5BTUUsIENvbnN0cnVjdG9yLCBuZXh0LCBERUZBVUxULCBJU19TRVQsIEZPUkNFKXtcclxuICAkaXRlci5jcmVhdGUoQ29uc3RydWN0b3IsIE5BTUUsIG5leHQpO1xyXG4gIGZ1bmN0aW9uIGNyZWF0ZU1ldGhvZChraW5kKXtcclxuICAgIGZ1bmN0aW9uICQkKHRoYXQpe1xyXG4gICAgICByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRoYXQsIGtpbmQpO1xyXG4gICAgfVxyXG4gICAgc3dpdGNoKGtpbmQpe1xyXG4gICAgICBjYXNlIEtFWVM6IHJldHVybiBmdW5jdGlvbiBrZXlzKCl7IHJldHVybiAkJCh0aGlzKTsgfTtcclxuICAgICAgY2FzZSBWQUxVRVM6IHJldHVybiBmdW5jdGlvbiB2YWx1ZXMoKXsgcmV0dXJuICQkKHRoaXMpOyB9O1xyXG4gICAgfSByZXR1cm4gZnVuY3Rpb24gZW50cmllcygpeyByZXR1cm4gJCQodGhpcyk7IH07XHJcbiAgfVxyXG4gIHZhciBUQUcgICAgICA9IE5BTUUgKyAnIEl0ZXJhdG9yJ1xyXG4gICAgLCBwcm90byAgICA9IEJhc2UucHJvdG90eXBlXHJcbiAgICAsIF9uYXRpdmUgID0gcHJvdG9bU1lNQk9MX0lURVJBVE9SXSB8fCBwcm90b1tGRl9JVEVSQVRPUl0gfHwgREVGQVVMVCAmJiBwcm90b1tERUZBVUxUXVxyXG4gICAgLCBfZGVmYXVsdCA9IF9uYXRpdmUgfHwgY3JlYXRlTWV0aG9kKERFRkFVTFQpXHJcbiAgICAsIG1ldGhvZHMsIGtleTtcclxuICAvLyBGaXggbmF0aXZlXHJcbiAgaWYoX25hdGl2ZSl7XHJcbiAgICB2YXIgSXRlcmF0b3JQcm90b3R5cGUgPSAkLmdldFByb3RvKF9kZWZhdWx0LmNhbGwobmV3IEJhc2UpKTtcclxuICAgIC8vIFNldCBAQHRvU3RyaW5nVGFnIHRvIG5hdGl2ZSBpdGVyYXRvcnNcclxuICAgIGNvZi5zZXQoSXRlcmF0b3JQcm90b3R5cGUsIFRBRywgdHJ1ZSk7XHJcbiAgICAvLyBGRiBmaXhcclxuICAgIGlmKCQuRlcgJiYgJC5oYXMocHJvdG8sIEZGX0lURVJBVE9SKSkkaXRlci5zZXQoSXRlcmF0b3JQcm90b3R5cGUsICQudGhhdCk7XHJcbiAgfVxyXG4gIC8vIERlZmluZSBpdGVyYXRvclxyXG4gIGlmKCQuRlcpJGl0ZXIuc2V0KHByb3RvLCBfZGVmYXVsdCk7XHJcbiAgLy8gUGx1ZyBmb3IgbGlicmFyeVxyXG4gIEl0ZXJhdG9yc1tOQU1FXSA9IF9kZWZhdWx0O1xyXG4gIEl0ZXJhdG9yc1tUQUddICA9ICQudGhhdDtcclxuICBpZihERUZBVUxUKXtcclxuICAgIG1ldGhvZHMgPSB7XHJcbiAgICAgIGtleXM6ICAgIElTX1NFVCAgICAgICAgICAgID8gX2RlZmF1bHQgOiBjcmVhdGVNZXRob2QoS0VZUyksXHJcbiAgICAgIHZhbHVlczogIERFRkFVTFQgPT0gVkFMVUVTID8gX2RlZmF1bHQgOiBjcmVhdGVNZXRob2QoVkFMVUVTKSxcclxuICAgICAgZW50cmllczogREVGQVVMVCAhPSBWQUxVRVMgPyBfZGVmYXVsdCA6IGNyZWF0ZU1ldGhvZCgnZW50cmllcycpXHJcbiAgICB9O1xyXG4gICAgaWYoRk9SQ0UpZm9yKGtleSBpbiBtZXRob2RzKXtcclxuICAgICAgaWYoIShrZXkgaW4gcHJvdG8pKSQuaGlkZShwcm90bywga2V5LCBtZXRob2RzW2tleV0pO1xyXG4gICAgfSBlbHNlICRkZWYoJGRlZi5QICsgJGRlZi5GICogJGl0ZXIuQlVHR1ksIE5BTUUsIG1ldGhvZHMpO1xyXG4gIH1cclxufTsiLCJ2YXIgU1lNQk9MX0lURVJBVE9SID0gcmVxdWlyZSgnLi8kLndrcycpKCdpdGVyYXRvcicpXHJcbiAgLCBTQUZFX0NMT1NJTkcgICAgPSBmYWxzZTtcclxudHJ5IHtcclxuICB2YXIgcml0ZXIgPSBbN11bU1lNQk9MX0lURVJBVE9SXSgpO1xyXG4gIHJpdGVyWydyZXR1cm4nXSA9IGZ1bmN0aW9uKCl7IFNBRkVfQ0xPU0lORyA9IHRydWU7IH07XHJcbiAgQXJyYXkuZnJvbShyaXRlciwgZnVuY3Rpb24oKXsgdGhyb3cgMjsgfSk7XHJcbn0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihleGVjKXtcclxuICBpZighU0FGRV9DTE9TSU5HKXJldHVybiBmYWxzZTtcclxuICB2YXIgc2FmZSA9IGZhbHNlO1xyXG4gIHRyeSB7XHJcbiAgICB2YXIgYXJyICA9IFs3XVxyXG4gICAgICAsIGl0ZXIgPSBhcnJbU1lNQk9MX0lURVJBVE9SXSgpO1xyXG4gICAgaXRlci5uZXh0ID0gZnVuY3Rpb24oKXsgc2FmZSA9IHRydWU7IH07XHJcbiAgICBhcnJbU1lNQk9MX0lURVJBVE9SXSA9IGZ1bmN0aW9uKCl7IHJldHVybiBpdGVyOyB9O1xyXG4gICAgZXhlYyhhcnIpO1xyXG4gIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cclxuICByZXR1cm4gc2FmZTtcclxufTsiLCIndXNlIHN0cmljdCc7XHJcbnZhciAkICAgICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBjb2YgICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5jb2YnKVxyXG4gICwgYXNzZXJ0T2JqZWN0ICAgICAgPSByZXF1aXJlKCcuLyQuYXNzZXJ0Jykub2JqXHJcbiAgLCBTWU1CT0xfSVRFUkFUT1IgICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxyXG4gICwgRkZfSVRFUkFUT1IgICAgICAgPSAnQEBpdGVyYXRvcidcclxuICAsIEl0ZXJhdG9ycyAgICAgICAgID0ge31cclxuICAsIEl0ZXJhdG9yUHJvdG90eXBlID0ge307XHJcbi8vIDI1LjEuMi4xLjEgJUl0ZXJhdG9yUHJvdG90eXBlJVtAQGl0ZXJhdG9yXSgpXHJcbnNldEl0ZXJhdG9yKEl0ZXJhdG9yUHJvdG90eXBlLCAkLnRoYXQpO1xyXG5mdW5jdGlvbiBzZXRJdGVyYXRvcihPLCB2YWx1ZSl7XHJcbiAgJC5oaWRlKE8sIFNZTUJPTF9JVEVSQVRPUiwgdmFsdWUpO1xyXG4gIC8vIEFkZCBpdGVyYXRvciBmb3IgRkYgaXRlcmF0b3IgcHJvdG9jb2xcclxuICBpZihGRl9JVEVSQVRPUiBpbiBbXSkkLmhpZGUoTywgRkZfSVRFUkFUT1IsIHZhbHVlKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgLy8gU2FmYXJpIGhhcyBidWdneSBpdGVyYXRvcnMgdy9vIGBuZXh0YFxyXG4gIEJVR0dZOiAna2V5cycgaW4gW10gJiYgISgnbmV4dCcgaW4gW10ua2V5cygpKSxcclxuICBJdGVyYXRvcnM6IEl0ZXJhdG9ycyxcclxuICBzdGVwOiBmdW5jdGlvbihkb25lLCB2YWx1ZSl7XHJcbiAgICByZXR1cm4ge3ZhbHVlOiB2YWx1ZSwgZG9uZTogISFkb25lfTtcclxuICB9LFxyXG4gIGlzOiBmdW5jdGlvbihpdCl7XHJcbiAgICB2YXIgTyAgICAgID0gT2JqZWN0KGl0KVxyXG4gICAgICAsIFN5bWJvbCA9ICQuZy5TeW1ib2xcclxuICAgICAgLCBTWU0gICAgPSBTeW1ib2wgJiYgU3ltYm9sLml0ZXJhdG9yIHx8IEZGX0lURVJBVE9SO1xyXG4gICAgcmV0dXJuIFNZTSBpbiBPIHx8IFNZTUJPTF9JVEVSQVRPUiBpbiBPIHx8ICQuaGFzKEl0ZXJhdG9ycywgY29mLmNsYXNzb2YoTykpO1xyXG4gIH0sXHJcbiAgZ2V0OiBmdW5jdGlvbihpdCl7XHJcbiAgICB2YXIgU3ltYm9sICA9ICQuZy5TeW1ib2xcclxuICAgICAgLCBleHQgICAgID0gaXRbU3ltYm9sICYmIFN5bWJvbC5pdGVyYXRvciB8fCBGRl9JVEVSQVRPUl1cclxuICAgICAgLCBnZXRJdGVyID0gZXh0IHx8IGl0W1NZTUJPTF9JVEVSQVRPUl0gfHwgSXRlcmF0b3JzW2NvZi5jbGFzc29mKGl0KV07XHJcbiAgICByZXR1cm4gYXNzZXJ0T2JqZWN0KGdldEl0ZXIuY2FsbChpdCkpO1xyXG4gIH0sXHJcbiAgc2V0OiBzZXRJdGVyYXRvcixcclxuICBjcmVhdGU6IGZ1bmN0aW9uKENvbnN0cnVjdG9yLCBOQU1FLCBuZXh0LCBwcm90byl7XHJcbiAgICBDb25zdHJ1Y3Rvci5wcm90b3R5cGUgPSAkLmNyZWF0ZShwcm90byB8fCBJdGVyYXRvclByb3RvdHlwZSwge25leHQ6ICQuZGVzYygxLCBuZXh0KX0pO1xyXG4gICAgY29mLnNldChDb25zdHJ1Y3RvciwgTkFNRSArICcgSXRlcmF0b3InKTtcclxuICB9XHJcbn07IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgZ2xvYmFsID0gdHlwZW9mIHNlbGYgIT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDogRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKVxyXG4gICwgY29yZSAgID0ge31cclxuICAsIGRlZmluZVByb3BlcnR5ID0gT2JqZWN0LmRlZmluZVByb3BlcnR5XHJcbiAgLCBoYXNPd25Qcm9wZXJ0eSA9IHt9Lmhhc093blByb3BlcnR5XHJcbiAgLCBjZWlsICA9IE1hdGguY2VpbFxyXG4gICwgZmxvb3IgPSBNYXRoLmZsb29yXHJcbiAgLCBtYXggICA9IE1hdGgubWF4XHJcbiAgLCBtaW4gICA9IE1hdGgubWluO1xyXG4vLyBUaGUgZW5naW5lIHdvcmtzIGZpbmUgd2l0aCBkZXNjcmlwdG9ycz8gVGhhbmsncyBJRTggZm9yIGhpcyBmdW5ueSBkZWZpbmVQcm9wZXJ0eS5cclxudmFyIERFU0MgPSAhIWZ1bmN0aW9uKCl7XHJcbiAgdHJ5IHtcclxuICAgIHJldHVybiBkZWZpbmVQcm9wZXJ0eSh7fSwgJ2EnLCB7Z2V0OiBmdW5jdGlvbigpeyByZXR1cm4gMjsgfX0pLmEgPT0gMjtcclxuICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XHJcbn0oKTtcclxudmFyIGhpZGUgPSBjcmVhdGVEZWZpbmVyKDEpO1xyXG4vLyA3LjEuNCBUb0ludGVnZXJcclxuZnVuY3Rpb24gdG9JbnRlZ2VyKGl0KXtcclxuICByZXR1cm4gaXNOYU4oaXQgPSAraXQpID8gMCA6IChpdCA+IDAgPyBmbG9vciA6IGNlaWwpKGl0KTtcclxufVxyXG5mdW5jdGlvbiBkZXNjKGJpdG1hcCwgdmFsdWUpe1xyXG4gIHJldHVybiB7XHJcbiAgICBlbnVtZXJhYmxlICA6ICEoYml0bWFwICYgMSksXHJcbiAgICBjb25maWd1cmFibGU6ICEoYml0bWFwICYgMiksXHJcbiAgICB3cml0YWJsZSAgICA6ICEoYml0bWFwICYgNCksXHJcbiAgICB2YWx1ZSAgICAgICA6IHZhbHVlXHJcbiAgfTtcclxufVxyXG5mdW5jdGlvbiBzaW1wbGVTZXQob2JqZWN0LCBrZXksIHZhbHVlKXtcclxuICBvYmplY3Rba2V5XSA9IHZhbHVlO1xyXG4gIHJldHVybiBvYmplY3Q7XHJcbn1cclxuZnVuY3Rpb24gY3JlYXRlRGVmaW5lcihiaXRtYXApe1xyXG4gIHJldHVybiBERVNDID8gZnVuY3Rpb24ob2JqZWN0LCBrZXksIHZhbHVlKXtcclxuICAgIHJldHVybiAkLnNldERlc2Mob2JqZWN0LCBrZXksIGRlc2MoYml0bWFwLCB2YWx1ZSkpO1xyXG4gIH0gOiBzaW1wbGVTZXQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzT2JqZWN0KGl0KXtcclxuICByZXR1cm4gaXQgIT09IG51bGwgJiYgKHR5cGVvZiBpdCA9PSAnb2JqZWN0JyB8fCB0eXBlb2YgaXQgPT0gJ2Z1bmN0aW9uJyk7XHJcbn1cclxuZnVuY3Rpb24gaXNGdW5jdGlvbihpdCl7XHJcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PSAnZnVuY3Rpb24nO1xyXG59XHJcbmZ1bmN0aW9uIGFzc2VydERlZmluZWQoaXQpe1xyXG4gIGlmKGl0ID09IHVuZGVmaW5lZCl0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjYWxsIG1ldGhvZCBvbiAgXCIgKyBpdCk7XHJcbiAgcmV0dXJuIGl0O1xyXG59XHJcblxyXG52YXIgJCA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLmZ3Jykoe1xyXG4gIGc6IGdsb2JhbCxcclxuICBjb3JlOiBjb3JlLFxyXG4gIGh0bWw6IGdsb2JhbC5kb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsXHJcbiAgLy8gaHR0cDovL2pzcGVyZi5jb20vY29yZS1qcy1pc29iamVjdFxyXG4gIGlzT2JqZWN0OiAgIGlzT2JqZWN0LFxyXG4gIGlzRnVuY3Rpb246IGlzRnVuY3Rpb24sXHJcbiAgaXQ6IGZ1bmN0aW9uKGl0KXtcclxuICAgIHJldHVybiBpdDtcclxuICB9LFxyXG4gIHRoYXQ6IGZ1bmN0aW9uKCl7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9LFxyXG4gIC8vIDcuMS40IFRvSW50ZWdlclxyXG4gIHRvSW50ZWdlcjogdG9JbnRlZ2VyLFxyXG4gIC8vIDcuMS4xNSBUb0xlbmd0aFxyXG4gIHRvTGVuZ3RoOiBmdW5jdGlvbihpdCl7XHJcbiAgICByZXR1cm4gaXQgPiAwID8gbWluKHRvSW50ZWdlcihpdCksIDB4MWZmZmZmZmZmZmZmZmYpIDogMDsgLy8gcG93KDIsIDUzKSAtIDEgPT0gOTAwNzE5OTI1NDc0MDk5MVxyXG4gIH0sXHJcbiAgdG9JbmRleDogZnVuY3Rpb24oaW5kZXgsIGxlbmd0aCl7XHJcbiAgICBpbmRleCA9IHRvSW50ZWdlcihpbmRleCk7XHJcbiAgICByZXR1cm4gaW5kZXggPCAwID8gbWF4KGluZGV4ICsgbGVuZ3RoLCAwKSA6IG1pbihpbmRleCwgbGVuZ3RoKTtcclxuICB9LFxyXG4gIGhhczogZnVuY3Rpb24oaXQsIGtleSl7XHJcbiAgICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChpdCwga2V5KTtcclxuICB9LFxyXG4gIGNyZWF0ZTogICAgIE9iamVjdC5jcmVhdGUsXHJcbiAgZ2V0UHJvdG86ICAgT2JqZWN0LmdldFByb3RvdHlwZU9mLFxyXG4gIERFU0M6ICAgICAgIERFU0MsXHJcbiAgZGVzYzogICAgICAgZGVzYyxcclxuICBnZXREZXNjOiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yLFxyXG4gIHNldERlc2M6ICAgIGRlZmluZVByb3BlcnR5LFxyXG4gIHNldERlc2NzOiAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzLFxyXG4gIGdldEtleXM6ICAgIE9iamVjdC5rZXlzLFxyXG4gIGdldE5hbWVzOiAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzLFxyXG4gIGdldFN5bWJvbHM6IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMsXHJcbiAgYXNzZXJ0RGVmaW5lZDogYXNzZXJ0RGVmaW5lZCxcclxuICAvLyBEdW1teSwgZml4IGZvciBub3QgYXJyYXktbGlrZSBFUzMgc3RyaW5nIGluIGVzNSBtb2R1bGVcclxuICBFUzVPYmplY3Q6IE9iamVjdCxcclxuICB0b09iamVjdDogZnVuY3Rpb24oaXQpe1xyXG4gICAgcmV0dXJuICQuRVM1T2JqZWN0KGFzc2VydERlZmluZWQoaXQpKTtcclxuICB9LFxyXG4gIGhpZGU6IGhpZGUsXHJcbiAgZGVmOiBjcmVhdGVEZWZpbmVyKDApLFxyXG4gIHNldDogZ2xvYmFsLlN5bWJvbCA/IHNpbXBsZVNldCA6IGhpZGUsXHJcbiAgbWl4OiBmdW5jdGlvbih0YXJnZXQsIHNyYyl7XHJcbiAgICBmb3IodmFyIGtleSBpbiBzcmMpaGlkZSh0YXJnZXQsIGtleSwgc3JjW2tleV0pO1xyXG4gICAgcmV0dXJuIHRhcmdldDtcclxuICB9LFxyXG4gIGVhY2g6IFtdLmZvckVhY2hcclxufSk7XHJcbi8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXHJcbmlmKHR5cGVvZiBfX2UgIT0gJ3VuZGVmaW5lZCcpX19lID0gY29yZTtcclxuaWYodHlwZW9mIF9fZyAhPSAndW5kZWZpbmVkJylfX2cgPSBnbG9iYWw7IiwidmFyICQgPSByZXF1aXJlKCcuLyQnKTtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmplY3QsIGVsKXtcclxuICB2YXIgTyAgICAgID0gJC50b09iamVjdChvYmplY3QpXHJcbiAgICAsIGtleXMgICA9ICQuZ2V0S2V5cyhPKVxyXG4gICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxyXG4gICAgLCBpbmRleCAgPSAwXHJcbiAgICAsIGtleTtcclxuICB3aGlsZShsZW5ndGggPiBpbmRleClpZihPW2tleSA9IGtleXNbaW5kZXgrK11dID09PSBlbClyZXR1cm4ga2V5O1xyXG59OyIsInZhciAkICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgYXNzZXJ0T2JqZWN0ID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpLm9iajtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBvd25LZXlzKGl0KXtcclxuICBhc3NlcnRPYmplY3QoaXQpO1xyXG4gIHZhciBrZXlzICAgICAgID0gJC5nZXROYW1lcyhpdClcclxuICAgICwgZ2V0U3ltYm9scyA9ICQuZ2V0U3ltYm9scztcclxuICByZXR1cm4gZ2V0U3ltYm9scyA/IGtleXMuY29uY2F0KGdldFN5bWJvbHMoaXQpKSA6IGtleXM7XHJcbn07IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgJCAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIGludm9rZSA9IHJlcXVpcmUoJy4vJC5pbnZva2UnKVxyXG4gICwgYXNzZXJ0RnVuY3Rpb24gPSByZXF1aXJlKCcuLyQuYXNzZXJ0JykuZm47XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oLyogLi4ucGFyZ3MgKi8pe1xyXG4gIHZhciBmbiAgICAgPSBhc3NlcnRGdW5jdGlvbih0aGlzKVxyXG4gICAgLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoXHJcbiAgICAsIHBhcmdzICA9IEFycmF5KGxlbmd0aClcclxuICAgICwgaSAgICAgID0gMFxyXG4gICAgLCBfICAgICAgPSAkLnBhdGguX1xyXG4gICAgLCBob2xkZXIgPSBmYWxzZTtcclxuICB3aGlsZShsZW5ndGggPiBpKWlmKChwYXJnc1tpXSA9IGFyZ3VtZW50c1tpKytdKSA9PT0gXylob2xkZXIgPSB0cnVlO1xyXG4gIHJldHVybiBmdW5jdGlvbigvKiAuLi5hcmdzICovKXtcclxuICAgIHZhciB0aGF0ICAgID0gdGhpc1xyXG4gICAgICAsIF9sZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoXHJcbiAgICAgICwgaiA9IDAsIGsgPSAwLCBhcmdzO1xyXG4gICAgaWYoIWhvbGRlciAmJiAhX2xlbmd0aClyZXR1cm4gaW52b2tlKGZuLCBwYXJncywgdGhhdCk7XHJcbiAgICBhcmdzID0gcGFyZ3Muc2xpY2UoKTtcclxuICAgIGlmKGhvbGRlcilmb3IoO2xlbmd0aCA+IGo7IGorKylpZihhcmdzW2pdID09PSBfKWFyZ3Nbal0gPSBhcmd1bWVudHNbaysrXTtcclxuICAgIHdoaWxlKF9sZW5ndGggPiBrKWFyZ3MucHVzaChhcmd1bWVudHNbaysrXSk7XHJcbiAgICByZXR1cm4gaW52b2tlKGZuLCBhcmdzLCB0aGF0KTtcclxuICB9O1xyXG59OyIsIid1c2Ugc3RyaWN0JztcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihyZWdFeHAsIHJlcGxhY2UsIGlzU3RhdGljKXtcclxuICB2YXIgcmVwbGFjZXIgPSByZXBsYWNlID09PSBPYmplY3QocmVwbGFjZSkgPyBmdW5jdGlvbihwYXJ0KXtcclxuICAgIHJldHVybiByZXBsYWNlW3BhcnRdO1xyXG4gIH0gOiByZXBsYWNlO1xyXG4gIHJldHVybiBmdW5jdGlvbihpdCl7XHJcbiAgICByZXR1cm4gU3RyaW5nKGlzU3RhdGljID8gaXQgOiB0aGlzKS5yZXBsYWNlKHJlZ0V4cCwgcmVwbGFjZXIpO1xyXG4gIH07XHJcbn07IiwiLy8gV29ya3Mgd2l0aCBfX3Byb3RvX18gb25seS4gT2xkIHY4IGNhbid0IHdvcmsgd2l0aCBudWxsIHByb3RvIG9iamVjdHMuXHJcbi8qIGVzbGludC1kaXNhYmxlIG5vLXByb3RvICovXHJcbnZhciAkICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgYXNzZXJ0ID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpO1xyXG5mdW5jdGlvbiBjaGVjayhPLCBwcm90byl7XHJcbiAgYXNzZXJ0Lm9iaihPKTtcclxuICBhc3NlcnQocHJvdG8gPT09IG51bGwgfHwgJC5pc09iamVjdChwcm90byksIHByb3RvLCBcIjogY2FuJ3Qgc2V0IGFzIHByb3RvdHlwZSFcIik7XHJcbn1cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgc2V0OiBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHwgKCdfX3Byb3RvX18nIGluIHt9IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcclxuICAgID8gZnVuY3Rpb24oYnVnZ3ksIHNldCl7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIHNldCA9IHJlcXVpcmUoJy4vJC5jdHgnKShGdW5jdGlvbi5jYWxsLCAkLmdldERlc2MoT2JqZWN0LnByb3RvdHlwZSwgJ19fcHJvdG9fXycpLnNldCwgMik7XHJcbiAgICAgICAgICBzZXQoe30sIFtdKTtcclxuICAgICAgICB9IGNhdGNoKGUpeyBidWdneSA9IHRydWU7IH1cclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gc2V0UHJvdG90eXBlT2YoTywgcHJvdG8pe1xyXG4gICAgICAgICAgY2hlY2soTywgcHJvdG8pO1xyXG4gICAgICAgICAgaWYoYnVnZ3kpTy5fX3Byb3RvX18gPSBwcm90bztcclxuICAgICAgICAgIGVsc2Ugc2V0KE8sIHByb3RvKTtcclxuICAgICAgICAgIHJldHVybiBPO1xyXG4gICAgICAgIH07XHJcbiAgICAgIH0oKVxyXG4gICAgOiB1bmRlZmluZWQpLFxyXG4gIGNoZWNrOiBjaGVja1xyXG59OyIsInZhciAkICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIFNQRUNJRVMgPSByZXF1aXJlKCcuLyQud2tzJykoJ3NwZWNpZXMnKTtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihDKXtcclxuICBpZigkLkRFU0MgJiYgIShTUEVDSUVTIGluIEMpKSQuc2V0RGVzYyhDLCBTUEVDSUVTLCB7XHJcbiAgICBjb25maWd1cmFibGU6IHRydWUsXHJcbiAgICBnZXQ6ICQudGhhdFxyXG4gIH0pO1xyXG59OyIsIi8vIHRydWUgIC0+IFN0cmluZyNhdFxyXG4vLyBmYWxzZSAtPiBTdHJpbmcjY29kZVBvaW50QXRcclxudmFyICQgPSByZXF1aXJlKCcuLyQnKTtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihUT19TVFJJTkcpe1xyXG4gIHJldHVybiBmdW5jdGlvbih0aGF0LCBwb3Mpe1xyXG4gICAgdmFyIHMgPSBTdHJpbmcoJC5hc3NlcnREZWZpbmVkKHRoYXQpKVxyXG4gICAgICAsIGkgPSAkLnRvSW50ZWdlcihwb3MpXHJcbiAgICAgICwgbCA9IHMubGVuZ3RoXHJcbiAgICAgICwgYSwgYjtcclxuICAgIGlmKGkgPCAwIHx8IGkgPj0gbClyZXR1cm4gVE9fU1RSSU5HID8gJycgOiB1bmRlZmluZWQ7XHJcbiAgICBhID0gcy5jaGFyQ29kZUF0KGkpO1xyXG4gICAgcmV0dXJuIGEgPCAweGQ4MDAgfHwgYSA+IDB4ZGJmZiB8fCBpICsgMSA9PT0gbFxyXG4gICAgICB8fCAoYiA9IHMuY2hhckNvZGVBdChpICsgMSkpIDwgMHhkYzAwIHx8IGIgPiAweGRmZmZcclxuICAgICAgICA/IFRPX1NUUklORyA/IHMuY2hhckF0KGkpIDogYVxyXG4gICAgICAgIDogVE9fU1RSSU5HID8gcy5zbGljZShpLCBpICsgMikgOiAoYSAtIDB4ZDgwMCA8PCAxMCkgKyAoYiAtIDB4ZGMwMCkgKyAweDEwMDAwO1xyXG4gIH07XHJcbn07IiwiLy8gaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9c3RyYXdtYW46c3RyaW5nX3BhZGRpbmdcclxudmFyICQgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCByZXBlYXQgPSByZXF1aXJlKCcuLyQuc3RyaW5nLXJlcGVhdCcpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0aGF0LCBtaW5MZW5ndGgsIGZpbGxDaGFyLCBsZWZ0KXtcclxuICAvLyAxLiBMZXQgTyBiZSBDaGVja09iamVjdENvZXJjaWJsZSh0aGlzIHZhbHVlKS5cclxuICAvLyAyLiBMZXQgUyBiZSBUb1N0cmluZyhPKS5cclxuICB2YXIgUyA9IFN0cmluZygkLmFzc2VydERlZmluZWQodGhhdCkpO1xyXG4gIC8vIDQuIElmIGludE1pbkxlbmd0aCBpcyB1bmRlZmluZWQsIHJldHVybiBTLlxyXG4gIGlmKG1pbkxlbmd0aCA9PT0gdW5kZWZpbmVkKXJldHVybiBTO1xyXG4gIC8vIDQuIExldCBpbnRNaW5MZW5ndGggYmUgVG9JbnRlZ2VyKG1pbkxlbmd0aCkuXHJcbiAgdmFyIGludE1pbkxlbmd0aCA9ICQudG9JbnRlZ2VyKG1pbkxlbmd0aCk7XHJcbiAgLy8gNS4gTGV0IGZpbGxMZW4gYmUgdGhlIG51bWJlciBvZiBjaGFyYWN0ZXJzIGluIFMgbWludXMgaW50TWluTGVuZ3RoLlxyXG4gIHZhciBmaWxsTGVuID0gaW50TWluTGVuZ3RoIC0gUy5sZW5ndGg7XHJcbiAgLy8gNi4gSWYgZmlsbExlbiA8IDAsIHRoZW4gdGhyb3cgYSBSYW5nZUVycm9yIGV4Y2VwdGlvbi5cclxuICAvLyA3LiBJZiBmaWxsTGVuIGlzICviiJ4sIHRoZW4gdGhyb3cgYSBSYW5nZUVycm9yIGV4Y2VwdGlvbi5cclxuICBpZihmaWxsTGVuIDwgMCB8fCBmaWxsTGVuID09PSBJbmZpbml0eSl7XHJcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQ2Fubm90IHNhdGlzZnkgc3RyaW5nIGxlbmd0aCAnICsgbWluTGVuZ3RoICsgJyBmb3Igc3RyaW5nOiAnICsgUyk7XHJcbiAgfVxyXG4gIC8vIDguIExldCBzRmlsbFN0ciBiZSB0aGUgc3RyaW5nIHJlcHJlc2VudGVkIGJ5IGZpbGxTdHIuXHJcbiAgLy8gOS4gSWYgc0ZpbGxTdHIgaXMgdW5kZWZpbmVkLCBsZXQgc0ZpbGxTdHIgYmUgYSBzcGFjZSBjaGFyYWN0ZXIuXHJcbiAgdmFyIHNGaWxsU3RyID0gZmlsbENoYXIgPT09IHVuZGVmaW5lZCA/ICcgJyA6IFN0cmluZyhmaWxsQ2hhcik7XHJcbiAgLy8gMTAuIExldCBzRmlsbFZhbCBiZSBhIFN0cmluZyBtYWRlIG9mIHNGaWxsU3RyLCByZXBlYXRlZCB1bnRpbCBmaWxsTGVuIGlzIG1ldC5cclxuICB2YXIgc0ZpbGxWYWwgPSByZXBlYXQuY2FsbChzRmlsbFN0ciwgTWF0aC5jZWlsKGZpbGxMZW4gLyBzRmlsbFN0ci5sZW5ndGgpKTtcclxuICAvLyB0cnVuY2F0ZSBpZiB3ZSBvdmVyZmxvd2VkXHJcbiAgaWYoc0ZpbGxWYWwubGVuZ3RoID4gZmlsbExlbilzRmlsbFZhbCA9IGxlZnRcclxuICAgID8gc0ZpbGxWYWwuc2xpY2Uoc0ZpbGxWYWwubGVuZ3RoIC0gZmlsbExlbilcclxuICAgIDogc0ZpbGxWYWwuc2xpY2UoMCwgZmlsbExlbik7XHJcbiAgLy8gMTEuIFJldHVybiBhIHN0cmluZyBtYWRlIGZyb20gc0ZpbGxWYWwsIGZvbGxvd2VkIGJ5IFMuXHJcbiAgLy8gMTEuIFJldHVybiBhIFN0cmluZyBtYWRlIGZyb20gUywgZm9sbG93ZWQgYnkgc0ZpbGxWYWwuXHJcbiAgcmV0dXJuIGxlZnQgPyBzRmlsbFZhbC5jb25jYXQoUykgOiBTLmNvbmNhdChzRmlsbFZhbCk7XHJcbn07IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgJCA9IHJlcXVpcmUoJy4vJCcpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiByZXBlYXQoY291bnQpe1xyXG4gIHZhciBzdHIgPSBTdHJpbmcoJC5hc3NlcnREZWZpbmVkKHRoaXMpKVxyXG4gICAgLCByZXMgPSAnJ1xyXG4gICAgLCBuICAgPSAkLnRvSW50ZWdlcihjb3VudCk7XHJcbiAgaWYobiA8IDAgfHwgbiA9PSBJbmZpbml0eSl0aHJvdyBSYW5nZUVycm9yKFwiQ291bnQgY2FuJ3QgYmUgbmVnYXRpdmVcIik7XHJcbiAgZm9yKDtuID4gMDsgKG4gPj4+PSAxKSAmJiAoc3RyICs9IHN0cikpaWYobiAmIDEpcmVzICs9IHN0cjtcclxuICByZXR1cm4gcmVzO1xyXG59OyIsIid1c2Ugc3RyaWN0JztcclxudmFyICQgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBjdHggICAgPSByZXF1aXJlKCcuLyQuY3R4JylcclxuICAsIGNvZiAgICA9IHJlcXVpcmUoJy4vJC5jb2YnKVxyXG4gICwgaW52b2tlID0gcmVxdWlyZSgnLi8kLmludm9rZScpXHJcbiAgLCBjZWwgICAgPSByZXF1aXJlKCcuLyQuZG9tLWNyZWF0ZScpXHJcbiAgLCBnbG9iYWwgICAgICAgICAgICAgPSAkLmdcclxuICAsIGlzRnVuY3Rpb24gICAgICAgICA9ICQuaXNGdW5jdGlvblxyXG4gICwgaHRtbCAgICAgICAgICAgICAgID0gJC5odG1sXHJcbiAgLCBwcm9jZXNzICAgICAgICAgICAgPSBnbG9iYWwucHJvY2Vzc1xyXG4gICwgc2V0VGFzayAgICAgICAgICAgID0gZ2xvYmFsLnNldEltbWVkaWF0ZVxyXG4gICwgY2xlYXJUYXNrICAgICAgICAgID0gZ2xvYmFsLmNsZWFySW1tZWRpYXRlXHJcbiAgLCBwb3N0TWVzc2FnZSAgICAgICAgPSBnbG9iYWwucG9zdE1lc3NhZ2VcclxuICAsIGFkZEV2ZW50TGlzdGVuZXIgICA9IGdsb2JhbC5hZGRFdmVudExpc3RlbmVyXHJcbiAgLCBNZXNzYWdlQ2hhbm5lbCAgICAgPSBnbG9iYWwuTWVzc2FnZUNoYW5uZWxcclxuICAsIGNvdW50ZXIgICAgICAgICAgICA9IDBcclxuICAsIHF1ZXVlICAgICAgICAgICAgICA9IHt9XHJcbiAgLCBPTlJFQURZU1RBVEVDSEFOR0UgPSAnb25yZWFkeXN0YXRlY2hhbmdlJ1xyXG4gICwgZGVmZXIsIGNoYW5uZWwsIHBvcnQ7XHJcbmZ1bmN0aW9uIHJ1bigpe1xyXG4gIHZhciBpZCA9ICt0aGlzO1xyXG4gIGlmKCQuaGFzKHF1ZXVlLCBpZCkpe1xyXG4gICAgdmFyIGZuID0gcXVldWVbaWRdO1xyXG4gICAgZGVsZXRlIHF1ZXVlW2lkXTtcclxuICAgIGZuKCk7XHJcbiAgfVxyXG59XHJcbmZ1bmN0aW9uIGxpc3RuZXIoZXZlbnQpe1xyXG4gIHJ1bi5jYWxsKGV2ZW50LmRhdGEpO1xyXG59XHJcbi8vIE5vZGUuanMgMC45KyAmIElFMTArIGhhcyBzZXRJbW1lZGlhdGUsIG90aGVyd2lzZTpcclxuaWYoIWlzRnVuY3Rpb24oc2V0VGFzaykgfHwgIWlzRnVuY3Rpb24oY2xlYXJUYXNrKSl7XHJcbiAgc2V0VGFzayA9IGZ1bmN0aW9uKGZuKXtcclxuICAgIHZhciBhcmdzID0gW10sIGkgPSAxO1xyXG4gICAgd2hpbGUoYXJndW1lbnRzLmxlbmd0aCA+IGkpYXJncy5wdXNoKGFyZ3VtZW50c1tpKytdKTtcclxuICAgIHF1ZXVlWysrY291bnRlcl0gPSBmdW5jdGlvbigpe1xyXG4gICAgICBpbnZva2UoaXNGdW5jdGlvbihmbikgPyBmbiA6IEZ1bmN0aW9uKGZuKSwgYXJncyk7XHJcbiAgICB9O1xyXG4gICAgZGVmZXIoY291bnRlcik7XHJcbiAgICByZXR1cm4gY291bnRlcjtcclxuICB9O1xyXG4gIGNsZWFyVGFzayA9IGZ1bmN0aW9uKGlkKXtcclxuICAgIGRlbGV0ZSBxdWV1ZVtpZF07XHJcbiAgfTtcclxuICAvLyBOb2RlLmpzIDAuOC1cclxuICBpZihjb2YocHJvY2VzcykgPT0gJ3Byb2Nlc3MnKXtcclxuICAgIGRlZmVyID0gZnVuY3Rpb24oaWQpe1xyXG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGN0eChydW4sIGlkLCAxKSk7XHJcbiAgICB9O1xyXG4gIC8vIE1vZGVybiBicm93c2Vycywgc2tpcCBpbXBsZW1lbnRhdGlvbiBmb3IgV2ViV29ya2Vyc1xyXG4gIC8vIElFOCBoYXMgcG9zdE1lc3NhZ2UsIGJ1dCBpdCdzIHN5bmMgJiB0eXBlb2YgaXRzIHBvc3RNZXNzYWdlIGlzIG9iamVjdFxyXG4gIH0gZWxzZSBpZihhZGRFdmVudExpc3RlbmVyICYmIGlzRnVuY3Rpb24ocG9zdE1lc3NhZ2UpICYmICFnbG9iYWwuaW1wb3J0U2NyaXB0cyl7XHJcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcclxuICAgICAgcG9zdE1lc3NhZ2UoaWQsICcqJyk7XHJcbiAgICB9O1xyXG4gICAgYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGxpc3RuZXIsIGZhbHNlKTtcclxuICAvLyBXZWJXb3JrZXJzXHJcbiAgfSBlbHNlIGlmKGlzRnVuY3Rpb24oTWVzc2FnZUNoYW5uZWwpKXtcclxuICAgIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWw7XHJcbiAgICBwb3J0ICAgID0gY2hhbm5lbC5wb3J0MjtcclxuICAgIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gbGlzdG5lcjtcclxuICAgIGRlZmVyID0gY3R4KHBvcnQucG9zdE1lc3NhZ2UsIHBvcnQsIDEpO1xyXG4gIC8vIElFOC1cclxuICB9IGVsc2UgaWYoT05SRUFEWVNUQVRFQ0hBTkdFIGluIGNlbCgnc2NyaXB0Jykpe1xyXG4gICAgZGVmZXIgPSBmdW5jdGlvbihpZCl7XHJcbiAgICAgIGh0bWwuYXBwZW5kQ2hpbGQoY2VsKCdzY3JpcHQnKSlbT05SRUFEWVNUQVRFQ0hBTkdFXSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgaHRtbC5yZW1vdmVDaGlsZCh0aGlzKTtcclxuICAgICAgICBydW4uY2FsbChpZCk7XHJcbiAgICAgIH07XHJcbiAgICB9O1xyXG4gIC8vIFJlc3Qgb2xkIGJyb3dzZXJzXHJcbiAgfSBlbHNlIHtcclxuICAgIGRlZmVyID0gZnVuY3Rpb24oaWQpe1xyXG4gICAgICBzZXRUaW1lb3V0KGN0eChydW4sIGlkLCAxKSwgMCk7XHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBzZXQ6ICAgc2V0VGFzayxcclxuICBjbGVhcjogY2xlYXJUYXNrXHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihleGVjKXtcclxuICB0cnkge1xyXG4gICAgZXhlYygpO1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH0gY2F0Y2goZSl7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbn07IiwidmFyIHNpZCA9IDA7XHJcbmZ1bmN0aW9uIHVpZChrZXkpe1xyXG4gIHJldHVybiAnU3ltYm9sKCcgKyBrZXkgKyAnKV8nICsgKCsrc2lkICsgTWF0aC5yYW5kb20oKSkudG9TdHJpbmcoMzYpO1xyXG59XHJcbnVpZC5zYWZlID0gcmVxdWlyZSgnLi8kJykuZy5TeW1ib2wgfHwgdWlkO1xyXG5tb2R1bGUuZXhwb3J0cyA9IHVpZDsiLCIvLyAyMi4xLjMuMzEgQXJyYXkucHJvdG90eXBlW0BAdW5zY29wYWJsZXNdXHJcbnZhciAkICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBVTlNDT1BBQkxFUyA9IHJlcXVpcmUoJy4vJC53a3MnKSgndW5zY29wYWJsZXMnKTtcclxuaWYoJC5GVyAmJiAhKFVOU0NPUEFCTEVTIGluIFtdKSkkLmhpZGUoQXJyYXkucHJvdG90eXBlLCBVTlNDT1BBQkxFUywge30pO1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGtleSl7XHJcbiAgaWYoJC5GVylbXVtVTlNDT1BBQkxFU11ba2V5XSA9IHRydWU7XHJcbn07IiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vJCcpLmdcclxuICAsIHN0b3JlICA9IHt9O1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5hbWUpe1xyXG4gIHJldHVybiBzdG9yZVtuYW1lXSB8fCAoc3RvcmVbbmFtZV0gPVxyXG4gICAgZ2xvYmFsLlN5bWJvbCAmJiBnbG9iYWwuU3ltYm9sW25hbWVdIHx8IHJlcXVpcmUoJy4vJC51aWQnKS5zYWZlKCdTeW1ib2wuJyArIG5hbWUpKTtcclxufTsiLCJ2YXIgJCAgICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBjZWwgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmRvbS1jcmVhdGUnKVxyXG4gICwgY29mICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5jb2YnKVxyXG4gICwgJGRlZiAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxyXG4gICwgaW52b2tlICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5pbnZva2UnKVxyXG4gICwgYXJyYXlNZXRob2QgICAgICA9IHJlcXVpcmUoJy4vJC5hcnJheS1tZXRob2RzJylcclxuICAsIElFX1BST1RPICAgICAgICAgPSByZXF1aXJlKCcuLyQudWlkJykuc2FmZSgnX19wcm90b19fJylcclxuICAsIGFzc2VydCAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuYXNzZXJ0JylcclxuICAsIGFzc2VydE9iamVjdCAgICAgPSBhc3NlcnQub2JqXHJcbiAgLCBPYmplY3RQcm90byAgICAgID0gT2JqZWN0LnByb3RvdHlwZVxyXG4gICwgQSAgICAgICAgICAgICAgICA9IFtdXHJcbiAgLCBzbGljZSAgICAgICAgICAgID0gQS5zbGljZVxyXG4gICwgaW5kZXhPZiAgICAgICAgICA9IEEuaW5kZXhPZlxyXG4gICwgY2xhc3NvZiAgICAgICAgICA9IGNvZi5jbGFzc29mXHJcbiAgLCBoYXMgICAgICAgICAgICAgID0gJC5oYXNcclxuICAsIGRlZmluZVByb3BlcnR5ICAgPSAkLnNldERlc2NcclxuICAsIGdldE93bkRlc2NyaXB0b3IgPSAkLmdldERlc2NcclxuICAsIGRlZmluZVByb3BlcnRpZXMgPSAkLnNldERlc2NzXHJcbiAgLCBpc0Z1bmN0aW9uICAgICAgID0gJC5pc0Z1bmN0aW9uXHJcbiAgLCB0b09iamVjdCAgICAgICAgID0gJC50b09iamVjdFxyXG4gICwgdG9MZW5ndGggICAgICAgICA9ICQudG9MZW5ndGhcclxuICAsIElFOF9ET01fREVGSU5FICAgPSBmYWxzZVxyXG4gICwgJGluZGV4T2YgICAgICAgICA9IHJlcXVpcmUoJy4vJC5hcnJheS1pbmNsdWRlcycpKGZhbHNlKVxyXG4gICwgJGZvckVhY2ggICAgICAgICA9IGFycmF5TWV0aG9kKDApXHJcbiAgLCAkbWFwICAgICAgICAgICAgID0gYXJyYXlNZXRob2QoMSlcclxuICAsICRmaWx0ZXIgICAgICAgICAgPSBhcnJheU1ldGhvZCgyKVxyXG4gICwgJHNvbWUgICAgICAgICAgICA9IGFycmF5TWV0aG9kKDMpXHJcbiAgLCAkZXZlcnkgICAgICAgICAgID0gYXJyYXlNZXRob2QoNCk7XHJcblxyXG5pZighJC5ERVNDKXtcclxuICB0cnkge1xyXG4gICAgSUU4X0RPTV9ERUZJTkUgPSBkZWZpbmVQcm9wZXJ0eShjZWwoJ2RpdicpLCAneCcsXHJcbiAgICAgIHtnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiA4OyB9fVxyXG4gICAgKS54ID09IDg7XHJcbiAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxyXG4gICQuc2V0RGVzYyA9IGZ1bmN0aW9uKE8sIFAsIEF0dHJpYnV0ZXMpe1xyXG4gICAgaWYoSUU4X0RPTV9ERUZJTkUpdHJ5IHtcclxuICAgICAgcmV0dXJuIGRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpO1xyXG4gICAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxyXG4gICAgaWYoJ2dldCcgaW4gQXR0cmlidXRlcyB8fCAnc2V0JyBpbiBBdHRyaWJ1dGVzKXRocm93IFR5cGVFcnJvcignQWNjZXNzb3JzIG5vdCBzdXBwb3J0ZWQhJyk7XHJcbiAgICBpZigndmFsdWUnIGluIEF0dHJpYnV0ZXMpYXNzZXJ0T2JqZWN0KE8pW1BdID0gQXR0cmlidXRlcy52YWx1ZTtcclxuICAgIHJldHVybiBPO1xyXG4gIH07XHJcbiAgJC5nZXREZXNjID0gZnVuY3Rpb24oTywgUCl7XHJcbiAgICBpZihJRThfRE9NX0RFRklORSl0cnkge1xyXG4gICAgICByZXR1cm4gZ2V0T3duRGVzY3JpcHRvcihPLCBQKTtcclxuICAgIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cclxuICAgIGlmKGhhcyhPLCBQKSlyZXR1cm4gJC5kZXNjKCFPYmplY3RQcm90by5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKE8sIFApLCBPW1BdKTtcclxuICB9O1xyXG4gICQuc2V0RGVzY3MgPSBkZWZpbmVQcm9wZXJ0aWVzID0gZnVuY3Rpb24oTywgUHJvcGVydGllcyl7XHJcbiAgICBhc3NlcnRPYmplY3QoTyk7XHJcbiAgICB2YXIga2V5cyAgID0gJC5nZXRLZXlzKFByb3BlcnRpZXMpXHJcbiAgICAgICwgbGVuZ3RoID0ga2V5cy5sZW5ndGhcclxuICAgICAgLCBpID0gMFxyXG4gICAgICAsIFA7XHJcbiAgICB3aGlsZShsZW5ndGggPiBpKSQuc2V0RGVzYyhPLCBQID0ga2V5c1tpKytdLCBQcm9wZXJ0aWVzW1BdKTtcclxuICAgIHJldHVybiBPO1xyXG4gIH07XHJcbn1cclxuJGRlZigkZGVmLlMgKyAkZGVmLkYgKiAhJC5ERVNDLCAnT2JqZWN0Jywge1xyXG4gIC8vIDE5LjEuMi42IC8gMTUuMi4zLjMgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKVxyXG4gIGdldE93blByb3BlcnR5RGVzY3JpcHRvcjogJC5nZXREZXNjLFxyXG4gIC8vIDE5LjEuMi40IC8gMTUuMi4zLjYgT2JqZWN0LmRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpXHJcbiAgZGVmaW5lUHJvcGVydHk6ICQuc2V0RGVzYyxcclxuICAvLyAxOS4xLjIuMyAvIDE1LjIuMy43IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKE8sIFByb3BlcnRpZXMpXHJcbiAgZGVmaW5lUHJvcGVydGllczogZGVmaW5lUHJvcGVydGllc1xyXG59KTtcclxuXHJcbiAgLy8gSUUgOC0gZG9uJ3QgZW51bSBidWcga2V5c1xyXG52YXIga2V5czEgPSAoJ2NvbnN0cnVjdG9yLGhhc093blByb3BlcnR5LGlzUHJvdG90eXBlT2YscHJvcGVydHlJc0VudW1lcmFibGUsJyArXHJcbiAgICAgICAgICAgICd0b0xvY2FsZVN0cmluZyx0b1N0cmluZyx2YWx1ZU9mJykuc3BsaXQoJywnKVxyXG4gIC8vIEFkZGl0aW9uYWwga2V5cyBmb3IgZ2V0T3duUHJvcGVydHlOYW1lc1xyXG4gICwga2V5czIgPSBrZXlzMS5jb25jYXQoJ2xlbmd0aCcsICdwcm90b3R5cGUnKVxyXG4gICwga2V5c0xlbjEgPSBrZXlzMS5sZW5ndGg7XHJcblxyXG4vLyBDcmVhdGUgb2JqZWN0IHdpdGggYG51bGxgIHByb3RvdHlwZTogdXNlIGlmcmFtZSBPYmplY3Qgd2l0aCBjbGVhcmVkIHByb3RvdHlwZVxyXG52YXIgY3JlYXRlRGljdCA9IGZ1bmN0aW9uKCl7XHJcbiAgLy8gVGhyYXNoLCB3YXN0ZSBhbmQgc29kb215OiBJRSBHQyBidWdcclxuICB2YXIgaWZyYW1lID0gY2VsKCdpZnJhbWUnKVxyXG4gICAgLCBpICAgICAgPSBrZXlzTGVuMVxyXG4gICAgLCBndCAgICAgPSAnPidcclxuICAgICwgaWZyYW1lRG9jdW1lbnQ7XHJcbiAgaWZyYW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgJC5odG1sLmFwcGVuZENoaWxkKGlmcmFtZSk7XHJcbiAgaWZyYW1lLnNyYyA9ICdqYXZhc2NyaXB0Oic7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc2NyaXB0LXVybFxyXG4gIC8vIGNyZWF0ZURpY3QgPSBpZnJhbWUuY29udGVudFdpbmRvdy5PYmplY3Q7XHJcbiAgLy8gaHRtbC5yZW1vdmVDaGlsZChpZnJhbWUpO1xyXG4gIGlmcmFtZURvY3VtZW50ID0gaWZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQ7XHJcbiAgaWZyYW1lRG9jdW1lbnQub3BlbigpO1xyXG4gIGlmcmFtZURvY3VtZW50LndyaXRlKCc8c2NyaXB0PmRvY3VtZW50LkY9T2JqZWN0PC9zY3JpcHQnICsgZ3QpO1xyXG4gIGlmcmFtZURvY3VtZW50LmNsb3NlKCk7XHJcbiAgY3JlYXRlRGljdCA9IGlmcmFtZURvY3VtZW50LkY7XHJcbiAgd2hpbGUoaS0tKWRlbGV0ZSBjcmVhdGVEaWN0LnByb3RvdHlwZVtrZXlzMVtpXV07XHJcbiAgcmV0dXJuIGNyZWF0ZURpY3QoKTtcclxufTtcclxuZnVuY3Rpb24gY3JlYXRlR2V0S2V5cyhuYW1lcywgbGVuZ3RoKXtcclxuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KXtcclxuICAgIHZhciBPICAgICAgPSB0b09iamVjdChvYmplY3QpXHJcbiAgICAgICwgaSAgICAgID0gMFxyXG4gICAgICAsIHJlc3VsdCA9IFtdXHJcbiAgICAgICwga2V5O1xyXG4gICAgZm9yKGtleSBpbiBPKWlmKGtleSAhPSBJRV9QUk9UTyloYXMoTywga2V5KSAmJiByZXN1bHQucHVzaChrZXkpO1xyXG4gICAgLy8gRG9uJ3QgZW51bSBidWcgJiBoaWRkZW4ga2V5c1xyXG4gICAgd2hpbGUobGVuZ3RoID4gaSlpZihoYXMoTywga2V5ID0gbmFtZXNbaSsrXSkpe1xyXG4gICAgICB+aW5kZXhPZi5jYWxsKHJlc3VsdCwga2V5KSB8fCByZXN1bHQucHVzaChrZXkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9O1xyXG59XHJcbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGl0KXsgcmV0dXJuICEkLmlzT2JqZWN0KGl0KTsgfVxyXG5mdW5jdGlvbiBFbXB0eSgpe31cclxuJGRlZigkZGVmLlMsICdPYmplY3QnLCB7XHJcbiAgLy8gMTkuMS4yLjkgLyAxNS4yLjMuMiBPYmplY3QuZ2V0UHJvdG90eXBlT2YoTylcclxuICBnZXRQcm90b3R5cGVPZjogJC5nZXRQcm90byA9ICQuZ2V0UHJvdG8gfHwgZnVuY3Rpb24oTyl7XHJcbiAgICBPID0gT2JqZWN0KGFzc2VydC5kZWYoTykpO1xyXG4gICAgaWYoaGFzKE8sIElFX1BST1RPKSlyZXR1cm4gT1tJRV9QUk9UT107XHJcbiAgICBpZihpc0Z1bmN0aW9uKE8uY29uc3RydWN0b3IpICYmIE8gaW5zdGFuY2VvZiBPLmNvbnN0cnVjdG9yKXtcclxuICAgICAgcmV0dXJuIE8uY29uc3RydWN0b3IucHJvdG90eXBlO1xyXG4gICAgfSByZXR1cm4gTyBpbnN0YW5jZW9mIE9iamVjdCA/IE9iamVjdFByb3RvIDogbnVsbDtcclxuICB9LFxyXG4gIC8vIDE5LjEuMi43IC8gMTUuMi4zLjQgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoTylcclxuICBnZXRPd25Qcm9wZXJ0eU5hbWVzOiAkLmdldE5hbWVzID0gJC5nZXROYW1lcyB8fCBjcmVhdGVHZXRLZXlzKGtleXMyLCBrZXlzMi5sZW5ndGgsIHRydWUpLFxyXG4gIC8vIDE5LjEuMi4yIC8gMTUuMi4zLjUgT2JqZWN0LmNyZWF0ZShPIFssIFByb3BlcnRpZXNdKVxyXG4gIGNyZWF0ZTogJC5jcmVhdGUgPSAkLmNyZWF0ZSB8fCBmdW5jdGlvbihPLCAvKj8qL1Byb3BlcnRpZXMpe1xyXG4gICAgdmFyIHJlc3VsdDtcclxuICAgIGlmKE8gIT09IG51bGwpe1xyXG4gICAgICBFbXB0eS5wcm90b3R5cGUgPSBhc3NlcnRPYmplY3QoTyk7XHJcbiAgICAgIHJlc3VsdCA9IG5ldyBFbXB0eSgpO1xyXG4gICAgICBFbXB0eS5wcm90b3R5cGUgPSBudWxsO1xyXG4gICAgICAvLyBhZGQgXCJfX3Byb3RvX19cIiBmb3IgT2JqZWN0LmdldFByb3RvdHlwZU9mIHNoaW1cclxuICAgICAgcmVzdWx0W0lFX1BST1RPXSA9IE87XHJcbiAgICB9IGVsc2UgcmVzdWx0ID0gY3JlYXRlRGljdCgpO1xyXG4gICAgcmV0dXJuIFByb3BlcnRpZXMgPT09IHVuZGVmaW5lZCA/IHJlc3VsdCA6IGRlZmluZVByb3BlcnRpZXMocmVzdWx0LCBQcm9wZXJ0aWVzKTtcclxuICB9LFxyXG4gIC8vIDE5LjEuMi4xNCAvIDE1LjIuMy4xNCBPYmplY3Qua2V5cyhPKVxyXG4gIGtleXM6ICQuZ2V0S2V5cyA9ICQuZ2V0S2V5cyB8fCBjcmVhdGVHZXRLZXlzKGtleXMxLCBrZXlzTGVuMSwgZmFsc2UpLFxyXG4gIC8vIDE5LjEuMi4xNyAvIDE1LjIuMy44IE9iamVjdC5zZWFsKE8pXHJcbiAgc2VhbDogJC5pdCwgLy8gPC0gY2FwXHJcbiAgLy8gMTkuMS4yLjUgLyAxNS4yLjMuOSBPYmplY3QuZnJlZXplKE8pXHJcbiAgZnJlZXplOiAkLml0LCAvLyA8LSBjYXBcclxuICAvLyAxOS4xLjIuMTUgLyAxNS4yLjMuMTAgT2JqZWN0LnByZXZlbnRFeHRlbnNpb25zKE8pXHJcbiAgcHJldmVudEV4dGVuc2lvbnM6ICQuaXQsIC8vIDwtIGNhcFxyXG4gIC8vIDE5LjEuMi4xMyAvIDE1LjIuMy4xMSBPYmplY3QuaXNTZWFsZWQoTylcclxuICBpc1NlYWxlZDogaXNQcmltaXRpdmUsIC8vIDwtIGNhcFxyXG4gIC8vIDE5LjEuMi4xMiAvIDE1LjIuMy4xMiBPYmplY3QuaXNGcm96ZW4oTylcclxuICBpc0Zyb3plbjogaXNQcmltaXRpdmUsIC8vIDwtIGNhcFxyXG4gIC8vIDE5LjEuMi4xMSAvIDE1LjIuMy4xMyBPYmplY3QuaXNFeHRlbnNpYmxlKE8pXHJcbiAgaXNFeHRlbnNpYmxlOiAkLmlzT2JqZWN0IC8vIDwtIGNhcFxyXG59KTtcclxuXHJcbi8vIDE5LjIuMy4yIC8gMTUuMy40LjUgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQodGhpc0FyZywgYXJncy4uLilcclxuJGRlZigkZGVmLlAsICdGdW5jdGlvbicsIHtcclxuICBiaW5kOiBmdW5jdGlvbih0aGF0IC8qLCBhcmdzLi4uICovKXtcclxuICAgIHZhciBmbiAgICAgICA9IGFzc2VydC5mbih0aGlzKVxyXG4gICAgICAsIHBhcnRBcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xyXG4gICAgZnVuY3Rpb24gYm91bmQoLyogYXJncy4uLiAqLyl7XHJcbiAgICAgIHZhciBhcmdzID0gcGFydEFyZ3MuY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XHJcbiAgICAgIHJldHVybiBpbnZva2UoZm4sIGFyZ3MsIHRoaXMgaW5zdGFuY2VvZiBib3VuZCA/ICQuY3JlYXRlKGZuLnByb3RvdHlwZSkgOiB0aGF0KTtcclxuICAgIH1cclxuICAgIGlmKGZuLnByb3RvdHlwZSlib3VuZC5wcm90b3R5cGUgPSBmbi5wcm90b3R5cGU7XHJcbiAgICByZXR1cm4gYm91bmQ7XHJcbiAgfVxyXG59KTtcclxuXHJcbi8vIEZpeCBmb3Igbm90IGFycmF5LWxpa2UgRVMzIHN0cmluZ1xyXG5mdW5jdGlvbiBhcnJheU1ldGhvZEZpeChmbil7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uKCl7XHJcbiAgICByZXR1cm4gZm4uYXBwbHkoJC5FUzVPYmplY3QodGhpcyksIGFyZ3VtZW50cyk7XHJcbiAgfTtcclxufVxyXG5pZighKDAgaW4gT2JqZWN0KCd6JykgJiYgJ3onWzBdID09ICd6Jykpe1xyXG4gICQuRVM1T2JqZWN0ID0gZnVuY3Rpb24oaXQpe1xyXG4gICAgcmV0dXJuIGNvZihpdCkgPT0gJ1N0cmluZycgPyBpdC5zcGxpdCgnJykgOiBPYmplY3QoaXQpO1xyXG4gIH07XHJcbn1cclxuJGRlZigkZGVmLlAgKyAkZGVmLkYgKiAoJC5FUzVPYmplY3QgIT0gT2JqZWN0KSwgJ0FycmF5Jywge1xyXG4gIHNsaWNlOiBhcnJheU1ldGhvZEZpeChzbGljZSksXHJcbiAgam9pbjogYXJyYXlNZXRob2RGaXgoQS5qb2luKVxyXG59KTtcclxuXHJcbi8vIDIyLjEuMi4yIC8gMTUuNC4zLjIgQXJyYXkuaXNBcnJheShhcmcpXHJcbiRkZWYoJGRlZi5TLCAnQXJyYXknLCB7XHJcbiAgaXNBcnJheTogZnVuY3Rpb24oYXJnKXtcclxuICAgIHJldHVybiBjb2YoYXJnKSA9PSAnQXJyYXknO1xyXG4gIH1cclxufSk7XHJcbmZ1bmN0aW9uIGNyZWF0ZUFycmF5UmVkdWNlKGlzUmlnaHQpe1xyXG4gIHJldHVybiBmdW5jdGlvbihjYWxsYmFja2ZuLCBtZW1vKXtcclxuICAgIGFzc2VydC5mbihjYWxsYmFja2ZuKTtcclxuICAgIHZhciBPICAgICAgPSB0b09iamVjdCh0aGlzKVxyXG4gICAgICAsIGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKVxyXG4gICAgICAsIGluZGV4ICA9IGlzUmlnaHQgPyBsZW5ndGggLSAxIDogMFxyXG4gICAgICAsIGkgICAgICA9IGlzUmlnaHQgPyAtMSA6IDE7XHJcbiAgICBpZihhcmd1bWVudHMubGVuZ3RoIDwgMilmb3IoOzspe1xyXG4gICAgICBpZihpbmRleCBpbiBPKXtcclxuICAgICAgICBtZW1vID0gT1tpbmRleF07XHJcbiAgICAgICAgaW5kZXggKz0gaTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBpbmRleCArPSBpO1xyXG4gICAgICBhc3NlcnQoaXNSaWdodCA/IGluZGV4ID49IDAgOiBsZW5ndGggPiBpbmRleCwgJ1JlZHVjZSBvZiBlbXB0eSBhcnJheSB3aXRoIG5vIGluaXRpYWwgdmFsdWUnKTtcclxuICAgIH1cclxuICAgIGZvcig7aXNSaWdodCA/IGluZGV4ID49IDAgOiBsZW5ndGggPiBpbmRleDsgaW5kZXggKz0gaSlpZihpbmRleCBpbiBPKXtcclxuICAgICAgbWVtbyA9IGNhbGxiYWNrZm4obWVtbywgT1tpbmRleF0sIGluZGV4LCB0aGlzKTtcclxuICAgIH1cclxuICAgIHJldHVybiBtZW1vO1xyXG4gIH07XHJcbn1cclxuJGRlZigkZGVmLlAsICdBcnJheScsIHtcclxuICAvLyAyMi4xLjMuMTAgLyAxNS40LjQuMTggQXJyYXkucHJvdG90eXBlLmZvckVhY2goY2FsbGJhY2tmbiBbLCB0aGlzQXJnXSlcclxuICBmb3JFYWNoOiAkLmVhY2ggPSAkLmVhY2ggfHwgZnVuY3Rpb24gZm9yRWFjaChjYWxsYmFja2ZuLyosIHRoYXQgPSB1bmRlZmluZWQgKi8pe1xyXG4gICAgcmV0dXJuICRmb3JFYWNoKHRoaXMsIGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSk7XHJcbiAgfSxcclxuICAvLyAyMi4xLjMuMTUgLyAxNS40LjQuMTkgQXJyYXkucHJvdG90eXBlLm1hcChjYWxsYmFja2ZuIFssIHRoaXNBcmddKVxyXG4gIG1hcDogZnVuY3Rpb24gbWFwKGNhbGxiYWNrZm4vKiwgdGhhdCA9IHVuZGVmaW5lZCAqLyl7XHJcbiAgICByZXR1cm4gJG1hcCh0aGlzLCBjYWxsYmFja2ZuLCBhcmd1bWVudHNbMV0pO1xyXG4gIH0sXHJcbiAgLy8gMjIuMS4zLjcgLyAxNS40LjQuMjAgQXJyYXkucHJvdG90eXBlLmZpbHRlcihjYWxsYmFja2ZuIFssIHRoaXNBcmddKVxyXG4gIGZpbHRlcjogZnVuY3Rpb24gZmlsdGVyKGNhbGxiYWNrZm4vKiwgdGhhdCA9IHVuZGVmaW5lZCAqLyl7XHJcbiAgICByZXR1cm4gJGZpbHRlcih0aGlzLCBjYWxsYmFja2ZuLCBhcmd1bWVudHNbMV0pO1xyXG4gIH0sXHJcbiAgLy8gMjIuMS4zLjIzIC8gMTUuNC40LjE3IEFycmF5LnByb3RvdHlwZS5zb21lKGNhbGxiYWNrZm4gWywgdGhpc0FyZ10pXHJcbiAgc29tZTogZnVuY3Rpb24gc29tZShjYWxsYmFja2ZuLyosIHRoYXQgPSB1bmRlZmluZWQgKi8pe1xyXG4gICAgcmV0dXJuICRzb21lKHRoaXMsIGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSk7XHJcbiAgfSxcclxuICAvLyAyMi4xLjMuNSAvIDE1LjQuNC4xNiBBcnJheS5wcm90b3R5cGUuZXZlcnkoY2FsbGJhY2tmbiBbLCB0aGlzQXJnXSlcclxuICBldmVyeTogZnVuY3Rpb24gZXZlcnkoY2FsbGJhY2tmbi8qLCB0aGF0ID0gdW5kZWZpbmVkICovKXtcclxuICAgIHJldHVybiAkZXZlcnkodGhpcywgY2FsbGJhY2tmbiwgYXJndW1lbnRzWzFdKTtcclxuICB9LFxyXG4gIC8vIDIyLjEuMy4xOCAvIDE1LjQuNC4yMSBBcnJheS5wcm90b3R5cGUucmVkdWNlKGNhbGxiYWNrZm4gWywgaW5pdGlhbFZhbHVlXSlcclxuICByZWR1Y2U6IGNyZWF0ZUFycmF5UmVkdWNlKGZhbHNlKSxcclxuICAvLyAyMi4xLjMuMTkgLyAxNS40LjQuMjIgQXJyYXkucHJvdG90eXBlLnJlZHVjZVJpZ2h0KGNhbGxiYWNrZm4gWywgaW5pdGlhbFZhbHVlXSlcclxuICByZWR1Y2VSaWdodDogY3JlYXRlQXJyYXlSZWR1Y2UodHJ1ZSksXHJcbiAgLy8gMjIuMS4zLjExIC8gMTUuNC40LjE0IEFycmF5LnByb3RvdHlwZS5pbmRleE9mKHNlYXJjaEVsZW1lbnQgWywgZnJvbUluZGV4XSlcclxuICBpbmRleE9mOiBpbmRleE9mID0gaW5kZXhPZiB8fCBmdW5jdGlvbiBpbmRleE9mKGVsIC8qLCBmcm9tSW5kZXggPSAwICovKXtcclxuICAgIHJldHVybiAkaW5kZXhPZih0aGlzLCBlbCwgYXJndW1lbnRzWzFdKTtcclxuICB9LFxyXG4gIC8vIDIyLjEuMy4xNCAvIDE1LjQuNC4xNSBBcnJheS5wcm90b3R5cGUubGFzdEluZGV4T2Yoc2VhcmNoRWxlbWVudCBbLCBmcm9tSW5kZXhdKVxyXG4gIGxhc3RJbmRleE9mOiBmdW5jdGlvbihlbCwgZnJvbUluZGV4IC8qID0gQFsqLTFdICovKXtcclxuICAgIHZhciBPICAgICAgPSB0b09iamVjdCh0aGlzKVxyXG4gICAgICAsIGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKVxyXG4gICAgICAsIGluZGV4ICA9IGxlbmd0aCAtIDE7XHJcbiAgICBpZihhcmd1bWVudHMubGVuZ3RoID4gMSlpbmRleCA9IE1hdGgubWluKGluZGV4LCAkLnRvSW50ZWdlcihmcm9tSW5kZXgpKTtcclxuICAgIGlmKGluZGV4IDwgMClpbmRleCA9IHRvTGVuZ3RoKGxlbmd0aCArIGluZGV4KTtcclxuICAgIGZvcig7aW5kZXggPj0gMDsgaW5kZXgtLSlpZihpbmRleCBpbiBPKWlmKE9baW5kZXhdID09PSBlbClyZXR1cm4gaW5kZXg7XHJcbiAgICByZXR1cm4gLTE7XHJcbiAgfVxyXG59KTtcclxuXHJcbi8vIDIxLjEuMy4yNSAvIDE1LjUuNC4yMCBTdHJpbmcucHJvdG90eXBlLnRyaW0oKVxyXG4kZGVmKCRkZWYuUCwgJ1N0cmluZycsIHt0cmltOiByZXF1aXJlKCcuLyQucmVwbGFjZXInKSgvXlxccyooW1xcc1xcU10qXFxTKT9cXHMqJC8sICckMScpfSk7XHJcblxyXG4vLyAyMC4zLjMuMSAvIDE1LjkuNC40IERhdGUubm93KClcclxuJGRlZigkZGVmLlMsICdEYXRlJywge25vdzogZnVuY3Rpb24oKXtcclxuICByZXR1cm4gK25ldyBEYXRlO1xyXG59fSk7XHJcblxyXG5mdW5jdGlvbiBseihudW0pe1xyXG4gIHJldHVybiBudW0gPiA5ID8gbnVtIDogJzAnICsgbnVtO1xyXG59XHJcblxyXG4vLyAyMC4zLjQuMzYgLyAxNS45LjUuNDMgRGF0ZS5wcm90b3R5cGUudG9JU09TdHJpbmcoKVxyXG4vLyBQaGFudG9tSlMgYW5kIG9sZCB3ZWJraXQgaGFkIGEgYnJva2VuIERhdGUgaW1wbGVtZW50YXRpb24uXHJcbnZhciBkYXRlICAgICAgID0gbmV3IERhdGUoLTVlMTMgLSAxKVxyXG4gICwgYnJva2VuRGF0ZSA9ICEoZGF0ZS50b0lTT1N0cmluZyAmJiBkYXRlLnRvSVNPU3RyaW5nKCkgPT0gJzAzODUtMDctMjVUMDc6MDY6MzkuOTk5WidcclxuICAgICAgJiYgcmVxdWlyZSgnLi8kLnRocm93cycpKGZ1bmN0aW9uKCl7IG5ldyBEYXRlKE5hTikudG9JU09TdHJpbmcoKTsgfSkpO1xyXG4kZGVmKCRkZWYuUCArICRkZWYuRiAqIGJyb2tlbkRhdGUsICdEYXRlJywge3RvSVNPU3RyaW5nOiBmdW5jdGlvbigpe1xyXG4gIGlmKCFpc0Zpbml0ZSh0aGlzKSl0aHJvdyBSYW5nZUVycm9yKCdJbnZhbGlkIHRpbWUgdmFsdWUnKTtcclxuICB2YXIgZCA9IHRoaXNcclxuICAgICwgeSA9IGQuZ2V0VVRDRnVsbFllYXIoKVxyXG4gICAgLCBtID0gZC5nZXRVVENNaWxsaXNlY29uZHMoKVxyXG4gICAgLCBzID0geSA8IDAgPyAnLScgOiB5ID4gOTk5OSA/ICcrJyA6ICcnO1xyXG4gIHJldHVybiBzICsgKCcwMDAwMCcgKyBNYXRoLmFicyh5KSkuc2xpY2UocyA/IC02IDogLTQpICtcclxuICAgICctJyArIGx6KGQuZ2V0VVRDTW9udGgoKSArIDEpICsgJy0nICsgbHooZC5nZXRVVENEYXRlKCkpICtcclxuICAgICdUJyArIGx6KGQuZ2V0VVRDSG91cnMoKSkgKyAnOicgKyBseihkLmdldFVUQ01pbnV0ZXMoKSkgK1xyXG4gICAgJzonICsgbHooZC5nZXRVVENTZWNvbmRzKCkpICsgJy4nICsgKG0gPiA5OSA/IG0gOiAnMCcgKyBseihtKSkgKyAnWic7XHJcbn19KTtcclxuXHJcbmlmKGNsYXNzb2YoZnVuY3Rpb24oKXsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKSA9PSAnT2JqZWN0Jyljb2YuY2xhc3NvZiA9IGZ1bmN0aW9uKGl0KXtcclxuICB2YXIgdGFnID0gY2xhc3NvZihpdCk7XHJcbiAgcmV0dXJuIHRhZyA9PSAnT2JqZWN0JyAmJiBpc0Z1bmN0aW9uKGl0LmNhbGxlZSkgPyAnQXJndW1lbnRzJyA6IHRhZztcclxufTsiLCIndXNlIHN0cmljdCc7XHJcbnZhciAkICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsICRkZWYgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsIHRvSW5kZXggPSAkLnRvSW5kZXg7XHJcbiRkZWYoJGRlZi5QLCAnQXJyYXknLCB7XHJcbiAgLy8gMjIuMS4zLjMgQXJyYXkucHJvdG90eXBlLmNvcHlXaXRoaW4odGFyZ2V0LCBzdGFydCwgZW5kID0gdGhpcy5sZW5ndGgpXHJcbiAgY29weVdpdGhpbjogZnVuY3Rpb24gY29weVdpdGhpbih0YXJnZXQvKiA9IDAgKi8sIHN0YXJ0IC8qID0gMCwgZW5kID0gQGxlbmd0aCAqLyl7XHJcbiAgICB2YXIgTyAgICAgPSBPYmplY3QoJC5hc3NlcnREZWZpbmVkKHRoaXMpKVxyXG4gICAgICAsIGxlbiAgID0gJC50b0xlbmd0aChPLmxlbmd0aClcclxuICAgICAgLCB0byAgICA9IHRvSW5kZXgodGFyZ2V0LCBsZW4pXHJcbiAgICAgICwgZnJvbSAgPSB0b0luZGV4KHN0YXJ0LCBsZW4pXHJcbiAgICAgICwgZW5kICAgPSBhcmd1bWVudHNbMl1cclxuICAgICAgLCBmaW4gICA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuIDogdG9JbmRleChlbmQsIGxlbilcclxuICAgICAgLCBjb3VudCA9IE1hdGgubWluKGZpbiAtIGZyb20sIGxlbiAtIHRvKVxyXG4gICAgICAsIGluYyAgID0gMTtcclxuICAgIGlmKGZyb20gPCB0byAmJiB0byA8IGZyb20gKyBjb3VudCl7XHJcbiAgICAgIGluYyAgPSAtMTtcclxuICAgICAgZnJvbSA9IGZyb20gKyBjb3VudCAtIDE7XHJcbiAgICAgIHRvICAgPSB0byAgICsgY291bnQgLSAxO1xyXG4gICAgfVxyXG4gICAgd2hpbGUoY291bnQtLSA+IDApe1xyXG4gICAgICBpZihmcm9tIGluIE8pT1t0b10gPSBPW2Zyb21dO1xyXG4gICAgICBlbHNlIGRlbGV0ZSBPW3RvXTtcclxuICAgICAgdG8gICArPSBpbmM7XHJcbiAgICAgIGZyb20gKz0gaW5jO1xyXG4gICAgfSByZXR1cm4gTztcclxuICB9XHJcbn0pO1xyXG5yZXF1aXJlKCcuLyQudW5zY29wZScpKCdjb3B5V2l0aGluJyk7IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgJCAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCAkZGVmICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCB0b0luZGV4ID0gJC50b0luZGV4O1xyXG4kZGVmKCRkZWYuUCwgJ0FycmF5Jywge1xyXG4gIC8vIDIyLjEuMy42IEFycmF5LnByb3RvdHlwZS5maWxsKHZhbHVlLCBzdGFydCA9IDAsIGVuZCA9IHRoaXMubGVuZ3RoKVxyXG4gIGZpbGw6IGZ1bmN0aW9uIGZpbGwodmFsdWUgLyosIHN0YXJ0ID0gMCwgZW5kID0gQGxlbmd0aCAqLyl7XHJcbiAgICB2YXIgTyAgICAgID0gT2JqZWN0KCQuYXNzZXJ0RGVmaW5lZCh0aGlzKSlcclxuICAgICAgLCBsZW5ndGggPSAkLnRvTGVuZ3RoKE8ubGVuZ3RoKVxyXG4gICAgICAsIGluZGV4ICA9IHRvSW5kZXgoYXJndW1lbnRzWzFdLCBsZW5ndGgpXHJcbiAgICAgICwgZW5kICAgID0gYXJndW1lbnRzWzJdXHJcbiAgICAgICwgZW5kUG9zID0gZW5kID09PSB1bmRlZmluZWQgPyBsZW5ndGggOiB0b0luZGV4KGVuZCwgbGVuZ3RoKTtcclxuICAgIHdoaWxlKGVuZFBvcyA+IGluZGV4KU9baW5kZXgrK10gPSB2YWx1ZTtcclxuICAgIHJldHVybiBPO1xyXG4gIH1cclxufSk7XHJcbnJlcXVpcmUoJy4vJC51bnNjb3BlJykoJ2ZpbGwnKTsiLCIndXNlIHN0cmljdCc7XHJcbi8vIDIyLjEuMy45IEFycmF5LnByb3RvdHlwZS5maW5kSW5kZXgocHJlZGljYXRlLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxyXG52YXIgS0VZICAgID0gJ2ZpbmRJbmRleCdcclxuICAsICRkZWYgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxyXG4gICwgZm9yY2VkID0gdHJ1ZVxyXG4gICwgJGZpbmQgID0gcmVxdWlyZSgnLi8kLmFycmF5LW1ldGhvZHMnKSg2KTtcclxuLy8gU2hvdWxkbid0IHNraXAgaG9sZXNcclxuaWYoS0VZIGluIFtdKUFycmF5KDEpW0tFWV0oZnVuY3Rpb24oKXsgZm9yY2VkID0gZmFsc2U7IH0pO1xyXG4kZGVmKCRkZWYuUCArICRkZWYuRiAqIGZvcmNlZCwgJ0FycmF5Jywge1xyXG4gIGZpbmRJbmRleDogZnVuY3Rpb24gZmluZEluZGV4KGNhbGxiYWNrZm4vKiwgdGhhdCA9IHVuZGVmaW5lZCAqLyl7XHJcbiAgICByZXR1cm4gJGZpbmQodGhpcywgY2FsbGJhY2tmbiwgYXJndW1lbnRzWzFdKTtcclxuICB9XHJcbn0pO1xyXG5yZXF1aXJlKCcuLyQudW5zY29wZScpKEtFWSk7IiwiJ3VzZSBzdHJpY3QnO1xyXG4vLyAyMi4xLjMuOCBBcnJheS5wcm90b3R5cGUuZmluZChwcmVkaWNhdGUsIHRoaXNBcmcgPSB1bmRlZmluZWQpXHJcbnZhciBLRVkgICAgPSAnZmluZCdcclxuICAsICRkZWYgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxyXG4gICwgZm9yY2VkID0gdHJ1ZVxyXG4gICwgJGZpbmQgID0gcmVxdWlyZSgnLi8kLmFycmF5LW1ldGhvZHMnKSg1KTtcclxuLy8gU2hvdWxkbid0IHNraXAgaG9sZXNcclxuaWYoS0VZIGluIFtdKUFycmF5KDEpW0tFWV0oZnVuY3Rpb24oKXsgZm9yY2VkID0gZmFsc2U7IH0pO1xyXG4kZGVmKCRkZWYuUCArICRkZWYuRiAqIGZvcmNlZCwgJ0FycmF5Jywge1xyXG4gIGZpbmQ6IGZ1bmN0aW9uIGZpbmQoY2FsbGJhY2tmbi8qLCB0aGF0ID0gdW5kZWZpbmVkICovKXtcclxuICAgIHJldHVybiAkZmluZCh0aGlzLCBjYWxsYmFja2ZuLCBhcmd1bWVudHNbMV0pO1xyXG4gIH1cclxufSk7XHJcbnJlcXVpcmUoJy4vJC51bnNjb3BlJykoS0VZKTsiLCJ2YXIgJCAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgY3R4ICAgPSByZXF1aXJlKCcuLyQuY3R4JylcclxuICAsICRkZWYgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCAkaXRlciA9IHJlcXVpcmUoJy4vJC5pdGVyJylcclxuICAsIGNhbGwgID0gcmVxdWlyZSgnLi8kLml0ZXItY2FsbCcpO1xyXG4kZGVmKCRkZWYuUyArICRkZWYuRiAqICFyZXF1aXJlKCcuLyQuaXRlci1kZXRlY3QnKShmdW5jdGlvbihpdGVyKXsgQXJyYXkuZnJvbShpdGVyKTsgfSksICdBcnJheScsIHtcclxuICAvLyAyMi4xLjIuMSBBcnJheS5mcm9tKGFycmF5TGlrZSwgbWFwZm4gPSB1bmRlZmluZWQsIHRoaXNBcmcgPSB1bmRlZmluZWQpXHJcbiAgZnJvbTogZnVuY3Rpb24gZnJvbShhcnJheUxpa2UvKiwgbWFwZm4gPSB1bmRlZmluZWQsIHRoaXNBcmcgPSB1bmRlZmluZWQqLyl7XHJcbiAgICB2YXIgTyAgICAgICA9IE9iamVjdCgkLmFzc2VydERlZmluZWQoYXJyYXlMaWtlKSlcclxuICAgICAgLCBtYXBmbiAgID0gYXJndW1lbnRzWzFdXHJcbiAgICAgICwgbWFwcGluZyA9IG1hcGZuICE9PSB1bmRlZmluZWRcclxuICAgICAgLCBmICAgICAgID0gbWFwcGluZyA/IGN0eChtYXBmbiwgYXJndW1lbnRzWzJdLCAyKSA6IHVuZGVmaW5lZFxyXG4gICAgICAsIGluZGV4ICAgPSAwXHJcbiAgICAgICwgbGVuZ3RoLCByZXN1bHQsIHN0ZXAsIGl0ZXJhdG9yO1xyXG4gICAgaWYoJGl0ZXIuaXMoTykpe1xyXG4gICAgICBpdGVyYXRvciA9ICRpdGVyLmdldChPKTtcclxuICAgICAgLy8gc3RyYW5nZSBJRSBxdWlya3MgbW9kZSBidWcgLT4gdXNlIHR5cGVvZiBpbnN0ZWFkIG9mIGlzRnVuY3Rpb25cclxuICAgICAgcmVzdWx0ICAgPSBuZXcgKHR5cGVvZiB0aGlzID09ICdmdW5jdGlvbicgPyB0aGlzIDogQXJyYXkpO1xyXG4gICAgICBmb3IoOyAhKHN0ZXAgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmU7IGluZGV4Kyspe1xyXG4gICAgICAgIHJlc3VsdFtpbmRleF0gPSBtYXBwaW5nID8gY2FsbChpdGVyYXRvciwgZiwgW3N0ZXAudmFsdWUsIGluZGV4XSwgdHJ1ZSkgOiBzdGVwLnZhbHVlO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBzdHJhbmdlIElFIHF1aXJrcyBtb2RlIGJ1ZyAtPiB1c2UgdHlwZW9mIGluc3RlYWQgb2YgaXNGdW5jdGlvblxyXG4gICAgICByZXN1bHQgPSBuZXcgKHR5cGVvZiB0aGlzID09ICdmdW5jdGlvbicgPyB0aGlzIDogQXJyYXkpKGxlbmd0aCA9ICQudG9MZW5ndGgoTy5sZW5ndGgpKTtcclxuICAgICAgZm9yKDsgbGVuZ3RoID4gaW5kZXg7IGluZGV4Kyspe1xyXG4gICAgICAgIHJlc3VsdFtpbmRleF0gPSBtYXBwaW5nID8gZihPW2luZGV4XSwgaW5kZXgpIDogT1tpbmRleF07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJlc3VsdC5sZW5ndGggPSBpbmRleDtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG59KTsiLCJ2YXIgJCAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBzZXRVbnNjb3BlID0gcmVxdWlyZSgnLi8kLnVuc2NvcGUnKVxyXG4gICwgSVRFUiAgICAgICA9IHJlcXVpcmUoJy4vJC51aWQnKS5zYWZlKCdpdGVyJylcclxuICAsICRpdGVyICAgICAgPSByZXF1aXJlKCcuLyQuaXRlcicpXHJcbiAgLCBzdGVwICAgICAgID0gJGl0ZXIuc3RlcFxyXG4gICwgSXRlcmF0b3JzICA9ICRpdGVyLkl0ZXJhdG9ycztcclxuXHJcbi8vIDIyLjEuMy40IEFycmF5LnByb3RvdHlwZS5lbnRyaWVzKClcclxuLy8gMjIuMS4zLjEzIEFycmF5LnByb3RvdHlwZS5rZXlzKClcclxuLy8gMjIuMS4zLjI5IEFycmF5LnByb3RvdHlwZS52YWx1ZXMoKVxyXG4vLyAyMi4xLjMuMzAgQXJyYXkucHJvdG90eXBlW0BAaXRlcmF0b3JdKClcclxucmVxdWlyZSgnLi8kLml0ZXItZGVmaW5lJykoQXJyYXksICdBcnJheScsIGZ1bmN0aW9uKGl0ZXJhdGVkLCBraW5kKXtcclxuICAkLnNldCh0aGlzLCBJVEVSLCB7bzogJC50b09iamVjdChpdGVyYXRlZCksIGk6IDAsIGs6IGtpbmR9KTtcclxuLy8gMjIuMS41LjIuMSAlQXJyYXlJdGVyYXRvclByb3RvdHlwZSUubmV4dCgpXHJcbn0sIGZ1bmN0aW9uKCl7XHJcbiAgdmFyIGl0ZXIgID0gdGhpc1tJVEVSXVxyXG4gICAgLCBPICAgICA9IGl0ZXIub1xyXG4gICAgLCBraW5kICA9IGl0ZXIua1xyXG4gICAgLCBpbmRleCA9IGl0ZXIuaSsrO1xyXG4gIGlmKCFPIHx8IGluZGV4ID49IE8ubGVuZ3RoKXtcclxuICAgIGl0ZXIubyA9IHVuZGVmaW5lZDtcclxuICAgIHJldHVybiBzdGVwKDEpO1xyXG4gIH1cclxuICBpZihraW5kID09ICdrZXlzJyAgKXJldHVybiBzdGVwKDAsIGluZGV4KTtcclxuICBpZihraW5kID09ICd2YWx1ZXMnKXJldHVybiBzdGVwKDAsIE9baW5kZXhdKTtcclxuICByZXR1cm4gc3RlcCgwLCBbaW5kZXgsIE9baW5kZXhdXSk7XHJcbn0sICd2YWx1ZXMnKTtcclxuXHJcbi8vIGFyZ3VtZW50c0xpc3RbQEBpdGVyYXRvcl0gaXMgJUFycmF5UHJvdG9fdmFsdWVzJSAoOS40LjQuNiwgOS40LjQuNylcclxuSXRlcmF0b3JzLkFyZ3VtZW50cyA9IEl0ZXJhdG9ycy5BcnJheTtcclxuXHJcbnNldFVuc2NvcGUoJ2tleXMnKTtcclxuc2V0VW5zY29wZSgndmFsdWVzJyk7XHJcbnNldFVuc2NvcGUoJ2VudHJpZXMnKTsiLCJ2YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcclxuJGRlZigkZGVmLlMsICdBcnJheScsIHtcclxuICAvLyAyMi4xLjIuMyBBcnJheS5vZiggLi4uaXRlbXMpXHJcbiAgb2Y6IGZ1bmN0aW9uIG9mKC8qIC4uLmFyZ3MgKi8pe1xyXG4gICAgdmFyIGluZGV4ICA9IDBcclxuICAgICAgLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoXHJcbiAgICAgIC8vIHN0cmFuZ2UgSUUgcXVpcmtzIG1vZGUgYnVnIC0+IHVzZSB0eXBlb2YgaW5zdGVhZCBvZiBpc0Z1bmN0aW9uXHJcbiAgICAgICwgcmVzdWx0ID0gbmV3ICh0eXBlb2YgdGhpcyA9PSAnZnVuY3Rpb24nID8gdGhpcyA6IEFycmF5KShsZW5ndGgpO1xyXG4gICAgd2hpbGUobGVuZ3RoID4gaW5kZXgpcmVzdWx0W2luZGV4XSA9IGFyZ3VtZW50c1tpbmRleCsrXTtcclxuICAgIHJlc3VsdC5sZW5ndGggPSBsZW5ndGg7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxufSk7IiwicmVxdWlyZSgnLi8kLnNwZWNpZXMnKShBcnJheSk7IiwidmFyICQgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgSEFTX0lOU1RBTkNFICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaGFzSW5zdGFuY2UnKVxyXG4gICwgRnVuY3Rpb25Qcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcclxuLy8gMTkuMi4zLjYgRnVuY3Rpb24ucHJvdG90eXBlW0BAaGFzSW5zdGFuY2VdKFYpXHJcbmlmKCEoSEFTX0lOU1RBTkNFIGluIEZ1bmN0aW9uUHJvdG8pKSQuc2V0RGVzYyhGdW5jdGlvblByb3RvLCBIQVNfSU5TVEFOQ0UsIHt2YWx1ZTogZnVuY3Rpb24oTyl7XHJcbiAgaWYoISQuaXNGdW5jdGlvbih0aGlzKSB8fCAhJC5pc09iamVjdChPKSlyZXR1cm4gZmFsc2U7XHJcbiAgaWYoISQuaXNPYmplY3QodGhpcy5wcm90b3R5cGUpKXJldHVybiBPIGluc3RhbmNlb2YgdGhpcztcclxuICAvLyBmb3IgZW52aXJvbm1lbnQgdy9vIG5hdGl2ZSBgQEBoYXNJbnN0YW5jZWAgbG9naWMgZW5vdWdoIGBpbnN0YW5jZW9mYCwgYnV0IGFkZCB0aGlzOlxyXG4gIHdoaWxlKE8gPSAkLmdldFByb3RvKE8pKWlmKHRoaXMucHJvdG90eXBlID09PSBPKXJldHVybiB0cnVlO1xyXG4gIHJldHVybiBmYWxzZTtcclxufX0pOyIsIid1c2Ugc3RyaWN0JztcclxudmFyICQgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgTkFNRSA9ICduYW1lJ1xyXG4gICwgc2V0RGVzYyA9ICQuc2V0RGVzY1xyXG4gICwgRnVuY3Rpb25Qcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcclxuLy8gMTkuMi40LjIgbmFtZVxyXG5OQU1FIGluIEZ1bmN0aW9uUHJvdG8gfHwgJC5GVyAmJiAkLkRFU0MgJiYgc2V0RGVzYyhGdW5jdGlvblByb3RvLCBOQU1FLCB7XHJcbiAgY29uZmlndXJhYmxlOiB0cnVlLFxyXG4gIGdldDogZnVuY3Rpb24oKXtcclxuICAgIHZhciBtYXRjaCA9IFN0cmluZyh0aGlzKS5tYXRjaCgvXlxccypmdW5jdGlvbiAoW14gKF0qKS8pXHJcbiAgICAgICwgbmFtZSAgPSBtYXRjaCA/IG1hdGNoWzFdIDogJyc7XHJcbiAgICAkLmhhcyh0aGlzLCBOQU1FKSB8fCBzZXREZXNjKHRoaXMsIE5BTUUsICQuZGVzYyg1LCBuYW1lKSk7XHJcbiAgICByZXR1cm4gbmFtZTtcclxuICB9LFxyXG4gIHNldDogZnVuY3Rpb24odmFsdWUpe1xyXG4gICAgJC5oYXModGhpcywgTkFNRSkgfHwgc2V0RGVzYyh0aGlzLCBOQU1FLCAkLmRlc2MoMCwgdmFsdWUpKTtcclxuICB9XHJcbn0pOyIsIid1c2Ugc3RyaWN0JztcclxudmFyIHN0cm9uZyA9IHJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uLXN0cm9uZycpO1xyXG5cclxuLy8gMjMuMSBNYXAgT2JqZWN0c1xyXG5yZXF1aXJlKCcuLyQuY29sbGVjdGlvbicpKCdNYXAnLCB7XHJcbiAgLy8gMjMuMS4zLjYgTWFwLnByb3RvdHlwZS5nZXQoa2V5KVxyXG4gIGdldDogZnVuY3Rpb24gZ2V0KGtleSl7XHJcbiAgICB2YXIgZW50cnkgPSBzdHJvbmcuZ2V0RW50cnkodGhpcywga2V5KTtcclxuICAgIHJldHVybiBlbnRyeSAmJiBlbnRyeS52O1xyXG4gIH0sXHJcbiAgLy8gMjMuMS4zLjkgTWFwLnByb3RvdHlwZS5zZXQoa2V5LCB2YWx1ZSlcclxuICBzZXQ6IGZ1bmN0aW9uIHNldChrZXksIHZhbHVlKXtcclxuICAgIHJldHVybiBzdHJvbmcuZGVmKHRoaXMsIGtleSA9PT0gMCA/IDAgOiBrZXksIHZhbHVlKTtcclxuICB9XHJcbn0sIHN0cm9uZywgdHJ1ZSk7IiwidmFyIEluZmluaXR5ID0gMSAvIDBcclxuICAsICRkZWYgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCBFICAgICA9IE1hdGguRVxyXG4gICwgcG93ICAgPSBNYXRoLnBvd1xyXG4gICwgYWJzICAgPSBNYXRoLmFic1xyXG4gICwgZXhwICAgPSBNYXRoLmV4cFxyXG4gICwgbG9nICAgPSBNYXRoLmxvZ1xyXG4gICwgc3FydCAgPSBNYXRoLnNxcnRcclxuICAsIGNlaWwgID0gTWF0aC5jZWlsXHJcbiAgLCBmbG9vciA9IE1hdGguZmxvb3JcclxuICAsIEVQU0lMT04gICA9IHBvdygyLCAtNTIpXHJcbiAgLCBFUFNJTE9OMzIgPSBwb3coMiwgLTIzKVxyXG4gICwgTUFYMzIgICAgID0gcG93KDIsIDEyNykgKiAoMiAtIEVQU0lMT04zMilcclxuICAsIE1JTjMyICAgICA9IHBvdygyLCAtMTI2KTtcclxuZnVuY3Rpb24gcm91bmRUaWVzVG9FdmVuKG4pe1xyXG4gIHJldHVybiBuICsgMSAvIEVQU0lMT04gLSAxIC8gRVBTSUxPTjtcclxufVxyXG5cclxuLy8gMjAuMi4yLjI4IE1hdGguc2lnbih4KVxyXG5mdW5jdGlvbiBzaWduKHgpe1xyXG4gIHJldHVybiAoeCA9ICt4KSA9PSAwIHx8IHggIT0geCA/IHggOiB4IDwgMCA/IC0xIDogMTtcclxufVxyXG4vLyAyMC4yLjIuNSBNYXRoLmFzaW5oKHgpXHJcbmZ1bmN0aW9uIGFzaW5oKHgpe1xyXG4gIHJldHVybiAhaXNGaW5pdGUoeCA9ICt4KSB8fCB4ID09IDAgPyB4IDogeCA8IDAgPyAtYXNpbmgoLXgpIDogbG9nKHggKyBzcXJ0KHggKiB4ICsgMSkpO1xyXG59XHJcbi8vIDIwLjIuMi4xNCBNYXRoLmV4cG0xKHgpXHJcbmZ1bmN0aW9uIGV4cG0xKHgpe1xyXG4gIHJldHVybiAoeCA9ICt4KSA9PSAwID8geCA6IHggPiAtMWUtNiAmJiB4IDwgMWUtNiA/IHggKyB4ICogeCAvIDIgOiBleHAoeCkgLSAxO1xyXG59XHJcblxyXG4kZGVmKCRkZWYuUywgJ01hdGgnLCB7XHJcbiAgLy8gMjAuMi4yLjMgTWF0aC5hY29zaCh4KVxyXG4gIGFjb3NoOiBmdW5jdGlvbiBhY29zaCh4KXtcclxuICAgIHJldHVybiAoeCA9ICt4KSA8IDEgPyBOYU4gOiBpc0Zpbml0ZSh4KSA/IGxvZyh4IC8gRSArIHNxcnQoeCArIDEpICogc3FydCh4IC0gMSkgLyBFKSArIDEgOiB4O1xyXG4gIH0sXHJcbiAgLy8gMjAuMi4yLjUgTWF0aC5hc2luaCh4KVxyXG4gIGFzaW5oOiBhc2luaCxcclxuICAvLyAyMC4yLjIuNyBNYXRoLmF0YW5oKHgpXHJcbiAgYXRhbmg6IGZ1bmN0aW9uIGF0YW5oKHgpe1xyXG4gICAgcmV0dXJuICh4ID0gK3gpID09IDAgPyB4IDogbG9nKCgxICsgeCkgLyAoMSAtIHgpKSAvIDI7XHJcbiAgfSxcclxuICAvLyAyMC4yLjIuOSBNYXRoLmNicnQoeClcclxuICBjYnJ0OiBmdW5jdGlvbiBjYnJ0KHgpe1xyXG4gICAgcmV0dXJuIHNpZ24oeCA9ICt4KSAqIHBvdyhhYnMoeCksIDEgLyAzKTtcclxuICB9LFxyXG4gIC8vIDIwLjIuMi4xMSBNYXRoLmNsejMyKHgpXHJcbiAgY2x6MzI6IGZ1bmN0aW9uIGNsejMyKHgpe1xyXG4gICAgcmV0dXJuICh4ID4+Pj0gMCkgPyAzMSAtIGZsb29yKGxvZyh4ICsgMC41KSAqIE1hdGguTE9HMkUpIDogMzI7XHJcbiAgfSxcclxuICAvLyAyMC4yLjIuMTIgTWF0aC5jb3NoKHgpXHJcbiAgY29zaDogZnVuY3Rpb24gY29zaCh4KXtcclxuICAgIHJldHVybiAoZXhwKHggPSAreCkgKyBleHAoLXgpKSAvIDI7XHJcbiAgfSxcclxuICAvLyAyMC4yLjIuMTQgTWF0aC5leHBtMSh4KVxyXG4gIGV4cG0xOiBleHBtMSxcclxuICAvLyAyMC4yLjIuMTYgTWF0aC5mcm91bmQoeClcclxuICBmcm91bmQ6IGZ1bmN0aW9uIGZyb3VuZCh4KXtcclxuICAgIHZhciAkYWJzICA9IGFicyh4KVxyXG4gICAgICAsICRzaWduID0gc2lnbih4KVxyXG4gICAgICAsIGEsIHJlc3VsdDtcclxuICAgIGlmKCRhYnMgPCBNSU4zMilyZXR1cm4gJHNpZ24gKiByb3VuZFRpZXNUb0V2ZW4oJGFicyAvIE1JTjMyIC8gRVBTSUxPTjMyKSAqIE1JTjMyICogRVBTSUxPTjMyO1xyXG4gICAgYSA9ICgxICsgRVBTSUxPTjMyIC8gRVBTSUxPTikgKiAkYWJzO1xyXG4gICAgcmVzdWx0ID0gYSAtIChhIC0gJGFicyk7XHJcbiAgICBpZihyZXN1bHQgPiBNQVgzMiB8fCByZXN1bHQgIT0gcmVzdWx0KXJldHVybiAkc2lnbiAqIEluZmluaXR5O1xyXG4gICAgcmV0dXJuICRzaWduICogcmVzdWx0O1xyXG4gIH0sXHJcbiAgLy8gMjAuMi4yLjE3IE1hdGguaHlwb3QoW3ZhbHVlMVssIHZhbHVlMlssIOKApiBdXV0pXHJcbiAgaHlwb3Q6IGZ1bmN0aW9uIGh5cG90KHZhbHVlMSwgdmFsdWUyKXsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gICAgdmFyIHN1bSAgPSAwXHJcbiAgICAgICwgbGVuMSA9IGFyZ3VtZW50cy5sZW5ndGhcclxuICAgICAgLCBsZW4yID0gbGVuMVxyXG4gICAgICAsIGFyZ3MgPSBBcnJheShsZW4xKVxyXG4gICAgICAsIGxhcmcgPSAtSW5maW5pdHlcclxuICAgICAgLCBhcmc7XHJcbiAgICB3aGlsZShsZW4xLS0pe1xyXG4gICAgICBhcmcgPSBhcmdzW2xlbjFdID0gK2FyZ3VtZW50c1tsZW4xXTtcclxuICAgICAgaWYoYXJnID09IEluZmluaXR5IHx8IGFyZyA9PSAtSW5maW5pdHkpcmV0dXJuIEluZmluaXR5O1xyXG4gICAgICBpZihhcmcgPiBsYXJnKWxhcmcgPSBhcmc7XHJcbiAgICB9XHJcbiAgICBsYXJnID0gYXJnIHx8IDE7XHJcbiAgICB3aGlsZShsZW4yLS0pc3VtICs9IHBvdyhhcmdzW2xlbjJdIC8gbGFyZywgMik7XHJcbiAgICByZXR1cm4gbGFyZyAqIHNxcnQoc3VtKTtcclxuICB9LFxyXG4gIC8vIDIwLjIuMi4xOCBNYXRoLmltdWwoeCwgeSlcclxuICBpbXVsOiBmdW5jdGlvbiBpbXVsKHgsIHkpe1xyXG4gICAgdmFyIFVJbnQxNiA9IDB4ZmZmZlxyXG4gICAgICAsIHhuID0gK3hcclxuICAgICAgLCB5biA9ICt5XHJcbiAgICAgICwgeGwgPSBVSW50MTYgJiB4blxyXG4gICAgICAsIHlsID0gVUludDE2ICYgeW47XHJcbiAgICByZXR1cm4gMCB8IHhsICogeWwgKyAoKFVJbnQxNiAmIHhuID4+PiAxNikgKiB5bCArIHhsICogKFVJbnQxNiAmIHluID4+PiAxNikgPDwgMTYgPj4+IDApO1xyXG4gIH0sXHJcbiAgLy8gMjAuMi4yLjIwIE1hdGgubG9nMXAoeClcclxuICBsb2cxcDogZnVuY3Rpb24gbG9nMXAoeCl7XHJcbiAgICByZXR1cm4gKHggPSAreCkgPiAtMWUtOCAmJiB4IDwgMWUtOCA/IHggLSB4ICogeCAvIDIgOiBsb2coMSArIHgpO1xyXG4gIH0sXHJcbiAgLy8gMjAuMi4yLjIxIE1hdGgubG9nMTAoeClcclxuICBsb2cxMDogZnVuY3Rpb24gbG9nMTAoeCl7XHJcbiAgICByZXR1cm4gbG9nKHgpIC8gTWF0aC5MTjEwO1xyXG4gIH0sXHJcbiAgLy8gMjAuMi4yLjIyIE1hdGgubG9nMih4KVxyXG4gIGxvZzI6IGZ1bmN0aW9uIGxvZzIoeCl7XHJcbiAgICByZXR1cm4gbG9nKHgpIC8gTWF0aC5MTjI7XHJcbiAgfSxcclxuICAvLyAyMC4yLjIuMjggTWF0aC5zaWduKHgpXHJcbiAgc2lnbjogc2lnbixcclxuICAvLyAyMC4yLjIuMzAgTWF0aC5zaW5oKHgpXHJcbiAgc2luaDogZnVuY3Rpb24gc2luaCh4KXtcclxuICAgIHJldHVybiBhYnMoeCA9ICt4KSA8IDEgPyAoZXhwbTEoeCkgLSBleHBtMSgteCkpIC8gMiA6IChleHAoeCAtIDEpIC0gZXhwKC14IC0gMSkpICogKEUgLyAyKTtcclxuICB9LFxyXG4gIC8vIDIwLjIuMi4zMyBNYXRoLnRhbmgoeClcclxuICB0YW5oOiBmdW5jdGlvbiB0YW5oKHgpe1xyXG4gICAgdmFyIGEgPSBleHBtMSh4ID0gK3gpXHJcbiAgICAgICwgYiA9IGV4cG0xKC14KTtcclxuICAgIHJldHVybiBhID09IEluZmluaXR5ID8gMSA6IGIgPT0gSW5maW5pdHkgPyAtMSA6IChhIC0gYikgLyAoZXhwKHgpICsgZXhwKC14KSk7XHJcbiAgfSxcclxuICAvLyAyMC4yLjIuMzQgTWF0aC50cnVuYyh4KVxyXG4gIHRydW5jOiBmdW5jdGlvbiB0cnVuYyhpdCl7XHJcbiAgICByZXR1cm4gKGl0ID4gMCA/IGZsb29yIDogY2VpbCkoaXQpO1xyXG4gIH1cclxufSk7IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgJCAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBpc09iamVjdCAgID0gJC5pc09iamVjdFxyXG4gICwgaXNGdW5jdGlvbiA9ICQuaXNGdW5jdGlvblxyXG4gICwgTlVNQkVSICAgICA9ICdOdW1iZXInXHJcbiAgLCAkTnVtYmVyICAgID0gJC5nW05VTUJFUl1cclxuICAsIEJhc2UgICAgICAgPSAkTnVtYmVyXHJcbiAgLCBwcm90byAgICAgID0gJE51bWJlci5wcm90b3R5cGU7XHJcbmZ1bmN0aW9uIHRvUHJpbWl0aXZlKGl0KXtcclxuICB2YXIgZm4sIHZhbDtcclxuICBpZihpc0Z1bmN0aW9uKGZuID0gaXQudmFsdWVPZikgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSlyZXR1cm4gdmFsO1xyXG4gIGlmKGlzRnVuY3Rpb24oZm4gPSBpdC50b1N0cmluZykgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSlyZXR1cm4gdmFsO1xyXG4gIHRocm93IFR5cGVFcnJvcihcIkNhbid0IGNvbnZlcnQgb2JqZWN0IHRvIG51bWJlclwiKTtcclxufVxyXG5mdW5jdGlvbiB0b051bWJlcihpdCl7XHJcbiAgaWYoaXNPYmplY3QoaXQpKWl0ID0gdG9QcmltaXRpdmUoaXQpO1xyXG4gIGlmKHR5cGVvZiBpdCA9PSAnc3RyaW5nJyAmJiBpdC5sZW5ndGggPiAyICYmIGl0LmNoYXJDb2RlQXQoMCkgPT0gNDgpe1xyXG4gICAgdmFyIGJpbmFyeSA9IGZhbHNlO1xyXG4gICAgc3dpdGNoKGl0LmNoYXJDb2RlQXQoMSkpe1xyXG4gICAgICBjYXNlIDY2IDogY2FzZSA5OCAgOiBiaW5hcnkgPSB0cnVlO1xyXG4gICAgICBjYXNlIDc5IDogY2FzZSAxMTEgOiByZXR1cm4gcGFyc2VJbnQoaXQuc2xpY2UoMiksIGJpbmFyeSA/IDIgOiA4KTtcclxuICAgIH1cclxuICB9IHJldHVybiAraXQ7XHJcbn1cclxuaWYoJC5GVyAmJiAhKCROdW1iZXIoJzBvMScpICYmICROdW1iZXIoJzBiMScpKSl7XHJcbiAgJE51bWJlciA9IGZ1bmN0aW9uIE51bWJlcihpdCl7XHJcbiAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mICROdW1iZXIgPyBuZXcgQmFzZSh0b051bWJlcihpdCkpIDogdG9OdW1iZXIoaXQpO1xyXG4gIH07XHJcbiAgJC5lYWNoLmNhbGwoJC5ERVNDID8gJC5nZXROYW1lcyhCYXNlKSA6IChcclxuICAgICAgLy8gRVMzOlxyXG4gICAgICAnTUFYX1ZBTFVFLE1JTl9WQUxVRSxOYU4sTkVHQVRJVkVfSU5GSU5JVFksUE9TSVRJVkVfSU5GSU5JVFksJyArXHJcbiAgICAgIC8vIEVTNiAoaW4gY2FzZSwgaWYgbW9kdWxlcyB3aXRoIEVTNiBOdW1iZXIgc3RhdGljcyByZXF1aXJlZCBiZWZvcmUpOlxyXG4gICAgICAnRVBTSUxPTixpc0Zpbml0ZSxpc0ludGVnZXIsaXNOYU4saXNTYWZlSW50ZWdlcixNQVhfU0FGRV9JTlRFR0VSLCcgK1xyXG4gICAgICAnTUlOX1NBRkVfSU5URUdFUixwYXJzZUZsb2F0LHBhcnNlSW50LGlzSW50ZWdlcidcclxuICAgICkuc3BsaXQoJywnKSwgZnVuY3Rpb24oa2V5KXtcclxuICAgICAgaWYoJC5oYXMoQmFzZSwga2V5KSAmJiAhJC5oYXMoJE51bWJlciwga2V5KSl7XHJcbiAgICAgICAgJC5zZXREZXNjKCROdW1iZXIsIGtleSwgJC5nZXREZXNjKEJhc2UsIGtleSkpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgKTtcclxuICAkTnVtYmVyLnByb3RvdHlwZSA9IHByb3RvO1xyXG4gIHByb3RvLmNvbnN0cnVjdG9yID0gJE51bWJlcjtcclxuICAkLmhpZGUoJC5nLCBOVU1CRVIsICROdW1iZXIpO1xyXG59IiwidmFyICQgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsICRkZWYgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCBhYnMgICA9IE1hdGguYWJzXHJcbiAgLCBmbG9vciA9IE1hdGguZmxvb3JcclxuICAsIF9pc0Zpbml0ZSA9ICQuZy5pc0Zpbml0ZVxyXG4gICwgTUFYX1NBRkVfSU5URUdFUiA9IDB4MWZmZmZmZmZmZmZmZmY7IC8vIHBvdygyLCA1MykgLSAxID09IDkwMDcxOTkyNTQ3NDA5OTE7XHJcbmZ1bmN0aW9uIGlzSW50ZWdlcihpdCl7XHJcbiAgcmV0dXJuICEkLmlzT2JqZWN0KGl0KSAmJiBfaXNGaW5pdGUoaXQpICYmIGZsb29yKGl0KSA9PT0gaXQ7XHJcbn1cclxuJGRlZigkZGVmLlMsICdOdW1iZXInLCB7XHJcbiAgLy8gMjAuMS4yLjEgTnVtYmVyLkVQU0lMT05cclxuICBFUFNJTE9OOiBNYXRoLnBvdygyLCAtNTIpLFxyXG4gIC8vIDIwLjEuMi4yIE51bWJlci5pc0Zpbml0ZShudW1iZXIpXHJcbiAgaXNGaW5pdGU6IGZ1bmN0aW9uIGlzRmluaXRlKGl0KXtcclxuICAgIHJldHVybiB0eXBlb2YgaXQgPT0gJ251bWJlcicgJiYgX2lzRmluaXRlKGl0KTtcclxuICB9LFxyXG4gIC8vIDIwLjEuMi4zIE51bWJlci5pc0ludGVnZXIobnVtYmVyKVxyXG4gIGlzSW50ZWdlcjogaXNJbnRlZ2VyLFxyXG4gIC8vIDIwLjEuMi40IE51bWJlci5pc05hTihudW1iZXIpXHJcbiAgaXNOYU46IGZ1bmN0aW9uIGlzTmFOKG51bWJlcil7XHJcbiAgICByZXR1cm4gbnVtYmVyICE9IG51bWJlcjtcclxuICB9LFxyXG4gIC8vIDIwLjEuMi41IE51bWJlci5pc1NhZmVJbnRlZ2VyKG51bWJlcilcclxuICBpc1NhZmVJbnRlZ2VyOiBmdW5jdGlvbiBpc1NhZmVJbnRlZ2VyKG51bWJlcil7XHJcbiAgICByZXR1cm4gaXNJbnRlZ2VyKG51bWJlcikgJiYgYWJzKG51bWJlcikgPD0gTUFYX1NBRkVfSU5URUdFUjtcclxuICB9LFxyXG4gIC8vIDIwLjEuMi42IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSXHJcbiAgTUFYX1NBRkVfSU5URUdFUjogTUFYX1NBRkVfSU5URUdFUixcclxuICAvLyAyMC4xLjIuMTAgTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVJcclxuICBNSU5fU0FGRV9JTlRFR0VSOiAtTUFYX1NBRkVfSU5URUdFUixcclxuICAvLyAyMC4xLjIuMTIgTnVtYmVyLnBhcnNlRmxvYXQoc3RyaW5nKVxyXG4gIHBhcnNlRmxvYXQ6IHBhcnNlRmxvYXQsXHJcbiAgLy8gMjAuMS4yLjEzIE51bWJlci5wYXJzZUludChzdHJpbmcsIHJhZGl4KVxyXG4gIHBhcnNlSW50OiBwYXJzZUludFxyXG59KTsiLCIvLyAxOS4xLjMuMSBPYmplY3QuYXNzaWduKHRhcmdldCwgc291cmNlKVxyXG52YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcclxuJGRlZigkZGVmLlMsICdPYmplY3QnLCB7YXNzaWduOiByZXF1aXJlKCcuLyQuYXNzaWduJyl9KTsiLCIvLyAxOS4xLjMuMTAgT2JqZWN0LmlzKHZhbHVlMSwgdmFsdWUyKVxyXG52YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcclxuJGRlZigkZGVmLlMsICdPYmplY3QnLCB7XHJcbiAgaXM6IGZ1bmN0aW9uIGlzKHgsIHkpe1xyXG4gICAgcmV0dXJuIHggPT09IHkgPyB4ICE9PSAwIHx8IDEgLyB4ID09PSAxIC8geSA6IHggIT0geCAmJiB5ICE9IHk7XHJcbiAgfVxyXG59KTsiLCIvLyAxOS4xLjMuMTkgT2JqZWN0LnNldFByb3RvdHlwZU9mKE8sIHByb3RvKVxyXG52YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcclxuJGRlZigkZGVmLlMsICdPYmplY3QnLCB7c2V0UHJvdG90eXBlT2Y6IHJlcXVpcmUoJy4vJC5zZXQtcHJvdG8nKS5zZXR9KTsiLCJ2YXIgJCAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgJGRlZiAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsIGlzT2JqZWN0ID0gJC5pc09iamVjdFxyXG4gICwgdG9PYmplY3QgPSAkLnRvT2JqZWN0O1xyXG5mdW5jdGlvbiB3cmFwT2JqZWN0TWV0aG9kKE1FVEhPRCwgTU9ERSl7XHJcbiAgdmFyIGZuICA9ICgkLmNvcmUuT2JqZWN0IHx8IHt9KVtNRVRIT0RdIHx8IE9iamVjdFtNRVRIT0RdXHJcbiAgICAsIGYgICA9IDBcclxuICAgICwgbyAgID0ge307XHJcbiAgb1tNRVRIT0RdID0gTU9ERSA9PSAxID8gZnVuY3Rpb24oaXQpe1xyXG4gICAgcmV0dXJuIGlzT2JqZWN0KGl0KSA/IGZuKGl0KSA6IGl0O1xyXG4gIH0gOiBNT0RFID09IDIgPyBmdW5jdGlvbihpdCl7XHJcbiAgICByZXR1cm4gaXNPYmplY3QoaXQpID8gZm4oaXQpIDogdHJ1ZTtcclxuICB9IDogTU9ERSA9PSAzID8gZnVuY3Rpb24oaXQpe1xyXG4gICAgcmV0dXJuIGlzT2JqZWN0KGl0KSA/IGZuKGl0KSA6IGZhbHNlO1xyXG4gIH0gOiBNT0RFID09IDQgPyBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoaXQsIGtleSl7XHJcbiAgICByZXR1cm4gZm4odG9PYmplY3QoaXQpLCBrZXkpO1xyXG4gIH0gOiBNT0RFID09IDUgPyBmdW5jdGlvbiBnZXRQcm90b3R5cGVPZihpdCl7XHJcbiAgICByZXR1cm4gZm4oT2JqZWN0KCQuYXNzZXJ0RGVmaW5lZChpdCkpKTtcclxuICB9IDogZnVuY3Rpb24oaXQpe1xyXG4gICAgcmV0dXJuIGZuKHRvT2JqZWN0KGl0KSk7XHJcbiAgfTtcclxuICB0cnkge1xyXG4gICAgZm4oJ3onKTtcclxuICB9IGNhdGNoKGUpe1xyXG4gICAgZiA9IDE7XHJcbiAgfVxyXG4gICRkZWYoJGRlZi5TICsgJGRlZi5GICogZiwgJ09iamVjdCcsIG8pO1xyXG59XHJcbndyYXBPYmplY3RNZXRob2QoJ2ZyZWV6ZScsIDEpO1xyXG53cmFwT2JqZWN0TWV0aG9kKCdzZWFsJywgMSk7XHJcbndyYXBPYmplY3RNZXRob2QoJ3ByZXZlbnRFeHRlbnNpb25zJywgMSk7XHJcbndyYXBPYmplY3RNZXRob2QoJ2lzRnJvemVuJywgMik7XHJcbndyYXBPYmplY3RNZXRob2QoJ2lzU2VhbGVkJywgMik7XHJcbndyYXBPYmplY3RNZXRob2QoJ2lzRXh0ZW5zaWJsZScsIDMpO1xyXG53cmFwT2JqZWN0TWV0aG9kKCdnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3InLCA0KTtcclxud3JhcE9iamVjdE1ldGhvZCgnZ2V0UHJvdG90eXBlT2YnLCA1KTtcclxud3JhcE9iamVjdE1ldGhvZCgna2V5cycpO1xyXG53cmFwT2JqZWN0TWV0aG9kKCdnZXRPd25Qcm9wZXJ0eU5hbWVzJyk7IiwiJ3VzZSBzdHJpY3QnO1xyXG4vLyAxOS4xLjMuNiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nKClcclxudmFyICQgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBjb2YgPSByZXF1aXJlKCcuLyQuY29mJylcclxuICAsIHRtcCA9IHt9O1xyXG50bXBbcmVxdWlyZSgnLi8kLndrcycpKCd0b1N0cmluZ1RhZycpXSA9ICd6JztcclxuaWYoJC5GVyAmJiBjb2YodG1wKSAhPSAneicpJC5oaWRlKE9iamVjdC5wcm90b3R5cGUsICd0b1N0cmluZycsIGZ1bmN0aW9uIHRvU3RyaW5nKCl7XHJcbiAgcmV0dXJuICdbb2JqZWN0ICcgKyBjb2YuY2xhc3NvZih0aGlzKSArICddJztcclxufSk7IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgJCAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgY3R4ICAgICAgPSByZXF1aXJlKCcuLyQuY3R4JylcclxuICAsIGNvZiAgICAgID0gcmVxdWlyZSgnLi8kLmNvZicpXHJcbiAgLCAkZGVmICAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxyXG4gICwgYXNzZXJ0ICAgPSByZXF1aXJlKCcuLyQuYXNzZXJ0JylcclxuICAsIGZvck9mICAgID0gcmVxdWlyZSgnLi8kLmZvci1vZicpXHJcbiAgLCBzZXRQcm90byA9IHJlcXVpcmUoJy4vJC5zZXQtcHJvdG8nKS5zZXRcclxuICAsIHNwZWNpZXMgID0gcmVxdWlyZSgnLi8kLnNwZWNpZXMnKVxyXG4gICwgU1BFQ0lFUyAgPSByZXF1aXJlKCcuLyQud2tzJykoJ3NwZWNpZXMnKVxyXG4gICwgUkVDT1JEICAgPSByZXF1aXJlKCcuLyQudWlkJykuc2FmZSgncmVjb3JkJylcclxuICAsIFBST01JU0UgID0gJ1Byb21pc2UnXHJcbiAgLCBnbG9iYWwgICA9ICQuZ1xyXG4gICwgcHJvY2VzcyAgPSBnbG9iYWwucHJvY2Vzc1xyXG4gICwgYXNhcCAgICAgPSBwcm9jZXNzICYmIHByb2Nlc3MubmV4dFRpY2sgfHwgcmVxdWlyZSgnLi8kLnRhc2snKS5zZXRcclxuICAsIFAgICAgICAgID0gZ2xvYmFsW1BST01JU0VdXHJcbiAgLCBpc0Z1bmN0aW9uICAgICA9ICQuaXNGdW5jdGlvblxyXG4gICwgaXNPYmplY3QgICAgICAgPSAkLmlzT2JqZWN0XHJcbiAgLCBhc3NlcnRGdW5jdGlvbiA9IGFzc2VydC5mblxyXG4gICwgYXNzZXJ0T2JqZWN0ICAgPSBhc3NlcnQub2JqO1xyXG5cclxudmFyIHVzZU5hdGl2ZSA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIHRlc3QsIHdvcmtzID0gZmFsc2U7XHJcbiAgZnVuY3Rpb24gUDIoeCl7XHJcbiAgICB2YXIgc2VsZiA9IG5ldyBQKHgpO1xyXG4gICAgc2V0UHJvdG8oc2VsZiwgUDIucHJvdG90eXBlKTtcclxuICAgIHJldHVybiBzZWxmO1xyXG4gIH1cclxuICB0cnkge1xyXG4gICAgd29ya3MgPSBpc0Z1bmN0aW9uKFApICYmIGlzRnVuY3Rpb24oUC5yZXNvbHZlKSAmJiBQLnJlc29sdmUodGVzdCA9IG5ldyBQKGZ1bmN0aW9uKCl7fSkpID09IHRlc3Q7XHJcbiAgICBzZXRQcm90byhQMiwgUCk7XHJcbiAgICBQMi5wcm90b3R5cGUgPSAkLmNyZWF0ZShQLnByb3RvdHlwZSwge2NvbnN0cnVjdG9yOiB7dmFsdWU6IFAyfX0pO1xyXG4gICAgLy8gYWN0dWFsIEZpcmVmb3ggaGFzIGJyb2tlbiBzdWJjbGFzcyBzdXBwb3J0LCB0ZXN0IHRoYXRcclxuICAgIGlmKCEoUDIucmVzb2x2ZSg1KS50aGVuKGZ1bmN0aW9uKCl7fSkgaW5zdGFuY2VvZiBQMikpe1xyXG4gICAgICB3b3JrcyA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH0gY2F0Y2goZSl7IHdvcmtzID0gZmFsc2U7IH1cclxuICByZXR1cm4gd29ya3M7XHJcbn0oKTtcclxuXHJcbi8vIGhlbHBlcnNcclxuZnVuY3Rpb24gZ2V0Q29uc3RydWN0b3IoQyl7XHJcbiAgdmFyIFMgPSBhc3NlcnRPYmplY3QoQylbU1BFQ0lFU107XHJcbiAgcmV0dXJuIFMgIT0gdW5kZWZpbmVkID8gUyA6IEM7XHJcbn1cclxuZnVuY3Rpb24gaXNUaGVuYWJsZShpdCl7XHJcbiAgdmFyIHRoZW47XHJcbiAgaWYoaXNPYmplY3QoaXQpKXRoZW4gPSBpdC50aGVuO1xyXG4gIHJldHVybiBpc0Z1bmN0aW9uKHRoZW4pID8gdGhlbiA6IGZhbHNlO1xyXG59XHJcbmZ1bmN0aW9uIG5vdGlmeShyZWNvcmQpe1xyXG4gIHZhciBjaGFpbiA9IHJlY29yZC5jO1xyXG4gIGlmKGNoYWluLmxlbmd0aClhc2FwKGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgdmFsdWUgPSByZWNvcmQudlxyXG4gICAgICAsIG9rICAgID0gcmVjb3JkLnMgPT0gMVxyXG4gICAgICAsIGkgICAgID0gMDtcclxuICAgIGZ1bmN0aW9uIHJ1bihyZWFjdCl7XHJcbiAgICAgIHZhciBjYiA9IG9rID8gcmVhY3Qub2sgOiByZWFjdC5mYWlsXHJcbiAgICAgICAgLCByZXQsIHRoZW47XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgaWYoY2Ipe1xyXG4gICAgICAgICAgaWYoIW9rKXJlY29yZC5oID0gdHJ1ZTtcclxuICAgICAgICAgIHJldCA9IGNiID09PSB0cnVlID8gdmFsdWUgOiBjYih2YWx1ZSk7XHJcbiAgICAgICAgICBpZihyZXQgPT09IHJlYWN0LlApe1xyXG4gICAgICAgICAgICByZWFjdC5yZWooVHlwZUVycm9yKCdQcm9taXNlLWNoYWluIGN5Y2xlJykpO1xyXG4gICAgICAgICAgfSBlbHNlIGlmKHRoZW4gPSBpc1RoZW5hYmxlKHJldCkpe1xyXG4gICAgICAgICAgICB0aGVuLmNhbGwocmV0LCByZWFjdC5yZXMsIHJlYWN0LnJlaik7XHJcbiAgICAgICAgICB9IGVsc2UgcmVhY3QucmVzKHJldCk7XHJcbiAgICAgICAgfSBlbHNlIHJlYWN0LnJlaih2YWx1ZSk7XHJcbiAgICAgIH0gY2F0Y2goZXJyKXtcclxuICAgICAgICByZWFjdC5yZWooZXJyKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgd2hpbGUoY2hhaW4ubGVuZ3RoID4gaSlydW4oY2hhaW5baSsrXSk7IC8vIHZhcmlhYmxlIGxlbmd0aCAtIGNhbid0IHVzZSBmb3JFYWNoXHJcbiAgICBjaGFpbi5sZW5ndGggPSAwO1xyXG4gIH0pO1xyXG59XHJcbmZ1bmN0aW9uIGlzVW5oYW5kbGVkKHByb21pc2Upe1xyXG4gIHZhciByZWNvcmQgPSBwcm9taXNlW1JFQ09SRF1cclxuICAgICwgY2hhaW4gID0gcmVjb3JkLmEgfHwgcmVjb3JkLmNcclxuICAgICwgaSAgICAgID0gMFxyXG4gICAgLCByZWFjdDtcclxuICBpZihyZWNvcmQuaClyZXR1cm4gZmFsc2U7XHJcbiAgd2hpbGUoY2hhaW4ubGVuZ3RoID4gaSl7XHJcbiAgICByZWFjdCA9IGNoYWluW2krK107XHJcbiAgICBpZihyZWFjdC5mYWlsIHx8ICFpc1VuaGFuZGxlZChyZWFjdC5QKSlyZXR1cm4gZmFsc2U7XHJcbiAgfSByZXR1cm4gdHJ1ZTtcclxufVxyXG5mdW5jdGlvbiAkcmVqZWN0KHZhbHVlKXtcclxuICB2YXIgcmVjb3JkID0gdGhpc1xyXG4gICAgLCBwcm9taXNlO1xyXG4gIGlmKHJlY29yZC5kKXJldHVybjtcclxuICByZWNvcmQuZCA9IHRydWU7XHJcbiAgcmVjb3JkID0gcmVjb3JkLnIgfHwgcmVjb3JkOyAvLyB1bndyYXBcclxuICByZWNvcmQudiA9IHZhbHVlO1xyXG4gIHJlY29yZC5zID0gMjtcclxuICByZWNvcmQuYSA9IHJlY29yZC5jLnNsaWNlKCk7XHJcbiAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgYXNhcChmdW5jdGlvbigpe1xyXG4gICAgICBpZihpc1VuaGFuZGxlZChwcm9taXNlID0gcmVjb3JkLnApKXtcclxuICAgICAgICBpZihjb2YocHJvY2VzcykgPT0gJ3Byb2Nlc3MnKXtcclxuICAgICAgICAgIHByb2Nlc3MuZW1pdCgndW5oYW5kbGVkUmVqZWN0aW9uJywgdmFsdWUsIHByb21pc2UpO1xyXG4gICAgICAgIH0gZWxzZSBpZihnbG9iYWwuY29uc29sZSAmJiBpc0Z1bmN0aW9uKGNvbnNvbGUuZXJyb3IpKXtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1VuaGFuZGxlZCBwcm9taXNlIHJlamVjdGlvbicsIHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmVjb3JkLmEgPSB1bmRlZmluZWQ7XHJcbiAgICB9KTtcclxuICB9LCAxKTtcclxuICBub3RpZnkocmVjb3JkKTtcclxufVxyXG5mdW5jdGlvbiAkcmVzb2x2ZSh2YWx1ZSl7XHJcbiAgdmFyIHJlY29yZCA9IHRoaXNcclxuICAgICwgdGhlbiwgd3JhcHBlcjtcclxuICBpZihyZWNvcmQuZClyZXR1cm47XHJcbiAgcmVjb3JkLmQgPSB0cnVlO1xyXG4gIHJlY29yZCA9IHJlY29yZC5yIHx8IHJlY29yZDsgLy8gdW53cmFwXHJcbiAgdHJ5IHtcclxuICAgIGlmKHRoZW4gPSBpc1RoZW5hYmxlKHZhbHVlKSl7XHJcbiAgICAgIHdyYXBwZXIgPSB7cjogcmVjb3JkLCBkOiBmYWxzZX07IC8vIHdyYXBcclxuICAgICAgdGhlbi5jYWxsKHZhbHVlLCBjdHgoJHJlc29sdmUsIHdyYXBwZXIsIDEpLCBjdHgoJHJlamVjdCwgd3JhcHBlciwgMSkpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmVjb3JkLnYgPSB2YWx1ZTtcclxuICAgICAgcmVjb3JkLnMgPSAxO1xyXG4gICAgICBub3RpZnkocmVjb3JkKTtcclxuICAgIH1cclxuICB9IGNhdGNoKGVycil7XHJcbiAgICAkcmVqZWN0LmNhbGwod3JhcHBlciB8fCB7cjogcmVjb3JkLCBkOiBmYWxzZX0sIGVycik7IC8vIHdyYXBcclxuICB9XHJcbn1cclxuXHJcbi8vIGNvbnN0cnVjdG9yIHBvbHlmaWxsXHJcbmlmKCF1c2VOYXRpdmUpe1xyXG4gIC8vIDI1LjQuMy4xIFByb21pc2UoZXhlY3V0b3IpXHJcbiAgUCA9IGZ1bmN0aW9uIFByb21pc2UoZXhlY3V0b3Ipe1xyXG4gICAgYXNzZXJ0RnVuY3Rpb24oZXhlY3V0b3IpO1xyXG4gICAgdmFyIHJlY29yZCA9IHtcclxuICAgICAgcDogYXNzZXJ0Lmluc3QodGhpcywgUCwgUFJPTUlTRSksICAgICAgIC8vIDwtIHByb21pc2VcclxuICAgICAgYzogW10sICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIGF3YWl0aW5nIHJlYWN0aW9uc1xyXG4gICAgICBhOiB1bmRlZmluZWQsICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gY2hlY2tlZCBpbiBpc1VuaGFuZGxlZCByZWFjdGlvbnNcclxuICAgICAgczogMCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIHN0YXRlXHJcbiAgICAgIGQ6IGZhbHNlLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSBkb25lXHJcbiAgICAgIHY6IHVuZGVmaW5lZCwgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSB2YWx1ZVxyXG4gICAgICBoOiBmYWxzZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gaGFuZGxlZCByZWplY3Rpb25cclxuICAgIH07XHJcbiAgICAkLmhpZGUodGhpcywgUkVDT1JELCByZWNvcmQpO1xyXG4gICAgdHJ5IHtcclxuICAgICAgZXhlY3V0b3IoY3R4KCRyZXNvbHZlLCByZWNvcmQsIDEpLCBjdHgoJHJlamVjdCwgcmVjb3JkLCAxKSk7XHJcbiAgICB9IGNhdGNoKGVycil7XHJcbiAgICAgICRyZWplY3QuY2FsbChyZWNvcmQsIGVycik7XHJcbiAgICB9XHJcbiAgfTtcclxuICAkLm1peChQLnByb3RvdHlwZSwge1xyXG4gICAgLy8gMjUuNC41LjMgUHJvbWlzZS5wcm90b3R5cGUudGhlbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZClcclxuICAgIHRoZW46IGZ1bmN0aW9uIHRoZW4ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpe1xyXG4gICAgICB2YXIgUyA9IGFzc2VydE9iamVjdChhc3NlcnRPYmplY3QodGhpcykuY29uc3RydWN0b3IpW1NQRUNJRVNdO1xyXG4gICAgICB2YXIgcmVhY3QgPSB7XHJcbiAgICAgICAgb2s6ICAgaXNGdW5jdGlvbihvbkZ1bGZpbGxlZCkgPyBvbkZ1bGZpbGxlZCA6IHRydWUsXHJcbiAgICAgICAgZmFpbDogaXNGdW5jdGlvbihvblJlamVjdGVkKSAgPyBvblJlamVjdGVkICA6IGZhbHNlXHJcbiAgICAgIH07XHJcbiAgICAgIHZhciBwcm9taXNlID0gcmVhY3QuUCA9IG5ldyAoUyAhPSB1bmRlZmluZWQgPyBTIDogUCkoZnVuY3Rpb24ocmVzLCByZWope1xyXG4gICAgICAgIHJlYWN0LnJlcyA9IGFzc2VydEZ1bmN0aW9uKHJlcyk7XHJcbiAgICAgICAgcmVhY3QucmVqID0gYXNzZXJ0RnVuY3Rpb24ocmVqKTtcclxuICAgICAgfSk7XHJcbiAgICAgIHZhciByZWNvcmQgPSB0aGlzW1JFQ09SRF07XHJcbiAgICAgIHJlY29yZC5jLnB1c2gocmVhY3QpO1xyXG4gICAgICBpZihyZWNvcmQuYSlyZWNvcmQuYS5wdXNoKHJlYWN0KTtcclxuICAgICAgcmVjb3JkLnMgJiYgbm90aWZ5KHJlY29yZCk7XHJcbiAgICAgIHJldHVybiBwcm9taXNlO1xyXG4gICAgfSxcclxuICAgIC8vIDI1LjQuNS4xIFByb21pc2UucHJvdG90eXBlLmNhdGNoKG9uUmVqZWN0ZWQpXHJcbiAgICAnY2F0Y2gnOiBmdW5jdGlvbihvblJlamVjdGVkKXtcclxuICAgICAgcmV0dXJuIHRoaXMudGhlbih1bmRlZmluZWQsIG9uUmVqZWN0ZWQpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBleHBvcnRcclxuJGRlZigkZGVmLkcgKyAkZGVmLlcgKyAkZGVmLkYgKiAhdXNlTmF0aXZlLCB7UHJvbWlzZTogUH0pO1xyXG5jb2Yuc2V0KFAsIFBST01JU0UpO1xyXG5zcGVjaWVzKFApO1xyXG5zcGVjaWVzKCQuY29yZVtQUk9NSVNFXSk7IC8vIGZvciB3cmFwcGVyXHJcblxyXG4vLyBzdGF0aWNzXHJcbiRkZWYoJGRlZi5TICsgJGRlZi5GICogIXVzZU5hdGl2ZSwgUFJPTUlTRSwge1xyXG4gIC8vIDI1LjQuNC41IFByb21pc2UucmVqZWN0KHIpXHJcbiAgcmVqZWN0OiBmdW5jdGlvbiByZWplY3Qocil7XHJcbiAgICByZXR1cm4gbmV3IChnZXRDb25zdHJ1Y3Rvcih0aGlzKSkoZnVuY3Rpb24ocmVzLCByZWope1xyXG4gICAgICByZWoocik7XHJcbiAgICB9KTtcclxuICB9LFxyXG4gIC8vIDI1LjQuNC42IFByb21pc2UucmVzb2x2ZSh4KVxyXG4gIHJlc29sdmU6IGZ1bmN0aW9uIHJlc29sdmUoeCl7XHJcbiAgICByZXR1cm4gaXNPYmplY3QoeCkgJiYgUkVDT1JEIGluIHggJiYgJC5nZXRQcm90byh4KSA9PT0gdGhpcy5wcm90b3R5cGVcclxuICAgICAgPyB4IDogbmV3IChnZXRDb25zdHJ1Y3Rvcih0aGlzKSkoZnVuY3Rpb24ocmVzKXtcclxuICAgICAgICByZXMoeCk7XHJcbiAgICAgIH0pO1xyXG4gIH1cclxufSk7XHJcbiRkZWYoJGRlZi5TICsgJGRlZi5GICogISh1c2VOYXRpdmUgJiYgcmVxdWlyZSgnLi8kLml0ZXItZGV0ZWN0JykoZnVuY3Rpb24oaXRlcil7XHJcbiAgUC5hbGwoaXRlcilbJ2NhdGNoJ10oZnVuY3Rpb24oKXt9KTtcclxufSkpLCBQUk9NSVNFLCB7XHJcbiAgLy8gMjUuNC40LjEgUHJvbWlzZS5hbGwoaXRlcmFibGUpXHJcbiAgYWxsOiBmdW5jdGlvbiBhbGwoaXRlcmFibGUpe1xyXG4gICAgdmFyIEMgICAgICA9IGdldENvbnN0cnVjdG9yKHRoaXMpXHJcbiAgICAgICwgdmFsdWVzID0gW107XHJcbiAgICByZXR1cm4gbmV3IEMoZnVuY3Rpb24ocmVzLCByZWope1xyXG4gICAgICBmb3JPZihpdGVyYWJsZSwgZmFsc2UsIHZhbHVlcy5wdXNoLCB2YWx1ZXMpO1xyXG4gICAgICB2YXIgcmVtYWluaW5nID0gdmFsdWVzLmxlbmd0aFxyXG4gICAgICAgICwgcmVzdWx0cyAgID0gQXJyYXkocmVtYWluaW5nKTtcclxuICAgICAgaWYocmVtYWluaW5nKSQuZWFjaC5jYWxsKHZhbHVlcywgZnVuY3Rpb24ocHJvbWlzZSwgaW5kZXgpe1xyXG4gICAgICAgIEMucmVzb2x2ZShwcm9taXNlKS50aGVuKGZ1bmN0aW9uKHZhbHVlKXtcclxuICAgICAgICAgIHJlc3VsdHNbaW5kZXhdID0gdmFsdWU7XHJcbiAgICAgICAgICAtLXJlbWFpbmluZyB8fCByZXMocmVzdWx0cyk7XHJcbiAgICAgICAgfSwgcmVqKTtcclxuICAgICAgfSk7XHJcbiAgICAgIGVsc2UgcmVzKHJlc3VsdHMpO1xyXG4gICAgfSk7XHJcbiAgfSxcclxuICAvLyAyNS40LjQuNCBQcm9taXNlLnJhY2UoaXRlcmFibGUpXHJcbiAgcmFjZTogZnVuY3Rpb24gcmFjZShpdGVyYWJsZSl7XHJcbiAgICB2YXIgQyA9IGdldENvbnN0cnVjdG9yKHRoaXMpO1xyXG4gICAgcmV0dXJuIG5ldyBDKGZ1bmN0aW9uKHJlcywgcmVqKXtcclxuICAgICAgZm9yT2YoaXRlcmFibGUsIGZhbHNlLCBmdW5jdGlvbihwcm9taXNlKXtcclxuICAgICAgICBDLnJlc29sdmUocHJvbWlzZSkudGhlbihyZXMsIHJlaik7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59KTsiLCJ2YXIgJCAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsICRkZWYgICAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxyXG4gICwgc2V0UHJvdG8gID0gcmVxdWlyZSgnLi8kLnNldC1wcm90bycpXHJcbiAgLCAkaXRlciAgICAgPSByZXF1aXJlKCcuLyQuaXRlcicpXHJcbiAgLCBJVEVSQVRPUiAgPSByZXF1aXJlKCcuLyQud2tzJykoJ2l0ZXJhdG9yJylcclxuICAsIElURVIgICAgICA9IHJlcXVpcmUoJy4vJC51aWQnKS5zYWZlKCdpdGVyJylcclxuICAsIHN0ZXAgICAgICA9ICRpdGVyLnN0ZXBcclxuICAsIGFzc2VydCAgICA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKVxyXG4gICwgaXNPYmplY3QgID0gJC5pc09iamVjdFxyXG4gICwgZ2V0UHJvdG8gID0gJC5nZXRQcm90b1xyXG4gICwgJFJlZmxlY3QgID0gJC5nLlJlZmxlY3RcclxuICAsIF9hcHBseSAgICA9IEZ1bmN0aW9uLmFwcGx5XHJcbiAgLCBhc3NlcnRPYmplY3QgPSBhc3NlcnQub2JqXHJcbiAgLCBfaXNFeHRlbnNpYmxlID0gT2JqZWN0LmlzRXh0ZW5zaWJsZSB8fCAkLmlzT2JqZWN0XHJcbiAgLCBfcHJldmVudEV4dGVuc2lvbnMgPSBPYmplY3QucHJldmVudEV4dGVuc2lvbnMgfHwgJC5pdFxyXG4gIC8vIElFIFRQIGhhcyBicm9rZW4gUmVmbGVjdC5lbnVtZXJhdGVcclxuICAsIGJ1Z2d5RW51bWVyYXRlID0gISgkUmVmbGVjdCAmJiAkUmVmbGVjdC5lbnVtZXJhdGUgJiYgSVRFUkFUT1IgaW4gJFJlZmxlY3QuZW51bWVyYXRlKHt9KSk7XHJcblxyXG5mdW5jdGlvbiBFbnVtZXJhdGUoaXRlcmF0ZWQpe1xyXG4gICQuc2V0KHRoaXMsIElURVIsIHtvOiBpdGVyYXRlZCwgazogdW5kZWZpbmVkLCBpOiAwfSk7XHJcbn1cclxuJGl0ZXIuY3JlYXRlKEVudW1lcmF0ZSwgJ09iamVjdCcsIGZ1bmN0aW9uKCl7XHJcbiAgdmFyIGl0ZXIgPSB0aGlzW0lURVJdXHJcbiAgICAsIGtleXMgPSBpdGVyLmtcclxuICAgICwga2V5O1xyXG4gIGlmKGtleXMgPT0gdW5kZWZpbmVkKXtcclxuICAgIGl0ZXIuayA9IGtleXMgPSBbXTtcclxuICAgIGZvcihrZXkgaW4gaXRlci5vKWtleXMucHVzaChrZXkpO1xyXG4gIH1cclxuICBkbyB7XHJcbiAgICBpZihpdGVyLmkgPj0ga2V5cy5sZW5ndGgpcmV0dXJuIHN0ZXAoMSk7XHJcbiAgfSB3aGlsZSghKChrZXkgPSBrZXlzW2l0ZXIuaSsrXSkgaW4gaXRlci5vKSk7XHJcbiAgcmV0dXJuIHN0ZXAoMCwga2V5KTtcclxufSk7XHJcblxyXG52YXIgcmVmbGVjdCA9IHtcclxuICAvLyAyNi4xLjEgUmVmbGVjdC5hcHBseSh0YXJnZXQsIHRoaXNBcmd1bWVudCwgYXJndW1lbnRzTGlzdClcclxuICBhcHBseTogZnVuY3Rpb24gYXBwbHkodGFyZ2V0LCB0aGlzQXJndW1lbnQsIGFyZ3VtZW50c0xpc3Qpe1xyXG4gICAgcmV0dXJuIF9hcHBseS5jYWxsKHRhcmdldCwgdGhpc0FyZ3VtZW50LCBhcmd1bWVudHNMaXN0KTtcclxuICB9LFxyXG4gIC8vIDI2LjEuMiBSZWZsZWN0LmNvbnN0cnVjdCh0YXJnZXQsIGFyZ3VtZW50c0xpc3QgWywgbmV3VGFyZ2V0XSlcclxuICBjb25zdHJ1Y3Q6IGZ1bmN0aW9uIGNvbnN0cnVjdCh0YXJnZXQsIGFyZ3VtZW50c0xpc3QgLyosIG5ld1RhcmdldCovKXtcclxuICAgIHZhciBwcm90byAgICA9IGFzc2VydC5mbihhcmd1bWVudHMubGVuZ3RoIDwgMyA/IHRhcmdldCA6IGFyZ3VtZW50c1syXSkucHJvdG90eXBlXHJcbiAgICAgICwgaW5zdGFuY2UgPSAkLmNyZWF0ZShpc09iamVjdChwcm90bykgPyBwcm90byA6IE9iamVjdC5wcm90b3R5cGUpXHJcbiAgICAgICwgcmVzdWx0ICAgPSBfYXBwbHkuY2FsbCh0YXJnZXQsIGluc3RhbmNlLCBhcmd1bWVudHNMaXN0KTtcclxuICAgIHJldHVybiBpc09iamVjdChyZXN1bHQpID8gcmVzdWx0IDogaW5zdGFuY2U7XHJcbiAgfSxcclxuICAvLyAyNi4xLjMgUmVmbGVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3BlcnR5S2V5LCBhdHRyaWJ1dGVzKVxyXG4gIGRlZmluZVByb3BlcnR5OiBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3BlcnR5S2V5LCBhdHRyaWJ1dGVzKXtcclxuICAgIGFzc2VydE9iamVjdCh0YXJnZXQpO1xyXG4gICAgdHJ5IHtcclxuICAgICAgJC5zZXREZXNjKHRhcmdldCwgcHJvcGVydHlLZXksIGF0dHJpYnV0ZXMpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0gY2F0Y2goZSl7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9LFxyXG4gIC8vIDI2LjEuNCBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KHRhcmdldCwgcHJvcGVydHlLZXkpXHJcbiAgZGVsZXRlUHJvcGVydHk6IGZ1bmN0aW9uIGRlbGV0ZVByb3BlcnR5KHRhcmdldCwgcHJvcGVydHlLZXkpe1xyXG4gICAgdmFyIGRlc2MgPSAkLmdldERlc2MoYXNzZXJ0T2JqZWN0KHRhcmdldCksIHByb3BlcnR5S2V5KTtcclxuICAgIHJldHVybiBkZXNjICYmICFkZXNjLmNvbmZpZ3VyYWJsZSA/IGZhbHNlIDogZGVsZXRlIHRhcmdldFtwcm9wZXJ0eUtleV07XHJcbiAgfSxcclxuICAvLyAyNi4xLjYgUmVmbGVjdC5nZXQodGFyZ2V0LCBwcm9wZXJ0eUtleSBbLCByZWNlaXZlcl0pXHJcbiAgZ2V0OiBmdW5jdGlvbiBnZXQodGFyZ2V0LCBwcm9wZXJ0eUtleS8qLCByZWNlaXZlciovKXtcclxuICAgIHZhciByZWNlaXZlciA9IGFyZ3VtZW50cy5sZW5ndGggPCAzID8gdGFyZ2V0IDogYXJndW1lbnRzWzJdXHJcbiAgICAgICwgZGVzYyA9ICQuZ2V0RGVzYyhhc3NlcnRPYmplY3QodGFyZ2V0KSwgcHJvcGVydHlLZXkpLCBwcm90bztcclxuICAgIGlmKGRlc2MpcmV0dXJuICQuaGFzKGRlc2MsICd2YWx1ZScpXHJcbiAgICAgID8gZGVzYy52YWx1ZVxyXG4gICAgICA6IGRlc2MuZ2V0ID09PSB1bmRlZmluZWRcclxuICAgICAgICA/IHVuZGVmaW5lZFxyXG4gICAgICAgIDogZGVzYy5nZXQuY2FsbChyZWNlaXZlcik7XHJcbiAgICByZXR1cm4gaXNPYmplY3QocHJvdG8gPSBnZXRQcm90byh0YXJnZXQpKVxyXG4gICAgICA/IGdldChwcm90bywgcHJvcGVydHlLZXksIHJlY2VpdmVyKVxyXG4gICAgICA6IHVuZGVmaW5lZDtcclxuICB9LFxyXG4gIC8vIDI2LjEuNyBSZWZsZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIHByb3BlcnR5S2V5KVxyXG4gIGdldE93blByb3BlcnR5RGVzY3JpcHRvcjogZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgcHJvcGVydHlLZXkpe1xyXG4gICAgcmV0dXJuICQuZ2V0RGVzYyhhc3NlcnRPYmplY3QodGFyZ2V0KSwgcHJvcGVydHlLZXkpO1xyXG4gIH0sXHJcbiAgLy8gMjYuMS44IFJlZmxlY3QuZ2V0UHJvdG90eXBlT2YodGFyZ2V0KVxyXG4gIGdldFByb3RvdHlwZU9mOiBmdW5jdGlvbiBnZXRQcm90b3R5cGVPZih0YXJnZXQpe1xyXG4gICAgcmV0dXJuIGdldFByb3RvKGFzc2VydE9iamVjdCh0YXJnZXQpKTtcclxuICB9LFxyXG4gIC8vIDI2LjEuOSBSZWZsZWN0Lmhhcyh0YXJnZXQsIHByb3BlcnR5S2V5KVxyXG4gIGhhczogZnVuY3Rpb24gaGFzKHRhcmdldCwgcHJvcGVydHlLZXkpe1xyXG4gICAgcmV0dXJuIHByb3BlcnR5S2V5IGluIHRhcmdldDtcclxuICB9LFxyXG4gIC8vIDI2LjEuMTAgUmVmbGVjdC5pc0V4dGVuc2libGUodGFyZ2V0KVxyXG4gIGlzRXh0ZW5zaWJsZTogZnVuY3Rpb24gaXNFeHRlbnNpYmxlKHRhcmdldCl7XHJcbiAgICByZXR1cm4gX2lzRXh0ZW5zaWJsZShhc3NlcnRPYmplY3QodGFyZ2V0KSk7XHJcbiAgfSxcclxuICAvLyAyNi4xLjExIFJlZmxlY3Qub3duS2V5cyh0YXJnZXQpXHJcbiAgb3duS2V5czogcmVxdWlyZSgnLi8kLm93bi1rZXlzJyksXHJcbiAgLy8gMjYuMS4xMiBSZWZsZWN0LnByZXZlbnRFeHRlbnNpb25zKHRhcmdldClcclxuICBwcmV2ZW50RXh0ZW5zaW9uczogZnVuY3Rpb24gcHJldmVudEV4dGVuc2lvbnModGFyZ2V0KXtcclxuICAgIGFzc2VydE9iamVjdCh0YXJnZXQpO1xyXG4gICAgdHJ5IHtcclxuICAgICAgX3ByZXZlbnRFeHRlbnNpb25zKHRhcmdldCk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBjYXRjaChlKXtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgLy8gMjYuMS4xMyBSZWZsZWN0LnNldCh0YXJnZXQsIHByb3BlcnR5S2V5LCBWIFssIHJlY2VpdmVyXSlcclxuICBzZXQ6IGZ1bmN0aW9uIHNldCh0YXJnZXQsIHByb3BlcnR5S2V5LCBWLyosIHJlY2VpdmVyKi8pe1xyXG4gICAgdmFyIHJlY2VpdmVyID0gYXJndW1lbnRzLmxlbmd0aCA8IDQgPyB0YXJnZXQgOiBhcmd1bWVudHNbM11cclxuICAgICAgLCBvd25EZXNjICA9ICQuZ2V0RGVzYyhhc3NlcnRPYmplY3QodGFyZ2V0KSwgcHJvcGVydHlLZXkpXHJcbiAgICAgICwgZXhpc3RpbmdEZXNjcmlwdG9yLCBwcm90bztcclxuICAgIGlmKCFvd25EZXNjKXtcclxuICAgICAgaWYoaXNPYmplY3QocHJvdG8gPSBnZXRQcm90byh0YXJnZXQpKSl7XHJcbiAgICAgICAgcmV0dXJuIHNldChwcm90bywgcHJvcGVydHlLZXksIFYsIHJlY2VpdmVyKTtcclxuICAgICAgfVxyXG4gICAgICBvd25EZXNjID0gJC5kZXNjKDApO1xyXG4gICAgfVxyXG4gICAgaWYoJC5oYXMob3duRGVzYywgJ3ZhbHVlJykpe1xyXG4gICAgICBpZihvd25EZXNjLndyaXRhYmxlID09PSBmYWxzZSB8fCAhaXNPYmplY3QocmVjZWl2ZXIpKXJldHVybiBmYWxzZTtcclxuICAgICAgZXhpc3RpbmdEZXNjcmlwdG9yID0gJC5nZXREZXNjKHJlY2VpdmVyLCBwcm9wZXJ0eUtleSkgfHwgJC5kZXNjKDApO1xyXG4gICAgICBleGlzdGluZ0Rlc2NyaXB0b3IudmFsdWUgPSBWO1xyXG4gICAgICAkLnNldERlc2MocmVjZWl2ZXIsIHByb3BlcnR5S2V5LCBleGlzdGluZ0Rlc2NyaXB0b3IpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBvd25EZXNjLnNldCA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiAob3duRGVzYy5zZXQuY2FsbChyZWNlaXZlciwgViksIHRydWUpO1xyXG4gIH1cclxufTtcclxuLy8gMjYuMS4xNCBSZWZsZWN0LnNldFByb3RvdHlwZU9mKHRhcmdldCwgcHJvdG8pXHJcbmlmKHNldFByb3RvKXJlZmxlY3Quc2V0UHJvdG90eXBlT2YgPSBmdW5jdGlvbiBzZXRQcm90b3R5cGVPZih0YXJnZXQsIHByb3RvKXtcclxuICBzZXRQcm90by5jaGVjayh0YXJnZXQsIHByb3RvKTtcclxuICB0cnkge1xyXG4gICAgc2V0UHJvdG8uc2V0KHRhcmdldCwgcHJvdG8pO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfSBjYXRjaChlKXtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbn07XHJcblxyXG4kZGVmKCRkZWYuRywge1JlZmxlY3Q6IHt9fSk7XHJcblxyXG4kZGVmKCRkZWYuUyArICRkZWYuRiAqIGJ1Z2d5RW51bWVyYXRlLCAnUmVmbGVjdCcsIHtcclxuICAvLyAyNi4xLjUgUmVmbGVjdC5lbnVtZXJhdGUodGFyZ2V0KVxyXG4gIGVudW1lcmF0ZTogZnVuY3Rpb24gZW51bWVyYXRlKHRhcmdldCl7XHJcbiAgICByZXR1cm4gbmV3IEVudW1lcmF0ZShhc3NlcnRPYmplY3QodGFyZ2V0KSk7XHJcbiAgfVxyXG59KTtcclxuXHJcbiRkZWYoJGRlZi5TLCAnUmVmbGVjdCcsIHJlZmxlY3QpOyIsInZhciAkICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIGNvZiAgICAgPSByZXF1aXJlKCcuLyQuY29mJylcclxuICAsICRSZWdFeHAgPSAkLmcuUmVnRXhwXHJcbiAgLCBCYXNlICAgID0gJFJlZ0V4cFxyXG4gICwgcHJvdG8gICA9ICRSZWdFeHAucHJvdG90eXBlXHJcbiAgLCByZSAgICAgID0gL2EvZ1xyXG4gIC8vIFwibmV3XCIgY3JlYXRlcyBhIG5ldyBvYmplY3RcclxuICAsIENPUlJFQ1RfTkVXID0gbmV3ICRSZWdFeHAocmUpICE9PSByZVxyXG4gIC8vIFJlZ0V4cCBhbGxvd3MgYSByZWdleCB3aXRoIGZsYWdzIGFzIHRoZSBwYXR0ZXJuXHJcbiAgLCBBTExPV1NfUkVfV0lUSF9GTEFHUyA9IGZ1bmN0aW9uKCl7XHJcbiAgICB0cnkge1xyXG4gICAgICByZXR1cm4gJFJlZ0V4cChyZSwgJ2knKSA9PSAnL2EvaSc7XHJcbiAgICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XHJcbiAgfSgpO1xyXG5pZigkLkZXICYmICQuREVTQyl7XHJcbiAgaWYoIUNPUlJFQ1RfTkVXIHx8ICFBTExPV1NfUkVfV0lUSF9GTEFHUyl7XHJcbiAgICAkUmVnRXhwID0gZnVuY3Rpb24gUmVnRXhwKHBhdHRlcm4sIGZsYWdzKXtcclxuICAgICAgdmFyIHBhdHRlcm5Jc1JlZ0V4cCAgPSBjb2YocGF0dGVybikgPT0gJ1JlZ0V4cCdcclxuICAgICAgICAsIGZsYWdzSXNVbmRlZmluZWQgPSBmbGFncyA9PT0gdW5kZWZpbmVkO1xyXG4gICAgICBpZighKHRoaXMgaW5zdGFuY2VvZiAkUmVnRXhwKSAmJiBwYXR0ZXJuSXNSZWdFeHAgJiYgZmxhZ3NJc1VuZGVmaW5lZClyZXR1cm4gcGF0dGVybjtcclxuICAgICAgcmV0dXJuIENPUlJFQ1RfTkVXXHJcbiAgICAgICAgPyBuZXcgQmFzZShwYXR0ZXJuSXNSZWdFeHAgJiYgIWZsYWdzSXNVbmRlZmluZWQgPyBwYXR0ZXJuLnNvdXJjZSA6IHBhdHRlcm4sIGZsYWdzKVxyXG4gICAgICAgIDogbmV3IEJhc2UocGF0dGVybklzUmVnRXhwID8gcGF0dGVybi5zb3VyY2UgOiBwYXR0ZXJuXHJcbiAgICAgICAgICAsIHBhdHRlcm5Jc1JlZ0V4cCAmJiBmbGFnc0lzVW5kZWZpbmVkID8gcGF0dGVybi5mbGFncyA6IGZsYWdzKTtcclxuICAgIH07XHJcbiAgICAkLmVhY2guY2FsbCgkLmdldE5hbWVzKEJhc2UpLCBmdW5jdGlvbihrZXkpe1xyXG4gICAgICBrZXkgaW4gJFJlZ0V4cCB8fCAkLnNldERlc2MoJFJlZ0V4cCwga2V5LCB7XHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGdldDogZnVuY3Rpb24oKXsgcmV0dXJuIEJhc2Vba2V5XTsgfSxcclxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKGl0KXsgQmFzZVtrZXldID0gaXQ7IH1cclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICAgIHByb3RvLmNvbnN0cnVjdG9yID0gJFJlZ0V4cDtcclxuICAgICRSZWdFeHAucHJvdG90eXBlID0gcHJvdG87XHJcbiAgICAkLmhpZGUoJC5nLCAnUmVnRXhwJywgJFJlZ0V4cCk7XHJcbiAgfVxyXG4gIC8vIDIxLjIuNS4zIGdldCBSZWdFeHAucHJvdG90eXBlLmZsYWdzKClcclxuICBpZigvLi9nLmZsYWdzICE9ICdnJykkLnNldERlc2MocHJvdG8sICdmbGFncycsIHtcclxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuICAgIGdldDogcmVxdWlyZSgnLi8kLnJlcGxhY2VyJykoL14uKlxcLyhcXHcqKSQvLCAnJDEnKVxyXG4gIH0pO1xyXG59XHJcbnJlcXVpcmUoJy4vJC5zcGVjaWVzJykoJFJlZ0V4cCk7IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgc3Ryb25nID0gcmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24tc3Ryb25nJyk7XHJcblxyXG4vLyAyMy4yIFNldCBPYmplY3RzXHJcbnJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uJykoJ1NldCcsIHtcclxuICAvLyAyMy4yLjMuMSBTZXQucHJvdG90eXBlLmFkZCh2YWx1ZSlcclxuICBhZGQ6IGZ1bmN0aW9uIGFkZCh2YWx1ZSl7XHJcbiAgICByZXR1cm4gc3Ryb25nLmRlZih0aGlzLCB2YWx1ZSA9IHZhbHVlID09PSAwID8gMCA6IHZhbHVlLCB2YWx1ZSk7XHJcbiAgfVxyXG59LCBzdHJvbmcpOyIsIid1c2Ugc3RyaWN0JztcclxudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsICRhdCAgPSByZXF1aXJlKCcuLyQuc3RyaW5nLWF0JykoZmFsc2UpO1xyXG4kZGVmKCRkZWYuUCwgJ1N0cmluZycsIHtcclxuICAvLyAyMS4xLjMuMyBTdHJpbmcucHJvdG90eXBlLmNvZGVQb2ludEF0KHBvcylcclxuICBjb2RlUG9pbnRBdDogZnVuY3Rpb24gY29kZVBvaW50QXQocG9zKXtcclxuICAgIHJldHVybiAkYXQodGhpcywgcG9zKTtcclxuICB9XHJcbn0pOyIsIid1c2Ugc3RyaWN0JztcclxudmFyICQgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgY29mICA9IHJlcXVpcmUoJy4vJC5jb2YnKVxyXG4gICwgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKVxyXG4gICwgdG9MZW5ndGggPSAkLnRvTGVuZ3RoO1xyXG5cclxuLy8gc2hvdWxkIHRocm93IGVycm9yIG9uIHJlZ2V4XHJcbiRkZWYoJGRlZi5QICsgJGRlZi5GICogIXJlcXVpcmUoJy4vJC50aHJvd3MnKShmdW5jdGlvbigpeyAncScuZW5kc1dpdGgoLy4vKTsgfSksICdTdHJpbmcnLCB7XHJcbiAgLy8gMjEuMS4zLjYgU3RyaW5nLnByb3RvdHlwZS5lbmRzV2l0aChzZWFyY2hTdHJpbmcgWywgZW5kUG9zaXRpb25dKVxyXG4gIGVuZHNXaXRoOiBmdW5jdGlvbiBlbmRzV2l0aChzZWFyY2hTdHJpbmcgLyosIGVuZFBvc2l0aW9uID0gQGxlbmd0aCAqLyl7XHJcbiAgICBpZihjb2Yoc2VhcmNoU3RyaW5nKSA9PSAnUmVnRXhwJyl0aHJvdyBUeXBlRXJyb3IoKTtcclxuICAgIHZhciB0aGF0ID0gU3RyaW5nKCQuYXNzZXJ0RGVmaW5lZCh0aGlzKSlcclxuICAgICAgLCBlbmRQb3NpdGlvbiA9IGFyZ3VtZW50c1sxXVxyXG4gICAgICAsIGxlbiA9IHRvTGVuZ3RoKHRoYXQubGVuZ3RoKVxyXG4gICAgICAsIGVuZCA9IGVuZFBvc2l0aW9uID09PSB1bmRlZmluZWQgPyBsZW4gOiBNYXRoLm1pbih0b0xlbmd0aChlbmRQb3NpdGlvbiksIGxlbik7XHJcbiAgICBzZWFyY2hTdHJpbmcgKz0gJyc7XHJcbiAgICByZXR1cm4gdGhhdC5zbGljZShlbmQgLSBzZWFyY2hTdHJpbmcubGVuZ3RoLCBlbmQpID09PSBzZWFyY2hTdHJpbmc7XHJcbiAgfVxyXG59KTsiLCJ2YXIgJGRlZiAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxyXG4gICwgdG9JbmRleCA9IHJlcXVpcmUoJy4vJCcpLnRvSW5kZXhcclxuICAsIGZyb21DaGFyQ29kZSA9IFN0cmluZy5mcm9tQ2hhckNvZGVcclxuICAsICRmcm9tQ29kZVBvaW50ID0gU3RyaW5nLmZyb21Db2RlUG9pbnQ7XHJcblxyXG4vLyBsZW5ndGggc2hvdWxkIGJlIDEsIG9sZCBGRiBwcm9ibGVtXHJcbiRkZWYoJGRlZi5TICsgJGRlZi5GICogKCEhJGZyb21Db2RlUG9pbnQgJiYgJGZyb21Db2RlUG9pbnQubGVuZ3RoICE9IDEpLCAnU3RyaW5nJywge1xyXG4gIC8vIDIxLjEuMi4yIFN0cmluZy5mcm9tQ29kZVBvaW50KC4uLmNvZGVQb2ludHMpXHJcbiAgZnJvbUNvZGVQb2ludDogZnVuY3Rpb24gZnJvbUNvZGVQb2ludCh4KXsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gICAgdmFyIHJlcyA9IFtdXHJcbiAgICAgICwgbGVuID0gYXJndW1lbnRzLmxlbmd0aFxyXG4gICAgICAsIGkgICA9IDBcclxuICAgICAgLCBjb2RlO1xyXG4gICAgd2hpbGUobGVuID4gaSl7XHJcbiAgICAgIGNvZGUgPSArYXJndW1lbnRzW2krK107XHJcbiAgICAgIGlmKHRvSW5kZXgoY29kZSwgMHgxMGZmZmYpICE9PSBjb2RlKXRocm93IFJhbmdlRXJyb3IoY29kZSArICcgaXMgbm90IGEgdmFsaWQgY29kZSBwb2ludCcpO1xyXG4gICAgICByZXMucHVzaChjb2RlIDwgMHgxMDAwMFxyXG4gICAgICAgID8gZnJvbUNoYXJDb2RlKGNvZGUpXHJcbiAgICAgICAgOiBmcm9tQ2hhckNvZGUoKChjb2RlIC09IDB4MTAwMDApID4+IDEwKSArIDB4ZDgwMCwgY29kZSAlIDB4NDAwICsgMHhkYzAwKVxyXG4gICAgICApO1xyXG4gICAgfSByZXR1cm4gcmVzLmpvaW4oJycpO1xyXG4gIH1cclxufSk7IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgJCAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBjb2YgID0gcmVxdWlyZSgnLi8kLmNvZicpXHJcbiAgLCAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xyXG5cclxuJGRlZigkZGVmLlAsICdTdHJpbmcnLCB7XHJcbiAgLy8gMjEuMS4zLjcgU3RyaW5nLnByb3RvdHlwZS5pbmNsdWRlcyhzZWFyY2hTdHJpbmcsIHBvc2l0aW9uID0gMClcclxuICBpbmNsdWRlczogZnVuY3Rpb24gaW5jbHVkZXMoc2VhcmNoU3RyaW5nIC8qLCBwb3NpdGlvbiA9IDAgKi8pe1xyXG4gICAgaWYoY29mKHNlYXJjaFN0cmluZykgPT0gJ1JlZ0V4cCcpdGhyb3cgVHlwZUVycm9yKCk7XHJcbiAgICByZXR1cm4gISF+U3RyaW5nKCQuYXNzZXJ0RGVmaW5lZCh0aGlzKSkuaW5kZXhPZihzZWFyY2hTdHJpbmcsIGFyZ3VtZW50c1sxXSk7XHJcbiAgfVxyXG59KTsiLCJ2YXIgc2V0ICAgPSByZXF1aXJlKCcuLyQnKS5zZXRcclxuICAsICRhdCAgID0gcmVxdWlyZSgnLi8kLnN0cmluZy1hdCcpKHRydWUpXHJcbiAgLCBJVEVSICA9IHJlcXVpcmUoJy4vJC51aWQnKS5zYWZlKCdpdGVyJylcclxuICAsICRpdGVyID0gcmVxdWlyZSgnLi8kLml0ZXInKVxyXG4gICwgc3RlcCAgPSAkaXRlci5zdGVwO1xyXG5cclxuLy8gMjEuMS4zLjI3IFN0cmluZy5wcm90b3R5cGVbQEBpdGVyYXRvcl0oKVxyXG5yZXF1aXJlKCcuLyQuaXRlci1kZWZpbmUnKShTdHJpbmcsICdTdHJpbmcnLCBmdW5jdGlvbihpdGVyYXRlZCl7XHJcbiAgc2V0KHRoaXMsIElURVIsIHtvOiBTdHJpbmcoaXRlcmF0ZWQpLCBpOiAwfSk7XHJcbi8vIDIxLjEuNS4yLjEgJVN0cmluZ0l0ZXJhdG9yUHJvdG90eXBlJS5uZXh0KClcclxufSwgZnVuY3Rpb24oKXtcclxuICB2YXIgaXRlciAgPSB0aGlzW0lURVJdXHJcbiAgICAsIE8gICAgID0gaXRlci5vXHJcbiAgICAsIGluZGV4ID0gaXRlci5pXHJcbiAgICAsIHBvaW50O1xyXG4gIGlmKGluZGV4ID49IE8ubGVuZ3RoKXJldHVybiBzdGVwKDEpO1xyXG4gIHBvaW50ID0gJGF0KE8sIGluZGV4KTtcclxuICBpdGVyLmkgKz0gcG9pbnQubGVuZ3RoO1xyXG4gIHJldHVybiBzdGVwKDAsIHBvaW50KTtcclxufSk7IiwidmFyICQgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcclxuXHJcbiRkZWYoJGRlZi5TLCAnU3RyaW5nJywge1xyXG4gIC8vIDIxLjEuMi40IFN0cmluZy5yYXcoY2FsbFNpdGUsIC4uLnN1YnN0aXR1dGlvbnMpXHJcbiAgcmF3OiBmdW5jdGlvbiByYXcoY2FsbFNpdGUpe1xyXG4gICAgdmFyIHRwbCA9ICQudG9PYmplY3QoY2FsbFNpdGUucmF3KVxyXG4gICAgICAsIGxlbiA9ICQudG9MZW5ndGgodHBsLmxlbmd0aClcclxuICAgICAgLCBzbG4gPSBhcmd1bWVudHMubGVuZ3RoXHJcbiAgICAgICwgcmVzID0gW11cclxuICAgICAgLCBpICAgPSAwO1xyXG4gICAgd2hpbGUobGVuID4gaSl7XHJcbiAgICAgIHJlcy5wdXNoKFN0cmluZyh0cGxbaSsrXSkpO1xyXG4gICAgICBpZihpIDwgc2xuKXJlcy5wdXNoKFN0cmluZyhhcmd1bWVudHNbaV0pKTtcclxuICAgIH0gcmV0dXJuIHJlcy5qb2luKCcnKTtcclxuICB9XHJcbn0pOyIsInZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xyXG5cclxuJGRlZigkZGVmLlAsICdTdHJpbmcnLCB7XHJcbiAgLy8gMjEuMS4zLjEzIFN0cmluZy5wcm90b3R5cGUucmVwZWF0KGNvdW50KVxyXG4gIHJlcGVhdDogcmVxdWlyZSgnLi8kLnN0cmluZy1yZXBlYXQnKVxyXG59KTsiLCIndXNlIHN0cmljdCc7XHJcbnZhciAkICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIGNvZiAgPSByZXF1aXJlKCcuLyQuY29mJylcclxuICAsICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XHJcblxyXG4vLyBzaG91bGQgdGhyb3cgZXJyb3Igb24gcmVnZXhcclxuJGRlZigkZGVmLlAgKyAkZGVmLkYgKiAhcmVxdWlyZSgnLi8kLnRocm93cycpKGZ1bmN0aW9uKCl7ICdxJy5zdGFydHNXaXRoKC8uLyk7IH0pLCAnU3RyaW5nJywge1xyXG4gIC8vIDIxLjEuMy4xOCBTdHJpbmcucHJvdG90eXBlLnN0YXJ0c1dpdGgoc2VhcmNoU3RyaW5nIFssIHBvc2l0aW9uIF0pXHJcbiAgc3RhcnRzV2l0aDogZnVuY3Rpb24gc3RhcnRzV2l0aChzZWFyY2hTdHJpbmcgLyosIHBvc2l0aW9uID0gMCAqLyl7XHJcbiAgICBpZihjb2Yoc2VhcmNoU3RyaW5nKSA9PSAnUmVnRXhwJyl0aHJvdyBUeXBlRXJyb3IoKTtcclxuICAgIHZhciB0aGF0ICA9IFN0cmluZygkLmFzc2VydERlZmluZWQodGhpcykpXHJcbiAgICAgICwgaW5kZXggPSAkLnRvTGVuZ3RoKE1hdGgubWluKGFyZ3VtZW50c1sxXSwgdGhhdC5sZW5ndGgpKTtcclxuICAgIHNlYXJjaFN0cmluZyArPSAnJztcclxuICAgIHJldHVybiB0aGF0LnNsaWNlKGluZGV4LCBpbmRleCArIHNlYXJjaFN0cmluZy5sZW5ndGgpID09PSBzZWFyY2hTdHJpbmc7XHJcbiAgfVxyXG59KTsiLCIndXNlIHN0cmljdCc7XHJcbi8vIEVDTUFTY3JpcHQgNiBzeW1ib2xzIHNoaW1cclxudmFyICQgICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIHNldFRhZyAgID0gcmVxdWlyZSgnLi8kLmNvZicpLnNldFxyXG4gICwgdWlkICAgICAgPSByZXF1aXJlKCcuLyQudWlkJylcclxuICAsICRkZWYgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCBrZXlPZiAgICA9IHJlcXVpcmUoJy4vJC5rZXlvZicpXHJcbiAgLCBlbnVtS2V5cyA9IHJlcXVpcmUoJy4vJC5lbnVtLWtleXMnKVxyXG4gICwgYXNzZXJ0T2JqZWN0ID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpLm9ialxyXG4gICwgaGFzICAgICAgPSAkLmhhc1xyXG4gICwgJGNyZWF0ZSAgPSAkLmNyZWF0ZVxyXG4gICwgZ2V0RGVzYyAgPSAkLmdldERlc2NcclxuICAsIHNldERlc2MgID0gJC5zZXREZXNjXHJcbiAgLCBkZXNjICAgICA9ICQuZGVzY1xyXG4gICwgZ2V0TmFtZXMgPSAkLmdldE5hbWVzXHJcbiAgLCB0b09iamVjdCA9ICQudG9PYmplY3RcclxuICAsICRTeW1ib2wgID0gJC5nLlN5bWJvbFxyXG4gICwgc2V0dGVyICAgPSBmYWxzZVxyXG4gICwgVEFHICAgICAgPSB1aWQoJ3RhZycpXHJcbiAgLCBISURERU4gICA9IHVpZCgnaGlkZGVuJylcclxuICAsIFN5bWJvbFJlZ2lzdHJ5ID0ge31cclxuICAsIEFsbFN5bWJvbHMgPSB7fVxyXG4gICwgdXNlTmF0aXZlID0gJC5pc0Z1bmN0aW9uKCRTeW1ib2wpO1xyXG5cclxuZnVuY3Rpb24gd3JhcCh0YWcpe1xyXG4gIHZhciBzeW0gPSBBbGxTeW1ib2xzW3RhZ10gPSAkLnNldCgkY3JlYXRlKCRTeW1ib2wucHJvdG90eXBlKSwgVEFHLCB0YWcpO1xyXG4gICQuREVTQyAmJiBzZXR0ZXIgJiYgc2V0RGVzYyhPYmplY3QucHJvdG90eXBlLCB0YWcsIHtcclxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuICAgIHNldDogZnVuY3Rpb24odmFsdWUpe1xyXG4gICAgICBpZihoYXModGhpcywgSElEREVOKSAmJiBoYXModGhpc1tISURERU5dLCB0YWcpKXRoaXNbSElEREVOXVt0YWddID0gZmFsc2U7XHJcbiAgICAgIHNldERlc2ModGhpcywgdGFnLCBkZXNjKDEsIHZhbHVlKSk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbiAgcmV0dXJuIHN5bTtcclxufVxyXG5cclxuZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoaXQsIGtleSwgRCl7XHJcbiAgaWYoRCAmJiBoYXMoQWxsU3ltYm9scywga2V5KSl7XHJcbiAgICBpZighRC5lbnVtZXJhYmxlKXtcclxuICAgICAgaWYoIWhhcyhpdCwgSElEREVOKSlzZXREZXNjKGl0LCBISURERU4sIGRlc2MoMSwge30pKTtcclxuICAgICAgaXRbSElEREVOXVtrZXldID0gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmKGhhcyhpdCwgSElEREVOKSAmJiBpdFtISURERU5dW2tleV0paXRbSElEREVOXVtrZXldID0gZmFsc2U7XHJcbiAgICAgIEQuZW51bWVyYWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH0gcmV0dXJuIHNldERlc2MoaXQsIGtleSwgRCk7XHJcbn1cclxuZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyhpdCwgUCl7XHJcbiAgYXNzZXJ0T2JqZWN0KGl0KTtcclxuICB2YXIga2V5cyA9IGVudW1LZXlzKFAgPSB0b09iamVjdChQKSlcclxuICAgICwgaSAgICA9IDBcclxuICAgICwgbCA9IGtleXMubGVuZ3RoXHJcbiAgICAsIGtleTtcclxuICB3aGlsZShsID4gaSlkZWZpbmVQcm9wZXJ0eShpdCwga2V5ID0ga2V5c1tpKytdLCBQW2tleV0pO1xyXG4gIHJldHVybiBpdDtcclxufVxyXG5mdW5jdGlvbiBjcmVhdGUoaXQsIFApe1xyXG4gIHJldHVybiBQID09PSB1bmRlZmluZWQgPyAkY3JlYXRlKGl0KSA6IGRlZmluZVByb3BlcnRpZXMoJGNyZWF0ZShpdCksIFApO1xyXG59XHJcbmZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihpdCwga2V5KXtcclxuICB2YXIgRCA9IGdldERlc2MoaXQgPSB0b09iamVjdChpdCksIGtleSk7XHJcbiAgaWYoRCAmJiBoYXMoQWxsU3ltYm9scywga2V5KSAmJiAhKGhhcyhpdCwgSElEREVOKSAmJiBpdFtISURERU5dW2tleV0pKUQuZW51bWVyYWJsZSA9IHRydWU7XHJcbiAgcmV0dXJuIEQ7XHJcbn1cclxuZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhpdCl7XHJcbiAgdmFyIG5hbWVzICA9IGdldE5hbWVzKHRvT2JqZWN0KGl0KSlcclxuICAgICwgcmVzdWx0ID0gW11cclxuICAgICwgaSAgICAgID0gMFxyXG4gICAgLCBrZXk7XHJcbiAgd2hpbGUobmFtZXMubGVuZ3RoID4gaSlpZighaGFzKEFsbFN5bWJvbHMsIGtleSA9IG5hbWVzW2krK10pICYmIGtleSAhPSBISURERU4pcmVzdWx0LnB1c2goa2V5KTtcclxuICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbmZ1bmN0aW9uIGdldE93blByb3BlcnR5U3ltYm9scyhpdCl7XHJcbiAgdmFyIG5hbWVzICA9IGdldE5hbWVzKHRvT2JqZWN0KGl0KSlcclxuICAgICwgcmVzdWx0ID0gW11cclxuICAgICwgaSAgICAgID0gMFxyXG4gICAgLCBrZXk7XHJcbiAgd2hpbGUobmFtZXMubGVuZ3RoID4gaSlpZihoYXMoQWxsU3ltYm9scywga2V5ID0gbmFtZXNbaSsrXSkpcmVzdWx0LnB1c2goQWxsU3ltYm9sc1trZXldKTtcclxuICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG4vLyAxOS40LjEuMSBTeW1ib2woW2Rlc2NyaXB0aW9uXSlcclxuaWYoIXVzZU5hdGl2ZSl7XHJcbiAgJFN5bWJvbCA9IGZ1bmN0aW9uIFN5bWJvbChkZXNjcmlwdGlvbil7XHJcbiAgICBpZih0aGlzIGluc3RhbmNlb2YgJFN5bWJvbCl0aHJvdyBUeXBlRXJyb3IoJ1N5bWJvbCBpcyBub3QgYSBjb25zdHJ1Y3RvcicpO1xyXG4gICAgcmV0dXJuIHdyYXAodWlkKGRlc2NyaXB0aW9uKSk7XHJcbiAgfTtcclxuICAkLmhpZGUoJFN5bWJvbC5wcm90b3R5cGUsICd0b1N0cmluZycsIGZ1bmN0aW9uKCl7XHJcbiAgICByZXR1cm4gdGhpc1tUQUddO1xyXG4gIH0pO1xyXG5cclxuICAkLmNyZWF0ZSAgICAgPSBjcmVhdGU7XHJcbiAgJC5zZXREZXNjICAgID0gZGVmaW5lUHJvcGVydHk7XHJcbiAgJC5nZXREZXNjICAgID0gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xyXG4gICQuc2V0RGVzY3MgICA9IGRlZmluZVByb3BlcnRpZXM7XHJcbiAgJC5nZXROYW1lcyAgID0gZ2V0T3duUHJvcGVydHlOYW1lcztcclxuICAkLmdldFN5bWJvbHMgPSBnZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XHJcbn1cclxuXHJcbnZhciBzeW1ib2xTdGF0aWNzID0ge1xyXG4gIC8vIDE5LjQuMi4xIFN5bWJvbC5mb3Ioa2V5KVxyXG4gICdmb3InOiBmdW5jdGlvbihrZXkpe1xyXG4gICAgcmV0dXJuIGhhcyhTeW1ib2xSZWdpc3RyeSwga2V5ICs9ICcnKVxyXG4gICAgICA/IFN5bWJvbFJlZ2lzdHJ5W2tleV1cclxuICAgICAgOiBTeW1ib2xSZWdpc3RyeVtrZXldID0gJFN5bWJvbChrZXkpO1xyXG4gIH0sXHJcbiAgLy8gMTkuNC4yLjUgU3ltYm9sLmtleUZvcihzeW0pXHJcbiAga2V5Rm9yOiBmdW5jdGlvbiBrZXlGb3Ioa2V5KXtcclxuICAgIHJldHVybiBrZXlPZihTeW1ib2xSZWdpc3RyeSwga2V5KTtcclxuICB9LFxyXG4gIHVzZVNldHRlcjogZnVuY3Rpb24oKXsgc2V0dGVyID0gdHJ1ZTsgfSxcclxuICB1c2VTaW1wbGU6IGZ1bmN0aW9uKCl7IHNldHRlciA9IGZhbHNlOyB9XHJcbn07XHJcbi8vIDE5LjQuMi4yIFN5bWJvbC5oYXNJbnN0YW5jZVxyXG4vLyAxOS40LjIuMyBTeW1ib2wuaXNDb25jYXRTcHJlYWRhYmxlXHJcbi8vIDE5LjQuMi40IFN5bWJvbC5pdGVyYXRvclxyXG4vLyAxOS40LjIuNiBTeW1ib2wubWF0Y2hcclxuLy8gMTkuNC4yLjggU3ltYm9sLnJlcGxhY2VcclxuLy8gMTkuNC4yLjkgU3ltYm9sLnNlYXJjaFxyXG4vLyAxOS40LjIuMTAgU3ltYm9sLnNwZWNpZXNcclxuLy8gMTkuNC4yLjExIFN5bWJvbC5zcGxpdFxyXG4vLyAxOS40LjIuMTIgU3ltYm9sLnRvUHJpbWl0aXZlXHJcbi8vIDE5LjQuMi4xMyBTeW1ib2wudG9TdHJpbmdUYWdcclxuLy8gMTkuNC4yLjE0IFN5bWJvbC51bnNjb3BhYmxlc1xyXG4kLmVhY2guY2FsbCgoXHJcbiAgICAnaGFzSW5zdGFuY2UsaXNDb25jYXRTcHJlYWRhYmxlLGl0ZXJhdG9yLG1hdGNoLHJlcGxhY2Usc2VhcmNoLCcgK1xyXG4gICAgJ3NwZWNpZXMsc3BsaXQsdG9QcmltaXRpdmUsdG9TdHJpbmdUYWcsdW5zY29wYWJsZXMnXHJcbiAgKS5zcGxpdCgnLCcpLCBmdW5jdGlvbihpdCl7XHJcbiAgICB2YXIgc3ltID0gcmVxdWlyZSgnLi8kLndrcycpKGl0KTtcclxuICAgIHN5bWJvbFN0YXRpY3NbaXRdID0gdXNlTmF0aXZlID8gc3ltIDogd3JhcChzeW0pO1xyXG4gIH1cclxuKTtcclxuXHJcbnNldHRlciA9IHRydWU7XHJcblxyXG4kZGVmKCRkZWYuRyArICRkZWYuVywge1N5bWJvbDogJFN5bWJvbH0pO1xyXG5cclxuJGRlZigkZGVmLlMsICdTeW1ib2wnLCBzeW1ib2xTdGF0aWNzKTtcclxuXHJcbiRkZWYoJGRlZi5TICsgJGRlZi5GICogIXVzZU5hdGl2ZSwgJ09iamVjdCcsIHtcclxuICAvLyAxOS4xLjIuMiBPYmplY3QuY3JlYXRlKE8gWywgUHJvcGVydGllc10pXHJcbiAgY3JlYXRlOiBjcmVhdGUsXHJcbiAgLy8gMTkuMS4yLjQgT2JqZWN0LmRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpXHJcbiAgZGVmaW5lUHJvcGVydHk6IGRlZmluZVByb3BlcnR5LFxyXG4gIC8vIDE5LjEuMi4zIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKE8sIFByb3BlcnRpZXMpXHJcbiAgZGVmaW5lUHJvcGVydGllczogZGVmaW5lUHJvcGVydGllcyxcclxuICAvLyAxOS4xLjIuNiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApXHJcbiAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yOiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IsXHJcbiAgLy8gMTkuMS4yLjcgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoTylcclxuICBnZXRPd25Qcm9wZXJ0eU5hbWVzOiBnZXRPd25Qcm9wZXJ0eU5hbWVzLFxyXG4gIC8vIDE5LjEuMi44IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoTylcclxuICBnZXRPd25Qcm9wZXJ0eVN5bWJvbHM6IGdldE93blByb3BlcnR5U3ltYm9sc1xyXG59KTtcclxuXHJcbi8vIDE5LjQuMy41IFN5bWJvbC5wcm90b3R5cGVbQEB0b1N0cmluZ1RhZ11cclxuc2V0VGFnKCRTeW1ib2wsICdTeW1ib2wnKTtcclxuLy8gMjAuMi4xLjkgTWF0aFtAQHRvU3RyaW5nVGFnXVxyXG5zZXRUYWcoTWF0aCwgJ01hdGgnLCB0cnVlKTtcclxuLy8gMjQuMy4zIEpTT05bQEB0b1N0cmluZ1RhZ11cclxuc2V0VGFnKCQuZy5KU09OLCAnSlNPTicsIHRydWUpOyIsIid1c2Ugc3RyaWN0JztcclxudmFyICQgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCB3ZWFrICAgICAgPSByZXF1aXJlKCcuLyQuY29sbGVjdGlvbi13ZWFrJylcclxuICAsIGxlYWtTdG9yZSA9IHdlYWsubGVha1N0b3JlXHJcbiAgLCBJRCAgICAgICAgPSB3ZWFrLklEXHJcbiAgLCBXRUFLICAgICAgPSB3ZWFrLldFQUtcclxuICAsIGhhcyAgICAgICA9ICQuaGFzXHJcbiAgLCBpc09iamVjdCAgPSAkLmlzT2JqZWN0XHJcbiAgLCBpc0Zyb3plbiAgPSBPYmplY3QuaXNGcm96ZW4gfHwgJC5jb3JlLk9iamVjdC5pc0Zyb3plblxyXG4gICwgdG1wICAgICAgID0ge307XHJcblxyXG4vLyAyMy4zIFdlYWtNYXAgT2JqZWN0c1xyXG52YXIgV2Vha01hcCA9IHJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uJykoJ1dlYWtNYXAnLCB7XHJcbiAgLy8gMjMuMy4zLjMgV2Vha01hcC5wcm90b3R5cGUuZ2V0KGtleSlcclxuICBnZXQ6IGZ1bmN0aW9uIGdldChrZXkpe1xyXG4gICAgaWYoaXNPYmplY3Qoa2V5KSl7XHJcbiAgICAgIGlmKGlzRnJvemVuKGtleSkpcmV0dXJuIGxlYWtTdG9yZSh0aGlzKS5nZXQoa2V5KTtcclxuICAgICAgaWYoaGFzKGtleSwgV0VBSykpcmV0dXJuIGtleVtXRUFLXVt0aGlzW0lEXV07XHJcbiAgICB9XHJcbiAgfSxcclxuICAvLyAyMy4zLjMuNSBXZWFrTWFwLnByb3RvdHlwZS5zZXQoa2V5LCB2YWx1ZSlcclxuICBzZXQ6IGZ1bmN0aW9uIHNldChrZXksIHZhbHVlKXtcclxuICAgIHJldHVybiB3ZWFrLmRlZih0aGlzLCBrZXksIHZhbHVlKTtcclxuICB9XHJcbn0sIHdlYWssIHRydWUsIHRydWUpO1xyXG5cclxuLy8gSUUxMSBXZWFrTWFwIGZyb3plbiBrZXlzIGZpeFxyXG5pZigkLkZXICYmIG5ldyBXZWFrTWFwKCkuc2V0KChPYmplY3QuZnJlZXplIHx8IE9iamVjdCkodG1wKSwgNykuZ2V0KHRtcCkgIT0gNyl7XHJcbiAgJC5lYWNoLmNhbGwoWydkZWxldGUnLCAnaGFzJywgJ2dldCcsICdzZXQnXSwgZnVuY3Rpb24oa2V5KXtcclxuICAgIHZhciBtZXRob2QgPSBXZWFrTWFwLnByb3RvdHlwZVtrZXldO1xyXG4gICAgV2Vha01hcC5wcm90b3R5cGVba2V5XSA9IGZ1bmN0aW9uKGEsIGIpe1xyXG4gICAgICAvLyBzdG9yZSBmcm96ZW4gb2JqZWN0cyBvbiBsZWFreSBtYXBcclxuICAgICAgaWYoaXNPYmplY3QoYSkgJiYgaXNGcm96ZW4oYSkpe1xyXG4gICAgICAgIHZhciByZXN1bHQgPSBsZWFrU3RvcmUodGhpcylba2V5XShhLCBiKTtcclxuICAgICAgICByZXR1cm4ga2V5ID09ICdzZXQnID8gdGhpcyA6IHJlc3VsdDtcclxuICAgICAgLy8gc3RvcmUgYWxsIHRoZSByZXN0IG9uIG5hdGl2ZSB3ZWFrbWFwXHJcbiAgICAgIH0gcmV0dXJuIG1ldGhvZC5jYWxsKHRoaXMsIGEsIGIpO1xyXG4gICAgfTtcclxuICB9KTtcclxufSIsIid1c2Ugc3RyaWN0JztcclxudmFyIHdlYWsgPSByZXF1aXJlKCcuLyQuY29sbGVjdGlvbi13ZWFrJyk7XHJcblxyXG4vLyAyMy40IFdlYWtTZXQgT2JqZWN0c1xyXG5yZXF1aXJlKCcuLyQuY29sbGVjdGlvbicpKCdXZWFrU2V0Jywge1xyXG4gIC8vIDIzLjQuMy4xIFdlYWtTZXQucHJvdG90eXBlLmFkZCh2YWx1ZSlcclxuICBhZGQ6IGZ1bmN0aW9uIGFkZCh2YWx1ZSl7XHJcbiAgICByZXR1cm4gd2Vhay5kZWYodGhpcywgdmFsdWUsIHRydWUpO1xyXG4gIH1cclxufSwgd2VhaywgZmFsc2UsIHRydWUpOyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9kb21lbmljL0FycmF5LnByb3RvdHlwZS5pbmNsdWRlc1xyXG52YXIgJGRlZiAgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCAkaW5jbHVkZXMgPSByZXF1aXJlKCcuLyQuYXJyYXktaW5jbHVkZXMnKSh0cnVlKTtcclxuJGRlZigkZGVmLlAsICdBcnJheScsIHtcclxuICBpbmNsdWRlczogZnVuY3Rpb24gaW5jbHVkZXMoZWwgLyosIGZyb21JbmRleCA9IDAgKi8pe1xyXG4gICAgcmV0dXJuICRpbmNsdWRlcyh0aGlzLCBlbCwgYXJndW1lbnRzWzFdKTtcclxuICB9XHJcbn0pO1xyXG5yZXF1aXJlKCcuLyQudW5zY29wZScpKCdpbmNsdWRlcycpOyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9EYXZpZEJydWFudC9NYXAtU2V0LnByb3RvdHlwZS50b0pTT05cclxucmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24tdG8tanNvbicpKCdNYXAnKTsiLCIvLyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9XZWJSZWZsZWN0aW9uLzkzNTM3ODFcclxudmFyICQgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgJGRlZiAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxyXG4gICwgb3duS2V5cyA9IHJlcXVpcmUoJy4vJC5vd24ta2V5cycpO1xyXG5cclxuJGRlZigkZGVmLlMsICdPYmplY3QnLCB7XHJcbiAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yczogZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhvYmplY3Qpe1xyXG4gICAgdmFyIE8gICAgICA9ICQudG9PYmplY3Qob2JqZWN0KVxyXG4gICAgICAsIHJlc3VsdCA9IHt9O1xyXG4gICAgJC5lYWNoLmNhbGwob3duS2V5cyhPKSwgZnVuY3Rpb24oa2V5KXtcclxuICAgICAgJC5zZXREZXNjKHJlc3VsdCwga2V5LCAkLmRlc2MoMCwgJC5nZXREZXNjKE8sIGtleSkpKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcbn0pOyIsIi8vIGh0dHA6Ly9nb28uZ2wvWGtCcmpEXHJcbnZhciAkICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XHJcbmZ1bmN0aW9uIGNyZWF0ZU9iamVjdFRvQXJyYXkoaXNFbnRyaWVzKXtcclxuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KXtcclxuICAgIHZhciBPICAgICAgPSAkLnRvT2JqZWN0KG9iamVjdClcclxuICAgICAgLCBrZXlzICAgPSAkLmdldEtleXMoTylcclxuICAgICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxyXG4gICAgICAsIGkgICAgICA9IDBcclxuICAgICAgLCByZXN1bHQgPSBBcnJheShsZW5ndGgpXHJcbiAgICAgICwga2V5O1xyXG4gICAgaWYoaXNFbnRyaWVzKXdoaWxlKGxlbmd0aCA+IGkpcmVzdWx0W2ldID0gW2tleSA9IGtleXNbaSsrXSwgT1trZXldXTtcclxuICAgIGVsc2Ugd2hpbGUobGVuZ3RoID4gaSlyZXN1bHRbaV0gPSBPW2tleXNbaSsrXV07XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH07XHJcbn1cclxuJGRlZigkZGVmLlMsICdPYmplY3QnLCB7XHJcbiAgdmFsdWVzOiAgY3JlYXRlT2JqZWN0VG9BcnJheShmYWxzZSksXHJcbiAgZW50cmllczogY3JlYXRlT2JqZWN0VG9BcnJheSh0cnVlKVxyXG59KTsiLCIvLyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9rYW5nYXgvOTY5ODEwMFxyXG52YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcclxuJGRlZigkZGVmLlMsICdSZWdFeHAnLCB7XHJcbiAgZXNjYXBlOiByZXF1aXJlKCcuLyQucmVwbGFjZXInKSgvKFtcXFxcXFwtW1xcXXt9KCkqKz8uLF4kfF0pL2csICdcXFxcJDEnLCB0cnVlKVxyXG59KTsiLCIvLyBodHRwczovL2dpdGh1Yi5jb20vRGF2aWRCcnVhbnQvTWFwLVNldC5wcm90b3R5cGUudG9KU09OXHJcbnJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uLXRvLWpzb24nKSgnU2V0Jyk7IiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL21hdGhpYXNieW5lbnMvU3RyaW5nLnByb3RvdHlwZS5hdFxyXG4ndXNlIHN0cmljdCc7XHJcbnZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCAkYXQgID0gcmVxdWlyZSgnLi8kLnN0cmluZy1hdCcpKHRydWUpO1xyXG4kZGVmKCRkZWYuUCwgJ1N0cmluZycsIHtcclxuICBhdDogZnVuY3Rpb24gYXQocG9zKXtcclxuICAgIHJldHVybiAkYXQodGhpcywgcG9zKTtcclxuICB9XHJcbn0pOyIsIid1c2Ugc3RyaWN0JztcclxudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsICRwYWQgPSByZXF1aXJlKCcuLyQuc3RyaW5nLXBhZCcpO1xyXG4kZGVmKCRkZWYuUCwgJ1N0cmluZycsIHtcclxuICBscGFkOiBmdW5jdGlvbiBscGFkKG4pe1xyXG4gICAgcmV0dXJuICRwYWQodGhpcywgbiwgYXJndW1lbnRzWzFdLCB0cnVlKTtcclxuICB9XHJcbn0pOyIsIid1c2Ugc3RyaWN0JztcclxudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsICRwYWQgPSByZXF1aXJlKCcuLyQuc3RyaW5nLXBhZCcpO1xyXG4kZGVmKCRkZWYuUCwgJ1N0cmluZycsIHtcclxuICBycGFkOiBmdW5jdGlvbiBycGFkKG4pe1xyXG4gICAgcmV0dXJuICRwYWQodGhpcywgbiwgYXJndW1lbnRzWzFdLCBmYWxzZSk7XHJcbiAgfVxyXG59KTsiLCIvLyBKYXZhU2NyaXB0IDEuNiAvIFN0cmF3bWFuIGFycmF5IHN0YXRpY3Mgc2hpbVxyXG52YXIgJCAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCAkZGVmICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCAkQXJyYXkgID0gJC5jb3JlLkFycmF5IHx8IEFycmF5XHJcbiAgLCBzdGF0aWNzID0ge307XHJcbmZ1bmN0aW9uIHNldFN0YXRpY3Moa2V5cywgbGVuZ3RoKXtcclxuICAkLmVhY2guY2FsbChrZXlzLnNwbGl0KCcsJyksIGZ1bmN0aW9uKGtleSl7XHJcbiAgICBpZihsZW5ndGggPT0gdW5kZWZpbmVkICYmIGtleSBpbiAkQXJyYXkpc3RhdGljc1trZXldID0gJEFycmF5W2tleV07XHJcbiAgICBlbHNlIGlmKGtleSBpbiBbXSlzdGF0aWNzW2tleV0gPSByZXF1aXJlKCcuLyQuY3R4JykoRnVuY3Rpb24uY2FsbCwgW11ba2V5XSwgbGVuZ3RoKTtcclxuICB9KTtcclxufVxyXG5zZXRTdGF0aWNzKCdwb3AscmV2ZXJzZSxzaGlmdCxrZXlzLHZhbHVlcyxlbnRyaWVzJywgMSk7XHJcbnNldFN0YXRpY3MoJ2luZGV4T2YsZXZlcnksc29tZSxmb3JFYWNoLG1hcCxmaWx0ZXIsZmluZCxmaW5kSW5kZXgsaW5jbHVkZXMnLCAzKTtcclxuc2V0U3RhdGljcygnam9pbixzbGljZSxjb25jYXQscHVzaCxzcGxpY2UsdW5zaGlmdCxzb3J0LGxhc3RJbmRleE9mLCcgK1xyXG4gICAgICAgICAgICdyZWR1Y2UscmVkdWNlUmlnaHQsY29weVdpdGhpbixmaWxsLHR1cm4nKTtcclxuJGRlZigkZGVmLlMsICdBcnJheScsIHN0YXRpY3MpOyIsInJlcXVpcmUoJy4vZXM2LmFycmF5Lml0ZXJhdG9yJyk7XHJcbnZhciAkICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBJdGVyYXRvcnMgICA9IHJlcXVpcmUoJy4vJC5pdGVyJykuSXRlcmF0b3JzXHJcbiAgLCBJVEVSQVRPUiAgICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxyXG4gICwgQXJyYXlWYWx1ZXMgPSBJdGVyYXRvcnMuQXJyYXlcclxuICAsIE5vZGVMaXN0ICAgID0gJC5nLk5vZGVMaXN0O1xyXG5pZigkLkZXICYmIE5vZGVMaXN0ICYmICEoSVRFUkFUT1IgaW4gTm9kZUxpc3QucHJvdG90eXBlKSl7XHJcbiAgJC5oaWRlKE5vZGVMaXN0LnByb3RvdHlwZSwgSVRFUkFUT1IsIEFycmF5VmFsdWVzKTtcclxufVxyXG5JdGVyYXRvcnMuTm9kZUxpc3QgPSBBcnJheVZhbHVlczsiLCJ2YXIgJGRlZiAgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsICR0YXNrID0gcmVxdWlyZSgnLi8kLnRhc2snKTtcclxuJGRlZigkZGVmLkcgKyAkZGVmLkIsIHtcclxuICBzZXRJbW1lZGlhdGU6ICAgJHRhc2suc2V0LFxyXG4gIGNsZWFySW1tZWRpYXRlOiAkdGFzay5jbGVhclxyXG59KTsiLCIvLyBpZTktIHNldFRpbWVvdXQgJiBzZXRJbnRlcnZhbCBhZGRpdGlvbmFsIHBhcmFtZXRlcnMgZml4XHJcbnZhciAkICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgJGRlZiAgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCBpbnZva2UgICAgPSByZXF1aXJlKCcuLyQuaW52b2tlJylcclxuICAsIHBhcnRpYWwgICA9IHJlcXVpcmUoJy4vJC5wYXJ0aWFsJylcclxuICAsIG5hdmlnYXRvciA9ICQuZy5uYXZpZ2F0b3JcclxuICAsIE1TSUUgICAgICA9ICEhbmF2aWdhdG9yICYmIC9NU0lFIC5cXC4vLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7IC8vIDwtIGRpcnR5IGllOS0gY2hlY2tcclxuZnVuY3Rpb24gd3JhcChzZXQpe1xyXG4gIHJldHVybiBNU0lFID8gZnVuY3Rpb24oZm4sIHRpbWUgLyosIC4uLmFyZ3MgKi8pe1xyXG4gICAgcmV0dXJuIHNldChpbnZva2UoXHJcbiAgICAgIHBhcnRpYWwsXHJcbiAgICAgIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSxcclxuICAgICAgJC5pc0Z1bmN0aW9uKGZuKSA/IGZuIDogRnVuY3Rpb24oZm4pXHJcbiAgICApLCB0aW1lKTtcclxuICB9IDogc2V0O1xyXG59XHJcbiRkZWYoJGRlZi5HICsgJGRlZi5CICsgJGRlZi5GICogTVNJRSwge1xyXG4gIHNldFRpbWVvdXQ6ICB3cmFwKCQuZy5zZXRUaW1lb3V0KSxcclxuICBzZXRJbnRlcnZhbDogd3JhcCgkLmcuc2V0SW50ZXJ2YWwpXHJcbn0pOyIsInJlcXVpcmUoJy4vbW9kdWxlcy9lczUnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zeW1ib2wnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5vYmplY3QuYXNzaWduJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYub2JqZWN0LmlzJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYub2JqZWN0LnNldC1wcm90b3R5cGUtb2YnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYub2JqZWN0LnN0YXRpY3MtYWNjZXB0LXByaW1pdGl2ZXMnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5mdW5jdGlvbi5uYW1lJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuZnVuY3Rpb24uaGFzLWluc3RhbmNlJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYubnVtYmVyLmNvbnN0cnVjdG9yJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYubnVtYmVyLnN0YXRpY3MnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5tYXRoJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc3RyaW5nLmZyb20tY29kZS1wb2ludCcpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnN0cmluZy5yYXcnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3InKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zdHJpbmcuY29kZS1wb2ludC1hdCcpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnN0cmluZy5lbmRzLXdpdGgnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zdHJpbmcuaW5jbHVkZXMnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zdHJpbmcucmVwZWF0Jyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc3RyaW5nLnN0YXJ0cy13aXRoJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuYXJyYXkuZnJvbScpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LmFycmF5Lm9mJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuYXJyYXkuaXRlcmF0b3InKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5hcnJheS5zcGVjaWVzJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuYXJyYXkuY29weS13aXRoaW4nKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5hcnJheS5maWxsJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuYXJyYXkuZmluZCcpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LmFycmF5LmZpbmQtaW5kZXgnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5yZWdleHAnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5wcm9taXNlJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYubWFwJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc2V0Jyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYud2Vhay1tYXAnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi53ZWFrLXNldCcpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnJlZmxlY3QnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNy5hcnJheS5pbmNsdWRlcycpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM3LnN0cmluZy5hdCcpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM3LnN0cmluZy5scGFkJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczcuc3RyaW5nLnJwYWQnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNy5yZWdleHAuZXNjYXBlJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczcub2JqZWN0LmdldC1vd24tcHJvcGVydHktZGVzY3JpcHRvcnMnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNy5vYmplY3QudG8tYXJyYXknKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNy5tYXAudG8tanNvbicpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM3LnNldC50by1qc29uJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9qcy5hcnJheS5zdGF0aWNzJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy93ZWIudGltZXJzJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy93ZWIuaW1tZWRpYXRlJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlJyk7XHJcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9tb2R1bGVzLyQnKS5jb3JlO1xyXG4iLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBodHRwczovL3Jhdy5naXRodWIuY29tL2ZhY2Vib29rL3JlZ2VuZXJhdG9yL21hc3Rlci9MSUNFTlNFIGZpbGUuIEFuXG4gKiBhZGRpdGlvbmFsIGdyYW50IG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW5cbiAqIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqL1xuXG4hKGZ1bmN0aW9uKGdsb2JhbCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbiAgdmFyIHVuZGVmaW5lZDsgLy8gTW9yZSBjb21wcmVzc2libGUgdGhhbiB2b2lkIDAuXG4gIHZhciBpdGVyYXRvclN5bWJvbCA9XG4gICAgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5pdGVyYXRvciB8fCBcIkBAaXRlcmF0b3JcIjtcblxuICB2YXIgaW5Nb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiO1xuICB2YXIgcnVudGltZSA9IGdsb2JhbC5yZWdlbmVyYXRvclJ1bnRpbWU7XG4gIGlmIChydW50aW1lKSB7XG4gICAgaWYgKGluTW9kdWxlKSB7XG4gICAgICAvLyBJZiByZWdlbmVyYXRvclJ1bnRpbWUgaXMgZGVmaW5lZCBnbG9iYWxseSBhbmQgd2UncmUgaW4gYSBtb2R1bGUsXG4gICAgICAvLyBtYWtlIHRoZSBleHBvcnRzIG9iamVjdCBpZGVudGljYWwgdG8gcmVnZW5lcmF0b3JSdW50aW1lLlxuICAgICAgbW9kdWxlLmV4cG9ydHMgPSBydW50aW1lO1xuICAgIH1cbiAgICAvLyBEb24ndCBib3RoZXIgZXZhbHVhdGluZyB0aGUgcmVzdCBvZiB0aGlzIGZpbGUgaWYgdGhlIHJ1bnRpbWUgd2FzXG4gICAgLy8gYWxyZWFkeSBkZWZpbmVkIGdsb2JhbGx5LlxuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIERlZmluZSB0aGUgcnVudGltZSBnbG9iYWxseSAoYXMgZXhwZWN0ZWQgYnkgZ2VuZXJhdGVkIGNvZGUpIGFzIGVpdGhlclxuICAvLyBtb2R1bGUuZXhwb3J0cyAoaWYgd2UncmUgaW4gYSBtb2R1bGUpIG9yIGEgbmV3LCBlbXB0eSBvYmplY3QuXG4gIHJ1bnRpbWUgPSBnbG9iYWwucmVnZW5lcmF0b3JSdW50aW1lID0gaW5Nb2R1bGUgPyBtb2R1bGUuZXhwb3J0cyA6IHt9O1xuXG4gIGZ1bmN0aW9uIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBJZiBvdXRlckZuIHByb3ZpZGVkLCB0aGVuIG91dGVyRm4ucHJvdG90eXBlIGluc3RhbmNlb2YgR2VuZXJhdG9yLlxuICAgIHZhciBnZW5lcmF0b3IgPSBPYmplY3QuY3JlYXRlKChvdXRlckZuIHx8IEdlbmVyYXRvcikucHJvdG90eXBlKTtcblxuICAgIGdlbmVyYXRvci5faW52b2tlID0gbWFrZUludm9rZU1ldGhvZChcbiAgICAgIGlubmVyRm4sIHNlbGYgfHwgbnVsbCxcbiAgICAgIG5ldyBDb250ZXh0KHRyeUxvY3NMaXN0IHx8IFtdKVxuICAgICk7XG5cbiAgICByZXR1cm4gZ2VuZXJhdG9yO1xuICB9XG4gIHJ1bnRpbWUud3JhcCA9IHdyYXA7XG5cbiAgLy8gVHJ5L2NhdGNoIGhlbHBlciB0byBtaW5pbWl6ZSBkZW9wdGltaXphdGlvbnMuIFJldHVybnMgYSBjb21wbGV0aW9uXG4gIC8vIHJlY29yZCBsaWtlIGNvbnRleHQudHJ5RW50cmllc1tpXS5jb21wbGV0aW9uLiBUaGlzIGludGVyZmFjZSBjb3VsZFxuICAvLyBoYXZlIGJlZW4gKGFuZCB3YXMgcHJldmlvdXNseSkgZGVzaWduZWQgdG8gdGFrZSBhIGNsb3N1cmUgdG8gYmVcbiAgLy8gaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50cywgYnV0IGluIGFsbCB0aGUgY2FzZXMgd2UgY2FyZSBhYm91dCB3ZVxuICAvLyBhbHJlYWR5IGhhdmUgYW4gZXhpc3RpbmcgbWV0aG9kIHdlIHdhbnQgdG8gY2FsbCwgc28gdGhlcmUncyBubyBuZWVkXG4gIC8vIHRvIGNyZWF0ZSBhIG5ldyBmdW5jdGlvbiBvYmplY3QuIFdlIGNhbiBldmVuIGdldCBhd2F5IHdpdGggYXNzdW1pbmdcbiAgLy8gdGhlIG1ldGhvZCB0YWtlcyBleGFjdGx5IG9uZSBhcmd1bWVudCwgc2luY2UgdGhhdCBoYXBwZW5zIHRvIGJlIHRydWVcbiAgLy8gaW4gZXZlcnkgY2FzZSwgc28gd2UgZG9uJ3QgaGF2ZSB0byB0b3VjaCB0aGUgYXJndW1lbnRzIG9iamVjdC4gVGhlXG4gIC8vIG9ubHkgYWRkaXRpb25hbCBhbGxvY2F0aW9uIHJlcXVpcmVkIGlzIHRoZSBjb21wbGV0aW9uIHJlY29yZCwgd2hpY2hcbiAgLy8gaGFzIGEgc3RhYmxlIHNoYXBlIGFuZCBzbyBob3BlZnVsbHkgc2hvdWxkIGJlIGNoZWFwIHRvIGFsbG9jYXRlLlxuICBmdW5jdGlvbiB0cnlDYXRjaChmbiwgb2JqLCBhcmcpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJub3JtYWxcIiwgYXJnOiBmbi5jYWxsKG9iaiwgYXJnKSB9O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJ0aHJvd1wiLCBhcmc6IGVyciB9O1xuICAgIH1cbiAgfVxuXG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0ID0gXCJzdXNwZW5kZWRTdGFydFwiO1xuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRZaWVsZCA9IFwic3VzcGVuZGVkWWllbGRcIjtcbiAgdmFyIEdlblN0YXRlRXhlY3V0aW5nID0gXCJleGVjdXRpbmdcIjtcbiAgdmFyIEdlblN0YXRlQ29tcGxldGVkID0gXCJjb21wbGV0ZWRcIjtcblxuICAvLyBSZXR1cm5pbmcgdGhpcyBvYmplY3QgZnJvbSB0aGUgaW5uZXJGbiBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzXG4gIC8vIGJyZWFraW5nIG91dCBvZiB0aGUgZGlzcGF0Y2ggc3dpdGNoIHN0YXRlbWVudC5cbiAgdmFyIENvbnRpbnVlU2VudGluZWwgPSB7fTtcblxuICAvLyBEdW1teSBjb25zdHJ1Y3RvciBmdW5jdGlvbnMgdGhhdCB3ZSB1c2UgYXMgdGhlIC5jb25zdHJ1Y3RvciBhbmRcbiAgLy8gLmNvbnN0cnVjdG9yLnByb3RvdHlwZSBwcm9wZXJ0aWVzIGZvciBmdW5jdGlvbnMgdGhhdCByZXR1cm4gR2VuZXJhdG9yXG4gIC8vIG9iamVjdHMuIEZvciBmdWxsIHNwZWMgY29tcGxpYW5jZSwgeW91IG1heSB3aXNoIHRvIGNvbmZpZ3VyZSB5b3VyXG4gIC8vIG1pbmlmaWVyIG5vdCB0byBtYW5nbGUgdGhlIG5hbWVzIG9mIHRoZXNlIHR3byBmdW5jdGlvbnMuXG4gIGZ1bmN0aW9uIEdlbmVyYXRvcigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUoKSB7fVxuXG4gIHZhciBHcCA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLnByb3RvdHlwZSA9IEdlbmVyYXRvci5wcm90b3R5cGU7XG4gIEdlbmVyYXRvckZ1bmN0aW9uLnByb3RvdHlwZSA9IEdwLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb247XG4gIEdlbmVyYXRvckZ1bmN0aW9uLmRpc3BsYXlOYW1lID0gXCJHZW5lcmF0b3JGdW5jdGlvblwiO1xuXG4gIHJ1bnRpbWUuaXNHZW5lcmF0b3JGdW5jdGlvbiA9IGZ1bmN0aW9uKGdlbkZ1bikge1xuICAgIHZhciBjdG9yID0gdHlwZW9mIGdlbkZ1biA9PT0gXCJmdW5jdGlvblwiICYmIGdlbkZ1bi5jb25zdHJ1Y3RvcjtcbiAgICByZXR1cm4gY3RvclxuICAgICAgPyBjdG9yID09PSBHZW5lcmF0b3JGdW5jdGlvbiB8fFxuICAgICAgICAvLyBGb3IgdGhlIG5hdGl2ZSBHZW5lcmF0b3JGdW5jdGlvbiBjb25zdHJ1Y3RvciwgdGhlIGJlc3Qgd2UgY2FuXG4gICAgICAgIC8vIGRvIGlzIHRvIGNoZWNrIGl0cyAubmFtZSBwcm9wZXJ0eS5cbiAgICAgICAgKGN0b3IuZGlzcGxheU5hbWUgfHwgY3Rvci5uYW1lKSA9PT0gXCJHZW5lcmF0b3JGdW5jdGlvblwiXG4gICAgICA6IGZhbHNlO1xuICB9O1xuXG4gIHJ1bnRpbWUubWFyayA9IGZ1bmN0aW9uKGdlbkZ1bikge1xuICAgIGdlbkZ1bi5fX3Byb3RvX18gPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgICBnZW5GdW4ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShHcCk7XG4gICAgcmV0dXJuIGdlbkZ1bjtcbiAgfTtcblxuICBydW50aW1lLmFzeW5jID0gZnVuY3Rpb24oaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgZ2VuZXJhdG9yID0gd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCk7XG4gICAgICB2YXIgY2FsbE5leHQgPSBzdGVwLmJpbmQoZ2VuZXJhdG9yLCBcIm5leHRcIik7XG4gICAgICB2YXIgY2FsbFRocm93ID0gc3RlcC5iaW5kKGdlbmVyYXRvciwgXCJ0aHJvd1wiKTtcblxuICAgICAgZnVuY3Rpb24gc3RlcChtZXRob2QsIGFyZykge1xuICAgICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goZ2VuZXJhdG9yW21ldGhvZF0sIGdlbmVyYXRvciwgYXJnKTtcbiAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICByZWplY3QocmVjb3JkLmFyZyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGluZm8gPSByZWNvcmQuYXJnO1xuICAgICAgICBpZiAoaW5mby5kb25lKSB7XG4gICAgICAgICAgcmVzb2x2ZShpbmZvLnZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBQcm9taXNlLnJlc29sdmUoaW5mby52YWx1ZSkudGhlbihjYWxsTmV4dCwgY2FsbFRocm93KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjYWxsTmV4dCgpO1xuICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCkge1xuICAgIHZhciBzdGF0ZSA9IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQ7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlRXhlY3V0aW5nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IHJ1bm5pbmdcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVDb21wbGV0ZWQpIHtcbiAgICAgICAgLy8gQmUgZm9yZ2l2aW5nLCBwZXIgMjUuMy4zLjMuMyBvZiB0aGUgc3BlYzpcbiAgICAgICAgLy8gaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLWdlbmVyYXRvcnJlc3VtZVxuICAgICAgICByZXR1cm4gZG9uZVJlc3VsdCgpO1xuICAgICAgfVxuXG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICB2YXIgZGVsZWdhdGUgPSBjb250ZXh0LmRlbGVnYXRlO1xuICAgICAgICBpZiAoZGVsZWdhdGUpIHtcbiAgICAgICAgICBpZiAobWV0aG9kID09PSBcInJldHVyblwiIHx8XG4gICAgICAgICAgICAgIChtZXRob2QgPT09IFwidGhyb3dcIiAmJiBkZWxlZ2F0ZS5pdGVyYXRvclttZXRob2RdID09PSB1bmRlZmluZWQpKSB7XG4gICAgICAgICAgICAvLyBBIHJldHVybiBvciB0aHJvdyAod2hlbiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIG5vIHRocm93XG4gICAgICAgICAgICAvLyBtZXRob2QpIGFsd2F5cyB0ZXJtaW5hdGVzIHRoZSB5aWVsZCogbG9vcC5cbiAgICAgICAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICAgICAgICAvLyBJZiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIGEgcmV0dXJuIG1ldGhvZCwgZ2l2ZSBpdCBhXG4gICAgICAgICAgICAvLyBjaGFuY2UgdG8gY2xlYW4gdXAuXG4gICAgICAgICAgICB2YXIgcmV0dXJuTWV0aG9kID0gZGVsZWdhdGUuaXRlcmF0b3JbXCJyZXR1cm5cIl07XG4gICAgICAgICAgICBpZiAocmV0dXJuTWV0aG9kKSB7XG4gICAgICAgICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChyZXR1cm5NZXRob2QsIGRlbGVnYXRlLml0ZXJhdG9yLCBhcmcpO1xuICAgICAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgICAgIC8vIElmIHRoZSByZXR1cm4gbWV0aG9kIHRocmV3IGFuIGV4Y2VwdGlvbiwgbGV0IHRoYXRcbiAgICAgICAgICAgICAgICAvLyBleGNlcHRpb24gcHJldmFpbCBvdmVyIHRoZSBvcmlnaW5hbCByZXR1cm4gb3IgdGhyb3cuXG4gICAgICAgICAgICAgICAgbWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICAgICAgICAgIGFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG1ldGhvZCA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICAgICAgICAvLyBDb250aW51ZSB3aXRoIHRoZSBvdXRlciByZXR1cm4sIG5vdyB0aGF0IHRoZSBkZWxlZ2F0ZVxuICAgICAgICAgICAgICAvLyBpdGVyYXRvciBoYXMgYmVlbiB0ZXJtaW5hdGVkLlxuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goXG4gICAgICAgICAgICBkZWxlZ2F0ZS5pdGVyYXRvclttZXRob2RdLFxuICAgICAgICAgICAgZGVsZWdhdGUuaXRlcmF0b3IsXG4gICAgICAgICAgICBhcmdcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICAgICAgICAvLyBMaWtlIHJldHVybmluZyBnZW5lcmF0b3IudGhyb3codW5jYXVnaHQpLCBidXQgd2l0aG91dCB0aGVcbiAgICAgICAgICAgIC8vIG92ZXJoZWFkIG9mIGFuIGV4dHJhIGZ1bmN0aW9uIGNhbGwuXG4gICAgICAgICAgICBtZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgICAgICBhcmcgPSByZWNvcmQuYXJnO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gRGVsZWdhdGUgZ2VuZXJhdG9yIHJhbiBhbmQgaGFuZGxlZCBpdHMgb3duIGV4Y2VwdGlvbnMgc29cbiAgICAgICAgICAvLyByZWdhcmRsZXNzIG9mIHdoYXQgdGhlIG1ldGhvZCB3YXMsIHdlIGNvbnRpbnVlIGFzIGlmIGl0IGlzXG4gICAgICAgICAgLy8gXCJuZXh0XCIgd2l0aCBhbiB1bmRlZmluZWQgYXJnLlxuICAgICAgICAgIG1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICAgIGFyZyA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgIHZhciBpbmZvID0gcmVjb3JkLmFyZztcbiAgICAgICAgICBpZiAoaW5mby5kb25lKSB7XG4gICAgICAgICAgICBjb250ZXh0W2RlbGVnYXRlLnJlc3VsdE5hbWVdID0gaW5mby52YWx1ZTtcbiAgICAgICAgICAgIGNvbnRleHQubmV4dCA9IGRlbGVnYXRlLm5leHRMb2M7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVTdXNwZW5kZWRZaWVsZDtcbiAgICAgICAgICAgIHJldHVybiBpbmZvO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1ldGhvZCA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlU3VzcGVuZGVkWWllbGQpIHtcbiAgICAgICAgICAgIGNvbnRleHQuc2VudCA9IGFyZztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVsZXRlIGNvbnRleHQuc2VudDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIGlmIChtZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydCkge1xuICAgICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAgIHRocm93IGFyZztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihhcmcpKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGUgZGlzcGF0Y2hlZCBleGNlcHRpb24gd2FzIGNhdWdodCBieSBhIGNhdGNoIGJsb2NrLFxuICAgICAgICAgICAgLy8gdGhlbiBsZXQgdGhhdCBjYXRjaCBibG9jayBoYW5kbGUgdGhlIGV4Y2VwdGlvbiBub3JtYWxseS5cbiAgICAgICAgICAgIG1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICAgICAgYXJnID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2UgaWYgKG1ldGhvZCA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICAgIGNvbnRleHQuYWJydXB0KFwicmV0dXJuXCIsIGFyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZSA9IEdlblN0YXRlRXhlY3V0aW5nO1xuXG4gICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiKSB7XG4gICAgICAgICAgLy8gSWYgYW4gZXhjZXB0aW9uIGlzIHRocm93biBmcm9tIGlubmVyRm4sIHdlIGxlYXZlIHN0YXRlID09PVxuICAgICAgICAgIC8vIEdlblN0YXRlRXhlY3V0aW5nIGFuZCBsb29wIGJhY2sgZm9yIGFub3RoZXIgaW52b2NhdGlvbi5cbiAgICAgICAgICBzdGF0ZSA9IGNvbnRleHQuZG9uZVxuICAgICAgICAgICAgPyBHZW5TdGF0ZUNvbXBsZXRlZFxuICAgICAgICAgICAgOiBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkO1xuXG4gICAgICAgICAgdmFyIGluZm8gPSB7XG4gICAgICAgICAgICB2YWx1ZTogcmVjb3JkLmFyZyxcbiAgICAgICAgICAgIGRvbmU6IGNvbnRleHQuZG9uZVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBpZiAocmVjb3JkLmFyZyA9PT0gQ29udGludWVTZW50aW5lbCkge1xuICAgICAgICAgICAgaWYgKGNvbnRleHQuZGVsZWdhdGUgJiYgbWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAgICAgICAvLyBEZWxpYmVyYXRlbHkgZm9yZ2V0IHRoZSBsYXN0IHNlbnQgdmFsdWUgc28gdGhhdCB3ZSBkb24ndFxuICAgICAgICAgICAgICAvLyBhY2NpZGVudGFsbHkgcGFzcyBpdCBvbiB0byB0aGUgZGVsZWdhdGUuXG4gICAgICAgICAgICAgIGFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGluZm87XG4gICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG4gICAgICAgICAgLy8gRGlzcGF0Y2ggdGhlIGV4Y2VwdGlvbiBieSBsb29waW5nIGJhY2sgYXJvdW5kIHRvIHRoZVxuICAgICAgICAgIC8vIGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oYXJnKSBjYWxsIGFib3ZlLlxuICAgICAgICAgIG1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgICBhcmcgPSByZWNvcmQuYXJnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlZmluZUdlbmVyYXRvck1ldGhvZChtZXRob2QpIHtcbiAgICBHcFttZXRob2RdID0gZnVuY3Rpb24oYXJnKSB7XG4gICAgICByZXR1cm4gdGhpcy5faW52b2tlKG1ldGhvZCwgYXJnKTtcbiAgICB9O1xuICB9XG4gIGRlZmluZUdlbmVyYXRvck1ldGhvZChcIm5leHRcIik7XG4gIGRlZmluZUdlbmVyYXRvck1ldGhvZChcInRocm93XCIpO1xuICBkZWZpbmVHZW5lcmF0b3JNZXRob2QoXCJyZXR1cm5cIik7XG5cbiAgR3BbaXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgR3AudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCJbb2JqZWN0IEdlbmVyYXRvcl1cIjtcbiAgfTtcblxuICBmdW5jdGlvbiBwdXNoVHJ5RW50cnkobG9jcykge1xuICAgIHZhciBlbnRyeSA9IHsgdHJ5TG9jOiBsb2NzWzBdIH07XG5cbiAgICBpZiAoMSBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5jYXRjaExvYyA9IGxvY3NbMV07XG4gICAgfVxuXG4gICAgaWYgKDIgaW4gbG9jcykge1xuICAgICAgZW50cnkuZmluYWxseUxvYyA9IGxvY3NbMl07XG4gICAgICBlbnRyeS5hZnRlckxvYyA9IGxvY3NbM107XG4gICAgfVxuXG4gICAgdGhpcy50cnlFbnRyaWVzLnB1c2goZW50cnkpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzZXRUcnlFbnRyeShlbnRyeSkge1xuICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uIHx8IHt9O1xuICAgIHJlY29yZC50eXBlID0gXCJub3JtYWxcIjtcbiAgICBkZWxldGUgcmVjb3JkLmFyZztcbiAgICBlbnRyeS5jb21wbGV0aW9uID0gcmVjb3JkO1xuICB9XG5cbiAgZnVuY3Rpb24gQ29udGV4dCh0cnlMb2NzTGlzdCkge1xuICAgIC8vIFRoZSByb290IGVudHJ5IG9iamVjdCAoZWZmZWN0aXZlbHkgYSB0cnkgc3RhdGVtZW50IHdpdGhvdXQgYSBjYXRjaFxuICAgIC8vIG9yIGEgZmluYWxseSBibG9jaykgZ2l2ZXMgdXMgYSBwbGFjZSB0byBzdG9yZSB2YWx1ZXMgdGhyb3duIGZyb21cbiAgICAvLyBsb2NhdGlvbnMgd2hlcmUgdGhlcmUgaXMgbm8gZW5jbG9zaW5nIHRyeSBzdGF0ZW1lbnQuXG4gICAgdGhpcy50cnlFbnRyaWVzID0gW3sgdHJ5TG9jOiBcInJvb3RcIiB9XTtcbiAgICB0cnlMb2NzTGlzdC5mb3JFYWNoKHB1c2hUcnlFbnRyeSwgdGhpcyk7XG4gICAgdGhpcy5yZXNldCgpO1xuICB9XG5cbiAgcnVudGltZS5rZXlzID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICB9XG4gICAga2V5cy5yZXZlcnNlKCk7XG5cbiAgICAvLyBSYXRoZXIgdGhhbiByZXR1cm5pbmcgYW4gb2JqZWN0IHdpdGggYSBuZXh0IG1ldGhvZCwgd2Uga2VlcFxuICAgIC8vIHRoaW5ncyBzaW1wbGUgYW5kIHJldHVybiB0aGUgbmV4dCBmdW5jdGlvbiBpdHNlbGYuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICB3aGlsZSAoa2V5cy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGtleSA9IGtleXMucG9wKCk7XG4gICAgICAgIGlmIChrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgbmV4dC52YWx1ZSA9IGtleTtcbiAgICAgICAgICBuZXh0LmRvbmUgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUbyBhdm9pZCBjcmVhdGluZyBhbiBhZGRpdGlvbmFsIG9iamVjdCwgd2UganVzdCBoYW5nIHRoZSAudmFsdWVcbiAgICAgIC8vIGFuZCAuZG9uZSBwcm9wZXJ0aWVzIG9mZiB0aGUgbmV4dCBmdW5jdGlvbiBvYmplY3QgaXRzZWxmLiBUaGlzXG4gICAgICAvLyBhbHNvIGVuc3VyZXMgdGhhdCB0aGUgbWluaWZpZXIgd2lsbCBub3QgYW5vbnltaXplIHRoZSBmdW5jdGlvbi5cbiAgICAgIG5leHQuZG9uZSA9IHRydWU7XG4gICAgICByZXR1cm4gbmV4dDtcbiAgICB9O1xuICB9O1xuXG4gIGZ1bmN0aW9uIHZhbHVlcyhpdGVyYWJsZSkge1xuICAgIGlmIChpdGVyYWJsZSkge1xuICAgICAgdmFyIGl0ZXJhdG9yTWV0aG9kID0gaXRlcmFibGVbaXRlcmF0b3JTeW1ib2xdO1xuICAgICAgaWYgKGl0ZXJhdG9yTWV0aG9kKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvck1ldGhvZC5jYWxsKGl0ZXJhYmxlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBpdGVyYWJsZS5uZXh0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhYmxlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWlzTmFOKGl0ZXJhYmxlLmxlbmd0aCkpIHtcbiAgICAgICAgdmFyIGkgPSAtMSwgbmV4dCA9IGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgd2hpbGUgKCsraSA8IGl0ZXJhYmxlLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKGhhc093bi5jYWxsKGl0ZXJhYmxlLCBpKSkge1xuICAgICAgICAgICAgICBuZXh0LnZhbHVlID0gaXRlcmFibGVbaV07XG4gICAgICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXh0LnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICAgIG5leHQuZG9uZSA9IHRydWU7XG5cbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gbmV4dC5uZXh0ID0gbmV4dDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gYW4gaXRlcmF0b3Igd2l0aCBubyB2YWx1ZXMuXG4gICAgcmV0dXJuIHsgbmV4dDogZG9uZVJlc3VsdCB9O1xuICB9XG4gIHJ1bnRpbWUudmFsdWVzID0gdmFsdWVzO1xuXG4gIGZ1bmN0aW9uIGRvbmVSZXN1bHQoKSB7XG4gICAgcmV0dXJuIHsgdmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZSB9O1xuICB9XG5cbiAgQ29udGV4dC5wcm90b3R5cGUgPSB7XG4gICAgY29uc3RydWN0b3I6IENvbnRleHQsXG5cbiAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnByZXYgPSAwO1xuICAgICAgdGhpcy5uZXh0ID0gMDtcbiAgICAgIHRoaXMuc2VudCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIHRoaXMudHJ5RW50cmllcy5mb3JFYWNoKHJlc2V0VHJ5RW50cnkpO1xuXG4gICAgICAvLyBQcmUtaW5pdGlhbGl6ZSBhdCBsZWFzdCAyMCB0ZW1wb3JhcnkgdmFyaWFibGVzIHRvIGVuYWJsZSBoaWRkZW5cbiAgICAgIC8vIGNsYXNzIG9wdGltaXphdGlvbnMgZm9yIHNpbXBsZSBnZW5lcmF0b3JzLlxuICAgICAgZm9yICh2YXIgdGVtcEluZGV4ID0gMCwgdGVtcE5hbWU7XG4gICAgICAgICAgIGhhc093bi5jYWxsKHRoaXMsIHRlbXBOYW1lID0gXCJ0XCIgKyB0ZW1wSW5kZXgpIHx8IHRlbXBJbmRleCA8IDIwO1xuICAgICAgICAgICArK3RlbXBJbmRleCkge1xuICAgICAgICB0aGlzW3RlbXBOYW1lXSA9IG51bGw7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcblxuICAgICAgdmFyIHJvb3RFbnRyeSA9IHRoaXMudHJ5RW50cmllc1swXTtcbiAgICAgIHZhciByb290UmVjb3JkID0gcm9vdEVudHJ5LmNvbXBsZXRpb247XG4gICAgICBpZiAocm9vdFJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcm9vdFJlY29yZC5hcmc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJ2YWw7XG4gICAgfSxcblxuICAgIGRpc3BhdGNoRXhjZXB0aW9uOiBmdW5jdGlvbihleGNlcHRpb24pIHtcbiAgICAgIGlmICh0aGlzLmRvbmUpIHtcbiAgICAgICAgdGhyb3cgZXhjZXB0aW9uO1xuICAgICAgfVxuXG4gICAgICB2YXIgY29udGV4dCA9IHRoaXM7XG4gICAgICBmdW5jdGlvbiBoYW5kbGUobG9jLCBjYXVnaHQpIHtcbiAgICAgICAgcmVjb3JkLnR5cGUgPSBcInRocm93XCI7XG4gICAgICAgIHJlY29yZC5hcmcgPSBleGNlcHRpb247XG4gICAgICAgIGNvbnRleHQubmV4dCA9IGxvYztcbiAgICAgICAgcmV0dXJuICEhY2F1Z2h0O1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gXCJyb290XCIpIHtcbiAgICAgICAgICAvLyBFeGNlcHRpb24gdGhyb3duIG91dHNpZGUgb2YgYW55IHRyeSBibG9jayB0aGF0IGNvdWxkIGhhbmRsZVxuICAgICAgICAgIC8vIGl0LCBzbyBzZXQgdGhlIGNvbXBsZXRpb24gdmFsdWUgb2YgdGhlIGVudGlyZSBmdW5jdGlvbiB0b1xuICAgICAgICAgIC8vIHRocm93IHRoZSBleGNlcHRpb24uXG4gICAgICAgICAgcmV0dXJuIGhhbmRsZShcImVuZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2KSB7XG4gICAgICAgICAgdmFyIGhhc0NhdGNoID0gaGFzT3duLmNhbGwoZW50cnksIFwiY2F0Y2hMb2NcIik7XG4gICAgICAgICAgdmFyIGhhc0ZpbmFsbHkgPSBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpO1xuXG4gICAgICAgICAgaWYgKGhhc0NhdGNoICYmIGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5jYXRjaExvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmNhdGNoTG9jLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNDYXRjaCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNGaW5hbGx5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInRyeSBzdGF0ZW1lbnQgd2l0aG91dCBjYXRjaCBvciBmaW5hbGx5XCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBhYnJ1cHQ6IGZ1bmN0aW9uKHR5cGUsIGFyZykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2ICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpICYmXG4gICAgICAgICAgICB0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgdmFyIGZpbmFsbHlFbnRyeSA9IGVudHJ5O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkgJiZcbiAgICAgICAgICAodHlwZSA9PT0gXCJicmVha1wiIHx8XG4gICAgICAgICAgIHR5cGUgPT09IFwiY29udGludWVcIikgJiZcbiAgICAgICAgICBmaW5hbGx5RW50cnkudHJ5TG9jIDw9IGFyZyAmJlxuICAgICAgICAgIGFyZyA8PSBmaW5hbGx5RW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAvLyBJZ25vcmUgdGhlIGZpbmFsbHkgZW50cnkgaWYgY29udHJvbCBpcyBub3QganVtcGluZyB0byBhXG4gICAgICAgIC8vIGxvY2F0aW9uIG91dHNpZGUgdGhlIHRyeS9jYXRjaCBibG9jay5cbiAgICAgICAgZmluYWxseUVudHJ5ID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlY29yZCA9IGZpbmFsbHlFbnRyeSA/IGZpbmFsbHlFbnRyeS5jb21wbGV0aW9uIDoge307XG4gICAgICByZWNvcmQudHlwZSA9IHR5cGU7XG4gICAgICByZWNvcmQuYXJnID0gYXJnO1xuXG4gICAgICBpZiAoZmluYWxseUVudHJ5KSB7XG4gICAgICAgIHRoaXMubmV4dCA9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jb21wbGV0ZShyZWNvcmQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9LFxuXG4gICAgY29tcGxldGU6IGZ1bmN0aW9uKHJlY29yZCwgYWZ0ZXJMb2MpIHtcbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHRocm93IHJlY29yZC5hcmc7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJicmVha1wiIHx8XG4gICAgICAgICAgcmVjb3JkLnR5cGUgPT09IFwiY29udGludWVcIikge1xuICAgICAgICB0aGlzLm5leHQgPSByZWNvcmQuYXJnO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICB0aGlzLnJ2YWwgPSByZWNvcmQuYXJnO1xuICAgICAgICB0aGlzLm5leHQgPSBcImVuZFwiO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIiAmJiBhZnRlckxvYykge1xuICAgICAgICB0aGlzLm5leHQgPSBhZnRlckxvYztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfSxcblxuICAgIGZpbmlzaDogZnVuY3Rpb24oZmluYWxseUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS5maW5hbGx5TG9jID09PSBmaW5hbGx5TG9jKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29tcGxldGUoZW50cnkuY29tcGxldGlvbiwgZW50cnkuYWZ0ZXJMb2MpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIFwiY2F0Y2hcIjogZnVuY3Rpb24odHJ5TG9jKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gdHJ5TG9jKSB7XG4gICAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG4gICAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIHZhciB0aHJvd24gPSByZWNvcmQuYXJnO1xuICAgICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aHJvd247XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVGhlIGNvbnRleHQuY2F0Y2ggbWV0aG9kIG11c3Qgb25seSBiZSBjYWxsZWQgd2l0aCBhIGxvY2F0aW9uXG4gICAgICAvLyBhcmd1bWVudCB0aGF0IGNvcnJlc3BvbmRzIHRvIGEga25vd24gY2F0Y2ggYmxvY2suXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbGxlZ2FsIGNhdGNoIGF0dGVtcHRcIik7XG4gICAgfSxcblxuICAgIGRlbGVnYXRlWWllbGQ6IGZ1bmN0aW9uKGl0ZXJhYmxlLCByZXN1bHROYW1lLCBuZXh0TG9jKSB7XG4gICAgICB0aGlzLmRlbGVnYXRlID0ge1xuICAgICAgICBpdGVyYXRvcjogdmFsdWVzKGl0ZXJhYmxlKSxcbiAgICAgICAgcmVzdWx0TmFtZTogcmVzdWx0TmFtZSxcbiAgICAgICAgbmV4dExvYzogbmV4dExvY1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuICB9O1xufSkoXG4gIC8vIEFtb25nIHRoZSB2YXJpb3VzIHRyaWNrcyBmb3Igb2J0YWluaW5nIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWxcbiAgLy8gb2JqZWN0LCB0aGlzIHNlZW1zIHRvIGJlIHRoZSBtb3N0IHJlbGlhYmxlIHRlY2huaXF1ZSB0aGF0IGRvZXMgbm90XG4gIC8vIHVzZSBpbmRpcmVjdCBldmFsICh3aGljaCB2aW9sYXRlcyBDb250ZW50IFNlY3VyaXR5IFBvbGljeSkuXG4gIHR5cGVvZiBnbG9iYWwgPT09IFwib2JqZWN0XCIgPyBnbG9iYWwgOlxuICB0eXBlb2Ygd2luZG93ID09PSBcIm9iamVjdFwiID8gd2luZG93IDpcbiAgdHlwZW9mIHNlbGYgPT09IFwib2JqZWN0XCIgPyBzZWxmIDogdGhpc1xuKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4vbGliL2JhYmVsL3BvbHlmaWxsXCIpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiYmFiZWwtY29yZS9wb2x5ZmlsbFwiKTtcbiJdfQ==
