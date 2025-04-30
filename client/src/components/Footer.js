import React from 'react';
import { FaTwitter, FaGithub } from 'react-icons/fa';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <div className="footer-social">
        <a href="https://x.com/itspoggerss" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter /></a>
        <a href="https://github.com/malhardv" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FaGithub /></a>
      </div>
      <div className="footer-copyright">
        &copy; {new Date().getFullYear()} Malhar Vhatkar. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer; 