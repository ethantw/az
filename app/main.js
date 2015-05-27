
import { cjk } from './reg'
import Util    from './util'
import View    from './view.jsx'

const KEY = {
  '74': 'j',
  '75': 'k',
  '72': 'h',
  '76': 'l',
}

function isPicking( elem ) {
  return ( elem instanceof Element ) ? elem.classList.contains( 'picking' ) : false
}

function pickYin( elem, idx ) {
  try {
    elem.click()
    document.querySelector( `a-z[i='${idx}']` ).classList.add( 'picking' )
  } catch(e) {}
}

document.addEventListener( 'keydown', ( e ) => {
  if ( e.target.matches( '#input' ))  return
  if ( 49 > e.which || e.which > 57 && !Object.keys( KEY ).find(( key ) => parseInt( key ) === e.which ))  return

  let $io = document.getElementById( 'io' )
  let picking = isPicking( $io )
  let $az = Array.from( document.querySelectorAll( 'a-z' ))
  let $current = $az.find( isPicking )
  let idx = ( $current ) ? parseInt( $current.getAttribute( 'i' )) : -1

  let $pickr = document.getElementById( 'pickr' )
  let $yin   = $pickr.querySelector( 'li.current' )
  let isPickrOn = !!$pickr.offsetParent

  switch ( KEY[ e.which ] ) {
    // Pick Zi (heteronym)
    case 'j':
      try {
        $az[idx+1].querySelector('rb').click()
      } catch (e) {}
      break
    case 'k':
      try {
        $az[idx-1].querySelector('rb').click()
      } catch (e) {}
      break
    // Pick Yin
    case 'j':
    case 'h':
      if ( isPickrOn )  pickYin( $yin.previousSibling, idx )
      break
    case 'l':
      if ( isPickrOn )  pickYin( $yin.nextSibling, idx )
      break
    // Pick Yin via order numbers
    default:
      if ( !isPickrOn )  return
      let nth = e.which - 49 + 1
      pickYin(
        $pickr.querySelector( `li:nth-child(${nth})` ) || $pickr.querySelector( 'li:last-child' ),
        idx
      )
  }
})

Util.XHR([
  './data/sound.min.json',
  './data/reverse.min.json',
  './data/pinyin.min.json',
], ( Sound, Reverse, Romanization ) => {

const { Pinyin, WG } = Romanization

const Vowel = {
   a:  [ 'a', 'ā', 'á', 'ǎ', 'à' ],
   e:  [ 'e', 'ē', 'é', 'ě', 'è' ],
   i:  [ 'i', 'ī', 'í', 'ǐ', 'ì' ],
   o:  [ 'o', 'ō', 'ó', 'ǒ', 'ò' ],
   u:  [ 'u', 'ū', 'ú', 'ǔ', 'ù' ],
  'ü': [ 'ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ' ],
  wg:  [ '⁰', '¹', '²', '³', '⁴' ]
}

Object.assign( Util, {
  annotate( input, pickee=[], doesAvoidMatching=false ) {
    let system = Util.LS.get( 'system' )
    let jinze  = Util.LS.get( 'jinze' ) !== 'no' ? true : false
    let az     = []
    let raw    = marked ? marked( input, { sanitize: true }) : input
    let hinst  = Util.hinst( raw, jinze )

    hinst
    .replace( cjk, ( portion, match ) => {
      let zi    = match[0]
      let sound = Sound[zi]
      if ( !sound )  return zi

      let isHeter  = sound.length > 1
      let isPicked = false 
      let ret      = sound[0]
      let end      = ''

      if ( isHeter ) {
        let i = az.length
        let picked = pickee[i] || 0
        let doesMatch = picked && picked.zi === zi

        az.push( sound )
        if ( picked && !doesMatch && !doesAvoidMatching ) {
          pickee = []
        } else if ( doesMatch ) {
          isPicked = true
          ret = typeof picked.yin === 'number' ? sound[picked.yin] : picked.yin
        } else if ( doesAvoidMatching ) {
          let deci = parseInt( picked, 16 )
          ret = sound[deci]
          pickee[i] = { zi, yin: deci }
        }
      }

      if (  system === 'pinyin' ) {
        ret = Util.getPinyin( ret )
      } else if ( system === 'wg' ) {
        ret = Util.getWG( ret )
      } else if ( system === 'both' ) {
        ret = Util.getBoth( ret )
      }

      end += isHeter  ? '*' : ''
      end += isPicked ? '*' : ''

      return `\`${ zi }:${ ret + end }~`
    })
    raw = hinst.context.innerHTML
    return { az, raw, pickee }
  },

  getPinyin( sound ) {
    let { yin, diao } = Util.getYD( sound, true )
    let pinyin = Pinyin[ yin ] || sound
    pinyin = pinyin
      .replace( /([aeiouü])+/i, ( v ) => {
        if ( /[aeo]/i.test( v )) {
          return v.replace( /([aeo])/i, ( v ) => Vowel[v][diao] )
        } else if ( /iu/i.test( v )) {
          return v.replace( /u/i, Vowel.u[diao] )
        } else if ( /[iuü]/i.test( v )) {
          return v.replace( /([iuü])/i, ( v ) => Vowel[v][diao] )
        }
        return v
      })
    return pinyin || sound
  },

  getWG( sound ) {
    let { yin, diao } = Util.getYD( sound, true )
    let pinyin = Pinyin[ yin ] || sound
    return ( WG[ pinyin ] || pinyin ) + Vowel.wg[ diao ]
  },

  getBoth( sound ) {
    let pinyin = Util.getPinyin( sound )
    return `${ sound }|${ pinyin }`
  },
})

let view = React.createElement( View( Util ))
let target = document.getElementById( 'page' ) || document.body
React.render( view, target )

})
