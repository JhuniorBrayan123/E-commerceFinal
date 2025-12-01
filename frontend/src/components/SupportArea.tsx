// D:\E-commerceFinal\frontend\src\components\SupportArea.tsx

import React, { useState } from "react";

const SupportArea: React.FC = () => {
  const supportEmail = "agrocode@gmail.com";
  const supportPhone = "+51 989 604 884";
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: "¿Cuál es el tiempo de envío?",
      answer:
        "El tiempo de envío varía entre 3-5 días hábiles dependiendo de tu ubicación. Para zonas rurales puede extenderse hasta 7 días.",
    },
    {
      question: "¿Puedo devolver un producto?",
      answer:
        "Sí, aceptamos devoluciones dentro de los 30 días posteriores a la compra, siempre que el producto esté en su estado original y con su embalaje.",
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer:
        "Aceptamos tarjetas de crédito, débito, transferencias bancarias y pagos contra entrega en zonas seleccionadas.",
    },
    {
      question: "¿Cómo puedo rastrear mi pedido?",
      answer:
        'Una vez procesado tu pedido, recibirás un correo con el número de rastreo. También puedes verificar el estado en tu cuenta en la sección "Mis Pedidos".',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-800 mb-4">
            Centro de Soporte
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Estamos aquí para ayudarte. Contáctanos por cualquiera de nuestros
            canales o consulta nuestras preguntas frecuentes.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Email Card */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-green-100">
            <div className="h-2 bg-gradient-to-r from-green-500 to-green-600"></div>
            <div className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Correo Electrónico
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Escríbenos y te responderemos en menos de 24 horas
              </p>
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
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Teléfono
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Llámanos para asistencia inmediata
              </p>
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
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Horario</h3>
              <p className="text-gray-600 mb-2 text-sm">
                Estamos disponibles para ti
              </p>
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
                    className={`w-6 h-6 text-green-600 transition-transform duration-300 flex-shrink-0 ${
                      openFAQ === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFAQ === index ? "max-h-48" : "max-h-0"
                  }`}
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
            No dudes en contactarnos. Estamos aquí para hacer tu experiencia
            excepcional.
          </p>
          <a
            href={`mailto:${supportEmail}`}
            className="inline-block bg-white text-green-700 font-bold px-8 py-4 rounded-xl hover:bg-green-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Enviar un mensaje
          </a>
        </div>
      </div>
    </div>
  );
};

export default SupportArea;
