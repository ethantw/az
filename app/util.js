
const rcjk = Han.TYPESET.char.cjk
const ranno = /`([^`:~]*):([^`:~]*)~/gi

let Util = {
  XHR( url, done ) {
    let xhr = new XMLHttpRequest()

    xhr.onreadystatechange = () => {
      if ( xhr.readyState === 4 )  done( xhr.responseText )
    }
    xhr.open( 'GET', url, true )
    xhr.send( '' )
  },

  hanify( html ) {
    let div = document.createElement( 'div' )
    div.innerHTML = html
    Han( div ).renderRuby()
    return { __html: div.innerHTML }
  },

  jinzify( html ) {
    let div = document.createElement( 'div' )
    div.innerHTML = html
    Han( div ).jinzify()
    return div.innerHTML
  },

  wrap: {
    simp( html ) {
      html = html.replace(
        ranno, ( match, zi, yin ) => {
          let all = yin.split( '|' )
          let az  = ( all.length > 1 ) ? `data-yin='${ yin }'` : ''

          return `<ruby class='zhuyin'><a-z ${ az }>${ zi }<rt>${ all[0] }</rt></a-z></ruby>`
        }
      ).replace( /<\/ruby><ruby class=\'zhuyin\'>/g, '' )
      return Util.hanify( html )
    },

    complex( html ) {
      let rtc = ''
      let rbc = html.replace( ranno, ( match, zi, yin ) => {
        let all = yin.split( '|' )
        let az  = ( all.length > 1 ) ? ` data-yin='${ yin }'` : ''

        rtc += `<rt>${ all[0] }</rt>`
        return `<rb ${ az }>${ zi }</rb>`
      })
      rtc = `<rtc class='zhuyin'>${rtc}</rtc>`
      html = `<ruby class='complex'>${ rbc + rtc }</ruby>`
      return Util.hanify( html )
    },
  },
}

export default Util

