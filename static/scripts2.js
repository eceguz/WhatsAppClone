
var socket = io();

var messages = document.getElementById("messages");
var form = document.getElementById("form");

var input = document.getElementById("input");
var username = prompt("Enter your username");
let messageList = [];
let getUserMessages = (un) => {
  return messageList.filter(aMessage => aMessage.roomId == un)
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
var groupId = 0;
var color = color_arr[Math.floor(Math.random() * color_arr.length)];
const users = [];
document.getElementById("userName").innerHTML = username;
var friendName = document.createElement("h4");

function filterMessages(messageFrom, messageTo){
  let messagesList = messageList.filter(message => {
    return (message.username == messageFrom && message.roomId == messageTo) || (message.username == messageTo && message.roomId == messageFrom);
  })

 messages.innerHTML = "";
 messageList.forEach(item => addMessage(item))
 
};

function setActiveChat(selectedUser) {
  console.log(selectedUser);
  groupId = selectedUser;
  
  friendName.innerHTML = groupId;
  friendName.classList.add("header_style");

  chatpanel_right_header.appendChild(friendName);
  console.log(messageList, groupId);

  if (selectedUser) {
    console.log(filterMessages(selectedUser, username));
  }
  
}


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
    // messageList.push({
    //   username: username,
    //   message: input.value,
    //   color: color,
    //   roomId: groupId,
    // })
    input.value = " ";
  }
});

socket.on("connect", () => {
  socket.emit("register username", {
    username: username,
  });
});

function addMessage(data) {
  var item = document.createElement("li");
  let date = new Date();
  // let aMessage = {msg: item, to:groupId};
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
    var aMessage = {msgInput: item, from: username, to: groupId};
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
    var aMessage = {msgInput: item, from: username, to: groupId};
  }

  messages.appendChild(item);
  messageList.push(data);
  console.log(messageList);
  let panel = document.querySelector(".comments_wrapper");
  panel.scrollTop = panel.scrollHeight;
}

socket.on("chat message", function (data) {
  if (data.username != username) {
    if (users.includes(data.username) == false) {
      var user = document.createElement("li");
      users.push(data.username);

      user.addEventListener("click", () => {
        let activeEl = document.querySelector("li.active");
        if(activeEl) activeEl.classList.remove("active");
        
        setActiveChat(data.username);

        user.classList.add("active");
      });

      var userDiv = document.createElement("div");
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
  
  if (data.typing == "stop") {
    document.getElementById("typing").innerHTML = " ";
  } else if ( data.typing ) {
    if(data.username != username && groupId == data.username ){
      document.getElementById("typing").innerHTML =
      data.username + " is typing...";
    }else{
      document.getElementById("typing").innerHTML = " ";
    }

  }  
  else {
    document.getElementById("typing").innerHTML = " ";
    addMessage(data);
  }
});
