import { frontend } from '../io.js';
import queue from '../queue';

let hasError = false;

const hasUserAlreadySubmitted = ( client ) => {
  return queue.find( q => q.user.id === client.id ) !== undefined;
};

export const calculateEquation = ( raspberry ) => {
  if ( queue.length > 0 ) {
    console.log( 'Emmited ’evaluate equation’' );
    raspberry.emit( 'evaluate equation', queue[ 0 ].mathml );
  }
};

export const evaluateEquation = ( client, raspberry, equationValue ) => {
  if ( !raspberry ) {
    client.emit( 'evaluate error' );
    return false;
  }

  if ( !hasUserAlreadySubmitted( client ) ) {
    console.log( `Started evaluating ’${ equationValue }’ from ’${ client.username }’` );
    const equation = {};

    equation.mathml = equationValue;
    equation.user = {
      id: client.id,
      username: client.username,
    };

    queue.push( equation );

    frontend.emit( 'queue changed', queue );

    if ( queue.indexOf( equation ) === 0 ) {
      calculateEquation( raspberry );
    }
  } else {
    console.log( `User ’${ client.username }’ tried to submit equation again` );
    client.emit( 'evaluate error', 'already_submitted' );
  }
};

export const breakQueue = ( client ) => {
  client.emit( 'evaluate error' );
  queue.shift();
  hasError = true;
};

export const disableError = () => {
  hasError = false;
};
