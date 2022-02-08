import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useSnapshot } from "valtio";
import { Center, VStack, Input, Button, Text, HStack } from "@chakra-ui/react";
import state from "../stor";
import { useRouter } from "next/router";
function Chat({ io,user,room }) {
  const snap = useSnapshot(state);
  const router = useRouter();
  const socketRef = useRef();
  const chatRef = useRef();
  
  console.log(io);
  useEffect(() => {
    io.on("get", (data) => {
       state.msg.push(data);
    });
      
    /*   //  snap.room === null && router.replace("/");
    io = io.connect("http://localhost:3001");

    io.on("connect", () => {
    io.on("message", ({ user, msg }) => {
      state.msg.push({ user, msg });
    });
    io.on("l", (data) => {
      //state.msg.push({ user, msg });
      console.log('ok',data);
    });
     });
    */

      return () => io.disconnect();
  }, [io]);

  const onMessageSubmit = async () => {
    const data = {
      msg: chatRef.current.value,
      room: room,
      user: user,
    };
    await io.emit("message", data);
  
  };

  /*   const chatHandleKeyPress = (event) => {
    if (event.key === "Enter") {
      onMessageSubmit();
    }
  };
 */
  const exitTheChat = () => {
    io.emit("bye", {
      room: snap.room,
      user: snap.user,
    });

    state.msg = [];
    state.room = null;
    state.user = null;
  };

  return (
    <Center mt="10%">
      <Button onClick={() => router.back()}>Back</Button>
      <VStack>
        <Input
          ref={chatRef}
          placeholder="chat"
          /*    onKeyPress={chatHandleKeyPress} */
          onChange={(e) => (chatRef.current.value = e.target.value)}
        />

        <pre>{JSON.stringify(snap.msg, null, 2)}</pre>
        <HStack>
          <Button onClick={onMessageSubmit}>Send</Button>
          <Button onClick={() => (state.msg = [])}>Clear</Button>
          <Button onClick={exitTheChat}>Leave </Button>
        </HStack>
      </VStack>
    </Center>
  );
}

export default Chat;
