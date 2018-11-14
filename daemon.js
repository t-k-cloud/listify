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
  "test-root": "./test"
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
        if (is_json_file(q) || is_magic_dir(q))
          if (fname !== magic_json_name)
            ret.push(json_cat(q))
      })
      return ret
    } else if (is_json_file(p)) {
      return [json_cat(p)];
    }
  } else {
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

app.get('/list/*', function (req, res) {
  const path_arr = req.params[0].split('/')
  const root = path_arr.shift()
  const uri = path_arr.join('/')
  const root_dir = root_dir_map[root]
  const p = root_dir + '/' + uri
  console.log('[list] ' + p)
  res.json({
    'env': env(p),
    'list': ls(p)
  })
});

process.on('SIGINT', function() {
  console.log('')
  console.log('Bye bye.')
  process.exit()
})
