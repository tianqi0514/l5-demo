import { useState } from 'react';
import LoginPage from './components/LoginPage';
import BatteryApp from './battery/App';
import RetailApp from './retail/App';
import EnergyApp from './energy/App';

type AppState = 'login' | 'battery' | 'retail' | 'energy';

export default function App() {
  const [appState, setAppState] = useState<AppState>('login');

  if (appState === 'login') {
    return <LoginPage onLogin={(industry) => setAppState(industry)} />;
  }

  if (appState === 'battery') {
    return <BatteryApp />;
  }

  if (appState === 'retail') {
    return <RetailApp />;
  }

  return <EnergyApp />;
}
