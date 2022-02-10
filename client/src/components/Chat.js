import React, { useEffect, useRef, useState } from "react";
import { BiLogOutCircle } from "react-icons/bi";
import { MdSend } from "react-icons/md";

import {
  Box,
  Button,
  Center,
  HStack,
  IconButton,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import ScrollToBottom from "react-scroll-to-bottom";
import { useSnapshot } from "valtio";
import state from "../stor";
function Chat({ socket, username, room }) {
  const [messageList, setMessageList] = useState([]);
  const [loggedOutUsers, setloggedOutUsers] = useState([]);

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

    socket.on("online", (data) => {
      state.onlineUsers = data.username;
    });
    socket.on("error", (data) => {
      alert("error");
    });
    socket.on("logout", (data) => {
      setloggedOutUsers((list) => [...list, data]);
      state.onlineUsers = state.onlineUsers.filter((u) => u !== data.user);
    });

    return () => socket.disconnect();
  }, [socket]);

  return (
    <HStack
      justify={"center"}
      justifyContent="flex-start"
      align={"flex-start"}
      border="solid"
      m="5"
      p="5"
    >
      <HStack alignSelf={"flex-start"} align={"flex-start"}>
        <Box
          px="4"
          textAlign={"left"}
          fontSize={["xl", "2xl", "3xl", "4xl"]}
          color={"twitter.500"}
          fontWeight={"semibold"}
          textShadow={`0px 0px 20px lightGray`}
        >
          <Text>
            {snap.onlineUsers.length > 1
              ? `Total Online Users ${snap.onlineUsers.length - 1}`
              : "No Online Users"}
          </Text>
          {snap.onlineUsers.length > 1 &&
            snap.onlineUsers.map((u, i) => (
              <Text color="blue.600" key={i} textAlign="left">
                {u.toUpperCase() === username.toUpperCase()
                  ? null
                  : `${u.toUpperCase()}`}
              </Text>
            ))}
        </Box>
      </HStack>
      <Box className="chat-window">
        <Box
          h="auto"
          borderTopRadius={"lg"}
          position="relative"
          display="block"
          color={"twitter.50"}
          fontWeight="extrabold"
          lineHeight="45px"
          bg="twitter.500"
        >
          <HStack justify={"center"} align={"center"} spacing={[1, 2, 3]}>
            <Text isTruncated>Live Chat at Room: {room}</Text>
            <IconButton
              pl={[4, 8, 12, 24]}
              _focus={{ boxShadow: "none" }}
              variant="unstyled"
              aria-label="Logout"
              icon={<BiLogOutCircle color="red" size={"1.5rem"} />}
              onClick={() => {
                socket.emit("exit", { room });
                window.location.reload();
              }}
            />
          </HStack>
        </Box>
        <Box className="chat-body">
          <ScrollToBottom className="message-container">
            {
              <Text
                fontSize={"x-small"}
                fontWeight="light"
                fontStyle={"italic"}
                textAlign={"center"}
              >
                Welcome{" "}
                <Text
                  as="span"
                  fontSize={"sm"}
                  fontWeight={"extrabold"}
                  color={"green.300"}
                >
                  {username.toUpperCase()}
                </Text>{" "}
                {"  "}
                You Joined Group {""}
                <Text
                  as="span"
                  fontSize={"sm"}
                  fontWeight={"extrabold"}
                  color={"green.300"}
                >
                  {room}
                </Text>{" "}
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
                    <Box
                      className="message-content"
                      fontSize={["sm", "md", "lg", "xl"]}
                    >
                      <Text p="1">{messageContent.message}</Text>
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
          //boxShadow={["0px 0px 2px rgba(0, 0, 0, 0.25)"]}
          boxShadow={["0px 0px 30px 0px #bcc3c5"]}
          borderBottomRadius="2xl"
        >
          <Textarea
            fontSize={["sm", "md", "lg", "xl"]}
            p="6"
            minH={"8rem"}
            ref={currentMessage}
            placeholder="Type your message here..."
            /*       onChange={(event) => {
              currentMessage.current.value = event.target.value;
              //setCurrentMessage(event.target.value);
            }} */
            onKeyPress={(e) => {
              if (e.key === "Enter" && socket.connected) {
                sendMessage();
                e.preventDefault();
              }

              //ss.current.setFocus();
            }}
          />
          {/*   <button onClick={sendMessage}>&#9658;</button> */}

          <IconButton
            disabled={!socket.connected}
            _focus={{ boxShadow: "none" }}
            variant="unstyled"
            aria-label="Send message"
            icon={<MdSend color="lightGreen" size={"2.5rem"} />}
            onClick={sendMessage}
          />
        </HStack>
      </Box>
    </HStack>
  );
}

export default Chat;
