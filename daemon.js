var process = require('process');
var express = require('express');
var bodyParser = require('body-parser');
var history = require('connect-history-api-fallback'); // handle refresh for SPA
var fs = require('fs');
var path = require('path')

var app = express();
app.use(history({verbose: true}))
app.use(express.static('./dist'))
app.use(bodyParser.json())
const port = 8820
console.log('Listening on port ' + port)
app.listen(port)

const magic_json_name = '_list_.json'
const root_dir_map = {
  "test-root": "./test",
  "feeds": "../feeder/test",
}

function is_dir(p) {
  if (!fs.existsSync(p)) return false
  var stats = fs.lstatSync(p)
  return stats.isDirectory()
}

function is_file(p) {
  if (!fs.existsSync(p)) return false
  var stats = fs.lstatSync(p)
  return stats.isFile()
}

function get_ext(p) {
  const arr = p.split('.')
  return (arr.length > 0) ? arr.pop() : ''
}

function is_json_file(p) {
  return is_file(p) && get_ext(p) == 'json'
}

function is_magic_dir(p) {
  const try_p = p + '/' + magic_json_name
  return is_dir(p) && is_json_file(try_p)
}

function is_hidden_file(fname) {
  var regex = /_\w+_\.json/g
  var found = fname.match(regex)
  if (found && found.length > 0)
    return true
  else
    return false
}

function json_cat(p) {
  const json = p + '/' + magic_json_name
  if (is_json_file(p)) {
    var s = fs.readFileSync(p).toString()
    return JSON.parse(s)
  } else if (is_json_file(json)) {
    var s = fs.readFileSync(json).toString()
    return JSON.parse(s)
  }
  return {}
}

function ls(p) {
  if (fs.existsSync(p)) {
    if (is_magic_dir(p)) {
      var ret = []
      fs.readdirSync(p).
      forEach((fname) => {
        const q = p + '/' + fname
        if (is_json_file(q) && !is_hidden_file(fname)) {
          var j = json_cat(q)
          j['_file'] = fname // inject file flag
          ret.push(j)
        } else if (is_magic_dir(q)) {
          var j = json_cat(q)
          j['_dir'] = fname // inject dir flag
          ret.push(j)
        }
      })
      return ret
    } else if (is_json_file(p)) {
      var j = json_cat(p)
      j['_file'] = path.basename(p) // inject file flag
      return [j];
    } else {
      console.log(`[no ${magic_json_name}] ${p}`)
    }
  } else {
    console.log(`[not exists] ${p}`)
    return [];
  }
}

function env(p) {
  if (fs.existsSync(p)) {
    if (is_magic_dir(p)) {
      const j = p + '/' + magic_json_name
      return json_cat(j)
    } else if (is_json_file(p)) {
      const j = path.dirname(p) + '/' + magic_json_name
      return json_cat(j);
    }
  } else {
    return {};
  }
}

function resolve(p) {
  const path_arr = p.split('/')
  const root = path_arr.shift()
  const uri = path_arr.join('/')
  const root_dir = root_dir_map[root]
  return root_dir + '/' + uri
}

app.get('/list/*', function (req, res) {
  const p = resolve(req.params[0])
  console.log('[list] ' + p)
  res.json({
    'env': env(p),
    'list': ls(p)
  })
}).get('/delete/*', function (req, res) {
  const p = resolve(req.params[0])
  console.log('[delete] ' + p)
  fs.unlink(p, (err) => {
    res.json({'res': 'successful'})
  })
}).post('/save/*', function (req, res) {
  const p = resolve(req.params[0])
  const json_str = JSON.stringify(req.body)
  console.log('[save] ' + p)
  fs.writeFile(p, json_str, (err) => {
    if (err)
      res.json({'error': err})
    else
      res.json({'successful': p})
  })
});

process.on('SIGINT', function() {
  console.log('')
  console.log('Bye bye.')
  process.exit()
})
