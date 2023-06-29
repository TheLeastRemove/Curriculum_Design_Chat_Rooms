var stompClient = null;

function connectSocket() {
    var e = new SockJS("/websocket");
    stompClient = Stomp.over(e);

    stompClient.connect({}, function (e) {
        setConnected(!0);

        // First subscribe to the public topic.
        stompClient.subscribe("/topic/public", function (e) {
            var message = JSON.parse(e.body);
            if (message.type === 'CHAT') {
                showMessage(message);
            } else {
                notification(message);
            }
        }),
            stompClient.subscribe("/topic/stats", function (e) {
                connectedUser(e.body);
            });

        // Then notify everyone (including yourself) that you joined the public topic.
        connectUser();
    })
}

// Close the connection when user disconnects
function disconnectSocket() {

    // Disconnect from the stomp client.
    null !== stompClient && stompClient.disconnect(), setConnected(!1);

    $("#name").attr("disabled", !1);
    $("#name").val("");
    $("#badge").html(0);
}

// Add the user in the connection
function connectUser() {

    stompClient.send("/app/chat.user", {}, JSON.stringify({
        user: $("#name").val(),
        text: 'User has joined the chat',
        type: 'JOIN'
    }));

    // Lock the Input field name, since the user has already connected.
    $("#name").attr("disabled", !0);
}

// Send message to the connection
// function sendMessage() {
//
//     stompClient.send("/app/chat.message", {}, JSON.stringify({
//         user: $("#name").val(),
//         text: $("#message").val(),
//         type: 'CHAT'
//     }));
//
//     // Setting the message field empty once the message has been sent.
//     $("#message").val("");
// }
function sendMessage() {
    var user = $("#name").val();
    var message = $("#message").val();

    stompClient.send("/app/chat.message", {}, JSON.stringify({
        user: user,
        text: message,
        type: 'CHAT',
    }));

    // Set the message input box to empty
    $("#message").val("");
}

function connectedUser(n) {
    $("#badge").html(n);
}

function setConnected(e) {
    $("#switch-on-off").prop("disabled", !e);
}

// Notify all users about new user or if some user has left the chat.
function notification(message) {
    if (message.type === 'JOIN') {
        $('#userinfo').append('<tr><td class="user-information">' + capitalizeFirstLetter(message.user) + ' joined!</td></tr>');
    } else if (message.type === 'LEAVE') {
        $('#userinfo').append('<tr><td class="user-information">' + capitalizeFirstLetter(message.user) + ' left!</td></tr>');
    }
}

// Function is used to show message in chat
// function showMessage(message) {
//     $("#userinfo").append("<tr><td><span class='name-info'>" + capitalizeFirstLetter(message.user) + "</span> " + message.text + " <span class='time-info'>" + message.time + "</span></td ></tr > ")
// }
function showMessage(message) {
    var user = capitalizeFirstLetter(message.user);
    var text = message.text;
    var time = message.time;
    var username = capitalizeFirstLetter($("#name").val());

    // Set the background color of the username based on the sender
    var nameBackgroundColor = (user === username) ? 'green' : 'blue';

    // Build HTML for messages
    var html = '<tr><td><span class="name-info" style="background-color: ' + nameBackgroundColor + '">' + user + '</span> ' + text + ' <span class="time-info">' + time + '</span></td></tr>';

    // Add messages to the Chat log table
    $("#userinfo").append(html);
}


// Toggle fields whenever user connects or disconnects.
function toggleMessageFields(e) {
    $("#send").attr("disabled", e);
    $("#message").attr("disabled", e);
}

// utility method to caps first letter of string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Init method
$(function () {

    $("form").on("submit", function (e) {
        e.preventDefault();
    });

    // Connect to web-socket server and toggle message fields
    $("#switch-on-off").change(function () {
        toggleMessageFields(!$(this).prop("checked"));
        $(this).prop("checked") ? connectSocket() : disconnectSocket();
    });

    // Send the message
    $("#send").click(function () {
        if ($('#message').val().length != 0) {
            sendMessage();
        }
    });

    // Enable the connect/disconnect only if name is not empty
    $('#name').keyup(function () {
        if ($(this).val().length != 0)
            $('#switch-on-off').attr('disabled', false);
        else
            $('#switch-on-off').attr('disabled', true);
    });
});

// Password verification function
function validatePassword() {
    var password = prompt("Enter password:");
    // Perform password verification logic here, using if or switch statements to determine if the password is correct
    // If the password is correct, return true; If the password is incorrect or cancelled, return false

    // Example: Determine if the password is' admin '
    if (password === "admin") {
        return true;
    } else {
        return false;
    }
}

// Export Chat log function
// function exportChatLog() {
//
//     // Execute the logic of exporting Chat log here
//     // Chat log can be converted to CSV or JSON format and downloaded
//     // Example: Output Chat log to console
//     console.log("Exporting chat log...");
// }

// Export Chat log function
function exportChatLog() {
    var chatLog = ""; // Chat log string
    var rows = $("#userinfo tr"); // Get all rows of Chat log table
    rows.each(function () {
        var message = $(this).find(".name-info").text() + " " + $(this).find(".time-info").text() + ": " + $(this).find("td:last-child").text();
        chatLog += message + "\n"; // Add the message of each line to the Chat log string
    });

    // Create a blob object and write the Chat log string into it
    var blob = new Blob([chatLog], {type: "text/plain;charset=utf-8"});

    // Create a download link and set related properties
    var downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = "chatlog.txt";

    // Add the download link to the page and simulate clicking to download
    document.body.appendChild(downloadLink);
    downloadLink.click();

    // Clean download links
    document.body.removeChild(downloadLink);

}


// 禁言指定用户函数
function banUser() {
    var username = prompt("Enter username to ban:");
    // 在这里执行禁言指定用户的逻辑
    // 示例：输出被禁言的用户名到控制台
    console.log("Banning user: " + username);

}

// 添加按钮点击事件处理逻辑
$("#adminButton").click(function () {
    // 在这里根据需要执行不同的管理员操作
    // 示例：弹出菜单供选择不同的操作
    if (validatePassword()) {
        var choice = prompt("Admin options:\n1. Export chat log\n2. Ban user\nEnter option number:");
        switch (choice) {
            case "1":
                exportChatLog();
                break;
            case "2":
                banUser();
                break;
            default:
                console.log("Invalid option");
                break;
        }
    }
});
