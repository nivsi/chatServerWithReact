import React from "react";
import "./ChatPage.css";



const  ChatList= ({chats, onSelectChat}) => {
    if (chats.length === 0) {
        return (
            <ul className="no-chats">
                <li>No chats available. Start a new chat!</li>
            </ul>
        );
    }


    return (
        <ol className="chat-chats">
            {chats.map(chat =>(
                <li key={chat.id} className="chat-item" onClick={() => onSelectChat(chat.id)}>
                    <div className="chat-link">
                        {chat.participantName} {chat.unread > 0 ? `(${chat.unread} unread)` : ""}
                    </div>

                </li>
            ))}
        </ol>
    );
};

export default ChatList;

