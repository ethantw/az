# {table, thead, tbody, tr, th, td, input, div, button
{ button, label, ul, li, span, div, input, textarea } = React.DOM

Sound <- $.getJSON \Sound.json
Reverse <- $.getJSON \Reverse.json

createClass = React.createFactory << React.createClass
Body = createClass do
  getInitialState: -> { value: '認得幾個字？', alt: {} }
  render: -> value = @state.value; div {},
    input { @~onChange, value: value, id: \main, +autoFocus }
    button { id: \speak @~onClick } \▶
    textarea { value: @getRuby value }
    ul {},
      ...for let ch, idx in value
        if Sound[ch]
          li {},
            span {} ch
            ...for let yin, i in Sound[ch]
              label {},
                input { key: "alt-#idx#ch#i" type: \radio name: "alt-#idx#ch#i" value: i, checked: +i is +(@state["alt-#idx#ch"] || 0), onChange: ~> @setState { "alt-#idx#ch": it.target.value } }
                span {} yin
        else span { style: { fontSize: \19px } } ch
  onChange: ({target: { value }}) -> @setState { value }
  onClick: ->
    text = [ Reverse[it] || @state.value[idx] for it, idx in @getSounds! ] * ''
    try
      syn = window.speechSynthesis
      utt = window.SpeechSynthesisUtterance
      u = new utt text
      u.lang = \zh-TW
      syn.speak u
    catch => alert text
  getSounds: -> [ (Sound[ch] || [])[@state["alt-#idx#ch"] || 0] || '' for ch, idx in @state.value ]
  getRuby: -> sounds = @getSounds!; """
    #{ ["#{ if sounds[idx] then "\n<ruby>#ch<rt>#that</rt></ruby>\n" else "#ch" }" for ch, idx in it ] * "" }
    """.replace(/\n+/g, "\n").replace(/^\n+/ '').replace(/\n+$/, '')

$ -> React.render Body!, document.body
