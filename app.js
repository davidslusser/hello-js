'use strict';

const http = require('node:http');
const os = require('node:os');

const processStartTime = new Date();
const startTime = `${processStartTime.toISOString().slice(0, 19).replace('T', ' ')} UTC`;
const hostname = os.hostname();
const imageTag = process.env.IMAGE_TAG || 'unknown';

function formatUptime(seconds) {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainder = totalSeconds % 60;
  const twoDigits = (value) => String(value).padStart(2, '0');
  const time = `${twoDigits(hours)}h ${twoDigits(minutes)}m ${twoDigits(remainder)}s`;
  return days ? `${days}d ${time}` : time;
}

function getUptime() {
  return formatUptime((Date.now() - processStartTime.getTime()) / 1000);
}

function getAppInfo() {
  return {
    hostname,
    start_time: startTime,
    uptime: getUptime(),
    version: imageTag,
  };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function renderHtml(info) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Hello JavaScript!</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
  <style>
    body {
      background: linear-gradient(135deg, #202124 0%, #323330 50%, #59522a 100%);
      color: #fff;
      font-family: Arial, sans-serif;
      min-height: 100vh;
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .center-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .js-icon { color: #f7df1e; font-size: 64px; margin-bottom: 20px; }
    h1 { color: #fff; text-align: center; }
    strong { color: #f7df1e; }
    ul { list-style-type: none; padding: 0; }
    li { margin-bottom: 24px; text-align: center; overflow-wrap: anywhere; }
  </style>
</head>
<body>
  <main class="center-container">
    <div class="js-icon" aria-hidden="true"><i class="fa-brands fa-js"></i></div>
    <h1><strong>Hello JavaScript!</strong></h1>
    <ul>
      <li><strong>Hostname:</strong><br>${escapeHtml(info.hostname)}</li>
      <li><strong>Start Time:</strong><br>${escapeHtml(info.start_time)}</li>
      <li><strong>Uptime:</strong><br>${escapeHtml(info.uptime)}</li>
      <li><strong>Image Tag:</strong><br>${escapeHtml(info.version)}</li>
    </ul>
  </main>
</body>
</html>`;
}

function requestHandler(req, res) {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const isHead = req.method === 'HEAD';

  if (req.method !== 'GET' && !isHead) {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8', Allow: 'GET, HEAD' });
    res.end('Method Not Allowed');
    return;
  }

  let body;
  let contentType;
  if (pathname === '/') {
    body = renderHtml(getAppInfo());
    contentType = 'text/html; charset=utf-8';
  } else if (pathname === '/api') {
    body = JSON.stringify(getAppInfo());
    contentType = 'application/json; charset=utf-8';
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(isHead ? undefined : 'Not Found');
    return;
  }

  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(isHead ? undefined : body);
}

function createServer() {
  return http.createServer(requestHandler);
}

if (require.main === module) {
  const port = Number(process.env.PORT || 8000);
  createServer().listen(port, '0.0.0.0', () => {
    console.log(`Hello JavaScript listening on port ${port}`);
  });
}

module.exports = { createServer, escapeHtml, formatUptime };
