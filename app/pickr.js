
let isAZ = ( node ) => node.nodeName === 'A-Z'

export default {
  zi( target ) {
    if ( !target.matches( 'h-ruby a-z, h-ruby a-z *' ))  return
    let zi, style, i

    while ( target.nodeName !== 'A-Z' ) {
      target = target.parentNode
    }

    i = target.getAttribute( 'i' )
    zi = target.querySelector( 'h-ru' )

    return {
      i,
      style: {
        left: `${zi.offsetLeft}px`,
        top:  `${zi.offsetTop}px`
      },
    }
  },

  yin( e ) {},
}

