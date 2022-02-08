import React, { useEffect, useState } from "react";
import { Text } from "@chakra-ui/react";
import ScrollToBottom from "react-scroll-to-bottom";

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [user, setUser] = useState([]);
  const [hi, setHi] = useState(null);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
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
      console.log(data);
      setUser((list) => [...list, data]);
    });
 
    return () => socket.disconnect();
  }, [socket]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <Text>
          Live Chat {"   "} Room: {room}
        </Text>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {<Text fontSize={'xx-small'} fontWeight={'hairline'} textAlign={'center'}  >Welcome {username} You Joined {room} Group </Text>}
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
  );
}

export default Chat;
