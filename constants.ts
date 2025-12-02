

import { AppConfig } from './types';

export const INITIAL_CONFIG: AppConfig = {
  companyName: "Electricity Development Corporation",
  companyLogo: "https://ui-avatars.com/api/?name=EDC&background=003366&color=FF6600&size=128",
  locations: [
    "ALP", "BLP", "AMB", "BMB", "AMP", "BM", "AMV","BMV", "ARE", "ARS", "EDC"
  ],
  states: [
    "Bon état", "Défectueux", "Déprécié", "En maintenance", "Retiré"
  ],
  holderPresences: [
    "Présent", "Absent", "Non applicable"
  ],
  categoriesDescriptions: {
    "AA": "Matériel de bureau",
    "BB": "Matériel bureautique",
    "CC": "Matériel informatique",
    "DD": "Mobilier de bureau",
    "EE": "Matériel et Mobilier de bureau logement du personnel",
    "FF": "Matériel de transport",
    "GG": "Autres Matériels de transport",
    "II": "Outillage agricole",
    "JJ": "Outillage industriel",
    "KK": "Matériel industriel",
    "QQ": "Autres immobilisations corporelles"
  },
  categories: {
    "AA": [
      "Agrafeuse géante", "Aspirateur", "Autres", "Cafetière", "Coffre-fort", "Calculatrice électrique", 
      "Décodeur numérique", "Enregistreur", "Relieuse", "Ventilateur", "Perforatrice géante", 
      "Frigo de chambre", "Split (systèmes de climatisation)", "Cuisinière", "Micro-ondes", 
      "Amplificateur micro", "Amplificateur sonore", "Console", "Micro (microphone)"
    ],
    "BB": [
      "Destructeur de papier", "Imprimantes bureautiques et multifonctions", "Relieuse", "Scanners", 
      "Destructeur de papier", "Copieur", "Imprimantes", "Scanners", "Relieuse", "Fax", 
      "Massicots / machines de finition", "Onduleur petit modèle bureautique", "Téléphone fixe", 
      "Enregistreur (dictaphone)", "Autres"
    ],
    "CC": [
      "Autres", "Baie de brassage", "Modem", "Ordinateurs de bureau écran", "Ordinateurs de bureau UC", 
      "Ordinateurs portables", "Pager system", "Parasurtenseur", "Rail électrique", "Relieuse", 
      "Routeurs", "Scanners", "Serveurs", "Supports pour écrans", "Switch", "Systèmes de drainage", 
      "Systèmes d'onduleurs", "Table de contrôle", "Parasurtenseur", "Logiciels", "Sites internet", 
      "Système de contrôle et d'automatisation", "Vidéoprojecteur", "Console jeu de lumière"
    ],
    "DD": [
      "Armoire", "Armoires à dossiers suspendus", "Armoires à portes battantes ou coulissantes", 
      "Armoires à rideaux", "Autres", "Bureaux avec retour ou extensions", "Bureaux de direction", 
      "Bureaux sans retour", "Caisson", "Caissons mobiles ou fixes", "Canapés", "Chaises", 
      "Chaises assorties", "Chaises de travail réglables", "Chaises ergonomiques", 
      "Chaises pour salle d'attente", "Chaises pour visiteurs", "Charriot", "Classeurs à tiroirs", 
      "Commodes et chiffonniers", "Étagères ouvertes ou fermées", "Fauteuils à haut dossier", 
      "Fauteuils de direction", "Fauteuils ergonomiques avec accoudoirs", "Fauteuils individuels pour les salons", 
      "Retour bureau", "Salon", "Supports pour écrans", "Table", "Tables basses", "Tables d'accueil modulaires", 
      "Tables d'appoint", "Tables de conférence", "Tables de réunion", "Tables de salle à manger"
    ],
    "EE": [
      "Armoire", "Armoires à portes battantes ou coulissantes", "Armoires pour le rangement des vêtements", 
      "Autres", "Bureaux sans retour", "Cafetière", "Caisson", "Caissons mobiles ou fixes", "Chaises", 
      "Chaises assorties", "Chaises pour salle d'attente", "Chaises pour visiteurs", "Charriot", 
      "Chauffages d'appoint", "Congélateur", "Cuisinière", "Décodeur numérique", "Fauteuils de direction", 
      "Fauteuils ergonomiques avec accoudoirs", "Fauteuils individuels pour les salons", "Flip chart", 
      "Frigo de chambre", "Friteuse", "Lits simples ou doubles", "Machine à laver", "Matelas associés", 
      "Micro-ondes", "Réfrigérateur", "Salon", "Supports pour écrans", "Table", "Tables basses", 
      "Tables de chevet", "Tables de conférence", "Tables de réunion", "Tables de salle à manger", "Téléviseur"
    ],
    "FF": [
      "Utilitaire", "Voitures de service", "Moto", "Tricycles motorisés", "Autres", "Camionnettes", 
      "Fourgonnettes", "Autobus", "minibus", "Véhicules pick-up", "Véhicules utilitaires"
    ],
    "GG": [
      "Chariot", "Extracteurs de roulements si destinés manutention", 
      "Cuve à gasoil mobile (pour transport interne du carburant)", "Autres"
    ],
    "II": [
      "Désherbeuses mécaniques", "Autres"
    ],
    "JJ": [
      "Caisses à outils", "Outillage mécanique (clés dynamométriques)", "Meuleuses", 
      "Scies électriques", "Postes à souder", "Autres"
    ],
    "KK": [
      "Cuve à gasoil", "Groupe électrogène", "Four professionnel", "Chaudières industrielles", 
      "Pompes industrielles", "Transformateurs", "équipements d'énergie internes", 
      "Stations de pompage industrielles", "Générateurs", "Extracteurs de roulements", 
      "Chambre froide", "Piano cuisinière professionnelle", "Autres", "Pompes industrielles"
    ],
    "QQ": [
      "Autres", "Extincteur", "Paravents ou séparateurs de bureau"
    ]
  },
  customFields: [],
  coreFields: [
    { key: 'door', label: 'Porte', type: 'Texte', isVisible: true },
    { key: 'holder', label: 'Détenteur', type: 'Texte', isVisible: true },
    { key: 'description', label: 'Description', type: 'Texte Long', isVisible: true },
    { key: 'observation', label: 'Observation', type: 'Texte Long', isVisible: true },
    { key: 'photoUrl', label: 'Photo', type: 'Image', isVisible: true },
    { key: 'registrationDate', label: 'Date d\'enregistrement', type: 'Date', isVisible: true }
  ]
};
