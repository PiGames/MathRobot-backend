const server = require( 'http' ).createServer( app );
const express = require( 'express' );
const app = express();
const io = require( 'socket.io' )( server );

server.listen( 4200, () => {
  try {
    console.clear();
  } catch ( e ) {}

  console.log( 'Serving server on localhost:4200' );
} );

export default io;
