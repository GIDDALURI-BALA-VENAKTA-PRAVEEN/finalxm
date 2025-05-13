import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import axios from "axios";
import Logo from "./assets/Group_1.png";

interface CardType {
  _id: string;
  name: string;
  image: string;
  category: string;
  cashback: string;
}

function Nav() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cards, setCards] = useState<CardType[]>([]);
  const [filteredCards, setFilteredCards] = useState<CardType[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("user"));

  const location = useLocation();
  const apiUrl = import.meta.env.VITE_APP_SERVER_BASE_URL;

  useEffect(() => {
    axios.get(`${apiUrl}/api/cards`).then((res) => {
      setCards(res.data);
    });

    // Ensure login status updates correctly
    setIsLoggedIn(!!localStorage.getItem("user"));
  }, [location]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCards([]);
      setShowDropdown(false);
    } else {
      const filtered = cards.filter((card) =>
        card.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCards(filtered);
      setShowDropdown(true);
    }
  }, [searchTerm, cards]);

  return (
    <nav className="bg-[#F8F9FA] border-b border-[#E0E0E0] dark:bg-[#1A202C] w-full">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-3 py-2 sm:py-3">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src={Logo}
            className="h-6 w-16 sm:h-8 sm:w-20 md:h-10 md:w-24 transition-all duration-300"
            alt="XM RETAIL"
          />
          <span className="text-base sm:text-lg md:text-xl font-semibold dark:text-white hidden sm:block">
            XM RETAIL
          </span>
        </Link>

        {/* Search Bar */}
        <div className="relative flex-1 mx-2 sm:mx-4 md:mx-6 lg:mx-8">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            className="block w-full p-2.5 pl-10 text-sm sm:text-base text-gray-900 border border-gray-300 rounded-full bg-gray-50 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
            placeholder="Search brands..."
          />
          <div className="absolute inset-y-0 left-2 flex items-center text-gray-500">
            🔍
          </div>

          {/* Search Results Dropdown */}
          {showDropdown && (
            <div className="absolute top-11 sm:top-12 left-0 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {filteredCards.length > 0 ? (
                filteredCards.map((card) => (
                  <Link
                    to={`/card/${card._id}`}
                    key={card._id}
                    className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={`${apiUrl}/uploads/${card.image}`}
                        alt={card.name}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full"
                      />
                      <span className="font-medium text-sm sm:text-base">
                        {card.name}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-gray-600">
                      {card.cashback}%
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-center text-gray-500 py-2 text-sm">
                  No results found
                </p>
              )}
            </div>
          )}
        </div>

        {/* Show Login/Signup Button on `/` */}
        {location.pathname === "/" && (
          <Link to="/login">
            <button
              type="button"
              className="text-white bg-[#ff6726] hover:bg-[#FFB74D] focus:ring-2 focus:outline-none focus:ring-[#ff8080] rounded-md text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-3 font-semibold transition-all duration-300"
            >
              Login/Sign up
            </button>
            
          </Link>
        )}

        {/* Show Profile Icon only on `/home` when logged in */}
        {location.pathname === "/home" && isLoggedIn && (
          <Link to="/profile">
            <FaUserCircle className="text-2xl text-gray-700 cursor-pointer" />
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Nav;
