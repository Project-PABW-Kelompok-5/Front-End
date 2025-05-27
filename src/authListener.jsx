import { onIdTokenChanged } from "firebase/auth";
import { auth } from "./firebase"; // pastikan ini mengarah ke konfigurasi firebase-mu

export const startTokenRefreshListener = () => {
  onIdTokenChanged(auth, async (user) => {
    if (user) {
      const newToken = await user.getIdToken();
      const userData = JSON.parse(localStorage.getItem("user"));

      localStorage.setItem("token", newToken);

      if (userData) {
        localStorage.setItem("user", JSON.stringify({
          ...userData,
          id: user.uid,
          email: user.email,
        }));
      }
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  });
};
