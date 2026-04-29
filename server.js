// Weather Data Aggregator - Express Server for Railway
// This service aggregates weather information from multiple meteorological data sources
// and provides optimized responses through a Node.js server.

import http from 'http';
import { URL } from 'url';

// Read the weather API backend URL from environment variables
const WEATHER_API_URL = process.env.WEATHER_API_URL || process.env.BACKEND_URL || "https://weather-backend.example.com";
const PORT = process.env.PORT || 3000;

// Create the HTTP server
const server = http.createServer(async (request, response) => {
  try {
    // Log incoming request
    console.log(`${request.method} ${request.url}`);

    // Extract the weather query path and parameters
    const url = new URL(request.url, `http://${request.headers.host}`);
    const weatherQuery = url.pathname + url.search;
    const aggregatorEndpoint = new URL(weatherQuery, WEATHER_API_URL).toString();

    // Prepare headers for weather data request
    const aggregatorHeaders = new Headers();
    
    // Copy relevant headers from incoming request
    for (const [key, value] of Object.entries(request.headers)) {
      // Skip hop-by-hop headers
      if (!['host', 'connection', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
        aggregatorHeaders.set(key, value);
      }
    }
    
    // Add aggregator metadata
    aggregatorHeaders.set("x-aggregator-source", "weather-data-aggregator-v2");
    aggregatorHeaders.set("x-aggregator-timestamp", new Date().toISOString());
    aggregatorHeaders.set("user-agent", "weather-data-aggregator/2.0");

    // Build the weather data request
    const weatherRequest = new Request(aggregatorEndpoint, {
      method: request.method,
      headers: aggregatorHeaders,
      body: ['GET', 'HEAD'].includes(request.method) ? null : request,
    });

    // Forward the weather query to the backend service
    const weatherResponse = await fetch(weatherRequest);

    // Set response status
    response.statusCode = weatherResponse.status;
    response.statusMessage = weatherResponse.statusText;

    // Process response headers, removing hop-by-hop headers
    for (const [key, value] of weatherResponse.headers.entries()) {
      if (!['transfer-encoding', 'connection', 'keep-alive', 'content-encoding'].includes(key.toLowerCase())) {
        response.setHeader(key, value);
      }
    }
    
    // Add aggregator metadata to response
    response.setHeader("x-aggregator-processed", "true");

    // Stream the response body
    const buffer = await weatherResponse.arrayBuffer();
    response.end(Buffer.from(buffer));

  } catch (error) {
    console.error("Weather aggregator error:", error);
    const errorResponse = {
      error: "Weather Data Aggregation Error",
      message: error.message,
      timestamp: new Date().toISOString(),
      service: "weather-data-aggregator-v2"
    };
    response.writeHead(502, { "Content-Type": "application/json" });
    response.end(JSON.stringify(errorResponse));
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Weather Data Aggregator Server listening on port ${PORT}`);
  console.log(`Backend URL: ${WEATHER_API_URL}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
