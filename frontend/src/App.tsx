import React, { useEffect, useState } from "react";
import FloodAlertDashboard from "./FloodAlertDashboard";
import LoginPage from "./LoginPage";

export default function App() {
  const [user, setUser] = useState<{ username: string; name: string; role: string; token: string } | null>(() => {
    const parsed = localStorage.getItem('flood-user');
    const token = localStorage.getItem('flood-user-token');
    if (parsed && token) {
      const userObj = JSON.parse(parsed);
      return { ...userObj, token };
    }
    return null;
  });

  useEffect(() => {
    if (!user) {
      localStorage.removeItem('flood-user');
      localStorage.removeItem('flood-user-token');
    }
  }, [user]);

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return (
    <div>
      <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
        <div>
          Logged in as: <strong>{user.name}</strong> ({user.role})
        </div>
        <button
          onClick={() => setUser(null)}
          className="rounded-lg bg-red-600 px-4 py-2 hover:bg-red-500"
        >
          Logout
        </button>
      </div>
      <FloodAlertDashboard />
    </div>
  );
}
