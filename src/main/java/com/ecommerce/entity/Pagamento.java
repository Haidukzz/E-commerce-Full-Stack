package com.ecommerce.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagamento")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Pagamento {

    public enum StatusPagamento {
        PENDENTE, APROVADO, RECUSADO, ESTORNADO
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id", nullable = false, unique = true)
    @JsonIgnore
    private Pedido pedido;

    // Incluir o ID do pedido na resposta sem serializar o objeto completo
    @Transient
    public Long getPedidoId() {
        return pedido != null ? pedido.getId() : null;
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private StatusPagamento status = StatusPagamento.PENDENTE;

    @Column(name = "meio_pagamento", length = 50)
    private String meioPagamento;

    @Column(name = "transacao_id", length = 200)
    private String transacaoId;

    @Column(name = "valor_pago", precision = 10, scale = 2)
    private BigDecimal valorPago;

    @Column(name = "data_pagamento")
    private LocalDateTime dataPagamento;

    @Column(name = "gateway_resposta", columnDefinition = "TEXT")
    private String gatewayResposta;
}
