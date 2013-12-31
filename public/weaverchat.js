


(function($){

    var colors = {  '0': '',
                    '1': 'colDkBlue',
                    '2': 'colDkGreen',
                    '3': 'colDkCyan',
                    '4': 'colDkRed',
                    '5': 'colDkMagenta',
                    '6': 'colDkYellow',
                    '7': 'colDkWhite',
                    'q': 'colDkOrange',
                    '!': 'colLtBlue',
                    '@': 'colLtGreen',
                    '#': 'colLtCyan',
                    '$': 'colLtRed',
                    '%': 'colLtMagenta',
                    '^': 'colLtYellow',
                    '&': 'colLtWhite',
                    'Q': 'colLtOrange',
                    ')': 'colLtBlack',
                    'r': 'colRose',
                    'R': 'colRose',
                    'v': 'coliceviolet',
                    'V': 'colBlueViolet',
                    'g': 'colXLtGreen',
                    'G': 'colXLtGreen',
                    'T': 'colDkBrown',
                    't': 'colLtBrown',
                    '~': 'colBlack',
                    'j': 'colMdGrey',
                    'J': 'colMdBlue',
                    'e': 'colDkRust',
                    'E': 'colLtRust',
                    'l': 'colDkLinkBlue',
                    'L': 'colLtLinkBlue',
                    'x': 'colburlywood',
                    'X': 'colbeige',
                    'y': 'colkhaki',
                    'Y': 'coldarkkhaki',
                    'k': 'colaquamarine',
                    'K': 'coldarkseagreen',
                    'p': 'collightsalmon',
                    'P': 'colsalmon',
                    'm': 'colwheat',
                    'M': 'coltan'};


    var colorize = function(text){
        var parts = text.split('`');
        var result = $("<span/>");
        for (var i = 0; i < parts.length; i++){
            var p = parts[i]
            var color = (i > 0 && p.length > 0) ? colors[p[0]] : null;
            if (!color && i > 0){
                result.append(document.createTextNode('`'));
            }
            if (color){
                result.append($("<span/>").addClass(color).text(p.substring(1)));
            }else{
                result.append(document.createTextNode(p));
            }

        }
        return result;
    };

    var template_function = function(text, config){
        var emotes = [':', '::', '/me'];
        var emote = false;
        for (var s in emotes){
            emote = emote || (text.lastIndexOf(s, 0) === 0);
        }
        return emote ? text : config.template.replace("{text}",text);
    };

    var message_to_html = function(message, config){
        return $("<span>").append(
            $("<a class='handle' href='#'/>").append(
                config.colorize_function(message.profile_display_name)))
           .append(
            document.createTextNode(' '))
           .append(
            $("<span class='message'/>").append(
                config.colorize_function(message.message))
            );

    };

    var uuid = function(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    };

    var defaults = {
        user_id: 'guidguid',
        profile_id: 'guidguid',
        profile_display_name: "Wizard Bob",
        template : '`3says "`#{text}`3"',
        colorize_function: colorize,
        template_function: template_function,
        message_to_html: message_to_html,
        room_id: 'default_room',
        chat_server: 'http://' + window.location.hostname,
        header: "Nearby some of your comrades converse:",
        prompt: "Speak",
        // room_auth_token: 'authentication token',
        max_chars: 200
    };

$.fn.weaverchat = function(settings){
    var config = $.extend({}, defaults);
    if (settings) {$.extend(config, settings);}

    return this.each(function() {
        var socket = io.connect(config.chat_server);

        var c = $(this);
        c.addClass("weaverchat");
        $("<h3>").addClass("chat-header").text(config.header).appendTo(c);
        var list = $("<ul>").addClass("chat-messages").appendTo(c);

        var appendMsg = function(msg){
            var line = $("<li>").append(config.message_to_html(msg,config)).appendTo(list);
        }

        socket.on('msg', function(data) {
            var msg = JSON.parse(data);
            appendMsg(msg);
        });

        socket.on('init', function(data) {
            var messages = JSON.parse(data)
            for (i in messages)
                appendMsg(messages[i])
        });

        //Build input form
        var form = $("<form>").addClass('chat-form').prop('id',uuid()).appendTo(c);
        var input = $("<input type='text' class='chat-input' />").prop('id',uuid())
        $("<label>").addClass("chat-prompt").text(config.prompt).prop('for',input.prop('id')).appendTo(form);
        input.appendTo(form);
        input.prop('maxlength', config.max_chars)
        var submit = $("<input type='submit'/>").val("Add").appendTo(form);
        var charcounter = $("<span>").addClass("charcounter").appendTo(form);
        
        var preview = $("<div class='chat-preview'/>").appendTo(form);

        input.on('keyup', function(){
            text = input.val();
            charcounter.text(config.max_chars - text.length);

            preview.empty();
            preview.append(config.message_to_html(getmsg(),config));

        });
            
        var getmsg = function(){
            return {
                user_id: config.user_id,
                profile_id: config.profile_id,
                room_id: config.room_id,
                profile_display_name: config.profile_display_name,
                message: template_function(input.val(),config),
            }
        };

        var send = function(){
            socket.emit('msg', JSON.stringify(getmsg()));
            appendMsg(getmsg());
            input.val("");   
        };
        form.on('submit', send);
        submit.on('click', send)
    });
 };
})(jQuery);

