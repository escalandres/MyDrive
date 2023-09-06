/*!
 * serve-index
 * Copyright(c) 2011 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

// npm i depd http-errors inherits setprototypeof statuses
var accepts = require('accepts');
var createError = require('http-errors');
var debug = require('debug')('serve-index');
var escapeHtml = require('escape-html');
var fs = require('fs')
  , path = require('path')
  , normalize = path.normalize
  , sep = path.sep
  , extname = path.extname
  , join = path.join;
var Batch = require('batch');
var mime = require('mime-types');
var parseUrl = require('parseurl');
const { convertFileSize, convertFileDate } = require('./convertUnit');
const { getFileIcon, generateIconClasses } = require('./icons');
var resolve = require('path').resolve;

/**
 * Module exports.
 * @public
 */

module.exports = dirRender;

/*!
 * Icon cache.
 */

var cache = {};

/*!
 * Default template.
 */

var defaultTemplate = join(__dirname, 'public', 'directory.html');

/*!
 * Stylesheet.
 */

var defaultStylesheet = join(__dirname, 'public', 'directory.css');

/**
 * Media types and the map for content negotiation.
 */

var mediaTypes = [
  'text/html',
  'text/plain',
  'application/json'
];

var mediaType = {
  'text/html': 'html',
  'text/plain': 'plain',
  'application/json': 'json'
};

/**
 * Serve directory listings with the given `root` path.
 *
 * See Readme.md for documentation of options.
 *
 * @param {String} root
 * @param {Object} options
 * @return {Function} middleware
 * @public
 */

function dirRender(root, options) {
  var opts = options || {};

  // root required
  if (!root) {
    throw new TypeError('dirRender() root path required');
  }

  // resolve root to absolute and normalize
  var rootPath = normalize(resolve(root) + sep);

  var filter = opts.filter;
  var hidden = opts.hidden;
  var icons = opts.icons;
  var stylesheet = opts.stylesheet || defaultStylesheet;
  var template = opts.template || defaultTemplate;
  var view = opts.view || 'tiles';

  return function (req, res, next) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.statusCode = 'OPTIONS' === req.method ? 200 : 405;
      res.setHeader('Allow', 'GET, HEAD, OPTIONS');
      res.setHeader('Content-Length', '0');
      res.end();
      return;
    }

    // parse URLs
    var url = parseUrl(req);
    var originalUrl = parseUrl.original(req);
    var dir = decodeURIComponent(url.pathname);
    var originalDir = decodeURIComponent(originalUrl.pathname);

    // join / normalize from root dir
    var path = normalize(join(rootPath, dir));

    // null byte(s), bad request
    if (~path.indexOf('\0')) return next(createError(400));

    // malicious path
    if ((path + sep).substr(0, rootPath.length) !== rootPath) {
      debug('malicious path "%s"', path);
      return next(createError(403));
    }

    // determine ".." display
    var showUp = normalize(resolve(path) + sep) !== rootPath;

    // check if we have a directory
    debug('stat "%s"', path);
    fs.stat(path, function(err, stat){
      if (err && err.code === 'ENOENT') {
        return next();
      }

      if (err) {
        err.status = err.code === 'ENAMETOOLONG'
          ? 414
          : 500;
        return next(err);
      }

      if (!stat.isDirectory()) return next();

      // fetch files
      debug('readdir "%s"', path);
      fs.readdir(path, function(err, files){
        if (err) return next(err);
        if (!hidden) files = removeHidden(files);
        if (filter) files = files.filter(function(filename, index, list) {
          return filter(filename, index, list, path);
        });
        files.sort();

        // content-negotiation
        var accept = accepts(req);
        var type = accept.type(mediaTypes);

        // not acceptable
        if (!type) return next(createError(406));
        dirRender[mediaType[type]](req, res, files, next, originalDir, showUp, icons, path, view, template, stylesheet);
      });
    });
  };
};

/**
 * Respond with text/html.
 */

