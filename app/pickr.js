
export default {
  zi( target ) {
    if ( !target.matches( 'h-ruby a-z, h-ruby a-z *' ))  return
    let zi, style, i

    while ( target.nodeName !== 'A-Z' ) {
      target = target.parentNode
    }

    i = target.getAttribute( 'i' )
    zi = target.querySelector( 'h-ru' )

    style = {
      left: `${zi.offsetLeft}px`,
      top:  `${zi.offsetTop}px`,
    }
    return { i, style }
  },

  yin( node, i, zhuyin ) {
    node = node.cloneNode( true )
    let yin  = zhuyin.replace( Han.TYPESET.zhuyin.diao, '' )
    let diao = zhuyin.replace( yin, '' )
    let len  = yin.length
    let az   = node.querySelector( `a-z[i='${i}']` )
    let zi   = az.querySelector( 'rb' ).outerHTML

    if ( az ) {
      az.innerHTML = `
        <h-ru zhuyin diao='${ diao }' length='${ len }'>
          ${zi}
          <h-zhuyin>
            <h-yin>${ yin }</h-yin>
            <h-diao>${ diao }</h-diao>
          </h-zhuyin>
        </h-ru>
      `
      .replace( /\n\s*/g, '' )
    }

    let html = node.innerHTML
    return { __html: html }
  },
}

