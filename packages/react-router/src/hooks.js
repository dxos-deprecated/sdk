//
// Copyright 2020 DXOS.
//

import { useLocation } from 'react-router-dom';
import queryString from 'query-string';

/**
 * Returns the parsed URL query params.
 * @returns {Object}
 */
export const useQuery = () => {
  const location = useLocation();
  return queryString.parse(location.search);
};
