import React from "react";
import './LoginStyles.css'
import axios from "axios";
import {Link, useNavigate} from "react-router-dom";

const SignIn = () => {
    const navigate = useNavigate();
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [seePassword, setSeePassword] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");

    const LoginUser = async (e) => {
        e.preventDefault();
        try {
            const existUserFlag = await checkIfUserExists();
            if (existUserFlag) {
                const loginUser = await checkIfPasswordMatches();
                if (loginUser) {
                   localStorage.setItem("user", JSON.stringify(
                       {
                            name: loginUser.name,
                            email: loginUser.email
                       }
                   ));
                    navigate("/chatPage", {state: {name: loginUser.name, email: loginUser.email}});
                } else {
                    setErrorMessage("Invalid email or password");
                }
            } else {
                setErrorMessage("User does not exist");
            }
        } catch (error) {
            setErrorMessage(error.message);
        }
    }

    const checkIfUserExists = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/userExists/${encodeURIComponent(email)}`);
            console.log(response.data.exists);
            return response.data.exists;
        } catch (error) {
            setErrorMessage(error.message);
            throw new Error("Error checking if user exists: " + error.message);
        }
    }

    const checkIfPasswordMatches = async () => {
        try {
            const response = await axios.post(`http://localhost:3001/loginUser`, {email, password});
            return {
                name: response.data.userName,
                email: response.data.userEmail
            };
        } catch (error) {
            if (error.response && error.response.status === 400) {
                return null;
            }
            throw new Error("Error checking if password matches: " + error.message);
        }
    }
    return (
        <>
            <div className="login-page">
                <form className='login-form-container'>
                    <h2 className="title">Login</h2>
                    <div className="login-form">
                        <div className="login-input-container">
                            <label className="login-lable" htmlFor="emailLogin">Email</label>
                            <input id="emailLogin" type="email" required onChange={e => setEmail(e.target.value)}/>
                        </div>
                        <div className="login-input-container">
                            <label className="login-lable" htmlFor="passwordLogin">Password</label>
                            <input id="passwordLogin" type={seePassword ? "text" : "password"} required
                                   onChange={e => setPassword(e.target.value)}/>
                            <button className="see-password-button" type="button"
                                    onClick={() => setSeePassword(!seePassword)}>
                                {seePassword ? "Hide" : "Show"}
                            </button>
                        </div>

                        <div className="login-input-container">
                            <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
                        </div>
                        <button type="submit" className="login-submit-button"
                                onClick={LoginUser}>Login
                        </button>

                        {errorMessage && (
                            <div className="login-input-container">
                                <p className="error-message">{errorMessage}</p>
                            </div>
                        )}

                    </div>
                </form>


            </div>

        </>
    );
};

export default SignIn;
