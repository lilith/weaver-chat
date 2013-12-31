var socket = io.connect('http://' + window.location.hostname);

socket.on('msg', function(data) {
    var msg = JSON.parse(data);
    appendMsg(msg);
});

socket.on('init', function(data) {
    var messages = JSON.parse(data)
    for (i in messages)
        appendMsg(messages[i])
});

function appendMsg(msg) {
    $('#msgs').append(function() {
        var div = $('<div>');
        div.html('<b>' + msg.username + ':</b> ' + msg.message);
        return div;
    });
    $('#msgs')[0].scrollTop = $('#msgs')[0].scrollHeight;
}

function sendMsg() {
    var msg = {};
    $.each($('#chat').serializeArray(), function(i,v) {
        msg[v.name] = v.value;
    });
    $("#msg").val("");
    appendMsg(msg);
    socket.emit('msg', JSON.stringify(msg));
}