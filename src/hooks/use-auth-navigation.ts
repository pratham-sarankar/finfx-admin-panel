import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";

export function useAuthNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const redirectToIntended = (defaultPath: string = "/dashboard") => {
    const from = location.state?.from?.pathname;
    const targetPath = from && from !== "/login" ? from : defaultPath;
    navigate(targetPath, { replace: true });
  };

  const redirectToLogin = (returnPath?: string) => {
    const state = returnPath ? { from: { pathname: returnPath } } : undefined;
    navigate("/login", { state, replace: true });
  };

  const redirectToDashboard = () => {
    navigate("/dashboard", { replace: true });
  };

  return {
    redirectToIntended,
    redirectToLogin,
    redirectToDashboard,
    isAuthenticated,
  };
}
