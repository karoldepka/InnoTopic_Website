export interface WorkCity {
  name: string;
  country: string;
  lat: number;
  lng: number;
}

// Cities where Karol has worked from or with.
// Adjust coordinates to match actual locations.
export const WORK_CITIES: WorkCity[] = [
  { name: 'Berlin',          country: 'Germany',     lat:  52.52,  lng:  13.41  },
  { name: 'Vienna',          country: 'Austria',     lat:  48.21,  lng:  16.37  },
  { name: 'Kraków',          country: 'Poland',      lat:  50.06,  lng:  19.94  },
  { name: 'London',          country: 'UK',          lat:  51.51,  lng:  -0.13  },
  { name: 'San Francisco',   country: 'USA',         lat:  37.77,  lng: -122.42 },
  { name: 'Barcelona',       country: 'Spain',       lat:  41.39,  lng:   2.17  },
  { name: 'Paris',           country: 'France',      lat:  48.86,  lng:   2.35  },
  { name: 'Luxembourg City', country: 'Luxembourg',  lat:  49.61,  lng:   6.13  },
  { name: 'Bangalore',       country: 'India',       lat:  12.97,  lng:  77.59  },
  { name: 'Dubai',           country: 'UAE',         lat:  25.20,  lng:  55.27  },
];
