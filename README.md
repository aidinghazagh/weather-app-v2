# Weather Data Aggregator v2

A high-performance edge-based weather data aggregation service built with Netlify Edge Functions.

## Overview

Weather Data Aggregator is a lightweight service that intelligently fetches and processes real-time weather information from multiple meteorological data sources. It provides a unified interface for weather data retrieval with built-in request optimization and response caching.

## Features

- **Edge-Based Processing**: Runs on Netlify's globally distributed edge network for low-latency responses
- **Request Forwarding**: Efficiently forwards weather queries to configured backend data sources
- **Header Management**: Intelligent header filtering and optimization for weather API requests
- **Stream Processing**: Handles large weather datasets with minimal memory overhead through streaming
- **Error Handling**: Robust error management with detailed logging for debugging
- **Multi-Source Support**: Seamlessly aggregate data from multiple weather API providers

## Architecture

The service uses Netlify Edge Functions to:
1. Intercept incoming weather data requests
2. Forward them to configured backend weather services
3. Process and optimize the responses
4. Return aggregated weather information to clients

## Configuration

Set the `BACKEND_URL` environment variable in your Netlify deployment to point to your weather data source:

```bash
BACKEND_URL=https://weather-api-backend.example.com
```

## Deployment

Deploy to Netlify:

```bash
netlify deploy
```

The edge function will automatically be deployed and active on all routes.

## Performance

- **Ultra-low latency**: Edge-based processing eliminates backend hops
- **Efficient streaming**: No buffering of response bodies
- **Optimized headers**: Removes unnecessary hop-by-hop headers

## Development

```bash
npm install
```

## License

MIT
