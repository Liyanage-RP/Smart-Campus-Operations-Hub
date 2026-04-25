import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { toast } from 'react-toastify';

export default function OAuth2Callback() {
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      authApi.getMe()
        .then((res) => {
          loginWithToken(token, res.data);
          toast.success('Signed in with Google!');
          navigate('/dashboard');
        })
        .catch(() => {
          toast.error('OAuth login failed');
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, [searchParams, loginWithToken, navigate]);

  return (
    <div className="app-loading">
      <div className="app-loading-spinner" />
      <p>Completing sign-in...</p>
    </div>
  );
}
