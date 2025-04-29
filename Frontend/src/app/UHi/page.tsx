"use client"
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Bar } from 'react-chartjs-2';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import LocationMapCard from '@/components/map';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Dynamically import react-leaflet components with SSR disabled
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

type Coords = {
  lat: number;
  lng: number;
};

type Results = {
  urbanLST: number;
  ruralLST: number;
  histogram: number[];
};

// Predefined locations with coordinates
const predefinedLocations = [
  { name: "New York City", coords: { lat: 40.7128, lng: -74.0060 }, urbanLST: 38.5, ruralLST: 31.2, histogram: [2, 10, 25, 50, 35] },
  { name: "Tokyo", coords: { lat: 35.6762, lng: 139.6503 }, urbanLST: 36.8, ruralLST: 29.5, histogram: [3, 12, 30, 45, 25] },
  { name: "London", coords: { lat: 51.5074, lng: -0.1278 }, urbanLST: 33.6, ruralLST: 28.2, histogram: [8, 20, 40, 30, 10] },
  { name: "Delhi", coords: { lat: 28.6139, lng: 77.2090 }, urbanLST: 42.3, ruralLST: 34.1, histogram: [0, 5, 15, 35, 60] },
  { name: "Los Angeles", coords: { lat: 34.0522, lng: -118.2437 }, urbanLST: 37.8, ruralLST: 30.6, histogram: [5, 15, 35, 40, 20] },
  { name: "Sydney", coords: { lat: -33.8688, lng: 151.2093 }, urbanLST: 34.5, ruralLST: 29.8, histogram: [7, 18, 45, 28, 5] },
];

// Temperature thresholds and corresponding AI suggestions
const temperatureSuggestions = [
  { 
    threshold: 35, 
    title: "Moderate Urban Heat Island Effect",
    suggestions: [
      "Consider increasing tree canopy coverage in urban areas",
      "Implement cool roofs on public buildings",
      "Reduce asphalt and concrete in new developments"
    ]
  },
  { 
    threshold: 38, 
    title: "High Urban Heat Island Effect",
    suggestions: [
      "Install green roofs on large buildings",
      "Create more urban parks and green spaces",
      "Implement water features in city centers",
      "Use permeable pavement for new infrastructure projects"
    ]
  },
  { 
    threshold: 40, 
    title: "Severe Urban Heat Island Effect",
    suggestions: [
      "Develop comprehensive heat action plans",
      "Retrofit buildings with energy-efficient materials",
      "Create cooling centers in vulnerable neighborhoods",
      "Implement car-free zones in city centers to reduce vehicle heat emissions",
      "Mandate cool or green roofs for all new construction"
    ]
  }
];

