import React, { useState, useEffect } from 'react';
import './CryptoList.css';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { FaSearch, FaWallet, FaArrowDown } from 'react-icons/fa';
import { LineChart, Line, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, Area, AreaChart, defs, linearGradient, stop } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <div><b>{label}</b></div>
        <div>Price: <b>${payload[0].value.toLocaleString(undefined, {maximumFractionDigits: 2})}</b></div>
      </div>
    );
  }
  return null;
};

const TradeModal = ({ crypto, onClose }) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('buy');
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const { buyCrypto, sellCrypto, holdings, balance, fetchPortfolio } = usePortfolio();
  const { user, updateUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [loadingChart, setLoadingChart] = useState(true);

  useEffect(() => {
    setLoadingChart(true);
    fetch(`https://api.coingecko.com/api/v3/coins/${crypto.id}/market_chart?vs_currency=usd&days=7`)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.prices)) {
          setHistory(data.prices.map(([timestamp, price]) => ({
            time: new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            price
          })));
        } else {
          setHistory([]);
        }
        setLoadingChart(false);
      })
      .catch(() => {
        setHistory([]);
        setLoadingChart(false);
      });
  }, [crypto.id]);

  const cryptoToReceive = type === 'buy' && amount
    ? (parseFloat(amount) / crypto.current_price)
    : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setMessage('You need to log in before trading.');
      setMessageType('error');
      return;
    }
    if (type === 'buy') {
      const usdAmount = parseFloat(amount);
      if (isNaN(usdAmount) || usdAmount <= 0) {
        setMessage('Please enter a valid amount to buy.');
        setMessageType('error');
        return;
      }
      if (usdAmount > balance) {
        setMessage('You do not have enough cash to complete this purchase.');
        setMessageType('error');
        return;
      }
      const qty = usdAmount / crypto.current_price;
      const success = await buyCrypto(crypto, qty);
      if (!success) {
        setMessage('Purchase failed.');
        setMessageType('error');
        return;
      } else {
        await fetchPortfolio();
        setMessage(`Successfully bought ${qty} ${crypto.symbol.toUpperCase()}`);
        setMessageType('success');
      }
    } else {
      const qty = parseFloat(amount);
      if (isNaN(qty) || qty <= 0) {
        setMessage('Please enter a valid amount to sell.');
        setMessageType('error');
        return;
      }
      const holding = holdings.find(h => h.coinId === crypto.id);
      if (!holding || qty > holding.quantity) {
        setMessage('You do not have enough of this coin to sell that amount.');
        setMessageType('error');
        return;
      }
      const success = await sellCrypto(crypto, qty);
      if (!success) {
        setMessage('Sale failed.');
        setMessageType('error');
        return;
      } else {
        await fetchPortfolio();
        setMessage(`Successfully sold ${qty} ${crypto.symbol.toUpperCase()}`);
        setMessageType('success');
      }
    }
    if (typeof window !== 'undefined' && window.location.pathname.includes('portfolio')) {
      window.location.reload();
    }
    setTimeout(() => {
      setMessage(null);
      setMessageType(null);
      onClose();
    }, 1200);
  };

  const holding = holdings.find(h => h.coinId === crypto.id);
  const prices = history.map(h => h.price);
  const minY = Math.min(...prices);
  const maxY = Math.max(...prices);

  return (
    <div className="modal-backdrop">
      <div className="trade-modal trade-modal-wide">
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="trade-modal-content">
          {/* Left: Chart */}
          <div className="trade-modal-chartbox">
            <h3 className="trade-modal-title">{crypto.name} ({crypto.symbol.toUpperCase()})</h3>
            <div className="trade-modal-chartarea">
              {loadingChart ? (
                <div className="loading">Loading chart...</div>
              ) : history.length === 0 ? (
                <div className="error">No chart data available.</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={crypto.price_change_percentage_24h > 0 ? '#00c853' : '#ff1744'} stopOpacity={0.3}/>
                        <stop offset="100%" stopColor={crypto.price_change_percentage_24h > 0 ? '#00c853' : '#ff1744'} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" hide={true} />
                    <YAxis domain={[minY, maxY]} hide={false} width={40} tickFormatter={v => `$${v.toLocaleString(undefined, {maximumFractionDigits: 0})}`} axisLine={false} tickLine={false} style={{fontSize: '0.8rem'}}/>
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="price" stroke={crypto.price_change_percentage_24h > 0 ? '#00c853' : '#ff1744'} fill="url(#colorPrice)" strokeWidth={2} isAnimationActive={true} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          {/* Right: Info/Action Grid */}
          <div className="trade-modal-infogrid">
            <div className="trade-info-card">
              <div className="trade-info-label">Current Price</div>
              <div className="trade-info-value">${typeof crypto.current_price === 'number' && !isNaN(crypto.current_price) ? crypto.current_price.toLocaleString() : '-'}</div>
            </div>
            <div className="trade-info-card">
              <div className="trade-info-label">24h Change</div>
              <div className={`trade-info-value ${crypto.price_change_percentage_24h > 0 ? 'positive' : 'negative'}`}>{crypto.price_change_percentage_24h.toFixed(2)}%</div>
            </div>
            <div className="trade-info-card type-card">
              <label htmlFor="trade-type">Type:</label>
              <select id="trade-type" value={type} onChange={e => { setType(e.target.value); setAmount(''); }}>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>
            <div className="trade-info-card amount-card">
              <label htmlFor="trade-amount">
                Amount ({type === 'buy' ? 'USD' : crypto.symbol.toUpperCase()}):
              </label>
              <input
                id="trade-amount"
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>
            {type === 'buy' ? (
              <div className="trade-info-card trade-info get"><FaArrowDown /> You will get: <b>{cryptoToReceive ? Number(cryptoToReceive).toFixed(8) : 0}</b> <span className="crypto-symbol">{crypto.symbol.toUpperCase()}</span></div>
            ) : (
              <div className="trade-info-card trade-info get"><FaArrowDown /> You have: <b>{holding ? Number(holding.quantity).toFixed(8) : 0}</b> <span className="crypto-symbol">{crypto.symbol.toUpperCase()}</span></div>
            )}
            <div className="trade-info-card trade-info cash"><FaWallet /> Available cash: <b>${typeof balance === 'number' && !isNaN(balance) ? balance.toLocaleString() : '0.00'}</b></div>
            <div className="trade-info-card">
              <button type="button" className="trade-btn" style={{ width: '100%', fontSize: '1.1rem', padding: '0.8rem 0' }} onClick={handleSubmit}>Confirm</button>
              {message && <div className={`trade-message ${messageType}`}>{message}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CryptoList = () => {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState(null);

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true'
        );
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setCryptos(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchCryptos();
  }, []);

  const filteredCryptos = cryptos.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading">Loading cryptocurrencies...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="crypto-list">
      <div className="crypto-list-header">
        <h2>Top 100 Cryptocurrencies</h2>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search cryptocurrencies..."
            className="search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <FaSearch className="search-icon" />
        </div>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Price</th>
              <th>7d Trend</th>
              <th>24h Change</th>
              <th>Market Cap</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCryptos.map((crypto) => (
              <tr key={crypto.id}>
                <td>{crypto.market_cap_rank}</td>
                <td className="crypto-name">
                  <img src={crypto.image} alt={crypto.name} />
                  <span>{crypto.name}</span>
                  <span className="symbol">({crypto.symbol.toUpperCase()})</span>
                </td>
                <td>${crypto.current_price.toLocaleString()}</td>
                <td style={{width: 100, minWidth: 80}}>
                  {crypto.sparkline_in_7d && crypto.sparkline_in_7d.price ? (
                    <ResponsiveContainer width="100%" height={32}>
                      <LineChart data={crypto.sparkline_in_7d.price.map((p, i) => ({ price: p, idx: i }))} margin={{ top: 6, bottom: 6, left: 0, right: 0 }}>
                        <RechartsTooltip formatter={v => `$${v.toLocaleString(undefined, {maximumFractionDigits: 2})}`} />
                        <Line type="monotone" dataKey="price" stroke={crypto.price_change_percentage_24h > 0 ? '#00c853' : '#ff1744'} dot={false} strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : null}
                </td>
                <td className={crypto.price_change_percentage_24h > 0 ? 'positive' : 'negative'}>
                  {crypto.price_change_percentage_24h.toFixed(2)}%
                </td>
                <td>${crypto.market_cap.toLocaleString()}</td>
                <td>
                  <button className="trade-btn" onClick={() => setSelectedCrypto(crypto)}>Trade</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedCrypto && (
        <TradeModal crypto={selectedCrypto} onClose={() => setSelectedCrypto(null)} />
      )}
    </div>
  );
};

export default CryptoList; 