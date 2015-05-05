
import Option from './option.jsx'

{

function convert2Ruby( text ) {
  return text
}

let Header = React.createClass({
  render() {
    return <header>
      <button>設定</button>
      <a href='./about.html'>說明</a>
      <a href='//github.com/ethantw/autoruby'>GitHub</a>
    </header>
  }
})

let IO = React.createClass({
  getInitialState() {
    let text = '認得幾個字？'

    return {
      input: text,
      output: convert2Ruby( text )
    }
  },
  render() {
    return <main>
      <textarea>{ this.state.input }</textarea> 
      <button id='play'>播放讀音</button>
      <h-ruby>{ this.state.output }</h-ruby>
    </main>
  }
})

let Page = React.createClass({
  render() {
    return <div id='body'>
      <Header />
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

