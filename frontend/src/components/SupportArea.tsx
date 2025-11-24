// D:\E-commerceFinal\frontend\src\components\SupportArea.tsx

import React from 'react';

const SupportArea: React.FC = () => {
  // Contacto por Correo y Teléfono existentes
  const supportEmail = 'guiller.rojas@tecsup.edu.pe';
  const supportPhone = '+51 953 263 080'; 

  // Contacto por WhatsApp
  // Se necesita el prefijo del país sin '+' (51 para Perú)
  const whatsappNumber = '51953263080'; 
  // Mensaje que aparecerá automáticamente en el chat.
  const whatsappMessage = encodeURIComponent('Hola, necesito ayuda con un pedido de la tienda.');
  
  // URL final de WhatsApp
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="support-area p-8 bg-white shadow-lg rounded-lg max-w-lg mx-auto my-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Centro de Soporte 📞</h2>
      <p className="mb-4 text-gray-600">
        Si tienes alguna pregunta, problema técnico o necesitas ayuda con tu pedido, no dudes en contactarnos.
      </p>

      {/* SECCIÓN DE CORREO */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2 text-gray-700">Contáctanos por Correo</h3>
        <p className="text-blue-600 font-medium break-words">
          <a href={`mailto:${supportEmail}`} className="hover:underline">
            {supportEmail}
          </a>
        </p>
      </div>
      
      {/* NUEVA SECCIÓN DE WHATSAPP (CON ÍCONO) */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2 text-gray-700 flex items-center">
          {/* Ícono de WhatsApp (SVG simple y escalable) */}
          <svg className="w-6 h-6 mr-2 text-green-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12.0003 2C6.48666 2 2 6.48666 2 12.0003C2 13.9786 2.57143 15.8458 3.55938 17.4338L2.08643 22.0003L6.87834 20.5235C8.36152 21.3653 10.1251 21.8007 12.0003 21.8007C17.514 21.8007 22 17.3143 22 12.0003C22 6.48666 17.514 2 12.0003 2ZM17.1565 15.6558C16.9234 16.2081 14.6163 17.3888 14.2828 17.5186C13.9493 17.6483 13.7162 17.705 13.4831 17.6483C13.2499 17.5916 12.5693 17.3695 11.7584 17.0782C10.7499 16.7111 9.94054 16.096 9.30907 15.4214C8.67761 14.7468 8.16911 13.7842 8.01633 13.111C7.86356 12.4378 8.01633 11.9565 8.12984 11.7243C8.24335 11.4921 8.5264 11.1449 8.76106 10.8536C9.00693 10.5511 9.17117 10.4944 9.33541 10.1557C9.49965 9.81708 9.38614 9.53986 9.30907 9.3885C9.232 9.23714 8.57751 7.6186 8.36152 7.15573C8.14552 6.69286 7.91087 6.81635 7.74664 6.81635C7.5824 6.81635 7.39956 6.81635 7.20529 6.81635C7.01103 6.81635 6.69429 6.88373 6.42533 7.17508C6.15637 7.46643 5.48753 8.07005 5.48753 9.3908C5.48753 10.7116 6.49503 11.9904 6.63939 12.2111C6.78376 12.4319 8.57751 15.1581 11.2335 16.3262C13.2505 17.2023 13.784 17.0396 14.0754 16.9829C14.3668 16.9262 16.1205 15.7171 16.4862 15.4963C16.8519 15.2756 17.0984 15.1823 17.3331 15.0219C17.5677 14.8615 18.0611 14.0601 18.0611 13.3155C18.0611 12.5709 17.7697 12.2796 17.6253 12.1863C17.481 12.093 17.1565 11.9893 16.8008 11.8399C16.4451 11.6906 16.3316 11.6339 16.1673 11.6055C16.0031 11.5771 15.8193 11.6055 15.6551 11.8262C15.4908 12.047 15.0314 12.4824 14.9436 12.6337C14.8558 12.7851 14.799 12.9818 14.6757 12.9818C14.5524 12.9818 13.9744 12.7758 13.3761 12.5201C12.8727 12.3021 12.0469 11.9961 11.3781 11.4552C10.8415 11.0287 10.4285 10.3742 10.1371 9.8005C9.84577 9.22684 9.92284 8.87968 10.0672 8.65893C10.2116 8.43818 10.3758 8.16934 10.5193 8.018C10.6627 7.86665 10.7762 7.81001 10.9405 7.64966C11.1047 7.48931 11.2381 7.46083 11.411 7.33105C11.5838 7.20128 11.6973 7.23071 11.7852 7.42738C11.873 7.62404 12.3325 8.87494 12.4558 9.15668C12.5791 9.43843 12.5791 9.57106 12.4558 9.77803C12.3325 9.98499 11.8596 10.7423 11.6349 10.9981C11.4103 11.2538 11.1643 11.5768 10.9814 11.7511L10.9814 11.7505Z"></path>
          </svg>
          WhatsApp Directo
        </h3>
        <p className="text-green-600 font-bold">
          <a 
            href={whatsappLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:underline"
          >
            +51 953 263 080
          </a>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Toca para iniciar un chat.
        </p>
      </div>

      {/* SECCIÓN DE TELÉFONO */}
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