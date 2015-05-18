
import R from './reg'

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

  rubify( html ) {
    let div = document.createElement( 'div' )
    div.innerHTML = html
    Han( div ).renderRuby()
    Array.from( div.querySelectorAll( 'a-z' )).map(( az, i ) => az.setAttribute( 'i', i ))
    html = div.innerHTML.replace( /<\/h\-ruby><h\-ruby class=\"zhuyin\">/g, '' )
    return { __html: html }
  },

  jinzify( html, jinze ) {
    let div = document.createElement( 'div' )
    div.innerHTML = html
    let ret = Han( div )
    if ( jinze )  ret.jinzify()
    return ret
  },

  getYD( sound, returnDiaoInDigit ) {
    let yin  = sound.replace( R.zhuyin.diao, '' ) || ''
    let diao = sound.replace( yin, '' ) || ''

    if ( returnDiaoInDigit ) {
      if ( !diao ) diao = '1'
      diao = diao
        .replace( 'ˋ', '4' )
        .replace( 'ˇ', '3' )
        .replace( 'ˊ', '2' )
        .replace( '˙', '0' )
    }
    return { yin, diao }
  },

  wrap: {
    simple( html ) {
      html = html.replace(
        R.anno, ( match, zi, yin ) => {
          let isHeter = R.heter.test( yin )
          let arb = `${ zi }<rt>${ yin.replace( R.heter, '' ) }</rt>`
          return ( isHeter ) ?
            `<ruby class='zhuyin'><a-z>${ arb }</a-z></ruby>` :
            `<ruby class='zhuyin'>${ arb }</ruby>`
        }
      )
      return {
        html,
        output: Util.rubify( html ),
      }
    },

    complex( html ) {
      let rtc = ''
      let rbc = html.replace( R.anno, ( match, zi, yin ) => {
        let isHeter = R.heter.test( yin )
        let rb  = `<rb>${ zi }</rb>`
        rtc += `<rt>${ yin.replace( R.heter, '' ) }</rt>`
        return ( isHeter ) ? `<a-z>${ rb }</a-z>` : rb
      })
      rtc = `<rtc class='zhuyin'>${ rtc }</rtc>`
      html = `<ruby class='complex'>${ rbc + rtc }</ruby>`
      return {
        html,
        output: Util.rubify( html ),
      }
    },

    zhuyin( rt, isSelfContained ) {
      let yin  = rt.replace( R.zhuyin.diao, '' ) || ''
      let diao = rt.replace( yin, '' ) || ''
      let len  = yin.length
      let html = `
        <h-zhuyin diao='${ diao }' length='${ len }'>
          <h-yin>${ yin }</h-yin>
          <h-diao>${ diao }</h-diao>
        </h-zhuyin>
      `.replace( /\n\s*/g, '' )
      return isSelfContained ? { __html: `${html}` } : { html, yin, diao, len }
    },

    ru: {
      zhuyin( rb, rt ) {
        rt = Util.wrap.zhuyin( rt )
        return `
          <h-ru zhuyin diao='${ rt.diao }' length='${ rt.len }'>
            ${ rb }
            ${ rt.html }
          </h-ru>
        `.replace( /\n\s*/g, '' )
      },

      pinyin( rb, rt ) {
        let pinyin = PINYIN[ rt ] || rt
        return `
          <h-ru annotation='${ rt }'>
            ${ rb }
            <rt>${ rt }</rt>
          </h-ru>
        `.replace( /\n\s*/g, '' )
      },

      wadegiles( rb, rt ) {
        let pinyin = PINYIN[ rt ] || rt
        return `
          <h-ru annotation='${ rt }'>
            ${ rb }
            <rt>${ rt }</rt>
          </h-ru>
        `.replace( /\n\s*/g, '' )
      },
    },
  },
}

export default Util

