
import Util from './util'

class Close extends React.Component {
  constructor( props ) {
    super( props )
    this.closePref = this.closePref.bind( this )
  }

  closePref() {
    this.props.parent.toggleUI( 'pref' )
  }

  render() {
    return (
    <button className='close' onClick={this.closePref}>關閉</button>
    )
  }
}

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
    this.handleToggle = this.handleToggle.bind( this )
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
    let remover = () => {}

    if ( isntOpen ) {
      this.open()
      remover = Util.listenToLosingFocus( 'label.open ul *', this.close )
    } else {
      this.close()
      remover()
    }
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
            Util.LS.set( id, key )
            this.props.io.setPref()
            this.setState({ selected: key })
          }}>{ item[key] }</li> )
      }
      </ul>
    </label>
    )
  }
}

export default class Pref extends React.Component {
  constructor( props ) {
    super( props ) 
    this.state = {
      pref: {
        syntax:   Util.LS.get( 'syntax' )   || 'han',
        han:      Util.LS.get( 'han' )      || 'yes',
        system:   Util.LS.get( 'system' )   || 'zhuyin',
        display:  Util.LS.get( 'display' )  || 'zhuyin',
        markdown: Util.LS.get( 'markdown' ) || 'yes',
        jinze:    Util.LS.get( 'jinze' )    || 'yes',
      },
    }
  }

  render() {
    const io = this.props.io
    const { syntax, han, system, display, markdown, jinze } = this.state.pref

    return (
    <div id='pref' className='layout'>
      <Close parent={this.props.parent} />
      <ul>
        <li>
          <Select io={io} name='代碼生成格式' id='syntax' val={syntax} item={{
            simp: 'HTML5（簡易）',
            rtc:  'HTML5（複合式）',
            han:  '漢字標準格式（已渲染）'
          }} />
        </li>
        <li>
          <Select io={io} name='外連樣式表及腳本' id='han' val={han} item={{
            yes: '啓用',
            no:  '關閉'
          }} />
        </li>
        <li>
          <Select io={io} name='標音系統' id='system' val={system} item={{
            both:   '注音－拼音共同標注',
            zhuyin: '注音符號',
            pinyin: '漢語拼音',
            wg:     '威妥瑪拼音'
          }} />
        </li>
        <li>
          <Select io={io} name='選擇發音時的標音系統' id='display' val={display} item={{
            zhuyin: '注音',
            pinyin: '拼音'
          }} />
        </li>
        <li>
          <Select io={io} name='Markdown' id='markdown' val={markdown} item={{
            yes: '啓用',
            no:  '關閉'
          }} />
        </li>
        <li>
          <Select io={io} name='標點禁則渲染' id='jinze' val={jinze} item={{
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

