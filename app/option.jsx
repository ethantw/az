
let LS = window.localStorage

class Select extends React.Component {
  constructor( props ) {
    super( props )

    const item   = props.item
    const option = props.option
    this.state   = { option, item }

    this.node  = this.node.bind( this )
    this.open  = this.open.bind( this )
    this.close = this.close.bind( this )
    this.handleToggle        = this.handleToggle.bind( this )
    this.listenToLosingFocus = this.listenToLosingFocus.bind( this )
  }

  node() {
    let node  = React.findDOMNode( this.refs.select )
    let clazz = node.classList
    return { node, clazz }
  }

  open() {
    this.node().clazz.add( 'open' )
  }

  close() {
    this.node().clazz.remove( 'open' )
  }

  handleToggle() {
    let { clazz } = this.node()
    let isntOpen = !clazz.contains( 'open' )
    let listener

    if ( isntOpen ) {
      this.open()
      listener = this.listenToLosingFocus()
    } else {
      this.close()
      document.removeEventListener( 'click', listener )
    }
  }

  listenToLosingFocus() {
    let listener = ( e ) => {
      if ( e.target.matches( 'label.open ul *' ))  return
      this.close()
      document.removeEventListener( 'click', listener )
    }
    document.addEventListener( 'click', listener )
    return listener
  }

  render() {
    const name = this.props.name
    const item = this.props.item
    const key  = Object.keys( item )
    let selected = this.state.selected || key[0]

    return <label ref='select'>{ name }
      <button onClick={this.handleToggle}>{ item[selected] }</button>
      <ul className='select'>
      {
        key.map(( key ) => <li
          className={ selected === key ? 'selected' : '' }
          onClick={ () => {
            this.setState({
              selected: key
            })
          }}>{ item[key] }</li> )
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

