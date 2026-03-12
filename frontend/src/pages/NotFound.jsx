import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)",
      color: "#22223b",
      fontFamily: "'Poppins', sans-serif"
    }}>
      <h1 style={{ fontSize: "7rem", fontWeight: 800, margin: 0, color: "#ff6f61" }}>404</h1>
      <h2 style={{ fontSize: "2.5rem", fontWeight: 600, margin: "0.5rem 0" }}>Page Not Found</h2>
      <p style={{ fontSize: "1.2rem", color: "#6c757d", marginBottom: "2rem" }}>
        Oops! The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" style={{
        padding: "0.75rem 2rem",
        background: "#ff6f61",
        color: "#fff",
        borderRadius: "30px",
        textDecoration: "none",
        fontWeight: 600,
        fontSize: "1.1rem",
        boxShadow: "0 2px 8px rgba(255, 111, 97, 0.15)",
        transition: "background 0.2s"
      }}
      >
        Go to Home
      </Link>
    </div>
  );
};

export default NotFound;
