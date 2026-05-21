import { useState } from 'react';
import IndustrySelector from './landing/IndustrySelector';
import BatteryApp from './battery/App';
import RetailApp from './retail/App';

type Industry = null | 'battery' | 'retail';

export default function App() {
  const [industry, setIndustry] = useState<Industry>(null);

  if (industry === 'battery') {
    return <BatteryApp />;
  }

  if (industry === 'retail') {
    return <RetailApp />;
  }

  return <IndustrySelector onSelect={setIndustry} />;
}
