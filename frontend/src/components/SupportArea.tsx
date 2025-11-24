// D:\E-commerceFinal\frontend\src\components\SupportArea.tsx

import React from 'react';

const SupportArea: React.FC = () => {
  const supportEmail = 'soporte@grocode.com'; // Puedes usar el email que defina tu líder
  const supportPhone = '+51 987 654 321'; // Ejemplo de número

  return (
    <div className="support-area p-8 bg-white shadow-lg rounded-lg max-w-lg mx-auto my-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Centro de Soporte 📞</h2>
      <p className="mb-4 text-gray-600">
        Si tienes alguna pregunta, problema técnico o necesitas ayuda con tu pedido, no dudes en contactarnos.
      </p>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2 text-gray-700">Contáctanos por Correo</h3>
        <p className="text-blue-600 font-medium break-words">
          <a href={`mailto:${supportEmail}`} className="hover:underline">
            {supportEmail}
          </a>
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2 text-gray-700">Teléfono</h3>
        <p className="text-gray-600">{supportPhone}</p>
      </div>

      <p className="mt-6 text-sm text-gray-500">
        Nuestro equipo de soporte está disponible de Lunes a Viernes, de 9:00 AM a 6:00 PM.
      </p>
    </div>
  );
};

export default SupportArea;