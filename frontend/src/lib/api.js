const API_BASE_URL = 'http://localhost:3000/api';

// Helper function for fetch
async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
}

// Bedroom API
export const bedroomAPI = {
  getAll: () => fetchAPI('/bedrooms'),
  getById: (id) => fetchAPI(`/bedrooms/${id}`),
  create: (data) => fetchAPI('/bedrooms', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchAPI(`/bedrooms/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchAPI(`/bedrooms/${id}`, {
    method: 'DELETE',
  }),
};

// Sensor API
export const sensorAPI = {
  getAll: () => fetchAPI('/sensors'),
  getByBedroom: (bedroomId) => fetchAPI(`/sensors/bedroom/${bedroomId}`),
  getById: (id) => fetchAPI(`/sensors/${id}`),
  create: (data) => fetchAPI('/sensors', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchAPI(`/sensors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchAPI(`/sensors/${id}`, {
    method: 'DELETE',
  }),
  toggle: (id) => fetchAPI(`/sensors/${id}/toggle`, {
    method: 'PATCH',
  }),
};

// Sensor Logs API
export const sensorLogAPI = {
  getLatest: () => fetchAPI('/sensor-logs/latest'),
  getRecent: (minutes = 10) => fetchAPI(`/sensor-logs/recent?minutes=${minutes}`),
  getBySensor: (sensorId) => fetchAPI(`/sensor-logs/sensor/${sensorId}`),
  getSensorStats: (sensorId) => fetchAPI(`/sensor-logs/sensor/${sensorId}/stats`),
  getByBedroom: (bedroomName) => fetchAPI(`/sensor-logs/bedroom/${encodeURIComponent(bedroomName)}`),
};

// Simulation API
export const simulationAPI = {
  getStatus: () => fetchAPI('/simulation/status'),
  start: (intervalMs) => fetchAPI('/simulation/start', {
    method: 'POST',
    body: JSON.stringify({ interval_ms: intervalMs }),
  }),
  stop: () => fetchAPI('/simulation/stop', {
    method: 'POST',
  }),
  restart: (intervalMs) => fetchAPI('/simulation/restart', {
    method: 'POST',
    body: JSON.stringify({ interval_ms: intervalMs }),
  }),
  updateInterval: (intervalMs) => fetchAPI('/simulation/interval', {
    method: 'PUT',
    body: JSON.stringify({ interval_ms: intervalMs }),
  }),
};
