import React, { createContext, useContext, useState, useEffect } from 'react';
import { FaStar, FaTrophy, FaRocket, FaCoins, FaChartLine, FaFire, FaCrown, FaClock, FaRedo, FaGem } from 'react-icons/fa';
import {
  storeCoinAcquisition,
  checkHodlerStatus,
  storeSignupTimestamp,
  checkQuickStartStatus,
  updateLowestPortfolioValue,
  checkComebackStatus,
  checkCollectorStatus
} from '../utils/badgeUtils';
import { useAuth } from './AuthContext';

const BADGES = [
  { id: 'first-trade', name: 'First Trade', description: 'Complete your first trade.', icon: FaStar },
  { id: 'diversity', name: 'Diversity', description: 'Hold 5 different cryptocurrencies.', icon: FaCoins },
  { id: 'whale', name: 'Whale', description: 'Portfolio value exceeds $10,000.', icon: FaTrophy },
  { id: 'trader', name: 'Trader', description: 'Complete 10 trades.', icon: FaChartLine },
  { id: 'hodler', name: 'Hodler', description: 'Hold a coin for 7+ days.', icon: FaClock },
  { id: 'all-in', name: 'All In', description: 'Invest all your cash at least once.', icon: FaFire },
  { id: 'top-10', name: 'Top 10', description: 'Reach the top 10 on the leaderboard.', icon: FaCrown },
  { id: 'quick-start', name: 'Quick Start', description: 'Make a trade within 10 minutes of signup.', icon: FaRocket },
  { id: 'comeback', name: 'Comeback', description: 'Recover from a 20% portfolio drop.', icon: FaRedo },
  { id: 'collector', name: 'Collector', description: 'Own at least 1 of each of the top 5 coins.', icon: FaGem },
];

function getInitialBadges() {
  const stored = localStorage.getItem('badges');
  return stored ? JSON.parse(stored) : [];
}

const PortfolioContext = createContext();

const INITIAL_BALANCE = 100000;

export const PortfolioProvider = ({ children }) => {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [holdings, setHoldings] = useState([]); // [{coinId, name, symbol, image, quantity}]
  const [transactions, setTransactions] = useState([]); // [{type, coinId, name, symbol, price, quantity, timestamp}]
  const [badges, setBadges] = useState(getInitialBadges());
  const [badgeNotification, setBadgeNotification] = useState(null);
  const [topCoins, setTopCoins] = useState([]);
  const { updateUser } = useAuth();

  useEffect(() => {
    // Store signup timestamp when component mounts for the first time
    if (!localStorage.getItem('signupTimestamp')) {
      storeSignupTimestamp();
    }
  }, []);

  useEffect(() => {
    // Check for hodler badge periodically
    const checkHodlerBadges = async () => {
      for (const holding of holdings) {
        const isHodler = await checkHodlerStatus(holding.coinId);
        if (isHodler) {
          earnBadge('hodler');
        }
      }
    };

    const interval = setInterval(checkHodlerBadges, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [holdings]);

  // Fetch portfolio from backend on mount
  const fetchPortfolio = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const response = await fetch('https://cryto-sim-qeew.vercel.app/api/portfolio', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      const data = await response.json();
      setBalance(data.balance);
      setHoldings(data.holdings);
      setTransactions(data.transactions);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const buyCrypto = async (crypto, amount) => {
    const token = localStorage.getItem('token');
    const response = await fetch('https://cryto-sim-qeew.vercel.app/api/portfolio/buy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        coinId: crypto.id,
        name: crypto.name,
        symbol: crypto.symbol,
        image: crypto.image,
        price: crypto.current_price,
        quantity: amount
      })
    });
    if (response.ok) {
      const data = await response.json();
      setBalance(data.balance);
      setHoldings(data.portfolio.holdings);
      setTransactions(data.portfolio.transactions);
      updateUser({ balance: data.balance });
      return true;
    }
    return false;
  };

  const sellCrypto = async (crypto, amount) => {
    const token = localStorage.getItem('token');
    const response = await fetch('https://cryto-sim-qeew.vercel.app/api/portfolio/sell', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        coinId: crypto.id,
        name: crypto.name,
        symbol: crypto.symbol,
        price: crypto.current_price,
        quantity: amount
      })
    });
    if (response.ok) {
      const data = await response.json();
      setBalance(data.balance);
      setHoldings(data.portfolio.holdings);
      setTransactions(data.portfolio.transactions);
      updateUser({ balance: data.balance });
      return true;
    }
    return false;
  };

  function earnBadge(badgeId) {
    if (!badges.includes(badgeId)) {
      const newBadges = [...badges, badgeId];
      setBadges(newBadges);
      localStorage.setItem('badges', JSON.stringify(newBadges));
      const badgeObj = BADGES.find(b => b.id === badgeId);
      if (badgeObj) setBadgeNotification(badgeObj);
    }
  }

  function clearBadgeNotification() {
    setBadgeNotification(null);
  }

  function hasBadge(badgeId) {
    return badges.includes(badgeId);
  }

  // Add method to update top coins
  const updateTopCoins = (coins) => {
    setTopCoins(coins.slice(0, 5));
  };

  return (
    <PortfolioContext.Provider 
      value={{ 
        balance, 
        holdings, 
        transactions, 
        buyCrypto, 
        sellCrypto, 
        fetchPortfolio,
        badges, 
        earnBadge, 
        hasBadge, 
        BADGES, 
        badgeNotification, 
        clearBadgeNotification,
        updateTopCoins 
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => useContext(PortfolioContext); 