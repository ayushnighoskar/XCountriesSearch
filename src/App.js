import axios from "axios";
import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [countriesData, setCountriesData] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCountries, setFilterCountries] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get("https://restcountries.com/v3.1/all");
        setCountriesData(response.data);
        setFilterCountries(response.data);
      } catch (error) {
        setError('Error fetching countries');
        console.error('API Error:', error.message);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const result = countriesData.filter(country => 
      country.name.common.toLowerCase().includes(search.toLowerCase())
    );
    setFilterCountries(result);
  }, [search, countriesData]);

  return (
    <div>
      <div className="searchCountries">
        <input 
          type="text"
          placeholder="Search for a Country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid="search-input" // Add test ID for easier testing
        /> 
      </div>
         
      <div className="countryGrid">
        {filterCountries.map((country, index) => (
          <div key={index} className="countryCard" data-testid="country-card">
            <img
              src={country.flags.png}
              alt={`Flag of ${country.name.common}`}
              className="flagImage"
              data-testid="flag-image"
            />
            <p data-testid="country-name">{country.name.common}</p>
          </div>
        ))}
        {error && <p className="errorMessage">{error}</p>}
      </div>
    </div>
  );
}

export default App;