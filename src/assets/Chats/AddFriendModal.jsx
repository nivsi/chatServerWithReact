import {useState} from "react";
import axios from "axios";


const AddFriendModal = ({email, onClose}) => {
    const [friendEmail, setFriendEmail] = useState("");
    const [message, setMessage] = useState("");

    const addFriend = async () => {
        console.log(`Adding friend with email: ${friendEmail}`);
        if (!checkValidEmail(friendEmail)) {
            setMessage("Invalid email format");
            return;
        }

        if (friendEmail === email) {
            setMessage("You cannot add yourself as a friend.");
            return;
        }

        try {
            const response = await axios.get(`http://localhost:3001/userExists/${encodeURIComponent(friendEmail)}`);
            if (!response.data.exists) {
                setMessage("User not found.");
                return;
            }

            await axios.post("http://localhost:3001/sendFriendRequest", {
                userEmail: email,
                friendEmail: friendEmail,
            });

            setMessage("Friend request sent!");
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setMessage(error.response.data.error);
            } else {
                setMessage("Error: " + error.message);
            }
        }
    };

    const checkValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    return (
        <div className="add-friend-modal">
            <h3 className="add-new-friend-title">Add New Friend</h3>
            <input
                className="input-add-friend"
                placeholder="Friend's Email"
                onChange={(e) => setFriendEmail(e.target.value)}
            />
            <button className="add-friend-button" onClick={addFriend} disabled={!friendEmail}>
                Add
            </button>
            <button className="close-add-friend-button" onClick={onClose}>
                Cancel
            </button>
            {message && <p className="add-friend-message">{message}</p>}
        </div>
    );
};

export default AddFriendModal;
