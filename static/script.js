
var socket = io();

var messages = document.getElementById("messages");
var form = document.getElementById("form");

var input = document.getElementById("input");
var username = prompt("Enter your username");
let messageList = [];
let users = [];
let loggedUsers = [];

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

var groupId = 0;
var color = color_arr[Math.floor(Math.random() * color_arr.length)];

document.getElementById("userName").innerHTML = username;
var friendName = document.createElement("h4");

function filterMessages(messageFrom, messageTo) {
  let messagesList = messageList.filter((message) => {
    return (
      (message.username == messageTo && message.roomId == messageFrom) ||
      (message.username == messageFrom && message.roomId == messageTo)
    );
  });

  messages.innerHTML = "";
  messagesList.forEach((item) => addMessage(item));
}

function setActiveChat(selectedUser) {
  console.log(selectedUser);
  groupId = selectedUser;

  friendName.innerHTML = groupId;
  friendName.classList.add("header_style");

  chatpanel_right_header.appendChild(friendName);
  console.log(messageList, groupId);

  if (selectedUser) {
    filterMessages(selectedUser, username);
  }
}

function addUser(data) {
  if (data.username != username) {
    if (users.includes(data.username) == false) {
      let user = document.createElement("li");
      user.classList.add("active");
      user.setAttribute("userName", data.username);
      user.addEventListener("click", () => {
        let activeEl = document.querySelectorAll("li.active");
        activeEl.forEach(element => {
          if(element) element.classList.remove("active");
          user.classList.add("active");
        })
       // if (activeEl) activeEl.classList.remove("active");

        setActiveChat(data.username);
      });
      users.push(data.username);

      let userDiv = document.createElement("div");
      userDiv.className = "userImg";

      var icon = document.createElement("img");
      icon.src =
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2e9F9dRnSZ0ebwoomAlHvmWVHBc6expV-XA&usqp=CAU";
      icon.className = "cover";

      var nameDiv = document.createElement("div");
      nameDiv.className = "groupName";

      userDiv.appendChild(icon);
      user.appendChild(userDiv);
      user.appendChild(nameDiv);

      nameDiv.innerHTML = data.username;
      user_list.appendChild(user);
    }
  }
}
function filterLoggedOutUsers(loggedUsers) {
  let loggedOutUsers = [];
  for(let i = 0; i < users.length; i++){
    if(!loggedUsers.includes(users[i])){
      loggedOutUsers.push(users[i]);
    }
  }
  return loggedOutUsers;
}

function logOut(){
  console.log("does this work");

}

setInterval(() => {
  socket.emit("register username", {
    username: username,
  });
}, 2000);

socket.on('log out', (data) => {
  console.log("user: " + data.username + " is logged out");
  socket.on('disconnect');
});

socket.on("register username", (data) => {
    addUser({ username: data.username });
});

input.addEventListener("keypress", (e) => {
  socket.emit("chat message", {
    username: username,
    typing: true,
  });
});

input.addEventListener("keyup", (e) => {
  setTimeout(() => {
    socket.emit("chat message", {
      username: username,
      typing: "stop",
    });
  }, 3000);
});

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (input.value) {
    socket.emit("chat message", {
      username: username,
      message: input.value,
      color: color,
      typing: false,
      roomId: groupId,
    });

    input.value = " ";
  }
});


function addMessage(data) {
  var item = document.createElement("li");
  let date = new Date();
  
  if (data.username == username) {
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
  
  } else if (data.roomId == username && groupId == data.username) {
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

  }

  messages.appendChild(item);
  messageList.push(data);
  console.log(messageList);
  let panel = document.querySelector(".comments_wrapper");
  panel.scrollTop = panel.scrollHeight;
}

socket.on("chat message", function (data) {
  messageList.push(data);
  addUser(data);
  if (data.typing == "stop") {
    document.getElementById("typing").innerHTML = " ";
  } else if (data.typing) {
    if (data.username != username && groupId == data.username) {
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



