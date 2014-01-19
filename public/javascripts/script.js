$(function() {
    var socket = io.connect(window.location.hostname);
    
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
        
        $.get('/filter', 'q=' + $('#q').val(), function(data) {
            $('#filter').html('Showing images for \'' + data.filter + '\'');
        });
    });
})