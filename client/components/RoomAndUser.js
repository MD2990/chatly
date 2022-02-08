import React, { useEffect, useRef, useState } from "react";
import { useSnapshot } from "valtio";
import { Center, VStack, Input, Button, Text, HStack } from "@chakra-ui/react";
import state from "../stor";
import { useRouter } from "next/router";
import Chat from "./Chat";
function RoomAndUser({ io }) {
  const snap = useSnapshot(state);

  const chatRef = useRef();
  const roomRef = useRef();
  const userRef = useRef();

  const router = useRouter();

  /* 
  useEffect(() => {
        io.on("get", (data) => {
          console.log('data');
         
        });

    io.on("connect", () => {
   
 
    }); 
    //  return () => io.disconnect();
  }, [io]);*/

  /*   const onMessageSubmit = async () => {
    await io.emit("message", {
      msg: chatRef.current.value,
      room: roomRef.current.value,
      user: userRef.current.value,
    });
  }; */

  const onRoomSubmit = async (e) => {
    e.preventDefault();
    await io.emit("join", {
      room: roomRef.current.value,
      user: userRef.current.value,
    });


    state.user = userRef.current.value;
    state.room = roomRef.current.value;
    //router.push(`/chat`);
  };

  /*  const roomHandleKeyPress = (event) => {
    if (event.key === "Enter") {
      onMessageSubmit();
    }
  };
 */
  return (
    <Center mt="10%">
      <VStack>
        <form onSubmit={(e) => onRoomSubmit(e)}>
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
            <Button type="submit">join</Button>
          </HStack>
        </form>
      </VStack>

      <Chat io={io} room={roomRef.current?.value} user={userRef.current?.value} />
    </Center>
  );
}

export default RoomAndUser;
