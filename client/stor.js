import { proxy } from "valtio";

const state = proxy({ chat: null, msg: [], id: null, room: null, user: null });

export default state;
