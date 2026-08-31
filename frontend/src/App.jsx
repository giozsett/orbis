import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CriarMapa from './pages/CriarMapa'
import MapaPrincipal from './pages/MapaPrincipal'
import Interpretacoes from './pages/Interpretacoes'
import Horoscopo from './pages/Horoscopo'
import Chat from './pages/Chat'
import Carregando from './pages/Carregando'
import Erro from './pages/Erro'
import Perfil from './pages/Perfil'
import MeusMapas from './pages/MeusMapas'
import PosicoesPlanetarias from './pages/PosicoesPlanetarias'
import Aspectos from './pages/Aspectos'
import Casas from './pages/Casas'
import Retrogrados from './pages/Retrogrados'
import Asteroides from './pages/Asteroides'
import HoroscoposMalucos from './pages/HoroscoposMalucos'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/criar-mapa" element={<CriarMapa />} />
        <Route path="/meus-mapas" element={<MeusMapas />} />
        <Route path="/mapa" element={<MapaPrincipal />} />
        <Route path="/mapa/:id" element={<MapaPrincipal />} />
        <Route path="/mapa/posicoes" element={<PosicoesPlanetarias />} />
        <Route path="/mapa/aspectos" element={<Aspectos />} />
        <Route path="/mapa/casas" element={<Casas />} />
        <Route path="/mapa/retrogrados" element={<Retrogrados />} />
        <Route path="/mapa/asteroides" element={<Asteroides />} />
        <Route path="/interpretacoes" element={<Interpretacoes />} />
        <Route path="/horoscopo" element={<Horoscopo />} />
        <Route path="/horoscopos-malucos" element={<HoroscoposMalucos />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/carregando" element={<Carregando />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="*" element={<Erro />} />
      </Routes>
    </BrowserRouter>
  )
}
