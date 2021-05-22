const Ticketcontrol = require('../models/ticket-control')

const ticketcontrol = new Ticketcontrol();


const socketController = (socket) => {
    

    console.log('Cliente conectado', socket.id );
    socket.on('disconnect', () => {
        console.log('Cliente desconectado', socket.id );
    });
    
    socket.emit('ultimo-ticket', ticketcontrol.ultimo);
    socket.broadcast.emit('estado-actual', ticketcontrol.ultimos4);
    
    // tickets pendientes cuando un cliente se conecta
    socket.emit('tickets-pendientes', ticketcontrol.tickets.length );

    socket.on('siguiente-ticket', ( payload, callback ) => {
        
        const siguiente = ticketcontrol.siguiente();
        callback( siguiente );
        
        // Notificar que hay un nuevo ticket pendiente de asignar
        socket.broadcast.emit('tickets-pendientes', ticketcontrol.tickets.length );
    });
    
    socket.on('atender-ticket', ({ escritorio }, callback)=>{
        if ( !escritorio){
            return callback({
                ok: false,
                msg:'El escritorio es obligatorio'
            });
        }
        
        const ticket = ticketcontrol.atenderTicket(escritorio);
        
        // Notificar cambio en los ultimos 4
        socket.broadcast.emit('estado-actual', ticketcontrol.ultimos4);
        
        // notificar pendientes
        socket.emit('tickets-pendientes', ticketcontrol.tickets.length );
        socket.broadcast.emit('tickets-pendientes', ticketcontrol.tickets.length );
        
        if ( !ticket ){
            callback({
                ok: false,
                msg: 'No hay tickets pendientes'
            });
        } else {
            callback({
                ok:true,
                ticket
            })
        }
        
    })

}



module.exports = {
    socketController
}

