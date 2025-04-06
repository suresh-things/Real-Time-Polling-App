import React from 'react';

function PollResults({ results }) {
  if (!results || results.length === 0) {
    return <p className="loading">Loading results...</p>;
  }

  // Sort results by votes descending
  const sortedResults = [...results].sort((a, b) => b.votes - a.votes);

  return (
    <div className="results-container">
      <h2>Results</h2>
      <ul>
        {sortedResults.map(result => (
          <li key={result.id}>
            <span>{result.name}</span>
            <span className="votes">{result.votes}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PollResults;