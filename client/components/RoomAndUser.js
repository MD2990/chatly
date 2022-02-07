import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useSnapshot } from "valtio";
import { Center, VStack, Input, Button, Text, HStack } from "@chakra-ui/react";
import state from "../stor";
import { useRouter } from "next/router";
function Chat() {
  const snap = useSnapshot(state);
  const socketRef = useRef();
  const chatRef = useRef();
  const roomRef = useRef();
  const userRef = useRef();

  const router = useRouter();

  useEffect(() => {
    socketRef.current = io.connect("http://localhost:3001");
    /* 
    socketRef.current.on("connect", () => {
   
 
    }); */
    //  return () => socketRef.current.disconnect();
  }, [socketRef.current]);

  const onMessageSubmit = async () => {
    await socketRef.current.emit("message", {
      msg: chatRef.current.value,
      room: roomRef.current.value,
      user: userRef.current.value,
    });
  };

  const onRoomSubmit = async (e) => {

    e.preventDefault();
     await socketRef.current.emit("join", {
      room: roomRef.current.value,
      user: userRef.current.value,
    }); 
        socketRef.current.on("message", ({ user, msg }) => {
          state.msg.push({ user, msg });
        });

        state.user = userRef.current.value;
        state.room = roomRef.current.value;
   router.push(`/chat`);
   
  };

  const roomHandleKeyPress = (event) => {
    if (event.key === "Enter") {
      onMessageSubmit();
    }
  };

  return (
    <Center mt="10%">

      
      <VStack>
        <form onSubmit={(e)=>onRoomSubmit(e)}>
          <Input
            required
            ref={roomRef}
            placeholder="Room ID"
            onChange={(e) => (roomRef.current.value = e.target.value)}
          />
          <Input
            required
            ref={userRef}
            placeholder="User Name"
            onChange={(e) => (userRef.current.value = e.target.value)}
          />

          <HStack>
            <Button type="submit" >join</Button>
          </HStack>
        </form>
      </VStack>
    </Center>
  );
}

export default Chat;
