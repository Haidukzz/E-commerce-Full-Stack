package com.ecommerce.service;

import com.ecommerce.dto.request.ProdutoRequest;
import com.ecommerce.dto.response.ProdutoResponse;
import com.ecommerce.entity.*;
import com.ecommerce.exception.*;
import com.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final CategoriaRepository categoriaRepository;
    private final FornecedorRepository fornecedorRepository;

    @Transactional(readOnly = true)
    public Page<ProdutoResponse> buscar(String nome, Long categoriaId,
                                        BigDecimal precoMin, BigDecimal precoMax,
                                        Pageable pageable) {
        return produtoRepository.buscar(nome, categoriaId, precoMin, precoMax, pageable)
            .map(ProdutoResponse::from);
    }

    @Transactional(readOnly = true)
    public ProdutoResponse buscarPorId(Long id) {
        return ProdutoResponse.from(encontrarPorId(id));
    }

    @Transactional
    public ProdutoResponse criar(ProdutoRequest request) {
        validarSku(request.getSku(), null);

        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
            .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria", request.getCategoriaId()));

        Fornecedor fornecedor = null;
        if (request.getFornecedorId() != null) {
            fornecedor = fornecedorRepository.findById(request.getFornecedorId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Fornecedor", request.getFornecedorId()));
        }

        Produto produto = Produto.builder()
            .nome(request.getNome())
            .descricao(request.getDescricao())
            .sku(request.getSku())
            .preco(request.getPreco())
            .estoque(request.getEstoque())
            .estoqueMinimo(request.getEstoqueMinimo() != null ? request.getEstoqueMinimo() : 10)
            .categoria(categoria)
            .fornecedor(fornecedor)
            .build();

        Produto salvo = produtoRepository.save(produto);
        log.info("Produto criado: id={}, nome={}", salvo.getId(), salvo.getNome());
        return ProdutoResponse.from(salvo);
    }

    @Transactional
    public ProdutoResponse atualizar(Long id, ProdutoRequest request) {
        Produto produto = encontrarPorId(id);
        validarSku(request.getSku(), id);

        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
            .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria", request.getCategoriaId()));

        produto.setNome(request.getNome());
        produto.setDescricao(request.getDescricao());
        produto.setSku(request.getSku());
        produto.setPreco(request.getPreco());
        produto.setEstoque(request.getEstoque());
        if (request.getEstoqueMinimo() != null) produto.setEstoqueMinimo(request.getEstoqueMinimo());
        produto.setCategoria(categoria);

        if (request.getFornecedorId() != null) {
            Fornecedor fornecedor = fornecedorRepository.findById(request.getFornecedorId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Fornecedor", request.getFornecedorId()));
            produto.setFornecedor(fornecedor);
        }

        return ProdutoResponse.from(produtoRepository.save(produto));
    }

    @Transactional
    public void inativar(Long id) {
        Produto produto = encontrarPorId(id);
        produto.setAtivo(false);
        produtoRepository.save(produto);
        log.info("Produto inativado: id={}", id);
    }

    @Transactional
    public ProdutoResponse ajustarEstoque(Long id, int quantidade) {
        Produto produto = encontrarPorId(id);
        if (quantidade < 0 && !produto.temEstoque(Math.abs(quantidade))) {
            throw new EstoqueInsuficienteException(produto.getNome());
        }
        produto.incrementarEstoque(quantidade);
        Produto salvo = produtoRepository.save(produto);
        log.info("Estoque ajustado: produto={}, delta={}, novoEstoque={}", id, quantidade, salvo.getEstoque());
        return ProdutoResponse.from(salvo);
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponse> listarEstoqueBaixo() {
        return produtoRepository.findProdutosComEstoqueBaixo()
            .stream().map(ProdutoResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Produto encontrarPorId(Long id) {
        return produtoRepository.findByIdAndAtivoWithCategoria(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Produto", id));
    }

    private void validarSku(String sku, Long idAtual) {
        if (sku == null || sku.isBlank()) return;
        produtoRepository.findBySku(sku).ifPresent(p -> {
            if (!p.getId().equals(idAtual)) {
                throw new RegraDeNegocioException("SKU já utilizado: " + sku);
            }
        });
    }
}
