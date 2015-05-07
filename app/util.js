
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

  addRB: ( aZi ) => aZi.map(( zi ) => MARKUP.rb.replace( rSep, zi )).join(''),

  addRTC: ( aYin ) => MARKUP.rtc.replace( rSep, aYin.map(( yin ) => Util.addRT( yin ))),

  addARB: ( zi, yin ) => zi + ( yin ? Util.addRT( yin ) : '' ),
}

export default Util

