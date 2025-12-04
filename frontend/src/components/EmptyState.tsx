// components/EmptyState.tsx - Componente para mostrar estados vacíos elegantes

import React from 'react';

interface EmptyStateProps {
    icono?: 'carrito' | 'busqueda' | 'pedidos' | 'generico';
    titulo: string;
    descripcion?: string;
    textoBoton?: string;
    onBotonClick?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icono = 'generico',
    titulo,
    descripcion,
    textoBoton,
    onBotonClick,
}) => {
    // SVG Icons
    const iconos = {
        carrito: (
            <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        busqueda: (
            <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        ),
        pedidos: (
            <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        generico: (
            <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
        ),
    };

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 sm:py-16 sm:px-6 lg:py-20">
            {/* Icono */}
            <div className="mb-6 sm:mb-8">
                {iconos[icono]}
            </div>

            {/* Título */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">
                {titulo}
            </h2>

            {/* Descripción (opcional) */}
            {descripcion && (
                <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 text-center max-w-md px-4">
                    {descripcion}
                </p>
            )}

            {/* Botón CTA (opcional) */}
            {textoBoton && onBotonClick && (
                <button
                    onClick={onBotonClick}
                    className="btn-animated bg-primary-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
                >
                    {textoBoton}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
