import path from 'path';
// import redis from 'socket.io-redis';

import io from './io';
import queue from './queue';
import joinRoom from './methods/joinRoom';
import evaluateEquation from './methods/evaluateEquation';
import clearQueue from './methods/clearQueue';

// io.adapter( redis( { host: 'localhost', port: 6379 } ) );

io.on( 'connection', function( client ) {
  // client.on( 'disconnect', function( reason ) {
  //   console.log( `Client with id ${client.id} disconnect` );
  // } );

  console.log( `Client connected with id ${client.id}` );

  client.on( 'give name', ( username ) => {
    client.username = username;
  } );

  client.on( 'join room', joinRoom );
  client.on( 'evaluate', evaluateEquation );

  client.on( 'clear queue', clearQueue );
} );
