
import Util from './util'

export default {
  zi( target ) {
    if ( !target.matches( 'h-ruby a-z, h-ruby a-z *' ))  return
    let ru, zi, style, i

    while ( target.nodeName !== 'A-Z' ) {
      target = target.parentNode
    }

    target.classList.add( 'picking' )
    i  = target.getAttribute( 'i' )
    ru = target.querySelector( 'h-ru' )
    zi = target.querySelector( 'rb' ).textContent

    style = {
      left: `${ru.offsetLeft}px`,
      top:  `${ru.offsetTop}px`,
    }
    return { i, style, zi }
  },

  yin( node, i ) {
    let az = node.querySelector( `a-z[i='${i}']` )

    if ( az ) {
      az.classList.remove( 'picking' )
      az.classList.add( 'picked' )
    }
  },
}

