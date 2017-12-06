import { frontend, rpi } from './io.js';
import { evaluateEquation, calculateEquation } from './methods/evaluateEquation';
import queue from './queue';

let raspberry;

frontend.on( 'connection', ( client ) => {
  console.log( `Client connected with id ’${client.id}’` );

  client.on( 'give name', ( username ) => {
    let isUserWithUsername = false;
    if ( username !== '' ) {
      Object.keys( frontend.sockets.sockets ).forEach( key => {
        const cl = frontend.sockets.sockets[ key ];
        if ( cl.username === username ) {
          isUserWithUsername = true;
        }
      } );
    }

    if ( !isUserWithUsername ) {
      client.username = username;
      client.emit( 'username given' );
      console.log( `Given username ’${ username }’ to user with id ’${ client.id }’` );
    } else {
      client.emit( 'username error' );
      console.log( `More than one user tried to connect with username: ’${ username }’` );
    }

    if ( raspberry ) {
      client.on( 'evaluate', ( data ) => evaluateEquation.call( null, client, raspberry, data ) );
    }
  } );
} );

rpi.on( 'connection', ( raspberryClient ) => {
  raspberry = raspberryClient;

  console.log( 'Raspberry connected' );

  raspberry.on( 'robot step', ( step ) => {
    console.log( `Robot responded with step ’${step}’` );
    frontend.emit( 'robot step', step );
  } );

  raspberry.on( 'robot done', ( data ) => {
    frontend.emit( 'robot done', data );

    const eq = queue.shift();
    console.log( `Robot finished equation: ${eq.mathml}` );

    calculateEquation( raspberry );
    frontend.emit( 'queue changed', queue );
  } );
} );
