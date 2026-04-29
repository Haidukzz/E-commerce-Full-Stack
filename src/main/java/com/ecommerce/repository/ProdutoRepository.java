package com.ecommerce.repository;

import com.ecommerce.entity.Produto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    @Query("SELECT p FROM Produto p JOIN FETCH p.categoria c WHERE p.ativo = true AND " +
           "(:nome IS NULL OR LOWER(p.nome) LIKE LOWER(CONCAT('%', CAST(:nome AS string), '%'))) AND " +
           "(:categoriaId IS NULL OR c.id = :categoriaId) AND " +
           "(:precoMin IS NULL OR p.preco >= :precoMin) AND " +
           "(:precoMax IS NULL OR p.preco <= :precoMax)")
    Page<Produto> buscar(@Param("nome") String nome,
                         @Param("categoriaId") Long categoriaId,
                         @Param("precoMin") BigDecimal precoMin,
                         @Param("precoMax") BigDecimal precoMax,
                         Pageable pageable);

    @Query("SELECT p FROM Produto p JOIN FETCH p.categoria WHERE p.ativo = true AND p.estoque <= p.estoqueMinimo")
    List<Produto> findProdutosComEstoqueBaixo();

    boolean existsBySku(String sku);

    @Query("SELECT p FROM Produto p JOIN FETCH p.categoria WHERE p.sku = :sku")
    Optional<Produto> findBySku(@Param("sku") String sku);

    @Query("SELECT p FROM Produto p JOIN FETCH p.categoria WHERE p.id = :id AND p.ativo = true")
    Optional<Produto> findByIdAndAtivoWithCategoria(@Param("id") Long id);
}
