

import Option from './option.jsx'

{

let autoz = require( './convert' )

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
      <blockquote>
        <h-ruby>{ this.state.output }</h-ruby>
        <button id='play' title='播放讀音' onClick={this.handlePlay}>播放讀音</button>
      </blockquote>
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

document.addEventListener(
  'DOMContentLoaded',
  () => React.render( <Page />, document.body )
)

}

