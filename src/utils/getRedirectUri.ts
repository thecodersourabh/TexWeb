export const getRedirectUri = () => {
  const isDeployed = window.location.hostname === 'thecodersourabh.github.io';
  return isDeployed
    ? 'https://thecodersourabh.github.io/TexWeb/'
    : 'http://localhost:4173';
};

export const getLogoutUri = () => {
  const isDeployed = window.location.hostname === 'thecodersourabh.github.io';
  return isDeployed
    ? 'https://thecodersourabh.github.io/TexWeb/#/'
    : 'http://localhost:4173/#/';
};
