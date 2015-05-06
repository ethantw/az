
import Option from './option.jsx'

{

function convert2Ruby( text ) {
  return text
}

let Nav = React.createClass({
  render() {
    return <nav>
      <button>設定</button>
      <a href='./about.html'>說明</a>
      <a href='//github.com/ethantw/autoruby'>GitHub</a>
    </nav>
  }
})

let IO = React.createClass({
  getInitialState() {
    let text = '認得幾個字的部分？'

    return {
      input: text,
      output: convert2Ruby( text )
    }
  },
  render() {
    return <main>
      <textarea defaultValue={ this.state.input } /> 
      <button id='play'>播放讀音</button>
      <h-ruby>{ this.state.output }</h-ruby>
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

