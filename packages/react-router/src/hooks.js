//
// Copyright 2020 DXOS.org
//

import queryString from 'query-string';
import { useLocation } from 'react-router-dom';

/**
 * Returns the parsed URL query params.
 * @returns {Object}
 */
export const useQuery = () => {
  const location = useLocation();
  return queryString.parse(location.search);
};
