
const LS = window.localStorage

class Select extends React.Component {
  constructor( props ) {
    super( props )
    const item = props.item
    const option = props.option
    this.state = { option, item }
  }

  render() {
    const name = this.props.name
    const item = this.props.item
    const val = Object.keys( item )
    let { key, selected } = this.state
    selected = selected || val[0]

    return <label>{ name }
      <button>{ item[selected] }</button>
      <ul className='select' hidden>
      {
        val.map(( opt ) => <li key={opt}> { item[opt] } </li> ) 
      }
      </ul>
    </label>
  }
}

let Close = React.createClass({
  closeOption() {
    this.props.parent.toggleUI( 'option' )
  },

  render() {
    return <button className='close' onClick={this.closeOption}>關閉</button>
  }
})

export default class Option extends React.Component {
  render() {
    const { syntax, system, display } = this.props
    return <div id='option' className='layout'>
    <Close parent={this.props.parent} />
    <ul>
      <li>
        <Select name='代碼格式' option={{ syntax }} item={{
          simp: 'HTML5（簡易）',
          rtc:  'HTML5（複合式）',
          han:  '漢字標準格式（已渲染）'
        }} />
      </li>

      <li>
        <Select name='標音系統' option={{ system }} item={{
          both:   '注音－拼音共同標注',
          zhuyin: '注音符號',
          pinyin: '漢語拼音',
          wade:   '威妥瑪拼音'
        }} />
      </li>

      <li>
        <Select name='多音字顯示標音' option={{ display }} item={{
          zhuyin: '注音',
          pinyin: '拼音'
        }} />
      </li>
    </ul>
    <Close parent={this.props.parent} />
    </div>
  }
}

Option.defaultProps = {
  syntax:  LS.getItem( 'syntax' )  || 'rtc',
  system:  LS.getItem( 'system' )  || 'zhuyin',
  display: LS.getItem( 'display' ) || 'zhuyin'
}

