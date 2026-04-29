package com.ecommerce.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.*;

import static org.assertj.core.api.Assertions.assertThat;

class StatusPedidoTest {

    @ParameterizedTest
    @CsvSource({
        "PENDENTE, AGUARDANDO_PAGAMENTO, true",
        "PENDENTE, CANCELADO, true",
        "PENDENTE, PAGO, false",
        "AGUARDANDO_PAGAMENTO, PAGO, true",
        "AGUARDANDO_PAGAMENTO, CANCELADO, true",
        "PAGO, EM_SEPARACAO, true",
        "PAGO, CANCELADO, true",
        "EM_SEPARACAO, ENVIADO, true",
        "ENVIADO, ENTREGUE, true",
        "ENTREGUE, DEVOLVIDO, true",
        "ENTREGUE, CANCELADO, false",
        "CANCELADO, PAGO, false"
    })
    @DisplayName("Deve validar transições de status corretamente")
    void deveValidarTransicoes(StatusPedido origem, StatusPedido destino, boolean esperado) {
        assertThat(origem.podeTransicionarPara(destino)).isEqualTo(esperado);
    }
}
