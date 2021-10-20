#!/usr/bin/env node

const http = require('http');
const proxy_port = 2590;

http.createServer(onRequest).listen(proxy_port);
console.log(`Server up and listening on ${proxy_port}`)

function onRequest(client_req, client_res) {
  
  let options;
  switch (client_req.url) {
//Tarana
    case '/tarana':
      options = {
        hostname: 'peridot.streamguys.com',
        port: 7150,
        path: '/TaranaVHQ.aac',
        method: client_req.method,
        headers: client_req.headers
      };
      break;
//Nhk
    case '/nhk':
      options = {
        hostname: 'proxy',
        port: 80, // This doesnt seem to work getaddrinfo ENOTFOUND proxy proxy:80
        path: 'https://nhkradioakr1-i.akamaihd.net/hls/live/511633/1-r1/1-r1-01.m3u8', // question- how to pass m3u8 url 
        method: client_req.method,
        headers: client_req.headers
      };
// Add the required header
//      options.headers.Referer = 'http://www.nhk.jp'
      break;
// This should be refactored!
    default:
      options = {
        hostname: 'www.nhk.jp',
        port: 80,
        path: client_req.url,
        method: client_req.method,
        headers: client_req.headers
      };
      break;
  }

  var region = 'start "11 12 13 14"'; //pass parameters to sheel script for Tokyo region setting
  const exec = require('child_process').exec, child;
  const myShellScript = exec('/home/volumio/vpn/openvpnclient.sh' + region);
  myShellScript.stdout.on('data', (data)=>{
      console.log(data); 
      // do whatever you want here with data
  });
  myShellScript.stderr.on('data', (data)=>{
      console.error(data);
  });

  const proxy = http.request(options, function(res) {
    client_res.writeHead(res.statusCode, res.headers)
    res.pipe(client_res, {
      end: true
    });
  });

  client_req.pipe(proxy, {
    end: true
  });
}
