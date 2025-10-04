/* ============================================================================
   tests/e2e/server.js
   Simple static file server for SilentWeb E2E fixtures
   ============================================================================ */

import http from "http";
import fs from "fs";
import path from "path";
import url from "url";

const PORT = process.env.PORT || 3000;
const ROOT = path.resolve(process.cwd());

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".opus": "audio/ogg; codecs=opus",
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = `.${parsedUrl.pathname}`;
  let filePath = path.join(ROOT, pathname);

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain");
        res.end("404 Not Found");
      } else {
        const ext = path.extname(filePath).toLowerCase();
        const mime = MIME_TYPES[ext] || "application/octet-stream";
        res.statusCode = 200;
        res.setHeader("Content-Type", mime);
        res.end(data);
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`E2E test server running at http://localhost:${PORT}/`);
});
