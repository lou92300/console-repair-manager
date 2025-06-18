export interface Repair {
    id: string;
    dateDuJour: string;
    prenom: string;
    nom: string;
    email: string;
    numeroDeTel: string;
    numeroDeSerie: string;
    panne: string;
    prix: number;
    dateDeRendu: string;
    initialResponsable: string;
    statut: 'en_attente' | 'en_cours' | 'termine';
    dateChangementStatut?: string;
    commentaireFinal?: string;
    factureEnvoyee?: boolean;
    dateEnvoiFacture?: string;
    numeroFacture?: string;
}