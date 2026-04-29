package com.ecommerce.controller;

import com.ecommerce.dto.request.ProdutoRequest;
import com.ecommerce.dto.response.ProdutoResponse;
import com.ecommerce.service.ProdutoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/produtos")
@RequiredArgsConstructor
@Tag(name = "Produtos", description = "Catálogo de produtos")
public class ProdutoController {

    private final ProdutoService produtoService;

    @GetMapping
    @Operation(summary = "Buscar produtos com filtros e paginação")
    public ResponseEntity<Page<ProdutoResponse>> buscar(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) BigDecimal precoMin,
            @RequestParam(required = false) BigDecimal precoMax,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "nome") String sort) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sort));
        return ResponseEntity.ok(produtoService.buscar(nome, categoriaId, precoMin, precoMax, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar produto por ID")
    public ResponseEntity<ProdutoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(produtoService.buscarPorId(id));
    }

    @GetMapping("/estoque-baixo")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @SecurityRequirement(name = "Bearer Auth")
    @Operation(summary = "Listar produtos com estoque abaixo do mínimo")
    public ResponseEntity<List<ProdutoResponse>> estoqueBaixo() {
        return ResponseEntity.ok(produtoService.listarEstoqueBaixo());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @SecurityRequirement(name = "Bearer Auth")
    @Operation(summary = "Criar novo produto")
    public ResponseEntity<ProdutoResponse> criar(@Valid @RequestBody ProdutoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(produtoService.criar(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @SecurityRequirement(name = "Bearer Auth")
    @Operation(summary = "Atualizar produto")
    public ResponseEntity<ProdutoResponse> atualizar(@PathVariable Long id,
                                                      @Valid @RequestBody ProdutoRequest request) {
        return ResponseEntity.ok(produtoService.atualizar(id, request));
    }

    @PatchMapping("/{id}/estoque")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @SecurityRequirement(name = "Bearer Auth")
    @Operation(summary = "Ajustar estoque de produto (positivo=entrada, negativo=saída)")
    public ResponseEntity<ProdutoResponse> ajustarEstoque(@PathVariable Long id,
                                                           @RequestParam int quantidade) {
        return ResponseEntity.ok(produtoService.ajustarEstoque(id, quantidade));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Auth")
    @Operation(summary = "Inativar produto")
    public ResponseEntity<Void> inativar(@PathVariable Long id) {
        produtoService.inativar(id);
        return ResponseEntity.noContent().build();
    }
}
