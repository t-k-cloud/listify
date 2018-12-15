var process = require('process');
var express = require('express');
var bodyParser = require('body-parser');
var history = require('connect-history-api-fallback'); // handle refresh for SPA
var fs = require('fs-extra') // has extra functions like "rm -f"
var path = require('path')
var expAuth = require('../auth/express-auth.js')

const port = 8820

const magic_json_name = '_list_.json'
const root_dir_map = {
  "feeds": "../feeds",
  "test-root": "./test"
}

const prefix_uri = '/listify'

var app = express();

/* routing support (history mode) */
app.use(history({
  rewrites: [
    { from: /^\/listify\/list\/.*$/, to: '/index.html'},
    { from: /^\/.*$/, to: (c) => {return c.match[0]}}
  ],
  disableDotRule: true,
  verbose: true
}))

/* authentication middleware */
var am = expAuth.middleware
expAuth.init(app, {
	loginRoute: '/auth/login',
	verifyUrl: 'http://localhost/auth/token_verify',
	keyName: 'tk-auth'
})

app.use(express.static('./dist')) /* for /foo (after rewriting) */
app.use(prefix_uri, express.static('./dist')) /* for /listify/foo */
app.use(bodyParser.json())
console.log('Listening on port ' + port)
app.listen(port)

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

function cnt(p) {
  if (fs.existsSync(p)) {
    if (is_magic_dir(p)) {
      const f = fs.readdirSync(p)
      return f.length
    } else {
      return 1;
    }
  }
  return 0;
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
          j['_dir_num_files'] = cnt(q)
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

app.get(prefix_uri + '/list/*', function (req, res) {
  const p = resolve(req.params[0])
  console.log('[list] ' + p)
  res.json({
    'env': env(p),
    'list': ls(p)
  })
}).get(prefix_uri + '/delete/*', am, function (req, res) {
  const p = resolve(req.params[0])
  console.log('[delete] ' + p)
  fs.remove(p, (err) => {
    res.json({'res': err, 'basename': path.basename(p)})
  })
}).get(prefix_uri + '/empty/*', am, function (req, res) {
  const p = resolve(req.params[0])
  console.log('[empty] ' + p)
  var cnt = 0
  ls(p).forEach(j => {
    const fname = j['_file'] || j['_dir']
    const path = p + '/' + fname
    fs.removeSync(path)
    cnt += 1
  })
  res.json({
    'res': `empty (${cnt} items)`,
    'basename': path.basename(p)
  })
}).post(prefix_uri + '/save/*', am, function (req, res) {
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
