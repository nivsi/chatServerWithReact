import Signup from './assets/Auth/Register/Signup.jsx'
import SignIn from './assets/Auth/Login/SignIn.jsx'
import ChatPage from "./assets/Chats/ChatsPage.jsx";

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

function App() {

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/signup" replace />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/SignIn" element={<SignIn />} />
                <Route path="/chatPage" element={<ChatPage />} />
            </Routes>
        </Router>
    )
}

export default App
