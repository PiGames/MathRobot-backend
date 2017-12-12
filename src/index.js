import { frontend, rpi } from './io.js';
import { evaluateEquation, calculateEquation, breakQueue, disableError } from './methods/evaluateEquation';
import queue from './queue';

let raspberry;
let isRPiDead = true;

frontend.on( 'connection', ( client ) => {
  console.log( `Client connected with id ’${client.id}’` );
  client.emit( 'queue changed', queue );

  if ( isRPiDead ) {
    client.emit( 'service is down' );
  } else {
    client.emit( 'service is up' );
  }

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
      client.emit( 'username given', username );
      console.log( `Given username ’${ username }’ to user with id ’${ client.id }’` );
    } else {
      client.emit( 'username error' );
      console.log( `More than one user tried to connect with username: ’${ username }’` );
    }
  } );

  client.on( 'evaluate', ( data ) => {
    if ( !isRPiDead ) {
      evaluateEquation( client, raspberry, data );
    }
  } );
} );

rpi.on( 'connection', ( raspberryClient ) => {
  raspberry = raspberryClient;
  console.log( 'rpi is alive' );
  isRPiDead = false;
  frontend.emit( 'service is up' );

  disableError();

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

  raspberry.on( 'arduino error', () => {
    breakQueue( frontend );
  } );

  raspberry.on( 'rpi is dead', () => {
    console.log( 'rpi is dead' );
    isRPiDead = true;
    frontend.emit( 'service is down' );
  } );

  raspberry.on( 'rpi is alive', () => {
    console.log( 'rpi is alive' );
    isRPiDead = false;
    frontend.emit( 'service is up' );
  } );

  raspberry.on( 'disconnect', ( reason ) => {
    console.log( reason );
    if ( Object.keys( rpi.sockets.clients().connected ).length === 0 ) {
      console.log( 'rpi is dead' );
      isRPiDead = true;
      frontend.emit( 'service is down' );
    }

    breakQueue( frontend );
  } );
} );
