import React from 'react';
import SeasonsList from '../../components/seasons/SeasonsList';

const SeasonsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <SeasonsList />
    </div>
  );
};

export default SeasonsPage;