dirRender.html = function _html(req, res, files, next, dir, showUp, icons, path, view, template, stylesheet) {
  var render = typeof template !== 'function'
    ? createHtmlRender(template)
    : template

  if (showUp) {
    files.unshift('..');
  }

  // stat all files
  stat(path, files, function (err, stats) {
    if (err) return next(err);

    // combine the stats into the file list
    var fileList = files.map(function (file, i) {
      return { name: file, stat: stats[i] };
    });

    // sort file list
    fileList.sort(fileSort);

    // read stylesheet
    fs.readFile(stylesheet, 'utf8', function (err, style) {
      if (err) return next(err);

      // create locals for rendering
      var locals = {
        directory: dir,
        displayIcons: Boolean(icons),
        fileList: fileList,
        path: path,
        style: style,
        viewName: view
      };

      // render html
      render(locals, function (err, body) {
        if (err) return next(err);
        send(res, 'text/html', body)
      });
    });
  });
};

/**
 * Respond with application/json.
 */

dirRender.json = function _json(req, res, files) {
  send(res, 'application/json', JSON.stringify(files))
};

/**
 * Respond with text/plain.
 */

dirRender.plain = function _plain(req, res, files) {
  send(res, 'text/plain', (files.join('\n') + '\n'))
};

/**
 * Map html `files`, returning an html unordered list.
 * @private
 */

function createHtmlFileList(files, dir, useIcons, view) {
  // generateIconClasses();
  var html = '<div class="table-responsive">'
      + '<table id="fileTable" class="table table-hover borderless">'
      +'<thead>'
          + '<tr>'
            + '<th>Name</th>'
            + '<th>Date Modified</th>'
            + '<th>Size</th>'
          + '</tr>'
        + '</thead>'
        + '<tbody>'
      + (view == 'details' ? (
        '<thead>'
          + '<tr>'
            + '<th>Name</th>'
            + '<th>Date Modified</th>'
            + '<th>Size</th>'
          + '</tr>'
        + '</thead>'
        + '<tbody>') : '');
  html += files.map(function (file) {
    var classes = [];
    var isDir = file.stat && file.stat.isDirectory();
    var path = dir.split('/').map(function (c) { return encodeURIComponent(c); });
    var iconClass = '';
    console.log(file)
    if (useIcons) {
      var ext = extname(file.name);
      console.log('ext',ext.substring(1))
      // iconClass = 'icon-' + ext.substring(1);
      if(file.name === "gitignore" || file.name === "LICENSE") iconClass = 'unknown-icon'
      else iconClass = getFileIcon(ext.toLowerCase());
      console.log('clase',iconClass)
      classes.push('icon');

      if (isDir) {
        classes.push('icon-directory');
      } else {
        var ext = extname(file.name);
        var icon = iconLookup(file.name);

        classes.push('icon');
        classes.push('icon-' + ext.substring(1));

        if (classes.indexOf(icon.className) === -1) {
          classes.push(icon.className);
        }
      }
    }

    path.push(encodeURIComponent(file.name));

    var date = file.stat && file.name !== '..'
      ? file.stat.mtime.toLocaleDateString() + ' ' + file.stat.mtime.toLocaleTimeString()
      : '';
    var size = file.stat && !isDir
      ? file.stat.size
      : '';

    return '<tr title="' + escapeHtml(file.name) + '">'
      + '<td class="name"><i id="" class="i-icon '+ iconClass + '"></i>' + escapeHtml(file.name) + '</td>'
      + '<td class="date">' + escapeHtml(convertFileDate(date)) + '</td>'
      + '<td class="size">' + escapeHtml(convertFileSize(size)) + '</td>'
      + '</tr>';
  }).join('\n');

  html += '</tbody>';
  html += '</table>';
  html += '</div>';

  return html;
}

/**
 * Create function to render html.
 */

function createHtmlRender(template) {
  return function render(locals, callback) {
    // read template
    fs.readFile(template, 'utf8', function (err, str) {
      if (err) return callback(err);

      var body = str
        .replace(/\{style\}/g, locals.style.concat(iconStyle(locals.fileList, locals.displayIcons)))
        .replace(/\{files\}/g, createHtmlFileList(locals.fileList, locals.directory, locals.displayIcons, locals.viewName))
        .replace(/\{directory\}/g, escapeHtml(locals.directory))
        .replace(/\{linked-path\}/g, htmlPath(locals.directory));

      callback(null, body);
    });
  };
}

/**
 * Sort function for with directories first.
 */

function fileSort(a, b) {
  // sort ".." to the top
  if (a.name === '..' || b.name === '..') {
    return a.name === b.name ? 0
      : a.name === '..' ? -1 : 1;
  }

  return Number(b.stat && b.stat.isDirectory()) - Number(a.stat && a.stat.isDirectory()) ||
    String(a.name).toLocaleLowerCase().localeCompare(String(b.name).toLocaleLowerCase());
}

