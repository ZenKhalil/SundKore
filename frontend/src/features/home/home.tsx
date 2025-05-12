import React from "react";

export const Home: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Welcome to SundK Dashboard</h1>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
        <p>
          This is the home page of your dashboard. You can navigate to different
          sections using the sidebar.
        </p>
      </div>
    </div>
  );
};

export default Home;
