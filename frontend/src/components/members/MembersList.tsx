import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Member } from '../../types/members';
import { MembersService } from '../../services/membersService';
import MemberCard from './MemberCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';

const MembersList: React.FC = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAdmin, setFilterAdmin] = useState<'all' | 'admin' | 'member'>('all');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await MembersService.getAllMembers();
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des membres');
      console.error('Erreur lors du chargement des membres:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      // Filtre par recherche (nom, prénom, email)
      const matchesSearch = searchTerm === '' || 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtre par statut admin
      const matchesAdminFilter = filterAdmin === 'all' ||
        (filterAdmin === 'admin' && member.admin === '1') ||
        (filterAdmin === 'member' && member.admin === '0');

      return matchesSearch && matchesAdminFilter;
    });
  }, [members, searchTerm, filterAdmin]);

  const handleMemberClick = (member: Member) => {
    navigate(`/members/${member.id}`);
  };

  const handleAddMember = () => {
    navigate('/members/new');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec titre et bouton d'ajout */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Membres</h1>
          <p className="mt-1 text-sm text-gray-600">
            {filteredMembers.length} membre{filteredMembers.length > 1 ? 's' : ''} trouvé{filteredMembers.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleAddMember}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un membre
        </button>
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <ErrorAlert 
          message={error} 
          onClose={() => setError('')}
        />
      )}

      {/* Barre de recherche et filtres */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">
              Rechercher un membre
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search"
                name="search"
                type="text"
                placeholder="Rechercher par nom, prénom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filtre par statut admin */}
          <div className="sm:w-48">
            <label htmlFor="adminFilter" className="sr-only">
              Filtrer par statut
            </label>
            <select
              id="adminFilter"
              name="adminFilter"
              value={filterAdmin}
              onChange={(e) => setFilterAdmin(e.target.value as 'all' | 'admin' | 'member')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les membres</option>
              <option value="admin">Administrateurs</option>
              <option value="member">Membres</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des membres */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun membre trouvé</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterAdmin !== 'all' 
              ? 'Essayez de modifier vos critères de recherche.' 
              : 'Commencez par ajouter un membre.'
            }
          </p>
          {(!searchTerm && filterAdmin === 'all') && (
            <div className="mt-6">
              <button
                onClick={handleAddMember}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajouter le premier membre
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onClick={handleMemberClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MembersList;