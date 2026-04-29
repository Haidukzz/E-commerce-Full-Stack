package com.ecommerce.controller;

import com.ecommerce.dto.request.AuthDTOs.*;
import com.ecommerce.security.JwtAuthFilter;
import com.ecommerce.security.JwtUtils;
import com.ecommerce.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.*;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockBean private AuthService authService;
    @MockBean private JwtUtils jwtUtils;
    @MockBean private JwtAuthFilter jwtAuthFilter;
    @MockBean private UserDetailsService userDetailsService;

    @Test
    @DisplayName("POST /api/auth/login deve retornar 200 com token válido")
    void deveRetornar200NoLogin() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("admin@ecommerce.com");
        request.setSenha("Admin@123");

        when(authService.login(any())).thenReturn(
            new TokenResponse("fake-jwt-token", "Bearer", "admin@ecommerce.com", "Administrador")
        );

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").value("fake-jwt-token"))
            .andExpect(jsonPath("$.tipo").value("Bearer"))
            .andExpect(jsonPath("$.email").value("admin@ecommerce.com"));
    }

    @Test
    @DisplayName("POST /api/auth/login deve retornar 400 com email inválido")
    void deveRetornar400ComEmailInvalido() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("nao-e-um-email");
        request.setSenha("senha123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }
}
