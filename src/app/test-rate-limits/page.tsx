"use client";
import React, { useState } from 'react';

const NUMBER_OF_REQUESTS = 10000; // Number of requests to make

const ApiTester = () => {
  const [results, setResults] = useState<string[]>([]);

  const testApi = async () => {
    const requests = [];

    for (let i = 0; i < NUMBER_OF_REQUESTS; i++) {
      requests.push(
        fetch('/api/testApi')
          .then(response => response.json())
          .then(data => {
            setResults(prevResults => [...prevResults, `Request ${i + 1} succeeded: ${JSON.stringify(data)}`]);
          })
          .catch(error => {
            setResults(prevResults => [...prevResults, `Request ${i + 1} failed: ${error.message}`]);
          })
      );
    }

    await Promise.all(requests);
    console.log(`Completed ${NUMBER_OF_REQUESTS} requests.`);
  };

  return (
    <div>
        {results.length > 0 && <div>Completed {results.length} requests.</div>}
      <button onClick={testApi}>Test API</button>
      <div>
        {results.map((result, index) => (
          <div key={index}>{result}</div>
        ))}
      </div>
    </div>
  );
};

export default ApiTester;