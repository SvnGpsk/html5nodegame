/**
 * Created by haspa on 20.04.17.
 */
socket.on('addToChat', function (data) {
    chatText.innerHTML += '<div>' + data + '</div>';
});

socket.on('evalAnswer', function (data) {
    console.log(data);
});

chatForm.onsubmit = function (e) {
    e.preventDefault();
    if (chatInput.value[0] === '/') {
        socket.emit('evalServer', chatInput.value.slice(1))
    } else if (chatInput.value[0] === '@') {
        socket.emit('sendPmToServer', {
            username: chatInput.value.slice(1, chatInput.value.indexOf(',')),
            message: chatInput.value.slice(chatInput.value.indexOf(',') + 1)
        });
    } else {
        socket.emit('sendMsgToServer', chatInput.value);
    }
    chatInput.value = '';
};