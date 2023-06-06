import React from 'react';
import { InvestorRequestsTable} from 'widgets/request';
import { Container } from 'shared/ui';
import { useParams } from 'react-router-dom';


export const MainPage = () => {
    const { id , countUsers, countryCode, seed, startUser} = useParams();

  return (
    <Container marginTop={24}>

      <Container marginTop={48}>
        <InvestorRequestsTable />
      </Container>
    </Container>
  );
};

