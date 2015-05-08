
import Util from './util.js'
import Option from './option.jsx'

const rcjk = Han.TYPESET.char.cjk

Util.XHR( '/data/sound.min.json', ( sound ) => {
Util.XHR( '/data/reverse.min.json', ( reverse ) => {

const Sound = JSON.parse( sound )
const Reverse = JSON.parse( reverse )

Util.annotate = ( input ) => Util.jinzify( input ).replace( rcjk, ( zi ) => {
  let yin = ( Sound[zi] ) ? Sound[zi].join('|') : null
  return yin ? `\`${ zi }:${ yin }~` : zi
})

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
      output: Util.wrap.complex(Util.annotate( text ))
    }
  },

  handleInput( e ) {
    const text = e.target.value

    this.setState({
      input: text,
      output: Util.wrap.complex(Util.annotate( text ))
    })
  },

  handlePlay() {
  },

  render() {
    return <main id='io'>
      <textarea defaultValue={this.state.input} rows='7' onChange={this.handleInput} /> 
      <blockquote dangerouslySetInnerHTML={this.state.output} />
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

let target = document.getElementById( 'page' ) || document.body
React.render( <Page />, target )

})
})

