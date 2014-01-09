


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
        var emotes = ['::', ':', '/me'];
        var emote = false;
        for (var i = 0; i < emotes.length; i++){
            var s = emotes[i];
            if (text.lastIndexOf(s, 0) === 0){
                text = text.substring(s.length);
                emote =true;
                break;
            }
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
        max_chars: 200,
        ignore_users: [ ],
        authstring: null,
        hmacsha256
    };

$.fn.weaverchat = function(settings){
    var config = $.extend({}, defaults);
    if (settings) {$.extend(config, settings);}


    var outbox = [];
    var inbox = [];
    var log = [];

    return this.each(function() {
        var socket = io.connect(config.chat_server);


        //Build UI
        var c = $(this);
        c.addClass("weaverchat");
        $("<h3>").addClass("chat-header").text(config.header).appendTo(c);
        var scrollWindow = $("<div>").addClass("chat-scroll").appendTo(c);
        var list = $("<ul>").addClass("chat-messages").appendTo(scrollWindow);

        var outboxList = $("<ul>").addClass("chat-outbox").appendTo(scrollWindow);
        //Build input form
        var form = $("<form>").addClass('chat-form').prop('id',uuid()).appendTo(c);
        var input = $("<input type='text' class='chat-input' />").prop('id',uuid())
        $("<label>").addClass("chat-prompt").text(config.prompt).prop('for',input.prop('id')).appendTo(form);
        input.appendTo(form);
        input.prop('maxlength', config.max_chars)
        var submit = $("<input type='button'/>").val("Add").appendTo(form);
        var charcounter = $("<span>").addClass("charcounter").appendTo(form);
        
        var preview = $("<div class='chat-preview'/>").appendTo(form);
        var errorLog = $("<ul>").addClass("chat-errors").appendTo(c);


        input.on('keyup', function(){
            text = input.val();
            charcounter.text(config.max_chars - text.length);
            preview.empty();
            preview.append(config.message_to_html(getmsg(),config));

        });
            


        var appendMsg = function(msg){
            //Parse date, prevent html injection
            _.each(msg, function(e){ e.date = Date.parse(e.date); delete e.html;};

            //Sort by date
            inbox = inbox.concat(msg);
            inbox.sort(function(a,b){
                return a.date - b.date;
            });
            //Uniq by id
            inbox = _.uniq(inbox, true, function(e){ return e.id });

            //Truncate to last 100 messages
            inbox = inbox.slice(-100); 

            //Cache the dom nodes that aren't already populated
            _.each(inbox, function(e){
                if (!e.html) {
                    e.html = $("<li>").append(config.message_to_html(msg,config);
                }
            });

            //Display the filtered inbox
            var filteredInbox = _.reject(inbox, function(e){
                _.contains(config.ignore_users, e.user_id);
            });

            list.empty();
            _.each(filteredInbox, function(e){
                list.append(e);
            });

        };

        var log = function (message){
            errorLog.append($("<li>").text(message));
        };
        var deleteMsg = function (ids){
            ids = function(e){ return _.contains(ids,e.id);}
            var deleted = _.filter(inbox,ids);
            inbox = _.reject(inbox, ids);
            appendMsg([]);
            var mine = _.filter(deleted, function(e){
                return e.user_id == config.user_id;
            });
            if (mine.length > 0){
                _.each(mine, function(e){
                    log("Your message was deleted: " + e.message);
                });
            }
        };

        var updateOutboxUi = function(){
            outboxList.empty();
            var sending = "<span class='sending'>sending</span>";
            _.each(outbox, function(e){
                outboxList.append($("<li>").append(config.message_to_html(e,config)).append($(sending)));
            });
        };

        var removeFromOutbox = function(send_id){
            send_id = function(e){ return e.send_id == send_id};
            var to_remove = _.filter(outbox, send_id);
            outbox = _.reject(outbox, send_id);
            updateOutboxUi();
            return to_remove;
        };
        socket.on('newmessage', function(data) {
            appendMsg([JSON.parse(data)]);
        });
        socket.on('delmessage', function(id){
            deleteMsg([id]);
        });

        socket.on('authcomplete', function(data) {
            appendMsg(JSON.parse(data))
        });

        socket.on('messageok', function(data){
            removeFromOutbox(JSON.parse(data).send_id);
        };

        socket.on('messagerejected', function(data){
            var e = removeFromOutbox(JSON.parse(data).send_id);
            log("Your message was rejected: " + e.message);
        };
        socket.on('errormessage', function(data){
            log("Your connection was rejected " + data.message);
        };

        var sendMsg = function(msg){
            msg.send_id = uuid();
            msg.send_date = Date.now().toISOString();
            outbox.push(msg);
            socket.emit('sendmessage', JSON.stringify(msg);
        };
        var getmsg = function(){
            return {
                user_id: config.user_id,
                profile_id: config.profile_id,
                room_id: config.room_id,
                profile_display_name: config.profile_display_name,
                message: config.template_function(input.val(),config),
            }
        };

        var send = function(event){
            event.preventDefault();
            if (input.val().length > 0){
                sendMsg(getmsg());
                input.val("");   
            }
        };
        form.on('submit', send);
        submit.on('click', send);

        //Try to authenticate
        socket.emit('auth', JSON.stringify({authstring: config.authstring, hmacsha256: config.hmacsha256}));

    });
 };
})(jQuery);

