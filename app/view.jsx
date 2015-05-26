
import R     from './reg'
import Util  from './util'
import Pickr from './pickr'
import Pref  from './pref.jsx'

const WWW = 'https://ethantw.github.io/az/'
const LIB = {
  css:    '<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/Han/3.2.1/han.min.css">',
  js:     '<script src="//cdnjs.cloudflare.com/ajax/libs/Han/3.2.1/han.min.js"></script>',
  render: '<script>document.addEventListener("DOMContentLoaded",function(){Han().initCond().renderRuby()})</script>',
}

Util.XHR([
  './data/sound.min.json',
  './data/reverse.min.json',
  './data/pinyin.min.json',
], ( Sound, Reverse, Romanization ) => {

const { Pinyin, WG } = Romanization

const Vowel = {
   a:  [ 'a', 'ā', 'á', 'ǎ', 'à' ],
   e:  [ 'e', 'ē', 'é', 'ě', 'è' ],
   i:  [ 'i', 'ī', 'í', 'ǐ', 'ì' ],
   o:  [ 'o', 'ō', 'ó', 'ǒ', 'ò' ],
   u:  [ 'u', 'ū', 'ú', 'ǔ', 'ù' ],
  'ü': [ 'ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ' ],
  wg:  [ '⁰', '¹', '²', '³', '⁴' ]
}

Object.assign( Util, {
  annotate( input, pickee=[], doesAvoidMatching=false ) {
    let system = Util.LS.get( 'system' )
    let jinze  = Util.LS.get( 'jinze' ) !== 'no' ? true : false
    let clean  = false
    let az     = []
    let raw    = marked ? marked( input, { sanitize: true }) : input
    let hinst  = Util.hinst( raw, jinze )
    .replace( R.cjk, ( portion, match ) => {
      let zi = match[0]
      let sound = Sound[zi]
      if ( !sound )  return zi

      let isHeter  = sound.length > 1
      let isPicked = false 
      let ret      = sound[0]
      let end      = ''

      if ( isHeter ) {
        let i = az.length
        let picked = pickee[i] || 0
        let doesMatch = picked && picked.zi === zi

        az.push( sound )
        if ( picked && !doesMatch && !doesAvoidMatching ) {
          pickee = []
        } else if ( doesMatch ) {
          isPicked = true
          ret = typeof picked.yin === 'number' ? sound[picked.yin] : picked.yin
        } else if ( doesAvoidMatching ) {
          let deci = parseInt( picked, 16 )
          ret = sound[deci]
          pickee[i] = { zi, yin: deci }
        }
      }

      if (  system === 'pinyin' ) {
        ret = Util.getPinyin( ret )
      } else if ( system === 'wg' ) {
        ret = Util.getWG( ret )
      } else if ( system === 'both' ) {
        ret = Util.getBoth( ret )
      }

      end += isHeter  ? '*' : ''
      end += isPicked ? '*' : ''

      return `\`${ zi }:${ ret + end }~`
    })
    raw = hinst.context.innerHTML
    clean = ( pickee.toString() === '' ) ? true : false
    return { az, raw, clean, pickee }
  },

  getPinyin( sound ) {
    let { yin, diao } = Util.getYD( sound, true )
    let pinyin = Pinyin[ yin ] || sound
    pinyin = pinyin
      .replace( /([aeiouü])+/i, ( v ) => {
        if ( /[aeo]/i.test( v )) {
          return v.replace( /([aeo])/i, ( v ) => Vowel[v][diao] )
        } else if ( /iu/i.test( v )) {
          return v.replace( /u/i, Vowel.u[diao] )
        } else if ( /[iuü]/i.test( v )) {
          return v.replace( /([iuü])/i, ( v ) => Vowel[v][diao] )
        }
        return v
      })
    return pinyin || sound
  },

  getWG( sound ) {
    let { yin, diao } = Util.getYD( sound, true )
    let pinyin = Pinyin[ yin ] || sound
    return ( WG[ pinyin ] || pinyin ) + Vowel.wg[ diao ]
  },

  getBoth( sound ) {
    let pinyin = Util.getPinyin( sound )
    return `${ sound }|${ pinyin }`
  },
})

let Nav = React.createClass({
  togglePref() {
    this.props.parent.toggleUI( 'pref' )
  },

  render() {
    return (
    <nav className='layout'>
      <button className='pref' onClick={this.togglePref}>設定</button>
      <a className='about' href='./about.html'>說明</a>
      <a className='gh-repo' href='//github.com/ethantw/az'>GitHub</a>
    </nav>
    )
  },
})

let IO = React.createClass({
  getInitialState() {
    return {
      current: 0,
      zi: null,
      picking: false,
      pickrXY: {},
    }
  },

  componentWillMount() {
    let def = [
      encodeURIComponent( '用《[萌典][萌]》*半自動*為漢字標音的部分嗎？\n[萌]: https://moedict.tw/萌\n讓媽媽來安裝窗戶。' ),
      '10021'
    ]
    let hash = location.hash.replace( /^#/, '' ) || def.join('/')
    if ( !/\//.test( hash ))  hash += '/0'
    let [ input, pickee ] = hash.split('/')
    input = decodeURIComponent( input )
    pickee = pickee.split('') || [ 0 ]
    this.IO( pickee, input, true )
  },

  componentDidMount() {
    let node = React.findDOMNode( this.refs.input )
    node.focus()
    node.select()
    this.setPref()
  },

  setPref() {
    let node    = React.findDOMNode( this.refs.io )
    let system  = Util.LS.get( 'system' )
    let display = Util.LS.get( 'display' )

    this.IO()
    node.setAttribute( 'data-system',  system  )
    node.setAttribute( 'data-display', display )
  },

  IO( pickee=this.state.pickee, input=this.state.input, doAvoidMatching=false ) {
    let syntax = Util.LS.get( 'syntax' )
    let system = Util.LS.get( 'system' )
    let method = ( syntax === 'simp' && system !== 'both' ) ? 'simple' : 'complex'
    let isntZhuyin = system === 'pinyin' || system === 'wg'

    let result = Util.annotate( input, pickee, doAvoidMatching )
    let { az, raw, clean } = result
    let { code, output }   = Util.wrap[method]( raw, isntZhuyin )
    let url
    pickee = result.pickee

    {
      let key = Object.keys( pickee )
      let p   = [ 0 ]
      for ( let i = 0, end = key[key.length-1]; i <= end; i++ ) {
        p[i] = pickee.hasOwnProperty( i ) ? ( pickee[i].yin ).toString(16) : '0'
      }
      url = `${WWW}#${encodeURIComponent( input )}/${p.join('')}`
    }

    code = syntax === 'han' ? output.__html : code
    code += `\n${
      syntax === 'han' ? LIB.css : `${LIB.css}\n${LIB.js}\n${LIB.render}`
    }\n`
    code = Util.mergeRuby(
      code
      .replace( /<a\-z[^>]*>/gi, '' )
      .replace( /<\/a\-z>/gi, '' )
    )

    this.setState({ input, az, code, output, url, pickee })
    if ( clean )  this.setState({ pickee: [] })
  },

  handleInput( e ) {
    this.setPicking( false )
    this.setState({ input: e.target.value }, this.IO )
  },

  setPicking( sw = true ) {
    let clazz = React.findDOMNode( this.refs.io ).classList
    let method = sw ? 'add' : 'remove'
    clazz[method]( 'picking' )
    this.setState({ picking: sw })
  },

  pickZi( e ) {
    let cleanFormer = () => {
      let former = React.findDOMNode( this.refs.output ).querySelector( 'a-z.picking' )
      if ( former )  former.classList.remove( 'picking' )
      this.setPicking( false )
    }
    let target = e.target
    let az

    if ( target.matches( 'a[href], a[href] *' ) && !( e.metaKey || e.shiftKey || e.ctrlKey || e.altKey )) {
      e.preventDefault()
    }

    cleanFormer()
    az = Pickr.zi( e.target )
    if ( !az )  return

    let current = az.i
    let zi      = az.zi
    let pickrXY = az.style || null
    this.setPicking()
    this.setState({ current, zi, pickrXY })
    Util.listenToLosingFocus( 'a-z *, #pickr *, nav *, #pref *', cleanFormer )
  },

  pickYin( e, i ) {
    let output  = React.findDOMNode( this.refs.output )
    let current = this.state.current
    let pickee  = this.state.pickee
    pickee[current] = {
      zi: this.state.zi,
      yin: i
    }
    this.IO( pickee )
    this.setPicking( false )
  },

  handlePlay() {},

  render() {
    let current = this.state.az[this.state.current] || []
    let utility = [
      { c: 'input', n: '輸入' },
      { c: 'code',  n: '拷貝輸出代碼' },
      { c: 'url',   n: '拷貝網址' },
    ]
    return (
    <main id='io' ref='io' className='layout'>
      <div id='in' ref='in' className='input'>
        <textarea id='input' ref='input' defaultValue={this.state.input} onChange={this.handleInput} />
        <textarea id='code' value={this.state.code} />
        <textarea id='url' value={this.state.url} />
        <ul id='utility'>
          {
          utility.map(( it ) => (
            <li className={ it.c }>
              <button onClick={() => {
                let node     = React.findDOMNode( this.refs['in'] )
                let isLocked = node.classList.contains( 'locked' )
                let textarea = document.getElementById( it.c )
                node.className = it.c + ( isLocked ? ' locked' : '' )
                textarea.focus()
                textarea.select()
                textarea.scrollTop = textarea.scrollHeight
              }}>{ it.n }</button>
            </li>
          ))
          }
          <li className='lock'><button onClick={() => {
            let clazz  = React.findDOMNode( this.refs['in'] ).classList
            let input  = React.findDOMNode( this.refs.input )
            clazz.toggle( 'locked' )
            input.readOnly = !input.readOnly
          }}>輸入框鎖定切換</button></li>
        </ul>
      </div>

      <div id='out'>
        <article ref='output' onClick={this.pickZi} dangerouslySetInnerHTML={this.state.output} />
        <button id='play' title='播放讀音' onClick={this.handlePlay}>播放讀音</button>
        <ul id='pickr' hidden style={this.state.pickrXY}>{
          current.map(( sound, i ) => {
            let display = Util.LS.get( 'display' )
            let rt = display === 'pinyin' ?
              { __html: Util.getPinyin( sound ) }
              :
                Util.wrap.zhuyin( sound, true )
            return <li onClick={( e ) => this.pickYin( e, i )} dangerouslySetInnerHTML={rt} />
          })
        }</ul>
      </div>
    </main>
    )
  },
})

let Page = React.createClass({
  getInitialState() {
    return {
      init:  true,
      pref:  false,
      about: false
    }
  },

  componentDidMount() {
    Han().initCond()
  },

  toggleUI( component ) {
    let clazz = React.findDOMNode( this.refs.body ).classList
    clazz.toggle( component )
    clazz.add( 'not-init' )
    clazz.remove( 'init' )
    this.setState({ init: false })
  },

  render() {
    return (
    <div id='body' ref='body' className='layout init'>
      <Nav parent={this} />
      <IO ref='io' parent={this} />
      <Pref parent={this} io={this.refs.io} />
    </div>
    )
  },
})

let target = document.getElementById( 'page' ) || document.body
React.render( <Page />, target )

})

