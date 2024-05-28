import http from "http";
import https from "https";

// Salva i riferimenti originali
const originalHttpRequest = http.request;
const originalHttpsRequest = https.request;

type OptionsT = string | http.RequestOptions | URL;

function checkKeepAlive(options: OptionsT) {
  if (!(options as any).agent) {
    return console.warn("No agent detected", options);
  }
  let agent = (options as any).agent;
  console.warn("Checking keep-alive", JSON.stringify(agent.options.keepAlive));
}

// Override della funzione request di HTTP
http.request = function (options, callback) {
  checkKeepAlive(options);
  return originalHttpRequest.call(http, options as any, callback as any);
};

// Override della funzione request di HTTPS
https.request = function (options, callback) {
  checkKeepAlive(options);
  return originalHttpsRequest.call(https, options as any, callback as any);
};

// Ora tutte le richieste HTTP/HTTPS saranno controllate per keep-alive
