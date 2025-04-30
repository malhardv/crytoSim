import React, { useEffect, useState } from 'react';
import './Leaderboard.css';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('https://crytosim1.onrender.com/api/leaderboard');
        if (!res.ok) throw new Error('Failed to fetch leaderboard');
        const data = await res.json();
        setLeaderboard(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h1>Top Traders</h1>
        <p>See who's making the best trades!</p>
      </div>
      <div className="leaderboard-content">
        <div className="leaderboard-table">
          <div className="table-header">
            <div className="rank">Rank</div>
            <div className="trader">Trader</div>
            <div className="portfolio-value">Portfolio Value</div>
            <div className="profit">Profit/Loss</div>
          </div>
          {loading ? (
            <p className="empty-state">Loading leaderboard...</p>
          ) : error ? (
            <p className="empty-state">{error}</p>
          ) : leaderboard.length === 0 ? (
            <p className="empty-state">No leaderboard data available.</p>
          ) : (
            leaderboard.map((entry, idx) => (
              <div className="table-header" key={entry.username} style={{ fontWeight: 400 }}>
                <div className="rank">{idx + 1}</div>
                <div className="trader">{entry.username}</div>
                <div className="portfolio-value">${entry.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                <div className="profit">${(entry.totalValue - 100000).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard; 