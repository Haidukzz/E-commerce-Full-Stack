package com.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cupom")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Cupom {

    public enum TipoCupom {
        PERCENTUAL, VALOR_FIXO
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String codigo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoCupom tipo;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(name = "valor_minimo_pedido", precision = 10, scale = 2)
    private BigDecimal valorMinimoPedido;

    @Column(name = "data_inicio", nullable = false)
    private LocalDateTime dataInicio;

    @Column(name = "data_fim", nullable = false)
    private LocalDateTime dataFim;

    @Column(name = "usos_maximos")
    private Integer usosMaximos;

    @Column(name = "usos_atuais", nullable = false)
    @Builder.Default
    private Integer usosAtuais = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean ativo = true;

    public boolean isValido(BigDecimal totalPedido) {
        LocalDateTime now = LocalDateTime.now();
        boolean dentroValidade = now.isAfter(dataInicio) && now.isBefore(dataFim);
        boolean usosDisponiveis = usosMaximos == null || usosAtuais < usosMaximos;
        boolean valorMinimo = valorMinimoPedido == null || totalPedido.compareTo(valorMinimoPedido) >= 0;
        return ativo && dentroValidade && usosDisponiveis && valorMinimo;
    }

    public BigDecimal calcularDesconto(BigDecimal total) {
        if (tipo == TipoCupom.PERCENTUAL) {
            return total.multiply(valor).divide(BigDecimal.valueOf(100));
        }
        return valor.min(total);
    }

    public void registrarUso() {
        this.usosAtuais++;
    }
}
