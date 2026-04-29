package com.ecommerce.controller;

import com.ecommerce.dto.response.ProdutoResponse;
import com.ecommerce.service.RelatorioService;
import com.ecommerce.service.RelatorioService.DashboardResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/relatorios")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
@SecurityRequirement(name = "Bearer Auth")
@Tag(name = "Relatórios", description = "Dashboard e relatórios gerenciais")
public class RelatorioController {

    private final RelatorioService relatorioService;

    @GetMapping("/dashboard")
    @Operation(summary = "Dashboard com KPIs principais")
    public ResponseEntity<DashboardResponse> dashboard() {
        return ResponseEntity.ok(relatorioService.dashboard());
    }

    @GetMapping("/estoque-baixo")
    @Operation(summary = "Produtos com estoque abaixo do mínimo")
    public ResponseEntity<List<ProdutoResponse>> estoqueBaixo() {
        return ResponseEntity.ok(relatorioService.produtosEstoqueBaixo());
    }
}
