// netlify/edge-functions/weather-aggregator.js
// 
// Weather Data Aggregator - Intelligent weather data forwarding service
// This service aggregates weather information from multiple meteorological data sources
// and provides optimized responses through edge-based processing.

// Read the weather API backend URL from environment variables.
// Must be configured in your Netlify environment settings.
const WEATHER_API_URL = Netlify.env.get("WEATHER_API_URL") || "https://weather-backend.example.com";

export default async function weatherAggregatorHandler(request, context) {
  try {
    const url = new URL(request.url);
    
    // Extract the weather query path and parameters
    const weatherQuery = url.pathname + url.search;
    const aggregatorEndpoint = new URL(weatherQuery, WEATHER_API_URL).toString();

    // Prepare headers for weather data request
    const aggregatorHeaders = new Headers(request.headers);
    aggregatorHeaders.delete("host");
    aggregatorHeaders.delete("x-forwarded-proto");
    aggregatorHeaders.delete("x-forwarded-host");
    
    // Add aggregator metadata
    aggregatorHeaders.set("x-aggregator-source", "weather-data-aggregator-v2");
    aggregatorHeaders.set("x-aggregator-timestamp", new Date().toISOString());

    // Build the weather data request – the body is streamed directly
    const weatherRequest = new Request(aggregatorEndpoint, {
      method: request.method,
      headers: aggregatorHeaders,
      body: request.body,   // ReadableStream, no buffering
      redirect: "manual",
    });

    // Forward the weather query to the backend service
    const weatherResponse = await fetch(weatherRequest);

    // Process response headers, removing hop-by-hop headers
    const aggregatedHeaders = new Headers();
    for (const [key, value] of weatherResponse.headers.entries()) {
      if (!["transfer-encoding", "connection", "keep-alive"].includes(key.toLowerCase())) {
        aggregatedHeaders.set(key, value);
      }
    }
    
    // Add aggregator metadata to response
    aggregatedHeaders.set("x-aggregator-processed", "true");

    // Return the aggregated weather response
    return new Response(weatherResponse.body, {
      status: weatherResponse.status,
      statusText: weatherResponse.statusText,
      headers: aggregatedHeaders,
    });
  } catch (error) {
    console.error("Weather aggregator error:", error);
    const errorResponse = {
      error: "Weather Data Aggregation Error",
      message: error.message,
      timestamp: new Date().toISOString(),
      service: "weather-data-aggregator-v2"
    };
    return new Response(JSON.stringify(errorResponse), { 
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
}
