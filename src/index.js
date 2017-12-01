import path from 'path';
// import redis from 'socket.io-redis';

import { io, raspberry as raspberrySocket } from './io';
import queue from './queue';
import joinRoom from './methods/joinRoom';
import { evaluateEquation, nextStep } from './methods/evaluateEquation';
import clearQueue from './methods/clearQueue';
import { log } from 'util';

// io.adapter( redis( { host: 'localhost', port: 6379 } ) );

let raspberry;
let frontend;

io.on( 'connection', function( client ) {
  // client.on( 'disconnect', function( reason ) {
  //   console.log( `Client with id ${client.id} disconnect` );
  // } );

  frontend = client;

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
      console.log( `More than one user tried to connect with username: ${ username }` );
    }
  } );


  joinRoom.call( client, 'pi-1' );
  client.on( 'join room', joinRoom );
  client.on( 'evaluate', evaluateEquation.bind( client, raspberry ) );

  client.on( 'clear queue', clearQueue );

} );


raspberrySocket.on( 'connection', r => {
  console.log( 'Raspberry connected' );

  raspberry = r;

  r.on( 'equation calculated', img => {
    const room = 'room-pi-1';
    io.to( room ).emit( 'robot done', img );

    queue[ room ].shift();

    io.to( room ).emit( 'queue changed', queue[ room ] );

    if ( queue[ room ].length > 0 ) {
      nextStep( room, 0 );
    }
  } );
} );
