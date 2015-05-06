require! fs
{unique, filter} = require \prelude-ls
Sound = JSON.parse fs.readFileSync \Sound.json
CSLD = JSON.parse fs.readFileSync \/Users/audreyt/w/moedict-data-csld/dict-csld.json
for {heteronyms, title} in CSLD | title.length is 1 and not Sound[title]
  Sound[title] = unique [ bopomofo - /<br>.*/ for {bopomofo} in heteronyms ]
Revised = JSON.parse fs.readFileSync \/Users/audreyt/w/moedict-webkit/moedict-data/dict-revised.json
for {heteronyms, title} in CSLD | title.length is 1 and not Sound[title]
  Sound[title] = filter (.length), unique [ bopomofo - /<br>.*/ for {bopomofo} in heteronyms ]
console.log JSON.stringify Sound,,2
