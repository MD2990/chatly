import { proxy } from "valtio";

const state = proxy({ chat: "" , msg:[],id:null,room:''});



export default state;
