const socket = io();

const $messageForm = document.querySelector("#message-form");
const $messageFormInput = document.querySelector("#message-input");
const $messageFormButton = document.querySelector("#message-send");
const $locationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
// pega os params do link
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
  // new message element
  const $newMessage = $messages.lastElementChild;

  // height da nova mensagem
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //visible height
  const visibleHeight = $messages.offsetHeight;

  // height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far is scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset){
    // autoScroll
    $messages.scrollTop = $messages.scrollHeight;
  }
}

socket.on("message", message => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("k:mm a")
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

socket.on("locationMessage", message => {
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    message: message.url,
    createdAt: moment(message.createdAt).format("k:mm a")
  });
  
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

socket.on("roomData", ({room, users}, callback) => {
  const html = Mustache.render(sidebarTemplate, {room, users});
  document.querySelector("#sidebar").innerHTML = html;
});

// manda localizaçao
$locationButton.addEventListener("click", () => {
  $locationButton.setAttribute('disabled', 'disabled');

  if (!navigator.geolocation) {
    return alert('Geolocation not supported by your brownser!');
  }

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit("sendLocation", {
      lat: position.coords.latitude,
      long: position.coords.longitude
    }, () => {
      console.log("Location shared!");
      $locationButton.removeAttribute('disabled');
    });
  });
});

// manda mensagem
$messageForm.addEventListener("submit", e => {
  e.preventDefault();
  // disable while send to prevent duplicateds
  $messageFormButton.setAttribute('disabled', 'disabled');

  socket.emit("sendMessage", $messageFormInput.value, (response) => {
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = "";
    $messageFormInput.focus();
    console.log('the message was ', response)
  });
});

socket.emit("join", {username, room}, error => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});