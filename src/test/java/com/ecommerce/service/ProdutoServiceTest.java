package com.ecommerce.service;

import com.ecommerce.dto.request.ProdutoRequest;
import com.ecommerce.dto.response.ProdutoResponse;
import com.ecommerce.entity.*;
import com.ecommerce.exception.*;
import com.ecommerce.repository.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProdutoServiceTest {

    @Mock private ProdutoRepository produtoRepository;
    @Mock private CategoriaRepository categoriaRepository;
    @Mock private FornecedorRepository fornecedorRepository;

    @InjectMocks private ProdutoService produtoService;

    private Categoria categoria;
    private Produto produto;

    @BeforeEach
    void setUp() {
        categoria = Categoria.builder().id(1L).nome("Eletrônicos").ativa(true).build();
        produto = Produto.builder()
            .id(1L).nome("Notebook").preco(new BigDecimal("2999.90"))
            .estoque(10).estoqueMinimo(5).categoria(categoria).ativo(true)
            .build();
    }

    @Test
    @DisplayName("Deve buscar produto por ID com sucesso")
    void deveBuscarProdutoPorId() {
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));

        ProdutoResponse response = produtoService.buscarPorId(1L);

        assertThat(response).isNotNull();
        assertThat(response.getNome()).isEqualTo("Notebook");
        assertThat(response.getPreco()).isEqualByComparingTo("2999.90");
    }

    @Test
    @DisplayName("Deve lançar exceção ao buscar produto inexistente")
    void deveLancarExcecaoAoBuscarProdutoInexistente() {
        when(produtoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> produtoService.buscarPorId(99L))
            .isInstanceOf(RecursoNaoEncontradoException.class)
            .hasMessageContaining("99");
    }

    @Test
    @DisplayName("Deve criar produto com sucesso")
    void deveCriarProdutoComSucesso() {
        ProdutoRequest request = ProdutoRequest.builder()
            .nome("Smartphone").preco(new BigDecimal("1500.00"))
            .estoque(50).categoriaId(1L).build();

        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(produtoRepository.save(any())).thenReturn(
            Produto.builder().id(2L).nome("Smartphone")
                .preco(new BigDecimal("1500.00")).estoque(50)
                .categoria(categoria).ativo(true).build());

        ProdutoResponse response = produtoService.criar(request);

        assertThat(response.getNome()).isEqualTo("Smartphone");
        verify(produtoRepository, times(1)).save(any(Produto.class));
    }

    @Test
    @DisplayName("Deve lançar exceção ao criar produto com SKU duplicado")
    void deveLancarExcecaoSkuDuplicado() {
        ProdutoRequest request = ProdutoRequest.builder()
            .nome("Produto").preco(BigDecimal.TEN).estoque(10)
            .categoriaId(1L).sku("SKU-001").build();

        when(produtoRepository.findBySku("SKU-001")).thenReturn(Optional.of(produto));

        assertThatThrownBy(() -> produtoService.criar(request))
            .isInstanceOf(RegraDeNegocioException.class)
            .hasMessageContaining("SKU-001");
    }

    @Test
    @DisplayName("Deve ajustar estoque positivamente")
    void deveAjustarEstoquePositivo() {
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));
        when(produtoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ProdutoResponse response = produtoService.ajustarEstoque(1L, 5);

        assertThat(response.getEstoque()).isEqualTo(15);
    }

    @Test
    @DisplayName("Deve lançar EstoqueInsuficienteException ao decrementar além do disponível")
    void deveLancarExcecaoEstoqueInsuficiente() {
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));

        assertThatThrownBy(() -> produtoService.ajustarEstoque(1L, -20))
            .isInstanceOf(EstoqueInsuficienteException.class);
    }

    @Test
    @DisplayName("Deve inativar produto")
    void deveInativarProduto() {
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));
        when(produtoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        produtoService.inativar(1L);

        assertThat(produto.getAtivo()).isFalse();
        verify(produtoRepository).save(produto);
    }
}
