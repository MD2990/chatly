import React, { useEffect, useState } from "react";
import { Box, Text } from "@chakra-ui/react";
import ScrollToBottom from "react-scroll-to-bottom";

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [user, setUser] = useState([]);
  const [loggedOutUsers, setloggedOutUsers] = useState([]);
  const [loggedInUsers, setloggedInUsers] = useState([]);
  const [online, setOnline] = useState(0);

  const sendMessage = async () => {
    // get current time hour:minute:second format 00:00:00 with leading zeros
    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time: currentTime,
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });
    socket.on("login", (data) => {
      setUser((list) => [...list, data]);
    });

    socket.on("online", (data) => {
      setOnline(data.users);
      const onlineUsers = data.username.filter((u) => u !== username);

      const unique = [...new Set(data.username)];

      setloggedInUsers(unique);
      console.log("unique: ", typeof loggedInUsers);
    });
    socket.on("getOnline", (data) => {
      console.log("im getonline: ", data.users);
    });
    socket.on("logout", (data) => {
      setloggedOutUsers((list) => [...list, data]);
    });

    return () => socket.disconnect();
  }, [socket]);

  return (
    <>
      <div className="chat-window">
        <div className="chat-header">
          <Text>
            Live Chat {"   "} Room: {room} onl {online}
          </Text>
        </div>
        <div className="chat-body">
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
            {user &&
              user.map((u, i) => (
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
                  Joined{" "}
                </Text>
              ))}

            {loggedInUsers.map((u, i) => (
              <Text
                key={i}
                textAlign="center"
                color={
                  u.toUpperCase() === username.toUpperCase()
                    ? "green.400"
                    : "gray.600"
                }
              >
                {u.toUpperCase() === username.toUpperCase()
                  ? "You"
                  : u.toUpperCase()}
              </Text>
            ))}

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
                <div
                  key={i}
                  className="message"
                  id={username === messageContent.author ? "you" : "other"}
                >
                  <div>
                    <div className="message-content">
                      <p>{messageContent.message}</p>
                    </div>
                    <div className="message-meta">
                      <p id="time">{messageContent.time}</p>
                      <p id="author">
                        {messageContent.author === username
                          ? "You"
                          : messageContent.author.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </ScrollToBottom>
        </div>

        <div className="chat-footer">
          <input
            type="text"
            value={currentMessage}
            placeholder="Hey..."
            onChange={(event) => {
              setCurrentMessage(event.target.value);
            }}
            onKeyPress={(event) => {
              event.key === "Enter" && sendMessage();
            }}
          />
          <button onClick={sendMessage}>&#9658;</button>
        </div>
      </div>
    </>
  );
}

export default Chat;
