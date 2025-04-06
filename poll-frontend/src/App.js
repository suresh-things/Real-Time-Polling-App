import React, { useState, useEffect, useCallback } from 'react';
import PollOptions from './PollOptions';
import PollResults from './PollResults';
import './App.css';

// --- Configuration ---
// IMPORTANT: In a real DevOps pipeline, make this configurable!
// Option 1: Use environment variables during build (e.g., process.env.REACT_APP_API_URL)
// Option 2: Fetch a config file at runtime.
// Option 3: Use relative paths (/api) and rely on K8s Ingress or reverse proxy.
// We'll use Option 3 conceptually here for simplicity in code.
// const API_BASE_URL = '/api'; // Assumes proxy/ingress routes /api to backend
const API_BASE_URL = 'http://localhost:5000';
function App() {
  const [options, setOptions] = useState([]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // To disable buttons during vote
  const [isFetchingResults, setIsFetchingResults] = useState(false);

  // --- Fetch Data Functions ---
  const fetchOptions = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/options`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setOptions(data);
    } catch (e) {
      console.error("Failed to fetch options:", e);
      setError("Could not load poll options. Please try again later.");
    }
  }, []);

  const fetchResults = useCallback(async () => {
      // Prevent multiple simultaneous fetches
     if (isFetchingResults) return;
      setIsFetchingResults(true);

    try {
      // Don't clear existing error if just refreshing results
      // setError(null);
      const response = await fetch(`${API_BASE_URL}/results`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setResults(data);
    } catch (e) {
      console.error("Failed to fetch results:", e);
      // Avoid spamming errors on background refresh
      if (!results.length) { // Only show error if initial load failed
          setError("Could not load poll results. Please try again later.");
      }
    } finally {
        setIsFetchingResults(false);
    }
  }, [results, isFetchingResults]); // Depend on results to potentially avoid error spam


  // --- Initial Data Load ---
  useEffect(() => {
    fetchOptions();
    fetchResults();
    // Optional: Refresh results periodically
    const intervalId = setInterval(fetchResults, 5000); // Refresh every 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
    // Run only once on mount:
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchOptions]); // fetchResults is stable due to useCallback without dependencies changing often

  // --- Vote Handler ---
  const handleVote = async (optionId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/vote/${optionId}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Vote successful, refresh the results immediately
      await fetchResults();
    } catch (e) {
      console.error("Failed to cast vote:", e);
      setError("Could not cast vote. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render ---
  return (
    <div className="App">
      <h1>Real-Time Poll</h1>
      {error && <p className="error">{error}</p>}

      <PollOptions
        options={options}
        onVote={handleVote}
        disabled={isLoading}
      />

      <PollResults results={results} />
    </div>
  );
}

export default App;