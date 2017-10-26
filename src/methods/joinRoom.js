import queue from '../queue';

export default function( data ) {
  const roomName = `room-${ data }`;
  console.log( `${this.id} has joined ${roomName}` );
  this.join( roomName );

  const rooms = Object.keys( this.adapter.sids[ this.id ] ).filter( r => r !== this.id );
  if ( !queue[ rooms[ 0 ] ] ) {
    queue[ rooms[ 0 ] ] = [];
  }

  this.emit( 'queue changed', queue[ rooms[ 0 ] ] );
};
