import path from 'path';
import redis from 'socket.io-redis';

import io from './io';
import queue from './queue';
import joinRoom from './methods/joinRoom';
import evaluateEquation from './methods/evaluateEquation';
import clearQueue from './methods/clearQueue';

let i = 0;
const steps = [ 'Reaching to 3', 'Reaching to square root', '...', 'Reading from display' ];

io.adapter( redis( { host: 'localhost', port: 6379 } ) );

io.on( 'connection', function( client ) {
  // client.on( 'disconnect', function( reason ) {
  //   console.log( `Client with id ${client.id} disconnect` );
  // } );

  console.log( `Client connected with id ${client.id}` );

  client.on( 'join room', joinRoom );
  client.on( 'evaluate', evaluateEquation );

  client.on( 'clear queue', clearQueue );

  client.on( 'next step', () => {
    if ( queue[ 'room-pi-1' ] && queue[ 'room-pi-1' ].length > 0 ) {
      if ( i <= steps.length - 1 ) {
        io.to( 'room-pi-1' ).emit( 'robot step', steps[ i++ ] );
        return;
      }

      queue[ 'room-pi-1' ].shift();

      io.to( 'room-pi-1' ).emit( 'robot done', { result: 46 } );
      io.to( 'room-pi-1' ).emit( 'queue changed', queue[ 'room-pi-1' ] );
      i = 0;
    }
  } );
} );
