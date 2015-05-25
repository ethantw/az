
import Util from './util'

export default {
  zi( target ) {
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

  yin( node, i ) {
    let az = node.querySelector( `a-z[i='${i}']` )

    if ( az ) {
      az.classList.remove( 'picking' )
      az.classList.add( 'picked' )
    }
  },
}

