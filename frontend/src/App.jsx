import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CriarMapa from './pages/CriarMapa'
import MapaPrincipal from './pages/MapaPrincipal'
import Interpretacoes from './pages/Interpretacoes'
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
import Arcanos from './pages/Arcanos'
import MatrizDestino from './pages/MatrizDestino'
import { useTema } from './utils/tema'

export default function App() {
  // corTema() lê o tema na hora do render; assinar aqui faz todas as telas acompanharem a troca
  useTema()

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
        <Route path="/arcanos" element={<Arcanos />} />
        <Route path="/matriz-do-destino" element={<MatrizDestino />} />
        <Route path="/interpretacoes" element={<Interpretacoes />} />
        <Route path="/horoscopos-malucos" element={<HoroscoposMalucos />} />
        <Route path="/carregando" element={<Carregando />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="*" element={<Erro />} />
      </Routes>
    </BrowserRouter>
  )
}
