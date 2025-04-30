import React, { useEffect, useState } from 'react';
import './Portfolio.css';
import { usePortfolio } from '../../contexts/PortfolioContext';

const Portfolio = () => {
  const { balance, holdings, transactions, badges, BADGES, hasBadge, badgeNotification, clearBadgeNotification } = usePortfolio();
  const [prices, setPrices] = useState({});

  useEffect(() => {
    if (badgeNotification) {
      const timer = setTimeout(() => {
        clearBadgeNotification();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [badgeNotification, clearBadgeNotification]);

  // Fetch latest prices for all holdings
  useEffect(() => {
    if (holdings.length === 0) return;
    const ids = holdings.map(h => h.coinId).join(',');
    fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}`
    )
      .then(res => res.json())
      .then(data => {
        const priceMap = {};
        data.forEach(c => {
          priceMap[c.id] = c.current_price;
        });
        setPrices(priceMap);
      });
  }, [holdings]);

  // Calculate total portfolio value (cash + all holdings at current price)
  const totalHoldingsValue = holdings.reduce(
    (sum, h) => sum + ((prices[h.coinId] || 0) * h.quantity),
    0
  );
  const totalPortfolioValue = balance + totalHoldingsValue;

  return (
    <div className="portfolio">
      {badgeNotification && (
        <div className="badge-toast" onClick={clearBadgeNotification}>
          <div className="badge-toast-icon">
            <badgeNotification.icon style={{ fontSize: '2.2rem', color: '#00ff88' }} />
          </div>
          <div className="badge-toast-content">
            <div className="badge-toast-title">Badge Unlocked!</div>
            <div className="badge-toast-name">{badgeNotification.name}</div>
            <div className="badge-toast-desc">{badgeNotification.description}</div>
          </div>
          <button className="badge-toast-close" onClick={clearBadgeNotification}>&times;</button>
        </div>
      )}
      <div className="portfolio-header">
        <h1>Your Portfolio</h1>
        <div className="portfolio-stats">
          <div className="stat-card">
            <h3>Total Balance</h3>
            <p className="balance">${typeof totalPortfolioValue === 'number' && !isNaN(totalPortfolioValue) ? totalPortfolioValue.toLocaleString(undefined, {maximumFractionDigits: 2}) : '0.00'}</p>
          </div>
          <div className="stat-card">
            <h3>Cash</h3>
            <p className="balance">${typeof balance === 'number' && !isNaN(balance) ? balance.toLocaleString(undefined, {maximumFractionDigits: 2}) : '0.00'}</p>
          </div>
        </div>
      </div>
      <div className="portfolio-content">
        <h2>Your Holdings</h2>
        <div className="holdings-table">
          {holdings.length === 0 ? (
            <p className="empty-state">No cryptocurrencies in your portfolio yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Symbol</th>
                  <th>Quantity</th>
                  <th>Current Price</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map(h => (
                  <tr key={h.coinId}>
                    <td className="crypto-name">
                      <img src={h.image} alt={h.name} />
                      <span>{h.name}</span>
                    </td>
                    <td>{h.symbol.toUpperCase()}</td>
                    <td>{h.quantity}</td>
                    <td>${prices[h.coinId] && typeof prices[h.coinId] === 'number' ? prices[h.coinId].toLocaleString(undefined, {maximumFractionDigits: 2}) : '-'}</td>
                    <td>${prices[h.coinId] && typeof prices[h.coinId] === 'number' ? (prices[h.coinId] * h.quantity).toLocaleString(undefined, {maximumFractionDigits: 2}) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <div className="portfolio-content">
        <h2>Badges</h2>
        <div className="badges-grid">
          {BADGES.map(badge => {
            const Icon = badge.icon;
            const earned = hasBadge(badge.id);
            return (
              <div key={badge.id} className={`badge-card${earned ? '' : ' locked'}`}>
                <Icon style={{ fontSize: '2.2rem', color: earned ? '#00ff88' : '#888', filter: earned ? 'none' : 'grayscale(1)' }} />
                <div className="badge-name">{badge.name}</div>
                <div className="badge-desc">{badge.description}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="portfolio-content" style={{marginTop: '2rem'}}>
        <h2>Transaction History</h2>
        <div className="holdings-table">
          {transactions.length === 0 ? (
            <p className="empty-state">No transactions yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Coin</th>
                  <th>Symbol</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice().reverse().map((t, i) => (
                  <tr key={i}>
                    <td className={t.type === 'buy' ? 'positive' : 'negative'} style={{fontWeight: 600}}>{t.type.toUpperCase()}</td>
                    <td>{t.name}</td>
                    <td>{t.symbol.toUpperCase()}</td>
                    <td>{t.quantity}</td>
                    <td>${typeof t.price === 'number' && !isNaN(t.price) ? t.price.toLocaleString(undefined, {maximumFractionDigits: 2}) : '-'}</td>
                    <td>{new Date(t.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Portfolio; 