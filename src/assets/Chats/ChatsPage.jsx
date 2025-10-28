import {useEffect, useRef} from "react";
import {Link, useLocation} from "react-router-dom";
import {useState} from "react";
import "./ChatPage.css";
import ChatList from "./ChatList.jsx";
import ChatWindow from "./ChatWindow.jsx";
import AddFriendModal from "./AddFriendModal";
import { useNavigate } from "react-router-dom";




const ChatPage = () => {
    const wsRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const { name: stateName = "", email: stateEmail = "" } = location.state || {};

    const [showProfile, setShowProfile] = useState(false);
    const [showAddFriend, setShowAddFriend] = useState(false);
    //const [chats, setChats] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [textInput, setTextInput] = useState("");

    const [chats] = useState(() => [
        {
            id: "c1",
            participantName: "Amit",
            lastMessage: "See you later!",
            unread: 1,
            messages: [
                {sender: "Amit", text: "Hey, are you coming to the meeting?"},
                {sender: email, text: "Yes, I'll be there."},
                {sender: "Amit", text: "Great! Don't be late."},
                {sender: email, text: "I won't, see you there."},
                {sender: "Amit", text: "Perfect, thanks!"},
                {sender: email, text: "No problem!"}
            ]
        },
        {
            id: "c2",
            participantName: "Niv",
            lastMessage: "Got it, thanks!",
            unread: 0,
            messages: [
                {sender: "Niv", text: "Did you push the latest branch?"},
                {sender: email, text: "Yes, it's pushed now."},
                {sender: "Niv", text: "Awesome, I will review it."},
                {sender: email, text: "Great, let me know your feedback."},
                {sender: "Niv", text: "Will do, thanks!"},
                {sender: email, text: "You're welcome!"}
            ]
        },
        {
            id: "c3",
            participantName: "Sivan",
            lastMessage: "הכל מוכן",
            unread: 2,
            messages: [
                {sender: "Sivan", text: "שלחתי את הקובץ החדש"},
                {sender: email, text: "קיבלתי, אבדוק עכשיו"},
                {sender: "Sivan", text: "תודה!"},
                {sender: email, text: "אין בעיה!"},
                {sender: "Sivan", text: "אשמח לדעת מה דעתך"},
                {sender: email, text: "אשלח חוות דעת תוך שעה"}
            ]
        },
        {
            id: "c4",
            participantName: "Lilach",
            lastMessage: "See you tomorrow",
            unread: 0,
            messages: [
                {sender: "Lilach", text: "Are we ready for the demo?"},
                {sender: email, text: "Almost, just final touches."},
                {sender: "Lilach", text: "Great, let's meet at 10 AM."},
                {sender: email, text: "Perfect, see you then."},
                {sender: "Lilach", text: "See you!"},
                {sender: email, text: "👍"}
            ]
        }
    ]);

    //get user info from state or localstorage
    useEffect(() => {
        if(stateEmail)
        {
            setEmail(stateEmail);
            setName(stateName);
            console.log("got user from state" + stateEmail + " " + stateName);
        }
        else
        {
            const user = JSON.parse(localStorage.getItem("user"));
            if(user)
            {
                setEmail(user.email);
                setName(user.name);
                console.log("got user from localstorage" + user.email + " " + user.name);
            }
            else
            {
                navigate("/SignIn");
            }
        }
    }, []);
    //websocket connection
    useEffect(() => {
        if (!wsRef.current) {
            wsRef.current = new WebSocket("ws://localhost:3001");
        }
        const ws = wsRef.current;

        ws.onopen = () => {
            console.log("Connected to WebSocket server");
            ws.send(JSON.stringify({type: "join", email: email, chatId: currentChatId}));
        }
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Received message:", data);
            setChatMessages(prevMessages => [...prevMessages, {sender: data.sender, text: data.text}]);
        }
        return () => {
            ws.close();
        };
    }, [currentChatId, email]);


    const handleChatSelect = (chatId) => {
        setCurrentChatId(chatId);
        setChatMessages(chats.find(chat => chat.id === chatId)?.messages || []);
    };

    const handleMessageSend = () => {
        if (textInput.trim() !== "") {
            setChatMessages([...chatMessages, { sender: email, text: textInput }]);
            wsRef.current.send(JSON.stringify({ type: "message", text: textInput }));
            setTextInput("");
        }
    };


    return (
        <div className="chat-page">
            <nav className="chat-nav">
                <ul className="chat-nav-list">
                    <li><Link to="/SignIn" className='link'> Logout</Link></li>
                    <li><a href="" className='link'> Profile</a></li>
                    <li className="add-new-friend" onClick={() => setShowAddFriend(true)}>Add Friend</li>
                </ul>
                {showAddFriend && (
                    <AddFriendModal
                        email={email}
                        onClose={() => setShowAddFriend(false)}
                    />
                )}
            </nav>
            <div className="chat-container">
                <aside className="chat-aside">
                    <ChatList chats={chats}
                              onSelectChat={handleChatSelect}/>
                </aside>
                <main className="chat-main">
                    <ChatWindow
                        chats={chats}
                        currentChatId={currentChatId}
                        chatMessages={chatMessages}
                        email={email}
                        textInput={textInput}
                        setTextInput={setTextInput}
                        handleMessageSend={handleMessageSend}
                    />
                </main>

            </div>


        </div>
    );
};

export default ChatPage;
