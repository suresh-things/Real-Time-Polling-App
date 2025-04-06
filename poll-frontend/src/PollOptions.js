import React from 'react';

function PollOptions({ options, onVote, disabled }) {
  if (!options || options.length === 0) {
    return <p className="loading">Loading options...</p>;
  }

  return (
    <div className="options-container">
      <h2>Cast Your Vote</h2>
      {options.map(option => (
        <div key={option.id} className="option-item">
          <button onClick={() => onVote(option.id)} disabled={disabled}>
            {option.name}
          </button>
        </div>
      ))}
    </div>
  );
}

export default PollOptions;