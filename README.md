# Footurama Package: Inspector

This package includes an inspector for debugging your Footurama network.

### ftrm-inspector

Start a new HTTP server serving the inspector.

Configuration:

 * `input`: **0**.
 * `output`: **0**.
 * `bind`: Object defining the listen options for the HTTP server. Default: `{host: '::1', port: 3876}`. For further information cf. the [Node.js docs](https://nodejs.org/docs/latest-v12.x/api/net.html#net_server_listen_options_callback).

Example:

```js
// Start a new inspector
module.exports = [require('ftrm-inspector'), {}];
```
