package com.ecommerce.entity;

import org.junit.jupiter.api.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class CupomTest {

    private Cupom cupomPercentual;
    private Cupom cupomValorFixo;

    @BeforeEach
    void setUp() {
        cupomPercentual = Cupom.builder()
            .codigo("PROMO10").tipo(Cupom.TipoCupom.PERCENTUAL).valor(BigDecimal.TEN)
            .valorMinimoPedido(new BigDecimal("100.00"))
            .dataInicio(LocalDateTime.now().minusDays(1))
            .dataFim(LocalDateTime.now().plusDays(10))
            .usosMaximos(100).usosAtuais(0).ativo(true).build();

        cupomValorFixo = Cupom.builder()
            .codigo("DESC50").tipo(Cupom.TipoCupom.VALOR_FIXO).valor(new BigDecimal("50.00"))
            .dataInicio(LocalDateTime.now().minusDays(1))
            .dataFim(LocalDateTime.now().plusDays(10))
            .ativo(true).build();
    }

    @Test @DisplayName("Cupom percentual deve calcular desconto corretamente")
    void deveCalcularDescontoPercentual() {
        BigDecimal total = new BigDecimal("200.00");
        BigDecimal desconto = cupomPercentual.calcularDesconto(total);
        assertThat(desconto).isEqualByComparingTo("20.00");
    }

    @Test @DisplayName("Cupom de valor fixo deve descontar valor exato")
    void deveCalcularDescontoValorFixo() {
        BigDecimal desconto = cupomValorFixo.calcularDesconto(new BigDecimal("300.00"));
        assertThat(desconto).isEqualByComparingTo("50.00");
    }

    @Test @DisplayName("Cupom não deve ser válido abaixo do valor mínimo")
    void naoDeveSerValidoAbaixoDoMinimo() {
        assertThat(cupomPercentual.isValido(new BigDecimal("50.00"))).isFalse();
    }

    @Test @DisplayName("Cupom expirado não deve ser válido")
    void cupomExpiradoNaoDeveSerValido() {
        cupomPercentual.setDataFim(LocalDateTime.now().minusDays(1));
        assertThat(cupomPercentual.isValido(new BigDecimal("200.00"))).isFalse();
    }

    @Test @DisplayName("Cupom com usos esgotados não deve ser válido")
    void cupomComUsosEsgotadosNaoDeveSerValido() {
        cupomPercentual.setUsosAtuais(100);
        assertThat(cupomPercentual.isValido(new BigDecimal("200.00"))).isFalse();
    }

    @Test @DisplayName("Desconto de valor fixo não deve ultrapassar o total")
    void descontoNaoDeveUltrapassarTotal() {
        BigDecimal desconto = cupomValorFixo.calcularDesconto(new BigDecimal("30.00"));
        assertThat(desconto).isEqualByComparingTo("30.00");
    }
}
