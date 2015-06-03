
import R     from './reg'
import Pref  from './pref.jsx'
import Share from './share.jsx'

const WWW = 'https://az.hanzi.co/'
const LIB = {
  css:    '<link rel="stylesheet" href="//az.hanzi.co/201505/han.ruby.css">',
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

let Pickr = React.createClass({
  componentDidUpdate() {
    let out   = document.querySelector( '#io article' )
    let pickr = document.getElementById( 'pickr' )
    let X     = parseInt( pickr.offsetLeft, 10 ) || parseInt( pickr.style.left, 10 )

    pickr.style.right = 'auto'

    // Make sure the Pickr stay inside the output area
    if (( pickr.offsetWidth + X ) > out.offsetWidth ) {
      pickr.style.left  = 'auto'
      pickr.style.right = '1em'
    }
  },

  render () {
    let IO      = this.props.IO
    let current = IO.state.az[IO.state.current] || []
    return (
    <ul id='pickr' hidden style={this.props.style}>{
      current.map(( sound, i ) => {
        let currentYin = IO.state.currentYin || 0
        let display    = Util.LS.get( 'display' )
        let clazz      = i === currentYin ? 'current' : ''
        let rt         = display === 'pinyin' ?
          { __html: Util.getPinyin( sound ) }
          :
            Util.wrap.zhuyin( sound, true )
        return <li onClick={() => IO.pickYin( i )} className={clazz} dangerouslySetInnerHTML={rt} />
      })
    }</ul>
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
      encodeURIComponent(
`用《[萌典](https://moedict.tw/)》*半自動*為漢字[#的部分](https://twitter.com/?q=#的部分)來標注發音嗎？

讓媽媽——\\
來，安裝窗戶。`
      ),
      '121'
    ]

    // Do not use `location.hash` for Firefox decodes URI improperly
    let saved = Util.LS.get( 'saved' ) || null
    let hash = location.href.split('#')[1] || saved || def.join('/')
    hash += /\//.test( hash ) ? '' : '/0'

    let [ input, pickee ] = hash.split('/')

    input  = decodeURIComponent( input )
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
    let output = React.findDOMNode( this.refs.output )
    Array.from( output.querySelectorAll( '*:not(li) p, li, h1, h2, h3, h4, h5, h6' ))
    .forEach(( elem ) => {
      let holder = document.createElement( 'span' )
      let before = elem.querySelector( '.speaker-holder' )
      let p = elem.cloneNode( true )

      Array.from( p.querySelectorAll( 'h-ru, ruby' ))
      .map(( ru ) => {
        let zi = ru.textContent
          .replace( Han.TYPESET.group.western, '' )
          .replace( /[⁰¹²³⁴]/gi, '' )
          .replace( new RegExp( `${Han.UNICODE.zhuyin.base}`, 'gi' ), '' )
          .replace( new RegExp( `${Han.UNICODE.zhuyin.tone}`, 'gi' ), '' )
          //.replace( new RegExp( `${Han.UNICODE.zhuyin.ruyun}`, 'gi' ), '' )
        ru.innerHTML = zi

        // Use stored and picked Yin if it’s heteronym
        if ( ru.matches( 'a-z *' )) {
          let az = ru.parentNode
          while ( !az.matches( 'a-z' )) {
            az = az.parentNode 
          }
          let i  = az.getAttribute( 'i' )
          let picked = this.state.pickee[i] ? this.state.pickee[i].yin : 0
          let sound = this.state.az[i][picked].replace( /^˙(.+)$/i, '$1˙' )
          ru.innerHTML = `|${sound}|`
        }
        return ru
      })

      let speak  = p.textContent
        .replace( /播放讀音$/, '' )
        .replace( /#/g, ' hashtag ' )

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
    let han    = Util.LS.get( 'han' ) !== 'no' ? true : false
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
        p[i] = pickee.hasOwnProperty( i ) ? ( pickee[i].yin || 0 ).toString(16) : '0'
      }
      url = `${WWW}#${encodeURIComponent( input )}/${p.join('')}`
    }

    code = syntax === 'han' ? output.__html : code
    if ( han ) {
      code += `\n${
        syntax === 'han' ? LIB.css : `${LIB.css}\n${LIB.js}\n${LIB.render}`
      }\n`
    }
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

    pickee[current] = { zi: this.state.zi, yin: i }
    this.IO( pickee )
    this.setState({ currentYin: i }, () => {
      document.querySelector( `a-z[i='${current}']` ).classList.add( 'picking' )
    })
  },

  render() {
    let utility = [
      { c: 'input', n: '輸入' },
      { c: 'code',  n: '拷貝輸出代碼' },
      { c: 'share', n: '分享' },
    ]
    return (
    <main id='io' ref='io' className='layout'>
      <div id='in' ref='in' className='input'>
        <textarea id='input' ref='input' defaultValue={this.state.input} onChange={this.handleInput} />
        <textarea id='code' value={this.state.code} />
        <Share url={this.state.url} />

        <ul id='utility'>
          {
          utility.map(( it ) => (
            <li className={ it.c }>
              <button onClick={() => {
                let node     = React.findDOMNode( this.refs['in'] )
                let isLocked = node.classList.contains( 'locked' )
                let textarea = document.getElementById( it.c !== 'share' ? it.c : 'url' )
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
        <Pickr style={this.state.pickrXY} IO={this} />
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

