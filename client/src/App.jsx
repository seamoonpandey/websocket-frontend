import { useEffect, useState } from 'react'
import './App.css'

const ws = new WebSocket('ws://localhost:3000/cable')


function App() {
    const [messages, setMessages] = useState([])
    const [guid, setGuid] = useState('')
    const messageContainer = document.getElementById('messageContainer')

    ws.onopen = () => {
        console.log('Connected')
        setGuid(Math.random().toString(36).substring())

        ws.send(JSON.stringify({
            command: 'subscribe',
            identifier: JSON.stringify({
                channel: 'MessagesChannel',
                id: guid
            })
        }))
    }

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'ping') return;
        if (data.type === 'welcome') return;
        if (data.type === 'confirm_subscription') return;

        const message = data.message
        setMessagesAndScrollDown([...messages, message]);

    }

    useEffect(() => {
        fetchMessages();
    }, [])

    const fetchMessages = async () => {
        const response = await fetch('http://localhost:3000/messages')
        const data = await response.json()
        setMessagesAndScrollDown(data)
    }

    const setMessagesAndScrollDown = (data) => {
        setMessages(data)

        if (!messageContainer) return;
        messageContainer.scrollTop = messageContainer.scrollHeight
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const body = e.target.message.value;
        e.target.message.value = '';
        await fetch('http://localhost:3000/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ body })
        })
    }


    return (
        <>
            <div className="App">
                <div className="messageHeader">
                    <h1>
                        Messages
                    </h1>
                    <p>
                        Guid : {guid}
                    </p>
                </div>
                <div className="messages" id="messages">
                    {
                        messages.map((message) => (
                            <div className="message" key={message.id}>
                                <p>
                                    {message.body}
                                </p>
                            </div>
                        ))
                    }
                </div>
                <div className="messageForm">
                    <form onSubmit={handleSubmit}>
                        <input type="text" className='messageInput' name="message" />
                        <button className='messageButton' type="submit">Send</button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default App
