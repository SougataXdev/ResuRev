// Deprecated redirect component (no longer routed). Safe to delete.
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function ReviewDeprecated() {
  const navigate = useNavigate();
  useEffect(()=> { navigate('/dashboard', { replace: true }); }, [navigate]);
  return null;
}
