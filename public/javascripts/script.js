$(function() {
    var socket = io.connect('http://localhost:3000');
    
    socket.on('data', function(tweet) {        
        if(!tweet.url) return;

        var image = $('<img src="' + tweet.url + '"/>')
            .on('load', function() {
                $('#container').prepend(image).packery('prepended', image);
            });;
    });

    $('#container').packery({
        itemSelector: 'img',
        gutter: 50
    });

    $('#search').on('submit', function (event) {
        event.preventDefault();
        
        socket.emit('filter', {query: $('#q').val()});
    });

    
})