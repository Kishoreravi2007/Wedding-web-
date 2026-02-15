import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminAuthGuardProps {
    children: React.ReactNode;
}

export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem('admin_token');

    useEffect(() => {
        if (!token) {
            // Redirect to admin login if no token found
            navigate('/admin/login');
        }
    }, [token, navigate]);

    if (!token) {
        return null; // or a loading spinner
    }

    return <>{children}</>;
};
