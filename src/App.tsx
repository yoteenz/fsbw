import { Routes, Route } from 'react-router-dom';
import BuildAWigPage from './pages/build-a-wig/page';
import LengthPage from './pages/build-a-wig/length/page';
import ColorPage from './pages/build-a-wig/color/page';
import DensityPage from './pages/build-a-wig/density/page';
import LacePage from './pages/build-a-wig/lace/page';
import TexturePage from './pages/build-a-wig/texture/page';
import HairlinePage from './pages/build-a-wig/hairline/page';
import CapSizePage from './pages/build-a-wig/cap-size/page';
import StylingPage from './pages/build-a-wig/styling/page';
import AddOnsPage from './pages/build-a-wig/addons/page';
import NoirUnitPage from './pages/units/noir/page';

function App() {
  return (
    <Routes>
      <Route path="/" element={<BuildAWigPage />} />
      <Route path="/build-a-wig" element={<BuildAWigPage />} />
      <Route path="/build-a-wig/length" element={<LengthPage />} />
      <Route path="/build-a-wig/color" element={<ColorPage />} />
      <Route path="/build-a-wig/density" element={<DensityPage />} />
      <Route path="/build-a-wig/lace" element={<LacePage />} />
      <Route path="/build-a-wig/texture" element={<TexturePage />} />
      <Route path="/build-a-wig/hairline" element={<HairlinePage />} />
      <Route path="/build-a-wig/cap-size" element={<CapSizePage />} />
      <Route path="/build-a-wig/styling" element={<StylingPage />} />
      <Route path="/build-a-wig/addons" element={<AddOnsPage />} />
      <Route path="/units/noir" element={<NoirUnitPage />} />
    </Routes>
  );
}

export default App;


