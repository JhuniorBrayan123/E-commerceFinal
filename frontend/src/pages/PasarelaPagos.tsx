import React, { useState } from "react";

interface CheckoutProps {
  total: number;
  carrito: any[];
  onPaymentSuccess: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ total, carrito, onPaymentSuccess }) => {
  const [nombreTarjeta, setNombreTarjeta] = useState("");
  const [numeroTarjeta, setNumeroTarjeta] = useState("");
  const [expiracion, setExpiracion] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState("");

  const validarNumeroTarjeta = (num: string) => {
    return /^\d{16}$/.test(num.replace(/\s/g, ""));
  };

  const validarExpiracion = (exp: string) => {
    return /^(0[1-9]|1[0-2])\/\d{2}$/.test(exp);
  };

  const validarCvv = (cvv: string) => {
    return /^\d{3,4}$/.test(cvv);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombreTarjeta.trim()) {
      setError("Ingresa el nombre que aparece en la tarjeta");
      return;
    }
    if (!validarNumeroTarjeta(numeroTarjeta)) {
      setError("Número de tarjeta inválido (debe tener 16 dígitos)");
      return;
    }
    if (!validarExpiracion(expiracion)) {
      setError("Fecha de expiración inválida (formato MM/AA)");
      return;
    }
    if (!validarCvv(cvv)) {
      setError("CVV inválido (3 o 4 dígitos)");
      return;
    }

    setError("");
    // Aquí iría la llamada al backend para procesar el pago

    alert("Pago procesado con éxito. ¡Gracias por tu compra!");
    onPaymentSuccess();
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-center text-primary-600">Pago Seguro</h2>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Resumen del pedido</h3>
        <ul className="max-h-40 overflow-auto mb-4">
          {carrito.map((item) => (
            <li key={item.id} className="flex justify-between py-1 border-b border-gray-200">
              <span>{item.nombre} x {item.cantidad}</span>
              <span>${(item.precio * item.cantidad).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="text-right font-bold text-xl text-primary-700">
          Total: ${total.toFixed(2)}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1" htmlFor="nombreTarjeta">Nombre en la tarjeta</label>
          <input
            id="nombreTarjeta"
            type="text"
            value={nombreTarjeta}
            onChange={(e) => setNombreTarjeta(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
            placeholder="Marco Jesus Chunga"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1" htmlFor="numeroTarjeta">Número de tarjeta</label>
          <input
            id="numeroTarjeta"
            type="text"
            value={numeroTarjeta}
            onChange={(e) => setNumeroTarjeta(e.target.value)}
            maxLength={19}
            placeholder="1234 5678 9012 3456"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
            required
          />
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block font-semibold mb-1" htmlFor="expiracion">Expiración (MM/AA)</label>
            <input
              id="expiracion"
              type="text"
              value={expiracion}
              onChange={(e) => setExpiracion(e.target.value)}
              placeholder="09/26"
              maxLength={5}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
              required
            />
          </div>

          <div className="flex-1">
            <label className="block font-semibold mb-1" htmlFor="cvv">CVV</label>
            <input
              id="cvv"
              type="password"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              placeholder="123"
              maxLength={4}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
        >
          Pagar ${total.toFixed(2)}
        </button>
      </form>
    </div>
  );
};

export default Checkout;
