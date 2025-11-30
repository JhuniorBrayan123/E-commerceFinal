// D:\E-commerceFinal\frontend\src\components\SupportArea.tsx

import React, { useState } from 'react';

const SupportArea: React.FC = () => {
<<<<<<< HEAD
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
=======
  const supportEmail = 'soporte@grocode.com';
  const supportPhone = '+51 989 604 884';
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: '¿Cuál es el tiempo de envío?',
      answer: 'El tiempo de envío varía entre 3-5 días hábiles dependiendo de tu ubicación. Para zonas rurales puede extenderse hasta 7 días.'
    },
    {
      question: '¿Puedo devolver un producto?',
      answer: 'Sí, aceptamos devoluciones dentro de los 30 días posteriores a la compra, siempre que el producto esté en su estado original y con su embalaje.'
    },
    {
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos tarjetas de crédito, débito, transferencias bancarias y pagos contra entrega en zonas seleccionadas.'
    },
    {
      question: '¿Cómo puedo rastrear mi pedido?',
      answer: 'Una vez procesado tu pedido, recibirás un correo con el número de rastreo. También puedes verificar el estado en tu cuenta en la sección "Mis Pedidos".'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };
>>>>>>> 68ad260fce0b60c78ddb09b2d6b4fe40aa1026eb

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">

<<<<<<< HEAD
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
=======
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-800 mb-4">
            Centro de Soporte
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Estamos aquí para ayudarte. Contáctanos por cualquiera de nuestros canales o consulta nuestras preguntas frecuentes.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">

          {/* Email Card */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-green-100">
            <div className="h-2 bg-gradient-to-r from-green-500 to-green-600"></div>
            <div className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Correo Electrónico</h3>
              <p className="text-gray-600 mb-4 text-sm">Escríbenos y te responderemos en menos de 24 horas</p>
              <a
                href={`mailto:${supportEmail}`}
                className="text-green-600 font-semibold hover:text-green-700 break-words block hover:underline"
              >
                {supportEmail}
              </a>
            </div>
          </div>

          {/* Phone Card */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-blue-100">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <div className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Teléfono</h3>
              <p className="text-gray-600 mb-4 text-sm">Llámanos para asistencia inmediata</p>
              <a
                href={`tel:${supportPhone}`}
                className="text-blue-600 font-semibold hover:text-blue-700 text-lg hover:underline"
              >
                {supportPhone}
              </a>
            </div>
          </div>

          {/* Schedule Card */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-purple-100">
            <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600"></div>
            <div className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Horario</h3>
              <p className="text-gray-600 mb-2 text-sm">Estamos disponibles para ti</p>
              <div className="space-y-1 text-purple-600 font-semibold">
                <p>Lunes - Viernes</p>
                <p className="text-2xl">9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
          <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
            Preguntas Frecuentes
          </h2>

          <div className="space-y-4 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-2xl overflow-hidden hover:border-green-300 transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left p-6 bg-gradient-to-r from-gray-50 to-white hover:from-green-50 hover:to-green-50 transition-all duration-300 flex justify-between items-center"
                >
                  <h3 className="text-lg font-bold text-gray-800 pr-4">
                    {faq.question}
                  </h3>
                  <svg
                    className={`w-6 h-6 text-green-600 transition-transform duration-300 flex-shrink-0 ${openFAQ === index ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${openFAQ === index ? 'max-h-48' : 'max-h-0'}`}
                >
                  <div className="p-6 pt-0 bg-white">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center bg-gradient-to-r from-green-600 to-green-700 rounded-3xl p-10 shadow-2xl text-white">
          <h3 className="text-3xl font-bold mb-4">¿Aún tienes dudas?</h3>
          <p className="text-lg mb-6 text-green-100">
            No dudes en contactarnos. Estamos aquí para hacer tu experiencia excepcional.
          </p>
          <a
            href={`mailto:${supportEmail}`}
            className="inline-block bg-white text-green-700 font-bold px-8 py-4 rounded-xl hover:bg-green-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Enviar un mensaje
          </a>
        </div>

>>>>>>> 68ad260fce0b60c78ddb09b2d6b4fe40aa1026eb
      </div>
    </div>
  );
};

export default SupportArea;