// utils/alerts.ts - Utilidades de SweetAlert2 para notificaciones modernas

import Swal from 'sweetalert2';

// Configuración base responsive
const getResponsiveConfig = () => ({
    width: window.innerWidth < 640 ? '90%' : '400px',
    padding: window.innerWidth < 640 ? '1.5rem' : '2rem',
    customClass: {
        confirmButton: 'px-6 py-3 text-base sm:text-lg font-semibold rounded-lg transition-colors',
        cancelButton: 'px-6 py-3 text-base sm:text-lg font-semibold rounded-lg transition-colors',
        popup: 'rounded-xl shadow-2xl',
    },
    buttonsStyling: false,
});

/**
 * Muestra una alerta básica con título, ícono y texto opcional
 * @param titulo - Título de la alerta
 * @param icono - 'success' | 'error' | 'warning' | 'info' | 'question'
 * @param texto - Texto adicional (opcional)
 */
export const mostrarAlerta = (
    titulo: string,
    icono: 'success' | 'error' | 'warning' | 'info' | 'question' = 'info',
    texto?: string
) => {
    return Swal.fire({
        title: titulo,
        text: texto,
        icon: icono,
        confirmButtonText: 'OK',
        confirmButtonColor: '#059669', // green-600
        ...getResponsiveConfig(),
    });
};

/**
 * Muestra un toast flotante (notificación pequeña) que desaparece automáticamente
 * @param titulo - Título del toast
 * @param icono - 'success' | 'error' | 'warning' | 'info'
 */
export const mostrarToast = (
    titulo: string,
    icono: 'success' | 'error' | 'warning' | 'info' = 'success'
) => {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
            popup: 'rounded-lg shadow-lg',
        },
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        },
    });

    return Toast.fire({
        icon: icono,
        title: titulo,
    });
};

/**
 * Muestra un modal de confirmación con botones estilizados
 * @param titulo - Título de la confirmación
 * @param texto - Texto explicativo
 * @param textoConfirmar - Texto del botón de confirmar (default: 'Sí, confirmar')
 * @returns Promise<boolean> - true si se confirmó, false si se canceló
 */
export const confirmarAccion = async (
    titulo: string,
    texto: string,
    textoConfirmar: string = 'Sí, confirmar'
): Promise<boolean> => {
    const result = await Swal.fire({
        title: titulo,
        text: texto,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: textoConfirmar,
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc2626', // red-600
        cancelButtonColor: '#6b7280', // gray-500
        reverseButtons: true,
        ...getResponsiveConfig(),
    });

    return result.isConfirmed;
};

/**
 * Muestra un toast de error rápido
 * @param mensaje - Mensaje de error
 */
export const mostrarError = (mensaje: string) => {
    return mostrarToast(mensaje, 'error');
};

/**
 * Muestra un toast de éxito rápido
 * @param mensaje - Mensaje de éxito
 */
export const mostrarExito = (mensaje: string) => {
    return mostrarToast(mensaje, 'success');
};

/**
 * Muestra un toast de advertencia rápido
 * @param mensaje - Mensaje de advertencia
 */
export const mostrarAdvertencia = (mensaje: string) => {
    return mostrarToast(mensaje, 'warning');
};

/**
 * Muestra un toast de información rápido
 * @param mensaje - Mensaje de información
 */
export const mostrarInfo = (mensaje: string) => {
    return mostrarToast(mensaje, 'info');
};
