package com.ecommerce.repository;

import com.ecommerce.entity.Endereco;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EnderecoRepository extends JpaRepository<Endereco, Long> {

    @Query("SELECT e FROM Endereco e WHERE e.usuario.id = :usuarioId")
    List<Endereco> findByUsuarioId(@Param("usuarioId") Long usuarioId);

    @Query("SELECT e FROM Endereco e WHERE e.usuario.id = :usuarioId AND e.principal = true")
    Optional<Endereco> findByUsuarioIdAndPrincipalTrue(@Param("usuarioId") Long usuarioId);
}
