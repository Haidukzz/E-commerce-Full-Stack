package com.ecommerce.controller;

import com.ecommerce.entity.Pagamento;
import com.ecommerce.service.PagamentoService;
import com.ecommerce.service.PagamentoService.PagamentoRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pagamentos")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Auth")
@Tag(name = "Pagamentos", description = "Processamento de pagamentos")
public class PagamentoController {

    private final PagamentoService pagamentoService;

    @PostMapping("/pedido/{pedidoId}")
    @Operation(summary = "Processar pagamento de um pedido")
    public ResponseEntity<Pagamento> processar(@PathVariable Long pedidoId,
                                               @RequestBody PagamentoRequest request) {
        return ResponseEntity.ok(pagamentoService.processarPagamento(pedidoId, request));
    }

    @GetMapping("/pedido/{pedidoId}")
    @Operation(summary = "Consultar pagamento de um pedido")
    public ResponseEntity<Pagamento> buscarPorPedido(@PathVariable Long pedidoId) {
        return ResponseEntity.ok(pagamentoService.buscarPorPedido(pedidoId));
    }
}
