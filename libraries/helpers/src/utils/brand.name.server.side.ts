import { isGeneralServerSide } from '@gitroom/helpers/utils/is.general.server.side';

// BRAND_NAME white-labels the app, the default name is kept when it is unset
export const brandNameServerSide = () =>
  process.env.BRAND_NAME || (isGeneralServerSide() ? 'Postiz' : 'Gitroom');
