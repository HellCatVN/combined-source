import React, { useEffect, useState } from 'react';
import { AbilityContext, AppAbility, defineAbilityFor } from '../configs/ability';
import { useInitAuth } from '@hooks/react-query/useAuthentication';
import type { IClientUser } from '@interfaces';

export const AbilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ability, setAbility] = useState<AppAbility | null>(null);
  
  const { data: authData } = useInitAuth(true);
  const user = authData?.data?.user;

  useEffect(() => {
    if (user) {
      const newAbility = defineAbilityFor({
        permissions: user.role?.permissions || []
      });
      setAbility(newAbility);
    }
  }, [user]);

  if (!ability) {
    return null; // or a loading spinner
  }

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
};