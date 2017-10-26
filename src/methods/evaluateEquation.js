import io from '../io';
import queue from '../queue';

export default function( data ) {
  const room = Object.keys( this.adapter.sids[ this.id ] ).filter( r => r !== this.id )[ 0 ];

  if ( queue[ room ].find( q => q.user.id === this.id ) === undefined ) {
    const equation = {};
    console.log( `Started evaluating ${ data }` );

    equation.latex = data;

    equation.user = {
      id: this.id,
    };

    queue[ room ].push( equation );

    const rooms = Object.keys( this.adapter.sids[ this.id ] ).filter( r => r !== this.id );
    io.to( rooms ).emit( 'queue changed', queue[ rooms[ 0 ] ] );
  } else {
    this.emit( 'evaluate error', 'already_submitted' );
  }
};
