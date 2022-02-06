import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useSnapshot } from "valtio";
import { Center, VStack, Input, Button, Text, HStack } from "@chakra-ui/react";
import state from "../stor";
function Chat() {
  const snap = useSnapshot(state);
  const socketRef = useRef();
  const chatRef = useRef();
  const roomRef = useRef();
  const userRef = useRef();
  console.log("render");

  useEffect(() => {
    socketRef.current = io.connect("http://localhost:3001");
    socketRef.current.on("message", ({ user, msg }) => {

 
      state.msg.push({ user, msg });
    });

    //  return () => socketRef.current.disconnect();
  }, [snap.msg]);

  const onMessageSubmit = async () => {
    await socketRef.current.emit("message", {
   
      msg: chatRef.current.value,
      room: roomRef.current.value,
      user: userRef.current.value,
    });

    chatRef.current.value = "";
  };

  const onRoomSubmit = async () => {
    await socketRef.current.emit("join", { room: roomRef.current.value ,id:socketRef.current.id,user:userRef.current.value});
 
 
  };
  const chatHandleKeyPress = (event) => {
    if (event.key === "Enter") {
      onMessageSubmit();
    }
  };
  const roomHandleKeyPress = (event) => {
    if (event.key === "Enter") {
      onMessageSubmit();
    }
  };
  return (
    <Center mt="10%">
      <VStack>
        <Text>id is: {snap.msg.length}</Text>
        <Input
          ref={chatRef}
          placeholder="chat"
          onKeyPress={chatHandleKeyPress}
          onChange={(e) => (chatRef.current.value = e.target.value)}
        />
        <Input
          ref={roomRef}
          placeholder="Room"
          onKeyPress={roomHandleKeyPress}
          onChange={(e) => (roomRef.current.value = e.target.value)}
        />
        <Input
          ref={userRef}
          placeholder="User"
          onKeyPress={roomHandleKeyPress}
          onChange={(e) => (userRef.current.value = e.target.value)}
        />
        <pre>{JSON.stringify(snap.msg, null, 2)}</pre>
        <HStack>
          <Button onClick={onMessageSubmit}>Send</Button>
          <Button onClick={onRoomSubmit}>join</Button>
          <Button onClick={() => (state.msg = [])}>Clear</Button>
        </HStack>
      </VStack>
    </Center>
  );
}

export default Chat;
