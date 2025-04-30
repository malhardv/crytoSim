import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Portfolio from './pages/Portfolio/Portfolio';
import Leaderboard from './pages/Leaderboard/Leaderboard';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import { PortfolioProvider } from './contexts/PortfolioContext';
import { AuthProvider } from './contexts/AuthContext';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <AuthProvider>
        <PortfolioProvider>
          <div className="App">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </PortfolioProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
