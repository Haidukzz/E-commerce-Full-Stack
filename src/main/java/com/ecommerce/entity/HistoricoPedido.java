package com.ecommerce.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "historico_pedido")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HistoricoPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @Column(name = "status_anterior", length = 30)
    private String statusAnterior;

    @Column(name = "status_novo", nullable = false, length = 30)
    private String statusNovo;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    @Column(name = "alterado_por", length = 150)
    private String alteradoPor;

    @Column(name = "data_alteracao", nullable = false)
    @Builder.Default
    private LocalDateTime dataAlteracao = LocalDateTime.now();
}
