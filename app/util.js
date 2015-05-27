
import R from './reg'

let Util = {
  XHR( url, done ) {
    let data = []
    url = url instanceof Array ? url : [ url ]

    // TODO: substitute with `[].fill()` instead
    for ( let i = 0, up = url.length; i < up; i++ ) {
      data[i] = undefined
    }

    url.forEach( ( url, i ) => {
      let xhr = new XMLHttpRequest()
      xhr.onreadystatechange = () => {
        if ( xhr.readyState === 4 ) {
          data[i] = JSON.parse( xhr.responseText )
          if ( data.every(( data ) => !!data ))  done( ...data )
        }
      }
      xhr.open( 'GET', url, true )
      xhr.send( '' )
    })
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

  mergeRuby( html ) {
    return html.replace( /<\/ruby><ruby\sclass=([\"\'])(zhuyin|pinyin)\1>/gi, '' )
  },

  rubify( html ) {
    let div = document.createElement( 'div' )
    div.innerHTML = Util.mergeRuby( html )
    Han( div ).renderRuby()
    Array.from( div.querySelectorAll( 'a-z' )).map(( az, i ) => az.setAttribute( 'i', i ))
    html = div.innerHTML
    return { __html: html }
  },

  // hinst: Han instance
  hinst( html, jinze=true ) {
    let div = document.createElement( 'div' )
    div.innerHTML = html
    let ret = Han( div )
    return ( jinze ) ? ret.jinzify() : ret
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

  getAZInfo( target ) {
    if ( !target.matches( 'a-z, a-z *' ))  return
    let ru, rb, zi, style, i

    while ( target.nodeName !== 'A-Z' ) {
      target = target.parentNode
    }

    target.classList.add( 'picking' )
    i  = target.getAttribute( 'i' )
    ru = target.querySelector( 'h-ru' ) || target
    rb = target.querySelector( 'rb' )
    zi = ( rb || target ).textContent[0]

    style = {
      left: `${target.offsetLeft}px`,
      top:  `${target.offsetTop}px`,
    }
    return { i, style, zi }
  },

  wrap: {
    simple( raw, isntZhuyin=false ) {
      let clazz = isntZhuyin ? 'pinyin' : 'zhuyin'
      let code = raw.replace(
        R.anno, ( match, zi, yin ) => {
          let isHeter  = R.heter.test( yin )
          let isPicked = R.picked.test( yin ) ? ' picked' : ''
          let arb      = `${ zi }<rt>${ yin.replace( /\*+$/g, '' ) }</rt>`
          return ( isHeter ) ?
            `<a-z class="${ isPicked }"><ruby class="${ clazz }">${ arb }</ruby></a-z>` :
            `<ruby class="${ clazz }">${ arb }</ruby>`
        }
      )
      return {
        code,
        output: Util.rubify( code ),
      }
    },

    complex( raw, isntZhuyin=false ) {
      let clazz = isntZhuyin ? 'pinyin' : 'zhuyin'
      let div = document.createElement( 'div' )
      let code, rbc

      div.innerHTML = raw

      Array
      .from( div.querySelectorAll( '*:not(li) p, li, h1, h2, h3, h4, h5, h6' ))
      .forEach(( elem ) => {
        let [ code, rbc, rtc, rtc2 ] = [ elem.innerHTML, '', '', '' ]

        rbc = code.replace( R.anno, ( match, zi, yin ) => {
          let isHeter  = R.heter.test( yin )
          let isPicked = R.picked.test( yin ) ? 'class="picked"' : ''
          let isBoth   = R.both.test( yin )
          let rb       = `<rb>${ zi }</rb>`

          yin   = yin.replace( /\*+$/g, '' ).split( '|' )
          rtc  += `<rt>${ yin[0] }</rt>`
          rtc2 += isBoth ? `<rt>${ yin[1] }</rt>` : ''
          return isHeter ? `<a-z ${ isPicked }>${ rb }</a-z>` : rb
        })

        elem.innerHTML = `
          <ruby class="complex">${ rbc }
            <rtc class="${ clazz }">${ rtc }</rtc>
            ${ rtc2 ? `<rtc class="pinyin">${ rtc2 }</rtc>` : '' }
          </ruby>
        `.replace( /\n\s+/gi, '' )
      })

      code = div.innerHTML
      return {
        code,
        output: Util.rubify( code ),
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
  },
}

export default Util

