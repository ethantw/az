
import Util   from './util.js'
import Pickr  from './pickr.js'
import Option from './option.jsx'

const rcjk = Han.TYPESET.char.cjk

Util.XHR( './data/sound.min.json',   ( sound ) => {
Util.XHR( './data/reverse.min.json', ( reverse ) => {

const Sound   = JSON.parse( sound )
const Reverse = JSON.parse( reverse )

Util.annotate = ( input, pickee=[] ) => {
  let az   = []
  let html = Util.jinzify( input ).replace( rcjk, ( zi ) => {
    let yin = Sound[zi]

    if ( !yin )  return zi
    if ( yin.length > 1 ) {
      let i = az.length
      let picked = pickee[i]
      az.push( yin )
      yin = picked && picked.zi === zi ?
        ( typeof picked.yin === 'number' ?
          `*${ yin[picked.yin] }` : `*${ picked.yin }` )
        :
        `*${ yin[0] }`
    }
    return `\`${ zi }:${ yin }~`
  })
  return { az, html }
}


let Nav = React.createClass({
  render() {
    return <nav>
      <button>設定</button>
      <a href='./about.html'>說明</a>
      <a className='gh-repo' href='//github.com/ethantw/az'>GitHub</a>
    </nav>
  }
})

let IO = React.createClass({
  getInitialState() {
    let input     = '漢字標音的部分嗎？'
    let pickee = {
      2: {  zi: '的', yin: 2 },
      3: {  zi: '分', yin: 1 },
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
    let picking   = false
    this.setState({ input, output, az, picking })
  },

  pickZi( e ) {
    let az = Pickr.zi( e.target )
    if ( !az )  return this.setState({ picking: false })

    let current = az.i
    let zi      = az.zi
    let pickrXY = az.style || null
    let picking = true
    this.setState({ current, zi, pickrXY, picking })
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
    return <main id='io'>
      <textarea defaultValue={this.state.input} rows='7' onChange={this.handleInput} /> 
      <div id='out' data-picking={this.state.picking}>
        <blockquote ref='output' onClick={this.pickZi} dangerouslySetInnerHTML={this.state.output} />

        <button id='play' title='播放讀音' onClick={this.handlePlay}>播放讀音</button>
        <ul id='pickr' hidden style={this.state.pickrXY}>{
          current.map(( yin, i ) => {
            return <li key={i}>
              <button onClick={( e ) => this.pickYin( e, i )}>{yin}</button>
            </li>
          })
        }</ul>
      </div>
    </main>
  }
})

let Page = React.createClass({
  render() {
    return <div id='body'>
      <Nav />
      <IO />
      <Option />
    </div>
  }
})

let target = document.getElementById( 'page' ) || document.body
React.render( <Page />, target )

})
})

