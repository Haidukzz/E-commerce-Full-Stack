package com.ecommerce.service;

import com.ecommerce.dto.request.CategoriaRequest;
import com.ecommerce.dto.response.CategoriaResponse;
import com.ecommerce.entity.Categoria;
import com.ecommerce.exception.*;
import com.ecommerce.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listarAtivas() {
        return categoriaRepository.findByAtivaTrue()
            .stream().map(CategoriaResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoriaResponse buscarPorId(Long id) {
        return CategoriaResponse.from(encontrarPorId(id));
    }

    @Transactional
    public CategoriaResponse criar(CategoriaRequest request) {
        if (categoriaRepository.existsByNome(request.getNome())) {
            throw new RegraDeNegocioException("Categoria já existe: " + request.getNome());
        }
        Categoria cat = Categoria.builder()
            .nome(request.getNome())
            .descricao(request.getDescricao())
            .build();
        return CategoriaResponse.from(categoriaRepository.save(cat));
    }

    @Transactional
    public CategoriaResponse atualizar(Long id, CategoriaRequest request) {
        Categoria cat = encontrarPorId(id);
        cat.setNome(request.getNome());
        cat.setDescricao(request.getDescricao());
        return CategoriaResponse.from(categoriaRepository.save(cat));
    }

    @Transactional
    public void inativar(Long id) {
        Categoria cat = encontrarPorId(id);
        cat.setAtiva(false);
        categoriaRepository.save(cat);
    }

    public Categoria encontrarPorId(Long id) {
        return categoriaRepository.findById(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria", id));
    }
}
