
let LS = window.localStorage
let getLS = ( id )      => LS.getItem( id )
let setLS = ( id, val ) => LS.setItem( id, val )

class Select extends React.Component {
  constructor( props ) {
    super( props )

    const item   = props.item
    const pref   = props.pref
    let selected = props.val
    this.state   = { pref, item, selected }

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
    const id   = this.props.id
    const name = this.props.name
    const item = this.props.item
    const key  = Object.keys( item )
    let selected = this.state.selected || key[0]

    return (
    <label ref='select'>{ name }
      <button onClick={this.handleToggle}>{ item[selected] }</button>
      <ul className='select'>
      {
        key.map(( key ) => <li
          className={ selected === key ? 'selected' : '' }
          onClick={ () => {
            setLS( id, key )
            this.setState({
              selected: key
            })
          }}>{ item[key] }</li> )
      }
      </ul>
    </label>
    )
  }
}

let Close = React.createClass({
  closePref() {
    this.props.parent.toggleUI( 'pref' )
  },

  render() {
    return (
    <button className='close' onClick={this.closePref}>關閉</button>
    )
  }
})

export default class Pref extends React.Component {
  constructor( props ) {
    super( props ) 
    this.state = {
      pref: {
        syntax:  getLS( 'syntax' )  || 'han',
        system:  getLS( 'system' )  || 'zhuyin',
        display: getLS( 'display' ) || 'zhuyin',
        jinze:   getLS( 'jinze' )   || 'yes',
      },
    }
  }

  render() {
    const { syntax, system, display, jinze } = this.state.pref
    return (
    <div id='pref' className='layout'>
      <Close parent={this.props.parent} />
      <ul>
        <li>
          <Select name='代碼生成格式' id='syntax' val={syntax} item={{
            simp: 'HTML5（簡易）',
            rtc:  'HTML5（複合式）',
            han:  '漢字標準格式（已渲染）'
          }} />
        </li>
        <li>
          <Select name='標音系統' id='system' val={system} item={{
            both:   '注音－拼音共同標注',
            zhuyin: '注音符號',
            pinyin: '漢語拼音',
            wade:   '威妥瑪拼音'
          }} />
        </li>
        <li>
          <Select name='選擇發音時的標音系統' id='display' val={display} item={{
            zhuyin: '注音',
            pinyin: '拼音'
          }} />
        </li>
        <li>
          <Select name='標點禁則渲染' id='jinze' val={jinze} item={{
            yes: '啓用',
            no:  '關閉'
          }} />
        </li>
      </ul>
      <Close parent={this.props.parent} />
    </div>
    )
  }
}

