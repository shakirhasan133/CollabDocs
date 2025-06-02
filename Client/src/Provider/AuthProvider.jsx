import { useEffect, useRef, useState } from "react";
import { AuthContext } from "./AuthContext";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  signOut,
} from "firebase/auth";
import { auth, provider } from "./../Firebase/firebase.config";
import axios from "axios";
import { io } from "socket.io-client";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);

  let publicSocket = useRef(null);

  useEffect(() => {
    if (!user) return;
    const pSocket = io(`${import.meta.env.VITE_Api_URL}/active-users`, {
      query: {
        email: user?.email,
        name: user?.displayName,
        photoURL: user?.photoURL,
      },
    });
    publicSocket.current = pSocket;
    const handleConnect = () => {
      // console.log("Connected to server");
    };
    const handleDisconnect = () => {
      // console.log("Disconnected");
    };

    pSocket.on("connect", handleConnect);
    pSocket.on("disconnect", handleDisconnect);

    // Cleanup function to avoid multiple sockets
    return () => {
      pSocket.disconnect();
      pSocket.off("connect", handleConnect);
      pSocket.off("disconnect", handleDisconnect);
    };
  }, [user]);

  //Log in with google
  const logInWithGoogle = () => {
    setLoading(true);
    return signInWithPopup(auth, provider);
  };

  // Sign in With User Email
  const SigninWithUserEmail = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Sign Up New User
  const signUpNewUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Update Registered User Data
  const updateUserData = (fullName, imageURL) => {
    return updateProfile(auth.currentUser, {
      displayName: fullName,
      photoURL: imageURL,
    });
  };

  // SignOut User
  const signOutUser = () => {
    return signOut(auth);
  };

  const authInfo = {
    user,
    loading,
    logInWithGoogle,
    SigninWithUserEmail,
    setUser,
    signUpNewUser,
    updateUserData,
    signOutUser,
    publicSocket,
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userCredential) => {
      // const user = userCredential?.user;
      // console.log(userCredential);

      try {
        if (userCredential?.email) {
          await axios.post(
            `${import.meta.env.VITE_Api_URL}/JWT`,
            { email: userCredential?.email },
            { withCredentials: true }
          );
          setUser(userCredential);
          setLoading(false);
        } else {
          await axios.post(
            `${import.meta.env.VITE_Api_URL}/logout`,
            {},
            {
              withCredentials: true,
            }
          );
          setUser(userCredential);
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
      }

      // setUser(userCredential);
      // setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