/**
 * Map html `dir`, returning a linked path.
 */

function htmlPath(dir) {
  var parts = dir.split('/');
  var crumb = new Array(parts.length);

  for (var i = 0; i < parts.length; i++) {
    var part = parts[i];

    if (part) {
      parts[i] = encodeURIComponent(part);
      crumb[i] = '<a href="' + escapeHtml(parts.slice(0, i + 1).join('/')) + '">' + escapeHtml(part) + '</a>';
    }
  }

  return crumb.join(' / ');
}

/**
 * Get the icon data for the file name.
 */

function iconLookup(filename) {
  var ext = extname(filename);

  // try by extension
  if (icons[ext]) {
    return {
      className: 'icon-' + ext.substring(1),
      fileName: icons[ext]
    };
  }

  var mimetype = mime.lookup(ext);

  // default if no mime type
  if (mimetype === false) {
    return {
      className: 'icon-default',
      fileName: icons.default
    };
  }

  // try by mime type
  if (icons[mimetype]) {
    return {
      className: 'icon-' + mimetype.replace('/', '-'),
      fileName: icons[mimetype]
    };
  }

  var suffix = mimetype.split('+')[1];

  if (suffix && icons['+' + suffix]) {
    return {
      className: 'icon-' + suffix,
      fileName: icons['+' + suffix]
    };
  }

  var type = mimetype.split('/')[0];

  // try by type only
  if (icons[type]) {
    return {
      className: 'icon-' + type,
      fileName: icons[type]
    };
  }

  return {
    className: 'icon-default',
    fileName: icons.default
  };
}

/**
 * Load icon images, return css string.
 */

function iconStyle(files, useIcons) {
  if (!useIcons) return '';
  var i;
  var list = [];
  var rules = {};
  var selector;
  var selectors = {};
  var style = '';

  for (i = 0; i < files.length; i++) {
    var file = files[i];

    var isDir = file.stat && file.stat.isDirectory();
    var icon = isDir
      ? { className: 'icon-directory', fileName: icons.folder }
      : iconLookup(file.name);
    var iconName = icon.fileName;

    selector = '#files .' + icon.className + ' .name';

    if (!rules[iconName]) {
      rules[iconName] = 'background-image: url(data:image/svg+xml;base64,' + btoa(load(iconName)) + ');';
      selectors[iconName] = [];
      list.push(iconName);
    }

    if (selectors[iconName].indexOf(selector) === -1) {
      selectors[iconName].push(selector);
    }
  }

  for (i = 0; i < list.length; i++) {
    iconName = list[i];
    style += selectors[iconName].join(',\n') + ' {\n  ' + rules[iconName] + '\n}\n';
  }

  return style;
}

/**
 * Load and cache the given `icon`.
 *
 * @param {String} icon
 * @return {String}
 * @api private
 */

function load(icon) {
  if (cache[icon]) return cache[icon];
  return cache[icon] = fs.readFileSync(__dirname + '/public/icons/' + icon, 'base64');
}

/**
 * Normalizes the path separator from system separator
 * to URL separator, aka `/`.
 *
 * @param {String} path
 * @return {String}
 * @api private
 */

function normalizeSlashes(path) {
  return path.split(sep).join('/');
};

/**
 * Filter "hidden" `files`, aka files
 * beginning with a `.`.
 *
 * @param {Array} files
 * @return {Array}
 * @api private
 */

function removeHidden(files) {
  return files.filter(function(file){
    return '.' != file[0];
  });
}

/**
 * Send a response.
 * @private
 */

function send (res, type, body) {
  // security header for content sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')

  // standard headers
  res.setHeader('Content-Type', type + '; charset=utf-8')
  res.setHeader('Content-Length', Buffer.byteLength(body, 'utf8'))

  // body
  res.end(body, 'utf8')
}

/**
 * Stat all files and return array of stat
 * in same order.
 */

function stat(dir, files, cb) {
  var batch = new Batch();

  batch.concurrency(10);

  files.forEach(function(file){
    batch.push(function(done){
      fs.stat(join(dir, file), function(err, stat){
        if (err && err.code !== 'ENOENT') return done(err);

        // pass ENOENT as null stat, not error
        done(null, stat || null);
      });
    });
  });

  batch.end(cb);
}

