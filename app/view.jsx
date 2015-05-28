
import R     from './reg'
import Pref  from './pref.jsx'

const WWW = 'https://ethantw.github.io/az/'
const LIB = {
  css:    '<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/Han/3.2.1/han.min.css">',
  js:     '<script src="//cdnjs.cloudflare.com/ajax/libs/Han/3.2.1/han.min.js"></script>',
  render: '<script>document.addEventListener("DOMContentLoaded",function(){Han().initCond().renderRuby()})</script>',
}

export default ( Util ) => {

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

let Speaker = React.createClass({
  render() {
    return (
    <button className='speaker' title='播放讀音' onClick={() => {
      Util.speak( this.props.speak )
    }}>播放讀音</button>
    )
  }
})

let IO = React.createClass({
  getInitialState() {
    return {
      current: 0,
      zi: null,
      currentYin: 0,
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

  componentDidUpdate() {
    if ( !window.SpeechSynthesisUtterance )  return
    let output = React.findDOMNode( this.refs.output )
    Array.from( output.querySelectorAll( '*:not(li) p, li, h1, h2, h3, h4, h5, h6' ))
    .forEach(( elem ) => {
      let system = Util.LS.get( 'system' )
      let holder = document.createElement( 'span' )
      let before = elem.querySelector( '.speaker-holder' )
      let p = elem.cloneNode( true )

      Array.from( p.querySelectorAll( 'h-ru' ))
      .map(( ru ) => {
        let sound = ru.querySelector( 'h-zhuyin, rt' ).textContent
        if ( system === 'pinyin' || system === 'wg' )  sound = Util.getZhuyin( sound, system )
        ru.innerHTML = sound
        return ru
      })

      let speak  = p.textContent.replace( /播放讀音$/, '' )

      holder.classList.add( 'speaker-holder' )
      if ( before )  elem.removeChild( before )
      elem.appendChild( holder )
      React.render( React.createElement( Speaker, { speak }), holder )
    })
  },

  setPref() {
    let node    = React.findDOMNode( this.refs.io )
    let system  = Util.LS.get( 'system' ) || 'zhuyin'
    let display = Util.LS.get( 'display' ) || 'zhuyin'

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
    let { az, raw }      = result
    let { code, output } = Util.wrap[method]( raw, isntZhuyin )
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
    let target = e.target
    let az
    let cleanFormer = () => {
      let former = React.findDOMNode( this.refs.output ).querySelector( 'a-z.picking' )
      if ( former )  former.classList.remove( 'picking' )
      this.setPicking( false )
    }

    if ( target.matches( 'a[href], a[href] *' ) && !( e.metaKey || e.shiftKey || e.ctrlKey || e.altKey )) {
      e.preventDefault()
    }

    cleanFormer()
    az = Util.getAZInfo( e.target )
    if ( !az )  return

    let current    = az.i
    let zi         = az.zi
    let picked     = this.state.pickee[current]
    let currentYin = picked ? picked.yin : 0
    let pickrXY    = az.style || null
    this.setPicking()
    this.setState({ current, currentYin, zi, pickrXY })
    Util.listenToLosingFocus( 'a-z *, #pickr *, nav *, #pref *', cleanFormer )
  },

  pickYin( i ) {
    let output  = React.findDOMNode( this.refs.output )
    let current = this.state.current
    let pickee  = this.state.pickee
    pickee[current] = {
      zi:  this.state.zi,
      yin: i
    }
    this.IO( pickee )
    this.setState({ currentYin: i })
  },

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
        <ul id='pickr' hidden style={this.state.pickrXY}>{
          current.map(( sound, i ) => {
            let currentYin = this.state.currentYin || 0
            let display    = Util.LS.get( 'display' )
            let clazz      = i === currentYin ? 'current' : ''
            let rt         = display === 'pinyin' ?
              { __html: Util.getPinyin( sound ) }
              :
                Util.wrap.zhuyin( sound, true )
            return <li onClick={() => this.pickYin( i )} className={clazz} dangerouslySetInnerHTML={rt} />
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

return Page
}

