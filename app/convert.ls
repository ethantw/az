
const XHR = ( url, callback ) ->
  xhr = new XMLHttpRequest()
  xhr.onreadystatechange = () ->
    if xhr.readyState === 4 then callback( xhr.responseText )

  xhr.open \GET, url, yes
  xhr.send null


XHR( \./data/sound.json )

module.exports = ( input ) ->

