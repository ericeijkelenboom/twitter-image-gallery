$(function() {
    var MAX_IMAGES = 20;
    var socket = io.connect(window.location.hostname);
    
    // Setup image receive over socket
    socket.on('data', function(tweet) {        
        if(!tweet.url) return;

        var image = $('<img src="' + tweet.url + '"/>')
            .on('load', function() {
                var container = $('#container');
                
                // Remove old images 
                if(container.children().length == MAX_IMAGES) {
                    var oldest = $('#container img').last();
                    oldest.remove();
                    container.packery('remove', oldest);
                }

                container.prepend(image).packery('prepended', image);
            });;
    });

    // Init packery
    $('#container').packery({
        itemSelector: 'img',
        gutter: 50
    });

    // Search box 
    $('#search').on('submit', function (event) {
        event.preventDefault();
        
        $.get('/filter', 'q=' + $('#q').val(), function(data) {
            //$('#filter').html('Showing images for \'' + data.filter + '\'');
            $('#q').val('').attr("placeholder", data.filter);
        });
    });
})