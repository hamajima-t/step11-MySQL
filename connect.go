package main

import "github.com/gorilla/websocket"

// WebSocketsからブラウザへ送信するデータを格納
type WsJsonResponse struct {
	Action string
	Items  []*Item
}

// WebSocketsコネクション情報を格納
type WebSocketConnection struct {
	*websocket.Conn
}

// ブラウザから送信されたデータを格納
type WsPayload struct {
	Action string
	ID     int
	Conn   WebSocketConnection
}
