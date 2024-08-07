import { WebSocket } from "ws";
import dotenv from "dotenv";

dotenv.config();

const WSTOKEN = process.env.WSTOKEN;

// Create the Client
const ws = new WebSocket("http://ws.hexagonbot.com/");

ws.onopen = () => {
    // Send the token to the server
    ws.send(JSON.stringify({ token: WSTOKEN }));
};

// Handle incoming messages
ws.onmessage = (event) => {
    console.log("Received message from server:", event.data);
};

// Handle errors
ws.onerror = (error) => {
    console.error("WebSocket error:", error);
};