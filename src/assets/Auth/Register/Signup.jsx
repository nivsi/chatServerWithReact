import React from "react";
import {useState} from "react";
import "./SignupStyles.css";

import axios from "axios";
import {Link, useNavigate} from "react-router-dom";

const Signup = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [seePassword, setSeePassword] = useState(false);
    const [name, setName] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const createNewUser = async () => {
        event.preventDefault();
        try {
            if (!name || !email || !password) {
                setErrorMessage("נא למלא את כל השדות");
                return;
            }
            console.log("Before check", {name, email, password});
            const exists = await checkIfUserExists(email);
            console.log("exists?", exists);
            if (!exists) {
                const newUser = await axios.post("http://localhost:3001/createUser",
                    {name, email, password},
                    {headers: {"Content-Type": "application/json"}}
                );
                console.log(newUser.data);
                setErrorMessage("");
                navigate("/chatPage", {state: {name: newUser.name, email: newUser.email}});

            } else {
                setErrorMessage("user with this email already exist")
            }

        } catch (error) {
            setErrorMessage(error.message);
        }
    }

    const checkIfUserExists = async (email) => {
        const res = await axios.get(`http://localhost:3001/userExists/${encodeURIComponent(email)}`);
        return res.data.exists;
    }


    return (
        <>
            <div className="signup-page">
                <div className="signup">
                    <form className="signup-form-container">
                        <h2 className="title">Sign up</h2>
                        <div className="signup-form">
                            <div className="signin-input-container">
                                <label className="signup-lable" htmlFor="nameLogin">Name</label>
                                <input id="nameLogin" type="text" required onChange={e => setName(e.target.value)}/>
                            </div>
                            <div className="signin-input-container">
                                <label className="signup-lable" htmlFor="emailLogin">Email</label>
                                <input id="emailLogin" type="email" required onChange={e => setEmail(e.target.value)}/>
                            </div>
                            <div className="signin-input-container">
                                <label className="signup-lable" htmlFor="passwordLogin">Password</label>
                                <input id="passwordLogin" type={seePassword ? "text" : "password"} required
                                       onChange={e => setPassword(e.target.value)}/>
                                <button className="see-password-button" type="button"
                                        onClick={() => setSeePassword(!seePassword)}>
                                    {seePassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            <span>already have account?
                        <Link to="/SignIn" className='login-link'> Press here to SignIn</Link>
                        </span>
                            <button type="submit" className="signup-submit-button" onClick={() => createNewUser()}>Sign
                                up
                            </button>


                            {errorMessage && (<div className="signin-input-container">
                                <p className="error-message">{errorMessage}</p>
                            </div>)}
                        </div>

                    </form>

                </div>
            </div>
        </>
    );
};

export default Signup;