/**
 * Icon map.
 */

var icons = {
  // base icons
  'default': 'unknown.svg',
  'folder': 'folder.svg',

  // generic mime type icons
  'image': 'img.svg',
  'text': 'txt.svg',
  'video': 'video.svg',

  // generic mime suffix icons
  '+json': 'code.svg',
  '+xml': 'xml.svg',
  '+zip': 'compressed.svg',

  // specific mime type icons
  'application/font-woff': 'font.svg',
  'application/javascript': 'js.svg',
  'application/json': 'code.svg',
  'application/msword': 'word.svg',
  'application/pdf': 'pdf.svg',
  'application/postscript': 'svg.svg',
  'application/rtf': 'word.svg',
  'application/vnd.ms-excel': 'excel.svg',
  'application/vnd.ms-powerpoint': 'ppt.svg',
  'application/vnd.oasis.opendocument.presentation': 'ppt.svg',
  'application/vnd.oasis.opendocument.spreadsheet': 'excel.svg',
  'application/vnd.oasis.opendocument.text': 'word.svg',
  'application/x-7z-compressed': 'compressed.svg',
  'application/x-sh': 'terminal.svg',
  'application/x-font-ttf': 'font.svg',
  'application/x-msaccess': 'database.svg',
  'application/x-shockwave-flash': 'code.svg',
  'application/x-sql': 'database.svg',
  'application/x-tar': 'compressed.svg',
  'application/x-xz': 'compressed.svg',
  'application/xml': 'xml.svg',
  'application/zip': 'compressed.svg',
  'image/svg+xml': 'svg.svg',
  'text/css': 'css.svg',
  'text/html': 'html.svg',
  'text/less': 'code.svg',

  // other, extension-specific icons
  '.accdb': 'database.svg',
  '.apk': 'apk.svg',
  '.app': 'application_xp.svg',
  '.as': 'page_white_actionscript.svg',
  '.asp': 'code.svg',
  '.aspx': 'code.svg',
  '.bat': 'terminal.svg',
  '.bz2': 'compressed.svg',
  '.c': 'code.svg',
  '.cab': 'compressed.svg',
  '.cfm': 'code.svg',
  '.clj': 'code.svg',
  '.cc': 'code.svg',
  '.cgi': 'terminal.svg',
  '.cpp': 'code.svg',
  '.cs': 'code.svg',
  '.db': 'database.svg',
  '.dbf': 'database.svg',
  '.deb': 'compressed.svg',
  '.dll': 'gear.svg',
  '.dmg': 'drive.svg',
  '.docx': 'word.svg',
  '.erb': 'code.svg',
  '.exe': 'exe.svg',
  '.fnt': 'font.svg',
  '.gam': 'controller.svg',
  '.gz': 'compressed.svg',
  '.h': 'code.svg',
  '.ini': 'gear.svg',
  '.iso': 'cd.svg',
  '.jar': 'compressed.svg',
  '.java': 'code.svg',
  '.jsp': 'code.svg',
  '.lua': 'code.svg',
  '.lz': 'compressed.svg',
  '.lzma': 'compressed.svg',
  '.m': 'code.svg',
  '.map': 'map.svg',
  '.msi': 'compressed.svg',
  '.mv4': 'video.svg',
  '.otf': 'font.svg',
  '.pdb': 'database.svg',
  '.php': 'code.svg',
  '.pl': 'code.svg',
  '.pkg': 'compressed.svg',
  '.pptx': 'ppt.svg',
  '.psd': 'img.svg',
  '.py': 'code.svg',
  '.rar': 'compressed.svg',
  '.rb': 'code.svg',
  '.rm': 'video.svg',
  '.rom': 'controller.svg',
  '.rpm': 'compressed.svg',
  '.sass': 'code.svg',
  '.sav': 'controller.svg',
  '.scss': 'code.svg',
  '.srt': 'txt.svg',
  '.tbz2': 'compressed.svg',
  '.tgz': 'compressed.svg',
  '.tlz': 'compressed.svg',
  '.vb': 'code.svg',
  '.vbs': 'code.svg',
  '.xcf': 'img.svg',
  '.xlsx': 'excel.svg',
  '.yaws': 'code.svg'
};


