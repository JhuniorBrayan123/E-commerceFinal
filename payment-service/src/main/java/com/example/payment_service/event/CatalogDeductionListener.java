package com.example.payment_service.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.example.payment_service.service.CatalogService;



@Component
public class CatalogDeductionListener {

    private static final Logger log = LoggerFactory.getLogger(CatalogDeductionListener.class);
    private final CatalogService catalogService;

    public CatalogDeductionListener(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onPaymentCompleted(PaymentCompletedEvent event) {
        log.info("🔄 Event recibido AFTER_COMMIT: orderId={}, paymentId={}, items={}",
                event.getOrderId(), event.getPaymentId(), event.getItems());

        // NOTA: El stock ya fue descontado ANTES de procesar el pago en OrderService.confirmPayment
        // Este listener se mantiene por compatibilidad pero NO descuenta stock de nuevo
        // para evitar doble descuento. Si necesitas descontar stock aquí, asegúrate de
        // que no se haya descontado previamente.
        log.info("ℹ️ Stock ya descontado en validación previa al pago. No se descontará de nuevo para evitar duplicación.");
        
        // Si en el futuro necesitas procesar algo después del commit, puedes hacerlo aquí
        // Por ejemplo: notificaciones adicionales, sincronización con otros servicios, etc.
    }
}
