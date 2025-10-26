import React, { useContext, useState } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext.jsx";

const Login = () => {
  const [currState, setCurrState] = useState("Sign Up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");

  const { login } = useContext(AuthContext);

  const onSubmitHandler = (e) => {
    e.preventDefault();

    const payload =
      currState === "Sign Up"
        ? { fullName, email, password, bio }
        : { email, password };

    login(currState === "Sign Up" ? "signup" : "login", payload);
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl">
      <img src={assets.logo_big} alt="Logo" className="max-w-4/12 lg:w-xs" />

      <form
        onSubmit={onSubmitHandler}
        className="border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg"
      >
        <h2 className="font-medium text-2xl">{currState}</h2>

        {currState === "Sign Up" && (
          <>
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <input type="checkbox" required />
          <p className="text-white opacity-70">
            Agree to the terms of use & privacy policy.
          </p>
        </div>

        <button
          type="submit"
          className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md"
        >
          {currState === "Sign Up" ? "Create Account" : "Login Now"}
        </button>

        <p className="text-sm text-gray-600">
          {currState === "Sign Up"
            ? "Already have an account? "
            : "Don't have an account? "}
          <span
            className="font-medium text-violet-500 cursor-pointer"
            onClick={() =>
              setCurrState(currState === "Sign Up" ? "Login" : "Sign Up")
            }
          >
            {currState === "Sign Up" ? "Login Here" : "Sign Up Here"}
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
