package com.example.payment_service.repository;

import com.example.payment_service.model.Payment;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrderId(Long orderId);

    Optional<Payment> findByOrderIdAndPaymentMethod(Long orderId, Payment.PaymentMethod paymentMethod);

    Optional<Payment> findByGatewayTransactionId(String gatewayTransactionId);
}
