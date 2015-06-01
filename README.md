# az
az, which stands for ‘Accurate Zhuyin’, is a small web tool generating accurate `<ruby>` markups with HTML5 polyfill semi-automatically.

## Featuring
- [CSLD](http://chinese-linguipedia.org/) Mandarin pronunciation
- Reads aloud for heteronym check
- Compiles Markdown/CommonMark
- Supports Simplified and variant Hanzi
- Selectable Zhuyin, Pinyin or Wade-Giles
- Simple and complex HTML5 or rendered Han.css syntax
- Permalinks
- Vim keybinding


## Requirements
- Node.js/io.js stable
    * LiveScript 1.4.0

## Development
- Install `sudo npm install`
- Build `gulp www`
- Deploy `gulp deploy`
- Start server & watch files `gulp dev` (runs in http://localhost:7654)
 
## Licensing
MIT License
