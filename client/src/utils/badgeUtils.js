// Badge utility functions

// Store coin acquisition timestamps
export const storeCoinAcquisition = (coinId) => {
  const acquisitions = JSON.parse(localStorage.getItem('coinAcquisitions') || '{}');
  if (!acquisitions[coinId]) {
    acquisitions[coinId] = new Date().toISOString();
    localStorage.setItem('coinAcquisitions', JSON.stringify(acquisitions));
  }
};

// Check if a coin has been held for 7+ days
export const checkHodlerStatus = (coinId) => {
  const acquisitions = JSON.parse(localStorage.getItem('coinAcquisitions') || '{}');
  const acquisitionDate = acquisitions[coinId];
  if (!acquisitionDate) return false;

  const holdingDuration = new Date() - new Date(acquisitionDate);
  const daysHeld = holdingDuration / (1000 * 60 * 60 * 24);
  return daysHeld >= 7;
};

// Store signup timestamp
export const storeSignupTimestamp = () => {
  if (!localStorage.getItem('signupTimestamp')) {
    localStorage.setItem('signupTimestamp', new Date().toISOString());
  }
};

// Check if first trade was within 10 minutes of signup
export const checkQuickStartStatus = (firstTradeTimestamp) => {
  const signupTimestamp = localStorage.getItem('signupTimestamp');
  if (!signupTimestamp || !firstTradeTimestamp) return false;

  const timeDiff = new Date(firstTradeTimestamp) - new Date(signupTimestamp);
  const minutesDiff = timeDiff / (1000 * 60);
  return minutesDiff <= 10;
};

// Store lowest portfolio value for comeback tracking
export const updateLowestPortfolioValue = (currentValue) => {
  const storedLowest = localStorage.getItem('lowestPortfolioValue');
  const lowestValue = storedLowest ? parseFloat(storedLowest) : currentValue;
  
  if (currentValue < lowestValue) {
    localStorage.setItem('lowestPortfolioValue', currentValue.toString());
    return currentValue;
  }
  return lowestValue;
};

// Check if portfolio has recovered from a 20% drop
export const checkComebackStatus = (currentValue) => {
  const lowestValue = parseFloat(localStorage.getItem('lowestPortfolioValue'));
  if (!lowestValue) return false;

  const percentageIncrease = ((currentValue - lowestValue) / lowestValue) * 100;
  return percentageIncrease >= 20;
};

// Check if user owns all top 5 coins
export const checkCollectorStatus = (holdings, topCoins) => {
  if (!topCoins || topCoins.length < 5) return false;
  const top5Coins = topCoins.slice(0, 5);
  return top5Coins.every(coin => 
    holdings.some(holding => holding.coinId === coin.id && holding.quantity > 0)
  );
}; 