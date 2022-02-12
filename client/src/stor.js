import { proxy } from "valtio";

const state = proxy({ chat: null, msg: [], id: null, room: null, onlineUsers: [],isTyping:null });

export default state;
