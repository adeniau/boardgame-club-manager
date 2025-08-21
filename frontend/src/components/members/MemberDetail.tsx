import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Member, MemberBorrow } from '../../types/members';
import { MembersService } from '../../services/membersService';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';
import { VALIDATION_RULES } from '../../constants/validation';

const MemberDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [borrowHistory, setBorrowHistory] = useState<MemberBorrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState<string>('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadMemberData(parseInt(id));
    }
  }, [id]);

  const loadMemberData = async (memberId: number) => {
    try {
      setLoading(true);
      setError('');
      
      // Charger les données du membre et son historique en parallèle
      const [memberData, historyData] = await Promise.all([
        MembersService.getMemberById(memberId),
        loadBorrowHistory(memberId)
      ]);
      
      setMember(memberData);
      setBorrowHistory(historyData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du membre');
      console.error('Erreur lors du chargement du membre:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBorrowHistory = async (memberId: number): Promise<MemberBorrow[]> => {
    try {
      setLoadingHistory(true);
      return await MembersService.getMemberBorrows(memberId);
    } catch (err) {
      console.error('Erreur lors du chargement de l\'historique:', err);
      return [];
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleEdit = () => {
    navigate(`/members/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!member) return;
    
    try {
      setDeleting(true);
      await MembersService.deleteMember(member.id);
      navigate('/members', { 
        state: { message: VALIDATION_RULES.SUCCESS.MEMBER_DELETED }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du membre');
      console.error('Erreur lors de la suppression du membre:', err);
    } finally {
      setDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getAdminBadge = () => {
    if (member?.admin === '1') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
          <svg className="mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L3 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.734.99A.996.996 0 0118 6v2a1 1 0 11-2 0v-.277l-1.254.145a1 1 0 11-.992-1.736L14.984 6l-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.723V12a1 1 0 11-2 0v-1.277l-1.246-.855a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.277l1.246.855a1 1 0 01-.992 1.736L3 15.723V16a1 1 0 01-2 0v-2a.996.996 0 01.52-.878L3 11zm14 0a1 1 0 01.48.878L19 13v2a1 1 0 11-2 0v-.277l-1.254-.145a1 1 0 11.992-1.736L17.984 14l-.23.132A1 1 0 0116.382 12.504z" clipRule="evenodd" />
          </svg>
          Administrateur
        </span>
      );
    }
    return null;
  };

  const getCurrentBorrows = () => {
    return borrowHistory.filter(borrow => !borrow.return_date);
  };

  const getCompletedBorrows = () => {
    return borrowHistory.filter(borrow => !!borrow.return_date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="max-w-4xl mx-auto">
        <ErrorAlert 
          message="Membre non trouvé" 
          onClose={() => navigate('/members')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header avec actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={MembersService.getImageUrl(member.picture)}
                alt={`${member.firstname} ${member.name}`}
                className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-game.jpg';
                }}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {member.firstname} {member.name}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  {getAdminBadge()}
                  <p className="text-gray-600">{member.email}</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => navigate('/members')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Retour à la liste
              </button>
              <button
                onClick={handleEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Modifier
              </button>
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <ErrorAlert 
          message={error} 
          onClose={() => setError('')}
        />
      )}

      {/* Informations détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations personnelles */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Date de naissance</dt>
              <dd className="text-sm text-gray-900">{formatDate(member.birth_date)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
              <dd className="text-sm text-gray-900">{member.phone_number}</dd>
            </div>
            {member.discord_tag && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Discord</dt>
                <dd className="text-sm text-gray-900">{member.discord_tag}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Adresse */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Adresse</h2>
          <div className="text-sm text-gray-900">
            <p>{member.adress}</p>
            <p>{member.postal_code} {member.city}</p>
          </div>
        </div>
      </div>

      {/* Statistiques des emprunts */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiques d'emprunts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Emprunts actuels</p>
                <p className="text-2xl font-semibold text-blue-900">{getCurrentBorrows().length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Emprunts terminés</p>
                <p className="text-2xl font-semibold text-green-900">{getCompletedBorrows().length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total emprunts</p>
                <p className="text-2xl font-semibold text-gray-900">{borrowHistory.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historique des emprunts */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Historique des emprunts</h2>
        </div>
        
        {loadingHistory ? (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner />
          </div>
        ) : borrowHistory.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun emprunt</h3>
            <p className="mt-1 text-sm text-gray-500">Ce membre n'a encore emprunté aucun jeu.</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jeu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'emprunt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de retour
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commentaire
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {borrowHistory.map((borrow, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {borrow.game_name || `Jeu #${borrow.id_game}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(borrow.borrow_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {borrow.return_date ? formatDate(borrow.return_date) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {borrow.return_date ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Retourné
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          En cours
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {borrow.comment || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-center text-gray-900 mb-2">
                Supprimer le membre
              </h3>
              <p className="text-sm text-center text-gray-500 mb-4">
                Êtes-vous sûr de vouloir supprimer définitivement {member.firstname} {member.name} ?
                Cette action est irréversible.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={deleting}
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {deleting && <LoadingSpinner size="sm" className="mr-2" />}
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDetail;