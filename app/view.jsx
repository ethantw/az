
import Util   from './util.js'
import Pickr  from './pickr.js'
import Option from './option.jsx'

const rcjk = Han.TYPESET.char.cjk

Util.XHR( '/data/sound.min.json',   ( sound ) => {
Util.XHR( '/data/reverse.min.json', ( reverse ) => {

const Sound   = JSON.parse( sound )
const Reverse = JSON.parse( reverse )

Util.annotate = ( input ) => {
  let az   = []
  let html = Util.jinzify( input ).replace( rcjk, ( zi ) => {
    let yin = Sound[zi]

    if ( !yin )  return zi
    if ( yin.length > 1 )  {
      az.push( yin )
      yin = `*${ yin[0] }`
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
    let input     = '認得幾個字的部分？'
    let annotated = Util.annotate( input )
    let az        = annotated.az
    let output    = Util.wrap.complex( annotated.html )
    let current   = 0
    let picking   = false
    let pickrXY   = {}
    return { input, output, az, current, picking, pickrXY }
  },

  handleInput( e ) {
    let input     = e.target.value
    let annotated = Util.annotate( input )
    let az        = annotated.az
    let output    = Util.wrap.complex( annotated.html )
    this.setState({ input, output, az })
  },

  pickZi( e ) {
    let az = Pickr.zi( e.target )
    if ( !az )  return this.setState({ picking: false })

    let current = az.i
    let pickrXY = az.style || null
    let picking = true
    this.setState({ current, pickrXY, picking })
  },

  pickYin( e, i ) {
    Pickr.yin( e.target )
    let current = this.state.current
    let pickee  = this.state.az[current][i]
    alert(pickee)
  },

  handlePlay() {},

  render() {
    return <main id='io'>
      <textarea defaultValue={this.state.input} rows='7' onChange={this.handleInput} /> 
      <div id='out' data-picking={this.state.picking}>
        <blockquote onClick={this.pickZi} dangerouslySetInnerHTML={this.state.output} />
        <button id='play' title='播放讀音' onClick={this.handlePlay}>播放讀音</button>
        <ul id='pickr' hidden style={this.state.pickrXY}>{
          this.state.az[this.state.current].map(( yin, i ) => {
            return <li key={i} onClick={( e ) => this.pickYin( e, i )}>{yin}</li>
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

