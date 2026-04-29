package com.ecommerce.entity;

public enum StatusPedido {
    PENDENTE,
    AGUARDANDO_PAGAMENTO,
    PAGO,
    EM_SEPARACAO,
    ENVIADO,
    ENTREGUE,
    CANCELADO,
    DEVOLVIDO;

    public boolean podeTransicionarPara(StatusPedido novo) {
        return switch (this) {
            case PENDENTE -> novo == AGUARDANDO_PAGAMENTO || novo == CANCELADO;
            case AGUARDANDO_PAGAMENTO -> novo == PAGO || novo == CANCELADO;
            case PAGO -> novo == EM_SEPARACAO || novo == CANCELADO;
            case EM_SEPARACAO -> novo == ENVIADO || novo == CANCELADO;
            case ENVIADO -> novo == ENTREGUE;
            case ENTREGUE -> novo == DEVOLVIDO;
            default -> false;
        };
    }
}
