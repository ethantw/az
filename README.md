# az
a.z. stands for ‘Accurate Zhuyin’. It is a small web tool that helps generate accurate `<ruby>` markups in Mandarin semi-automatically. (With the extra support of HTML5 polyfill)

Try out now: <https://az.hanzi.co>.

## Featuring
- [CSLD](http://chinese-linguipedia.org/) Mandarin pronunciation
- Reads aloud for heteronym check
- Compiles Markdown/CommonMark
- Supports Traditional, Simplified and variant Hanzi
- Selectable Zhuyin (MPS), Pinyin or Wade-Giles
- Syntax in both HTML5 or rendered Han.css (recommended)
- Permalinks
- Vim keybinding (<kbd>J</kbd>/<kbd>K</kbd> and <kbd>L</kbd>/<kbd>H</kbd>)


## Requirements
- Node.js/io.js stable
    * LiveScript 1.4.0

## Development
- Install `sudo npm install`
- Build `gulp www`
- Deploy `gulp deploy`
- Start server & watch files `gulp dev` (http://localhost:7654)
 
## License
The MIT License
