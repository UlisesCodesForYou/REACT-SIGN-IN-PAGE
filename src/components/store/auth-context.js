import React, { useState } from "react";

let logoutTimer; 

const AuthContext = React.createContext({
  token: "",
  isLoggedIn: false,
  login: (token) => {},
  logOut: () => {},
});

// #### HELPER FUNCTION TO CALCULATE LOGOUT TIME ######
const calculateRemainingTime = (expirationTime) => {
  const currentTime = new Date().getTime()
  const adjExpirationTime = new Date(expirationTime)

  const remainingExpirationTime = adjExpirationTime - currentTime;
  
  return remainingExpirationTime;
}

const retrieveStoredToken = ()=> {
  const storedToken = localStorage.getItem('token');
  const storedExpirationDate = localStorage.getItem('expirationTime')
  const remainingTime = calculateRemainingTime(storedExpirationDate)
  
  if(remainingTime <= 3600) {
    localStorage.removeItem('token')
    localStorage.removeItem('expirationTime')
    return null
  }

  return {
    token: storedToken,
    time: remainingTime
  }
}
// #### END OF HELPER FUNCTION ########

export const AuthContextProvider = (props) => {
  const  tokenData = retrieveStoredToken
  const initialToken = tokenData.token;  //This checks if there's a token in local storage before the user stores one.
  const [token, setToken] = useState(initialToken);



  const userIsLoggedIn = !!token;

  const loggedOutHandler = () => {
    localStorage.removeItem('token') //Removes token from local storage. 
    setToken(null);
    if (logoutTimer) {
      clearTimeout(logoutTimer)
    }
  };

  const loggedInHandler = (token, expirationTime) => {
    localStorage.setItem("token", token); //Storing a token in local storage.
    setToken(token);
    localStorage.setItem('expirationTime', expirationTime)

    const remainingTokenTime = calculateRemainingTime(expirationTime)

    logoutTimer = setTimeout(loggedOutHandler, remainingTokenTime)
  };

  const contextValue = {
    token: token,
    isLoggedIn: userIsLoggedIn,
    login: loggedInHandler,
    logout: loggedOutHandler,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
