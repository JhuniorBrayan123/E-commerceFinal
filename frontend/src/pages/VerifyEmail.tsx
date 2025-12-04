import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const VerifyEmail: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Token de verificación no encontrado.');
            return;
        }

        const verifyToken = async () => {
            try {
                // Asumiendo que el auth-service está en el puerto 8000 o configurado en el proxy
                // Ajusta la URL según tu configuración de backend
                const response = await fetch(`http://localhost:8000/api/auth/verify-email?token=${token}`);
                const data = await response.json();

                if (response.ok && data.success) {
                    setStatus('success');
                    setMessage('¡Tu correo ha sido verificado exitosamente!');
                    setTimeout(() => {
                        navigate('/auth'); // Redirigir al login
                    }, 3000);
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Error al verificar el correo.');
                }
            } catch (error) {
                setStatus('error');
                setMessage('Error de conexión con el servidor.');
            }
        };

        verifyToken();
    }, [token, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    {status === 'verifying' && (
                        <>
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                            <h2 className="text-2xl font-bold text-gray-900">Verificando tu correo...</h2>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Verificado!</h2>
                            <p className="text-gray-600">{message}</p>
                            <p className="text-sm text-gray-500 mt-4">Redirigiendo al inicio de sesión...</p>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error de Verificación</h2>
                            <p className="text-red-600">{message}</p>
                            <button
                                onClick={() => navigate('/auth')}
                                className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                Volver al inicio
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
