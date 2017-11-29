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
    let isUserWithUsername = false;
    Object.keys( io.sockets.sockets ).forEach( key => {
      const cl = io.sockets.sockets[ key ];
      if ( cl.username === username ) {
        isUserWithUsername = true;
      }
    } );

    if ( !isUserWithUsername ) {
      client.username = username;
      client.emit( 'username given' );
    } else {
      client.emit( 'username error' );
      console.log( `More than one user tried to cennect with username: ${ username }` );
    }
  } );


  joinRoom.call( client, 'pi-1' );
  client.on( 'join room', joinRoom );
  client.on( 'evaluate', evaluateEquation );

  client.on( 'clear queue', clearQueue );
} );
