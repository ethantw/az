
import R     from './reg.js'
import Util  from './util.js'
import Pickr from './pickr.js'
import Pref  from './pref.jsx'

Util.XHR( './data/sound.min.json',   ( sound ) => {
Util.XHR( './data/reverse.min.json', ( reverse ) => {
Util.XHR( './data/pinyin.min.json',  ( ro ) => {

const Sound   = JSON.parse( sound )
const Reverse = JSON.parse( reverse )

const { Pinyin, WG } = JSON.parse( ro )
const Vowel = {
  a:   [ 'a', 'ā', 'á', 'ǎ', 'à' ],
  e:   [ 'e', 'ē', 'é', 'ě', 'è' ],
  i:   [ 'i', 'ī', 'í', 'ǐ', 'ì' ],
  o:   [ 'o', 'ō', 'ó', 'ǒ', 'ò' ],
  u:   [ 'u', 'ū', 'ú', 'ǔ', 'ù' ],
  'ü': [ 'ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ' ],
  wg:  [ '⁰', '¹', '²', '³', '⁴' ]
}

Object.assign( Util, {
  annotate( input, pickee=[] ) {
    let system = Util.LS.get( 'system' )
    let jinze  = Util.LS.get( 'jinze' ) === 'yes' ? true : false
    let az     = []
    let html   = marked ? marked( input, { sanitize: true }) : input
    let hinst  = Util.jinzify( html, jinze )
    .replace( R.cjk, ( portion, match ) => {
      let zi = match[0]
      let sound = Sound[zi]
      if ( !sound )  return zi

      let isHeter = sound.length > 1 ? '*' : ''
      let ret = sound[0]

      if ( isHeter ) {
        let i = az.length
        let picked = pickee[i]
        az.push( sound )
        ret = picked && picked.zi === zi ?
          ( 
            typeof picked.yin === 'number' ?
              sound[picked.yin]
            :
              picked.yin
          )
          :
            sound[0]
      }
      if (  system === 'pinyin' ) {
        ret = Util.getPinyin( ret ) + isHeter
      } else if ( system === 'wg' ) {
        ret = Util.getWG( ret ) + isHeter
      } else {
        ret = ret + isHeter
      }
      return `\`${ zi }:${ ret }~`
    })
    html = hinst.context.innerHTML
    return { az, html }
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
  }
})

let IO = React.createClass({
  getInitialState() {
    let input     = '用《萌典》半自動為漢字標音的部分嗎？'
    let pickee = {
      0: { zi: '為', yin: 1 },
      3: { zi: '的', yin: 2 },
      4: { zi: '分', yin: 1 },
    }
    let annotated = Util.annotate( input, pickee )
    let output    = Util.wrap.complex( annotated.html )
    let az        = annotated.az
    let current   = 0
    let zi        = null
    let picking   = false
    let pickrXY   = {}

    return { input, output, az, current, zi, pickee, picking, pickrXY }
  },

  handleInput( e ) {
    let input     = e.target.value
    let annotated = Util.annotate( input, this.state.pickee )
    let az        = annotated.az
    let output    = Util.wrap.complex( annotated.html )
    this.setPicking( false )
    this.setState({ input, output, az })
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
    let az

    cleanFormer()
    az = Pickr.zi( e.target )
    if ( !az )  return

    let current = az.i
    let zi      = az.zi
    let pickrXY = az.style || null
    this.setPicking()
    this.setState({ current, zi, pickrXY })
    Util.listenToLosingFocus( 'a-z *, #pickr *', cleanFormer )
  },

  pickYin( e, i ) {
    let output  = React.findDOMNode( this.refs.output )
    let current = this.state.current
    let pickee  = Object.assign( [], this.state.pickee )
    pickee[current] = {
      zi: this.state.zi,
      yin: this.state.az[current][i]
    }
    output = Pickr.yin( output, current, pickee[current].yin )
    this.setState({ output, pickee })
  },

  handlePlay() {},

  render() {
    let current = this.state.az[this.state.current] || []
    return (
    <main id='io' ref='io' className='layout'>
      <textarea defaultValue={this.state.input} rows='7' onChange={this.handleInput} /> 
      <div id='out'>
        <blockquote ref='output' onClick={this.pickZi} dangerouslySetInnerHTML={this.state.output} />

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
  }
})

let Page = React.createClass({
  getInitialState() {
    return {
      init:  true,
      pref:  false,
      about: false
    }
  },

  toggleUI( component ) {
    let clazz  = React.findDOMNode( this.refs.body ).classList
    clazz.toggle( component )
    clazz.add( 'not-init' )
    clazz.remove( 'init' )
    this.setState({ init: false })
  },

  render() {
    return (
    <div id='body' ref='body' className='layout init'>
      <Nav parent={this} />
      <IO parent={this} />
      <Pref parent={this} />
    </div>
    )
  }
})

let target = document.getElementById( 'page' ) || document.body
React.render( <Page />, target )

})
})
})

