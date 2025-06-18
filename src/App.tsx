import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import RepairForm from './components/RepairForm';
import RepairList from './components/RepairList';
import OngoingRepairs from './components/OngoingRepairs';
import CompletedRepairs from './components/CompletedRepairs';
import Login from './components/Login';
import Header from './components/Header';
import { Repair } from './types';
import { RepairService } from './services/repairServiceSecure';
import AuthService from './services/authService';
import './styles/main.css';

const App: React.FC = () => {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuthentication = async () => {
      setIsCheckingAuth(true);
      
      if (AuthService.isAuthenticated()) {
        // Vérifier la validité du token
        const isValid = await AuthService.validateToken();
        if (isValid) {
          setIsAuthenticated(true);
          await refreshRepairs();
        } else {
          AuthService.logout();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      
      setIsCheckingAuth(false);
    };

    checkAuthentication();
  }, []);

  // Actualiser les réparations
  const refreshRepairs = async () => {
    if (!AuthService.isAuthenticated()) {
      setApiConnected(false);
      setRepairs([]);
      return;
    }

    setLoading(true);
    try {
      const isConnected = await RepairService.testConnection();
      setApiConnected(isConnected);
      
      if (isConnected) {
        const repairsData = await RepairService.getAllRepairs();
        setRepairs(repairsData);
        console.log('🔄 Données actualisées:', repairsData.length, 'réparations');
      } else {
        setRepairs([]);
      }
    } catch (error) {
      console.error('Erreur lors de l\'actualisation:', error);
      setApiConnected(false);
      setRepairs([]);
    } finally {
      setLoading(false);
    }
  };

  // Gérer la connexion réussie
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    refreshRepairs();
  };

  // Gérer la déconnexion
  const handleLogout = () => {
    setIsAuthenticated(false);
    setRepairs([]);
    setApiConnected(false);
  };

  // Ajouter une réparation
  const handleAddRepair = async (newRepair: Omit<Repair, 'id'>) => {
    if (!apiConnected) {
      alert('API non disponible. Vérifiez que le serveur est démarré.');
      return;
    }

    const addedRepair = await RepairService.addRepair(newRepair);
    if (addedRepair) {
      await refreshRepairs();
      alert('✅ Réparation ajoutée avec succès !');
    } else {
      alert('❌ Erreur lors de l\'ajout de la réparation.');
    }
  };

  // Supprimer une réparation
  const handleDeleteRepair = async (id: string) => {
    if (!apiConnected) {
      alert('API non disponible. Vérifiez que le serveur est démarré.');
      return;
    }

    const result = await RepairService.deleteRepair(id);
    if (result.success) {
      await refreshRepairs();
      alert(`✅ ${result.message}`);
    } else {
      alert(`❌ Erreur: ${result.message}`);
    }
  };

  // Changer le statut d'une réparation
  const handleStatusChange = async (id: string, newStatus: 'en_attente' | 'en_cours' | 'termine', commentaire?: string) => {
    if (!apiConnected) {
      alert('API non disponible. Vérifiez que le serveur est démarré.');
      return;
    }

    const result = await RepairService.changeRepairStatus(id, newStatus, commentaire);
    if (result.repair) {
      await refreshRepairs();
      let message = `✅ Statut changé vers "${newStatus}"`;
      if (result.emailSent) {
        message += `\n📧 ${result.message}`;
      } else if (result.message) {
        message += `\n⚠️ ${result.message}`;
      }
      alert(message);
    } else {
      alert(`❌ Erreur: ${result.message}`);
    }
  };

  // Envoyer une facture
  const handleSendInvoice = async (id: string) => {
    if (!apiConnected) {
      alert('API non disponible. Vérifiez que le serveur est démarré.');
      return;
    }

    const result = await RepairService.sendInvoice(id);
    if (result.success) {
      await refreshRepairs();
      alert(`✅ ${result.message}\n📄 Numéro de facture : ${result.numeroFacture}`);
    } else {
      alert(`❌ Erreur: ${result.message}`);
    }
  };

  // Affichage pendant la vérification d'authentification
  if (isCheckingAuth) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h2>🔐 Vérification de l'authentification...</h2>
          <p>Patientez s'il vous plaît</p>
        </div>
      </div>
    );
  }

  // Affichage de la page de connexion si non authentifié
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Interface principale pour les utilisateurs authentifiés
  return (
    <Router>
      <div className="app">
        <Header onLogout={handleLogout} />
        
        {/* Indicateur de connexion API */}
        <div style={{
          backgroundColor: apiConnected ? '#d4edda' : '#f8d7da',
          color: apiConnected ? '#155724' : '#721c24',
          padding: '10px',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          {apiConnected ? '✅ API connectée et sécurisée' : '❌ API déconnectée - Fonctionnalités limitées'}
        </div>

        {/* Navigation */}
        <nav style={{
          backgroundColor: '#34495e',
          padding: '15px',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          <Link to="/" style={{
            color: 'white',
            textDecoration: 'none',
            padding: '10px 15px',
            borderRadius: '5px',
            backgroundColor: '#2c3e50',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            🏠 Dashboard
          </Link>
          
          <Link to="/new-repair" style={{
            color: 'white',
            textDecoration: 'none',
            padding: '10px 15px',
            borderRadius: '5px',
            backgroundColor: '#27ae60',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            ➕ Nouvelle Réparation
          </Link>
          
          <Link to="/repair-list" style={{
            color: 'white',
            textDecoration: 'none',
            padding: '10px 15px',
            borderRadius: '5px',
            backgroundColor: '#3498db',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            📋 Liste Complète
          </Link>
          
          <Link to="/ongoing-repairs" style={{
            color: 'white',
            textDecoration: 'none',
            padding: '10px 15px',
            borderRadius: '5px',
            backgroundColor: '#f39c12',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            🔧 En Cours
          </Link>
          
          <Link to="/completed-repairs" style={{
            color: 'white',
            textDecoration: 'none',
            padding: '10px 15px',
            borderRadius: '5px',
            backgroundColor: '#2ecc71',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            ✅ Terminées
          </Link>
        </nav>

        {/* Contenu principal */}
        <main style={{ padding: '20px', minHeight: 'calc(100vh - 200px)' }}>
          {loading && apiConnected ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <h2>🔄 Chargement sécurisé des données...</h2>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={
                <Dashboard 
                  repairs={repairs} 
                  onAddRepair={handleAddRepair}
                  onDeleteRepair={handleDeleteRepair}
                  onStatusChange={handleStatusChange}
                  onSendInvoice={handleSendInvoice}
                  apiConnected={apiConnected}
                />
              } />
              
              <Route path="/new-repair" element={
                <RepairForm onAddRepair={handleAddRepair} apiConnected={apiConnected} />
              } />
              
              <Route path="/repair-list" element={
                <RepairList 
                  repairs={repairs} 
                  onDeleteRepair={handleDeleteRepair}
                  onStatusChange={handleStatusChange}
                  onSendInvoice={handleSendInvoice}
                  apiConnected={apiConnected}
                />
              } />
              
              <Route path="/ongoing-repairs" element={
                <OngoingRepairs 
                  repairs={repairs} 
                  onStatusChange={handleStatusChange}
                  onSendInvoice={handleSendInvoice}
                  apiConnected={apiConnected}
                />
              } />
              
              <Route path="/completed-repairs" element={
                <CompletedRepairs 
                  repairs={repairs} 
                  onDeleteRepair={handleDeleteRepair}
                  onSendInvoice={handleSendInvoice}
                  apiConnected={apiConnected}
                />
              } />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </main>

        {/* Footer avec informations de sécurité */}
        <footer style={{
          backgroundColor: '#2c3e50',
          color: 'white',
          padding: '15px',
          textAlign: 'center',
          fontSize: '12px'
        }}>
          <div>
            🔒 Application sécurisée - Session utilisateur: {AuthService.getCurrentUser()?.username}
          </div>
          <div style={{ marginTop: '5px', color: '#bdc3c7' }}>
            Données chiffrées • Authentification JWT • Audit des accès
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