const Home = () => {
  const [location, setLocation] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [coords, setCoords] = useState<Coords | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionTitle, setSuggestionTitle] = useState('');
  
  const fetchCoordinates = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${location}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY}`
      );
      const data = await res.json();
      if (data.results.length) {
        const { lat, lng } = data.results[0].geometry;
        setCoords({ lat, lng });
        fetchUHIAnalysis(lat, lng);
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      setLoading(false);
    }
  };

  const fetchUHIAnalysis = async (lat: number, lng: number) => {
    // Simulating API call with a timeout
    setTimeout(() => {
      // Generate random results that tend to be hotter for locations closer to the equator
      const equatorProximity = Math.abs(lat) / 90; // 0 at equator, 1 at poles
      const baseTemp = 40 - (equatorProximity * 15); // Higher base temp closer to equator
      
      const urbanLST = baseTemp + (Math.random() * 5);
      const ruralLST = urbanLST - 5 - (Math.random() * 3);
      
      const results = {
        urbanLST: parseFloat(urbanLST.toFixed(1)),
        ruralLST: parseFloat(ruralLST.toFixed(1)),
        histogram: [
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 20) + 5,
          Math.floor(Math.random() * 30) + 10,
          Math.floor(Math.random() * 40) + 20,
          Math.floor(Math.random() * 30)
        ]
      };
      
      setResults(results);
      generateSuggestions(results.urbanLST);
      setLoading(false);
    }, 1500);
  };

  const handlePredefinedLocationChange = (value: string) => {
    setSelectedLocation(value);
    const selected = predefinedLocations.find(loc => loc.name === value);
    
    if (selected) {
      setLocation(selected.name);
      setCoords(selected.coords);
      setLoading(true);
      
      // Simulate API call with predefined data
      setTimeout(() => {
        setResults({
          urbanLST: selected.urbanLST,
          ruralLST: selected.ruralLST,
          histogram: selected.histogram
        });
        generateSuggestions(selected.urbanLST);
        setLoading(false);
      }, 1000);
    }
  };

  const generateSuggestions = (temperature: number) => {
    // Find the highest threshold that's exceeded
    const thresholdData = [...temperatureSuggestions]
      .reverse()
      .find(item => temperature >= item.threshold);
    
    if (thresholdData) {
      setSuggestions(thresholdData.suggestions);
      setSuggestionTitle(thresholdData.title);
    } else {
      setSuggestions([]);
      setSuggestionTitle('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-6">
      {/* Hero Section */}
      <header className="text-center py-12 bg-white shadow-lg rounded-lg mx-4">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">Urban Heat Island Analysis</h1>
        <p className="text-xl text-gray-600 mb-8">Analyze Urban vs. Rural Temperature Differences</p>
        
        <div className="flex flex-col items-center space-y-4">
          {/* Predefined locations dropdown */}
          <div className="w-80">
            <Select onValueChange={handlePredefinedLocationChange} value={selectedLocation}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a city" />
              </SelectTrigger>
              <SelectContent>
                {predefinedLocations.map(location => (
                  <SelectItem key={location.name} value={location.name}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <p className="text-sm text-gray-500">Or enter a custom location:</p>
          
          <div className="flex w-80 space-x-2">
            <Input
              type="text"
              placeholder="Enter Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Button onClick={fetchCoordinates} className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300">
              Analyze
            </Button>
          </div>
        </div>
      </header>

      {/* About Section */}
      <section className="mt-12 mx-4 bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">About This Project</h2>
        <p className="text-lg text-gray-600">
          This project aims to provide insights into the Urban Heat Island (UHI) effect by comparing land surface temperatures in urban and rural areas. 
          By selecting or entering a location, users can visualize temperature differences and understand the impact of urbanization on local climates.
          The application also provides AI-generated suggestions for mitigating urban heat when temperatures exceed certain thresholds.
        </p>
      </section>

      {/* How It Works Section */}
      <section className="mt-12 mx-4 bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">How It Works</h2>
        <ol className="list-decimal list-inside text-lg text-gray-600">
          <li>Select a predefined location from the dropdown or enter a custom location.</li>
          <li>For custom locations, click the "Analyze" button to fetch geographical coordinates.</li>
          <li>View the map and temperature analysis results.</li>
          <li>Review the AI suggestions if temperatures exceed critical thresholds.</li>
          <li>Understand the temperature distribution through the histogram.</li>
        </ol>
      </section>

      {/* Demo Section */}
      <section className="mt-12 mx-4 bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Analysis Results</h2>
        <p className="text-lg text-gray-600 mb-4">
          Below is the UHI analysis for the selected location.
        </p>
        {/* Loading Animation */}
        {loading && (
          <div className="flex justify-center mt-8">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        )}
        
        {/* Map Section */}
        {coords && (
          <div className="mt-8 flex justify-center">
            <LocationMapCard coords={coords} />
          </div>
        )}
        
        {/* AI Suggestions Section */}
        {suggestions.length > 0 && (
          <div className="mt-8 max-w-4xl mx-auto">
            <Alert variant="destructive" className={results && results.urbanLST >= 40 ? "bg-red-50 border-red-200" : 
              results && results.urbanLST >= 38 ? "bg-orange-50 border-orange-200" : "bg-yellow-50 border-yellow-200"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-lg font-bold">{suggestionTitle}</AlertTitle>
              <AlertDescription>
                <p className="mb-2">The urban temperature in this area is {results?.urbanLST}°C, which is {(results?.urbanLST - results?.ruralLST).toFixed(1)}°C higher than surrounding rural areas.</p>
                <p className="font-semibold mb-1">AI-generated recommendations:</p>
                <ul className="list-disc pl-6">
                  {suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        {/* Results Section */}
        {results && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Urban LST</CardTitle>
                <CardDescription>Land Surface Temperature in Urban Areas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${results.urbanLST >= 40 ? 'text-red-600' : results.urbanLST >= 35 ? 'text-orange-500' : 'text-yellow-500'}`}>
                  {results.urbanLST}°C
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Rural LST</CardTitle>
                <CardDescription>Land Surface Temperature in Rural Areas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{results.ruralLST}°C</p>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>UHI Intensity</CardTitle>
                <CardDescription>Urban-Rural Temperature Difference</CardDescription>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${
                  results.urbanLST - results.ruralLST >= 8 ? 'text-red-600' : 
                  results.urbanLST - results.ruralLST >= 5 ? 'text-orange-500' : 
                  'text-yellow-500'
                }`}>
                  {(results.urbanLST - results.ruralLST).toFixed(1)}°C
                </p>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Temperature Distribution</CardTitle>
                <CardDescription>Distribution of temperature across the area</CardDescription>
              </CardHeader>
              <CardContent>
                <Bar
                  data={{
                    labels: ['<20°C', '20-30°C', '30-35°C', '35-40°C', '>40°C'],
                    datasets: [{ 
                      label: 'Pixels', 
                      data: results.histogram, 
                      backgroundColor: [
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(255, 159, 64, 0.6)',
                        'rgba(255, 99, 132, 0.6)'
                      ] 
                    }],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: true,
                        text: 'Temperature Distribution Histogram',
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;