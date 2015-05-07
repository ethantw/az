
const rSep = /\|/
const MARKUP = {
  ruby: '<ruby>|</ruby>',
  rb:   '<rb>|</rb>',
  rtc:  '<rtc>|</rtc>',
  rt:   '<rt>|</rt>'
}

let Util = {
  XHR: function ( url, callback ) {
    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = () => { if ( xhr.readyState === 4 ) callback( xhr.responseText ) }
    xhr.open( 'GET', url, true )
    xhr.send( '' )
  },

  addRT: ( yin ) => MARKUP.rt.replace( rSep, yin ),
  addArb: ( zi, yin ) => zi + ( yin ? Util.addRt( yin ) : '' ),

  hanify: ( html ) => {
    let div = document.createElement( 'div' )
    div.innerHTML = html
    Han( div ).renderRuby()
    return { __html: div.innerHTML }
  },

  simp: ( annotated ) => {
    let html = '<ruby class="zhuyin">' + annotated
      .map(( ru ) => {
        let yin = ru[1] ? ru[1][0] : null
        
        if ( !yin ) return '</ruby>' + ru[0] + '<ruby class="zhuyin">'
        return Util.addArb( ru[0], yin )
      }).join('') + '</ruby>'

    return Util.hanify( html.replace( /<ruby class\=\"zhuyin\"><\/ruby>/gi, '' ))
  },

  complex: ( annotated ) => {
    let rbc = ''
    let rtc = '<rtc class="zhuyin">' + annotated
      .map(( ru ) => {
        let zi  = ru[0]
        let yin = ru[1] ? ru[1][0] : null

        if ( !yin ) {
          rbc += zi
          return ''
        }
        rbc += '<rb>' + zi  + '</rb>'
        return '<rt>' + yin + '</rt>'
      })
      + '</rtc>'
    let html = '<ruby class="complex">' + rbc + rtc + '</ruby>'
    return Util.hanify( html )
  }
}

export default Util

