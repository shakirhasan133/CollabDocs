import { useContext } from "react";
import { AuthContext } from "../Provider/AuthContext";

const UseAuth = () => {
  const Auth = useContext(AuthContext);
  return Auth;
};

export default UseAuth;
