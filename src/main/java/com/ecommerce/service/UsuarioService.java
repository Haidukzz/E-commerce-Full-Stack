package com.ecommerce.service;

import com.ecommerce.dto.response.UsuarioResponse;
import com.ecommerce.entity.Usuario;
import com.ecommerce.exception.*;
import com.ecommerce.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public Page<UsuarioResponse> listar(Pageable pageable) {
        return usuarioRepository.findByAtivoTrue(pageable).map(UsuarioResponse::from);
    }

    @Transactional(readOnly = true)
    public UsuarioResponse buscarPorId(Long id) {
        return UsuarioResponse.from(encontrarPorId(id));
    }

    @Transactional(readOnly = true)
    public UsuarioResponse meuPerfil() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return UsuarioResponse.from(
            usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário autenticado não encontrado"))
        );
    }

    @Transactional
    public void inativar(Long id) {
        Usuario u = encontrarPorId(id);
        u.setAtivo(false);
        usuarioRepository.save(u);
    }

    public Usuario encontrarPorId(Long id) {
        return usuarioRepository.findById(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário", id));
    }

    public Usuario usuarioAtual() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário autenticado não encontrado"));
    }
}
