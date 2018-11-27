module.exports = {
    planningSessions:[],
    socket: function (io) {


        io.on('connection', function (socket) {
            console.log('User connected');

            socket.on('disconnect', function (socket) {
                console.log('user disconnected');
            });


            socket.on('newPlanningSession', function() );
        });
    },
    getNumberOfSessions: function(){
        return this.planningSessions.length;
    }
};