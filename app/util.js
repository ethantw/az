
const rcjk   = Han.TYPESET.char.cjk
const ranno  = /`([^`:~]*):([^`:~]*)~/gi
const rheter = /^\*/

let Util = {
  XHR( url, done ) {
    let xhr = new XMLHttpRequest()

    xhr.onreadystatechange = () => {
      if ( xhr.readyState === 4 )  done( xhr.responseText )
    }
    xhr.open( 'GET', url, true )
    xhr.send( '' )
  },

  LS: {
    get( id )      {  return window.localStorage.getItem( id )  },
    set( id, val ) {  return window.localStorage.setItem( id, val )  },
  },

  listenToLosingFocus( selector, loseFocus ) {
    let remover
    let listener = ( e ) => {
      if ( e.target.matches( selector ))  return
      loseFocus()
      remover = document.removeEventListener( 'click', listener )
    } 
    document.addEventListener( 'click', listener )
    return remover
  },

  hanify( html ) {
    let div = document.createElement( 'div' )
    div.innerHTML = html
    Han( div ).renderRuby()
    Array.from( div.querySelectorAll( 'a-z' )).map(( az, i ) => az.setAttribute( 'i', i ))
    html = div.innerHTML.replace( /<\/h\-ruby><h\-ruby class=\"zhuyin\">/g, '' )
    return { __html: html }
  },

  jinzify( html ) {
    let div = document.createElement( 'div' )
    div.innerHTML = html
    Han( div ).jinzify()
    return div.innerHTML
  },

  wrap: {
    simple( html ) {
      html = html.replace(
        ranno, ( match, zi, yin ) => {
          let isHeter = rheter.test( yin )
          let arb = `${ zi }<rt>${ yin.replace( rheter, '' ) }</rt>`
          return ( isHeter ) ?
            `<ruby class='zhuyin'><a-z>${ arb }</a-z></ruby>` :
            `<ruby class='zhuyin'>${ arb }</ruby>`
        }
      )
      return Util.hanify( html )
    },

    complex( html ) {
      let rtc = ''
      let rbc = html.replace( ranno, ( match, zi, yin ) => {
        let isHeter = rheter.test( yin )
        let rb  = `<rb>${ zi }</rb>`
        rtc += `<rt>${ yin.replace( rheter, '' ) }</rt>`
        return ( isHeter ) ? `<a-z>${ rb }</a-z>` : rb
      })
      rtc = `<rtc class='zhuyin'>${ rtc }</rtc>`
      html = `<ruby class='complex'>${ rbc + rtc }</ruby>`
      return Util.hanify( html )
    },
  },
}

export default Util

