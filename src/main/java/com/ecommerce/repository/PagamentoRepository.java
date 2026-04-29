package com.ecommerce.repository;

import com.ecommerce.entity.Pagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PagamentoRepository extends JpaRepository<Pagamento, Long> {

    // JPQL explícito — necessário porque o campo 'pedido' tem @JsonIgnore
    @Query("SELECT p FROM Pagamento p WHERE p.pedido.id = :pedidoId")
    Optional<Pagamento> findByPedidoId(@Param("pedidoId") Long pedidoId);
}
