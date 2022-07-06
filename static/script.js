
var socket = io();

var messages = document.getElementById("messages");
var form = document.getElementById("form");
var input = document.getElementById("input");

var username = "";
var userInput = prompt("Please enter a valid and unique username");

let messageList = [];
let users = [];
let loggedUsers = [];
let allUsers;
let selectedUserBoolean = false;
let friendId = 0;
let friendUsername = "";

function randomId() {
  const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
  return uint32.toString(16);
}

const color_arr = [
  "#FFE6E6",
  "#F2D1D1",
  "#DAEAF1",
  "#C6DCE4",
  "#9A86A4",
  "#F1F0C0",
  "#F4BFBF",
  "#F55353",
  "#FFDCAE",
  "#E6BA95",
];


var color = color_arr[Math.floor(Math.random() * color_arr.length)];
var userId = randomId();

while(!userInput ){
  userInput = prompt("Enter a VALID username!");
}
username = userInput;


document.getElementById("userName").innerHTML = username;
var friendName = document.createElement("h4");

function filterMessages(messageFrom, messageTo) {
  let messagesList = messageList.filter((message) => {
    return (
      (message.userId == messageTo && message.friendId == messageFrom) || 
      (message.userId == messageFrom && message.friendId == messageTo)
    );
  });

  messages.innerHTML = "";
  messagesList.forEach((item) => addMessage(item));
}

function setActiveChat(selectedUsername, selectedUserId) {
  if(friendId != selectedUserId){

    friendId = selectedUserId;
    friendUsername = selectedUsername;

    friendName.innerHTML = friendUsername;
    friendName.classList.add("header_style");
  
    chatpanel_right_header.appendChild(friendName);
    
    if (selectedUsername) {
      filterMessages(selectedUserId, userId);
    }
  }
}
console.log("username: " + username + "  user id : " + userId);
function addUser(data) {
  if (data.userId != userId) {
    
    if (users.includes(data.userId) == false) {
      let user = document.createElement("li");
      user.classList.add("active");
      user.setAttribute("userName", data.username);

      user.addEventListener("click", () => {
        selectedUserBoolean = true;
        let activeEl = document.querySelectorAll("li.active");
        activeEl.forEach((element) => {
          if (element) element.classList.remove("active");
          user.classList.add("active");
        });
        console.log("jıo");
        setActiveChat(data.username, data.userId);
        document.querySelector("form").style.display = "flex";
      });
      users.push(data.userId);
  
      let userDiv = document.createElement("div");
      userDiv.className = "userImg";

      var icon = document.createElement("img");
      icon.src =
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2e9F9dRnSZ0ebwoomAlHvmWVHBc6expV-XA&usqp=CAU";
      icon.className = "cover";

      var nameDiv = document.createElement("div");
      nameDiv.className = "groupName";

      let notifDiv = document.createElement("div");
      let notifCount = 0;
      notifDiv.innerHTML = notifCount;
      notifDiv.setAttribute("userSentMsg", data.username);
      notifDiv.setAttribute("notifCount", 0);
      notifDiv.classList.add("notification");

      userDiv.appendChild(icon);
      user.appendChild(userDiv);
      user.appendChild(nameDiv);
      user.appendChild(notifDiv);
      nameDiv.innerHTML = data.username;
      user_list.appendChild(user);
    }
  }
}

function deleteUser(data) {
  if (data.username != username) {
    let loggedOutUser = document.querySelector(
      "[userName=" + data.username + "]"
    );
    loggedOutUser.style.display = "none";
  }
}

socket.on("log out", (data) => {
  deleteUser({ username: data.username });
});

function logOut() {
  socket.emit("log out", { username: username });
}

setInterval(() => {
  socket.emit("register username", {
    username: username,
    userId: userId
  });
}, 1000);

socket.on("register username", (data) => {
  addUser({ username: data.username, userId : data.userId });
});


input.addEventListener("keypress", (e) => {
  socket.emit("chat message", {
    username: username,
    userId: userId,
    typing: true,
    friendUsername: friendUsername,
    friendId: friendId
  });
});

input.addEventListener("keyup", (e) => {
  setTimeout(() => {
    socket.emit("chat message", {
      username: username,
      userId: userId,
      typing: "stop",
      friendUsername: friendUsername,
      friendId: friendId
    });
  }, 3000);
});

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (input.value) {
    socket.emit("chat message", {
      username: username,
      userId: userId,
      message: input.value,
      color: color,
      typing: false,
      friendUsername: friendUsername,
      friendId: friendId
    });
    input.value = " ";
  }
});

function addMessage(data) {
  var item = document.createElement("li");
  let date = new Date();
  if(data.message){
    if (data.userId == userId) {
      item.innerHTML =
        "<div> " +
        data.username +
        ": " +
        data.message +
        "  " +
        "<i> <small>  " +
        date.getHours() +
        ":" +
        date.getMinutes() +
        " <small/> <i/>" +
        "<div/>";
      item.classList.add("self-message");
      item.querySelector("div").style.backgroundColor = "#B7E5DD";
      messages.appendChild(item);
      messageList.push(data);
    } else if (data.friendId == userId){
      
      if(friendId == data.userId) {
        let ifUsersSentMsg = document.querySelector(
          "[userSentMsg=" + data.username + "]"
        );
        if(ifUsersSentMsg){
          ifUsersSentMsg.setAttribute("notifCount", 0);
          ifUsersSentMsg.style.visibility="hidden";
        }
        item.innerHTML =
          "<div> " +
          data.username +
          ": " +
          data.message +
          "  " +
          "<i> <small>  " +
          date.getHours() +
          ":" +
          date.getMinutes() +
          " <small/> <i/>" +
          "<div/>";
        
        item.classList.add("others-message");
        item.querySelector("div").style.backgroundColor = data.color;
        messages.appendChild(item);
        messageList.push(data);

      } else {
        //notification is handled here
        
        let userSentMsg = document.querySelector(
          "[userSentMsg=" + data.username + "]"
        );
        let notifCount = userSentMsg.getAttribute("notifCount");
        notifCount++;
        userSentMsg.innerHTML = notifCount;
        userSentMsg.setAttribute("notifCount", notifCount);
        userSentMsg.style.visibility = "visible";
      }
    } 
  }

  let panel = document.querySelector(".comments_wrapper");
  panel.scrollTop = panel.scrollHeight;
}

socket.on("chat message", function (data) {
  
    messageList.push(data);
    addUser(data);
    if (data.typing == "stop") {
      document.getElementById("typing").innerHTML = " ";
    } else if (data.typing) {
      if (friendId == data.userId && data.friendId == userId) {
        
        document.getElementById("typing").innerHTML =
          data.username + " is typing...";
      } else {
        document.getElementById("typing").innerHTML = " ";
      }
    } else {
      document.getElementById("typing").innerHTML = " ";
      addMessage(data);
    }
});
