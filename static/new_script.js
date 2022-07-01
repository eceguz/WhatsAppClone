let app = {
  _init: () => {
    console.log(app.options);
    let socket = io();
    app.username = prompt("Enter your username");

    socket.on("connect", () => {
      socket.emit("register username", {
        username: app.username,
      });
    });

    socket.on("register username", (data) => {
      console.log("ejerf");
      app.addUser({username:data.username});
    });

    app.options.input.addEventListener("keypress", (e) => {
      socket.emit("chat message", {
        username: app.username,
        typing: true,
      });
    });

    app.options.input.addEventListener("keyup", (e) => {
      setTimeout(() => {
        socket.emit("chat message", {
          username: app.username,
          typing: "stop",
        });
      }, 3000);
    });

    app.options.form.addEventListener("submit", function (e) {
      e.preventDefault();
      let currentColor =
        app.options.colorList[
          Math.floor(Math.random() * app.options.colorList.length)
        ];
      if (app.options.input.value) {
        socket.emit("chat message", {
          username: app.username,
          message: app.options.input.value,
          color: currentColor,
          typing: false,
          to: app.selectedChat,
        });

        app.options.input.value = " ";
      }
    });

    socket.on("chat message", function (data) {
      if(data.typing == false){
        app.messageList.push(data);
        app.addUser(data);
      }
    });
  },
  options: {
    messagesContainer: document.getElementById("messages"),
    form: document.getElementById("form"),
    input: document.getElementById("input"),
    username: document.getElementById("userName"),
    colorList: [
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
    ],
  },
  username: null,
  messageList: [],
  selectedChat: null,
  users: [],
  activeChatTitle : document.querySelector("#chatpanel_right_header h4"),
  setActiveChatTitle() {
    app.options.username.innerHTML = app.username;
  },
  addUser(data){
    console.log(data.username , app.username);
    if (data.username != app.username) {
      console.log("bi şey");
      if (app.users.includes(data.username) == false) {
        let user = document.createElement("li");
        user.classList.add("active");

        user.addEventListener("click", () => {
          let activeEl = document.querySelector("li.active");
          if(activeEl) activeEl.classList.remove("active");
          
          app.setActiveChat(data.username);
        });
        app.users.push(data.username);

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
    
  },
  setActiveChat(selectedUser){
    console.log(selectedUser);
    to = selectedUser;
    
    app.activeChatTitle.innerHTML = to;
    app.activeChatTitle.classList.add("header_style");

    document.getElementById("chatpanel_right_header").appendChild(app.activeChatTitle);

    console.log(messageList, to);

    if (selectedUser) {
      filterMessages(selectedUser, username);
    }
  },
  filterMessages(messageFrom, messageTo){
    let messagesList = app.messageList.filter(message => {
      return (message.username == messageFrom && message.to == messageTo) || (message.username == messageTo && message.to == messageFrom);
    })
  
   console.log(messageList);
  }
};
document.onload = app._init();
