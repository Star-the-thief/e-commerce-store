#!/usr/bin/env node
'use strict';

/**
 * Minimal zero-dependency static server for local preview of dist/.
 * Not needed in production — dist/ is a plain static folder that any host
 * serves directly. This exists only so `npm start` works out of the box.
 *
 *   node serve.js [port]     default 4173
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'dist');
const PORT = parseInt(process.argv[2], 10) || 4173;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function send(res, status, body, type) {
  res.writeHead(status, {
    'Content-Type': type || 'text/plain; charset=utf-8',
    'Cache-Control': 'no-cache',
  });
  res.end(body);
}

http
  .createServer((req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    } catch (e) {
      return send(res, 400, 'Bad request');
    }

    // Resolve, then confirm the result is still inside dist/ before reading.
    let target = path.normalize(path.join(DIST, pathname));
    if (!target.startsWith(DIST)) return send(res, 403, 'Forbidden');

    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
      target = path.join(target, 'index.html');
    }

    if (!fs.existsSync(target)) {
      // Mirror the production 404 behaviour (see dist/_redirects, .htaccess).
      const notFound = path.join(DIST, '404.html');
      if (fs.existsSync(notFound)) {
        return send(res, 404, fs.readFileSync(notFound), TYPES['.html']);
      }
      return send(res, 404, 'Not found');
    }

    const ext = path.extname(target).toLowerCase();
    send(res, 200, fs.readFileSync(target), TYPES[ext] || 'application/octet-stream');
  })
  .listen(PORT, () => {
    console.log(`Hadaf Venture — serving dist/ at http://localhost:${PORT}`);
  });
