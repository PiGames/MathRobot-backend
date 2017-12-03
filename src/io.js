const server = require( 'http' ).createServer( app );
const express = require( 'express' );
const app = express();
const socket = require( 'socket.io' );

const port = process.env.PORT || 4200;

server.listen( port, () => {
  try {
    console.clear();
  } catch ( e ) {}

  console.log( `Serving server on localhost:${port}` );
} );

export const frontend = socket( server );

export const rpi = socket( server, { path: '/raspberry' } );
