
import { cjk } from './reg'
import Util    from './util'
import View    from './view.jsx'

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
    let clean  = false
    let az     = []
    let raw    = marked ? marked( input, { sanitize: true }) : input
    let hinst  = Util.hinst( raw, jinze )
    .replace( cjk, ( portion, match ) => {
      let zi = match[0]
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
    clean = ( pickee.toString() === '' ) ? true : false
    return { az, raw, clean, pickee }
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
React.render( view, target, () => {
})

})

