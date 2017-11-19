import io from '../io';
import queue from '../queue';

let i = 0;
const steps = [ 'Reaching to 3', 'Reaching to square root', '...', 'Reading from display' ];

const nextStep = () => {
  if ( queue[ 'room-pi-1' ] && queue[ 'room-pi-1' ].length > 0 ) {
    if ( i <= steps.length - 1 ) {
      io.to( 'room-pi-1' ).emit( 'robot step', steps[ i++ ] );

      setTimeout( nextStep, 2000 );
      return;
    }

    queue[ 'room-pi-1' ].shift();

    io.to( 'room-pi-1' ).emit( 'robot done', { result: 46 } );
    io.to( 'room-pi-1' ).emit( 'queue changed', queue[ 'room-pi-1' ] );
    i = 0;
  }
};

export default function( data ) {
  const room = Object.keys( this.adapter.sids[ this.id ] ).filter( r => r !== this.id )[ 0 ];

  if ( queue[ room ].find( q => q.user.id === this.id ) === undefined ) {
    const equation = {};
    console.log( `Started evaluating ${ data }` );

    equation.latex = data;

    console.log( this.username );

    equation.user = {
      id: this.id,
      username: this.username,
    };

    queue[ room ].push( equation );

    const rooms = Object.keys( this.adapter.sids[ this.id ] ).filter( r => r !== this.id );
    io.to( rooms ).emit( 'queue changed', queue[ rooms[ 0 ] ] );

    nextStep();
  } else {
    this.emit( 'evaluate error', 'already_submitted' );
  }
};
