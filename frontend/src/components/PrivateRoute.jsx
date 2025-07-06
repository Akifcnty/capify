import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  // Kullanıcı kontrolü geçici olarak devre dışı
  return children;
};

export default PrivateRoute; 