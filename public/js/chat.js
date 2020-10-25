const socket = io();
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $locationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix:true});

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}


socket.on('welcomeMessage', msg => {
    console.log(msg.text);
})

socket.on('connectUser', msg => {
    console.log(msg.text);
})

socket.on('leftUser', msg => {
    console.log(msg.text);
})

$messageFormButton.addEventListener('click', (e) => {
    e.preventDefault();
    $messageFormButton.setAttribute('disabled', 'disabled');
    let info = $messageFormInput.value
    info = info.trim();

    if(info === ''){
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
        return -1
    }
    
    socket.emit('sendMessage', info, error => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
        
        if(error) {
            return console.log(error);
        }

        console.log('the message is delivered');
    });
});


const messageTemplate = document.querySelector('#message-template').innerHTML
socket.on('sendToAll', option => {
    const html = Mustache.render(messageTemplate,{
        username:option.userName,
        message:option.msg.text,
        createAt:moment(option.msg.sendAt).format("h:mm A")
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

const messageFromServerTemplate = document.querySelector('#server-template').innerHTML
socket.on('sendFromServer', msg => {
    const html = Mustache.render(messageFromServerTemplate, {
        message:msg.text,
        createAt:moment(msg.sendAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html);
})

const locationTemplate = document.querySelector('#location-template').innerHTML;
socket.on('sendLocation', (location, usr) => {
    const html = Mustache.render(locationTemplate, {
        userName:usr.userName,
        locate: location.text,
        createAt:moment(location.sendAt).format('h:mm A')
    });

    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML;
socket.on('roomData', ({room, users}) => {
    console.log(users, room);
    const html = Mustache.render(sideBarTemplate,{
        room,
        users
    })

    document.querySelector(".chat__sidebar").innerHTML = html;
})

$locationButton.addEventListener('click', (e) => {
    if(!navigator.geolocation){
        return alert('you browser does\'t support this features');
    }
    //disabled 
    $locationButton.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition((position) => {
        const latlong = {lat:position.coords.latitude, long:position.coords.longitude};
        socket.emit('shareLocation', latlong, (msg) => {
            console.log(msg);
        });
        //enabled
        $locationButton.removeAttribute('disabled');
    });
});

socket.emit('join', {username, room}, (error) => {
    if(error) {
        alert(error);
        location.href = '/';
    }
});

