package com.ecommerce.repository;

import com.ecommerce.entity.Pedido;
import com.ecommerce.entity.StatusPedido;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    @Query("SELECT p FROM Pedido p WHERE p.usuario.id = :usuarioId ORDER BY p.dataPedido DESC")
    Page<Pedido> findByUsuarioId(@Param("usuarioId") Long usuarioId, Pageable pageable);

    @Query("SELECT p FROM Pedido p WHERE " +
           "(:usuarioId IS NULL OR p.usuario.id = :usuarioId) AND " +
           "(:#{#status == null ? 'NULL' : #status.name()} = 'NULL' OR p.status = :status)")
    Page<Pedido> buscar(@Param("usuarioId") Long usuarioId,
                        @Param("status") StatusPedido status,
                        Pageable pageable);

    @Query("SELECT SUM(p.total) FROM Pedido p WHERE p.status = com.ecommerce.entity.StatusPedido.ENTREGUE")
    Optional<BigDecimal> somarVendasEntregues();

    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.status = :status")
    long contarPorStatus(@Param("status") StatusPedido status);
}
