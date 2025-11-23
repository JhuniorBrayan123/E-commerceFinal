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
    public void onPaymentCompleted(PaymentCompletedEvent event) {  // ← Sin fully qualified name
        log.info("🔄 Event recibido AFTER_COMMIT: orderId={}, paymentId={}, items={}",
                event.getOrderId(), event.getPaymentId(), event.getItems());

        try {
            String response = catalogService.deductStock(event.getItems(), event.getJwtToken())
                    .doOnSuccess(resp -> log.info("✅ Stock descontado correctamente (payment {}): {}",
                    event.getPaymentId(), resp))
                    .doOnError(err -> log.error("❌ Error descontando stock (payment {}): {}",
                    event.getPaymentId(), err.getMessage()))
                    .block();

            log.info("🎉 Proceso de stock completado para payment {}", event.getPaymentId());

        } catch (Exception ex) {
            log.error("💥 Error crítico al descontar stock para payment {}: {}",
                    event.getPaymentId(), ex.getMessage(), ex);
        }
    }
}
