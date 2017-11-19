const server = require( 'http' ).createServer( app );
const express = require( 'express' );
const app = express();
const io = require( 'socket.io' )( server );

const port = process.env.PORT || 4200;

server.listen( port, () => {
  try {
    console.clear();
  } catch ( e ) {}

  console.log( `Serving server on localhost:${port}` );
} );

export default io;
