

async function initSocketIO() {
    console.log("before connecting a socket");
    var socket = await io("http://localhost:3000");
    console.log("after connecting a socket", socket);
    return socket;
}


(function () {

    var chat = {
        isLoggedIn: false,
        currentLoginUserName: '',
        users: [],
        socket: null,
        messageToSend: '',
        to: '',
        socketReponse: '',
        messageResponses: [
            'Why did the web developer leave the restaurant? Because of the table layout.',
            'How do you comfort a JavaScript bug? You console it.',
            'An SQL query enters a bar, approaches two tables and asks: "May I join you?"',
            'What is the most used language in programming? Profanity.',
            'What is the object-oriented way to become wealthy? Inheritance.',
            'An SEO expert walks into a bar, bars, pub, tavern, public house, Irish pub, drinks, beer, alcohol'
        ],
        poppleBlock: (name, id) => `
        <li id=${id} data-active-user="${name}" class="active-user clearfix">
              <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_01.jpg" alt="avatar" />
              <div class="about">
                <div id="name" class="name">${name}</div>
                <div class="status">
                  <i class="fa fa-circle online"></i> online
                </div>
              </div>
            </li>
        `,
        init: function () {
            this.cacheDOM();
            this.bindEvents();
            this.render();
        },
        cacheDOM: function () {
            this.$chatHistory = $('.chat-history');
            this.$button = $('#send');
            this.$loginBtn = $('#loginBtn');
            this.$textarea = $('#message-to-send');
            this.$chatHistoryList = this.$chatHistory.find('ul');
            this.$loginWindow = $('#login-window');
            this.$chatWindow = $('#chat-window');
            this.$chatWith = $('.chat-with');
            this.$user_name = $('#user_name');
            this.$totalActiveUsers = $('#totalActiveUsers');
        },
        bindEvents: function () {
            this.$button.on('click', this.addMessage.bind(this));
            this.$textarea.on('keyup', this.addMessageEnter.bind(this));
            this.$loginBtn.on('click', this.login.bind(this));
        },
        render: function () {
            if (!this.isLoggedIn) {
                this.$chatWindow.hide();
                this.$loginWindow.show();
                return;
            }
            this.$chatWindow.show();
            this.scrollToBottom();
            if (this.messageToSend.trim() !== '') {
                var template = Handlebars.compile($("#message-template").html());
                var context = {
                    messageOutput: this.messageToSend,
                    time: this.getCurrentTime(),
                    loggedUsername: this.currentLoginUserName,
                };

                this.$chatHistoryList.append(template(context));
                this.scrollToBottom();
                this.$textarea.val('');
            }
            if(this.socketReponse !== '') {
                // responses
                var templateResponse = Handlebars.compile($("#message-response-template").html());
                var contextResponse = {
                    response: this.socketReponse,
                    time: this.getCurrentTime(),
                    senderName: this.to
                };

                this.$chatHistoryList.append(templateResponse(contextResponse));
                    this.scrollToBottom();

            }

        },

        addMessage: function () {
            this.messageToSend = this.$textarea.val()
            this.render();
            this.socket.emit('onMessage', { from: this.loggedUsername, to: this.to, message: this.messageToSend });
            this.messageToSend = '';
        },
        addMessageEnter: function (event) {
            // enter was pressed
            if (event.keyCode === 13) {
                this.addMessage();
            }
        },
        scrollToBottom: function () {
            this.$chatHistory.scrollTop(this.$chatHistory[0].scrollHeight);
        },
        getCurrentTime: function () {
            return new Date().toLocaleTimeString().
                replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
        },
        getRandomItem: function (arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        },
        login: async function (event) {
            event.preventDefault();
            this.isLoggedIn = true;
            this.$loginWindow.hide();
            const loggedUsername = this.$user_name.val();
            this.currentLoginUserName = loggedUsername;
            this.socket = await initSocketIO();
            this.initSocketEvents(this.socket, loggedUsername);
            this.$chatWith.text(loggedUsername);
            this.render();
        },
        initSocketEvents: function (socket, name) {
            const current = this;
            socket.emit('new user', { name });
            socket.on('total-active-ueres', (msg) => {
                console.log("payload ---> ", msg)
                const totalActiveUsers = $('#totalActiveUsers');
                totalActiveUsers.html(msg.totalActiveUsers);
                const users = msg.users;
                $('#people-list-li').html('');
                const peopleList = users.forEach(user => {
                    if (this.currentLoginUserName === user.name) return;
                    const html = this.poppleBlock(user.name);
                    this.users.push(user.name);
                    $('#people-list-li').append(html);
                });
                $('.active-user').click(function(event) {
                    $.each( $("#people-list-li li"), function() {
                        $(this).removeClass("active-tab")
                    });
                    $(this).addClass("active-tab");
                    const value = $(this).attr("data-active-user")
                    current.to = value;
                    current.$chatHistoryList.html('');
                })
            })
            socket.on('latest-message', (newMessage) => {
                this.socketReponse = newMessage.message;
                console.log('latest-message ---> ', newMessage);
                this.render()
                this.socketReponse = '';
            })
        }

    };

    chat.init();

    var searchFilter = {
        options: { valueNames: ['name'] },
        init: function () {
            var userList = new List('people-list', this.options);
            var noItems = $('<li id="no-items-found">No items found</li>');

            userList.on('updated', function (list) {
                if (list.matchingItems.length === 0) {
                    $(list.list).append(noItems);
                } else {
                    noItems.detach();
                }
            });
        }
    };

    searchFilter.init();

})();
