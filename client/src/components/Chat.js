import React, { useEffect, useRef, useState } from "react";
import { Box, Center, HStack, Text, Textarea, VStack } from "@chakra-ui/react";
import ScrollToBottom from "react-scroll-to-bottom";
import { proxy, useSnapshot } from "valtio";
import state from "../stor";
function Chat({ socket, username, room }) {
  //const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [loggedOutUsers, setloggedOutUsers] = useState([]);
  const [loggedInUsers, setloggedInUsers] = useState([]);
  const [online, setOnline] = useState(0);

  const currentMessage = useRef("");

  const snap = useSnapshot(state);

  const sendMessage = async () => {
    // get current time hour:minute:second format 00:00:00 with leading zeros
    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    if (currentMessage.current.value.trim() !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage.current.value,
        time: currentTime,
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      currentMessage.current.value = "";
      currentMessage.current.focus();
      //setCurrentMessage("");
    }
  };

  useEffect(() => {
    currentMessage.current.focus();
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });
    /*   socket.on("login", (data) => {
      setUser((list) => [...list, data]);
    }); */

    socket.on("online", (data) => {
      setOnline(data.users);
      //  const onlineUsers = data.username.filter((u) => u !== username);

      const unique = [...new Set(data.username)];
      // const onlineUsers = loggedInUsers.filter((u) => u !== "");
      state.onlineUsers.push(unique);

      // state.onlineUsers = state.onlineUsers.push({ user: arr });

      // setloggedInUsers( arr);
      console.log("loggedInUsers", state.onlineUsers);
    });
    socket.on("error", (data) => {
      alert("error");
    });
    socket.on("logout", (data) => {

      setloggedOutUsers((list) => [...list, data]);
      const allOnlineUsers = state.filter((u) => u !== data.username);
      state.onlineUsers = allOnlineUsers;
      //setloggedInUsers(onlineUsers);
    });

    return () => socket.disconnect();
  }, [socket]);

  return (
    <HStack justify={"center"} justifyContent="flex-start" align={"flex-start"}>
      <HStack border={"solid "} p="2">
        <Box>
          {snap.onlineUsers.length}
          {/*     <Text>Total Online Users {online}</Text>
          {loggedInUsers.map((u, i) => (
            <Text key={i} textAlign="left">
              {u.user.toUpperCase() === username.toUpperCase()
                ? null
                : `${u.user.toUpperCase()}`}
            </Text>
          ))} */}
        </Box>
        {/*       <Box>
          <Text>Online Users</Text>
          {loggedInUsers.map((u, i) => (
            <Text key={i} textAlign="left">
              {u.toUpperCase() === username.toUpperCase()
                ? null
                : `${u.toUpperCase()}`}
            </Text>
          ))}
        </Box> */}
      </HStack>
      <Box className="chat-window" m="4">
        <Box className="chat-header">
          <Text>
            Live Chat {"   "} Room: {room}
          </Text>
        </Box>
        <Box className="chat-body">
          <ScrollToBottom className="message-container">
            {
              <Text
                fontSize={"xx-small"}
                fontWeight={"hairline"}
                textAlign={"center"}
              >
                Welcome {username} You Joined {room} Group{" "}
              </Text>
            }

            {loggedOutUsers &&
              loggedOutUsers.map((u, i) => (
                <Text key={i} textAlign={"center"} fontSize={"xs"}>
                  <Text
                    textTransform={"uppercase"}
                    fontSize={"lg"}
                    fontWeight={"black"}
                    as="span"
                    color={"green.300"}
                  >
                    {" "}
                    {u.user}
                  </Text>{" "}
                  Left{" "}
                </Text>
              ))}

            {messageList.map((messageContent, i) => {
              return (
                <Box
                  key={i}
                  className="message"
                  id={username === messageContent.author ? "you" : "other"}
                >
                  <Box>
                    <Box className="message-content">
                      <p>{messageContent.message}</p>
                    </Box>
                    <Box className="message-meta">
                      <p id="time">{messageContent.time}</p>
                      <p id="author">
                        {messageContent.author === username
                          ? "You"
                          : messageContent.author.toUpperCase()}
                      </p>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </ScrollToBottom>
        </Box>

        <HStack
          border={"solid 1px "}
          borderColor="#9ba2a5"
          borderTop={"none"}
          borderBottomRadius="2xl"
        >
          <Textarea
            minH={"4rem"}
            ref={currentMessage}
            placeholder="Type your message here..."
            /*       onChange={(event) => {
              currentMessage.current.value = event.target.value;
              //setCurrentMessage(event.target.value);
            }} */
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                sendMessage();
                e.preventDefault();
              }

              //ss.current.setFocus();
            }}
          />
          <button onClick={sendMessage}>&#9658;</button>
        </HStack>
      </Box>
    </HStack>
  );
}

export default Chat;
