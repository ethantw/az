
class SocialBtn extends React.Component {
  constructor( props ) {
    super( props )
  }

  render() {
    const name  = this.props.name
    const clazz = `share ${name.toLowerCase()}`
    const text  = `分享至${name}`
    return (
    <li><button className={clazz} onClick={this.share}>{text}</button></li>
    )
  }
}

class Share extends React.Component {
  constructor( props ) {
    super( props )
  }

  render() {
    return (
    <div id='share'>
      <input id='url' value={this.props.url} readonly />
      <ul>
        <SocialBtn name='Twitter' />
        <SocialBtn name='Facebook' />
        <SocialBtn name='Google' />
        <SocialBtn name='Weibo' />
      </ul>
    </div>
    ) 
  }
}

export default Share

