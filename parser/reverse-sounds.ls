require! fs
Sound = JSON.parse fs.readFileSync \Sound.json
Reverse = {}
for k, v of Sound | v.length is 1
  Reverse[v] ?= k
for k, vs of Sound | vs.length > 1
  for v in vs
    Reverse[v] ?= k
console.log JSON.stringify Reverse,,2
