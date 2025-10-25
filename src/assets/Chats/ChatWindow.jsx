import React from "react";


const ChatWindow = ({chats, currentChatId, chatMessages, email, textInput, setTextInput, handleMessageSend}) => {
    if (!currentChatId) return <div className="no-chat-selected"><p>Please select a chat to start messaging.</p></div>;

    const participant = chats.find(chat => chat.id === currentChatId)?.participantName;

    return (
        <div className="chat-window">
            <h2 className='chat-title'>Chat with {participant}</h2>
            {chatMessages.length > 0 ? (
                <ul className="chat-messages">
                    {chatMessages.map((msg, index) => (
                        <li key={index} className={`chat-message ${msg.sender === email ? 'sent' : 'received'}`}>
                            <p>{msg.sender === email ? `me: ${msg.text}` : `friend: ${msg.text}`}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="no-messages">No messages yet. Start the conversation!</p>
            )}

            <div className="chat-input-container">
                <input
                    type='text'
                    className="chat-input"
                    placeholder="Type your message..."
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                />
                <button className="chat-send-button" disabled={textInput.trim() === ""} onClick={handleMessageSend}>
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;
