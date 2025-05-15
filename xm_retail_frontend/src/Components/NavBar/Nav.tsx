import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaUserCircle, FaShoppingCart } from "react-icons/fa";
import axios from "axios";
import Logo from "./assets/Group_1.png";

interface SearchResult {
  id: number;
  name: string;
  type: "card" | "product" | "category";
  image?: string;
  cashback?: string;
  sku?: string;
}

function Nav() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("user"));
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_APP_SERVER_BASE_URL;

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("user"));
  }, [location]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      setShowDropdown(false);
      setActiveIndex(null);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/search`, {
          params: { query: searchTerm },
        });
        setSearchResults(response.data);
        setShowDropdown(true);
        setActiveIndex(null);
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    };

    const debounceTimer = setTimeout(fetchData, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, apiUrl]);

  const handleResultClick = (result: SearchResult) => {
    setSearchTerm(result.name);
    setShowDropdown(false);
    setActiveIndex(null);

    let path = `/${result.type}/${result.id}`;

    if (result.type === "product" && result.sku) {
      path = `/product/${result.sku}`;
    }

    navigate(path);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || searchResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prevIndex) => {
        const newIndex = prevIndex === null ? 0 : prevIndex + 1;
        return newIndex >= searchResults.length ? 0 : newIndex;
      });
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prevIndex) => {
        const newIndex = prevIndex === null ? searchResults.length - 1 : prevIndex - 1;
        return newIndex < 0 ? searchResults.length - 1 : newIndex;
      });
    }

    if (e.key === "Enter" && activeIndex !== null) {
      e.preventDefault();
      handleResultClick(searchResults[activeIndex]);
    }
  };

  return (
    <nav className="bg-[#F8F9FA] border-b border-[#E0E0E0] dark:bg-[#1A202C] w-full fixed top-0 z-50">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-3 py-2 sm:py-3">
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

        <div className="relative flex-1 mx-2 sm:mx-4 md:mx-6 lg:mx-8">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            onKeyDown={handleKeyDown}
            className="block w-full p-2.5 pl-10 text-sm sm:text-base text-gray-900 border border-gray-300 rounded-full bg-gray-50 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Search products, cards, or categories..."
          />
          <div className="absolute inset-y-0 left-2 flex items-center text-gray-500">🔍</div>
        </div>

        {!isLoggedIn&&location.pathname === "/" && (
          <Link to="/login">
            <button className="text-white bg-[#ff6726] hover:bg-[#FFB74D] rounded-md text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-3 font-semibold">
              Login/Sign up
            </button>
          </Link>
        )}

        {isLoggedIn && (
          <Link to="/cart" className="text-gray-700 hover:text-orange-500">
            <FaShoppingCart className="text-2xl mx-2" />
          </Link>
        )}

        {isLoggedIn && (
          <Link to="/profile">
            <FaUserCircle className="text-2xl text-gray-700 cursor-pointer" />
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Nav;
