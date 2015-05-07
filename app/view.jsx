
import Util from './util.js'
import Option from './option.jsx'

Util.XHR( '/data/sound.min.json', ( sound ) => {
Util.XHR( '/data/reverse.min.json', ( reverse ) => {

const Sound = JSON.parse( sound )
const Reverse = JSON.parse( reverse )

let annotateYin =( input ) => input.split('').map(( zi ) => [ zi, Sound[ zi ]])

function autoz( input ) {
  let html = '<ruby class="zhuyin">' + annotateYin( input )
    .map(( ru ) => {
      if ( ru[1] instanceof Array ) {
        return Util.addARB( ru[0], ru[1][0] )
      }
      return '</ruby>' + ru[0] + '<ruby class="zhuyin">'
    }).join('') + '</ruby>'

  let div = document.createElement( 'div' )
  div.innerHTML = html
  Han( div ).renderRuby()

  return {
    __html: div.innerHTML
  }
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
    let text = '認得幾個字的部分？'

    return {
      input: text,
      output: autoz( text )
    }
  },

  handleInput( e ) {
    const text = e.target.value

    this.setState({
      input: text,
      output: autoz( text )
    })
  },

  handlePlay() {
  },

  render() {
    return <main id='io'>
      <textarea defaultValue={ this.state.input } rows='7' onChange={this.handleInput} /> 
      <blockquote dangerouslySetInnerHTML={ this.state.output }>
      </blockquote>
      <button id='play' title='播放讀音' onClick={this.handlePlay}>播放讀音</button>
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

let target = document.getElementById( 'page' )
let JSX = () => React.render( <Page />, target )
document.addEventListener( 'DOMContentLoaded', () => JSX )
JSX()

})
})

