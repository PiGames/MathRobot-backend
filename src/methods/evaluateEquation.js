import io from '../io';
import queue from '../queue';

const steps = [ 'Reaching to 3', 'Reaching to square root', '...', 'Reading from display' ];

const nextStep = ( room, i ) => {
  if ( queue[ room ] && queue[ room ].length > 0 ) {
    if ( i <= steps.length - 1 ) {
      io.to( room ).emit( 'robot step', steps[ i ] );

      setTimeout( () => nextStep( room, i + 1 ), 2000 );
      return;
    }

    queue[ room ].shift();

    io.to( room ).emit( 'robot done', { result: 46 } );
    io.to( room ).emit( 'queue changed', queue[ room ] );

    if ( queue[ room ].length > 0 ) {
      nextStep( room, 0 );
    }
  }
};

export default function( data ) {
  let i = 0;
  const room = Object.keys( this.adapter.sids[ this.id ] ).filter( r => r !== this.id )[ 0 ];

  if ( !queue[ room ] ) {
    queue[ room ] = [];
  }

  if ( queue[ room ].find( q => q.user.id === this.id ) === undefined ) {
    const equation = {};
    console.log( `Started evaluating ${ data }` );

    equation.latex = data;

    equation.user = {
      id: this.id,
      username: this.username,
    };

    queue[ room ].push( equation );

    const rooms = Object.keys( this.adapter.sids[ this.id ] ).filter( r => r !== this.id );
    io.to( rooms ).emit( 'queue changed', queue[ rooms[ 0 ] ] );

    if ( queue[ room ].indexOf( equation ) === 0 ) {
      nextStep( room, i );
    }
  } else {
    this.emit( 'evaluate error', 'already_submitted' );
  }
};
