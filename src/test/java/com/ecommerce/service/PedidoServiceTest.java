package com.ecommerce.service;

import com.ecommerce.dto.request.PedidoRequest;
import com.ecommerce.dto.response.PedidoResponse;
import com.ecommerce.entity.*;
import com.ecommerce.exception.*;
import com.ecommerce.repository.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PedidoServiceTest {

    @Mock private PedidoRepository pedidoRepository;
    @Mock private ProdutoRepository produtoRepository;
    @Mock private CupomRepository cupomRepository;
    @Mock private EnderecoRepository enderecoRepository;
    @Mock private UsuarioService usuarioService;

    @InjectMocks private PedidoService pedidoService;

    private Usuario usuario;
    private Produto produto;

    @BeforeEach
    void setUp() {
        usuario = Usuario.builder().id(1L).nome("João").email("joao@test.com").ativo(true).build();
        produto = Produto.builder()
            .id(1L).nome("Notebook").preco(new BigDecimal("1500.00"))
            .estoque(10).ativo(true)
            .categoria(Categoria.builder().id(1L).nome("Eletrônicos").build())
            .build();
    }

    @Test
    @DisplayName("Deve criar pedido com sucesso")
    void deveCriarPedidoComSucesso() {
        PedidoRequest request = PedidoRequest.builder()
            .itens(List.of(new PedidoRequest.ItemPedidoRequest(1L, 2)))
            .build();

        when(usuarioService.usuarioAtual()).thenReturn(usuario);
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));
        when(produtoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(pedidoRepository.save(any())).thenAnswer(inv -> {
            Pedido p = inv.getArgument(0);
            p = Pedido.builder().id(10L).usuario(usuario)
                .itens(p.getItens()).subtotal(p.getSubtotal())
                .desconto(p.getDesconto()).total(p.getTotal())
                .status(StatusPedido.PENDENTE).historico(new ArrayList<>()).build();
            return p;
        });

        PedidoResponse response = pedidoService.criar(request);

        assertThat(response).isNotNull();
        assertThat(response.getTotal()).isEqualByComparingTo("3000.00");
        verify(produtoRepository).save(any()); // estoque decrementado
    }

    @Test
    @DisplayName("Deve lançar EstoqueInsuficienteException quando produto sem estoque")
    void deveLancarExcecaoEstoqueInsuficiente() {
        produto.setEstoque(1);
        PedidoRequest request = PedidoRequest.builder()
            .itens(List.of(new PedidoRequest.ItemPedidoRequest(1L, 5)))
            .build();

        when(usuarioService.usuarioAtual()).thenReturn(usuario);
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));

        assertThatThrownBy(() -> pedidoService.criar(request))
            .isInstanceOf(EstoqueInsuficienteException.class);
    }

    @Test
    @DisplayName("Deve lançar exceção ao criar pedido com mais itens que o limite")
    void deveLancarExcecaoMaxItens() {
        List<PedidoRequest.ItemPedidoRequest> itens = new ArrayList<>();
        for (int i = 0; i < 51; i++) itens.add(new PedidoRequest.ItemPedidoRequest((long) i, 1));
        PedidoRequest request = PedidoRequest.builder().itens(itens).build();

        when(usuarioService.usuarioAtual()).thenReturn(usuario);

        assertThatThrownBy(() -> pedidoService.criar(request))
            .isInstanceOf(RegraDeNegocioException.class)
            .hasMessageContaining("50");
    }

    @Test
    @DisplayName("Deve bloquear transição de status inválida")
    void deveBloquearTransicaoDeStatusInvalida() {
        Pedido pedido = Pedido.builder().id(1L).usuario(usuario)
            .status(StatusPedido.ENTREGUE).itens(new ArrayList<>()).historico(new ArrayList<>()).build();

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(usuarioService.usuarioAtual()).thenReturn(usuario);

        assertThatThrownBy(() -> pedidoService.atualizarStatus(1L, StatusPedido.PAGO, null))
            .isInstanceOf(RegraDeNegocioException.class)
            .hasMessageContaining("ENTREGUE");
    }

    @Test
    @DisplayName("Deve devolver estoque ao cancelar pedido")
    void deveDevolverEstoqueAoCancelar() {
        Categoria cat = Categoria.builder().id(1L).nome("Cat").build();
        Produto prod = Produto.builder().id(1L).nome("P").preco(BigDecimal.TEN).estoque(5).ativo(true).categoria(cat).build();
        ItemPedido item = ItemPedido.builder().produto(prod).quantidade(3)
            .precoUnitario(BigDecimal.TEN).subtotal(BigDecimal.valueOf(30)).build();

        Pedido pedido = Pedido.builder().id(1L).usuario(usuario)
            .status(StatusPedido.PENDENTE).itens(List.of(item)).historico(new ArrayList<>()).build();

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(usuarioService.usuarioAtual()).thenReturn(usuario);
        when(pedidoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(produtoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        pedidoService.cancelar(1L);

        assertThat(prod.getEstoque()).isEqualTo(8); // 5 + 3 devolvidos
    }
}
