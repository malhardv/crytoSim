import React from 'react';
import CryptoList from '../../components/CryptoList/CryptoList';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <div className="hero-section">
        <h1>Welcome to CryptoSim</h1>
        <p>Learn crypto trading without risking real money</p>
      </div>
      <div className="content-section">
        <CryptoList />
      </div>
    </div>
  );
};

export default Home; 