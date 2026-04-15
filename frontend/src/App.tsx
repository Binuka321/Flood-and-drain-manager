import React, { useEffect, useState } from "react";
import FloodAlertDashboard from "./FloodAlertDashboard";
import LoginPage from "./LoginPage";
import AdminFloodMapCreator from "./AdminFloodMapCreator";

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

  const [showAdmin, setShowAdmin] = useState(false);

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
        <div className="flex gap-2">
          {user.role === 'admin' && (
            <button
              onClick={() => setShowAdmin(prev => !prev)}
              className="rounded-lg bg-blue-600 px-4 py-2 hover:bg-blue-500"
            >
              {showAdmin ? 'View Dashboard' : 'Admin Flood Map Creator'}
            </button>
          )}
          <button
            onClick={() => setUser(null)}
            className="rounded-lg bg-red-600 px-4 py-2 hover:bg-red-500"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="p-4">
        {user.role === 'admin' && showAdmin ? (
          <AdminFloodMapCreator token={user.token} />
        ) : (
          <FloodAlertDashboard isAdmin={user.role === "admin"} authToken={user.token} />
        )}
      </div>
    </div>
  );
}
