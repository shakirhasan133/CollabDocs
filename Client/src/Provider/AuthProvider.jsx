import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, provider } from "./../Firebase/firebase.config";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);

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
    return updateProfile(auth.currentUser, { fullName, imageURL });
  };

  const authInfo = {
    user,
    loading,
    logInWithGoogle,
    SigninWithUserEmail,
    setUser,
    signUpNewUser,
    updateUserData,
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (userCredential) => {
      const user = userCredential?.user;
      setUser(user);
      setLoading(false);
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
