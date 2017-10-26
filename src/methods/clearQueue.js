import io from '../io';
import queue from '../queue';

export default function( data ) {
  console.log( 'Queue cleared' );

  Object.keys( queue ).forEach( q => {
    delete queue[ q ];
  } );

  const rooms = Object.keys( this.adapter.sids[ this.id ] ).filter( r => r !== this.id );
  io.to( rooms ).emit( 'queue changed', [] );
};
