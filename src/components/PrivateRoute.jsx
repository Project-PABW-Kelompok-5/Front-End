// src/components/PrivateRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { app } from "../firebase";

const PrivateRoute = ({ role, allowLoggedInUser = true }) => {
  const userString = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  let user = null;
  const auth = getAuth(app);

  if (userString) {
    try {
      user = JSON.parse(userString);
    } catch (e) {
      console.error("PrivateRoute: Error parsing user data from localStorage:", e);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      signOut(auth).catch(err => console.error("Error signing out in PrivateRoute:", err));
      return <Navigate to="/login" replace />;
    }
  }

  if (!allowLoggedInUser && user && (user.role === 'admin' || user.role === 'kurir')) {
    console.log(`PRIVATE_ROUTE_FLOW: Blocking public route for ${user.role}. Redirecting to dashboard.`);
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'kurir') {
      return <Navigate to="/kurir/dashboard" replace />;
    }
  }

  if (role) { 
    if (!user || (role !== "kurir" && !token)) {
      console.log(`PRIVATE_ROUTE_FLOW: Condition: !user OR (role !== 'kurir' && !token) is TRUE. User: ${user ? user.role : 'null'}, Token: ${token ? 'exists' : 'null'}. Redirecting to /login.`);
      signOut(auth).catch(err => console.error("Error signing out during private route check:", err));
      return <Navigate to="/login" replace />;
    }

    if (user.role !== role) {
      console.warn(`PRIVATE_ROUTE_FLOW: Access denied. User role '${user.role}' does not match required role '${role}'. Redirecting to homepage.`);
      signOut(auth).catch(err => console.error("Error signing out during role mismatch:", err));
      return <Navigate to="/" replace />;
    }
    console.log(`PRIVATE_ROUTE_FLOW: Access granted for role '${user.role}' to route requiring '${role}'.`);
  } else { 
    if (user && !allowLoggedInUser) {
    }
  }


  return <Outlet />;
};

export default PrivateRoute;