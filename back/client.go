package main

import (
	"encoding/binary"
	"log"
	"math/rand"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 512
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Client struct {
	hub *Hub

	id uint32

	conn *websocket.Conn

	send chan Message
}

func (c *Client) readPump() {
	defer func() {
		if c.id != 0 {
			if player, ok := c.hub.players[c.id]; ok {
				player.client = nil
			}
		}

		c.hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		c.conn.SetReadDeadline(time.Now().Add(pongWait))

		if len(message) == 0 {
		} else if c.id == 0 {
			success := false

			if len(message) == 4 && binary.LittleEndian.Uint32(message) == 0 {
				id := uint32(0)

				for {
					id = rand.Uint32()

					if id != 0 {
						if _, ok := c.hub.players[id]; !ok {
							break
						}
					}
				}

				passcode := rand.Uint32()

				success = true

				c.id = id
				c.hub.players[id] = Player{id: id, passcode: passcode, client: c}

				srv_id_bytes := make([]byte, 4)
				binary.LittleEndian.PutUint32(srv_id_bytes, 0)

				id_bytes := make([]byte, 4)
				binary.LittleEndian.PutUint32(id_bytes, id)

				passcode_bytes := make([]byte, 4)
				binary.LittleEndian.PutUint32(passcode_bytes, passcode)

				c.conn.SetWriteDeadline(time.Now().Add(writeWait))
				w, err := c.conn.NextWriter(websocket.BinaryMessage)
				if err != nil {
					return
				}
				w.Write(append(srv_id_bytes, append(id_bytes, passcode_bytes...)...))

				if err := w.Close(); err != nil {
					return
				}

				c.hub.broadcast <- Message{id: c.id, bytes: id_bytes}
			} else if len(message) == 8 {
				id := binary.LittleEndian.Uint32(message[0:4])
				passcode := binary.LittleEndian.Uint32(message[4:8])

				if player, ok := c.hub.players[id]; ok {
					if passcode == player.passcode {
						success = true

						c.id = id
						player.client = c
					}
				}
			}

			if !success {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
		} else {
			id_bytes := make([]byte, 4)
			binary.LittleEndian.PutUint32(id_bytes, c.id)

			c.hub.broadcast <- Message{id: c.id, bytes: append(id_bytes, message...)}
		}
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if message.id != c.id {
				w, err := c.conn.NextWriter(websocket.BinaryMessage)
				if err != nil {
					return
				}
				w.Write(message.bytes)

				if err := w.Close(); err != nil {
					return
				}
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.BinaryMessage, nil); err != nil {
				return
			}
		}
	}
}

func serveWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	client := &Client{hub: hub, conn: conn, send: make(chan Message, 256)}
	client.hub.register <- client

	go client.writePump()
	go client.readPump()
}
