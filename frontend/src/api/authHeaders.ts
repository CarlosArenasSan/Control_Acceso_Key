export const AUTH_UNAUTHORIZED_EVENT = "auth:unauthorized";

export const getAuthHeaders = () => {
  return {};
};

export const getAuthJsonHeaders = () => {
  return {
    "Content-Type": "application/json",
  };
};

export const handleUnauthorized = (response: Response) => {
  if (response.status === 401) {
    window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
  }
};
