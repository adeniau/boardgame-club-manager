import React from 'react';
import MembersList from '../../components/members/MembersList';

const MembersPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <MembersList />
    </div>
  );
};

export default MembersPage;