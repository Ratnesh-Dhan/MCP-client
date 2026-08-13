let networkURL: string = "";

export const setUrl = (newUrl: string) => {
  networkURL = newUrl;
};

export const getUrl = () => {
  console.log("networkURL", networkURL);
  return networkURL;
};
