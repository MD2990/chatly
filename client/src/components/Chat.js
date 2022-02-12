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
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import ScrollToBottom from "react-scroll-to-bottom";
import { useSnapshot } from "valtio";
import state from "../stor";
function Chat({ socket, username, room }) {
  const [messageList, setMessageList] = useState([]);
  const [loggedOutUsers, setLoggedOutUsers] = useState([]);

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
    socket.on("typing", ({ user }) => {
      user !== username && (state.isTyping = user);
    });

    socket.on("stoppedTyping", () => {
      state.isTyping = null;
    });

    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });

    socket.on("online", ({ users }) => {
      console.log(users);
      state.onlineUsers = users;
    });
    socket.on("error", (data) => {
      alert("error");
    });
    socket.on("logout", (loggedOutUser) => {
      setLoggedOutUsers((list) => [...list, loggedOutUser]);
      state.onlineUsers = state.onlineUsers.filter(
        (u) => u.id !== loggedOutUser.id
      );
    });

    return () => socket.disconnect();
  }, [socket, username]);

  return (
    <HStack
      justify={"center"}
      justifyContent="flex-start"
      align={"flex-start"}
      m="5"
      p="5"
    >
      <HStack alignSelf={"flex-start"} align={"flex-start"}>
        <Box>
          <Text
            p="4"
            textAlign={"left"}
            fontSize={["md", "lg", "xl", "2xl"]}
            color={"twitter.600"}
            textDecor={"underline"}
            fontWeight={"semibold"}
            textShadow={`0px 0px 20px lightGray`}
          >
            {snap.onlineUsers.length > 1
              ? `Total Online Users ${snap.onlineUsers.length - 1}`
              : "No Online Users"}
          </Text>
          {snap.onlineUsers.length > 1 && (
            <Wrap spacing={[0.5, 1, 2]} maxW="28rem">
              {snap.onlineUsers.map((u, i) => (
                <WrapItem
                  key={u.id}
                  onClick={() => console.log(u.id)}
                  px={[0.1, 0.3, 0.6, 1]}
                  w={["60px", "80px", "100px", "120px"]}
                  h={["60px", "80px", "100px", "120px"]}
                  lineHeight={["60px", "80px", "100px", "120px"]}
                  borderRadius="50%"
                  align="center"
                  color="black"
                  textAlign="center"
                  bg={
                    u.user.toUpperCase() === username.toUpperCase()
                      ? "gray.50"
                      : "blue.50"
                  }
                  verticalAlign="middle"
                  display={"table-cell"}
                >
                  <Text
                    isTruncated
                    textAlign={"center"}
                    fontSize={["xs", "sm", "md", "lg"]}
                    color={
                      u.user.toUpperCase() === username.toUpperCase()
                        ? "gray.300"
                        : "blue.500"
                    }
                    fontWeight={"medium"}
                  >
                    {u.user.toUpperCase() === username.toUpperCase()
                      ? "You"
                      : `${u.user.toUpperCase()}`}
                  </Text>
                </WrapItem>
              ))}
            </Wrap>
          )}
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
          <HStack
          fontSize={["xs", "sm", "md", "lg"]}
            justify={"space-between"}
            align={"center"}
            p="2"
            spacing={[1, 2, 3]}
            >
            <Text   isTruncated 
            fontSize={["xs", "sm",'md']}
            
            color={"red.100"}
            
            > {room}</Text>
            <Text isTruncated>
              {snap.isTyping && `${snap.isTyping} is Typing...`}{" "}
            </Text>
            <IconButton
              _focus={{ boxShadow: "none" }}
              variant="unstyled"
              aria-label="Logout"
              color={"red.200"}
              icon={<BiLogOutCircle size={"2rem"} />}
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
              loggedOutUsers.map((u) => (
                <Text
                  key={u.id}
                  textAlign={"center"}
                  fontSize={"xs"}
                  fontStyle={"italic"}
                >
                  <Text
                    textTransform={"uppercase"}
                    fontSize={"sm"}
                    fontWeight={"black"}
                    as="span"
                    color={"green.300"}
                  >
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
          boxShadow={["0px 0px 30px 0px #bcc3c5"]}
          borderBottomRadius="2xl"
        >
          <Textarea
            fontSize={["sm", "md", "lg", "xl"]}
            p="6"
            minH={"8rem"}
            ref={currentMessage}
            placeholder="Type your message here..."
            onKeyPress={(e) => {
              console.log(e.target.value.length);
              if (e.key === "Enter" && socket.connected) {
                // state.isTyping = null;
                sendMessage();
                
                e.preventDefault();
              }
            }}
            onFocus={(e) => {
                socket.emit("typing", { room, username });
                
                
              }}
              
              
              onBlur={(e) => {
              socket.emit("stoppedTyping", { room, username });



            }}
          />

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
