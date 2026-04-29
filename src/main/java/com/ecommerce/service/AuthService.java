package com.ecommerce.service;

import com.ecommerce.dto.request.AuthDTOs.*;
import com.ecommerce.entity.*;
import com.ecommerce.exception.RegraDeNegocioException;
import com.ecommerce.repository.*;
import com.ecommerce.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final PerfilRepository perfilRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public TokenResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getSenha())
        );
        String token = jwtUtils.gerarToken(auth);
        Usuario usuario = (Usuario) auth.getPrincipal();
        log.info("Login efetuado: {}", usuario.getEmail());
        return new TokenResponse(token, "Bearer", usuario.getEmail(), usuario.getNome());
    }

    @Transactional
    public TokenResponse registrar(RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RegraDeNegocioException("Email já cadastrado: " + request.getEmail());
        }

        Perfil perfilUser = perfilRepository.findByNome("ROLE_USER")
            .orElseThrow(() -> new RegraDeNegocioException("Perfil padrão não encontrado"));

        Usuario usuario = Usuario.builder()
            .nome(request.getNome())
            .email(request.getEmail())
            .senha(passwordEncoder.encode(request.getSenha()))
            .build();
        usuario.getPerfis().add(perfilUser);
        usuarioRepository.save(usuario);

        log.info("Novo usuário registrado: {}", usuario.getEmail());
        String token = jwtUtils.gerarTokenParaUsuario(usuario.getEmail());
        return new TokenResponse(token, "Bearer", usuario.getEmail(), usuario.getNome());
    }
}
